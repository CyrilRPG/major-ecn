import 'server-only';

/**
 * Embeddings Voyage AI (recommandé par Anthropic). 1024 dim, multilingue,
 * ~0,02 €/1M tokens.
 * Requiert VOYAGE_API_KEY côté serveur.
 *
 * Modèle :
 *  - voyage-3-lite : 1024 dim, le plus économique → notre choix
 *  - voyage-3      : 1024 dim, meilleure qualité (~3× le prix)
 */

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-3-lite';

export type EmbeddingResult = {
  embeddings: number[][];
  total_tokens: number;
  model: string;
};

export async function embed(
  texts: string[],
  inputType: 'query' | 'document' = 'document',
): Promise<EmbeddingResult> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new Error('VOYAGE_API_KEY non configurée côté serveur.');
  if (texts.length === 0) return { embeddings: [], total_tokens: 0, model: VOYAGE_MODEL };

  const res = await fetch(VOYAGE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      input: texts,
      model: VOYAGE_MODEL,
      input_type: inputType,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Voyage ${res.status}: ${body.slice(0, 300)}`);
  }
  const j = (await res.json()) as {
    data: { embedding: number[] }[];
    usage: { total_tokens: number };
    model: string;
  };
  return {
    embeddings: j.data.map((d) => d.embedding),
    total_tokens: j.usage.total_tokens,
    model: j.model,
  };
}

/** Embedding d'une seule chaîne. */
export async function embedOne(text: string, inputType: 'query' | 'document' = 'document'): Promise<number[]> {
  const { embeddings } = await embed([text], inputType);
  return embeddings[0];
}

/** Sérialise un vecteur pour Postgres (`SET embedding = '[0.1,0.2,...]'::vector`). */
export function toPgVector(v: number[]): string {
  return `[${v.join(',')}]`;
}
