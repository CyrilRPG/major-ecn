'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { answerQuestion, expireAttempt } from '@/app/(arena)/arena/[slug]/actions';
import { ZoomableImage } from '@/components/qcm/image-zoom';
import type { PublicQuestion } from '@/lib/arena/types';
import { clockLabel } from '@/lib/arena/time';
import { ArenaButton, ARENA, BODY, DISPLAY, TABULAR } from './arena-ui';
import { FormError } from './form-ui';

/**
 * Passation d'une manche (§3.4 « Pendant ») : timer permanent calé sur
 * l'échéance serveur, une question par écran, validation irréversible,
 * sauvegarde immédiate, soumission automatique à l'expiration. Aucun retour
 * en arrière : la question courante est la première non répondue.
 *
 * Contraintes d'interface (§6.2) : QRU limitée à une coche (une seconde coche
 * désélectionne la première), QRP limitée à n avec le message « Cochez
 * exactement n propositions ».
 */
export function RoundRunner({
  attemptId, deadlineIso, questions, answeredIds, baremeLabel, roundNumber, preview,
}: {
  attemptId: string;
  deadlineIso: string;
  questions: PublicQuestion[];
  answeredIds: string[];
  baremeLabel: Record<'QRM' | 'QRU' | 'QRP', string>;
  roundNumber: number;
  preview: boolean;
}) {
  const router = useRouter();
  const [answered, setAnswered] = useState<Set<string>>(() => new Set(answeredIds));
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const expiring = useRef(false);

  const current = useMemo(() => questions.find((q) => !answered.has(q.id)) ?? null, [questions, answered]);
  const index = current ? questions.findIndex((q) => q.id === current.id) : questions.length;
  const deadline = useMemo(() => new Date(deadlineIso).getTime(), [deadlineIso]);

  const finish = useCallback(() => {
    router.refresh();
  }, [router]);

  // Chronomètre : le serveur est seul juge, le client se contente d'afficher et de déclencher la clôture.
  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !expiring.current) {
        expiring.current = true;
        expireAttempt(attemptId).finally(finish);
      }
    };
    const t0 = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 500);
    return () => { window.clearTimeout(t0); window.clearInterval(id); };
  }, [attemptId, deadline, finish]);

  if (!current) {
    return <p className="p-8 text-center text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Clôture de la manche…</p>;
  }

  const n = current.type === 'QRP' ? current.expected_count ?? 1 : null;
  const toggle = (l: string) => {
    if (pending) return;
    setError(null);
    setSelected((prev) => {
      const has = prev.includes(l);
      if (current.type === 'QRU') return has ? [] : [l];
      if (current.type === 'QRP' && !has && prev.length >= (n ?? 1)) return prev;
      return has ? prev.filter((x) => x !== l) : [...prev, l].sort();
    });
  };
  const canValidate = current.type === 'QRP' ? selected.length === n : current.type === 'QRU' ? selected.length === 1 : true;
  const urgent = remaining !== null && remaining <= 60;
  const isLast = index === questions.length - 1;

  const validate = () => {
    setError(null);
    start(async () => {
      const r = await answerQuestion(attemptId, current.id, selected);
      if (!r.ok) {
        setError(r.error);
        if (/clôtur|termin/i.test(r.error)) finish();
        return;
      }
      setSelected([]);
      setAnswered((prev) => new Set([...prev, current.id]));
      if (r.finished) finish();
    });
  };

  return (
    <div className="overflow-hidden rounded-[1.5rem]" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}, 0 40px 80px -30px rgba(0,0,0,0.8)` }}>
      {preview && (
        <div className="px-4 py-2 text-center text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ background: 'rgba(245,179,43,0.12)', color: ARENA.preview, borderBottom: '1px solid rgba(245,179,43,0.25)', fontFamily: BODY }}>
          Mode prévisualisation — aucun score n’est enregistré
        </div>
      )}
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-9">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Manche {roundNumber}</p>
          <p className="mt-1 text-lg font-extrabold sm:text-xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}>
            Question <span style={{ color: ARENA.redSoft }}>{index + 1}</span><span style={{ color: ARENA.textMuted }}> / {questions.length}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Temps restant</p>
          <p className="text-[2.6rem] font-medium leading-none sm:text-5xl" style={{ ...TABULAR, color: urgent ? ARENA.redSoft : ARENA.text, textShadow: urgent ? '0 0 24px rgba(228,0,43,0.6)' : 'none' }} aria-live="off">
            {remaining === null ? '--:--' : clockLabel(remaining)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-1 px-5 sm:px-9">
        {questions.map((q, i) => (
          <span key={q.id} className="h-1 flex-1 rounded-full" style={{ background: answered.has(q.id) ? ARENA.red : i === index ? ARENA.redSoft : 'rgba(255,255,255,0.10)' }} />
        ))}
      </div>

      <motion.div key={current.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="px-5 pb-6 pt-6 sm:px-9 sm:pb-9">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
          {current.type} · {baremeLabel[current.type]}{current.weight !== 1 ? ` · coefficient ${current.weight}` : ''}
        </p>
        {current.vignette && (
          <div className="mt-3 rounded-xl px-4 py-3 text-[14px] leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${ARENA.line}`, color: ARENA.textSoft, fontFamily: BODY, whiteSpace: 'pre-line' }}>
            {current.vignette}
          </div>
        )}
        <p className="mt-3 text-[17px] font-bold leading-snug sm:text-[19px]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.01em', whiteSpace: 'pre-line' }}>{current.enonce}</p>
        {current.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {current.images.map((src) => (
              <span key={src} className="relative block h-48 w-48 overflow-hidden rounded-xl bg-white sm:h-64 sm:w-64"><ZoomableImage src={src} sizes="256px" /></span>
            ))}
          </div>
        )}
        {n !== null && <p className="mt-2 text-[13px] font-semibold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Cochez exactement {n} proposition{n > 1 ? 's' : ''}.</p>}

        <ul className="mt-5 space-y-2.5">
          {current.items.map((it) => {
            const on = selected.includes(it.lettre);
            return (
              <li key={it.lettre}>
                <button
                  type="button"
                  onClick={() => toggle(it.lettre)}
                  aria-pressed={on}
                  disabled={pending}
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-[background-color,box-shadow] duration-150"
                  style={{ background: on ? 'rgba(228,0,43,0.10)' : ARENA.raised, boxShadow: on ? `inset 0 0 0 1.5px ${ARENA.red}` : `inset 0 0 0 1px ${ARENA.line}` }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold" style={{ background: on ? ARENA.red : 'rgba(255,255,255,0.06)', color: on ? '#fff' : ARENA.textSoft, fontFamily: DISPLAY }}>
                    {on ? <Check className="h-4 w-4" strokeWidth={3} /> : it.lettre}
                  </span>
                  <span className="text-[14.5px] leading-snug" style={{ color: on ? ARENA.text : ARENA.textSoft, fontFamily: BODY }}>{it.enonce}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 space-y-3">
          <FormError>{error}</FormError>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
              <Lock className="h-3.5 w-3.5" /> Validation irréversible — aucun retour en arrière. Sauvegarde immédiate.
            </p>
            <ArenaButton onClick={validate} disabled={!canValidate || pending} className="w-full sm:w-auto">
              {pending ? 'Enregistrement…' : isLast ? 'Valider et terminer la manche' : 'Valider et passer à la suivante'}
            </ArenaButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
