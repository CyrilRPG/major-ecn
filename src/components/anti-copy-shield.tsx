'use client';

import { useEffect } from 'react';

/**
 * AntiCopyShield — empêche le copier-coller, le clic-droit, le glisser-déposer
 * et certains raccourcis clavier (Ctrl+C / Ctrl+X / Ctrl+S / Ctrl+P / Ctrl+U).
 *
 * Les champs de saisie (input/textarea/contenteditable) sont autorisés afin
 * que les formulaires restent fonctionnels (paiement, contact, espace
 * découverte, etc.).
 *
 * Approche complémentaire au CSS `user-select: none` dans globals.css :
 *  - CSS : empêche la sélection visuelle.
 *  - JS  : intercepte les événements & raccourcis.
 *
 * Composant monté au niveau du RootLayout (cf. src/app/layout.tsx).
 */
export function AntiCopyShield() {
  useEffect(() => {
    /** Vrai si l'utilisateur est dans un champ de saisie / éditable. */
    function isEditable(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (target.isContentEditable) return true;
      // Permet d'autoriser des conteneurs annotés .allow-select.
      if (target.closest('.allow-select')) return true;
      return false;
    }

    /** Bloque un event s'il ne provient pas d'un champ éditable. */
    function block(e: Event) {
      if (isEditable(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    }

    /** Bloque clic-droit hors champ éditable. */
    function onContext(e: MouseEvent) {
      if (isEditable(e.target)) return;
      e.preventDefault();
    }

    /** Bloque certains raccourcis (sauf dans les champs). */
    function onKeyDown(e: KeyboardEvent) {
      if (isEditable(e.target)) return;
      const k = e.key.toLowerCase();
      // Ctrl/Cmd + C, X, S, P, U, A → copier / couper / save / print / source / select-all
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 's', 'p', 'u', 'a'].includes(k)) {
        e.preventDefault();
      }
      // F12 / Ctrl+Shift+I/J/C → devtools (on bloque la touche, sans illusion : un dev
      // motivé y accède quand même, mais on dissuade la majorité).
      if (k === 'f12') e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(k)) {
        e.preventDefault();
      }
    }

    document.addEventListener('copy', block, true);
    document.addEventListener('cut', block, true);
    document.addEventListener('dragstart', block, true);
    document.addEventListener('selectstart', block, true);
    document.addEventListener('contextmenu', onContext, true);
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('copy', block, true);
      document.removeEventListener('cut', block, true);
      document.removeEventListener('dragstart', block, true);
      document.removeEventListener('selectstart', block, true);
      document.removeEventListener('contextmenu', onContext, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);

  return null;
}
