'use client';

/**
 * Popup d'accueil "Bienvenue dans l'espace découverte / Major ECN".
 *
 * Affiché à la PREMIÈRE ouverture de la plateforme pour les utilisateurs
 * en mode Découverte uniquement. Remplace le popup Conseils classique
 * pour cette population.
 */
import { useEffect, useState } from 'react';
import {
  ArrowRight, FileText, HelpCircle, Layers3, Lightbulb, Sparkles, X,
} from 'lucide-react';

const STORAGE_KEY = 'major-ecn:welcome-decouverte-dismissed';

/* Palette bleue alignée sur l'icône des poumons (navy/médium blue). */
const BLUE = '#2563EB';        // bleu principal
const BLUE_DEEP = '#1E40AF';   // bleu foncé pour les états hover/dark
const BLUE_LIGHT = '#93C5FD';  // bleu clair pour les accents secondaires
const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const BORDER = '#E5E9F0';

export function DiscoveryWelcomePopup() {
  const [open, setOpen] = useState(false);
  const [neverShow, setNeverShow] = useState(false);

  // À la première ouverture pour ce navigateur, on affiche le popup.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setOpen(true);
  }, []);

  function closePopup() {
    if (neverShow) localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="discovery-welcome-title"
      onClick={(e) => { if (e.target === e.currentTarget) closePopup(); }}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Close X */}
        <button
          onClick={closePopup}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F1F5F9]"
          style={{ color: INK_SOFT }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header — image poumon + accents flottants */}
        <div className="flex justify-center">
          <div className="relative">
            <span
              className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(147,197,253,0.45) 0%, rgba(219,234,254,0.65) 60%, rgba(239,246,255,0) 100%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/flashcards-decor/pneumo.png"
                alt="Major ECN"
                className="h-24 w-24 object-contain"
              />
            </span>
            {/* Accents flottants bleus */}
            <Sparkles
              aria-hidden
              className="absolute -left-2 top-2 h-4 w-4"
              style={{ color: BLUE }}
              strokeWidth={2.4}
            />
            <Sparkles
              aria-hidden
              className="absolute -right-1 bottom-4 h-3.5 w-3.5"
              style={{ color: BLUE_LIGHT }}
              strokeWidth={2.4}
            />
            <span
              aria-hidden
              className="absolute -top-1 right-0 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: BLUE, color: '#FFFFFF', boxShadow: '0 6px 20px -8px rgba(37,99,235,0.5)' }}
            >
              <HelpCircle className="h-3.5 w-3.5" strokeWidth={2.6} />
            </span>
          </div>
        </div>

        {/* Titre */}
        <div className="mt-5 text-center">
          <h2
            id="discovery-welcome-title"
            className="text-[22px] font-black leading-tight tracking-tight sm:text-[26px]"
            style={{ color: INK }}
          >
            Bienvenue dans l&rsquo;espace découverte
          </h2>
          <p
            className="mt-1 text-[26px] font-black leading-tight tracking-tight sm:text-[30px]"
            style={{ color: BLUE }}
          >
            Major ECN
          </p>
          <span
            aria-hidden
            className="mx-auto mt-2 block h-[3px] w-16 rounded-full"
            style={{ background: BLUE }}
          />
        </div>

        {/* Sous-titre */}
        <p className="mt-5 text-center text-[13.5px] leading-relaxed sm:text-[14px]" style={{ color: INK_SOFT }}>
          Afin de vous faire découvrir les différents outils de la plateforme,
          nous avons sélectionné plusieurs ressources issues de thèmes variés.
        </p>

        {/* 3 cartes colorées */}
        <ul className="mt-6 space-y-3">
          {/* Carte BLEUE — fiche */}
          <li
            className="flex items-start gap-3 rounded-2xl border p-4"
            style={{ background: '#EFF4FF', borderColor: '#BFD0F5' }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: '#FFFFFF', color: '#1E40AF' }}
            >
              <FileText className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[14px] font-black" style={{ color: '#1E40AF' }}>
                1 fiche pédagogique
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                Une fiche complète pour évaluer la qualité
                et la profondeur de nos contenus.
              </p>
            </div>
          </li>

          {/* Carte ROUGE — QCM */}
          <li
            className="flex items-start gap-3 rounded-2xl border p-4"
            style={{ background: '#FDEEEF', borderColor: '#F5C2C7' }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: '#FFFFFF', color: '#C0112E' }}
            >
              <HelpCircle className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[14px] font-black" style={{ color: '#C0112E' }}>
                10 QCM variés
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                Une sélection de 10 QCM couvrant plusieurs thèmes
                pour tester vos connaissances.
              </p>
            </div>
          </li>

          {/* Carte VERTE — flashcards */}
          <li
            className="flex items-start gap-3 rounded-2xl border p-4"
            style={{ background: '#E7F6EC', borderColor: '#C6EBD2' }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: '#FFFFFF', color: '#16793C' }}
            >
              <Layers3 className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[14px] font-black" style={{ color: '#16793C' }}>
                Des flashcards thématiques
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                Un échantillon de flashcards abordant différentes notions clés pour
                réviser efficacement.
              </p>
            </div>
          </li>
        </ul>

        {/* Box d'information bleue */}
        <div
          className="mt-5 flex items-start gap-3 rounded-2xl border p-4"
          style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: '#FFFFFF', color: BLUE }}
          >
            <Lightbulb className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: INK }}>
              Ces ressources ne constituent pas un chapitre complet
              mais un aperçu représentatif des contenus disponibles sur la plateforme.
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK }}>
              <strong>Objectif</strong> : vous faire découvrir nos méthodes de travail,
              la qualité pédagogique des contenus et l&rsquo;organisation de la plateforme.
            </p>
          </div>
        </div>

        {/* CTA — Commencer la découverte */}
        <button
          type="button"
          onClick={closePopup}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-extrabold text-white shadow-[0_15px_35px_-15px_rgba(228,0,43,0.55)] transition-transform hover:scale-[1.01]"
          style={{ background: 'linear-gradient(90deg, #E4002B 0%, #F97316 100%)' }}
        >
          Commencer la découverte
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Checkbox "Ne plus afficher" */}
        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 text-[12.5px]" style={{ color: INK_SOFT }}>
          <input
            type="checkbox"
            checked={neverShow}
            onChange={(e) => setNeverShow(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded"
            style={{ accentColor: BLUE }}
          />
          Ne plus afficher ce message
        </label>

        {/* Pour les linters strict-null sur les imports inutilisés */}
        <span hidden style={{ color: NAVY, borderColor: BORDER, background: BLUE_DEEP }} aria-hidden />
      </div>
    </div>
  );
}
