/**
 * Ce qu'un élève peut voir d'une copie remise — règle de la page web
 * `/epreuves-blanches/[id]` (et de l'interrogation composée d'un item),
 * rejouée par `/api/mobile/exams`. Module PUR : testé sans base.
 *
 * Épreuve blanche, copie remise :
 *  - auto-évaluation QROC en attente, rapport IA pas encore produit →
 *    `resultats` : l'élève voit le corrigé pour s'auto-évaluer (le web rend
 *    alors ExamResults, publication ou non) ;
 *  - pas de rapport IA (et rien à auto-évaluer) → `finalisation` : correction
 *    et analyse IA à lancer, AUCUN corrigé ;
 *  - rapport IA mais résultats non publiés → `attente` : AUCUN corrigé, ni note,
 *    ni classement ;
 *  - rapport IA et résultats publiés → `resultats`.
 *
 * Interrogation composée d'un item (`mock_exams.cours_id`) : le web affiche les
 * résultats dès la remise (InterrogationExamFlow), sans calendrier de
 * publication ni analyse préalable.
 */
export type PhaseCopie = 'passation' | 'finalisation' | 'attente' | 'resultats';

export function phaseCopie(o: {
  /** Copie remise (statut submitted ou graded). */
  remise: boolean;
  /** Interrogation composée d'un item (et non épreuve blanche). */
  interrogationItem: boolean;
  /** Auto-évaluation QROC encore due (mode self, une QROC sans self_grade). */
  autoEvaluationDue: boolean;
  /** `ai_report` présent sur la copie. */
  rapportIa: boolean;
  /** Résultats publiés (`resultsVisible`). */
  publies: boolean;
}): PhaseCopie {
  if (!o.remise) return 'passation';
  if (o.interrogationItem) return 'resultats';
  if (!o.rapportIa && !o.autoEvaluationDue) return 'finalisation';
  if (o.rapportIa && !o.publies) return 'attente';
  return 'resultats';
}
