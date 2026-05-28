import 'server-only';

/**
 * Découpage de texte en chunks d'environ TARGET tokens, avec chevauchement.
 * Heuristique : 1 token ≈ 4 caractères en français. Coupe sur paragraphe/phrase
 * pour préserver le sens.
 */

const CHARS_PER_TOKEN = 4;
const TARGET_TOKENS = 500;       // ~2000 caractères
const OVERLAP_TOKENS = 80;       // ~320 caractères
const MIN_CHUNK_TOKENS = 60;     // sous ce seuil, on fusionne au précédent

const TARGET_CHARS = TARGET_TOKENS * CHARS_PER_TOKEN;
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN;
const MIN_CHUNK_CHARS = MIN_CHUNK_TOKENS * CHARS_PER_TOKEN;

export type Chunk = { content: string; token_count: number };

export function chunkText(input: string): Chunk[] {
  const text = input.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (text.length === 0) return [];
  if (text.length <= TARGET_CHARS) {
    return [{ content: text, token_count: Math.ceil(text.length / CHARS_PER_TOKEN) }];
  }

  const paragraphs = text.split(/\n{2,}/);
  const out: Chunk[] = [];
  let buf = '';

  const flush = () => {
    if (buf.trim().length >= MIN_CHUNK_CHARS) {
      out.push({ content: buf.trim(), token_count: Math.ceil(buf.length / CHARS_PER_TOKEN) });
    } else if (out.length > 0 && buf.trim().length > 0) {
      // fusionne au précédent
      const prev = out[out.length - 1];
      const merged = prev.content + '\n\n' + buf.trim();
      out[out.length - 1] = { content: merged, token_count: Math.ceil(merged.length / CHARS_PER_TOKEN) };
    } else if (buf.trim().length > 0) {
      out.push({ content: buf.trim(), token_count: Math.ceil(buf.length / CHARS_PER_TOKEN) });
    }
    buf = '';
  };

  for (const p of paragraphs) {
    if (p.length > TARGET_CHARS) {
      // Paragraphe trop long : coupe phrase par phrase
      if (buf) flush();
      const sentences = p.match(/[^.!?]+[.!?]+\s*/g) ?? [p];
      let local = '';
      for (const s of sentences) {
        if ((local + s).length > TARGET_CHARS && local.length > 0) {
          out.push({ content: local.trim(), token_count: Math.ceil(local.length / CHARS_PER_TOKEN) });
          // chevauchement
          local = local.slice(-OVERLAP_CHARS) + s;
        } else {
          local += s;
        }
      }
      if (local.trim()) {
        out.push({ content: local.trim(), token_count: Math.ceil(local.length / CHARS_PER_TOKEN) });
      }
      continue;
    }
    if (buf.length + p.length + 2 > TARGET_CHARS) {
      flush();
      // chevauchement : on garde la fin du buf précédent
      if (out.length > 0) {
        const tail = out[out.length - 1].content.slice(-OVERLAP_CHARS);
        buf = tail + '\n\n' + p;
      } else {
        buf = p;
      }
    } else {
      buf = buf ? buf + '\n\n' + p : p;
    }
  }
  flush();
  return out;
}
