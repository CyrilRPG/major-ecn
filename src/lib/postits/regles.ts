/**
 * « Mes Post-it » — règles PURES partagées par le serveur, les composants
 * client, les tests et (plus tard) l'application mobile : types, couleurs,
 * tailles, emplacements (§22, §24), positions (§23, §34), archivage (§30, §47).
 *
 * Aucune dépendance serveur ici : ce module est importé par des composants
 * client. Les accès base vivent dans `depot.ts`.
 */

/* ------------------------------------------------------------------ */
/* Couleurs fluo (§23)                                                 */
/* ------------------------------------------------------------------ */

export const COULEURS = ['jaune', 'rose', 'vert', 'bleu', 'orange', 'violet'] as const;
export type Couleur = (typeof COULEURS)[number];

/** Palette fluorescente : fond, bandeau (poignée), encre, ombre. */
export const PALETTE: Record<Couleur, { label: string; fond: string; bandeau: string; encre: string; ombre: string }> = {
  jaune:  { label: 'Jaune',  fond: '#FFF475', bandeau: '#F7E44A', encre: '#4A3C00', ombre: 'rgba(160,130,0,0.35)' },
  rose:   { label: 'Rose',   fond: '#FFA8D5', bandeau: '#FF84C0', encre: '#5E0A35', ombre: 'rgba(190,30,110,0.30)' },
  vert:   { label: 'Vert',   fond: '#BDF58A', bandeau: '#9FE863', encre: '#1F4B07', ombre: 'rgba(60,140,20,0.30)' },
  bleu:   { label: 'Bleu',   fond: '#9EDFFF', bandeau: '#72CDFA', encre: '#093650', ombre: 'rgba(20,110,170,0.30)' },
  orange: { label: 'Orange', fond: '#FFC074', bandeau: '#FFA845', encre: '#5C2A00', ombre: 'rgba(200,100,0,0.30)' },
  violet: { label: 'Violet', fond: '#DCC0FF', bandeau: '#C79DFB', encre: '#3C1A6E', ombre: 'rgba(110,50,190,0.30)' },
};

export function couleurValide(c: unknown): c is Couleur {
  return typeof c === 'string' && (COULEURS as readonly string[]).includes(c);
}

/* ------------------------------------------------------------------ */
/* Tailles (§23)                                                       */
/* ------------------------------------------------------------------ */

export const TAILLES = ['petit', 'moyen', 'grand'] as const;
export type TaillePreset = (typeof TAILLES)[number];
export type Taille = TaillePreset | 'libre';

export const DIMENSIONS: Record<TaillePreset, { w: number; h: number; label: string }> = {
  petit: { w: 200, h: 180, label: 'Petit' },
  moyen: { w: 260, h: 250, label: 'Moyen' },
  grand: { w: 340, h: 340, label: 'Grand' },
};

export const BORNES_DIMENSIONS = { wMin: 160, wMax: 720, hMin: 120, hMax: 900 } as const;

/** Taille correspondant à des dimensions (redimensionnement libre → « libre »). */
export function tailleDepuisDimensions(w: number, h: number): Taille {
  for (const t of TAILLES) if (DIMENSIONS[t].w === w && DIMENSIONS[t].h === h) return t;
  return 'libre';
}

/* ------------------------------------------------------------------ */
/* Statuts (§30)                                                       */
/* ------------------------------------------------------------------ */

export type Statut = 'actif' | 'archive' | 'supprime';
/** Durée de conservation dans la corbeille avant purge définitive. */
export const JOURS_CORBEILLE = 30;

export const RAPPELS = ['heure', '15min', '1h', 'veille'] as const;
export type Rappel = (typeof RAPPELS)[number];
export const LIBELLE_RAPPEL: Record<Rappel, string> = {
  heure: 'À l’heure',
  '15min': '15 min avant',
  '1h': '1 h avant',
  veille: 'La veille (18 h)',
};

