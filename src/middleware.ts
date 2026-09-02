import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * CORS pour l'application mobile (Capacitor). L'app tourne sous une origine
 * native (capacitor://localhost, https://localhost) et appelle ces routes en
 * Bearer + X-Device-Id — le préflight OPTIONS doit répondre et les réponses
 * porter Access-Control-Allow-Origin.
 *
 * `*` SANS Access-Control-Allow-Credentials : les cookies ne sont jamais
 * exposés cross-origin (le navigateur ne les joint pas hors mode credentials),
 * la posture CSRF des routes web à cookies est donc inchangée.
 */
const CORS_PREFIXES = [
  '/api/mobile/',
  '/api/fiches/',
  '/api/supports/',
  '/api/cours/',
  '/api/student/heartbeat',
  '/api/chat',
];

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Device-Id',
  'Access-Control-Max-Age': '86400',
};

function isCorsPath(pathname: string): boolean {
  return CORS_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Le layout étudiant lit `x-pathname` (blocage section 15, restriction prof,
  // formulaires obligatoires, interrogation obligatoire). Sans ce header, il
  // recevait '' et TOUS ces gardes étaient inopérants. Muter request.headers
  // ici le propage à chaque NextResponse.next({ request }) en aval.
  request.headers.set('x-pathname', pathname);

  // Les routes API gèrent leur propre auth. Les faire passer par updateSession
  // (même en no-op) était inutile et, pour le préflight CORS + heartbeat,
  // ajoutait de la contention Edge sous charge. On pose juste les headers CORS.
  if (isCorsPath(pathname)) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }
    const res = NextResponse.next({ request });
    for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
    return res;
  }

  // Autres /api/* : pas de session middleware (auth dans la route).
  if (pathname.startsWith('/api/')) {
    return NextResponse.next({ request });
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|mp4)$).*)'],
};
