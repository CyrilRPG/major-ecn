'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, Lock, RotateCcw, Wifi } from 'lucide-react';
import { ARENA, ArenaButton, BODY, DISPLAY, TABULAR } from './arena-ui';

/* ============================================================
   Aperçu d'une manche — parcours candidat complet (§3.4) :
   écran d'accueil avec barème → une question par écran, timer,
   validation irréversible → écran de fin (score de manche, temps).
   Le score est réellement calculé avec le preset CNG (§6.4) pour
   que la maquette montre l'interface ET la règle.
   Aucun score n'est enregistré : c'est le « mode prévisualisation »
   du §15.2, bandeau compris.
   ============================================================ */

type QType = 'QRM' | 'QRU' | 'QRP';
type Question = {
  type: QType;
  n?: number; // QRP : nombre de réponses attendues
  stem: string;
  options: string[];
  expected: number[]; // index des propositions attendues
};

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const MANCHE_SECONDS = 12 * 60;

/* Contenu d'illustration — la production des questions relève de Major ECN (§20). */
const QUESTIONS: Question[] = [
  {
    type: 'QRM',
    stem: 'Concernant l’artérite à cellules géantes (maladie de Horton), quelles sont les propositions exactes ?',
    options: [
      'Elle touche préférentiellement les sujets de plus de 50 ans.',
      'La vitesse de sédimentation est habituellement normale.',
      'Une claudication intermittente de la mâchoire est très évocatrice.',
      'La corticothérapie est débutée sans attendre le résultat de la biopsie.',
      'Une biopsie d’artère temporale normale élimine le diagnostic.',
    ],
    expected: [0, 2, 3],
  },
  {
    type: 'QRU',
    stem: 'Homme de 68 ans, syndrome inflammatoire biologique isolé découvert sur un bilan. Quel est l’examen de première intention parmi les suivants ?',
    options: [
      'Électrophorèse des protéines sériques.',
      'TEP-scanner au 18-FDG.',
      'Biopsie ostéo-médullaire.',
      'Scintigraphie osseuse.',
      'Coloscopie totale.',
    ],
    expected: [0],
  },
  {
    type: 'QRP',
    n: 2,
    stem: 'Concernant le lupus systémique, cochez les deux propositions exactes.',
    options: [
      'Les anticorps anti-ADN natif sont très spécifiques de la maladie.',
      'La maladie prédomine chez l’homme.',
      'L’hydroxychloroquine est le traitement de fond de référence.',
      'La photosensibilité ne fait pas partie des critères de classification.',
      'Le complément sérique est habituellement élevé en poussée.',
    ],
    expected: [0, 2],
  },
];

const TYPE_LABEL: Record<QType, string> = {
  QRM: 'QRM · réponses multiples · barème CNG (discordances)',
  QRU: 'QRU · réponse unique · correction binaire',
  QRP: 'QRP · nombre de réponses précisé · notation en x/n',
};

/** Preset CNG (§6.4). Les règles indispensable/inacceptable ne sont pas illustrées ici. */
function scoreCng(q: Question, checked: number[]): number {
  const set = new Set(checked);
  const exp = new Set(q.expected);
  if (q.type === 'QRM') {
    let discordances = 0;
    for (let i = 0; i < q.options.length; i++) if (set.has(i) !== exp.has(i)) discordances++;
    return discordances === 0 ? 1 : discordances === 1 ? 0.5 : discordances === 2 ? 0.2 : 0;
  }
  if (q.type === 'QRU') return checked.length === 1 && exp.has(checked[0]) ? 1 : 0;
  const n = q.n ?? q.expected.length;
  if (checked.some((i) => !exp.has(i))) return 0;
  return checked.filter((i) => exp.has(i)).length / n;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const fr = (v: number, digits = 1) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: digits });

type Phase = 'intro' | 'running' | 'done';

