import 'server-only';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { parseScope, scopeOffers } from '@/lib/auth/permissions';
import { eleveDansPerimetre, lireScopeEquipe, type ScopeEquipe } from '@/lib/auth/collaborateurs';
import { listStudents, loadActivity, loadLastSignIns, suiviDb } from './db';
import { studentName, studentSpecialty, studentVoie } from './students';
import { calculerAlertes, niveauActivite } from './alertes-auto';
import type { SuiviActor } from './roles';

/**
 * Tableau de travail « Suivi élèves / Commercial » (cahier des charges
 * 18/09/2026, §3-4) : pour chaque élève du PÉRIMÈTRE du collaborateur —
 * spécialités, formules, population (tous / en alerte / affectés) — l'état
 * qui décide d'un appel : activité, dernière connexion, progression, alertes
 * automatiques, dernier contact, prochain contact, statut de suivi et
 * collaborateur affecté. L'administrateur voit tout le monde.
 */

export { STATUTS_SUIVI, STATUT_SUIVI_LABEL } from './eleves-pure';
export type { StatutSuivi, Collaborateur, LigneEleve, StatsSuivi, TableauEleves } from './eleves-pure';
import type { StatutSuivi, Collaborateur, LigneEleve, StatsSuivi, TableauEleves } from './eleves-pure';

type FollowupRow = {
  user_id: string; assigned_to: string | null; statut: StatutSuivi; prochain_contact_at: string | null; note: string | null; updated_at: string;
};

/** Scope d'équipe de l'acteur (null = administrateur, tout voir). */
export function scopeDeActeur(actor: SuiviActor): ScopeEquipe | null {
  if (actor.role === 'admin' || actor.profile.role === 'admin') return null;
  return lireScopeEquipe(actor.profile.permission_scope, actor.role);
}

/** Membres de l'équipe qui suivent des élèves (affectation « Affecter à »). */
export async function listerCollaborateursSuivi(): Promise<Collaborateur[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = createAdminClient() as any;
  const [{ data: staff }, { data: roles }] = await Promise.all([
    a.from('profiles').select('id, role, first_name, last_name, email, permission_scope, is_active').in('role', ['admin', 'professor']).eq('faculte_id', EDN_FACULTE_ID).order('last_name'),
    a.from('suivi_staff_roles').select('user_id, role'),
  ]);
  const herite = new Map<string, string>(((roles ?? []) as { user_id: string; role: string }[]).map((r) => [r.user_id, r.role]));
  const out: Collaborateur[] = [];
  for (const p of ((staff ?? []) as { id: string; role: string; first_name: string | null; last_name: string | null; email: string | null; permission_scope: unknown; is_active: boolean | null }[])) {
    if (p.is_active === false) continue;
    const suit = p.role === 'admin' || !!lireScopeEquipe(p.permission_scope, (herite.get(p.id) as 'responsable' | 'intervenant' | 'lecture' | undefined) ?? null)?.modules.suivi.actif;
    if (suit) out.push({ id: p.id, nom: studentName(p) });
  }
  return out;
}

/** Dates de concours connues (planificateur), par élève. */
async function chargerDatesConcours(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await fetchAllRows<{ user_id: string; exam_date: string | null }>((from, to) => (createAdminClient() as any)
      .from('plan_profiles').select('user_id, exam_date').not('exam_date', 'is', null).order('user_id').range(from, to));
    for (const r of rows) if (r.exam_date) map.set(r.user_id, r.exam_date);
  } catch {
    // Table absente ou vide : pas d'échéance connue.
  }
  return map;
}

/** Nombre d'items par collège (dénominateur de la progression). */
async function chargerTailleProgramme(): Promise<Map<string, number>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await fetchAllRows<{ id: string; matiere_id: string }>((from, to) => (createAdminClient() as any)
    .from('cours').select('id, matiere_id').order('id').range(from, to));
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.matiere_id, (map.get(r.matiere_id) ?? 0) + 1);
  return map;
}

