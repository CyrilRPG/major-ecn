/** Motifs de désactivation d'un compte (colonne `profiles.deactivation_reason`). */
export const MOTIFS_DESACTIVATION = ['paiement', 'autre'] as const;
export type MotifDesactivation = (typeof MOTIFS_DESACTIVATION)[number];

export const MOTIF_LABELS: Record<MotifDesactivation, string> = {
  paiement: 'Défaut de paiement',
  autre: 'Autre motif',
};

export function parseMotif(v: unknown): MotifDesactivation | null {
  return typeof v === 'string' && (MOTIFS_DESACTIVATION as readonly string[]).includes(v)
    ? (v as MotifDesactivation)
    : null;
}

/** Libellé court affiché dans la liste des élèves. */
export function libelleMotif(v: unknown): string {
  const m = parseMotif(v);
  return m ? MOTIF_LABELS[m] : 'Motif non précisé';
}
