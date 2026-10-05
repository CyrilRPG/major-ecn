'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, CheckCircle2, Clock, Flag, LayoutGrid, Loader2, Lock, LogOut, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RichText } from '@/components/qcm/rich-text';
import { RichTextZoom, ZoomableImage } from '@/components/qcm/image-zoom';
import { abandonAction, alertShownAction, finishAction, lockDossierAction, presentedAction, saveAnswerAction, toggleMarkAction } from '@/app/(student)/checkup/actions';
import type { RunnerQuestion, RunnerView } from '@/lib/checkup/server/service';
import { TEXTS } from '@/lib/checkup/types';
import { cn } from '@/lib/utils';

type Answer = { selected?: string[]; text?: string };
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function fmtClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

const isAnswered = (q: RunnerQuestion, a: Answer | undefined) => q.type === 'QROC' ? !!a?.text && a.text.trim().length > 0 : (a?.selected?.length ?? 0) > 0;

/**
 * Passation d'un EVC Check-up (§11, §12, §27 à §30) :
 *  - question X/Y et temps restant toujours visibles (barre fixe) ;
 *  - chronomètre côté serveur : le compte à rebours se recale sur l'heure du
 *    serveur ; à 00:00 les réponses enregistrées sont soumises ;
 *  - chaque réponse est enregistrée à la volée (nouvelle tentative en cas
 *    d'échec réseau) ;
 *  - questions indépendantes : retour en arrière et modification permis,
 *    « Marquer à revoir » ; dossier progressif : « Valider et continuer »
 *    verrouille la question, la suivante est alors révélée ;
 *  - fin anticipée (temps restant, sans réponse, marquées) et abandon
 *    distinct, chacun confirmé.
 */
