import { listerEpingles } from '@/lib/echanges/serveur/messages';
import { authentifier, garde, groupeOuRefus, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

/** « 📌 Réponses importantes » d'un groupe, avec recherche et filtres (§33). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return garde('epingles', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const g = await groupeOuRefus(a.acteur, id);
    if ('reponse' in g) return g.reponse;
    const sp = new URL(req.url).searchParams;
    return ok({
      reponses: await listerEpingles(a.acteur, g.acces, {
        q: sp.get('q'), enseignant: sp.get('enseignant'), specialiteId: sp.get('specialite'),
        item: sp.get('item') ? Number(sp.get('item')) : null, depuis: sp.get('depuis'), jusqua: sp.get('jusqua'),
      }),
    });
  });
}
