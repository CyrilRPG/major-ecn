'use server';

import { revalidatePath } from 'next/cache';
import { assertCanWrite, requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { callClaude, extractJson } from '@/lib/ai/anthropic';
import { embed, toPgVector } from '@/lib/ai/embeddings';
import { flashcardsPrompt, qcmPrompt } from '@/lib/ai/prompts';
import { usageToUsd, PRICE_EUR } from '@/lib/ai/cost';

export async function addAnnaleAction(input: {
  coursId: string;
  label: string;
  annee: number | null;
  duration_minutes: number | null;
}): Promise<{ ok: true; id: string } | { error: string }> {
  const { scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'annale'); } catch (e) { return { error: (e as Error).message }; }
  if (!input.label?.trim()) return { error: 'Intitulé requis.' };
  const admin = createAdminClient();

  // determine next order_index for annales of this cours
  const { data: existing } = await admin
    .from('qcm_series')
    .select('order_index')
    .eq('cours_id', input.coursId)
    .eq('type', 'annale')
    .order('order_index', { ascending: false })
    .limit(1);
  const nextIdx = (existing?.[0]?.order_index ?? -1) + 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('qcm_series')
    .insert({
      cours_id: input.coursId,
      label: input.label.trim(),
      type: 'annale',
      annee: input.annee,
      duration_minutes: input.duration_minutes,
      order_index: nextIdx,
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message ?? 'Échec de la création.' };

  revalidatePath(`/admin/contenu/${input.coursId}`);
  return { ok: true, id: data.id };
}

/**
 * Réindexe les chunks RAG du cours (flashcards + items QCM) pour le moteur
 * Q&R. Idempotent : purge puis ré-insère. Ne couvre pas encore le PDF de fiche
 * (à venir : parsing PDF).
 */
export async function reindexCoursAction(coursId: string): Promise<
  | { ok: true; chunks: number; tokens: number }
  | { error: string }
> {
  const { scope } = await requireContentEditor();
  try {
    assertCanWrite(scope, 'flashcards');
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!process.env.VOYAGE_API_KEY) {
    return { error: 'VOYAGE_API_KEY non configurée — impossible de calculer les embeddings.' };
  }

  const admin = createAdminClient();
  const [{ data: cours }, { data: flashcards }, { data: items }] = await Promise.all([
    admin.from('cours').select('id, titre').eq('id', coursId).maybeSingle(),
    admin.from('flashcards').select('id, recto, verso').eq('cours_id', coursId),
    admin
      .from('qcm_items')
      .select('id, enonce, justification, qcm_questions!inner(enonce, qcm_series!inner(cours_id))')
      .eq('qcm_questions.qcm_series.cours_id', coursId),
  ]);
  if (!cours) return { error: 'Cours introuvable.' };

  type Row = { source: 'flashcard' | 'qcm'; source_id: string; content: string };
  const rows: Row[] = [];
  for (const f of flashcards ?? []) {
    rows.push({ source: 'flashcard', source_id: f.id, content: `${f.recto.trim()} — ${f.verso.trim()}` });
  }
  for (const it of (items ?? []) as Array<{
    id: string; enonce: string; justification: string;
    qcm_questions: { enonce: string };
  }>) {
    const justif = (it.justification ?? '').trim();
    if (justif.length < 8) continue;
    const content = `Q : ${it.qcm_questions.enonce}\nItem ${it.enonce}\nJustification : ${justif}`;
    rows.push({ source: 'qcm', source_id: it.id, content });
  }

  if (rows.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('cours_chunks').delete().eq('cours_id', coursId);
    return { ok: true, chunks: 0, tokens: 0 };
  }

  // Embed par batchs de 64
  let totalTokens = 0;
  const enriched: (Row & { embedding: number[] })[] = [];
  for (let i = 0; i < rows.length; i += 64) {
    const batch = rows.slice(i, i + 64);
    const { embeddings, total_tokens } = await embed(batch.map((r) => r.content), 'document');
    totalTokens += total_tokens;
    batch.forEach((r, k) => enriched.push({ ...r, embedding: embeddings[k] }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('cours_chunks').delete().eq('cours_id', coursId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insErr } = await (admin as any).from('cours_chunks').insert(
    enriched.map((r, idx) => ({
      cours_id: coursId,
      source: r.source,
      source_id: r.source_id,
      chunk_index: idx,
      content: r.content,
      token_count: Math.ceil(r.content.length / 4),
      embedding: toPgVector(r.embedding),
    })),
  );
  if (insErr) return { error: insErr.message };

  revalidatePath(`/admin/contenu/${coursId}`);
  return { ok: true, chunks: enriched.length, tokens: totalTokens };
}

type GenResult =
  | { ok: true; count: number; cost_usd: number }
  | { error: string; needsFiche?: boolean };

type CourseCtx = {
  titre: string;
  matiere: string;
  description: string | null;
  hasFiche: boolean;
  /** Annales déjà indexées pour ce cours — utilisées comme référence de style. */
  annales: { label: string; questions: { enonce: string; items: { lettre: string; enonce: string; is_correct: boolean; justification: string }[] }[] }[];
};

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

  // Charge les annales existantes du cours (style de référence pour les DP)
  const { data: annaleSeries } = await supabase
    .from('qcm_series')
    .select('id, label, qcm_questions(enonce, qcm_items(lettre, enonce, is_correct, justification))')
    .eq('cours_id', coursId)
    .eq('type', 'annale')
    .order('order_index');
  const annales = (annaleSeries ?? []).map((s) => ({
    label: s.label,
    questions: ((s as { qcm_questions?: { enonce: string; qcm_items?: { lettre: string; enonce: string; is_correct: boolean; justification: string }[] }[] }).qcm_questions ?? []).map((q) => ({
      enonce: q.enonce,
      items: q.qcm_items ?? [],
    })),
  }));

  return { titre: data.titre, matiere, description: data.description, hasFiche, annales };
}

function contextToText(ctx: CourseCtx): string {
  const parts = [
    `Titre du cours : ${ctx.titre}`,
    ctx.matiere ? `Collège / matière : ${ctx.matiere}` : '',
    ctx.description ? `Description / résumé : ${ctx.description}` : '',
  ];
  if (ctx.annales.length > 0) {
    parts.push('');
    parts.push('=== ANNALES DU COURS (référence de style obligatoire pour les DP) ===');
    for (const s of ctx.annales) {
      parts.push(`\n--- ${s.label} ---`);
      for (const q of s.questions.slice(0, 5)) {
        parts.push(`\nQ : ${q.enonce}`);
        for (const it of q.items) {
          parts.push(`  ${it.lettre}. ${it.enonce} [${it.is_correct ? 'VRAI' : 'FAUX'}] — ${it.justification}`);
        }
      }
    }
  } else {
    parts.push('');
    parts.push('=== Aucune annale indexée pour ce cours ===');
    parts.push('Génère les DP en s\'appuyant uniquement sur le contenu de la fiche, style EVC standard.');
  }
  return parts.filter(Boolean).join('\n');
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
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'flashcards'); } catch (e) { return { error: (e as Error).message }; }
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
    /** 'cours' = questions isolées · 'dp' = dossier progressif avec vignette */
    kind?: 'cours' | 'dp';
    /** Vignette clinique commune (uniquement pour kind='dp'). */
    vignette?: string;
    questions: {
      enonce: string;
      items: { lettre: string; enonce: string; is_correct: boolean; justification: string }[];
    }[];
  }[];
};

