'use client';

/**
 * Popup "Information importante avant votre inscription" — pixel-perfect.
 *
 * S'ouvre AVANT la redirection vers Stripe Checkout, à chaque tentative
 * de paiement. La couleur principale s'aligne sur la formule choisie
 * (Essentielle vert, Intensive rouge, Approfondi bleu).
 *
 * Le bouton "Poursuivre vers le paiement" déclenche `onContinue` qui
 * relance le flux Stripe normalement.
 */
import { Calendar, HeadphonesIcon, Lock, Rocket, X } from 'lucide-react';

export type InfoPopupColor = {
  deep: string;
  main: string;
  soft: string;       // pour le badge top icon + cards bg
  border: string;     // pour la bordure des cards
  text: string;       // texte fort en couleur formule
};

const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const BORDER = '#E5E9F0';

/** Date d'ouverture progressive du contenu complet (mardi 16 juin 2026). */
const RELEASE_DATE_LABEL = 'mardi 16 juin 2026';

export function InfoImportantePopup({
  open,
  onClose,
  onContinue,
  color,
}: {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  color: InfoPopupColor;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(15, 31, 77, 0.55)', backdropFilter: 'blur(3px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-popup-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
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

        <div className="px-6 pb-7 pt-9 sm:px-9 sm:pt-11">
          {/* Header — fusée + titre */}
          <div className="flex flex-col items-center text-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: color.soft, color: color.main }}
            >
              <Rocket className="h-7 w-7" />
            </span>
            <h2 id="info-popup-title" className="mt-4 text-[24px] font-black leading-tight sm:text-[26px]" style={{ color: NAVY }}>
              Information importante
              <br />
              <span className="text-[20px] sm:text-[22px] font-bold" style={{ color: INK_SOFT }}>
                avant votre inscription
              </span>
            </h2>
            {/* Petite barre d'accent sous le titre */}
            <span
              aria-hidden
              className="mt-3 block h-[3px] w-12 rounded-full"
              style={{ background: color.main }}
            />
          </div>

          {/* Bloc 1 — Phase de déploiement (encart couleur formule) */}
          <div
            className="mt-6 flex items-start gap-3 rounded-2xl p-4"
            style={{ background: color.soft, border: `1px solid ${color.border}` }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: '#FFFFFF', color: color.main }}
            >
              <Calendar className="h-4.5 w-4.5" />
            </span>
            <p className="text-[13.5px] leading-relaxed" style={{ color: INK }}>
              La nouvelle plateforme Major ECN est actuellement dans sa{' '}
              <strong style={{ color: color.text }}>phase finale de déploiement.</strong>
            </p>
          </div>

          {/* Bloc 2 — Espace découverte */}
          <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            L&rsquo;espace découverte est déjà accessible et vous permet de découvrir
            l&rsquo;environnement de travail, les QCM, les flashcards, les dossiers
            cliniques et les ressources pédagogiques proposés.
          </p>

          {/* Bloc 3 — Date de mise à disposition (icone calendrier + texte) */}
          <div className="mt-4 flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: color.soft, color: color.main }}
            >
              <Calendar className="h-4.5 w-4.5" />
            </span>
            <p className="text-[13.5px] leading-relaxed" style={{ color: INK }}>
              <strong style={{ color: INK }}>Le contenu complet de votre formule</strong>{' '}
              sera progressivement mis à disposition à partir du{' '}
              <strong style={{ color: color.text }}>{RELEASE_DATE_LABEL}.</strong>
            </p>
          </div>

          {/* Bloc 4 — Inscription anticipée */}
          <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Votre inscription réalisée aujourd&rsquo;hui vous permettra de bénéficier
            automatiquement de l&rsquo;ensemble des contenus dès leur publication.
          </p>

          {/* Bloc 5 — Validation pédagogique */}
          <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Nos équipes pédagogiques finalisent actuellement les dernières validations
            afin de garantir la qualité des ressources proposées.
          </p>

          {/* Bloc 6 — Support équipe (encart couleur formule, icone casque) */}
          <div
            className="mt-5 flex items-start gap-3 rounded-2xl p-4"
            style={{ background: color.soft, border: `1px solid ${color.border}` }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: '#FFFFFF', color: color.main }}
            >
              <HeadphonesIcon className="h-4.5 w-4.5" />
            </span>
            <p className="text-[13px] leading-relaxed" style={{ color: INK }}>
              Si vous avez la moindre question concernant votre formule ou son
              contenu, notre équipe reste disponible pour vous accompagner.
            </p>
          </div>

          {/* Boutons */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr]">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-3.5 text-[14px] font-extrabold transition-colors hover:bg-[#F8FAFC]"
              style={{ borderColor: BORDER, color: NAVY }}
            >
              Retour
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[14px] font-extrabold text-white shadow-[0_14px_35px_-15px_rgba(0,0,0,0.30)] transition-transform hover:scale-[1.01]"
              style={{ background: `linear-gradient(90deg, ${color.deep} 0%, ${color.main} 100%)` }}
            >
              Poursuivre vers le paiement
              <span aria-hidden>→</span>
            </button>
          </div>

          {/* Footer — paiement 100% sécurisé */}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px]" style={{ color: INK_SOFT }}>
            <Lock className="h-3 w-3" />
            Paiement 100&nbsp;% sécurisé
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Palettes pré-définies par formule (couleurs site vitrine)
   ============================================================ */
export const FORMULE_COLORS: Record<'essentielle' | 'intensive' | 'programme-approfondi', InfoPopupColor> = {
  essentielle: {
    deep: '#1B5E20',
    main: '#16793C',
    soft: '#E7F6EC',
    border: '#C6EBD2',
    text: '#16793C',
  },
  intensive: {
    deep: '#8B0E22',
    main: '#C0112E',
    soft: '#FDEEEF',
    border: '#F5C2C7',
    text: '#C0112E',
  },
  'programme-approfondi': {
    deep: '#1E3A8A',
    main: '#1E40AF',
    soft: '#EFF4FF',
    border: '#BFD0F5',
    text: '#1E40AF',
  },
};
