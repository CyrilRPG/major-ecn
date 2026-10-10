/**
 * Rappels des tâches Post-it (§45) — balayage exécuté par le cron
 * /api/cron/postits (toutes les 5 minutes). Reçoit le client SERVICE.
 *
 *  · rappels possibles : à l'heure, 15 min avant, 1 h avant, la veille (18 h) —
 *    seulement pour une tâche datée ET horodatée, non faite, dans l'agenda ;
 *  · préférences : l'élève coupe ses rappels Post-it (postit_preferences)
 *    SANS toucher aux notifications de cours / Zoom ; l'interrupteur général
 *    « sur l'application » du centre de notifications (notification_preferences
 *    .app_actif) les coupe aussi ;
 *  · idempotence : un marqueur (tâche, rappel, échéance) par envoi ; un report
 *    de la tâche crée une nouvelle échéance, donc de nouveaux rappels ; la
 *    notification de la cloche est en plus regroupée par clé (`group_key`).
 *
 * Écrit UNIQUEMENT dans `pedago_notifications` (la cloche) et
 * `postit_rappels_envoyes` : jamais dans les tables du moteur (§48).
 */
import { fetchAllRows } from '../supabase/fetch-all-pure';
import { cleEcheance, decalerDate, libelleEcheance, rappelsDus, rappelsValides, type TacheARappeler } from './agenda';
import { LIBELLE_RAPPEL, lienPostit, type Statut } from './regles';
import { purgerCorbeille, type Db } from './depot';

type Ligne = {
  id: string;
  user_id: string;
  postit_id: string;
  texte: string;
  fait: boolean;
  echeance_date: string | null;
  echeance_heure: string | null;
  rappels: string[] | null;
  dans_agenda: boolean;
  echeance_modifiee_le: string;
  postits: { titre: string; statut: Statut; origine_cle: string } | null;
};

export type BilanRappels = { candidats: number; envoyes: number; coupes: number; purges: number };

function jourParis(d: Date): string {
  return d.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
}

/**
 * `opts.userIds` borne le balayage (et la purge) à quelques comptes : réservé
 * à la recette de bout en bout, qui simule un instant futur sans jamais
 * toucher aux rappels des vrais élèves.
 */
