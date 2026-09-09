import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { computeTournamentStandings, getTournament, listAttemptsForRounds, listParticipants, loadTournamentSnapshot } from '@/lib/arena/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Export des coordonnées (§15.4) : `?marketing=1` ne renvoie que les
 * participants ayant coché la case n° 2 (§3.1) et non désinscrits — seuls
 * ceux-là sont exploitables en prospection. L'export distingue clairement
 * les deux populations par la colonne « consentement marketing ».
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { id } = await ctx.params;
  const marketingOnly = new URL(req.url).searchParams.get('marketing') === '1';
  const t = await getTournament(id);
  if (!t) return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
  const snap = await loadTournamentSnapshot(t);
  const participants = (await listParticipants(t.id)).filter((p) => !p.anonymized_at);
  const attempts = await listAttemptsForRounds(snap.rounds.map((r) => r.id));
  const { standings, byRound, effectifGeneral, isFinal } = await computeTournamentStandings(snap);
  const rows = participants.filter((p) => !marketingOnly || (p.consent_marketing && !p.marketing_unsubscribed_at));

  const header = ['Pseudonyme', 'Prénom', 'Nom', 'Email', 'Spécialité', 'Email confirmé', 'Consentement tournoi (date)', 'Version', 'Consentement marketing', 'Consentement marketing (date)', 'Désinscrit marketing', 'Source', 'Invité par', 'Inscription', 'Dernière connexion', 'Bloqué',
    ...snap.rounds.map((r) => `M${r.number} score`), ...snap.rounds.map((r) => `M${r.number} temps (s)`),
    ...snap.rounds.flatMap(r => [`M${r.number} rang`, `M${r.number} effectif de manche`]),
    'Score cumulé', isFinal ? 'Rang général' : 'Rang cumulé provisoire', 'Effectif général (3 manches)', 'Temps cumulé (s)', 'Temps moyen par manche (s)'];
  const lines = rows.map((p) => {
    const st = standings.find((s) => s.participantId === p.id);
    const inviter = p.invited_by ? participants.find((x) => x.id === p.invited_by)?.pseudo ?? '' : '';
    return [
      p.pseudo, p.first_name, p.last_name, p.email, p.specialty,
      p.email_confirmed_at ? 'oui' : 'non', p.consent_tournament_at, p.consent_tournament_version,
      p.consent_marketing ? 'oui' : 'non', p.consent_marketing_at ?? '', p.marketing_unsubscribed_at ?? '',
      p.acquisition_source ?? '', inviter, p.created_at, p.last_login_at ?? '', p.blocked_at ? 'oui' : 'non',
      ...snap.rounds.map((r) => { const a = attempts.find((x) => x.round_id === r.id && x.participant_id === p.id); return a && a.status !== 'in_progress' ? String(a.score ?? 0).replace('.', ',') : ''; }),
      ...snap.rounds.map((r) => { const a = attempts.find((x) => x.round_id === r.id && x.participant_id === p.id); return a && a.status !== 'in_progress' ? String(a.duration_seconds ?? '') : ''; }),
      ...snap.rounds.flatMap(r => [byRound[r.id]?.standings.find(s => s.participantId === p.id)?.rank ?? '', byRound[r.id]?.effectifManche ?? 0]),
      st ? String(st.totalScore).replace('.', ',') : '0', st?.rank ?? '', effectifGeneral, st?.totalDurationSeconds ?? 0, st?.meanTime ?? '',
    ].map(csvCell).join(';');
  });
  const csv = '﻿' + [header.map(csvCell).join(';'), ...lines].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="arena-${t.slug}-${marketingOnly ? 'prospection' : 'participants'}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
