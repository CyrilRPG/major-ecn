import { EDN_FACULTE_ID } from '@/lib/data/faculte';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { ExerciseImportWizard, type ImportHistoryRow, type ImportCollege } from '@/components/admin/exercise-import-wizard';

export const metadata = { title: 'Import d’exercices' };
export const dynamic = 'force-dynamic';
// L'analyse vit dans /api/admin/import-exercices/analyse (300 s) ; ce délai
// couvre la publication d'un import qui écrit beaucoup de questions.
export const maxDuration = 300;

export default async function AdminExerciseImportPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const a = admin as unknown as { from: (table: string) => any };
  const [{ data: matieres }, { data: imports }] = await Promise.all([
    a.from('matieres').select('id, nom, parent_matiere_id, order_index, cours(id, titre, order_index), semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID).order('order_index'),
    a.from('exercise_imports').select('id, title, voie, format, source_mode, college_id, allowed_offers, status, estimated_price_cents, billed_price_cents, result, warnings, error_message, created_at, published_serie_id, cours(titre)').order('created_at', { ascending: false }).limit(30),
  ]);
  const colleges: ImportCollege[] = ((matieres ?? []) as any[])
    .filter((m) => (m.cours ?? []).length > 0)
    .map((m) => ({ id: m.id, name: m.nom, parentId: m.parent_matiere_id, courses: (m.cours ?? []).sort((x: any, y: any) => x.order_index - y.order_index).map((c: any) => ({ id: c.id, title: c.titre })) }));
  const collegeNames = new Map(colleges.map((college) => [college.id, college.name]));
  const rows: ImportHistoryRow[] = ((imports ?? []) as any[]).map((r) => ({
    id: r.id, title: r.title, voie: r.voie, format: r.format, status: r.status, estimatedPriceCents: r.estimated_price_cents,
    billedPriceCents: r.billed_price_cents, result: r.result, warnings: r.warnings ?? [], error: r.error_message, createdAt: r.created_at,
    courseTitle: r.cours?.titre ?? 'Item inconnu', collegeName: collegeNames.get(r.college_id) ?? 'Collège inconnu', serieId: r.published_serie_id,
  }));
  return <ExerciseImportWizard colleges={colleges} history={rows} />;
}
