import 'server-only';
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { CONTACT_EMAIL } from '@/lib/email/layout';
import { logAudit, type AuditAction, type AuditEntity } from '@/lib/audit/log';
import { libelleDureeLong } from '@/lib/marketing/visite-guidee';
import type { Acteur } from './acces';
import { attribuer } from './attribution';
import { analyserCsv, type TypeHistorique } from './csv';
import { formatDateHeure, parisVersIso } from './dates';
import { liensDuJeton, rendreEmailDecouverte } from './emails';
import { hashJeton, JETON_PLACEHOLDER, JETON_RE, jetonDuLien } from './jetons';
import { modeleEffectif, validerModele } from './modeles';
import { controlerEnvoi, evaluerCandidat, evaluerTout, type DemandeEnvoi } from './moteur';
import {
  emailValide, normaliserEmail, parametresDepuisLigne, parametresVersLigne, TYPE_COURT, TYPES_MODELE, validerParametres,
  type CandidatEtat, type EnvoiEtat, type EtatModule, type ModeleSurcharge, type OrigineEnvoi, type Parametres,
  type TypeModele, type TypeRelance,
} from './types';

/**
 * Accès base et envois du module de relances de l'Offre Découverte.
 *
 * Toutes les écritures passent par le client service-role (tables sous RLS
 * sans politique). Les garanties critiques sont en base (index unique
 * anti-doublon, clé d'idempotence d'opération, append-only) ; ce module
 * ajoute le contrôle complet juste avant CHAQUE e-mail (§11) sur un état relu
 * à l'instant (auth.users, profil, opposition, bounce, échéance).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;
const db = (): Db => createAdminClient() as Db;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const maintenant = () => new Date().toISOString();

function erreurDe(e: unknown): string {
  return e instanceof Error ? e.message : typeof e === 'string' ? e : 'Erreur inconnue';
}

/* ─────────────────────────── Paramètres & état ─────────────────────────── */

export async function chargerParametres(): Promise<Parametres> {
  const { data, error } = await db().from('decouverte_parametres').select('*').eq('id', 1).maybeSingle();
  if (error) throw new Error(`Paramètres des relances illisibles : ${error.message}`);
  return parametresDepuisLigne(data);
}

/** État relu à l'instant (RPC `decouverte_etat`, une seule valeur : jamais tronquée). */
export async function chargerEtat(ids?: string[]): Promise<EtatModule> {
  if (ids && ids.length === 0) return { maintenant: maintenant(), candidats: [], envois: [], oppositions: [] };
  if (!ids) {
    const { data, error } = await db().rpc('decouverte_etat', { p_ids: null });
    if (error) throw new Error(`État des relances illisible : ${error.message}`);
    return data as EtatModule;
  }
  const uniques = [...new Set(ids)];
  const res: EtatModule = { maintenant: maintenant(), candidats: [], envois: [], oppositions: [] };
  const vues = new Set<string>();
  for (let i = 0; i < uniques.length; i += 400) {
    const { data, error } = await db().rpc('decouverte_etat', { p_ids: uniques.slice(i, i + 400) });
    if (error) throw new Error(`État des relances illisible : ${error.message}`);
    const e = data as EtatModule;
    res.maintenant = e.maintenant;
    res.candidats.push(...e.candidats);
    res.envois.push(...e.envois);
    for (const o of e.oppositions) if (!vues.has(o.id)) { vues.add(o.id); res.oppositions.push(o); }
  }
  return res;
}

/* ─────────────────────────── Timeline & journal ─────────────────────────── */

export async function evenement(e: {
  candidatId: string | null; envoiId?: string | null; type: string; survenuAt?: string;
  acteur?: Acteur | null; details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { error } = await db().from('decouverte_evenements').insert({
      candidat_id: e.candidatId, envoi_id: e.envoiId ?? null, type: e.type, survenu_at: e.survenuAt ?? maintenant(),
      acteur_id: e.acteur?.id ?? null, acteur_nom: e.acteur?.nom ?? null, details: e.details ?? {},
    });
    if (error) console.error('[decouverte] événement non tracé', e.type, error.message);
  } catch (err) {
    console.error('[decouverte] événement non tracé', e.type, erreurDe(err));
  }
}

/** Journal du module + journal d'activité de l'administration (acteur, date, volume). */
export async function journaliser(acteur: Acteur | null, action: string, o: {
  volume?: number | null; details?: Record<string, unknown>; description: string;
  audit?: { action: AuditAction; entity: AuditEntity; entityId?: string | null; diff?: Record<string, unknown> | null };
}): Promise<void> {
  try {
    await db().from('decouverte_journal').insert({
      acteur_id: acteur?.id ?? null, acteur_nom: acteur?.nom ?? 'Système', action, volume: o.volume ?? null, details: o.details ?? {},
    });
  } catch (err) {
    console.error('[decouverte] journal', erreurDe(err));
  }
  if (acteur && o.audit) {
    await logAudit({
      actor: { id: acteur.id, first_name: acteur.first_name, last_name: acteur.last_name, email: acteur.email, role: acteur.role } as Parameters<typeof logAudit>[0]['actor'],
      action: o.audit.action, entity: o.audit.entity, entityId: o.audit.entityId ?? null, description: o.description, diff: o.audit.diff ?? null,
    });
  }
}

/* ─────────────────────────── Synchronisation ─────────────────────────── */

/**
 * Synchronisation (chargement du module, bannière, cron quotidien) : nouveaux
 * profils découverte, premières connexions, adresses, désactivations — puis
 * attribution des premières connexions, calculée UNE fois et figée.
 * N'ENVOIE RIEN (§28).
 */
export async function synchroniser(): Promise<Record<string, number>> {
  const { data, error } = await db().rpc('decouverte_synchroniser');
  if (error) throw new Error(`Synchronisation impossible : ${error.message}`);
  const attributions = await calculerAttributions();
  return { ...(data as Record<string, number>), attributions };
}

export async function synchroniserSiNecessaire(ageMaxMinutes = 10): Promise<void> {
  try {
    const p = await chargerParametres();
    const age = p.derniereSynchroAt ? Date.now() - Date.parse(p.derniereSynchroAt) : Infinity;
    if (age > ageMaxMinutes * 60_000) await synchroniser();
  } catch (e) {
    console.error('[decouverte] synchronisation', erreurDe(e));
  }
}

async function calculerAttributions(): Promise<number> {
  const params = await chargerParametres();
  let total = 0;
  for (let tour = 0; tour < 50; tour++) {
    const { data, error } = await db().from('decouverte_candidats').select('id')
      .not('premiere_connexion_at', 'is', null).is('attribution_calculee_at', null).order('id').limit(300);
    if (error) throw new Error(error.message);
    const ids = ((data ?? []) as { id: string }[]).map((r) => r.id);
    if (ids.length === 0) break;
    const etat = await chargerEtat(ids);
    for (const c of etat.candidats) {
      if (!c.premiere_connexion_at) continue;
      const envois = etat.envois.filter((e) => e.candidat_id === c.id);
      const a = attribuer(c.premiere_connexion_at, envois, params.attributionRegle, params.attributionFenetreJours);
      const { data: maj } = await db().from('decouverte_candidats').update({
        relance_attribuee: a.envoiId, regle_attribution_appliquee: a.regle, attribution_calculee_at: maintenant(),
        delai_connexion_sec: a.delaiConnexionSec, delai_clic_sec: a.delaiClicSec, updated_at: maintenant(),
      }).eq('id', c.id).is('attribution_calculee_at', null).select('id');
      if (!maj?.length) continue;
      total++;
      await evenement({
        candidatId: c.id, envoiId: a.envoiId, type: 'attribution',
        details: { type: a.type, regle: a.regle, motif: a.motif, delai_connexion_sec: a.delaiConnexionSec, delai_clic_sec: a.delaiClicSec, fenetre_jours: params.attributionFenetreJours },
      });
    }
  }
  return total;
}

/* ─────────────────────────── Inscription (route publique) ─────────────────────────── */

