import 'server-only';
import {
  getSettings, listAlerts, listAppointments, listCampaigns, listMembers, listStudentsByIds, suiviDb,
} from './db';
import { sendAlertEmail, sendTemplateEmail } from './emails';
import { fmtDateLong, fmtTime } from './format';
import { listAvailableSlots } from './booking';
import { studentSpecialty } from './students';
import { bookingLinkFor, purgeExpiredTokens } from './tokens';

/**
 * Balayage périodique (cron `suivi-sweep`, toutes les 15 min) :
 *  1. rappels avant rendez-vous (§9) — une seule fois par rendez-vous ;
 *  2. emails des alertes administrateur échues (§4) — une seule fois ;
 *  3. relances automatiques des invités sans réservation (§14) ;
 *  4. entretien : jetons expirés, conservation (§18).
 * Chaque étape est idempotente : un marqueur en base (`reminder_sent_at`,
 * `emailed_at`, `last_reminder_at`) empêche tout doublon.
 */
export type SweepReport = {
  reminders: number;
  alerts: number;
  relances: number;
  tokensPurged: number;
  retentionPurged: number;
  errors: string[];
};

const RELANCE_AFTER_DAYS = 3;
const RELANCE_MAX = 2;

export async function runSuiviSweep(now: Date = new Date()): Promise<SweepReport> {
  const report: SweepReport = { reminders: 0, alerts: 0, relances: 0, tokensPurged: 0, retentionPurged: 0, errors: [] };
  const settings = await getSettings();
  const nowIso = now.toISOString();

  /* 1. Rappels avant rendez-vous */
  try {
    // Fenêtre large (7 jours) puis filtrage précis par délai propre à chaque rendez-vous.
    const horizon = new Date(now.getTime() + 168 * 3_600_000).toISOString();
    const upcoming = await listAppointments({ from: nowIso, to: horizon, statuses: ['planned'] });
    const due = upcoming.filter((a) => {
      if (a.reminder_sent_at) return false;
      const hours = a.reminder_hours ?? settings.reminder_hours;
      return new Date(a.starts_at).getTime() - now.getTime() <= hours * 3_600_000;
    });
    const students = new Map((await listStudentsByIds(due.map((a) => a.user_id))).map((s) => [s.id, s]));
    for (const a of due) {
      // Marqueur posé AVANT l'envoi : un second balayage concurrent ne renvoie pas.
      const { data: claimed } = await suiviDb().from('suivi_appointments')
        .update({ reminder_sent_at: nowIso }).eq('id', a.id).is('reminder_sent_at', null).select('id');
      if (!Array.isArray(claimed) || claimed.length === 0) continue;
      const s = students.get(a.user_id);
      if (!s?.email) continue;
      const lien = await bookingLinkFor(a.user_id, a.campaign_id);
      const res = await sendTemplateEmail({
        key: 'reminder_before', to: s.email, userId: a.user_id, campaignId: a.campaign_id, appointmentId: a.id,
        vars: { prenom: s.first_name ?? '', specialite: studentSpecialty(s.permission_scope), date: fmtDateLong(a.starts_at), heure: fmtTime(a.starts_at), lien },
      });
      if (res.ok) report.reminders++; else report.errors.push(`rappel ${a.id}: ${res.error}`);
    }
  } catch (err) {
    report.errors.push(`rappels: ${err instanceof Error ? err.message : String(err)}`);
  }

  /* 2. Alertes administrateur échues */
  try {
    const alerts = (await listAlerts()).filter((al) => (al.status === 'open' || al.status === 'postponed') && !al.emailed_at && al.due_at <= nowIso);
    for (const al of alerts) {
      const { data: claimed } = await suiviDb().from('suivi_alerts').update({ emailed_at: nowIso }).eq('id', al.id).is('emailed_at', null).select('id');
      if (!Array.isArray(claimed) || claimed.length === 0) continue;
      const res = await sendAlertEmail(al, settings);
      if (res.ok) report.alerts++; else report.errors.push(`alerte ${al.id}: ${res.error}`);
    }
  } catch (err) {
    report.errors.push(`alertes: ${err instanceof Error ? err.message : String(err)}`);
  }

  /* 3. Relances automatiques sans réservation */
  try {
    const threshold = new Date(now.getTime() - RELANCE_AFTER_DAYS * 86_400_000).toISOString();
    const campaigns = (await listCampaigns()).filter((c) => c.status === 'active');
    for (const c of campaigns) {
      const members = (await listMembers(c.id)).filter((m) =>
        m.status === 'invited' && m.invited_at && m.invited_at <= threshold &&
        (!m.last_reminder_at || m.last_reminder_at <= threshold) && m.reminder_count < RELANCE_MAX);
      if (members.length === 0) continue;
      // Inutile de relancer s'il ne reste aucun créneau réservable.
      const available = await listAvailableSlots({ campaignId: c.id }, { from: now });
      if (available.length === 0) continue;
      const students = new Map((await listStudentsByIds(members.map((m) => m.user_id))).map((s) => [s.id, s]));
      for (const m of members) {
        const { data: claimed } = await suiviDb().from('suivi_campaign_members')
          .update({ last_reminder_at: nowIso, reminder_count: m.reminder_count + 1 })
          .eq('id', m.id).eq('reminder_count', m.reminder_count).select('id');
        if (!Array.isArray(claimed) || claimed.length === 0) continue;
        const s = students.get(m.user_id);
        if (!s?.email) continue;
        const lien = await bookingLinkFor(m.user_id, c.id);
        const res = await sendTemplateEmail({
          key: 'reminder_no_booking', to: s.email, userId: m.user_id, campaignId: c.id, historyKind: 'relance',
          vars: { prenom: s.first_name ?? '', specialite: studentSpecialty(s.permission_scope), date: c.period_start ? fmtDateLong(`${c.period_start}T12:00:00Z`) : '', lien },
        });
        if (res.ok) report.relances++; else report.errors.push(`relance ${m.id}: ${res.error}`);
      }
    }
  } catch (err) {
    report.errors.push(`relances: ${err instanceof Error ? err.message : String(err)}`);
  }

  /* 4. Entretien */
  try {
    report.tokensPurged = await purgeExpiredTokens();
    report.retentionPurged = await applyRetention(settings.retention_months, now);
  } catch (err) {
    report.errors.push(`entretien: ${err instanceof Error ? err.message : String(err)}`);
  }

  return report;
}

