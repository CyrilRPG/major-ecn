'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Eye, Layers, Loader2, MinusCircle, PlayCircle, XCircle } from 'lucide-react';
import { QcmItem } from '@/components/qcm/qcm-item';
import { RichText } from '@/components/qcm/rich-text';
import { RichTextZoom, ZoomableImage } from '@/components/qcm/image-zoom';
import { VariantesAcceptees } from '@/components/qcm/variantes-acceptees';
import { reponseModele } from '@/lib/qcm/grade';
import { cn } from '@/lib/utils';
import type { ActivityCard } from '@/lib/plan/pages';
import type { RunnerCorrection, RunnerSession } from '@/lib/plan/runner';
import {
  answerRunnerAction, answerWorkedHintAction, checkpointActivityAction, openRunnerAction, startActivityAction,
} from '@/app/(student)/planificateur/actions';
import { planSerif } from '../fonts';
import { fmtMinutes } from '../today/activity-card';
import { Btn, CancelDialog, ErrorText, PostponeDialog } from '../today/dialogs';

const RESULT_UI = {
  // Vert standard : dans le thème de la plateforme, emerald-* et teal-* sont redéfinis en rouge (globals.css).
  positive: { label: 'Correct', Icon: CheckCircle2, cls: 'text-green-700 dark:text-green-400' },
  partial: { label: 'Partiel', Icon: MinusCircle, cls: 'text-amber-700 dark:text-amber-300' },
  incorrect: { label: 'À revoir', Icon: XCircle, cls: 'text-red-700 dark:text-red-300' },
} as const;

/**
 * Une activité du planning. Récupération active d'abord (§15) pour les
 * activités à questions ; étude de la fiche puis cartes mémoire pour une
 * acquisition ; coaching du Parcours du Major. La réalisation se mesure en
 * unités validées (question soumise, carte auto-évaluée), jamais au temps passé.
 */
