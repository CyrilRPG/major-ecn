import 'server-only';
import type { PermissionScope } from '@/types/domain';
import type { createClient } from '@/lib/supabase/server';
import {
  evenementVisiblePourEleve, fenetrePlanning, versEvenementsPlanning,
  type EvenementPersoBrut, type EvenementPlanning, type EvenementPlateformeBrut, type InstantParis,
} from './planning';

export type DonneesPlanning = {
  evenements: EvenementPlanning[];
  /** Date et heure de Paris au moment du rendu (base de tous les calculs client). */
  present: InstantParis;
  /** Dernier jour de l'horizon (aujourd'hui + 30). */
  fin: string;
};

type Client = Awaited<ReturnType<typeof createClient>>;

type Requete<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/**
 * Charge le planning de l'élève : UN aller-retour par source, en parallèle —
 * `platform_events` (séances en direct, filtrées comme la page /agenda) et
 * `user_agenda_events` (évènements personnels, RLS par utilisateur). Fenêtre :
 * du 1er du mois courant à aujourd'hui + 30 jours (quelques dizaines de lignes,
 * loin du plafond de 1 000 de PostgREST).
 *
 * Les vidéos « séance à venir » (`videos.live_at`) ne sont PAS une source : la
 * séance en direct correspondante est déjà programmée dans l'agenda de la
 * plateforme (horaires, intervenant, lien Zoom) — les deux feraient doublon —
 * et `live_at` ne porte ni fin ni lien.
 *
 * Une source en erreur n'empêche pas l'autre de s'afficher.
 */
export async function chargerPlanning(
  supabase: Client,
  userId: string,
  scope: PermissionScope,
  maintenant: Date = new Date(),
): Promise<DonneesPlanning> {
  const { debut, fin, aujourdHui } = fenetrePlanning(maintenant);
  // Le client typé ne connaît pas ces tables (hors types générés) : cast ciblé.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [plateforme, perso] = await Promise.all([
    (db.from('platform_events')
      .select('id, title, date, start_time, end_time, college, intervenant, zoom_url, notes, required_offers, scope_type, scope_colleges, voies')
      .gte('date', debut).lte('date', fin)
      .order('date').order('start_time') as Requete<EvenementPlateformeBrut>),
    (db.from('user_agenda_events')
      .select('id, title, date, start_time, end_time, category, notes')
      .eq('user_id', userId)
      .gte('date', debut).lte('date', fin)
      .order('date').order('start_time') as Requete<EvenementPersoBrut>),
  ]);

  if (plateforme.error) console.error('[planning] platform_events', plateforme.error.message);
  if (perso.error) console.error('[planning] user_agenda_events', perso.error.message);

  const seances = (plateforme.data ?? []).filter((e) => evenementVisiblePourEleve(e, scope));
  return {
    evenements: versEvenementsPlanning(seances, perso.data ?? []),
    present: aujourdHui,
    fin,
  };
}
