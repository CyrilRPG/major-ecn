/**
 * Rich text sécurisé pour les flashcards (recto / verso).
 *
 * Les professeurs peuvent mettre du texte en gras/italique, colorer du texte
 * et insérer une image. Le contenu est stocké en HTML dans les colonnes
 * `recto` / `verso`. Pour éviter toute injection (XSS) tout en autorisant une
 * mise en forme riche, on ne garde qu'une liste blanche stricte de balises et
 * d'attributs :
 *
 *   - mise en forme : <b> <strong> <i> <em> <u> <sub> <sup> <br>
 *   - couleur       : <span style="color:…"> (couleur validée uniquement)
 *   - image         : <img src="https://… ou /…" alt="…">
 *
 * Toute autre balise est retirée (son texte est conservé). Aucun attribut
 * d'événement (on*), aucun style autre que `color`, aucune URL `javascript:`.
 * Fonction isomorphe (client + serveur) — appelée à l'édition ET au rendu.
 */

const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'br', 'span', 'img',
]);

/**
 * Balises de bloc : non conservées (elles ne sont pas dans la liste blanche),
 * mais leur frontière EST un retour à la ligne.
 *
 * INCIDENT : un contenteditable produit `<div>` (ou `<p>`) à chaque appui sur
 * Entrée. Comme ces balises étaient simplement supprimées, tous les paragraphes
 * d'un corrigé rédigé par un professeur se retrouvaient collés en un seul bloc
 * à l'enregistrement — alors que l'éditeur, lui, continuait d'afficher la mise
 * en page. Les convertir en `<br>` préserve la frappe.
 */
const BLOCK_TAGS = new Set([
  'div', 'p', 'li', 'ul', 'ol', 'tr', 'table', 'blockquote', 'pre', 'section',
  'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

/** Valide une couleur CSS : #hex, rgb()/rgba() ou nom de couleur simple. */
function safeColor(value: string): string | null {
  const s = value.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return s;
  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(s)) return s;
  if (/^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/.test(s)) return s;
  if (/^[a-zA-Z]{3,20}$/.test(s)) return s.toLowerCase(); // noms CSS (red, navy…)
  return null;
}

/** Extrait la valeur d'un attribut (guillemets simples ou doubles). */
function attrValue(tagInner: string, name: string): string | null {
  const dq = tagInner.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i'));
  if (dq) return dq[1];
  const sq = tagInner.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, 'i'));
  if (sq) return sq[1];
  return null;
}

