/**
 * Blocs pédagogiques d'un item, et masquage par l'administrateur.
 *
 * Tous les items n'ont pas vocation à proposer les mêmes rubriques : un item
 * « Révisions - Psychiatrie » peut n'avoir ni fiche éclair, ni DP/QI. La
 * colonne `cours.hidden_blocks` liste les blocs à ne PAS afficher, et la clé
 * utilisée est celle des onglets de la console d'étude.
 *
 * Masquer n'est pas une permission : c'est un choix d'affichage. Les droits
 * par formule (formula_permissions) continuent de s'appliquer par-dessus.
 */

export type BlocKey =
  | 'fiche'
  | 'fiche-express'
  | 'qcm'
  | 'video'
  | 'seance-approfondie'
  | 'flashcards'
  | 'interrogation'
  | 'notes';

export const BLOCS: { key: BlocKey; label: string; aide: string }[] = [
  { key: 'fiche', label: 'Fiche de cours exhaustive', aide: 'Le PDF complet de l’item.' },
  { key: 'fiche-express', label: 'Fiche éclair', aide: 'La version condensée de la fiche.' },
  { key: 'qcm', label: 'DP · QI', aide: 'Dossiers progressifs et questions isolées.' },
  { key: 'video', label: 'Cours vidéo', aide: 'Réservé à la Formule Intensive.' },
  { key: 'seance-approfondie', label: 'Séances approfondies', aide: 'Réservé au Programme Approfondi.' },
  { key: 'flashcards', label: 'Flashcards', aide: 'Cartes de mémorisation.' },
  { key: 'interrogation', label: 'Interrogation', aide: 'L’interrogation de fin d’item.' },
  { key: 'notes', label: 'Prise de notes', aide: 'Le bloc-notes personnel de l’élève.' },
];

const CLES = new Set<string>(BLOCS.map((b) => b.key));

/** Nettoie la valeur lue en base (colonne text[] librement modifiable). */
export function parseHiddenBlocks(raw: unknown): BlocKey[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((k): k is BlocKey => typeof k === 'string' && CLES.has(k));
}

/** Table `{ cle: false }` attendue par StudyConsole pour masquer un onglet. */
export function hiddenBlocksVisibility(hidden: BlocKey[]): Record<string, boolean> {
  return Object.fromEntries(hidden.map((k) => [k, false]));
}

/** Un bloc est-il masqué pour cet item ? */
export function estMasque(hidden: BlocKey[], key: BlocKey): boolean {
  return hidden.includes(key);
}
