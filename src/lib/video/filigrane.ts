/**
 * Filigrane nominatif des vidéos (« Accès réservé à … ») — construit HORS de
 * React et surveillé : supprimé, masqué ou rendu transparent (outils de
 * développement, extension, feuille de style injectée), il est aussitôt
 * recréé et `onAlteration` est appelé (le lecteur met alors la vidéo en pause).
 *
 *  - styles en ligne `!important` : ils l'emportent sur toute règle de feuille
 *    de style, même `!important` ;
 *  - attribut de repérage tiré au hasard à chaque pose : aucun sélecteur ne
 *    peut le viser à l'avance.
 *
 * Module DOM sans dépendance (copiable tel quel dans l'app mobile).
 *
 * Aucune `transform` ni aucun ancêtre arrondi/rogné sur l'iframe : Chrome
 * découpe alors l'iframe d'un autre domaine par masque et perd le glisser de
 * la barre de lecture (constaté le 08/10/2026 : seek impossible hors plein
 * écran).
 */

const BANDES = [
  { top: 20, sombre: true },
  { top: 40, sombre: false },
  { top: 60, sombre: true },
  { top: 80, sombre: false },
] as const;

const OPACITE = 0.3;

function fixer(el: HTMLElement, styles: Record<string, string>) {
  for (const [k, v] of Object.entries(styles)) el.style.setProperty(k, v, 'important');
}

function construire(texte: string, attr: string): HTMLDivElement {
  const calque = document.createElement('div');
  calque.setAttribute(attr, '');
  calque.setAttribute('aria-hidden', 'true');
  fixer(calque, {
    position: 'absolute', inset: '0', 'z-index': '20', overflow: 'hidden', display: 'block',
    visibility: 'visible', opacity: '1', 'pointer-events': 'none', 'user-select': 'none',
    filter: 'none', 'clip-path': 'none', margin: '0', padding: '0', background: 'transparent',
  });
  for (const b of BANDES) {
    const s = document.createElement('span');
    s.textContent = texte;
    fixer(s, {
      position: 'absolute', left: '0', right: '0', display: 'block', visibility: 'visible',
      // Centrée sur la ligne sans `transform` (cf. en-tête).
      top: `calc(${b.top}% - 0.65em)`,
      'text-align': 'center', 'white-space': 'nowrap', 'pointer-events': 'none',
      'font-weight': '600', 'letter-spacing': '0.025em', 'line-height': '1.3',
      'font-size': 'clamp(12px, 2.1vw, 20px)', 'font-family': 'inherit',
      opacity: String(OPACITE),
      color: b.sombre ? '#111111' : '#ffffff',
      'text-shadow': b.sombre
        ? '0 0 6px rgba(255,255,255,0.95), 0 1px 2px rgba(255,255,255,0.85)'
        : '0 0 6px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.85)',
    });
    calque.appendChild(s);
  }
  return calque;
}

/** Le filigrane est-il présent, entier et visible ? */
function intact(hote: HTMLElement, calque: HTMLElement | null, texte: string): boolean {
  if (!calque || calque.parentElement !== hote) return false;
  const spans = calque.querySelectorAll('span');
  if (spans.length !== BANDES.length || calque.children.length !== BANDES.length) return false;
  const cs = getComputedStyle(calque);
  if (cs.display === 'none' || cs.visibility !== 'visible' || Number(cs.opacity) < 0.95) return false;
  for (const s of spans) {
    if (s.textContent !== texte) return false;
    const ss = getComputedStyle(s);
    if (ss.display === 'none' || ss.visibility !== 'visible' || Number(ss.opacity) < OPACITE - 0.05) return false;
    if (ss.color === 'transparent' || ss.color === 'rgba(0, 0, 0, 0)' || parseFloat(ss.fontSize) < 10) return false;
  }
  return calque.offsetWidth >= hote.offsetWidth * 0.9 && calque.offsetHeight >= hote.offsetHeight * 0.9;
}

/**
 * Pose le filigrane dans `hote` (positionné) et le garde en place.
 * Renvoie la fonction de nettoyage.
 */
export function poserFiligrane(hote: HTMLElement, texte: string, onAlteration: () => void): () => void {
  let actif = true;
  let calque: HTMLDivElement | null = null;
  const reposer = () => {
    calque?.remove();
    calque = construire(texte, `data-f${Math.random().toString(36).slice(2, 10)}`);
    hote.appendChild(calque);
  };
  const verifier = () => {
    if (!actif) return;
    if (!intact(hote, calque, texte)) { reposer(); onAlteration(); }
  };
  reposer();
  // Suppression / modification du DOM ou des styles : réaction immédiate.
  const obs = new MutationObserver(() => verifier());
  obs.observe(hote, { childList: true, subtree: true, attributes: true, characterData: true });
  // Feuille de style injectée, zoom, etc. : contrôle périodique.
  const t = window.setInterval(verifier, 1500);
  return () => { actif = false; obs.disconnect(); window.clearInterval(t); calque?.remove(); };
}
