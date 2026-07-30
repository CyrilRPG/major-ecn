import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVerifiedUser } from '@/lib/auth/verified-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/popups/[id]/viewed — marque une popup comme vue par l'utilisateur. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('popup_views')
    .upsert({ user_id: user.id, popup_id: id }, { onConflict: 'user_id,popup_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
