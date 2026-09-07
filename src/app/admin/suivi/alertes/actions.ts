'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSuiviAction } from '@/lib/suivi/roles';
import { getAlert, suiviDb } from '@/lib/suivi/db';
import { fromLocalInputValue, isoWeekToMonday, isValidDayKey, zonedToUtc } from '@/lib/suivi/format';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });
const revalidate = () => revalidatePath('/admin/suivi', 'layout');

/**
 * Alertes administrateur (§4). Quatre façons de fixer l'échéance :
 *  - `date`   : jour + heure précis ;
 *  - `week`   : semaine ISO (lundi 09:00) ;
 *  - `before` : X jours / semaines avant une échéance (à 09:00) ;
 *  - `custom` : date et heure libres.
 */
const AlertSchema = z.object({
  title: z.string().trim().min(2, 'Titre requis').max(160),
  note: z.string().max(4000).default(''),
  kind: z.enum(['date', 'week', 'before', 'custom']),
  date: z.string().optional(),
  time: z.string().optional(),
  week: z.string().optional(),
  deadline: z.string().optional(),
  before_value: z.number().int().min(1).max(365).optional(),
  before_unit: z.enum(['days', 'weeks']).optional(),
  custom: z.string().optional(),
  campaign_id: z.string().nullable().default(null).transform((v) => (v ? v : null)),
  recipient_email: z.string().trim().max(200).nullable().default(null).transform((v) => (v ? v : null)),
  owner_id: z.string().nullable().default(null).transform((v) => (v ? v : null)),
});
export type AlertInput = z.input<typeof AlertSchema>;

function computeDueAt(p: z.infer<typeof AlertSchema>): string | null {
  switch (p.kind) {
    case 'date': {
      if (!isValidDayKey(p.date)) return null;
      return zonedToUtc(p.date, /^\d{2}:\d{2}$/.test(p.time ?? '') ? p.time! : '09:00').toISOString();
    }
    case 'week': {
      const m = /^(\d{4})-W(\d{2})$/.exec(p.week ?? '');
      if (!m) return null;
      return zonedToUtc(isoWeekToMonday(Number(m[1]), Number(m[2])), '09:00').toISOString();
    }
    case 'before': {
      if (!isValidDayKey(p.deadline) || !p.before_value || !p.before_unit) return null;
      const days = p.before_unit === 'weeks' ? p.before_value * 7 : p.before_value;
      const [y, mo, d] = p.deadline.split('-').map(Number);
      const t = new Date(Date.UTC(y, mo - 1, d - days));
      const key = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
      return zonedToUtc(key, '09:00').toISOString();
    }
    case 'custom':
      return p.custom ? fromLocalInputValue(p.custom) : null;
  }
}

export async function createAlert(input: unknown): Promise<Ok<{ id: string }> | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const parsed = AlertSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const due = computeDueAt(parsed.data);
    if (!due) return { ok: false, error: 'Échéance invalide.' };
    if (parsed.data.recipient_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.recipient_email)) return { ok: false, error: 'Adresse email du responsable invalide.' };
    const { data, error } = await suiviDb().from('suivi_alerts').insert({
      title: parsed.data.title, note: parsed.data.note, due_at: due, campaign_id: parsed.data.campaign_id,
      recipient_email: parsed.data.recipient_email, owner_id: parsed.data.owner_id, created_by: profile.id,
    }).select('id').single();
    if (error || !data) return { ok: false, error: error?.message ?? 'Création impossible' };
    revalidate();
    return { ok: true, id: (data as { id: string }).id };
  } catch (e) { return fail(e); }
}

/** Report : nouvelle échéance, statut « reportée », et l'email repartira à la nouvelle date. */
export async function postponeAlert(id: string, localDateTime: string): Promise<Ok | Err> {
  try {
    await requireSuiviAction('manage');
    const due = fromLocalInputValue(localDateTime);
    if (!due) return { ok: false, error: 'Nouvelle échéance invalide.' };
    const { error } = await suiviDb().from('suivi_alerts').update({ due_at: due, status: 'postponed', emailed_at: null }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function setAlertStatus(id: string, status: 'open' | 'done' | 'closed'): Promise<Ok | Err> {
  try {
    await requireSuiviAction('manage');
    if (!(await getAlert(id))) return { ok: false, error: 'Alerte introuvable' };
    const { error } = await suiviDb().from('suivi_alerts').update({ status }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function deleteAlert(id: string): Promise<Ok | Err> {
  try {
    await requireSuiviAction('manage');
    const { error } = await suiviDb().from('suivi_alerts').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