function escapeText(s: string): string {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Nettoie un fragment HTML de flashcard en ne conservant que la liste blanche.
 */
export function sanitizeFlashcardHtml(input: string, maxLen = 6000): string {
  if (!input) return '';
  const html = input.length > maxLen * 4 ? input.slice(0, maxLen * 4) : input;
  const out: string[] = [];
  // Une balise HTML commence par « < » IMMÉDIATEMENT suivi d'une lettre (ou de
  // « / » puis d'une lettre) : c'est la règle du parseur des navigateurs.
  // Un « < » isolé — « PaO₂/FiO₂ < 200 mmHg », « 10 < MMSE < 20 » — est du
  // TEXTE, et doit être échappé, pas interprété.
  //
  // INCIDENT : avec l'ancien motif `<[^>]+>`, un « < » de comparaison ouvrait
  // une pseudo-balise qui courait jusqu'au « > » suivant, c'est-à-dire jusqu'à
  // la fin de la balise <b> d'après. Le nom lu (« PaO », « MMSE ») n'étant pas
  // dans la liste blanche, TOUT le fragment était supprimé : le critère
  // disparaissait de la correction et une balise fermante orpheline restait.
  const re = /<\/?[a-zA-Z][^>]*>/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html))) {
    if (m.index > last) out.push(escapeText(html.slice(last, m.index)));
    last = re.lastIndex;

    const raw = m[0];
    const tm = raw.match(/^<(\/?)([a-zA-Z0-9]+)([\s\S]*?)\/?\s*>$/);
    if (!tm) continue; // balise malformée → supprimée

    const closing = tm[1] === '/';
    const name = tm[2].toLowerCase();
    const inner = tm[3] || '';
    if (!ALLOWED_TAGS.has(name)) {
      // Balise interdite → on garde le texte autour. Si c'est un bloc, on
      // matérialise le saut de ligne qu'il représentait (à l'ouverture
      // seulement, sinon chaque paragraphe compterait double).
      if (!closing && BLOCK_TAGS.has(name)) out.push(name === 'li' ? '<br>• ' : '<br>');
      continue;
    }

    if (closing) {
      if (name === 'img' || name === 'br') continue;
      out.push(`</${name}>`);
      continue;
    }

    if (name === 'br') { out.push('<br>'); continue; }

    if (name === 'img') {
      const src = (attrValue(inner, 'src') || '').trim();
      if (!src) continue;
      if (!/^https:\/\//i.test(src) && !src.startsWith('/')) continue; // https ou racine seulement
      if (/[<>"'\s]/.test(src)) continue;
      const alt = (attrValue(inner, 'alt') || '').replace(/"/g, '&quot;');
      out.push(`<img src="${src}" alt="${escapeText(alt)}" />`);
      continue;
    }

    if (name === 'span') {
      const style = attrValue(inner, 'style') || '';
      // Sous-ensemble de styles sûrs (aucun ne peut exécuter de script) :
      // couleur + gras/italique/souligné — utile quand le navigateur produit
      // des <span style> plutôt que des balises <b>/<i>/<u> (styleWithCSS).
      const decls: string[] = [];
      const cm = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
      const col = cm ? safeColor(cm[1]) : null;
      if (col) decls.push(`color:${col}`);
      const bg = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
      const bgc = bg ? safeColor(bg[1]) : null;
      if (bgc) decls.push(`background-color:${bgc}`);
      const fw = style.match(/font-weight\s*:\s*([^;]+)/i);
      if (fw && /^(bold(er)?|[5-9]00)$/i.test(fw[1].trim())) decls.push('font-weight:bold');
      const fs = style.match(/font-style\s*:\s*([^;]+)/i);
      if (fs && /^italic$/i.test(fs[1].trim())) decls.push('font-style:italic');
      const td = style.match(/text-decoration(?:-line)?\s*:\s*([^;]+)/i);
      if (td && /underline/i.test(td[1])) decls.push('text-decoration:underline');
      out.push(decls.length ? `<span style="${decls.join(';')}">` : '<span>');
      continue;
    }

    // b, strong, i, em, u, sub, sup
    out.push(`<${name}>`);
  }

  if (last < html.length) out.push(escapeText(html.slice(last)));
  return out
    .join('')
    .replace(/(?:<br>\s*){3,}/g, '<br><br>')
    .replace(/^(?:<br>\s*)+/, '')
    .replace(/(?:<br>\s*)+$/, '')
    .slice(0, maxLen);
}

/**
 * Rendu HTML sûr d'un contenu potentiellement « en blocs » (vignette de dossier,
 * recto/verso de flashcard…). Le texte peut avoir été rédigé avec des blocs
 * (`<p>`, `<ul><li>`) ou de simples retours à la ligne : on les convertit tous
 * en `<br>` (les `<li>` reçoivent une puce) PUIS on applique la liste blanche
 * stricte — sinon les balises non autorisées seraient retirées et les éléments
 * se colleraient les uns aux autres. À utiliser partout où le contenu peut
 * contenir des listes ou des retours à la ligne ; jamais `{valeur}` en brut.
 */
export function sanitizeBlockHtml(input: string): string {
  if (!input) return '';
  const withBreaks = input
    .replace(/\r?\n/g, '<br>')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/(?:p|div|li)>/gi, '<br>')
    .replace(/<(?:\/?(?:p|div|ul|ol))[^>]*>/gi, '');
  return sanitizeFlashcardHtml(withBreaks)
    .replace(/(?:<br>\s*){3,}/g, '<br><br>')
    .replace(/^(?:<br>\s*)+/g, '')
    .replace(/(?:<br>\s*)+$/g, '');
}

/** Texte brut (sans balises) — pour les aperçus compacts et la validation. */
export function flashcardPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<img\b[^>]*>/gi, ' 🖼 ')
    .replace(/<br\s*\/?>(?=)/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Une flashcard a-t-elle un contenu réel (texte ou image) ? */
export function flashcardHasContent(html: string): boolean {
  if (!html) return false;
  if (/<img\b/i.test(html)) return true;
  return flashcardPlainText(html).length > 0;
}
