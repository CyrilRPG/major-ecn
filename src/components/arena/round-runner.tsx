'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Clock3, WifiOff } from 'lucide-react';
import { answerQuestion, expireAttempt, expireQuestion, setQuestionMarked } from '@/app/(arena)/arena/[slug]/actions';
import type { PublicQuestion } from '@/lib/arena/types';
import { clockLabel } from '@/lib/arena/time';
import { QuestionView } from './question-view';
import { ArenaButton, ARENA, BODY, CAPS, HEADLINE } from './arena-ui';
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

export function RoundRunner({
  attemptId, deadlineIso, startedIso, lastValidatedIso, questions, answeredIds, markedIds, baremeLabel, roundNumber, roundTotal, roundTheme, preview,
}: {
  attemptId: string;
  /** Échéance de la tentative entière : clôture de manche, filet de sécurité. */
  deadlineIso: string;
  /** Démarrage de la tentative : point de départ du chronomètre de la 1re question. */
  startedIso: string;
  /** Dernière validation connue du serveur : point de départ de la question en
   *  cours après une reprise. `null` si aucune question n'a encore été validée. */
  lastValidatedIso: string | null;
  questions: PublicQuestion[];
  answeredIds: string[];
  markedIds: string[];
  baremeLabel: Record<'QRM' | 'QRU' | 'QRP', string>;
  roundNumber: number;
  roundTotal: number;
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
  const [confirmedOnce, setConfirmedOnce] = useState(false);
  const [marked, setMarked] = useState<Set<string>>(() => new Set(markedIds));
  const [markPending, setMarkPending] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        setConfirmedOnce(sessionStorage.getItem('arena-confirmed-' + attemptId) === '1');
      } catch { /* A blocked storage must never prevent participation. */ }
    }, 0);
    return () => window.clearTimeout(id);
  }, [attemptId]);
  /** Début de la question affichée. Repris du serveur au chargement, puis
   *  recalé à chaque validation : chaque question repart avec son plein temps. */
  const [questionStart, setQuestionStart] = useState<number>(
    () => new Date(lastValidatedIso ?? startedIso).getTime(),
  );
  /** Évite deux expirations concurrentes sur la même question. */
  const expiringQuestion = useRef<string | null>(null);

  const current = useMemo(() => questions.find((q) => !answered.has(q.id)) ?? null, [questions, answered]);
  const index = current ? questions.findIndex((q) => q.id === current.id) : questions.length;
  const deadline = useMemo(() => new Date(deadlineIso).getTime(), [deadlineIso]);
  /** Secondes allouées à la question affichée (réglage de l'administration). */
  const totalSeconds = current?.duration_seconds ?? 60;
  /** Échéance de la question : jamais au-delà de celle de la tentative. */
  const questionEnd = useMemo(
    () => Math.min(questionStart + totalSeconds * 1000, deadline),
    [questionStart, totalSeconds, deadline],
  );

  // Fin de manche : rafraîchit le rendu serveur, puis rechargement complet si l'écran n'a pas changé (secours).
  const finish = useCallback(() => {
    router.refresh();
    window.setTimeout(() => window.location.assign(window.location.pathname + window.location.search), 2500);
  }, [router]);

  // Chronomètre : le serveur est seul juge, le client affiche et déclenche.
  // Deux échéances se superposent — celle de la QUESTION, qui fait passer à la
  // suivante sans réponse, et celle de la TENTATIVE (clôture de la manche), qui
  // arrête tout. La seconde prime.
  useEffect(() => {
    const tick = () => {
      const maintenant = Date.now();
      if (maintenant >= deadline) {
        setRemaining(0);
        if (!expiring.current) {
          expiring.current = true;
          expireAttempt(attemptId).then(r => {
            if (r.ok && r.expired) setExpired(true);
            else { expiring.current = false; if (!r.ok) setError(r.error); }
          }).catch(() => { expiring.current = false; setOffline(true); });
        }
        return;
      }
      setRemaining(Math.max(0, Math.floor((questionEnd - maintenant) / 1000)));
      if (maintenant >= questionEnd && current && expiringQuestion.current !== current.id) {
        expiringQuestion.current = current.id;
        const id = current.id;
        expireQuestion(attemptId, id)
          .then((r) => {
            if (!r.ok || !r.expired) { expiringQuestion.current = null; return; }
            setSelected([]);
            setError(null);
            setAnswered((prev) => new Set([...prev, id]));
            setQuestionStart(r.lastValidatedAt ? new Date(r.lastValidatedAt).getTime() : Date.now());
            if (r.finished) finish();
          })
          .catch(() => { expiringQuestion.current = null; });
      }
    };
    const t0 = window.setTimeout(tick, 0);
    const idt = window.setInterval(tick, 500);
    return () => { window.clearTimeout(t0); window.clearInterval(idt); };
  }, [attemptId, deadline, questionEnd, current, finish]);

  // Connexion perdue (maquette 13) : le timer continue, les réponses validées sont sauvegardées.
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    const t = window.setTimeout(() => { if (!navigator.onLine) setOffline(true); }, 0);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); window.clearTimeout(t); };
  }, []);

  const urgent = remaining !== null && remaining <= Math.max(5, Math.round(totalSeconds * 0.25));
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
      setConfirmedOnce(true);
      try { sessionStorage.setItem('arena-confirmed-' + attemptId, '1'); } catch { /* optional persistence */ }
      setSelected([]);
      setAnswered((prev) => new Set([...prev, current.id]));
      setQuestionStart(r.lastValidatedAt ? new Date(r.lastValidatedAt).getTime() : Date.now());
      expiringQuestion.current = null;
      if (r.finished) finish();
    });
  };

  return (
    <div className="relative">
      <QuestionView key={current.id}
        question={current} roundNumber={roundNumber} roundTotal={roundTotal} roundTheme={roundTheme}
        questionIndex={index} questionTotal={questions.length} clock={clock} progress={progress} urgent={urgent}
        selected={selected} pending={pending} canValidate={canValidate} confirmationRequired={!confirmedOnce}
        baremeLabel={baremeLabel[current.type]} error={error} onToggle={toggle} onValidate={validate}
        marked={marked.has(current.id)} markPending={markPending} onMark={async () => {
          if (markPending) return;
          const id = current.id;
          const value = !marked.has(id);
          setMarkPending(true);
          try {
            const r = await setQuestionMarked(attemptId, id, value);
            if (!r.ok) { setError(r.error); return; }
            setMarked(previous => { const next = new Set(previous); if (value) next.add(id); else next.delete(id); return next; });
          } catch { setError('Le marquage n’a pas été enregistré. Réessayez.'); }
          finally { setMarkPending(false); }
        }}
      />
      {preview && <p className="ae-result-extra">Mode prévisualisation — aucun score n’est enregistré</p>}

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