export function ActivityView({ a, today, unknownItem, parcoursHref }: { a: ActivityCard; today: string; unknownItem: boolean; parcoursHref: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<RunnerSession | null>(null);
  const [postpone, setPostpone] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [hintAnswered, setHintAnswered] = useState(!!a.workedHint);
  const open = ['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS', 'PARTIALLY_COMPLETED'].includes(a.status);
  const future = a.day > today;
  const needsHint = a.type === 'DIAGNOSTIC' && unknownItem && !hintAnswered && open;

  const launch = () => start(async () => {
    setError(null);
    const s = await startActivityAction(a.id);
    if (!s.ok) { setError(s.error); return; }
    if (a.runnable) {
      const r = await openRunnerAction(a.id);
      if (!r.ok) { setError(r.error); return; }
      setSession(r.session);
    } else router.refresh();
  });
  const checkpoint = () => start(async () => {
    setError(null);
    const r = await checkpointActivityAction(a.id, null);
    if (!r.ok) { setError(r.error); return; }
    router.refresh();
  });
  const hint = (h: 'YES' | 'NO' | 'UNSURE') => start(async () => {
    setError(null);
    const r = await answerWorkedHintAction(a.id, h);
    if (!r.ok) { setError(r.error); return; }
    setHintAnswered(true);
    if (r.cancelled) router.push('/planificateur');
  });

  const title = a.itemNames.length > 1 ? a.itemNames.join(' · ') : a.itemName ?? a.coaching?.title ?? a.typeLabel;
  return (
    <div className="mt-[18px] space-y-[16px]">
      <Link href="/planificateur" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-(--pl-bordeaux) hover:underline"><ArrowLeft className="h-4 w-4" />Mon planning</Link>
      <header className="pl-card px-[22px] py-[18px]">
        <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-(--pl-bordeaux)">{a.blockLabel}{a.badges.length > 0 ? ` · ${a.badges.map((b) => b.label).join(' · ')}` : ''}</p>
        <h1 className={cn(planSerif.className, 'mt-1 text-[26px] font-bold leading-tight text-(--pl-ink)')}>{title}</h1>
        {a.domainLabel && <p className="text-[14px] text-(--pl-muted)">{a.domainLabel}</p>}
        <p className="mt-2 text-[15px] leading-relaxed text-(--pl-text)">{a.reason}</p>
        <p className="mt-2 text-[14px] text-(--pl-muted)">{fmtMinutes(a.minutes)}{a.unitLabel ? ` · ${a.unitLabel}` : ''}{a.validatedUnits > 0 ? ` · ${a.validatedUnits} déjà faite${a.validatedUnits > 1 ? 's' : ''}` : ''} · {a.statusLabel}</p>
        {open && !session && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn onClick={() => setPostpone(true)}>Reporter</Btn>
            <Btn onClick={() => setCancel(true)}>Retirer du planning</Btn>
          </div>
        )}
      </header>
      <ErrorText error={error} />

      {needsHint && (
        <section className="pl-card px-[22px] py-[18px]">
          <h2 className={cn(planSerif.className, 'text-[19px] font-bold text-(--pl-ink)')}>Avez-vous déjà travaillé cet item ?</h2>
          <p className="mt-1 text-[14.5px] text-(--pl-text)">Votre réponse évite un test inutile : si vous ne l’avez jamais travaillé, il sera directement programmé en acquisition.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn primary pending={pending} onClick={() => hint('YES')}>Oui</Btn>
            <Btn pending={pending} onClick={() => hint('NO')}>Non</Btn>
            <Btn pending={pending} onClick={() => hint('UNSURE')}>Je ne sais plus</Btn>
          </div>
        </section>
      )}

      {!needsHint && open && a.runnable && !session && (
        <section className="pl-card flex flex-wrap items-center justify-between gap-3 px-[22px] py-[18px]">
          <p className="text-[15px] text-(--pl-text)">{a.type === 'ERROR_REVIEW' ? 'Reprenez vos questions ratées : répondez d’abord, la correction s’affiche ensuite.' : a.type === 'EXAM_PRACTICE' ? 'Entraînement au format de l’épreuve : le dossier complet, dans l’ordre.' : 'Récupération active : répondez sans support, la correction s’affiche après chaque réponse.'}</p>
          <Btn primary pending={pending} onClick={launch}>{a.validatedUnits > 0 ? 'Reprendre' : future ? 'Commencer maintenant' : 'Commencer'}</Btn>
        </section>
      )}
      {session && <Runner session={session} onDone={() => router.push('/planificateur')} />}

      {open && a.type === 'LEARN' && a.coursId && (
        <section className="pl-card space-y-3 px-[22px] py-[18px]">
          <h2 className={cn(planSerif.className, 'text-[19px] font-bold text-(--pl-ink)')}>Votre acquisition</h2>
          <Step n={1} icon={<BookOpen className="h-5 w-5" />} title="Étudiez la fiche de l’item" done={!!a.checkpointAt}>
            <Link href={`/cours/${a.coursId}/fiche`} onClick={() => { if (!a.startedAt) void startActivityAction(a.id); }} className="font-semibold text-(--pl-bordeaux) underline">Ouvrir la fiche</Link>
            {!a.checkpointAt && <span className="ml-3"><Btn pending={pending} onClick={checkpoint}>J’ai étudié la fiche</Btn></span>}
          </Step>
          {a.measurable && (
            <Step n={2} icon={<Layers className="h-5 w-5" />} title={`Faites les cartes mémoire (${a.unitLabel})`} done={!!a.plannedUnits && a.validatedUnits >= a.plannedUnits}>
              <Link href={`/cours/${a.coursId}/flashcards`} onClick={() => { if (!a.startedAt) void startActivityAction(a.id); }} className="font-semibold text-(--pl-bordeaux) underline">Ouvrir les cartes</Link>
              <span className="ml-2 text-[13.5px] text-(--pl-muted)">Chaque carte auto-évaluée compte ; elles sont comptées ici à votre retour.</span>
            </Step>
          )}
        </section>
      )}

      {open && (a.type === 'METHODOLOGY' || (a.coaching && !a.runnable && a.type !== 'LEARN')) && (
        <section className="pl-card space-y-3 px-[22px] py-[18px]">
          <h2 className={cn(planSerif.className, 'text-[19px] font-bold text-(--pl-ink)')}>Parcours du Major</h2>
          <p className="text-[14.5px] text-(--pl-text)">{a.coaching?.title}. Seule la partie évaluative réalisée compte : regarder ou lire le coaching ne modifie pas votre niveau.</p>
          <div className="flex flex-wrap gap-2">
            {parcoursHref && <Link href={parcoursHref} onClick={() => { if (!a.startedAt) void startActivityAction(a.id); }} className="inline-flex h-[42px] items-center gap-1.5 rounded-full bg-(--pl-pill) px-[18px] text-[14.5px] font-semibold text-white"><PlayCircle className="h-4 w-4" />Ouvrir le coaching</Link>}
            {!a.measurable && <Btn pending={pending} onClick={checkpoint}>J’ai terminé ce coaching</Btn>}
          </div>
        </section>
      )}

      {open && !a.runnable && a.type !== 'LEARN' && a.type !== 'METHODOLOGY' && !a.coaching && (
        <section className="pl-card flex flex-wrap items-center justify-between gap-3 px-[22px] py-[18px]">
          <p className="text-[14.5px] text-(--pl-text)">{a.coursId ? 'Aucune question n’est disponible pour votre voie sur cet item : étudiez la fiche, puis validez l’activité.' : 'Validez l’activité lorsque vous l’avez réalisée.'}</p>
          <div className="flex gap-2">
            {a.coursId && <Link href={`/cours/${a.coursId}/fiche`} className="inline-flex h-[42px] items-center rounded-full border border-(--pl-pill) px-[18px] text-[14.5px] font-semibold text-(--pl-pill)">Ouvrir la fiche</Link>}
            <Btn primary pending={pending} onClick={checkpoint}>J’ai terminé</Btn>
          </div>
        </section>
      )}

      {!open && (
        <section className="pl-card px-[22px] py-[18px]">
          <p className="text-[15px] text-(--pl-text)">{a.status === 'COMPLETED' ? 'Activité terminée : vos résultats ont été transmis et votre planning a été mis à jour.' : `Cette activité est ${a.statusLabel.toLowerCase()}.`}</p>
          <Link href="/planificateur" className="mt-2 inline-flex items-center gap-1 font-semibold text-(--pl-bordeaux) underline">Retour à mon planning<ArrowRight className="h-4 w-4" /></Link>
        </section>
      )}

      <PostponeDialog open={postpone} onOpenChange={setPostpone} activities={[a]} today={today} />
      <CancelDialog open={cancel} onOpenChange={setCancel} activity={a} />
    </div>
  );
}

