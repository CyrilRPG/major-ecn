/**
 * POST /api/admin/resend-activation
 *
 * Renvoie un email d'activation (set-password) à un user existant.
 * Utile pour débloquer un étudiant qui n'a pas reçu son email après
 * un paiement Stripe (Resend non configuré, fallback Supabase rate-limité, etc.).
 *
 * Body : { userId: string }
 * Réservé aux admins.
 */
import { NextResponse } from 'next/server';
import { createClient as createSupabasePublicClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { purchaseConfirmationEmail, resetPasswordEmail, welcomeEmail } from '@/lib/email/templates';
import { FORMULES, type FormuleId } from '@/lib/stripe';

type ScopeWithFormule = { paid_formule?: string; paid_offer?: string };

/** Quota d'envoi journalier atteint côté Resend (ou limite de débit). */
function quotaAtteint(err: string | null): boolean {
  if (!err) return false;
  return /quota|429|rate.?limit|too many/i.test(err);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { userId?: string };
  if (!body.userId) return NextResponse.json({ error: 'userId manquant' }, { status: 400 });

  let admin;
  try { admin = createAdminClient(); } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service indisponible' }, { status: 500 });
  }

  // 1) Récupérer email + first_name + formule éventuelle pour personnaliser.
  const { data: prof } = await admin
    .from('profiles')
    .select('id, email, first_name, last_name, permission_scope')
    .eq('id', body.userId)
    .maybeSingle();
  if (!prof?.email) return NextResponse.json({ error: 'Profil introuvable ou sans email' }, { status: 404 });

  const scope = (prof.permission_scope ?? {}) as ScopeWithFormule;
  const formuleId = scope.paid_formule as FormuleId | undefined;
  const formule = formuleId && formuleId in FORMULES ? FORMULES[formuleId] : null;

  const base = siteUrl();
  const redirectTo = `${base}/auth/setup-password`;

  // 2) Génère un lien recovery (valide pour tout user existant).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: 'recovery',
    email: prof.email,
    options: { redirectTo },
  });
  if (linkErr) {
    return NextResponse.json({ error: `generateLink: ${linkErr.message}` }, { status: 500 });
  }
  const hashedToken = link?.properties?.hashed_token as string | undefined;
  // Pas de repli vers `/login` : envoyer « voici votre lien d'activation » vers
  // l'écran de connexion d'un compte sans mot de passe est une impasse.
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? null;
  if (!setupUrl) {
    return NextResponse.json({ error: 'Aucun lien exploitable n\'a pu être généré.' }, { status: 500 });
  }

  // L'objet du mail doit dire la vérité : un compte déjà activé ne « s'active »
  // pas une seconde fois, il se réinitialise. Annoncer une activation à
  // quelqu'un qui a déjà un mot de passe, c'est exactement ce qui l'amenait à
  // retaper le sien et à buter sur « must be different from the old password ».
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: authUser } = await (admin as any).auth.admin.getUserById(body.userId);
  const dejaActive = !!(authUser?.user?.email_confirmed_at || authUser?.user?.last_sign_in_at);

  // 3) Tentative 1 : Resend avec le template d'achat (si on a une formule)
  //    sinon un template "activation" générique.
  let emailVia: 'resend' | 'supabase' | null = null;
  let emailError: string | null = null;

  try {
    const quoi = dejaActive ? 'Réinitialisation de votre mot de passe' : 'Votre lien d\'activation';
    const subject = formule
      ? `${quoi} — ${formule.name} | Major ECN`
      : `${quoi} — Major ECN`;
    if (formule) {
      const tmpl = purchaseConfirmationEmail({
        firstName: prof.first_name ?? '',
        formuleName: formule.name,
        amountEuros: formule.amountCents / 100,
        installments: 1,
        setupUrl,
      });
      const r = await sendEmail({ to: prof.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
      if (r.ok) { emailVia = 'resend'; }
      else { emailError = r.error; }
    } else {
      const tmpl = dejaActive
        ? resetPasswordEmail({ firstName: prof.first_name ?? '', resetUrl: setupUrl })
        : welcomeEmail({ firstName: prof.first_name ?? 'futur lauréat', setupUrl, role: 'student' });
      const r = await sendEmail({ to: prof.email, subject, html: tmpl.html, text: tmpl.text });
      if (r.ok) { emailVia = 'resend'; }
      else { emailError = r.error; }
    }
  } catch (e) {
    emailError = e instanceof Error ? e.message : 'Resend erreur';
  }

  // 4) Tentative 2 : Supabase resetPasswordForEmail (public client, SMTP Supabase).
  if (!emailVia) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes.');
      const publicClient = createSupabasePublicClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: rpErr } = await publicClient.auth.resetPasswordForEmail(prof.email, { redirectTo });
      if (!rpErr) { emailVia = 'supabase'; emailError = null; }
      else { emailError = (emailError ?? '') + ' | Supabase: ' + rpErr.message; }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur Supabase';
      emailError = (emailError ?? '') + ' | Supabase: ' + msg;
    }
  }

  if (!emailVia) {
    // Aucun canal disponible (quota Resend du jour atteint, SMTP Supabase
    // temporisé…). On renvoie tout de même le LIEN D'ACTIVATION : l'équipe peut
    // le transmettre à l'élève par un autre moyen au lieu de rester bloquée.
    // Statut 200 volontaire — la requête a abouti, seul l'envoi a échoué.
    return NextResponse.json({
      ok: false,
      error: emailError ?? 'Aucun email envoyé',
      reason: quotaAtteint(emailError) ? 'quota' : 'autre',
      to: prof.email,
      setupUrl,
    });
  }

  return NextResponse.json({ ok: true, via: emailVia, to: prof.email, setupUrl });
}
