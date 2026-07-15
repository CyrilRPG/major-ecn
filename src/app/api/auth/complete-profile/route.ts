import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Renseigne les informations obligatoires du profil de l'appelant
 * (prénom + nom + téléphone) — au moment de l'activation OU via le popup
 * obligatoire de complétion affiché à la connexion tant que le profil est
 * incomplet. N'agit QUE sur la ligne de l'appelant (auth.uid()) ; utilise le
 * client service-role pour éviter les soucis de RLS, mais ne modifie jamais un
 * autre profil.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const first = typeof body.first_name === 'string' ? body.first_name.trim().slice(0, 80) : '';
  const last = typeof body.last_name === 'string' ? body.last_name.trim().slice(0, 80) : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : '';
  // Champs obligatoires pour un profil complet (repris dans la liste élèves).
  if (!first || !last) return NextResponse.json({ error: 'Nom et prénom requis' }, { status: 400 });
  // Téléphone requis SEULEMENT s'il est fourni vide alors qu'attendu : on exige
  // un numéro plausible (au moins 6 chiffres) quand il est transmis.
  if (phone && phone.replace(/\D/g, '').length < 6) {
    return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 });
  }
  if (body.require_phone && !phone) {
    return NextResponse.json({ error: 'Téléphone requis' }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service indisponible' }, { status: 500 });
  }

  const { error } = await admin
    .from('profiles')
    .update({ first_name: first, last_name: last, ...(phone ? { phone } : {}) })
    .eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
