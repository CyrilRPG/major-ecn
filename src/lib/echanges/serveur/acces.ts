import 'server-only';
import { getAccessInfo } from '@/lib/auth/access';
import { accesEquipeExpire } from '@/lib/auth/collaborateurs';
import {
  capacitesDuNiveau, correspondAuxCriteres, droitsCandidat, droitsEnseignant, droitsEquipe, etatSanctions,
  groupeVisibleEleve, lireCriteres, participe,
  type Capacite, type ContexteCriteres, type Droits, type EtatSanctions, type ModeParticipants, type NiveauStaff,
  type Sanction, type StatutGroupe,
} from '../regles';
import { db, FACULTE, parametres, type Parametres } from './base';

/**
 * Contrôle d'accès du module Échanges — appliqué par CHAQUE route serveur
 * (lecture, publication, recherche, pièces jointes, liens directs) : identité,
 * rôle, groupe, droits sur la conversation, sanctions (CDC §97-100).
 */

export type ProfilActeur = {
  id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  pseudo: string | null;
  email: string | null;
  permission_scope: unknown;
  is_active: boolean | null;
  access_end: string | null;
  avatar_seed: string | null;
  faculte_id: string | null;
  expire: boolean;
};

export type Acteur = {
  id: string;
  role: 'student' | 'professor' | 'admin';
  profil: ProfilActeur;
  niveau: NiveauStaff | null;
  capacites: Set<Capacite>;
  /** Groupes d'un modérateur restreint (null = tous). */
  staffGroupes: string[] | null;
  testeur: boolean;
};

export type GroupeRow = {
  id: string;
  faculte_id: string;
  nom: string;
  annee: number | null;
  promotion: string | null;
  specialite_id: string | null;
  specialite_nom: string | null;
  description: string | null;
  statut: StatutGroupe;
  visible: boolean;
  mode_participants: ModeParticipants;
  criteres: unknown;
  moderation_prealable: boolean;
  notifier_chaque_message: boolean;
  bibliotheque_acces: boolean;
  message_accueil: string | null;
  date_ouverture: string | null;
  date_cloture_prevue: string | null;
  date_archivage_prevue: string | null;
  topic: string;
  created_at: string;
  cloturee_at: string | null;
  archivee_at: string | null;
  conservation_legale: boolean;
};

export const COLONNES_GROUPE = 'id, faculte_id, nom, annee, promotion, specialite_id, specialite_nom, description, statut, visible, mode_participants, criteres, moderation_prealable, notifier_chaque_message, bibliotheque_acces, message_accueil, date_ouverture, date_cloture_prevue, date_archivage_prevue, topic, created_at, cloturee_at, archivee_at, conservation_legale';

export type Affectation = {
  id: string;
  groupe_id: string;
  user_id: string;
  qualite: string | null;
  specialite_publique: string | null;
  email_notification: string | null;
  peut_publier: boolean;
  peut_epingler: boolean;
  actif: boolean;
};

export type Adhesion = {
  groupe_id: string;
  user_id: string;
  source: 'auto' | 'manuel';
  statut: 'actif' | 'retire';
  exclusion_forcee: boolean;
  regles_acceptees_at: string | null;
  sourdine: boolean;
};

export type AccesGroupe = {
  groupe: GroupeRow;
  role: 'candidat' | 'enseignant' | 'equipe';
  droits: Droits;
  sanctions: EtatSanctions | null;
  affectation: Affectation | null;
  adhesion: Adhesion | null;
};

/* ─────────────────────────────── Acteur ─────────────────────────────── */

export async function chargerActeur(userId: string): Promise<Acteur | null> {
  const [{ data: p }, { data: staff }, prm] = await Promise.all([
    db().from('profiles')
      .select('id, role, first_name, last_name, pseudo, email, permission_scope, is_active, access_end, avatar_seed, faculte_id, evc_session:evc_sessions(default_access_end)')
      .eq('id', userId).maybeSingle(),
    db().from('echanges_staff').select('niveau, groupes, peut_suspendre').eq('user_id', userId).maybeSingle(),
    parametres(),
  ]);
  if (!p) return null;
  const role = p.role === 'admin' || p.role === 'professor' ? p.role : 'student';
  const session = Array.isArray(p.evc_session) ? p.evc_session[0] : p.evc_session;
  const expire = role === 'student'
    ? getAccessInfo({ role: 'student', access_end: p.access_end, evc_session: session ?? null }).expired
    : accesEquipeExpire(p);
  let niveau: NiveauStaff | null = null;
  if (role === 'admin') niveau = 'super_admin';
  else if (role === 'professor' && staff) niveau = staff.niveau as NiveauStaff;
  const capacites = capacitesDuNiveau(niveau, { peutSuspendre: !!staff?.peut_suspendre });
  return {
    id: p.id,
    role,
    profil: { ...p, expire },
    niveau,
    capacites,
    staffGroupes: role === 'admin' ? null : (staff?.groupes ?? null),
    testeur: (prm.testeurs ?? []).includes(p.id),
  };
}

