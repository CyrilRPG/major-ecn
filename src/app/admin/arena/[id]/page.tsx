import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-role';
import { integrityCheck } from '@/lib/arena/admin';
import { arenaDb, computeTournamentStandings, getTournament, listAttemptsForRounds, listParticipants, loadTournamentSnapshot } from '@/lib/arena/db';
import { STATUS_LABEL } from '@/lib/arena/time';
import { qrpNs, questionIssues, type ReportRow } from '@/lib/arena/types';
import { SettingsForm } from '@/components/admin/arena/settings-form';
import { RoundsEditor } from '@/components/admin/arena/rounds-editor';
import { QuestionsManager } from '@/components/admin/arena/questions-manager';
import { BaremeEditor, type BaremeTemplateRow } from '@/components/admin/arena/bareme-editor';
import { ParticipantsTable, type ParticipantView } from '@/components/admin/arena/participants-table';
import { ReportsPanel, type ReportView } from '@/components/admin/arena/reports-panel';
import { EmailsPanel, type EmailLogView } from '@/components/admin/arena/emails-panel';
import { PdfPanel } from '@/components/admin/arena/pdf-panel';
import { ArenaDashboard, type DashboardData } from '@/components/admin/arena/dashboard';
import { ArenaAdminShell, type StepDef, type TabDef } from '@/components/admin/arena/admin-shell';
import { ArenaCard } from '@/components/admin/arena/admin-ui';
import { roundState } from '@/lib/arena/time';
import { GENERAL_RANKING_NOTICE } from '@/lib/arena/format';

export const dynamic = 'force-dynamic';

