import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { relanceInactiveEmail } from '@/lib/email/templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Relance des élèves JAMAIS connectés à la plateforme.
 *
 * Cadence : un email de relance au maximum tous les 7 jours par élève
 * (colonne `profiles.last_relance_at`). Un élève qui s'est déjà connecté au
 * moins une fois (`auth.users.last_sign_in_at` non nul) n'est jamais relancé.
 * Chaque relance embarque un lien d'activation frais.
 */
const RELANCE_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const base = (siteUrl() || 'https://www.major-ecn.fr').replace(/\/$/, '');

  // 1) Date de dernière connexion par utilisateur (pagination défensive).
  const lastSignIn = new Map<string, string | null>();
  for (let page = 1; page <= 40; page++) {
    const { data, error } = await a.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = (data?.users ?? []) as any[];
    for (const u of users) lastSignIn.set(u.id, u.last_sign_in_at ?? null);
    if (users.length < 200) break;
  }

  // 2) Élèves actifs.
  const { data: studs } = await a
    .from('profiles')
    .select('id, email, first_name, last_relance_at')
    .eq('role', 'student')
    .eq('is_active', true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const students = (studs ?? []) as { id: string; email: string | null; first_name: string | null; last_relance_at: string | null }[];

  const now = Date.now();
  let sent = 0, failed = 0, skippedRecent = 0, alreadyConnected = 0, noEmail = 0;

  for (const s of students) {
    if (!s.email) { noEmail++; continue; }
    if (lastSignIn.get(s.id)) { alreadyConnected++; continue; } // s'est déjà connecté
    if (s.last_relance_at && now - new Date(s.last_relance_at).getTime() < RELANCE_INTERVAL_MS) { skippedRecent++; continue; }

    // Lien d'activation frais (choix du mot de passe).
    let setupUrl = `${base}/login`;
    try {
      const { data: link } = await a.auth.admin.generateLink({
        type: 'invite', email: s.email, options: { redirectTo: `${base}/auth/setup-password` },
      });
      const ht = link?.properties?.hashed_token as string | undefined;
      if (ht) setupUrl = `${base}/auth/confirm?token_hash=${encodeURIComponent(ht)}&type=invite&next=${encodeURIComponent('/auth/setup-password')}`;
      else if (link?.properties?.action_link) setupUrl = link.properties.action_link as string;
    } catch {
      /* lien indisponible → on envoie quand même avec le lien /login */
    }

    const { subject, html, text } = relanceInactiveEmail({ firstName: s.first_name, setupUrl });
    const res = await sendEmail({ to: s.email, subject, html, text });
    if (res.ok) {
      sent++;
      await a.from('profiles').update({ last_relance_at: new Date().toISOString() }).eq('id', s.id);
    } else {
      failed++;
    }
    await sleep(600); // throttle Resend
  }

  return NextResponse.json({
    ok: true,
    summary: { candidates: students.length, sent, failed, skippedRecent, alreadyConnected, noEmail },
  });
}