/** Nouvelle demande découverte : fiche + « demande » + « compte créé ». Ne lève jamais. */
export async function enregistrerDemande(d: {
  userId: string; email: string; prenom: string; nom: string; telephone: string | null; specialite: string | null;
  voie: string | null; session: string | null; pays: string | null; compteCreeAt?: string;
}): Promise<string | null> {
  try {
    const now = maintenant();
    // Demande antérieure sur la même adresse (compte supprimé puis nouvelle inscription) : parcours rattaché.
    const { data: ancien } = await db().from('decouverte_candidats').select('id')
      .eq('email_normalise', normaliserEmail(d.email)).is('user_id', null).order('demande_at', { ascending: false }).limit(1);
    const { data, error } = await db().from('decouverte_candidats').insert({
      user_id: d.userId, email_actuel: d.email.trim(), prenom: d.prenom, nom: d.nom, telephone: d.telephone,
      specialite: d.specialite, voie: d.voie, session_evc: d.session, pays: d.pays, origine: 'formulaire_decouverte',
      demande_at: now, compte_cree_at: d.compteCreeAt ?? now, demande_anterieure_id: (ancien as { id: string }[] | null)?.[0]?.id ?? null,
    }).select('id').single();
    if (error) throw new Error(error.message);
    const id = (data as { id: string }).id;
    await evenement({ candidatId: id, type: 'demande', survenuAt: now, details: { specialite: d.specialite, voie: d.voie, session: d.session, pays: d.pays, demande_anterieure: (ancien as { id: string }[] | null)?.[0]?.id ?? null } });
    await evenement({ candidatId: id, type: 'compte_cree', survenuAt: d.compteCreeAt ?? now });
    return id;
  } catch (e) {
    console.error('[decouverte] enregistrerDemande', erreurDe(e));
    return null;
  }
}

/** E-mail d'activation initial (J0) : envoi « initial » tracé et horodaté. Ne lève jamais. */
export async function enregistrerAccesInitial(d: {
  candidatId: string; email: string; ok: boolean; via: 'resend' | 'supabase' | null; resendId: string | null; sujet: string; erreur: string | null;
}): Promise<void> {
  try {
    const now = maintenant();
    const { data } = await db().from('decouverte_envois').insert({
      candidat_id: d.candidatId, type: 'initial', origine: 'module', statut: d.ok ? 'envoye' : 'echec', email_utilise: d.email,
      sujet: d.sujet, resend_id: d.resendId, envoye_at: d.ok ? now : null, erreur: d.ok ? null : d.erreur,
      commentaire: d.via === 'supabase' ? 'Envoyé par le repli Supabase (e-mail standard)' : null,
    }).select('id').single();
    const envoiId = (data as { id: string } | null)?.id ?? null;
    if (d.ok) {
      await db().from('decouverte_candidats').update({ acces_initial_at: now, acces_initial_approx: false, updated_at: now }).eq('id', d.candidatId);
      await evenement({ candidatId: d.candidatId, envoiId, type: 'acces_initial', survenuAt: now, details: { via: d.via } });
    } else {
      await evenement({ candidatId: d.candidatId, envoiId, type: 'envoi_echec', details: { type: 'initial', erreur: d.erreur } });
    }
  } catch (e) {
    console.error('[decouverte] enregistrerAccesInitial', erreurDe(e));
  }
}

/** Nouvelle demande d'un candidat déjà inscrit (409) : tracée, sans doublon. Ne lève jamais. */
export async function tracerNouvelleDemande(d: { userId: string | null; email: string; details?: Record<string, unknown> }): Promise<void> {
  try {
    let q = db().from('decouverte_candidats').select('id, nb_demandes');
    q = d.userId ? q.eq('user_id', d.userId) : q.eq('email_normalise', normaliserEmail(d.email));
    const { data } = await q.order('demande_at', { ascending: false }).limit(1);
    const c = (data as { id: string; nb_demandes: number | null }[] | null)?.[0];
    if (!c) return;
    const now = maintenant();
    await db().from('decouverte_candidats').update({ derniere_demande_at: now, nb_demandes: (c.nb_demandes ?? 1) + 1, updated_at: now }).eq('id', c.id);
    await evenement({ candidatId: c.id, type: 'nouvelle_demande', survenuAt: now, details: d.details ?? {} });
  } catch (e) {
    console.error('[decouverte] tracerNouvelleDemande', erreurDe(e));
  }
}

/* ─────────────────────────── Liens ─────────────────────────── */

async function creerLien(envoiId: string, candidatId: string | null, validiteJours: number): Promise<string> {
  const id = crypto.randomUUID();
  const jeton = jetonDuLien(id);
  const { error } = await db().from('decouverte_liens').insert({
    id, jeton_hash: hashJeton(jeton), envoi_id: envoiId, candidat_id: candidatId,
    expire_at: new Date(Date.now() + validiteJours * 86_400_000).toISOString(),
  });
  if (error) throw new Error(`Lien non créé : ${error.message}`);
  return jeton;
}

export type LienResolu = {
  lien: { id: string; envoi_id: string; candidat_id: string | null; expire_at: string; revoque_at: string | null; revoque_raison: string | null; nb_acces: number };
  envoi: { id: string; candidat_id: string | null; type: string; statut: string; email_utilise: string | null; sujet: string | null; html_snapshot: string | null;
    clic_cta_at: string | null; nb_clics_cta: number; clic_video_at: string | null; nb_clics_video: number; desinscrit_at: string | null };
  candidat: CandidatEtat | null;
  etat: EtatModule | null;
};

export async function resoudreJeton(jeton: string): Promise<LienResolu | null> {
  if (!JETON_RE.test(jeton)) return null;
  const { data: lien } = await db().from('decouverte_liens')
    .select('id, envoi_id, candidat_id, expire_at, revoque_at, revoque_raison, nb_acces').eq('jeton_hash', hashJeton(jeton)).maybeSingle();
  if (!lien) return null;
  const { data: envoi } = await db().from('decouverte_envois')
    .select('id, candidat_id, type, statut, email_utilise, sujet, html_snapshot, clic_cta_at, nb_clics_cta, clic_video_at, nb_clics_video, desinscrit_at')
    .eq('id', (lien as LienResolu['lien']).envoi_id).maybeSingle();
  if (!envoi) return null;
  let etat: EtatModule | null = null;
  let candidat: CandidatEtat | null = null;
  if ((lien as LienResolu['lien']).candidat_id) {
    etat = await chargerEtat([(lien as LienResolu['lien']).candidat_id!]);
    candidat = etat.candidats[0] ?? null;
  }
  return { lien: lien as LienResolu['lien'], envoi: envoi as LienResolu['envoi'], candidat, etat };
}

/** Clic tracé (première fois horodatée sur l'envoi ; un événement par premier clic). */
export async function tracerClic(r: LienResolu, genre: 'cta' | 'video', userAgent: string | null): Promise<void> {
  try {
    const now = maintenant();
    const premier = genre === 'cta' ? !r.envoi.clic_cta_at : !r.envoi.clic_video_at;
    const maj: Record<string, unknown> = { dernier_clic_at: now, updated_at: now };
    if (genre === 'cta') { maj.clic_cta_at = r.envoi.clic_cta_at ?? now; maj.nb_clics_cta = (r.envoi.nb_clics_cta ?? 0) + 1; }
    else { maj.clic_video_at = r.envoi.clic_video_at ?? now; maj.nb_clics_video = (r.envoi.nb_clics_video ?? 0) + 1; }
    await db().from('decouverte_envois').update(maj).eq('id', r.envoi.id);
    await db().from('decouverte_liens').update({ dernier_usage_at: now, nb_acces: (r.lien.nb_acces ?? 0) + 1 }).eq('id', r.lien.id);
    if (premier && r.lien.candidat_id) {
      await evenement({ candidatId: r.lien.candidat_id, envoiId: r.envoi.id, type: genre === 'cta' ? 'clic_cta' : 'clic_video', details: { modele: r.envoi.type, user_agent: (userAgent ?? '').slice(0, 160) } });
    }
  } catch (e) {
    console.error('[decouverte] clic', erreurDe(e));
  }
}

/* ─────────────────────────── Oppositions ─────────────────────────── */