/** Compte utilisable (actif, non expiré). Un compte fermé n'accède à aucune messagerie (§77). */
export function compteOuvert(a: Acteur): boolean {
  return a.profil.is_active !== false && !a.profil.expire;
}

/**
 * Le module est-il ouvert à cette personne ? (feature flag, §145-146)
 *  · désactivé : Super Admin seulement (configuration) ;
 *  · interne : l'équipe, les enseignants affectés et les comptes de test ;
 *  · actif : tout le monde (selon ses groupes).
 */
export function moduleOuvert(a: Acteur, prm: Parametres, estEnseignantAffecte: boolean): boolean {
  if (a.niveau === 'super_admin') return true;
  if (prm.module_mode === 'desactive') return false;
  if (prm.module_mode === 'actif') return true;
  return a.niveau !== null || estEnseignantAffecte || a.testeur;
}

/* ─────────────────────────── Spécialités (critères) ─────────────────────────── */

let ctxCache: { at: number; ctx: ContexteCriteres & { specialites: { id: string; nom: string }[] } } | null = null;

/** Hiérarchie et noms des collèges de la plateforme (cache 5 min). */
export async function contexteCriteres(): Promise<ContexteCriteres & { specialites: { id: string; nom: string }[] }> {
  if (ctxCache && Date.now() - ctxCache.at < 300_000) return ctxCache.ctx;
  const { data, error } = await db().from('facultes')
    .select('semestres(matieres(id, nom, parent_matiere_id, order_index))')
    .eq('id', FACULTE).maybeSingle();
  if (error) throw new Error(`Collèges illisibles : ${error.message}`);
  type M = { id: string; nom: string; parent_matiere_id: string | null; order_index: number | null };
  const mats = ((data?.semestres ?? []) as { matieres?: M[] }[]).flatMap((s) => s.matieres ?? []);
  const parentDe: Record<string, string> = {};
  const nomDe: Record<string, string> = {};
  for (const m of mats) {
    nomDe[m.id] = m.nom;
    if (m.parent_matiere_id) parentDe[m.id] = m.parent_matiere_id;
  }
  const specialites = mats
    .filter((m) => !m.parent_matiere_id && m.id !== 'col-decouverte')
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => ({ id: m.id, nom: m.nom }));
  const ctx = { parentDe, nomDe: Object.fromEntries(specialites.map((s) => [s.id, s.nom])), specialites };
  ctxCache = { at: Date.now(), ctx };
  return ctx;
}

/* ─────────────────────────────── Sanctions ─────────────────────────────── */

export async function sanctionsDe(userId: string): Promise<Sanction[]> {
  const { data, error } = await db().from('echanges_sanctions')
    .select('id, type, groupe_id, debut_at, fin_at, levee_at')
    .eq('user_id', userId).is('levee_at', null);
  if (error) throw new Error(`Sanctions illisibles : ${error.message}`);
  return (data ?? []) as Sanction[];
}

/* ─────────────────────────────── Groupes ─────────────────────────────── */

async function affectationsDe(userId: string): Promise<Affectation[]> {
  const { data, error } = await db().from('echanges_enseignants')
    .select('id, groupe_id, user_id, qualite, specialite_publique, email_notification, peut_publier, peut_epingler, actif')
    .eq('user_id', userId).eq('actif', true);
  if (error) throw new Error(error.message);
  return (data ?? []) as Affectation[];
}

/**
 * Tous les groupes accessibles à une personne, avec ses droits. Pour un
 * candidat, la participation est recalculée à chaque appel (critères,
 * exceptions) et l'adhésion automatique mise à jour : un changement de
 * formule ou de spécialité s'applique sans attendre la synchronisation (R47).
 */
