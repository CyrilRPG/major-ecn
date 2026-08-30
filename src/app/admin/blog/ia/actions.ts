'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { callClaude, extractJson, DEFAULT_MODEL } from '@/lib/ai/anthropic';
import { usageToUsd, BILLING_EUR, GEN_FEATURE } from '@/lib/ai/cost';
import {
  buildBlogArticleSystemPrompt, buildBlogArticleUserPrompt,
  buildBlogRevisionSystemPrompt, buildBlogRevisionUserPrompt, makeHrefFilter,
  normalizeBlocks, normalizeDraftMeta, plainText, slugifyArticle, type AiImage, type BlogAiSeo,
} from '@/lib/ai/blog-article';
import { getArticlePicker } from '@/lib/data/blog-db';
import { findDuplicateArticle, type DuplicateArticle } from '@/lib/data/blog-duplicates';
import { isBlogImageUrl } from '@/lib/data/blog-image-url';
import type { Block } from '@/lib/data/blog-content/types';
import type { Json } from '@/types/database';

/**
 * Import d'un article par IA : l'administrateur dépose un texte et une bannière,
 * Claude Sonnet en fait un article mis en page et optimisé SEO, enregistré en
 * BROUILLON. L'aperçu puis la publication se font ensuite dans l'éditeur
 * habituel (/admin/blog/[id]/edit), avec le même rendu que la page publique.
 *
 * Les images sont téléversées par le NAVIGATEUR (upload-image-browser.ts) : on
 * ne reçoit ici que leurs URLs, vérifiées comme appartenant au bucket
 * `blog-images`. Les faire transiter par cette action les faisait buter sur le
 * plafond de 4,5 Mo imposé aux corps de requête des fonctions serverless, qui
 * rejetait l'import sans message dès que la bannière était une photo un peu
 * lourde.
 *
 * Chaque génération réussie est facturée au forfait (voir BILLING_EUR.article)
 * et tracée dans `ai_generations`, catégorie « Articles » de la facturation IA.
 */

const MAX_EXTRA_IMAGES = 8;
const MIN_TEXT_CHARS = 200;
const MAX_TEXT_CHARS = 60_000;

export type ImportResult =
  | {
      ok: true;
      id: string;
      slug: string;
      title: string;
      warnings: string[];
      seo: BlogAiSeo;
      costUsd: number;
      /**
       * Un article au titre équivalent existe déjà : le brouillon est créé mais
       * PAS ENCORE facturé — l'administrateur doit choisir entre le garder
       * (confirmDuplicateImport → facturation) ou le supprimer
       * (discardDuplicateImport → rien n'est facturé).
       */
      duplicateOf?: DuplicateArticle;
    }
  | { ok: false; error: string };

/** Étiquette posée sur la ligne `ai_generations` d'un import en attente de
 *  confirmation (doublon) : hors facturation tant que non confirmée. */
const HOLD_FEATURE = 'blog_article_duplicate_hold';
const holdTag = (postId: string) => `duplicate_hold:${postId}`;

/**
 * Images d'illustration envoyées par le formulaire : `[{ url, name }]` en JSON.
 * Toute URL étrangère au bucket `blog-images` est écartée — le modèle ne doit
 * pouvoir citer que des fichiers réellement déposés pour cet article.
 */
function parseExtraImages(raw: unknown): AiImage[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  let list: unknown;
  try {
    list = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];
  const out: AiImage[] = [];
  for (const entry of list) {
    const { url, name } = (entry ?? {}) as { url?: unknown; name?: unknown };
    if (!isBlogImageUrl(url)) continue;
    out.push({ url, name: (typeof name === 'string' ? name : 'image').slice(0, 120) });
    if (out.length >= MAX_EXTRA_IMAGES) break;
  }
  return out;
}

