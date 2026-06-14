import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateStudentSchema } from '@/lib/schemas/student';

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }

  const { id, first_name, last_name, phone, offer, permission_type, colleges, cours } = parsed.data;
  const permission_scope =
    permission_type === 'all'
      ? { type: 'all' as const, offer }
      : {
          type: 'college' as const,
          colleges: colleges ?? [],
          offer,
          ...(cours && cours.length > 0 ? { cours } : {}),
        };

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name,
      last_name,
      phone: phone ?? null,
      permission_scope,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
