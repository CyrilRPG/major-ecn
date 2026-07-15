import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

/**
 * Désactivation EN MASSE d'élèves par email. Le compte n'est PAS supprimé : on
 * met `is_active = false` (l'élève perd tout accès et est déconnecté). Le mot de
 * passe et les données restent intacts — le compte peut être réactivé plus tard.
 * N'agit que sur des comptes `role = 'student'` (jamais un admin/professeur).
 */
const Schema = z.object({ emails: z.array(z.string().email()).min(1, 'Au moins un email').max(500, 'Maximum 500 emails') });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });

  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });

  let admin;
  try { admin = createAdminClient(); } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service indisponible' }, { status: 500 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const emails = Array.from(new Set(parsed.data.emails.map((e) => e.trim().toLowerCase()))).filter(Boolean);
  const { data: profs } = await a.from('profiles').select('id, email, role').in('email', emails);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = (profs ?? []) as { id: string; email: string | null; role: string | null }[];
  const foundEmails = new Set(found.map((p) => (p.email ?? '').toLowerCase()));

  let deactivated = 0, skippedSelf = 0, skippedNonStudent = 0, failed = 0;
  for (const p of found) {
    if (p.id === user.id) { skippedSelf++; continue; }
    if (p.role !== 'student') { skippedNonStudent++; continue; }
    const { error } = await a.from('profiles').update({ is_active: false }).eq('id', p.id);
    if (error) { failed++; continue; }
    deactivated++;
    try { await a.auth.admin.signOut(p.id); } catch { /* best-effort */ }
  }
  const notFound = emails.filter((e) => !foundEmails.has(e)).length;

  return NextResponse.json({
    ok: true,
    summary: { total: emails.length, deactivated, notFound, skippedSelf, skippedNonStudent, failed },
  });
}
