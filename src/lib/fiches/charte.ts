import 'server-only';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { resolveFontUrls, stripPageAtRules } from './charte-pure';

/**
 * Charge le CSS charte « médicale sobre » utilisé par les fiches.
 *
 * Source unique : `/src/lib/fiches/charte-styles.css`. Le rendu PDF (route
 * `render-html`, scripts de rendu) et l'éditeur WYSIWYG lisent ce même
 * fichier : ce que le professeur voit dans l'éditeur est ce que Chromium
 * imprime. Issue du générateur Python `major-ecn-fiche`
 * (`assets/templates/styles.css`), la charte évolue désormais ici seulement.
 *
 * Le fichier est lu au premier appel puis gardé en cache module. Les polices
 * web sont servies par Next depuis `/public/fonts/fiches/<file>.ttf` : on
 * remplace les `url("fonts/<file>")` du CSS par la base passée en paramètre
 * (URL absolue HTTP pour Chromium, chemin `/fonts/fiches` pour le navigateur).
 */

let _css: string | null = null;

function readCss(): string {
  if (_css !== null) return _css;
  // En dev/runtime Next, __dirname pointe sur `.next/server/...` ; on remonte
  // jusqu'à la racine du projet pour trouver le source.
  const candidates = [
    path.join(process.cwd(), 'src/lib/fiches/charte-styles.css'),
    path.join(__dirname, 'charte-styles.css'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      _css = readFileSync(p, 'utf-8');
      return _css;
    }
  }
  throw new Error('charte-styles.css introuvable');
}

/** CSS charte avec URLs de polices résolues vers une origine HTTP donnée. */
export function charteCss(fontBaseUrl: string): string {
  return resolveFontUrls(readCss(), fontBaseUrl);
}

/** CSS charte de l'éditeur WYSIWYG : la charte entière, moins les `@page`
 *  (appliqués par Chromium à l'impression, jamais par un écran). */
export function charteCssForEditor(fontBaseUrl: string): string {
  return stripPageAtRules(charteCss(fontBaseUrl));
}
