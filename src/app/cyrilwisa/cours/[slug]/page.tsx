'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileText, HelpCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { CodeGate } from '@/components/prive/code-gate';
import { PriveShell } from '@/components/prive/prive-shell';
import { PriveFicheViewer } from '@/components/prive/prive-fiche';
import { PriveFlashcardSession } from '@/components/prive/prive-flashcards';
import { PriveQcmViewer } from '@/components/prive/prive-annales';
import { getCoursBySlug, getMatiereForCours } from '@/lib/data/prive-courses';
import { getPriveContent } from '@/lib/data/prive-content';

type Tab = 'fiche' | 'qcm' | 'flashcards';

const TABS: { key: Tab; label: string; Icon: typeof BookOpen }[] = [
  { key: 'fiche', label: 'Fiche de cours', Icon: BookOpen },
  { key: 'qcm', label: 'QCM', Icon: HelpCircle },
  { key: 'flashcards', label: 'Flashcards', Icon: Zap },
];

export default function PriveCoursPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('fiche');

  const cours = getCoursBySlug(slug);
  const matiere = cours ? getMatiereForCours(slug) : undefined;
  const content = authed ? getPriveContent(slug) : null;

  useEffect(() => {
    setAuthed(localStorage.getItem('prive-auth') === 'rattrapagesrelou');
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!authed) {
    return <CodeGate onSuccess={() => setAuthed(true)} />;
  }

  if (!cours) {
    return (
      <PriveShell>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-[18px] font-bold text-gray-700">Cours introuvable</p>
            <Link href="/cyrilwisa" className="mt-3 inline-block text-[14px] text-[#C0112E] hover:underline">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </PriveShell>
    );
  }

  return (
    <PriveShell>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-10">
          <Link
            href="/cyrilwisa"
            className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {matiere?.nom ?? 'Retour'}
          </Link>
          <h1 className="text-[22px] font-extrabold tracking-tight text-[#0F1F4D]">
            {cours.titre}
          </h1>
        </div>

        {/* Tab bar */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <nav className="flex gap-1">
            {TABS.map((t) => {
              if (t.key === 'qcm' && !cours.hasAnnales) return null;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[14px] font-medium transition-colors ${
                    active
                      ? 'border-[#C0112E] text-[#C0112E]'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <t.Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      {!content ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <BookOpen className="h-10 w-10 text-gray-300" />
          <p className="text-[15px] font-medium text-gray-500">Contenu en cours de preparation</p>
          <p className="text-[13px] text-gray-400">Les fiches et flashcards de ce cours seront bientot disponibles.</p>
        </div>
      ) : (
        <>
          {tab === 'fiche' && <PriveFicheViewer fiche={content.fiche} titre={cours.titre} />}
          {tab === 'qcm' && <PriveQcmViewer annales={content.annales} titre={cours.titre} />}
          {tab === 'flashcards' && <PriveFlashcardSession cards={content.flashcards} titre={cours.titre} />}
        </>
      )}
    </PriveShell>
  );
}
