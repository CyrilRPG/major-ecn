import 'server-only';
import type { GroupeDTO, ResumeEchangesDTO } from '../types';
import { groupesAccessibles, moduleOuvert, type Acteur } from './acces';
import { db, extrait, parametres } from './base';
import { nombreQuestionsATraiter } from './questions';
import { resoudreAuteurs } from './identites';

/**
 * Vue d'ensemble des Échanges d'une personne (menu, tableau de bord, liste
 * des groupes) : groupes accessibles, non-lus par canal (§62), dernier
 * message, réponses d'enseignant non lues (§3), questions à traiter (§28).
 */
export async function resume(acteur: Acteur, opts: { leger?: boolean } = {}): Promise<ResumeEchangesDTO> {
  const prm = await parametres();
  const acces = await groupesAccessibles(acteur);
  const visibles = acces.filter((a) => a.groupe.statut !== 'brouillon' || a.role === 'equipe');
  const ouvert = acteur.niveau !== null || (acteur.role === 'professor' ? visibles.length > 0 : moduleOuvert(acteur, prm, false));
  if (!ouvert || visibles.length === 0) {
    return { actif: ouvert && acteur.niveau !== null, groupes: [], totalNonLus: 0, reponsesEnseignant: 0, questionsATraiter: 0 };
  }
  const lisibles = visibles.filter((a) => a.droits.lire);
  const ids = lisibles.map((a) => a.groupe.id);
  const [{ data: nl }, questions] = await Promise.all([
    ids.length ? db().rpc('echanges_non_lus', { p_user: acteur.id, p_groupes: ids }) : Promise.resolve({ data: [] }),
    acteur.role === 'professor' ? nombreQuestionsATraiter(acteur.id) : Promise.resolve(0),
  ]);
  const nonLus = (nl ?? []) as { groupe_id: string; canal: 'discussion' | 'annonces'; non_lus: number; reponses_enseignant: number }[];

  // Dernier message de chaque groupe (aperçu de la liste), sauf en mode léger (badge du menu).
  const derniers = new Map<string, GroupeDTO['dernierMessage']>();
  if (!opts.leger && ids.length > 0) {
    await Promise.all(lisibles.map(async (a) => {
      const { data } = await db().from('echanges_messages').select('auteur_id, auteur_type, contenu, created_at, nb_pieces_jointes')
        .eq('groupe_id', a.groupe.id).eq('canal', 'discussion').eq('statut', 'publie').is('supprime_at', null)
        .order('created_at', { ascending: false }).limit(1);
      const m = (data?.[0] as { auteur_id: string | null; auteur_type: 'candidat' | 'enseignant' | 'equipe' | 'systeme'; contenu: string | null; created_at: string; nb_pieces_jointes: number } | undefined);
      if (!m) return;
      const auteurs = await resoudreAuteurs({ topic: a.groupe.topic, groupeId: a.groupe.id, acteurId: acteur.id, auteurs: [{ id: m.auteur_id, type: m.auteur_type }], mode: prm.affichage_eleves });
      const au = auteurs.get(`${m.auteur_type}:${m.auteur_id ?? ''}`);
      derniers.set(a.groupe.id, {
        auteur: au?.moi ? 'Vous' : au?.nom ?? '',
        extrait: m.contenu ? extrait(m.contenu, 80) : (m.nb_pieces_jointes ? 'Pièce jointe' : ''),
        at: m.created_at,
      });
    }));
  }

  const groupes: GroupeDTO[] = visibles.map((a) => {
    const d = nonLus.find((x) => x.groupe_id === a.groupe.id && x.canal === 'discussion');
    const an = nonLus.find((x) => x.groupe_id === a.groupe.id && x.canal === 'annonces');
    return {
      id: a.groupe.id,
      nom: a.groupe.nom,
      promotion: a.groupe.promotion,
      annee: a.groupe.annee,
      specialiteNom: a.groupe.specialite_nom,
      statut: a.groupe.statut,
      role: a.role,
      droits: a.droits,
      nonLus: {
        discussion: d?.non_lus ?? 0,
        annonces: an?.non_lus ?? 0,
        reponsesEnseignant: (d?.reponses_enseignant ?? 0) + (an?.reponses_enseignant ?? 0),
      },
      dernierMessage: derniers.get(a.groupe.id) ?? null,
      topic: a.groupe.topic,
      reglesAAccepter: a.role === 'candidat' && prm.regles_acceptation_requise && !a.adhesion?.regles_acceptees_at,
      moderationPrealable: a.groupe.moderation_prealable,
      bibliotheque: a.groupe.bibliotheque_acces,
      sourdine: !!a.adhesion?.sourdine,
    };
  });
  groupes.sort((x, y) => (y.dernierMessage?.at ?? '').localeCompare(x.dernierMessage?.at ?? '') || x.nom.localeCompare(y.nom, 'fr'));
  return {
    actif: true,
    groupes,
    totalNonLus: groupes.reduce((s, g) => s + (g.droits.lire ? g.nonLus.discussion + g.nonLus.annonces : 0), 0),
    reponsesEnseignant: groupes.reduce((s, g) => s + g.nonLus.reponsesEnseignant, 0),
    questionsATraiter: questions,
  };
}
