/**
 * URL publique du bucket `blog-images`.
 *
 * Les images du blog sont téléversées depuis le navigateur (voir
 * `src/app/admin/blog/upload-image-browser.ts`) : le serveur ne reçoit plus le
 * fichier mais son URL. Il doit donc vérifier que cette URL désigne bien notre
 * bucket, et pas une adresse arbitraire fournie par le client.
 */

const BUCKET_PATH = '/storage/v1/object/public/blog-images/';

export function blogImagePublicPrefix(): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  return base ? `${base}${BUCKET_PATH}` : '';
}

/** Vrai si l'URL pointe vers un objet du bucket public `blog-images`. */
export function isBlogImageUrl(url: unknown): url is string {
  const prefix = blogImagePublicPrefix();
  if (!prefix || typeof url !== 'string') return false;
  return url.length <= 500 && url.startsWith(prefix) && url.length > prefix.length;
}
