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
  buildBlogArticleSystemPrompt, buildBlogArticleUserPrompt, makeHrefFilter,
  normalizeBlocks, normalizeDraftMeta, slugifyArticle, type AiImage, type BlogAiSeo,
} from '@/lib/ai/blog-article';
import { getArticlePicker } from '@/lib/data/blog-db';
import type { Block } from '@/lib/data/blog-content/types';
import type { Json } from '@/types/database';

/**
 * Import d'un article par IA : l'administrateur dépose un texte et une bannière,
 * Claude Sonnet en fait un article mis en page et optimisé SEO, enregistré en
 * BROUILLON. L'aperçu puis la publication se font ensuite dans l'éditeur
 * habituel (/admin/blog/[id]/edit), avec le même rendu que la page publique.
 *
 * Chaque génération réussie est facturée au forfait (voir BILLING_EUR.article)
 * et tracée dans `ai_generations`, catégorie « Articles » de la facturation IA.
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_EXTRA_IMAGES = 8;
const MIN_TEXT_CHARS = 200;
const MAX_TEXT_CHARS = 60_000;

export type ImportResult =
  | { ok: true; id: string; slug: string; title: string; warnings: string[]; seo: BlogAiSeo; costUsd: number }
  | { ok: false; error: string };

/** Téléverse une image dans le bucket public `blog-images`. */
async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: `« ${file.name} » dépasse 8 Mo.` };
  if (file.type && !file.type.startsWith('image/')) {
    return { ok: false, error: `« ${file.name} » n’est pas une image.` };
  }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('blog-images')
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
  if (error) return { ok: false, error: `Envoi de « ${file.name} » impossible : ${error.message}` };
  return { ok: true, url: supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl };
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
  const banner = formData.get('banner');
  const extras = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);

  if (!(banner instanceof File) || banner.size === 0) {
    return { ok: false, error: 'L’image de bannière est obligatoire.' };
  }
  if (rawText.length < MIN_TEXT_CHARS) {
    return { ok: false, error: `Le texte de l’article est obligatoire (au moins ${MIN_TEXT_CHARS} caractères).` };
  }
  if (rawText.length > MAX_TEXT_CHARS) {
    return { ok: false, error: 'Le texte dépasse 60 000 caractères : découpez-le en plusieurs articles.' };
  }
  if (extras.length > MAX_EXTRA_IMAGES) {
    return { ok: false, error: `Maximum ${MAX_EXTRA_IMAGES} images supplémentaires.` };
  }

  const supabase = await createClient();

  // 1. Images → bucket public (l'IA ne manipule que des URLs finales).
  const heroUpload = await uploadImage(supabase, banner);
  if (!heroUpload.ok) return { ok: false, error: heroUpload.error };
  const extraImages: AiImage[] = [];
  for (const file of extras) {
    const up = await uploadImage(supabase, file);
    if (!up.ok) return { ok: false, error: up.error };
    extraImages.push({ url: up.url, name: file.name });
  }

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
  const slug = await uniqueSlug(supabase, slugifyArticle(meta.slug || meta.title));
  const content: Block[] = [{ t: 'hero', src: heroUpload.url, alt: meta.title }, ...blocks];
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug,
      title: meta.title,
      excerpt: meta.excerpt,
      category: meta.category,
      reading_minutes: meta.readingMinutes,
      hero_image: heroUpload.url,
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

  // 6. Facturation : forfait par article généré (2,50 €).
  await logGeneration({
    ...baseLog, ...tokens,
    cours_titre: meta.title.slice(0, 200),
    items_count: blocks.length,
    price_eur: BILLING_EUR.article,
    status: 'success',
  });
  await logAudit({
    actor: profile,
    action: 'create',
    entity: 'blog_post',
    entityId: data.id,
    description: `Article de blog « ${meta.title} » importé par IA (${blocks.length} blocs, brouillon)`,
  });

  revalidatePath('/admin/blog');
  return { ok: true, id: data.id, slug, title: meta.title, warnings, seo: meta.seo, costUsd };
}
