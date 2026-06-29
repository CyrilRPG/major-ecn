'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CrmGeneral, type GeneralStudent, type GeneralStats, type College } from './crm-general';
import { CrmPanel } from './crm-panel';

type Tab = 'general' | 'transversal';

type CrmPanelProps = Parameters<typeof CrmPanel>[0];

export function CrmTabs({
  generalStudents,
  generalStats,
  colleges,
  transversalStudents,
  transversalStats,
}: {
  generalStudents: GeneralStudent[];
  generalStats: GeneralStats;
  colleges: College[];
  transversalStudents: CrmPanelProps['students'];
  transversalStats: CrmPanelProps['stats'];
}) {
  const [tab, setTab] = useState<Tab>('general');

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {([
            { key: 'general' as const, label: 'Général' },
            { key: 'transversal' as const, label: 'Révisions transversales' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'general' ? (
        <CrmGeneral students={generalStudents} stats={generalStats} colleges={colleges} />
      ) : (
        <CrmPanel students={transversalStudents} stats={transversalStats} />
      )}
    </>
  );
}
