import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type OtpType = 'invite' | 'recovery' | 'signup' | 'email_change' | 'magiclink';

/**
 * Route de confirmation des liens d'activation / réinitialisation Supabase.
 *
 * ⚠️ Bug corrigé : la vérification du jeton (`verifyOtp`) NE DOIT PLUS avoir
 * lieu sur un GET. Les scanners de liens des messageries (Outlook Safe Links,
 * proxys Gmail, antivirus…) **préchargent** l'URL en GET et **consomment** le
 * jeton à usage unique AVANT le clic de l'utilisateur → « Email link is invalid
 * or has expired » pour élèves ET professeurs.
 *
 * Solution : le GET rend une page intermédiaire qui **POST** vers cette même
 * route (auto-submit JS + bouton de secours). La vérification n'a donc lieu que
 * dans le vrai navigateur de l'utilisateur ; les scanners (qui n'exécutent pas
 * le JS et ne soumettent pas de formulaire) ne consomment plus le jeton.
 */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;');
}

function interstitial(tokenHash: string, type: string, next: string): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer">
<title>Activation du compte — Major ECN</title>
<style>
  body{margin:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#F5F5F7;color:#1F2937;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px}
  .card{background:#fff;border:1px solid #E5E9F0;border-radius:22px;padding:34px 30px;max-width:420px;width:100%;text-align:center;box-shadow:0 24px 60px -34px rgba(15,31,77,.45)}
  .bar{height:4px;width:100%;border-radius:99px;background:linear-gradient(90deg,#6B1A2A,#C0112E,#E8742C);margin:0 auto 20px;max-width:120px}
  h1{font-size:20px;margin:0 0 8px;color:#0F1F4D;font-weight:800}
  p{font-size:14px;color:#52607A;margin:0 0 22px;line-height:1.55}
  button{width:100%;border:0;border-radius:13px;background:linear-gradient(90deg,#8B0E22,#C0112E);color:#fff;font-size:15px;font-weight:700;padding:14px;cursor:pointer}
  .spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.5);border-top-color:#fff;border-radius:50%;animation:s .7s linear infinite;vertical-align:-3px;margin-right:8px}
  @keyframes s{to{transform:rotate(360deg)}}
</style></head><body>
  <div class="card">
    <div class="bar"></div>
    <h1>Activation de votre compte</h1>
    <p>Cliquez ci-dessous pour activer votre compte Major ECN et choisir votre mot de passe.</p>
    <form id="f" method="POST" action="/auth/confirm">
      <input type="hidden" name="token_hash" value="${escapeHtml(tokenHash)}">
      <input type="hidden" name="type" value="${escapeHtml(type)}">
      <input type="hidden" name="next" value="${escapeHtml(next)}">
      <button type="submit"><span class="spin"></span>Activer mon compte</button>
    </form>
    <script>setTimeout(function(){try{document.getElementById('f').submit();}catch(e){}},350);</script>
  </div>
</body></html>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') ?? '/auth/setup-password';

  // Rien à vérifier → on tente la page (session peut être déjà posée).
  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // On NE vérifie PAS ici (anti-préchargement). On rend la page intermédiaire.
  return new NextResponse(interstitial(tokenHash, type, next), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  let tokenHash: string | null = null;
  let type: string | null = null;
  let next = '/auth/setup-password';

  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('form')) {
    const form = await req.formData();
    tokenHash = (form.get('token_hash') as string | null) ?? null;
    type = (form.get('type') as string | null) ?? null;
    next = (form.get('next') as string | null) ?? next;
  } else {
    tokenHash = url.searchParams.get('token_hash');
    type = url.searchParams.get('type');
    next = url.searchParams.get('next') ?? next;
  }

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL(next, url.origin), { status: 303 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as OtpType });

  if (error) {
    const sep = next.includes('?') ? '&' : '?';
    return NextResponse.redirect(
      new URL(`${next}${sep}error=${encodeURIComponent(error.message)}`, url.origin),
      { status: 303 },
    );
  }

  // Session posée dans les cookies (via @supabase/ssr) → redirection 303 (GET).
  return NextResponse.redirect(new URL(next, url.origin), { status: 303 });
}
