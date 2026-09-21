import { readFile } from 'node:fs/promises';
import path from 'node:path';
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
 */
const cache = new Map<string, string>();

async function portraitEmbarque(id: string): Promise<string> {
  const connu = cache.get(id);
  if (connu) return connu;
  // `id` vient du catalogue, jamais de la requête : aucun chemin à assainir.
  const fichier = path.join(process.cwd(), 'public', 'arena', 'avatars', `${id}.png`);
  const data = await readFile(fichier);
  const uri = `data:image/png;base64,${data.toString('base64')}`;
  cache.set(id, uri);
  return uri;
}

export async function GET(_req: Request, { params }: { params: Promise<{ seed: string }> }) {
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
    await Promise.all([...ids].map(async (id) => images.set(id, await portraitEmbarque(id))));
  } catch (error) {
    // Les portraits vivent dans `public/`, exclu du traçage Vercel : la route
    // les réinclut par `outputFileTracingIncludes`. Si cette configuration
    // saute, mieux vaut un message net qu'une erreur serveur opaque.
    console.error('[avatar] portrait introuvable sur disque', error);
    return new Response('Portraits indisponibles sur ce déploiement', { status: 503 });
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
