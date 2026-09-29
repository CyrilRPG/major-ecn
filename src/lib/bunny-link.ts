/**
 * Extraction de l'identifiant d'une vidéo Bunny Stream à partir de ce que
 * l'administrateur colle depuis bunny.net. Module PUR (pas de `server-only`) :
 * il est utilisé côté navigateur pour la validation immédiate du champ ET côté
 * serveur, qui refait la vérification avant d'écrire en base.
 *
 * Formats acceptés :
 *  - https://iframe.mediadelivery.net/embed/{library}/{videoId}
 *  - https://iframe.mediadelivery.net/play/{library}/{videoId}
 *  - https://video.bunnycdn.com/play/{library}/{videoId}
 *  - le panneau Bunny (…/stream/{library}/library?videoId={videoId})
 *  - l'UUID seul
 * Les paramètres de requête et le fragment sont ignorés.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IN_URL_RE = /(?:embed|play|videos?)\/(?:\d+\/)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
const QUERY_RE = /[?&]videoId=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export function extractBunnyVideoId(input: string): string | null {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return null;
  if (UUID_RE.test(trimmed)) return trimmed.toLowerCase();
  const fromQuery = trimmed.match(QUERY_RE);
  if (fromQuery) return fromQuery[1].toLowerCase();
  const fromPath = trimmed.match(IN_URL_RE);
  if (fromPath) return fromPath[1].toLowerCase();
  // Dernier recours : un UUID présent quelque part dans la chaîne collée.
  const loose = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return loose ? loose[0].toLowerCase() : null;
}

/**
 * Hôte CDN de la bibliothèque Bunny Stream de la plateforme (691475). Il n'a
 * rien de secret : il figure dans la page publique d'embed de chaque vidéo
 * (`thumbnailUrl` du JSON-LD) — d'où la valeur en dur, utilisable côté
 * navigateur comme le repli de bibliothèque de `lib/bunny`.
 */
export const BUNNY_CDN_HOST_PUBLIC = 'vz-0164558f-c12.b-cdn.net';

/**
 * Miniature d'une vidéo (image choisie ou générée par bunny.net). La zone CDN
 * refuse les requêtes SANS en-tête Referer (anti-hotlink) : l'`<img>` doit
 * garder `referrerPolicy="origin"` (ou la politique par défaut du navigateur).
 */
export function bunnyMiniatureUrl(videoId: string): string | null {
  const id = extractBunnyVideoId(videoId);
  return id ? `https://${BUNNY_CDN_HOST_PUBLIC}/${id}/thumbnail.jpg` : null;
}
