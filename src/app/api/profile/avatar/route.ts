import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { isPlatformAvatar } from '@/lib/avatar';
import { canoniserAvatar, estAvatarAutorise, estAvatarCompose } from '@/lib/avatars/traits';
import { sondeAvatarsProfils } from '@/lib/avatars/profils';
import { avatarEstLibre, avatarsDejaPris } from '@/lib/avatars/unicite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEJA_PRIS =
  'Ce médaillon est déjà porté par un autre compte. Changez un détail — l’emblème suffit — puis réessayez.';

/**
 * POST /api/profile/avatar — enregistre le médaillon d'un compte Major ECN.
 *
 * Deux usages, selon le corps :
 *   { seeds: string[] }  → renvoie ceux qui sont DÉJÀ PRIS (dernière étape de
 *                          l'atelier, pour griser les options) ;
 *   { seed: string }     → enregistre, si le médaillon est encore libre.
 *
 * Le périmètre est celui de Major ECN, jamais celui d'EVC Arena : les deux
 * unicités sont cloisonnées et n'ont pas à se connaître.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { seed?: unknown; seeds?: unknown } | null;

  if (Array.isArray(body?.seeds)) {
    const codes = body.seeds.filter(estAvatarCompose);
    const pris = await avatarsDejaPris(codes, sondeAvatarsProfils(user.id));
    return NextResponse.json({ ok: true, pris });
  }

  const seed = body?.seed;
  if (!isPlatformAvatar(seed)) {
    return NextResponse.json({ error: 'Choisissez un avatar du catalogue Major ECN.' }, { status: 400 });
  }
  // Le gladiateur reste à l'Arena : il n'est pas proposé côté plateforme.
  if (estAvatarCompose(seed) && !estAvatarAutorise(seed, 'plateforme')) {
    return NextResponse.json({ error: 'Ce médaillon est réservé à EVC Arena.' }, { status: 400 });
  }

  const avatar = estAvatarCompose(seed) ? canoniserAvatar(seed) : seed;
  // L'index d'unicité tranche en dernier recours ; ce contrôle donne le bon
  // message plutôt qu'une erreur de base.
  if (estAvatarCompose(avatar) && !(await avatarEstLibre(avatar, sondeAvatarsProfils(user.id)))) {
    return NextResponse.json({ error: DEJA_PRIS }, { status: 409 });
  }

  // L'identité vient exclusivement du jeton vérifié, jamais du corps de la requête.
  // Le client serveur évite la politique UPDATE récursive de profiles.
  const { data, error } = await createAdminClient()
    .from('profiles')
    .update({ avatar_seed: avatar })
    .eq('id', user.id)
    .select('avatar_seed')
    .maybeSingle();
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: DEJA_PRIS }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  return NextResponse.json({ ok: true, seed: data.avatar_seed });
}
