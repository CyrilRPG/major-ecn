import { NextResponse } from 'next/server';
import { renvoyerLien, resoudreJeton } from '@/lib/decouverte/serveur';
import { ENTETES_PAGE, masquerEmail, pagePublique } from '@/lib/decouverte/pages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * /d/a/<jeton>/renvoyer — « Recevoir un nouveau lien d'accès » depuis une page
 * de lien expiré ou révoqué. Le nouveau lien part TOUJOURS à l'adresse du
 * compte (jamais à une adresse saisie), au plus un toutes les 10 minutes et
 * 5 par jour ; chaque demande est tracée dans la timeline du candidat.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  const page = (titre: string, paragraphes: string[], status = 200, ton?: 'succes' | 'alerte') =>
    new NextResponse(pagePublique({ surtitre: 'Offre découverte', titre, paragraphes, ton, boutons: [{ genre: 'lien', href: '/login', libelle: 'Se connecter', secondaire: true }] }), { status, headers: ENTETES_PAGE });
  try {
    const r = await resoudreJeton(jeton);
    if (!r) return page('Ce lien n’est pas valide', ['Écrivez-nous à contact@major-ecn.fr : nous vous renverrons un accès.'], 404, 'alerte');
    const res = await renvoyerLien(r);
    if (!res.ok) return page('Nouveau lien non envoyé', [res.raison], 429, 'alerte');
    return page('Un nouveau lien vient de vous être envoyé', [
      `Nous venons d’envoyer un nouveau lien d’accès à ${masquerEmail(res.email)}.`,
      'Pensez à vérifier vos courriers indésirables. Le lien est personnel et temporaire.',
    ], 200, 'succes');
  } catch (e) {
    console.error('[d/a/renvoyer]', e instanceof Error ? e.message : e);
    return page('Service momentanément indisponible', ['Réessayez dans quelques minutes.'], 503, 'alerte');
  }
}
