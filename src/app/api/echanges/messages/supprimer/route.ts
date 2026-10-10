import { z } from 'zod';
import { supprimer } from '@/lib/echanges/serveur/messages';
import { authentifier, erreur, garde, groupeOuRefus, lireJson, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

const Corps = z.object({ groupeId: z.string().uuid(), ids: z.array(z.string().uuid()).min(1).max(200) });

/**
 * Suppression multiple (§40, §45, §135) : en une seule opération. Chaque
 * message est contrôlé : un candidat ne peut retirer que les siens (R16, R17).
 */
export async function POST(req: Request) {
  return garde('suppression-multiple', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const p = Corps.safeParse(await lireJson(req));
    if (!p.success) return erreur({ error: 'Sélection invalide.', code: 'INVALIDE' });
    const g = await groupeOuRefus(a.acteur, p.data.groupeId);
    if ('reponse' in g) return g.reponse;
    const res = await supprimer(a.acteur, g.acces, p.data.ids);
    return 'error' in res ? erreur(res) : ok(res);
  });
}
