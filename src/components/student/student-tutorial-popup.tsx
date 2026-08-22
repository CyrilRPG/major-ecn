'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, BookMarked, BookOpen, Check, Columns2, Crown,
  GraduationCap, Layers3, MessageCircle, MonitorPlay, NotebookPen,
  Search, Sparkles, Video, X, type LucideIcon,
} from 'lucide-react';

import { ONBOARDING_KEYS, isReplayRequested, readFlag, writeFlag } from '@/lib/student/onboarding';

// Suffixe de version : incrémenté quand une étape est ajoutée, pour que le
// tutoriel se réaffiche une fois aux élèves qui l'avaient déjà fermé. v2 =
// ajout de l'étape « Parcours du Major » ; v3 = correctif d'ouverture (le
// tutoriel n'apparaissait pas quand le popup d'accueil ne s'affichait pas).
const STORAGE_KEY = ONBOARDING_KEYS.tutorial;
const WELCOME_KEY = ONBOARDING_KEYS.welcome;

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
  parcoursMajor: boolean;
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
      title: 'Fiches de cours & Fiche éclair',
      color: '#6D28D9', bg: '#F3EEFF', border: '#D6C8F7',
      body: (
        <>
          Chaque cours dispose d&rsquo;une <strong>fiche complète</strong> et d&rsquo;une{' '}
          <strong>Fiche éclair</strong> (résumé condensé). Consultez-les dans les onglets{' '}
          <strong>Fiche</strong> et <strong>Fiche éclair</strong> pour structurer vos révisions.
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

  if (flags.parcoursMajor) {
    steps.push({
      Icon: Crown,
      tag: next(),
      title: 'Parcours du Major',
      color: '#B8860B', bg: '#FFFBEB', border: '#E9D8A6',
      body: (
        <>
          Un chemin de <strong>42 parcours</strong>, avec <strong>deux nouveaux chaque lundi</strong>.
          Terminez celui en cours pour ouvrir le suivant. Chacun contient un{' '}
          <strong>rappel du coach</strong>, un <strong>cas clinique</strong> et des{' '}
          <strong>QCM</strong>, notés <strong>sur 10</strong>.
        </>
      ),
    });
  }

  return steps;
}

export function StudentTutorialPopup({
  offer, parcoursMajor = false, welcomeActive = true, replayOnly = false,
}: {
  offer: 'essentiel' | 'intensif' | 'approfondi';
  /** L'étape « Parcours du Major » n'est montrée qu'aux élèves qui y ont accès. */
  parcoursMajor?: boolean;
  /** Le popup d'accueil est-il actif ? S'il ne s'affiche pas, on n'attend pas
   *  sa fermeture — sinon le tutoriel ne s'ouvrirait jamais. */
  welcomeActive?: boolean;
  /** Comptes non-élèves (admin, professeur) : le tutoriel ne s'ouvre qu'à la
   *  demande, via « Revoir le tutoriel ». Sans ça, un administrateur qui teste
   *  la vue étudiant ne pouvait jamais voir ce qu'il livre à ses élèves. */
  replayOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [neverShow, setNeverShow] = useState(true);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // `?tutoriel=1` rouvre le tutoriel même s'il a déjà été fermé : c'est le
    // moyen de le revoir sans vider le stockage du navigateur (cf. « Revoir le
    // tutoriel » dans le menu du compte).
    if (isReplayRequested()) {
      setOpen(true);
      return;
    }
    if (replayOnly) return;
    if (readFlag(STORAGE_KEY)) return;

    // Le popup d'accueil passe en premier QUAND il s'affiche : même condition
    // que ConseilsCenter (actif, et pas encore fermé définitivement). Sinon
    // aucun événement `mecn:welcome-closed` ne viendra jamais, et le tutoriel
    // resterait invisible.
    const accueilVaSAfficher = welcomeActive && !readFlag(WELCOME_KEY);
    if (!accueilVaSAfficher) {
      setOpen(true);
      return;
    }

    const handler = () => {
      setTimeout(() => setOpen(true), 400);
    };
    window.addEventListener('mecn:welcome-closed', handler);
    // Filet de sécurité : si le popup d'accueil est fermé autrement qu'avec sa
    // croix (navigation, rechargement), aucun événement n'arrive et le
    // tutoriel n'ouvrait jamais. Passé 12 s sans popup à l'écran, on l'ouvre.
    const fallback = window.setTimeout(() => {
      if (!document.querySelector('[data-welcome-popup]')) setOpen(true);
    }, 12_000);
    return () => {
      window.removeEventListener('mecn:welcome-closed', handler);
      window.clearTimeout(fallback);
    };
  }, [welcomeActive, replayOnly]);

  function close() {
    if (neverShow) writeFlag(STORAGE_KEY);
    setOpen(false);
  }

  const flags: ContentFlags = {
    fiche: offer === 'intensif' || offer === 'approfondi',
    video: offer === 'intensif',
    seanceApprofondie: offer === 'approfondi',
    entrainement: offer === 'essentiel' || offer === 'intensif',
    parcoursMajor,
  };

  const steps = buildSteps(flags);

  if (!open || steps.length === 0) return null;

  const step = steps[i];
  const last = i === steps.length - 1;
  const Icon = step.Icon;

  // Clic à côté = fermeture SIMPLE, sans mémoriser « ne plus afficher ». La case
  // étant cochée par défaut, un clic hors de la fenêtre suffisait à supprimer le
  // tutoriel définitivement : un geste involontaire coûtait toute la prise en
  // main. Seuls la croix, « Passer » et la fin du parcours engagent l'oubli.
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="student-tutorial-title"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
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
