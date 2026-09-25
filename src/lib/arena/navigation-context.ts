import 'server-only';
import { cache } from 'react';
import { currentStaff, isPublic } from './access';
import { currentPerson, listTournaments } from './db';
import { loadArenaPage } from './page-context';
import { GENERIC_ARENA_NAV, type ArenaNavigation } from './navigation';

/** Access pages keep the selected tournament, then the authenticated player's
 * tournament. With several public tournaments, the menu opens a real picker. */
export const loadArenaNavigation = cache(async (slug?: string): Promise<ArenaNavigation> => {
  const [person, tournaments, staff] = await Promise.all([currentPerson(), listTournaments(), currentStaff()]);
  const visible = tournaments.filter(t => isPublic(t) || staff);
  const selected = visible.find(t => t.slug === slug)
    ?? visible.find(t => t.id === person?.tournament_id)
    ?? (visible.length === 1 ? visible[0] : undefined);
  if (selected) return (await loadArenaPage(selected.slug)).nav;
  // Personne connectée dont le tournoi n'est plus public : l'en-tête la reconnaît quand même.
  return person ? { ...GENERIC_ARENA_NAV, account: { pseudo: person.pseudo, avatar_seed: person.avatar_seed, href: '/arena' } } : GENERIC_ARENA_NAV;
});
