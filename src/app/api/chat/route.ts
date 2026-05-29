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

// Phrase d'abstention : naturelle, sans jargon de RAG ni mention « contenus ».
const ABSTENTION =
  "Je n'ai pas cette réponse précise pour ce cours — passe par le forum " +
  "pour qu'un prof te confirme.";

// Prompt système : on positionne Claude comme un médecin-enseignant qui
// répond à un externe. La fiche est la SOURCE PRIORITAIRE quand elle existe,
// mais Claude ne doit jamais le mentionner (« d'après la fiche… », « le QCM
// indique… » → interdits). L'élève doit avoir l'impression d'avoir un prof
// en face de lui, pas un système RAG.
const SYSTEM_PROMPT = `Tu es un médecin enseignant qui aide un étudiant en
médecine à réviser pour les EVC. Tu lui réponds comme tu le ferais face à un
externe : direct, clair, pédagogique.

Extraits du cours
─────────────────
On te fournit des extraits issus de la fiche de cours, des QCM et parfois des
annales de ce cours précis. Sers-toi en pour bâtir ta réponse, en privilégiant
TOUJOURS la fiche de cours comme source de référence quand elle est présente
(les autres sources viennent compléter ou nuancer).

Règles de style
───────────────
1. Ne mentionne JAMAIS d'où vient l'information. Pas de « d'après la fiche »,
   « le QCM précise », « selon les extraits », « les sources indiquent ».
   Tu formules la réponse comme si elle venait de ta propre expertise.
2. Pas de méta-langage du type « voici ce que je sais », « je peux te dire
   que ». Tu rentres direct dans le sujet.
3. Format : 3 à 8 lignes selon la complexité, structuré en puces si plusieurs
   points distincts à hiérarchiser. Vocabulaire médical assumé (terminologie
   EVC, items, rangs A/B), ton confraternel.
4. Pas d'extrapolation au-delà des extraits fournis. Pas d'avis médical sur
   un cas réel ; rappelle que c'est un outil de révision si l'élève évoque
   un patient.

Quand abstention
────────────────
Si l'information demandée n'est tout simplement pas couverte par les extraits,
réponds EXACTEMENT : "${ABSTENTION}"
Aucune autre formulation. Pas de tentative de réponse partielle.`;

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
  // Fallback : on reformule directement sans citer la source (cohérent avec
  // le ton du prompt principal).
  return scored.map((s) => s.p.text.trim().replace(/\s+/g, ' ')).join('\n\n');
  void coursTitre;
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

  // 3) Appel Haiku 4.5. On TRIE pour mettre la fiche en tête : c'est la
  // source de référence du cours. Les extraits sont anonymisés (« Extrait
  // pédagogique N ») pour que Claude n'ait pas envie de les citer.
  const ranked = [...hits].sort((a, b) => {
    const af = /^fiche/i.test(a.source) ? 0 : 1;
    const bf = /^fiche/i.test(b.source) ? 0 : 1;
    if (af !== bf) return af - bf;
    return b.similarity - a.similarity;
  });
  const contextBlock = ranked
    .map((h, i) => `[Extrait pédagogique ${i + 1}]\n${h.content}`)
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
