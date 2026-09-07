import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-role';
import { arenaDb, listTournaments } from '@/lib/arena/db';
import { effectiveStatus, STATUS_LABEL } from '@/lib/arena/time';
import { TournamentList, type TournamentListRow } from '@/components/admin/arena/tournament-list';
import { ENROLLABLE_SPECIALTIES } from '@/lib/data/enrollable-colleges';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'EVC Arena — tournois' };

/**
 * Administration EVC Arena (§15) : liste des tournois avec statut explicite,
 * création, duplication (§15.3), accès à la prévisualisation et à la landing.
 */
export default async function ArenaAdminPage() {
  await requireAdmin();
  const tournaments = await listTournaments();
  const db = arenaDb();
  const ids = tournaments.map((t) => t.id);
  const { data: rounds } = ids.length ? await db.from('arena_rounds').select('tournament_id, number, opens_at, closes_at, duration_minutes').in('tournament_id', ids) : { data: [] };
  const { data: parts } = ids.length ? await db.from('arena_participants').select('tournament_id, email_confirmed_at').in('tournament_id', ids) : { data: [] };
  const now = new Date();
  const rows: TournamentListRow[] = tournaments.map((t) => {
    const rs = ((rounds ?? []) as { tournament_id: string; number: number; opens_at: string | null; closes_at: string | null; duration_minutes: number | null }[]).filter((r) => r.tournament_id === t.id).sort((a, b) => a.number - b.number);
    const eff = effectiveStatus(t.status, rs, now);
    const ps = ((parts ?? []) as { tournament_id: string; email_confirmed_at: string | null }[]).filter((p) => p.tournament_id === t.id);
    return {
      id: t.id, slug: t.slug, title: t.title, specialty: t.specialty, edition: t.edition_label,
      status: eff.status, statusLabel: STATUS_LABEL[eff.status], openRound: eff.openRound,
      rounds: rs.length, firstOpen: rs[0]?.opens_at ?? null, registered: ps.length, confirmed: ps.filter((p) => p.email_confirmed_at).length,
      indexable: t.indexable,
    };
  });
  const specialties = ENROLLABLE_SPECIALTIES.map((s) => ({ id: s.collegeId, name: s.name }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <h1 className="text-2xl font-bold text-(--color-ink)">EVC Arena</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            Tournois de QCM par spécialité : trois manches, douze questions, douze minutes, une seule tentative. Rien n’est visible du public tant qu’un tournoi est en brouillon ou programmé.
          </p>
        </div>
        <Link href="/arena" className="text-sm font-semibold text-(--color-primary) underline-offset-4 hover:underline" target="_blank">Ouvrir le hub public ↗</Link>
      </header>
      <TournamentList rows={rows} specialties={specialties} />
    </main>
  );
}
