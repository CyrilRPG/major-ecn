import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/cours/[cours]/notes — enregistre les notes de l'utilisateur pour cet
 * item. Body : { content: string }
 */
export async function POST(req: Request, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { content?: string };
  const content = typeof body.content === 'string' ? body.content.slice(0, 200_000) : '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error } = await db.from('course_notes').upsert(
    { user_id: user.id, cours_id: coursId, content, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,cours_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
