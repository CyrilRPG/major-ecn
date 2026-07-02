'use client';

import { useState, useMemo, useTransition } from 'react';
import { Loader2, Power, BookDown, BarChart3, Search, X } from 'lucide-react';

export type UnifiedLead = {
  id: string;
  source: 'methodologie' | 'diagnostic';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialty: string | null;
  voie: string | null;
  active: boolean;
  created_at: string;
  // Spécifiques diagnostic
  score?: number | null;
  max_score?: number | null;
  profile_label?: string | null;
  profile_key?: string | null;
  session_evc?: string | null;
  obstacle?: string | null;
};

type Filter = 'all' | 'methodologie' | 'diagnostic';

const PROFILE_COLORS: Record<string, { bg: string; fg: string }> = {
  construire: { bg: '#FDE7E9', fg: '#C0112E' },
  renforcer: { bg: '#FEF0E4', fg: '#B45309' },
  solide: { bg: '#E7F6EC', fg: '#16793C' },
  avancee: { bg: '#E5EDFF', fg: '#1D4ED8' },
};

export function UnifiedLeadsTable({ initialLeads }: { initialLeads: UnifiedLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const toggle = (lead: UnifiedLead) => {
    setTogglingId(lead.id);
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/toggle-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: lead.id, active: !lead.active, source: lead.source }),
        });
        if (res.ok) {
          setLeads((prev) => prev.map((l) => (l.id === lead.id && l.source === lead.source ? { ...l, active: !lead.active } : l)));
        }
      } catch { /* ignore */ }
      setTogglingId(null);
    });
  };

  const filtered = useMemo(() => {
    let list = filter === 'all' ? leads : leads.filter((l) => l.source === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((l) =>
        `${l.first_name} ${l.last_name} ${l.email} ${l.phone ?? ''} ${l.specialty ?? ''} ${l.profile_label ?? ''}`
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [leads, filter, search]);

  const counts = useMemo(() => ({
    all: leads.length,
    methodologie: leads.filter((l) => l.source === 'methodologie').length,
    diagnostic: leads.filter((l) => l.source === 'diagnostic').length,
  }), [leads]);

  const activeCount = filtered.filter((l) => l.active).length;

  const TABS: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: counts.all },
    { key: 'methodologie', label: 'Méthodologie', count: counts.methodologie },
    { key: 'diagnostic', label: 'Diagnostic', count: counts.diagnostic },
  ];

  return (
    <>
      {/* Recherche */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un lead (nom, e-mail, téléphone, spécialité…)"
            className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) py-2.5 pl-9 pr-9 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-(--color-ink-muted) transition-colors hover:bg-(--color-surface-soft) hover:text-(--color-ink)"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
              filter === t.key
                ? 'bg-(--color-primary) text-white'
                : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:bg-(--color-surface-soft)'
            }`}
          >
            {t.key === 'methodologie' && <BookDown className="h-3.5 w-3.5" />}
            {t.key === 'diagnostic' && <BarChart3 className="h-3.5 w-3.5" />}
            {t.label}
            <span className={`rounded-full px-1.5 text-xs ${filter === t.key ? 'bg-white/25' : 'bg-(--color-surface-soft)'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-4">
        <p className="text-sm font-bold text-(--color-ink-soft)">
          {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
        </p>
        <span className="text-xs text-(--color-ink-muted)">
          {activeCount} actif{activeCount !== 1 ? 's' : ''} · {filtered.length - activeCount} désactivé{filtered.length - activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
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
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Source</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Profil / Score</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Date</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Actif</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const pc = l.profile_key ? PROFILE_COLORS[l.profile_key] : null;
                return (
                  <tr
                    key={`${l.source}-${l.id}`}
                    className={`border-b border-(--color-border) last:border-b-0 transition-colors ${l.active ? 'hover:bg-(--color-surface-soft)' : 'bg-gray-50 opacity-50'}`}
                  >
                    <td className={`whitespace-nowrap px-4 py-3 font-medium ${l.active ? 'text-(--color-ink)' : 'text-gray-400 line-through'}`}>
                      {l.first_name} {l.last_name}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-soft)' : 'text-gray-400'}`}>
                      <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-soft)' : 'text-gray-400'}`}>{l.phone || '—'}</td>
                    <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-soft)' : 'text-gray-400'}`}>{l.specialty ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {l.source === 'diagnostic' ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: '#EDE7FA', color: '#6D28D9' }}>
                          <BarChart3 className="h-3 w-3" /> Diagnostic
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: '#E5F1FF', color: '#1E4D8B' }}>
                          <BookDown className="h-3 w-3" /> Méthodologie
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {l.source === 'diagnostic' && l.profile_label ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={pc ? { background: pc.bg, color: pc.fg } : {}}>
                            {l.profile_label}
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-(--color-ink-muted)">{l.score}/{l.max_score}</span>
                        </span>
                      ) : (
                        <span className="text-(--color-ink-muted)">—</span>
                      )}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 ${l.active ? 'text-(--color-ink-muted)' : 'text-gray-400'}`}>
                      {new Date(l.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(l)}
                        disabled={togglingId === l.id}
                        className="group mx-auto flex h-8 w-8 items-center justify-center rounded-lg border transition-all disabled:opacity-50"
                        style={l.active ? { background: '#E7F6EC', borderColor: '#86EFAC', color: '#16793C' } : { background: '#FDE7E9', borderColor: '#FCA5A5', color: '#C0001F' }}
                        title={l.active ? 'Désactiver ce lead' : 'Réactiver ce lead'}
                      >
                        {togglingId === l.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
