import { EDN_FACULTE_ID } from '@/lib/data/faculte';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { ExerciseImportWizard, type ImportHistoryRow, type ImportCollege, type ImportArenaContext } from '@/components/admin/exercise-import-wizard';

export const metadata = { title: 'Import d’exercices' };
export const dynamic = 'force-dynamic';
// L'analyse vit dans /api/admin/import-exercices/analyse (300 s) ; ce délai
// couvre la publication d'un import qui écrit beaucoup de questions.
export const maxDuration = 300;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Accroche EVC Arena (`?arena=<id de manche>`) : l'outil reste identique, on
 * lui passe seulement la manche cible pour que la série publiée y soit copiée.
 */
async function chargerContexteArena(a: { from: (table: string) => any }, roundId: string | undefined): Promise<ImportArenaContext | null> {
  if (!roundId || !UUID.test(roundId)) return null;
  const { data: round } = await a.from('arena_rounds').select('id, number, tournament_id').eq('id', roundId).maybeSingle();
  if (!round) return null;
  const { data: t } = await a.from('arena_tournaments').select('id, title, specialty_id').eq('id', round.tournament_id).maybeSingle();
  if (!t) return null;
  return { roundId: round.id, tournamentId: t.id, tournamentTitle: t.title, roundNumber: round.number, specialtyId: t.specialty_id ?? null };
}

export default async function AdminExerciseImportPage({ searchParams }: { searchParams: Promise<{ arena?: string }> }) {
  await requireAdmin();
  const { arena: arenaRoundId } = await searchParams;
  const admin = createAdminClient();
  const a = admin as unknown as { from: (table: string) => any };
  const [{ data: matieres }, { data: imports }, arena] = await Promise.all([
    a.from('matieres').select('id, nom, parent_matiere_id, order_index, cours(id, titre, order_index), semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID).order('order_index'),
    a.from('exercise_imports').select('id, title, voie, format, source_mode, college_id, allowed_offers, status, estimated_price_cents, billed_price_cents, result, warnings, error_message, created_at, published_serie_id, cours(titre)').order('created_at', { ascending: false }).limit(30),
    chargerContexteArena(a, arenaRoundId),
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
  return <ExerciseImportWizard colleges={colleges} history={rows} arena={arena ?? undefined} />;
}
