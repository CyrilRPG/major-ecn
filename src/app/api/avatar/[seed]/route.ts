import { avatarSvg } from '@/lib/avatars/dessin';
import { canoniserAvatar, estAvatarCompose } from '@/lib/avatars/traits';

export const runtime = 'nodejs';

/**
 * GET /api/avatar/<code>.svg — image d'un médaillon composé.
 *
 * Le rendu habituel est le composant React, directement dans la page. Cette
 * route sert les surfaces qui ne savent afficher qu'une URL d'image :
 * l'application mobile, les exports, tout client hors React.
 *
 * Les portraits y sont EMBARQUÉS en base 64 : un SVG chargé par une balise
 * `<img>` ne peut pas aller chercher d'image externe, il rendrait un cadre
 * vide. Le code décrit entièrement l'image, sans lecture en base ni donnée
 * personnelle, d'où la mise en cache immuable.
 *
 * Les PNG sont récupérés auprès du CDN plutôt que lus sur disque : `public/**`
 * est exclu du traçage Vercel pour TOUTES les fonctions (limite de 250 Mo,
 * correctif du 03/09/2026), et le réinclure par `outputFileTracingIncludes` ne
 * suffit pas — l'exclusion globale l'emporte, la route renvoyait 503 en
 * production (déploiement d0fde146). Le CDN sert déjà ces fichiers : c'est la
 * seule source fiable depuis une fonction. Le coût est payé une fois par
 * instance, les images étant gardées en mémoire.
 */
const cache = new Map<string, string>();

async function portraitEmbarque(id: string, base: string): Promise<string> {
  const connu = cache.get(id);
  if (connu) return connu;
  // `id` vient du catalogue, jamais de la requête : aucun chemin à assainir.
  const reponse = await fetch(new URL(`/arena/avatars/${id}.png`, base), {
    cache: 'force-cache',
  });
  if (!reponse.ok) throw new Error(`portrait ${id} : ${reponse.status}`);
  const uri = `data:image/png;base64,${Buffer.from(await reponse.arrayBuffer()).toString('base64')}`;
  cache.set(id, uri);
  return uri;
}

export async function GET(req: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  const demande = decodeURIComponent(seed).replace(/\.svg$/i, '');
  if (!estAvatarCompose(demande)) return new Response('Avatar inconnu', { status: 404 });
  const code = canoniserAvatar(demande);

  // Les deux images possibles (portrait et emblème) sont chargées d'avance :
  // le dessin est synchrone.
  const ids = new Set<string>();
  avatarSvg(code, { source: (id) => { ids.add(id); return ''; } });
  const images = new Map<string, string>();
  try {
    await Promise.all([...ids].map(async (id) => images.set(id, await portraitEmbarque(id, req.url))));
  } catch (error) {
    // Mieux vaut un message net qu'une erreur serveur opaque : la page, elle,
    // continue de rendre le médaillon sans passer par cette route.
    console.error('[avatar] portrait introuvable', error);
    return new Response('Portraits indisponibles', { status: 503 });
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>${avatarSvg(code, {
    source: (id) => images.get(id) ?? '',
  })}`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
    },
  });
}
