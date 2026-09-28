/**
 * POST /api/profile/delete
 *
 * Permet à un utilisateur connecté de SUPPRIMER son propre compte.
 * - Supprime l'utilisateur côté auth.users (cascade vers profile via ON DELETE)
 * - Aucun risque de suppression d'autres comptes : on n'utilise que la session
 *   authentifiée pour identifier le user.
 *
 * Restriction : un admin ne peut pas se supprimer lui-même (sécurité contre la
 * perte d'accès à la console).
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { purgerSurlignages } from '@/lib/fiches/surlignages-purge';
import { anonymiserMessagesForum } from '@/lib/forum/anonymiser';

export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'admin') {
    return NextResponse.json(
      { error: 'Un administrateur ne peut pas supprimer son propre compte depuis le profil. Contactez un autre administrateur.' },
      { status: 403 },
    );
  }

  let admin;
  try { admin = createAdminClient(); } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service indisponible' },
      { status: 500 },
    );
  }

  // Surlignages des fiches (Storage, sans cascade SQL) : purgés avant le compte.
  await purgerSurlignages(admin, user.id).catch(() => undefined);

  // Forum : questions et relances restent visibles, signées « Ancien élève »
  // (promesse de /suppression-compte). Échec → le compte n'est pas supprimé.
  const anonErr = await anonymiserMessagesForum(admin, user.id);
  if (anonErr) return NextResponse.json({ error: anonErr }, { status: 500 });

  // Force la déconnexion du user puis supprime son compte. Le profile est
  // supprimé en cascade via la FK ON DELETE CASCADE.
  try { await admin.auth.admin.signOut(user.id); } catch { /* best-effort */ }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
