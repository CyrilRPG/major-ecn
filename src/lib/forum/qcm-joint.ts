/**
 * Question QCM / QROC jointe à une question du forum.
 *
 * Depuis un lecteur de QCM, l'élève pose sa question à un professeur avec la
 * question jointe (`forum_questions.qcm_question_id` + instantané
 * `qcm_contexte`) : le professeur voit l'énoncé, les propositions, le corrigé
 * et ce que l'élève a répondu, et ouvre la question dans le lecteur.
 *
 * Module PUR (client et serveur) ; le chargement est dans `qcm-joint-server.ts`.
 */
import { flashcardPlainText } from '@/lib/flashcards/rich-text';

/** Ce que le lecteur envoie : la question et la réponse de l'élève, rien d'autre
 *  (l'énoncé et le corrigé sont relus en base). */
export type QcmJointEnvoi = {
  /** 'qcm' = banque (qcm_questions) ; 'examen' = épreuve blanche ou
   *  interrogation de spécialité (mock_exam_questions). */
  source?: 'qcm' | 'examen';
  questionId: string;
  /** QCM : lettres cochées. */
  lettres?: string[] | null;
  /** QROC : réponse saisie. */
  texte?: string | null;
};

export type QcmJoint = {
  source: 'qcm' | 'examen';
  questionId: string;
  /** Épreuve blanche / interrogation : l'examen (mock_exams). */
  examenId: string | null;
  /** Collège de la question d'examen (routage vers les référents). */
  matiereId: string | null;
  serieId: string | null;
  serieLabel: string | null;
  coursId: string | null;
  coursTitre: string | null;
  /** Rang de la question dans sa série (1 = première). */
  numero: number | null;
  format: 'qcm' | 'qroc';
  /** HTML de l'énoncé. */
  enonce: string;
  items: { lettre: string; enonce: string; correct: boolean }[];
  reponseAttendue: string | null;
  /** null = l'élève n'avait pas encore répondu. */
  reponseEleve: { lettres: string[] } | { texte: string } | null;
};

/** Lien vers la question dans le lecteur (le lecteur sait s'ouvrir sur `?q=`).
 *  Une question d'examen n'a pas de lecteur : null. */
export function lienQuestionJointe(j: Pick<QcmJoint, 'source' | 'questionId' | 'coursId' | 'serieId'>): string | null {
  if (j.source === 'examen' || !j.coursId || !j.serieId) return null;
  return `/cours/${j.coursId}/qcm/${j.serieId}?q=${j.questionId}`;
}

/** Équipe : où corriger la question (éditeur de l'épreuve, ou lecteur en mode
 *  édition pour la banque). */
export function lienEditionQuestionJointe(j: QcmJoint): string | null {
  if (j.source === 'examen') return j.examenId ? `/admin/epreuves-blanches/${j.examenId}` : null;
  return lienQuestionJointe(j);
}

/** Intitulé court : « Série 3 — Question 4 ». */
export function intituleQuestionJointe(j: Pick<QcmJoint, 'serieLabel' | 'numero' | 'format'>): string {
  const q = `${j.format === 'qroc' ? 'QROC' : 'Question'}${j.numero ? ` ${j.numero}` : ''}`;
  return j.serieLabel ? `${j.serieLabel} — ${q}` : q;
}

/** Énoncé en texte brut, tronqué (aperçus, e-mail). */
export function apercuEnonce(html: string, max = 180): string {
  const t = flashcardPlainText(html).replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
}

/** Réponse de l'élève en clair : « A, C », « (aucune case cochée) », texte QROC. */
export function reponseEleveTexte(j: Pick<QcmJoint, 'reponseEleve'>): string | null {
  const r = j.reponseEleve;
  if (!r) return null;
  if ('lettres' in r) return r.lettres.length ? r.lettres.join(', ') : '(aucune case cochée)';
  return r.texte;
}

/**
 * Question jointe en texte brut, pour l'assistant. Sans `avecCorrige`, ni les
 * bonnes réponses ni la réponse attendue ne sortent : l'élève qui n'a pas
 * encore répondu ne doit pas obtenir le corrigé par ce biais.
 */
export function questionJointeEnTexte(j: QcmJoint, { avecCorrige }: { avecCorrige: boolean }): string {
  const lignes = [
    `${intituleQuestionJointe(j)}${j.coursTitre ? ` (item « ${j.coursTitre} »)` : ''}`,
    `Énoncé : ${flashcardPlainText(j.enonce).replace(/\s+/g, ' ').trim()}`,
  ];
  for (const it of j.items) {
    const verdict = avecCorrige ? (it.correct ? ' — VRAI' : ' — FAUX') : '';
    lignes.push(`${it.lettre}. ${flashcardPlainText(it.enonce).replace(/\s+/g, ' ').trim()}${verdict}`);
  }
  if (avecCorrige && j.reponseAttendue) {
    lignes.push(`Réponse attendue : ${flashcardPlainText(j.reponseAttendue).replace(/\s+/g, ' ').trim()}`);
  }
  const rep = reponseEleveTexte(j);
  lignes.push(`Réponse de l'élève : ${rep ?? 'pas encore répondu'}`);
  return lignes.join('\n');
}

/** Lecture tolérante de la colonne jsonb (instantané d'une autre version). */
export function lireQcmJoint(raw: unknown): QcmJoint | null {
  if (!raw || typeof raw !== 'object') return null;
  const j = raw as Partial<QcmJoint>;
  if (typeof j.questionId !== 'string' || typeof j.enonce !== 'string') return null;
  return {
    source: j.source === 'examen' ? 'examen' : 'qcm',
    questionId: j.questionId,
    examenId: j.examenId ?? null,
    matiereId: j.matiereId ?? null,
    serieId: j.serieId ?? null,
    serieLabel: j.serieLabel ?? null,
    coursId: j.coursId ?? null,
    coursTitre: j.coursTitre ?? null,
    numero: typeof j.numero === 'number' ? j.numero : null,
    format: j.format === 'qroc' ? 'qroc' : 'qcm',
    enonce: j.enonce,
    items: Array.isArray(j.items) ? j.items : [],
    reponseAttendue: j.reponseAttendue ?? null,
    reponseEleve: j.reponseEleve ?? null,
  };
}
