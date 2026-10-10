import { moyenne, taux, type Taux } from './indicateurs';

/**
 * Mesure de l'efficacité d'une action corrective (§24) — module PUR, testé.
 *
 * Compare, sur la cible de l'action (enseignant, séance, contenu, thème…), les
 * indicateurs AVANT et APRÈS la date de référence (date de réalisation de
 * l'action) sur deux fenêtres de même durée. Le verdict n'est qu'une
 * proposition : la clôture définitive exige une validation humaine.
 */

export type ObservationReponse = { soumis_at: string; note_globale: number | null; user_id: string | null };
export type ObservationCommentaire = { created_at: string; theme_cle: string | null; sentiment: string | null; user_id: string | null };

export type Periode = {
  du: string;
  au: string;
  reponses: number;
  noteMoyenne: number | null;
  notesDefavorables: Taux;
  /** Remarques du thème de l'action (négatives ou mixtes). */
  remarquesTheme: number;
  candidatsTheme: number;
};

export type MesureEfficacite = {
  avant: Periode;
  apres: Periode;
  verdict: 'amelioration' | 'stable' | 'degradation' | 'insuffisant';
  explication: string;
};

function periode(du: number, au: number, reps: ObservationReponse[], coms: ObservationCommentaire[], theme: string | null): Periode {
  const r = reps.filter((x) => { const t = Date.parse(x.soumis_at); return t >= du && t < au; });
  const c = coms.filter((x) => {
    const t = Date.parse(x.created_at);
    return t >= du && t < au && (!theme || x.theme_cle === theme) && (x.sentiment === 'negatif' || x.sentiment === 'mixte');
  });
  const notees = r.filter((x) => x.note_globale !== null);
  return {
    du: new Date(du).toISOString(),
    au: new Date(au).toISOString(),
    reponses: r.length,
    noteMoyenne: moyenne(notees.map((x) => x.note_globale)).moyenne,
    notesDefavorables: taux(notees.filter((x) => (x.note_globale as number) <= 2).length, notees.length),
    remarquesTheme: c.length,
    candidatsTheme: new Set(c.map((x) => x.user_id ?? x.created_at)).size,
  };
}

export function mesurerEfficacite(input: {
  dateReference: string;
  fenetreJours: number;
  now: number;
  reponses: ObservationReponse[];
  commentaires: ObservationCommentaire[];
  themeCle: string | null;
  effectifMin?: number;
}): MesureEfficacite {
  const ref = Date.parse(input.dateReference);
  const f = input.fenetreJours * 86_400_000;
  const finApres = Math.min(ref + f, input.now);
  const duree = Math.max(0, finApres - ref);
  // Fenêtres de MÊME durée de part et d'autre de la référence.
  const avant = periode(ref - (duree || f), ref, input.reponses, input.commentaires, input.themeCle);
  const apres = periode(ref, finApres, input.reponses, input.commentaires, input.themeCle);
  const min = input.effectifMin ?? 5;
  if (apres.reponses < min && apres.remarquesTheme === 0 && avant.remarquesTheme === 0) {
    return { avant, apres, verdict: 'insuffisant', explication: `Pas assez de réponses après l'action (${apres.reponses}, minimum ${min}) pour conclure.` };
  }
  const dNote = avant.noteMoyenne !== null && apres.noteMoyenne !== null ? apres.noteMoyenne - avant.noteMoyenne : null;
  const dTheme = apres.candidatsTheme - avant.candidatsTheme;
  const mieux = (dNote !== null && dNote >= 0.2) || (input.themeCle !== null && dTheme < 0 && apres.candidatsTheme <= Math.floor(avant.candidatsTheme / 2));
  const pire = (dNote !== null && dNote <= -0.2) || (input.themeCle !== null && dTheme > 0);
  const parts: string[] = [];
  if (dNote !== null) parts.push(`note moyenne ${avant.noteMoyenne} → ${apres.noteMoyenne}`);
  if (input.themeCle) parts.push(`candidats signalant le thème ${avant.candidatsTheme} → ${apres.candidatsTheme}`);
  const verdict = mieux && !pire ? 'amelioration' : pire && !mieux ? 'degradation' : 'stable';
  return { avant, apres, verdict, explication: parts.join(' ; ') || 'Aucune donnée comparable.' };
}
