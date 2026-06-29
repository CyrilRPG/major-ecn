import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { BILLING_EUR } from '@/lib/ai/cost';
import { FacturationDashboard, type CourseLine } from '@/components/admin/facturation-dashboard';

export const metadata = { title: 'Facturation IA' };
export const dynamic = 'force-dynamic';

/** Facturation IA — calculé en direct sur le contenu disponible. */
export default async function AdminFacturationPage() {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const [coursRes, aiRes] = await Promise.all([
    a.rpc('admin_facturation_lines'),
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', 'assistant_chat').eq('status', 'success'),
  ]);

  const lines: CourseLine[] = (coursRes.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => {
      const decouverte = !!c.is_decouverte || c.matiere_nom === 'Découverte';
      return {
        id: c.cours_id as string,
        titre: c.titre as string,
        matiere: (c.matiere_nom as string) ?? '—',
        fiche: !!c.has_fiche,
        // Règle Découverte : on ne facture que la fiche.
        qcm: !decouverte && !!c.has_qcm,
        flash: !decouverte && !!c.has_flash,
        decouverte,
      };
    },
  );

  const aiResponses = aiRes.count ?? 0;

  return (
    <FacturationDashboard
      lines={lines}
      aiResponses={aiResponses}
      tarifs={{
        fiche: BILLING_EUR.fiche,
        qcm: BILLING_EUR.qcm_per_course,
        flash: BILLING_EUR.flashcards_per_course,
        ia: BILLING_EUR.ai_response,
      }}
    />
  );
}
