import 'server-only';
import { notifier } from '@/lib/notifications/centre';
import { sanctionPermise, type TypeSanction } from '../regles';
import { AVERTISSEMENTS_PREDEFINIS } from '../moderation-textes';
import type { ErreurEchanges } from '../types';
import type { Acteur } from './acces';
import { auditer, db, extrait, journaliser } from './base';
import { enfiler, traiterBoite } from './emails';
import { effacerDuStockage } from './fichiers';
import { apresPublication, COLONNES_MESSAGE, type MessageRow } from './messages';
import { diffuser } from './temps-reel';

/**
 * Modération (CDC §45-57, §135-140) : discrète pour les élèves (aucun
 * message public, §112), tracée pour l'administration (journal d'audit).
 */

type R = { ok: true } | ErreurEchanges;

function dateFr(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export { AVERTISSEMENTS_PREDEFINIS };

function texteSanction(type: TypeSanction, fin: string | null, perso: string | null): { titre: string; message: string } {
  const jusqua = fin ? ` jusqu’au ${dateFr(fin)}` : '';
  const suite = perso ? `\n\n${perso}` : '';
  switch (type) {
    case 'avertissement': return { titre: 'Avertissement de l’équipe Major ECN', message: perso ?? AVERTISSEMENTS_PREDEFINIS[0] };
    case 'lecture_seule': return { titre: 'Participation limitée à la lecture', message: `Vous pouvez continuer à lire et rechercher dans les échanges, mais plus y publier${jusqua}.${suite}` };
    case 'suspension': return { titre: 'Accès aux échanges suspendu', message: `Votre accès à la messagerie collective est suspendu${jusqua}. Tous vos autres contenus Major ECN restent accessibles.${suite}` };
    case 'exclusion': return { titre: 'Accès aux échanges retiré', message: `Votre accès à la messagerie collective a été retiré. Vos cours, fiches, QCM, replays et toutes les autres fonctionnalités de votre formation restent accessibles normalement.${suite}` };
    case 'restriction_tag': return { titre: 'Tag des enseignants suspendu', message: `Vous ne pouvez plus taguer d’enseignant${jusqua}. Vous pouvez toujours publier vos questions dans le groupe.${suite}` };
  }
}

export async function appliquerSanction(acteur: Acteur, s: {
  userId: string; groupeId: string | null; type: TypeSanction; motif: string | null; messageEleve: string | null;
  dureeHeures?: number | null; jusqua?: string | null; notifierApp: boolean; notifierEmail: boolean;
}): Promise<R> {
  if (!sanctionPermise(s.type, acteur.capacites)) return { error: 'Votre niveau d’accès ne permet pas cette action.', code: 'DROITS' };
  const { data: cible } = await db().from('profiles').select('id, role').eq('id', s.userId).maybeSingle();
  if (!cible || cible.role !== 'student') return { error: 'Seuls les candidats peuvent faire l’objet d’une mesure.', code: 'INVALIDE' };
  let fin: string | null = null;
  if (s.type !== 'avertissement' && s.type !== 'exclusion') {
    if (s.jusqua && Number.isFinite(new Date(s.jusqua).getTime())) fin = new Date(s.jusqua).toISOString();
    else if (s.dureeHeures && s.dureeHeures > 0) fin = new Date(Date.now() + s.dureeHeures * 3_600_000).toISOString();
    if (fin && new Date(fin).getTime() <= Date.now()) return { error: 'La date de fin doit être dans le futur.', code: 'INVALIDE' };
  }
  const textes = texteSanction(s.type, fin, (s.messageEleve ?? '').trim() || null);
  const { data, error } = await db().from('echanges_sanctions').insert({
    user_id: s.userId, groupe_id: s.groupeId, type: s.type, motif: s.motif, message_eleve: textes.message,
    notifier_app: s.notifierApp, notifier_email: s.notifierEmail, fin_at: fin, cree_par: acteur.id,
    // Un avertissement n'a pas de durée : il est clos dès sa création (historique seul).
    levee_at: s.type === 'avertissement' ? new Date().toISOString() : null,
  }).select('id').single();
  if (error) return { error: error.message, code: 'INVALIDE' };
  await auditer({ action: 'sanction', acteurId: acteur.id, acteurRole: acteur.role, cibleUserId: s.userId, groupeId: s.groupeId, details: { type: s.type, motif: s.motif, fin, sanction: data.id } });
  if (s.notifierApp) {
    await notifier([{
      userId: s.userId, categorie: null, kind: 'echanges_moderation', groupKey: `echanges:moderation:${data.id}`,
      titre: textes.titre, corps: textes.message, ctaLabel: 'Ouvrir les échanges', ctaHref: '/echanges',
    }]).catch((e) => journaliser('erreur', 'notification', 'Notification de modération non envoyée', { erreur: String(e) }));
  }
  if (s.notifierEmail) {
    await enfiler({ cle: `sanction:${data.id}`, type: s.type === 'avertissement' ? 'avertissement' : 'sanction', destinataireId: s.userId, groupeId: s.groupeId, donnees: textes });
    await traiterBoite(5);
  }
  return { ok: true };
}

/** Réintégration (§53) : lève les restrictions actives, sans nouveau compte. */
export async function reintegrer(acteur: Acteur, userId: string, groupeId: string | null, motif: string | null): Promise<R> {
  if (!acteur.capacites.has('sanctionner')) return { error: 'Action réservée à l’administration.', code: 'DROITS' };
  let q = db().from('echanges_sanctions').update({ levee_at: new Date().toISOString(), levee_par: acteur.id, levee_motif: motif ?? 'Réintégration' })
    .eq('user_id', userId).is('levee_at', null).neq('type', 'avertissement');
  if (groupeId) q = q.or(`groupe_id.eq.${groupeId},groupe_id.is.null`);
  const { data, error } = await q.select('id, type');
  if (error) return { error: error.message, code: 'INVALIDE' };
  // Une exclusion forcée d'un groupe est aussi levée.
  if (groupeId) {
    await db().from('echanges_membres').update({ exclusion_forcee: false, statut: 'actif', retire_at: null, motif_retrait: null }).eq('groupe_id', groupeId).eq('user_id', userId).eq('exclusion_forcee', true);
  }
  await auditer({ action: 'reintegration', acteurId: acteur.id, acteurRole: acteur.role, cibleUserId: userId, groupeId, details: { levees: data ?? [], motif } });
  await notifier([{
    userId, categorie: null, kind: 'echanges_moderation', groupKey: `echanges:reintegration:${Date.now()}`,
    titre: 'Accès aux échanges rétabli', corps: 'Vous pouvez de nouveau participer aux échanges de votre promotion.', ctaLabel: 'Ouvrir les échanges', ctaHref: '/echanges',
  }]).catch(() => undefined);
  return { ok: true };
}

export async function leverSanction(acteur: Acteur, sanctionId: string, motif: string | null): Promise<R> {
  if (!acteur.capacites.has('sanctionner')) return { error: 'Action réservée à l’administration.', code: 'DROITS' };
  const { data } = await db().from('echanges_sanctions').update({ levee_at: new Date().toISOString(), levee_par: acteur.id, levee_motif: motif })
    .eq('id', sanctionId).is('levee_at', null).select('user_id, groupe_id, type').maybeSingle();
  if (!data) return { error: 'Mesure introuvable ou déjà levée.', code: 'INTROUVABLE' };
  await auditer({ action: 'levee_sanction', acteurId: acteur.id, acteurRole: acteur.role, cibleUserId: data.user_id, groupeId: data.groupe_id, details: { sanction: sanctionId, type: data.type, motif } });
  return { ok: true };
}

/* ─────────────────────────── Signalements (§57) ─────────────────────────── */

export async function traiterSignalement(acteur: Acteur, id: string, statut: 'traite' | 'sans_suite' | 'a_examiner', note: string | null): Promise<R> {
  if (!acteur.capacites.has('signalements')) return { error: 'Action réservée à l’administration.', code: 'DROITS' };
  const { data } = await db().from('echanges_signalements').update({ statut, traite_par: acteur.id, traite_at: new Date().toISOString(), decision_note: note })
    .eq('id', id).select('message_id, groupe_id').maybeSingle();
  if (!data) return { error: 'Signalement introuvable.', code: 'INTROUVABLE' };
  await auditer({ action: 'signalement_traitement', acteurId: acteur.id, acteurRole: acteur.role, groupeId: data.groupe_id, messageId: data.message_id, details: { statut, note } });
  return { ok: true };
}

/* ─────────────────────── File de validation (modération préalable) ─────────────────────── */

export async function validerMessages(acteur: Acteur, ids: string[]): Promise<{ ok: true; valides: number } | ErreurEchanges> {
  if (!acteur.capacites.has('moderer')) return { error: 'Action réservée à l’administration.', code: 'DROITS' };
  const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).in('id', ids.slice(0, 200)).eq('statut', 'en_attente').is('supprime_at', null);
  const rows = (data ?? []) as MessageRow[];
  for (const m of rows) {
    const { data: up } = await db().from('echanges_messages').update({ statut: 'publie', valide_par: acteur.id, valide_at: new Date().toISOString() })
      .eq('id', m.id).eq('statut', 'en_attente').select(COLONNES_MESSAGE).maybeSingle();
    if (!up) continue;
    await db().from('echanges_pieces_jointes').update({ statut: 'attache' }).eq('message_id', m.id).eq('statut', 'en_moderation');
    await db().from('echanges_blocages').update({ statut: 'libere', traite_par: acteur.id, traite_at: new Date().toISOString() }).eq('message_id', m.id).eq('statut', 'en_moderation');
    await apresPublication(up as MessageRow, m.groupe_id);
    await auditer({ action: 'validation_message', acteurId: acteur.id, acteurRole: acteur.role, groupeId: m.groupe_id, messageId: m.id, cibleUserId: m.auteur_id });
  }
  return { ok: true, valides: rows.length };
}

