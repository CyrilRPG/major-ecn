import 'server-only';
import { callClaude, extractJson, type AnthropicUsage } from '@/lib/ai/anthropic';
import { usageToUsd } from '@/lib/ai/cost';
import type { QuestionRow, RoundRow, TournamentRow } from './types';

/**
 * EVC Arena — rédaction éditoriale du corrigé d'une manche par IA.
 *
 * Le modèle ne CORRIGE rien : il met en forme, pour chaque question, ce que la
 * base contient déjà (lettres exactes, justification de chaque proposition,
 * explication, pièges, erreurs fréquentes, références) en une explication
 * suivie, des points clés et un piège à retenir. Toute affirmation médicale
 * doit provenir du matériau fourni ; une question sans justification ni
 * explication en base ressort sans texte (le PDF l'indique explicitement).
 *
 * Garde-fous côté code, indépendants du modèle :
 *  - une question dont la source est vide ne reçoit aucun texte, même si le
 *    modèle en a produit ;
 *  - la réponse attendue est toujours recalculée depuis la base, jamais lue
 *    dans la sortie du modèle ;
 *  - longueurs bornées.
 */

export const ARENA_CORRECTIONS_MODEL = process.env.ARENA_CORRECTIONS_MODEL || 'claude-opus-5';

export type EditorialQuestion = {
  index: number;
  /** Explication suivie (2 à 6 phrases), ou null si la source ne fournit rien. */
  explication: string | null;
  /** Points clés (0 à 5), chacun tiré du matériau fourni. */
  points_cles: string[];
  /** Piège à retenir, ou null. */
  piege: string | null;
};

export type Editorial = {
  /** Synthèse de la manche : 3 à 6 points, tirés des seuls corrigés. */
  synthese: string[];
  questions: EditorialQuestion[];
  /** Trace de facturation. */
  usage: AnthropicUsage;
  model: string;
  costUsd: number;
};

/** Vrai si la base porte au moins un texte de correction pour cette question. */
export function questionHasSource(q: QuestionRow): boolean {
  return Boolean(q.explanation.trim() || q.pieges.trim() || q.erreurs_frequentes.trim() || q.items.some((it) => it.justification.trim()));
}

function materiau(q: QuestionRow, index: number): string {
  const lignes = [`### Question ${index} (${q.type}${q.type === 'QRP' ? `, n = ${q.expected_count ?? q.items.filter((i) => i.is_correct).length}` : ''})`];
  if (q.vignette) lignes.push(`Vignette : ${q.vignette}`);
  lignes.push(`Énoncé : ${q.enonce}`);
  for (const it of q.items) {
    lignes.push(`${it.lettre}. ${it.enonce} — ${it.is_correct ? 'EXACTE' : 'INEXACTE'}${it.indispensable ? ' (indispensable)' : ''}${it.inacceptable ? ' (inacceptable)' : ''}${it.justification ? ` — justification : ${it.justification}` : ''}`);
  }
  lignes.push(`Réponse attendue : ${q.items.filter((i) => i.is_correct).map((i) => i.lettre).join(' + ') || '—'}`);
  if (q.explanation) lignes.push(`Explication en base : ${q.explanation}`);
  if (q.pieges) lignes.push(`Pièges en base : ${q.pieges}`);
  if (q.erreurs_frequentes) lignes.push(`Erreurs fréquentes en base : ${q.erreurs_frequentes}`);
  if (q.references_text) lignes.push(`Références en base : ${q.references_text}`);
  if (!questionHasSource(q)) lignes.push('SOURCE VIDE : aucune justification ni explication. Renvoyer explication null, points_cles [], piege null.');
  return lignes.join('\n');
}

