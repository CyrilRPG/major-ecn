/**
 * Parcours d'accueil de l'élève — source unique des clés et des utilitaires.
 *
 * Le tutoriel est une chaîne : popup d'accueil → tutoriel pas à pas → flèches
 * sur le menu → flèche sur l'aperçu d'un item → flèche sur l'assistant. Chaque
 * étape a sa propre clé localStorage ; elles étaient déclarées en double dans
 * quatre composants, ce qui rendait impossible toute remise à zéro globale.
 * Elles sont désormais toutes ici, avec `resetOnboarding()` — indispensable
 * pour « Revoir le tutoriel » : sans lui, une fois les étapes vues, plus
 * personne ne pouvait les revoir (seul le grand popup avait `?tutoriel=1`).
 */

export const ONBOARDING_KEYS = {
  /** Grand tutoriel pas à pas (v3 = correctif d'ouverture sans popup d'accueil). */
  tutorial: 'major-ecn:student-tutorial-dismissed:v3',
  /** Flèches 1 et 2 : choisir une matière, ouvrir un item. */
  tour: 'major-ecn:onboarding-tour-v1',
  /** Flèche 3 : la grille de contenus d'un item. */
  apercu: 'major-ecn:onboarding-apercu-v1',
  /** Flèche 4 : le bouton Assistant. */
  assistant: 'major-ecn:onboarding-assistant-v1',
  /** Popup d'accueil (« Conseils de préparation »). */
  welcome: 'major-ecn:conseils-dismissed',
  /** Annonce de la section « Parcours du Major ». */
  parcoursMajor: 'major-ecn:parcours-major-popup-v1',
} as const;

/**
 * ORDRE DU PARCOURS D'ACCUEIL — du général au particulier.
 *
 *   1. `welcome`       « Bienvenue sur Major ECN » : à quoi sert la plateforme.
 *   2. `tutorial`      le gros tutoriel pas à pas, qu'on peut passer.
 *   3. `parcoursMajor` l'annonce de la section Parcours du Major.
 *   4. `menuTour`      les flèches sur le menu : choisir une matière, un item.
 *   5. `apercu`        la flèche sur la grille de contenus d'un item.
 *   6. `assistant`     la flèche sur le bouton Assistant.
 *
 * Les trois premières sont des fenêtres qui expliquent ; les trois suivantes
 * des bulles qui désignent un élément à l'écran. On explique avant de montrer,
 * et jamais deux choses à la fois.
 */
export const ONBOARDING_SEQUENCE = [
  'welcome', 'tutorial', 'parcoursMajor', 'menuTour', 'apercu', 'assistant',
] as const;

export type OnboardingStep = (typeof ONBOARDING_SEQUENCE)[number];

/**
 * File d'attente du parcours.
 *
 * Chaque composant s'inscrit au montage en disant s'il compte jouer son étape.
 * Il n'ouvre sa fenêtre que lorsque TOUTES les étapes qui le précèdent sont
 * terminées ou déclarées sans objet. Une étape dont le composant n'est pas
 * monté — la flèche « aperçu » sur une page de fiche, l'annonce du Parcours du
 * Major pour un élève qui n'y a pas droit — est simplement absente de la
 * table : elle ne retient personne.
 *
 * Ce registre remplace un ordonnancement par délais d'attente. Celui-ci
 * supposait que l'élève lirait vite : passé un budget fixe, les étapes
 * suivantes étaient abandonnées, et les flèches du menu ne venaient jamais pour
 * qui prenait le temps de lire le tutoriel. Un ordre explicite ne dépend plus
 * du rythme de lecture.
 */
type StepState = 'waiting' | 'active' | 'done';
const stepStates = new Map<OnboardingStep, StepState>();

/** Inscrit une étape. `willRun` à faux = étape sans objet pour cette visite. */
export function declareStep(step: OnboardingStep, willRun: boolean): () => void {
  stepStates.set(step, willRun ? 'waiting' : 'done');
  return () => { stepStates.delete(step); };
}

export function markStepActive(step: OnboardingStep) { stepStates.set(step, 'active'); }
export function markStepDone(step: OnboardingStep) { stepStates.set(step, 'done'); }

/** Le tour de `step` est-il venu ? */
export function stepIsReady(step: OnboardingStep): boolean {
  for (const s of ONBOARDING_SEQUENCE) {
    if (s === step) break;
    const state = stepStates.get(s);
    // `undefined` = composant non monté, donc rien à attendre de cette étape.
    if (state === 'waiting' || state === 'active') return false;
  }
  // Garde-fou pour les fenêtres hors parcours : popup vidéo d'un item,
  // complétion de profil obligatoire, formulaire de satisfaction.
  return !screenIsBusy();
}

/**
 * Appelle `onTurn` dès que le tour de l'étape est venu. Sans échéance : l'élève
 * peut lire aussi longtemps qu'il veut, le sondage ne coûte qu'un
 * `querySelector`. L'annulation se fait au démontage.
 */
