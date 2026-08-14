import 'server-only';

/**
 * Chaîne d'alertes administrateur (section 13 du cahier des charges).
 *
 * Priorité 1 → email automatique + apparition dans « Candidats à contacter »
 * (CRM / page Alertes = alertes P1 non résolues).
 * Priorité 2 → email + notification admin (ligne admin_alerts).
 *
 * Déclencheurs événementiels (appelés par les server actions) :
 *  - évaluation officielle enregistrée → 3 rouges (P1), 2 oranges (P2),
 *    chute ≥ 25 points entre deux évaluations (P1) ;
 *  - réévaluation 14 j / approfondie 30 j / bilan global 60 j → rouge (P1),
 *    orange (P2 — pour la réévaluation 14 j : seulement si d'autres critères
 *    sont présents, conformément à la section 6) ;
 *  - accumulation de mauvaises révisions du jour (≥ 3 sessions < 50 % sur
 *    14 jours) → P2 (la spec interdit d'alerter sur UNE seule mauvaise révision).
 *
 * Déclencheurs temporels (cron quotidien /api/cron/pedagogical-alerts) :
 *  - > 21 jours sans activité globale (P1) ;
 *  - < 15 révisions transversales sur 30 jours (P2) ;
 *  - épreuve blanche < 40 % (P1) ;
 *  - épreuve blanche non réalisée depuis 30 jours (P2).
 *
 * Déduplication : une alerte de même `details.key` non résolue, ou créée il y
 * a moins de 14 jours, n'est pas recréée.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, INTERNAL_NOTIFY_EMAILS } from '@/lib/email/send';
import { normalizeSpecialtyStatus } from '@/lib/pedago/status';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

const DEDUP_WINDOW_MS = 14 * 86_400_000;

/** Client service-role si disponible (cron, prod), sinon repli fourni. */
function resolveClient(fallback: AnyClient | null): AnyClient | null {
  try {
    return createAdminClient() as unknown as AnyClient;
  } catch {
    return fallback;
  }
}

export type AlertInput = {
  userId: string;
  priority: 1 | 2;
  /** Motif affiché (CRM, email) — vocabulaire du cahier des charges. */
  motif: string;
  /** Clé STABLE de déduplication (indépendante des compteurs du motif). */
  key: string;
  details?: Record<string, unknown>;
  /** Lignes détaillées de l'email (ex. « Cardiologie : 42 % »). */
  emailLines?: string[];
  /** Client de repli (contexte élève, sans clé service-role). */
  supabase?: AnyClient;
};

export async function raiseAdminAlert(input: AlertInput): Promise<boolean> {
  const client = resolveClient(input.supabase ?? null);
  if (!client) return false;

  // Déduplication.
  const { data: existing } = await client
    .from('admin_alerts')
    .select('id, created_at, resolved_at')
    .eq('user_id', input.userId)
    .eq('details->>key', input.key)
    .order('created_at', { ascending: false })
    .limit(1);
  const last = (existing ?? [])[0] as { created_at: string; resolved_at: string | null } | undefined;
  if (last && (!last.resolved_at || Date.now() - new Date(last.created_at).getTime() < DEDUP_WINDOW_MS)) {
    return false;
  }

  const { error } = await client.from('admin_alerts').insert({
    user_id: input.userId,
    priority: input.priority,
    motif: input.motif,
    details: { ...(input.details ?? {}), key: input.key },
  });
  if (error) {
    console.error('[AdminAlert] insertion impossible', error.message);
    return false;
  }

  // Email — Priorité 1 ET Priorité 2 (section 13).
  const { data: prof } = await client
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', input.userId)
    .maybeSingle();
  const p = (prof ?? {}) as { first_name?: string | null; last_name?: string | null; email?: string | null };
  const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Candidat';
  await sendAlertEmail({
    priority: input.priority,
    studentName: name,
    studentEmail: p.email ?? '',
    motif: input.motif,
    lines: input.emailLines ?? [],
  });
  return true;
}

/* ────────────────────────────────────────────────────────────────────────────
   Déclencheurs événementiels.
   ──────────────────────────────────────────────────────────────────────────── */

async function matiereNames(client: AnyClient, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data } = await client.from('matieres').select('id, nom').in('id', ids);
  return new Map(((data ?? []) as { id: string; nom: string }[]).map((m) => [m.id, m.nom]));
}

/**
 * Après chaque évaluation officielle : cumuls de statuts (3 rouges P1,
 * 2 oranges P2) + chute ≥ 25 points sur la même spécialité (P1).
 */
