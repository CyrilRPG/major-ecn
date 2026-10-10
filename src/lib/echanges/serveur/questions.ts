import 'server-only';
import { nomEleve } from '../regles';
import type { ErreurEchanges, QuestionEnseignantDTO } from '../types';
import type { Acteur } from './acces';
import { auditer, db, extrait, parametres, parTranches } from './base';
import { enfiler, traiterBoite } from './emails';
import { diffuser } from './temps-reel';

/**
 * Questions adressées aux enseignants (CDC §28-29, §76, §129).
 */

type TagRow = {
  id: string; message_id: string; groupe_id: string; affectation_id: string | null; enseignant_id: string; eleve_id: string | null;
  tag_at: string; statut: 'en_attente' | 'traitee' | 'annulee' | 'a_reaffecter'; repondu_at: string | null; en_retard_at: string | null;
  relance_envoyee_at: string | null; traite_manuellement: boolean; delai_secondes: number | null;
};

export const COLONNES_TAG = 'id, message_id, groupe_id, affectation_id, enseignant_id, eleve_id, tag_at, statut, repondu_at, en_retard_at, relance_envoyee_at, traite_manuellement, delai_secondes';

export async function enrichirQuestions(tags: TagRow[]): Promise<QuestionEnseignantDTO[]> {
  if (tags.length === 0) return [];
  const prm = await parametres();
  const msgIds = [...new Set(tags.map((t) => t.message_id))];
  const grpIds = [...new Set(tags.map((t) => t.groupe_id))];
  const eleveIds = [...new Set(tags.map((t) => t.eleve_id).filter((x): x is string => !!x))];
  const [msgs, grps, eleves] = await Promise.all([
    parTranches(msgIds, 150, async (lot) => ((await db().from('echanges_messages').select('id, contenu, supprime_at').in('id', lot)).data ?? []) as { id: string; contenu: string | null; supprime_at: string | null }[]),
    parTranches(grpIds, 150, async (lot) => ((await db().from('echanges_groupes').select('id, nom, promotion').in('id', lot)).data ?? []) as { id: string; nom: string; promotion: string | null }[]),
    parTranches(eleveIds, 150, async (lot) => ((await db().from('profiles').select('id, first_name, last_name, pseudo').in('id', lot)).data ?? []) as { id: string; first_name: string | null; last_name: string | null; pseudo: string | null }[]),
  ]);
  const m = new Map(msgs.map((x) => [x.id, x]));
  const g = new Map(grps.map((x) => [x.id, x]));
  const e = new Map(eleves.map((x) => [x.id, x]));
  const seuil = prm.relance_heures * 3_600_000;
  return tags.map((t) => {
    const msg = m.get(t.message_id);
    const el = t.eleve_id ? e.get(t.eleve_id) : null;
    const enRetard = t.statut === 'traitee'
      ? !!t.repondu_at && new Date(t.repondu_at).getTime() - new Date(t.tag_at).getTime() > seuil
      : t.statut !== 'annulee' && Date.now() - new Date(t.tag_at).getTime() > seuil;
    return {
      tagId: t.id,
      messageId: t.message_id,
      groupeId: t.groupe_id,
      groupeNom: g.get(t.groupe_id)?.nom ?? 'Groupe',
      promotion: g.get(t.groupe_id)?.promotion ?? null,
      eleve: el ? nomEleve(el, prm.affichage_eleves) : 'Candidat',
      extrait: msg?.supprime_at ? 'Cette question n’est plus disponible.' : extrait(msg?.contenu, 220),
      tagAt: t.tag_at,
      statut: t.statut,
      reponduAt: t.repondu_at,
      enRetard,
      disponible: !!msg && !msg.supprime_at,
    };
  });
}

/** « Questions qui me sont adressées » — vue de l'enseignant (§28). */
export async function mesQuestions(acteur: Acteur, onglet: 'a_traiter' | 'traitees'): Promise<QuestionEnseignantDTO[]> {
  let q = db().from('echanges_tags').select(COLONNES_TAG).eq('enseignant_id', acteur.id).order('tag_at', { ascending: onglet === 'a_traiter' }).limit(300);
  q = onglet === 'a_traiter' ? q.in('statut', ['en_attente', 'a_reaffecter']) : q.eq('statut', 'traitee');
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  // Une question ne reste visible à l'enseignant que s'il est toujours affecté au groupe (R41).
  const tags = (data ?? []) as TagRow[];
  const { data: affs } = await db().from('echanges_enseignants').select('groupe_id').eq('user_id', acteur.id).eq('actif', true);
  const groupes = new Set(((affs ?? []) as { groupe_id: string }[]).map((a) => a.groupe_id));
  const out = await enrichirQuestions(tags.filter((t) => groupes.has(t.groupe_id)));
  return onglet === 'a_traiter' ? out.filter((q2) => q2.disponible) : out;
}

export async function nombreQuestionsATraiter(userId: string): Promise<number> {
  const { data: affs } = await db().from('echanges_enseignants').select('groupe_id').eq('user_id', userId).eq('actif', true);
  const groupes = ((affs ?? []) as { groupe_id: string }[]).map((a) => a.groupe_id);
  if (groupes.length === 0) return 0;
  const { count } = await db().from('echanges_tags').select('id', { count: 'exact', head: true })
    .eq('enseignant_id', userId).in('statut', ['en_attente', 'a_reaffecter']).in('groupe_id', groupes);
  return count ?? 0;
}