export function whenStepTurnComes(
  step: OnboardingStep,
  onTurn: () => void,
  { intervalMs = 400 }: { intervalMs?: number } = {},
): () => void {
  let cancelled = false;
  const id = window.setInterval(() => {
    if (cancelled || !stepIsReady(step)) return;
    window.clearInterval(id);
    onTurn();
  }, intervalMs);
  return () => { cancelled = true; window.clearInterval(id); };
}

/** Ouvre / ferme le tiroir de navigation mobile depuis n'importe quel composant. */
export const MENU_OPEN_EVENT = 'mecn:menu-open';
export const MENU_CLOSE_EVENT = 'mecn:menu-close';

/** Le paramètre `?tutoriel=1` rejoue tout le parcours d'accueil. */
export function isReplayRequested(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('tutoriel') === '1';
}

/**
 * Identifiant de l'élève connecté, posé par le layout (student) sur son nœud
 * racine. Sert à cloisonner les étapes vues PAR COMPTE.
 *
 * Sans lui, les clés étaient globales au navigateur : un administrateur qui
 * avait fermé le tutoriel une fois le neutralisait pour tous les comptes
 * ouverts ensuite sur la même machine — au premier chef les élèves consultés
 * via « se connecter en tant que », qui n'avaient donc JAMAIS de tutoriel. Même
 * effet sur un ordinateur partagé entre deux élèves.
 */
function currentUserId(): string | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector('[data-onboarding-user]')
    ?.getAttribute('data-onboarding-user') || null;
}

function scoped(key: string): string {
  const uid = currentUserId();
  return uid ? `${key}::${uid}` : key;
}

export function readFlag(key: string): boolean {
  try {
    return !!localStorage.getItem(scoped(key));
  } catch {
    // Stockage refusé (navigation privée, WebView verrouillée) : on considère
    // l'étape NON vue plutôt que de la sauter — mieux vaut un rappel de trop
    // qu'un tutoriel qui n'apparaît jamais.
    return false;
  }
}

export function writeFlag(key: string) {
  try {
    localStorage.setItem(scoped(key), '1');
  } catch {
    /* stockage indisponible : l'étape se rejouera, sans conséquence */
  }
}

/** Efface toutes les étapes vues : le parcours complet se rejoue au prochain rendu. */
export function resetOnboarding() {
  try {
    for (const key of Object.values(ONBOARDING_KEYS)) {
      localStorage.removeItem(scoped(key));
      // Ancienne clé non cloisonnée : purgée aussi, sinon un « Revoir le
      // tutoriel » laisserait derrière lui le verrou d'avant le cloisonnement.
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Attend qu'un élément soit monté ET visible, en sondant.
 *
 * Remplace les `setTimeout` uniques des coach-marks : une seule mesure à 700 ms
 * échoue dès que la page est un peu lente (hydratation, données, image), et
 * comme rien ne réessaie l'étape ne s'affichait plus jamais — c'est ce qui
 * cassait la chaîne, la flèche « assistant » attendant la fin de la flèche
 * « aperçu » qui, elle, n'était jamais passée.
 *
 * Renvoie une fonction d'annulation à appeler au démontage.
 */
export function waitForElement(
  selector: string,
  onFound: (el: HTMLElement) => void,
  { timeoutMs = 15_000, intervalMs = 300, onTimeout, ready }: {
    timeoutMs?: number;
    intervalMs?: number;
    onTimeout?: () => void;
    /** Condition supplémentaire : tant qu'elle est fausse, on patiente. */
    ready?: () => boolean;
  } = {},
): () => void {
  let cancelled = false;
  const started = Date.now();
  const id = window.setInterval(() => {
    if (cancelled) return;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el && el.getBoundingClientRect().width > 0 && (ready?.() ?? true)) {
      window.clearInterval(id);
      onFound(el);
      return;
    }
    if (Date.now() - started > timeoutMs) {
      window.clearInterval(id);
      onTimeout?.();
    }
  }, intervalMs);
  return () => {
    cancelled = true;
    window.clearInterval(id);
  };
}

/**
 * Une fenêtre modale ou une bulle de conseil occupe-t-elle l'écran ?
 *
 * Le tiroir de navigation mobile est explicitement écarté : il est bien une
 * modale au sens de l'accessibilité, mais c'est la visite guidée elle-même qui
 * l'ouvre pour pouvoir désigner un collège. Le compter ici la faisait se
 * bloquer sur sa propre action, et aucune flèche n'apparaissait sur téléphone.
 */
export function screenIsBusy(): boolean {
  if (typeof document === 'undefined') return true;
  return !!document.querySelector(
    '[aria-modal="true"]:not([data-nav-drawer]), [data-coachmark]',
  );
}

/** Seuil `lg` de Tailwind : en dessous, le menu latéral est un tiroir. */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(min-width: 1024px)').matches;
}
