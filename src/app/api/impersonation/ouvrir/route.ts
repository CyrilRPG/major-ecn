import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { accesEquipeExpire } from '@/lib/auth/collaborateurs';
import { COOKIE_ONGLET, MARQUEURS_MAX_AGE_S, SESSION_ONGLET_MAX_MS, empreinteTicket, jetonBienForme } from '@/lib/auth/impersonation-onglet';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

function refus(message: string, status = 410) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Lien expiré</title></head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px;color:#1f2937">
<h1 style="font-size:1.25rem">Session « en tant que » indisponible</h1><p>${message}</p>
<p style="color:#6b7280;font-size:.875rem">Fermez cet onglet et relancez « Se connecter en tant que » depuis la fiche du candidat.</p></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}

/**
 * GET /api/impersonation/ouvrir?t=… — ouvert dans le NOUVEL onglet, sur
 * l'origine dédiée (cf. lib/auth/impersonation-onglet.ts).
 *
 * Consomme le ticket de façon ATOMIQUE (une seule requête UPDATE … WHERE
 * used_at IS NULL AND expires_at > now()), revérifie que l'émetteur est
 * toujours un administrateur actif et que la cible est un élève, puis ouvre la
 * session de l'élève dans les cookies de CETTE origine uniquement.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jeton = url.searchParams.get('t');
  if (!jetonBienForme(jeton)) return refus('Lien invalide.', 400);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const maintenant = new Date().toISOString();
  const { data: ticket } = await db.from('impersonation_tickets')
    .update({
      used_at: maintenant,
      used_ip: (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim().slice(0, 64) || null,
      used_user_agent: (req.headers.get('user-agent') ?? '').slice(0, 300) || null,
    })
    .eq('token_hash', empreinteTicket(jeton))
    .is('used_at', null)
    .gt('expires_at', maintenant)
    .select('admin_id, target_id')
    .maybeSingle();
  if (!ticket) return refus('Ce lien a déjà été utilisé ou a expiré (validité : 60 secondes).');

  const [{ data: adm }, { data: cible }] = await Promise.all([
    db.from('profiles').select('role, is_active, access_end').eq('id', ticket.admin_id).maybeSingle(),
    db.from('profiles').select('role, email, first_name, last_name').eq('id', ticket.target_id).maybeSingle(),
  ]);
  if (!adm || adm.role !== 'admin' || adm.is_active === false || accesEquipeExpire(adm)) {
    return refus('Droits administrateur introuvables.', 403);
  }
  if (!cible || cible.role !== 'student') return refus('Compte élève introuvable.', 404);

  // E-mail lu dans le compte d'AUTHENTIFICATION (et non `profiles.email`, qui
  // peut être périmé) : un lien magique émis pour une autre adresse ouvrirait —
  // voire créerait — un autre compte.
  const { data: authCible } = await db.auth.admin.getUserById(ticket.target_id);
  const emailAuth = authCible?.user?.email as string | undefined;
  if (!emailAuth) return refus('Compte élève introuvable.', 404);

  const { data: lien, error: lienErr } = await db.auth.admin.generateLink({ type: 'magiclink', email: emailAuth });
  const hashed = lien?.properties?.hashed_token as string | undefined;
  if (lienErr || !hashed) return refus('Impossible d’ouvrir la session de l’élève.', 500);

  // Redirection RELATIVE : on reste sur l'origine qui vient de recevoir les
  // cookies. `req.url` peut être normalisé par Next (ex. 127.0.0.1 → localhost
  // en développement) et renverrait vers l'origine de l'admin.
  const response = new NextResponse(null, { status: 303, headers: { Location: '/accueil' } });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
      auth: { autoRefreshToken: false, persistSession: true, detectSessionInUrl: false },
    },
  );
  const { data: otp, error: otpErr } = await supabase.auth.verifyOtp({ type: 'magiclink', token_hash: hashed });
  if (otpErr) return refus('Impossible d’ouvrir la session de l’élève.', 500);
  // Ceinture et bretelles : la session ouverte DOIT être celle de l'élève visé.
  if (otp.user?.id !== ticket.target_id) {
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    return refus('Impossible d’ouvrir la session de l’élève.', 500);
  }

  const secure = (req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')) === 'https';
  const base = { path: '/', sameSite: 'lax' as const, secure, maxAge: MARQUEURS_MAX_AGE_S };
  // Mêmes marqueurs que l'impersonation historique (bandeau, contrôle
  // d'appareil unique ignoré, temps d'étude non comptabilisé…) — SANS
  // `impersonator_refresh` : aucune session admin n'est à restaurer ici.
  response.cookies.set('impersonator_id', ticket.admin_id, { ...base, httpOnly: true });
  const nom = [cible.first_name, cible.last_name].filter(Boolean).join(' ').trim() || emailAuth;
  response.cookies.set('impersonator_target_name', nom, { ...base, httpOnly: false });
  response.cookies.set(COOKIE_ONGLET, String(Date.now() + SESSION_ONGLET_MAX_MS), { ...base, httpOnly: false });
  response.cookies.set('impersonator_refresh', '', { ...base, httpOnly: true, maxAge: 0 });
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
