import 'server-only';
import { getAccessInfo } from '@/lib/auth/access';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { siteUrl } from '@/lib/email/send';
import {
  apercuChangementCriteres, correspondAuxCriteres, lireCriteres, participe,
  type Criteres, type EleveCriteres, type ModeParticipants, type StatutGroupe,
} from '../regles';
import type { ErreurEchanges } from '../types';
import { COLONNES_GROUPE, contexteCriteres, type Acteur, type GroupeRow } from './acces';
import { auditer, db, FACULTE, journaliser, parametres, uuidOuNull } from './base';
import { enfiler } from './emails';
import { questionsAReaffecter } from './questions';
import { diffuser } from './temps-reel';

/**
 * Administration des groupes (promotions) — CDC §7-11, §79-85, §104-111,
 * §172-185. Toutes les fonctions vérifient la capacité `gerer_groupes`.
 */

type R<T = { ok: true }> = T | ErreurEchanges;

function refus(): ErreurEchanges {
  return { error: 'Action réservée à l’administration des échanges.', code: 'DROITS' };
}

export type EntreeGroupe = {
  nom: string;
  annee: number | null;
  promotion: string | null;
  specialiteId: string | null;
  description: string | null;
  modeParticipants: ModeParticipants;
  criteres: Criteres;
  moderationPrealable: boolean;
  notifierChaqueMessage: boolean;
  bibliothequeAcces: boolean;
  messageAccueil: string | null;
  dateOuverture: string | null;
  dateCloturePrevue: string | null;
  dateArchivagePrevue: string | null;
  alerteArchivageJours: number;
};

function nettoyer(e: Partial<EntreeGroupe>, specialites: Map<string, string>) {
  const out: Record<string, unknown> = {};
  if (e.nom !== undefined) out.nom = e.nom.trim().slice(0, 120);
  if (e.annee !== undefined) out.annee = e.annee && e.annee >= 2020 && e.annee <= 2100 ? e.annee : null;
  if (e.promotion !== undefined) out.promotion = e.promotion?.trim().slice(0, 80) || null;
  if (e.specialiteId !== undefined) {
    out.specialite_id = e.specialiteId && specialites.has(e.specialiteId) ? e.specialiteId : null;
    out.specialite_nom = e.specialiteId ? specialites.get(e.specialiteId) ?? null : null;
  }
  if (e.description !== undefined) out.description = e.description?.trim().slice(0, 1000) || null;
  if (e.modeParticipants !== undefined) out.mode_participants = e.modeParticipants;
  if (e.criteres !== undefined) {
    const c = lireCriteres(e.criteres);
    out.criteres = { ...c, specialites: (c.specialites ?? []).filter((s) => specialites.has(s)) };
  }
  if (e.moderationPrealable !== undefined) out.moderation_prealable = e.moderationPrealable;
  if (e.notifierChaqueMessage !== undefined) out.notifier_chaque_message = e.notifierChaqueMessage;
  if (e.bibliothequeAcces !== undefined) out.bibliotheque_acces = e.bibliothequeAcces;
  if (e.messageAccueil !== undefined) out.message_accueil = e.messageAccueil?.trim().slice(0, 4000) || null;
  const date = (v: string | null | undefined) => (v && Number.isFinite(new Date(v).getTime()) ? new Date(v).toISOString() : null);
  if (e.dateOuverture !== undefined) out.date_ouverture = date(e.dateOuverture);
  if (e.dateCloturePrevue !== undefined) out.date_cloture_prevue = date(e.dateCloturePrevue);
  if (e.dateArchivagePrevue !== undefined) { out.date_archivage_prevue = date(e.dateArchivagePrevue); out.alerte_archivage_envoyee_at = null; }
  if (e.alerteArchivageJours !== undefined) out.alerte_archivage_jours = Math.max(0, Math.min(60, Math.round(e.alerteArchivageJours)));
  return out;
}

