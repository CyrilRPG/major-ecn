import { normaliser } from './analyse-regles';
import type { Critere, Sentiment, StatutEnvoi } from './types';

/**
 * Indicateurs qualité (§17, §18, §24, §31) — module PUR, testé.
 *
 * Les indicateurs sont TOUJOURS séparés (notes, commentaires, réclamations ne
 * se mélangent pas) et accompagnés de leurs effectifs : un pourcentage n'est
 * jamais affiché sans son numérateur et son dénominateur.
 */

export type Taux = { n: number; total: number; pct: number | null };

export const taux = (n: number, total: number): Taux => ({ n, total, pct: total > 0 ? Math.round((n / total) * 1000) / 10 : null });

/** Effectif sous lequel un taux est signalé « à interpréter avec prudence ». */
export const EFFECTIF_FAIBLE = 10;

export type ReponseStat = {
  user_id: string | null;
  note_globale: number | null;
  notes: Partial<Record<Critere, number>>;
  note_min: number | null;
  soumis_at: string;
  famille?: string;
  enseignant_cle?: string | null;
  seance_id?: string | null;
};

export type CommentaireStat = {
  reponse_id: string | null;
  user_id: string | null;
  sentiment: Sentiment | null;
  theme_cle: string | null;
  texte: string;
  created_at: string;
};

/** Taux de notes défavorables : réponses dont la note globale vaut 1 ou 2 / réponses notées. */
export function tauxNotesDefavorables(reponses: ReponseStat[]): Taux {
  const notees = reponses.filter((r) => r.note_globale !== null);
  return taux(notees.filter((r) => (r.note_globale as number) <= 2).length, notees.length);
}

/** Taux de satisfaction : note globale de 4 ou 5 / réponses notées. */
export function tauxSatisfaction(reponses: ReponseStat[]): Taux {
  const notees = reponses.filter((r) => r.note_globale !== null);
  return taux(notees.filter((r) => (r.note_globale as number) >= 4).length, notees.length);
}

/** Taux de vigilance : note globale de 3 / réponses notées. */
export function tauxVigilance(reponses: ReponseStat[]): Taux {
  const notees = reponses.filter((r) => r.note_globale !== null);
  return taux(notees.filter((r) => r.note_globale === 3).length, notees.length);
}

export function moyenne(valeurs: (number | null | undefined)[]): { moyenne: number | null; n: number } {
  const v = valeurs.filter((x): x is number => typeof x === 'number');
  return { moyenne: v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100 : null, n: v.length };
}

export function moyennesParCritere(reponses: ReponseStat[]): Partial<Record<Critere, { moyenne: number | null; n: number }>> {
  const out: Partial<Record<Critere, { moyenne: number | null; n: number }>> = {};
  const cles = new Set<Critere>();
  for (const r of reponses) for (const k of Object.keys(r.notes ?? {}) as Critere[]) cles.add(k);
  for (const c of cles) out[c] = moyenne(reponses.map((r) => r.notes?.[c]));
  return out;
}

/**
 * Taux de commentaires négatifs : réponses contenant au moins un commentaire
 * négatif (ou mixte) / réponses contenant au moins un commentaire analysable.
 */
export function tauxCommentairesNegatifs(commentaires: CommentaireStat[], estAnalysable: (t: string) => boolean): Taux {
  const parReponse = new Map<string, { analysable: boolean; negatif: boolean }>();
  for (const c of commentaires) {
    const cle = c.reponse_id ?? `c:${c.created_at}:${c.user_id}`;
    const e = parReponse.get(cle) ?? { analysable: false, negatif: false };
    if (estAnalysable(c.texte)) e.analysable = true;
    if (c.sentiment === 'negatif' || c.sentiment === 'mixte') e.negatif = true;
    parReponse.set(cle, e);
  }
  const lignes = Array.from(parReponse.values()).filter((e) => e.analysable);
  return taux(lignes.filter((e) => e.negatif).length, lignes.length);
}

/** Taux de signalement d'un thème : candidats distincts l'ayant signalé / candidats ayant répondu. */
export function tauxSignalementTheme(themeCle: string, commentaires: CommentaireStat[], repondants: Set<string>): Taux {
  const signalants = new Set(commentaires.filter((c) => c.theme_cle === themeCle && c.user_id).map((c) => c.user_id as string));
  return taux(Array.from(signalants).filter((u) => repondants.has(u)).length, repondants.size);
}

/** Questionnaires effectivement attendus : ni programmés, ni neutralisés, ni dispensés. */
export const STATUTS_ATTENDUS: StatutEnvoi[] = ['envoye', 'affiche', 'commence', 'complete', 'expire'];

/** Taux de participation : complétés / effectivement attendus. Une neutralisation n'est jamais une réponse. */
export function tauxParticipation(envois: { statut: StatutEnvoi }[]): Taux {
  const attendus = envois.filter((e) => STATUTS_ATTENDUS.includes(e.statut));
  return taux(attendus.filter((e) => e.statut === 'complete').length, attendus.length);
}

/** Net Promoter Score (recommandation 0-10) : % promoteurs (9-10) − % détracteurs (0-6). */
export function nps(valeurs: (number | null)[]): { score: number | null; n: number } {
  const v = valeurs.filter((x): x is number => typeof x === 'number');
  if (!v.length) return { score: null, n: 0 };
  const promo = v.filter((x) => x >= 9).length;
  const detr = v.filter((x) => x <= 6).length;
  return { score: Math.round(((promo - detr) / v.length) * 100), n: v.length };
}

/** Nom d'enseignant → clé de regroupement (« Dr Jean DUPONT » = « dr jean dupont »). */
export function cleEnseignant(nom: string | null | undefined): string | null {
  if (!nom) return null;
  const n = normaliser(nom).trim().replace(/^(dr|pr|docteur|professeur|prof) /, '');
  return n || null;
}

/** Série mensuelle (AAAA-MM) d'une moyenne, pour « l'évolution dans le temps ». */
export function serieMensuelle(reponses: ReponseStat[]): { mois: string; moyenne: number | null; n: number }[] {
  const parMois = new Map<string, number[]>();
  for (const r of reponses) {
    if (r.note_globale === null) continue;
    const m = r.soumis_at.slice(0, 7);
    (parMois.get(m) ?? parMois.set(m, []).get(m)!).push(r.note_globale);
  }
  return Array.from(parMois.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mois, vals]) => ({ mois, ...moyenne(vals) }));
}
