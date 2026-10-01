/**
 * Offre Découverte par spécialité (01/10/2026).
 *
 * Le collège `col-decouverte` porte un item par spécialité « ouverte » en
 * découverte, copié de l'item payant correspondant par
 * `scripts/decouverte-items-specialite.mjs` (fiche de cours, 10 QCM dont un
 * dossier progressif pour la voie interne, 10 QROC dont un dossier progressif
 * pour la voie externe, 10 flashcards). La Médecine générale et toute autre
 * spécialité gardent l'item « Pneumologie ». « Méthodologie EVC » est ouvert à
 * tous.
 *
 * Visibilité : `permission_scope.decouverte_cours` liste les items du collège
 * Découverte ouverts au compte (posé à l'inscription et par
 * `scripts/decouverte-backfill-scopes.mjs`). Lu par la RLS
 * (`accessible_cours_ids()`, migration 20261001120000) et par
 * `canAccessCours()`. Il ne restreint QUE le collège Découverte : un passage en
 * formule payante n'en est pas affecté. Clé absente = items non restreints
 * (« Pneumologie » + « Méthodologie EVC »).
 *
 * Module PUR (importable côté client et serveur).
 */

export const DECOUVERTE_COLLEGE_ID = 'col-decouverte';
/** Item « Pneumologie » : découverte de la Médecine générale et repli. */
export const DECOUVERTE_PNEUMOLOGIE_COURS_ID = '1fe265a8-e907-460b-9962-141313e022a5';
/** Item « Méthodologie EVC » : ouvert à tous les comptes découverte. */
export const DECOUVERTE_METHODOLOGIE_COURS_ID = '6b321ef6-ef8a-4174-945a-1e1c60f22c5d';

export type ItemDecouverteSpecialite = {
  /** Spécialité telle qu'annoncée à l'élève (e-mail, accueil). */
  specialite: string;
  /** Item du collège Découverte (copie, `access_type = 'specific'`). */
  coursId: string;
  /** Sujet de l'item. */
  theme: string;
  /** Libellés de spécialité (formulaire d'inscription, ventes) qui y mènent. */
  libelles: string[];
};

export const ITEMS_DECOUVERTE_SPECIALITE: ItemDecouverteSpecialite[] = [
  {
    specialite: 'Pédiatrie',
    coursId: '4ac2c596-1923-5622-81ce-91908b027495',
    theme: 'Méningites et méningo-encéphalites',
    libelles: ['Pédiatrie'],
  },
  {
    specialite: 'Gynécologie-obstétrique',
    coursId: 'bc0b14cc-c696-5e4c-a31d-0f6b1c939f5e',
    theme: 'Grossesse extra-utérine',
    libelles: ['Gynécologie obstétrique', 'Gynécologie-obstétrique', 'Gynécologie médicale'],
  },
  {
    specialite: 'Médecine d’urgence',
    coursId: '292a0f27-87e6-5bc2-bd96-6fc341c55cca',
    theme: 'Arrêt cardiaque',
    libelles: ['Médecine d’urgence', "Médecine d'urgence"],
  },
];

/** Item de repli (Médecine générale et toute spécialité sans item dédié). */
export const ITEM_DECOUVERTE_PAR_DEFAUT = {
  specialite: 'Médecine générale',
  coursId: DECOUVERTE_PNEUMOLOGIE_COURS_ID,
  theme: 'Pneumologie',
} as const;

const MG = 'medecinegenerale';

/** Minuscules, sans accents, sans espaces ni ponctuation (apostrophes droites ou typographiques). */
function normaliser(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

/** Item dédié à la spécialité, ou `null` (→ item « Pneumologie »). */
export function itemDecouvertePourSpecialite(specialite: string | null | undefined): ItemDecouverteSpecialite | null {
  if (!specialite) return null;
  const cible = normaliser(specialite);
  if (!cible) return null;
  return ITEMS_DECOUVERTE_SPECIALITE.find((it) => it.libelles.some((l) => normaliser(l) === cible)) ?? null;
}

/**
 * Valeur de `permission_scope.decouverte_cours` pour une spécialité : l'item
 * dédié + « Méthodologie EVC », ou `null` quand la spécialité n'a pas d'item
 * dédié (clé absente = « Pneumologie » + « Méthodologie EVC »).
 */
export function coursDecouvertePourSpecialite(specialite: string | null | undefined): string[] | null {
  const item = itemDecouvertePourSpecialite(specialite);
  return item ? [item.coursId, DECOUVERTE_METHODOLOGIE_COURS_ID] : null;
}

/** Le formulaire d'inscription demande la voie (interne/externe) : MG et spécialités à item dédié. */
export function voieDemandeeALInscription(specialite: string | null | undefined): boolean {
  if (!specialite) return false;
  return normaliser(specialite) === MG || itemDecouvertePourSpecialite(specialite) !== null;
}

/** Spécialité choisie à l'inscription découverte (formulaire), lue dans le scope brut. */
export function specialiteDecouverteDuScope(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as { signup?: { specialty?: unknown } | null; specialty_wish?: unknown };
  const v = typeof s.signup?.specialty === 'string' && s.signup.specialty.trim()
    ? s.signup.specialty
    : typeof s.specialty_wish === 'string' ? s.specialty_wish : '';
  return v.trim() || null;
}

export type ContenuDecouverte = {
  /** « Pédiatrie », « Médecine générale »… */
  specialite: string;
  /** Sujet de l'item (« Méningites et méningo-encéphalites », « Pneumologie »). */
  theme: string;
  /** Lignes de contenu, adaptées à la voie. */
  lignes: string[];
};

/**
 * Contenu annoncé à l'élève (e-mail de bienvenue) pour sa spécialité et sa voie.
 * `null` si la spécialité n'a pas d'item dédié et n'est pas la Médecine générale :
 * l'e-mail garde alors l'annonce générique.
 */
export function contenuDecouverte(
  specialite: string | null | undefined,
  voie: string | null | undefined,
): ContenuDecouverte | null {
  const item = itemDecouvertePourSpecialite(specialite);
  const estMg = !!specialite && normaliser(specialite) === MG;
  if (!item && !estMg) return null;
  const v = normaliser(voie ?? '').replace(/^voie/, '');
  const questions = item
    ? v === 'interne'
      ? '10 QCM, dont 1 dossier progressif'
      : v === 'externe'
        ? '10 QROC, dont 1 dossier progressif'
        : '10 QCM ou 10 QROC selon votre voie, avec un dossier progressif'
    : v === 'interne'
      ? '10 QCM, dont 1 dossier progressif'
      : v === 'externe'
        ? '10 QROC et 2 dossiers progressifs QROC'
        : '10 QCM ou 10 QROC selon votre voie, avec un dossier progressif';
  return {
    specialite: item ? item.specialite : ITEM_DECOUVERTE_PAR_DEFAUT.specialite,
    theme: item ? item.theme : ITEM_DECOUVERTE_PAR_DEFAUT.theme,
    lignes: ['1 fiche de cours', questions, '10 flashcards'],
  };
}
