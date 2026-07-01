import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { leadId?: string; active?: boolean; source?: 'methodologie' | 'diagnostic' };
  if (!body.leadId || typeof body.active !== 'boolean') {
    return NextResponse.json({ error: 'leadId / active manquants' }, { status: 400 });
  }

  const table = body.source === 'diagnostic' ? 'diagnostic_leads' : 'guide_leads';
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from(table)
    .update({ active: body.active })
    .eq('id', body.leadId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
