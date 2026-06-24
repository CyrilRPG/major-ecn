import { BookDown, Download, Mail, Phone, User } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialty: string | null;
  voie: string | null;
  ab_variant: string | null;
  cta_variant: string | null;
  created_at: string;
};

export default async function LeadsMethodologiePage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, count } = await admin
    .from('guide_leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  const leads = (data ?? []) as unknown as Lead[];
  const total = count ?? leads.length;

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

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-(--color-ink-soft)">
          {total} lead{total !== 1 ? 's' : ''}
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-10 text-center text-sm text-(--color-ink-soft)">
          Aucun lead pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-(--color-border)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-surface-soft)">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">E-mail</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Téléphone</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Spécialité</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Voie</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-(--color-border) last:border-b-0 hover:bg-(--color-surface-soft)">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-(--color-ink)">
                    {l.first_name} {l.last_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-(--color-ink-soft)">
                    <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-(--color-ink-soft)">{l.phone}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-(--color-ink-soft)">{l.specialty ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-(--color-ink-soft)">{l.voie ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-(--color-ink-muted)">
                    {new Date(l.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
