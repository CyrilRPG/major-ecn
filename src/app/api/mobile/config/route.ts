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
  };
  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
  });
}
