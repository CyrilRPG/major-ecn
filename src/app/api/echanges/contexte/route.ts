import { resoudreContexte } from '@/lib/echanges/serveur/contexte';
import { groupesAccessibles } from '@/lib/echanges/serveur/acces';
import { rechercher } from '@/lib/echanges/serveur/recherche';
import { authentifier, erreur, garde, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

/**
 * « 💬 Poser une question » depuis un contenu (§64-67) : contexte vérifié,
 * groupes où publier (celui de la spécialité en premier), et réponses
 * similaires déjà validées (recherche non IA, facultative côté élève).
 */
export async function GET(req: Request) {
  return garde('contexte', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const sp = new URL(req.url).searchParams;
    const contexte = await resoudreContexte(a.acteur, sp.get('type') ?? '', sp.get('id') ?? '');
    if (!contexte) return erreur({ error: 'Contenu introuvable ou non accessible.', code: 'INTROUVABLE' });
    const groupes = (await groupesAccessibles(a.acteur))
      .filter((g) => g.droits.publier)
      .map((g) => {
        const specs = (g.groupe.criteres as { specialites?: string[] } | null)?.specialites ?? [];
        const proche = g.groupe.specialite_id === contexte.specialiteId || specs.includes(contexte.specialiteId ?? '');
        return { id: g.groupe.id, nom: g.groupe.nom, promotion: g.groupe.promotion, proche, peutTaguer: g.droits.taguer };
      })
      .sort((x, y) => Number(y.proche) - Number(x.proche) || x.nom.localeCompare(y.nom, 'fr'));
    const q = sp.get('q');
    const similaires = q && q.trim().length >= 8
      ? (await rechercher(a.acteur, { q, type: 'enseignants', item: contexte.itemNumero })).resultats.slice(0, 3)
      : [];
    return ok({ contexte, groupes, similaires });
  });
}
