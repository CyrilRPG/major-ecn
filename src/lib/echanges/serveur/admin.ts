import 'server-only';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { categoriesFormule, LIBELLE_FORMULE, nomEleve, voieDuScope, type Capacite, type NiveauStaff, type StatutGroupe } from '../regles';
import type { ErreurEchanges } from '../types';
import { chargerActeur, COLONNES_GROUPE, type Acteur, type GroupeRow } from './acces';
import { auditer, db, extrait, FACULTE, oublierParametres, parametres, parTranches, type Parametres } from './base';
import { identitesDe } from './identites';

/**
 * Back-office des Échanges (/admin/echanges) — lectures de listes et réglages
 * qui n'existaient pas encore côté serveur : tableau de bord, promotions avec
 * compteurs, participants, enseignants, file de modération, messages
 * supprimés, archives, journal d'audit, paramètres et équipe de modération.
 * Chaque lecture et chaque écriture vérifie le NIVEAU de la personne (§102-103).
 */

type R<T = { ok: true }> = T | ErreurEchanges;

function refus(): ErreurEchanges {
  return { error: 'Action réservée à l’administration des échanges.', code: 'DROITS' };
}

/**
 * Acteur du back-office : compte de l'équipe doté d'un niveau Échanges
 * (Super Admin = administrateur, sinon ligne `echanges_staff`). `null` si la
 * personne n'a aucun niveau. Import différé de require-role : ce module reste
 * utilisable hors du rendu Next (scripts de recette).
 */
export async function acteurBackOffice(): Promise<Acteur | null> {
  const { requireStaff } = await import('@/lib/auth/require-role');
  const { user } = await requireStaff();
  const a = await chargerActeur(user.id);
  return a && a.niveau ? a : null;
}

export function peut(a: Acteur, c: Capacite): boolean {
  return a.capacites.has(c);
}

/** Groupes visibles d'un modérateur restreint à certaines promotions (null = toutes). */
function filtreGroupes<T extends { id: string }>(a: Acteur, groupes: T[]): T[] {
  return a.staffGroupes ? groupes.filter((g) => a.staffGroupes!.includes(g.id)) : groupes;
}

/* ─────────────────────────── Tableau de bord ─────────────────────────── */

export type TableauDeBord = {
  mode: Parametres['module_mode'];
  groupes: Record<StatutGroupe, number>;
  candidats: number;
  messages7j: number;
  messages24h: number;
  questionsEnAttente: number;
  questionsEnRetard: number;
  questionsAReaffecter: number;
  fileValidation: number;
  signalements: number;
  blocages: number;
  sanctionsActives: number;
  emailsEchec: number;
  crons: { nom: string; dernier: string | null; dureeMs: number | null }[];
  erreurs7j: number;
  relanceHeures: number;
};

