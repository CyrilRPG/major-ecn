import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

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
