import 'server-only';

/**
 * Sérialisation serveur d'une `FicheData` → document HTML autonome, destiné à
 * Chromium (Playwright/puppeteer) pour le rendu PDF.
 *
 * Utilise le MÊME composant <FicheDocument /> que l'aperçu en direct, donc le
 * PDF est identique à l'aperçu. Le CSS (charte vendorisée) est injecté inline,
 * et les URL de polices `url("fonts/…")` sont réécrites vers `fontBaseUrl`.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { FicheDocument } from './fiche-document';
import { ficheCss } from './css';
import type { FicheData } from './types';

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

export type RenderHtmlOptions = {
  /** Base URL des polices (ex. `https://site/fonts/fiches` ou `/fonts/fiches`). */
  fontBaseUrl: string;
  logoUrl?: string;
  watermarkUrl?: string;
  /** true = injecte les overrides Chromium (pour le rendu PDF). */
  forPdf?: boolean;
};

/** Construit le document HTML complet d'une fiche. */
export function renderFicheHtml(fiche: FicheData, opts: RenderHtmlOptions): string {
  const body = renderToStaticMarkup(
    <FicheDocument fiche={fiche} logoUrl={opts.logoUrl} watermarkUrl={opts.watermarkUrl} />,
  );
  const css = ficheCss(opts.fontBaseUrl);
  const overrides = opts.forPdf ? chromiumOverrides() : '';
  return (
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>` +
    `<title>${escapeHtml(fiche.matiere)} — ${escapeHtml(fiche.nom_cours)}</title>` +
    `<style>${css}</style>${overrides}</head><body>${body}</body></html>`
  );
}
