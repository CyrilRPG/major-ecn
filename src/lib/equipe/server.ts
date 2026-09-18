import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import {
  composerScope, deployerPerimetre, lireScopeEquipe, normaliserPerimetre, roleSuiviDeScope,
  type EnfantsDe, type ParentDe,
  type EntreeScope, type ScopeEquipe,
} from '@/lib/auth/collaborateurs';

/**
 * Équipe & Permissions — côté serveur (cahier des charges 18/09/2026).
 * Lecture de l'équipe, écriture d'un scope, et miroir du rôle de suivi dans
 * `suivi_staff_roles` pour que les écrans historiques du module restent
 * cohérents avec le moteur de permissions.
 */

export type MembreEquipe = {
  id: string;
  role: 'admin' | 'professor';
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  access_end: string | null;
  created_at: string;
  last_sign_in: string | null;
  scope: ScopeEquipe | null;
  /** Nombre de facteurs 2FA vérifiés (0 = non activée). */
  mfa_facteurs: number;
};

type Ligne = {
  id: string; role: string; first_name: string | null; last_name: string | null; email: string | null; phone: string | null;
  is_active: boolean | null; access_end: string | null; created_at: string; permission_scope: unknown;
};

export async function listerEquipe(): Promise<MembreEquipe[]> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const [lignes, { data: rolesSuivi }, derniereConnexion, facteurs] = await Promise.all([
    fetchAllRows<Ligne>((from, to) => a
      .from('profiles')
      .select('id, role, first_name, last_name, email, phone, is_active, access_end, created_at, permission_scope')
      .in('role', ['admin', 'professor']).eq('faculte_id', EDN_FACULTE_ID)
      .order('role').order('last_name').order('id').range(from, to)),
    a.from('suivi_staff_roles').select('user_id, role'),
    chargerDernieresConnexions(),
    chargerFacteursMfa(),
  ]);
  const herite = new Map<string, 'responsable' | 'intervenant' | 'lecture'>();
  for (const r of ((rolesSuivi ?? []) as { user_id: string; role: string }[])) {
    if (r.role === 'responsable' || r.role === 'intervenant' || r.role === 'lecture') herite.set(r.user_id, r.role);
  }
  return lignes.map((l) => ({
    id: l.id,
    role: l.role === 'admin' ? 'admin' : 'professor',
    first_name: l.first_name,
    last_name: l.last_name,
    email: l.email,
    phone: l.phone,
    is_active: l.is_active !== false,
    access_end: l.access_end,
    created_at: l.created_at,
    last_sign_in: derniereConnexion.get(l.id) ?? null,
    scope: l.role === 'professor' ? lireScopeEquipe(l.permission_scope, herite.get(l.id) ?? null) : null,
    mfa_facteurs: facteurs.get(l.id) ?? 0,
  }));
}

/** Dernière connexion par compte (auth.users), via la RPC du module de suivi. */
async function chargerDernieresConnexions(): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (createAdminClient() as any).rpc('admin_activite_auth', { p_faculte_id: EDN_FACULTE_ID });
    for (const r of ((data ?? []) as { user_id: string; last_sign_in_at: string | null }[])) map.set(r.user_id, r.last_sign_in_at);
  } catch {
    // RPC absente : colonne vide, sans conséquence.
  }
  return map;
}

/** Facteurs 2FA vérifiés par compte (API admin Auth). */
async function chargerFacteursMfa(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const admin = createAdminClient();
    let page = 1;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error || !data?.users?.length) break;
      for (const u of data.users) {
        const n = (u.factors ?? []).filter((f) => f.status === 'verified').length;
        if (n > 0) map.set(u.id, n);
      }
      if (data.users.length < 1000) break;
      page += 1;
    }
  } catch {
    // Sans clé service-role : pas d'indicateur 2FA.
  }
  return map;
}

/** Noms des collèges (pour les résumés de périmètre). */
export async function nomsColleges(): Promise<Map<string, string>> {
  const { data } = await createAdminClient().from('matieres').select('id, nom');
  return new Map(((data ?? []) as { id: string; nom: string }[]).map((m) => [m.id, m.nom]));
}

export type CollegeArbre = { id: string; nom: string; enfants: { id: string; nom: string }[] };
export type HierarchieColleges = { arbre: CollegeArbre[]; parentDe: ParentDe; enfantsDe: EnfantsDe; noms: Map<string, string> };

/**
 * Collèges de premier niveau et leurs sous-collèges (Médecine générale →
 * Ophtalmologie, Pédiatrie…), dans l'ordre de la plateforme.
 */
export async function hierarchieColleges(): Promise<HierarchieColleges> {
  const { data } = await createAdminClient().from('matieres').select('id, nom, parent_matiere_id, order_index').order('order_index', { ascending: true });
  const rows = (data ?? []) as { id: string; nom: string; parent_matiere_id: string | null }[];
  const parentDe: Record<string, string> = {};
  const enfantsDe: Record<string, string[]> = {};
  const noms = new Map<string, string>();
  for (const m of rows) {
    noms.set(m.id, m.nom);
    if (m.parent_matiere_id) { parentDe[m.id] = m.parent_matiere_id; (enfantsDe[m.parent_matiere_id] ??= []).push(m.id); }
  }
  const arbre: CollegeArbre[] = rows.filter((m) => !m.parent_matiere_id).map((m) => ({
    id: m.id, nom: m.nom, enfants: rows.filter((e) => e.parent_matiere_id === m.id).map((e) => ({ id: e.id, nom: e.nom })),
  }));
  return { arbre, parentDe, enfantsDe, noms };
}

/**
 * Enregistre le scope d'un membre du personnel et reflète son module de suivi
 * dans `suivi_staff_roles` (écrans historiques du module, exports API).
 */
export async function appliquerScope(userId: string, entree: EntreeScope): Promise<ScopeEquipe> {
  // Un collège parent coché ouvre tous ses sous-collèges (mêmes formules).
  const { enfantsDe } = await hierarchieColleges();
  const scope = composerScope({ ...entree, perimetre: deployerPerimetre(normaliserPerimetre(entree.perimetre), enfantsDe) });
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { error } = await a.from('profiles').update({ permission_scope: scope }).eq('id', userId);
  if (error) throw new Error(error.message);
  const roleSuivi = roleSuiviDeScope(scope);
  if (roleSuivi) {
    await a.from('suivi_staff_roles').upsert({ user_id: userId, role: roleSuivi, faculte_id: EDN_FACULTE_ID }, { onConflict: 'user_id' });
  } else {
    await a.from('suivi_staff_roles').delete().eq('user_id', userId);
  }
  return scope;
}
