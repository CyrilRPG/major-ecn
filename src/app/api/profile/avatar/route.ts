import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { isPlatformAvatar } from '@/lib/avatar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/profile/avatar — enregistre un avatar du catalogue pédagogique.
 * Body : { seed: string }
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { seed?: unknown } | null;
  const seed = body?.seed;
  if (!isPlatformAvatar(seed)) return NextResponse.json({ error: 'Choisissez un avatar du catalogue Major ECN.' }, { status: 400 });

  // L'identité vient exclusivement du jeton vérifié, jamais du corps de la requête.
  // Le client serveur évite la politique UPDATE récursive de profiles.
  const { data, error } = await createAdminClient()
    .from('profiles')
    .update({ avatar_seed: seed })
    .eq('id', user.id)
    .select('avatar_seed')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  return NextResponse.json({ ok: true, seed: data.avatar_seed });
}
