'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent as ReactDragEvent } from 'react';

/**
 * Glisser-déposer d'images sur une zone.
 *
 * `over` sert à colorer la zone survolée. Le compteur `depth` est nécessaire :
 * `dragleave` se déclenche aussi au passage sur un enfant de la zone, et sans
 * lui la bordure clignoterait dès que le curseur survole la vignette ou le
 * bouton contenus dans la zone.
 */
function carriesFiles(e: ReactDragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files');
}

export function useImageDrop(onFiles: (files: File[]) => void) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);

  const reset = useCallback(() => {
    depth.current = 0;
    setOver(false);
  }, []);

  return {
    over,
    dropProps: {
      onDragEnter: (e: ReactDragEvent) => {
        if (!carriesFiles(e)) return;
        e.preventDefault();
        depth.current += 1;
        setOver(true);
      },
      onDragOver: (e: ReactDragEvent) => {
        if (!carriesFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      },
      onDragLeave: (e: ReactDragEvent) => {
        if (!carriesFiles(e)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      },
      onDrop: (e: ReactDragEvent) => {
        if (!carriesFiles(e)) return;
        e.preventDefault();
        reset();
        const files = Array.from(e.dataTransfer.files).filter(
          (f) => !f.type || f.type.startsWith('image/'),
        );
        if (files.length) onFiles(files);
      },
    },
  };
}

/**
 * Empêche le navigateur d'OUVRIR un fichier lâché à côté d'une zone de dépôt :
 * par défaut il quitte la page, ce qui ferait perdre le texte déjà saisi.
 */
export function useWindowDropGuard() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    window.addEventListener('dragover', stop);
    window.addEventListener('drop', stop);
    return () => {
      window.removeEventListener('dragover', stop);
      window.removeEventListener('drop', stop);
    };
  }, []);
}
