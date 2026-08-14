'use client';

import { useState, useTransition } from 'react';
import { Loader2, Power } from 'lucide-react';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';

export type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialty: string | null;
  voie: string | null;
  ab_variant: string | null;
  cta_variant: string | null;
  active: boolean;
  created_at: string;
};

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const toggle = (leadId: string, currentActive: boolean) => {
    setTogglingId(leadId);
    startTransition(async () => {
      try {
        const res = await fetchAvecJetonFrais('/api/admin/toggle-lead', { leadId, active: !currentActive });
        if (res.ok) {
          setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, active: !currentActive } : l)),
          );
        }
      } catch { /* ignore */ }
      setTogglingId(null);
    });
  };

  const activeCount = leads.filter((l) => l.active).length;

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <p className="text-sm font-bold text-(--color-ink-soft)">
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </p>
        <span className="text-xs text-(--color-ink-muted)">
          {activeCount} actif{activeCount !== 1 ? 's' : ''} · {leads.length - activeCount} désactivé{leads.length - activeCount !== 1 ? 's' : ''}
        </span>
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
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Actif</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className={`border-b border-(--color-border) last:border-b-0 transition-colors ${
                    l.active
                      ? 'hover:bg-(--color-surface-soft)'
                      : 'bg-gray-50 opacity-50'
                  }`}
                >
                  <td className={`whitespace-nowrap px-4 py-3 font-medium ${l.active ? 'text-(--color-ink)' : 'text-gray-400 line-through'}`}>
                    {l.first_name} {l.last_name}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-soft)' : 'text-gray-400'}`}>
                    <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a>
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-soft)' : 'text-gray-400'}`}>{l.phone}</td>
                  <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-soft)' : 'text-gray-400'}`}>{l.specialty ?? '—'}</td>
                  <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-soft)' : 'text-gray-400'}`}>{l.voie ?? '—'}</td>
                  <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-muted)' : 'text-gray-400'}`}>
                    {new Date(l.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggle(l.id, l.active)}
                      disabled={togglingId === l.id}
                      className="group mx-auto flex h-8 w-8 items-center justify-center rounded-lg border transition-all disabled:opacity-50"
                      style={
                        l.active
                          ? { background: '#E7F6EC', borderColor: '#86EFAC', color: '#16793C' }
                          : { background: '#FDE7E9', borderColor: '#FCA5A5', color: '#C0001F' }
                      }
                      title={l.active ? 'Désactiver ce lead' : 'Réactiver ce lead'}
                    >
                      {togglingId === l.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
