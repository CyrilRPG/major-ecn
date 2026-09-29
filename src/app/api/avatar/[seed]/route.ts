import { urlPortrait } from '@/lib/avatars/portraits';

export const runtime = 'nodejs';

/**
 * GET /api/avatar/<code>[.svg] — redirige vers l'image du portrait.
 *
 * Les médaillons composés de septembre 2026 étaient dessinés ici en SVG. Les
 * avatars sont désormais des images statiques (`/avatars/portraits/NNN.webp`) ;
 * la route reste pour les anciennes URL gardées en cache par l'application
 * mobile : n'importe quel code, ancien compris, mène à un portrait.
 */
export async function GET(req: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  const code = decodeURIComponent(seed).replace(/\.svg$/i, '');
  return new Response(null, {
    status: 308,
    headers: {
      Location: new URL(urlPortrait(code), req.url).href,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
