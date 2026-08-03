import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type OtpType = 'invite' | 'recovery' | 'signup' | 'email_change' | 'magiclink';

/**
 * Route de confirmation des liens d'activation / réinitialisation Supabase.
 *
 * ⚠️ La vérification du jeton (`verifyOtp`) NE DOIT PAS avoir lieu sur un GET.
 * Les scanners de liens des messageries (Outlook Safe Links, proxys Gmail,
 * antivirus…) préchargent l'URL en GET et consomment le jeton à usage unique
 * AVANT le clic de l'utilisateur. Le GET rend donc une page intermédiaire qui
 * POST vers cette même route.
 *
 * ⚠️ La page ne s'auto-soumettait PLUS TÔT en JavaScript après 350 ms — ce qui
 * rouvrait exactement le trou qu'elle prétendait fermer : les passerelles de
 * sécurité à détonation (Microsoft Defender en mode sandbox, Proofpoint URL
 * Defense) exécutent le JS de la page et soumettaient donc le formulaire à la
 * place de l'élève. Les journaux d'authentification montraient 10 échecs
 * « One-time token not found » — jeton DÉJÀ CONSOMMÉ, pas expiré — en
 * 47 minutes. Seul un vrai clic déclenche désormais la vérification.
 */

/** Erreurs transmises à la page suivante sous forme de code stable, traduit
 *  là-bas. On ne propage plus le message brut de Supabase, en anglais. */
type MotifEchec = 'lien_consomme' | 'lien_expire' | 'lien_invalide';

function motifDepuisErreur(code: string | undefined, message: string): MotifEchec {
  const m = message.toLowerCase();
  // GoTrue renvoie `otp_expired` dans les DEUX cas ; seul le message distingue
  // un jeton périmé d'un jeton déjà utilisé (ou écrasé par une régénération).
  if (m.includes('not found')) return 'lien_consomme';
  if (code === 'otp_expired' || m.includes('expired')) return 'lien_expire';
  return 'lien_invalide';
}

/** `next` ne doit jamais sortir du site : `new URL(next, origin)` accepterait
 *  une URL absolue et transformerait la route en redirection ouverte. */
function destinationSure(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/auth/setup-password';
  return next;
}

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
  .note{font-size:12px;color:#8A94A6;margin:16px 0 0}
</style></head><body>
  <div class="card">
    <div class="bar"></div>
    <h1>Activation de votre compte</h1>
    <p>Cliquez ci-dessous pour activer votre compte Major ECN et choisir votre mot de passe.</p>
    <form id="f" method="POST" action="/auth/confirm">
      <input type="hidden" name="token_hash" value="${escapeHtml(tokenHash)}">
      <input type="hidden" name="type" value="${escapeHtml(type)}">
      <input type="hidden" name="next" value="${escapeHtml(next)}">
      <button type="submit">Activer mon compte</button>
    </form>
    <p class="note">Cette étape protège votre compte : le lien n'est utilisé qu'au moment où vous cliquez.</p>
  </div>
</body></html>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const code = url.searchParams.get('code');
  const next = destinationSure(url.searchParams.get('next'));

  // Lien Supabase natif (PKCE) : les envois de secours — `resetPasswordForEmail`,
  // `inviteUserByEmail`, `signInWithOtp` — n'utilisent pas notre gabarit et
  // reviennent avec `?code=`, sans `token_hash`. Faute d'échange, ce code était
  // purement et simplement jeté et l'élève tombait sur « lien invalide ».
  // Ici le code N'EST PAS à usage unique au sens des scanners : il est lié au
  // navigateur qui a lancé la demande, l'échanger dès le GET est donc sûr.
  if (!tokenHash && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirigerAvecMotif(next, url.origin, motifDepuisErreur(error.code, error.message));
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // Rien à vérifier → on tente la page (session peut être déjà posée).
  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // On NE vérifie PAS ici (anti-préchargement). On rend la page intermédiaire.
  return new NextResponse(interstitial(tokenHash, type, next), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function redirigerAvecMotif(next: string, origin: string, motif: MotifEchec) {
  const sep = next.includes('?') ? '&' : '?';
  return NextResponse.redirect(new URL(`${next}${sep}error=${motif}`, origin), { status: 303 });
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
    next = destinationSure(form.get('next') as string | null);
  } else {
    tokenHash = url.searchParams.get('token_hash');
    type = url.searchParams.get('type');
    next = destinationSure(url.searchParams.get('next'));
  }

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL(next, url.origin), { status: 303 });
  }

  // Seconde barrière contre les passerelles à détonation : `Sec-Fetch-User: ?1`
  // n'est posé que sur une navigation déclenchée par une action HUMAINE ; un
  // formulaire soumis par script ne le porte pas.
  //
  // Deux précautions, parce qu'un faux positif ici rebloquerait un élève :
  //  - en-tête ABSENT ⇒ on laisse passer (tous les navigateurs ne l'envoient
  //    pas, Safari l'a longtemps ignoré) ;
  //  - en-tête présent mais différent de `?1` ⇒ on NE consomme pas le jeton et
  //    on réaffiche simplement la page avec son bouton. Un robot s'arrête là,
  //    un humain reclique et passe. Personne n'est mis en échec.
  const secFetchUser = req.headers.get('sec-fetch-user');
  if (secFetchUser !== null && secFetchUser !== '?1') {
    return new NextResponse(interstitial(tokenHash, type, next), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as OtpType });

  if (error) {
    return redirigerAvecMotif(next, url.origin, motifDepuisErreur(error.code, error.message));
  }

  // Session posée dans les cookies (via @supabase/ssr) → redirection 303 (GET).
  return NextResponse.redirect(new URL(next, url.origin), { status: 303 });
}
