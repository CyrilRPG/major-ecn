import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { BILLING_EUR, GEN_FEATURE, billingLinePrices } from '@/lib/ai/cost';
import { FacturationDashboard, type CourseLine } from '@/components/admin/facturation-dashboard';

export const metadata = { title: 'Facturation IA' };
export const dynamic = 'force-dynamic';

/** Facturation IA — calculé en direct sur le contenu disponible. */
export default async function AdminFacturationPage() {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const [coursRes, aiRes, examCountRes, qrocCountRes, genExamRes, genInterroRes] = await Promise.all([
    a.rpc('admin_facturation_lines'),
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', 'assistant_chat').eq('status', 'success'),
    // Épreuves blanches : facturées 1 c / épreuve + 0,5 c / QROC.
    a.from('mock_exams').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
    a.from('mock_exam_questions').select('id', { count: 'exact', head: true }).eq('format', 'qroc'),
    // Générations IA facturées au forfait (uniquement les réussites).
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', GEN_FEATURE.epreuve).eq('status', 'success'),
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', GEN_FEATURE.interrogation).eq('status', 'success'),
  ]);
  const examsCount = examCountRes.count ?? 0;
  const qrocCount = qrocCountRes.count ?? 0;
  const generations = { epreuves: genExamRes.count ?? 0, interrogations: genInterroRes.count ?? 0 };

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
      return {
        id: c.line_id as string,
        titre: c.titre as string,
        matiere: (c.matiere_nom as string) ?? '—',
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

  return (
    <FacturationDashboard
      lines={lines}
      aiResponses={aiResponses}
      epreuves={{ exams: examsCount, qroc: qrocCount }}
      generations={generations}
      tarifs={{
        fiche: BILLING_EUR.fiche,
        qcm: BILLING_EUR.qcm_per_course,
        flash: BILLING_EUR.flashcards_per_course,
        ia: BILLING_EUR.ai_response,
      }}
    />
  );
}
