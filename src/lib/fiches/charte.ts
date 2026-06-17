import 'server-only';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * Charge le CSS charte « médicale sobre » utilisé par les fiches.
 *
 * Source unique : `/src/lib/fiches/charte-styles.css`, copie miroir du fichier
 * `assets/templates/styles.css` du générateur Python `major-ecn-fiche`.
 *
 * Le CSS est lu au build (cache module). Les polices web sont servies par
 * Next depuis `/public/fonts/fiches/<file>.ttf` — pour le rendu PDF Chromium,
 * on remplace les `url("fonts/<file>")` du CSS par l'URL absolue HTTP servie
 * par cette instance (origin passée en paramètre).
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
  const base = fontBaseUrl.replace(/\/+$/, '');
  return readCss().replace(/url\("fonts\/([^"]+)"\)/g, `url("${base}/$1")`);
}

/** Sous-ensemble du CSS charte adapté à l'éditeur WYSIWYG : on retire les
 *  `@page` (inutiles en édition web) et on neutralise les marges PDF
 *  négatives de la cover (qui s'étendaient sur la pleine page A4). */
export function charteCssForEditor(fontBaseUrl: string): string {
  let css = charteCss(fontBaseUrl);
  // Retire les @page (gérés par Chromium au rendu PDF, inutiles ici).
  // Parser à compteur de braces pour gérer les @top-left/@bottom-right imbriqués.
  css = stripPageAtRules(css);
  return css;
}

function stripPageAtRules(css: string): string {
  const out: string[] = [];
  let i = 0;
  const n = css.length;
  while (i < n) {
    const idx = css.indexOf('@page', i);
    if (idx === -1) {
      out.push(css.slice(i));
      break;
    }
    out.push(css.slice(i, idx));
    const braceStart = css.indexOf('{', idx);
    if (braceStart === -1) {
      i = idx + 5;
      continue;
    }
    let depth = 1;
    let j = braceStart + 1;
    while (j < n && depth > 0) {
      const c = css[j];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      j++;
    }
    i = j;
  }
  return out.join('');
}
