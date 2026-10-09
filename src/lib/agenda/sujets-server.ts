import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { filtrerReplays, type ContexteEleve } from '@/lib/videos/replays';
import { aUneVideo, erreurColonneLiveAt, seanceMontrable } from '@/lib/videos/a-venir';
import { ajouterJours, instantParis } from './planning';
import { lienSeance, rattacher, type EvenementRattachable, type SujetAgenda } from './sujets';

type LigneVideo = Parameters<typeof filtrerReplays>[0][number] & {
  cours_id: string;
  cours?: {
    id: string;
    matiere_id: string;
    access_type?: string | null;
    matieres?: { nom?: string | null; parent_matiere_id?: string | null; access_type?: string | null } | null;
  } | null;
};

/**
 * Séances de la bibliothèque vidéo datées (`live_at`) entre `debut` et `fin`
 * (dates de Paris), telles que CET élève peut les ouvrir : mêmes gardes que les
 * pages `cours/[cours]/video` et `seance-approfondie` — collège et item (sauf
 * autorisation nominative), audience de la vidéo et de chaque support
 * (`filtrerReplays`), séance montrable (une vidéo, ou au moins un document).
 *
 * Seuls le titre, la date et le nombre de documents sortent d'ici : les
 * documents eux-mêmes ne s'ouvrent que sur la page de la séance (filigrane).
 */
export async function chargerSujetsAgenda(
  supabase: SupabaseClient,
  ctx: ContexteEleve,
  fenetre: { debut: string; fin: string },
  evenements: readonly EvenementRattachable[],
): Promise<SujetAgenda[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (supabase as any)
    .from('videos')
    .select('id, titre, type, rubrique, order_index, bunny_disponible, storage_path, live_at, serie_id, unlock_direct, voies, offers, denied_user_ids, allowed_user_ids, cours_id, video_supports(id, titre, order_index, voies, offers), cours(id, matiere_id, access_type, matieres(nom, parent_matiere_id, access_type))')
    .not('live_at', 'is', null)
    // Marge d'un jour de part et d'autre : la date retenue est celle de Paris.
    .gte('live_at', ajouterJours(fenetre.debut, -1))
    .lte('live_at', ajouterJours(fenetre.fin, 2)) as { data: LigneVideo[] | null; error: { message?: string } | null };
  if (res.error) {
    if (!erreurColonneLiveAt(res.error)) console.error('[agenda] séances datées illisibles', res.error.message);
    return [];
  }

  const parCours = new Map<string, LigneVideo[]>();
  for (const v of res.data ?? []) (parCours.get(v.cours_id) ?? parCours.set(v.cours_id, []).get(v.cours_id)!).push(v);

  const sujets: SujetAgenda[] = [];
  for (const [coursId, lignes] of parCours) {
    const cours = lignes[0].cours;
    if (!cours) continue;
    const replays = filtrerReplays(lignes, ctx);
    if (!ctx.isAdmin && !replays.autoriseParVideo) {
      const collegeOk = canAccessCollege(ctx.scope, cours.matiere_id, cours.matieres?.access_type === 'specific' ? 'specific' : 'all');
      const itemOk = canAccessCours(ctx.scope, cours.matiere_id, cours.id, cours.access_type === 'specific' ? 'specific' : 'all');
      if (!collegeOk || !itemOk) continue;
    }
    const collegeIds = [cours.matiere_id, cours.matieres?.parent_matiere_id].filter((x): x is string => !!x);
    for (const v of [...replays.cours, ...replays.seance_approfondie]) {
      if (!v.live_at || !seanceMontrable(v, v.supports.length)) continue;
      const { date, heure } = instantParis(new Date(v.live_at));
      if (date < fenetre.debut || date > fenetre.fin) continue;
      sujets.push({
        id: v.id,
        titre: v.titre,
        specialite: cours.matieres?.nom ?? null,
        date,
        heure,
        href: lienSeance(coursId, v.type, v.id),
        etat: aUneVideo(v) ? 'replay' : 'sujet',
        nbDocuments: v.supports.length,
        evenementId: rattacher({ date, heure, collegeIds }, evenements),
      });
    }
  }
  return sujets.sort((a, b) => a.date.localeCompare(b.date) || a.heure.localeCompare(b.heure));
}
