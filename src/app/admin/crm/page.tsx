import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { CrmTabs } from './crm-tabs';
import type { ContactCandidate } from './crm-contacter';

export const metadata = { title: 'CRM pédagogique' };

type PaidOffer = 'essentiel' | 'intensif' | 'approfondi';
type AnyOffer = 'decouverte' | 'essentiel' | 'intensif' | 'approfondi';

function extractPaidOffer(scope: unknown): PaidOffer | null {
  if (!scope || typeof scope !== 'object') return null;
  const o = (scope as Record<string, unknown>).offer;
  if (o === 'essentiel' || o === 'basic') return 'essentiel';
  if (o === 'intensif' || o === 'premium') return 'intensif';
  if (o === 'approfondi') return 'approfondi';
  return null;
}

function extractAnyOffer(scope: unknown): AnyOffer | null {
  if (!scope || typeof scope !== 'object') return null;
  const o = (scope as Record<string, unknown>).offer;
  if (o === 'decouverte') return 'decouverte';
  return extractPaidOffer(scope) ?? null;
}

function extractColleges(scope: unknown): string[] {
  if (!scope || typeof scope !== 'object') return [];
  const c = (scope as Record<string, unknown>).colleges;
  return Array.isArray(c) ? (c as string[]) : [];
}

/** Ligne renvoyée par la fonction SQL admin_crm_activity() (agrégats par élève). */
type ActivityRow = {
  user_id: string;
  videos_watched: number;
  fiches_read: number;
  qcm_done: number;
  flashcards_done: number;
  last_activity: string | null;
  last_revision: string | null;
  revisions_30d: number;
  alerts_pending: number;
  red_specs: number;
  orange_specs: number;
  epreuves_blanches: number;
  last_sign_in: string | null;
};

type StudentRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  promotion: string | null;
  created_at: string;
  is_active: boolean | null;
  permission_scope: unknown;
};

type Note = { id: string; user_id: string; contact_type: string; motif: string; observations: string | null; difficultes: string | null; actions_recommandees: string | null; relance_date: string | null; created_at: string };
type AlertRow = { user_id: string; priority: number; motif: string; created_at: string; resolved_at: string | null };

