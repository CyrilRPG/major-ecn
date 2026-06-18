'use client';

/**
 * Bandeau d'information cookies.
 *
 * Le site n'utilise QUE des cookies strictement nécessaires (session
 * d'authentification, paiement Stripe) — exemptés de consentement préalable
 * (RGPD / lignes directrices CNIL). Un bandeau de consentement granulaire
 * n'est donc pas obligatoire : on affiche un bandeau d'INFORMATION, à la même
 * direction artistique que le tutoriel professeur, avec un lien vers la
 * politique de confidentialité.
 *
 * Mémorisé en localStorage (ne réapparaît plus une fois acquitté).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'major-ecn:cookie-notice-ack';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const ACCENT = '#E4002B';

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Léger délai pour ne pas gêner le premier rendu / LCP.
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function ack() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 sm:bottom-4 sm:right-4 sm:left-auto sm:justify-end sm:p-0">
      <div
        className="relative w-full max-w-md rounded-[24px] border border-[#E5E9F0] bg-white p-5 shadow-2xl sm:p-6"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        role="dialog"
        aria-label="Information cookies"
      >
        <button
          onClick={ack}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F1F5F9]"
          style={{ color: INK_SOFT }}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(228,0,43,0.10)', color: ACCENT }}
          >
            <Cookie className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-black tracking-tight" style={{ color: INK }}>
              Cookies &amp; confidentialité
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>
              Major ECN n’utilise que des cookies <strong>strictement nécessaires</strong> au
              fonctionnement du site (connexion à votre compte, paiement sécurisé). Aucun
              cookie publicitaire ni de traçage. En savoir plus dans notre{' '}
              <Link href="/confidentialite" className="font-semibold underline" style={{ color: ACCENT }}>
                politique de confidentialité
              </Link>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={ack}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-[14px] font-extrabold text-white shadow-[0_15px_35px_-15px_rgba(228,0,43,0.55)] transition-transform hover:scale-[1.01]"
          style={{ background: 'linear-gradient(90deg, #E4002B 0%, #F97316 100%)' }}
        >
          J’ai compris
        </button>
      </div>
    </div>
  );
}