export async function refuserMessages(acteur: Acteur, ids: string[], motif: string | null): Promise<{ ok: true; refuses: number } | ErreurEchanges> {
  if (!acteur.capacites.has('moderer')) return { error: 'Action réservée à l’administration.', code: 'DROITS' };
  const { data } = await db().from('echanges_messages').select('id, groupe_id, auteur_id, contenu').in('id', ids.slice(0, 200)).eq('statut', 'en_attente').is('supprime_at', null);
  const rows = (data ?? []) as { id: string; groupe_id: string; auteur_id: string | null; contenu: string | null }[];
  if (rows.length === 0) return { ok: true, refuses: 0 };
  const maintenant = new Date().toISOString();
  await db().from('echanges_messages').update({ statut: 'refuse', supprime_at: maintenant, supprime_par: acteur.id, suppression_origine: 'refus' }).in('id', rows.map((r) => r.id));
  await db().from('echanges_blocages').update({ statut: 'confirme', traite_par: acteur.id, traite_at: maintenant }).in('message_id', rows.map((r) => r.id)).eq('statut', 'en_moderation');
  const lignes = rows.filter((r) => r.auteur_id).map((r) => ({
    userId: r.auteur_id as string, categorie: null, kind: 'echanges_moderation', groupKey: `echanges:refus:${r.id}`,
    titre: 'Votre message n’a pas été publié',
    corps: motif ? `Motif : ${motif}` : 'Il ne respecte pas les règles des échanges Major ECN.',
    ctaLabel: 'Ouvrir les échanges', ctaHref: `/echanges/${r.groupe_id}`,
  }));
  await notifier(lignes).catch(() => undefined);
  for (const r of rows) {
    await auditer({ action: 'refus_message', acteurId: acteur.id, acteurRole: acteur.role, groupeId: r.groupe_id, messageId: r.id, cibleUserId: r.auteur_id, details: { motif, extrait: extrait(r.contenu, 200) } });
    const { data: g } = await db().from('echanges_groupes').select('topic').eq('id', r.groupe_id).maybeSingle();
    if (g) void diffuser(g.topic, { t: 'retrait', ids: [r.id] });
  }
  return { ok: true, refuses: rows.length };
}

