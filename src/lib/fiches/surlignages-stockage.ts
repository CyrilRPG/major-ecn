import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  lireFichier,
  nomVersionSurlignages,
  trierVersionsSurlignages,
  MAX_OCTETS_FICHIER,
  type FichierSurlignages,
  type Surlignage,
} from './surlignages-pure';

/**
 * Stockage des surlignages d'élèves dans un bucket Supabase Storage PRIVÉ :
 * `<user_id>/<fiche_id>/<version>.json`.
 *
 * Pourquoi pas une table : aucune table existante ne convient (`course_notes`
 * est keyée par item et porte le HTML des notes) et une migration n'est
 * appliquée qu'à la main. Le bucket se crée tout seul au premier besoin, et
 * l'accès ne passe QUE par /api/fiches/[cours]/surlignages (clé service-role
 * après contrôle d'accès) — aucune policy storage n'ouvre ce bucket aux élèves.
 *
 * Pourquoi un fichier par VERSION plutôt qu'un fichier réécrit : le CDN du
 * stockage Supabase sert un objet réécrit dans sa version PRÉCÉDENTE pendant
 * jusqu'à une minute (constaté le 28/09/2026 : `cf-cache-status: HIT` avec
 * l'ancien contenu, paramètre de requête ignoré). Un élève qui rechargeait la
 * fiche juste après avoir surligné aurait relu l'ancienne liste — et le
 * prochain enregistrement l'aurait écrasée. Chaque écriture crée donc un NOUVEL
 * objet (nom horodaté, jamais mis en cache auparavant) ; la lecture prend le
 * plus récent d'après le listing (requête en base, sans CDN). Les anciennes
 * versions sont purgées après chaque écriture réussie.
 */

export const BUCKET_SURLIGNAGES = 'surlignages-fiches';

/** Versions conservées après écriture (la dernière + un filet de sécurité). */
const VERSIONS_GARDEES = 2;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function dossier(userId: string, ficheId: string): string {
  if (!UUID_RE.test(userId) || !UUID_RE.test(ficheId)) throw new Error('identifiant invalide');
  return `${userId}/${ficheId}`;
}

let bucketPret: Promise<void> | null = null;

/** Crée le bucket privé s'il n'existe pas (idempotent, une fois par instance). */
function assurerBucket(): Promise<void> {
  bucketPret ??= (async () => {
    const admin = createAdminClient();
    const { error } = await admin.storage.createBucket(BUCKET_SURLIGNAGES, {
      public: false,
      fileSizeLimit: MAX_OCTETS_FICHIER,
      allowedMimeTypes: ['application/json'],
    });
    if (error && !/exist/i.test(error.message)) {
      bucketPret = null; // réessayer à la prochaine écriture
      throw new Error(error.message);
    }
  })();
  return bucketPret;
}

/** Versions présentes, de la plus récente à la plus ancienne. */
async function versions(prefixe: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET_SURLIGNAGES).list(prefixe, {
    limit: 100,
    sortBy: { column: 'name', order: 'desc' },
  });
  if (error) {
    // Bucket pas encore créé : personne n'a jamais surligné.
    if (/not.?found|does not exist/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return trierVersionsSurlignages((data ?? []).map((f) => f.name));
}

/**
 * Surlignages de l'élève sur la fiche. STRICT : une erreur de lecture remonte
 * (jamais de liste vide « par défaut ») — sinon le prochain enregistrement
 * écraserait tous les surlignages existants.
 */
export async function lireSurlignages(userId: string, ficheId: string): Promise<FichierSurlignages> {
  const prefixe = dossier(userId, ficheId);
  const [derniere] = await versions(prefixe);
  if (!derniere) return { version: 1, surlignages: [], majLe: null };
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET_SURLIGNAGES).download(`${prefixe}/${derniere}`);
  if (error || !data) throw new Error(error?.message ?? 'lecture impossible');
  try {
    return lireFichier(JSON.parse(await data.text()));
  } catch {
    // Contenu illisible : on repart d'une liste vide plutôt que de bloquer la fiche.
    return { version: 1, surlignages: [], majLe: null };
  }
}

export async function ecrireSurlignages(
  userId: string,
  ficheId: string,
  surlignages: Surlignage[],
): Promise<FichierSurlignages> {
  const prefixe = dossier(userId, ficheId);
  await assurerBucket();
  const maintenant = Date.now();
  const fichier: FichierSurlignages = { version: 1, surlignages, majLe: new Date(maintenant).toISOString() };
  const corps = Buffer.from(JSON.stringify(fichier), 'utf8');
  if (corps.byteLength > MAX_OCTETS_FICHIER) throw new Error('trop volumineux');
  const admin = createAdminClient();
  const nom = nomVersionSurlignages(maintenant, Math.random());
  const { error } = await admin.storage
    .from(BUCKET_SURLIGNAGES)
    .upload(`${prefixe}/${nom}`, corps, { contentType: 'application/json', upsert: false });
  if (error) throw new Error(error.message);

  // Purge des anciennes versions : sans importance si elle échoue (la lecture
  // prend toujours la plus récente), on réessaiera à la prochaine écriture.
  try {
    const anciennes = (await versions(prefixe)).slice(VERSIONS_GARDEES);
    if (anciennes.length > 0) {
      await admin.storage.from(BUCKET_SURLIGNAGES).remove(anciennes.map((n) => `${prefixe}/${n}`));
    }
  } catch (e) {
    console.warn('[surlignages] purge des anciennes versions impossible :', e);
  }
  return fichier;
}
