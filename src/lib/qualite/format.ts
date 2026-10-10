/** Formats d'affichage (module PUR : pages serveur et composants client). */

export function dateFr(iso: string | null | undefined, heure = false): string {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric', ...(heure ? { hour: '2-digit', minute: '2-digit' } : {}) });
}

export function note(n: number | null | undefined): string {
  return typeof n === 'number' ? `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}/5` : '—';
}

export const STATUT_RECLAMATION_LABEL: Record<string, string> = {
  a_traiter: 'À traiter', a_analyser: 'À analyser', en_cours: 'En cours', resolu: 'Résolue', cloturee: 'Clôturée',
};
export const PRIORITE_LABEL: Record<string, string> = { basse: 'Basse', normale: 'Normale', haute: 'Haute', urgente: 'Urgente' };

/** Instant courant (pages serveur : rendu dynamique à chaque requête). */
export function maintenant(): number {
  return Date.now();
}
