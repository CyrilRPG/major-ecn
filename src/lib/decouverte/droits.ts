/**
 * Droits sur le module de relances (cahier §25) — dérivés du module « Suivi
 * élèves / Commercial » des permissions d'équipe :
 *  - administrateur                      → tout, dont le paramétrage ;
 *  - suivi actif (lecture)               → consultation (liste, fiche, stats, exports, journal) ;
 *  - suivi « rédiger » (intervenant)     → + notes, relance individuelle (normale ou
 *                                          exceptionnelle), saisie d'historique, opposition ;
 *  - suivi « gérer » (responsable)       → + envoi groupé, import CSV, e-mail de test ;
 *  - paramétrage (délais, modèles, pause) : administrateurs UNIQUEMENT.
 *
 * Module PUR.
 */
import type { SuiviRole } from '@/lib/suivi/types';

export type DroitsDecouverte = { consulter: boolean; rediger: boolean; gerer: boolean; parametrer: boolean };
export type Droit = keyof DroitsDecouverte;

export const AUCUN_DROIT: DroitsDecouverte = { consulter: false, rediger: false, gerer: false, parametrer: false };

export function droitsDepuisRole(role: SuiviRole | null | undefined): DroitsDecouverte {
  switch (role) {
    case 'admin': return { consulter: true, rediger: true, gerer: true, parametrer: true };
    case 'responsable': return { consulter: true, rediger: true, gerer: true, parametrer: false };
    case 'intervenant': return { consulter: true, rediger: true, gerer: false, parametrer: false };
    case 'lecture': return { consulter: true, rediger: false, gerer: false, parametrer: false };
    default: return { ...AUCUN_DROIT };
  }
}

export const DROIT_LABEL: Record<Droit, string> = {
  consulter: 'consultation',
  rediger: 'rédaction (notes, relance individuelle, historique)',
  gerer: 'envoi groupé',
  parametrer: 'paramétrage (administrateurs)',
};