/* ------------------------------------------------------------------ */
/* Modèle partagé (réponses de l'API)                                  */
/* ------------------------------------------------------------------ */

export type TypeEmplacement =
  | 'accueil' | 'specialite' | 'item'
  | 'fiche' | 'fiche_express' | 'replay' | 'support' | 'qcm' | 'serie' | 'annales'
  | 'flashcards' | 'notes' | 'seance' | 'correction';

/** Emplacement résolu : identifiants techniques stables + libellés. */
export type Emplacement = {
  cle: string;
  type: TypeEmplacement;
  matiereId: string | null;
  matiereNom: string | null;
  coursId: string | null;
  coursTitre: string | null;
  ressourceId: string | null;
  ressourceTitre: string | null;
};

export type Placement = Emplacement & {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  reduit: boolean;
};

export type Tache = {
  id: string;
  texte: string;
  fait: boolean;
  faitLe: string | null;
  ordre: number;
  /** AAAA-MM-JJ (Paris) ou null. */
  date: string | null;
  /** HH:MM (Paris) ou null. */
  heure: string | null;
  rappels: Rappel[];
  dansAgenda: boolean;
};

export type Postit = {
  id: string;
  titre: string;
  contenu: string;
  couleur: Couleur;
  taille: Taille;
  statut: Statut;
  creeLe: string;
  modifieLe: string;
  archiveLe: string | null;
  supprimeLe: string | null;
  origine: Emplacement & { chemin: string | null };
  placements: Placement[];
  taches: Tache[];
};

export type PreferencesPostit = { rappelsActifs: boolean };

/** Spécialité et ses items (« Déplacer vers une autre page »). */
export type Destination = { id: string; nom: string; items: { id: string; titre: string }[] };

/* ------------------------------------------------------------------ */
/* Emplacements (§22, §24, §28, §33)                                   */
/* ------------------------------------------------------------------ */

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const RE_UUID = new RegExp(`^${UUID}$`, 'i');
const RE_SLUG = /^[a-z0-9][a-z0-9_-]{0,80}$/i;

/** Ressources simples d'un item (segment d'URL → type). */
const RESSOURCES_SIMPLES: Record<string, TypeEmplacement> = {
  fiche: 'fiche',
  'fiche-express': 'fiche_express',
  video: 'replay',
  qcm: 'qcm',
  flashcards: 'flashcards',
  notes: 'notes',
  'seance-approfondie': 'seance',
};

export const LIBELLE_TYPE: Record<TypeEmplacement, string> = {
  accueil: 'Accueil',
  specialite: 'Spécialité',
  item: 'Item',
  fiche: 'Fiche',
  fiche_express: 'Fiche express',
  replay: 'Replay',
  support: 'Support de cours',
  qcm: 'QCM',
  serie: 'Série de QCM',
  annales: 'Annales',
  flashcards: 'Flashcards',
  notes: 'Prise de notes',
  seance: 'Séance approfondie',
  correction: 'Correction',
};

/** Pages d'un item proposées par « Déplacer vers une autre page ». */
export const PAGES_ITEM: { seg: string; type: TypeEmplacement; label: string }[] = [
  { seg: '', type: 'item', label: 'Vue d’ensemble de l’item' },
  { seg: 'fiche', type: 'fiche', label: 'Fiche' },
  { seg: 'video', type: 'replay', label: 'Cours vidéo / replay' },
  { seg: 'qcm', type: 'qcm', label: 'QCM et dossiers' },
  { seg: 'flashcards', type: 'flashcards', label: 'Flashcards' },
  { seg: 'notes', type: 'notes', label: 'Prise de notes' },
];

/** Contexte d'une page, déduit de son adresse — sans libellés. */
export type ContextePage = {
  cle: string;
  type: TypeEmplacement;
  matiereId: string | null;
  coursId: string | null;
  ressourceId: string | null;
};

