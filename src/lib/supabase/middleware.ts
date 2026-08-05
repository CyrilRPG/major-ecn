import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { extractAccessTokenFromCookies } from '@/lib/auth/access-token-cookie';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import type { Database } from '@/types/database';

/**
 * Budget dur du middleware. Au-delà, Vercel tue la fonction à 25s
 * (MIDDLEWARE_INVOCATION_TIMEOUT) et TOUT le site devient inaccessible —
 * y compris /login. Pendant un incident Auth/DB (522, saturation Postgres),
 * chaque appel réseau concurrent amplifie la panne. On coupe donc court
 * et on fail-open.
 */
const MIDDLEWARE_BUDGET_MS = 2_000;

function withBudget<T>(promise: Promise<T>, fallback: T, ms = MIDDLEWARE_BUDGET_MS): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(fallback);
    }, ms);
    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === '/login' || path === '/signup';
  const isProtectedRoute =
    path.startsWith('/app') ||
    path.startsWith('/accueil') ||
    path.startsWith('/entrainement') ||
    path.startsWith('/agenda') ||
    path.startsWith('/admin') ||
    path.startsWith('/cours') ||
    path.startsWith('/facultes') ||
    path.startsWith('/matieres');

  // Pages PUBLIQUES (vitrine, blog, guide, APIs…) : aucun appel Supabase.
  // Auparavant `auth.getUser()` / refresh était exécuté à CHAQUE requête et
  // saturait Auth+Postgres → 504 MIDDLEWARE_INVOCATION_TIMEOUT sur tout le site.
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next({ request });
  }

  // Lecture locale du JWT — JAMAIS de refresh réseau dans le middleware.
  const accessToken = extractAccessTokenFromCookies(request.cookies.getAll());

  // Pas de jeton : chemin rapide, zéro I/O.
  if (!accessToken) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet) {
          // On accepte les écritures de cookies (claims locaux) mais on ne
          // déclenche volontairement AUCUN refresh ici.
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
      auth: {
        // Ceinture + bretelles : même si un code path touchait la session,
        // le client du middleware ne doit jamais appeler /token en rafale.
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  // Vérification LOCALE du JWT (signature JWKS). En passant le jeton
  // explicitement, `getClaims(jwt)` ne passe PAS par `getSession()` et donc
  // ne tente pas de renouveler un refresh_token — c'était LA source des
  // 504 middleware + « Failed to fetch » sur /login quand Auth renvoyait 522.
  //
  // Budget 2s : si le JWKS est injoignable, on fail-open plutôt que de tuer
  // la requête à 25s et d'aggraver la saturation.
  const user = await withBudget(getVerifiedUser(supabase, accessToken), null);

  if (!user && isProtectedRoute) {
    // Jeton illisible / expiré / timeout : on envoie vers /login SANS purger
    // les cookies (une purge concurrente a déjà cassé des sessions saines).
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Session unique : compare le cookie device au cache signé (mecn_device_ok)
  // pour éviter un SELECT profiles à chaque requête. La vérif DB ne se fait
  // que quand le cache expire — et elle est elle-même budgétée pour ne jamais
  // faire tomber le middleware si Postgres est saturé.
  if (user && isProtectedRoute && !request.cookies.get('impersonator_id')) {
    const device = request.cookies.get('mecn_device')?.value ?? null;
    const cachedOk = request.cookies.get('mecn_device_ok')?.value;

    if (!(cachedOk && cachedOk === device) && device) {
      type ProfRow = { active_session_id?: string | null } | null;
      const prof = await withBudget(
        (async () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase as any)
              .from('profiles')
              .select('active_session_id')
              .eq('id', user.id)
              .maybeSingle();
            return (data as ProfRow) ?? null;
          } catch {
            return null;
          }
        })(),
        null,
        1_000,
      );

      if (prof) {
        const active = prof.active_session_id ?? null;
        if (active && device !== active) {
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          url.search = '';
          url.searchParams.set('reason', 'autre-appareil');
          const res = NextResponse.redirect(url);
          for (const c of request.cookies.getAll()) {
            if (c.name.startsWith('sb-') || c.name === 'mecn_device' || c.name === 'mecn_device_ok') {
              res.cookies.set(c.name, '', { path: '/', maxAge: 0 });
            }
          }
          return res;
        }
      }
      // Cache hit (ou fail-open DB) : 30 min — on évite de marteler profiles
      // sous charge. Le register-device au login reste la source de vérité.
      response.cookies.set('mecn_device_ok', device, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1_800,
      });
    }
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return response;
}