/**
 * Opposition DURABLE (§20) : jamais supprimée ni levée automatiquement.
 * Exclusion immédiate des relances ET de la campagne de bienvenue J1-J7.
 */
export async function enregistrerOpposition(o: {
  email: string; userId?: string | null; candidatId?: string | null; source: 'lien_desinscription' | 'one_click' | 'plainte' | 'admin' | 'campagne';
  envoiId?: string | null; commentaire?: string | null; acteur?: Acteur | null;
}): Promise<{ nouvelle: boolean }> {
  const email = normaliserEmail(o.email);
  if (!email) throw new Error('Adresse manquante');
  const { data, error } = await db().from('communication_oppositions').upsert({
    email_normalise: email, user_id: o.userId ?? null, candidat_id: o.candidatId ?? null, portee: 'prospection', source: o.source,
    envoi_id: o.envoiId ?? null, commentaire: o.commentaire ?? null, cree_par: o.acteur?.id ?? null,
  }, { onConflict: 'faculte_id,email_normalise,portee', ignoreDuplicates: true }).select('id');
  if (error) throw new Error(`Opposition non enregistrée : ${error.message}`);
  const nouvelle = !!(data as unknown[] | null)?.length;
  // Campagne de bienvenue (cloisonnée par faculté par le client admin).
  await db().from('campaign_recipients').update({ unsubscribed: true }).eq('email', email);
  if (o.envoiId) await db().from('decouverte_envois').update({ desinscrit_at: maintenant(), updated_at: maintenant() }).eq('id', o.envoiId).is('desinscrit_at', null);
  if (o.candidatId && nouvelle) {
    await evenement({ candidatId: o.candidatId, envoiId: o.envoiId ?? null, type: o.source === 'plainte' ? 'plainte' : 'desinscription', acteur: o.acteur ?? null, details: { source: o.source, commentaire: o.commentaire ?? null } });
  }
  return { nouvelle };
}

/** L'adresse (ou le compte) fait-elle l'objet d'une opposition ? */
export async function aUneOpposition(email: string, userId?: string | null): Promise<boolean> {
  const { data } = await db().from('communication_oppositions').select('id').eq('email_normalise', normaliserEmail(email)).limit(1);
  if ((data as unknown[] | null)?.length) return true;
  if (!userId) return false;
  const { data: d2 } = await db().from('communication_oppositions').select('id').eq('user_id', userId).limit(1);
  return !!(d2 as unknown[] | null)?.length;
}

/* ─────────────────────────── Envoi d'un e-mail ─────────────────────────── */

type SnapshotEnvoi = { id: string; sujet: string | null; html_snapshot: string | null; texte_snapshot: string | null; email_utilise: string | null; statut: string };

export type ResultatEnvoi =
  | { statut: 'envoye'; envoiId: string }
  | { statut: 'exclu'; raison: string }
  | { statut: 'echec'; envoiId: string | null; erreur: string }
  /** Issue inconnue (délai dépassé, 5xx) ou débit dépassé (429) : à reprendre avec la MÊME clé. */
  | { statut: 'a_reprendre'; envoiId: string; erreur: string };

