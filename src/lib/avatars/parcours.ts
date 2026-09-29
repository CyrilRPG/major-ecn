import {
  CRITERES,
  OPTIONS,
  PORTRAITS,
  portraitAffiche,
  type Critere,
  type OptionCritere,
  type Portrait,
} from './portraits';

/**
 * Parcours de choix d'un avatar, trait par trait.
 *
 * Le parcours ne FABRIQUE rien : chaque étape filtre les trois cent vingt
 * portraits du catalogue, et l'on n'y propose que des options qui mènent à au
 * moins un portrait réel. Un chemin est donc toujours cohérent — choisir
 * « Homme » fait disparaître le chignon s'il n'existe aucun homme en chignon
 * compatible avec les choix précédents, et l'étape « Barbe » n'a rien à
 * proposer à une femme.
 *
 * Chaque étape accepte aussi « Indifférent » : le critère est laissé ouvert,
 * et la dernière étape présente alors plus de portraits.
 *
 * Module pur, sans directive 'use client' ; testé dans
 * `tests/avatars-parcours.test.ts`.
 */

export type Choix = Partial<Record<Critere, string>>;

export type Etape = { critere: Critere; titre: string; consigne: string };

export const ETAPES: Etape[] = [
  { critere: 'genre', titre: 'Profil', consigne: 'Pour commencer, un soignant ou une soignante.' },
  { critere: 'teint', titre: 'Teint', consigne: 'La couleur de peau.' },
  { critere: 'visage', titre: 'Visage', consigne: 'La forme du visage.' },
  { critere: 'cheveux', titre: 'Cheveux', consigne: 'La couleur des cheveux.' },
  { critere: 'coiffure', titre: 'Coiffure', consigne: 'Coiffure, calot de bloc ou foulard.' },
  { critere: 'barbe', titre: 'Barbe', consigne: 'Rasé de près, ou barbu.' },
  { critere: 'accessoires', titre: 'Accessoires', consigne: 'Lunettes, masque, loupes frontales.' },
  { critere: 'tenue', titre: 'Tenue', consigne: 'Blouse blanche ou tenue de bloc, et sa couleur.' },
  { critere: 'expression', titre: 'Expression', consigne: 'Le regard au loin, ou le sourire.' },
  { critere: 'fond', titre: 'Fond', consigne: 'La couleur du fond.' },
];

/** Index de la dernière étape : le choix du portrait parmi ceux qui restent. */
export const ETAPE_FINALE = ETAPES.length;

export function correspond(portrait: Portrait, choix: Choix): boolean {
  return CRITERES.every((c) => choix[c] === undefined || portrait.traits[c] === choix[c]);
}

export function candidats(choix: Choix, liste: Portrait[] = PORTRAITS): Portrait[] {
  return liste.filter((p) => correspond(p, choix));
}

/** Les choix des étapes STRICTEMENT antérieures à `etape`. */
export function choixAvant(choix: Choix, etape: number): Choix {
  const out: Choix = {};
  ETAPES.slice(0, etape).forEach(({ critere }) => {
    if (choix[critere] !== undefined) out[critere] = choix[critere];
  });
  return out;
}

/** Tous les traits d'un portrait : le parcours part de l'avatar actuel. */
export function choixDepuisAvatar(seed: string | null | undefined): Choix {
  return { ...portraitAffiche(seed).traits };
}

/**
 * Ressemblance entre deux portraits : nombre de traits communs, les premiers
 * critères du parcours pesant davantage (changer le fond compte moins que
 * changer de profil).
 */
export function ressemblance(a: Portrait, b: Portrait): number {
  let score = 0;
  CRITERES.forEach((c, i) => {
    if (a.traits[c] === b.traits[c]) score += CRITERES.length - i + 4;
  });
  return score;
}

/** Le portrait de la liste le plus proche de la référence (à égalité : le premier). */
export function plusProche(liste: Portrait[], reference: Portrait): Portrait | null {
  let meilleur: Portrait | null = null;
  let score = -1;
  for (const p of liste) {
    if (p.numero === reference.numero) return p;
    const s = ressemblance(p, reference);
    if (s > score) { meilleur = p; score = s; }
  }
  return meilleur;
}

/** Portraits triés du plus ressemblant au moins ressemblant. */
export function parRessemblance(liste: Portrait[], reference: Portrait): Portrait[] {
  return [...liste].sort((a, b) =>
    (b.numero === reference.numero ? 1 : 0) - (a.numero === reference.numero ? 1 : 0)
    || ressemblance(b, reference) - ressemblance(a, reference)
    || a.numero - b.numero);
}

export type OptionProposee = OptionCritere & {
  /** Portraits encore possibles avec cette option. */
  nombre: number;
  /** Le portrait qui illustre l'option : le plus proche de l'avatar en cours. */
  apercu: Portrait;
};

/**
 * Options d'une étape, compte tenu des SEULS choix antérieurs : on peut
 * toujours revenir sur une étape et changer d'avis, les étapes suivantes
 * s'adapteront. Une option sans portrait n'est pas proposée.
 */
export function optionsEtape(etape: number, choix: Choix, reference: Portrait): OptionProposee[] {
  const { critere } = ETAPES[etape];
  const base = candidats(choixAvant(choix, etape));
  const out: OptionProposee[] = [];
  for (const option of OPTIONS[critere]) {
    const liste = base.filter((p) => p.traits[critere] === option.valeur);
    if (!liste.length) continue;
    // L'aperçu garde autant que possible les choix des étapes suivantes :
    // l'option se voit sur l'avatar en cours, pas sur un inconnu.
    const suite = candidats({ ...choix, [critere]: option.valeur }, liste);
    out.push({ ...option, nombre: liste.length, apercu: plusProche(suite.length ? suite : liste, reference)! });
  }
  return out;
}

/**
 * Pose (ou lève, avec `undefined`) le choix d'une étape. Les choix suivants
 * encore possibles sont gardés, dans l'ordre du parcours ; l'avatar retenu est
 * le portrait restant le plus proche de l'avatar en cours. Un choix suivant
 * devenu impossible prend la valeur de ce portrait : il n'est pas « levé »,
 * seul un « Indifférent » explicite l'est.
 */
export function choisir(
  choix: Choix,
  etape: number,
  valeur: string | undefined,
  reference: Portrait,
): { choix: Choix; avatar: Portrait } {
  const suivant: Choix = choixAvant(choix, etape);
  if (valeur !== undefined) suivant[ETAPES[etape].critere] = valeur;
  const abandonnes: Critere[] = [];
  for (const { critere } of ETAPES.slice(etape + 1)) {
    const v = choix[critere];
    if (v === undefined) continue;
    if (candidats({ ...suivant, [critere]: v }).length) suivant[critere] = v;
    else abandonnes.push(critere);
  }
  const avatar = plusProche(candidats(suivant), reference) ?? reference;
  for (const critere of abandonnes) suivant[critere] = avatar.traits[critere];
  return { choix: suivant, avatar };
}

/** Une étape n'offre-t-elle qu'une seule possibilité (ex. la barbe d'une soignante) ? */
export function etapeSansChoix(etape: number, choix: Choix): boolean {
  const { critere } = ETAPES[etape];
  const valeurs = new Set(candidats(choixAvant(choix, etape)).map((p) => p.traits[critere]));
  return valeurs.size <= 1;
}
