import type { Critere, Question, Reponses, ValeurReponse } from './types';

/**
 * Validation et exploitation d'une réponse (module PUR, testé) : questions
 * visibles selon leurs conditions, contrôle des obligatoires, valeurs
 * normalisées, et dérivés stockés à part pour les statistiques (note globale,
 * notes par critère, difficulté, demande de contact…).
 */

export function valeurCondition(v: ValeurReponse | undefined): string {
  if (v === true) return 'true';
  if (v === false) return 'false';
  if (Array.isArray(v)) return v.join('|');
  return v === null || v === undefined ? '' : String(v);
}

export function questionVisible(q: Question, reponses: Reponses): boolean {
  if (!q.siQuestion) return true;
  return valeurCondition(reponses[q.siQuestion]) === (q.siValeur ?? 'true');
}

function normaliserValeur(q: Question, v: unknown): ValeurReponse {
  if (v === undefined || v === null || v === '') return null;
  switch (q.type) {
    case 'note5': {
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
    }
    case 'recommandation': {
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isInteger(n) && n >= 0 && n <= 10 ? n : null;
    }
    case 'oui_non':
      if (v === true || v === 'true' || v === 'oui') return true;
      if (v === false || v === 'false' || v === 'non') return false;
      return null;
    case 'texte': {
      const s = String(v).replace(/\u0000/g, '').trim();
      return s ? s.slice(0, 4000) : null;
    }
    case 'choix_unique': {
      const s = String(v);
      return q.options?.includes(s) ? s : null;
    }
    case 'choix_multiple': {
      const arr = Array.isArray(v) ? v.map(String) : [String(v)];
      const ok = Array.from(new Set(arr.filter((x) => q.options?.includes(x))));
      return ok.length ? ok : null;
    }
  }
}

export type CommentaireExtrait = { questionId: string; libelle: string; texte: string };

export type ReponseExploitee = {
  reponses: Reponses;
  noteGlobale: number | null;
  notes: Partial<Record<Critere, number>>;
  noteMin: number | null;
  difficulte: boolean | null;
  difficultes: string[];
  demandeContact: boolean | null;
  resolu: string | null;
  recommandation: number | null;
  resultatDeclare: string | null;
  commentaires: CommentaireExtrait[];
};

export type ResultatValidation = { ok: true; valeur: ReponseExploitee } | { ok: false; erreurs: Record<string, string> };

/** `partiel` : brouillon (aucun contrôle d'obligation). */
export function exploiterReponse(questions: Question[], brut: Record<string, unknown>, partiel = false): ResultatValidation {
  const reponses: Reponses = {};
  // Deux passes : les conditions lisent les réponses normalisées.
  for (const q of questions) reponses[q.id] = normaliserValeur(q, brut[q.id]);
  const erreurs: Record<string, string> = {};
  for (const q of questions) {
    if (!questionVisible(q, reponses)) { reponses[q.id] = null; continue; }
    if (!partiel && q.obligatoire && reponses[q.id] === null) erreurs[q.id] = 'Réponse requise';
  }
  if (Object.keys(erreurs).length > 0) return { ok: false, erreurs };

  const notes: Partial<Record<Critere, number>> = {};
  const cumul: Partial<Record<Critere, number[]>> = {};
  let noteGlobale: number | null = null;
  let noteMin: number | null = null;
  let difficulte: boolean | null = null;
  let difficultes: string[] = [];
  let demandeContact: boolean | null = null;
  let resolu: string | null = null;
  let recommandation: number | null = null;
  let resultatDeclare: string | null = null;
  const commentaires: CommentaireExtrait[] = [];

  for (const q of questions) {
    const v = reponses[q.id];
    if (v === null || v === undefined) continue;
    if (q.type === 'note5' && typeof v === 'number') {
      noteMin = noteMin === null ? v : Math.min(noteMin, v);
      if (q.critere) (cumul[q.critere] ??= []).push(v);
      if (q.critere === 'globale' && noteGlobale === null) noteGlobale = v;
    }
    if (q.type === 'recommandation' && typeof v === 'number') recommandation = v;
    if (q.role === 'difficulte' && typeof v === 'boolean') difficulte = v;
    if (q.role === 'difficultes' && Array.isArray(v)) difficultes = v;
    if (q.role === 'contact' && typeof v === 'boolean') demandeContact = v;
    if (q.role === 'resolu' && typeof v === 'string') resolu = v;
    if (q.role === 'resultat' && typeof v === 'string') resultatDeclare = v;
    if (q.type === 'texte' && typeof v === 'string' && q.role !== 'resultat') {
      commentaires.push({ questionId: q.id, libelle: q.libelle, texte: v });
    }
  }
  for (const [c, vals] of Object.entries(cumul) as [Critere, number[]][]) {
    notes[c] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
  }
  if (difficultes.length > 0 && difficulte === null) difficulte = true;
  return {
    ok: true,
    valeur: { reponses, noteGlobale, notes, noteMin, difficulte, difficultes, demandeContact, resolu, recommandation, resultatDeclare, commentaires },
  };
}