export async function generateQcmAction(coursId: string): Promise<GenResult> {
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'qcm'); } catch (e) { return { error: (e as Error).message }; }
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
    result = await callClaude({ system, user, maxTokens: 28000, temperature: 0.4 });
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
  let coursSeen = 0;
  let dpSeen = 0;

  for (const s of parsed.series.slice(0, 8)) {
    const kind: 'cours' | 'dp' = s.kind === 'dp' || /^DP\s*\d/i.test(s.label ?? '') ? 'dp' : 'cours';
    let label: string;
    if (kind === 'cours') {
      coursSeen += 1;
      label = s.label?.trim() || `QCM — Série ${coursSeen}`;
      // Conversion des anciens libellés « Cours — … » + ajout du préfixe.
      label = label.replace(/^cours\b/i, 'QCM');
      if (!/^qcm/i.test(label)) label = `QCM — ${label}`;
    } else {
      dpSeen += 1;
      label = s.label?.trim() || `DP ${dpSeen}`;
      if (!/^dp\s*\d/i.test(label)) label = `DP ${dpSeen} · ${label}`;
    }

    const vignette = kind === 'dp' && s.vignette?.trim() ? s.vignette.trim() : null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: serieRow, error: serieErr } = await (admin as any)
      .from('qcm_series')
      .insert({
        cours_id: coursId,
        label,
        type: 'qcm',
        order_index: serieIdx++,
        vignette, // stockée séparément, affichée dans un encadré au-dessus de chaque question
      })
      .select('id').single();
    if (serieErr || !serieRow) continue;

    const questions = (s.questions ?? []).slice(0, 5);
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      // Si l'IA a quand même préfixé la vignette dans l'énoncé, on la retire :
      // la vignette est désormais gérée séparément côté UI.
      let enonce = q.enonce;
      if (vignette && enonce.includes(vignette.slice(0, 40))) {
        enonce = enonce.replace(vignette, '').replace(/^[\s\n]+/, '').trim();
      }

      const { data: qRow, error: qErr } = await admin
        .from('qcm_questions')
        .insert({ serie_id: serieRow.id, enonce, order_index: qi })
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
    status: totalQuestions === 40 ? 'success' : 'partial',
    error_message: null, model: result.model,
  });

  revalidatePath(`/admin/contenu/${coursId}`);
  return { ok: true, count: totalQuestions, cost_usd };
}