/**
 * Conservation (§18) : au-delà de `retention_months`, les comptes rendus (et
 * leurs difficultés / actions), rendez-vous et traces d'historique sont
 * supprimés. Minimisation : on ne garde pas d'entretien plus longtemps que
 * la durée paramétrée.
 */
export async function applyRetention(retentionMonths: number, now: Date = new Date()): Promise<number> {
  if (!retentionMonths || retentionMonths < 1) return 0;
  const limit = new Date(now);
  limit.setUTCMonth(limit.getUTCMonth() - retentionMonths);
  const cutoff = limit.toISOString();
  const db = suiviDb();
  let n = 0;
  const { data: reports } = await db.from('suivi_reports').select('id').lt('occurred_at', cutoff).limit(500);
  const ids = ((reports ?? []) as { id: string }[]).map((r) => r.id);
  if (ids.length > 0) {
    await db.from('suivi_actions').delete().in('report_id', ids);
    const { data: deleted } = await db.from('suivi_reports').delete().in('id', ids).select('id');
    n += Array.isArray(deleted) ? deleted.length : 0;
  }
  const { data: appts } = await db.from('suivi_appointments').delete().lt('starts_at', cutoff).select('id');
  n += Array.isArray(appts) ? appts.length : 0;
  const { data: hist } = await db.from('suivi_history').delete().lt('created_at', cutoff).select('id');
  n += Array.isArray(hist) ? hist.length : 0;
  return n;
}

/**
 * Politique à la suppression d'un compte (§18). Les tables `suivi_*` référencent
 * `auth.users` en cascade : la suppression du compte efface tout. En mode
 * `anonymize`, on conserve avant cela une trace statistique SANS identité
 * (ligne d'historique sans `user_id`).
 */
export async function applyDeletionPolicy(userId: string): Promise<void> {
  const settings = await getSettings();
  if (settings.deletion_policy !== 'anonymize') return;
  const db = suiviDb();
  const [{ data: appts }, { data: reports }] = await Promise.all([
    db.from('suivi_appointments').select('status, starts_at').eq('user_id', userId),
    db.from('suivi_reports').select('occurred_at').eq('user_id', userId),
  ]);
  const a = (appts ?? []) as { status: string; starts_at: string }[];
  const r = (reports ?? []) as { occurred_at: string }[];
  if (a.length === 0 && r.length === 0) return;
  await db.from('suivi_history').insert({
    user_id: null,
    kind: 'anonymized',
    payload: {
      appointments: a.length,
      done: a.filter((x) => x.status === 'done').length,
      no_show: a.filter((x) => x.status === 'no_show').length,
      reports: r.length,
      first: [...a.map((x) => x.starts_at), ...r.map((x) => x.occurred_at)].sort()[0] ?? null,
    },
  });
}
