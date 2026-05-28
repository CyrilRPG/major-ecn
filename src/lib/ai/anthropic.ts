import 'server-only';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/** Génération admin (qualité prioritaire) — Sonnet 4.6. */
export const DEFAULT_MODEL = 'claude-sonnet-4-6';
/** Q&R étudiant, RAG, vérifications — Haiku 4.5 (10× moins cher). */
export const FAST_MODEL = 'claude-haiku-4-5';

export type AnthropicUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
};

export type AnthropicResult = {
  text: string;
  usage: AnthropicUsage;
  model: string;
};

type CachedTextBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } };

export async function callClaude({
  system,
  user,
  model = DEFAULT_MODEL,
  maxTokens = 8000,
  temperature = 0.4,
  cacheSystem = false,
}: {
  system: string | CachedTextBlock[];
  user: string | CachedTextBlock[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  cacheSystem?: boolean;
}): Promise<AnthropicResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY non configurée côté serveur.');

  // System : string → block + (optionnel) cache_control ; sinon utilise les blocks fournis
  const systemBlocks: CachedTextBlock[] = typeof system === 'string'
    ? [{ type: 'text', text: system, ...(cacheSystem ? { cache_control: { type: 'ephemeral' as const } } : {}) }]
    : system;

  const userContent = typeof user === 'string'
    ? user
    : user;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemBlocks,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 300)}`);
  }

  const j = (await res.json()) as {
    content: { type: string; text: string }[];
    usage: AnthropicUsage;
    model: string;
  };
  const text = (j.content ?? []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  return { text, usage: j.usage, model: j.model };
}

/** Extract the first JSON object/array from a text response. */
export function extractJson<T = unknown>(text: string): T {
  const trimmed = text.trim();
  // Try fenced ```json blocks first
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  // Find the first { or [ and the matching last } or ]
  const start = candidate.search(/[\[{]/);
  if (start < 0) throw new Error('Réponse IA sans JSON détectable.');
  const opener = candidate[start];
  const closer = opener === '[' ? ']' : '}';
  const end = candidate.lastIndexOf(closer);
  if (end < 0 || end <= start) throw new Error('JSON IA tronqué.');
  const payload = candidate.slice(start, end + 1);
  try {
    return JSON.parse(payload) as T;
  } catch (e) {
    throw new Error(`JSON IA invalide : ${(e as Error).message}`);
  }
}
