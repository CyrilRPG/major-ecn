'use client';

/**
 * Popup "Espace découverte terminé !" — pixel-perfect maquette 5.
 * S'affiche quand l'étudiant a consommé tous les contenus de l'espace
 * découverte. Pousse fortement vers /tarifs.
 */
import Link from 'next/link';
import {
  ArrowRight, CalendarCheck, CheckCircle2, ClipboardCheck, FileText, FolderOpen,
  Layers3, Lock, PartyPopper, RefreshCw, Target, X,
} from 'lucide-react';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';
const GREEN = '#16793C';
const GREEN_LIGHT = '#22C55E';
const GREEN_BG = '#E7F6EC';
const BORDER = '#E5E9F0';

const PROGRESS_ITEMS = [
  { Icon: ClipboardCheck, color: '#C0112E', bg: '#FDEEEF', label: 'QCM',              sub: 'avec correction détaillée', val: '10', max: '10', unit: 'QCM consultés' },
  { Icon: FolderOpen,     color: '#2563EB', bg: '#E5F1FF', label: 'Dossier clinique', sub: 'corrigé et expliqué',       val: '1',  max: '1',  unit: 'dossier traité' },
  { Icon: FileText,       color: '#E8742C', bg: '#FFEAD9', label: 'Fiche pédagogique', sub: 'complète',                  val: '1',  max: '1',  unit: 'fiche consultée' },
  { Icon: Layers3,        color: '#7C3AED', bg: '#F1E8FD', label: 'Flashcards',        sub: 'pour réviser efficacement', val: '10', max: '10', unit: 'flashcards consultées' },
];

const TRUST_BADGES = [
  { Icon: CalendarCheck, t: 'Accès à la plateforme',  sub: 'pendant votre préparation' },
  { Icon: RefreshCw,     t: 'Contenus actualisés',    sub: 'tout au long de l’année' },
  { Icon: Target,        t: 'Préparation 100 %',      sub: 'dédiée aux EVC' },
];

export function DiscoveryCompleteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(15, 31, 77, 0.45)', backdropFilter: 'blur(2px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ maxHeight: '92vh', overflowY: 'auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#52607A] transition-colors hover:bg-[#F1F5F9]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pb-8 pt-9 sm:px-10 sm:pt-12">
          {/* Icône party top */}
          <div className="flex flex-col items-center text-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: GREEN_BG, color: GREEN }}
            >
              <PartyPopper className="h-8 w-8" />
            </span>
            <h2 id="complete-modal-title" className="mt-5 text-2xl font-black leading-tight sm:text-[28px]" style={{ color: NAVY }}>
              Espace découverte terminé !
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] sm:text-[15px]" style={{ color: INK_SOFT }}>
              Vous avez exploré une sélection de contenus
              <br />
              afin de découvrir la plateforme Major ECN.
            </p>
          </div>

          {/* Card "Contenus consultés" */}
          <div className="mt-6 rounded-2xl border p-5 sm:p-6" style={{ background: GREEN_BG, borderColor: 'rgba(34,197,94,0.25)' }}>
            <div className="flex items-center justify-center gap-2.5">
              <CheckCircle2 className="h-5 w-5" style={{ color: GREEN_LIGHT }} fill="white" />
              <p className="text-[15px] font-extrabold" style={{ color: GREEN }}>Contenus consultés</p>
            </div>

            <ul className="mt-5 space-y-1">
              {PROGRESS_ITEMS.map((p, i) => (
                <li key={p.label}>
                  <div className="flex items-center gap-4 py-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: p.bg, color: p.color }}
                    >
                      <p.Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-extrabold leading-tight" style={{ color: NAVY }}>{p.label}</p>
                      <p className="text-[11.5px]" style={{ color: INK_SOFT }}>{p.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-extrabold leading-tight" style={{ color: NAVY }}>
                        <span style={{ color: GREEN_LIGHT }}>{p.val}</span>
                        <span className="mx-1" style={{ color: INK_SOFT }}>/</span>
                        <span>{p.max}</span>
                      </p>
                      <p className="text-[10.5px]" style={{ color: INK_SOFT }}>{p.unit}</p>
                    </div>
                  </div>
                  {i < PROGRESS_ITEMS.length - 1 && (
                    <span className="block h-px w-full" style={{ background: 'rgba(34,197,94,0.18)' }} />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Bandeau "Vous avez exploré..." */}
          <div className="mt-5 rounded-2xl border p-5 text-center" style={{ background: '#F0FDF4', borderColor: 'rgba(34,197,94,0.25)' }}>
            <CheckCircle2 className="mx-auto h-6 w-6" style={{ color: GREEN_LIGHT }} />
            <p className="mt-2 text-[16px] font-extrabold leading-tight" style={{ color: GREEN }}>
              Vous avez exploré l’ensemble des
              <br />
              contenus de démonstration.
            </p>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
              Pour accéder à l&rsquo;intégralité des ressources pédagogiques
              de votre préparation EVC, consultez nos formules.
            </p>
          </div>

          {/* CTA principal */}
          <Link
            href="/tarifs"
            onClick={onClose}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-extrabold text-white shadow-[0_14px_35px_-15px_rgba(192,17,46,0.6)] transition-transform hover:scale-[1.01]"
            style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
          >
            <Lock className="h-5 w-5" />
            Voir les formules
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* 3 trust badges */}
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {TRUST_BADGES.map((b) => (
              <li key={b.t} className="flex items-start gap-2.5 rounded-xl border bg-white px-3 py-3" style={{ borderColor: BORDER }}>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: '#FDEEEF', color: RED }}
                >
                  <b.Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{b.t}</p>
                  <p className="mt-0.5 text-[10.5px] leading-tight" style={{ color: INK_SOFT }}>{b.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
