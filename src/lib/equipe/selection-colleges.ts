import { FORMULES, type Formule, type Perimetre } from '@/lib/auth/collaborateurs';

/**
 * Sélecteur de spécialités du dialogue « Équipe & Permissions » — logique
 * PURE (importable côté client, testée) : recherche, état d'un collège parent,
 * bascule d'un collège ou d'un sous-collège, formules par colonne.
 *
 * Règle héritée du périmètre (cf. `deployerPerimetre` / `replierPerimetre`) :
 * un collège parent coché rend ses sous-collèges implicites — ils ne figurent
 * pas dans la sélection, le serveur les déploie à l'enregistrement.
 */

export type CollegeChoix = { id: string; nom: string; enfants?: { id: string; nom: string }[] };

/** Minuscules sans accents : « Hépato » se trouve en tapant « hepato ». */
export function normaliserRecherche(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export type LigneArbre = {
  college: CollegeChoix;
  /** Sous-collèges affichés (tous, ou seulement ceux qui correspondent à la recherche). */
  enfants: { id: string; nom: string }[];
  /** Déplié d'office : la recherche a trouvé un sous-collège. */
  deplie: boolean;
};

/**
 * Arbre filtré par la recherche : un collège dont le nom correspond garde tous
 * ses sous-collèges ; sinon il n'apparaît que si l'un d'eux correspond, et
 * seuls ceux-là sont montrés, dépliés.
 */
export function filtrerArbre(arbre: CollegeChoix[], recherche: string): LigneArbre[] {
  const mots = normaliserRecherche(recherche).split(/\s+/).filter(Boolean);
  const correspond = (nom: string) => { const n = normaliserRecherche(nom); return mots.every((m) => n.includes(m)); };
  if (mots.length === 0) return arbre.map((c) => ({ college: c, enfants: c.enfants ?? [], deplie: false }));
  const out: LigneArbre[] = [];
  for (const c of arbre) {
    const enfants = c.enfants ?? [];
    if (correspond(c.nom)) { out.push({ college: c, enfants, deplie: false }); continue; }
    const trouves = enfants.filter((e) => correspond(e.nom));
    if (trouves.length > 0) out.push({ college: c, enfants: trouves, deplie: true });
  }
  return out;
}

/** État d'un collège parent dans la sélection : coché, partiel (quelques sous-collèges), ou vide. */
export function etatParent(c: CollegeChoix, selection: readonly string[]): 'coche' | 'partiel' | 'vide' {
  if (selection.includes(c.id)) return 'coche';
  return (c.enfants ?? []).some((e) => selection.includes(e.id)) ? 'partiel' : 'vide';
}

/** Nombre de sous-collèges couverts (tous si le parent est coché). */
export function sousCollegesCouverts(c: CollegeChoix, selection: readonly string[]): number {
  const enfants = c.enfants ?? [];
  return selection.includes(c.id) ? enfants.length : enfants.filter((e) => selection.includes(e.id)).length;
}

/**
 * Bascule d'un collège dans la sélection.
 *  - parent coché → décoché, avec ses sous-collèges ;
 *  - parent partiel ou vide → coché ; ses sous-collèges deviennent implicites ;
 *  - sous-collège d'un parent coché → le parent cède la place à tous ses
 *    autres sous-collèges (« toute la médecine générale sauf… ») ;
 *  - sous-collège ou collège simple → ajouté / retiré.
 */
export function basculerCollege(selection: readonly string[], id: string, arbre: CollegeChoix[]): string[] {
  const parent = arbre.find((c) => c.id === id);
  if (parent?.enfants?.length) {
    const enfants = new Set(parent.enfants.map((e) => e.id));
    if (selection.includes(id)) return selection.filter((x) => x !== id && !enfants.has(x));
    return [...selection.filter((x) => !enfants.has(x)), id];
  }
  const parentDuSousCollege = arbre.find((c) => c.enfants?.some((e) => e.id === id));
  if (parentDuSousCollege && selection.includes(parentDuSousCollege.id)) {
    const freres = (parentDuSousCollege.enfants ?? []).map((e) => e.id).filter((e) => e !== id);
    return [...selection.filter((x) => x !== parentDuSousCollege.id), ...freres.filter((e) => !selection.includes(e))];
  }
  return selection.includes(id) ? selection.filter((x) => x !== id) : [...selection, id];
}

/** Coche ou décoche d'un coup tous les collèges listés (résultat d'une recherche, par exemple). */
export function basculerTous(selection: readonly string[], ids: readonly string[], cocher: boolean, arbre: CollegeChoix[]): string[] {
  let out = [...selection];
  for (const id of ids) {
    const parent = arbre.find((c) => c.enfants?.some((e) => e.id === id));
    const coche = out.includes(id) || (!!parent && out.includes(parent.id));
    if (coche !== cocher) out = basculerCollege(out, id, arbre);
  }
  return out;
}

/** Formules d'une ligne : sa surcharge, sinon le défaut `'*'`, sinon toutes. */
export function formulesDeLigne(perimetre: Perimetre, cle: string): Formule[] {
  return perimetre.formules[cle] ?? perimetre.formules['*'] ?? [...FORMULES];
}

/**
 * Colonne d'une formule : si toutes les lignes l'ont, on la retire partout ;
 * sinon on l'ajoute partout.
 */
export function basculerColonneFormule(perimetre: Perimetre, cles: readonly string[], f: Formule): Perimetre {
  const toutes = cles.every((k) => formulesDeLigne(perimetre, k).includes(f));
  const formules = { ...perimetre.formules };
  for (const k of cles) {
    const actuelles = formulesDeLigne(perimetre, k);
    formules[k] = toutes ? actuelles.filter((x) => x !== f) : Array.from(new Set([...actuelles, f]));
  }
  return { ...perimetre, formules };
}
