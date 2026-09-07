'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Clock3, Lock, WifiOff } from 'lucide-react';
import { answerQuestion, expireAttempt } from '@/app/(arena)/arena/[slug]/actions';
import { ZoomableImage } from '@/components/qcm/image-zoom';
import type { PublicQuestion } from '@/lib/arena/types';
import { clockLabel } from '@/lib/arena/time';
import { Helmet } from './arena-logo';
import { ArenaButton, ARENA, BODY, CAPS, DISPLAY, HEADLINE } from './arena-ui';
import { FormError } from './form-ui';
import { Ring } from './ring';

/**
 * Passation d'une manche (§3.4 « Pendant », maquettes 4, 11, 12, 13) :
 * timer permanent calé sur l'échéance serveur (anneau), une question par
 * écran, validation irréversible, sauvegarde immédiate, soumission
 * automatique à l'expiration. Écrans annexes : reprise d'une partie en cours,
 * temps écoulé, connexion perdue. Aucun retour en arrière : la question
 * courante est la première non répondue.
 *
 * Contraintes d'interface (§6.2) : QRU limitée à une coche (une seconde coche
 * désélectionne la première), QRP limitée à n avec le message « Cochez
 * exactement n propositions ».
 */
const TYPE_LABEL: Record<PublicQuestion['type'], string> = { QRM: 'Réponses multiples', QRU: 'Réponse unique', QRP: 'Nombre de réponses précisé' };

