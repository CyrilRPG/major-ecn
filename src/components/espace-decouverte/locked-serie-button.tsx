'use client';

/**
 * Bouton de série QCM verrouillée pour le mode Découverte.
 * Visuellement GRISÉ pour signaler instantanément que la série n'est pas
 * accessible. Au clic, déclenche LockedContentModal (popup tarifs).
 */
import { useState } from 'react';
import { ArrowRight, ClipboardList, GraduationCap, Lock, Trophy } from 'lucide-react';
import { LockedContentModal } from './locked-content-modal';

type Kind = 'qcm' | 'dp' | 'entrainement';

/* Palette grisée commune — on perd la couleur d'origine du type (bleu/rouge/
 * vert) pour rendre la série visuellement "désactivée". On garde uniquement
 * la sémantique via le badge texte (QCM / DP / Entraînement). */
const GRAY_BAR = '#CBD5E1';   // slate-300
const GRAY_BG  = '#F1F5F9';   // slate-100
const GRAY_FG  = '#94A3B8';   // slate-400
const GRAY_INK = '#64748B';   // slate-500

const KIND_LABEL: Record<Kind, string> = {
  qcm: 'QCM',
  dp: 'DP',
  entrainement: 'Entraînement',
};

export function LockedSerieButton({
  label,
  idx,
  kind,
}: {
  label: string;
  idx: number;
  kind: Kind;
}) {
  const [open, setOpen] = useState(false);
  const Icon = kind === 'entrainement' ? Trophy : kind === 'dp' ? ClipboardList : GraduationCap;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-[#FAFBFD] px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:bg-[#F1F5F9] focus:outline-none"
        style={{ borderColor: '#E2E8F0' }}
        aria-label={`${KIND_LABEL[kind]} verrouillé : ${label}`}
      >
        {/* Barre verticale grisée à gauche (au lieu de la couleur du type). */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: GRAY_BAR }} />
        <span
          className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: GRAY_BG, color: GRAY_FG }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
          style={{ background: GRAY_BG, color: GRAY_FG }}
        >
          {String(idx + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold" style={{ color: GRAY_INK }}>
            {label}
          </p>
          <p className="text-xs" style={{ color: GRAY_FG }}>
            Réservé aux élèves inscrits
          </p>
        </div>
        {/* Cadenas rouge — seul élément qui garde la couleur d'accent pour
            indiquer clairement que c'est verrouillable au clic. */}
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#FDEEEF', color: '#C0112E' }}
          aria-hidden
        >
          <Lock className="h-3.5 w-3.5" />
        </span>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: GRAY_BG, color: GRAY_FG }}
        >
          {KIND_LABEL[kind]}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: GRAY_FG }} />
      </button>
      <LockedContentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
