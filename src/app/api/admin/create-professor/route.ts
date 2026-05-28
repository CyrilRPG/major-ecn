import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddProfessorSchema, CONTENT_TYPES, PERMISSION_LEVELS, type ContentType, type PermissionLevel } from '@/lib/schemas/professor';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { welcomeEmail } from '@/lib/email/templates';

function origin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, '');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = AddProfessorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { first_name, last_name, email, phone, permission_type, colleges, content_permissions } = parsed.data;

  const cleanedColleges = permission_type === 'college' ? (colleges ?? []) : [];
  const cleanedPermissions: Partial<Record<ContentType, PermissionLevel>> = {};
  for (const t of CONTENT_TYPES) {
    const lvl = content_permissions?.[t];
    if (lvl && (PERMISSION_LEVELS as readonly string[]).includes(lvl) && lvl !== 'none') {
      cleanedPermissions[t] = lvl;
    }
  }

  const permission_scope = {
    role: 'professor',
    type: permission_type,
    colleges: cleanedColleges,
    content_permissions: cleanedPermissions,
  };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service indisponible' },
      { status: 500 },
    );
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ? siteUrl() : origin(req);
  const redirectTo = `${base}/auth/setup-password`;

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { first_name, last_name, role: 'professor' },
  });
  if (error || !created?.user) {
    const msg = error?.message ?? 'Échec de la création';
    const friendly = /already|exist|duplicate/i.test(msg)
      ? 'Un compte existe déjà avec cet email.'
      : msg;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updErr } = await (admin as any)
    .from('profiles')
    .update({
      first_name,
      last_name,
      email,
      phone: phone || null,
      role: 'professor',
      permission_scope,
    })
    .eq('id', created.user.id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // Magic-link + email branded (Resend) avec fallback Supabase si pas de clé.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (admin as any).auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo },
  });
  const setupUrl = (link?.properties?.action_link as string | undefined) ?? `${base}/login`;
  const { subject, html, text } = welcomeEmail({ firstName: first_name, setupUrl, role: 'professor' });
  const sent = await sendEmail({ to: email, subject, html, text });
  if (!sent.ok && sent.error.includes('RESEND_API_KEY non configurée')) {
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name, role: 'professor' },
      redirectTo,
    });
  }

  return NextResponse.json({ ok: true, id: created.user.id });
}
