'use client';

/**
 * Popup "Ce contenu est réservé" — pixel-perfect maquette 4.
 * Affichée quand un étudiant en espace découverte clique sur un cadenas.
 * Pousse vers /tarifs (DécouvrirNos formules) + lien pour rester en découverte.
 */
import Link from 'next/link';
import {
  ArrowRight, Award, BookOpen, CalendarCheck, ClipboardCheck, FileText,
  Layers3, Lock, RefreshCw, Stethoscope, Target, Trophy, Video, X,
} from 'lucide-react';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const PINK_BG = '#FDEEEF';
const BORDER = '#E5E9F0';

const FEATURES = [
  { Icon: ClipboardCheck, color: '#C0112E', bg: '#FDEEEF', bold: 'Des milliers de QCM',                rest: 'avec corrections détaillées' },
  { Icon: BookOpen,       color: '#C0112E', bg: '#FDEEEF', bold: 'Des fiches complètes',                rest: 'rédigées par des experts' },
  { Icon: Stethoscope,    color: '#C0112E', bg: '#FDEEEF', bold: 'Des cas cliniques',                   rest: 'corrigés et commentés' },
  { Icon: Layers3,        color: '#C0112E', bg: '#FDEEEF', bold: 'Des flashcards',                      rest: 'pour mémoriser efficacement' },
  { Icon: Target,         color: '#C0112E', bg: '#FDEEEF', bold: 'Des évaluations régulières*',         rest: 'pour suivre votre progression' },
  { Icon: Award,          color: '#C0112E', bg: '#FDEEEF', bold: 'Des épreuves blanches & analyses concours*', rest: 'pour vous entraîner' },
  { Icon: Video,          color: '#C0112E', bg: '#FDEEEF', bold: 'Sessions live & replays*',            rest: 'avec nos enseignants' },
  { Icon: FileText,       color: '#C0112E', bg: '#FDEEEF', bold: 'Ressources par spécialité',           rest: 'adaptées à votre concours' },
];

const TRUST_BADGES = [
  { Icon: CalendarCheck, t: 'Accès à la plateforme',        sub: 'pendant votre préparation' },
  { Icon: RefreshCw,     t: 'Contenus actualisés',          sub: 'tout au long de l’année' },
  { Icon: Target,        t: 'Préparation 100 %',            sub: 'dédiée aux EVC' },
];

export function LockedContentModal({
  open,
  onClose,
  onContinueDiscovery,
}: {
  open: boolean;
  onClose: () => void;
  /** Bouton "Continuer dans l'espace découverte" — facultatif. */
  onContinueDiscovery?: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(15, 31, 77, 0.45)', backdropFilter: 'blur(2px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ maxHeight: '92vh', overflowY: 'auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Close X */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#52607A] transition-colors hover:bg-[#F1F5F9]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pb-8 pt-9 sm:px-10 sm:pt-12">
          {/* Icône cadenas top centre */}
          <div className="flex flex-col items-center text-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: PINK_BG, color: RED }}
            >
              <Lock className="h-7 w-7" />
            </span>
            <p className="mt-3 text-[13px] font-extrabold uppercase tracking-[0.12em]" style={{ color: RED }}>
              Ce contenu est réservé
            </p>
            <h2 id="locked-modal-title" className="mt-3 text-2xl font-black leading-tight sm:text-[28px]" style={{ color: NAVY }}>
              Accédez à l’ensemble des ressources
              <br className="hidden sm:block" />
              {' '}de votre <span style={{ color: RED }}>préparation EVC</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] sm:text-[15px]" style={{ color: INK_SOFT }}>
              Toutes nos ressources sont conçues pour vous aider à réussir
              les Épreuves de Vérification des Connaissances (EVC).
            </p>
          </div>

          {/* Grid 8 features */}
          <div className="mt-7 rounded-2xl p-5 sm:p-6" style={{ background: '#FDF8F8' }}>
            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f.bold} className="flex items-start gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                    style={{ background: f.bg, color: f.color }}
                  >
                    <f.Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{f.bold}</p>
                    <p className="mt-0.5 text-[12px] leading-tight" style={{ color: INK_SOFT }}>{f.rest}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-center text-[11px]" style={{ color: INK_SOFT }}>
            * Disponibles selon la formule choisie. Le détail des contenus est indiqué sur chaque formule.
          </p>

          {/* CTA principal */}
          <Link
            href="/tarifs"
            onClick={onClose}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-extrabold text-white shadow-[0_14px_35px_-15px_rgba(192,17,46,0.6)] transition-transform hover:scale-[1.01]"
            style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
          >
            <Lock className="h-5 w-5" />
            Découvrir nos formules
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* 3 trust badges */}
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {TRUST_BADGES.map((b) => (
              <li key={b.t} className="flex items-start gap-2.5 rounded-xl border bg-white px-3 py-3" style={{ borderColor: BORDER }}>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: PINK_BG, color: RED }}
                >
                  <b.Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12px] font-extrabold leading-tight" style={{ color: NAVY }}>{b.t}</p>
                  <p className="mt-0.5 text-[11px] leading-tight" style={{ color: INK_SOFT }}>{b.sub}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Séparateur "ou" + lien continuer découverte */}
          <div className="mt-6 flex items-center gap-4">
            <span className="h-px flex-1" style={{ background: BORDER }} />
            <span className="text-xs font-medium" style={{ color: INK_SOFT }}>ou</span>
            <span className="h-px flex-1" style={{ background: BORDER }} />
          </div>

          <button
            type="button"
            onClick={() => { onClose(); onContinueDiscovery?.(); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border bg-white px-6 py-3.5 text-[14px] font-extrabold transition-colors hover:bg-[#F8FAFC]"
            style={{ borderColor: BORDER, color: NAVY }}
          >
            Continuer dans l’espace découverte
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
