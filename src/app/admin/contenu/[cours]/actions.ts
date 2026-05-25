'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { callClaude, extractJson } from '@/lib/ai/anthropic';
import { flashcardsPrompt, qcmPrompt } from '@/lib/ai/prompts';
import { usageToUsd, PRICE_EUR } from '@/lib/ai/cost';

type GenResult =
  | { ok: true; count: number; cost_usd: number }
  | { error: string; needsFiche?: boolean };

type CourseCtx = { titre: string; matiere: string; description: string | null; hasFiche: boolean };

async function loadCourseContext(coursId: string): Promise<CourseCtx | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('cours')
    .select('id, titre, description, matieres(nom), fiches(storage_path)')
    .eq('id', coursId)
    .maybeSingle();
  if (!data) return null;
  const matiere = (data as { matieres?: { nom?: string } | null }).matieres?.nom ?? '';
  const fiches = (data as { fiches?: { storage_path: string | null }[] | null }).fiches ?? [];
  const hasFiche = fiches.some((f) => !!f.storage_path);
  return { titre: data.titre, matiere, description: data.description, hasFiche };
}

function contextToText(ctx: CourseCtx): string {
  return [
    `Titre du cours : ${ctx.titre}`,
    ctx.matiere ? `Collège / matière : ${ctx.matiere}` : '',
    ctx.description ? `Description / résumé : ${ctx.description}` : '',
  ].filter(Boolean).join('\n');
}

async function logGeneration(args: {
  admin_id: string;
  cours_id: string;
  cours_titre: string | null;
  kind: 'flashcards' | 'qcm';
  items_count: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  price_eur: number;
  status: 'success' | 'failed' | 'partial';
  error_message?: string | null;
  model: string;
}) {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('ai_generations').insert(args);
}

