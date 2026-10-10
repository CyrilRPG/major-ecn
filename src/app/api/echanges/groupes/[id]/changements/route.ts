import { changements } from '@/lib/echanges/serveur/messages';
import { authentifier, garde, groupeOuRefus, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

/** Changements depuis un curseur : nouveaux, modifiés, retirés (synchronisation des appareils, §13). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return garde('changements', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const g = await groupeOuRefus(a.acteur, id);
    if ('reponse' in g) return g.reponse;
    const depuis = new URL(req.url).searchParams.get('depuis') ?? new Date(Date.now() - 60_000).toISOString();
    return ok(await changements(a.acteur, g.acces, depuis));
  });
}
