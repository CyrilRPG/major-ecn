/**
 * Génère la paire de clés Ed25519 de la licence hors ligne mobile.
 *
 * Usage :  pnpm tsx scripts/generate-license-keys.ts
 *
 * Sortie :
 *  - LICENSE_PRIVATE_KEY (base64 PKCS8)  → variable d'env Vercel + .env.local.
 *    NE JAMAIS la committer ni l'embarquer dans l'app.
 *  - Clé publique (raw 32 octets, base64) → à embarquer dans l'app mobile
 *    (vérification via @noble/ed25519).
 *  - LICENSE_KEY_ID suggéré (kid) pour la rotation.
 */
import { generateKeyPairSync } from 'node:crypto';

const { publicKey, privateKey } = generateKeyPairSync('ed25519');

const privDer = privateKey.export({ format: 'der', type: 'pkcs8' }) as Buffer;
const pubDer = publicKey.export({ format: 'der', type: 'spki' }) as Buffer;
// SPKI Ed25519 = préfixe ASN.1 de 12 octets + clé brute de 32 octets.
const pubRaw = pubDer.subarray(pubDer.length - 32);

const kid = new Date().toISOString().slice(0, 7); // ex. '2026-07'

console.log('── Variables d\'environnement (Vercel + .env.local) ──');
console.log(`LICENSE_PRIVATE_KEY=${privDer.toString('base64')}`);
console.log(`LICENSE_KEY_ID=${kid}`);
console.log('');
console.log('── À embarquer dans l\'app mobile (clé publique, raw 32 octets) ──');
console.log(`LICENSE_PUBLIC_KEY_B64=${pubRaw.toString('base64')}`);
console.log(`LICENSE_PUBLIC_KEY_HEX=${pubRaw.toString('hex')}`);
console.log(`KID=${kid}`);
