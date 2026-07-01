import { Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { UnifiedLeadsTable, type UnifiedLead } from '@/components/admin/unified-leads-table';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [guideRes, diagRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('guide_leads').select('*').order('created_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('diagnostic_leads').select('*').order('created_at', { ascending: false }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guideLeads: UnifiedLead[] = (guideRes.data ?? []).map((l: any) => ({
    id: l.id,
    source: 'methodologie' as const,
    first_name: l.first_name ?? '',
    last_name: l.last_name ?? '',
    email: l.email,
    phone: l.phone ?? '',
    specialty: l.specialty ?? null,
    voie: l.voie ?? null,
    active: l.active ?? true,
    created_at: l.created_at,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diagLeads: UnifiedLead[] = (diagRes.data ?? []).map((l: any) => ({
    id: l.id,
    source: 'diagnostic' as const,
    first_name: l.first_name ?? '',
    last_name: l.last_name ?? '',
    email: l.email,
    phone: l.phone ?? '',
    specialty: l.specialty ?? null,
    voie: l.voie ?? null,
    active: l.active ?? true,
    created_at: l.created_at,
    score: l.score,
    max_score: l.max_score,
    profile_label: l.profile_label,
    profile_key: l.profile_key,
    session_evc: l.session_evc,
    obstacle: l.obstacle,
  }));

  const leads = [...guideLeads, ...diagLeads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <Users className="h-5 w-5 text-(--color-primary)" />
          Leads
        </h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Leads Méthodologie (Guide EVC) et Leads Diagnostic (Profil EVC) réunis. Filtrez par source et désactivez les leads traités.
        </p>
      </header>

      <UnifiedLeadsTable initialLeads={leads} />
    </main>
  );
}