/** Derniers contacts : comptes rendus d'appel et comptes rendus du suivi. */
async function chargerContacts(): Promise<Map<string, { dernier: string | null; nb: number }>> {
  const map = new Map<string, { dernier: string | null; nb: number }>();
  const pousser = (userId: string, date: string) => {
    const cur = map.get(userId) ?? { dernier: null, nb: 0 };
    cur.nb += 1;
    if (!cur.dernier || date > cur.dernier) cur.dernier = date;
    map.set(userId, cur);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = createAdminClient() as any;
  const [notes, rapports] = await Promise.all([
    fetchAllRows<{ user_id: string; created_at: string }>((from, to) => a.from('pedagogical_notes').select('user_id, created_at').order('created_at', { ascending: false }).range(from, to)),
    fetchAllRows<{ user_id: string; occurred_at: string }>((from, to) => suiviDb().from('suivi_reports').select('user_id, occurred_at').order('occurred_at', { ascending: false }).range(from, to)),
  ]);
  for (const n of notes) pousser(n.user_id, n.created_at);
  for (const r of rapports) pousser(r.user_id, r.occurred_at);
  return map;
}

async function chargerFollowups(): Promise<Map<string, FollowupRow>> {
  const rows = await fetchAllRows<FollowupRow>((from, to) => suiviDb().from('suivi_followups').select('user_id, assigned_to, statut, prochain_contact_at, note, updated_at').order('user_id').range(from, to));
  return new Map(rows.map((r) => [r.user_id, r]));
}

export async function chargerTableauEleves(actor: SuiviActor): Promise<TableauEleves> {
  const scope = scopeDeActeur(actor);
  const [students, signIns, activite, concours, programme, contacts, followups, collaborateurs] = await Promise.all([
    listStudents(), loadLastSignIns(), loadActivity(), chargerDatesConcours(), chargerTailleProgramme(), chargerContacts(), chargerFollowups(), listerCollaborateursSuivi(),
  ]);
  const collabParId = new Map(collaborateurs.map((c) => [c.id, c]));
  const now = Date.now();
  const aujourdhui = new Date(now).toISOString().slice(0, 10);

  const lignes: LigneEleve[] = [];
  for (const s of students) {
    if (s.is_active === false) continue;
    const ps = parseScope(s.permission_scope);
    const colleges: string[] | 'all' = ps.type === 'all' ? 'all' : ps.colleges.filter((c) => c !== 'col-decouverte');
    const offers = scopeOffers(ps);
    // Périmètre du collaborateur : spécialités + formules (cahier §2).
    if (scope && !eleveDansPerimetre(scope.perimetre, { colleges, offers })) continue;

    const act = activite.get(s.id);
    const f = followups.get(s.id);
    const c = contacts.get(s.id);
    const nbCours = colleges === 'all'
      ? Array.from(programme.values()).reduce((n, x) => n + x, 0)
      : colleges.reduce((n, id) => n + (programme.get(id) ?? 0), 0);
    const touches = (act?.videos_watched ?? 0) + (act?.fiches_read ?? 0);
    const progression = nbCours > 0 ? Math.min(100, Math.round((touches / (2 * nbCours)) * 100)) : null;
    const signaux = {
      inscritLe: s.created_at,
      derniereConnexion: signIns.get(s.id) ?? act?.last_sign_in ?? null,
      derniereActivite: act?.last_activity ?? null,
      progression,
      qcmFaits: act?.qcm_done ?? 0,
      videosVues: act?.videos_watched ?? 0,
      fichesLues: act?.fiches_read ?? 0,
      dateConcours: concours.get(s.id) ?? null,
    };
    const alertes = calculerAlertes(signaux, undefined, now);
    const affecteA = f?.assigned_to ? (collabParId.get(f.assigned_to) ?? { id: f.assigned_to, nom: 'Collaborateur' }) : null;

    // Population visible (cahier §2) : tous / en alerte / affectés à moi.
    if (scope) {
      const pop = scope.modules.suivi.population;
      if (pop === 'alertes' && alertes.length === 0) continue;
      if (pop === 'affectes' && affecteA?.id !== actor.profile.id) continue;
    }

    lignes.push({
      id: s.id,
      nom: studentName(s),
      email: s.email,
      phone: s.phone,
      specialite: studentSpecialty(s.permission_scope) || '—',
      offer: ps.offer,
      voie: studentVoie(s.permission_scope),
      inscritLe: s.created_at,
      derniereConnexion: signaux.derniereConnexion,
      derniereActivite: signaux.derniereActivite,
      activite: niveauActivite(signaux, now),
      progression,
      qcmFaits: signaux.qcmFaits,
      videosVues: signaux.videosVues,
      fichesLues: signaux.fichesLues,
      alertes,
      dernierContact: c?.dernier ?? null,
      prochainContact: f?.prochain_contact_at ?? null,
      statut: f?.statut ?? 'a_contacter',
      affecteA,
      nbComptesRendus: c?.nb ?? 0,
    });
  }

  const stats: StatsSuivi = {
    total: lignes.length,
    affectes: lignes.filter((l) => !!l.affecteA).length,
    aRappelerAujourdhui: lignes.filter((l) => l.statut === 'a_rappeler' && !!l.prochainContact && l.prochainContact <= aujourdhui).length,
    sansContact10j: lignes.filter((l) => !l.dernierContact || (now - new Date(l.dernierContact).getTime()) > 10 * 86_400_000).length,
    urgents: lignes.filter((l) => l.statut === 'urgent').length,
    enAlerte: lignes.filter((l) => l.alertes.length > 0).length,
  };

  return {
    lignes,
    collaborateurs,
    stats,
    perimetreRestreint: !!scope,
    peutAffecter: !scope || scope.modules.suivi.gerer,
    peutRediger: !scope || scope.modules.suivi.rediger,
  };
}

/** Un élève est-il dans le périmètre ET la population de l'acteur ? */
export async function eleveAccessible(actor: SuiviActor, userId: string): Promise<{ ok: true; ligne: LigneEleve } | { ok: false; error: string }> {
  const tableau = await chargerTableauEleves(actor);
  const ligne = tableau.lignes.find((l) => l.id === userId);
  if (!ligne) return { ok: false, error: 'Cet élève n’est pas dans votre périmètre.' };
  return { ok: true, ligne };
}