export async function creerGroupe(acteur: Acteur, e: EntreeGroupe, opts: { dupliqueDe?: string | null } = {}): Promise<R<{ id: string }>> {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const ctx = await contexteCriteres();
  const specs = new Map(ctx.specialites.map((s) => [s.id, s.nom]));
  const ligne = nettoyer(e, specs);
  if (!ligne.nom || String(ligne.nom).length < 2) return { error: 'Nom du groupe obligatoire.', code: 'INVALIDE' };
  const { data, error } = await db().from('echanges_groupes').insert({
    ...ligne, faculte_id: FACULTE, statut: 'brouillon', created_by: acteur.id, duplique_de: opts.dupliqueDe ?? null,
  }).select('id').single();
  if (error) return { error: error.message, code: 'INVALIDE' };
  await auditer({ action: opts.dupliqueDe ? 'groupe_duplication' : 'groupe_creation', acteurId: acteur.id, acteurRole: acteur.role, groupeId: data.id, details: { ...ligne, duplique_de: opts.dupliqueDe ?? null } });
  return { id: data.id };
}

export async function modifierGroupe(acteur: Acteur, id: string, e: Partial<EntreeGroupe>): Promise<R> {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const ctx = await contexteCriteres();
  const ligne = nettoyer(e, new Map(ctx.specialites.map((s) => [s.id, s.nom])));
  const { data: avant } = await db().from('echanges_groupes').select(COLONNES_GROUPE).eq('id', id).eq('faculte_id', FACULTE).maybeSingle();
  if (!avant) return { error: 'Groupe introuvable.', code: 'INTROUVABLE' };
  const { error } = await db().from('echanges_groupes').update(ligne).eq('id', id);
  if (error) return { error: error.message, code: 'INVALIDE' };
  const changeCriteres = 'criteres' in ligne || 'mode_participants' in ligne;
  await auditer({
    action: changeCriteres ? 'criteres_modification' : 'groupe_modification', acteurId: acteur.id, acteurRole: acteur.role, groupeId: id,
    details: { avant: Object.fromEntries(Object.keys(ligne).map((k) => [k, (avant as Record<string, unknown>)[k]])), apres: ligne },
  });
  if (changeCriteres) await synchroniserGroupe(id);
  void diffuser(avant.topic, { t: 'groupe' });
  return { ok: true };
}

/* ─────────────────────────── Statuts (§10, §104) ─────────────────────────── */

const TRANSITIONS: Record<StatutGroupe, StatutGroupe[]> = {
  brouillon: ['active'],
  active: ['cloturee'],
  cloturee: ['active', 'archivee'],
  archivee: [],
};

/**
 * Changement de statut. L'archivage propose de verser les réponses épinglées
 * dans la bibliothèque (§80) : `transfert` = 'tout' | ids choisis | 'aucun'.
 */
export async function changerStatut(acteur: Acteur, id: string, statut: StatutGroupe, opts: { transfert?: 'tout' | 'aucun' | string[] } = {}): Promise<R> {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const { data: g } = await db().from('echanges_groupes').select(COLONNES_GROUPE).eq('id', id).eq('faculte_id', FACULTE).maybeSingle();
  if (!g) return { error: 'Groupe introuvable.', code: 'INTROUVABLE' };
  if (!TRANSITIONS[g.statut as StatutGroupe].includes(statut)) return { error: `Passage « ${g.statut} » → « ${statut} » impossible.`, code: 'INVALIDE' };
  const maintenant = new Date().toISOString();
  const maj: Record<string, unknown> = { statut };
  if (statut === 'active') { maj.ouverte_at = g.statut === 'brouillon' ? maintenant : undefined; maj.cloturee_at = null; maj.cloturee_par = null; }
  if (statut === 'cloturee') { maj.cloturee_at = maintenant; maj.cloturee_par = uuidOuNull(acteur.id); }
  if (statut === 'archivee') { maj.archivee_at = maintenant; maj.archivee_par = uuidOuNull(acteur.id); }
  Object.keys(maj).forEach((k) => maj[k] === undefined && delete maj[k]);
  const { error } = await db().from('echanges_groupes').update(maj).eq('id', id);
  if (error) return { error: error.message, code: 'INVALIDE' };
  if (statut === 'active' && g.statut === 'brouillon') {
    await synchroniserGroupe(id);
    await messageSysteme(id, null);
  }
  if (statut === 'archivee' && opts.transfert && opts.transfert !== 'aucun') {
    const { verserEpinglesDansBibliotheque } = await import('./bibliotheque');
    await verserEpinglesDansBibliotheque(acteur, id, opts.transfert);
  }
  await auditer({
    action: statut === 'active' ? (g.statut === 'brouillon' ? 'groupe_activation' : 'groupe_reouverture') : statut === 'cloturee' ? 'groupe_cloture' : 'groupe_archivage',
    acteurId: acteur.id, acteurRole: acteur.role, groupeId: id, details: { de: g.statut, vers: statut, transfert: opts.transfert ?? null },
  });
  void diffuser(g.topic, { t: 'groupe' });
  return { ok: true };
}