function enTetesDesinscription(base: string, jeton: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${base}/d/u/${jeton}>, <mailto:${CONTACT_EMAIL}?subject=D%C3%A9sinscription%20Major%20ECN>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

/** Lien d'accès/désinscription d'un envoi repris : le jeton est recalculé depuis la ligne `decouverte_liens`. */
async function jetonDeLEnvoi(envoiId: string): Promise<string | null> {
  const { data } = await db().from('decouverte_liens').select('id').eq('envoi_id', envoiId).order('created_at').limit(1);
  const id = (data as { id: string }[] | null)?.[0]?.id;
  return id ? jetonDuLien(id) : null;
}

async function marquerEnvoi(id: string, maj: Record<string, unknown>) {
  const { error } = await db().from('decouverte_envois').update({ ...maj, updated_at: maintenant() }).eq('id', id);
  if (error) console.error('[decouverte] mise à jour d’envoi', id, error.message);
}

/**
 * Envoi d'UN e-mail du module : réservation (INSERT « en_cours » — l'index
 * unique tranche les courses), lien à jeton, rendu, instantané (version
 * navigateur + reprise à l'identique), envoi Resend avec Idempotency-Key =
 * identifiant d'envoi et en-têtes List-Unsubscribe, puis statut.
 * Le contrôle d'éligibilité est fait par l'APPELANT juste avant.
 */
export async function envoyerMail(a: {
  candidat: CandidatEtat | null;
  email: string;
  prenom: string | null;
  type: TypeModele;
  origine: OrigineEnvoi;
  exceptionnel?: boolean;
  operationId?: string | null;
  acteur?: Acteur | null;
  commentaire?: string | null;
  params: Parametres;
  test?: boolean;
  surcharge?: ModeleSurcharge | null;
  /** Envoi « en_cours » à reprendre (même identifiant, même charge utile). */
  reprise?: SnapshotEnvoi | null;
  /** Appelé dès la réservation (rattachement de l'item d'opération). */
  surReservation?: (envoiId: string) => Promise<void>;
}): Promise<ResultatEnvoi> {
  const base = siteUrl();
  let envoiId: string;
  let sujet: string, html: string, texte: string, jeton: string;

  if (a.reprise && a.reprise.html_snapshot && a.reprise.sujet && a.reprise.texte_snapshot) {
    envoiId = a.reprise.id;
    const j = await jetonDeLEnvoi(envoiId);
    if (!j) return { statut: 'echec', envoiId, erreur: 'Reprise impossible : lien d’envoi introuvable' };
    jeton = j;
    sujet = a.reprise.sujet;
    html = a.reprise.html_snapshot.split(JETON_PLACEHOLDER).join(jeton);
    texte = a.reprise.texte_snapshot.split(JETON_PLACEHOLDER).join(jeton);
  } else {
    const typeEnvoi = a.test ? 'test' : a.type;
    const { data, error } = await db().from('decouverte_envois').insert({
      candidat_id: a.candidat?.id ?? null, type: typeEnvoi, origine: a.test ? 'test' : a.origine, exceptionnel: !!a.exceptionnel,
      statut: 'en_cours', email_utilise: a.email.trim(), operation_id: a.operationId ?? null, envoye_par: a.acteur?.id ?? null,
      envoye_par_nom: a.acteur?.nom ?? null, commentaire: a.commentaire ?? null, modele_version: a.params.version,
    }).select('id').single();
    if (error) {
      if ((error as { code?: string }).code === '23505') return { statut: 'exclu', raison: `${TYPE_COURT[a.type]} déjà envoyée ou en cours d’envoi (anti-doublon)` };
      return { statut: 'echec', envoiId: null, erreur: `Réservation impossible : ${error.message}` };
    }
    envoiId = (data as { id: string }).id;
    if (a.surReservation) await a.surReservation(envoiId);
    try {
      jeton = await creerLien(envoiId, a.candidat?.id ?? null, a.params.validiteLienJours);
      const surcharges = a.surcharge ? { ...a.params.modeles, [a.type]: a.surcharge } : a.params.modeles;
      const modele = modeleEffectif(a.type, surcharges);
      const rendu = rendreEmailDecouverte(a.type, modele,
        { prenom: a.prenom, dureeVideo: libelleDureeLong(), validiteJours: a.params.validiteLienJours },
        liensDuJeton(base, JETON_PLACEHOLDER), { test: a.test });
      sujet = rendu.subject;
      await marquerEnvoi(envoiId, { sujet, html_snapshot: rendu.html, texte_snapshot: rendu.text });
      html = rendu.html.split(JETON_PLACEHOLDER).join(jeton);
      texte = rendu.text.split(JETON_PLACEHOLDER).join(jeton);
    } catch (e) {
      await marquerEnvoi(envoiId, { statut: 'echec', erreur: `Préparation : ${erreurDe(e)}` });
      return { statut: 'echec', envoiId, erreur: erreurDe(e) };
    }
  }

  let r: Awaited<ReturnType<typeof sendEmail>>;
  try {
    r = await sendEmail({
      to: (a.reprise?.email_utilise ?? a.email).trim(), subject: sujet, html, text: texte, replyTo: CONTACT_EMAIL,
      headers: enTetesDesinscription(base, jeton), idempotencyKey: envoiId, timeoutMs: 15_000, sansBcc: true,
    });
  } catch (e) {
    // Délai dépassé / réseau : l'e-mail a pu partir. L'envoi reste « en_cours » et
    // sera repris avec la même clé d'idempotence (Resend ne le renverra pas).
    return { statut: 'a_reprendre', envoiId, erreur: `Issue inconnue (${erreurDe(e)}) : reprise automatique` };
  }
  if (r.ok) {
    const now = maintenant();
    await marquerEnvoi(envoiId, { statut: 'envoye', envoye_at: now, resend_id: r.id, erreur: null });
    if (a.candidat) {
      await evenement({
        candidatId: a.candidat.id, envoiId, type: 'envoi', survenuAt: now, acteur: a.acteur ?? null,
        details: { type: a.type, origine: a.origine, exceptionnel: !!a.exceptionnel, operation_id: a.operationId ?? null, email: a.email, sujet, commentaire: a.commentaire ?? null, reprise: !!a.reprise },
      });
    }
    return { statut: 'envoye', envoiId };
  }
  const status = r.status ?? 0;
  if (status === 429 || status === 409 || status >= 500) {
    return { statut: 'a_reprendre', envoiId, erreur: r.error };
  }
  await marquerEnvoi(envoiId, { statut: 'echec', erreur: r.error.slice(0, 500) });
  if (a.candidat) {
    await evenement({ candidatId: a.candidat.id, envoiId, type: 'envoi_echec', acteur: a.acteur ?? null, details: { type: a.type, erreur: r.error.slice(0, 300) } });
  }
  return { statut: 'echec', envoiId, erreur: r.error };
}

/* ─────────────────────────── Opérations d'envoi ─────────────────────────── */

export type TypeOperation = 'groupe' | 'individuel' | 'exceptionnel';
export const CLE_RE = /^[A-Za-z0-9_-]{8,100}$/;

type OperationLigne = {
  id: string; cle_idempotence: string; type: TypeOperation; mode: 'relance' | 'exceptionnel'; type_force: TypeRelance | null;
  statut: 'preparee' | 'en_cours' | 'terminee' | 'annulee'; cree_par: string | null; cree_par_nom: string | null; commentaire: string | null;
  total: number; ventilation: Record<string, number>; bilan: Record<string, unknown>; confirmee_at: string | null; terminee_at: string | null; created_at: string;
};
type ItemLigne = { id: string; operation_id: string; candidat_id: string; type_prevu: TypeRelance | null; statut: 'a_traiter' | 'en_cours' | 'envoye' | 'exclu' | 'echec'; raison: string | null; envoi_id: string | null; tentatives: number };

export async function chargerOperation(id: string): Promise<OperationLigne | null> {
  const { data } = await db().from('decouverte_operations').select('*').eq('id', id).maybeSingle();
  return (data as OperationLigne | null) ?? null;
}

async function itemsDe(opId: string): Promise<ItemLigne[]> {
  return fetchAllRows<ItemLigne>((from, to) =>
    db().from('decouverte_operation_items').select('id, operation_id, candidat_id, type_prevu, statut, raison, envoi_id, tentatives')
      .eq('operation_id', opId).order('id').range(from, to));
}

export type Progression = {
  operation: Pick<OperationLigne, 'id' | 'type' | 'mode' | 'type_force' | 'statut' | 'total' | 'ventilation' | 'created_at' | 'cree_par_nom' | 'confirmee_at' | 'terminee_at' | 'commentaire'>;
  total: number; restants: number; envoyes: number; exclus: number; echecs: number;
  envoyesParType: Record<string, number>;
  raisonsExclusion: Array<{ raison: string; nombre: number }>;
  erreurs: Array<{ erreur: string; nombre: number }>;
  details: Array<{ candidatId: string; nom: string; email: string; statut: string; type: string | null; raison: string | null }>;
  pause?: boolean;
};

export async function progression(opId: string, avecDetails = false): Promise<Progression> {
  const op = await chargerOperation(opId);
  if (!op) throw new Error('Opération introuvable');
  const items = await itemsDe(opId);
  const compte = (s: ItemLigne['statut']) => items.filter((i) => i.statut === s).length;
  const grouper = (liste: ItemLigne[]) => {
    const m = new Map<string, number>();
    for (const i of liste) m.set(i.raison ?? '—', (m.get(i.raison ?? '—') ?? 0) + 1);
    return [...m.entries()].map(([raison, nombre]) => ({ raison, nombre })).sort((a, b) => b.nombre - a.nombre);
  };
  const envoyesParType: Record<string, number> = {};
  for (const i of items) if (i.statut === 'envoye' && i.type_prevu) envoyesParType[i.type_prevu] = (envoyesParType[i.type_prevu] ?? 0) + 1;
  let details: Progression['details'] = [];
  if (avecDetails) {
    const ids = items.filter((i) => i.statut !== 'envoye' || items.length <= 300).map((i) => i.candidat_id);
    const noms = new Map<string, { nom: string; email: string }>();
    for (let k = 0; k < ids.length; k += 200) {
      const { data } = await db().from('decouverte_candidats').select('id, prenom, nom, email_actuel').in('id', ids.slice(k, k + 200));
      for (const c of (data ?? []) as { id: string; prenom: string | null; nom: string | null; email_actuel: string }[]) {
        noms.set(c.id, { nom: [c.prenom, c.nom].filter(Boolean).join(' ') || '—', email: c.email_actuel });
      }
    }
    details = items.filter((i) => noms.has(i.candidat_id)).map((i) => ({
      candidatId: i.candidat_id, nom: noms.get(i.candidat_id)!.nom, email: noms.get(i.candidat_id)!.email, statut: i.statut, type: i.type_prevu, raison: i.raison,
    }));
  }
  return {
    operation: {
      id: op.id, type: op.type, mode: op.mode, type_force: op.type_force, statut: op.statut, total: op.total, ventilation: op.ventilation,
      created_at: op.created_at, cree_par_nom: op.cree_par_nom, confirmee_at: op.confirmee_at, terminee_at: op.terminee_at, commentaire: op.commentaire,
    },
    total: items.length,
    restants: compte('a_traiter') + compte('en_cours'),
    envoyes: compte('envoye'),
    exclus: compte('exclu'),
    echecs: compte('echec'),
    envoyesParType,
    raisonsExclusion: grouper(items.filter((i) => i.statut === 'exclu')),
    erreurs: grouper(items.filter((i) => i.statut === 'echec')).map((x) => ({ erreur: x.raison, nombre: x.nombre })),
    details,
  };
}

export type Preparation = {
  operationId: string;
  dejaExistante: boolean;
  statut: OperationLigne['statut'];
  total: number;
  ventilation: Record<string, number>;
  exclus: Array<{ candidatId: string; nom: string; raison: string }>;
  avertissements: Array<{ candidatId: string; nom: string; messages: string[] }>;
};

/**
 * Prépare une opération : contrôle de chaque candidat sur un état relu à
 * l'instant, modèle choisi automatiquement, ventilation calculée PAR LE
 * SERVEUR pour la confirmation. Clé d'idempotence : un double clic, un
 * rafraîchissement ou une requête rejouée renvoient la MÊME opération.
 */
export async function preparerOperation(p: {
  acteur: Acteur; cle: string; candidatIds: string[]; type: TypeOperation; typeForce?: TypeRelance | null; commentaire?: string | null;
}): Promise<Preparation> {
  if (!CLE_RE.test(p.cle)) throw new Error('Clé d’opération invalide');
  const existante = await db().from('decouverte_operations').select('*').eq('cle_idempotence', p.cle).maybeSingle();
  if (existante.data) return resumePreparation(existante.data as OperationLigne, true);

  const ids = [...new Set(p.candidatIds)].slice(0, 5000);
  if (ids.length === 0) throw new Error('Aucun candidat sélectionné');
  if (p.type !== 'groupe' && ids.length !== 1) throw new Error('Une relance individuelle concerne un seul candidat');
  if (p.type === 'exceptionnel' && !p.typeForce) throw new Error('Modèle de la relance exceptionnelle manquant');

  const params = await chargerParametres();
  const etat = await chargerEtat(ids);
  const parId = new Map(etat.candidats.map((c) => [c.id, c]));
  const demande: DemandeEnvoi = p.type === 'exceptionnel' ? { mode: 'exceptionnel', type: p.typeForce! } : { mode: 'relance' };
  const ventilation: Record<string, number> = { R1: 0, R2: 0, R3: 0, ancien_acces: 0, exclus: 0 };
  const items: Array<{ candidat_id: string; type_prevu: string | null; statut: string; raison: string | null }> = [];
  const exclus: Preparation['exclus'] = [];
  const avertissements: Preparation['avertissements'] = [];
  const now = new Date();
  for (const id of ids) {
    const c = parId.get(id);
    if (!c) { ventilation.exclus++; items.push({ candidat_id: id, type_prevu: null, statut: 'exclu', raison: 'Candidat introuvable' }); continue; }
    const envois = etat.envois.filter((e) => e.candidat_id === id);
    const ev = evaluerCandidat(c, envois, params, etat.oppositions, { maintenant: now });
    const ctrl = controlerEnvoi(ev, demande, params, envois);
    const nom = [c.prenom, c.nom].filter(Boolean).join(' ') || c.email_actuel;
    if (!ctrl.ok) {
      ventilation.exclus++;
      exclus.push({ candidatId: id, nom, raison: ctrl.raison });
      items.push({ candidat_id: id, type_prevu: null, statut: 'exclu', raison: ctrl.raison });
    } else {
      ventilation[ctrl.type]++;
      if (ctrl.avertissements.length) avertissements.push({ candidatId: id, nom, messages: ctrl.avertissements });
      items.push({ candidat_id: id, type_prevu: ctrl.type, statut: 'a_traiter', raison: null });
    }
  }
  const aEnvoyer = items.filter((i) => i.statut === 'a_traiter').length;
  const { data: op, error } = await db().from('decouverte_operations').insert({
    cle_idempotence: p.cle, type: p.type, mode: p.type === 'exceptionnel' ? 'exceptionnel' : 'relance', type_force: p.typeForce ?? null,
    statut: 'preparee', cree_par: p.acteur.id, cree_par_nom: p.acteur.nom, commentaire: p.commentaire ?? null,
    total: aEnvoyer, ventilation,
  }).select('*').single();
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      const { data } = await db().from('decouverte_operations').select('*').eq('cle_idempotence', p.cle).maybeSingle();
      if (data) return resumePreparation(data as OperationLigne, true);
    }
    throw new Error(`Opération non créée : ${error.message}`);
  }
  const opId = (op as OperationLigne).id;
  for (let i = 0; i < items.length; i += 500) {
    const { error: e2 } = await db().from('decouverte_operation_items').insert(items.slice(i, i + 500).map((x) => ({ ...x, operation_id: opId })));
    if (e2) throw new Error(`Opération incomplète : ${e2.message}`);
  }
  return { operationId: opId, dejaExistante: false, statut: 'preparee', total: aEnvoyer, ventilation, exclus, avertissements };
}