export function CheckupRunner({ view }: { view: RunnerView }) {
  const router = useRouter();
  const questions = view.questions;
  const total = questions.length;
  // Décalage horloge locale → serveur, mesuré une fois (le décalage d'horloge ne varie pas en cours d'épreuve).
  const [offset] = useState(() => Date.parse(view.serverNow) - Date.now());
  const deadline = Date.parse(view.deadlineAt);
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.round((deadline - (now + offset)) / 1000));
  const firstOpen = Math.max(0, questions.findIndex((q) => !q.hidden && !isAnswered(q, q.answer ?? undefined) && !q.locked));
  const [index, setIndex] = useState(firstOpen);
  const [answers, setAnswers] = useState<Record<number, Answer>>(() => Object.fromEntries(questions.map((q) => [q.position, q.answer ?? {}])));
  const [marked, setMarked] = useState<Record<number, boolean>>(() => Object.fromEntries(questions.map((q) => [q.position, q.marked])));
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [showNav, setShowNav] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [busy, setBusy] = useState<null | 'finish' | 'abandon' | 'lock'>(null);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<number | null>(null);
  const shownAlerts = useRef(new Set<number>());
  const pending = useRef(new Map<number, Answer>());
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const presented = useRef(new Set<number>());
  const presentedQueue = useRef(new Set<number>());
  const finishing = useRef(false);
  const finishRef = useRef<(reason: 'submitted' | 'expired') => Promise<void>>(async () => undefined);
  const q = questions[Math.min(index, total - 1)];

  // Les props évoluent après « Valider et continuer » (question suivante révélée) :
  // les réponses du serveur complètent l'état local sans écraser une saisie en cours.
  useEffect(() => {
    setAnswers((cur) => {
      const next = { ...cur };
      for (const x of questions) if (!pending.current.has(x.position) && x.answer && !cur[x.position]?.selected?.length && !cur[x.position]?.text) next[x.position] = x.answer;
      return next;
    });
  }, [questions]);

  // Horloge : une seconde de résolution, recalée sur l'heure du serveur. À 00:00,
  // soumission automatique des réponses enregistrées (§27) — y compris au retour
  // d'un onglet resté en arrière-plan.
  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (deadline - (t + offset) <= 0) void finishRef.current('expired');
    };
    const iv = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', tick); };
  }, [deadline, offset]);

  const flushAnswer = useCallback(async (position: number) => {
    const a = pending.current.get(position);
    if (!a) return;
    setSaveState('saving');
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await saveAnswerAction(view.id, position, a);
      if (r.ok) {
        if (pending.current.get(position) === a) pending.current.delete(position);
        setSaveState('saved');
        return;
      }
      if (r.code === 'expire' || r.code === 'verrouille' || r.code === 'autre_appareil') { setError(r.error); setSaveState('error'); if (r.code === 'expire') router.refresh(); return; }
      await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
    }
    setSaveState('error');
  }, [view.id, router]);

  const flushAll = useCallback(async () => {
    for (const t of timers.current.values()) clearTimeout(t);
    timers.current.clear();
    await Promise.all(Array.from(pending.current.keys()).map((p) => flushAnswer(p)));
  }, [flushAnswer]);

  const setAnswer = (position: number, a: Answer, delay: number) => {
    setAnswers((cur) => ({ ...cur, [position]: a }));
    pending.current.set(position, a);
    const prev = timers.current.get(position);
    if (prev) clearTimeout(prev);
    timers.current.set(position, setTimeout(() => { timers.current.delete(position); void flushAnswer(position); }, delay));
  };

  // Fin du temps : soumission automatique des réponses enregistrées (§27).
  const finish = useCallback(async (reason: 'submitted' | 'expired') => {
    if (finishing.current) return;
    finishing.current = true;
    setBusy('finish');
    await flushAll();
    const r = await finishAction(view.id, reason);
    if (!r.ok) { finishing.current = false; setBusy(null); setError(r.error); return; }
    router.replace(r.status === 'pending_self_review' ? `/checkup/${view.id}/correction` : `/checkup/${view.id}/resultat`);
  }, [flushAll, router, view.id]);

  useEffect(() => { finishRef.current = finish; }, [finish]);

  // Alertes de temps restant : 30 / 10 / 5 min (60 min) ; 60 / 30 / 10 / 5 (120 min).
  useEffect(() => {
    const due = view.alerts.filter((m) => remaining > 0 && remaining <= m * 60 && remaining > m * 60 - 90 && !shownAlerts.current.has(m));
    if (due.length === 0) return;
    const m = Math.min(...due);
    for (const d of due) shownAlerts.current.add(d);
    setAlert(m);
    void alertShownAction(view.id, m);
    const t = setTimeout(() => setAlert((cur) => (cur === m ? null : cur)), 12_000);
    return () => clearTimeout(t);
  }, [remaining, view.alerts, view.id]);

  // Question affichée → « déjà vue » (anti-répétition), envoyée par lots.
  useEffect(() => {
    if (!q || q.hidden || presented.current.has(q.position)) return;
    presented.current.add(q.position);
    presentedQueue.current.add(q.position);
    const t = setTimeout(() => {
      const list = Array.from(presentedQueue.current);
      presentedQueue.current.clear();
      if (list.length > 0) void presentedAction(view.id, list);
    }, 1500);
    return () => clearTimeout(t);
  }, [q, view.id]);

  // Sauvegarde avant de quitter la page (le chronomètre continue de toute façon).
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') void flushAll(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [flushAll]);

  if (!q) return null;
  const a = answers[q.position] ?? {};
  const answeredCount = questions.filter((x) => isAnswered(x, answers[x.position])).length;
  const unanswered = total - answeredCount;
  const markedCount = Object.values(marked).filter(Boolean).length;
  const readOnly = q.locked;
  const nextInDossier = q.dossierId ? questions.find((x) => x.dossierId === q.dossierId && x.questionOrder === (q.questionOrder ?? 0) + 1) : undefined;
  const canGo = (i: number) => i >= 0 && i < total && !questions[i].hidden;
  const go = (i: number) => { if (canGo(i)) { setIndex(i); setShowNav(false); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const low = remaining <= 300;

  const toggleLetter = (lettre: string) => {
    if (readOnly) return;
    const cur = new Set(a.selected ?? []);
    if (q.type === 'QRU') { setAnswer(q.position, { selected: cur.has(lettre) ? [] : [lettre] }, 0); return; }
    if (cur.has(lettre)) cur.delete(lettre); else cur.add(lettre);
    setAnswer(q.position, { selected: Array.from(cur).sort() }, 0);
  };

  const lockAndContinue = async () => {
    setBusy('lock');
    setError(null);
    await flushAll();
    const r = await lockDossierAction(view.id, q.position);
    setBusy(null);
    if (!r.ok) { setError(r.error); return; }
    router.refresh();
    if (nextInDossier) setIndex(questions.indexOf(nextInDossier));
  };

  const doAbandon = async () => {
    setBusy('abandon');
    const r = await abandonAction(view.id);
    if (!r.ok) { setBusy(null); setError(r.error); setConfirmAbandon(false); return; }
    router.replace('/checkup');
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-28 sm:px-6">
      {/* Barre fixe : question X/Y et temps restant toujours visibles (§29). */}
      <div className="sticky top-0 z-20 -mx-3 border-b border-(--color-border) bg-(--color-surface)/95 px-3 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">{view.specialite} · {view.scopeLabel}</p>
            <p className="text-sm font-bold text-(--color-ink)">
              {view.blocks ? `Bloc ${q.block} / ${view.blocks} · ` : ''}Question {index + 1} / {total}
            </p>
          </div>
          <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-base font-bold tabular-nums', low ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200' : 'bg-(--color-surface-soft) text-(--color-ink)')}
            role="timer" aria-label={`Temps restant ${fmtClock(remaining)}`} suppressHydrationWarning>
            <Clock className="h-4 w-4" aria-hidden /><span suppressHydrationWarning>{fmtClock(remaining)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowNav((v) => !v)} aria-expanded={showNav} aria-label="Toutes les questions"><LayoutGrid /> <span className="hidden sm:inline">Questions</span></Button>
          <Button size="sm" onClick={() => setConfirmFinish(true)} disabled={busy !== null}><Flag /> <span className="hidden sm:inline">Terminer</span></Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-(--color-ink-muted)">
          <span>{answeredCount} répondue{answeredCount > 1 ? 's' : ''} · {markedCount} à revoir · {unanswered} sans réponse</span>
          <span aria-live="polite" className="flex items-center gap-1">
            {saveState === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" /> Enregistrement…</>}
            {saveState === 'saved' && <><Save className="h-3 w-3" /> Enregistré</>}
            {saveState === 'error' && <span className="text-(--color-danger)">Réponse non enregistrée — vérifiez votre connexion</span>}
          </span>
        </div>
        {alert !== null && (
          <div role="alert" className="mt-2 flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
            <AlertTriangle className="h-4 w-4 shrink-0" /> Plus que {alert >= 60 ? `${alert / 60} heure` : `${alert} minutes`}.
            <button type="button" className="ml-auto rounded p-1 hover:bg-black/5" onClick={() => setAlert(null)} aria-label="Fermer l’alerte"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}
        {showNav && (
          <nav aria-label="Navigation entre les questions" className="mt-2 max-h-[45vh] overflow-y-auto rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
              {questions.map((x, i) => {
                const ans = isAnswered(x, answers[x.position]);
                return (
                  <button key={x.position} type="button" onClick={() => go(i)} disabled={x.hidden}
                    aria-label={`Question ${i + 1}${ans ? ', répondue' : ', sans réponse'}${marked[x.position] ? ', à revoir' : ''}${x.locked ? ', validée' : ''}${x.hidden ? ', pas encore révélée' : ''}`}
                    className={cn('relative flex h-9 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition',
                      i === index && 'ring-2 ring-(--color-primary) ring-offset-1',
                      x.hidden ? 'cursor-not-allowed border-dashed border-(--color-border) text-(--color-ink-muted)/50'
                        : ans ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) text-(--color-ink) hover:border-(--color-primary)')}>
                    {i + 1}
                    {marked[x.position] && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden />}
                    {x.locked && <Lock className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-(--color-surface) text-(--color-ink-soft)" aria-hidden />}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-(--color-ink-muted)">
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded bg-(--color-primary) align-middle" />répondue</span>
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-500 align-middle" />à revoir</span>
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded border border-(--color-border) align-middle" />non répondue</span>
              <span><Lock className="mr-1 inline h-3 w-3" />validée (dossier)</span>
            </p>
          </nav>
        )}
      </div>

      <article className="mt-4 space-y-4" aria-labelledby={`q-${q.position}`}>
        {q.dossierId && (
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-primary)">Dossier progressif · question {q.questionOrder} / {q.dossierSize}</p>
            {q.vignette && (
              <RichTextZoom><div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--color-ink)"><RichText html={q.vignette} /></div></RichTextZoom>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold text-(--color-ink-muted)">{q.type === 'QRU' ? 'QRU · une seule réponse' : q.type === 'QRM' ? 'QRM · une ou plusieurs réponses' : 'QROC · réponse rédigée'}</p>
            {!readOnly && (
              <button type="button" onClick={async () => { const v = !marked[q.position]; setMarked((m) => ({ ...m, [q.position]: v })); const r = await toggleMarkAction(view.id, q.position, v); if (!r.ok) setError(r.error); }}
                aria-pressed={!!marked[q.position]}
                className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition', marked[q.position] ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200' : 'border-(--color-border) text-(--color-ink-soft) hover:border-amber-500')}>
                {marked[q.position] ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />} {TEXTS.markReview}
              </button>
            )}
          </div>
          <RichTextZoom>
            <h2 id={`q-${q.position}`} className="mt-2 whitespace-pre-line text-[15px] font-medium leading-relaxed text-(--color-ink)"><RichText html={q.enonce ?? ''} /></h2>
          </RichTextZoom>
          {q.images.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{q.images.map((src) => <ZoomableImage key={src} src={src} className="h-40 w-40 sm:h-52 sm:w-52" sizes="208px" />)}</div>}

          {q.type === 'QROC' ? (
            <div className="mt-4">
              <label htmlFor={`rep-${q.position}`} className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Votre réponse</label>
              <textarea id={`rep-${q.position}`} value={a.text ?? ''} readOnly={readOnly} maxLength={5000} rows={5}
                onChange={(e) => setAnswer(q.position, { text: e.target.value }, 700)}
                className="mt-1 w-full rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-sm leading-relaxed text-(--color-ink) focus-ring read-only:bg-(--color-surface-soft)"
                placeholder="Rédigez votre réponse…" />
            </div>
          ) : (
            <div className="mt-4 space-y-2" role={q.type === 'QRU' ? 'radiogroup' : 'group'} aria-label="Propositions">
              {q.items.map((it) => {
                const on = (a.selected ?? []).includes(it.lettre);
                return (
                  <button key={it.lettre} type="button" disabled={readOnly} onClick={() => toggleLetter(it.lettre)}
                    role={q.type === 'QRU' ? 'radio' : 'checkbox'} aria-checked={on}
                    className={cn('flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left transition focus-ring',
                      on ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) bg-(--color-surface) hover:border-(--color-primary)/40',
                      readOnly && 'cursor-default opacity-90')}>
                    {/* La lettre reste visible une fois cochée : la correction s'y réfère. */}
                    <span className={cn('relative flex h-7 w-7 shrink-0 items-center justify-center font-mono text-sm font-semibold', q.type === 'QRU' ? 'rounded-full' : 'rounded-lg',
                      on ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft)')}>
                      {it.lettre}
                      {on && <Check className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-(--color-primary) shadow" aria-hidden />}
                    </span>
                    <span className="flex-1 text-sm leading-snug text-(--color-ink)">
                      <RichTextZoom><RichText html={it.enonce} /></RichTextZoom>
                      {it.images.length > 0 && <span className="mt-2 flex flex-wrap gap-2">{it.images.map((src) => <ZoomableImage key={src} src={src} className="h-28 w-28" sizes="112px" />)}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {readOnly && <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-(--color-ink-soft)"><Lock className="h-3.5 w-3.5" /> Question validée : relecture possible, modification impossible.</p>}
        </div>
        {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
      </article>

      {/* Navigation basse */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-(--color-border) bg-(--color-surface)/95 px-3 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <Button variant="outline" onClick={() => go(index - 1)} disabled={!canGo(index - 1) || busy !== null} aria-label="Question précédente"><ArrowLeft /> <span className="hidden sm:inline">Précédente</span></Button>
          <button type="button" onClick={() => setConfirmAbandon(true)} className="hidden items-center gap-1 px-2 text-xs text-(--color-ink-muted) underline-offset-4 hover:underline sm:inline-flex"><LogOut className="h-3.5 w-3.5" /> Abandonner</button>
          <div className="flex-1" />
          {q.dossierId && nextInDossier && !q.locked ? (
            <Button onClick={lockAndContinue} disabled={busy !== null}>{busy === 'lock' ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider et continuer</Button>
          ) : index < total - 1 ? (
            <Button onClick={() => go(index + 1)} disabled={!canGo(index + 1) || busy !== null}>Suivante <ArrowRight /></Button>
          ) : (
            <Button onClick={() => setConfirmFinish(true)} disabled={busy !== null}><Flag /> Terminer</Button>
          )}
        </div>
        <button type="button" onClick={() => setConfirmAbandon(true)} className="mx-auto mt-1 flex items-center gap-1 text-[11px] text-(--color-ink-muted) underline-offset-4 hover:underline sm:hidden"><LogOut className="h-3 w-3" /> Abandonner le Check-up</button>
      </div>

      {/* Fin anticipée (§30) */}
      <Dialog open={confirmFinish} onOpenChange={(v) => busy === null && setConfirmFinish(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminer votre Check-up ?</DialogTitle>
            <DialogDescription>Après validation, plus aucune modification n’est possible.</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-(--color-surface-soft) p-3"><dt className="text-[11px] text-(--color-ink-muted)">Temps restant</dt><dd className="mt-1 font-mono text-lg font-bold text-(--color-ink)">{fmtClock(remaining)}</dd></div>
            <div className="rounded-xl bg-(--color-surface-soft) p-3"><dt className="text-[11px] text-(--color-ink-muted)">Sans réponse</dt><dd className="mt-1 text-lg font-bold text-(--color-ink)">{unanswered}</dd></div>
            <div className="rounded-xl bg-(--color-surface-soft) p-3"><dt className="text-[11px] text-(--color-ink-muted)">À revoir</dt><dd className="mt-1 text-lg font-bold text-(--color-ink)">{markedCount}</dd></div>
          </dl>
          {unanswered > 0 && <p className="text-xs text-(--color-ink-soft)">Une question sans réponse vaut 0 point.</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmFinish(false)} disabled={busy !== null}>{TEXTS.backToEval}</Button>
            <Button onClick={() => finish('submitted')} disabled={busy !== null}>{busy === 'finish' ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} {TEXTS.validate}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Abandon (§31) : action distincte, confirmée */}
      <Dialog open={confirmAbandon} onOpenChange={(v) => busy === null && setConfirmAbandon(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abandonner ce Check-up ?</DialogTitle>
            <DialogDescription>
              Aucun score ne sera calculé et ce Check-up n’apparaîtra pas dans votre progression. Les questions déjà affichées seront considérées comme vues.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAbandon(false)} disabled={busy !== null}>{TEXTS.backToEval}</Button>
            <Button variant="danger" onClick={doAbandon} disabled={busy !== null}>{busy === 'abandon' ? <Loader2 className="animate-spin" /> : <LogOut />} Abandonner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
