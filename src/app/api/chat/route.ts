import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callClaude, FAST_MODEL } from '@/lib/ai/anthropic';
import { embedOne, toPgVector } from '@/lib/ai/embeddings';

/**
 * Assistant Q&R borné au cours.
 *
 * Pipeline (échec gracieux à chaque étape) :
 *  1. Cache sémantique (qa_cache, ≥ 0,92 cosinus, < 30 j) → 0 appel API
 *  2. RAG : retrieval top-5 chunks dans cours_chunks
 *     - si meilleur chunk < 0,55 similarité → abstention sans appeler Claude
 *  3. Appel Haiku 4.5 avec prompt strict (uniquement les chunks)
 *  4. Vérification grounding (Haiku 1 ligne) → si NON_GROUNDED → abstention
 *  5. Stockage en cache + log dans ai_generations
 *
 * Fallback (si VOYAGE_API_KEY/ANTHROPIC_API_KEY manquantes) : recherche
 * par mots-clés sur flashcards/QCM, comme l'ancien comportement.
 */

const ABSTENTION =
  'Cette information ne figure pas dans les contenus du cours. ' +
  'Pose ta question à un professeur via le forum pour une réponse fiable.';

const SYSTEM_PROMPT = `Tu es un assistant pédagogique pour le concours EVC.
Tu réponds UNIQUEMENT à partir des extraits de cours fournis.

Règles strictes :
1. Si l'information demandée ne figure pas explicitement dans les extraits,
   réponds EXACTEMENT : "${ABSTENTION}"
   Aucune extrapolation, aucune connaissance externe, aucune supposition.
2. Ne JAMAIS recommander de posologie, diagnostic ou conduite à tenir en
   dehors de ce qui est textuellement présent dans les extraits.
3. Si la question demande un avis médical sur un cas réel, refuse et rappelle
   qu'il s'agit d'un outil de révision.
4. Format de réponse : 3 à 6 lignes maximum, structuré en puces si plus d'un
   point. Tu peux citer la source en fin (Flashcard / QCM).`;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

async function logUsage(args: {
  coursId: string;
  feature: 'forum_qa' | 'assistant_chat' | 'grounding_check';
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  model: string;
  status: 'success' | 'failed' | 'abstention' | 'cache_hit';
  itemsCount?: number;
}) {
  const admin = createAdminClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('ai_generations').insert({
      admin_id: null,
      cours_id: args.coursId,
      kind: args.feature === 'grounding_check' ? 'qcm' : 'flashcards',
      feature: args.feature,
      items_count: args.itemsCount ?? 1,
      input_tokens: args.inputTokens,
      output_tokens: args.outputTokens,
      cost_usd: args.costUsd,
      price_eur: 0,
      status: args.status,
      model: args.model,
    });
  } catch { /* logging best-effort */ }
}

// Tarif Haiku 4.5 ($/1M tokens) — au cas où, sans dépendre de cost.ts
const HAIKU_IN = 0.80 / 1_000_000;
const HAIKU_OUT = 4.00 / 1_000_000;
const haikuCost = (u: { input_tokens: number; output_tokens: number }) =>
  u.input_tokens * HAIKU_IN + u.output_tokens * HAIKU_OUT;