export async function tableauDeBord(a: Acteur): Promise<TableauDeBord> {
  const prm = await parametres();
  const { data: gs } = await db().from('echanges_groupes').select('id, statut').eq('faculte_id', FACULTE);
  const groupes = filtreGroupes(a, (gs ?? []) as { id: string; statut: StatutGroupe }[]);
  const ids = groupes.map((g) => g.id);
  const parStatut = { brouillon: 0, active: 0, cloturee: 0, archivee: 0 } as Record<StatutGroupe, number>;
  for (const g of groupes) parStatut[g.statut] += 1;
  const vide = { count: 0 };
  const dans = <Q extends { in: (c: string, v: string[]) => Q }>(q: Q) => q.in('groupe_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  const il7 = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const il24 = new Date(Date.now() - 86_400_000).toISOString();
  const seuil = new Date(Date.now() - prm.relance_heures * 3_600_000).toISOString();
  const [candidats, m7, m24, attente, retard, aReaffecter, file, sign, bloc, sanc, mails, crons, erreurs] = await Promise.all([
    ids.length ? dans(db().from('echanges_membres').select('user_id', { count: 'exact', head: true }).eq('statut', 'actif').eq('exclusion_forcee', false)) : vide,
    ids.length ? dans(db().from('echanges_messages').select('id', { count: 'exact', head: true }).is('supprime_at', null).gte('created_at', il7)) : vide,
    ids.length ? dans(db().from('echanges_messages').select('id', { count: 'exact', head: true }).is('supprime_at', null).gte('created_at', il24)) : vide,
    ids.length ? dans(db().from('echanges_tags').select('id', { count: 'exact', head: true }).eq('statut', 'en_attente')) : vide,
    ids.length ? dans(db().from('echanges_tags').select('id', { count: 'exact', head: true }).eq('statut', 'en_attente').lt('tag_at', seuil)) : vide,
    ids.length ? dans(db().from('echanges_tags').select('id', { count: 'exact', head: true }).eq('statut', 'a_reaffecter')) : vide,
    ids.length ? dans(db().from('echanges_messages').select('id', { count: 'exact', head: true }).eq('statut', 'en_attente').is('supprime_at', null)) : vide,
    ids.length ? dans(db().from('echanges_signalements').select('id', { count: 'exact', head: true }).eq('statut', 'a_examiner')) : vide,
    // Modérateur limité : ses promotions seulement.
    a.staffGroupes ? dans(db().from('echanges_blocages').select('id', { count: 'exact', head: true }).eq('statut', 'en_moderation'))
      : db().from('echanges_blocages').select('id', { count: 'exact', head: true }).eq('statut', 'en_moderation'),
    a.staffGroupes ? dans(db().from('echanges_sanctions').select('id', { count: 'exact', head: true }).is('levee_at', null))
      : db().from('echanges_sanctions').select('id', { count: 'exact', head: true }).is('levee_at', null),
    db().from('echanges_emails').select('id', { count: 'exact', head: true }).eq('statut', 'echec'),
    db().from('echanges_cron_etat').select('nom, dernier_passage_at, duree_ms'),
    db().from('echanges_journal').select('id', { count: 'exact', head: true }).eq('niveau', 'erreur').gte('created_at', il7),
  ]);
  return {
    mode: prm.module_mode,
    groupes: parStatut,
    candidats: candidats.count ?? 0,
    messages7j: m7.count ?? 0,
    messages24h: m24.count ?? 0,
    questionsEnAttente: attente.count ?? 0,
    questionsEnRetard: retard.count ?? 0,
    questionsAReaffecter: aReaffecter.count ?? 0,
    fileValidation: file.count ?? 0,
    signalements: sign.count ?? 0,
    blocages: bloc.count ?? 0,
    sanctionsActives: sanc.count ?? 0,
    emailsEchec: mails.count ?? 0,
    crons: (((crons as { data?: unknown }).data ?? []) as { nom: string; dernier_passage_at: string | null; duree_ms: number | null }[])
      .map((c) => ({ nom: c.nom, dernier: c.dernier_passage_at, dureeMs: c.duree_ms })),
    erreurs7j: erreurs.count ?? 0,
    relanceHeures: prm.relance_heures,
  };
}

/* ─────────────────────────── Promotions ─────────────────────────── */

export type GroupeListe = GroupeRow & {
  candidats: number; enseignants: number; messages7j: number; questionsEnAttente: number; dernierMessage: string | null;
};

export async function listeGroupes(a: Acteur, statuts: StatutGroupe[] = ['brouillon', 'active', 'cloturee']): Promise<GroupeListe[]> {
  const { data } = await db().from('echanges_groupes').select(COLONNES_GROUPE).eq('faculte_id', FACULTE).in('statut', statuts)
    .order('annee', { ascending: false, nullsFirst: false }).order('nom');
  const groupes = filtreGroupes(a, (data ?? []) as GroupeRow[]);
  const il7 = new Date(Date.now() - 7 * 86_400_000).toISOString();
  return Promise.all(groupes.map(async (g) => {
    const [m, e, msg, q, dernier] = await Promise.all([
      db().from('echanges_membres').select('user_id', { count: 'exact', head: true }).eq('groupe_id', g.id).eq('statut', 'actif').eq('exclusion_forcee', false),
      db().from('echanges_enseignants').select('id', { count: 'exact', head: true }).eq('groupe_id', g.id).eq('actif', true),
      db().from('echanges_messages').select('id', { count: 'exact', head: true }).eq('groupe_id', g.id).is('supprime_at', null).gte('created_at', il7),
      db().from('echanges_tags').select('id', { count: 'exact', head: true }).eq('groupe_id', g.id).eq('statut', 'en_attente'),
      db().from('echanges_messages').select('created_at').eq('groupe_id', g.id).is('supprime_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    return {
      ...g, candidats: m.count ?? 0, enseignants: e.count ?? 0, messages7j: msg.count ?? 0, questionsEnAttente: q.count ?? 0,
      dernierMessage: (dernier.data as { created_at: string } | null)?.created_at ?? null,
    };
  }));
}

export async function groupeAccessible(a: Acteur, id: string): Promise<boolean> {
  return !a.staffGroupes || a.staffGroupes.includes(id);
}

const TABLE_CIBLE = {
  message: 'echanges_messages', signalement: 'echanges_signalements', blocage: 'echanges_blocages',
  sanction: 'echanges_sanctions', tag: 'echanges_tags',
} as const;

/**
 * Périmètre d'un modérateur limité à certaines promotions, vérifié à
 * l'ÉCRITURE : chaque cible (message, signalement, tentative, mesure,
 * question) doit appartenir à l'une de ses promotions. Une cible sans
 * promotion (mesure « toutes les messageries ») lui est refusée.
 */
export async function ciblesDansPerimetre(a: Acteur, type: keyof typeof TABLE_CIBLE, ids: string[]): Promise<boolean> {
  if (!a.staffGroupes) return true;
  const uniques = [...new Set(ids)].filter((x) => /^[0-9a-f-]{36}$/i.test(x));
  if (uniques.length === 0) return true;
  const { data } = await db().from(TABLE_CIBLE[type]).select('id, groupe_id').in('id', uniques.slice(0, 500));
  const rows = (data ?? []) as { groupe_id: string | null }[];
  return rows.every((r) => r.groupe_id !== null && a.staffGroupes!.includes(r.groupe_id));
}

export type Participant = {
  userId: string; nom: string; email: string | null; formules: string[]; voie: string | null; source: 'auto' | 'manuel';
  statut: 'actif' | 'retire'; exclusionForcee: boolean; ajouteAt: string | null; retireAt: string | null; motifRetrait: string | null;
  reglesAccepteesAt: string | null; compteActif: boolean;
};

export async function participantsDuGroupe(id: string): Promise<Participant[]> {
  type M = { user_id: string; source: 'auto' | 'manuel'; statut: 'actif' | 'retire'; exclusion_forcee: boolean; ajoute_at: string | null; retire_at: string | null; motif_retrait: string | null; regles_acceptees_at: string | null };
  const membres = await fetchAllRows<M>((from, to) => db().from('echanges_membres')
    .select('user_id, source, statut, exclusion_forcee, ajoute_at, retire_at, motif_retrait, regles_acceptees_at')
    .eq('groupe_id', id).order('user_id').range(from, to));
  const prm = await parametres();
  const profils = await parTranches(membres.map((m) => m.user_id), 150, async (lot) => ((await db().from('profiles')
    .select('id, first_name, last_name, pseudo, email, permission_scope, is_active').in('id', lot)).data ?? []) as { id: string; first_name: string | null; last_name: string | null; pseudo: string | null; email: string | null; permission_scope: unknown; is_active: boolean | null }[]);
  const p = new Map(profils.map((x) => [x.id, x]));
  return membres.map((m) => {
    const x = p.get(m.user_id);
    const vrai = [x?.first_name, x?.last_name].filter(Boolean).join(' ');
    return {
      userId: m.user_id,
      nom: vrai || (x ? nomEleve(x, prm.affichage_eleves) : 'Compte supprimé'),
      email: x?.email ?? null,
      formules: categoriesFormule(x?.permission_scope).map((f) => LIBELLE_FORMULE[f]),
      voie: voieDuScope(x?.permission_scope),
      source: m.source, statut: m.statut, exclusionForcee: m.exclusion_forcee,
      ajouteAt: m.ajoute_at, retireAt: m.retire_at, motifRetrait: m.motif_retrait, reglesAccepteesAt: m.regles_acceptees_at,
      compteActif: x?.is_active !== false,
    };
  }).sort((u, v) => u.nom.localeCompare(v.nom, 'fr'));
}

/** Recherche d'élèves de la plateforme à ajouter manuellement. */
export async function chercherEleves(q: string): Promise<{ id: string; nom: string; email: string | null }[]> {
  const terme = q.trim().replace(/[%,()*]/g, ' ').trim();
  if (terme.length < 2) return [];
  let req = db().from('profiles').select('id, first_name, last_name, email').eq('role', 'student').eq('faculte_id', FACULTE);
  for (const mot of terme.split(/\s+/).slice(0, 3)) req = req.or(`first_name.ilike.%${mot}%,last_name.ilike.%${mot}%,email.ilike.%${mot}%`);
  const { data } = await req.order('last_name').limit(15);
  return ((data ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[])
    .map((p) => ({ id: p.id, nom: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || p.id, email: p.email }));
}

export type EnseignantGroupe = {
  affectationId: string; userId: string; nom: string; email: string | null; prenomPublic: string | null; qualiteIdentite: string | null;
  qualite: string | null; specialitePublique: string | null; emailNotification: string | null; peutPublier: boolean; peutEpingler: boolean;
  actif: boolean; questionsEnAttente: number; questionsAReaffecter: number;
};

export async function enseignantsDuGroupe(id: string): Promise<EnseignantGroupe[]> {
  const { data } = await db().from('echanges_enseignants')
    .select('id, user_id, qualite, specialite_publique, email_notification, peut_publier, peut_epingler, actif').eq('groupe_id', id);
  const rows = (data ?? []) as { id: string; user_id: string; qualite: string | null; specialite_publique: string | null; email_notification: string | null; peut_publier: boolean; peut_epingler: boolean; actif: boolean }[];
  const ids = rows.map((r) => r.user_id);
  const [idt, { data: profs }, { data: tags }] = await Promise.all([
    identitesDe(ids),
    ids.length ? db().from('profiles').select('id, first_name, last_name, email').in('id', ids) : Promise.resolve({ data: [] }),
    db().from('echanges_tags').select('enseignant_id, statut').eq('groupe_id', id).in('statut', ['en_attente', 'a_reaffecter']),
  ]);
  const p = new Map(((profs ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[]).map((x) => [x.id, x]));
  const t = (tags ?? []) as { enseignant_id: string; statut: string }[];
  return rows.map((r) => ({
    affectationId: r.id, userId: r.user_id,
    nom: [p.get(r.user_id)?.first_name, p.get(r.user_id)?.last_name].filter(Boolean).join(' ') || p.get(r.user_id)?.email || 'Compte',
    email: p.get(r.user_id)?.email ?? null,
    prenomPublic: idt.get(r.user_id)?.prenom_public ?? null, qualiteIdentite: idt.get(r.user_id)?.qualite ?? null,
    qualite: r.qualite, specialitePublique: r.specialite_publique, emailNotification: r.email_notification,
    peutPublier: r.peut_publier, peutEpingler: r.peut_epingler, actif: r.actif,
    questionsEnAttente: t.filter((x) => x.enseignant_id === r.user_id && x.statut === 'en_attente').length,
    questionsAReaffecter: t.filter((x) => x.enseignant_id === r.user_id && x.statut === 'a_reaffecter').length,
  })).sort((u, v) => Number(v.actif) - Number(u.actif) || u.nom.localeCompare(v.nom, 'fr'));
}

/** Comptes de l'équipe pouvant devenir enseignants d'un groupe (avec leur identité publique éventuelle). */
export async function equipeDisponible(): Promise<{ userId: string; nom: string; email: string | null; role: string; prenomPublic: string | null; qualite: string | null; specialite: string | null }[]> {
  const { data } = await db().from('profiles').select('id, first_name, last_name, email, role, is_active')
    .in('role', ['professor', 'admin']).eq('faculte_id', FACULTE).order('last_name').limit(1000);
  const profs = ((data ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null; role: string; is_active: boolean | null }[])
    .filter((p) => p.is_active !== false);
  const idt = await identitesDe(profs.map((p) => p.id));
  return profs.map((p) => ({
    userId: p.id, nom: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || p.id, email: p.email, role: p.role,
    prenomPublic: idt.get(p.id)?.prenom_public ?? null, qualite: idt.get(p.id)?.qualite ?? null, specialite: idt.get(p.id)?.specialite ?? null,
  }));
}

/** Questions à réaffecter d'un groupe (enseignant retiré, §113). */
export async function questionsAReaffecterDuGroupe(id: string): Promise<{ tagId: string; enseignantId: string; tagAt: string; extrait: string }[]> {
  const { data } = await db().from('echanges_tags').select('id, enseignant_id, tag_at, message_id').eq('groupe_id', id).eq('statut', 'a_reaffecter').order('tag_at');
  const rows = (data ?? []) as { id: string; enseignant_id: string; tag_at: string; message_id: string }[];
  const msgs = await parTranches(rows.map((r) => r.message_id), 150, async (lot) => ((await db().from('echanges_messages').select('id, contenu').in('id', lot)).data ?? []) as { id: string; contenu: string | null }[]);
  const m = new Map(msgs.map((x) => [x.id, x.contenu]));
  return rows.map((r) => ({ tagId: r.id, enseignantId: r.enseignant_id, tagAt: r.tag_at, extrait: extrait(m.get(r.message_id), 200) }));
}

/** Conservation légale (litige, obligation) : bloque la purge et l'effacement RGPD du groupe. */
export async function basculerConservationLegale(a: Acteur, id: string, actif: boolean): Promise<R> {
  if (!peut(a, 'rgpd')) return refus();
  const { data, error } = await db().from('echanges_groupes').update({ conservation_legale: actif }).eq('id', id).eq('faculte_id', FACULTE).select('id').maybeSingle();
  if (error || !data) return { error: error?.message ?? 'Groupe introuvable.', code: 'INVALIDE' };
  await auditer({ action: 'groupe_modification', acteurId: a.id, acteurRole: a.role, groupeId: id, details: { conservation_legale: actif } });
  return { ok: true };
}

/* ─────────────────────────── Modération ─────────────────────────── */

type Auteur = { id: string; nom: string; email: string | null; role: string };

async function auteurs(ids: (string | null)[]): Promise<Map<string, Auteur>> {
  const uniques = [...new Set(ids.filter((x): x is string => !!x))];
  const prm = await parametres();
  const profs = await parTranches(uniques, 150, async (lot) => ((await db().from('profiles').select('id, first_name, last_name, pseudo, email, role').in('id', lot)).data ?? []) as { id: string; first_name: string | null; last_name: string | null; pseudo: string | null; email: string | null; role: string }[]);
  return new Map(profs.map((p) => [p.id, {
    id: p.id, role: p.role, email: p.email,
    nom: [p.first_name, p.last_name].filter(Boolean).join(' ') || nomEleve(p, prm.affichage_eleves),
  }]));
}

async function nomsGroupes(): Promise<Map<string, string>> {
  const { data } = await db().from('echanges_groupes').select('id, nom').eq('faculte_id', FACULTE);
  return new Map(((data ?? []) as { id: string; nom: string }[]).map((g) => [g.id, g.nom]));
}

export type MessageModere = {
  id: string; groupeId: string; groupe: string; auteur: Auteur | null; contenu: string; createdAt: string; motif: string | null; nbPieces: number;
};

export type FileModeration = {
  enAttente: MessageModere[];
  signalements: { id: string; statut: string; motif: string; details: string | null; createdAt: string; signalePar: Auteur | null; message: MessageModere | null; decisionNote: string | null; traiteAt: string | null }[];
  blocages: { id: string; statut: string; type: string; source: string; extrait: string | null; motifs: unknown; createdAt: string; auteur: Auteur | null; groupe: string | null; messageId: string | null }[];
  sanctions: { id: string; type: string; motif: string | null; debut: string; fin: string | null; auteur: Auteur | null; groupe: string | null; groupeId: string | null; creePar: Auteur | null }[];
};

export async function fileModeration(a: Acteur, o: { historique?: boolean } = {}): Promise<FileModeration> {
  const groupes = await nomsGroupes();
  const autorise = (gid: string | null) => !a.staffGroupes || (gid !== null && a.staffGroupes.includes(gid));
  const [{ data: att }, { data: sig }, { data: blo }, { data: san }] = await Promise.all([
    db().from('echanges_messages').select('id, groupe_id, auteur_id, contenu, created_at, moderation_motif, nb_pieces_jointes')
      .eq('statut', 'en_attente').is('supprime_at', null).order('created_at').limit(300),
    o.historique
      ? db().from('echanges_signalements').select('*').order('created_at', { ascending: false }).limit(300)
      : db().from('echanges_signalements').select('*').eq('statut', 'a_examiner').order('created_at').limit(300),
    o.historique
      ? db().from('echanges_blocages').select('*').order('created_at', { ascending: false }).limit(300)
      : db().from('echanges_blocages').select('*').in('statut', ['en_moderation', 'bloque']).gte('created_at', new Date(Date.now() - 30 * 86_400_000).toISOString()).order('created_at', { ascending: false }).limit(300),
    db().from('echanges_sanctions').select('*').is('levee_at', null).or(`fin_at.is.null,fin_at.gt.${new Date().toISOString()}`).order('cree_at', { ascending: false }).limit(300),
  ]);
  const attente = ((att ?? []) as { id: string; groupe_id: string; auteur_id: string | null; contenu: string | null; created_at: string; moderation_motif: string | null; nb_pieces_jointes: number | null }[]).filter((m) => autorise(m.groupe_id));
  const signalements = ((sig ?? []) as { id: string; message_id: string; groupe_id: string; signale_par: string | null; motif: string; details: string | null; statut: string; created_at: string; decision_note: string | null; traite_at: string | null }[]).filter((s) => autorise(s.groupe_id));
  const blocages = ((blo ?? []) as { id: string; user_id: string | null; groupe_id: string | null; type: string; source: string; extrait: string | null; motifs: unknown; message_id: string | null; statut: string; created_at: string }[]).filter((b) => autorise(b.groupe_id));
  const sanctions = ((san ?? []) as { id: string; user_id: string; groupe_id: string | null; type: string; motif: string | null; debut_at: string; fin_at: string | null; cree_par: string | null }[]).filter((s) => !a.staffGroupes || s.groupe_id === null || autorise(s.groupe_id));
  const msgIds = signalements.map((s) => s.message_id);
  const msgs = await parTranches(msgIds, 150, async (lot) => ((await db().from('echanges_messages').select('id, groupe_id, auteur_id, contenu, created_at, moderation_motif, nb_pieces_jointes').in('id', lot)).data ?? []) as typeof attente);
  const ppl = await auteurs([
    ...attente.map((m) => m.auteur_id), ...signalements.map((s) => s.signale_par), ...msgs.map((m) => m.auteur_id),
    ...blocages.map((b) => b.user_id), ...sanctions.map((s) => s.user_id), ...sanctions.map((s) => s.cree_par),
  ]);
  const versMessage = (m: (typeof attente)[number]): MessageModere => ({
    id: m.id, groupeId: m.groupe_id, groupe: groupes.get(m.groupe_id) ?? '—', auteur: m.auteur_id ? ppl.get(m.auteur_id) ?? null : null,
    contenu: m.contenu ?? '(contenu effacé)', createdAt: m.created_at, motif: m.moderation_motif, nbPieces: m.nb_pieces_jointes ?? 0,
  });
  const parMsg = new Map(msgs.map((m) => [m.id, versMessage(m)]));
  return {
    enAttente: attente.map(versMessage),
    signalements: signalements.map((s) => ({
      id: s.id, statut: s.statut, motif: s.motif, details: s.details, createdAt: s.created_at, decisionNote: s.decision_note, traiteAt: s.traite_at,
      signalePar: s.signale_par ? ppl.get(s.signale_par) ?? null : null, message: parMsg.get(s.message_id) ?? null,
    })),
    blocages: blocages.map((b) => ({
      id: b.id, statut: b.statut, type: b.type, source: b.source, extrait: b.extrait, motifs: b.motifs, createdAt: b.created_at,
      auteur: b.user_id ? ppl.get(b.user_id) ?? null : null, groupe: b.groupe_id ? groupes.get(b.groupe_id) ?? null : null, messageId: b.message_id,
    })),
    sanctions: sanctions.map((s) => ({
      id: s.id, type: s.type, motif: s.motif, debut: s.debut_at, fin: s.fin_at, auteur: ppl.get(s.user_id) ?? null,
      groupe: s.groupe_id ? groupes.get(s.groupe_id) ?? null : null, groupeId: s.groupe_id, creePar: s.cree_par ? ppl.get(s.cree_par) ?? null : null,
    })),
  };
}

export type MessageSupprime = MessageModere & { supprimeAt: string; supprimePar: Auteur | null; origine: string | null; purgeAt: string | null; purgeLe: string | null };

/** Messages supprimés (§136-138) : restaurables tant qu'ils ne sont pas purgés. */
export async function messagesSupprimes(a: Acteur, f: { groupeId?: string | null; q?: string | null; origine?: string | null } = {}): Promise<MessageSupprime[]> {
  if (!peut(a, 'messages_supprimes')) return [];
  const prm = await parametres();
  let q = db().from('echanges_messages')
    .select('id, groupe_id, auteur_id, contenu, created_at, moderation_motif, nb_pieces_jointes, supprime_at, supprime_par, suppression_origine, purge_at')
    .not('supprime_at', 'is', null).order('supprime_at', { ascending: false }).limit(500);
  if (f.groupeId) q = q.eq('groupe_id', f.groupeId);
  if (f.origine) q = q.eq('suppression_origine', f.origine);
  // Mot-clé filtré en base, AVANT la limite (sinon les correspondances anciennes échappaient).
  const motCle = (f.q ?? '').replace(/[%_\\]/g, ' ').trim();
  if (motCle) q = q.ilike('contenu', `%${motCle}%`);
  const { data } = await q;
  type L = { id: string; groupe_id: string; auteur_id: string | null; contenu: string | null; created_at: string; moderation_motif: string | null; nb_pieces_jointes: number | null; supprime_at: string; supprime_par: string | null; suppression_origine: string | null; purge_at: string | null };
  const rows = ((data ?? []) as L[]).filter((m) => !a.staffGroupes || a.staffGroupes.includes(m.groupe_id));
  const [groupes, ppl] = await Promise.all([nomsGroupes(), auteurs([...rows.map((r) => r.auteur_id), ...rows.map((r) => r.supprime_par)])]);
  return rows.map((m) => ({
    id: m.id, groupeId: m.groupe_id, groupe: groupes.get(m.groupe_id) ?? '—', auteur: m.auteur_id ? ppl.get(m.auteur_id) ?? null : null,
    contenu: m.contenu ?? '(contenu purgé)', createdAt: m.created_at, motif: m.moderation_motif, nbPieces: m.nb_pieces_jointes ?? 0,
    supprimeAt: m.supprime_at, supprimePar: m.supprime_par ? ppl.get(m.supprime_par) ?? null : null, origine: m.suppression_origine, purgeAt: m.purge_at,
    purgeLe: m.purge_at ? null : new Date(new Date(m.supprime_at).getTime() + prm.conservation_supprimes_jours * 86_400_000).toISOString(),
  }));
}

/* ─────────────────────────── Bibliothèque ─────────────────────────── */

export type Ressource = {
  id: string; titre: string; question: string | null; questionAuteur: string | null; reponse: string; enseignantLabel: string | null;
  specialiteId: string | null; specialiteNom: string | null; itemNumero: number | null; itemTitre: string | null; motsCles: string[];
  publie: boolean; valideAt: string | null; sourceGroupeId: string | null; createdAt: string; updatedAt: string | null;
};

export async function ressources(f: { q?: string | null; specialiteId?: string | null; publie?: boolean | null } = {}): Promise<Ressource[]> {
  let q = db().from('echanges_bibliotheque')
    .select('id, titre, question, question_auteur, reponse, enseignant_label, specialite_id, specialite_nom, item_numero, item_titre, mots_cles, publie, valide_at, source_groupe_id, created_at, updated_at')
    .eq('faculte_id', FACULTE).order('updated_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(1000);
  if (f.specialiteId) q = q.eq('specialite_id', f.specialiteId);
  if (typeof f.publie === 'boolean') q = q.eq('publie', f.publie);
  const { data } = await q;
  let rows = (data ?? []) as Record<string, unknown>[];
  if (f.q?.trim()) {
    const s = f.q.trim().toLowerCase();
    rows = rows.filter((r) => [r.titre, r.question, r.reponse, ...((r.mots_cles as string[]) ?? [])].some((x) => typeof x === 'string' && x.toLowerCase().includes(s)));
  }
  return rows.map((r) => ({
    id: r.id as string, titre: r.titre as string, question: (r.question as string) ?? null, questionAuteur: (r.question_auteur as string) ?? null,
    reponse: (r.reponse as string) ?? '', enseignantLabel: (r.enseignant_label as string) ?? null, specialiteId: (r.specialite_id as string) ?? null,
    specialiteNom: (r.specialite_nom as string) ?? null, itemNumero: (r.item_numero as number) ?? null, itemTitre: (r.item_titre as string) ?? null,
    motsCles: (r.mots_cles as string[]) ?? [], publie: r.publie !== false, valideAt: (r.valide_at as string) ?? null,
    sourceGroupeId: (r.source_groupe_id as string) ?? null, createdAt: r.created_at as string, updatedAt: (r.updated_at as string) ?? null,
  }));
}

/** Réponses épinglées d'un groupe, candidates à la bibliothèque (versement à l'archivage, §80). */
export async function epinglesDuGroupe(id: string): Promise<{ id: string; extrait: string; epingleAt: string; dejaEnBibliotheque: boolean }[]> {
  const { data } = await db().from('echanges_messages').select('id, contenu, epingle_at').eq('groupe_id', id).not('epingle_at', 'is', null).is('supprime_at', null).order('epingle_at');
  const rows = (data ?? []) as { id: string; contenu: string | null; epingle_at: string }[];
  const { data: bib } = rows.length
    ? await db().from('echanges_bibliotheque').select('source_message_id').in('source_message_id', rows.map((r) => r.id))
    : { data: [] };
  const deja = new Set(((bib ?? []) as { source_message_id: string }[]).map((b) => b.source_message_id));
  return rows.map((r) => ({ id: r.id, extrait: extrait(r.contenu, 200), epingleAt: r.epingle_at, dejaEnBibliotheque: deja.has(r.id) }));
}

/* ─────────────────────────── Journal d'audit (§101) ─────────────────────────── */

export type LigneAudit = { id: string; createdAt: string; action: string; acteur: string; acteurRole: string | null; cible: string | null; groupe: string | null; messageId: string | null; details: Record<string, unknown> };

export async function journalAudit(a: Acteur, f: { action?: string | null; groupeId?: string | null; depuis?: string | null; limite?: number } = {}): Promise<LigneAudit[]> {
  if (!peut(a, 'audit')) return [];
  let q = db().from('echanges_audit').select('id, created_at, action, acteur_id, acteur_role, cible_user_id, groupe_id, message_id, details')
    .order('created_at', { ascending: false }).limit(Math.min(f.limite ?? 500, 2000));
  if (f.action) q = q.eq('action', f.action);
  if (f.groupeId) q = q.eq('groupe_id', f.groupeId);
  if (f.depuis) q = q.gte('created_at', f.depuis);
  const { data } = await q;
  const rows = (data ?? []) as { id: string; created_at: string; action: string; acteur_id: string | null; acteur_role: string | null; cible_user_id: string | null; groupe_id: string | null; message_id: string | null; details: Record<string, unknown> }[];
  const [groupes, ppl] = await Promise.all([nomsGroupes(), auteurs([...rows.map((r) => r.acteur_id), ...rows.map((r) => r.cible_user_id)])]);
  return rows.map((r) => ({
    id: r.id, createdAt: r.created_at, action: r.action,
    acteur: r.acteur_id ? ppl.get(r.acteur_id)?.nom ?? 'Compte supprimé' : 'Système', acteurRole: r.acteur_role,
    cible: r.cible_user_id ? ppl.get(r.cible_user_id)?.nom ?? 'Compte supprimé' : null,
    groupe: r.groupe_id ? groupes.get(r.groupe_id) ?? '—' : null, messageId: r.message_id, details: r.details ?? {},
  }));
}

export async function journalTechnique(a: Acteur, f: { niveau?: 'info' | 'alerte' | 'erreur' | null; source?: string | null } = {}): Promise<{ id: string; createdAt: string; niveau: string; source: string; message: string; details: Record<string, unknown> }[]> {
  if (!peut(a, 'audit')) return [];
  let q = db().from('echanges_journal').select('id, created_at, niveau, source, message, details').order('created_at', { ascending: false }).limit(500);
  if (f.niveau) q = q.eq('niveau', f.niveau);
  if (f.source) q = q.eq('source', f.source);
  const { data } = await q;
  return ((data ?? []) as { id: string; created_at: string; niveau: string; source: string; message: string; details: Record<string, unknown> }[])
    .map((r) => ({ id: r.id, createdAt: r.created_at, niveau: r.niveau, source: r.source, message: r.message, details: r.details ?? {} }));
}

/* ─────────────────────────── Paramètres (§141-148, §186-198) ─────────────────────────── */

const BORNES: Partial<Record<keyof Parametres, [number, number]>> = {
  // Bornes identiques aux contraintes CHECK de la table (sinon l'erreur Postgres brute remonterait).
  relance_heures: [1, 168], escalade_heures: [1, 336], edition_minutes: [0, 1440], taille_max_mo: [1, 25], pj_max_par_message: [1, 10],
  longueur_max: [200, 20000], limite_messages_minute: [1, 60], limite_messages_heure: [1, 1000], limite_tags_heure: [0, 100],
  limite_tags_enseignant_jour: [0, 200], limite_pj_heure: [0, 200], doublon_secondes: [0, 3600], coordonnees_seuil_alerte: [1, 100],
  conservation_supprimes_jours: [1, 3650], conservation_archives_jours: [30, 3650], conservation_audit_jours: [365, 3650],
  conservation_blocages_jours: [30, 3650], conservation_journal_jours: [7, 3650],
};
const BOOLEENS: (keyof Parametres)[] = [
  'escalade_active', 'reponse_un_annule_autres', 'marquer_traite_actif', 'reactions_lecture_seule', 'regles_acceptation_requise',
  'coordonnees_blocage_actif', 'coordonnees_images_analyse', 'purge_auto_active',
];
const ENUMS: Partial<Record<keyof Parametres, string[]>> = {
  module_mode: ['desactive', 'interne', 'actif'],
  affichage_eleves: ['pseudo', 'prenom', 'prenom_initiale'],
  coordonnees_mode: ['bloquer', 'moderation'],
  liens_non_reconnus: ['autoriser', 'moderation', 'bloquer'],
};

/** Enregistre les paramètres modifiés (Super Admin) ; l'ancien et le nouveau sont tracés. */
export async function enregistrerParametres(a: Acteur, patch: Partial<Parametres>): Promise<R> {
  if (!peut(a, 'parametres')) return refus();
  const avant = await parametres(true);
  const maj: Record<string, unknown> = {};
  for (const [cle, v] of Object.entries(patch) as [keyof Parametres, unknown][]) {
    if (cle === 'updated_at') continue;
    const b = BORNES[cle];
    if (b) {
      const n = Number(v);
      if (!Number.isFinite(n) || n < b[0] || n > b[1]) return { error: `« ${cle} » doit être compris entre ${b[0]} et ${b[1]}.`, code: 'INVALIDE' };
      maj[cle] = Math.round(n);
    } else if (BOOLEENS.includes(cle)) maj[cle] = !!v;
    else if (ENUMS[cle]) {
      if (!ENUMS[cle]!.includes(String(v))) return { error: `Valeur invalide pour « ${cle} ».`, code: 'INVALIDE' };
      maj[cle] = String(v);
    } else if (cle === 'message_accueil' || cle === 'regles_texte') maj[cle] = String(v ?? '').slice(0, 8000);
    else if (cle === 'formats_autorises' || cle === 'reactions' || cle === 'coordonnees_domaines_autorises') {
      const liste = (Array.isArray(v) ? v : String(v ?? '').split(/[\s,;]+/)).map((x) => String(x).trim()).filter(Boolean);
      maj[cle] = [...new Set(liste)].slice(0, cle === 'reactions' ? 12 : 200);
    } else if (cle === 'testeurs') {
      maj[cle] = (Array.isArray(v) ? v : []).filter((x) => /^[0-9a-f-]{36}$/i.test(String(x))).slice(0, 200);
    }
  }
  if (Object.keys(maj).length === 0) return { ok: true };
  const { error } = await db().from('echanges_parametres').update({ ...maj, updated_at: new Date().toISOString(), updated_by: a.id }).eq('id', 1);
  if (error) return { error: error.message, code: 'INVALIDE' };
  oublierParametres();
  await auditer({
    action: 'parametres_modification', acteurId: a.id, acteurRole: a.role,
    details: { avant: Object.fromEntries(Object.keys(maj).map((k) => [k, (avant as Record<string, unknown>)[k]])), apres: maj },
  });
  return { ok: true };
}

/* ─────────────────────────── Équipe de modération (§102-103) ─────────────────────────── */

export type MembreStaff = { userId: string; nom: string; email: string | null; role: string; niveau: NiveauStaff; groupes: string[] | null; peutSuspendre: boolean; depuis: string | null };

export async function equipeModeration(): Promise<MembreStaff[]> {
  const [{ data: staff }, { data: admins }] = await Promise.all([
    db().from('echanges_staff').select('user_id, niveau, groupes, peut_suspendre, created_at'),
    db().from('profiles').select('id, first_name, last_name, email, role, is_active').eq('role', 'admin').eq('faculte_id', FACULTE),
  ]);
  const s = (staff ?? []) as { user_id: string; niveau: NiveauStaff; groupes: string[] | null; peut_suspendre: boolean; created_at: string }[];
  const { data: profs } = s.length ? await db().from('profiles').select('id, first_name, last_name, email, role').in('id', s.map((x) => x.user_id)) : { data: [] };
  const p = new Map(((profs ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null; role: string }[]).map((x) => [x.id, x]));
  const nom = (x?: { first_name: string | null; last_name: string | null; email: string | null }) => [x?.first_name, x?.last_name].filter(Boolean).join(' ') || x?.email || 'Compte';
  return [
    ...((admins ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null; role: string; is_active: boolean | null }[])
      .filter((x) => x.is_active !== false)
      .map((x) => ({ userId: x.id, nom: nom(x), email: x.email, role: 'admin', niveau: 'super_admin' as NiveauStaff, groupes: null, peutSuspendre: true, depuis: null })),
    ...s.map((x) => ({ userId: x.user_id, nom: nom(p.get(x.user_id)), email: p.get(x.user_id)?.email ?? null, role: p.get(x.user_id)?.role ?? 'professor', niveau: x.niveau, groupes: x.groupes, peutSuspendre: x.peut_suspendre, depuis: x.created_at })),
  ];
}

/** Donne, change ou retire le niveau Échanges d'un membre de l'équipe (non administrateur). */
export async function enregistrerStaff(a: Acteur, userId: string, e: { niveau: 'moderateur' | 'admin_pedagogique' | null; groupes: string[] | null; peutSuspendre: boolean }): Promise<R> {
  if (!peut(a, 'parametres')) return refus();
  const { data: p } = await db().from('profiles').select('id, role').eq('id', userId).maybeSingle();
  if (!p || p.role !== 'professor') return { error: 'Seul un membre de l’équipe (hors administrateur) reçoit un niveau : un administrateur est déjà Super Admin.', code: 'INVALIDE' };
  if (e.niveau === null) {
    await db().from('echanges_staff').delete().eq('user_id', userId);
  } else {
    const groupes = e.groupes && e.groupes.length ? e.groupes.filter((g) => /^[0-9a-f-]{36}$/i.test(g)) : null;
    const { error } = await db().from('echanges_staff').upsert({
      user_id: userId, niveau: e.niveau, groupes, peut_suspendre: e.niveau === 'admin_pedagogique' ? true : e.peutSuspendre, cree_par: a.id,
    }, { onConflict: 'user_id' });
    if (error) return { error: error.message, code: 'INVALIDE' };
  }
  await auditer({ action: 'staff_modification', acteurId: a.id, acteurRole: a.role, cibleUserId: userId, details: { niveau: e.niveau, groupes: e.groupes, peut_suspendre: e.peutSuspendre } });
  return { ok: true };
}

/** Le menu de l'administration affiche « Échanges » à cette personne ? */
export async function aAccesBackOffice(userId: string, role: string): Promise<boolean> {
  if (role === 'admin') return true;
  if (role !== 'professor') return false;
  const { data } = await db().from('echanges_staff').select('user_id').eq('user_id', userId).maybeSingle();
  return !!data;
}
