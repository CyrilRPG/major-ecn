import Link from 'next/link';
import { type LucideIcon, ArrowRight, ClipboardList, History, Layers3, PlayCircle, FileText } from 'lucide-react';

type StepKey = 'video' | 'fiche' | 'qcm' | 'annales' | 'flashcards';

const META: Record<StepKey, { label: string; description: string; Icon: LucideIcon; href: (c: string) => string }> = {
  video:      { label: 'Cours vidéo',          description: 'Le cours filmé, aligné HAS',     Icon: PlayCircle,    href: (c) => `/cours/${c}/video` },
  fiche:      { label: 'Fiche de synthèse',    description: 'Résumé rang A / rang B',         Icon: FileText,      href: (c) => `/cours/${c}/fiche` },
  qcm:        { label: 'Dossiers progressifs', description: 'Entraînement format EDN',         Icon: ClipboardList, href: (c) => `/cours/${c}/qcm` },
  annales:    { label: 'Annales EDN',          description: 'Sujets des années passées',      Icon: History,       href: (c) => `/cours/${c}/annales` },
  flashcards: { label: 'Flashcards',           description: 'Mémorisation pondérée',          Icon: Layers3,       href: (c) => `/cours/${c}/flashcards` },
};

export function NextSteps({ coursId, steps, title = 'Prochaine étape' }: { coursId: string; steps: StepKey[]; title?: string }) {
  return (
    <section aria-labelledby="next-steps-title" className="mt-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 id="next-steps-title" className="text-xs font-medium uppercase tracking-[0.18em] text-(--color-primary-deep)">{title}</h2>
        <Link href={`/cours/${coursId}`} className="text-xs text-(--color-ink-soft) hover:text-(--color-primary-deep) transition">
          Voir le parcours complet →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((k) => {
          const it = META[k];
          return (
            <Link
              key={k}
              href={it.href(coursId)}
              className="group relative overflow-hidden rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-5 focus-ring transition-colors hover:border-(--color-accent)"
            >
              <div className="relative flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--color-primary) text-white">
                  <it.Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-(--color-ink-muted) group-hover:text-(--color-accent) transition-colors" />
              </div>
              <p className="relative mt-4 font-semibold text-(--color-ink)">{it.label}</p>
              <p className="relative mt-0.5 text-xs text-(--color-ink-soft) leading-relaxed">{it.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