export function MatchDemo() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  const q = QUESTIONS[index];
  const remaining = Math.max(0, MANCHE_SECONDS - elapsed);
  const urgent = remaining <= 60;

  // Timer : compte le temps réel écoulé depuis « Commencer la manche ».
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => {
      const e = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(e);
      if (e >= MANCHE_SECONDS) setPhase('done'); // expiration → soumission automatique
    }, 250);
    return () => window.clearInterval(id);
  }, [phase]);

  const start = () => {
    startedAt.current = Date.now();
    setElapsed(0);
    setIndex(0);
    setChecked([]);
    setScores([]);
    setPhase('running');
  };

  const toggle = (i: number) => {
    setChecked((prev) => {
      const has = prev.includes(i);
      if (q.type === 'QRU') return has ? [] : [i]; // une seconde coche désélectionne la première
      if (q.type === 'QRP' && !has && prev.length >= (q.n ?? 1)) return prev; // limitée à n
      return has ? prev.filter((x) => x !== i) : [...prev, i].sort();
    });
  };

  const canValidate = q.type === 'QRP' ? checked.length === (q.n ?? 1) : q.type === 'QRU' ? checked.length === 1 : true;

  const validate = () => {
    const s = scoreCng(q, checked);
    const next = [...scores, s];
    setScores(next);
    setChecked([]);
    if (index + 1 < QUESTIONS.length) setIndex(index + 1);
    else setPhase('done');
  };

  const total = useMemo(() => scores.reduce((a, b) => a + b, 0), [scores]);
  const perfect = scores.filter((s) => s === 1).length;

  return (
    <div
      className="relative overflow-hidden rounded-[1.5rem]"
      style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}, 0 40px 80px -30px rgba(0,0,0,0.8)` }}
    >
      {/* Bandeau mode prévisualisation — §15.2, couleur distincte, non masquable */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 text-center text-[11px] font-extrabold uppercase tracking-[0.16em]"
        style={{ background: 'rgba(245,179,43,0.12)', color: ARENA.preview, fontFamily: BODY, borderBottom: '1px solid rgba(245,179,43,0.25)' }}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Mode prévisualisation — aucun score n’est enregistré
      </div>

      {/* Aucune animation de sortie : l'écran suivant monte immédiatement
          (transitions rapides, §13) et ne dépend jamais de la fin d'une
          animation — un onglet en arrière-plan ne bloque pas le parcours. */}
      {phase === 'intro' && (
          <motion.div key="intro" {...fade} className="p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
                  Manche 1 · Médecine interne
                </p>
                <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em' }}>
                  Vascularites et maladies systémiques
                </h3>
                <p className="mt-2 text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                  Ouverte le 20 septembre de 09h00 à 09h00 le lendemain (heure de Paris).
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Durée</p>
                <p className="text-4xl font-medium leading-none" style={TABULAR}>12:00</p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {(['QRM', 'QRU', 'QRP'] as QType[]).map((t) => (
                <div key={t} className="rounded-xl p-4" style={{ background: ARENA.raised, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                  <p className="text-sm font-extrabold" style={{ fontFamily: DISPLAY }}>{t}</p>
                  <p className="mt-1 text-[12.5px] leading-snug" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                    {TYPE_LABEL[t].split(' · ').slice(1).join(' · ')}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(228,0,43,0.08)', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.25)' }}>
              <Wifi className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ARENA.redSoft }} />
              <p className="text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                Assurez-vous de disposer d’une connexion internet stable avant de commencer. Le chronomètre continue de
                tourner en cas de déconnexion.
              </p>
            </div>

            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                Une seule tentative · aucun retour en arrière · sauvegarde immédiate de chaque réponse
              </p>
              <ArenaButton onClick={start} className="w-full sm:w-auto">Commencer la manche</ArenaButton>
            </div>
          </motion.div>
        )}

        {phase === 'running' && (
          <motion.div key="running" {...fade}>
            {/* Barre de manche : progression + timer permanent */}
            <div className="flex items-center justify-between gap-4 px-6 pt-5 sm:px-9">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                  Manche 1
                </p>
                <p className="mt-1 text-lg font-extrabold sm:text-xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}>
                  Question <span style={{ color: ARENA.redSoft }}>{index + 1}</span>
                  <span style={{ color: ARENA.textMuted }}> / {QUESTIONS.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Temps restant</p>
                <p
                  className="text-[2.6rem] font-medium leading-none sm:text-5xl"
                  style={{ ...TABULAR, color: urgent ? ARENA.redSoft : ARENA.text, textShadow: urgent ? '0 0 24px rgba(228,0,43,0.6)' : 'none' }}
                  aria-live="off"
                >
                  {fmt(remaining)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-1.5 px-6 sm:px-9">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ background: i < index ? ARENA.red : i === index ? ARENA.redSoft : 'rgba(255,255,255,0.10)' }}
                />
              ))}
            </div>

            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
                className="px-6 pb-6 pt-6 sm:px-9 sm:pb-9"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
                  {TYPE_LABEL[q.type]}
                </p>
                <p className="mt-3 text-[17px] font-bold leading-snug sm:text-[19px]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.01em' }}>
                  {q.stem}
                </p>
                {q.type === 'QRP' && (
                  <p className="mt-2 text-[13px] font-semibold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                    Cochez exactement {q.n} propositions.
                  </p>
                )}

                <ul className="mt-5 space-y-2.5">
                  {q.options.map((opt, i) => {
                    const on = checked.includes(i);
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => toggle(i)}
                          aria-pressed={on}
                          className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-[background-color,box-shadow] duration-150"
                          style={{
                            background: on ? 'rgba(228,0,43,0.10)' : ARENA.raised,
                            boxShadow: on ? `inset 0 0 0 1.5px ${ARENA.red}` : `inset 0 0 0 1px ${ARENA.line}`,
                          }}
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold"
                            style={{ background: on ? ARENA.red : 'rgba(255,255,255,0.06)', color: on ? '#fff' : ARENA.textSoft, fontFamily: DISPLAY }}
                          >
                            {on ? <Check className="h-4 w-4" strokeWidth={3} /> : LETTERS[i]}
                          </span>
                          <span className="text-[14.5px] leading-snug" style={{ color: on ? ARENA.text : ARENA.textSoft, fontFamily: BODY }}>
                            {opt}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                    <Lock className="h-3.5 w-3.5" /> Validation irréversible — aucun retour en arrière.
                  </p>
                  <ArenaButton onClick={validate} disabled={!canValidate} className="w-full sm:w-auto">
                    {index + 1 < QUESTIONS.length ? 'Valider et passer à la suivante' : 'Valider et terminer la manche'}
                  </ArenaButton>
                </div>
            </motion.div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" {...fade} className="p-6 sm:p-9">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
              Manche 1 terminée
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <Stat label="Score de la manche" value={fr(total, 2)} unit={`/ ${QUESTIONS.length}`} big />
              <Stat label="Réponses parfaites" value={String(perfect)} unit={`/ ${QUESTIONS.length}`} />
              <Stat label="Temps de la manche" value={fmt(Math.min(elapsed, MANCHE_SECONDS))} />
            </div>
            <div className="mt-7 rounded-xl p-5" style={{ background: ARENA.raised, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
              <p className="text-sm font-extrabold" style={{ fontFamily: DISPLAY }}>Prochaine manche : M2 · 25 septembre · 09h00 (heure de Paris)</p>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                Le classement cumulé s’affiche après chaque manche dès que votre score cumulé atteint le seuil. Les
                corrections détaillées (PDF) vous sont envoyées après la clôture. Vous restez en course.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <ArenaButton variant="ghost" onClick={() => setPhase('intro')}>
                <RotateCcw className="h-4 w-4" /> Rejouer l’aperçu
              </ArenaButton>
            </div>
          </motion.div>
        )}
    </div>
  );
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
};

function Stat({ label, value, unit, big }: { label: string; value: string; unit?: string; big?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{label}</p>
      <p className={`mt-1.5 leading-none ${big ? 'text-6xl' : 'text-4xl'}`} style={{ ...TABULAR, color: big ? ARENA.redSoft : ARENA.text }}>
        {value}
        {unit && <span className="ml-2 text-xl" style={{ color: ARENA.textMuted }}>{unit}</span>}
      </p>
    </div>
  );
}