/** Faux positif de la détection de coordonnées (§198) : le message est publié tel quel. */
export async function libererBlocage(acteur: Acteur, id: string): Promise<R> {
  if (!acteur.capacites.has('moderer')) return { error: 'Action réservée à l’administration.', code: 'DROITS' };
  const { data: b } = await db().from('echanges_blocages').select('id, message_id, statut, user_id, groupe_id').eq('id', id).maybeSingle();
  if (!b) return { error: 'Tentative introuvable.', code: 'INTROUVABLE' };
  if (b.message_id) {
    const r = await validerMessages(acteur, [b.message_id]);
    if ('error' in r) return r;
    // Le message lié n'est plus en attente (refusé, supprimé) : rien n'a été publié.
    if (r.valides === 0) return { error: 'Le message lié n’est plus en attente : rien n’a été publié.', code: 'INVALIDE' };
  }
  await db().from('echanges_blocages').update({ statut: 'libere', traite_par: acteur.id, traite_at: new Date().toISOString() }).eq('id', id);
  await auditer({ action: 'blocage_liberation', acteurId: acteur.id, acteurRole: acteur.role, cibleUserId: b.user_id, groupeId: b.groupe_id, messageId: b.message_id });
  return { ok: true };
}

/* ─────────────────────────── Restauration (§138) ─────────────────────────── */

