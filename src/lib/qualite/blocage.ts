import type { BlockingScope, Famille, StatutEnvoi } from './types';

/**
 * Périmètre du blocage (§28) — module PUR, partagé entre le serveur (layout de
 * l'espace élève) et le client (fenêtre du questionnaire).
 *
 * Le blocage n'est jamais global : l'assistance, les données personnelles, les
 * informations d'examen, les démarches réglementaires (formulaires,
 * émargements), la messagerie et les résultats restent TOUJOURS accessibles.
 */

const toujoursOuverts = [
  '/enquetes', '/profil', '/presences', '/formulaires', '/echanges', '/forum', '/agenda',
  '/mes-rendez-vous', '/mode-emploi', '/tutoriel', '/evaluations', '/accueil', '/app', '/planificateur',
  '/acces-expire', '/logout', '/api',
];

/** Nouvelles activités pédagogiques (scope `activites`). */
const activites = [
  '/entrainement', '/mes-entrainements', '/revisions-transversales', '/checkup', '/epreuves-blanches',
  '/parcours', '/mes-priorites',
];

/** Consultation pédagogique (ajoutée par le scope `pedagogie`). */
const consultation = ['/cours', '/matieres', '/facultes', '/revoir', '/notes'];

const commencePar = (path: string, prefixe: string) => path === prefixe || path.startsWith(prefixe + '/');

/** La page `path` est-elle concernée par un blocage de périmètre `scope` ? */
export function pageBloquee(path: string, scope: BlockingScope): boolean {
  if (scope === 'aucun' || !path) return false;
  if (toujoursOuverts.some((p) => commencePar(path, p))) return false;
  if (activites.some((p) => commencePar(path, p))) return true;
  if (scope === 'pedagogie' && consultation.some((p) => commencePar(path, p))) return true;
  return false;
}

/** Envoi tel que vu par la garde (données minimales). */
export type EnvoiGarde = {
  id: string;
  famille: Famille;
  statut: StatutEnvoi;
  obligatoire: boolean;
  priorite: number;
  blocking_scope: BlockingScope;
  programme_pour: string;
  suspendu_jusqu_au: string | null;
};

/**
 * Envoi bloquant à présenter maintenant (§27) : le plus prioritaire des
 * questionnaires obligatoires exigibles, hors suspension temporaire. Un seul à
 * la fois — jamais plusieurs questionnaires obligatoires simultanés.
 */
export function envoiBloquant(envois: EnvoiGarde[], now: number, sansBlocage = false): EnvoiGarde | null {
  if (sansBlocage) return null;
  const exigibles = envois.filter((e) =>
    e.obligatoire
    && e.blocking_scope !== 'aucun'
    && (e.statut === 'envoye' || e.statut === 'affiche' || e.statut === 'commence')
    && Date.parse(e.programme_pour) <= now
    && !(e.suspendu_jusqu_au && Date.parse(e.suspendu_jusqu_au) > now));
  exigibles.sort((a, b) => b.priorite - a.priorite || Date.parse(a.programme_pour) - Date.parse(b.programme_pour));
  return exigibles[0] ?? null;
}

/** Le chemin courant doit-il afficher la fenêtre bloquante de cet envoi ? */
export function doitBloquer(path: string, envoi: EnvoiGarde | null): boolean {
  return !!envoi && pageBloquee(path, envoi.blocking_scope);
}
