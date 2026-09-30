import 'server-only';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { VISITE_GUIDEE } from './visite-guidee';

/**
 * URL d'embed Bunny de la visite guidée, calculée côté serveur : elle est
 * signée si la bibliothèque exige un jeton (BUNNY_STREAM_TOKEN_KEY), sinon
 * simple (bibliothèque 691475 en repli). `null` tant que le GUID n'est pas
 * renseigné dans visite-guidee.ts : le hero et /visite-guidee affichent alors
 * « Vidéo bientôt disponible ». Le lecteur ajoute ensuite autoplay et son.
 */
export function urlEmbedVisiteGuidee(): string | null {
  return VISITE_GUIDEE.bunnyGuid ? bunnyEmbedUrl(VISITE_GUIDEE.bunnyGuid) : null;
}
