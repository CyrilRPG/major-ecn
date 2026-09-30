import { NextResponse } from 'next/server';
import { siteUrl } from '@/lib/email/send';
import { chargerParametres, resoudreJeton, tracerClic } from '@/lib/decouverte/serveur';
import { JETON_RE } from '@/lib/decouverte/jetons';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * /d/v/<jeton> — clic « vidéo » d'un e-mail (tracé SÉPARÉMENT du clic
 * plateforme, §18), puis redirection vers la page vidéo paramétrée
 * (défaut /visite-guidee). Sur une page du site, le jeton suit en `?acces=` :
 * le bouton sous la vidéo ramène au parcours d'accès du candidat (/d/a/…).
 * Jamais transmis à un site externe.
 */
export async function GET(req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  const base = siteUrl();
  const entetes = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
  try {
    const video = (await chargerParametres()).lienVideo || '/visite-guidee';
    const r = await resoudreJeton(jeton);
    if (r) await tracerClic(r, 'video', req.headers.get('user-agent'));
    const interne = video.startsWith('/') && !video.startsWith('//');
    const cible = interne ? new URL(video, base) : new URL(video);
    if (interne && r && JETON_RE.test(jeton)) cible.searchParams.set('acces', jeton);
    return NextResponse.redirect(cible, { status: 302, headers: entetes });
  } catch (e) {
    console.error('[d/v]', e instanceof Error ? e.message : e);
    return NextResponse.redirect(new URL('/visite-guidee', base), { status: 302, headers: entetes });
  }
}
