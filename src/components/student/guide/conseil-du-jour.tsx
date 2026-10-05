'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, CalendarDays, CalendarRange, ClipboardCheck, Gauge, Lightbulb, NotebookPen, PencilRuler, PenLine, RefreshCcw, Star, Target, Trophy, X,
} from 'lucide-react';
import { noterRepereAction } from '@/lib/student/guide-actions';
import type { Conseil, ConseilCle } from '@/lib/student/conseil-core';
import { cn } from '@/lib/utils';

const ICONE: Record<ConseilCle, typeof Lightbulb> = {
  checkup: ClipboardCheck, planning: CalendarRange, priorites: Gauge, ciblee: Target, transversale: RefreshCcw,
  'entrainement-cible': Target, 'epreuve-blanche': PencilRuler, parcours: Trophy, agenda: CalendarDays,
  'questions-revoir': Star, notes: NotebookPen, 'mes-entrainements': PenLine,
};

/**
 * « Le conseil du jour » : une seule suggestion, calculée automatiquement à
 * partir de l'activité de l'élève (lib/student/conseil-core), pour lui faire
 * découvrir la fonctionnalité qui lui sert maintenant. Écartable.
 * `bande` : pleine largeur (téléphone, tablette) ; `carte` : colonne de droite
 * de l'accueil sur ordinateur.
 */
export function ConseilDuJour({ conseil, variante = 'bande', className }: { conseil: Conseil; variante?: 'bande' | 'carte'; className?: string }) {
  const [masque, setMasque] = useState(false);
  const [, start] = useTransition();
  const Icon = ICONE[conseil.cle] ?? Lightbulb;

  // Premier affichage du jour (une fois par appareil) : sert à faire tourner les conseils restés sans effet.
  useEffect(() => {
    const jour = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
    const cle = `mecn_conseil_vu:${conseil.cle}:${jour}`;
    try {
      if (window.localStorage.getItem(cle) === '1') return;
      window.localStorage.setItem(cle, '1');
    } catch {
      /* mode privé : on enregistre quand même */
    }
    void noterRepereAction(`suggestion-vue:${conseil.cle}`);
  }, [conseil.cle]);

  if (masque) return null;
  const ecarter = () => {
    setMasque(true);
    start(async () => { await noterRepereAction(`suggestion-masquee:${conseil.cle}`); });
  };

  const fermer = (
    <button type="button" onClick={ecarter} aria-label="Ne plus me proposer ce conseil" title="Ne plus me proposer ce conseil" className="absolute right-2 top-2 rounded-full p-1.5 text-(--color-ink-muted) transition-colors hover:bg-black/5 hover:text-(--color-ink) focus-ring">
      <X className="h-3.5 w-3.5" />
    </button>
  );

  if (variante === 'carte') {
    return (
      <section aria-labelledby={`conseil-du-jour-${variante}`} className={cn('relative overflow-hidden rounded-3xl border border-[#F6D9DD] bg-[linear-gradient(160deg,#FDF4F5_0%,#FFFFFF_55%,#FFFBEB_100%)] p-5 shadow-(--shadow-soft)', className)}>
        <p className="flex items-center gap-2 pr-6 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#8B0E22]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#8B0E22] shadow-(--shadow-xs) ring-1 ring-[#F6D9DD]"><Icon className="h-4 w-4" aria-hidden /></span>
          Le conseil du jour
        </p>
        <h2 id={`conseil-du-jour-${variante}`} className="mt-3 font-(family-name:--font-jakarta) text-[16px] font-extrabold leading-snug text-[#14254E]">{conseil.titre}</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-(--color-ink-soft)">{conseil.texte}</p>
        <Link href={conseil.href} className="mt-4 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 text-[13px] font-bold text-white shadow-[0_10px_24px_-14px_rgba(228,0,43,0.9)] transition-transform hover:scale-[1.01] focus-ring">
          {conseil.cta} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/mode-emploi" className="mt-2.5 flex items-center justify-center gap-1 text-[12px] font-semibold text-(--color-ink-soft) hover:text-[#C0112E] hover:underline">
          <BookOpen className="h-3.5 w-3.5" aria-hidden /> Mode d’emploi de la plateforme
        </Link>
        {fermer}
      </section>
    );
  }

  return (
    <section aria-labelledby={`conseil-du-jour-${variante}`} className={cn('relative flex flex-col gap-3 rounded-2xl border border-[#F6D9DD] bg-[linear-gradient(120deg,#FDF4F5_0%,#FFFFFF_60%,#FFFBEB_100%)] px-4 py-3.5 shadow-(--shadow-soft) sm:flex-row sm:items-center sm:gap-4 sm:px-5', className)}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#8B0E22] shadow-(--shadow-xs) ring-1 ring-[#F6D9DD]">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pr-6 sm:pr-0">
        <p className="flex flex-wrap items-center gap-x-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#8B0E22]">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden /> Le conseil du jour
        </p>
        <h2 id={`conseil-du-jour-${variante}`} className="mt-0.5 font-(family-name:--font-jakarta) text-[15px] font-extrabold text-[#14254E]">{conseil.titre}</h2>
        <p className="mt-0.5 text-[13px] leading-snug text-(--color-ink-soft)">{conseil.texte}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link href={conseil.href} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 text-[13px] font-bold text-white shadow-[0_10px_24px_-14px_rgba(228,0,43,0.9)] transition-transform hover:scale-[1.02] focus-ring">
          {conseil.cta} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/mode-emploi" className="hidden items-center gap-1 text-[12px] font-semibold text-(--color-ink-soft) hover:text-[#C0112E] hover:underline lg:inline-flex">
          <BookOpen className="h-3.5 w-3.5" aria-hidden /> Mode d’emploi
        </Link>
      </div>
      {fermer}
    </section>
  );
}
