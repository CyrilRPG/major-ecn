import 'server-only';
import { createHash } from 'node:crypto';

/**
 * Intégration Bunny Stream.
 *
 * Variables d'environnement (à définir dans Vercel) :
 *  - BUNNY_STREAM_LIBRARY_ID   : ID numérique de la Video Library.
 *  - BUNNY_STREAM_API_KEY      : clé API de la librairie (secret serveur).
 *  - BUNNY_STREAM_TOKEN_KEY    : (optionnel) clé d'authentification par token
 *                                pour protéger la lecture (anti-hotlink).
 *
 * Aucune de ces valeurs ne doit être exposée au navigateur : l'upload se fait
 * en direct vers Bunny via TUS avec une signature pré-calculée côté serveur.
 */

export type BunnyConfig = { libraryId: string; apiKey: string; tokenKey: string | null };

export function getBunnyConfig(): BunnyConfig | null {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID?.trim();
  const apiKey = process.env.BUNNY_STREAM_API_KEY?.trim();
  if (!libraryId || !apiKey) return null;
  return { libraryId, apiKey, tokenKey: process.env.BUNNY_STREAM_TOKEN_KEY?.trim() || null };
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

/** Crée une vidéo (conteneur vide) dans la librairie et renvoie son GUID. */
export async function createBunnyVideo(title: string): Promise<string> {
  const cfg = getBunnyConfig();
  if (!cfg) throw new Error('Bunny Stream non configuré (BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY).');
  const res = await fetch(`https://video.bunnycdn.com/library/${cfg.libraryId}/videos`, {
    method: 'POST',
    headers: { AccessKey: cfg.apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ title: title.slice(0, 200) }),
  });
  if (!res.ok) {
    throw new Error(`Bunny createVideo a échoué (${res.status}) : ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { guid?: string };
  if (!data.guid) throw new Error('Bunny createVideo : réponse sans guid.');
  return data.guid;
}

/** Supprime une vidéo de la librairie (nettoyage en cas de remplacement). */
export async function deleteBunnyVideo(videoId: string): Promise<void> {
  const cfg = getBunnyConfig();
  if (!cfg) return;
  await fetch(`https://video.bunnycdn.com/library/${cfg.libraryId}/videos/${videoId}`, {
    method: 'DELETE',
    headers: { AccessKey: cfg.apiKey, accept: 'application/json' },
  }).catch(() => null);
}

/**
 * Données d'autorisation pour un upload TUS direct navigateur → Bunny.
 * Signature = SHA256(libraryId + apiKey + expiration + videoId).
 * L'apiKey ne quitte jamais le serveur ; le navigateur ne reçoit que la signature.
 */
export function tusUploadAuth(videoId: string) {
  const cfg = getBunnyConfig();
  if (!cfg) throw new Error('Bunny Stream non configuré.');
  // Expiration 2 h dans le futur (en SECONDES unix, comme attendu par Bunny).
  const expire = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
  const signature = sha256(`${cfg.libraryId}${cfg.apiKey}${expire}${videoId}`);
  return {
    endpoint: 'https://video.bunnycdn.com/tusupload',
    libraryId: cfg.libraryId,
    videoId,
    expire,
    signature,
  };
}

export type BunnyVideoInfo = {
  guid: string;
  /** 0..6 — 3 = terminé, 4 = résolutions en cours, 5 = échec (cf. docs Bunny). */
  status: number;
  lengthSeconds: number;
  hasMP4Fallback: boolean;
  availableResolutions: string[];
};

/** Métadonnées d'une vidéo (dont la disponibilité du MP4 Fallback). */
export async function getBunnyVideoInfo(videoId: string): Promise<BunnyVideoInfo | null> {
  const cfg = getBunnyConfig();
  if (!cfg) return null;
  const res = await fetch(`https://video.bunnycdn.com/library/${cfg.libraryId}/videos/${videoId}`, {
    headers: { AccessKey: cfg.apiKey, accept: 'application/json' },
  });
  if (!res.ok) return null;
  const d = (await res.json()) as {
    guid?: string; status?: number; length?: number;
    hasMP4Fallback?: boolean; availableResolutions?: string | null;
  };
  return {
    guid: d.guid ?? videoId,
    status: d.status ?? 0,
    lengthSeconds: d.length ?? 0,
    hasMP4Fallback: !!d.hasMP4Fallback,
    availableResolutions: (d.availableResolutions ?? '').split(',').map((r) => r.trim()).filter(Boolean),
  };
}

/** Relance l'encodage d'une vidéo (nécessaire pour générer les MP4 des vidéos
 *  uploadées AVANT l'activation du MP4 Fallback sur la librairie). */
export async function reencodeBunnyVideo(videoId: string): Promise<boolean> {
  const cfg = getBunnyConfig();
  if (!cfg) return false;
  const res = await fetch(`https://video.bunnycdn.com/library/${cfg.libraryId}/videos/${videoId}/reencode`, {
    method: 'POST',
    headers: { AccessKey: cfg.apiKey, accept: 'application/json' },
  });
  return res.ok;
}

/** Hostname CDN de la librairie (ex. vz-xxxxx-xxx.b-cdn.net) — env dédiée. */
export function bunnyCdnHost(): string | null {
  return process.env.BUNNY_STREAM_CDN_HOST?.trim() || null;
}

/**
 * URL MP4 directe signée pour le téléchargement hors ligne (app mobile).
 * Nécessite le MP4 Fallback actif sur la librairie + BUNNY_STREAM_CDN_HOST.
 * Token = SHA256(tokenKey + videoId + expires) — même schéma que l'embed
 * (auth token « Embed view » de Bunny Stream, qui couvre aussi les fichiers
 * directs de la zone vidéo). Sans tokenKey, URL non signée.
 */
export function bunnySignedMp4Url(
  videoId: string,
  resolution: string,
  expiresInSec = 6 * 60 * 60,
): string | null {
  const host = bunnyCdnHost();
  if (!host) return null;
  const base = `https://${host}/${videoId}/play_${resolution}.mp4`;
  const cfg = getBunnyConfig();
  if (!cfg?.tokenKey) return base;
  const expires = Math.floor(Date.now() / 1000) + expiresInSec;
  const token = sha256(`${cfg.tokenKey}${videoId}${expires}`);
  return `${base}?token=${token}&expires=${expires}`;
}

/**
 * URL d'embed (iframe) pour la lecture. Si la librairie a l'authentification
 * par token activée (BUNNY_STREAM_TOKEN_KEY), on signe l'URL (validité limitée).
 * Token = SHA256(tokenKey + videoId + expires).
 */
export function bunnyEmbedUrl(videoId: string, opts?: { libraryId?: string }): string {
  const cfg = getBunnyConfig();
  const libraryId = opts?.libraryId ?? cfg?.libraryId;
  if (!libraryId) throw new Error('Bunny Stream non configuré.');
  const base = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
  const params = new URLSearchParams({ autoplay: 'false', preload: 'true', responsive: 'true' });
  if (cfg?.tokenKey) {
    const expires = Math.floor(Date.now() / 1000) + 6 * 60 * 60; // 6 h
    const token = sha256(`${cfg.tokenKey}${videoId}${expires}`);
    params.set('token', token);
    params.set('expires', String(expires));
  }
  return `${base}?${params.toString()}`;
}
