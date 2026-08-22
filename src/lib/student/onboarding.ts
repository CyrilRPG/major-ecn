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
} as const;

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

/** Seuil `lg` de Tailwind : en dessous, le menu latéral est un tiroir. */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(min-width: 1024px)').matches;
}
