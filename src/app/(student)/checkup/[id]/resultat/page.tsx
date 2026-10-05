import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Info, MinusCircle, Target, XCircle } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { CHECKUP_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { CheckupError, resultView } from '@/lib/checkup/server/service';
import { candidateContext } from '@/lib/moteur/server/candidate';
import { synthesis, type Subscore } from '@/lib/checkup/results';
import { fmtPoints } from '@/lib/checkup/scoring';
import { FORMAT_LABEL, STATUS_LABEL, TEXTS } from '@/lib/checkup/types';
import { reponseModele } from '@/lib/qcm/grade';
import { RichText } from '@/components/qcm/rich-text';
import { RichTextZoom } from '@/components/qcm/image-zoom';
import { ResultActions } from '@/components/student/checkup/result-actions';
import { fmtDateTime } from '@/lib/suivi/format';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Résultat — EVC Check-up' };
export const dynamic = 'force-dynamic';

function minutes(sec: number | null): string {
  if (!sec) return '—';
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
}

const RESULT_UI = {
  correct: { label: 'Correct', Icon: CheckCircle2, cls: 'text-emerald-700 dark:text-emerald-300' },
  partial: { label: 'À consolider', Icon: MinusCircle, cls: 'text-amber-700 dark:text-amber-300' },
  incorrect: { label: 'À revoir', Icon: XCircle, cls: 'text-red-700 dark:text-red-300' },
} as const;

function SubscoreList({ title, rows }: { title: string; rows: Subscore[] }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-(--color-ink)">{title}</h3>
      <ul className="mt-2 space-y-2">
        {rows.map((r) => {
          const pct = r.possible > 0 ? Math.round((r.obtained / r.possible) * 100) : 0;
          return (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="min-w-0 truncate text-(--color-ink)">{r.label}</span>
                <span className="shrink-0 tabular-nums font-semibold text-(--color-ink)">{r.display}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-(--color-border)" aria-hidden>
                <div className={cn('h-full rounded-full', pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Résultat (§22, §23, §35) : pourcentage global, temps et synthèse ; analyse
 * par domaine ; items à revoir et à consolider ; plan de reprise immédiat.
 * Jamais le mot « échec », aucune prédiction de réussite, aucune moyenne.
 * Abandon et incident technique : aucun score affiché (§31, §32).
 */
export default async function CheckupResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = await requireUser();
  if (!moteurOuvert(profile, CHECKUP_STUDENT_ENABLED)) redirect('/accueil');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  let view;
  try { view = await resultView(user.id, id); } catch (e) { if (e instanceof CheckupError) notFound(); throw e; }
  const s = view.session;
  if (s.status === 'active') redirect(`/checkup/${id}`);
  if (s.status === 'pending_self_review') redirect(`/checkup/${id}/correction`);
  const back = <Link href="/checkup" className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) underline-offset-4 hover:underline"><ArrowLeft className="h-4 w-4" /> EVC Check-up</Link>;

  if (s.status === 'abandoned' || s.status === 'cancelled_technical') {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-4 px-3 py-8 sm:px-6">
        {back}
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-(--color-ink-muted)" />
          <h1 className="mt-3 text-xl font-bold text-(--color-ink)">{STATUS_LABEL[s.status]}</h1>
          <p className="mt-2 text-sm text-(--color-ink-soft)">
            {s.status === 'abandoned'
              ? 'Ce Check-up a été abandonné : aucun score n’est calculé et il n’entre pas dans votre progression.'
              : 'Ce Check-up a été neutralisé par l’équipe suite à un incident technique : il n’est pas pris en compte. Vous pouvez en lancer un nouveau.'}
          </p>
          <Link href="/checkup" className="mt-5 inline-flex h-10 items-center rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-semibold text-white">Lancer un nouveau Check-up</Link>
        </div>
      </main>
    );
  }

  const a = view.analysis;
  const ctx = await candidateContext(user.id);
  const lacunes = a ? [...a.aRevoir, ...a.aConsolider].map((i) => i.itemId) : [];
  const percent = Math.round(Number(s.score_percent ?? 0));

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-3 py-5 sm:px-6">
      {back}
      <section className="grid gap-4 rounded-2xl bg-[#0B0F14] p-5 text-white sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
        <div className="flex items-center justify-center">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full" style={{ background: `conic-gradient(#E4002B ${percent * 3.6}deg, rgba(255,255,255,0.12) 0deg)` }} role="img" aria-label={`Score global ${percent} %`}>
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0B0F14]">
              <span className="text-4xl font-bold tabular-nums">{percent}<span className="text-xl">%</span></span>
              <span className="text-xs text-white/70">{fmtPoints(Number(s.points_obtained ?? 0))} / {s.points_possible} pts</span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FCA5A5]">{TEXTS.name} · {view.specialiteName}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Votre résultat</h1>
          <p className="mt-1 text-sm text-white/80">{s.mode === 'global' ? 'Check-up global' : 'Check-up ciblé'} · {FORMAT_LABEL[s.format]} · {fmtDateTime(s.started_at)}</p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/85">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {minutes(s.duration_seconds)}{s.ended_reason === 'expired' ? ' (temps écoulé)' : ''}</span>
            {a && <span className="inline-flex items-center gap-1.5"><Target className="h-4 w-4" /> {a.items.length} item{a.items.length > 1 ? 's' : ''} évalué{a.items.length > 1 ? 's' : ''}</span>}
          </p>
          {a && <p className="mt-3 text-sm leading-relaxed text-white">{synthesis(a)}</p>}
        </div>
      </section>

      {a && (
        <>
          <section aria-labelledby="plan-reprise" className="rounded-2xl border border-(--color-primary)/30 bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-6">
            <h2 id="plan-reprise" className="text-base font-bold text-(--color-ink)">Votre plan de reprise</h2>
            <p className="mt-1 text-sm text-(--color-ink-soft)">Les items à revoir et à consolider entrent automatiquement dans vos révisions (J+7, J+14, J+30, J+60) et dans « Mes priorités ».</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([['À revoir en priorité', a.aRevoir, 'border-red-200 dark:border-red-900/40', 'text-red-700 dark:text-red-300'], ['À consolider', a.aConsolider, 'border-amber-200 dark:border-amber-900/40', 'text-amber-700 dark:text-amber-300'], ['Signaux positifs', a.positifs, 'border-emerald-200 dark:border-emerald-900/40', 'text-emerald-700 dark:text-emerald-300']] as const).map(([title, list, border, tone]) => (
                <div key={title} className={cn('rounded-xl border p-3', border)}>
                  <h3 className={cn('text-sm font-bold', tone)}>{title} <span className="font-normal text-(--color-ink-muted)">({list.length})</span></h3>
                  {list.length === 0 ? <p className="mt-2 text-xs text-(--color-ink-muted)">Aucun item.</p> : (
                    <ul className="mt-2 space-y-1.5">
                      {list.slice(0, 12).map((i) => (
                        <li key={i.itemId} className="text-sm">
                          <Link href={`/mes-priorites/${i.itemId}`} className="text-(--color-ink) underline-offset-4 hover:underline">{i.itemName}</Link>
                          <span className="ml-1 text-xs text-(--color-ink-muted)">{i.correct > 0 ? `${i.correct}✓ ` : ''}{i.partial > 0 ? `${i.partial}½ ` : ''}{i.incorrect > 0 ? `${i.incorrect}✗` : ''}{i.selfAssessed ? ' · auto-évalué' : ''}</span>
                        </li>
                      ))}
                      {list.length > 12 && <li className="text-xs text-(--color-ink-muted)">… et {list.length - 12} autre(s)</li>}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-(--color-ink-muted)"><Info className="mt-px h-3.5 w-3.5 shrink-0" /> Une bonne réponse unique ne suffit pas à déclarer un item maîtrisé : la maîtrise se confirme sur plusieurs résultats espacés dans le temps.</p>
            <div className="mt-4"><ResultActions sessionId={id} lacuneItemIds={lacunes} plannerActive={!!ctx?.plannerActive} /></div>
          </section>

          <section className="grid gap-6 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-6 md:grid-cols-2">
            <SubscoreList title={a.byDomain.some((d) => !d.key.startsWith('item:')) ? 'Par domaine' : 'Par item'} rows={a.byDomain} />
            <div className="space-y-6">
              <SubscoreList title="Par dossier" rows={a.byBlock} />
              <SubscoreList title="Par origine des questions" rows={a.bySource} />
              {a.withoutItem > 0 && <p className="text-xs text-(--color-ink-muted)">{a.withoutItem} question{a.withoutItem > 1 ? 's' : ''} sans item rattaché : comptée{a.withoutItem > 1 ? 's' : ''} dans le score, sans diagnostic d’item.</p>}
              {(a.notDisplayed ?? 0) > 0 && <p className="text-xs text-(--color-ink-muted)">{a.notDisplayed} question{(a.notDisplayed ?? 0) > 1 ? 's' : ''} non affichée{(a.notDisplayed ?? 0) > 1 ? 's' : ''} avant la fin : 0 point dans le score, mais aucun diagnostic sur {(a.notDisplayed ?? 0) > 1 ? 'leurs items' : 'son item'}.</p>}
            </div>
          </section>
        </>
      )}

      <section aria-labelledby="correction" className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-6">
        <h2 id="correction" className="text-base font-bold text-(--color-ink)">Correction détaillée</h2>
        <ol className="mt-3 space-y-2">
          {view.questions.map((q, k) => {
            const r = q.result ? RESULT_UI[q.result] : null;
            const sel = new Set(q.answer?.selected ?? []);
            return (
              <li key={q.position}>
                <details className="group rounded-xl border border-(--color-border)">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-sm">
                    <span className="w-8 shrink-0 font-mono text-xs text-(--color-ink-muted)">{k + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-(--color-ink)">{q.snapshot.item_name ?? q.snapshot.serie_label ?? 'Question'}</span>
                    <span className="shrink-0 text-xs text-(--color-ink-muted)">{q.question_type}</span>
                    {r && <span className={cn('inline-flex shrink-0 items-center gap-1 text-xs font-semibold', r.cls)}><r.Icon className="h-3.5 w-3.5" /> {fmtPoints(Number(q.points ?? 0))}</span>}
                  </summary>
                  <div className="space-y-3 border-t border-(--color-border) px-3 py-3 text-sm">
                    {q.dossier_id && q.snapshot.vignette && q.question_order === 1 && <RichTextZoom><div className="whitespace-pre-line rounded-lg bg-(--color-surface-soft) p-3 text-(--color-ink-soft)"><RichText html={q.snapshot.vignette} /></div></RichTextZoom>}
                    <RichTextZoom><p className="whitespace-pre-line font-medium text-(--color-ink)"><RichText html={q.snapshot.enonce} /></p></RichTextZoom>
                    {q.question_type === 'QROC' ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="rounded-lg border border-(--color-border) p-2.5"><p className="text-[11px] font-bold uppercase text-(--color-ink-muted)">Votre réponse</p><p className="mt-1 whitespace-pre-wrap text-(--color-ink)">{q.answer?.text?.trim() ? q.answer.text : '— (vide : 0 point)'}</p>{q.self_grade && <p className="mt-1 text-xs text-(--color-ink-muted)">Auto-correction : {q.self_grade === 'correct' ? 'correcte' : q.self_grade === 'partial' ? 'partielle' : 'incorrecte'}</p>}</div>
                        <div className="rounded-lg border border-emerald-600/30 p-2.5"><p className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Correction</p>{q.snapshot.reponse_attendue && <p className="mt-1 font-semibold text-(--color-ink)">{reponseModele(q.snapshot.reponse_attendue)}</p>}{q.snapshot.correction_generale && <RichTextZoom><div className="mt-1 whitespace-pre-line text-(--color-ink-soft)"><RichText html={q.snapshot.correction_generale} /></div></RichTextZoom>}</div>
                      </div>
                    ) : (
                      <ul className="space-y-1.5">
                        {q.snapshot.items.map((it) => {
                          const picked = sel.has(it.lettre);
                          return (
                            <li key={it.lettre} className={cn('rounded-lg border px-3 py-2', it.is_correct ? 'border-emerald-600/50 bg-emerald-50/50 dark:bg-emerald-900/10' : picked ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10' : 'border-(--color-border)')}>
                              <p className="flex items-start gap-2">
                                <span className="font-mono text-xs font-bold text-(--color-ink-soft)">{it.lettre}</span>
                                <span className="flex-1 text-(--color-ink)"><RichText html={it.enonce} /></span>
                                <span className="shrink-0 text-[11px] font-semibold">{it.is_correct ? <span className="text-emerald-700 dark:text-emerald-300">Vrai</span> : <span className="text-(--color-ink-muted)">Faux</span>}{picked ? <span className="ml-1 text-(--color-ink)">· coché</span> : ''}</span>
                              </p>
                              {it.justification && <RichTextZoom><div className="mt-1 whitespace-pre-line pl-5 text-xs text-(--color-ink-soft)"><RichText html={it.justification} /></div></RichTextZoom>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {q.question_type !== 'QROC' && q.snapshot.correction_generale && <RichTextZoom><div className="whitespace-pre-line rounded-lg bg-(--color-surface-soft) p-3 text-xs text-(--color-ink-soft)"><RichText html={q.snapshot.correction_generale} /></div></RichTextZoom>}
                    {q.discordances !== null && q.question_type === 'QRM' && <p className="text-xs text-(--color-ink-muted)">{q.discordances} discordance{q.discordances > 1 ? 's' : ''} · barème EVC : 0 → 1 · 1 → 0,5 · 2 → 0,2 · 3 et plus → 0</p>}
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </section>
      <p className="text-center text-xs text-(--color-ink-muted)">{TEXTS.finalPrinciple}</p>
    </main>
  );
}
