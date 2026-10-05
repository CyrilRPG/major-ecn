import 'server-only';

/**
 * Point d'entrée du planificateur pour le reste de la plateforme (menu,
 * accueil, Check-up, application mobile, balayage) — CDC V4.1.
 *
 *  - `planAvailableFor` : « Mon planning » est-il proposé à ce compte ;
 *  - `requestPlannerRecalc` : un autre module (Check-up, moteur central)
 *    demande au planificateur de relire les besoins et de replacer ;
 *  - `runPlanSweep` : balayage horaire (clôture des journées à 04:00 dans le
 *    fuseau de chaque candidat, mode prioritaire, migration V4.1).
 */
export { planAvailableFor, preparationsFor, voieOfScope, examDateForCollege, hasParcoursAccess, canAccessPreparation } from './access';
export { refreshPlan, ensureFresh, requestPlannerRecalc, type PlanSummary, type RefreshResult } from './engine';
export { runPlanSweep } from './sweep';