export default async function CrmPage() {
  await requireAdmin();

  // Toutes les lectures passent par le service-role : la page est réservée
  // admin (garde ci-dessus) et ne dépend ainsi ni de la RLS ni du volume des
  // tables. Les COMPTES (contenus ouverts, QCM, flashcards…) sont agrégés en
  // SQL par admin_crm_activity() — compter en JS après un SELECT plafonné à
  // 1 000 lignes sous-estimait massivement l'activité (élèves affichés 0/0/0).
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adm = admin as any;

  const [students, activityRows, notesRaw, alertsRaw, { data: matieresRaw }] = await Promise.all([
    fetchAllRows<StudentRow>((from, to) =>
      adm.from('profiles')
        .select('id, first_name, last_name, email, phone, promotion, created_at, is_active, permission_scope')
        .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID)
        .order('last_name').order('id')
        .range(from, to)),
    fetchAllRows<ActivityRow>((from, to) =>
      adm.rpc('admin_crm_activity', { p_faculte_id: EDN_FACULTE_ID }).order('user_id').range(from, to)),
    fetchAllRows<Note>((from, to) =>
      adm.from('pedagogical_notes')
        .select('id, user_id, contact_type, motif, observations, difficultes, actions_recommandees, relance_date, created_at')
        .order('created_at', { ascending: false }).order('id')
        .range(from, to)),
    // « Candidats à contacter » : alertes Priorité 1 non résolues (petit volume).
    fetchAllRows<AlertRow>((from, to) =>
      adm.from('admin_alerts')
        .select('user_id, priority, motif, created_at, resolved_at')
        .eq('priority', 1).is('resolved_at', null)
        .order('created_at', { ascending: false }).order('user_id')
        .range(from, to)),
    adm.from('matieres')
      .select('id, nom, parent_matiere_id, order_index, semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID)
      .is('parent_matiere_id', null)
      .order('order_index'),
  ]);

  const activityByUser = new Map(activityRows.map((a) => [a.user_id, a]));

  // ── GENERAL TAB ──────────────────────────────────────────

  const allStudents = students
    .map((s) => ({ ...s, anyOffer: extractAnyOffer(s.permission_scope), colleges: extractColleges(s.permission_scope) }))
    .filter((s): s is typeof s & { anyOffer: AnyOffer } => s.anyOffer !== null);

  const generalStudents = allStudents.map((s) => {
    const a = activityByUser.get(s.id);
    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      offer: s.anyOffer,
      colleges: s.colleges,
      videosWatched: a?.videos_watched ?? 0,
      fichesRead: a?.fiches_read ?? 0,
      qcmDone: a?.qcm_done ?? 0,
      flashcardsDone: a?.flashcards_done ?? 0,
      lastActivity: a?.last_activity ?? null,
    };
  });

  const generalStats = {
    total: generalStudents.length,
    decouverte: generalStudents.filter((s) => s.offer === 'decouverte').length,
    essentiel: generalStudents.filter((s) => s.offer === 'essentiel').length,
    intensif: generalStudents.filter((s) => s.offer === 'intensif').length,
    approfondi: generalStudents.filter((s) => s.offer === 'approfondi').length,
  };

  const colleges = ((matieresRaw ?? []) as { id: string; nom: string }[]).map((m) => ({
    id: m.id,
    nom: m.nom,
  }));

  // ── TRANSVERSAL TAB (paid students only) ─────────────────

  const paidStudents = students
    .map((s) => ({ ...s, offer: extractPaidOffer(s.permission_scope) }))
    .filter((s): s is typeof s & { offer: PaidOffer } => s.offer !== null);

  const notes = notesRaw as Note[];

  const enriched = paidStudents.map((s) => {
    const a = activityByUser.get(s.id);
    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      phone: s.phone,
      promotion: s.promotion,
      offer: s.offer,
      lastRevision: a?.last_revision ? new Date(a.last_revision) : null,
      revisions30d: a?.revisions_30d ?? 0,
      alertsPending: a?.alerts_pending ?? 0,
      redSpecs: a?.red_specs ?? 0,
      orangeSpecs: a?.orange_specs ?? 0,
      epreuvesBlanches: a?.epreuves_blanches ?? 0,
      lastSignIn: a?.last_sign_in ? new Date(a.last_sign_in) : null,
      notes: notes.filter((n) => n.user_id === s.id),
    };
  });

  // ── « Candidats à contacter » : alertes Priorité 1 non résolues ──
  // Périmètre : formules payantes uniquement, comme le reste de l'onglet.
  const paidIds = new Set(paidStudents.map((s) => s.id));
  const profileById = new Map(students.map((s) => [s.id, s]));
  const contactCandidates: ContactCandidate[] = (alertsRaw as AlertRow[])
    .filter((a) => paidIds.has(a.user_id))
    .map((a) => {
      const p = profileById.get(a.user_id);
      return {
        id: a.user_id,
        first_name: p?.first_name ?? null,
        last_name: p?.last_name ?? null,
        email: p?.email ?? null,
        phone: p?.phone ?? null,
        motif: a.motif,
        priority: a.priority,
        created_at: a.created_at,
      };
    });

  const transStats = {
    total: enriched.length,
    essentiel: enriched.filter((s) => s.offer === 'essentiel').length,
    intensif: enriched.filter((s) => s.offer === 'intensif').length,
    approfondi: enriched.filter((s) => s.offer === 'approfondi').length,
    alertsPending: enriched.reduce((sum, s) => sum + s.alertsPending, 0),
    redSpecs: enriched.reduce((sum, s) => sum + s.redSpecs, 0),
    inactive30d: enriched.filter(
      (s) => !s.lastRevision || Date.now() - s.lastRevision.getTime() > 30 * 86_400_000,
    ).length,
  };

  return (
    <CrmTabs
      generalStudents={generalStudents}
      generalStats={generalStats}
      colleges={colleges}
      transversalStudents={enriched}
      transversalStats={transStats}
      contactCandidates={contactCandidates}
    />
  );
}
