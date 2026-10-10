import 'server-only';
import type { Parametres } from '../parametres';
import { journaliser, qdb, toutesLesLignes } from './base';

/**
 * Participations rapprochées du compte candidat (§4.1) :
 *   - direct : la feuille d'émargement de la séance Zoom (`session_presences`),
 *     signée par le candidat connecté avant d'ouvrir le lien ; seule donnée de
 *     participation disponible (aucune API Zoom n'est branchée) ;
 *   - replay : le premier visionnage au-delà du seuil (80 % par défaut),
 *     enregistré séance par séance dans `qualite_visionnages`.
 * L'administration corrige une correspondance erronée depuis la page Séances
 * (participation annulée ou ajoutée à la main, avec motif, journalisée).
 */

export async function synchroniserParticipations(params: Parametres, now = Date.now()): Promise<{ direct: number; replay: number }> {
  const db = qdb();
  const depuis = params.demarrage ?? new Date(now - 30 * 86_400_000).toISOString();
  const seances = await toutesLesLignes<{ id: string; event_id: string | null; video_id: string | null; fin_at: string | null }>((f, t) =>
    db.from('qualite_seances').select('id, event_id, video_id, fin_at').gte('fin_at', depuis).lte('fin_at', new Date(now).toISOString()).order('id').range(f, t));
  const seancesVideo = await toutesLesLignes<{ id: string; video_id: string }>((f, t) =>
    db.from('qualite_seances').select('id, video_id').not('video_id', 'is', null).order('id').range(f, t));
  const parEvent = new Map(seances.filter((s) => s.event_id).map((s) => [s.event_id as string, s]));
  const parVideo = new Map(seancesVideo.map((s) => [s.video_id, s.id]));

  let direct = 0; let replay = 0;
  const lignes: { seance_id: string; user_id: string; mode: 'direct' | 'replay'; source: string; participe_at: string | null }[] = [];

  if (parEvent.size) {
    const presences = await toutesLesLignes<{ user_id: string; event_id: string; marked_at: string | null }>((f, t) =>
      db.from('session_presences').select('user_id, event_id, marked_at').in('event_id', Array.from(parEvent.keys())).order('id').range(f, t));
    for (const p of presences) {
      const s = parEvent.get(p.event_id);
      if (!s || !p.user_id) continue;
      lignes.push({ seance_id: s.id, user_id: p.user_id, mode: 'direct', source: 'emargement', participe_at: s.fin_at ?? p.marked_at });
    }
  }
  const vus = await toutesLesLignes<{ user_id: string; video_id: string; seuil_atteint_at: string }>((f, t) =>
    db.from('qualite_visionnages').select('user_id, video_id, seuil_atteint_at').gte('seuil_atteint_at', depuis).order('user_id').order('video_id').range(f, t));
  for (const v of vus) {
    const seanceId = parVideo.get(v.video_id);
    if (!seanceId) continue;
    lignes.push({ seance_id: seanceId, user_id: v.user_id, mode: 'replay', source: 'visionnage', participe_at: v.seuil_atteint_at });
  }
  for (let i = 0; i < lignes.length; i += 500) {
    const lot = lignes.slice(i, i + 500);
    // ignoreDuplicates : une participation annulée par l'administration n'est jamais réactivée.
    const { data, error } = await db.from('qualite_participations').upsert(lot, { onConflict: 'seance_id,user_id,mode', ignoreDuplicates: true }).select('mode');
    if (error) { console.error('[qualite] participations :', error.message); continue; }
    for (const r of (data ?? []) as { mode: string }[]) { if (r.mode === 'direct') direct++; else replay++; }
  }
  return { direct, replay };
}

/** Enregistre l'avancement d'un replay (appelé par le lecteur, au plus une fois par tranche de 10 %). */
export async function enregistrerVisionnage(input: {
  userId: string; videoId: string; coursId: string | null; ratio: number; secondes: number; seuil: number;
}): Promise<void> {
  const db = qdb();
  const ratio = Math.max(0, Math.min(1, input.ratio));
  const { data: ex } = await db.from('qualite_visionnages').select('ratio_max, secondes_max, seuil_atteint_at')
    .eq('user_id', input.userId).eq('video_id', input.videoId).maybeSingle();
  const now = new Date().toISOString();
  const e = ex as { ratio_max: number; secondes_max: number; seuil_atteint_at: string | null } | null;
  const ratioMax = Math.max(e?.ratio_max ?? 0, ratio);
  const seuilAt = e?.seuil_atteint_at ?? (ratioMax >= input.seuil ? now : null);
  if (e && ratioMax <= e.ratio_max && seuilAt === e.seuil_atteint_at) return;
  await db.from('qualite_visionnages').upsert({
    user_id: input.userId, video_id: input.videoId, cours_id: input.coursId,
    ratio_max: ratioMax, secondes_max: Math.max(e?.secondes_max ?? 0, Math.round(input.secondes)),
    seuil_atteint_at: seuilAt, updated_at: now,
  }, { onConflict: 'user_id,video_id' });
}

/** Correction administrative d'une participation (§4.1). */
export async function corrigerParticipation(input: {
  seanceId: string; userId: string; mode: 'direct' | 'replay'; statut: 'valide' | 'annule'; motif: string; auteurId: string; auteurNom: string;
}): Promise<{ envoiNeutralise: boolean }> {
  const db = qdb();
  const now = new Date().toISOString();
  await db.from('qualite_participations').upsert({
    seance_id: input.seanceId, user_id: input.userId, mode: input.mode, source: 'manuel', statut: input.statut,
    motif: input.motif, corrige_par: input.auteurId, corrige_at: now, participe_at: now,
  }, { onConflict: 'seance_id,user_id,mode' });
  let envoiNeutralise = false;
  if (input.statut === 'annule') {
    // Plus aucune participation valide : le questionnaire non répondu est neutralisé.
    const { data: restantes } = await db.from('qualite_participations').select('id')
      .eq('seance_id', input.seanceId).eq('user_id', input.userId).eq('statut', 'valide');
    if (!restantes?.length) {
      const { data } = await db.from('qualite_envois').update({ statut: 'neutralise', neutralise_at: now, neutralise_motif: 'participation_annulee', updated_at: now })
        .eq('user_id', input.userId).eq('cle', `HOT:${input.seanceId}`).in('statut', ['programme', 'envoye', 'affiche', 'commence']).select('id');
      envoiNeutralise = !!data?.length;
    }
  }
  await journaliser({
    objet_type: 'participation', objet_id: input.seanceId, action: input.statut === 'annule' ? 'participation_annulee' : 'participation_ajoutee',
    user_id: input.userId, auteur_id: input.auteurId, auteur_nom: input.auteurNom, details: { mode: input.mode, motif: input.motif, envoiNeutralise },
  });
  return { envoiNeutralise };
}
