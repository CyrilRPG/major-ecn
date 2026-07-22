import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const CreateSessionSchema = z.object({
  id: z.string().min(1, 'Identifiant requis').regex(/^[a-z0-9-]+$/, 'Identifiant : minuscules, chiffres et tirets uniquement'),
  label: z.string().min(1, 'Libellé requis'),
  default_access_end: z.string().datetime({ offset: true }),
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

export async function GET() {
  const ctx = await requireAdminClient();
  if ('error' in ctx) return ctx.error;
  const { data, error } = await ctx.supabase
    .from('evc_sessions')
    .select('id, label, default_access_end, is_default, created_at')
    .order('default_access_end', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data ?? [] });
}

export async function POST(req: Request) {
  const ctx = await requireAdminClient();
  if ('error' in ctx) return ctx.error;
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { id, label, default_access_end, is_default } = parsed.data;

  // Une seule session par défaut (index unique partiel) : on libère l'ancienne d'abord.
  if (is_default) {
    const { error } = await ctx.supabase.from('evc_sessions').update({ is_default: false }).eq('is_default', true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error } = await ctx.supabase
    .from('evc_sessions')
    .insert({ id, label, default_access_end, is_default: is_default ?? false });
  if (error) {
    const msg = error.code === '23505' ? 'Une session avec cet identifiant existe déjà.' : error.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