const SYSTEM = `Tu es le rédacteur des corrigés d'EVC Arena, le tournoi de QCM de Major ECN (préparation aux EVC, médecine, France).
Tu reçois, pour chaque question d'une manche, le matériau de correction déjà validé par l'équipe pédagogique : propositions avec leur statut exact / inexact, justification de chaque proposition, explication, pièges, erreurs fréquentes, références.

Ta mission est UNIQUEMENT rédactionnelle : transformer ce matériau en un corrigé lisible et élégant.
Règles absolues :
1. N'ajoute AUCUNE information médicale qui ne figure pas dans le matériau de la question. Pas de chiffre, de seuil, de recommandation, de mécanisme ou de nom de traitement qui n'y soit pas déjà. Reformuler, ordonner, relier : oui. Compléter : non.
2. Ne modifie jamais le statut d'une proposition ni la réponse attendue.
3. Si une question porte la mention « SOURCE VIDE », renvoie explication null, points_cles [] et piege null pour cette question.
4. Style : français, phrases courtes, ton pédagogique et précis, vouvoiement implicite, pas de formule creuse, pas de « bravo », pas de mention de l'IA.
5. "explication" : 2 à 6 phrases qui expliquent pourquoi les propositions exactes le sont et pourquoi les inexactes ne le sont pas, dans l'ordre des lettres. "points_cles" : 0 à 5 rappels d'une ligne, issus du matériau. "piege" : une phrase sur le piège principal, seulement s'il est documenté dans le matériau (pièges ou erreurs fréquentes), sinon null.
6. "synthese" : 3 à 6 points d'une ligne résumant les messages de la manche, tirés exclusivement des corrigés.

Réponds avec un unique objet JSON, sans texte autour :
{"synthese":["…"],"questions":[{"index":1,"explication":"…"|null,"points_cles":["…"],"piege":"…"|null}]}`;

type Sortie = { synthese?: unknown; questions?: unknown };

const texte = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, max) : null;
};
const liste = (v: unknown, max: number, maxLen: number): string[] =>
  Array.isArray(v) ? v.map((x) => texte(x, maxLen)).filter((x): x is string => Boolean(x)).slice(0, max) : [];

/** Appelle le modèle et applique les garde-fous. Lève en cas d'échec réseau ou de sortie illisible. */
export async function redigerCorrectionEditoriale(t: TournamentRow, r: RoundRow, questions: QuestionRow[]): Promise<Editorial> {
  const actives = questions.filter((q) => !q.neutralized_at);
  const user = [
    `Tournoi : ${t.title} — ${t.specialty}. Manche ${r.number}${r.theme ? ` : ${r.theme}` : ''}.`,
    r.corrections_methodo ? `Encadré méthodologique fourni par l'équipe : ${r.corrections_methodo}` : '',
    r.corrections_errors ? `Erreurs fréquentes sur la manche (équipe) : ${r.corrections_errors}` : '',
    '',
    ...actives.map((q, i) => materiau(q, i + 1)),
  ].filter(Boolean).join('\n\n');

  const res = await callClaude({ system: SYSTEM, user, model: ARENA_CORRECTIONS_MODEL, maxTokens: 16000, temperature: null, cacheSystem: true });
  const out = extractJson<Sortie>(res.text);
  const brut = Array.isArray(out.questions) ? (out.questions as Record<string, unknown>[]) : [];
  const parIndex = new Map<number, Record<string, unknown>>();
  for (const q of brut) if (q && typeof q === 'object' && Number.isInteger(Number(q.index))) parIndex.set(Number(q.index), q);

  const editorial: EditorialQuestion[] = actives.map((q, i) => {
    const index = i + 1;
    const src = parIndex.get(index);
    if (!src || !questionHasSource(q)) return { index, explication: null, points_cles: [], piege: null };
    return {
      index,
      explication: texte(src.explication, 1800),
      points_cles: liste(src.points_cles, 5, 240),
      piege: texte(src.piege, 320),
    };
  });

  return {
    synthese: liste(out.synthese, 6, 240),
    questions: editorial,
    usage: res.usage,
    model: res.model,
    costUsd: usageToUsd(res.usage, res.model),
  };
}
