import 'server-only';
import { libelleEnseignant, nomEleve } from '../regles';
import type { ErreurEchanges } from '../types';
import type { Acteur } from './acces';
import { auditer, db, extrait, FACULTE, parametres } from './base';
import { identitesDe } from './identites';

/**
 * Bibliothèque pédagogique permanente (CDC §34-35, §80-81, §108, §119-122) :
 * des RESSOURCES indépendantes des promotions, jamais une copie de l'ancien
 * chat. La question est anonymisée par défaut (§120), la réponse peut être
 * corrigée quand une recommandation évolue (§121), avec sa date (§122).
 */

type R<T = { ok: true }> = T | ErreurEchanges;

function refus(): ErreurEchanges {
  return { error: 'Action réservée à l’administration.', code: 'DROITS' };
}

type Msg = { id: string; groupe_id: string; auteur_id: string | null; auteur_type: string; contenu: string | null; reponse_a: string | null; epingle_question_id: string | null; contexte: { titre?: string; itemNumero?: number | null; itemTitre?: string | null; specialiteId?: string | null; specialiteNom?: string | null } | null; specialite_id: string | null; item_numero: number | null; created_at: string };

async function construire(m: Msg, anonymiser: boolean) {
  const prm = await parametres();
  const qid = m.epingle_question_id ?? m.reponse_a;
  const [{ data: q }, { data: g }] = await Promise.all([
    qid ? db().from('echanges_messages').select('id, auteur_id, auteur_type, contenu, contexte, item_numero, specialite_id, supprime_at').eq('id', qid).maybeSingle() : Promise.resolve({ data: null }),
    db().from('echanges_groupes').select('specialite_id, specialite_nom').eq('id', m.groupe_id).maybeSingle(),
  ]);
  const question = q && !q.supprime_at ? q : null;
  let enseignant: string | null = null;
  if (m.auteur_id && (m.auteur_type === 'enseignant' || m.auteur_type === 'equipe')) {
    const ids = await identitesDe([m.auteur_id]);
    const i = ids.get(m.auteur_id);
    const { data: aff } = await db().from('echanges_enseignants').select('qualite').eq('groupe_id', m.groupe_id).eq('user_id', m.auteur_id).maybeSingle();
    enseignant = i ? libelleEnseignant(i.prenom_public, aff?.qualite || i.qualite) : 'Équipe Major ECN';
  }
  let auteurQuestion = 'Question d’un candidat';
  if (!anonymiser && question?.auteur_id && question.auteur_type === 'candidat') {
    const { data: p } = await db().from('profiles').select('first_name, last_name, pseudo').eq('id', question.auteur_id).maybeSingle();
    if (p) auteurQuestion = `Question de ${nomEleve(p, prm.affichage_eleves)}`;
  }
  const ctx = (question?.contexte as Msg['contexte']) ?? m.contexte;
  const item = ctx?.itemNumero ?? question?.item_numero ?? m.item_numero ?? null;
  return {
    faculte_id: FACULTE,
    titre: extrait(ctx?.titre || question?.contenu || m.contenu || 'Réponse d’un enseignant', 120),
    question: question?.contenu ?? null,
    question_auteur: auteurQuestion,
    reponse: m.contenu ?? '',
    enseignant_label: enseignant,
    enseignant_id: m.auteur_id,
    specialite_id: ctx?.specialiteId ?? question?.specialite_id ?? m.specialite_id ?? g?.specialite_id ?? null,
    specialite_nom: ctx?.specialiteNom ?? g?.specialite_nom ?? null,
    item_numero: item,
    item_titre: ctx?.itemTitre ?? null,
    source_message_id: m.id,
    source_question_id: question?.id ?? null,
    source_groupe_id: m.groupe_id,
  };
}

const COLS = 'id, groupe_id, auteur_id, auteur_type, contenu, reponse_a, epingle_question_id, contexte, specialite_id, item_numero, created_at';

/** Transforme une réponse épinglée en « réponse pédagogique permanente » (§34). */
export async function transformerEnPermanente(acteur: Acteur, messageId: string, o: { anonymiser?: boolean } = {}): Promise<R<{ id: string }>> {
  if (!acteur.capacites.has('bibliotheque')) return refus();
  const { data: m } = await db().from('echanges_messages').select(COLS).eq('id', messageId).is('supprime_at', null).maybeSingle();
  if (!m) return { error: 'Message introuvable.', code: 'INTROUVABLE' };
  if (!m.contenu) return { error: 'Ce message n’a pas de texte à conserver.', code: 'INVALIDE' };
  const ligne = await construire(m as Msg, o.anonymiser !== false);
  const { data, error } = await db().from('echanges_bibliotheque').upsert({ ...ligne, cree_par: acteur.id }, { onConflict: 'source_message_id', ignoreDuplicates: false }).select('id').single();
  if (error) return { error: error.message, code: 'INVALIDE' };
  await auditer({ action: 'bibliotheque_ajout', acteurId: acteur.id, acteurRole: acteur.role, groupeId: m.groupe_id, messageId, details: { ressource: data.id } });
  return { id: data.id };
}

