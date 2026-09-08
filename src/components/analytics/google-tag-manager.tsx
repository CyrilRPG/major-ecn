import { GTM_ID } from '@/lib/analytics/consent';

/**
 * Conteneur Google Tag Manager, avec mode consentement (Consent Mode v2).
 *
 * Contexte : après la refonte du site, plus aucune balise Google n'était
 * posée — vérifié le 08/09/2026 sur `/`, `/contact` et `/tarifs`, zéro
 * occurrence de `googletagmanager.com`. Les trois actions de conversion du
 * compte Google Ads (formulaire de contact, formulaire d'inscription, suivi
 * des appels) étaient donc toutes en « Mauvaise configuration » : le site ne
 * remontait plus rien.
 *
 * Deux garde-fous, dans cet ordre :
 *
 *  1. RIEN n'est chargé tant que `NEXT_PUBLIC_GTM_ID` n'est pas renseignée.
 *     Le code peut donc être déployé avant que le conteneur existe, sans rien
 *     changer au site ni au bandeau cookies.
 *  2. Le mode consentement est initialisé AVANT le conteneur, tout en
 *     « denied ». La balise se charge, mesure de façon anonyme, mais n'écrit
 *     aucun cookie publicitaire tant que l'utilisateur n'a pas accepté — ce
 *     que le RGPD et les lignes directrices CNIL exigent d'un cookie
 *     publicitaire, qui n'est pas « strictement nécessaire ».
 *
 * Balises `<script>` brutes plutôt que `next/script` : l'ordre d'exécution est
 * ici la seule chose qui compte, et `next/script` en `beforeInteractive` s'est
 * déjà montré capricieux dans ce projet (React avertit qu'un script écrit dans
 * l'arbre n'est pas exécuté lors d'un rendu client, cf.
 * `components/auth/rattrapage-lien-natif.tsx`). Une balise inline part dans le
 * HTML rendu par le serveur et s'exécute à l'analyse du document, avant tout.
 *
 * L'acceptation passe ensuite par `ecrireConsentement()`, qui appelle
 * `gtag('consent','update',…)` : sans cet appel, la balise resterait muette
 * même après acceptation.
 */

const scriptConsentement = (gtmId: string) => `(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  // Défauts REFUSÉS, déclarés avant le conteneur : un conteneur chargé sans
  // défauts considère le consentement comme accordé.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
  try {
    if (window.localStorage.getItem('major-ecn:consent-mesure') === 'granted') {
      gtag('consent', 'update', {
        ad_storage: 'granted', ad_user_data: 'granted',
        ad_personalization: 'granted', analytics_storage: 'granted'
      });
    }
  } catch (e) { /* stockage bloqué : on reste sur le refus */ }
  // Conteneur GTM.
  (function(w,d,s,l,i){
    w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s);
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', ${JSON.stringify(gtmId)});
})();`;

export function GoogleTagManager() {
  if (!GTM_ID) return null;
  return <script dangerouslySetInnerHTML={{ __html: scriptConsentement(GTM_ID) }} />;
}

/** Repli sans JavaScript. Doit rester en tout début de `<body>`. */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
