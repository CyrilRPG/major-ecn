import 'server-only';
import { instantParis } from '@/lib/evc-calendrier/dates';
import { cleEnseignant } from '../indicateurs';
import type { TypeSeance } from '../types';
import { journaliser, qdb, toutesLesLignes } from './base';

/**
 * Séances pédagogiques (§30 `learning_event_id`) : chaque séance en direct
 * (`platform_events`) et chaque replay (`videos` de type séance) reçoit un
 * identifiant stable dans `qualite_seances`. Un replay dont la date de diffusion
 * prévue (`videos.live_at`) tombe sur une séance de la même spécialité est
 * rattaché à cette séance : le direct et son replay partagent alors le même
 * identifiant, et une seule évaluation à chaud est demandée.
 *
 * Une séance dont l'administration a corrigé le rattachement (`lien = manuel`)
 * n'est plus jamais modifiée par la synchronisation.
 */

export type SeanceLigne = {
  id: string;
  event_id: string | null;
  video_id: string | null;
  titre: string;
  theme: string | null;
  type_seance: TypeSeance;
  enseignant_nom: string | null;
  enseignant_cle: string | null;
  enseignant_id: string | null;
  colleges: string[];
  specialite_label: string | null;
  voies: string[] | null;
  debut_at: string | null;
  fin_at: string | null;
  lien: 'auto' | 'manuel';
};

export function devinerTypeSeance(titre: string): TypeSeance {
  const t = titre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/methodo|redaction|qroc|mots[- ]cles/.test(t)) return 'methodologie';
  if (/\bdossier|\bdp\b|cas clinique/.test(t)) return 'dossier';
  if (/correction|annale|corrige/.test(t)) return 'correction';
  if (/\bqcm\b/.test(t)) return 'qcm';
  return 'cours';
}

type Evenement = {
  id: string; title: string; date: string; start_time: string | null; end_time: string | null;
  intervenant: string | null; college: string | null; scope_colleges: string[] | null; voies: string[] | null;
};
type Video = {
  id: string; titre: string; live_at: string | null; created_at: string; voies: string[] | null;
  cours: { titre: string | null; matiere_id: string | null; matieres: { nom: string | null; parent_matiere_id: string | null } | null } | null;
};

const hm = (t: string | null, defaut: string) => (t ? t.slice(0, 5) : defaut);

export async function synchroniserSeances(): Promise<{ crees: number; maj: number; lies: number }> {
  const db = qdb();
  const [evenements, videos, existantes, matieres] = await Promise.all([
    toutesLesLignes<Evenement>((f, t) => db.from('platform_events')
      .select('id, title, date, start_time, end_time, intervenant, college, scope_colleges, voies')
      .order('id').range(f, t)),
    toutesLesLignes<Video>((f, t) => db.from('videos')
      .select('id, titre, live_at, created_at, voies, cours(titre, matiere_id, matieres(nom, parent_matiere_id))')
      .eq('type', 'seance_approfondie').order('id').range(f, t)),
    toutesLesLignes<SeanceLigne>((f, t) => db.from('qualite_seances').select('*').order('id').range(f, t)),
    toutesLesLignes<{ id: string; nom: string }>((f, t) => db.from('matieres').select('id, nom').order('id').range(f, t)),
  ]);
  const nomMatiere = new Map(matieres.map((m) => [m.id, m.nom]));
  const parEvent = new Map(existantes.filter((s) => s.event_id).map((s) => [s.event_id as string, s]));
  const parVideo = new Map(existantes.filter((s) => s.video_id).map((s) => [s.video_id as string, s]));
  let crees = 0; let maj = 0; let lies = 0;

  // 1. Séances en direct.
  const instants = new Map<string, { debut: number; fin: number; colleges: string[] }>();
  for (const e of evenements) {
    const debut = instantParis(e.date, hm(e.start_time, '00:00'));
    const fin = instantParis(e.date, hm(e.end_time, hm(e.start_time, '23:59')));
    const colleges = (e.scope_colleges ?? []).filter(Boolean);
    instants.set(e.id, { debut, fin: fin > debut ? fin : debut + 2 * 3_600_000, colleges });
    const champs = {
      titre: e.title || 'Séance',
      theme: e.title || null,
      enseignant_nom: e.intervenant?.trim() || null,
      enseignant_cle: cleEnseignant(e.intervenant),
      colleges,
      specialite_label: e.college || colleges.map((c) => nomMatiere.get(c) ?? c).join(', ') || null,
      voies: e.voies ?? null,
      debut_at: new Date(debut).toISOString(),
      fin_at: new Date(instants.get(e.id)!.fin).toISOString(),
    };
    const ex = parEvent.get(e.id);
    if (!ex) {
      const { data, error } = await db.from('qualite_seances').insert({ ...champs, event_id: e.id, type_seance: devinerTypeSeance(e.title ?? '') }).select('*').single();
      if (!error && data) { parEvent.set(e.id, data as SeanceLigne); crees++; }
    } else if (ex.lien === 'auto') {
      const change = ex.titre !== champs.titre || ex.enseignant_nom !== champs.enseignant_nom || ex.debut_at !== champs.debut_at
        || ex.fin_at !== champs.fin_at || JSON.stringify(ex.colleges) !== JSON.stringify(champs.colleges);
      if (change) {
        // L'enseignant saisi à la main sur la séance (fiche Qualité) prime sur l'agenda vide.
        const patch = { ...champs, enseignant_nom: champs.enseignant_nom ?? ex.enseignant_nom, enseignant_cle: champs.enseignant_cle ?? ex.enseignant_cle, updated_at: new Date().toISOString() };
        await db.from('qualite_seances').update(patch).eq('id', ex.id);
        maj++;
      }
    }
  }

  // 2. Replays.
  for (const v of videos) {
    if (parVideo.has(v.id)) continue;
    const matiere = v.cours?.matiere_id ?? null;
    const parent = v.cours?.matieres?.parent_matiere_id ?? null;
    let rattache: SeanceLigne | null = null;
    if (v.live_at) {
      const t = Date.parse(v.live_at);
      for (const [eventId, inst] of instants) {
        const seance = parEvent.get(eventId);
        if (!seance || seance.video_id) continue;
        const memeSpecialite = !inst.colleges.length || (matiere && inst.colleges.includes(matiere)) || (parent && inst.colleges.includes(parent));
        if (memeSpecialite && Math.abs(t - inst.debut) <= 3 * 3_600_000) { rattache = seance; break; }
      }
    }
    if (rattache && rattache.lien === 'auto') {
      const { error } = await db.from('qualite_seances').update({ video_id: v.id, updated_at: new Date().toISOString() }).eq('id', rattache.id);
      if (!error) { rattache.video_id = v.id; parVideo.set(v.id, rattache); lies++; }
      continue;
    }
    const titre = [v.cours?.matieres?.nom, v.titre].filter(Boolean).join(' — ') || 'Replay';
    const { data, error } = await db.from('qualite_seances').insert({
      video_id: v.id,
      titre,
      theme: v.titre,
      type_seance: devinerTypeSeance(v.titre ?? ''),
      colleges: [matiere, parent].filter((x): x is string => !!x),
      specialite_label: v.cours?.matieres?.nom ?? null,
      voies: v.voies ?? null,
      debut_at: v.live_at ?? v.created_at,
    }).select('*').single();
    if (!error && data) { parVideo.set(v.id, data as SeanceLigne); crees++; }
  }
  if (crees || lies) await journaliser({ objet_type: 'seance', action: 'synchronisation', details: { crees, maj, lies } });
  return { crees, maj, lies };
}
