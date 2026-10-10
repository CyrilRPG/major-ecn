import { STATUTS_ACTION, type StatutAction } from './types';

/**
 * Cycle de vie d'une action corrective (§23) — module PUR, testé.
 *
 *   Nouveau → En analyse → Action décidée → En cours → Réalisé
 *           → Efficacité à vérifier → Clôturé
 *
 * Classement sans suite possible à toute étape non close, avec justification
 * conservée. Le retour à l'étape précédente est permis (correction). La
 * clôture exige une validation humaine explicite et le constat d'efficacité.
 */

const CHAINE: StatutAction[] = ['nouveau', 'en_analyse', 'action_decidee', 'en_cours', 'realise', 'efficacite_a_verifier', 'cloture'];

export type ChampsAction = {
  cause?: string | null;
  action_decidee?: string | null;
  responsable_id?: string | null;
  echeance?: string | null;
  efficacite_constat?: string | null;
  justification_sans_suite?: string | null;
};

export function transitionsPossibles(statut: StatutAction): StatutAction[] {
  if (statut === 'cloture' || statut === 'sans_suite') return [];
  const i = CHAINE.indexOf(statut);
  const out: StatutAction[] = [];
  if (i >= 0 && i < CHAINE.length - 1) out.push(CHAINE[i + 1]);
  if (i > 0) out.push(CHAINE[i - 1]);
  out.push('sans_suite');
  return out;
}

/** Message d'erreur si la transition est refusée, null sinon. */
export function verifierTransition(de: StatutAction, vers: StatutAction, champs: ChampsAction): string | null {
  if (!(STATUTS_ACTION as readonly string[]).includes(vers)) return 'Statut inconnu.';
  if (!transitionsPossibles(de).includes(vers)) return `Passage de « ${de} » à « ${vers} » impossible.`;
  const rempli = (v: string | null | undefined) => typeof v === 'string' && v.trim().length >= 3;
  if (vers === 'sans_suite' && !rempli(champs.justification_sans_suite)) return 'Un classement sans suite doit être justifié.';
  if (vers === 'action_decidee' && !rempli(champs.action_decidee)) return "Décrivez l'action décidée.";
  if (vers === 'en_cours' && !champs.responsable_id) return 'Désignez un responsable avant de lancer l’action.';
  if (vers === 'cloture' && !rempli(champs.efficacite_constat)) return "Renseignez le constat d'efficacité avant de clôturer.";
  return null;
}

/** Action en retard : échéance passée et ni réalisée ni close. */
export function actionEnRetard(a: { statut: StatutAction; echeance: string | null }, aujourdHui: string): boolean {
  if (!a.echeance) return false;
  if (['realise', 'efficacite_a_verifier', 'cloture', 'sans_suite'].includes(a.statut)) return false;
  return a.echeance < aujourdHui;
}