export async function restaurerMessages(acteur: Acteur, ids: string[]): Promise<{ ok: true; restaures: number } | ErreurEchanges> {
  if (!acteur.capacites.has('restaurer')) return { error: 'La restauration est réservée au Super Admin.', code: 'DROITS' };
  const { data } = await db().from('echanges_messages').select('id, groupe_id, auteur_id, supprime_at, purge_at, suppression_origine, contenu')
    .in('id', ids.slice(0, 200)).not('supprime_at', 'is', null);
  const rows = ((data ?? []) as { id: string; groupe_id: string; auteur_id: string | null; purge_at: string | null; suppression_origine: string | null; contenu: string | null }[]).filter((r) => !r.purge_at);
  if (rows.length === 0) return { error: 'Aucun message restaurable (purgé ou introuvable).', code: 'INTROUVABLE' };
  await db().from('echanges_messages').update({ supprime_at: null, supprime_par: null, suppression_origine: null, statut: 'publie' }).in('id', rows.map((r) => r.id));
  for (const r of rows) {
    await auditer({ action: 'restauration', acteurId: acteur.id, acteurRole: acteur.role, groupeId: r.groupe_id, messageId: r.id, cibleUserId: r.auteur_id, details: { origine: r.suppression_origine, extrait: extrait(r.contenu, 200) } });
    const { data: g } = await db().from('echanges_groupes').select('topic').eq('id', r.groupe_id).maybeSingle();
    if (g) void diffuser(g.topic, { t: 'maj', ids: [r.id] });
  }
  return { ok: true, restaures: rows.length };
}

/* ─────────────────────────── RGPD (§95) ─────────────────────────── */

