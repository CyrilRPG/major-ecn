/**
 * Signatures manuscrites recueillies à l'inscription payante.
 *
 * POURQUOI DU STOCKAGE ET PAS UNE TABLE. Au moment où le futur élève signe, il
 * n'a pas encore de compte : celui-ci n'est créé qu'après l'encaissement, par
 * le webhook Stripe. La signature ne peut donc pas être rattachée à un
 * `user_id`. On la range dans un bucket privé, sous un préfixe dérivé de
 * l'adresse email — la seule clé disponible des deux côtés, et celle que le
 * provisioning réutilise pour créer le compte.
 *
 * Un objet PNG et un manifeste JSON de même nom sont écrits côte à côte :
 * l'image est la preuve, le manifeste porte l'identité déclarée, la formule et
 * l'horodatage. La consultation passe par une URL signée à durée limitée
 * (bucket privé, jamais d'accès public).
 *
 * Le bucket est créé à la première écriture : aucune migration à appliquer à la
 * main avant que la fonctionnalité ne serve.
 */
import { createAdminClient } from '@/lib/supabase/admin';

export const SIGNATURES_BUCKET = 'inscription-signatures';

/** Une signature PNG raisonnable pèse quelques dizaines de Ko — même garde-fou
 *  que l'émargement (`/api/emargement`). */
export const MAX_SIGNATURE_CHARS = 400_000;

/** Préfixe de rangement d'un élève. L'email est normalisé pour rester une clé
 *  de stockage valide, et reste lisible dans la console Supabase. */
export function emailPrefix(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9._@-]+/g, '-');
}

/** Identité et contexte figés au moment de la signature. */
export type SignatureManifest = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  formule: string;
  specialty?: string | null;
  voie?: string | null;
  installments?: number;
  /** Horodatage serveur — celui du navigateur n'est pas opposable. */
  signedAt: string;
  /** Session Stripe associée, renseignée une fois celle-ci créée. */
  sessionId?: string | null;
  /** Texte exact de la clause de renonciation acceptée avec la signature. */
  clause?: string;
};

export type StoredSignature = {
  id: string;
  path: string;
  signedAt: string | null;
  url: string | null;
  manifest: SignatureManifest | null;
};

/** `data:image/png;base64,…` → binaire, en refusant tout ce qui n'est pas un
 *  PNG de taille raisonnable. Renvoie `null` si l'entrée est invalide. */
export function decodeSignaturePng(dataUrl: string | undefined | null): Buffer | null {
  const raw = (dataUrl ?? '').trim();
  if (!raw.startsWith('data:image/png;base64,')) return null;
  if (raw.length > MAX_SIGNATURE_CHARS) return null;
  const base64 = raw.slice('data:image/png;base64,'.length);
  try {
    const buf = Buffer.from(base64, 'base64');
    // Un PNG vide ou tronqué n'est pas une preuve : on exige la signature de
    // fichier PNG et quelques centaines d'octets de tracé.
    if (buf.length < 200) return null;
    if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
    return buf;
  } catch {
    return null;
  }
}

/** Crée le bucket privé s'il n'existe pas encore. Idempotent : une erreur
 *  « already exists » est un succès. */
async function ensureBucket(): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.storage.createBucket(SIGNATURES_BUCKET, {
    public: false,
    fileSizeLimit: 1024 * 1024,
    // Le PNG est la signature, le JSON son manifeste. N'autoriser que l'image
    // faisait rejeter silencieusement le manifeste par le stockage.
    allowedMimeTypes: ['image/png', 'application/json'],
  });
  if (error && !/exist/i.test(error.message)) throw new Error(error.message);
}

/**
 * Range la signature et son manifeste. Lève en cas d'échec : une inscription
 * dont la signature n'est pas conservée n'aurait aucune valeur de preuve, et
 * l'appelant doit refuser d'ouvrir le paiement.
 */
export async function storeInscriptionSignature(
  png: Buffer,
  manifest: SignatureManifest,
): Promise<{ id: string; path: string }> {
  await ensureBucket();
  const admin = createAdminClient();
  const id = crypto.randomUUID();
  const path = `${emailPrefix(manifest.email)}/${id}.png`;

  const { error } = await admin.storage
    .from(SIGNATURES_BUCKET)
    .upload(path, png, { contentType: 'image/png', upsert: false });
  if (error) throw new Error(`signature non enregistrée : ${error.message}`);

  // Le manifeste est un confort de relecture : son échec ne doit pas invalider
  // la signature elle-même, déjà écrite. Il est en revanche journalisé — un
  // rejet silencieux du stockage (type MIME refusé) nous avait déjà privés de
  // tout contexte de signature sans que rien ne le signale.
  try {
    const { error: manifestError } = await admin.storage
      .from(SIGNATURES_BUCKET)
      .upload(
        path.replace(/\.png$/, '.json'),
        Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'),
        { contentType: 'application/json', upsert: true },
      );
    if (manifestError) {
      console.error('[signature] manifeste non enregistré', { path, error: manifestError.message });
    }
  } catch (e) {
    console.error('[signature] manifeste non enregistré', { path, error: String(e) });
  }

  return { id, path };
}

/** Complète le manifeste avec la session Stripe, une fois celle-ci créée. */
export async function attachSessionToSignature(path: string, sessionId: string): Promise<void> {
  const admin = createAdminClient();
  const jsonPath = path.replace(/\.png$/, '.json');
  const { data } = await admin.storage.from(SIGNATURES_BUCKET).download(jsonPath);
  if (!data) return;
  const manifest = JSON.parse(await data.text()) as SignatureManifest;
  await admin.storage
    .from(SIGNATURES_BUCKET)
    .upload(
      jsonPath,
      Buffer.from(JSON.stringify({ ...manifest, sessionId }, null, 2), 'utf8'),
      { contentType: 'application/json', upsert: true },
    );
}

/**
 * Signatures d'un élève, les plus récentes d'abord, avec une URL de
 * consultation valable une heure. Un élève peut en avoir plusieurs : une par
 * souscription, y compris les tentatives de paiement non abouties.
 */
export async function listSignaturesForEmail(email: string): Promise<StoredSignature[]> {
  const admin = createAdminClient();
  const prefix = emailPrefix(email);
  const { data, error } = await admin.storage
    .from(SIGNATURES_BUCKET)
    .list(prefix, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  // Bucket absent (aucune signature recueillie à ce jour) : ce n'est pas une
  // erreur à remonter à l'écran, c'est une liste vide.
  if (error || !data) return [];

  const pngs = data.filter((f) => f.name.endsWith('.png'));
  return Promise.all(
    pngs.map(async (f) => {
      const path = `${prefix}/${f.name}`;
      const [{ data: signed }, manifest] = await Promise.all([
        admin.storage.from(SIGNATURES_BUCKET).createSignedUrl(path, 3600),
        admin.storage
          .from(SIGNATURES_BUCKET)
          .download(path.replace(/\.png$/, '.json'))
          .then(async ({ data: blob }) => (blob ? (JSON.parse(await blob.text()) as SignatureManifest) : null))
          .catch(() => null),
      ]);
      return {
        id: f.name.replace(/\.png$/, ''),
        path,
        signedAt: manifest?.signedAt ?? f.created_at ?? null,
        url: signed?.signedUrl ?? null,
        manifest,
      };
    }),
  );
}
