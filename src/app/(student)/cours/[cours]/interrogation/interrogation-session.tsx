'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award, ArrowRight, Check, CheckCircle2, Eraser, FileText, Loader2,
  Play, Trophy, X,
} from 'lucide-react';
import { saveInterrogationResult, saveSignature } from './actions';

export type IQuestion = {
  id: string;
  enonce: string;
  items: { id: string; lettre: string; enonce: string; is_correct: boolean }[];
};

type Phase = 'intro' | 'quiz' | 'score' | 'sign' | 'done';

export function InterrogationSession({
  coursId, coursTitre, questions, previousScore, previousTotal, alreadySigned,
  firstName, lastName,
}: {
  coursId: string;
  coursTitre: string;
  questions: IQuestion[];
  previousScore: number | null;
  previousTotal: number | null;
  alreadySigned: boolean;
  firstName: string;
  lastName: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(alreadySigned ? 'done' : 'intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Set<string>>>(new Map());
  const [score, setScore] = useState(previousScore ?? 0);
  const [pending, start] = useTransition();
  const total = questions.length;

  const q = questions[index];
  const sel = answers.get(q?.id ?? '') ?? new Set<string>();

  const toggle = (letter: string) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      const s = new Set(next.get(q.id) ?? []);
      if (s.has(letter)) s.delete(letter); else s.add(letter);
      next.set(q.id, s);
      return next;
    });
  };

  const computeScore = () => {
    let ok = 0;
    for (const qq of questions) {
      const userPick = answers.get(qq.id) ?? new Set();
      const correct = new Set(qq.items.filter((it) => it.is_correct).map((it) => it.lettre));
      const exact = userPick.size === correct.size && [...userPick].every((l) => correct.has(l));
      if (exact) ok++;
    }
    return ok;
  };

  const next = () => {
    if (index < total - 1) setIndex((i) => i + 1);
    else {
      const s = computeScore();
      setScore(s);
      setPhase('score');
      start(async () => {
        await saveInterrogationResult({ cours_id: coursId, score: s, total });
      });
    }
  };

  /* ============ INTRO ============ */
  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white">
          <Award className="h-8 w-8" />
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FFE4E8] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#E4002B]">
          Étape obligatoire
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-(--color-ink)">
          Interrogation — {coursTitre}
        </h1>
        <p className="mt-3 text-(--color-ink-soft)">
          Vous avez terminé l&rsquo;ensemble des contenus de ce parcours. L&rsquo;interrogation
          finale est désormais <strong className="text-(--color-ink)">obligatoire</strong> et doit
          être réalisée du début à la fin avant de pouvoir reprendre les autres cours.
        </p>
        <ul className="mx-auto mt-6 inline-flex flex-col gap-2 text-left text-sm text-(--color-ink)">
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#16A34A]" /> {total} questions QCM tirées du cours</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#16A34A]" /> Signature électronique du certificat à la fin</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#16A34A]" /> Certificat PDF téléchargeable une fois signé</li>
        </ul>
        <p className="mx-auto mt-6 max-w-md text-xs text-(--color-ink-muted)">
          ⚠️ Tant que l&rsquo;interrogation n&rsquo;est pas signée, la plateforme reste verrouillée
          sur cette page. Prenez le temps qu&rsquo;il faut pour la finaliser sereinement.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => setPhase('quiz')}
            disabled={total === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-6 py-3 text-sm font-bold text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)] hover:scale-[1.02] disabled:opacity-60"
          >
            <Play className="h-4 w-4" /> Commencer l&rsquo;interrogation
          </button>
        </div>
        {total === 0 && (
          <p className="mt-4 text-xs text-(--color-danger)">
            Aucune question disponible pour le moment.
          </p>
        )}
      </div>
    );
  }

  /* ============ QUIZ ============ */
  if (phase === 'quiz' && q) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7C3AED' }}>
            <Award className="inline h-3.5 w-3.5" /> Interrogation
          </span>
          <span className="text-xs text-(--color-ink-soft)">Q{index + 1} / {total}</span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-(--color-sand-100)">
          <div className="h-full rounded-full" style={{ width: `${((index + 1) / total) * 100}%`, background: '#7C3AED' }} />
        </div>
        <div className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-(--color-ink-muted)">Énoncé</p>
          <h2 className="mt-1 text-base font-semibold leading-snug text-(--color-ink) sm:text-lg">{q.enonce}</h2>
        </div>
        <div className="space-y-2">
          {q.items.map((it) => {
            const selected = sel.has(it.lettre);
            return (
              <button
                key={it.id}
                onClick={() => toggle(it.lettre)}
                className={'flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ' +
                  (selected ? 'border-[#7C3AED] bg-[#F5F3FF]' : 'border-(--color-border) bg-(--color-surface) hover:border-[#7C3AED]/40')}
              >
                <span className={'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold ' +
                  (selected ? 'bg-[#7C3AED] text-white' : 'bg-(--color-sand-100) text-(--color-ink-soft)')}>
                  {it.lettre}
                </span>
                <span className="flex-1 text-sm text-(--color-ink)">{it.enonce}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={next}
            disabled={sel.size === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {index < total - 1 ? 'Question suivante' : 'Terminer'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ============ SCORE ============ */
  if (phase === 'score') {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED]">
          <Trophy className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-(--color-ink)">Interrogation terminée</h2>
        <p className="mt-2 text-(--color-ink-soft)">Votre score</p>
        <p className="mt-1 text-5xl font-black tabular-nums" style={{ color: '#7C3AED' }}>{score}/{total}</p>
        <p className="text-sm font-bold" style={{ color: '#7C3AED' }}>{pct}%</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/cours/${coursId}`} className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) px-4 py-2.5 text-sm font-bold text-(--color-ink-soft)">
            Retour
          </Link>
          <button
            onClick={() => setPhase('sign')}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:scale-[1.02]"
          >
            <FileText className="h-4 w-4" /> Émarger
          </button>
        </div>
      </div>
    );
  }

  /* ============ SIGN ============ */
  if (phase === 'sign') {
    return (
      <SignaturePadScreen
        firstName={firstName}
        lastName={lastName}
        coursTitre={coursTitre}
        onCancel={() => setPhase('score')}
        onConfirm={(dataUrl) => {
          start(async () => {
            const r = await saveSignature({ cours_id: coursId, signature_data_url: dataUrl });
            if (r.ok) {
              setPhase('done');
              router.refresh();
            }
          });
        }}
        pending={pending}
      />
    );
  }

  /* ============ DONE ============ */
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#16A34A]">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-(--color-ink)">Certificat signé</h2>
      <p className="mt-2 text-(--color-ink-soft)">
        Votre certificat de fin de parcours <strong className="text-(--color-ink)">{coursTitre}</strong> est prêt.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <a
          href={`/api/certificate/${coursId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:scale-[1.02]"
        >
          <FileText className="h-4 w-4" /> Télécharger mon certificat (PDF)
        </a>
        <Link href={`/cours/${coursId}`} className="text-xs font-bold text-(--color-ink-soft) hover:text-(--color-ink)">
          Retour au parcours
        </Link>
      </div>
    </div>
  );
}

/* ============ Signature pad ============ */
function SignaturePadScreen({
  firstName, lastName, coursTitre, onCancel, onConfirm, pending,
}: {
  firstName: string;
  lastName: string;
  coursTitre: string;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
  pending: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const ctx = () => canvasRef.current?.getContext('2d');

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    last.current = pos(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = ctx(); if (!c) return;
    const p = pos(e);
    c.strokeStyle = '#0F1F4D';
    c.lineWidth = 2.2;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(last.current!.x, last.current!.y);
    c.lineTo(p.x, p.y);
    c.stroke();
    last.current = p;
    if (!hasSignature) setHasSignature(true);
  };
  const onUp = () => { drawing.current = false; last.current = null; };
  const clear = () => {
    const c = ctx(); if (!c || !canvasRef.current) return;
    c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
  };
  const confirm = () => {
    if (!canvasRef.current || !hasSignature) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onConfirm(dataUrl);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h2 className="text-2xl font-bold tracking-tight text-(--color-ink)">
        Émarger pour valider votre certificat
      </h2>
      <p className="mt-2 text-sm text-(--color-ink-soft)">
        Signez ci-dessous pour finaliser votre certificat de fin de parcours{' '}
        <strong className="text-(--color-ink)">{coursTitre}</strong> ({firstName} {lastName}).
      </p>
      <div className="mt-5 rounded-2xl border-2 border-dashed border-(--color-border) bg-white p-3">
        <canvas
          ref={canvasRef}
          width={640}
          height={220}
          className="block w-full touch-none rounded-md bg-white"
          style={{ aspectRatio: '640 / 220' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button onClick={clear} type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-bold text-(--color-ink-soft) hover:bg-(--color-sand-100)">
          <Eraser className="h-3.5 w-3.5" /> Effacer
        </button>
        <div className="flex gap-2">
          <button onClick={onCancel} type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-bold text-(--color-ink-soft) hover:bg-(--color-sand-100)">
            <X className="h-3.5 w-3.5" /> Annuler
          </button>
          <button
            onClick={confirm}
            disabled={!hasSignature || pending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Valider et générer le certificat
          </button>
        </div>
      </div>
    </div>
  );
}
