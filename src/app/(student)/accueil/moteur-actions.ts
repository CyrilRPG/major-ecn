'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { getAccessInfo } from '@/lib/auth/access';
import { PEDAGO_ENGINE_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { getCandidateProfile, moteurDb, upsertCandidateProfile } from '@/lib/moteur/server/db';
import { refreshCandidate } from '@/lib/moteur/server/refresh';
import { todayKey, addDays } from '@/lib/suivi/format';

/**
 * Actions du tableau de bord liées au moteur pédagogique : affichage et
 * acquittement des alertes (pop-up unique par niveau, §44), choix
 * « Conserver » du planificateur ignoré (§31), date d'EVC du candidat (§50),
 * notifications (§45) et actualisation du moteur après affichage (§57).
 * Chaque écriture est bornée au candidat connecté.
 */
async function me() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Session expirée : reconnectez-vous.');
  if (profile.is_active === false) throw new Error('Compte désactivé.');
  if (profile.role === 'student' && getAccessInfo(profile).expired) throw new Error('Votre accès a expiré.');
  if (!moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED)) throw new Error('Module indisponible pour votre formule.');
  return user;
}

const Uuid = z.string().uuid();
type Ok = { ok: true } | { ok: false; error: string };
const fail = (e: unknown): { ok: false; error: string } => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });

/** Actualise le moteur (collecte, signaux, échéances, engagement) ; indique s'il faut recharger l'affichage. */
export async function refreshEngineAction(): Promise<{ ok: true; changed: boolean } | { ok: false; error: string }> {
  try {
    const user = await me();
    const r = await refreshCandidate(user.id);
    return { ok: true, changed: r.ran };
  } catch (e) {
    return fail(e);
  }
}

type EpisodeLite = { id: string; history: unknown[] | null; popup_levels: number[] | null; alert_displayed_at: string | null };
async function ownEpisode(userId: string, episodeId: string): Promise<EpisodeLite> {
  if (!Uuid.safeParse(episodeId).success) throw new Error('Alerte introuvable.');
  const { data } = await moteurDb().from('engagement_alert_episodes').select('id, history, popup_levels, alert_displayed_at').eq('id', episodeId).eq('user_id', userId).maybeSingle();
  if (!data) throw new Error('Alerte introuvable.');
  return data as EpisodeLite;
}

/** Alerte affichée (encart) ; `popupLevel` : pop-up montrée — elle ne réapparaîtra plus pour ce niveau. */
export async function alertDisplayedAction(episodeId: string, popupLevel?: number | null): Promise<Ok> {
  try {
    const user = await me();
    const ep = await ownEpisode(user.id, episodeId);
    const now = new Date().toISOString();
    const levels = Array.isArray(ep.popup_levels) ? ep.popup_levels : [];
    const popup = typeof popupLevel === 'number' && popupLevel >= 2 && popupLevel <= 3 && !levels.includes(popupLevel);
    if (!popup && ep.alert_displayed_at) return { ok: true };
    await moteurDb().from('engagement_alert_episodes').update({
      ...(ep.alert_displayed_at ? {} : { alert_displayed_at: now }),
      ...(popup ? { popup_levels: [...levels, popupLevel], popup_displayed_at: now } : {}),
      history: [...(ep.history ?? []), { at: now, what: popup ? `popup_niveau_${popupLevel}` : 'affichage' }],
    }).eq('id', ep.id).eq('user_id', user.id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** « J'ai compris » : l'encart passe en version compacte (non-harcèlement). */
export async function alertAckAction(episodeId: string): Promise<Ok> {
  try {
    const user = await me();
    const ep = await ownEpisode(user.id, episodeId);
    const now = new Date().toISOString();
    await moteurDb().from('engagement_alert_episodes').update({ alert_acknowledged_at: now, history: [...(ep.history ?? []), { at: now, what: 'acquittement' }] })
      .eq('id', ep.id).eq('user_id', user.id);
    revalidatePath('/accueil');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** §31 : « Conserver » mon planificateur tel quel — la proposition ne revient pas avant le délai de rappel. */
export async function plannerKeepAction(episodeId: string): Promise<Ok> {
  try {
    const user = await me();
    const ep = await ownEpisode(user.id, episodeId);
    const now = new Date().toISOString();
    const db = moteurDb();
    const { error } = await db.from('plan_profiles').update({ low_adherence_choice: 'conserver', low_adherence_choice_at: now }).eq('user_id', user.id);
    if (error) throw new Error(error.message);
    await db.from('engagement_alert_episodes').update({
      status: 'resolved', alert_resolved_at: now, resolution: 'choix_conserver', alert_acknowledged_at: now,
      history: [...(ep.history ?? []), { at: now, what: 'choix', choice: 'conserver' }],
    }).eq('id', ep.id).eq('user_id', user.id);
    revalidatePath('/accueil');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Date d'EVC renseignée par le candidat (prioritaire) ; priorités et réactivations recalculées. */
export async function examDateAction(date: string): Promise<Ok> {
  try {
    const user = await me();
    const today = todayKey();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today || date > addDays(today, 730)) return { ok: false, error: 'Date invalide : choisissez une date à venir.' };
    // Recalcul complet seulement si la date change réellement (pas de recalcul à chaque clic).
    const cur = await getCandidateProfile(user.id);
    if (cur?.exam_date === date && cur.exam_date_source === 'candidat') return { ok: true };
    await upsertCandidateProfile(user.id, { exam_date: date, exam_date_source: 'candidat' });
    await refreshCandidate(user.id, { force: true, wait: true });
    revalidatePath('/accueil');
    revalidatePath('/mes-priorites');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Invitation à renseigner la date d'EVC masquée (non bloquante). */
export async function dismissExamInviteAction(): Promise<Ok> {
  try {
    const user = await me();
    await upsertCandidateProfile(user.id, { exam_invite_dismissed_at: new Date().toISOString() });
    revalidatePath('/accueil');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Notification fermée par le candidat. */
export async function dismissNotificationAction(id: string): Promise<Ok> {
  try {
    const user = await me();
    if (!Uuid.safeParse(id).success) return { ok: false, error: 'Notification introuvable.' };
    await moteurDb().from('pedago_notifications').update({ dismissed_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Notifications affichées (traçabilité, §54). */
export async function notificationsSeenAction(ids: string[]): Promise<Ok> {
  try {
    const user = await me();
    const valid = (Array.isArray(ids) ? ids : []).filter((x) => Uuid.safeParse(x).success).slice(0, 20);
    if (valid.length === 0) return { ok: true };
    await moteurDb().from('pedago_notifications').update({ displayed_at: new Date().toISOString() }).eq('user_id', user.id).in('id', valid).is('displayed_at', null);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
