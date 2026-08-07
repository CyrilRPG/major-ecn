'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, ChevronRight, FileText, Loader2, Save, TrendingUp, CalendarDays } from 'lucide-react';
import {
  saveGenericSection,
  loadGenericSection,
  type GenericSectionKey,
  type GenericEntry,
} from './generic-actions';

type College = { id: string; nom: string };

const SECTIONS: {
  key: GenericSectionKey;
  label: string;
  description: string;
  icon: typeof CalendarCheck;
  color: string;
}[] = [
  {
    key: 'countdown',
    label: 'Compte à rebours',
    description: "Date de l'épreuve — affiche un compte à rebours J−X sur l'accueil",
    icon: CalendarCheck,
    color: '#C0112E',
  },
  {
    key: 'inscription',
    label: "Période d'inscription",
    description: "Texte décrivant les dates d'inscription",
    icon: FileText,
    color: '#1E40AF',
  },
  {
    key: 'postes',
    label: 'Nombre de postes',
    description: 'Nombre de postes par voie (externe / interne)',
    icon: TrendingUp,
    color: '#16A34A',
  },
  {
    key: 'dates_cles',
    label: 'Dates clés',
    description: 'Informations importantes (résultats, oral, etc.)',
    icon: CalendarDays,
    color: '#D97706',
  },
];

const inputCls =
  'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)';

export function GenericSections({ colleges }: { colleges: College[] }) {
  const [openKey, setOpenKey] = useState<GenericSectionKey | null>(null);

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold uppercase tracking-wider text-(--color-ink-soft)">
        Sections génériques (par collège)
      </h2>
      <p className="text-xs text-(--color-ink-muted)">
        Ouvre une section puis remplis un champ par collège. Ce qui reste vide ne
        s'affiche pas.
      </p>

      {SECTIONS.map((s) => {
        const Icon = s.icon;
        const isOpen = openKey === s.key;
        return (
          <div
            key={s.key}
            className="rounded-2xl border border-(--color-border) bg-(--color-surface)"
          >
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : s.key)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${s.color}18`, color: s.color }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-(--color-ink)">{s.label}</p>
                <p className="text-[11px] text-(--color-ink-muted)">{s.description}</p>
              </div>
              <ChevronRight
                className={`h-4 w-4 shrink-0 text-(--color-ink-soft) transition-transform ${isOpen ? 'rotate-90' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="border-t border-(--color-border) p-4">
                <SectionEditor
                  sectionKey={s.key}
                  colleges={colleges}
                />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function SectionEditor({
  sectionKey,
  colleges,
}: {
  sectionKey: GenericSectionKey;
  colleges: College[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Map<string, Record<string, unknown>>>(new Map());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGenericSection(sectionKey).then((rows) => {
      if (cancelled) return;
      const m = new Map<string, Record<string, unknown>>();
      for (const r of rows) m.set(r.college_id, r.data);
      setValues(m);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [sectionKey]);

  const update = (collegeId: string, field: string, value: unknown) => {
    setValues((prev) => {
      const m = new Map(prev);
      const current = m.get(collegeId) ?? {};
      m.set(collegeId, { ...current, [field]: value });
      return m;
    });
    setSaved(false);
  };

  const save = () => {
    setSaved(false);
    const entries: GenericEntry[] = colleges.map((c) => ({
      college_id: c.id,
      data: values.get(c.id) ?? {},
    }));
    start(async () => {
      await saveGenericSection(sectionKey, entries);
      setSaved(true);
      router.refresh();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-(--color-ink-muted)" />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {colleges.map((c) => {
          const data = values.get(c.id) ?? {};
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-sand-100)/30 px-3 py-2"
            >
              <span className="w-40 shrink-0 truncate text-xs font-bold text-(--color-ink)">
                {c.nom}
              </span>
              <div className="min-w-0 flex-1">
                <SectionFields
                  sectionKey={sectionKey}
                  data={data}
                  onChange={(field, val) => update(c.id, field, val)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && (
          <span className="text-xs font-bold text-[#16A34A]">Enregistré</span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white shadow-sm hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function SectionFields({
  sectionKey,
  data,
  onChange,
}: {
  sectionKey: GenericSectionKey;
  data: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  switch (sectionKey) {
    case 'countdown':
      return (
        <input
          type="date"
          value={(data.target_date as string) ?? ''}
          onChange={(e) => onChange('target_date', e.target.value)}
          className={inputCls}
          placeholder="Date de l'épreuve"
        />
      );
    case 'inscription':
      return (
        <input
          type="text"
          value={(data.body as string) ?? ''}
          onChange={(e) => onChange('body', e.target.value)}
          className={inputCls}
          placeholder="Ex : Du 17 juin 14h au 16 juillet 17h"
        />
      );
    case 'postes':
      return (
        <div className="flex gap-2">
          <input
            type="number"
            value={(data.externe as number) ?? ''}
            onChange={(e) =>
              onChange('externe', e.target.value ? Number(e.target.value) : '')
            }
            className={inputCls}
            placeholder="Externe"
            min={0}
          />
          <input
            type="number"
            value={(data.interne as number) ?? ''}
            onChange={(e) =>
              onChange('interne', e.target.value ? Number(e.target.value) : '')
            }
            className={inputCls}
            placeholder="Interne"
            min={0}
          />
        </div>
      );
    case 'dates_cles':
      return (
        <input
          type="text"
          value={(data.body as string) ?? ''}
          onChange={(e) => onChange('body', e.target.value)}
          className={inputCls}
          placeholder="Ex : Résultats le 15 mars 2027"
        />
      );
  }
}
