import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddStudentSchema } from '@/lib/schemas/student';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = AddStudentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });

  const { first_name, last_name, email, phone, promotion, permission_type, faculties } = parsed.data;
  const permission_scope =
    permission_type === 'all'
      ? { type: 'all' as const }
      : { type: 'faculty' as const, faculties: faculties ?? [] };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service role indisponible' },
      { status: 500 },
    );
  }

  const { data: created, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { first_name, last_name },
  });
  if (error || !created?.user) {
    return NextResponse.json({ error: error?.message ?? 'Échec de la création' }, { status: 500 });
  }

  await admin
    .from('profiles')
    .update({
      first_name,
      last_name,
      email,
      phone: phone ?? null,
      promotion,
      permission_scope,
      role: 'student',
    })
    .eq('id', created.user.id);

  return NextResponse.json({ ok: true, id: created.user.id });
}
