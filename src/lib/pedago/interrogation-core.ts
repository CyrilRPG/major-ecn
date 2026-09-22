import { canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import type { PermissionScope } from '@/types/domain';

/**
 * Règles PURES de l'interrogation de fin de parcours, sans lecture de base
 * (testées par `tests/pedago-interrogation.test.ts`). `interrogation.ts`
 * (server-only) fait les lectures et les applique pour la page web, son pendant
 * mobile et les deux verrous (layout élève, `/api/mobile/gates`).
 */

/**
 * Item dont l'interrogation s'ouvre sans QCM ni flashcards (contournement
 * historique) : la page n'y exige rien, le verrou s'y déclenche dès vidéo + fiche.
 */
export const PNEUMO_COURS_ID = '33579977-020e-4c94-a561-dee9d3c7bc70';

/** Questions tirées par l'interrogation automatique. */
export const N_QUESTIONS_INTERROGATION = 15;

/** L'élève, tel que le lisent le layout (`requireUser`) et les routes mobiles. */
export type ProfilInterrogation = {
  id: string;
  role: string | null | undefined;
  permission_scope: unknown;
};

export type CoursInterrogation = { id: string; titre: string; matiere_id: string };

/** Les quatre étapes du parcours qu'exige l'interrogation. */
export type PrerequisInterrogation = {
  video: boolean;
  fiche: boolean;
  /** Au moins une réponse enregistrée (`qcm_attempts`) sur un QCM du cours. */
  qcm: boolean;
  /** Au moins une révision (`flashcard_reviews`) d'une flashcard du cours. */
  flashcards: boolean;
};

/**
 * La page d'interrogation s'ouvre-t-elle pour cet élève ? Les refus suivent
 * l'ordre des contrôles de la page, qui décide de la redirection
 * (`redirectionDuRefus`).
 */
export type OuvertureInterrogation =
  | { ok: true; cours: CoursInterrogation }
  | { ok: false; refus: 'introuvable' }
  | { ok: false; refus: 'college' | 'cours' | 'formule'; cours: CoursInterrogation }
  | { ok: false; refus: 'prerequis'; cours: CoursInterrogation; prerequis: PrerequisInterrogation };

export const AUCUN_PREREQUIS: PrerequisInterrogation = { video: false, fiche: false, qcm: false, flashcards: false };

export function prerequisRemplis(coursId: string, p: PrerequisInterrogation): boolean {
  return coursId === PNEUMO_COURS_ID || (p.video && p.fiche && p.qcm && p.flashcards);
}

/**
 * Décision de la page pour un cours.
 *  - `cours` : `null` si la RLS le masque à l'élève ou s'il n'a pas de collège ;
 *  - `formuleOuvre` : la formule (union multi-formules + surcharges) ouvre
 *    l'interrogation ;
 *  - l'administrateur passe les contrôles d'accès, pas ceux du parcours.
 */
export function decisionOuverture(args: {
  cours: CoursInterrogation | null;
  estAdmin: boolean;
  scope: PermissionScope;
  formuleOuvre: boolean;
  prerequis: PrerequisInterrogation;
}): OuvertureInterrogation {
  const { cours, estAdmin, scope, formuleOuvre, prerequis } = args;
  if (!cours) return { ok: false, refus: 'introuvable' };
  if (!estAdmin && !canAccessCollege(scope, cours.matiere_id)) return { ok: false, refus: 'college', cours };
  if (!estAdmin && !canAccessCours(scope, cours.matiere_id, cours.id)) return { ok: false, refus: 'cours', cours };
  if (!estAdmin && !formuleOuvre) return { ok: false, refus: 'formule', cours };
  if (!prerequisRemplis(cours.id, prerequis)) return { ok: false, refus: 'prerequis', cours, prerequis };
  return { ok: true, cours };
}

/** Où la page web renvoie un refus ; `null` : page introuvable (404). */
export function redirectionDuRefus(o: Exclude<OuvertureInterrogation, { ok: true }>): string | null {
  switch (o.refus) {
    case 'introuvable': return null;
    case 'college': return '/facultes';
    case 'cours': return `/matieres/${o.cours.matiere_id}`;
    case 'formule':
    case 'prerequis':
      return `/cours/${o.cours.id}`;
  }
}

/**
 * Cours que le verrou examine : vidéo vue ET fiche lue (`progres` ne porte que
 * ces lignes), certificat non signé, sans doublon, dans l'ordre reçu.
 */
export function candidatsDuVerrou(
  progres: readonly { cours_id: string }[],
  completions: readonly { cours_id: string; certificate_signed_at: string | null }[],
): string[] {
  const signes = new Set(completions.filter((c) => !!c.certificate_signed_at).map((c) => c.cours_id));
  return [...new Set(progres.map((p) => p.cours_id))].filter((id) => !signes.has(id));
}