async function resumePreparation(op: OperationLigne, dejaExistante: boolean): Promise<Preparation> {
  const prog = await progression(op.id, true);
  return {
    operationId: op.id, dejaExistante, statut: op.statut, total: op.total, ventilation: op.ventilation,
    exclus: prog.details.filter((d) => d.statut === 'exclu').map((d) => ({ candidatId: d.candidatId, nom: d.nom, raison: d.raison ?? '' })),
    avertissements: [],
  };
}

export async function confirmerOperation(opId: string, acteur: Acteur, commentaire?: string | null): Promise<OperationLigne> {
  const now = maintenant();
  const { data } = await db().from('decouverte_operations')
    .update({ statut: 'en_cours', confirmee_at: now, confirmee_par: acteur.id, updated_at: now, ...(commentaire?.trim() ? { commentaire: commentaire.trim().slice(0, 500) } : {}) })
    .eq('id', opId).eq('statut', 'preparee').select('*');
  const op = (data as OperationLigne[] | null)?.[0] ?? (await chargerOperation(opId));
  if (!op) throw new Error('Opération introuvable');
  if ((data as OperationLigne[] | null)?.length) {
    await journaliser(acteur, 'operation_lancee', {
      volume: op.total, details: { operation_id: op.id, type: op.type, mode: op.mode, type_force: op.type_force, ventilation: op.ventilation },
      description: `Relances Découverte : ${op.type === 'groupe' ? 'envoi groupé' : op.type === 'exceptionnel' ? 'relance exceptionnelle' : 'relance individuelle'} lancé — ${op.total} e-mail(s) (R1 ${op.ventilation.R1 ?? 0} · R2 ${op.ventilation.R2 ?? 0} · R3 ${op.ventilation.R3 ?? 0} · ancien accès ${op.ventilation.ancien_acces ?? 0}), ${op.ventilation.exclus ?? 0} exclu(s).`,
      audit: { action: 'create', entity: 'decouverte_relance', entityId: op.id, diff: { ventilation: op.ventilation } },
    });
  }
  return op;
}

export async function annulerOperation(opId: string, acteur: Acteur): Promise<void> {
  const op = await chargerOperation(opId);
  if (!op || op.statut === 'terminee' || op.statut === 'annulee') return;
  const now = maintenant();
  await db().from('decouverte_operation_items').update({ statut: 'exclu', raison: 'Opération annulée', traite_at: now })
    .eq('operation_id', opId).eq('statut', 'a_traiter');
  await db().from('decouverte_operations').update({ statut: 'annulee', terminee_at: now, updated_at: now }).eq('id', opId);
  await journaliser(acteur, 'operation_annulee', { volume: op.total, details: { operation_id: opId }, description: 'Relances Découverte : opération annulée.', audit: { action: 'update', entity: 'decouverte_relance', entityId: opId } });
}

async function majItem(id: string, maj: Record<string, unknown>) {
  await db().from('decouverte_operation_items').update(maj).eq('id', id);
}

/**
 * Traite un lot d'une opération confirmée, dans un budget de temps (< maxDuration).
 * L'interface rappelle cette fonction jusqu'à `restants === 0`. Reprise d'un
 * envoi partiellement échoué : les items envoyés ne sont jamais retraités, un
 * item interrompu est repris avec le même identifiant d'envoi.
 */