function Step({ n, icon, title, done, children }: { n: number; icon: React.ReactNode; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-[12px] bg-(--pl-rose-50) px-4 py-3">
      <span className={cn('grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full', done ? 'bg-(--pl-green-bg) text-(--pl-green)' : 'bg-(--pl-card) text-(--pl-bordeaux)')}>{done ? <CheckCircle2 className="h-5 w-5" /> : icon}</span>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-(--pl-ink)">{n}. {title}</p>
        <div className="mt-1 flex flex-wrap items-center text-[14px]">{children}</div>
      </div>
    </div>
  );
}

/** Une question à la fois, correction après validation, unités et signaux enregistrés côté serveur. */
function Runner({ session, onDone }: { session: RunnerSession; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [correction, setCorrection] = useState<RunnerCorrection | null>(null);
  const [qroc, setQroc] = useState<RunnerCorrection | null>(null);
  const [progress, setProgress] = useState({ validated: session.validated, planned: session.planned, completed: false });
  const [results, setResults] = useState<RunnerCorrection['result'][]>([]);
  const [finished, setFinished] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const q = session.questions[index];
  const isLast = index === session.questions.length - 1;
  const submit = (extra: { selfGrade?: 'correct' | 'partial' | 'incorrect' } = {}) => start(async () => {
    setError(null);
    const r = await answerRunnerAction(session.token, q.id, q.format === 'qroc' ? { text, ...extra } : { selected });
    if (!r.ok) { setError(r.error); return; }
    if (r.correction.pendingSelfGrade) { setQroc(r.correction); return; }
    setCorrection(r.correction);
    setResults((cur) => [...cur, r.correction.result]);
    setProgress({ validated: r.correction.validated, planned: r.correction.planned, completed: r.correction.completed });
  });
  const next = () => {
    if (isLast || progress.completed) { setFinished(true); return; }
    setIndex((i) => i + 1);
    setSelected([]); setText(''); setCorrection(null); setQroc(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (finished) {
    const pos = results.filter((r) => r === 'positive').length;
    const part = results.filter((r) => r === 'partial').length;
    return (
      <section className="pl-card px-[22px] py-[20px]">
        <CheckCircle2 className="h-8 w-8 text-(--pl-green)" />
        <h2 className={cn(planSerif.className, 'mt-2 text-[21px] font-bold text-(--pl-ink)')}>{progress.completed ? 'Activité terminée' : 'Série terminée'}</h2>
        <p className="mt-1 text-[14.5px] text-(--pl-text)">{pos} correcte{pos > 1 ? 's' : ''} · {part} partielle{part > 1 ? 's' : ''} · {results.length - pos - part} à revoir — {progress.validated}/{progress.planned} questions prévues réalisées. Vos résultats mettent à jour vos priorités ; la réalisation et la maîtrise sont mesurées séparément.</p>
        <div className="mt-3"><Btn primary onClick={onDone}>Retour à mon planning</Btn></div>
      </section>
    );
  }
  const revealed = !!correction;
  const truth = new Map((correction?.items ?? []).map((i) => [i.lettre, i]));
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-[14px]">
        <span className="font-semibold text-(--pl-ink)">Question {index + 1} / {session.questions.length}</span>
        <span className="truncate pl-3 text-[13px] text-(--pl-muted)">{q.itemName} · {progress.validated}/{progress.planned} réalisées</span>
      </div>
      <div className="h-[6px] overflow-hidden rounded-full bg-(--pl-rose-100)" aria-hidden><div className="h-full bg-(--pl-crimson)" style={{ width: `${Math.min(100, (progress.validated / Math.max(1, progress.planned)) * 100)}%` }} /></div>
      {q.vignette && (
        <div className="rounded-[14px] border border-(--pl-card-border) bg-(--pl-info) p-4">
          {q.dossier && <p className="text-[11px] font-bold uppercase tracking-wide text-(--pl-bordeaux)">Dossier · question {q.dossier.position} / {q.dossier.total}</p>}
          <RichTextZoom><div className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-(--pl-ink)"><RichText html={q.vignette} /></div></RichTextZoom>
        </div>
      )}
      <div className="pl-card p-4 sm:p-5">
        <RichTextZoom><p className="whitespace-pre-line text-[15px] font-medium leading-relaxed text-(--pl-ink)"><RichText html={q.enonce} /></p></RichTextZoom>
        {q.images.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{q.images.map((src) => <ZoomableImage key={src} src={src} className="h-40 w-40" sizes="160px" />)}</div>}
        {q.format === 'qcm' ? (
          <div className="mt-4 space-y-2">
            {q.items.map((it) => {
              const t = truth.get(it.lettre);
              const on = selected.includes(it.lettre);
              return (
                <QcmItem key={it.lettre} item={{ id: it.lettre, lettre: it.lettre, enonce: it.enonce, justification: t?.justification ?? null, images: it.images }}
                  selected={on} disabled={revealed || pending} isCorrect={t ? t.is_correct : null} outcome={revealed ? (t && t.is_correct === on ? 'correct' : 'wrong') : null}
                  onToggle={() => setSelected((cur) => (cur.includes(it.lettre) ? cur.filter((x) => x !== it.lettre) : [...cur, it.lettre].sort()))} />
              );
            })}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <textarea value={text} onChange={(e) => setText(e.target.value)} readOnly={!!qroc} rows={4} maxLength={5000} aria-label="Votre réponse" placeholder="Rédigez votre réponse…"
              className="w-full rounded-[12px] border border-(--pl-card-border) bg-(--pl-card) p-3 text-[14.5px] text-(--pl-ink) read-only:bg-(--pl-info)" />
            {qroc && (
              <div className="rounded-[12px] border border-green-600/30 bg-green-50/60 p-3 dark:bg-green-900/15">
                <p className="text-[11px] font-bold uppercase text-green-700 dark:text-green-400">Correction Major ECN</p>
                {qroc.reponseAttendue && <p className="mt-1 text-[14px] font-semibold text-(--pl-ink)">{reponseModele(qroc.reponseAttendue)}</p>}
                {qroc.reponseAttendue && <VariantesAcceptees reponseAttendue={qroc.reponseAttendue} className="mt-0.5 text-xs text-(--pl-muted)" />}
                {qroc.correction && <RichTextZoom><div className="mt-2 whitespace-pre-line text-[14px] text-(--pl-text)"><RichText html={qroc.correction} /></div></RichTextZoom>}
              </div>
            )}
          </div>
        )}
        {revealed && correction && q.format === 'qcm' && correction.correction && <RichTextZoom><div className="mt-3 whitespace-pre-line rounded-[10px] bg-(--pl-info) p-3 text-[13px] text-(--pl-text)"><RichText html={correction.correction} /></div></RichTextZoom>}
        {revealed && correction && (
          <p className={cn('mt-3 flex items-center gap-1.5 text-[14px] font-semibold', RESULT_UI[correction.result].cls)}>
            {(() => { const R = RESULT_UI[correction.result]; return <><R.Icon className="h-4 w-4" /> {R.label}</>; })()}
          </p>
        )}
      </div>
      <ErrorText error={error} />
      <div className="flex flex-wrap justify-end gap-2">
        {q.format === 'qcm' && !revealed && <Btn primary pending={pending} disabled={selected.length === 0} onClick={() => submit()}><CheckCircle2 className="h-4 w-4" />Valider</Btn>}
        {q.format === 'qroc' && !qroc && !revealed && <Btn primary pending={pending} disabled={text.trim().length === 0} onClick={() => submit()}><Eye className="h-4 w-4" />Voir la correction</Btn>}
        {q.format === 'qroc' && qroc && !revealed && (
          <div className="flex flex-wrap justify-end gap-2" role="group" aria-label="Votre auto-correction">
            <Btn pending={pending} onClick={() => submit({ selfGrade: 'incorrect' })}><XCircle className="h-4 w-4" />Incorrecte</Btn>
            <Btn pending={pending} onClick={() => submit({ selfGrade: 'partial' })}><MinusCircle className="h-4 w-4" />Partielle</Btn>
            <Btn primary pending={pending} onClick={() => submit({ selfGrade: 'correct' })}><CheckCircle2 className="h-4 w-4" />Correcte</Btn>
          </div>
        )}
        {revealed && <Btn primary pending={pending} onClick={next}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{isLast || progress.completed ? 'Terminer' : 'Question suivante'}</Btn>}
      </div>
    </section>
  );
}