export async function checkAlertsAfterOfficialEvaluation(
  userId: string,
  context: { matiereId: string; newPct: number },
  supabase?: AnyClient,
): Promise<void> {
  const client = resolveClient(supabase ?? null);
  if (!client) return;

  const { data: evalsRaw } = await client
    .from('specialty_evaluations')
    .select('matiere_id, status, score_correct, score_total, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  type EvalRow = { matiere_id: string; status: string; score_correct: number; score_total: number; created_at: string };
  const evals = (evalsRaw ?? []) as EvalRow[];
  if (evals.length === 0) return;

  // Chute ≥ 25 points entre les deux dernières évaluations de la spécialité.
  const sameMatiere = evals.filter((e) => e.matiere_id === context.matiereId);
  if (sameMatiere.length >= 2) {
    const prev = sameMatiere[1];
    const prevPct = prev.score_total > 0 ? Math.round((prev.score_correct / prev.score_total) * 100) : 0;
    const drop = prevPct - context.newPct;
    if (drop >= 25) {
      const names = await matiereNames(client, [context.matiereId]);
      const nom = names.get(context.matiereId) ?? context.matiereId;
      await raiseAdminAlert({
        userId, priority: 1,
        motif: `Chute de ${drop} points entre deux évaluations (${nom})`,
        key: `chute_25_points:${context.matiereId}`,
        details: { matiere_id: context.matiereId, previous_pct: prevPct, new_pct: context.newPct },
        emailLines: [`${nom} : ${prevPct} % → ${context.newPct} %`],
        supabase: client,
      });
    }
  }

  // Derniers statuts par spécialité.
  const latest = new Map<string, EvalRow>();
  for (const e of evals) if (!latest.has(e.matiere_id)) latest.set(e.matiere_id, e);
  const reds: EvalRow[] = [];
  const oranges: EvalRow[] = [];
  for (const e of latest.values()) {
    const s = normalizeSpecialtyStatus(e.status);
    if (s === 'insuffisante') reds.push(e);
    else if (s === 'fragile') oranges.push(e);
  }

  const pctOf = (e: EvalRow) => (e.score_total > 0 ? Math.round((e.score_correct / e.score_total) * 100) : 0);

  if (reds.length >= 3) {
    const names = await matiereNames(client, reds.map((e) => e.matiere_id));
    await raiseAdminAlert({
      userId, priority: 1,
      motif: `${reds.length} spécialités rouges`,
      key: 'specialites_rouges_x3',
      details: { red_specialties: reds.map((e) => e.matiere_id) },
      emailLines: reds.map((e) => `${names.get(e.matiere_id) ?? e.matiere_id} : ${pctOf(e)} %`),
      supabase: client,
    });
  } else if (oranges.length >= 2) {
    const names = await matiereNames(client, oranges.map((e) => e.matiere_id));
    await raiseAdminAlert({
      userId, priority: 2,
      motif: `${oranges.length} spécialités oranges`,
      key: 'specialites_oranges_x2',
      details: { orange_specialties: oranges.map((e) => e.matiere_id) },
      emailLines: oranges.map((e) => `${names.get(e.matiere_id) ?? e.matiere_id} : ${pctOf(e)} %`),
      supabase: client,
    });
  }
}

/**
 * Après une session transversale terminée (sections 4, 6, 7, 8).
 * `weakMatieres` : { matiereId, nom, pct } des spécialités < 75 % de la session.
 */
export async function checkAlertsAfterTransversalSession(
  userId: string,
  session: {
    kind: string;
    pct: number;
    weakMatieres: { matiereId: string; nom: string; pct: number }[];
  },
  supabase?: AnyClient,
): Promise<void> {
  const client = resolveClient(supabase ?? null);
  if (!client) return;
  const lines = session.weakMatieres.map((w) => `${w.nom} : ${w.pct} %`);
  const isRed = session.pct < 50;
  const isOrange = session.pct >= 50 && session.pct < 75;

  if (session.kind === 'bilan_global') {
    if (isRed) {
      await raiseAdminAlert({
        userId, priority: 1, motif: `Bilan global rouge (${session.pct} %)`,
        key: 'bilan_global_rouge', details: { pct: session.pct },
        emailLines: lines, supabase: client,
      });
    } else if (isOrange) {
      await raiseAdminAlert({
        userId, priority: 2, motif: `Bilan global orange (${session.pct} %)`,
        key: 'bilan_global_orange', details: { pct: session.pct },
        emailLines: lines, supabase: client,
      });
    }
    return;
  }

  if (session.kind === 'reevaluation_deep') {
    if (isRed) {
      await raiseAdminAlert({
        userId, priority: 1, motif: `Réévaluation approfondie rouge (${session.pct} %)`,
        key: 'reevaluation_rouge', details: { pct: session.pct, kind: session.kind },
        emailLines: lines, supabase: client,
      });
    } else if (isOrange) {
      await raiseAdminAlert({
        userId, priority: 2, motif: `Réévaluation approfondie orange (${session.pct} %)`,
        key: 'reevaluation_orange', details: { pct: session.pct, kind: session.kind },
        emailLines: lines, supabase: client,
      });
    }
    return;
  }

  if (session.kind === 'reevaluation') {
    if (isRed) {
      await raiseAdminAlert({
        userId, priority: 1, motif: `Réévaluation rouge (${session.pct} %)`,
        key: 'reevaluation_rouge', details: { pct: session.pct, kind: session.kind },
        emailLines: lines, supabase: client,
      });
    } else if (isOrange) {
      // Section 6 : « alerte admin Priorité 2 POSSIBLE si autres critères
      // présents » — on exige au moins un signal complémentaire.
      const [{ data: stats }, { data: evalsRaw }] = await Promise.all([
        client.from('user_revision_stats')
          .select('transversal_revisions_last_30_days')
          .eq('user_id', userId).maybeSingle(),
        client.from('specialty_evaluations')
          .select('matiere_id, status, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ]);
      const latest = new Map<string, string>();
      for (const e of (evalsRaw ?? []) as { matiere_id: string; status: string }[]) {
        if (!latest.has(e.matiere_id)) latest.set(e.matiere_id, e.status);
      }
      const orangeSpecs = [...latest.values()].filter((s) => normalizeSpecialtyStatus(s) === 'fragile').length;
      const rev30 = (stats as { transversal_revisions_last_30_days?: number } | null)?.transversal_revisions_last_30_days ?? 0;
      if (rev30 < 15 || orangeSpecs >= 2) {
        await raiseAdminAlert({
          userId, priority: 2, motif: `Réévaluation orange (${session.pct} %)`,
          key: 'reevaluation_orange', details: { pct: session.pct, kind: session.kind, rev30, orangeSpecs },
          emailLines: lines, supabase: client,
        });
      }
    }
    return;
  }

  // Révisions du jour / recommandée / intensive : jamais d'alerte sur UNE seule
  // mauvaise révision — uniquement si les mauvais signaux s'accumulent.
  if (isRed) {
    const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
    const { data: recentRaw } = await client
      .from('transversal_sessions')
      .select('qcm_count, score_correct, completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', since);
    const bad = ((recentRaw ?? []) as { qcm_count: number; score_correct: number }[])
      .filter((s) => s.qcm_count > 0 && (s.score_correct / s.qcm_count) * 100 < 50).length;
    if (bad >= 3) {
      await raiseAdminAlert({
        userId, priority: 2,
        motif: `${bad} révisions transversales < 50 % sur 14 jours`,
        key: 'revisions_ratees_cumulees', details: { bad_sessions_14d: bad },
        emailLines: lines, supabase: client,
      });
    }
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   Email — format de la section 13.
   ──────────────────────────────────────────────────────────────────────────── */

async function sendAlertEmail(input: {
  priority: number;
  studentName: string;
  studentEmail: string;
  motif: string;
  lines: string[];
}): Promise<void> {
  const subject = `ALERTE MAJOR EVC — Priorité ${input.priority} — ${input.studentName}`;
  const linesHtml = input.lines.length > 0
    ? `<div style="margin:16px 0 0">${input.lines.map((l) => `<p style="font-size:14px;color:#111;margin:2px 0">${escapeHtml(l)}</p>`).join('')}</div>`
    : '';
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/></head>
<body style="font-family:sans-serif;margin:0;padding:24px;background:#F9FAFB">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:32px">
  <p style="font-size:12px;font-weight:700;letter-spacing:0.1em;color:${input.priority === 1 ? '#A91D2C' : '#E8742C'};text-transform:uppercase;margin:0">
    ALERTE MAJOR EVC — Priorité ${input.priority}
  </p>
  <h1 style="font-size:20px;color:#111;margin:12px 0 4px">Candidat : ${escapeHtml(input.studentName)}</h1>
  <p style="font-size:14px;color:#6B7280;margin:0">${escapeHtml(input.studentEmail)}</p>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0"/>
  <p style="font-size:14px;color:#111;margin:0"><strong>Motif :</strong> ${escapeHtml(input.motif)}</p>
  ${linesHtml}
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0"/>
  <p style="font-size:13px;color:#6B7280;margin:0">
    <strong>Action recommandée :</strong> prise de contact pédagogique.
  </p>
</div>
</body></html>`;
  const text = [
    `ALERTE MAJOR EVC — Priorité ${input.priority}`,
    '',
    `Candidat : ${input.studentName} (${input.studentEmail})`,
    `Motif : ${input.motif}`,
    ...(input.lines.length > 0 ? ['', ...input.lines] : []),
    '',
    'Action recommandée : prise de contact pédagogique.',
  ].join('\n');

  await sendEmail({ to: INTERNAL_NOTIFY_EMAILS, subject, html, text })
    .catch((err) => console.error('[AlertEmail] échec envoi', err));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
