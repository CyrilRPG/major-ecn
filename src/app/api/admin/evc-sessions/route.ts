import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';

const CreateSessionSchema = z.object({
  id: z.string().min(1, 'Identifiant requis').regex(/^[a-z0-9-]+$/, 'Identifiant : minuscules, chiffres et tirets uniquement'),
  label: z.string().min(1, 'Libellé requis'),
  default_access_end: z.string().datetime({ offset: true }),
  is_default: z.boolean().optional(),
});

export async function GET(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { data, error } = await guard.auth.supabase
    .from('evc_sessions')
    .select('id, label, default_access_end, is_default, created_at')
    .order('default_access_end', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data ?? [] });
}

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { id, label, default_access_end, is_default } = parsed.data;

  // Une seule session par défaut (index unique partiel) : on libère l'ancienne d'abord.
  if (is_default) {
    const { error } = await guard.auth.supabase.from('evc_sessions').update({ is_default: false }).eq('is_default', true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error } = await guard.auth.supabase
    .from('evc_sessions')
    .insert({ id, label, default_access_end, is_default: is_default ?? false });
  if (error) {
    const msg = error.code === '23505' ? 'Une session avec cet identifiant existe déjà.' : error.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