/** Étapes du parcours guidé (liens vers les onglets) puis onglets d'exploitation. */
const STEP_TABS = [
  ['parametres', 'Paramètres'], ['manches', 'Manches'], ['questions', 'Questions'], ['corriges', 'Corrigés'], ['publication', 'Publication'],
] as const;
const OTHER_TABS = [
  ['baremes', 'Barèmes'], ['participants', 'Participants'], ['suivi', 'Suivi'], ['signalements', 'Signalements'], ['emails', 'Emails'], ['journal', 'Journal'],
] as const;
type Tab = (typeof STEP_TABS)[number][0] | (typeof OTHER_TABS)[number][0];
/** Anciens noms d'onglet encore acceptés. */
const TAB_ALIAS: Record<string, Tab> = { pdf: 'corriges' };

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(iso)) : '—');
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)} %` : '—');

/** Tableau de bord d'un tournoi (§15) : parcours guidé de préparation, onglets d'exploitation. */
export default async function TournamentAdminPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ onglet?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { onglet } = await searchParams;
  const wanted = onglet ? TAB_ALIAS[onglet] ?? onglet : 'parametres';
  const tab: Tab = ([...STEP_TABS, ...OTHER_TABS].some(([k]) => k === wanted) ? wanted : 'parametres') as Tab;
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

  /* Provenance « IA » des questions copiées depuis la banque : celles dont la
     série source a été publiée par l'outil d'import d'exercices. */
  let aiSourceIds: string[] = [];
  if (tab === 'questions') {
    const sourceIds = [...snap.questionsByRound.values()].flat().map((q) => q.source_question_id).filter((x): x is string => Boolean(x));
    if (sourceIds.length) {
      const [{ data: srcQs }, { data: pubs }] = await Promise.all([
        db.from('qcm_questions').select('id, serie_id').in('id', sourceIds),
        db.from('exercise_imports').select('published_serie_id').eq('status', 'published').not('published_serie_id', 'is', null),
      ]);
      const aiSeries = new Set(((pubs ?? []) as { published_serie_id: string }[]).map((p) => p.published_serie_id));
      aiSourceIds = ((srcQs ?? []) as { id: string; serie_id: string }[]).filter((q) => aiSeries.has(q.serie_id)).map((q) => q.id);
    }
  }

  /* Parcours guidé : état de chaque étape, calculé côté serveur. */
  const slugOk = /^[a-z0-9-]{3,60}$/.test(t.slug);
  const paramsOk = Boolean(t.title.trim() && t.specialty.trim() && slugOk);
  const datedRounds = snap.rounds.filter((r) => r.opens_at && r.closes_at).length;
  const roundsOk = snap.rounds.length === 3 && datedRounds === 3;
  const perRound = snap.rounds.map((r) => {
    const qs = (snap.questionsByRound.get(r.id) ?? []).filter((q) => !q.neutralized_at);
    return { number: r.number, count: qs.length, ok: qs.length === t.questions_per_round && qs.every((q) => questionIssues(q).length === 0) };
  });
  const questionsOk = snap.rounds.length > 0 && perRound.every((r) => r.ok);
  const pdfCount = snap.rounds.filter((r) => r.corrections_pdf_path).length;
  const pdfOk = snap.rounds.length > 0 && pdfCount === snap.rounds.length;
  const publishedOk = t.status !== 'draft';
  const doneFlags: Record<(typeof STEP_TABS)[number][0], boolean> = { parametres: paramsOk, manches: roundsOk, questions: questionsOk, corriges: pdfOk, publication: publishedOk };
  const subLabels: Record<(typeof STEP_TABS)[number][0], string> = {
    parametres: paramsOk ? `${t.specialty} · /arena/${t.slug}` : [!t.title.trim() && 'titre', !t.specialty.trim() && 'spécialité', !slugOk && 'URL'].filter(Boolean).join(', ') + ' à corriger',
    manches: snap.rounds.length !== 3 ? `${snap.rounds.length} manche(s) sur 3` : datedRounds === 3 ? '3 manches datées' : `${datedRounds} manche${datedRounds > 1 ? 's' : ''} datée${datedRounds > 1 ? 's' : ''} sur 3`,
    questions: perRound.length ? perRound.map((r) => `M${r.number} ${r.count}/${t.questions_per_round}`).join(' · ') : 'aucune manche',
    corriges: `${pdfCount} corrigé${pdfCount > 1 ? 's' : ''} sur ${snap.rounds.length}`,
    publication: STATUS_LABEL[snap.status] + (snap.openRound ? ` (M${snap.openRound})` : ''),
  };
  const firstTodo = STEP_TABS.find(([k]) => !doneFlags[k])?.[0] ?? null;
  const steps: StepDef[] = STEP_TABS.map(([k, label]) => ({
    key: k, label, sub: subLabels[k], href: `/admin/arena/${t.id}?onglet=${k}`, active: tab === k,
    state: doneFlags[k] ? 'done' : k === firstTodo ? 'current' : 'todo',
  }));
  const openReports = ((reportsRes.data ?? []) as ReportRow[]).filter((r) => r.status === 'open').length;
  const tabs: TabDef[] = OTHER_TABS.map(([k, label]) => ({ key: k, label, href: `/admin/arena/${t.id}?onglet=${k}`, active: tab === k, badge: k === 'signalements' ? openReports : undefined }));

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
      rounds: snap.rounds.map((r) => { const a = attempts.find((x) => x.round_id === r.id && x.participant_id === p.id); return { number: r.number, attemptId: a?.id ?? null, status: a?.status ?? null, score: a ? Number(a.score ?? 0) : null, truncated: a?.truncated ?? false, rank: standings.byRound[r.id]?.standings.find(s => s.participantId === p.id)?.rank ?? null, effectifManche: standings.byRound[r.id]?.effectifManche ?? 0 }; }),
      totalScore: st?.totalScore ?? 0, rank: st?.rank ?? null,
      effectifGeneral: standings.effectifGeneral, reason: st?.reason ?? null, isFinal: standings.isFinal,
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

  /* Le tableau de bord (inscriptions, participation) n'a de sens qu'une fois le tournoi visible du public. */
  const showDashboard = t.status !== 'draft' || participants.length > 0;

  return (
    <ArenaAdminShell
      title={t.title}
      eyebrow="Tournoi"
      breadcrumb={[{ href: '/admin/arena', label: 'EVC Arena' }]}
      subtitle={<>{t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''} · <span className="font-mono text-xs">/arena/{t.slug}</span></>}
      status={{ key: snap.status, label: `${STATUS_LABEL[snap.status]}${snap.openRound ? ` · M${snap.openRound}` : ''}` }}
      landingHref={`/arena/${t.slug}`}
      notice={!integrity.ok && t.status === 'draft' ? 'Intégrité à corriger avant la programmation — détail dans l’onglet Paramètres.' : !integrity.ok ? 'Intégrité à corriger.' : undefined}
      stats={[
        { label: 'Inscrits', value: participants.length },
        { label: 'Confirmés', value: `${confirmed.length}` },
        ...snap.rounds.map((r) => ({ label: `Effectif M${r.number}`, value: standings.byRound[r.id]?.effectifManche ?? 0 })),
        { label: 'Général', value: standings.effectifGeneral },
      ]}
      steps={steps}
      tabs={tabs}
    >
      {standings.isFinal && <p className="mb-4 text-xs text-(--color-ink-muted)">{GENERAL_RANKING_NOTICE}</p>}
      {showDashboard && <ArenaDashboard d={dashboard} />}

      {tab === 'parametres' && <SettingsForm t={t} integrity={integrity} effectiveStatus={snap.status} />}

      {tab === 'manches' && <RoundsEditor t={t} rounds={snap.rounds} slug={t.slug} questionCounts={questionCounts} hasAttempts={hasAttempts} />}

      {tab === 'questions' && (
        <div className="space-y-6">
          {snap.rounds.map((r) => (
            <QuestionsManager key={r.id} round={r} questions={snap.questionsByRound.get(r.id) ?? []} expected={t.questions_per_round} started={hasAttempts[r.id]} specialtyId={t.specialty_id} defaultSeconds={t.seconds_per_question} aiSourceIds={aiSourceIds} />
          ))}
        </div>
      )}

      {tab === 'corriges' && <PdfPanel rounds={snap.rounds} questionCounts={questionCounts} />}

      {tab === 'publication' && (
        <ArenaCard number="5" title="Publication" description="Le passage Brouillon → Programmé exige un contrôle d'intégrité complet ; les transitions se font dans l'onglet Paramètres.">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEP_TABS.filter(([k]) => k !== 'publication').map(([k, label]) => (
              <li key={k} className={`rounded-(--radius-button) border p-3 ${doneFlags[k] ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
                <p className="text-sm font-bold text-(--color-ink)">{doneFlags[k] ? '✓' : '○'} {label}</p>
                <p className="mt-0.5 text-xs text-(--color-ink-soft)">{subLabels[k]}</p>
                <Link href={`/admin/arena/${t.id}?onglet=${k}`} className="mt-2 inline-block text-xs font-semibold text-(--color-primary) underline-offset-4 hover:underline">Ouvrir →</Link>
              </li>
            ))}
          </ol>
          {integrity.problems.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-(--color-danger)">{integrity.problems.map((p) => <li key={p}>{p}</li>)}</ul>
          )}
          {integrity.perRound.some((r) => r.issues.length) && (
            <div className="mt-3 space-y-2 text-sm">
              {integrity.perRound.filter((r) => r.issues.length).map((r) => (
                <div key={r.number}><p className="font-semibold text-(--color-ink)">Manche {r.number}</p><ul className="list-disc pl-5 text-(--color-danger)">{r.issues.slice(0, 8).map((i) => <li key={i}>{i}</li>)}{r.issues.length > 8 && <li className="text-(--color-ink-muted)">… et {r.issues.length - 8} autre(s)</li>}</ul></div>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-sm text-(--color-ink)">Statut actuel : <b>{STATUS_LABEL[snap.status]}</b>{integrity.ok && t.status === 'draft' ? ' — prêt à être programmé.' : ''}</p>
            <Link href={`/admin/arena/${t.id}?onglet=parametres`} className="rounded-(--radius-button) bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white">Gérer le statut dans Paramètres</Link>
          </div>
        </ArenaCard>
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
    </ArenaAdminShell>
  );
}
