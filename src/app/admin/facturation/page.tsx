import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { BILLING_EUR, GEN_FEATURE, ODONTOLOGIE_COLLEGE_ID, billingLinePrices } from '@/lib/ai/cost';
import { FacturationDashboard, type CourseLine, type ExerciseImportBillingLine } from '@/components/admin/facturation-dashboard';

export const metadata = { title: 'Facturation IA' };
export const dynamic = 'force-dynamic';

/** Facturation IA — calculé en direct sur le contenu disponible. */
export default async function AdminFacturationPage() {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const [coursRes, aiRes, examCountRes, qrocCountRes, genExamRes, genInterroRes, importsRes, odontoRes] = await Promise.all([
    a.rpc('admin_facturation_lines', { p_faculte_id: EDN_FACULTE_ID }),
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', 'assistant_chat').eq('status', 'success'),
    // Épreuves blanches : facturées 1 c / épreuve + 0,5 c / QROC.
    a.from('mock_exams').select('id', { count: 'exact', head: true }).neq('status', 'archived').is('cours_id', null),
    a.from('mock_exam_questions').select('id', { count: 'exact', head: true }).eq('format', 'qroc'),
    // Générations IA facturées au forfait (uniquement les réussites).
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', GEN_FEATURE.epreuve).eq('status', 'success'),
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', GEN_FEATURE.interrogation).eq('status', 'success'),
    a.from('exercise_imports').select('id, title, billed_price_cents, result, created_at').in('status', ['ready', 'published', 'cancelled']).not('billed_price_cents', 'is', null),
    // Collège Odontologie et ses sous-collèges : la RPC renvoie le nom du
    // sous-collège, la facture les regroupe sous le collège parent.
    a.from('matieres').select('id, nom').or(`id.eq.${ODONTOLOGIE_COLLEGE_ID},parent_matiere_id.eq.${ODONTOLOGIE_COLLEGE_ID}`),
  ]);
  const examsCount = examCountRes.count ?? 0;
  const qrocCount = qrocCountRes.count ?? 0;
  const generations = { epreuves: genExamRes.count ?? 0, interrogations: genInterroRes.count ?? 0 };
  const odontoMatieres = (odontoRes.data ?? []) as { id: string; nom: string }[];
  const odontoNom = odontoMatieres.find((m) => m.id === ODONTOLOGIE_COLLEGE_ID)?.nom ?? 'Odontologie';
  const odontoSousColleges = new Set(odontoMatieres.filter((m) => m.id !== ODONTOLOGIE_COLLEGE_ID).map((m) => m.nom));

  const lines: CourseLine[] = (coursRes.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => {
      const decouverte = !!c.is_decouverte || c.matiere_nom === 'Découverte';
      const line = {
        is_mg: !!c.is_mg,
        is_decouverte: decouverte,
        has_fiche: !!c.has_fiche,
        n_series: Number(c.n_series ?? 0),
        n_flash: Number(c.n_flash ?? 0),
      };
      const p = billingLinePrices(line);
      const matiere = (c.matiere_nom as string) ?? '—';
      return {
        id: c.line_id as string,
        titre: c.titre as string,
        matiere: odontoSousColleges.has(matiere) ? odontoNom : matiere,
        fichePrice: p.fiche,
        qcmPrice: p.qcm,
        flashPrice: p.flash,
        nSeries: line.n_series,
        nFlash: line.n_flash,
        isMg: line.is_mg,
        decouverte,
      };
    },
  );

  const aiResponses = aiRes.count ?? 0;
  const exerciseImports: ExerciseImportBillingLine[] = ((importsRes.data ?? []) as Array<{ id: string; title: string; billed_price_cents: number; result: { questions?: unknown[] } | null; created_at: string }>)
    .map((row) => ({ id: row.id, title: row.title, cents: row.billed_price_cents, questions: row.result?.questions?.length ?? 0, createdAt: row.created_at }));

  return (
    <FacturationDashboard
      lines={lines}
      aiResponses={aiResponses}
      epreuves={{ exams: examsCount, qroc: qrocCount }}
      generations={generations}
      exerciseImports={exerciseImports}
      tarifs={{
        fiche: BILLING_EUR.fiche,
        qcm: BILLING_EUR.qcm_per_course,
        flash: BILLING_EUR.flashcards_per_course,
        ia: BILLING_EUR.ai_response,
      }}
    />
  );
}
