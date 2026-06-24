'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity, Atom, BookOpen, Bone, ChevronRight,
  HeartPulse, Microscope, Pill, Stethoscope,
} from 'lucide-react';
import { CodeGate } from '@/components/prive/code-gate';
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
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setAuthed(localStorage.getItem('prive-auth') === 'rattrapagesrelou');
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!authed) {
    return <CodeGate onSuccess={() => setAuthed(true)} />;
  }

  return (
    <PriveShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-black tracking-tight text-[#0F1F4D]">
            Espace Privé
          </h1>
          <p className="mt-1 text-[15px] text-[#52607A]">
            Vos cours, fiches, flashcards et annales — UE5
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {PRIVE_MATIERES.map((m) => {
            const Icon = ICON_MAP[m.icon] ?? Activity;
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${m.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: m.color }} />
                  </div>
                  <h2 className="text-[18px] font-extrabold text-[#0F1F4D]">{m.nom}</h2>
                </div>

                <div className="space-y-1.5">
                  {m.cours.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/cyrilwisa/cours/${c.slug}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] text-[#3A4556] transition-colors hover:bg-gray-50 hover:text-[#0F1F4D]"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="flex-1">{c.titre}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </Link>
                  ))}
                </div>

                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-[12px] text-gray-400">
                    {m.cours.length} cours
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
