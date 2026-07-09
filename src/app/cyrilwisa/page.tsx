'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity, Atom, BookOpen, Bone, ChevronRight,
  HeartPulse, Microscope, Pill, Stethoscope,
} from 'lucide-react';
import { CodeGate, getPriveAccess, filterMatieresForAccess, type PriveAccess } from '@/components/prive/code-gate';
import { PriveShell } from '@/components/prive/prive-shell';
import { PRIVE_MATIERES } from '@/lib/data/prive-courses';

const ICON_MAP: Record<string, typeof Activity> = {
  activity: Activity,
  stethoscope: Stethoscope,
  'heart-pulse': HeartPulse,
  bone: Bone,
  pill: Pill,
  microscope: Microscope,
  atom: Atom,
};

export default function CyrilwisaPage() {
  const [access, setAccess] = useState<PriveAccess | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setAccess(getPriveAccess());
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!access) {
    return <CodeGate onSuccess={() => setAccess(getPriveAccess())} />;
  }

  const matieres = filterMatieresForAccess(PRIVE_MATIERES, access);

  return (
    <PriveShell access={access}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#0F1F4D]">
            Nephrologie
          </h1>
          <p className="mt-1 text-[15px] text-gray-500">
            Vos cours, fiches, flashcards et QCM
          </p>
        </div>

        {/* Course grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {matieres.map((m) => {
            const Icon = ICON_MAP[m.icon] ?? Activity;
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Card header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: `${m.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: m.color }} />
                    </div>
                    <h2 className="text-[18px] font-extrabold text-[#0F1F4D]">{m.nom}</h2>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-semibold text-gray-500">
                    {m.cours.length}
                  </span>
                </div>

                {/* Course list */}
                <div className="space-y-1">
                  {m.cours.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/cyrilwisa/cours/${c.slug}`}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#0F1F4D]"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C0112E]/40 group-hover:bg-[#C0112E]" />
                      <span className="flex-1">{c.titre}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-[#C0112E]" />
                    </Link>
                  ))}
                </div>

                {/* Card footer */}
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-[12px] text-gray-400">
                    {m.cours.length} cours disponible{m.cours.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PriveShell>
  );
}
