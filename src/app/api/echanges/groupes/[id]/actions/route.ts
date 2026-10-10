import { z } from 'zod';
import { accepterRegles, basculerSourdine, marquerLu } from '@/lib/echanges/serveur/messages';
import { authentifier, erreur, garde, groupeOuRefus, lireJson, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

const Corps = z.discriminatedUnion('action', [
  /** Dernier message lu (compteurs synchronisés entre appareils, §62). */
  z.object({ action: z.literal('lu'), canal: z.enum(['discussion', 'annonces']).default('discussion'), jusqua: z.string().max(40).nullish() }),
  /** Acceptation des règles de bonne conduite (§110), enregistrée. */
  z.object({ action: z.literal('regles') }),
  z.object({ action: z.literal('sourdine'), sourdine: z.boolean() }),
]);

/** Actions personnelles sur un groupe : lu, règles acceptées, sourdine. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return garde('groupe-action', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const g = await groupeOuRefus(a.acteur, id);
    if ('reponse' in g) return g.reponse;
    const p = Corps.safeParse(await lireJson(req));
    if (!p.success) return erreur({ error: 'Requête invalide.', code: 'INVALIDE' });
    if (p.data.action === 'lu') await marquerLu(a.acteur, g.acces, p.data.canal, p.data.jusqua ?? null);
    else if (p.data.action === 'regles') await accepterRegles(a.acteur, g.acces);
    else await basculerSourdine(a.acteur, g.acces, p.data.sourdine);
    return ok({ ok: true });
  });
}
