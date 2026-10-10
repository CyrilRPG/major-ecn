/**
 * Marqueur « se connecter en tant que » (cookie `impersonator_id`) SIGNÉ.
 *
 * POURQUOI. Le cookie valait jusqu'ici l'identifiant de l'administrateur, en
 * clair, et sa seule PRÉSENCE suffisait : un élève qui le créait lui-même
 * (`document.cookie = 'impersonator_id=x'`) échappait au contrôle d'appareil
 * unique (compte partageable), aux formulaires obligatoires et aux
 * questionnaires bloquants.
 *
 * Désormais : `v1.<adminId>.<cibleId>.<échéance ms>.<HMAC-SHA256>` — signé
 * côté serveur, LIÉ au compte ouvert (cibleId = utilisateur de la session) et
 * borné dans le temps. Un marqueur non signé, falsifié ou porté par un autre
 * compte est ignoré (et effacé par le middleware) ; un marqueur authentique
 * mais échu ferme la session « en tant que ».
 *
 * Web Crypto uniquement : utilisable dans le middleware comme dans Node.
 * Module SERVEUR (lit un secret) — jamais importé par un composant client.
 */

export const COOKIE_MARQUEUR = 'impersonator_id';

/** Durée de validité d'une session « en tant que » (même onglet ou onglet séparé). */
export const MARQUEUR_DUREE_MS = 12 * 3_600_000;

export type EtatMarqueur =
  | { etat: 'absent' }
  | { etat: 'invalide' }
  | { etat: 'expire'; adminId: string }
  | { etat: 'valide'; adminId: string; expMs: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const enc = new TextEncoder();
let clePromise: Promise<CryptoKey> | null = null;

/**
 * Clé HMAC : `IMPERSONATION_SECRET` si défini, sinon dérivée (SHA-256, avec
 * un préfixe d'usage) de la clé service-role — secret serveur déjà présent
 * partout, jamais exposé au navigateur.
 */
function cle(): Promise<CryptoKey> {
  if (typeof window !== 'undefined') throw new Error('impersonation-marqueur : module serveur');
  if (!clePromise) {
    clePromise = (async () => {
      const secret = process.env.IMPERSONATION_SECRET?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!secret) throw new Error('Secret de signature des marqueurs indisponible');
      const brut = await crypto.subtle.digest('SHA-256', enc.encode(`major-ecn/impersonation/v1\u0000${secret}`));
      return crypto.subtle.importKey('raw', brut, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
    })();
    clePromise.catch(() => { clePromise = null; });
  }
  return clePromise;
}

function b64url(buf: ArrayBuffer): string {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deB64url(s: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) return null;
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
    const out = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/** Valeur signée du cookie `impersonator_id`. */
export async function signerMarqueur(adminId: string, cibleId: string, expMs = Date.now() + MARQUEUR_DUREE_MS): Promise<string> {
  const charge = `v1.${adminId}.${cibleId}.${Math.floor(expMs)}`;
  const sig = await crypto.subtle.sign('HMAC', await cle(), enc.encode(charge));
  return `${charge}.${b64url(sig)}`;
}

/**
 * Vérifie le marqueur pour l'utilisateur de la session (`userId`). La
 * signature est vérifiée en temps constant (`crypto.subtle.verify`).
 */
export async function lireMarqueur(valeur: string | undefined | null, userId: string | null | undefined): Promise<EtatMarqueur> {
  if (!valeur) return { etat: 'absent' };
  const p = valeur.split('.');
  if (p.length !== 5 || p[0] !== 'v1' || !UUID.test(p[1]) || !UUID.test(p[2]) || !/^\d{10,16}$/.test(p[3])) return { etat: 'invalide' };
  const sig = deB64url(p[4]);
  if (!sig) return { etat: 'invalide' };
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', await cle(), sig, enc.encode(p.slice(0, 4).join('.')));
  } catch {
    return { etat: 'invalide' };
  }
  if (!ok || !userId || p[2] !== userId) return { etat: 'invalide' };
  const expMs = Number(p[3]);
  if (!(expMs > Date.now())) return { etat: 'expire', adminId: p[1] };
  return { etat: 'valide', adminId: p[1], expMs };
}

/** Raccourci : l'utilisateur courant est-il une session « en tant que » authentique ? */
export async function enImpersonation(
  cookies: { get(name: string): { value: string } | undefined },
  userId: string | null | undefined,
): Promise<boolean> {
  return (await lireMarqueur(cookies.get(COOKIE_MARQUEUR)?.value, userId)).etat === 'valide';
}
