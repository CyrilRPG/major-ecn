import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { buildStudentScope, sendStudentInvite } from '@/lib/admin/student-invite';
import { siteUrl } from '@/lib/email/send';
import { isDecouverteOnly } from '@/lib/auth/trial';

function origin(req: Request): string {
  const fromEnv = siteUrl();
  if (fromEnv && !fromEnv.startsWith('http://localhost')) return fromEnv;
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

const BulkSchema = z.object({
  emails: z.array(z.string().email()).min(1, 'Au moins un email').max(200, 'Maximum 200 emails à la fois'),
  offer: z.enum(['essentiel', 'intensif', 'approfondi']),
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional().nullable(),
  cours: z.array(z.string()).optional().nullable(),
  voie: z.enum(['interne', 'externe']).optional().nullable(),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });

  const parsed = BulkSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { emails, offer, permission_type, colleges, cours, voie } = parsed.data;
  const permission_scope = buildStudentScope({ offer, permission_type, colleges, cours, voie });

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service role indisponible' }, { status: 500 });
  }

  const base = origin(req);
  // Dédoublonne + normalise (les élèves saisiront eux-mêmes nom/prénom au 1er accès).
  const uniq = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()))).filter(Boolean);

  const created: string[] = [];
  const invitedNoEmail: string[] = [];
  const skipped: { email: string; reason: string }[] = [];
  const failed: { email: string; reason: string }[] = [];

  // Index des comptes existants (pour l'écrasement des comptes Découverte).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingList } = await (admin as any).auth.admin.listUsers({ page: 1, perPage: 500 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byEmail = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const u of (existingList?.users ?? []) as any[]) {
    if (u.email) byEmail.set(u.email.toLowerCase(), u);
  }

  for (const email of uniq) {
    try {
      let userId: string;
      let wasNew = false;
      const existingUser = byEmail.get(email);

      if (existingUser) {
        // Écrasement uniquement si le compte est « Découverte » (gratuit).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingProfile } = await (admin as any)
          .from('profiles').select('permission_scope').eq('id', existingUser.id).maybeSingle();
        if (!isDecouverteOnly(existingProfile)) { skipped.push({ email, reason: 'compte payant déjà existant' }); continue; }
        userId = existingUser.id;
      } else {
        const { data: c, error } = await admin.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { role: 'student' },
        });
        if (error || !c?.user) {
          const msg = error?.message ?? 'échec';
          if (/already|exist|duplicate/i.test(msg)) { skipped.push({ email, reason: 'compte déjà existant' }); continue; }
          failed.push({ email, reason: msg }); continue;
        }
        userId = c.user.id;
        wasNew = true;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upErr } = await (admin as any).from('profiles').upsert({
        id: userId, email, role: 'student', permission_scope,
      }, { onConflict: 'id' });
      if (upErr) {
        if (wasNew) await admin.auth.admin.deleteUser(userId).catch(() => null);
        failed.push({ email, reason: upErr.message }); continue;
      }
      const { via } = await sendStudentInvite(admin, base, email, '', '');
      if (via) created.push(email); else invitedNoEmail.push(email);
      await sleep(600); // throttle : respecte les limites d'envoi Resend/Supabase
    } catch (e) {
      failed.push({ email, reason: e instanceof Error ? e.message : 'erreur' });
    }
  }

  return NextResponse.json({
    ok: true,
    summary: { total: uniq.length, created: created.length, emailFailed: invitedNoEmail.length, skipped: skipped.length, failed: failed.length },
    created, invitedNoEmail, skipped, failed,
  });
}
