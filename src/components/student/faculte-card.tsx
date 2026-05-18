import Link from 'next/link';
import { Lock, MapPin, Users } from 'lucide-react';
import { GeometricBackground } from '@/components/brand/geometric-bg';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type FaculteCardData = {
  id: string;
  nom: string;
  ville: string;
  studentCount?: number;
  locked: boolean;
  seed?: number;
};

export function FaculteCard({ faculte }: { faculte: FaculteCardData }) {
  const inner = (
    <div
      className={cn(
        'relative overflow-hidden rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft) h-64',
        'group transition-colors',
        faculte.locked
          ? 'saturate-50'
          : 'hover:border-(--color-accent)',
      )}
    >
      <div className="absolute inset-0 -z-10 opacity-80 group-hover:opacity-100 transition">
        <GeometricBackground className="h-full w-full" seed={faculte.seed ?? 1} />
      </div>
      <div className="relative h-full p-6 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-xl surface-glass px-3 py-1.5 text-xs font-medium text-(--color-ink) inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-(--color-accent)" />
            {faculte.ville}
          </div>
          {faculte.locked && (
            <div className="rounded-full surface-glass p-2 text-(--color-ink-soft) shadow-(--shadow-soft)">
              <Lock className="h-4 w-4" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-(--color-ink) leading-tight text-balance">{faculte.nom}</h3>
          {typeof faculte.studentCount === 'number' && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft)">
              <Users className="h-4 w-4" />
              {faculte.studentCount} étudiants
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (faculte.locked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-not-allowed select-none">{inner}</div>
        </TooltipTrigger>
        <TooltipContent>Faculté non incluse dans votre offre</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Link href={`/facultes/${faculte.id}`} className="focus-ring block rounded-2xl">
      {inner}
    </Link>
  );
}
