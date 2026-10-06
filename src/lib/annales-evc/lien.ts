import 'server-only';
import { signerJeton, verifierJeton } from '@/lib/certificats/lien-signe';

/**
 * Lien de téléchargement d'un recueil d'annales EVC (/annales-evc).
 *
 * Les PDF sont dans le bucket PRIVÉ `annales-evc`. Le lien envoyé par e-mail ne
 * porte pas d'URL Supabase (une URL signée expire) : il pointe vers
 * /api/annales-evc/telecharger?t=…, qui vérifie ce jeton puis redirige vers une
 * URL signée de quelques minutes. Le jeton lie UNE demande (lead) à UN recueil,
 * et reste valable deux ans : le candidat peut retélécharger depuis son e-mail.
 */
const USAGE = 'annales-evc-telechargement';
const DUREE_MS = 2 * 365 * 24 * 3600_000;

export type ChargeLienAnnales = { lead: string; slug: string };

export function jetonTelechargementAnnales(lead: string, slug: string): string {
  return signerJeton(USAGE, { lead, slug } satisfies ChargeLienAnnales, DUREE_MS);
}

export function lireJetonTelechargementAnnales(jeton: string): ChargeLienAnnales | null {
  const d = verifierJeton<ChargeLienAnnales>(USAGE, jeton);
  if (!d || typeof d.lead !== 'string' || typeof d.slug !== 'string') return null;
  return d;
}

/** Nom du fichier tel que le candidat le reçoit. */
export function nomFichierAnnales(slug: string): string {
  return `Annales-EVC-${slug}-Major-ECN.pdf`;
}

/** Chemin du recueil dans le bucket `annales-evc`. */
export function cheminRecueilAnnales(slug: string): string {
  return `${slug}.pdf`;
}

export const BUCKET_ANNALES = 'annales-evc';
