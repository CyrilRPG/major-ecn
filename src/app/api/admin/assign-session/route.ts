import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';

const AssignSessionSchema = z.object({
  student_ids: z.array(z.string().uuid()).min(1, 'Aucun élève sélectionné'),
  /** null = détacher les élèves de toute session (plus d'expiration). */
  evc_session_id: z.string().nullable(),
});

/**
 * POST /api/admin/assign-session — affectation en masse d'une session EVC.
 * L'override individuel `access_end` est volontairement préservé.
 */
export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

  const body = await req.json().catch(() => ({}));
  const parsed = AssignSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { student_ids, evc_session_id } = parsed.data;

  if (evc_session_id) {
    const { data: session } = await guard.auth.supabase
      .from('evc_sessions').select('id').eq('id', evc_session_id).maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }

  const { error, count } = await guard.auth.supabase
    .from('profiles')
    .update({ evc_session_id }, { count: 'exact' })
    .in('id', student_ids)
    .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, updated: count ?? 0 });
}