export async function balayerPostits(admin: Db, maintenant = new Date(), opts: { userIds?: string[] } = {}): Promise<BilanRappels> {
  const aujourdHui = jourParis(maintenant);
  const borne = (q: any) => (opts.userIds ? q.in('user_id', opts.userIds) : q); // eslint-disable-line @typescript-eslint/no-explicit-any
  // Fenêtre : la veille (retard toléré de 2 h) → après-demain (rappel « la veille »).
  const lignes = await fetchAllRows<Ligne>((from, to) => borne(admin.from('postit_taches')
    .select('id, user_id, postit_id, texte, fait, echeance_date, echeance_heure, rappels, dans_agenda, echeance_modifiee_le, postits!inner(titre, statut, origine_cle)'))
    .eq('fait', false)
    .eq('dans_agenda', true)
    .neq('rappels', '{}')
    .not('echeance_heure', 'is', null)
    .gte('echeance_date', decalerDate(aujourdHui, -1))
    .lte('echeance_date', decalerDate(aujourdHui, 2))
    .order('id')
    .range(from, to));

  const taches: (TacheARappeler & { ligne: Ligne })[] = lignes
    .filter((l) => l.postits)
    .map((l) => ({
      id: l.id,
      fait: l.fait,
      date: l.echeance_date ? l.echeance_date.slice(0, 10) : null,
      heure: l.echeance_heure ? l.echeance_heure.slice(0, 5) : null,
      rappels: rappelsValides(l.rappels),
      dansAgenda: l.dans_agenda,
      statutPostit: l.postits!.statut,
      echeanceModifieeLe: l.echeance_modifiee_le,
      ligne: l,
    }));

  const deja = new Set<string>();
  const ids = taches.map((t) => t.id);
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await admin.from('postit_rappels_envoyes').select('tache_id, rappel, echeance').in('tache_id', ids.slice(i, i + 200));
    if (error) throw new Error(`Marqueurs de rappels illisibles : ${error.message}`);
    for (const r of (data ?? []) as { tache_id: string; rappel: string; echeance: string }[]) deja.add(`${r.tache_id}|${r.rappel}|${r.echeance}`);
  }

  const dus = rappelsDus(taches, maintenant, deja);
  let purges = 0;
  for (const u of opts.userIds ?? [undefined]) purges += await purgerCorbeille(admin, maintenant, u).catch(() => 0);
  if (dus.length === 0) return { candidats: taches.length, envoyes: 0, coupes: 0, purges };

  // Préférences : rappels Post-it coupés, ou toute l'application coupée.
  const users = [...new Set(dus.map((d) => taches.find((t) => t.id === d.tacheId)!.ligne.user_id))];
  const coupes = new Set<string>();
  for (let i = 0; i < users.length; i += 200) {
    const tranche = users.slice(i, i + 200);
    const [pp, np] = await Promise.all([
      admin.from('postit_preferences').select('user_id, rappels_actifs').in('user_id', tranche),
      admin.from('notification_preferences').select('user_id, app_actif').in('user_id', tranche),
    ]);
    for (const r of (pp.data ?? []) as { user_id: string; rappels_actifs: boolean }[]) if (r.rappels_actifs === false) coupes.add(r.user_id);
    // Table du centre de notifications : absente ou illisible → pas de coupure.
    for (const r of (np.error ? [] : np.data ?? []) as { user_id: string; app_actif: boolean }[]) if (r.app_actif === false) coupes.add(r.user_id);
  }

  const horodatage = maintenant.toISOString();
  const notifications: Record<string, unknown>[] = [];
  const marqueurs: { tache_id: string; rappel: string; echeance: string }[] = [];
  let nbCoupes = 0;
  for (const d of dus) {
    const t = taches.find((x) => x.id === d.tacheId)!;
    const l = t.ligne;
    marqueurs.push({ tache_id: d.tacheId, rappel: d.rappel, echeance: d.echeance });
    if (coupes.has(l.user_id)) { nbCoupes += 1; continue; }
    const titrePostit = l.postits!.titre?.trim() || 'Post-it';
    notifications.push({
      user_id: l.user_id,
      kind: 'postit_rappel',
      group_key: `postit:${d.tacheId}:${d.rappel}:${cleEcheance(t.date!, t.heure!)}`,
      title: `Rappel : ${l.texte.slice(0, 140)}`,
      body: `${libelleEcheance(t.date, t.heure)} (${LIBELLE_RAPPEL[d.rappel].toLowerCase()}). Tâche de votre Post-it « ${titrePostit.slice(0, 80)} ».`,
      cta_label: 'Ouvrir le Post-it',
      cta_href: lienPostit(l.postits!.origine_cle, l.postit_id) ?? `/mes-post-it?postit=${l.postit_id}`,
      channel: 'dashboard',
      // `categorie` nulle : la cloche l'affiche toujours ; la coupure propre
      // aux rappels Post-it est appliquée ci-dessus (postit_preferences).
      payload: { postit_id: l.postit_id, tache_id: d.tacheId, rappel: d.rappel, categorie: null },
      count: 1,
      updated_at: horodatage,
      displayed_at: null,
      dismissed_at: null,
    });
  }

  // Notifications d'abord, marqueurs ensuite : un échec entre les deux
  // ré-enverra au passage suivant (même clé de regroupement, pas de doublon
  // dans la cloche) plutôt que de perdre le rappel.
  for (let i = 0; i < notifications.length; i += 500) {
    const { error } = await admin.from('pedago_notifications').upsert(notifications.slice(i, i + 500), { onConflict: 'user_id,group_key' });
    if (error) throw new Error(`Rappels non enregistrés : ${error.message}`);
  }
  for (let i = 0; i < marqueurs.length; i += 500) {
    const { error } = await admin.from('postit_rappels_envoyes').upsert(marqueurs.slice(i, i + 500), { onConflict: 'tache_id,rappel,echeance', ignoreDuplicates: true });
    if (error) throw new Error(`Marqueurs de rappels non enregistrés : ${error.message}`);
  }
  return { candidats: taches.length, envoyes: notifications.length, coupes: nbCoupes, purges };
}
