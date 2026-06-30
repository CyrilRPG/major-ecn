'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, BookMarked, BookOpen, Check, Columns2,
  GraduationCap, Layers3, MessageCircle, MonitorPlay, NotebookPen,
  Search, Sparkles, Video, X, type LucideIcon,
} from 'lucide-react';

const STORAGE_KEY = 'major-ecn:student-tutorial-dismissed';

const INK = '#1F2937';
const INK_SOFT = '#52607A';

type Step = {
  Icon: LucideIcon;
  tag: string;
  title: string;
  color: string;
  bg: string;
  border: string;
  body: ReactNode;
};

type ContentFlags = {
  fiche: boolean;
  video: boolean;
  seanceApprofondie: boolean;
  entrainement: boolean;
};

function buildSteps(flags: ContentFlags): Step[] {
  const steps: Step[] = [];
  let idx = 0;
  const next = () => { idx++; return `Étape ${idx}`; };

  steps.push({
    Icon: Search,
    tag: next(),
    title: 'Naviguer dans vos contenus',
    color: '#2563EB', bg: '#EFF4FF', border: '#BFD0F5',
    body: (
      <>
        Dans le <strong>menu latéral</strong>, retrouvez vos <strong>collèges</strong>{' '}
        (spécialités) et leurs cours. Cliquez sur un cours pour ouvrir sa{' '}
        <strong>console d&rsquo;étude</strong> avec tous les onglets disponibles.
        Accédez à l&rsquo;<strong>Accueil</strong> pour votre tableau de bord et vos priorités.
      </>
    ),
  });

  if (flags.fiche) {
    steps.push({
      Icon: BookMarked,
      tag: next(),
      title: 'Fiches de cours & Fiche Express',
      color: '#6D28D9', bg: '#F3EEFF', border: '#D6C8F7',
      body: (
        <>
          Chaque cours dispose d&rsquo;une <strong>fiche complète</strong> et d&rsquo;une{' '}
          <strong>Fiche Express</strong> (résumé condensé). Consultez-les dans les onglets{' '}
          <strong>Fiche</strong> et <strong>Fiche Express</strong> pour structurer vos révisions.
        </>
      ),
    });
  }

  if (flags.video) {
    steps.push({
      Icon: MonitorPlay,
      tag: next(),
      title: 'Cours vidéo',
      color: '#C0112E', bg: '#FDEEEF', border: '#F5C2C7',
      body: (
        <>
          Les <strong>cours vidéo</strong> vous permettent de suivre l&rsquo;explication complète
          de chaque item. La vidéo est automatiquement marquée comme vue à <strong>80 %</strong>{' '}
          de progression.
        </>
      ),
    });
  }

  if (flags.seanceApprofondie) {
    steps.push({
      Icon: Video,
      tag: next(),
      title: 'Séance approfondie',
      color: '#C0112E', bg: '#FDEEEF', border: '#F5C2C7',
      body: (
        <>
          Les <strong>séances approfondies</strong> sont des sessions de travail détaillées
          animées par un professeur. Elles couvrent les points clés, les pièges et les
          stratégies de raisonnement pour chaque item.
        </>
      ),
    });
  }

  steps.push({
    Icon: BookOpen,
    tag: next(),
    title: 'QCM & Entraînement',
    color: '#E4002B', bg: '#FFF1EC', border: '#FAD3C4',
    body: (
      <>
        Testez vos connaissances avec les <strong>QCM (DP · QI)</strong> de chaque cours.
        {flags.entrainement && (
          <>
            {' '}Utilisez l&rsquo;<strong>Entraînement ciblé</strong> pour des sessions
            personnalisées sur vos points faibles.
          </>
        )}
        {' '}Les <strong>révisions transversales</strong> combinent plusieurs spécialités
        pour consolider vos acquis.
      </>
    ),
  });

  steps.push({
    Icon: Layers3,
    tag: next(),
    title: 'Flashcards',
    color: '#16793C', bg: '#E7F6EC', border: '#C6EBD2',
    body: (
      <>
        Les <strong>flashcards</strong> utilisent la répétition espacée pour ancrer les
        notions clés. Révisez régulièrement : chaque carte est notée{' '}
        <strong>Facile</strong>, <strong>Moyen</strong> ou <strong>Difficile</strong> pour
        adapter la fréquence de révision.
      </>
    ),
  });

  steps.push({
    Icon: Columns2,
    tag: next(),
    title: 'Outils d’étude',
    color: '#7C3AED', bg: '#F3EEFF', border: '#D6C8F7',
    body: (
      <>
        <strong>Vue partagée (Split)</strong> : étudiez deux contenus côte à côte
        (fiche + QCM, vidéo + notes…).{' '}
        <strong>Assistant</strong>{' '}
        <MessageCircle className="inline h-3 w-3 align-text-bottom" style={{ color: '#E4002B' }} />
        {' '}: posez vos questions sur le cours.{' '}
        <strong>Prise de notes</strong>{' '}
        <NotebookPen className="inline h-3 w-3 align-text-bottom" style={{ color: '#7C3AED' }} />
        {' '}: rédigez et retrouvez vos notes par cours.
      </>
    ),
  });

  return steps;
}

