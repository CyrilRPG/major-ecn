import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import { DB_TIMEOUT_MS, getUserSafely, supabaseCookieNames, withTimeout } from '@/lib/auth/safe-auth';

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === '/login' || path === '/signup';
  const isProtectedRoute = path.startsWith('/app') || path.startsWith('/accueil') || path.startsWith('/entrainement') || path.startsWith('/agenda') || path.startsWith('/admin') || path.startsWith('/cours') || path.startsWith('/facultes') || path.startsWith('/matieres');

  // Pages PUBLIQUES (vitrine, blog, guide, etc.) : aucun appel Supabase.
  // Auparavant `auth.getUser()` (round-trip vers l'API Auth + Postgres) était
  // exécuté à CHAQUE requête, y compris sur l'accueil et le blog. Sous la charge
  // d'un crawler ou d'un pic de trafic, cela saturait la base et provoquait des
  // 504 MIDDLEWARE_INVOCATION_TIMEOUT sur tout le site. Les pages publiques
  // n'ont pas besoin de session : on renvoie immédiatement sans toucher la base.
  if (!isProtectedRoute && !isAuthRoute) {
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
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Appel BORNÉ : sans cela, un rafraîchissement de token saturé (409) faisait
  // pendre le middleware jusqu'à son plafond de 25 s, et la plateforme coupait
  // la connexion — « Load failed » côté navigateur.
  const auth = await getUserSafely(supabase);
  const { user } = auth;

  // Session morte (refresh token absent ou déjà consommé) : on PURGE les
  // cookies Supabase avant de renvoyer vers /login. Sans cette purge, le
  // navigateur represente le même token périmé à chaque requête et relance
  // indéfiniment la tempête de rafraîchissements.
  if (auth.sessionInvalid) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    if (isProtectedRoute) url.searchParams.set('next', path);
    url.searchParams.set('reason', 'session-expiree');
    const res = NextResponse.redirect(url);
    for (const name of supabaseCookieNames(request.cookies.getAll().map((c) => c.name))) {
      res.cookies.set(name, '', { path: '/', maxAge: 0 });
    }
    return res;
  }

  // Échec TRANSITOIRE (délai dépassé, 409, réseau) : on ne déconnecte pas et on
  // ne bloque pas. On laisse passer — la page refera sa propre vérification,
  // elle aussi bornée. L'essentiel est de rendre la main tout de suite.
  if (auth.timedOut) return response;

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Session unique : un seul appareil connecté par compte. On compare le
  // cookie device au cache signé (mecn_device_ok) pour éviter un SELECT
  // profiles à chaque requête. La vérification DB ne se fait qu'au login
  // et quand le cache expire (5 min).
  if (user && isProtectedRoute && !request.cookies.get('impersonator_id')) {
    try {
      const device = request.cookies.get('mecn_device')?.value ?? null;
      const cachedOk = request.cookies.get('mecn_device_ok')?.value;

      if (cachedOk && cachedOk === device) {
        // Cache hit — skip DB query
      } else {
        // Bornée elle aussi : un `catch` n'attrape pas un blocage, seule une
        // course contre un délai garantit que le middleware rend la main.
        const probe = await withTimeout(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any)
            .from('profiles')
            .select('active_session_id')
            .eq('id', user.id)
            .maybeSingle(),
          DB_TIMEOUT_MS,
        );
        // Délai dépassé → on n'invalide pas la session sur une simple lenteur.
        if (probe.timedOut) return response;
        const { data: prof } = probe.value as { data: { active_session_id?: string | null } | null };
        const active = (prof as { active_session_id?: string | null } | null)?.active_session_id ?? null;
        if (active && device !== active) {
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          url.search = '';
          url.searchParams.set('reason', 'autre-appareil');
          const res = NextResponse.redirect(url);
          for (const c of request.cookies.getAll()) {
            if (c.name.startsWith('sb-') || c.name === 'mecn_device') {
              res.cookies.set(c.name, '', { path: '/', maxAge: 0 });
            }
          }
          return res;
        }
        if (device) {
          response.cookies.set('mecn_device_ok', device, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 300,
          });
        }
      }
    } catch { /* fail-open */ }
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return response;
}
