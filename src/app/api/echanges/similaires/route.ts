import { rechercher } from '@/lib/echanges/serveur/recherche';
import { authentifier, garde, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

/**
 * « Une réponse similaire existe déjà » (§67) — recherche plein texte (sans
 * IA) dans la bibliothèque, les réponses épinglées et les réponses
 * d'enseignants, avant qu'un élève ne tague un enseignant. Seuls des contenus
 * d'enseignants ou validés sont proposés (§68).
 */
export async function GET(req: Request) {
  return garde('similaires', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const sp = new URL(req.url).searchParams;
    const q = (sp.get('q') ?? '').trim();
    if (q.length < 12) return ok({ resultats: [] });
    // Les 6 mots les plus longs suffisent à trouver une question proche.
    const mots = [...new Set(q.split(/\s+/).filter((m) => m.length >= 5))].sort((x, y) => y.length - x.length).slice(0, 3);
    if (mots.length === 0) return ok({ resultats: [] });
    const r = await rechercher(a.acteur, { q: mots.join(' '), type: 'enseignants', groupeId: sp.get('groupe') });
    return ok({ resultats: r.resultats.filter((x) => x.source === 'bibliotheque' || x.epingle || x.auteurType === 'enseignant').slice(0, 3) });
  });
}