export async function executerLot(opId: string, acteur: Acteur, o: { budgetMs?: number; taille?: number } = {}): Promise<Progression> {
  const budget = o.budgetMs ?? 35_000;
  const t0 = Date.now();
  const op = await chargerOperation(opId);
  if (!op) throw new Error('Opération introuvable');
  if (op.statut === 'preparee') throw new Error('Opération non confirmée');
  if (op.statut !== 'en_cours') return progression(opId, true);
  const params = await chargerParametres();
  if (params.pause) return { ...(await progression(opId, true)), pause: true };
  const demande: DemandeEnvoi = op.mode === 'exceptionnel' && op.type_force ? { mode: 'exceptionnel', type: op.type_force } : { mode: 'relance' };
  let ralentir = false;

  while (Date.now() - t0 < budget && !ralentir) {
    const { data: lot, error } = await db().rpc('decouverte_reserver_items', { p_operation: opId, p_limite: o.taille ?? 10 });
    if (error) throw new Error(`Réservation du lot impossible : ${error.message}`);
    const items = (lot ?? []) as ItemLigne[];
    if (items.length === 0) break;
    const etat = await chargerEtat(items.map((i) => i.candidat_id));
    for (const item of items) {
      if (Date.now() - t0 > budget || ralentir) {
        await majItem(item.id, { statut: 'a_traiter', claimed_at: null, tentatives: Math.max(0, item.tentatives - 1) });
        continue;
      }
      const c = etat.candidats.find((x) => x.id === item.candidat_id);
      const now = maintenant();
      if (!c) { await majItem(item.id, { statut: 'exclu', raison: 'Candidat introuvable', traite_at: now }); continue; }

      // Reprise d'un envoi interrompu : contrôle refait SANS compter cet envoi.
      let reprise: SnapshotEnvoi | null = null;
      if (item.envoi_id) {
        const { data: s } = await db().from('decouverte_envois').select('id, sujet, html_snapshot, texte_snapshot, email_utilise, statut').eq('id', item.envoi_id).maybeSingle();
        reprise = s as SnapshotEnvoi | null;
        if (reprise?.statut === 'envoye') { await majItem(item.id, { statut: 'envoye', traite_at: now }); continue; }
        if (reprise?.statut === 'echec' || !reprise) { await majItem(item.id, { statut: 'echec', raison: 'Envoi en échec', traite_at: now }); continue; }
      }
      const envois = etat.envois.filter((e) => e.candidat_id === c.id && e.id !== item.envoi_id);
      const ev = evaluerCandidat(c, envois, params, etat.oppositions, { maintenant: new Date() });
      const ctrl = controlerEnvoi(ev, demande, params, envois);
      let raisonExclusion: string | null = null;
      if (!ctrl.ok) raisonExclusion = ctrl.raison;
      else if (op.mode !== 'exceptionnel' && ctrl.type !== item.type_prevu) {
        raisonExclusion = `Le modèle dû a changé depuis la confirmation (${item.type_prevu ?? '—'} → ${TYPE_COURT[ctrl.type]})`;
      }
      if (raisonExclusion) {
        if (reprise) await marquerEnvoi(reprise.id, { statut: 'echec', erreur: `Reprise annulée au contrôle : ${raisonExclusion}` });
        await majItem(item.id, { statut: 'exclu', raison: raisonExclusion, traite_at: now });
        await evenement({ candidatId: c.id, type: 'envoi_exclu', acteur, details: { operation_id: opId, type: item.type_prevu, raison: raisonExclusion } });
        continue;
      }
      if (item.tentatives > 4) {
        if (reprise) await marquerEnvoi(reprise.id, { statut: 'echec', erreur: 'Abandon après 5 tentatives' });
        await majItem(item.id, { statut: 'echec', raison: 'Abandon après 5 tentatives (prestataire indisponible)', traite_at: now });
        continue;
      }
      const type = ctrl.ok ? ctrl.type : item.type_prevu!;
      const r = await envoyerMail({
        candidat: c, email: ev.email, prenom: c.prenom, type, origine: op.type === 'groupe' ? 'module' : 'manuel',
        exceptionnel: op.mode === 'exceptionnel', operationId: opId, acteur, commentaire: op.commentaire, params, reprise,
        surReservation: (envoiId) => majItem(item.id, { envoi_id: envoiId }),
      });
      const fin = maintenant();
      if (r.statut === 'envoye') await majItem(item.id, { statut: 'envoye', type_prevu: type, envoi_id: r.envoiId, traite_at: fin, raison: null });
      else if (r.statut === 'exclu') {
        await majItem(item.id, { statut: 'exclu', raison: r.raison, traite_at: fin });
        await evenement({ candidatId: c.id, type: 'envoi_exclu', acteur, details: { operation_id: opId, type, raison: r.raison } });
      } else if (r.statut === 'echec') await majItem(item.id, { statut: 'echec', raison: r.erreur.slice(0, 300), envoi_id: r.envoiId, traite_at: fin });
      else {
        // À reprendre : l'item redevient « à traiter » (envoi rattaché : même clé d'idempotence).
        await majItem(item.id, { statut: 'a_traiter', claimed_at: null, envoi_id: r.envoiId, raison: r.erreur.slice(0, 300) });
        ralentir = true;
      }
      await sleep(550); // ~2 requêtes/s : limite de débit par défaut de Resend
    }
  }

  const prog = await progression(opId, true);
  if (prog.restants === 0) {
    const now = maintenant();
    const bilan = { envoyes: prog.envoyes, exclus: prog.exclus, echecs: prog.echecs, envoyesParType: prog.envoyesParType, raisonsExclusion: prog.raisonsExclusion, erreurs: prog.erreurs };
    const { data } = await db().from('decouverte_operations').update({ statut: 'terminee', terminee_at: now, bilan, updated_at: now }).eq('id', opId).eq('statut', 'en_cours').select('id');
    if ((data as unknown[] | null)?.length) {
      await journaliser(acteur, 'operation_terminee', {
        volume: prog.envoyes, details: { operation_id: opId, ...bilan },
        description: `Relances Découverte : opération terminée — ${prog.envoyes} envoyé(s), ${prog.exclus} exclu(s), ${prog.echecs} échec(s).`,
        audit: { action: 'update', entity: 'decouverte_relance', entityId: opId, diff: bilan },
      });
    }
    return progression(opId, true);
  }
  return prog;
}

/* ─────────────────────────── E-mail de test ─────────────────────────── */

export async function envoyerTest(p: { acteur: Acteur; type: TypeModele; email: string; surcharge?: ModeleSurcharge | null }): Promise<ResultatEnvoi> {
  if (!emailValide(p.email)) throw new Error('Adresse de test invalide');
  if (!TYPES_MODELE.includes(p.type)) throw new Error('Modèle inconnu');
  const params = await chargerParametres();
  if (p.surcharge) {
    const erreurs = validerModele(p.type, modeleEffectif(p.type, { [p.type]: p.surcharge }));
    if (erreurs.length) throw new Error(erreurs.join(' '));
  }
  const r = await envoyerMail({
    candidat: null, email: p.email, prenom: p.acteur.first_name, type: p.type, origine: 'test', params, test: true,
    surcharge: p.surcharge ?? null, acteur: p.acteur, commentaire: `Test envoyé à ${p.email}`,
  });
  await journaliser(p.acteur, 'email_test', {
    volume: 1, details: { type: p.type, email: p.email, statut: r.statut },
    description: `Relances Découverte : e-mail de test ${TYPE_COURT[p.type]} envoyé à ${p.email} (${r.statut}).`,
  });
  return r;
}

/* ─────────────────────────── Renvoi d'un lien (candidat) ─────────────────────────── */

export async function renvoyerLien(r: LienResolu): Promise<{ ok: true; email: string } | { ok: false; raison: string }> {
  if (!r.candidat || !r.etat) return { ok: false, raison: 'Lien de démonstration : aucun compte associé.' };
  const params = await chargerParametres();
  const c = r.candidat;
  const envois = r.etat.envois.filter((e) => e.candidat_id === c.id);
  const ev = evaluerCandidat(c, envois, params, r.etat.oppositions, { maintenant: new Date() });
  if (ev.connecteAt) return { ok: false, raison: 'Votre espace est déjà activé : connectez-vous avec votre adresse et votre mot de passe.' };
  if (ev.compte !== 'ok') return { ok: false, raison: 'Cet accès découverte n’est plus actif. Contactez-nous pour le réactiver.' };
  if (ev.bloque || !emailValide(ev.email)) return { ok: false, raison: 'Nous ne pouvons pas écrire à l’adresse de ce compte. Contactez-nous.' };
  const recents = envois.filter((e) => e.type === 'renvoi_lien' && e.statut !== 'echec');
  const dix = Date.now() - 10 * 60_000, jour = Date.now() - 86_400_000;
  if (recents.some((e) => Date.parse(e.created_at) > dix)) return { ok: false, raison: 'Un nouveau lien vient déjà de vous être envoyé. Vérifiez votre boîte de réception (et les indésirables).' };
  if (recents.filter((e) => Date.parse(e.created_at) > jour).length >= 5) return { ok: false, raison: 'Trop de demandes aujourd’hui. Réessayez demain ou contactez-nous.' };
  await evenement({ candidatId: c.id, envoiId: r.envoi.id, type: 'renvoi_lien_demande', details: { depuis_modele: r.envoi.type } });
  const res = await envoyerMail({ candidat: c, email: ev.email, prenom: c.prenom, type: 'renvoi_lien', origine: 'candidat', params, commentaire: 'Nouveau lien demandé depuis une page de lien expiré' });
  if (res.statut === 'envoye' || res.statut === 'a_reprendre') return { ok: true, email: ev.email };
  return { ok: false, raison: 'L’envoi a échoué. Réessayez dans quelques minutes ou contactez-nous.' };
}