/** Activer / désactiver un groupe sans rien supprimer (§172, R43). */
export async function basculerVisibilite(acteur: Acteur, id: string, visible: boolean): Promise<R> {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const { data, error } = await db().from('echanges_groupes').update({ visible }).eq('id', id).eq('faculte_id', FACULTE).select('topic').maybeSingle();
  if (error || !data) return { error: error?.message ?? 'Groupe introuvable.', code: 'INVALIDE' };
  await auditer({ action: visible ? 'groupe_activation' : 'groupe_desactivation', acteurId: acteur.id, acteurRole: acteur.role, groupeId: id, details: { visible } });
  void diffuser(data.topic, { t: 'groupe' });
  return { ok: true };
}

/**
 * Dupliquer la configuration (§106) : SEULS les paramètres sont copiés —
 * jamais les candidats, conversations, signalements ni sanctions. Les
 * enseignants sont proposés (pas réaffectés automatiquement).
 */
export async function dupliquerGroupe(acteur: Acteur, id: string, o: { nom: string; annee: number | null; promotion: string | null }): Promise<R<{ id: string; enseignantsProposes: { userId: string; prenom: string | null }[] }>> {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const { data: g } = await db().from('echanges_groupes').select(COLONNES_GROUPE).eq('id', id).eq('faculte_id', FACULTE).maybeSingle();
  if (!g) return { error: 'Groupe introuvable.', code: 'INTROUVABLE' };
  const r = await creerGroupe(acteur, {
    nom: o.nom, annee: o.annee, promotion: o.promotion, specialiteId: g.specialite_id, description: g.description,
    modeParticipants: g.mode_participants, criteres: lireCriteres(g.criteres), moderationPrealable: g.moderation_prealable,
    notifierChaqueMessage: g.notifier_chaque_message, bibliothequeAcces: g.bibliotheque_acces, messageAccueil: g.message_accueil,
    dateOuverture: null, dateCloturePrevue: null, dateArchivagePrevue: null, alerteArchivageJours: 7,
  }, { dupliqueDe: id });
  if ('error' in r) return r;
  const { data: ens } = await db().from('echanges_enseignants').select('user_id').eq('groupe_id', id).eq('actif', true);
  const ids = ((ens ?? []) as { user_id: string }[]).map((x) => x.user_id);
  const { identitesDe } = await import('./identites');
  const idt = await identitesDe(ids);
  return { id: r.id, enseignantsProposes: ids.map((u) => ({ userId: u, prenom: idt.get(u)?.prenom_public ?? null })) };
}

/* ─────────────────────────── Participants (§84, §176-181) ─────────────────────────── */

export type EleveLigne = EleveCriteres & {
  id: string; first_name: string | null; last_name: string | null; email: string | null; pseudo: string | null;
};

/** Tous les élèves de la plateforme (par tranches : PostgREST plafonne à 1 000 lignes). */
export async function tousLesEleves(): Promise<EleveLigne[]> {
  type L = { id: string; first_name: string | null; last_name: string | null; email: string | null; pseudo: string | null; permission_scope: unknown; is_active: boolean | null; access_end: string | null; evc_session: unknown };
  const lignes = await fetchAllRows<L>((from, to) => db().from('profiles')
    .select('id, first_name, last_name, email, pseudo, permission_scope, is_active, access_end, evc_session:evc_sessions(default_access_end)')
    .eq('role', 'student').eq('faculte_id', FACULTE).order('id').range(from, to));
  return lignes.map((l) => {
    const s = Array.isArray(l.evc_session) ? l.evc_session[0] : l.evc_session;
    return { ...l, role: 'student', expire: getAccessInfo({ role: 'student', access_end: l.access_end, evc_session: (s ?? null) as { default_access_end: string } | null }).expired };
  });
}

type AdhesionRow = { user_id: string; source: 'auto' | 'manuel'; statut: 'actif' | 'retire'; exclusion_forcee: boolean };

async function adhesionsDuGroupe(id: string): Promise<Map<string, AdhesionRow>> {
  const rows = await fetchAllRows<AdhesionRow>((from, to) => db().from('echanges_membres')
    .select('user_id, source, statut, exclusion_forcee').eq('groupe_id', id).order('user_id').range(from, to));
  return new Map(rows.map((r) => [r.user_id, r]));
}