/** Fallback keyword-based, identique à l'ancien comportement. */
async function keywordFallback(
  coursId: string,
  message: string,
  coursTitre: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const STOP = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'à', 'au', 'aux', 'en', 'dans',
    'que', 'qui', 'quoi', 'est', 'sont', 'ce', 'cette', 'ces', 'pour', 'par', 'sur', 'avec', 'se',
    'sa', 'son', 'ses', 'il', 'elle', 'on', 'je', 'tu', 'nous', 'vous', 'me', 'ma', 'mon', 'mes',
    'comment', 'pourquoi', 'quelle', 'quel', 'quels', 'quelles',
  ]);
  const tokens = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

  const [{ data: flashcards }, { data: items }] = await Promise.all([
    supabase.from('flashcards').select('recto, verso').eq('cours_id', coursId),
    supabase
      .from('qcm_items')
      .select('enonce, justification, qcm_questions!inner(enonce, qcm_series!inner(cours_id))')
      .eq('qcm_questions.qcm_series.cours_id', coursId)
      .limit(600),
  ]);

  const q = tokens(message);
  if (q.length === 0) return `Précise ta question sur « ${coursTitre} » et je te répondrai à partir des contenus du cours.`;

  type Passage = { text: string; source: string };
  const corpus: Passage[] = [];
  for (const f of flashcards ?? []) corpus.push({ text: `${f.recto} : ${f.verso}`, source: 'Flashcard' });
  for (const it of (items ?? []) as Array<{ enonce: string; justification: string; qcm_questions: { enonce: string } }>) {
    if (it.justification?.trim()) {
      corpus.push({ text: `${it.qcm_questions.enonce} ${it.enonce} ${it.justification}`, source: 'QCM' });
    }
  }
  const scored = corpus.map((p) => {
    const pt = new Set(tokens(p.text));
    let score = 0;
    for (const w of q) if (pt.has(w)) score += 1;
    return { p, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

  if (scored.length === 0) return ABSTENTION;
  return `D’après les contenus de « ${coursTitre} » :\n\n${scored.map((s, i) => `${i + 1}. ${s.p.text.trim()}`).join('\n\n')}\n\n— Sources : flashcards et QCM du cours.`;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { coursId, message } = (await req.json().catch(() => ({}))) as { coursId?: string; message?: string };
  if (!coursId || !message?.trim()) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  if (message.length > 2000) return NextResponse.json({ error: 'Question trop longue (max 2000 caractères).' }, { status: 400 });

  const { data: cours } = await supabase.from('cours').select('id, titre').eq('id', coursId).maybeSingle();
  if (!cours) return NextResponse.json({ error: 'Cours introuvable ou non accessible.' }, { status: 404 });

  // Pas de clés → fallback keyword (ancien comportement)
  if (!process.env.VOYAGE_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    const reply = await keywordFallback(coursId, message, cours.titre, supabase);
    return NextResponse.json({ reply, mode: 'keyword' });
  }

  let qEmbed: number[];
  try {
    qEmbed = await withTimeout(embedOne(message, 'query'), 6000);
  } catch {
    const reply = await keywordFallback(coursId, message, cours.titre, supabase);
    return NextResponse.json({ reply, mode: 'keyword_after_embed_fail' });
  }
  const qEmbedPg = toPgVector(qEmbed);

  // 1) Cache sémantique
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cacheHit } = await (supabase as any).rpc('find_cached_answer', {
    query_embedding: qEmbedPg,
    cours_id_filter: coursId,
    min_similarity: 0.92,
    max_age_days: 30,
  });
  if (cacheHit?.[0]?.answer) {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('qa_cache').update({ hit_count: (cacheHit[0].hit_count ?? 0) + 1 }).eq('id', cacheHit[0].id);
    await logUsage({ coursId, feature: 'assistant_chat', inputTokens: 0, outputTokens: 0, costUsd: 0, model: cacheHit[0].model, status: 'cache_hit' });
    return NextResponse.json({ reply: cacheHit[0].answer, mode: 'cache' });
  }

  // 2) Retrieval
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: chunks } = await (supabase as any).rpc('match_cours_chunks', {
    query_embedding: qEmbedPg,
    match_count: 5,
    cours_id_filter: coursId,
  });
  type ChunkHit = { id: string; content: string; source: string; similarity: number };
  const hits = (chunks ?? []) as ChunkHit[];

  const best = hits[0]?.similarity ?? 0;
  if (hits.length === 0 || best < 0.55) {
    await logUsage({ coursId, feature: 'assistant_chat', inputTokens: 0, outputTokens: 0, costUsd: 0, model: FAST_MODEL, status: 'abstention' });
    return NextResponse.json({ reply: ABSTENTION, mode: 'abstention_low_similarity' });
  }

  // 3) Appel Haiku 4.5 avec prompt strict
  const contextBlock = hits
    .map((h, i) => `[Extrait ${i + 1} — ${h.source}, similarité ${h.similarity.toFixed(2)}]\n${h.content}`)
    .join('\n\n');

  let result;
  try {
    result = await withTimeout(
      callClaude({
        model: FAST_MODEL,
        maxTokens: 600,
        temperature: 0.2,
        cacheSystem: true,
        system: SYSTEM_PROMPT,
        user: `Extraits de cours « ${cours.titre} » :\n\n${contextBlock}\n\n---\n\nQuestion de l'élève : ${message.trim()}`,
      }),
      15000,
    );
  } catch (e) {
    await logUsage({ coursId, feature: 'assistant_chat', inputTokens: 0, outputTokens: 0, costUsd: 0, model: FAST_MODEL, status: 'failed' });
    return NextResponse.json({ error: 'IA indisponible : ' + (e as Error).message }, { status: 502 });
  }

  const answer = result.text.trim();
  const costMain = haikuCost(result.usage);

  // 4) Vérification grounding (sauf si abstention déjà)
  let isGrounded = true;
  if (!answer.startsWith(ABSTENTION.slice(0, 40))) {
    try {
      const check = await withTimeout(
        callClaude({
          model: FAST_MODEL,
          maxTokens: 6,
          temperature: 0,
          system: 'Tu vérifies si une réponse est entièrement justifiée par des extraits. Réponds exactement OK si chaque assertion est appuyée, sinon NO.',
          user: `Extraits :\n${contextBlock}\n\nRéponse à vérifier :\n${answer}\n\nLa réponse est-elle entièrement justifiée par les extraits ? Réponds OK ou NO.`,
        }),
        6000,
      );
      isGrounded = /^\s*ok/i.test(check.text);
      await logUsage({
        coursId, feature: 'grounding_check',
        inputTokens: check.usage.input_tokens, outputTokens: check.usage.output_tokens,
        costUsd: haikuCost(check.usage),
        model: check.model,
        status: 'success',
      });
    } catch {
      // Si la vérif échoue, on retient l'abstention par prudence
      isGrounded = false;
    }
  }

  const finalAnswer = isGrounded ? answer : ABSTENTION;
  const status: 'success' | 'abstention' = isGrounded ? 'success' : 'abstention';

  await logUsage({
    coursId, feature: 'assistant_chat',
    inputTokens: result.usage.input_tokens, outputTokens: result.usage.output_tokens,
    costUsd: costMain, model: result.model, status,
    itemsCount: hits.length,
  });

  // 5) Cache la réponse si grounded
  if (isGrounded) {
    const admin = createAdminClient();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('qa_cache').insert({
        cours_id: coursId,
        question: message.trim().slice(0, 1000),
        question_embedding: qEmbedPg,
        answer: finalAnswer,
        sources_count: hits.length,
        model: result.model,
      });
    } catch { /* best-effort */ }
  }

  return NextResponse.json({
    reply: finalAnswer,
    mode: isGrounded ? 'rag_haiku' : 'abstention_grounding',
    sources: hits.length,
  });
}
