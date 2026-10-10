import { rechercher, rechercherBibliotheque } from '@/lib/echanges/serveur/recherche';
import { authentifier, garde, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

type Type = 'tous' | 'enseignants' | 'importants' | 'pieces';
type Auteur = 'tous' | 'moi' | 'candidats' | 'enseignants' | 'equipe';

/**
 * Recherche plein texte dans les échanges accessibles (§36-38) ;
 * `?bibliotheque=seule` : réponses pédagogiques permanentes seulement (§35).
 */
export async function GET(req: Request) {
  return garde('recherche', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const sp = new URL(req.url).searchParams;
    const item = sp.get('item') ? Number(sp.get('item')) : null;
    if (sp.get('bibliotheque') === 'seule') {
      return ok({ bibliotheque: await rechercherBibliotheque(a.acteur, { q: sp.get('q') ?? '', item, specialiteId: sp.get('specialite') }) });
    }
    const type = (['tous', 'enseignants', 'importants', 'pieces'].includes(sp.get('type') ?? '') ? sp.get('type') : 'tous') as Type;
    const auteur = (['tous', 'moi', 'candidats', 'enseignants', 'equipe'].includes(sp.get('auteur') ?? '') ? sp.get('auteur') : 'tous') as Auteur;
    return ok(await rechercher(a.acteur, {
      q: sp.get('q') ?? '',
      groupeId: sp.get('groupe'),
      type, auteur,
      specialiteId: sp.get('specialite'),
      item,
      depuis: sp.get('depuis'),
      jusqua: sp.get('jusqua'),
      archives: sp.get('archives') === '1',
    }));
  });
}