/**
 * Pages où les Post-it ne doivent JAMAIS apparaître (§33) : épreuves et QCM
 * chronométrés, évaluations, check-up, interrogations, formulaires, éditeurs.
 * EVC Arena vit dans un autre groupe de routes (`(arena)`) : jamais concerné.
 * La règle d'affichage est une liste BLANCHE (`contexteDepuisChemin`) ; cette
 * liste noire documente et verrouille les exclusions sous les préfixes admis.
 */
export const ROUTES_EXCLUES: RegExp[] = [
  /^\/epreuves-blanches(\/|$)/,
  /^\/checkup(\/|$)/,
  /^\/evaluations(\/|$)/,
  /^\/cours\/[^/]+\/interrogation(\/|$)/,
  /^\/cours\/[^/]+\/fiche\/edit(\/|$)/,
  /^\/matieres\/[^/]+\/(evaluation|consolidation|renforcement)(\/|$)/,
  /^\/planificateur\/(evaluation|auto-evaluation|concours-blancs)(\/|$)/,
  /^\/revisions-transversales\/session(\/|$)/,
  /^\/entrainement\/session(\/|$)/,
  /^\/formulaires(\/|$)/,
];

export function estRouteExclue(chemin: string): boolean {
  return ROUTES_EXCLUES.some((re) => re.test(chemin));
}

/**
 * Contexte Post-it d'une adresse (§22) : accueil, page d'une spécialité, page
 * d'un item et ses ressources (fiche, replay, QCM, dossier, flashcards…).
 * `null` = pas de Post-it sur cette page.
 */
