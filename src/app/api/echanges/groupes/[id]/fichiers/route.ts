import { z } from 'zod';
import { demanderEnvoi } from '@/lib/echanges/serveur/fichiers';
import { authentifier, erreur, garde, groupeOuRefus, lireJson, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

const Corps = z.object({ nom: z.string().min(1).max(255), mime: z.string().max(100), taille: z.number().int().positive(), legende: z.string().max(300).nullish() });

/** Prépare un téléversement : contrôles, puis URL signée vers le stockage privé. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return garde('fichier', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const g = await groupeOuRefus(a.acteur, id);
    if ('reponse' in g) return g.reponse;
    const p = Corps.safeParse(await lireJson(req));
    if (!p.success) return erreur({ error: 'Fichier invalide.', code: 'INVALIDE' });
    const r = await demanderEnvoi(a.acteur, g.acces, p.data);
    if ('error' in r) return erreur(r);
    return ok({ id: r.id, chemin: r.chemin, jeton: r.jeton, seau: 'echanges' }, 201);
  });
}
