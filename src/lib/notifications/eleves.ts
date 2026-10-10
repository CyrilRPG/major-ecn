import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { notifier } from './centre';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { getAccessInfo } from '@/lib/auth/access';
import { parseScope } from '@/lib/auth/permissions';
import {
  evenementVisiblePourEleve, heureCourte, libelleJourLong, type EvenementPlateformeBrut,
} from '@/lib/agenda/planning';

/**
 * Notifications de l'espace élève (cloche de la barre du haut, web et app).
 *
 * Stockage : `pedago_notifications` (une ligne par élève et par `group_key`,
 * index unique) — la même table que les notifications du moteur pédagogique,
 * affichées aussi dans « Ma journée ». Une nouvelle notification sur le même
 * évènement REMPLACE la précédente (re-signalée, non lue) au lieu de s'empiler.
 */

export type GenreNotifAgenda = 'seance' | 'lien';

type EvenementNotifiable = EvenementPlateformeBrut;

/** Élèves actifs, accès non expiré, qui voient cette séance dans leur agenda. */
export async function elevesConcernes(e: EvenementNotifiable): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = createAdminClient() as any;
  type Ligne = { id: string; is_active: boolean | null; access_end: string | null; permission_scope: unknown; evc_session: unknown };
  const lignes = await fetchAllRows<Ligne>((from, to) => a.from('profiles')
    .select('id, is_active, access_end, permission_scope, evc_session:evc_sessions(default_access_end)')
    .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID)
    .order('id').range(from, to));
  return lignes
    .filter((l) => l.is_active !== false)
    .filter((l) => {
      const session = Array.isArray(l.evc_session) ? l.evc_session[0] : l.evc_session;
      return !getAccessInfo({ role: 'student', access_end: l.access_end, evc_session: session as { default_access_end: string } | null }).expired;
    })
    .filter((l) => evenementVisiblePourEleve(e, parseScope(l.permission_scope)))
    .map((l) => l.id);
}

function texteNotif(e: EvenementNotifiable, genre: GenreNotifAgenda, nouvelle: boolean) {
  const debut = heureCourte(e.start_time);
  const fin = heureCourte(e.end_time);
  const quand = `${libelleJourLong(e.date)}${debut ? ` · ${debut}${fin ? ` – ${fin}` : ''}` : ''}`;
  if (genre === 'lien') {
    return {
      title: `Lien de la visio disponible : ${e.title}`,
      body: `${quand}. Le lien de connexion est disponible dans votre agenda : émargez pour rejoindre la séance.`,
      cta_label: 'Ouvrir la séance',
    };
  }
  return {
    title: `${nouvelle ? 'Nouvelle séance' : 'Séance mise à jour'} : ${e.title}`,
    body: `${quand}. ${nouvelle ? 'Ajoutée à votre agenda.' : 'Les informations de la séance ont changé, consultez votre agenda.'}`,
    cta_label: 'Voir dans l’agenda',
  };
}

/**
 * Notifie les élèves concernés par une séance. Renvoie le nombre d'élèves
 * notifiés. Écritures par lots (upsert sur user_id + group_key).
 */
export async function notifierSeance(e: EvenementNotifiable, genre: GenreNotifAgenda, opts: { nouvelle?: boolean } = {}): Promise<number> {
  const ids = await elevesConcernes(e);
  if (ids.length === 0) return 0;
  const t = texteNotif(e, genre, !!opts.nouvelle);
  // Centre de notifications : préférences de chaque élève (application /
  // e-mail immédiat ou récapitulatif), catégories « Modifications de
  // l'agenda » et « Nouveaux liens Zoom ».
  const horodatage = Date.now().toString(36);
  await notifier(ids.map((userId) => ({
    userId,
    categorie: genre === 'lien' ? 'zoom' as const : 'schedule' as const,
    kind: genre === 'lien' ? 'agenda_lien' : 'agenda_seance',
    groupKey: `agenda:${e.id}:${genre}`,
    titre: t.title,
    corps: t.body,
    ctaLabel: t.cta_label,
    ctaHref: `/agenda?seance=${e.id}`,
    payload: { event_id: e.id, date: e.date },
    cleEmail: `agenda:${e.id}:${genre}:${userId}:${horodatage}`,
  })));
  return ids.length;
}
