/**
 * Transformations pures du CSS de la charte (aucun accès disque) : appelées
 * par `charte.ts` (serveur) et testables hors de Next.
 */

/** Réécrit les `url("fonts/<fichier>")` de la charte vers `fontBaseUrl`. */
export function resolveFontUrls(css: string, fontBaseUrl: string): string {
  const base = fontBaseUrl.replace(/\/+$/, '');
  return css.replace(/url\("fonts\/([^"]+)"\)/g, `url("${base}/$1")`);
}

/**
 * Retire les règles `@page`, boîtes de marge imbriquées comprises
 * (`@top-left`…). Un écran ne les applique jamais : les retirer ne change rien
 * au rendu de l'éditeur.
 *
 * Les commentaires et les chaînes sont recopiés sans être analysés : un
 * « @page » cité dans un commentaire ne doit pas emporter la règle suivante,
 * et une accolade dans un `content: "…"` ne doit pas fausser le comptage.
 */
export function stripPageAtRules(css: string): string {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const skip = skipCommentOrString(css, i);
    if (skip > i) {
      out += css.slice(i, skip);
      i = skip;
    } else if (css.startsWith('@page', i) && !/[\w-]/.test(css[i + 5] ?? '')) {
      i = endOfBlock(css, i);
    } else {
      out += css[i];
      i++;
    }
  }
  return out;
}

/** Index de fin du commentaire ou de la chaîne qui commence en `i`, sinon `i`. */
function skipCommentOrString(css: string, i: number): number {
  if (css.startsWith('/*', i)) {
    const end = css.indexOf('*/', i + 2);
    return end === -1 ? css.length : end + 2;
  }
  const quote = css[i];
  if (quote === '"' || quote === "'") {
    let j = i + 1;
    while (j < css.length && css[j] !== quote) j += css[j] === '\\' ? 2 : 1;
    return Math.min(j + 1, css.length);
  }
  return i;
}

/** Index qui suit l'accolade fermante du bloc ouvert après `start`. */
function endOfBlock(css: string, start: number): number {
  let depth = 0;
  let i = start;
  while (i < css.length) {
    const skip = skipCommentOrString(css, i);
    if (skip > i) {
      i = skip;
      continue;
    }
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return i + 1;
    i++;
  }
  return css.length;
}
