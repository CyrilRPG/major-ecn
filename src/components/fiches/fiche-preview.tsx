'use client';

/**
 * Aperçu en direct d'une fiche : rend <FicheDocument /> DANS une iframe isolée
 * (le CSS « charte » cible html/body/@page → on l'isole pour ne pas polluer
 * l'app). Le même composant alimente le PDF serveur → aperçu = PDF.
 *
 * On porte le rendu React dans le <body> de l'iframe via createPortal : toute
 * modification de `fiche` se reflète instantanément.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FicheDocument } from '@/lib/fiches/fiche-document';
import { ficheCss } from '@/lib/fiches/css';
import type { FicheData } from '@/lib/fiches/types';

export function FichePreview({ fiche, className }: { fiche: FicheData; className?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body></body></html>');
    doc.close();

    const style = doc.createElement('style');
    style.textContent =
      ficheCss('/fonts/fiches') +
      // Confort d'aperçu : fond gris + page blanche centrée (le PDF, lui, gère
      // les marges/pagination via Chromium).
      `\nhtml{background:#EEF0F3;} body{max-width:210mm;margin:0 auto;background:#fff;` +
      `box-shadow:0 1px 12px rgba(0,0,0,.12);padding:14mm 18mm;}` +
      `\n.cover{margin:-14mm -18mm 14mm;width:auto;}`;
    doc.head.appendChild(style);

    setMount(doc.body);
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Aperçu de la fiche"
        className={className ?? 'h-full w-full border-0 bg-[#EEF0F3]'}
      />
      {mount && createPortal(<FicheDocument fiche={fiche} />, mount)}
    </>
  );
}
