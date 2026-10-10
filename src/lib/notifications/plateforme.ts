import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { notifier as notifierCockpit, type NotifCockpit } from '@/lib/cockpit/server/base';
import { notify as notifierPedago } from '@/lib/moteur/server/db';

/**
 * Façade unique des notifications DANS la plateforme (refonte du 09/10/2026).
 *
 *  - Équipe (administrateurs, professeurs) : cloche de l'en-tête de
 *    l'administration (`cockpit_notifications`).
 *  - Élèves : cloche de l'espace élève, web et application
 *    (`pedago_notifications`, via `notify` du moteur pédagogique).
 *
 * Ces fonctions ne lèvent JAMAIS : une notification ratée ne doit pas faire
 * échouer une réservation, un paiement ou une réponse. Les e-mails existants
 * restent envoyés par leurs modules respectifs.
 */

export type GenreEquipe = NotifCockpit['genre'];

type Destinataires =
  /** Tous les administrateurs actifs de Major ECN. */
  | 'admins'
  /** Des comptes précis (administrateurs ou professeurs). */
  | string[]
  /** Des comptes précis, et à défaut (liste vide) les administrateurs. */
  | { comptes: (string | null | undefined)[]; sinonAdmins: true };

let cacheAdmins: { ids: string[]; at: number } | null = null;

/** Administrateurs actifs (cache 5 min par instance). */
export async function idsAdministrateurs(): Promise<string[]> {
  if (cacheAdmins && Date.now() - cacheAdmins.at < 300_000) return cacheAdmins.ids;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = createAdminClient() as any;
  const { data } = await d.from('profiles').select('id, is_active').eq('role', 'admin').eq('faculte_id', EDN_FACULTE_ID).limit(200);
  const ids = ((data ?? []) as { id: string; is_active: boolean | null }[]).filter((p) => p.is_active !== false).map((p) => p.id);
  cacheAdmins = { ids, at: Date.now() };
  return ids;
}

async function resoudre(a: Destinataires): Promise<string[]> {
  if (a === 'admins') return idsAdministrateurs();
  if (Array.isArray(a)) return [...new Set(a.filter(Boolean))];
  const comptes = [...new Set(a.comptes.filter((x): x is string => !!x))];
  return comptes.length > 0 ? comptes : idsAdministrateurs();
}

export async function notifierEquipe(o: {
  a: Destinataires;
  genre: GenreEquipe;
  titre: string;
  corps?: string | null;
  /** Lien interne (ex. `/admin/suivi/candidats/<id>`). */
  lien?: string | null;
  /** Clé de regroupement : les répétitions d'une même clé incrémentent un compteur. */
  cle: string;
  /** Compte à ne pas notifier (l'auteur de l'action). */
  sauf?: string | null;
}): Promise<void> {
  try {
    const ids = (await resoudre(o.a)).filter((id) => id !== o.sauf);
    if (ids.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = createAdminClient() as any;
    await Promise.all(ids.map((user_id) => notifierCockpit(d, {
      user_id, genre: o.genre, titre: o.titre.slice(0, 300), corps: o.corps?.slice(0, 500) ?? null, lien: o.lien ?? null, group_key: o.cle,
    })));
  } catch (err) {
    console.error('[notifications] équipe', o.cle, err instanceof Error ? err.message : err);
  }
}

export async function notifierEleve(userId: string | null | undefined, o: {
  /** Type technique (préfixe lisible par le centre de préférences : `suivi_`, `forum_`, `examen_`…). */
  kind: string;
  titre: string;
  corps?: string | null;
  lien?: string | null;
  libelleLien?: string | null;
  cle: string;
}): Promise<void> {
  if (!userId) return;
  try {
    await notifierPedago(userId, {
      kind: o.kind, groupKey: o.cle, title: o.titre.slice(0, 300), body: o.corps?.slice(0, 500) ?? null,
      ctaHref: o.lien ?? null, ctaLabel: o.libelleLien ?? (o.lien ? 'Voir' : null),
    });
  } catch (err) {
    console.error('[notifications] élève', o.cle, err instanceof Error ? err.message : err);
  }
}

/** « 14 oct. à 15:00 », heure de Paris. */
export function quandParis(iso: string): string {
  const d = new Date(iso);
  const jour = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' });
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  return `${jour} à ${heure}`;
}
