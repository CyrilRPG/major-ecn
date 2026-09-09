'use client';

/**
 * Rendu d'une fiche PDF en <canvas> (react-pdf / pdf.js) — volontairement
 * SANS visionneuse native : pas de barre d'outils navigateur, donc pas de
 * bouton de téléchargement / impression, et pas de couche texte sélectionnable.
 * À charger uniquement côté client (dynamic ssr:false) : pdf.js référence
 * `DOMMatrix` à l'évaluation du module, indisponible côté serveur.
 *
 * Deux garde-fous mémoire, indispensables sur mobile (une fiche de 50 pages
 * rendue d'un bloc en canvas faisait planter l'onglet des téléphones modestes,
 * symptôme « this page couldn't load ») :
 *  - chaque page n'est dessinée que lorsqu'elle approche de l'écran
 *    (IntersectionObserver), un simple gabarit vide tenant sa place avant ;
 *  - la densité de pixels est plafonnée à 2 (les écrans à DPR 3 tripleraient
 *    la mémoire canvas pour un gain invisible sur un document).
 *
 * Deux filets de sécurité pour les navigateurs anciens (Chrome < 119,
 * Safari < 17.4) : le polyfill importé en PREMIER ci-dessous, et un repli sur
 * la visionneuse native (iframe) si pdf.js lève malgré tout une exception à
 * l'exécution — le `.catch` du `dynamic()` de pdf-viewer ne couvre que
 * l'échec de chargement du module, pas une erreur pendant le rendu.
 */
import '@/lib/polyfills/pdfjs-compat';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import PdfFallbackFrame from './pdf-fallback-frame';

// Worker servi en same-origin depuis /public. Le suffixe ?v=<version> casse
// le cache navigateur quand la version de pdf.js change (sinon « API version
// does not match the Worker version »).
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs?v=${pdfjs.version}`;

/** Densité de pixels de rendu, plafonnée pour contenir la mémoire canvas. */
const MAX_DPR = 2;

/** Page rendue à l'approche de l'écran seulement ; avant cela, un bloc vide
 *  de la même hauteur tient sa place pour que la barre de défilement soit juste. */
function LazyPage({
  pageNumber,
  width,
  ratio,
  root,
  onRatio,
}: {
  pageNumber: number;
  width: number;
  /** hauteur/largeur de la page (celle de la 1re page rendue, √2 par défaut). */
  ratio: number;
  /** Conteneur défilant (référence lue dans l'effet, jamais pendant le rendu). */
  root: React.RefObject<HTMLDivElement | null>;
  onRatio: (r: number) => void;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  // Les 2 premières pages tout de suite ; sans IntersectionObserver, tout de
  // suite aussi (comportement d'avant). Module client-only : window existe.
  const [visible, setVisible] = useState(
    () => pageNumber <= 2 || typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    if (visible) return;
    const el = holderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      // Une hauteur d'écran d'avance : la page est prête quand on y arrive.
      { root: root.current, rootMargin: '100% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, root]);

  return (
    <div ref={holderRef} style={visible ? undefined : { width, height: Math.round(width * ratio) }}>
      {visible && (
        <Page
          pageNumber={pageNumber}
          width={width}
          devicePixelRatio={Math.min(
            MAX_DPR,
            typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
          )}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onLoadSuccess={(page) => {
            if (page.width > 0) onRatio(page.height / page.width);
          }}
          className="shadow-[0_4px_18px_-8px_rgba(15,31,77,0.35)]"
        />
      )}
    </div>
  );
}

/**
 * Capture toute exception levée par pdf.js pendant le rendu (y compris dans
 * les effets de react-pdf) et bascule sur la visionneuse native, au lieu de
 * laisser remonter l'erreur jusqu'à l'écran « Une erreur est survenue ».
 */
class PdfErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[fiche] pdf.js indisponible, repli sur la visionneuse native :', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function PdfCanvas(props: { src: string; zoom?: number }) {
  const [fallback, setFallback] = useState(false);
  if (fallback) return <PdfFallbackFrame src={props.src} zoom={props.zoom} />;
  return (
    <PdfErrorBoundary fallback={<PdfFallbackFrame src={props.src} zoom={props.zoom} />}>
      <PdfCanvasInner {...props} onFatal={() => setFallback(true)} />
    </PdfErrorBoundary>
  );
}

function PdfCanvasInner({ src, zoom = 1, onFatal }: { src: string; zoom?: number; onFatal: () => void }) {
  const [numPages, setNumPages] = useState(0);
  const [baseWidth, setBaseWidth] = useState(820);
  const [ratio, setRatio] = useState(Math.SQRT2); // A4 en attendant la vraie valeur
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
        // Une erreur de pdf.js (module, worker, mémoire…) ne doit jamais
        // priver l'élève de sa fiche : on repasse à la visionneuse native.
        onLoadError={onFatal}
        onSourceError={onFatal}
        loading={<div className="py-24 text-sm text-(--color-ink-soft)">Chargement de la fiche…</div>}
        error={<div className="py-24 text-sm text-(--color-ink-soft)">Impossible d’afficher la fiche pour le moment. Rechargez la page ou vérifiez votre connexion.</div>}
        className="flex flex-col items-center gap-4 py-4"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <LazyPage
            key={i}
            pageNumber={i + 1}
            width={pageWidth}
            ratio={ratio}
            root={wrapRef}
            onRatio={setRatio}
          />
        ))}
      </Document>
    </div>
  );
}