export async function generateFlashcardsAction(coursId: string): Promise<GenResult> {
  const { profile } = await requireAdmin();
  const ctx = await loadCourseContext(coursId);
  if (!ctx) return { error: 'Cours introuvable.' };
  if (!ctx.hasFiche) {
    return {
      error: 'Aucune fiche n’est encore associée à ce cours. Téléversez d’abord la fiche PDF dans l’onglet « Fiche » pour que l’IA puisse générer des flashcards pertinentes.',
      needsFiche: true,
    };
  }
  const cours_titre = ctx.titre;
  const admin = createAdminClient();

  const { system, user } = flashcardsPrompt(contextToText(ctx));
  let result;
  try {
    result = await callClaude({ system, user, maxTokens: 12000, temperature: 0.4 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Échec de l’IA';
    await logGeneration({
      admin_id: profile.id, cours_id: coursId, cours_titre,
      kind: 'flashcards', items_count: 0,
      input_tokens: 0, output_tokens: 0,
      cost_usd: 0, price_eur: 0,
      status: 'failed', error_message: msg, model: 'unknown',
    });
    return { error: msg };
  }

  let cards: { recto: string; verso: string }[];
  try {
    cards = extractJson<{ recto: string; verso: string }[]>(result.text);
    if (!Array.isArray(cards)) throw new Error('Format inattendu (tableau attendu).');
    cards = cards
      .filter((c) => c && typeof c.recto === 'string' && typeof c.verso === 'string')
      .map((c) => ({ recto: c.recto.trim(), verso: c.verso.trim() }))
      .filter((c) => c.recto.length >= 4 && c.verso.length >= 4);
  } catch (e) {
    const cost_usd = usageToUsd(result.usage, result.model);
    await logGeneration({
      admin_id: profile.id, cours_id: coursId, cours_titre,
      kind: 'flashcards', items_count: 0,
      input_tokens: result.usage.input_tokens, output_tokens: result.usage.output_tokens,
      cost_usd, price_eur: 0,
      status: 'failed', error_message: (e as Error).message, model: result.model,
    });
    return { error: 'Réponse IA mal formée.' };
  }

  // Determine starting order_index
  const { data: existing } = await admin
    .from('flashcards').select('order_index').eq('cours_id', coursId)
    .order('order_index', { ascending: false }).limit(1);
  const startIdx = (existing?.[0]?.order_index ?? -1) + 1;

  const rows = cards.map((c, i) => ({
    cours_id: coursId,
    recto: c.recto, verso: c.verso,
    order_index: startIdx + i,
  }));

  const { error: insErr } = await admin.from('flashcards').insert(rows);
  const cost_usd = usageToUsd(result.usage, result.model);

  if (insErr) {
    await logGeneration({
      admin_id: profile.id, cours_id: coursId, cours_titre,
      kind: 'flashcards', items_count: 0,
      input_tokens: result.usage.input_tokens, output_tokens: result.usage.output_tokens,
      cost_usd, price_eur: 0,
      status: 'failed', error_message: insErr.message, model: result.model,
    });
    return { error: insErr.message };
  }

  await logGeneration({
    admin_id: profile.id, cours_id: coursId, cours_titre,
    kind: 'flashcards', items_count: cards.length,
    input_tokens: result.usage.input_tokens, output_tokens: result.usage.output_tokens,
    cost_usd, price_eur: PRICE_EUR.flashcards,
    status: 'success', error_message: null, model: result.model,
  });

  revalidatePath(`/admin/contenu/${coursId}`);
  return { ok: true, count: cards.length, cost_usd };
}

type QcmGenShape = {
  series: {
    label: string;
    questions: {
      enonce: string;
      items: { lettre: string; enonce: string; is_correct: boolean; justification: string }[];
    }[];
  }[];
};

export async function generateQcmAction(coursId: string): Promise<GenResult> {
  const { profile } = await requireAdmin();
  const ctx = await loadCourseContext(coursId);
  if (!ctx) return { error: 'Cours introuvable.' };
  if (!ctx.hasFiche) {
    return {
      error: 'Aucune fiche n’est encore associée à ce cours. Téléversez d’abord la fiche PDF dans l’onglet « Fiche » pour que l’IA puisse générer des QCM pertinents.',
      needsFiche: true,
    };
  }
  const cours_titre = ctx.titre;
  const admin = createAdminClient();

  const { system, user } = qcmPrompt(contextToText(ctx));
  let result;
  try {
    result = await callClaude({ system, user, maxTokens: 14000, temperature: 0.4 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Échec de l’IA';
    await logGeneration({
      admin_id: profile.id, cours_id: coursId, cours_titre,
      kind: 'qcm', items_count: 0,
      input_tokens: 0, output_tokens: 0,
      cost_usd: 0, price_eur: 0,
      status: 'failed', error_message: msg, model: 'unknown',
    });
    return { error: msg };
  }

  let parsed: QcmGenShape;
  try {
    parsed = extractJson<QcmGenShape>(result.text);
    if (!parsed?.series || !Array.isArray(parsed.series)) throw new Error('Format inattendu.');
  } catch (e) {
    const cost_usd = usageToUsd(result.usage, result.model);
    await logGeneration({
      admin_id: profile.id, cours_id: coursId, cours_titre,
      kind: 'qcm', items_count: 0,
      input_tokens: result.usage.input_tokens, output_tokens: result.usage.output_tokens,
      cost_usd, price_eur: 0,
      status: 'failed', error_message: (e as Error).message, model: result.model,
    });
    return { error: 'Réponse IA mal formée.' };
  }

  // Determine starting order_index for series
  const { data: existingSeries } = await admin
    .from('qcm_series').select('order_index').eq('cours_id', coursId).eq('type', 'qcm')
    .order('order_index', { ascending: false }).limit(1);
  let serieIdx = (existingSeries?.[0]?.order_index ?? -1) + 1;

  let totalQuestions = 0;

  for (const s of parsed.series.slice(0, 4)) {
    const { data: serieRow, error: serieErr } = await admin
      .from('qcm_series')
      .insert({
        cours_id: coursId,
        label: s.label || `Série ${serieIdx + 1}`,
        type: 'qcm',
        order_index: serieIdx++,
      })
      .select('id').single();
    if (serieErr || !serieRow) continue;

    const questions = (s.questions ?? []).slice(0, 5);
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      const { data: qRow, error: qErr } = await admin
        .from('qcm_questions')
        .insert({ serie_id: serieRow.id, enonce: q.enonce, order_index: qi })
        .select('id').single();
      if (qErr || !qRow) continue;

      const items = (q.items ?? []).slice(0, 5).map((it) => ({
        question_id: qRow.id,
        lettre: it.lettre,
        enonce: it.enonce,
        is_correct: !!it.is_correct,
        justification: it.justification ?? '',
      }));
      if (items.length > 0) await admin.from('qcm_items').insert(items);
      totalQuestions++;
    }
  }

  const cost_usd = usageToUsd(result.usage, result.model);
  await logGeneration({
    admin_id: profile.id, cours_id: coursId, cours_titre,
    kind: 'qcm', items_count: totalQuestions,
    input_tokens: result.usage.input_tokens, output_tokens: result.usage.output_tokens,
    cost_usd, price_eur: PRICE_EUR.qcm,
    status: totalQuestions === 20 ? 'success' : 'partial',
    error_message: null, model: result.model,
  });

  revalidatePath(`/admin/contenu/${coursId}`);
  return { ok: true, count: totalQuestions, cost_usd };
}
