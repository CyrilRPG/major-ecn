import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-role';
import { integrityCheck } from '@/lib/arena/admin';
import { arenaDb, computeTournamentStandings, getTournament, listAttemptsForRounds, listParticipants, loadTournamentSnapshot } from '@/lib/arena/db';
import { STATUS_LABEL } from '@/lib/arena/time';
import { qrpNs, type ReportRow } from '@/lib/arena/types';
import { SettingsForm } from '@/components/admin/arena/settings-form';
import { RoundsEditor } from '@/components/admin/arena/rounds-editor';
import { QuestionsManager } from '@/components/admin/arena/questions-manager';
import { BaremeEditor, type BaremeTemplateRow } from '@/components/admin/arena/bareme-editor';
import { ParticipantsTable, type ParticipantView } from '@/components/admin/arena/participants-table';
import { ReportsPanel, type ReportView } from '@/components/admin/arena/reports-panel';
import { EmailsPanel, type EmailLogView } from '@/components/admin/arena/emails-panel';
import { PdfPanel } from '@/components/admin/arena/pdf-panel';
import { ArenaDashboard, type DashboardData } from '@/components/admin/arena/dashboard';
import { roundState } from '@/lib/arena/time';

export const dynamic = 'force-dynamic';

const TABS = [
  ['parametres', 'Paramètres'], ['manches', 'Manches'], ['questions', 'Questions'], ['baremes', 'Barèmes'],
  ['participants', 'Participants'], ['suivi', 'Suivi'], ['signalements', 'Signalements'], ['emails', 'Emails'], ['pdf', 'PDF corrections'], ['journal', 'Journal'],
] as const;
type Tab = (typeof TABS)[number][0];

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(iso)) : '—');
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)} %` : '—');

/** Tableau de bord d'un tournoi (§15) avec statut explicite, onglets par domaine. */
export default async function TournamentAdminPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ onglet?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { onglet } = await searchParams;
  const tab: Tab = (TABS.some(([k]) => k === onglet) ? onglet : 'parametres') as Tab;
  const t = await getTournament(id);
  if (!t) notFound();
  const snap = await loadTournamentSnapshot(t);
  const integrity = integrityCheck(snap);
  const db = arenaDb();

  const [participants, attempts, standings, templatesRes, reportsRes, emailsRes, logRes] = await Promise.all([
    listParticipants(t.id),
    listAttemptsForRounds(snap.rounds.map((r) => r.id)),
    computeTournamentStandings(snap),
    db.from('arena_bareme_templates').select('*').order('name'),
    db.from('arena_reports').select('*').in('question_id', [...snap.questionsByRound.values()].flat().map((q) => q.id).concat(['00000000-0000-0000-0000-000000000000'])),
    db.from('arena_emails').select('*').eq('tournament_id', t.id).order('sent_at', { ascending: false }).limit(300),
    db.from('arena_log').select('*').eq('tournament_id', t.id).order('created_at', { ascending: false }).limit(300),
  ]);

  const confirmed = participants.filter((p) => p.email_confirmed_at && !p.anonymized_at);
  const hasAttempts: Record<string, boolean> = {};
  const questionCounts: Record<string, number> = {};
  for (const r of snap.rounds) {
    hasAttempts[r.id] = attempts.some((a) => a.round_id === r.id);
    questionCounts[r.id] = (snap.questionsByRound.get(r.id) ?? []).filter((q) => !q.neutralized_at).length;
  }

  /* KPI (§4, §15.4) */
  const playedBy = (roundId: string) => new Set(attempts.filter((a) => a.round_id === roundId && a.status !== 'in_progress').map((a) => a.participant_id as string));
  const kpiRounds = snap.rounds.map((r) => {
    const started = attempts.filter((a) => a.round_id === r.id);
    const done = started.filter((a) => a.status !== 'in_progress');
    return { number: r.number, started: started.length, done: done.length, completion: pct(done.length, started.length), truncated: done.filter((a) => a.truncated).length };
  });
  const retention = (a: number, b: number) => {
    const ra = snap.rounds.find((r) => r.number === a);
    const rb = snap.rounds.find((r) => r.number === b);
    if (!ra || !rb) return '—';
    const pa = playedBy(ra.id);
    const pb = playedBy(rb.id);
    let both = 0;
    for (const p of pa) if (pb.has(p)) both++;
    return pct(both, pa.size);
  };
  const sources = new Map<string, number>();
  for (const p of participants) sources.set(p.acquisition_source ?? 'direct', (sources.get(p.acquisition_source ?? 'direct') ?? 0) + 1);

  /* Vues */
  const participantViews: ParticipantView[] = participants.map((p) => {
    const st = standings.standings.find((s) => s.participantId === p.id);
    return {
      id: p.id, pseudo: p.pseudo, first_name: p.first_name, last_name: p.last_name, email: p.email, specialty: p.specialty,
      confirmed: Boolean(p.email_confirmed_at), marketing: p.consent_marketing && !p.marketing_unsubscribed_at, blocked: Boolean(p.blocked_at), anonymized: Boolean(p.anonymized_at),
      source: p.acquisition_source, invited: Boolean(p.invited_by), created_at: p.created_at, last_login_at: p.last_login_at,
      rounds: snap.rounds.map((r) => { const a = attempts.find((x) => x.round_id === r.id && x.participant_id === p.id); return { number: r.number, attemptId: a?.id ?? null, status: a?.status ?? null, score: a ? Number(a.score ?? 0) : null, truncated: a?.truncated ?? false }; }),
      totalScore: st?.totalScore ?? 0, rank: st?.rank ?? null,
    };
  });

  const reports = (reportsRes.data ?? []) as ReportRow[];
  const countByQ = new Map<string, number>();
  for (const r of reports) countByQ.set(r.question_id, (countByQ.get(r.question_id) ?? 0) + 1);
  const reportViews: ReportView[] = reports.map((r) => {
    const round = snap.rounds.find((x) => (snap.questionsByRound.get(x.id) ?? []).some((q) => q.id === r.question_id));
    const qs = round ? snap.questionsByRound.get(round.id) ?? [] : [];
    const qi = qs.findIndex((q) => q.id === r.question_id);
    const q = qs[qi];
    return {
      id: r.id, questionId: r.question_id, roundNumber: round?.number ?? 0, questionIndex: qi + 1, enonce: q?.enonce ?? '',
      pseudo: participants.find((p) => p.id === r.participant_id)?.pseudo ?? '?', motif: r.motif, comment: r.comment, reference: r.reference,
      status: r.status, admin_response: r.admin_response, created_at: r.created_at, countForQuestion: countByQ.get(r.question_id) ?? 1, neutralized: Boolean(q?.neutralized_at),
    };
  });
  const emailLog: EmailLogView[] = ((emailsRes.data ?? []) as { id: string; kind: string; subject: string | null; to_email: string; sent_at: string; resend_id: string | null; error: string | null; round_id: string | null }[]).map((e) => ({
    id: e.id, kind: e.kind, subject: e.subject, to: e.to_email, sent_at: e.sent_at, ok: Boolean(e.resend_id) && !e.error, error: e.error, roundNumber: snap.rounds.find((r) => r.id === e.round_id)?.number ?? null,
  }));
  const templates = (templatesRes.data ?? []) as BaremeTemplateRow[];
  const log = (logRes.data ?? []) as { id: string; created_at: string; actor_label: string | null; kind: string; details: string | null; round_id: string | null }[];
  const allQrpNs = qrpNs([...snap.questionsByRound.values()].flat());

  /* Tableau de bord (maquette 15) */
  const byDay = new Map<string, number>();
  for (const p of [...participants].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(p.created_at));
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  let cumul = 0;
  const registrationsByDay = [...byDay.entries()].map(([day, n]) => ({ day, total: (cumul += n) }));
  const dashboard: DashboardData = {
    status: STATUS_LABEL[snap.status], openRound: snap.openRound, registered: participants.length, confirmed: confirmed.length,
    rounds: snap.rounds.map((r) => { const k = kpiRounds.find((x) => x.number === r.number)!; return { number: r.number, theme: r.theme, done: k.done, started: k.started, state: roundState(r) }; }),
    retention: [{ label: 'M1 → M2', value: retention(1, 2) }, { label: 'M2 → M3', value: retention(2, 3) }, { label: 'M1 → M3', value: retention(1, 3) }],
    registrationsByDay,
    top: standings.standings.filter((x) => x.rank !== null).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)).slice(0, 5).map((x) => ({ rank: x.rank as number, pseudo: participants.find((p) => p.id === x.participantId)?.pseudo ?? '?', total: x.totalScore })),
    eligible: standings.standings.filter((x) => x.rank !== null).length,
    marketing: participants.filter((p) => p.consent_marketing && !p.marketing_unsubscribed_at).length,
    reportsOpen: reportViews.filter((r) => r.status === 'open').length,
    leaderboardHref: `/arena/${t.slug}/classement`,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs"><Link href="/admin/arena" className="text-(--color-ink-soft) hover:underline">EVC Arena</Link> / {t.title}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-(--color-ink)">{t.title} <span className="ml-2 rounded-full bg-(--color-surface-sunken) px-2.5 py-1 text-xs font-bold">{STATUS_LABEL[snap.status]}{snap.openRound ? ` (M${snap.openRound})` : ''}</span></h1>
            <p className="text-sm text-(--color-ink-soft)">{t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''} · <Link href={`/arena/${t.slug}`} target="_blank" className="text-(--color-primary) hover:underline">/arena/{t.slug} ↗</Link>{!integrity.ok && <span className="ml-2 font-semibold text-(--color-danger)">· intégrité à corriger</span>}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span><b>{participants.length}</b> inscrits</span>
            <span><b>{confirmed.length}</b> confirmés ({pct(confirmed.length, participants.length)})</span>
            {kpiRounds.map((k) => <span key={k.number}><b>{k.done}</b> M{k.number}</span>)}
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-1">
          {TABS.map(([k, label]) => (
            <Link key={k} href={`/admin/arena/${t.id}?onglet=${k}`} className={`rounded-(--radius-button) px-3 py-1.5 text-sm font-semibold ${tab === k ? 'bg-(--color-primary) text-white' : 'text-(--color-ink-soft) hover:bg-(--color-surface-sunken)'}`}>
              {label}{k === 'signalements' && reportViews.some((r) => r.status === 'open') ? ` (${reportViews.filter((r) => r.status === 'open').length})` : ''}
            </Link>
          ))}
        </nav>
      </header>

      <ArenaDashboard d={dashboard} />

      {tab === 'parametres' && <SettingsForm t={t} integrity={integrity} effectiveStatus={snap.status} />}

      {tab === 'manches' && <RoundsEditor t={t} rounds={snap.rounds} slug={t.slug} questionCounts={questionCounts} hasAttempts={hasAttempts} />}

      {tab === 'questions' && (
        <div className="space-y-6">
          {snap.rounds.map((r) => (
            <QuestionsManager key={r.id} round={r} questions={snap.questionsByRound.get(r.id) ?? []} expected={t.questions_per_round} started={hasAttempts[r.id]} specialtyId={t.specialty_id} />
          ))}
        </div>
      )}

      {tab === 'baremes' && <BaremeEditor tournamentId={t.id} initial={t.bareme} templates={templates} rounds={snap.rounds} qrpNs={allQrpNs} />}

      {tab === 'participants' && <ParticipantsTable tournamentId={t.id} rows={participantViews} />}

      {tab === 'suivi' && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
            <h2 className="text-base font-bold">Entonnoir</h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt>Inscriptions</dt><dd className="font-semibold">{participants.length}</dd></div>
              <div className="flex justify-between"><dt>Emails confirmés</dt><dd className="font-semibold">{confirmed.length} ({pct(confirmed.length, participants.length)})</dd></div>
              {kpiRounds.map((k) => <div key={k.number} className="flex justify-between"><dt>Manche {k.number} : jouée / démarrée</dt><dd className="font-semibold">{k.done} / {k.started} (complétion {k.completion}{k.truncated ? `, ${k.truncated} tronquée(s)` : ''})</dd></div>)}
              <div className="flex justify-between"><dt>Rétention M1 → M2</dt><dd className="font-semibold">{retention(1, 2)}</dd></div>
              <div className="flex justify-between"><dt>Rétention M2 → M3</dt><dd className="font-semibold">{retention(2, 3)}</dd></div>
              <div className="flex justify-between"><dt>Rétention M1 → M3</dt><dd className="font-semibold">{retention(1, 3)}</dd></div>
              <div className="flex justify-between"><dt>Éligibles au classement (seuil)</dt><dd className="font-semibold">{standings.standings.filter((s) => s.rank !== null).length}</dd></div>
              <div className="flex justify-between"><dt>Consentement marketing (case 2)</dt><dd className="font-semibold">{participants.filter((p) => p.consent_marketing && !p.marketing_unsubscribed_at).length}</dd></div>
            </dl>
          </section>
          <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
            <h2 className="text-base font-bold">Sources d’acquisition</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {[...sources.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => <li key={s} className="flex justify-between"><span>{s}</span><b>{n}</b></li>)}
            </ul>
            <p className="mt-4 text-xs text-(--color-ink-muted)">Taux d’ouverture / clic des emails : non disponibles (Resend n’expose pas ces événements sans webhook).</p>
          </section>
        </div>
      )}

      {tab === 'signalements' && <ReportsPanel reports={reportViews} />}

      {tab === 'emails' && <EmailsPanel tournamentId={t.id} sequence={t.email_sequence} rounds={snap.rounds.map((r) => ({ number: r.number, theme: r.theme }))} log={emailLog} />}

      {tab === 'pdf' && <PdfPanel rounds={snap.rounds} />}

      {tab === 'journal' && (
        <section className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
          <table className="w-full text-sm">
            <thead className="bg-(--color-surface-soft) text-left text-xs uppercase tracking-wide text-(--color-ink-muted)"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Acteur</th><th className="px-3 py-2">Événement</th><th className="px-3 py-2">Détails</th></tr></thead>
            <tbody>
              {log.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-(--color-ink-soft)">Journal vide.</td></tr>}
              {log.map((l) => (
                <tr key={l.id} className="border-t border-(--color-border)">
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{fmt(l.created_at)}</td>
                  <td className="px-3 py-2 text-xs">{l.actor_label ?? '—'}</td>
                  <td className="px-3 py-2 text-xs font-semibold">{l.kind}{l.round_id ? ` · M${snap.rounds.find((r) => r.id === l.round_id)?.number ?? '?'}` : ''}</td>
                  <td className="px-3 py-2 text-xs">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
