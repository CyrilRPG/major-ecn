import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/config — configuration distante de l'application mobile
 * (public, sans authentification). Récupérée au démarrage et mise en cache.
 *
 * - `ios_show_signup` / `android_show_signup` : affichage du bouton « S'inscrire »
 *   (lien externe vers la page d'inscription). Désactivable sur iOS pour la
 *   revue App Store (guideline 3.1.1) sans redéployer l'app.
 * - `min_app_version` : version minimale supportée ; en-deçà, l'app affiche un
 *   écran de mise à jour obligatoire.
 *
 * Piloté par variables d'environnement Vercel (modifiables sans redeploy natif).
 */
export async function GET() {
  const config = {
    ios_show_signup: process.env.MOBILE_IOS_SHOW_SIGNUP === 'true',
    android_show_signup: process.env.MOBILE_ANDROID_SHOW_SIGNUP !== 'false',
    min_app_version: process.env.MOBILE_MIN_APP_VERSION ?? '1.0.0',
    signup_url: process.env.MOBILE_SIGNUP_URL ?? 'https://major-ecn.fr/inscription',
    site_url: 'https://major-ecn.fr',
    // Destinations de l'écran « Mise à jour requise ». Servies par le serveur
    // parce que l'identifiant App Store n'existe qu'une fois la fiche créée :
    // le figer dans le binaire imposait de republier l'app pour le corriger.
    // Tant que `MOBILE_IOS_STORE_URL` n'est pas renseignée, on renvoie la
    // recherche App Store — un lien qui aboutit, au lieu d'un `id000000000`
    // qui affiche une page d'erreur.
    ios_store_url: process.env.MOBILE_IOS_STORE_URL
      ?? 'https://apps.apple.com/fr/search?term=Major%20ECN',
    android_store_url: process.env.MOBILE_ANDROID_STORE_URL
      ?? 'https://play.google.com/store/apps/details?id=fr.majorecn.app',
  };
  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
  });
}
