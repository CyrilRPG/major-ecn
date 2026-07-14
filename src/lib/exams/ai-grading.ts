import 'server-only';
import type { ExamKeyword } from './scoring';

/** Question QROC à corriger par l'IA + réponse du candidat. */
export type QrocToGrade = {
  id: string;
  enonce: string;
  reponse_attendue?: string | null;
  corrige_complet?: string | null;
  keywords: ExamKeyword[];
  zero_if_missing: string[];
  major_errors: string[];
  answer: string;
};

/** Détection renvoyée par l'IA pour une QROC (elle NE calcule PAS les points). */
export type QrocDetection = {
  id: string;
  keywords_found: string[];
  zero_missing: string[];
  major_errors_found: string[];
  positives?: string[];
  gaps?: string[];
  feedback?: string;
  /** Score holistique 0..max quand aucun mot-clé n'est défini. */
  holistic?: number;
};

export type AiGradingOutput = {
  questions: QrocDetection[];
  avis_general?: string;
  plan_de_travail?: string[];
};

/** Points maximaux d'une QROC-IA : somme des mots-clés si définis, sinon `points`. */
export function qrocAiMaxPoints(q: QrocToGrade, fallbackPoints: number): number {
  if (q.keywords.length > 0) return q.keywords.reduce((s, k) => s + (k.points || 0), 0);
  return fallbackPoints;
}

/**
 * Calcule les points d'une QROC à partir de la DÉTECTION de l'IA et du barème
 * ADMIN (l'IA ne fixe pas le barème) : 0 si un « pas mis = 0 » manque ou si une
 * erreur majeure est présente ; sinon somme des mots-clés reconnus (borné au max).
 */
export function computeQrocPoints(q: QrocToGrade, det: QrocDetection, maxPoints: number): number {
  if ((det.zero_missing?.length ?? 0) > 0) return 0;
  if ((det.major_errors_found?.length ?? 0) > 0) return 0;
  if (q.keywords.length === 0) {
    // Notation globale INDULGENTE à 3 niveaux : 0, la moitié (partiel), le max (juste).
    const raw = Math.max(0, Math.min(maxPoints, Number(det.holistic ?? 0)));
    const levels = [0, maxPoints / 2, maxPoints];
    const snapped = levels.reduce((best, lvl) => (Math.abs(lvl - raw) < Math.abs(best - raw) ? lvl : best), 0);
    return Math.round(snapped * 100) / 100;
  }
  const found = new Set((det.keywords_found ?? []).map((s) => s.trim().toLowerCase()));
  const pts = q.keywords.reduce((s, k) => s + (found.has(k.label.trim().toLowerCase()) ? (k.points || 0) : 0), 0);
  return Math.round(Math.min(maxPoints, pts) * 100) / 100;
}

/** Niveau global (5 paliers) d'après le pourcentage. */
export function aiLevel(pct: number): string {
  if (pct < 20) return 'Très fragile';
  if (pct < 40) return 'Fragile';
  if (pct < 60) return 'Intermédiaire';
  if (pct < 80) return 'Bon';
  return 'Très bon';
}

/** Construit le prompt de correction. L'IA DÉTECTE (mots-clés présents, éléments
 *  obligatoires manquants, erreurs majeures) ; elle ne calcule pas les points. */
export function buildAiGradingPrompt(examTitle: string, questions: QrocToGrade[]): { system: string; user: string } {
  const system = [
    "Tu es correcteur aux Épreuves de Vérification des Connaissances (EVC/ECN), rigoureux et bienveillant.",
    "Tu corriges des questions ouvertes (QROC) EXCLUSIVEMENT selon le barème fourni par l'enseignant : mots-clés attendus, éléments obligatoires (« pas mis = 0 »), erreurs majeures (rédhibitoires).",
    "Tu N'INVENTES AUCUN critère et tu ne fixes AUCUN point. Tu IGNORES totalement les fautes d'orthographe, d'accents, de casse et de ponctuation, et tu acceptes les synonymes et abréviations usuelles (une réponse correcte mal orthographiée reste correcte). Ton rôle : reconnaître les FORMULATIONS ÉQUIVALENTES et DÉTECTER, pour chaque question :",
    "- keywords_found : la liste EXACTE des `label` de mots-clés attendus réellement présents dans la réponse du candidat (formulations équivalentes acceptées) ;",
    "- zero_missing : la liste des éléments « pas mis = 0 » ABSENTS de la réponse ;",
    "- major_errors_found : la liste des erreurs majeures présentes dans la réponse ;",
    "- feedback (2-3 phrases), positives (points forts), gaps (éléments oubliés) ;",
    "- holistic : UNIQUEMENT si la question n'a AUCUN mot-clé défini. Note globale à 3 NIVEAUX seulement : 0 (faux ou absent), la MOITIÉ du maximum indiqué (partiellement juste), ou le MAXIMUM (juste). Sois INDULGENT : si l'idée principale / la bonne réponse est présente, mets le MAXIMUM même s'il manque des détails secondaires ; ne mets la moitié que si la question exigeait clairement ces détails ou si la réponse est incomplète ; 0 seulement si c'est faux ou hors-sujet. En cas de doute entre deux niveaux, choisis le plus favorable au candidat.",
    "Réponds UNIQUEMENT par un JSON valide, sans texte autour.",
  ].join('\n');

  const payload = {
    epreuve: examTitle,
    consigne_sortie: {
      questions: '[{ id, keywords_found[], zero_missing[], major_errors_found[], feedback, positives[], gaps[], holistic? }]',
      avis_general: 'Avis global 3-4 phrases sur la copie',
      plan_de_travail: 'Liste de 3-6 recommandations concrètes de révision',
    },
    questions: questions.map((q) => ({
      id: q.id,
      enonce: q.enonce,
      reponse_attendue: q.reponse_attendue ?? null,
      corrige_complet: q.corrige_complet ?? null,
      mots_cles_attendus: q.keywords.map((k) => ({ label: k.label, points: k.points, obligatoire: !!k.mandatory })),
      pas_mis_egal_zero: q.zero_if_missing,
      erreurs_majeures: q.major_errors,
      reponse_du_candidat: q.answer || '(vide)',
    })),
  };

  const user = 'Corrige les QROC suivantes et renvoie le JSON demandé.\n\n' + JSON.stringify(payload, null, 2);
  return { system, user };
}
