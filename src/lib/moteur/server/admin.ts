import 'server-only';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { defaultExtractable, deriveFamily, isRealItem } from '@/lib/checkup/composition';
import { familyOf, specialtyPool } from '@/lib/checkup/server/pool';
import type { BankFamily } from '@/lib/checkup/types';
import { coursCatalog, listActiveNeeds, listItemStates, listScheduledReviews, moteurDb, type ItemStateRow, type NeedRow, type ReviewRow } from './db';

/**
 * Lectures de l'écran d'administration du moteur pédagogique : banque du
 * Check-up (classement des sources), sessions de Check-up, épisodes
 * d'alerte ouverts et vue pédagogique d'un candidat — la base du futur suivi
 * individuel (§69 : aucune logique d'alerte recodée côté back-office).
 */

/* ─── Banque : classement des séries par source de contenu ─── */

export type BankSerieRow = {
  id: string; label: string; coursTitre: string; family: BankFamily; derived: BankFamily; overridden: boolean;
  questions: number; extractable: boolean; excluded: boolean; itemId: string | null; categoryId: string | null;
};

export async function bankOverview(specialiteId: string): Promise<{
  families: Record<BankFamily, { series: number; questions: number }>; series: BankSerieRow[]; excludedQuestions: number;
  items: { id: string; titre: string }[]; categories: { id: string; nom: string }[];
}> {
  const pool = await specialtyPool(specialiteId);
  const families: Record<BankFamily, { series: number; questions: number }> = {
    structured_item: { series: 0, questions: 0 }, des_bank: { series: 0, questions: 0 }, transversal_bank: { series: 0, questions: 0 }, evc_annale: { series: 0, questions: 0 },
  };
  const formats = new Map<string, string[]>();
  for (const q of pool.questions) formats.set(q.s, [...(formats.get(q.s) ?? []), q.f]);
  const series: BankSerieRow[] = [];
  for (const s of pool.series.values()) {
    const c = pool.cours.get(s.cours_id);
    if (!c) continue;
    const derived = deriveFamily({ label: s.label }, { titre: c.titre });
    const family = (s.ms as BankFamily | null) ?? derived;
    const allQcm = (formats.get(s.id) ?? []).every((f) => f !== 'qroc');
    families[family].series++;
    families[family].questions += s.nq;
    series.push({
      id: s.id, label: s.label ?? '(sans libellé)', coursTitre: c.titre, family, derived, overridden: !!s.ms,
      questions: s.nq, extractable: s.mx ?? defaultExtractable({ label: s.label, hasVignette: s.vig }, family, allQcm), excluded: s.ex,
      itemId: s.mi, categoryId: s.mc,
    });
  }
  series.sort((a, b) => a.family.localeCompare(b.family) || a.coursTitre.localeCompare(b.coursTitre, 'fr') || a.label.localeCompare(b.label, 'fr'));
  // Rattachements possibles (§23 du complément) : items réels et catégories de la spécialité.
  const items = Array.from(pool.cours.values()).filter((c) => isRealItem(c.titre)).map((c) => ({ id: c.id, titre: c.titre })).sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
  const categories = familyOf(specialiteId, pool.parentOf).filter((id) => id !== specialiteId).map((id) => ({ id, nom: pool.names.get(id) ?? id })).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  return { families, series, excludedQuestions: pool.questions.filter((q) => q.ex).length, items, categories };
}

/* ─── Sessions de Check-up ─── */

export type CheckupAdminRow = {
  id: string; user_id: string; email: string | null; name: string; status: string; scope_kind: string; format: string; specialite_id: string;
  score_percent: number | null; started_at: string; completed_at: string | null; neutralized_reason: string | null;
};

async function profilesOf(ids: string[]): Promise<Map<string, { email: string | null; name: string }>> {
  const out = new Map<string, { email: string | null; name: string }>();
  for (let i = 0; i < ids.length; i += 150) {
    const { data } = await moteurDb().from('profiles').select('id, email, first_name, last_name').in('id', ids.slice(i, i + 150));
    for (const p of (data ?? []) as { id: string; email: string | null; first_name: string | null; last_name: string | null }[]) {
      out.set(p.id, { email: p.email, name: [p.first_name, p.last_name].filter(Boolean).join(' ') || '—' });
    }
  }
  return out;
}

export async function checkupSessions(limit = 60): Promise<{ rows: CheckupAdminRow[]; byStatus: Record<string, number> }> {
  const db = moteurDb();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [{ data }, statuses] = await Promise.all([
    db.from('checkup_sessions').select('id, user_id, status, scope_kind, format, specialite_id, score_percent, started_at, completed_at, neutralized_reason').order('started_at', { ascending: false }).limit(limit),
    fetchAllRows<{ status: string }>((from, to) => db.from('checkup_sessions').select('status').gte('started_at', since).order('id').range(from, to)),
  ]);
  const rows = (data ?? []) as Omit<CheckupAdminRow, 'email' | 'name'>[];
  const who = await profilesOf(Array.from(new Set(rows.map((r) => r.user_id))));
  const byStatus: Record<string, number> = {};
  for (const s of statuses) byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
  return { rows: rows.map((r) => ({ ...r, email: who.get(r.user_id)?.email ?? null, name: who.get(r.user_id)?.name ?? '—' })), byStatus };
}

/* ─── Épisodes d'alerte ouverts ─── */

export type EpisodeAdminRow = {
  id: string; user_id: string; email: string | null; name: string; kind: string; alert_level: number; max_level: number; alert_trigger: string; motif: string;
  status: string; alert_started_at: string; alert_displayed_at: string | null; popup_displayed_at: string | null; alert_acknowledged_at: string | null;
};

