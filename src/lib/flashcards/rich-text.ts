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
  const re = /<[^>]+>/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html))) {
    if (m.index > last) out.push(escapeText(html.slice(last, m.index)));
    last = re.lastIndex;

    const raw = m[0];
    const tm = raw.match(/^<\s*(\/?)\s*([a-zA-Z0-9]+)([\s\S]*?)\/?\s*>$/);
    if (!tm) continue; // balise malformée → supprimée

    const closing = tm[1] === '/';
    const name = tm[2].toLowerCase();
    const inner = tm[3] || '';
    if (!ALLOWED_TAGS.has(name)) continue; // balise interdite → on garde le texte autour

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
      const cm = style.match(/color\s*:\s*([^;]+)/i);
      const col = cm ? safeColor(cm[1]) : null;
      out.push(col ? `<span style="color:${col}">` : '<span>');
      continue;
    }

    // b, strong, i, em, u, sub, sup
    out.push(`<${name}>`);
  }

  if (last < html.length) out.push(escapeText(html.slice(last)));
  return out.join('').slice(0, maxLen);
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
