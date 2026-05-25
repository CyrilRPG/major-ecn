import { ClipboardList, Layers3, Receipt } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Facturation IA' };

type Row = {
  id: string;
  created_at: string;
  cours_titre: string | null;
  kind: 'flashcards' | 'qcm';
  items_count: number;
  price_eur: number;
  status: 'success' | 'failed' | 'partial';
};

export default async function AdminFacturationPage() {
  await requireAdmin();
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('ai_generations')
    .select('id, created_at, cours_titre, kind, items_count, price_eur, status')
    .order('created_at', { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Row[];

  const totals = rows.reduce(
    (acc, r) => {
      if (r.status === 'failed') return acc;
      acc.price_eur += Number(r.price_eur) || 0;
      acc.items += r.items_count || 0;
      if (r.kind === 'flashcards') acc.flashcards++;
      else acc.qcm++;
      return acc;
    },
    { price_eur: 0, items: 0, flashcards: 0, qcm: 0 },
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <Receipt className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
            Facturation IA
          </h1>
          <p className="text-sm text-(--color-ink-soft)">
            Total à régler pour les générations IA effectuées (Flashcards 5 € · QCM 4×5 2 €).
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <Kpi label="À régler" value={`${totals.price_eur.toFixed(2)} €`} Icon={Receipt} primary />
        <Kpi label="Flashcards générées" value={`${totals.flashcards} session${totals.flashcards > 1 ? 's' : ''}`} Icon={Layers3} />
        <Kpi label="QCM générés" value={`${totals.qcm} session${totals.qcm > 1 ? 's' : ''}`} Icon={ClipboardList} />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-(--color-ink-soft)">
            Aucune génération IA pour l’instant. Lancez-en une depuis l’admin contenu d’un cours.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-(--color-surface-soft) text-xs uppercase tracking-wider text-(--color-ink-soft)">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Cours</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="hidden px-4 py-3 text-right font-semibold md:table-cell">Items générés</th>
                  <th className="px-4 py-3 text-right font-semibold">Prix</th>
                  <th className="px-4 py-3 text-right font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 text-xs text-(--color-ink-soft) whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="truncate text-(--color-ink)">{r.cours_titre ?? '—'}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
                        (r.kind === 'flashcards'
                          ? 'bg-(--color-primary-soft) text-(--color-primary)'
                          : 'bg-(--color-surface-soft) text-(--color-ink-soft) border border-(--color-border)')
                      }>
                        {r.kind === 'flashcards' ? <Layers3 className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
                        {r.kind === 'flashcards' ? 'Flashcards' : 'QCM'}
                      </span>
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-(--color-ink) md:table-cell">{r.items_count}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-(--color-ink)">{Number(r.price_eur).toFixed(2)} €</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
                        (r.status === 'success'
                          ? 'bg-[color-mix(in_srgb,#2E8B57_12%,var(--color-surface))] text-[#1F6B43]'
                          : r.status === 'partial'
                          ? 'bg-[color-mix(in_srgb,#F59E0B_18%,var(--color-surface))] text-[#8a4a00]'
                          : 'bg-[color-mix(in_srgb,var(--color-danger)_15%,var(--color-surface))] text-(--color-danger)')
                      }>
                        {r.status === 'success' ? 'OK' : r.status === 'partial' ? 'Partiel' : 'Échec'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({
  label, value, Icon, primary = false,
}: { label: string; value: string; Icon: typeof Receipt; primary?: boolean }) {
  return (
    <div className={
      'relative overflow-hidden rounded-2xl border p-4 shadow-(--shadow-soft) ' +
      (primary
        ? 'border-(--color-primary)/30 bg-(--color-primary-soft)'
        : 'border-(--color-border) bg-(--color-surface)')
    }>
      <div className="flex items-start gap-3">
        <span className={
          'flex h-9 w-9 items-center justify-center rounded-xl ' +
          (primary
            ? 'bg-(--color-primary) text-white'
            : 'bg-(--color-primary-soft) text-(--color-primary)')
        }>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">{label}</p>
          <p className="mt-0.5 font-display text-xl font-bold tracking-tight tabular-nums text-(--color-ink)">{value}</p>
        </div>
      </div>
    </div>
  );
}