export async function openEpisodesAll(limit = 300): Promise<EpisodeAdminRow[]> {
  const { data } = await moteurDb().from('engagement_alert_episodes')
    .select('id, user_id, kind, alert_level, max_level, alert_trigger, motif, status, alert_started_at, alert_displayed_at, popup_displayed_at, alert_acknowledged_at')
    .neq('status', 'resolved').order('alert_level', { ascending: false }).order('alert_started_at', { ascending: true }).limit(limit);
  const rows = (data ?? []) as Omit<EpisodeAdminRow, 'email' | 'name'>[];
  const who = await profilesOf(Array.from(new Set(rows.map((r) => r.user_id))));
  return rows.map((r) => ({ ...r, email: who.get(r.user_id)?.email ?? null, name: who.get(r.user_id)?.name ?? '—' }));
}

/* ─── Vue pédagogique d'un candidat ─── */

export type CandidateAdminView = {
  profile: { id: string; email: string | null; name: string; role: string; is_active: boolean | null; access_end: string | null };
  engagement: Record<string, unknown> | null;
  episodes: Record<string, unknown>[];
  states: (ItemStateRow & { titre: string })[];
  needs: (NeedRow & { titre: string })[];
  reviews: (ReviewRow & { titre: string })[];
  events: { event_type: string; item_id: string | null; titre: string | null; old_status: string | null; new_status: string | null; trigger: string | null; created_at: string; detail: Record<string, unknown> | null }[];
  checkups: { id: string; status: string; scope_kind: string; score_percent: number | null; started_at: string }[];
  collector: Record<string, unknown> | null;
  history: { day: string; engagement_level: string | null; engagement_score: number | null; escalation_level: number | null; active: boolean }[];
};

export async function findCandidate(query: string): Promise<{ id: string; email: string | null; name: string }[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const db = moteurDb();
  if (/^[0-9a-f-]{36}$/i.test(q)) {
    const { data } = await db.from('profiles').select('id, email, first_name, last_name').eq('id', q).limit(1);
    return ((data ?? []) as { id: string; email: string | null; first_name: string | null; last_name: string | null }[]).map((p) => ({ id: p.id, email: p.email, name: [p.first_name, p.last_name].filter(Boolean).join(' ') }));
  }
  const like = `%${q.replace(/[%_,()]/g, ' ')}%`;
  const { data } = await db.from('profiles').select('id, email, first_name, last_name').eq('role', 'student')
    .or(`email.ilike.${like},first_name.ilike.${like},last_name.ilike.${like}`).order('email').limit(15);
  return ((data ?? []) as { id: string; email: string | null; first_name: string | null; last_name: string | null }[]).map((p) => ({ id: p.id, email: p.email, name: [p.first_name, p.last_name].filter(Boolean).join(' ') }));
}

export async function candidateAdminView(userId: string): Promise<CandidateAdminView | null> {
  const db = moteurDb();
  const { data: p } = await db.from('profiles').select('id, email, first_name, last_name, role, is_active, access_end').eq('id', userId).maybeSingle();
  if (!p) return null;
  const prof = p as { id: string; email: string | null; first_name: string | null; last_name: string | null; role: string; is_active: boolean | null; access_end: string | null };
  const [catalog, states, needs, reviews, { data: eng }, { data: eps }, { data: evs }, { data: chk }, { data: col }, { data: hist }] = await Promise.all([
    coursCatalog(), listItemStates(userId), listActiveNeeds(userId), listScheduledReviews(userId),
    db.from('engagement_state').select('*').eq('user_id', userId).maybeSingle(),
    db.from('engagement_alert_episodes').select('*').eq('user_id', userId).order('alert_started_at', { ascending: false }).limit(30),
    db.from('pedago_events').select('event_type, item_id, old_status, new_status, trigger, created_at, detail').eq('user_id', userId).order('created_at', { ascending: false }).limit(80),
    db.from('checkup_sessions').select('id, status, scope_kind, score_percent, started_at').eq('user_id', userId).order('started_at', { ascending: false }).limit(20),
    db.from('pedago_collector_state').select('*').eq('user_id', userId).maybeSingle(),
    db.from('engagement_history').select('day, engagement_level, engagement_score, escalation_level, active').eq('user_id', userId).order('day', { ascending: false }).limit(60),
  ]);
  const t = (id: string | null) => (id ? catalog.byId.get(id)?.titre ?? id : null);
  return {
    profile: { id: prof.id, email: prof.email, name: [prof.first_name, prof.last_name].filter(Boolean).join(' ') || '—', role: prof.role, is_active: prof.is_active, access_end: prof.access_end },
    engagement: (eng as Record<string, unknown> | null) ?? null,
    episodes: (eps ?? []) as Record<string, unknown>[],
    states: states.map((s) => ({ ...s, titre: t(s.item_id) ?? s.item_id })).sort((a, b) => Number(b.priority_score ?? 0) - Number(a.priority_score ?? 0)),
    needs: needs.map((n) => ({ ...n, titre: t(n.item_id) ?? n.item_id })),
    reviews: reviews.map((r) => ({ ...r, titre: t(r.item_id) ?? r.item_id })).sort((a, b) => a.due_on.localeCompare(b.due_on)),
    events: ((evs ?? []) as CandidateAdminView['events']).map((e) => ({ ...e, titre: t(e.item_id) })),
    checkups: (chk ?? []) as CandidateAdminView['checkups'],
    collector: (col as Record<string, unknown> | null) ?? null,
    history: (hist ?? []) as CandidateAdminView['history'],
  };
}