export function RoundRunner({
  attemptId, deadlineIso, totalSeconds, questions, answeredIds, baremeLabel, roundNumber, roundTheme, preview,
}: {
  attemptId: string;
  deadlineIso: string;
  /** Durée effective de la tentative (secondes) — pour l'anneau. */
  totalSeconds: number;
  questions: PublicQuestion[];
  answeredIds: string[];
  baremeLabel: Record<'QRM' | 'QRU' | 'QRP', string>;
  roundNumber: number;
  roundTheme: string;
  preview: boolean;
}) {
  const router = useRouter();
  const [answered, setAnswered] = useState<Set<string>>(() => new Set(answeredIds));
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [resumed, setResumed] = useState(answeredIds.length === 0);
  const [offline, setOffline] = useState(false);
  const [expired, setExpired] = useState(false);
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
        setExpired(true);
        expireAttempt(attemptId).catch(() => undefined);
      }
    };
    const t0 = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 500);
    return () => { window.clearTimeout(t0); window.clearInterval(id); };
  }, [attemptId, deadline]);

  // Connexion perdue (maquette 13) : le timer continue, les réponses validées sont sauvegardées.
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    const t = window.setTimeout(() => { if (!navigator.onLine) setOffline(true); }, 0);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); window.clearTimeout(t); };
  }, []);

  const urgent = remaining !== null && remaining <= 60;
  const progress = remaining === null ? 1 : Math.max(0, Math.min(1, remaining / Math.max(1, totalSeconds)));
  const clock = remaining === null ? '--:--' : clockLabel(remaining);

  /* ---------- Temps écoulé (maquette 12) ---------- */
  if (expired) {
    return (
      <Screen>
        <Clock3 className="h-12 w-12" style={{ color: ARENA.redSoft }} strokeWidth={1.6} />
        <h2 className="mt-4 text-[2.2rem] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em' }}>Temps écoulé !</h2>
        <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Vos réponses validées ont été soumises automatiquement. La manche est close.</p>
        <ArenaButton className="mt-7 w-full sm:w-auto" onClick={finish}>Voir mon résultat</ArenaButton>
      </Screen>
    );
  }

  if (!current) {
    return <p className="p-8 text-center text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Clôture de la manche…</p>;
  }

  /* ---------- Reprise après fermeture (maquette 11) ---------- */
  if (!resumed) {
    return (
      <Screen>
        <p className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.24em' }}>Manche {roundNumber}</p>
        <h2 className="mt-2 text-[2rem] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em' }}>Reprise de votre partie en cours</h2>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Temps restant</p>
        <Ring progress={progress} size={150} stroke={8} urgent={urgent} className="mt-4">
          <span className="text-[2.4rem] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', color: urgent ? ARENA.redSoft : ARENA.text }}>{clock}</span>
        </Ring>
        <p className="mt-4 text-[15px] font-semibold" style={{ fontFamily: BODY }}>Question {index + 1} / {questions.length}</p>
        <p className="mt-2 text-[13.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Vos réponses sont sauvegardées. Le chronomètre a continué de tourner.</p>
        <ArenaButton className="mt-7 w-full sm:w-auto" onClick={() => setResumed(true)}>Reprendre la partie</ArenaButton>
      </Screen>
    );
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
  const isLast = index === questions.length - 1;

  const validate = () => {
    setError(null);
    start(async () => {
      let r: Awaited<ReturnType<typeof answerQuestion>>;
      try {
        r = await answerQuestion(attemptId, current.id, selected);
      } catch {
        setOffline(true);
        return;
      }
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
    <div className="relative overflow-hidden rounded-[1.6rem]" style={{ background: '#0D1219', boxShadow: `0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)` }}>
      {preview && (
        <div className="px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em]" style={{ background: 'rgba(245,179,43,0.12)', color: ARENA.preview, borderBottom: '1px solid rgba(245,179,43,0.25)', fontFamily: BODY }}>
          Mode prévisualisation — aucun score n’est enregistré
        </div>
      )}

      {/* En-tête : logo · anneau · question n / N */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-8">
        <span className="inline-flex items-center gap-2">
          <Helmet size={30} />
          <span className="hidden text-[18px] leading-none sm:inline" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em' }}>EVC <span style={{ color: ARENA.red }}>ARENA</span></span>
        </span>
        <Ring progress={progress} size={86} stroke={6} urgent={urgent}>
          <span className="text-[20px] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', color: urgent ? ARENA.redSoft : ARENA.text, textShadow: urgent ? '0 0 16px rgba(228,0,43,0.7)' : 'none' }} aria-live="off">{clock}</span>
        </Ring>
        <span className="text-right">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Question</span>
          <span className="block text-[26px] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em' }}>{index + 1} <span style={{ color: ARENA.textMuted }}>/ {questions.length}</span></span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Progression</span>
        </span>
      </div>
      <div className="mt-3 flex gap-1 px-5 sm:px-8">
        {questions.map((q, i) => (
          <span key={q.id} className="h-1 flex-1 rounded-full" style={{ background: answered.has(q.id) ? ARENA.red : i === index ? ARENA.redSoft : 'rgba(255,255,255,0.10)' }} />
        ))}
      </div>

      <motion.div key={current.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8">
        {roundTheme && <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Manche {roundNumber} · {roundTheme}</p>}
        {current.vignette && (
          <div className="mt-3 rounded-lg px-4 py-3 text-[14px] leading-relaxed" style={{ background: ARENA.raised, boxShadow: `inset 0 0 0 1px ${ARENA.line}`, color: ARENA.textSoft, fontFamily: BODY, whiteSpace: 'pre-line' }}>
            {current.vignette}
          </div>
        )}
        <p className="mt-3 text-[17px] font-semibold leading-snug sm:text-[19px]" style={{ fontFamily: BODY, color: ARENA.text, whiteSpace: 'pre-line' }}>{current.enonce}</p>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
          {TYPE_LABEL[current.type]}{n !== null ? ` · cochez exactement ${n} proposition${n > 1 ? 's' : ''}` : ''} · {current.type} · {baremeLabel[current.type]}{current.weight !== 1 ? ` · coefficient ${current.weight}` : ''}
        </p>
        {current.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {current.images.map((src) => (
              <span key={src} className="relative block h-48 w-48 overflow-hidden rounded-lg bg-white sm:h-64 sm:w-64"><ZoomableImage src={src} sizes="256px" /></span>
            ))}
          </div>
        )}

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
                  className="flex w-full items-center gap-4 rounded-lg px-4 py-3.5 text-left transition-[background-color,box-shadow] duration-150"
                  style={{ background: on ? 'rgba(46,204,113,0.14)' : ARENA.raised, boxShadow: on ? `inset 0 0 0 1.5px ${ARENA.ok}` : `inset 0 0 0 1px ${ARENA.line}` }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[14px] font-bold" style={{ background: on ? ARENA.ok : 'rgba(255,255,255,0.06)', color: on ? '#04140A' : ARENA.textSoft, fontFamily: DISPLAY }}>
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
            <p className="flex items-center gap-2 text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
              <Lock className="h-3.5 w-3.5" /> Validation irréversible — aucun retour en arrière. Sauvegarde immédiate.
            </p>
            <ArenaButton onClick={validate} disabled={!canValidate || pending} className="w-full sm:w-auto">
              {pending ? 'Enregistrement…' : isLast ? 'Valider & terminer' : 'Valider & suivante'}
            </ArenaButton>
          </div>
        </div>
      </motion.div>

      {/* Connexion perdue (maquette 13) */}
      {offline && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center" style={{ background: 'rgba(11,15,20,0.94)', backdropFilter: 'blur(6px)' }}>
          <WifiOff className="h-12 w-12" style={{ color: ARENA.redSoft }} strokeWidth={1.6} />
          <h2 className="mt-4 text-[2rem] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em' }}>Connexion perdue</h2>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            Vérifiez votre connexion internet. Vos réponses validées sont sauvegardées ; le chronomètre continue de tourner. Vous pourrez reprendre dès que possible.
          </p>
          <p className="mt-3 text-[22px] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', color: urgent ? ARENA.redSoft : ARENA.text }}>{clock}</p>
          <ArenaButton className="mt-6" onClick={() => { if (navigator.onLine) setOffline(false); }}>Réessayer</ArenaButton>
        </div>
      )}
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[1.6rem] px-6 py-12 text-center sm:px-10" style={{ background: '#0D1219', boxShadow: `0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)` }}>
      {children}
    </div>
  );
}
