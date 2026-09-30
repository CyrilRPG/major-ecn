import { NextResponse } from 'next/server';
import { resoudreJeton } from '@/lib/decouverte/serveur';
import { JETON_PLACEHOLDER } from '@/lib/decouverte/jetons';
import { ENTETES_PAGE, pagePublique } from '@/lib/decouverte/pages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * /d/w/<jeton> — « Voir cet email dans votre navigateur » : l'instantané HTML
 * de l'envoi (stocké avec un emplacement à la place du jeton, jamais le jeton
 * lui-même), complété avec le jeton de l'URL.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  try {
    const r = await resoudreJeton(jeton);
    const html = r?.envoi.html_snapshot;
    if (!html) {
      return new NextResponse(pagePublique({ titre: 'E-mail introuvable', paragraphes: ['Cet e-mail n’est plus disponible en ligne.'], boutons: [{ genre: 'lien', href: '/', libelle: 'Découvrir Major ECN' }] }), { status: 404, headers: ENTETES_PAGE });
    }
    return new NextResponse(html.split(JETON_PLACEHOLDER).join(jeton), { headers: ENTETES_PAGE });
  } catch (e) {
    console.error('[d/w]', e instanceof Error ? e.message : e);
    return new NextResponse(pagePublique({ titre: 'Service momentanément indisponible', paragraphes: ['Réessayez dans quelques instants.'] }), { status: 503, headers: ENTETES_PAGE });
  }
}
