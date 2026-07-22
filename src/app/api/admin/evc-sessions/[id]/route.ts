import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const UpdateSessionSchema = z.object({
  label: z.string().min(1).optional(),
  default_access_end: z.string().datetime({ offset: true }).optional(),
  is_default: z.boolean().optional(),
});

async function requireAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return { error: NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 }) };
  return { supabase };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminClient();
  if ('error' in ctx) return ctx.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }

  if (parsed.data.is_default) {
    const { error } = await ctx.supabase
      .from('evc_sessions').update({ is_default: false }).eq('is_default', true).neq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error } = await ctx.supabase.from('evc_sessions').update(parsed.data).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminClient();
  if ('error' in ctx) return ctx.error;
  const { id } = await params;

  // Refuse la suppression si des élèves y sont rattachés (leur date de fin
  // effective disparaîtrait silencieusement — on force une réaffectation).
  const { count } = await ctx.supabase
    .from('profiles').select('id', { count: 'exact', head: true }).eq('evc_session_id', id);
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `${count} élève(s) rattaché(s) à cette session. Réaffectez-les avant de la supprimer.` },
      { status: 409 },
    );
  }

  const { error } = await ctx.supabase.from('evc_sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
