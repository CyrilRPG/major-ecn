import 'server-only';
import { currentStaff, isPublic } from './access';
import { arenaDb, listTournaments } from './db';
import { buildTournamentCard, groupTournamentCards, type CardSource, type TournamentCardGroups } from './tournament-cards';

/**
 * Cartes « Choisissez votre tournoi » : tous les tournois visibles (publics,
 * plus les brouillons pour le personnel) avec leurs manches, en deux requêtes.
 */
export async function loadTournamentCards(now = new Date()): Promise<TournamentCardGroups> {
  const staff = await currentStaff();
  const all = (await listTournaments()).filter((t) => isPublic(t) || staff);
  if (all.length === 0) return { open: [], upcoming: [], finished: [] };
  const { data } = await arenaDb()
    .from('arena_rounds')
    .select('tournament_id, number, theme, opens_at, closes_at, duration_minutes')
    .in('tournament_id', all.map((t) => t.id));
  const rounds = (data ?? []) as (CardSource['rounds'][number] & { tournament_id: string })[];
  const cards = all.map((t) =>
    buildTournamentCard(
      { ...t, rounds: rounds.filter((r) => r.tournament_id === t.id) },
      { now, supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, isPublic: isPublic(t) },
    ),
  );
  return groupTournamentCards(cards);
}