export function StudentTutorialPopup({ offer }: { offer: 'essentiel' | 'intensif' | 'approfondi' }) {
  const [open, setOpen] = useState(false);
  const [neverShow, setNeverShow] = useState(true);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const welcomeDismissed = localStorage.getItem('major-ecn:conseils-dismissed');
    if (welcomeDismissed) {
      setOpen(true);
      return;
    }

    const handler = () => {
      setTimeout(() => setOpen(true), 400);
    };
    window.addEventListener('mecn:welcome-closed', handler);
    return () => window.removeEventListener('mecn:welcome-closed', handler);
  }, []);

  function close() {
    if (neverShow) localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  const flags: ContentFlags = {
    fiche: offer === 'intensif' || offer === 'approfondi',
    video: offer === 'intensif',
    seanceApprofondie: offer === 'approfondi',
    entrainement: offer === 'essentiel' || offer === 'intensif',
  };

  const steps = buildSteps(flags);

  if (!open || steps.length === 0) return null;

  const step = steps[i];
  const last = i === steps.length - 1;
  const Icon = step.Icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="student-tutorial-title"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <button
          onClick={close}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F1F5F9]"
          style={{ color: INK_SOFT }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex justify-center">
          <div className="relative">
            <span
              className="flex h-28 w-28 items-center justify-center rounded-full transition-colors"
              style={{ background: `radial-gradient(circle at 50% 50%, ${step.color}33 0%, ${step.color}1A 55%, ${step.color}00 100%)` }}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#FFFFFF', color: step.color, boxShadow: `0 10px 30px -12px ${step.color}80` }}>
                <Icon className="h-8 w-8" strokeWidth={2.2} />
              </span>
            </span>
            <Sparkles aria-hidden className="absolute -left-2 top-1 h-4 w-4" style={{ color: step.color }} strokeWidth={2.4} />
            <span
              aria-hidden
              className="absolute -top-1 right-0 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: step.color, color: '#FFFFFF', boxShadow: `0 6px 20px -8px ${step.color}` }}
            >
              <GraduationCap className="h-3.5 w-3.5" strokeWidth={2.6} />
            </span>
          </div>
        </div>

        {/* Tag + title */}
        <div className="mt-5 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em]"
            style={{ background: step.bg, color: step.color }}
          >
            {step.tag} <span style={{ color: INK_SOFT }}>· sur {steps.length}</span>
          </span>
          <h2
            id="student-tutorial-title"
            className="mt-3 text-[22px] font-black leading-tight tracking-tight sm:text-[26px]"
            style={{ color: INK }}
          >
            {step.title}
          </h2>
          <span aria-hidden className="mx-auto mt-2 block h-[3px] w-16 rounded-full" style={{ background: step.color }} />
        </div>

        {/* Colored content card */}
        <div
          className="mt-5 flex items-start gap-3 rounded-2xl border p-4"
          style={{ background: step.bg, borderColor: step.border }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: '#FFFFFF', color: step.color }}>
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <p className="text-[13.5px] leading-relaxed" style={{ color: INK }}>
            {step.body}
          </p>
        </div>

        {/* Step dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {steps.map((s, idx) => (
            <button
              key={idx}
              aria-label={`Étape ${idx + 1}`}
              onClick={() => setI(idx)}
              className="h-2 rounded-full transition-all"
              style={{
                width: idx === i ? 26 : 8,
                background: idx === i ? s.color : '#D7DCE5',
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-5 flex items-center gap-3">
          {i > 0 ? (
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              className="flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3.5 text-[14px] font-bold transition-colors hover:bg-[#F8FAFC]"
              style={{ borderColor: '#E5E9F0', color: INK_SOFT }}
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              className="rounded-2xl border px-4 py-3.5 text-[14px] font-bold transition-colors hover:bg-[#F8FAFC]"
              style={{ borderColor: '#E5E9F0', color: INK_SOFT }}
            >
              Passer
            </button>
          )}

          <button
            type="button"
            onClick={() => (last ? close() : setI((v) => Math.min(steps.length - 1, v + 1)))}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_15px_35px_-15px_rgba(228,0,43,0.55)] transition-transform hover:scale-[1.01]"
            style={{ background: 'linear-gradient(90deg, #E4002B 0%, #F97316 100%)' }}
          >
            {last ? <>C&rsquo;est parti ! <Check className="h-5 w-5" /></> : <>Suivant <ArrowRight className="h-5 w-5" /></>}
          </button>
        </div>

        {/* "Ne plus afficher" checkbox */}
        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 text-[12.5px]" style={{ color: INK_SOFT }}>
          <input
            type="checkbox"
            checked={neverShow}
            onChange={(e) => setNeverShow(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded"
            style={{ accentColor: '#E4002B' }}
          />
          Ne plus afficher ce tutoriel
        </label>
      </div>
    </div>
  );
}
