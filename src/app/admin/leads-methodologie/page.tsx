import { BookDown } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { LeadsTable, type Lead } from '@/components/admin/leads-table';

export const dynamic = 'force-dynamic';

export default async function LeadsMethodologiePage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from('guide_leads')
    .select('*')
    .order('created_at', { ascending: false });

  const leads = (data ?? []) as unknown as Lead[];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <BookDown className="h-5 w-5 text-(--color-primary)" />
          Leads Méthodologie
        </h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Liste de toutes les personnes ayant téléchargé le Guide Méthodologie EVC 2026.
        </p>
      </header>

      <LeadsTable initialLeads={leads} />
    </main>
  );
}
