import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { extractSessionFromCookies } from '@/lib/auth/access-token-cookie';
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
/** Refresh session : un peu plus large, mais toujours loin du plafond 25s. */
const REFRESH_BUDGET_MS = 3_000;

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
  // TOUTES les routes du groupe (student) + /admin. Une route protégée absente
  // de cette liste est traitée comme publique : le middleware n'y rafraîchit
  // JAMAIS les cookies, le JWT y expire au bout d'une heure, et la page tente
  // alors le refresh depuis un Server Component — qui ne peut pas écrire de
  // cookies. Le refresh token tourné n'est jamais persisté et la rotation
  // révoque la famille : élève déconnecté en pleine session (« Invalid Refresh
  // Token », massif sur /revisions-transversales et /profil, oubliées ici).
  const isProtectedRoute =
    path.startsWith('/app') ||
    path.startsWith('/accueil') ||
    path.startsWith('/entrainement') ||
    path.startsWith('/agenda') ||
    path.startsWith('/admin') ||
    path.startsWith('/cours') ||
    path.startsWith('/facultes') ||
    path.startsWith('/matieres') ||
    path.startsWith('/revisions-transversales') ||
    // `/profil` EXACTEMENT (+ ses sous-routes) : `startsWith('/profil')`
    // capturait aussi `/profil-evc`, page vitrine publique mise en avant dans
    // le menu, le lanceur et le popup. Les visiteurs non connectés — Googlebot
    // compris — étaient redirigés vers /login : diagnostic gratuit inaccessible
    // et page classée « Page avec redirection » dans la Search Console.
    path === '/profil' ||
    path.startsWith('/profil/') ||
    path.startsWith('/epreuves-blanches') ||
    path.startsWith('/formulaires') ||
    path.startsWith('/forum') ||
    path.startsWith('/notes') ||
    path.startsWith('/parcours') ||
    path.startsWith('/presences') ||
    path.startsWith('/revoir');

  // Pages PUBLIQUES (vitrine, blog, guide, APIs…) : aucun appel Supabase.
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next({ request });
  }

  const cookieSession = extractSessionFromCookies(request.cookies.getAll());

  // Pas de jeton du tout : chemin rapide, zéro I/O.
  if (!cookieSession) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  let accessToken = cookieSession.accessToken;

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
      auth: {
        // Pas d'auto-refresh implicite : on le déclenche nous-mêmes, budgété,
        // uniquement quand le JWT est expiré (voir plus bas).
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  // JWT expiré mais refresh_token présent : UNE tentative de renouvellement
  // budgétée. Sans ça, getClaims(jwt) échoue → redirect /login alors que la
  // session est encore valide — symptôme élève : « This page couldn't load »
  // sur toutes les fiches (WebView / navigation cassée après redirect).
  if (cookieSession.accessExpired && cookieSession.refreshToken) {
    const refreshed = await withBudget(
      (async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: cookieSession.refreshToken!,
          });
          if (error || !data.session?.access_token) return null;
          return data.session.access_token;
        } catch {
          return null;
        }
      })(),
      null,
      REFRESH_BUDGET_MS,
    );
    if (refreshed) {
      accessToken = refreshed;
    } else if (isProtectedRoute) {
      // Refresh raté / timeout : FAIL-OPEN — on laisse passer la requête.
      // Le Server Component (createClient + getSession) retentera le refresh.
      // Un redirect /login ici cassait l'accès aux fiches pour des sessions
      // encore valides (cas Sabrina KACHETEL / MG Approfondi).
      return response;
    }
  }

  // Vérification LOCALE du JWT (signature JWKS), budgétée.
  const user = await withBudget(getVerifiedUser(supabase, accessToken), null);

  if (!user && isProtectedRoute) {
    // Jeton vraiment inutilisable (pas juste expiré avec refresh en cours).
    // S'il reste un refresh_token, fail-open plutôt que d'éjecter l'élève.
    if (cookieSession.refreshToken) {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Session unique : compare le cookie device au cache (mecn_device_ok).
  // IMPORTANT : sans cookie `mecn_device` on FAIL-OPEN (on ne kick PAS).
  // Auparavant `device === null` vs `active_session_id` était traité comme
  // « autre appareil » → redirect /login en boucle dès que le cookie n'était
  // pas posé (fetch register-device raté, navigateur strict, WebView…).
  // L'admin en impersonation passe aussi (cookie impersonator_id) — d'où le
  // symptôme « ça marche en impersonation, pas chez l'élève ».
  if (user && isProtectedRoute && !request.cookies.get('impersonator_id')) {
    const device = request.cookies.get('mecn_device')?.value ?? null;
    const cachedOk = request.cookies.get('mecn_device_ok')?.value;

    if (device && !(cachedOk && cachedOk === device)) {
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
        // Kick seulement si les DEUX côtés sont connus et divergent.
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
