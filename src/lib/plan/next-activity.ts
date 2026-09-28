/**
 * Prochaine activité la plus pertinente (addendum « gestion de l'avance ») —
 * module PUR.
 *
 * Quand le candidat a encore du temps (« J'ai encore du temps », « Continuer
 * mes révisions »), on ne lui ouvre pas simplement « le lendemain » : on
 * choisit, dans le planning qui vient d'être recalculé, l'activité la plus
 * utile À CET INSTANT et compatible avec le temps annoncé :
 *  - une réactivation devenue pertinente (échéance dans les 3 jours) ;
 *  - une évaluation en attente ;
 *  - le prochain travail prioritaire prévu (un item jamais travaillé, un
 *    approfondissement, une faiblesse découverte aujourd'hui…) ;
 *  - sinon un entraînement court au format de la voie.
 * S'il reste 15 minutes, inutile de lancer un travail de 50 minutes : on
 * propose une activité courte (réactivation, QCM / QROC), ou une partie de
 * la séance suivante.
 */
import { addDaysKey } from './revision';
import type { SessionKind, Voie } from './types';

export type FutureSession = {
  id: string;
  itemId: string | null;
  day: string;
  minutes: number;
  kind: SessionKind;
  priorityScore: number | null;
};

export type NextActivity =
  /** Une séance déjà prévue plus tard, réalisée maintenant en entier. */
  | { type: 'existing'; sessionId: string; itemId: string | null; kind: SessionKind; minutes: number; plannedDay: string; reason: string }
  /** Une partie d'une séance prévue, ou un entraînement court. */
  | { type: 'new'; itemId: string | null; kind: SessionKind; minutes: number; plannedDay: string | null; reason: string };

const SHORT: SessionKind[] = ['reactivation', 'evaluation'];
const LEARNING: SessionKind[] = ['apprentissage', 'approfondissement', 'consolidation', 'revision_finale'];
/** Tolérance : une séance de 35 min convient à « 30 min ». */
const SLACK = 5;

function rank(k: SessionKind): number {
  return k === 'reactivation' ? 0 : k === 'evaluation' ? 1 : k === 'apprentissage' ? 2 : k === 'approfondissement' ? 3 : k === 'consolidation' ? 3 : k === 'entrainement' ? 4 : 5;
}

/**
 * `budget` : minutes annoncées, `null` = « Continuer sans limite ».
 * `today` : jour courant ; `future` : séances planifiées des jours suivants.
 * `rankedItems` : items par rendement (pour un entraînement court de repli).
 */
export function pickNextActivity(input: {
  future: FutureSession[];
  budget: number | null;
  today: string;
  voie: Voie | null;
  rankedItems: string[];
}): NextActivity | null {
  const future = input.future
    .filter((s) => s.day > input.today)
    .sort((a, b) => a.day.localeCompare(b.day) || rank(a.kind) - rank(b.kind) || (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  const soon = addDaysKey(input.today, 3);
  const week = addDaysKey(input.today, 7);
  // Une évaluation ou une réactivation n'a de sens qu'une fois la couverture de l'item faite.
  const learningBefore = (s: FutureSession) => future.some((f) => f.itemId === s.itemId && LEARNING.includes(f.kind) && f.day <= s.day && f.id !== s.id);
  const shortOk = (s: FutureSession) => SHORT.includes(s.kind) && !learningBefore(s);
  const existing = (s: FutureSession, reason: string): NextActivity =>
    ({ type: 'existing', sessionId: s.id, itemId: s.itemId, kind: s.kind, minutes: s.minutes, plannedDay: s.day, reason });

  // Sans limite : la prochaine activité du planning, telle quelle.
  if (input.budget === null) {
    const due = future.find((s) => shortOk(s) && s.day <= soon);
    if (due) return existing(due, due.kind === 'reactivation' ? 'Réactivation devenue pertinente : autant la faire maintenant.' : 'Évaluation en attente : elle affinera votre planning.');
    const next = future[0];
    return next ? existing(next, 'Prochaine activité prioritaire de votre planning, avancée à aujourd’hui.') : training(input, null);
  }

  const budget = Math.max(5, input.budget);
  // 1. Une réactivation ou une évaluation proche qui tient dans le temps annoncé.
  const shortDue = future.find((s) => shortOk(s) && s.day <= soon && s.minutes <= budget + SLACK);
  if (shortDue) return existing(shortDue, shortDue.kind === 'reactivation' ? 'Réactivation devenue pertinente, compatible avec le temps dont vous disposez.' : 'Évaluation courte en attente, compatible avec le temps dont vous disposez.');
  // 2. Temps court : pas de gros travail ; une activité courte prévue plus tard, sinon un entraînement.
  if (budget < 30) {
    // Pas une réactivation prévue dans deux mois : seulement ce qui est proche.
    const short = future.find((s) => (shortOk(s) || s.kind === 'entrainement') && s.day <= week && s.minutes <= budget + SLACK);
    if (short) return existing(short, 'Activité courte avancée à aujourd’hui, adaptée au temps dont vous disposez.');
    return training(input, budget);
  }
  // 3. La prochaine séance entière si elle tient…
  const whole = future.find((s) => s.minutes <= budget + SLACK && (!SHORT.includes(s.kind) || shortOk(s)));
  const firstLearning = future.find((s) => LEARNING.includes(s.kind));
  if (whole && (!firstLearning || whole.day <= firstLearning.day)) return existing(whole, 'Prochaine activité prioritaire de votre planning, avancée à aujourd’hui.');
  // … sinon une partie de la prochaine séance d'apprentissage (le reste sera recalculé).
  if (firstLearning) {
    return { type: 'new', itemId: firstLearning.itemId, kind: firstLearning.kind, minutes: Math.min(budget, firstLearning.minutes), plannedDay: firstLearning.day, reason: 'Vous avancez sur la prochaine séance prioritaire ; le planning restant est recalculé en conséquence.' };
  }
  if (whole) return existing(whole, 'Prochaine activité de votre planning, avancée à aujourd’hui.');
  return training(input, budget);
}

function training(input: { voie: Voie | null; rankedItems: string[] }, budget: number | null): NextActivity | null {
  const itemId = input.rankedItems[0] ?? null;
  if (!itemId) return null;
  const minutes = Math.max(10, Math.min(budget ?? 30, 45));
  return {
    type: 'new', itemId, kind: 'entrainement', minutes, plannedDay: null,
    reason: input.voie === 'externe'
      ? 'Entraînement court au format rédactionnel (QROC, conduite à tenir) sur l’un de vos items prioritaires.'
      : 'Entraînement court (QCM, flashcards) sur l’un de vos items prioritaires.',
  };
}
