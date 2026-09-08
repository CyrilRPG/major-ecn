/**
 * Consentement publicitaire / mesure d'audience.
 *
 * Pourquoi ce module existe
 * -------------------------
 * Jusqu'au 08/09/2026 le site ne posait QUE des cookies strictement
 * nécessaires (session d'authentification, paiement Stripe), exemptés de
 * consentement préalable : le bandeau était un simple bandeau d'INFORMATION,
 * et c'est écrit noir sur blanc dans `cookie-consent-banner.tsx`.
 *
 * Le suivi des conversions Google Ads change cette situation : il dépose des
 * cookies publicitaires, qui eux exigent un opt-in EXPLICITE et PRÉALABLE
 * (RGPD, lignes directrices CNIL). Poser la balise sans le demander rendrait
 * le site non conforme — et rendrait faux le texte du bandeau lui-même.
 *
 * D'où ce module : une décision explicite de l'utilisateur, mémorisée, et
 * relayée au « mode consentement » de Google (Consent Mode v2). Tant que
 * l'utilisateur n'a pas accepté, la balise se charge en mode restreint et
 * n'écrit aucun cookie publicitaire.
 *
 * Le tout ne s'active que si `NEXT_PUBLIC_GTM_ID` est renseignée : sans
 * conteneur GTM configuré, aucun suivi n'existe et le bandeau reste le
 * bandeau d'information d'origine.
 */

export type ConsentState = 'granted' | 'denied' | 'unknown';

const STORAGE_KEY = 'major-ecn:consent-mesure';
/** Émis à chaque changement, pour que les composants montés se resynchronisent. */
export const CONSENT_EVENT = 'major-ecn:consent-change';

/** Identifiant du conteneur GTM. Vide = aucun suivi, aucun consentement à demander. */
export const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID ?? '').trim();

/** Le suivi est-il configuré sur cet environnement ? */
export const suiviConfigure = (): boolean => GTM_ID.length > 0;

export function lireConsentement(): ConsentState {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : 'unknown';
  } catch {
    // Navigation privée, stockage bloqué : on considère qu'il n'y a pas de
    // consentement, jamais l'inverse.
    return 'unknown';
  }
}

/**
 * Enregistre la décision et la transmet à Google.
 *
 * `gtag('consent', 'update', …)` est la seule façon de débloquer les cookies
 * publicitaires après un chargement en mode restreint ; sans cet appel, la
 * balise resterait muette même après acceptation.
 */
export function ecrireConsentement(etat: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, etat); } catch { /* stockage indisponible */ }

  const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  // `gtag` est défini par le script de mode consentement (cf. GoogleTagManager).
  w.gtag?.('consent', 'update', {
    ad_storage: etat,
    ad_user_data: etat,
    ad_personalization: etat,
    analytics_storage: etat,
  });
  w.dataLayer.push({ event: 'consent_update', consent_state: etat });
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: etat }));
}
