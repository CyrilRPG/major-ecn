import { enseignantsTaguables } from '@/lib/echanges/serveur/identites';
import { db, parametres } from '@/lib/echanges/serveur/base';
import { authentifier, garde, groupeOuRefus, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

/** Fiche d'un groupe pour l'écran de conversation : droits, enseignants à taguer, règles, réglages utiles. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return garde('groupe', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const g = await groupeOuRefus(a.acteur, id, { lecture: false });
    if ('reponse' in g) return g.reponse;
    const { acces } = g;
    const prm = await parametres();
    const [ens, { count: membres }] = await Promise.all([
      acces.droits.lire ? enseignantsTaguables(id) : Promise.resolve([]),
      db().from('echanges_membres').select('user_id', { count: 'exact', head: true }).eq('groupe_id', id).eq('statut', 'actif').eq('exclusion_forcee', false),
    ]);
    return ok({
      groupe: {
        id: acces.groupe.id,
        nom: acces.groupe.nom,
        promotion: acces.groupe.promotion,
        annee: acces.groupe.annee,
        specialiteId: acces.groupe.specialite_id,
        specialiteNom: acces.groupe.specialite_nom,
        statut: acces.groupe.statut,
        topic: acces.groupe.topic,
        moderationPrealable: acces.groupe.moderation_prealable,
        bibliotheque: acces.groupe.bibliotheque_acces,
        membres: membres ?? 0,
      },
      role: acces.role,
      droits: acces.droits,
      sourdine: !!acces.adhesion?.sourdine,
      enseignants: ens.map(({ id: eid, prenom, libelle, specialite }) => ({ id: eid, prenom, libelle, specialite })),
      accueil: acces.groupe.message_accueil || prm.message_accueil,
      regles: prm.regles_texte,
      reglesAAccepter: acces.role === 'candidat' && prm.regles_acceptation_requise && !acces.adhesion?.regles_acceptees_at,
      reglages: {
        reactions: prm.reactions,
        editionMinutes: prm.edition_minutes,
        formats: prm.formats_autorises,
        tailleMaxMo: prm.taille_max_mo,
        pjMax: prm.pj_max_par_message,
        longueurMax: prm.longueur_max,
        marquerTraite: prm.marquer_traite_actif,
      },
    });
  });
}
