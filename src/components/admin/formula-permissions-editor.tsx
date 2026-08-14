'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Save, X } from 'lucide-react';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';

type Props = {
  initialPermissions: Record<string, unknown>[];
  offerLabels: Record<string, string>;
  contentLabels: Record<string, string>;
  contentKeys: string[];
  offers: string[];
};

export function FormulaPermissionsEditor({
  initialPermissions,
  offerLabels,
  contentLabels,
  contentKeys,
  offers,
}: Props) {
  const router = useRouter();
  const [permissions, setPermissions] = useState(initialPermissions);
  const [saving, startSaving] = useTransition();
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const toggle = (offerIdx: number, key: string) => {
    setPermissions((prev) => {
      const next = [...prev];
      next[offerIdx] = { ...next[offerIdx], [key]: !next[offerIdx][key] };
      return next;
    });
    setStatus('idle');
  };

  const save = () => {
    startSaving(async () => {
      try {
        const res = await fetchAuthentifie('/api/admin/formula-permissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions }),
        });
        if (!res.ok) {
          setStatus('error');
          return;
        }
        setStatus('saved');
        router.refresh();
      } catch {
        setStatus('error');
      }
    });
  };

  const OFFER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    essentiel: { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF' },
    intensif: { bg: '#FEF3E2', border: '#FCD34D', text: '#92400E' },
    approfondi: { bg: '#F3EAFF', border: '#C4B5FD', text: '#5B21B6' },
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border)">
              <th className="sticky left-0 z-10 bg-(--color-surface) px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--color-ink-muted)">
                Contenu
              </th>
              {offers.map((offer) => {
                const c = OFFER_COLORS[offer] ?? { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151' };
                return (
                  <th key={offer} className="px-4 py-3 text-center">
                    <span
                      className="inline-block rounded-full border px-3 py-1 text-xs font-bold"
                      style={{ background: c.bg, borderColor: c.border, color: c.text }}
                    >
                      {offerLabels[offer] ?? offer}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {contentKeys.map((key, ki) => (
              <tr
                key={key}
                className={ki % 2 === 0 ? 'bg-(--color-surface)' : 'bg-(--color-surface-soft)'}
              >
                <td className="sticky left-0 z-10 px-4 py-3 font-medium text-(--color-ink)" style={{ background: 'inherit' }}>
                  {contentLabels[key] ?? key}
                </td>
                {offers.map((offer, oi) => {
                  const val = !!permissions[oi]?.[key];
                  return (
                    <td key={offer} className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(oi, key)}
                        className="group relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg border transition-all focus-ring"
                        style={
                          val
                            ? { background: '#E7F6EC', borderColor: '#86EFAC', color: '#16793C' }
                            : { background: '#FDE7E9', borderColor: '#FCA5A5', color: '#C0001F' }
                        }
                        aria-label={`${contentLabels[key]} — ${offerLabels[offer]} : ${val ? 'Activé' : 'Désactivé'}`}
                      >
                        {val ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.5)] transition-all hover:scale-[1.02] disabled:opacity-60"
          style={{ background: 'linear-gradient(90deg, #E4002B 0%, #F97316 100%)' }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
        {status === 'saved' && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#16793C]">
            <Check className="h-4 w-4" /> Permissions enregistrées
          </span>
        )}
        {status === 'error' && (
          <span className="text-sm font-semibold text-[#C0001F]">
            Erreur lors de l'enregistrement
          </span>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-(--color-ink-muted)">Légende</p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-(--color-ink-soft)">
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded border" style={{ background: '#E7F6EC', borderColor: '#86EFAC', color: '#16793C' }}>
              <Check className="h-3 w-3" />
            </span>
            Accessible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded border" style={{ background: '#FDE7E9', borderColor: '#FCA5A5', color: '#C0001F' }}>
              <X className="h-3 w-3" />
            </span>
            Non accessible
          </span>
        </div>
      </div>
    </div>
  );
}