/* ─────────────────────────── Fiche : saisies manuelles ─────────────────────────── */

async function candidatOuErreur(id: string): Promise<{ c: CandidatEtat; etat: EtatModule }> {
  const etat = await chargerEtat([id]);
  const c = etat.candidats[0];
  if (!c) throw new Error('Candidat introuvable');
  return { c, etat };
}

/** Relance déjà faite hors module (type, date, heure, commentaire) → recalcul immédiat. */
export async function saisirHistorique(p: {
  acteur: Acteur; candidatId: string; type: TypeHistorique; jour: string; heure: string; commentaire: string | null; origine: 'manuel' | 'import';
}): Promise<{ ok: true; envoiId: string } | { ok: false; erreur: string }> {
  const { c } = await candidatOuErreur(p.candidatId);
  const iso = parisVersIso(p.jour, p.heure);
  if (Date.parse(iso) > Date.now() + 60_000) return { ok: false, erreur: 'Date future : seule une relance déjà faite peut être saisie.' };
  const { data, error } = await db().from('decouverte_envois').insert({
    candidat_id: c.id, type: p.type, origine: p.origine, statut: 'historique', email_utilise: c.auth_email ?? c.email_actuel,
    sujet: p.origine === 'import' ? 'Relance importée (historique)' : 'Relance saisie (historique)', envoye_at: iso,
    envoye_par: p.acteur.id, envoye_par_nom: p.acteur.nom, commentaire: p.commentaire,
  }).select('id').single();
  if (error) {
    if ((error as { code?: string }).code === '23505') return { ok: false, erreur: `${TYPE_COURT[p.type]} déjà enregistrée pour ce candidat` };
    return { ok: false, erreur: error.message };
  }
  const envoiId = (data as { id: string }).id;
  await evenement({ candidatId: c.id, envoiId, type: 'relance_historique', survenuAt: iso, acteur: p.acteur, details: { type: p.type, origine: p.origine, commentaire: p.commentaire, saisi_le: maintenant() } });
  return { ok: true, envoiId };
}

export async function ajouterNote(acteur: Acteur, candidatId: string, texte: string): Promise<void> {
  const t = texte.trim();
  if (!t) throw new Error('Note vide');
  if (t.length > 4000) throw new Error('Note trop longue (4 000 caractères au plus)');
  await candidatOuErreur(candidatId);
  const { error } = await db().from('decouverte_evenements').insert({ candidat_id: candidatId, type: 'note', acteur_id: acteur.id, acteur_nom: acteur.nom, details: { texte: t } });
  if (error) throw new Error(error.message);
}

export async function revoquerLiens(acteur: Acteur, candidatId: string): Promise<number> {
  const { data } = await db().from('decouverte_liens').update({ revoque_at: maintenant(), revoque_raison: `révoqué par ${acteur.nom}` })
    .eq('candidat_id', candidatId).is('revoque_at', null).select('id');
  const n = (data as unknown[] | null)?.length ?? 0;
  await evenement({ candidatId, type: 'liens_revoques', acteur, details: { nombre: n } });
  return n;
}

export async function oppositionAdmin(acteur: Acteur, candidatId: string, commentaire: string | null): Promise<void> {
  const { c } = await candidatOuErreur(candidatId);
  const emails = [...new Set([c.email_actuel, c.auth_email].filter((x): x is string => !!x).map(normaliserEmail))];
  for (const email of emails) {
    await enregistrerOpposition({ email, userId: c.user_id, candidatId: c.id, source: 'admin', commentaire, acteur });
  }
  await journaliser(acteur, 'opposition_saisie', {
    volume: 1, details: { candidat_id: c.id, commentaire },
    description: `Relances Découverte : opposition enregistrée pour ${[c.prenom, c.nom].filter(Boolean).join(' ') || c.email_actuel}.`,
    audit: { action: 'create', entity: 'decouverte_candidat', entityId: c.id },
  });
}

/* ─────────────────────────── Import CSV ─────────────────────────── */

export type RapportImport = {
  total: number; valides: number; appliquees: number;
  lignes: Array<{ numero: number; email: string; type: string | null; date: string | null; statut: 'ok' | 'erreur' | 'importee' | 'ignoree'; message: string; candidat: string | null }>;
};

export async function importerHistorique(acteur: Acteur, csv: string, appliquer: boolean): Promise<RapportImport> {
  const { lignes, erreurGlobale } = analyserCsv(csv);
  if (erreurGlobale) throw new Error(erreurGlobale);
  const etat = await chargerEtat();
  const parEmail = new Map<string, CandidatEtat[]>();
  for (const c of etat.candidats) {
    for (const e of new Set([normaliserEmail(c.email_actuel), normaliserEmail(c.auth_email)].filter(Boolean))) {
      parEmail.set(e, [...(parEmail.get(e) ?? []), c]);
    }
  }
  const dejaDansFichier = new Set<string>();
  const rapport: RapportImport = { total: lignes.length, valides: 0, appliquees: 0, lignes: [] };
  for (const l of lignes) {
    const base = { numero: l.numero, email: l.email, type: l.type, date: l.jour ? `${l.jour} ${l.heure}` : null };
    if (l.erreur) { rapport.lignes.push({ ...base, statut: 'erreur', message: l.erreur, candidat: null }); continue; }
    const cands = (parEmail.get(l.email) ?? []).sort((a, b) => (a.user_id ? 0 : 1) - (b.user_id ? 0 : 1) || b.demande_at.localeCompare(a.demande_at));
    const c = cands[0];
    if (!c) { rapport.lignes.push({ ...base, statut: 'erreur', message: 'Aucun candidat découverte avec cette adresse', candidat: null }); continue; }
    const nom = [c.prenom, c.nom].filter(Boolean).join(' ') || c.email_actuel;
    const iso = parisVersIso(l.jour!, l.heure);
    if (Date.parse(iso) > Date.now()) { rapport.lignes.push({ ...base, statut: 'erreur', message: 'Date future', candidat: nom }); continue; }
    const cle = `${c.id}|${l.type}`;
    const niveauUnique = l.type !== 'ancienne_relance';
    if (niveauUnique && dejaDansFichier.has(cle)) { rapport.lignes.push({ ...base, statut: 'erreur', message: `${TYPE_COURT[l.type!]} en double dans le fichier`, candidat: nom }); continue; }
    dejaDansFichier.add(cle);
    const existant = etat.envois.find((e) => e.candidat_id === c.id && e.type === l.type && (e.statut === 'envoye' || e.statut === 'historique' || e.statut === 'en_cours') && niveauUnique);
    if (existant) { rapport.lignes.push({ ...base, statut: 'ignoree', message: `${TYPE_COURT[l.type!]} déjà enregistrée (${formatDateHeure(existant.envoye_at ?? existant.created_at)})`, candidat: nom }); continue; }
    rapport.valides++;
    if (!appliquer) { rapport.lignes.push({ ...base, statut: 'ok', message: 'Prête à importer', candidat: nom }); continue; }
    const r = await saisirHistorique({ acteur, candidatId: c.id, type: l.type!, jour: l.jour!, heure: l.heure, commentaire: l.commentaire || 'Import CSV', origine: 'import' });
    if (r.ok) { rapport.appliquees++; rapport.lignes.push({ ...base, statut: 'importee', message: 'Importée', candidat: nom }); }
    else rapport.lignes.push({ ...base, statut: 'erreur', message: r.erreur, candidat: nom });
  }
  if (appliquer) {
    await journaliser(acteur, 'import_historique', {
      volume: rapport.appliquees, details: { total: rapport.total, importees: rapport.appliquees },
      description: `Relances Découverte : import de l’historique — ${rapport.appliquees} relance(s) importée(s) sur ${rapport.total} ligne(s).`,
      audit: { action: 'create', entity: 'decouverte_relance', diff: { total: rapport.total, importees: rapport.appliquees } },
    });
  }
  return rapport;
}

/* ─────────────────────────── Paramètres ─────────────────────────── */

