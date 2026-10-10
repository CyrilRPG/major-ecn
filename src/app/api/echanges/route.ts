import { resume } from '@/lib/echanges/serveur/resume';
import { authentifier, garde, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

/** Vue d'ensemble : groupes, non-lus, questions à traiter (`?leger=1` : compteurs seulement). */
export async function GET(req: Request) {
  return garde('resume', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const leger = new URL(req.url).searchParams.get('leger') === '1';
    return ok(await resume(a.acteur, { leger }));
  });
}