export async function groupesAccessibles(a: Acteur, opts: { inclureArchives?: boolean } = {}): Promise<AccesGroupe[]> {
  const prm = await parametres();
  if (!compteOuvert(a)) return [];

  if (a.niveau !== null) {
    let q = db().from('echanges_groupes').select(COLONNES_GROUPE).eq('faculte_id', FACULTE).order('created_at', { ascending: false });
    if (!opts.inclureArchives) q = q.in('statut', ['brouillon', 'active', 'cloturee']);
    if (a.staffGroupes) q = q.in('id', a.staffGroupes.length ? a.staffGroupes : ['00000000-0000-0000-0000-000000000000']);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const affs = a.role === 'professor' ? await affectationsDe(a.id) : [];
    return ((data ?? []) as GroupeRow[]).map((g) => ({
      groupe: g,
      role: 'equipe' as const,
      droits: fusionDroits(droitsEquipe({ statut: g.statut, capacites: a.capacites }), affs.find((x) => x.groupe_id === g.id), g.statut),
      sanctions: null,
      affectation: affs.find((x) => x.groupe_id === g.id) ?? null,
      adhesion: null,
    }));
  }

  if (a.role === 'professor') {
    const affs = await affectationsDe(a.id);
    if (affs.length === 0 || !moduleOuvert(a, prm, true)) return [];
    const { data, error } = await db().from('echanges_groupes').select(COLONNES_GROUPE)
      .in('id', affs.map((x) => x.groupe_id)).eq('faculte_id', FACULTE)
      .in('statut', opts.inclureArchives ? ['active', 'cloturee', 'archivee'] : ['active', 'cloturee']);
    if (error) throw new Error(error.message);
    return ((data ?? []) as GroupeRow[]).filter((g) => g.visible).map((g) => {
      const aff = affs.find((x) => x.groupe_id === g.id)!;
      return {
        groupe: g, role: 'enseignant' as const,
        droits: droitsEnseignant({ statut: g.statut, peutPublier: aff.peut_publier, peutEpingler: aff.peut_epingler }),
        sanctions: null, affectation: aff, adhesion: null,
      };
    });
  }

  // Candidat
  if (!moduleOuvert(a, prm, false)) return [];
  const [{ data: gs, error: ge }, { data: ad, error: ae }, sanctions, ctx] = await Promise.all([
    db().from('echanges_groupes').select(COLONNES_GROUPE).eq('faculte_id', FACULTE).in('statut', ['active', 'cloturee']).eq('visible', true),
    db().from('echanges_membres').select('groupe_id, user_id, source, statut, exclusion_forcee, regles_acceptees_at, sourdine').eq('user_id', a.id),
    sanctionsDe(a.id),
    contexteCriteres(),
  ]);
  if (ge || ae) throw new Error((ge ?? ae).message);
  const adhesions = new Map(((ad ?? []) as Adhesion[]).map((x) => [x.groupe_id, x]));
  const out: AccesGroupe[] = [];
  const aAjouter: Record<string, unknown>[] = [];
  const aRetirer: string[] = [];
  for (const g of (gs ?? []) as GroupeRow[]) {
    if (!groupeVisibleEleve(g)) continue;
    const adh = adhesions.get(g.id) ?? null;
    const correspond = g.mode_participants !== 'manuel'
      && correspondAuxCriteres({ permission_scope: a.profil.permission_scope, is_active: a.profil.is_active, expire: a.profil.expire, role: 'student' }, lireCriteres(g.criteres), ctx);
    const ok = participe(adh, g.mode_participants, correspond, true);
    if (ok && (!adh || (adh.source === 'auto' && adh.statut !== 'actif'))) {
      aAjouter.push({ groupe_id: g.id, user_id: a.id, source: 'auto', statut: 'actif', ajoute_at: new Date().toISOString(), retire_at: null, motif_retrait: null });
    }
    if (!ok && adh && adh.source === 'auto' && adh.statut === 'actif' && !adh.exclusion_forcee) aRetirer.push(g.id);
    if (!ok) continue;
    const etat = etatSanctions(sanctions, g.id);
    out.push({
      groupe: g,
      role: 'candidat',
      droits: droitsCandidat({ statut: g.statut, sanctions: etat, reactionsLectureSeule: prm.reactions_lecture_seule }),
      sanctions: etat,
      affectation: null,
      adhesion: adh ?? { groupe_id: g.id, user_id: a.id, source: 'auto', statut: 'actif', exclusion_forcee: false, regles_acceptees_at: null, sourdine: false },
    });
  }
  if (aAjouter.length > 0) await db().from('echanges_membres').upsert(aAjouter, { onConflict: 'groupe_id,user_id' });
  if (aRetirer.length > 0) {
    await db().from('echanges_membres').update({ statut: 'retire', retire_at: new Date().toISOString(), motif_retrait: 'Ne correspond plus aux critères du groupe' })
      .eq('user_id', a.id).eq('source', 'auto').in('groupe_id', aRetirer);
  }
  return out;
}

/** Un enseignant également membre de l'équipe garde ses droits d'enseignant (épinglage) dans son groupe. */
function fusionDroits(d: Droits, aff: Affectation | undefined, statut: StatutGroupe): Droits {
  if (!aff) return d;
  const e = droitsEnseignant({ statut, peutPublier: aff.peut_publier, peutEpingler: aff.peut_epingler });
  return { ...d, publier: d.publier || e.publier, repondre: d.repondre || e.repondre, epingler: d.epingler || e.epingler, joindre: d.joindre || e.joindre };
}

/**
 * Accès à UN groupe (liens directs, API) — même calcul que la liste, jamais
 * de raccourci : modifier un identifiant dans l'URL ne contourne rien (§98, R2, R48).
 */
export async function accesGroupe(a: Acteur, groupeId: string, opts: { inclureArchives?: boolean } = {}): Promise<AccesGroupe | null> {
  if (!/^[0-9a-f-]{36}$/i.test(groupeId)) return null;
  const tous = await groupesAccessibles(a, { inclureArchives: opts.inclureArchives ?? a.niveau !== null });
  return tous.find((x) => x.groupe.id === groupeId) ?? null;
}

/** Erreur standard des routes : jamais d'indice sur l'existence d'un groupe auquel on n'a pas accès. */
export const REFUS = { error: 'Conversation introuvable ou accès refusé.', code: 'DROITS' as const };