export function contexteDepuisChemin(cheminBrut: string): ContextePage | null {
  const chemin = (cheminBrut.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/';
  if (estRouteExclue(chemin)) return null;
  if (chemin === '/accueil') return { cle: 'accueil', type: 'accueil', matiereId: null, coursId: null, ressourceId: null };

  const mat = /^\/matieres\/([^/]+)$/.exec(chemin);
  if (mat) {
    const id = decodeURIComponent(mat[1]);
    if (!RE_SLUG.test(id)) return null;
    return { cle: `matiere:${id}`, type: 'specialite', matiereId: id, coursId: null, ressourceId: null };
  }

  const cours = /^\/cours\/([^/]+)(?:\/(.+))?$/.exec(chemin);
  if (!cours || !RE_UUID.test(cours[1])) return null;
  const c = cours[1].toLowerCase();
  const reste = cours[2] ?? '';
  const base = { matiereId: null, coursId: c };
  if (reste === '') return { cle: `cours:${c}`, type: 'item', ...base, ressourceId: null };
  if (RESSOURCES_SIMPLES[reste]) return { cle: `cours:${c}:${reste}`, type: RESSOURCES_SIMPLES[reste], ...base, ressourceId: null };

  const annales = /^qcm\/annales\/(\d{4})$/.exec(reste);
  if (annales) return { cle: `cours:${c}:annales:${annales[1]}`, type: 'annales', ...base, ressourceId: annales[1] };
  const serie = /^qcm\/([^/]+)$/.exec(reste);
  if (serie && RE_UUID.test(serie[1])) return { cle: `cours:${c}:qcm:${serie[1].toLowerCase()}`, type: 'serie', ...base, ressourceId: serie[1].toLowerCase() };
  const support = /^support\/([^/]+)$/.exec(reste);
  if (support && RE_UUID.test(support[1])) return { cle: `cours:${c}:support:${support[1].toLowerCase()}`, type: 'support', ...base, ressourceId: support[1].toLowerCase() };
  const resultats = /^resultats\/([^/]+)(?:\/revoir)?$/.exec(reste);
  if (resultats && RE_UUID.test(resultats[1])) return { cle: `cours:${c}:resultats:${resultats[1].toLowerCase()}`, type: 'correction', ...base, ressourceId: resultats[1].toLowerCase() };
  return null;
}

/** Adresse d'une clé d'emplacement — reconstruite depuis les identifiants (§28). */
export function cheminDeCle(cle: string): string | null {
  if (cle === 'accueil') return '/accueil';
  const mat = /^matiere:(.+)$/.exec(cle);
  if (mat) return RE_SLUG.test(mat[1]) ? `/matieres/${encodeURIComponent(mat[1])}` : null;
  const m = /^cours:([^:]+)(?::(.+))?$/.exec(cle);
  if (!m || !RE_UUID.test(m[1])) return null;
  const base = `/cours/${m[1]}`;
  const r = m[2];
  if (!r) return base;
  if (RESSOURCES_SIMPLES[r]) return `${base}/${r}`;
  const [genre, id] = r.split(':');
  if (genre === 'annales' && /^\d{4}$/.test(id ?? '')) return `${base}/qcm/annales/${id}`;
  if (!id || !RE_UUID.test(id)) return null;
  if (genre === 'qcm') return `${base}/qcm/${id}`;
  if (genre === 'support') return `${base}/support/${id}`;
  if (genre === 'resultats') return `${base}/resultats/${id}`;
  return null;
}

/** Contexte d'une clé (inverse de `contexteDepuisChemin(cheminDeCle(cle))`). */
export function contexteDeCle(cle: string): ContextePage | null {
  const chemin = cheminDeCle(cle);
  if (!chemin) return null;
  const ctx = contexteDepuisChemin(chemin);
  return ctx && ctx.cle === cle ? ctx : null;
}

/** Lien « Ouvrir dans sa page » : la page + le Post-it mis en évidence. */
export function lienPostit(cle: string, postitId: string): string | null {
  const chemin = cheminDeCle(cle);
  return chemin ? `${chemin}?postit=${encodeURIComponent(postitId)}` : null;
}

/** « Cardiologie → Fibrillation atriale → Fiche » (libellé lisible d'un emplacement). */
export function libelleEmplacement(e: Pick<Emplacement, 'type' | 'matiereNom' | 'coursTitre' | 'ressourceTitre'>): string {
  if (e.type === 'accueil') return 'Accueil';
  const parties: string[] = [];
  if (e.matiereNom) parties.push(e.matiereNom);
  if (e.coursTitre) parties.push(e.coursTitre);
  if (e.type === 'specialite') return parties[0] ?? 'Spécialité';
  if (e.type !== 'item') parties.push(e.ressourceTitre?.trim() || LIBELLE_TYPE[e.type]);
  return parties.length > 0 ? parties.join(' → ') : LIBELLE_TYPE[e.type];
}

/* ------------------------------------------------------------------ */
/* Positions (§23, §34)                                                */
/* ------------------------------------------------------------------ */

export type Geometrie = { x: number; y: number; w: number; h: number };

/** Marges réservées : barre du haut et bouton Post-it en bas. */
export const MARGES_CALQUE = { haut: 72, bas: 16, cote: 8 } as const;

/**
 * Ramène une note dans la fenêtre visible (§33 : jamais hors écran, quelle que
 * soit la taille de l'écran sur lequel elle a été placée). La taille est
 * réduite si la fenêtre est plus petite que la note.
 */
export function contraindre(g: Geometrie, vw: number, vh: number): Geometrie {
  const w = Math.max(BORNES_DIMENSIONS.wMin, Math.min(g.w, vw - 2 * MARGES_CALQUE.cote));
  const h = Math.max(BORNES_DIMENSIONS.hMin, Math.min(g.h, vh - MARGES_CALQUE.haut - MARGES_CALQUE.bas));
  const xMax = Math.max(MARGES_CALQUE.cote, vw - w - MARGES_CALQUE.cote);
  const yMax = Math.max(MARGES_CALQUE.haut, vh - h - MARGES_CALQUE.bas);
  return {
    x: Math.round(Math.min(Math.max(g.x, MARGES_CALQUE.cote), xMax)),
    y: Math.round(Math.min(Math.max(g.y, MARGES_CALQUE.haut), yMax)),
    w: Math.round(w),
    h: Math.round(h),
  };
}

/** Position d'une nouvelle note : en haut à droite, en cascade. */
export function positionInitiale(rang: number, taille: TaillePreset, vw: number, vh: number): Geometrie {
  const { w, h } = DIMENSIONS[taille];
  const pas = (rang % 6) * 28;
  return contraindre({ x: vw - w - 40 - pas, y: MARGES_CALQUE.haut + 40 + pas, w, h }, vw, vh);
}

/** Bornes stockées (entiers raisonnables, cf. contraintes SQL). */
export function geometrieStockable(g: Partial<Geometrie>): Partial<Geometrie> {
  const out: Partial<Geometrie> = {};
  if (g.x != null) out.x = Math.round(Math.min(Math.max(g.x, -10000), 10000));
  if (g.y != null) out.y = Math.round(Math.min(Math.max(g.y, -10000), 10000));
  if (g.w != null) out.w = Math.round(Math.min(Math.max(g.w, BORNES_DIMENSIONS.wMin), BORNES_DIMENSIONS.wMax));
  if (g.h != null) out.h = Math.round(Math.min(Math.max(g.h, BORNES_DIMENSIONS.hMin), BORNES_DIMENSIONS.hMax));
  return out;
}

/* ------------------------------------------------------------------ */
/* Archivage, suppression, corbeille (§29, §30, §47)                   */
/* ------------------------------------------------------------------ */

/** Tâches datées à venir et non terminées (question de l'archivage, §47). */
export function tachesFuturesNonFaites(taches: Pick<Tache, 'fait' | 'date' | 'dansAgenda'>[], aujourdHui: string): number {
  return taches.filter((t) => !t.fait && t.dansAgenda && t.date != null && t.date >= aujourdHui).length;
}

export type ChoixTachesArchivage = 'conserver' | 'archiver';

/**
 * Effet d'un archivage sur les tâches (§47) : « Conserver les tâches dans mon
 * agenda » ne touche à rien ; « Archiver également les tâches » retire de
 * l'agenda toutes les tâches de la note (restaurées avec elle).
 */
export function tachesApresArchivage<T extends Pick<Tache, 'dansAgenda'>>(taches: T[], choix: ChoixTachesArchivage): T[] {
  return choix === 'conserver' ? taches : taches.map((t) => ({ ...t, dansAgenda: false }));
}

/** Texte expliquant ce que deviennent les tâches à la suppression (§47). */
export function messageSuppression(taches: Pick<Tache, 'date' | 'dansAgenda'>[]): string {
  const datees = taches.filter((t) => t.date != null && t.dansAgenda).length;
  const base = `Le Post-it part dans la corbeille : vous pourrez le restaurer pendant ${JOURS_CORBEILLE} jours, puis il sera définitivement effacé.`;
  if (datees === 0) return base;
  return `${base} ${datees === 1 ? 'Sa tâche datée est retirée' : `Ses ${datees} tâches datées sont retirées`} de votre agenda ; ${datees === 1 ? 'elle y reviendra' : 'elles y reviendront'} si vous le restaurez.`;
}

/** Une note de la corbeille est purgeable 30 jours après sa suppression. */
export function estPurgeable(p: { statut: Statut; supprimeLe: string | null }, maintenant: Date): boolean {
  if (p.statut !== 'supprime' || !p.supprimeLe) return false;
  return maintenant.getTime() - new Date(p.supprimeLe).getTime() >= JOURS_CORBEILLE * 86_400_000;
}

/** Jours restants avant la purge (0 = purgée au prochain passage). */
export function joursAvantPurge(supprimeLe: string, maintenant: Date): number {
  const restant = JOURS_CORBEILLE * 86_400_000 - (maintenant.getTime() - new Date(supprimeLe).getTime());
  return Math.max(0, Math.ceil(restant / 86_400_000));
}

/** Validation d'une date AAAA-MM-JJ / heure HH:MM saisies. */
export const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const RE_HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
