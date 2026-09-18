import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { CreerCollaborateurSchema, ModifierCollaborateurSchema } from '@/lib/auth/equipe-schema';
import { composerScope, resumeModules } from '@/lib/auth/collaborateurs';
import { appliquerScope } from '@/lib/equipe/server';
import { logAudit } from '@/lib/audit/log';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { welcomeEmail } from '@/lib/email/templates';

/**
 * Équipe & Permissions — création (POST) et modification (PATCH) d'un membre
 * du personnel (cahier des charges 18/09/2026). Réservé aux administrateurs :
 * un collaborateur, quel que soit son cumul de permissions, ne crée ni ne
 * modifie jamais un compte de l'équipe (§7).
 *
 * Le compte créé est de rôle base `professor` (= personnel non
 * administrateur) ; ses droits réels vivent dans le scope composé ici.
 */

function origin(req: Request): string {
  const fromEnv = siteUrl();
  if (fromEnv && !fromEnv.startsWith('http://localhost')) return fromEnv;
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

/** Fin de journée locale (Europe/Paris ≈ UTC+2 en septembre) pour une date YYYY-MM-DD. */
function finDeJournee(date: string | null | undefined): string | null {
  if (!date) return null;
  return `${date}T23:59:59+02:00`;
}

/** Profil de l'administrateur qui agit (identité figée dans le journal). */
async function acteur(userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (createAdminClient() as any)
    .from('profiles').select('id, first_name, last_name, email, role').eq('id', userId).maybeSingle();
  return (data ?? { id: userId, first_name: null, last_name: null, email: null, role: 'admin' }) as {
    id: string; first_name: string | null; last_name: string | null; email: string | null; role: string;
  };
}

/**
 * Une seule entrée POST (le client d'administration n'envoie que du POST avec
 * jeton frais) : `userId` présent ⇒ modification, absent ⇒ création.
 */
export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const body = await req.json().catch(() => ({}));
  if (body && typeof body === 'object' && typeof (body as { userId?: unknown }).userId === 'string') {
    return modifier(guard.auth.user.id, body);
  }
  const parsed = CreerCollaborateurSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const p = parsed.data;
  const scope = composerScope({
    fonction: p.fonction ?? null, modele: p.modele ?? null, modules: p.modules, perimetre: p.perimetre, mfa_obligatoire: !!p.mfa_obligatoire,
  });

  const admin = createAdminClient();
  const base = origin(req);
  const redirectTo = `${base}/auth/setup-password`;

  const { data: created, error } = await admin.auth.admin.createUser({
    email: p.email,
    email_confirm: false,
    user_metadata: { first_name: p.first_name, last_name: p.last_name, role: 'professor' },
  });
  if (error || !created?.user) {
    const msg = error?.message ?? 'Échec de la création';
    return NextResponse.json({ error: /already|exist|duplicate/i.test(msg) ? 'Un compte existe déjà avec cet email.' : msg }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertErr } = await (admin as any).from('profiles').upsert({
    id: created.user.id,
    first_name: p.first_name,
    last_name: p.last_name,
    email: p.email,
    phone: p.phone || null,
    role: 'professor',
    permission_scope: scope,
    is_active: p.is_active !== false,
    access_end: finDeJournee(p.access_end),
    faculte_id: EDN_FACULTE_ID,
  }, { onConflict: 'id' });
  if (upsertErr) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => null);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }
  // Miroir du module de suivi (suivi_staff_roles).
  await appliquerScope(created.user.id, {
    fonction: p.fonction ?? null, modele: p.modele ?? null, modules: p.modules, perimetre: p.perimetre, mfa_obligatoire: !!p.mfa_obligatoire,
  });

  // Invitation : lien de création de mot de passe (Resend, repli Supabase).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (admin as any).auth.admin.generateLink({ type: 'invite', email: p.email, options: { redirectTo } });
  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=invite&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/login`;
  let emailVia: 'resend' | 'supabase' | null = null;
  let emailError: string | null = null;
  try {
    const { subject, html, text } = welcomeEmail({ firstName: p.first_name, setupUrl, role: 'professor' });
    const sent = await sendEmail({ to: p.email, subject, html, text });
    if (sent.ok) emailVia = 'resend'; else emailError = sent.error;
  } catch (e) {
    emailError = e instanceof Error ? e.message : 'Erreur Resend inconnue';
  }
  if (!emailVia) {
    const { error: invErr } = await admin.auth.admin.inviteUserByEmail(p.email, {
      data: { first_name: p.first_name, last_name: p.last_name, role: 'professor' }, redirectTo,
    });
    if (!invErr) { emailVia = 'supabase'; emailError = null; }
    else emailError = `${emailError ?? ''} | Supabase: ${invErr.message}`;
  }

  await logAudit({
    actor: await acteur(guard.auth.user.id),
    action: 'create',
    entity: 'collaborator',
    entityId: created.user.id,
    description: `Création du collaborateur ${p.first_name} ${p.last_name} (${p.fonction ?? 'sans fonction'}) — ${resumeModules(scope).join(' · ')}`,
    diff: { modules: scope.modules, perimetre: scope.perimetre, access_end: p.access_end ?? null, mfa_obligatoire: scope.mfa_obligatoire },
  });

  return NextResponse.json({
    ok: true,
    id: created.user.id,
    emailVia,
    ...(emailVia ? {} : { warning: `Compte créé, mais l’email d’activation n’a pas pu être envoyé : ${emailError ?? 'erreur inconnue'}. Lien à transmettre : ${setupUrl}` }),
  });
}

async function modifier(adminId: string, body: unknown) {
  const parsed = ModifierCollaborateurSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const p = parsed.data;
  const guard = { auth: { user: { id: adminId } } };
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data: cible } = await a.from('profiles').select('id, role, first_name, last_name, permission_scope').eq('id', p.userId).maybeSingle();
  if (!cible) return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 });
  if (cible.role !== 'professor') return NextResponse.json({ error: 'Seul un membre du personnel non administrateur se gère ici.' }, { status: 400 });

  // La restriction historique à certains items est conservée telle quelle.
  const coursHerites = Array.isArray(cible.permission_scope?.cours) ? (cible.permission_scope.cours as string[]) : undefined;
  const scope = await appliquerScope(p.userId, {
    fonction: p.fonction ?? null, modele: p.modele ?? null, modules: p.modules, perimetre: p.perimetre,
    cours: coursHerites, mfa_obligatoire: !!p.mfa_obligatoire,
  });
  const patch: Record<string, unknown> = {};
  if (p.access_end !== undefined) patch.access_end = finDeJournee(p.access_end);
  if (p.is_active !== undefined) patch.is_active = p.is_active;
  if (Object.keys(patch).length > 0) {
    const { error } = await a.from('profiles').update(patch).eq('id', p.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actor: await acteur(guard.auth.user.id),
    action: 'update',
    entity: 'collaborator',
    entityId: p.userId,
    description: `Permissions de ${cible.first_name ?? ''} ${cible.last_name ?? ''} — ${resumeModules(scope).join(' · ')}`,
    diff: { modules: scope.modules, perimetre: scope.perimetre, ...patch, mfa_obligatoire: scope.mfa_obligatoire },
  });
  return NextResponse.json({ ok: true, scope });
}
