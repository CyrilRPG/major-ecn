'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Téléversement d'une image de blog DEPUIS LE NAVIGATEUR, directement vers le
 * bucket `blog-images`.
 *
 * POURQUOI PAS UNE SERVER ACTION. Le corps d'une requête vers une fonction
 * serverless est plafonné à 4,5 Mo côté plateforme — plafond que
 * `experimental.serverActions.bodySizeLimit` ne lève pas. Une photo de bannière
 * de 5 Mo (ou la bannière accompagnée des images d'illustration d'un import IA)
 * était donc rejetée par la plateforme AVANT d'atteindre notre code : l'action
 * levait une erreur réseau, et l'import restait sans effet ni message. En
 * passant par l'API Storage, le fichier ne transite plus par nos fonctions et
 * la requête d'import ne porte plus que du texte.
 *
 * SÉCURITÉ. Le client navigateur porte la session de l'administrateur : la
 * policy `storage_blog_images_admin_write` (insertion réservée aux admins)
 * reste le seul juge, exactement comme lors du téléversement côté serveur.
 */

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/** Au-delà, l'image est redimensionnée avant envoi (pages plus légères). */
const COMPRESS_ABOVE_BYTES = 1_200_000;
const MAX_EDGE_PX = 2200;

export type BrowserUpload =
  | { ok: true; url: string; name: string }
  | { ok: false; error: string };

/**
 * Réduit une photo trop lourde (appareil photo, capture d'écran Retina) à
 * 2200 px de côté maximum, en WebP. En cas d'échec — format exotique, canvas
 * indisponible — le fichier d'origine est renvoyé tel quel : la compression est
 * un confort, jamais une condition de l'envoi.
 */
async function downscale(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return file;
  if (file.size <= COMPRESS_ABOVE_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.85),
    );
    if (!blob || blob.size >= file.size) return file;
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${base}.webp`, { type: 'image/webp' });
  } catch {
    return file;
  }
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function uploadBlogImageFromBrowser(input: File): Promise<BrowserUpload> {
  if (input.type && !input.type.startsWith('image/')) {
    return { ok: false, error: `« ${input.name} » n’est pas une image.` };
  }
  if (input.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: `« ${input.name} » dépasse ${MAX_IMAGE_BYTES / 1024 / 1024} Mo.` };
  }

  const file = await downscale(input);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${new Date().getFullYear()}/${randomId()}.${ext}`;

  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from('blog-images')
      .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
    if (error) {
      return { ok: false, error: `Envoi de « ${input.name} » impossible : ${error.message}` };
    }
    const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
    return { ok: true, url: data.publicUrl, name: input.name };
  } catch (e) {
    return {
      ok: false,
      error: `Envoi de « ${input.name} » impossible : ${(e as Error)?.message ?? 'réseau indisponible'}`,
    };
  }
}
