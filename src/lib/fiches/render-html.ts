/**
 * Assemblage du document HTML d'une fiche (sans React) : on enveloppe le corps
 * déjà rendu (`bodyHtml`) avec le CSS de la charte + les overrides Chromium.
 *
 * La transformation `<FicheDocument /> → bodyHtml` (React SSR) est faite côté
 * route via un import dynamique de `react-dom/server`, afin de ne PAS importer
 * statiquement `react-dom/server` dans le graphe de l'app (interdit par
 * Turbopack en App Router).
 */
import { ficheCss } from './css';

/** Marges PDF (mm) — identiques au générateur (pdf_generator.py). */
export const PDF_MARGINS_MM = { top: 24, right: 18, bottom: 22, left: 18 } as const;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

/** Overrides spécifiques au rendu Chromium (page de garde pleine page, etc.).
 *  Miroir de pdf_generator._inject_chromium_overrides du générateur. */
function chromiumOverrides(): string {
  const { top, right, bottom, left } = PDF_MARGINS_MM;
  return `<style>
@page { size: A4; margin: ${top}mm ${right}mm ${bottom}mm ${left}mm; }
.cover { margin: -${top}mm -${right}mm 0 -${left}mm; width: 210mm; height: 297mm; page-break-after: always; }
.cover-band { height: 297mm; }
section:last-child { page-break-after: auto; }
.eclair-page { page-break-after: avoid; }
</style>`;
}

export type WrapHtmlOptions = {
  matiere: string;
  nomCours: string;
  /** Base URL des polices (ex. `https://site/fonts/fiches` ou `/fonts/fiches`). */
  fontBaseUrl: string;
  /** true = injecte les overrides Chromium (pour le rendu PDF). */
  forPdf?: boolean;
};

/** Enveloppe le corps HTML d'une fiche dans un document HTML autonome. */
export function wrapFicheHtml(bodyHtml: string, opts: WrapHtmlOptions): string {
  const css = ficheCss(opts.fontBaseUrl);
  const overrides = opts.forPdf ? chromiumOverrides() : '';
  return (
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>` +
    `<title>${escapeHtml(opts.matiere)} — ${escapeHtml(opts.nomCours)}</title>` +
    `<style>${css}</style>${overrides}</head><body>${bodyHtml}</body></html>`
  );
}