/** Ajoute un suffixe numérique tant que le slug est déjà pris. */
async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string): Promise<string> {
  const root = base || 'article';
  for (let i = 0; i < 30; i++) {
    const candidate = i === 0 ? root : `${root.slice(0, 86)}-${i + 1}`;
    const { data } = await supabase.from('blog_posts').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${root.slice(0, 80)}-${Date.now().toString(36)}`;
}

/** Trace la génération dans `ai_generations` (facturation IA — catégorie Articles). */
async function logGeneration(args: Record<string, unknown>) {
  try {
    await (createAdminClient() as any).from('ai_generations').insert(args);
  } catch (err) {
    console.error('[blog-ia] log facturation impossible :', err);
  }
}

export async function importArticleWithAi(formData: FormData): Promise<ImportResult> {
  const { user, profile } = await requireAdmin();

  const rawText = String(formData.get('text') ?? '').trim();
  const seoBrief = String(formData.get('seoBrief') ?? '').trim();
  const bannerUrl = formData.get('bannerUrl');

  // 1. Images : déjà dans le bucket, envoyées par le navigateur.
  if (!isBlogImageUrl(bannerUrl)) {
    return { ok: false, error: 'L’image de bannière est obligatoire (son envoi doit être terminé).' };
  }
  if (rawText.length < MIN_TEXT_CHARS) {
    return { ok: false, error: `Le texte de l’article est obligatoire (au moins ${MIN_TEXT_CHARS} caractères).` };
  }
  if (rawText.length > MAX_TEXT_CHARS) {
    return { ok: false, error: 'Le texte dépasse 60 000 caractères : découpez-le en plusieurs articles.' };
  }
  const extraImages = parseExtraImages(formData.get('images'));

  const supabase = await createClient();

  // 2. Maillage interne : pages vitrine + articles réellement publiés.
  const articles = await getArticlePicker();
  const isHrefAllowed = makeHrefFilter(articles.map((a) => a.slug));

  const system = buildBlogArticleSystemPrompt();
  const userPrompt = buildBlogArticleUserPrompt({ rawText, seoBrief, extraImages, articles });

  const baseLog = {
    admin_id: profile.id,
    cours_id: null,
    kind: 'blog_article',
    feature: GEN_FEATURE.article,
    items_count: 0,
    input_tokens: 0,
    output_tokens: 0,
    cost_usd: 0,
    price_eur: 0,
    model: DEFAULT_MODEL,
  };

  // 3. Génération.
  let result;
  try {
    result = await callClaude({
      system,
      user: userPrompt,
      model: DEFAULT_MODEL,
      maxTokens: 20_000,
      temperature: 0.6,
    });
  } catch (e) {
    const msg = (e as Error).message;
    await logGeneration({
      ...baseLog, cours_titre: rawText.slice(0, 120), status: 'failed', error_message: msg.slice(0, 500),
    });
    return { ok: false, error: `Génération impossible : ${msg}` };
  }

  const costUsd = usageToUsd(result.usage, result.model);
  const tokens = {
    input_tokens: result.usage.input_tokens,
    output_tokens: result.usage.output_tokens,
    cost_usd: costUsd,
    model: result.model,
  };

  let parsed: Record<string, unknown>;
  try {
    parsed = extractJson<Record<string, unknown>>(result.text);
  } catch (e) {
    await logGeneration({
      ...baseLog, ...tokens, cours_titre: rawText.slice(0, 120), status: 'failed',
      error_message: `Réponse IA mal formée : ${(e as Error).message}`.slice(0, 500),
    });
    return { ok: false, error: 'L’IA a renvoyé une réponse mal formée. Relancez l’import.' };
  }

  // 4. Validation : blocs connus, HTML nettoyé, images et liens vérifiés.
  const meta = normalizeDraftMeta(parsed, rawText.slice(0, 70));
  const { blocks, warnings } = normalizeBlocks(parsed.blocks, {
    allowedImages: new Set(extraImages.map((i) => i.url)),
    isHrefAllowed,
  });
  if (blocks.length < 3) {
    await logGeneration({
      ...baseLog, ...tokens, cours_titre: meta.title.slice(0, 200), status: 'failed',
      error_message: 'Article vide après validation des blocs.',
    });
    return { ok: false, error: 'L’article généré était inexploitable. Relancez l’import.' };
  }

  // 5. Enregistrement en brouillon — la bannière est le bloc « hero », comme
  //    dans l'éditeur manuel (savePost).
  //    Doublon de titre détecté AVANT facturation : le brouillon est créé
  //    (la génération a déjà coûté), mais la facturation attend la décision
  //    de l'administrateur (garder / supprimer).
  const duplicateOf = await findDuplicateArticle(supabase, meta.title, null);
  const slug = await uniqueSlug(supabase, slugifyArticle(meta.slug || meta.title));
  const content: Block[] = [{ t: 'hero', src: bannerUrl, alt: meta.title }, ...blocks];
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug,
      title: meta.title,
      excerpt: meta.excerpt,
      category: meta.category,
      reading_minutes: meta.readingMinutes,
      hero_image: bannerUrl,
      content: content as unknown as Json,
      status: 'draft',
      featured: false,
      published_at: null,
      author_id: user.id,
    })
    .select('id')
    .single();

  if (error || !data) {
    await logGeneration({
      ...baseLog, ...tokens, cours_titre: meta.title.slice(0, 200), status: 'failed',
      error_message: `Enregistrement impossible : ${error?.message ?? 'inconnu'}`.slice(0, 500),
    });
    return { ok: false, error: `Article généré mais non enregistré : ${error?.message ?? 'erreur inconnue'}` };
  }

  // 6. Facturation : forfait par article généré (2,50 €). En cas de doublon,
  //    la ligne est enregistrée « en attente » (hors facturation) : elle ne
  //    devient facturable que si l'administrateur confirme vouloir garder
  //    l'article — plus jamais de doublon supprimé mais facturé.
  await logGeneration({
    ...baseLog, ...tokens,
    cours_titre: meta.title.slice(0, 200),
    items_count: blocks.length,
    ...(duplicateOf
      ? { feature: HOLD_FEATURE, price_eur: 0, error_message: holdTag(data.id) }
      : { price_eur: BILLING_EUR.article }),
    status: 'success',
  });
  // Journal et cache : l'article existe déjà en base, un incident ici ne doit
  // pas transformer un import réussi en échec côté administrateur.
  try {
    await logAudit({
      actor: profile,
      action: 'create',
      entity: 'blog_post',
      entityId: data.id,
      description: `Article de blog « ${meta.title} » importé par IA (${blocks.length} blocs, brouillon)`,
    });
    revalidatePath('/admin/blog');
  } catch (err) {
    console.error('[blog-ia] journalisation/revalidation :', err);
  }
  return {
    ok: true,
    id: data.id,
    slug,
    title: meta.title,
    warnings,
    seo: meta.seo,
    costUsd,
    ...(duplicateOf ? { duplicateOf } : {}),
  };
}

/**
 * L'administrateur confirme garder un import détecté en doublon : la ligne
 * « en attente » devient une ligne facturée (2,50 €), comme un import normal.
 */
export async function confirmDuplicateImport(postId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { error } = await (createAdminClient() as any)
      .from('ai_generations')
      .update({ feature: GEN_FEATURE.article, price_eur: BILLING_EUR.article, error_message: null })
      .eq('kind', 'blog_article')
      .eq('feature', HOLD_FEATURE)
      .eq('error_message', holdTag(postId));
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * L'administrateur renonce à un import détecté en doublon : le brouillon est
 * supprimé et RIEN n'est facturé (la ligne « en attente » garde la trace des
 * jetons consommés, à 0 €).
 */
export async function discardDuplicateImport(postId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
  if (error) return { ok: false, error: error.message };
  try {
    await (createAdminClient() as any)
      .from('ai_generations')
      .update({ error_message: 'Doublon abandonné par l’administrateur — non facturé.' })
      .eq('kind', 'blog_article')
      .eq('feature', HOLD_FEATURE)
      .eq('error_message', holdTag(postId));
  } catch (err) {
    console.error('[blog-ia] trace doublon abandonné :', err);
  }
  revalidatePath('/admin/blog');
  return { ok: true };
}

/* ─────────────────── Retouche d'un article par l'IA ─────────────────── */

export type ReviseInput = {
  /** Id de l'article (traçabilité) — la retouche travaille sur l'état COURANT de l'éditeur. */
  id?: string;
  title: string;
  excerpt: string;
  readingMinutes: number;
  blocks: Block[];
  remarks: string;
};

export type ReviseResult =
  | {
      ok: true;
      title: string;
      excerpt: string;
      readingMinutes: number;
      blocks: Block[];
      /** Résumé, rédigé par l'IA, de ce qui a été modifié. */
      changes: string;
      warnings: string[];
    }
  | { ok: false; error: string };

/**
 * Applique les remarques de l'administrateur à un article existant (souvent
 * issu d'un import IA) : contenu, mise en page, corrections. La sortie passe
 * par la MÊME revalidation que l'import (blocs connus, HTML nettoyé, images
 * limitées à celles déjà présentes, liens vérifiés). Retouche non facturée
 * (tracée à 0 € dans ai_generations) : corriger un article déjà payé ne coûte
 * rien de plus.
 */
export async function reviseArticleWithAi(input: ReviseInput): Promise<ReviseResult> {
  const { profile } = await requireAdmin();

  const remarks = (input.remarks ?? '').trim();
  if (remarks.length < 5) return { ok: false, error: 'Écrivez d’abord vos remarques pour l’IA.' };
  if (remarks.length > 4_000) return { ok: false, error: 'Remarques trop longues (4 000 caractères maximum).' };
  if (!Array.isArray(input.blocks) || input.blocks.length === 0) {
    return { ok: false, error: 'L’article ne contient aucun bloc à retoucher.' };
  }

  // Les seules images autorisées en sortie : celles déjà présentes dans l'article.
  const currentImages = new Set<string>();
  for (const b of input.blocks) {
    if (b.t === 'img') currentImages.add(b.src);
    if (b.t === 'gallery') for (const im of b.images) currentImages.add(im.src);
  }

  const articles = await getArticlePicker();
  const isHrefAllowed = makeHrefFilter(articles.map((a) => a.slug));

  const bodyBlocks = input.blocks.filter((b) => b.t !== 'hero');
  const system = buildBlogRevisionSystemPrompt();
  const userPrompt = buildBlogRevisionUserPrompt({
    article: {
      title: input.title,
      excerpt: input.excerpt,
      readingMinutes: input.readingMinutes,
      blocks: bodyBlocks,
    },
    remarks,
    articles,
  });

  const baseLog = {
    admin_id: profile.id,
    cours_id: null,
    kind: 'blog_article',
    feature: 'blog_article_revision',
    items_count: 0,
    input_tokens: 0,
    output_tokens: 0,
    cost_usd: 0,
    price_eur: 0,
    model: DEFAULT_MODEL,
    cours_titre: input.title.slice(0, 200),
  };

  let result;
  try {
    result = await callClaude({
      system,
      user: userPrompt,
      model: DEFAULT_MODEL,
      maxTokens: 20_000,
      temperature: 0.3,
    });
  } catch (e) {
    const msg = (e as Error).message;
    await logGeneration({ ...baseLog, status: 'failed', error_message: msg.slice(0, 500) });
    return { ok: false, error: `Retouche impossible : ${msg}` };
  }

  const tokens = {
    input_tokens: result.usage.input_tokens,
    output_tokens: result.usage.output_tokens,
    cost_usd: usageToUsd(result.usage, result.model),
    model: result.model,
  };

  let parsed: Record<string, unknown>;
  try {
    parsed = extractJson<Record<string, unknown>>(result.text);
  } catch (e) {
    await logGeneration({
      ...baseLog, ...tokens, status: 'failed',
      error_message: `Réponse IA mal formée : ${(e as Error).message}`.slice(0, 500),
    });
    return { ok: false, error: 'L’IA a renvoyé une réponse mal formée. Reformulez vos remarques et réessayez.' };
  }

  const { blocks, warnings } = normalizeBlocks(parsed.blocks, {
    allowedImages: currentImages,
    isHrefAllowed,
    reAddForgottenImages: false,
  });
  if (blocks.length < 2) {
    await logGeneration({
      ...baseLog, ...tokens, status: 'failed',
      error_message: 'Article vide après validation des blocs de la retouche.',
    });
    return { ok: false, error: 'La retouche a produit un article inexploitable : rien n’a été modifié.' };
  }

  const minutes = Number(parsed.readingMinutes);
  await logGeneration({ ...baseLog, ...tokens, items_count: blocks.length, status: 'success' });

  return {
    ok: true,
    title: plainText(parsed.title) || input.title,
    excerpt: plainText(parsed.excerpt).slice(0, 300) || input.excerpt,
    readingMinutes: Number.isFinite(minutes)
      ? Math.min(25, Math.max(3, Math.round(minutes)))
      : input.readingMinutes,
    blocks,
    changes: plainText(parsed.changes),
    warnings,
  };
}