/** À l'archivage : tout verser, une sélection, ou rien (§80). */
export async function verserEpinglesDansBibliotheque(acteur: Acteur, groupeId: string, choix: 'tout' | string[]): Promise<number> {
  let q = db().from('echanges_messages').select(COLS).eq('groupe_id', groupeId).not('epingle_at', 'is', null).is('supprime_at', null);
  if (Array.isArray(choix)) q = q.in('id', choix.slice(0, 500));
  const { data } = await q;
  let n = 0;
  for (const m of (data ?? []) as Msg[]) {
    if (!m.contenu) continue;
    const ligne = await construire(m, true);
    const { error } = await db().from('echanges_bibliotheque').upsert({ ...ligne, cree_par: acteur.id && /^[0-9a-f-]{36}$/i.test(acteur.id) ? acteur.id : null }, { onConflict: 'source_message_id', ignoreDuplicates: true });
    if (!error) n += 1;
  }
  await auditer({ action: 'bibliotheque_ajout', acteurId: acteur.id, acteurRole: acteur.role, groupeId, details: { versement_archivage: n } });
  return n;
}

export type EditionRessource = {
  titre?: string; question?: string | null; questionAuteur?: string; reponse?: string; enseignantLabel?: string | null;
  specialiteId?: string | null; specialiteNom?: string | null; itemNumero?: number | null; itemTitre?: string | null;
  motsCles?: string[]; publie?: boolean; revalider?: boolean;
};

/** Correction / mise à jour d'une ressource (§121) ; « revalider » met à jour la date de validation (§122). */
export async function modifierRessource(acteur: Acteur, id: string, e: EditionRessource): Promise<R> {
  if (!acteur.capacites.has('bibliotheque')) return refus();
  const maj: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: acteur.id };
  if (e.titre !== undefined) maj.titre = e.titre.trim().slice(0, 200);
  if (e.question !== undefined) maj.question = e.question?.trim() || null;
  if (e.questionAuteur !== undefined) maj.question_auteur = e.questionAuteur.trim().slice(0, 80) || 'Question d’un candidat';
  if (e.reponse !== undefined) { if (!e.reponse.trim()) return { error: 'La réponse ne peut pas être vide.', code: 'INVALIDE' }; maj.reponse = e.reponse.trim(); }
  if (e.enseignantLabel !== undefined) maj.enseignant_label = e.enseignantLabel?.trim() || null;
  if (e.specialiteId !== undefined) maj.specialite_id = e.specialiteId || null;
  if (e.specialiteNom !== undefined) maj.specialite_nom = e.specialiteNom || null;
  if (e.itemNumero !== undefined) maj.item_numero = e.itemNumero && e.itemNumero > 0 ? Math.round(e.itemNumero) : null;
  if (e.itemTitre !== undefined) maj.item_titre = e.itemTitre?.trim() || null;
  if (e.motsCles !== undefined) maj.mots_cles = e.motsCles.map((x) => x.trim()).filter(Boolean).slice(0, 20);
  if (e.publie !== undefined) maj.publie = e.publie;
  if (e.revalider) maj.valide_at = new Date().toISOString().slice(0, 10);
  const { error, data } = await db().from('echanges_bibliotheque').update(maj).eq('id', id).eq('faculte_id', FACULTE).select('id').maybeSingle();
  if (error || !data) return { error: error?.message ?? 'Ressource introuvable.', code: 'INVALIDE' };
  await auditer({ action: 'bibliotheque_modification', acteurId: acteur.id, acteurRole: acteur.role, details: { ressource: id, champs: Object.keys(maj) } });
  return { ok: true };
}

export async function creerRessource(acteur: Acteur, e: EditionRessource & { titre: string; reponse: string }): Promise<R<{ id: string }>> {
  if (!acteur.capacites.has('bibliotheque')) return refus();
  if (!e.titre?.trim() || !e.reponse?.trim()) return { error: 'Titre et réponse obligatoires.', code: 'INVALIDE' };
  const { data, error } = await db().from('echanges_bibliotheque').insert({
    faculte_id: FACULTE, titre: e.titre.trim().slice(0, 200), question: e.question?.trim() || null,
    question_auteur: e.questionAuteur?.trim() || 'Question d’un candidat', reponse: e.reponse.trim(),
    enseignant_label: e.enseignantLabel?.trim() || null, specialite_id: e.specialiteId || null, specialite_nom: e.specialiteNom || null,
    item_numero: e.itemNumero ?? null, item_titre: e.itemTitre ?? null, mots_cles: e.motsCles ?? [], publie: e.publie ?? true, cree_par: acteur.id,
  }).select('id').single();
  if (error) return { error: error.message, code: 'INVALIDE' };
  await auditer({ action: 'bibliotheque_ajout', acteurId: acteur.id, acteurRole: acteur.role, details: { ressource: data.id, manuelle: true } });
  return { id: data.id };
}

export async function retirerRessource(acteur: Acteur, id: string): Promise<R> {
  if (!acteur.capacites.has('bibliotheque')) return refus();
  const { data } = await db().from('echanges_bibliotheque').delete().eq('id', id).eq('faculte_id', FACULTE).select('titre').maybeSingle();
  if (!data) return { error: 'Ressource introuvable.', code: 'INTROUVABLE' };
  await auditer({ action: 'bibliotheque_retrait', acteurId: acteur.id, acteurRole: acteur.role, details: { ressource: id, titre: data.titre } });
  return { ok: true };
}