/** Aperçu AVANT application d'un changement de critères (§181, R50). */
export async function apercuCriteres(acteur: Acteur, id: string, nouveau: { mode: ModeParticipants; criteres: Criteres }) {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const { data: g } = await db().from('echanges_groupes').select(COLONNES_GROUPE).eq('id', id).eq('faculte_id', FACULTE).maybeSingle();
  if (!g) return { error: 'Groupe introuvable.', code: 'INTROUVABLE' } as ErreurEchanges;
  const [eleves, adhesions, ctx] = await Promise.all([tousLesEleves(), adhesionsDuGroupe(id), contexteCriteres()]);
  const r = apercuChangementCriteres({
    eleves, adhesions, ctx,
    ancien: { mode: g.mode_participants, criteres: lireCriteres(g.criteres) },
    nouveau: { mode: nouveau.mode, criteres: lireCriteres(nouveau.criteres) },
  });
  const court = (l: { id: string; first_name: string | null; last_name: string | null; email: string | null }[]) => l.map((e) => ({ id: e.id, nom: `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim() || e.email || e.id, email: e.email }));
  return { ajoutes: court(r.ajoutes), retires: court(r.retires), exceptionsInclusion: court(r.exceptionsInclusion), exceptionsExclusion: court(r.exceptionsExclusion) };
}

/**
 * Synchronisation d'un groupe avec les inscriptions (§84, §178) : ajoute les
 * élèves qui correspondent, retire ceux qui ne correspondent plus (adhésions
 * automatiques seulement), respecte les exceptions. Les messages déjà publiés
 * restent attachés au groupe (§78, §178).
 */
export async function synchroniserGroupe(id: string, eleves?: EleveLigne[]): Promise<{ ajoutes: number; retires: number }> {
  const { data: g } = await db().from('echanges_groupes').select(COLONNES_GROUPE).eq('id', id).maybeSingle();
  if (!g || g.statut === 'archivee') return { ajoutes: 0, retires: 0 };
  const groupe = g as GroupeRow;
  const [liste, adhesions, ctx] = await Promise.all([eleves ? Promise.resolve(eleves) : tousLesEleves(), adhesionsDuGroupe(id), contexteCriteres()]);
  const criteres = lireCriteres(groupe.criteres);
  const maintenant = new Date().toISOString();
  const ajouts: Record<string, unknown>[] = [];
  const retraits: string[] = [];
  for (const e of liste) {
    const a = adhesions.get(e.id) ?? null;
    const correspond = groupe.mode_participants !== 'manuel' && correspondAuxCriteres(e, criteres, ctx);
    const ok = participe(a, groupe.mode_participants, correspond, e.is_active !== false && !e.expire);
    if (ok && (!a || a.statut !== 'actif') && !(a?.source === 'manuel')) {
      ajouts.push({ groupe_id: id, user_id: e.id, source: 'auto', statut: 'actif', ajoute_at: maintenant, retire_at: null, motif_retrait: null });
    }
    if (!ok && a && a.statut === 'actif' && !a.exclusion_forcee) {
      if (a.source === 'auto' || e.is_active === false || e.expire) retraits.push(e.id);
    }
  }
  for (let i = 0; i < ajouts.length; i += 500) await db().from('echanges_membres').upsert(ajouts.slice(i, i + 500), { onConflict: 'groupe_id,user_id' });
  for (let i = 0; i < retraits.length; i += 200) {
    await db().from('echanges_membres').update({ statut: 'retire', retire_at: maintenant, motif_retrait: 'Inscription ne correspondant plus au groupe' })
      .eq('groupe_id', id).in('user_id', retraits.slice(i, i + 200));
  }
  return { ajoutes: ajouts.length, retires: retraits.length };
}

export async function synchroniserTout(): Promise<{ groupes: number; ajoutes: number; retires: number }> {
  const { data } = await db().from('echanges_groupes').select('id').eq('faculte_id', FACULTE).in('statut', ['brouillon', 'active', 'cloturee']);
  const ids = ((data ?? []) as { id: string }[]).map((x) => x.id);
  if (ids.length === 0) return { groupes: 0, ajoutes: 0, retires: 0 };
  const eleves = await tousLesEleves();
  let ajoutes = 0; let retires = 0;
  for (const id of ids) {
    try {
      const r = await synchroniserGroupe(id, eleves);
      ajoutes += r.ajoutes; retires += r.retires;
    } catch (e) {
      await journaliser('erreur', 'synchro', 'Synchronisation d’un groupe impossible', { groupe: id, erreur: String(e) });
    }
  }
  return { groupes: ids.length, ajoutes, retires };
}

/** Ajout / retrait manuel, exclusion forcée (exception, §179, R46). */
export async function gererParticipants(acteur: Acteur, id: string, action: 'ajouter' | 'retirer' | 'exclure' | 'retablir', userIds: string[]): Promise<R<{ ok: true; n: number }>> {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const ids = [...new Set(userIds)].filter((x) => /^[0-9a-f-]{36}$/i.test(x)).slice(0, 1000);
  if (ids.length === 0) return { error: 'Aucun candidat sélectionné.', code: 'INVALIDE' };
  const { data: g } = await db().from('echanges_groupes').select('id, topic').eq('id', id).eq('faculte_id', FACULTE).maybeSingle();
  if (!g) return { error: 'Groupe introuvable.', code: 'INTROUVABLE' };
  // Seuls des comptes élèves de la plateforme.
  const { data: profs } = await db().from('profiles').select('id').in('id', ids).eq('role', 'student').eq('faculte_id', FACULTE);
  const valides = ((profs ?? []) as { id: string }[]).map((p) => p.id);
  const maintenant = new Date().toISOString();
  if (action === 'ajouter' || action === 'retablir') {
    await db().from('echanges_membres').upsert(valides.map((u) => ({
      groupe_id: id, user_id: u, source: 'manuel', statut: 'actif', exclusion_forcee: false, ajoute_at: maintenant, ajoute_par: acteur.id, retire_at: null, retire_par: null, motif_retrait: null,
    })), { onConflict: 'groupe_id,user_id' });
  } else {
    await db().from('echanges_membres').upsert(valides.map((u) => ({
      groupe_id: id, user_id: u, source: 'manuel', statut: 'retire', exclusion_forcee: action === 'exclure',
      retire_at: maintenant, retire_par: acteur.id, motif_retrait: action === 'exclure' ? 'Exclusion administrative du groupe' : 'Retrait manuel',
    })), { onConflict: 'groupe_id,user_id' });
  }
  for (const u of valides) {
    await auditer({
      action: action === 'exclure' ? 'participant_exclusion_forcee' : action === 'retirer' ? 'participant_retrait' : 'participant_ajout',
      acteurId: acteur.id, acteurRole: acteur.role, groupeId: id, cibleUserId: u,
    });
  }
  void diffuser(g.topic, { t: 'groupe' });
  return { ok: true, n: valides.length };
}

/* ─────────────────────────── Enseignants (§76, §85, §113-115) ─────────────────────────── */

export async function enregistrerIdentite(acteur: Acteur, userId: string, i: { prenomPublic: string; qualite: string; specialite: string | null; avatarMode: 'initiale' | 'majorecn' | 'neutre' | 'photo'; avatarUrl?: string | null }): Promise<R> {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const prenom = i.prenomPublic.trim();
  if (prenom.length < 1 || prenom.length > 40) return { error: 'Prénom public obligatoire (40 caractères au maximum).', code: 'INVALIDE' };
  const { data: p } = await db().from('profiles').select('id, role, last_name').eq('id', userId).maybeSingle();
  if (!p || (p.role !== 'professor' && p.role !== 'admin')) return { error: 'Compte de l’équipe introuvable.', code: 'INTROUVABLE' };
  // Garde-fou §14 : le nom de famille du compte ne doit pas apparaître dans l'identité publique.
  const nom = (p.last_name ?? '').trim().toLowerCase();
  if (nom.length >= 3 && `${prenom} ${i.qualite}`.toLowerCase().includes(nom)) {
    return { error: 'L’identité publique ne doit pas contenir le nom de famille de l’enseignant.', code: 'INVALIDE' };
  }
  const { error } = await db().from('echanges_identites').upsert({
    user_id: userId, prenom_public: prenom, qualite: i.qualite.trim().slice(0, 80) || 'Enseignant Major ECN',
    specialite: i.specialite?.trim().slice(0, 80) || null, avatar_mode: i.avatarMode, avatar_chemin: i.avatarMode === 'photo' ? i.avatarUrl ?? null : null,
    updated_at: new Date().toISOString(), updated_by: acteur.id,
  }, { onConflict: 'user_id' });
  if (error) return { error: error.message, code: 'INVALIDE' };
  await auditer({ action: 'identite_modification', acteurId: acteur.id, acteurRole: acteur.role, cibleUserId: userId, details: { prenom_public: prenom, qualite: i.qualite } });
  return { ok: true };
}

export async function affecterEnseignant(acteur: Acteur, groupeId: string, e: {
  userId: string; qualite: string | null; specialitePublique: string | null; emailNotification: string | null;
  peutPublier: boolean; peutEpingler: boolean; actif: boolean; annoncer?: boolean;
}): Promise<R> {
  if (!acteur.capacites.has('gerer_groupes')) return refus();
  const { data: p } = await db().from('profiles').select('id, role').eq('id', e.userId).maybeSingle();
  if (!p || (p.role !== 'professor' && p.role !== 'admin')) return { error: 'Seuls les comptes de l’équipe peuvent être enseignants d’un groupe.', code: 'INVALIDE' };
  const { data: idt } = await db().from('echanges_identites').select('user_id').eq('user_id', e.userId).maybeSingle();
  if (!idt) return { error: 'Renseignez d’abord le prénom public de cet enseignant.', code: 'INVALIDE' };
  const email = e.emailNotification?.trim() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Adresse de notification invalide.', code: 'INVALIDE' };
  const { data: avant } = await db().from('echanges_enseignants').select('id, actif').eq('groupe_id', groupeId).eq('user_id', e.userId).maybeSingle();
  const maintenant = new Date().toISOString();
  const { error } = await db().from('echanges_enseignants').upsert({
    groupe_id: groupeId, user_id: e.userId, qualite: e.qualite?.trim() || null, specialite_publique: e.specialitePublique?.trim() || null,
    email_notification: email, peut_publier: e.peutPublier, peut_epingler: e.peutEpingler, actif: e.actif,
    ajoute_par: avant ? undefined : acteur.id, retire_at: e.actif ? null : maintenant, retire_par: e.actif ? null : acteur.id,
  }, { onConflict: 'groupe_id,user_id' });
  if (error) return { error: error.message, code: 'INVALIDE' };
  let aReaffecter = 0;
  if (!e.actif && avant?.actif) aReaffecter = await questionsAReaffecter(groupeId, e.userId);
  await auditer({
    action: !avant ? 'enseignant_ajout' : !e.actif && avant.actif ? 'enseignant_retrait' : 'enseignant_modification',
    acteurId: acteur.id, acteurRole: acteur.role, groupeId, cibleUserId: e.userId,
    details: { peut_publier: e.peutPublier, peut_epingler: e.peutEpingler, actif: e.actif, questions_a_reaffecter: aReaffecter },
  });
  if (e.actif && (!avant || !avant.actif) && e.annoncer) await messageSysteme(groupeId, e.userId);
  return { ok: true };
}

/* ─────────────────────────── Messages système (§107, §111) ─────────────────────────── */

/**
 * Messages automatiques, avec parcimonie : arrivée d'un enseignant (si
 * l'équipe le souhaite), archivage prochain. Jamais pour la modération (§112).
 */
export async function messageSysteme(groupeId: string, nouvelEnseignant: string | null, texte?: string): Promise<void> {
  let contenu = texte ?? null;
  if (!contenu && nouvelEnseignant) {
    const { data: idt } = await db().from('echanges_identites').select('prenom_public, qualite').eq('user_id', nouvelEnseignant).maybeSingle();
    if (!idt) return;
    contenu = `${idt.prenom_public} · ${idt.qualite} rejoint cet espace.`;
  }
  if (!contenu) return;
  const { data } = await db().from('echanges_messages').insert({ groupe_id: groupeId, canal: 'discussion', auteur_id: null, auteur_type: 'systeme', contenu }).select('id').single();
  const { data: g } = await db().from('echanges_groupes').select('topic').eq('id', groupeId).maybeSingle();
  if (g && data) void diffuser(g.topic, { t: 'message', ids: [data.id] });
}

/* ─────────────────────────── Échéances (§79) ─────────────────────────── */

/** Clôture / archivage automatiques aux dates prévues, alerte avant archivage. */
export async function echeancesGroupes(): Promise<{ clotures: number; archives: number; alertes: number }> {
  const maintenant = new Date();
  const { data } = await db().from('echanges_groupes').select(COLONNES_GROUPE + ', alerte_archivage_jours, alerte_archivage_envoyee_at')
    .eq('faculte_id', FACULTE).in('statut', ['active', 'cloturee']);
  let clotures = 0; let archives = 0; let alertes = 0;
  const systeme = { id: 'systeme', role: 'admin', capacites: new Set(['gerer_groupes', 'bibliotheque']), niveau: 'super_admin' } as unknown as Acteur;
  for (const g of (data ?? []) as (GroupeRow & { alerte_archivage_jours: number; alerte_archivage_envoyee_at: string | null })[]) {
    if (g.statut === 'active' && g.date_cloture_prevue && new Date(g.date_cloture_prevue) <= maintenant) {
      const r = await changerStatut(systeme, g.id, 'cloturee');
      if (!('error' in r)) clotures += 1;
      continue;
    }
    if (g.date_archivage_prevue) {
      const echeance = new Date(g.date_archivage_prevue);
      const alerteAt = new Date(echeance.getTime() - g.alerte_archivage_jours * 86_400_000);
      if (!g.alerte_archivage_envoyee_at && alerteAt <= maintenant && echeance > maintenant) {
        const { count } = await db().from('echanges_messages').select('id', { count: 'exact', head: true }).eq('groupe_id', g.id).not('epingle_at', 'is', null).is('supprime_at', null);
        await enfiler({
          cle: `archivage:${g.id}:${g.date_archivage_prevue}`, type: 'archivage_alerte', groupeId: g.id,
          donnees: {
            sujet: `Major ECN — Archivage prochain : ${g.nom}`,
            titre: 'Une promotion sera bientôt archivée',
            lignes: [['Groupe', g.nom], ['Archivage prévu', echeance.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })], ['Réponses épinglées', String(count ?? 0)]],
            texte: (count ?? 0) > 0 ? `Cette promotion contient ${count} réponses épinglées. Pensez à choisir celles à conserver dans la bibliothèque pédagogique.` : null,
            lien: `${siteUrl()}/admin/echanges/groupes/${g.id}`,
            bouton: 'Ouvrir la promotion',
          },
        });
        await db().from('echanges_groupes').update({ alerte_archivage_envoyee_at: maintenant.toISOString() }).eq('id', g.id);
        await messageSysteme(g.id, null, `Cette promotion sera archivée le ${echeance.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric' })}.`);
        alertes += 1;
      }
      if (echeance <= maintenant) {
        if (g.statut === 'active') await changerStatut(systeme, g.id, 'cloturee');
        // Archivage automatique : les épinglés ne sont PAS versés d'office (l'administration garde la main, §80).
        const r = await changerStatut(systeme, g.id, 'archivee', { transfert: 'aucun' });
        if (!('error' in r)) archives += 1;
      }
    }
  }
  return { clotures, archives, alertes };
}

/* ─────────────────────────── Fiche promotion (§83) ─────────────────────────── */

export async function ficheGroupe(id: string) {
  const prm = await parametres();
  const [{ data: g }, membres, ens, msgs, tags, epingles, recent] = await Promise.all([
    db().from('echanges_groupes').select('*').eq('id', id).eq('faculte_id', FACULTE).maybeSingle(),
    db().from('echanges_membres').select('user_id', { count: 'exact', head: true }).eq('groupe_id', id).eq('statut', 'actif').eq('exclusion_forcee', false),
    db().from('echanges_enseignants').select('id', { count: 'exact', head: true }).eq('groupe_id', id).eq('actif', true),
    db().from('echanges_messages').select('id', { count: 'exact', head: true }).eq('groupe_id', id).is('supprime_at', null).eq('statut', 'publie'),
    db().from('echanges_tags').select('id', { count: 'exact', head: true }).eq('groupe_id', id).neq('statut', 'annulee'),
    db().from('echanges_messages').select('id', { count: 'exact', head: true }).eq('groupe_id', id).not('epingle_at', 'is', null).is('supprime_at', null),
    db().from('echanges_messages').select('id', { count: 'exact', head: true }).eq('groupe_id', id).is('supprime_at', null).gte('created_at', new Date(Date.now() - 7 * 86_400_000).toISOString()),
  ]);
  if (!g) return null;
  return {
    groupe: g,
    compteurs: {
      candidats: membres.count ?? 0, enseignants: ens.count ?? 0, messages: msgs.count ?? 0,
      questions: tags.count ?? 0, epingles: epingles.count ?? 0, messages7j: recent.count ?? 0,
    },
    relanceHeures: prm.relance_heures,
  };
}
