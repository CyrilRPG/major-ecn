'use client';

/**
 * Rendu d'une fiche PDF en <canvas> (react-pdf / pdf.js) — volontairement
 * SANS visionneuse native : pas de barre d'outils navigateur, donc pas de
 * bouton de téléchargement / impression, et pas de couche texte sélectionnable.
 * À charger uniquement côté client (dynamic ssr:false) : pdf.js référence
 * `DOMMatrix` à l'évaluation du module, indisponible côté serveur.
 */
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Worker servi en same-origin depuis /public. Le suffixe ?v=<version> casse
// le cache navigateur quand la version de pdf.js change (sinon « API version
// does not match the Worker version »).
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs?v=${pdfjs.version}`;

export default function PdfCanvas({ src, zoom = 1 }: { src: string; zoom?: number }) {
  const [numPages, setNumPages] = useState(0);
  const [baseWidth, setBaseWidth] = useState(820);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w) setBaseWidth(Math.min(w, 1100));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pageWidth = Math.max(280, baseWidth - 24) * zoom;

  return (
    <div
      ref={wrapRef}
      className="flex h-full w-full select-none justify-center overflow-auto bg-slate-100"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Document
        file={src}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<div className="py-24 text-sm text-(--color-ink-soft)">Chargement de la fiche…</div>}
        error={<div className="py-24 text-sm text-(--color-ink-soft)">Impossible d’afficher la fiche pour le moment.</div>}
        className="flex flex-col items-center gap-4 py-4"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-[0_4px_18px_-8px_rgba(15,31,77,0.35)]"
          />
        ))}
      </Document>
    </div>
  );
}
