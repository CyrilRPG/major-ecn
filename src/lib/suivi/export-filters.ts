/**
 * Filtres d'export (§17) — module PUR, partagé par l'export CSV, le PDF
 * multiple et les boutons d'export de la vue globale (construction de l'URL).
 */
import { isValidDayKey } from './format';
import type { CandidateFilters } from './stats';
import { CANDIDATE_FILTER_KEYS, type CandidateFilterKey } from './types';

export function parseCandidateFilters(url: URL): CandidateFilters {
  const p = url.searchParams;
  const key = p.get('key') ?? 'all';
  const from = p.get('from'); const to = p.get('to');
  const min = Number(p.get('min') ?? '0');
  const presence = p.get('presence'); const action = p.get('action');
  const ids = (p.get('ids') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    key: (CANDIDATE_FILTER_KEYS as string[]).includes(key) ? (key as CandidateFilterKey) : 'all',
    q: p.get('q') ?? undefined,
    specialty: p.get('specialty') || undefined,
    offer: p.get('offer') || undefined,
    voie: p.get('voie') || undefined,
    campaignId: p.get('campaign') || undefined,
    from: isValidDayKey(from) ? from : undefined,
    to: isValidDayKey(to) ? to : undefined,
    minFollowUps: Number.isFinite(min) && min > 0 ? Math.floor(min) : undefined,
    presence: presence === 'present' || presence === 'absent' ? presence : undefined,
    action: action === 'open' || action === 'late' || action === 'none' ? action : undefined,
    ids: ids.length > 0 ? ids : undefined,
  };
}

/** Inverse : filtres → query string (boutons d'export). */
export function candidateFiltersToQuery(f: CandidateFilters): string {
  const p = new URLSearchParams();
  if (f.key && f.key !== 'all') p.set('key', f.key);
  if (f.q) p.set('q', f.q);
  if (f.specialty) p.set('specialty', f.specialty);
  if (f.offer) p.set('offer', f.offer);
  if (f.voie) p.set('voie', f.voie);
  if (f.campaignId) p.set('campaign', f.campaignId);
  if (f.from) p.set('from', f.from);
  if (f.to) p.set('to', f.to);
  if (f.minFollowUps) p.set('min', String(f.minFollowUps));
  if (f.presence) p.set('presence', f.presence);
  if (f.action) p.set('action', f.action);
  if (f.ids && f.ids.length > 0) p.set('ids', f.ids.join(','));
  const s = p.toString();
  return s ? `?${s}` : '';
}
