import type { AnthropicUsage } from './anthropic';

/** Tarifs Anthropic (USD/M tokens), Claude Sonnet 4.5/4.6 par défaut. */
const RATES: Record<string, { in: number; out: number }> = {
  'claude-sonnet-4-5':       { in: 3,  out: 15 },
  'claude-sonnet-4-6':       { in: 3,  out: 15 },
  'claude-sonnet-4-7':       { in: 3,  out: 15 },
  'claude-opus-4-5':         { in: 15, out: 75 },
  'claude-opus-4-6':         { in: 15, out: 75 },
  'claude-opus-4-7':         { in: 15, out: 75 },
  'claude-haiku-4-5':        { in: 1,  out: 5  },
};

function rateFor(model: string) {
  // Strip date suffixes like "-20251001"
  const base = model.split('-').slice(0, 4).join('-');
  return RATES[base] ?? RATES['claude-sonnet-4-5'];
}

export function usageToUsd(usage: AnthropicUsage, model: string): number {
  const r = rateFor(model);
  return (usage.input_tokens / 1_000_000) * r.in + (usage.output_tokens / 1_000_000) * r.out;
}

/** Prix facturé à l'étudiant / centre, en €. */
export const PRICE_EUR = {
  flashcards: 5,
  qcm: 3,
} as const;
