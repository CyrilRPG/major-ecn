import 'server-only';
import { cache } from 'react';
import { currentStaff, isPublic } from './access';
import { listTournaments } from './db';
import { readSession } from './session';
import { loadArenaPage } from './page-context';
import { GENERIC_ARENA_NAV, type ArenaNavigation } from './navigation';

/** Access pages keep the selected tournament, then the authenticated player's
 * tournament. With several public tournaments, the menu opens a real picker. */
export const loadArenaNavigation = cache(async (slug?: string): Promise<ArenaNavigation> => {
  const [session, tournaments, staff] = await Promise.all([readSession(), listTournaments(), currentStaff()]);
  const visible = tournaments.filter(t => isPublic(t) || staff);
  const selected = visible.find(t => t.slug === slug)
    ?? visible.find(t => t.id === session?.tournamentId)
    ?? (visible.length === 1 ? visible[0] : undefined);
  return selected ? (await loadArenaPage(selected.slug)).nav : GENERIC_ARENA_NAV;
});
