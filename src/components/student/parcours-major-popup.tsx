'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Crown, ListChecks, Sparkles, Stethoscope, X } from 'lucide-react';
import {
  ONBOARDING_KEYS, declareStep, isReplayRequested, markStepActive, markStepDone,
  readFlag, whenStepTurnComes, writeFlag,
} from '@/lib/student/onboarding';

/**
 * Annonce de la section « Parcours du Major ».
 *
 * Elle n'existait que sous forme d'une 7ᵉ étape du gros tutoriel : un élève qui
 * le passait — ce que le bouton « Passer » invite à faire — n'entendait jamais
 * parler de la section. Elle a désormais son propre popup, affiché une fois,
 * automatiquement, aux seuls élèves qui y ont accès.
 *
 * Position dans la chaîne : après le popup d'accueil et le gros tutoriel, avant
 * les flèches sur le menu (cf. SETTLE_POLLS).
 */
const STORAGE_KEY = ONBOARDING_KEYS.parcoursMajor;

const OR = '#B8860B';
const INK = '#1F2937';
const INK_SOFT = '#52607A';

const POINTS: { Icon: typeof Crown; titre: string; texte: string }[] = [
  {
    Icon: CalendarDays,
    titre: '42 parcours, deux par semaine',
    texte: 'Deux nouveaux parcours s’ouvrent chaque lundi. Terminez celui en cours pour débloquer le suivant.',
  },
  {
    Icon: Stethoscope,
    titre: 'Un rappel, un cas, des questions',
    texte: 'Chaque parcours enchaîne un rappel du coach, un cas clinique commenté et une série de QCM.',
  },
  {
    Icon: ListChecks,
    titre: 'Noté sur 10',
    texte: 'Vous voyez immédiatement où vous en êtes, parcours après parcours, jusqu’au jour J.',
  },
];

export function ParcoursMajorPopup({ replayOnly = false }: {
  /** Comptes non-élèves : l'annonce n'apparaît qu'à la demande (`?tutoriel=1`). */
  replayOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);

  // 3ᵉ étape : le popup d'accueil puis le gros tutoriel passent devant.
  useEffect(() => {
    const replay = isReplayRequested();
    const vaSAfficher = replay || (!replayOnly && !readFlag(STORAGE_KEY));
    const retirer = declareStep('parcoursMajor', vaSAfficher);
    if (!vaSAfficher) return retirer;
    const annuler = whenStepTurnComes('parcoursMajor', () => {
      markStepActive('parcoursMajor');
      setOpen(true);
    });
    return () => { annuler(); retirer(); };
  }, [replayOnly]);

  const close = useCallback(() => {
    writeFlag(STORAGE_KEY);
    markStepDone('parcoursMajor');
    setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="parcours-major-title"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F1F5F9]"
          style={{ color: INK_SOFT }}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex justify-center">
          <div className="relative">
            <span
              className="flex h-24 w-24 items-center justify-center rounded-full"
              style={{ background: `radial-gradient(circle at 50% 50%, ${OR}33 0%, ${OR}1A 55%, ${OR}00 100%)` }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white"
                style={{ color: OR, boxShadow: `0 10px 30px -12px ${OR}80` }}
              >
                <Crown className="h-7 w-7" strokeWidth={2.2} />
              </span>
            </span>
            <Sparkles aria-hidden className="absolute -left-2 top-1 h-4 w-4" style={{ color: OR }} strokeWidth={2.4} />
          </div>
        </div>

        <div className="mt-4 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em]"
            style={{ background: '#FFFBEB', color: OR }}
          >
            Nouveau dans votre espace
          </span>
          <h2
            id="parcours-major-title"
            className="mt-3 text-[22px] font-black leading-tight tracking-tight sm:text-[26px]"
            style={{ color: INK }}
          >
            Le Parcours du Major
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Un chemin balisé, du premier jour jusqu’aux EVC. Vous avancez à un rythme
            tenu par la plateforme, sans avoir à décider quoi réviser ensuite.
          </p>
          <span aria-hidden className="mx-auto mt-3 block h-[3px] w-16 rounded-full" style={{ background: OR }} />
        </div>

        <div className="mt-5 space-y-2.5">
          {POINTS.map(({ Icon, titre, texte }) => (
            <div
              key={titre}
              className="flex items-start gap-3 rounded-2xl border p-3.5"
              style={{ background: '#FFFBEB', borderColor: '#E9D8A6' }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white"
                style={{ color: OR }}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-extrabold" style={{ color: INK }}>{titre}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{texte}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-2xl border px-4 py-3.5 text-[14px] font-bold transition-colors hover:bg-[#F8FAFC] sm:w-auto"
            style={{ borderColor: '#E5E9F0', color: INK_SOFT }}
          >
            Plus tard
          </button>
          <Link
            href="/parcours"
            onClick={close}
            className="flex w-full flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_15px_35px_-15px_rgba(184,134,11,0.65)] transition-transform hover:scale-[1.01]"
            style={{ background: `linear-gradient(90deg, ${OR} 0%, #E4A020 100%)` }}
          >
            Découvrir le Parcours <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
