import { z } from 'zod';
import { listerMessages, publier } from '@/lib/echanges/serveur/messages';
import { authentifier, erreur, garde, groupeOuRefus, lireJson, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Page de messages : récents, plus anciens (`avant`), plus récents (`apres`) ou autour d'un message (`autour`). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return garde('messages', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const g = await groupeOuRefus(a.acteur, id);
    if ('reponse' in g) return g.reponse;
    const sp = new URL(req.url).searchParams;
    const canal = sp.get('canal') === 'annonces' ? 'annonces' : 'discussion';
    return ok(await listerMessages(a.acteur, g.acces, {
      canal, avant: sp.get('avant'), apres: sp.get('apres'), autour: sp.get('autour'), limite: Number(sp.get('limite')) || undefined,
    }));
  });
}

const Corps = z.object({
  canal: z.enum(['discussion', 'annonces']).default('discussion'),
  contenu: z.string().max(20000).default(''),
  reponseA: z.string().uuid().nullish(),
  mentions: z.array(z.string().uuid()).max(10).default([]),
  pieces: z.array(z.string().uuid()).max(10).default([]),
  contexte: z.object({ type: z.string().max(20), id: z.string().uuid() }).nullish(),
  clientId: z.string().max(80).nullish(),
  important: z.boolean().optional(),
  accuseLecture: z.boolean().optional(),
});

/** Publication (contrôles complets côté serveur : droits, quotas, coordonnées, validation). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return garde('publication', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const g = await groupeOuRefus(a.acteur, id);
    if ('reponse' in g) return g.reponse;
    const p = Corps.safeParse(await lireJson(req));
    if (!p.success) return erreur({ error: 'Requête invalide.', code: 'INVALIDE' });
    const r = await publier(a.acteur, g.acces, p.data);
    if ('error' in r) return erreur(r);
    return ok(r, 201);
  });
}
