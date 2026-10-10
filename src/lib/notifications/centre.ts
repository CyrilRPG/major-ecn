import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  canauxPour, lirePreferences, type CategorieNotif, type Preferences,
} from './categories';

/**
 * Centre de notifications — point d'entrée UNIQUE de tout envoi aux élèves
 * (agenda, nouveaux contenus, Échanges, annonces). Applique les préférences
 * de chaque destinataire :
 *  · application : une ligne dans `pedago_notifications` (la cloche ; une
 *    nouvelle notification sur le même sujet REMPLACE la précédente — même
 *    `group_key` — au lieu de s'empiler, et peut cumuler un compteur) ;
 *  · e-mail : une ligne dans `notification_emails` (immédiat ou récapitulatif
 *    du soir), envoyée par le cron `/api/cron/notifications`.
 *
 * Une notification « prioritaire » (annonce Important de Major ECN) passe
 * outre les préférences de catégorie (cf. `canauxPour`).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createAdminClient() as any;

export type NotifLigne = {
  userId: string;
  categorie: CategorieNotif | null;
  /** Clé de regroupement : une seule notification visible par clé et par élève. */
  groupKey: string;
  kind: string;
  titre: string;
  corps?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  payload?: Record<string, unknown>;
  /** Cumul : ajoute `count` au compteur de la notification non lue existante ; `titre(n)` réécrit le titre. */
  cumul?: { count: number; titre: (total: number) => string; corps?: (total: number) => string | null };
  prioritaire?: boolean;
  /** Clé d'idempotence de l'e-mail (défaut : groupKey + jour). */
  cleEmail?: string;
};

export async function preferencesDe(userIds: string[]): Promise<Map<string, Preferences>> {
  const out = new Map<string, Preferences>();
  const ids = [...new Set(userIds)];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await db().from('notification_preferences')
      .select('user_id, app_actif, email_actif, prefs').in('user_id', ids.slice(i, i + 200));
    if (error) throw new Error(`Préférences illisibles : ${error.message}`);
    for (const r of (data ?? []) as { user_id: string; app_actif: boolean | null; email_actif: boolean | null; prefs: unknown }[]) out.set(r.user_id, lirePreferences(r));
  }
  for (const id of ids) if (!out.has(id)) out.set(id, lirePreferences(null));
  return out;
}

function jourParis(d = new Date()): string {
  return d.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
}

export type BilanEnvoi = { app: number; emails: number; ignores: number };

/**
 * Envoie un lot de notifications (écritures par lots de 500). Ne lève jamais
 * pour un destinataire isolé : un échec de la cloche ou de la file d'e-mails
 * est remonté dans le bilan et l'appelant décide (les admins voient l'erreur,
 * les crons la journalisent).
 */
export async function notifier(lignes: NotifLigne[]): Promise<BilanEnvoi> {
  if (lignes.length === 0) return { app: 0, emails: 0, ignores: 0 };
  const prefs = await preferencesDe(lignes.map((l) => l.userId));
  const maintenant = new Date().toISOString();

  // Cumuls : compteur actuel des notifications NON LUES de même clé.
  const cumuls = lignes.filter((l) => l.cumul);
  const existants = new Map<string, number>();
  if (cumuls.length > 0) {
    const cles = [...new Set(cumuls.map((l) => l.groupKey))];
    const users = [...new Set(cumuls.map((l) => l.userId))];
    for (let i = 0; i < users.length; i += 200) {
      const { data } = await db().from('pedago_notifications')
        .select('user_id, group_key, count, displayed_at, dismissed_at')
        .in('user_id', users.slice(i, i + 200)).in('group_key', cles.slice(0, 200));
      for (const r of (data ?? []) as { user_id: string; group_key: string; count: number | null; displayed_at: string | null; dismissed_at: string | null }[]) {
        if (!r.displayed_at && !r.dismissed_at) existants.set(`${r.user_id}|${r.group_key}`, r.count ?? 0);
      }
    }
  }

  const app: Record<string, unknown>[] = [];
  const emails: Record<string, unknown>[] = [];
  let ignores = 0;
  for (const l of lignes) {
    const p = prefs.get(l.userId)!;
    const canaux = l.categorie
      ? canauxPour(p, l.categorie, { prioritaire: l.prioritaire })
      : { app: true, email: false, mode: 'immediat' as const };
    if (!canaux.app && !canaux.email) { ignores += 1; continue; }
    let titre = l.titre;
    let corps = l.corps ?? null;
    let count = 1;
    if (l.cumul) {
      count = (existants.get(`${l.userId}|${l.groupKey}`) ?? 0) + l.cumul.count;
      titre = l.cumul.titre(count);
      corps = l.cumul.corps ? l.cumul.corps(count) : corps;
    }
    if (canaux.app) {
      app.push({
        user_id: l.userId,
        kind: l.kind,
        group_key: l.groupKey,
        title: titre,
        body: corps,
        cta_label: l.ctaLabel ?? null,
        cta_href: l.ctaHref ?? null,
        channel: 'dashboard',
        payload: { ...(l.payload ?? {}), categorie: l.categorie, prioritaire: !!l.prioritaire },
        count,
        updated_at: maintenant,
        displayed_at: null,
        dismissed_at: null,
      });
    }
    if (canaux.email) {
      emails.push({
        user_id: l.userId,
        categorie: l.categorie ?? 'annonces',
        cle: l.cleEmail ?? `${l.groupKey}:${l.userId}:${jourParis()}:${count}`,
        titre,
        corps,
        lien: l.ctaHref ?? null,
        mode: l.prioritaire ? 'prioritaire' : canaux.mode,
      });
    }
  }

  for (let i = 0; i < app.length; i += 500) {
    const { error } = await db().from('pedago_notifications').upsert(app.slice(i, i + 500), { onConflict: 'user_id,group_key' });
    if (error) throw new Error(`Notifications non enregistrées : ${error.message}`);
  }
  for (let i = 0; i < emails.length; i += 500) {
    const { error } = await db().from('notification_emails').upsert(emails.slice(i, i + 500), { onConflict: 'cle', ignoreDuplicates: true });
    if (error) throw new Error(`E-mails non mis en file : ${error.message}`);
  }
  return { app: app.length, emails: emails.length, ignores };
}
