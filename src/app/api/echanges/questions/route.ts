import { z } from 'zod';
import { marquerTraite, mesQuestions } from '@/lib/echanges/serveur/questions';
import { authentifier, erreur, garde, lireJson, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

/** « Questions qui me sont adressées » (enseignant, §28) : `?onglet=a_traiter|traitees`. */
export async function GET(req: Request) {
  return garde('questions', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const onglet = new URL(req.url).searchParams.get('onglet') === 'traitees' ? 'traitees' : 'a_traiter';
    return ok({ questions: await mesQuestions(a.acteur, onglet) });
  });
}

const Corps = z.object({ tagId: z.string().uuid() });

/** « Marquer comme traité » (option activable par Major ECN, §26). */
export async function POST(req: Request) {
  return garde('question-traitee', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const p = Corps.safeParse(await lireJson(req));
    if (!p.success) return erreur({ error: 'Requête invalide.', code: 'INVALIDE' });
    const r = await marquerTraite(a.acteur, p.data.tagId);
    return 'error' in r ? erreur(r) : ok(r);
  });
}
