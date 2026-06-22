import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function updateSession(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === '/login' || path === '/signup';
  const isProtectedRoute = path.startsWith('/app') || path.startsWith('/accueil') || path.startsWith('/entrainement') || path.startsWith('/agenda') || path.startsWith('/admin') || path.startsWith('/cours') || path.startsWith('/facultes') || path.startsWith('/matieres');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Session unique : un seul appareil connecté par compte. Si l'identifiant
  // d'appareil (cookie httpOnly) ne correspond pas au dernier enregistré en
  // base, on déconnecte cet appareil. Exclu en impersonation admin. Fail-open.
  if (user && isProtectedRoute && !request.cookies.get('impersonator_id')) {
    try {
      const device = request.cookies.get('mecn_device')?.value ?? null;
      // active_session_id pas encore dans les types générés → accès souple.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: prof } = await (supabase as any)
        .from('profiles')
        .select('active_session_id')
        .eq('id', user.id)
        .maybeSingle();
      const active = (prof as { active_session_id?: string | null } | null)?.active_session_id ?? null;
      if (active && device !== active) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.search = '';
        url.searchParams.set('reason', 'autre-appareil');
        const res = NextResponse.redirect(url);
        // Expire la session Supabase (cookies sb-*) + le cookie d'appareil.
        for (const c of request.cookies.getAll()) {
          if (c.name.startsWith('sb-') || c.name === 'mecn_device') {
            res.cookies.set(c.name, '', { path: '/', maxAge: 0 });
          }
        }
        return res;
      }
    } catch { /* fail-open : ne jamais verrouiller en cas d'erreur */ }
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return response;
}
