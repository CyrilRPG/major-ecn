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
 *
 * ⚠️ Générer un lien INVALIDE le précédent du même type : GoTrue n'en garde
 * qu'un seul par utilisateur. Ce cron était la première cause des « lien plus
 * valide » remontés par les élèves. Un élève invité la veille avait
 * `last_relance_at` à null, donc le cron du lendemain matin le relançait
 * aussitôt et tuait le lien de l'e-mail d'invitation qu'il n'avait pas encore
 * ouvert. On laisse désormais à l'invitation d'origine le temps de servir.
 */
const RELANCE_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
/** Délai de grâce laissé à l'invitation d'origine avant toute régénération. */
const DELAI_GRACE_INVITATION_MS = 7 * 24 * 60 * 60 * 1000;
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

  // Ménage quotidien : purge des op_id de synchro mobile > 90 jours (la fenêtre
  // de rejeu d'une app hors ligne est bien plus courte). Best-effort.
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    await a.from('sync_ops').delete().lt('applied_at', cutoff);
  } catch { /* best-effort */ }
  const base = (siteUrl() || 'https://www.major-ecn.fr').replace(/\/$/, '');

  // 1) Dernière connexion ET date d'invitation par utilisateur (pagination
  //    défensive). La date d'invitation sert à ne pas écraser un lien encore
  //    frais que l'élève n'a simplement pas encore ouvert.
  const lastSignIn = new Map<string, string | null>();
  const inviteLe = new Map<string, string | null>();
  for (let page = 1; page <= 40; page++) {
    const { data, error } = await a.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = (data?.users ?? []) as any[];
    for (const u of users) {
      lastSignIn.set(u.id, u.last_sign_in_at ?? null);
      inviteLe.set(u.id, u.invited_at ?? u.created_at ?? null);
    }
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
  let skippedInvitationFraiche = 0, skippedLienIndisponible = 0;

  for (const s of students) {
    if (!s.email) { noEmail++; continue; }
    if (lastSignIn.get(s.id)) { alreadyConnected++; continue; } // s'est déjà connecté
    if (s.last_relance_at && now - new Date(s.last_relance_at).getTime() < RELANCE_INTERVAL_MS) { skippedRecent++; continue; }

    // Invitation encore fraîche : la relancer maintenant tuerait le lien que
    // l'élève a dans sa boîte et s'apprête peut-être à ouvrir.
    const invite = inviteLe.get(s.id);
    if (invite && now - new Date(invite).getTime() < DELAI_GRACE_INVITATION_MS) {
      skippedInvitationFraiche++;
      continue;
    }

    // Lien d'activation frais (choix du mot de passe).
    let setupUrl: string | null = null;
    try {
      const { data: link, error: linkErr } = await a.auth.admin.generateLink({
        type: 'invite', email: s.email, options: { redirectTo: `${base}/auth/setup-password` },
      });
      if (linkErr) throw linkErr;
      const ht = link?.properties?.hashed_token as string | undefined;
      if (ht) setupUrl = `${base}/auth/confirm?token_hash=${encodeURIComponent(ht)}&type=invite&next=${encodeURIComponent('/auth/setup-password')}`;
      else if (link?.properties?.action_link) setupUrl = link.properties.action_link as string;
    } catch {
      setupUrl = null;
    }

    // Sans lien exploitable, on n'envoie RIEN. L'ancien repli pointait vers
    // `/login` : un e-mail « Activez votre espace » qui menait à l'écran de
    // connexion d'un compte sans mot de passe — une impasse.
    if (!setupUrl) { skippedLienIndisponible++; continue; }

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
    summary: {
      candidates: students.length, sent, failed, skippedRecent, alreadyConnected, noEmail,
      skippedInvitationFraiche, skippedLienIndisponible,
    },
  });
}