/**
 * « Marquer comme traité » (§26, option activable) : réservé à l'enseignant
 * tagué (ou à l'équipe), compte comme une réponse dans les statistiques.
 */
export async function marquerTraite(acteur: Acteur, tagId: string): Promise<{ ok: true } | ErreurEchanges> {
  const prm = await parametres();
  const { data: t } = await db().from('echanges_tags').select(COLONNES_TAG).eq('id', tagId).maybeSingle();
  if (!t) return { error: 'Question introuvable.', code: 'INTROUVABLE' };
  const estEquipe = acteur.capacites.has('moderer');
  if (t.enseignant_id !== acteur.id && !estEquipe) return { error: 'Cette question ne vous est pas adressée.', code: 'DROITS' };
  if (t.enseignant_id === acteur.id && !prm.marquer_traite_actif) return { error: 'Répondez directement à la question pour la traiter.', code: 'DROITS' };
  if (t.statut === 'traitee') return { ok: true };
  if (t.statut === 'annulee') return { error: 'Cette question n’est plus disponible.', code: 'INTROUVABLE' };
  await db().from('echanges_tags').update({ statut: 'traitee', repondu_at: new Date().toISOString(), traite_manuellement: true, traite_par: acteur.id }).eq('id', tagId).in('statut', ['en_attente', 'a_reaffecter']);
  await auditer({ action: 'tag_traite_manuellement', acteurId: acteur.id, acteurRole: acteur.role, groupeId: t.groupe_id, messageId: t.message_id });
  const { data: g } = await db().from('echanges_groupes').select('topic').eq('id', t.groupe_id).maybeSingle();
  if (g) void diffuser(g.topic, { t: 'maj', ids: [t.message_id] });
  return { ok: true };
}

/**
 * Enseignant retiré d'un groupe (§76) : il disparaît des tags, ne reçoit plus
 * de questions, et ses questions en attente passent « à réaffecter » avec une
 * alerte à l'équipe.
 */
export async function questionsAReaffecter(groupeId: string, enseignantId: string): Promise<number> {
  const { data } = await db().from('echanges_tags').update({ statut: 'a_reaffecter' })
    .eq('groupe_id', groupeId).eq('enseignant_id', enseignantId).eq('statut', 'en_attente').select('id');
  const ids = ((data ?? []) as { id: string }[]).map((x) => x.id);
  for (const id of ids) {
    await db().from('echanges_emails').update({ statut: 'annulee', derniere_erreur: 'Enseignant retiré du groupe' }).eq('tag_id', id).eq('statut', 'a_envoyer');
    await enfiler({ cle: `tag:${id}:reaffectation`, type: 'tag_reaffectation', tagId: id, groupeId });
  }
  if (ids.length > 0) await traiterBoite(10);
  return ids.length;
}

/** Réaffecte une question à un autre enseignant du groupe : nouveau tag, nouvel e-mail, nouveau délai. */
export async function reaffecter(acteur: Acteur, tagId: string, affectationId: string): Promise<{ ok: true } | ErreurEchanges> {
  if (!acteur.capacites.has('gerer_groupes') && !acteur.capacites.has('moderer')) return { error: 'Action réservée à l’administration.', code: 'DROITS' };
  const prm = await parametres();
  const { data: t } = await db().from('echanges_tags').select(COLONNES_TAG).eq('id', tagId).maybeSingle();
  if (!t) return { error: 'Question introuvable.', code: 'INTROUVABLE' };
  const { data: aff } = await db().from('echanges_enseignants').select('id, user_id, actif').eq('id', affectationId).eq('groupe_id', t.groupe_id).maybeSingle();
  if (!aff || !aff.actif) return { error: 'Cet enseignant n’est pas actif dans ce groupe.', code: 'INVALIDE' };
  if (aff.user_id === t.enseignant_id) return { error: 'La question est déjà adressée à cet enseignant.', code: 'INVALIDE' };
  const maintenant = new Date();
  const { data: nouveau, error } = await db().from('echanges_tags').upsert({
    message_id: t.message_id, groupe_id: t.groupe_id, affectation_id: aff.id, enseignant_id: aff.user_id, eleve_id: t.eleve_id,
    tag_at: maintenant.toISOString(), relance_due_at: new Date(maintenant.getTime() + prm.relance_heures * 3_600_000).toISOString(), reaffecte_de: t.id,
  }, { onConflict: 'message_id,enseignant_id', ignoreDuplicates: true }).select('id');
  if (error) return { error: error.message, code: 'INVALIDE' };
  await db().from('echanges_tags').update({ statut: 'annulee', annule_at: maintenant.toISOString(), annule_motif: 'Question réaffectée' }).eq('id', t.id).neq('statut', 'traitee');
  for (const n of (nouveau ?? []) as { id: string }[]) await enfiler({ cle: `tag:${n.id}:initial`, type: 'tag_initial', tagId: n.id, groupeId: t.groupe_id });
  await traiterBoite(5);
  await auditer({ action: 'tag_reaffectation', acteurId: acteur.id, acteurRole: acteur.role, groupeId: t.groupe_id, messageId: t.message_id, details: { de: t.enseignant_id, vers: aff.user_id } });
  return { ok: true };
}
