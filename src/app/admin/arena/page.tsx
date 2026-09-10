import { requireAdmin } from '@/lib/auth/require-role';
import { arenaDb, listTournaments } from '@/lib/arena/db';
import { effectiveStatus, STATUS_LABEL } from '@/lib/arena/time';
import { TournamentList, type TournamentListRow } from '@/components/admin/arena/tournament-list';
import { ArenaAdminShell } from '@/components/admin/arena/admin-shell';
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
      rounds: rs.length, datedRounds: rs.filter((r) => r.opens_at && r.closes_at).length, firstOpen: rs[0]?.opens_at ?? null, registered: ps.length, confirmed: ps.filter((p) => p.email_confirmed_at).length,
      indexable: t.indexable, questionsPerRound: t.questions_per_round,
    };
  });
  const specialties = ENROLLABLE_SPECIALTIES.map((s) => ({ id: s.collegeId, name: s.name }));
  const live = rows.filter((r) => r.status === 'round_open' || r.status === 'registration_open' || r.status === 'round_closed').length;

  return (
    <ArenaAdminShell
      title="Tournois"
      eyebrow="Administration"
      subtitle="Tournois de QCM par spécialité : trois manches de vingt questions chronométrées une par une, une seule tentative. Rien n’est visible du public tant qu’un tournoi est en brouillon ou programmé."
      landingHref="/arena"
      landingLabel="Ouvrir le hub public"
      stats={[
        { label: 'Tournois', value: rows.length },
        { label: 'En ligne', value: live },
        { label: 'Brouillons', value: rows.filter((r) => r.status === 'draft').length },
      ]}
    >
      <TournamentList rows={rows} specialties={specialties} />
    </ArenaAdminShell>
  );
}
