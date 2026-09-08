'use client';

/**
 * Bandeau cookies — deux régimes, selon ce que le site dépose réellement.
 *
 * SANS suivi publicitaire (`NEXT_PUBLIC_GTM_ID` absente) : le site n'utilise
 * QUE des cookies strictement nécessaires (session d'authentification,
 * paiement Stripe), exemptés de consentement préalable (RGPD / lignes
 * directrices CNIL). Un simple bandeau d'INFORMATION suffit.
 *
 * AVEC suivi publicitaire (conteneur GTM configuré) : les cookies Google Ads
 * ne sont pas « strictement nécessaires » et exigent un opt-in EXPLICITE et
 * PRÉALABLE. Le bandeau devient alors un vrai choix « Accepter » / « Refuser »,
 * sans case pré-cochée ni refus relégué à un second écran, et le texte cesse
 * d'affirmer qu'aucun cookie publicitaire n'est déposé — ce qui serait faux.
 *
 * Le basculement est automatique : renseigner la variable d'environnement
 * suffit, il n'y a pas deux bandeaux à maintenir.
 *
 * Mémorisé en localStorage (ne réapparaît plus une fois la décision prise).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { ecrireConsentement, lireConsentement, suiviConfigure } from '@/lib/analytics/consent';

const STORAGE_KEY = 'major-ecn:cookie-notice-ack';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const ACCENT = '#E4002B';

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);

  // Valeur de compilation, identique serveur et client : pas d'état, pas de
  // rendu en cascade.
  const suivi = suiviConfigure();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dejaRepondu = suivi
      ? lireConsentement() !== 'unknown'
      : Boolean(localStorage.getItem(STORAGE_KEY));
    if (dejaRepondu) return;
    // Léger délai pour ne pas gêner le premier rendu / LCP.
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [suivi]);

  function ack() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setOpen(false);
  }

  function repondre(etat: 'granted' | 'denied') {
    ecrireConsentement(etat);
    ack();
  }

  // Fermer sans choisir vaut REFUS : l'absence de réponse ne peut jamais
  // valoir acceptation.
  const fermer = () => (suivi ? repondre('denied') : ack());

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
          onClick={fermer}
          aria-label={suivi ? 'Refuser et fermer' : 'Fermer'}
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
              {suivi ? (
                <>
                  Les cookies <strong>strictement nécessaires</strong> (connexion à votre compte,
                  paiement sécurisé) restent toujours actifs. Nous aimerions y ajouter des
                  cookies de <strong>mesure d’audience et de publicité</strong>, pour savoir
                  quelles annonces vous ont amené jusqu’à nous. Vous pouvez refuser : le site
                  fonctionne à l’identique. En savoir plus dans notre{' '}
                </>
              ) : (
                <>
                  Major ECN n’utilise que des cookies <strong>strictement nécessaires</strong> au
                  fonctionnement du site (connexion à votre compte, paiement sécurisé). Aucun
                  cookie publicitaire ni de traçage. En savoir plus dans notre{' '}
                </>
              )}
              <Link href="/confidentialite" className="font-semibold underline" style={{ color: ACCENT }}>
                politique de confidentialité
              </Link>.
            </p>
          </div>
        </div>

        {suivi ? (
          // Deux boutons de MÊME poids visuel : un refus plus discret que
          // l'acceptation ne vaudrait pas un consentement libre.
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => repondre('denied')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-[14px] font-extrabold transition-colors hover:bg-[#F8FAFC]"
              style={{ borderColor: '#E5E9F0', color: INK }}
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={() => repondre('granted')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-[14px] font-extrabold text-white shadow-[0_15px_35px_-15px_rgba(228,0,43,0.55)] transition-transform hover:scale-[1.01]"
              style={{ background: 'linear-gradient(90deg, #E4002B 0%, #F97316 100%)' }}
            >
              Accepter
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={ack}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-[14px] font-extrabold text-white shadow-[0_15px_35px_-15px_rgba(228,0,43,0.55)] transition-transform hover:scale-[1.01]"
            style={{ background: 'linear-gradient(90deg, #E4002B 0%, #F97316 100%)' }}
          >
            J’ai compris
          </button>
        )}
      </div>
    </div>
  );
}
