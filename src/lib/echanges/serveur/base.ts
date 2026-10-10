import 'server-only';
import { createHash } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';

/**
 * Socle serveur du module Échanges : client service-role, paramètres, journal
 * technique (observabilité, §142), journal d'audit (§47, §101), environnement
 * d'exécution (§143).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = any;

export function db(): Db {
  return createAdminClient();
}

export const FACULTE = EDN_FACULTE_ID;

export type Parametres = {
  module_mode: 'desactive' | 'interne' | 'actif';
  testeurs: string[];
  relance_heures: number;
  escalade_active: boolean;
  escalade_heures: number;
  reponse_un_annule_autres: boolean;
  marquer_traite_actif: boolean;
  edition_minutes: number;
  formats_autorises: string[];
  taille_max_mo: number;
  pj_max_par_message: number;
  longueur_max: number;
  limite_messages_minute: number;
  limite_messages_heure: number;
  limite_tags_heure: number;
  limite_tags_enseignant_jour: number;
  limite_pj_heure: number;
  doublon_secondes: number;
  affichage_eleves: 'pseudo' | 'prenom' | 'prenom_initiale';
  reactions: string[];
  reactions_lecture_seule: boolean;
  message_accueil: string;
  regles_texte: string;
  regles_acceptation_requise: boolean;
  coordonnees_blocage_actif: boolean;
  coordonnees_mode: 'bloquer' | 'moderation';
  coordonnees_domaines_autorises: string[];
  liens_non_reconnus: 'autoriser' | 'moderation' | 'bloquer';
  coordonnees_images_analyse: boolean;
  coordonnees_seuil_alerte: number;
  conservation_supprimes_jours: number;
  conservation_archives_jours: number;
  conservation_audit_jours: number;
  conservation_blocages_jours: number;
  conservation_journal_jours: number;
  purge_auto_active: boolean;
  updated_at: string;
};

let cache: { at: number; p: Parametres } | null = null;

/** Paramètres du module (mis en cache 20 s par instance : ils changent rarement). */
export async function parametres(frais = false): Promise<Parametres> {
  if (!frais && cache && Date.now() - cache.at < 20_000) return cache.p;
  const { data, error } = await db().from('echanges_parametres').select('*').eq('id', 1).maybeSingle();
  if (error || !data) throw new Error(`Paramètres Échanges illisibles : ${error?.message ?? 'ligne absente'}`);
  cache = { at: Date.now(), p: data as Parametres };
  return cache.p;
}

export function oublierParametres() {
  cache = null;
}

/* ─────────────────────────── Journal technique ─────────────────────────── */

export type SourceJournal = 'email' | 'relance' | 'publication' | 'fichier' | 'permission' | 'temps_reel' | 'cron' | 'purge' | 'synchro' | 'notification' | 'moderation';

/** Ne lève jamais : l'observabilité ne doit pas casser l'action observée. */
export async function journaliser(niveau: 'info' | 'alerte' | 'erreur', source: SourceJournal, message: string, details: Record<string, unknown> = {}) {
  try {
    if (niveau !== 'info') console[niveau === 'erreur' ? 'error' : 'warn'](`[echanges:${source}] ${message}`, details);
    await db().from('echanges_journal').insert({ niveau, source, message: message.slice(0, 500), details });
  } catch {
    /* journal indisponible : la console suffit */
  }
}

/* ───────────────────────────── Journal d'audit ───────────────────────────── */

export type ActionAudit =
  | 'groupe_creation' | 'groupe_modification' | 'groupe_activation' | 'groupe_desactivation' | 'groupe_cloture'
  | 'groupe_archivage' | 'groupe_reouverture' | 'groupe_duplication' | 'criteres_modification'
  | 'participant_ajout' | 'participant_retrait' | 'participant_exclusion_forcee' | 'participants_synchronisation'
  | 'enseignant_ajout' | 'enseignant_retrait' | 'enseignant_modification' | 'identite_modification'
  | 'suppression_moderation' | 'suppression_auteur' | 'restauration' | 'validation_message' | 'refus_message'
  | 'epinglage' | 'desepinglage' | 'bibliotheque_ajout' | 'bibliotheque_modification' | 'bibliotheque_retrait'
  | 'sanction' | 'levee_sanction' | 'reintegration' | 'signalement_traitement' | 'blocage_liberation'
  | 'tag_reaffectation' | 'tag_traite_manuellement' | 'parametres_modification' | 'staff_modification'
  | 'rgpd_export' | 'rgpd_effacement' | 'export_donnees' | 'purge' | 'annonce_importante';

/** Écrit une ligne (ajout seul, cf. trigger d'immuabilité). Ne lève jamais. */
export async function auditer(e: {
  action: ActionAudit;
  acteurId: string | null;
  acteurRole?: string | null;
  cibleUserId?: string | null;
  groupeId?: string | null;
  messageId?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    const { error } = await db().from('echanges_audit').insert({
      action: e.action,
      acteur_id: uuidOuNull(e.acteurId),
      acteur_role: uuidOuNull(e.acteurId) ? e.acteurRole ?? null : 'systeme',
      cible_user_id: e.cibleUserId ?? null,
      groupe_id: e.groupeId ?? null,
      message_id: e.messageId ?? null,
      details: e.details ?? {},
    });
    if (error) throw error;
  } catch (err) {
    await journaliser('erreur', 'moderation', 'Écriture du journal d’audit impossible', { action: e.action, erreur: String(err) });
  }
}

/* ─────────────────────────────── Environnement ─────────────────────────────── */

/**
 * Production réelle ? Les e-mails des Échanges ne partent aux vrais
 * enseignants QU'EN production (§143). Ailleurs : redirection vers
 * ECHANGES_EMAIL_REDIRECT si définie (préfixe [TEST]), sinon simulation
 * (statut « simulee », rien n'est envoyé).
 */
export function environnement(): 'production' | 'preview' | 'developpement' {
  if (process.env.VERCEL_ENV === 'production') return 'production';
  if (process.env.VERCEL_ENV === 'preview') return 'preview';
  if (process.env.ECHANGES_ENV === 'production' && process.env.NODE_ENV === 'production') return 'production';
  return 'developpement';
}

/* ─────────────────────────────── Divers ─────────────────────────────── */

/** Identifiant de compte valide, sinon null (actions automatiques du système). */
export function uuidOuNull(v: string | null | undefined): string | null {
  return v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? v : null;
}

/** Clé opaque d'un auteur dans un groupe (regroupement visuel), non réversible. */
export function cleAuteur(topic: string, userId: string | null): string {
  if (!userId) return 'systeme';
  return createHash('sha256').update(`${topic}:${userId}`).digest('base64url').slice(0, 14);
}

export function extrait(t: string | null | undefined, n = 140): string {
  const s = (t ?? '').replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export async function parTranches<T, R>(ids: T[], taille: number, f: (lot: T[]) => Promise<R[]>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < ids.length; i += taille) out.push(...(await f(ids.slice(i, i + taille))));
  return out;
}

export async function heartbeat(nom: string, debut: number, resultat: Record<string, unknown>) {
  try {
    await db().from('echanges_cron_etat').upsert({
      nom, dernier_passage_at: new Date().toISOString(), duree_ms: Date.now() - debut, resultat,
    }, { onConflict: 'nom' });
  } catch { /* supervision best-effort */ }
}
