import 'server-only';

/**
 * Chaîne d'alertes administrateur (section 13 du cahier des charges).
 *
 * Les alertes sont créées EN TEMPS RÉEL dans admin_alerts (page Alertes, CRM,
 * « Candidats à contacter » = P1 non résolues). L'email n'est PAS envoyé
 * alerte par alerte : le cron quotidien envoie UN récapitulatif des alertes
 * pas encore emailées (`sendDailyAlertDigest`, colonne `emailed_at`) — choix
 * produit du 14/08/2026 pour éviter les rafales d'emails.
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

  // Les lignes de détail (« Cardiologie : 42 % ») sont stockées avec l'alerte :
  // c'est le récapitulatif quotidien qui les mettra dans l'email.
  const { error } = await client.from('admin_alerts').insert({
    user_id: input.userId,
    priority: input.priority,
    motif: input.motif,
    details: { ...(input.details ?? {}), key: input.key, email_lines: input.emailLines ?? [] },
  });
  if (error) {
    console.error('[AdminAlert] insertion impossible', error.message);
    return false;
  }
  return true;
}

/**
 * Récapitulatif quotidien : UN email listant toutes les alertes pas encore
 * emailées (P1 d'abord), puis marquage `emailed_at`. Aucun email si rien de
 * nouveau. Appelé par le cron /api/cron/pedagogical-alerts.
 */
export async function sendDailyAlertDigest(): Promise<{ sent: boolean; p1: number; p2: number }> {
  const client = resolveClient(null);
  if (!client) return { sent: false, p1: 0, p2: 0 };

  const { data: alertsRaw } = await client
    .from('admin_alerts')
    .select('id, user_id, priority, motif, details, created_at')
    .is('emailed_at', null)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });
  type AlertRow = {
    id: string; user_id: string; priority: number; motif: string;
    details: { email_lines?: string[] } | null; created_at: string;
  };
  const alerts = (alertsRaw ?? []) as AlertRow[];
  if (alerts.length === 0) return { sent: false, p1: 0, p2: 0 };

  const userIds = [...new Set(alerts.map((a) => a.user_id))];
  const { data: profsRaw } = await client
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', userIds);
  const profs = new Map(
    ((profsRaw ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[])
      .map((p) => [p.id, p]),
  );
  const nameOf = (uid: string) => {
    const p = profs.get(uid);
    const n = [p?.first_name, p?.last_name].filter(Boolean).join(' ');
    return { name: n || 'Candidat', email: p?.email ?? '' };
  };

  const p1 = alerts.filter((a) => a.priority === 1);
  const p2 = alerts.filter((a) => a.priority === 2);
  const dateLabel = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const subject = `Récap alertes Major EVC — ${dateLabel} — ${p1.length} P1 · ${p2.length} P2`;

  const sectionHtml = (list: AlertRow[], label: string, color: string) => {
    if (list.length === 0) return '';
    const rows = list.map((a) => {
      const s = nameOf(a.user_id);
      const lines = (a.details?.email_lines ?? [])
        .map((l) => `<p style="font-size:13px;color:#374151;margin:1px 0 0 0">${escapeHtml(l)}</p>`)
        .join('');
      return `<div style="border:1px solid #E5E7EB;border-left:4px solid ${color};border-radius:8px;padding:12px 16px;margin:0 0 10px">
  <p style="font-size:14px;color:#111;margin:0"><strong>${escapeHtml(s.name)}</strong> <span style="color:#6B7280">${escapeHtml(s.email)}</span></p>
  <p style="font-size:13px;color:#111;margin:4px 0 0"><strong>Motif :</strong> ${escapeHtml(a.motif)}</p>
  ${lines}
</div>`;
    }).join('');
    return `<p style="font-size:12px;font-weight:700;letter-spacing:0.1em;color:${color};text-transform:uppercase;margin:20px 0 10px">${label} (${list.length})</p>${rows}`;
  };

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/></head>
<body style="font-family:sans-serif;margin:0;padding:24px;background:#F9FAFB">
<div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:32px">
  <h1 style="font-size:18px;color:#111;margin:0">Récapitulatif quotidien des alertes pédagogiques</h1>
  <p style="font-size:13px;color:#6B7280;margin:6px 0 0">${escapeHtml(dateLabel)} — ${alerts.length} nouvelle${alerts.length > 1 ? 's' : ''} alerte${alerts.length > 1 ? 's' : ''}</p>
  ${sectionHtml(p1, 'Priorité 1 — prise de contact pédagogique recommandée', '#A91D2C')}
  ${sectionHtml(p2, 'Priorité 2 — à surveiller', '#E8742C')}
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0"/>
  <p style="font-size:12px;color:#6B7280;margin:0">
    Détail et résolution : Admin → Alertes pédagogiques. Les Priorité 1 non résolues
    apparaissent dans « Candidats à contacter » (CRM).
  </p>
</div>
</body></html>`;

  const sectionText = (list: AlertRow[], label: string) =>
    list.length === 0 ? [] : [
      '', `${label} (${list.length})`,
      ...list.flatMap((a) => {
        const s = nameOf(a.user_id);
        return [`- ${s.name} (${s.email}) — ${a.motif}`, ...(a.details?.email_lines ?? []).map((l) => `    ${l}`)];
      }),
    ];
  const text = [
    `Récapitulatif quotidien des alertes pédagogiques — ${dateLabel}`,
    ...sectionText(p1, 'PRIORITÉ 1 — prise de contact pédagogique recommandée'),
    ...sectionText(p2, 'PRIORITÉ 2 — à surveiller'),
  ].join('\n');

  const res = await sendEmail({ to: INTERNAL_NOTIFY_EMAILS, subject, html, text })
    .catch((err) => {
      console.error('[AlertDigest] échec envoi', err);
      return { ok: false as const, error: String(err) };
    });
  if (!res.ok) return { sent: false, p1: p1.length, p2: p2.length };

  // Marquage — uniquement après un envoi réussi.
  const now = new Date().toISOString();
  await client.from('admin_alerts').update({ emailed_at: now }).in('id', alerts.map((a) => a.id));
  return { sent: true, p1: p1.length, p2: p2.length };
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

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