export async function enregistrerParametres(acteur: Acteur, nouveau: Parametres): Promise<Parametres> {
  const erreurs = validerParametres(nouveau);
  for (const t of TYPES_MODELE) {
    const e = validerModele(t, modeleEffectif(t, nouveau.modeles));
    if (e.length) erreurs.push(`Modèle ${TYPE_COURT[t]} : ${e.join(' ')}`);
  }
  if (erreurs.length) throw new Error(erreurs.join(' '));
  const avant = await chargerParametres();
  const ligneAvant = parametresVersLigne(avant) as Record<string, unknown>;
  const ligneApres = parametresVersLigne({ ...nouveau, version: avant.version + 1 }) as Record<string, unknown>;
  const diff: Record<string, { avant: unknown; apres: unknown }> = {};
  for (const k of Object.keys(ligneApres)) {
    if (k === 'version') continue;
    if (JSON.stringify(ligneAvant[k]) !== JSON.stringify(ligneApres[k])) diff[k] = { avant: ligneAvant[k], apres: ligneApres[k] };
  }
  if (Object.keys(diff).length === 0) return avant;
  const { error } = await db().from('decouverte_parametres').update({ ...ligneApres, updated_at: maintenant(), updated_by: acteur.id }).eq('id', 1);
  if (error) throw new Error(error.message);
  await journaliser(acteur, 'parametres_modifies', {
    details: { diff, version: avant.version + 1 },
    description: `Relances Découverte : paramètres modifiés (${Object.keys(diff).join(', ')}) — version ${avant.version + 1}.`,
    audit: { action: 'update', entity: 'decouverte_parametres', entityId: '1', diff },
  });
  return chargerParametres();
}

/* ─────────────────────────── Webhook Resend ─────────────────────────── */

type EvenementResend = { type?: string; created_at?: string; data?: { email_id?: string; created_at?: string; to?: string[] | string; bounce?: { type?: string; subType?: string; message?: string }; failed?: { reason?: string } } };

/** Rattachement par resend_id. Ouverture = indicatif seulement (§24). */
export async function traiterWebhookResend(evt: EvenementResend): Promise<{ traite: boolean; motif?: string }> {
  const emailId = evt.data?.email_id;
  if (!emailId || !evt.type) return { traite: false, motif: 'événement incomplet' };
  const { data } = await db().from('decouverte_envois')
    .select('id, candidat_id, type, email_utilise, ouvert_at, nb_ouvertures, delivre_at, bounce_at, plainte_at').eq('resend_id', emailId).maybeSingle();
  const e = data as (Pick<EnvoiEtat, 'id' | 'candidat_id' | 'type' | 'email_utilise' | 'ouvert_at' | 'nb_ouvertures' | 'delivre_at' | 'bounce_at' | 'plainte_at'>) | null;
  if (!e) return { traite: false, motif: 'e-mail étranger au module' };
  const at = evt.created_at ?? evt.data?.created_at ?? maintenant();
  switch (evt.type) {
    case 'email.delivered':
      if (!e.delivre_at) {
        await marquerEnvoi(e.id, { delivre_at: at });
        if (e.candidat_id) await evenement({ candidatId: e.candidat_id, envoiId: e.id, type: 'delivre', survenuAt: at, details: { modele: e.type } });
      }
      return { traite: true };
    case 'email.opened':
      await marquerEnvoi(e.id, { ouvert_at: e.ouvert_at ?? at, nb_ouvertures: (e.nb_ouvertures ?? 0) + 1 });
      if (!e.ouvert_at && e.candidat_id) await evenement({ candidatId: e.candidat_id, envoiId: e.id, type: 'ouverture', survenuAt: at, details: { modele: e.type, indicatif: true } });
      return { traite: true };
    case 'email.bounced': {
      const b = evt.data?.bounce ?? {};
      const t = (b.type ?? '').toLowerCase();
      const dur = t === 'permanent' || t === 'hard' || t === 'hardbounce';
      const raison = [b.type, b.subType, b.message].filter(Boolean).join(' — ').slice(0, 300) || 'Rejet définitif';
      await marquerEnvoi(e.id, { bounce_at: e.bounce_at ?? at, bounce_type: dur ? 'hard' : 'soft', erreur: raison });
      if (e.candidat_id) {
        if (dur && e.email_utilise) {
          await db().from('decouverte_candidats').update({ email_bloque_adresse: normaliserEmail(e.email_utilise), email_bloque_raison: raison, email_bloque_at: at, updated_at: maintenant() }).eq('id', e.candidat_id);
        }
        await evenement({ candidatId: e.candidat_id, envoiId: e.id, type: dur ? 'bounce_hard' : 'bounce_soft', survenuAt: at, details: { modele: e.type, adresse: e.email_utilise, raison } });
      }
      return { traite: true };
    }
    case 'email.complained':
      await marquerEnvoi(e.id, { plainte_at: e.plainte_at ?? at });
      if (e.email_utilise) {
        let userId: string | null = null;
        if (e.candidat_id) {
          const { data: c } = await db().from('decouverte_candidats').select('user_id').eq('id', e.candidat_id).maybeSingle();
          userId = (c as { user_id: string | null } | null)?.user_id ?? null;
        }
        await enregistrerOpposition({ email: e.email_utilise, userId, candidatId: e.candidat_id, source: 'plainte', envoiId: e.id });
      }
      return { traite: true };
    case 'email.failed':
      await marquerEnvoi(e.id, { erreur: `Échec chez le prestataire : ${evt.data?.failed?.reason ?? 'raison inconnue'}`.slice(0, 300) });
      if (e.candidat_id) await evenement({ candidatId: e.candidat_id, envoiId: e.id, type: 'envoi_echec', survenuAt: at, details: { modele: e.type, erreur: evt.data?.failed?.reason ?? null, prestataire: true } });
      return { traite: true };
    default:
      return { traite: false, motif: `type ${evt.type} ignoré` };
  }
}

/* ─────────────────────────── Lecture : fiche & journal ─────────────────────────── */

export async function chargerFiche(candidatId: string) {
  const params = await chargerParametres();
  const { c, etat } = await candidatOuErreur(candidatId);
  const envois = etat.envois.filter((e) => e.candidat_id === c.id);
  const evaluation = evaluerCandidat(c, envois, params, etat.oppositions, { maintenant: new Date() });
  const evenements = await fetchAllRows<Record<string, unknown>>((from, to) =>
    db().from('decouverte_evenements').select('id, envoi_id, type, survenu_at, acteur_nom, details, created_at').eq('candidat_id', c.id).order('survenu_at').order('id').range(from, to));
  const { data: liens } = await db().from('decouverte_liens').select('id, envoi_id, expire_at, revoque_at, revoque_raison, nb_acces, dernier_usage_at, created_at').eq('candidat_id', c.id).order('created_at');
  let anterieure: { id: string; demande_at: string } | null = null;
  if (c.demande_anterieure_id) {
    const { data } = await db().from('decouverte_candidats').select('id, demande_at').eq('id', c.demande_anterieure_id).maybeSingle();
    anterieure = data as typeof anterieure;
  }
  const { data: posterieures } = await db().from('decouverte_candidats').select('id, demande_at').eq('demande_anterieure_id', c.id);
  return { candidat: c, envois, evaluation, evenements, liens: liens ?? [], parametres: params, oppositions: etat.oppositions, anterieure, posterieures: posterieures ?? [] };
}

export async function chargerJournal() {
  const { data: journal } = await db().from('decouverte_journal').select('*').order('created_at', { ascending: false }).limit(400);
  const { data: operations } = await db().from('decouverte_operations')
    .select('id, type, mode, type_force, statut, cree_par_nom, total, ventilation, bilan, created_at, confirmee_at, terminee_at, commentaire')
    .order('created_at', { ascending: false }).limit(200);
  return { journal: journal ?? [], operations: operations ?? [] };
}

/** État évalué complet (liste, bannière, exports). */
export async function etatEvalue(opts: { synchro?: boolean } = {}) {
  if (opts.synchro !== false) await synchroniserSiNecessaire();
  const [params, etat] = await Promise.all([chargerParametres(), chargerEtat()]);
  const lignes = evaluerTout(etat, params, etat.maintenant);
  return { params, etat, lignes };
}
