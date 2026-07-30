/**
 * GET /api/test-email?to=email@exemple.fr
 *
 * Route de diagnostic : envoie un email de test via Resend.
 * Protégée par un secret via header `x-test-token` ou query `?token=...`
 * — EMAIL_TEST_TOKEN doit être configuré sur Vercel, sinon la route refuse
 * toute requête (fail-closed).
 */
import { NextResponse } from 'next/server';
import { sendEmail, siteUrl } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to');
  const token = searchParams.get('token') ?? req.headers.get('x-test-token');

  const expectedToken = process.env.EMAIL_TEST_TOKEN;

  // Fail-closed : sans EMAIL_TEST_TOKEN configuré, cette route restait
  // accessible sans authentification (relais d'envoi + fuite du préfixe de
  // clé Resend à quiconque). On refuse désormais dans les deux cas.
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Token invalide ou manquant' }, { status: 401 });
  }

  if (!to || !to.includes('@')) {
    return NextResponse.json(
      { error: 'Paramètre `to` requis (?to=email@exemple.fr)' },
      { status: 400 },
    );
  }

  const configCheck = {
    resend_api_key_set: !!process.env.RESEND_API_KEY,
    resend_api_key_prefix: process.env.RESEND_API_KEY?.slice(0, 6) ?? null,
    email_from: process.env.EMAIL_FROM ?? '(fallback Resend sandbox)',
    site_url_resolved: siteUrl(),
  };

  console.log('[test-email] sending', { to, configCheck });

  const result = await sendEmail({
    to,
    subject: '✅ Test email — Major ECN',
    html: `
      <h1 style="font-family:sans-serif;color:#0F1F4D;">Test email Major ECN</h1>
      <p style="font-family:sans-serif;color:#374151;">
        Ce message confirme que Resend est correctement configuré sur Vercel.
      </p>
      <h3 style="font-family:sans-serif;color:#0F1F4D;">Configuration runtime</h3>
      <pre style="background:#F8FAFC;padding:12px;border-radius:8px;font-size:12px;">${JSON.stringify(configCheck, null, 2)}</pre>
      <p style="font-family:sans-serif;color:#7A8499;font-size:12px;">
        Envoyé depuis ${siteUrl()}/api/test-email à ${new Date().toISOString()}.
      </p>`,
    text: `Test email Major ECN — Resend OK. Config: ${JSON.stringify(configCheck)}`,
  });

  return NextResponse.json({
    ok: result.ok,
    result,
    configCheck,
  });
}
