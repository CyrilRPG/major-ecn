import type { ActionInactivite, Parametres } from './parametres';

/**
 * Suivi des candidats inactifs (§12) — module PUR, testé.
 *
 * Paliers paramétrables (7 / 10 / 15 / 21 jours par défaut). Un palier n'est
 * franchi qu'une fois par période d'inactivité : dès que le candidat reprend
 * une activité pédagogique, le compteur repart de zéro. Jamais pendant une
 * pause autorisée, après la fin de formation ni pour l'Offre Découverte (dont
 * les relances commerciales ont leur propre module).
 */

export type EtatInactivite = {
  derniereActivite: string | null;
  /** Début de la formation : sans activité, l'inactivité se compte depuis là. */
  debutFormation: string | null;
  palierActuel: number;
  palierAt: string | null;
};

export type DecisionInactivite =
  | { type: 'rien' }
  | { type: 'reinitialiser' }
  | { type: 'palier'; palier: number; jours: number; action: ActionInactivite; ignores: ActionInactivite[] };

export function joursInactif(etat: EtatInactivite, now: number): number | null {
  const ref = etat.derniereActivite ?? etat.debutFormation;
  if (!ref) return null;
  return Math.floor((now - Date.parse(ref)) / 86_400_000);
}

export function deciderInactivite(
  etat: EtatInactivite,
  params: Parametres['inactivite'],
  now: number,
  exclu: { pause: boolean; termine: boolean; decouverte: boolean; exclu: boolean },
): DecisionInactivite {
  if (!params.actif || exclu.pause || exclu.termine || exclu.decouverte || exclu.exclu) return { type: 'rien' };
  const jours = joursInactif(etat, now);
  if (jours === null) return { type: 'rien' };
  // Activité reprise depuis le dernier palier : nouvelle période.
  if (etat.palierActuel > 0 && etat.derniereActivite && etat.palierAt && Date.parse(etat.derniereActivite) > Date.parse(etat.palierAt)) {
    return { type: 'reinitialiser' };
  }
  const atteints = params.paliers
    .map((p, i) => ({ ...p, palier: i + 1 }))
    .filter((p) => jours >= p.jours && p.palier > etat.palierActuel);
  if (!atteints.length) return { type: 'rien' };
  // Plusieurs paliers franchis d'un coup (activation du module, panne du
  // balayage) : seule l'action du plus élevé est exécutée.
  const haut = atteints[atteints.length - 1];
  return { type: 'palier', palier: haut.palier, jours, action: haut.action, ignores: atteints.slice(0, -1).map((p) => p.action) };
}
