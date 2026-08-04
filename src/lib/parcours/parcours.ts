/**
 * Parcours du Major — logique métier partagée (serveur + client).
 *
 * Règles clés :
 *  - 42 parcours qui se suivent ; il faut TERMINER le précédent pour ouvrir le
 *    suivant (peu importe la note — « finir » suffit).
 *  - Deux parcours s'ouvrent chaque lundi 10h (Europe/Paris) ; les deux premiers
 *    sont ouverts dès le lancement. La date est portée par `available_at`.
 *  - Note /10 : < 6 « à retravailler », 6–8 « en bonne voie », > 8 « maîtrisé ».
 */

export type ParcoursBand = 'a_retravailler' | 'en_bonne_voie' | 'maitrise';

export const BAND_META: Record<ParcoursBand, {
  label: string; court: string; color: string; bg: string; ring: string;
}> = {
  a_retravailler: { label: 'À retravailler', court: 'À retravailler', color: '#DC2626', bg: '#FEE2E2', ring: 'rgba(220,38,38,0.35)' },
  en_bonne_voie: { label: 'En bonne voie', court: 'En bonne voie', color: '#D97706', bg: '#FEF3C7', ring: 'rgba(217,119,6,0.35)' },
  maitrise: { label: 'Maîtrisé', court: 'Maîtrisé', color: '#059669', bg: '#D1FAE5', ring: 'rgba(5,150,105,0.35)' },
};

/** Bande d'une note /10 : < 6 à retravailler, 6–8 en bonne voie, > 8 maîtrisé. */
export function scoreBand(score10: number): ParcoursBand {
  if (score10 < 6) return 'a_retravailler';
  if (score10 <= 8) return 'en_bonne_voie';
  return 'maitrise';
}

/** Note /10 arrondie au dixième à partir du nombre de bonnes réponses. */
export function computeScore10(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 1000) / 100;
}

export type ParcoursState =
  | { kind: 'completed'; band: ParcoursBand; score: number }
  | { kind: 'current' }        // ouvert, précédent terminé, pas encore fait
  | { kind: 'locked_prev' }    // ouvert mais précédent non terminé
  | { kind: 'locked_date'; availableAt: string }; // pas encore ouvert (date)

export type ParcoursLite = {
  id: string;
  numero: number;
  titre: string;
  sousTitre: string | null;
  availableAt: string; // ISO
};

export type CompletionLite = { parcoursId: string; band: ParcoursBand; score: number };

/**
 * Calcule l'état de chaque parcours pour un élève, dans l'ordre des `numero`.
 *
 * Déblocage séquentiel : le parcours N est jouable si sa date est passée ET que
 * le parcours N-1 est terminé. Le staff (`isStaff`) voit tout comme jouable
 * (accès admin à tous les parcours, passés comme à venir).
 */
export function computeStates(
  parcours: ParcoursLite[],
  completions: CompletionLite[],
  now: Date,
  isStaff: boolean,
): Map<string, ParcoursState> {
  const byParcours = new Map(completions.map((c) => [c.parcoursId, c]));
  const ordered = [...parcours].sort((a, b) => a.numero - b.numero);
  const states = new Map<string, ParcoursState>();
  let prevDone = true; // le tout premier n'a pas de prérequis

  for (const p of ordered) {
    const done = byParcours.get(p.id);
    const opened = isStaff || new Date(p.availableAt).getTime() <= now.getTime();

    if (done) {
      states.set(p.id, { kind: 'completed', band: done.band, score: done.score });
    } else if (!opened) {
      states.set(p.id, { kind: 'locked_date', availableAt: p.availableAt });
    } else if (!prevDone && !isStaff) {
      states.set(p.id, { kind: 'locked_prev' });
    } else {
      states.set(p.id, { kind: 'current' });
    }
    // « terminé » pour la logique de déblocage = une complétion existe.
    prevDone = !!done;
  }
  return states;
}

/**
 * Un élève peut-il JOUER ce parcours maintenant ? (date passée + précédent
 * terminé, ou staff). Rejouer un parcours déjà terminé reste autorisé.
 */
export function peutJouer(
  parcours: ParcoursLite[],
  completions: CompletionLite[],
  cibleId: string,
  now: Date,
  isStaff: boolean,
): boolean {
  if (isStaff) return true;
  const states = computeStates(parcours, completions, now, false);
  const st = states.get(cibleId);
  return st?.kind === 'current' || st?.kind === 'completed';
}

/** Prochaine ouverture (plus petite `available_at` future). Null si tout est ouvert. */
export function prochaineOuverture(parcours: ParcoursLite[], now: Date): string | null {
  const futures = parcours
    .map((p) => p.availableAt)
    .filter((d) => new Date(d).getTime() > now.getTime())
    .sort();
  return futures[0] ?? null;
}

/** Date + heure lisibles en français (Europe/Paris). */
export function formatOuverture(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris',
  }).format(d);
  const heure = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
  }).format(d);
  return `${date} à ${heure}`;
}
