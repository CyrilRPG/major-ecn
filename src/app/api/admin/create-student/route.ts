import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddStudentSchema } from '@/lib/schemas/student';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = AddStudentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });

  const { first_name, last_name, email, phone, offer, permission_type, colleges, cours, voie } = parsed.data;
  // Voie de concours (Médecine générale) : stockée en `paid_voie` — c'est ce que
  // lisent la RLS (current_voie()) ET parseScope côté client, exactement comme
  // après un paiement Stripe. Filtre les séries QCM/QROC vues par l'élève.
  const voieFields = voie ? { paid_voie: voie } : {};
  const permission_scope =
    permission_type === 'all'
      ? { type: 'all' as const, offer, ...voieFields }
      : {
          type: 'college' as const,
          colleges: colleges ?? [],
          offer,
          // cours[] : présent UNIQUEMENT s'il y a des restrictions par matière
          // (sinon accès à tous les cours du/des collège(s) sélectionnés).
          ...(cours && cours.length > 0 ? { cours } : {}),
          ...voieFields,
        };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service role indisponible' },
      { status: 500 },
    );
  }

  const { data: created, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { first_name, last_name },
  });
  if (error || !created?.user) {
    return NextResponse.json({ error: error?.message ?? 'Échec de la création' }, { status: 500 });
  }

  await admin
    .from('profiles')
    .update({
      first_name,
      last_name,
      email,
      phone: phone ?? null,
      permission_scope,
      role: 'student',
    })
    .eq('id', created.user.id);

  return NextResponse.json({ ok: true, id: created.user.id });
}
