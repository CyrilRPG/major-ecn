import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

/**
 * « Se connecter en tant que » dans un NOUVEL ONGLET, sans quitter la session
 * administrateur de l'onglet d'origine.
 *
 * Deux sessions Supabase ne peuvent pas cohabiter sur une même origine : les
 * cookies `sb-*` sont partagés par tous les onglets. La session élève est donc
 * ouverte sur une AUTRE origine du même déploiement (cookies posés sans
 * attribut Domain → propres à chaque hôte) :
 *   www.major-ecn.fr  ⇄  major-ecn.vercel.app   (production)
 *   localhost:PORT    ⇄  127.0.0.1:PORT         (développement)
 * `IMPERSONATION_ORIGIN` permet d'imposer une origine dédiée (ex. un
 * sous-domaine `apercu.major-ecn.fr` rattaché au projet Vercel).
 *
 * Le passage d'une origine à l'autre se fait par un TICKET : 32 octets
 * aléatoires, stocké haché (SHA-256), à usage unique, valable 60 secondes,
 * lié à l'administrateur émetteur et à l'élève visé (table
 * `impersonation_tickets`, qui sert aussi de journal).
 */

export const TICKET_TTL_MS = 60_000;

/** Cookie d'interface (non sensible) : l'onglet est une session « en tant que »
 *  détachée ; sa valeur est l'échéance (epoch ms) au-delà de laquelle le
 *  bandeau ferme la session de lui-même. */
export const COOKIE_ONGLET = 'impersonation_onglet';

/** Durée maximale d'une session « en tant que » détachée. */
export const SESSION_ONGLET_MAX_MS = 12 * 3_600_000;

/**
 * Durée de vie des cookies marqueurs : celle des cookies de session Supabase
 * (400 jours, renouvelés à chaque rafraîchissement). Des marqueurs plus courts
 * laisseraient, après redémarrage du navigateur, une session élève SANS
 * bandeau sur cette origine.
 */
export const MARQUEURS_MAX_AGE_S = 400 * 86_400;

const PROD_HOSTS = new Set(['www.major-ecn.fr', 'major-ecn.fr']);
const VERCEL_HOST = 'major-ecn.vercel.app';

/**
 * Origine sur laquelle ouvrir l'onglet élève, à partir de l'hôte de l'admin.
 * Liste FERMÉE : jamais d'origine dérivée librement d'un en-tête Host.
 */
export function origineOnglet(hoteAdmin: string): string | null {
  const imposee = process.env.IMPERSONATION_ORIGIN?.trim();
  if (imposee) {
    try {
      const u = new URL(imposee);
      if (u.protocol === 'https:' || u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        // Même hôte que l'admin : les cookies seraient partagés, ça ne marcherait pas.
        if (u.host !== hoteAdmin) return u.origin;
      }
    } catch {
      /* valeur invalide : on retombe sur la table ci-dessous */
    }
  }
  if (PROD_HOSTS.has(hoteAdmin)) return `https://${VERCEL_HOST}`;
  if (hoteAdmin === VERCEL_HOST) return 'https://www.major-ecn.fr';
  const m = /^(localhost|127\.0\.0\.1):(\d{2,5})$/.exec(hoteAdmin);
  if (m) return `http://${m[1] === 'localhost' ? '127.0.0.1' : 'localhost'}:${m[2]}`;
  return null;
}

/** Jeton en clair (renvoyé une seule fois au navigateur de l'admin) et son empreinte. */
export function nouveauTicket(): { jeton: string; empreinte: string } {
  const jeton = randomBytes(32).toString('base64url');
  return { jeton, empreinte: empreinteTicket(jeton) };
}

export function empreinteTicket(jeton: string): string {
  return createHash('sha256').update(jeton, 'utf8').digest('hex');
}

/** 32 octets en base64url : exactement 43 caractères [A-Za-z0-9_-]. */
export function jetonBienForme(jeton: string | null): jeton is string {
  return typeof jeton === 'string' && /^[A-Za-z0-9_-]{43}$/.test(jeton);
}
