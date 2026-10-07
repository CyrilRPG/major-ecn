import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';

/**
 * Équipe & Permissions — items d'une spécialité (collège et sous-collèges),
 * pour limiter l'accès d'un enseignant à certains d'entre eux. Admin seul,
 * comme l'enregistrement du périmètre.
 */
export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { college } = (await req.json().catch(() => ({}))) as { college?: unknown };
  // Identifiant de collège (« col-mg-pediatrie ») : il entre dans un filtre or().
  if (typeof college !== 'string' || !/^[a-z0-9_-]{1,80}$/i.test(college)) {
    return NextResponse.json({ error: 'Collège manquant.' }, { status: 400 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = createAdminClient() as any;
  const { data: matieres, error } = await a
    .from('matieres').select('id, nom, parent_matiere_id')
    .or(`id.eq.${college},parent_matiere_id.eq.${college}`);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const noms = new Map(((matieres ?? []) as { id: string; nom: string }[]).map((m) => [m.id, m.nom]));
  if (!noms.has(college)) return NextResponse.json({ error: 'Collège introuvable.' }, { status: 404 });

  // La médecine générale et ses sous-collèges dépassent les 1 000 lignes.
  const lignes = await fetchAllRows<{ id: string; titre: string; matiere_id: string; order_index: number | null }>((from, to) => a
    .from('cours').select('id, titre, matiere_id, order_index')
    .in('matiere_id', [...noms.keys()])
    .order('matiere_id').order('order_index', { ascending: true }).order('id').range(from, to));
  const items = lignes.map((c) => ({
    id: c.id,
    titre: c.titre,
    // Sous-collège : son nom aide à s'y retrouver (MG → Pédiatrie…).
    sousCollege: c.matiere_id === college ? null : noms.get(c.matiere_id) ?? null,
  }));
  return NextResponse.json({ items });
}