/** Export des données d'un utilisateur dans le module (droit d'accès). */
export async function exportRgpd(acteur: Acteur, userId: string): Promise<Record<string, unknown> | ErreurEchanges> {
  if (!acteur.capacites.has('rgpd')) return { error: 'Action réservée au Super Admin.', code: 'DROITS' };
  const t = (table: string, col: string, sel = '*') => db().from(table).select(sel).eq(col, userId).then((r: { data: unknown }) => r.data ?? []);
  const [messages, membres, reactions, sanctions, signalements, blocages, lectures, pj, tags, prefs] = await Promise.all([
    t('echanges_messages', 'auteur_id', 'id, groupe_id, canal, contenu, created_at, modifie_at, supprime_at, suppression_origine, purge_at, statut'),
    t('echanges_membres', 'user_id'), t('echanges_reactions', 'user_id'), t('echanges_sanctions', 'user_id'),
    t('echanges_signalements', 'signale_par'), t('echanges_blocages', 'user_id'), t('echanges_lectures', 'user_id'),
    t('echanges_pieces_jointes', 'uploader_id', 'id, groupe_id, message_id, nom, mime, taille, legende, statut, created_at, supprime_at, purge_at'),
    t('echanges_tags', 'eleve_id', 'id, message_id, groupe_id, tag_at, statut, repondu_at'),
    t('notification_preferences', 'user_id'),
  ]);
  await auditer({ action: 'rgpd_export', acteurId: acteur.id, acteurRole: acteur.role, cibleUserId: userId });
  return { genere_le: new Date().toISOString(), utilisateur: userId, messages, groupes: membres, reactions, sanctions, signalements_effectues: signalements, tentatives_bloquees: blocages, lectures, pieces_jointes: pj, questions_aux_enseignants: tags, preferences_notifications: prefs };
}

/**
 * Effacement (droit à l'effacement) : contenus et pièces jointes de la
 * personne purgés définitivement, sauf groupes sous conservation légale
 * (litige, obligation), qui sont signalés.
 */
export async function effacementRgpd(acteur: Acteur, userId: string): Promise<{ ok: true; purges: number; conserves: number } | ErreurEchanges> {
  if (!acteur.capacites.has('rgpd')) return { error: 'Action réservée au Super Admin.', code: 'DROITS' };
  const { data: msgs } = await db().from('echanges_messages').select('id, groupe_id, echanges_groupes(conservation_legale)').eq('auteur_id', userId).is('purge_at', null);
  const rows = (msgs ?? []) as { id: string; groupe_id: string; echanges_groupes: { conservation_legale: boolean } | null }[];
  const purgeables = rows.filter((r) => !r.echanges_groupes?.conservation_legale).map((r) => r.id);
  const conserves = rows.length - purgeables.length;
  const maintenant = new Date().toISOString();
  for (let i = 0; i < purgeables.length; i += 200) {
    const lot = purgeables.slice(i, i + 200);
    await db().from('echanges_versions').delete().in('message_id', lot);
    await db().from('echanges_messages').update({ contenu: null, contexte: null, purge_at: maintenant, supprime_at: maintenant, suppression_origine: 'rgpd' }).in('id', lot);
    for (const id of lot) await db().rpc('echanges_annuler_tags_message', { p_message: id, p_motif: 'Effacement RGPD' });
  }
  const { data: pj } = await db().from('echanges_pieces_jointes').select('id, chemin').eq('uploader_id', userId).is('purge_at', null);
  const chemins = ((pj ?? []) as { chemin: string }[]).map((p) => p.chemin);
  if (chemins.length) {
    await effacerDuStockage(chemins);
    await db().from('echanges_pieces_jointes').update({ purge_at: maintenant }).eq('uploader_id', userId).is('purge_at', null);
  }
  await db().from('echanges_reactions').delete().eq('user_id', userId);
  await db().from('echanges_lectures').delete().eq('user_id', userId);
  await db().from('echanges_blocages').update({ extrait: null }).eq('user_id', userId);
  await auditer({ action: 'rgpd_effacement', acteurId: acteur.id, acteurRole: acteur.role, cibleUserId: userId, details: { messages_purges: purgeables.length, conserves_legal: conserves, fichiers: chemins.length } });
  return { ok: true, purges: purgeables.length, conserves };
}
