import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';

const UpdateSessionSchema = z.object({
  label: z.string().min(1).optional(),
  default_access_end: z.string().datetime({ offset: true }).optional(),
  is_default: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }

  if (parsed.data.is_default) {
    const { error } = await guard.auth.supabase
      .from('evc_sessions').update({ is_default: false }).eq('is_default', true).neq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error } = await guard.auth.supabase.from('evc_sessions').update(parsed.data).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { id } = await params;

  // Refuse la suppression si des élèves y sont rattachés (leur date de fin
  // effective disparaîtrait silencieusement — on force une réaffectation).
  const { count } = await guard.auth.supabase
    .from('profiles').select('id', { count: 'exact', head: true }).eq('evc_session_id', id);
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `${count} élève(s) rattaché(s) à cette session. Réaffectez-les avant de la supprimer.` },
      { status: 409 },
    );
  }

  const { error } = await guard.auth.supabase.from('evc_sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
