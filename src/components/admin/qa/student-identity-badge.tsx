'use client';

import Link from 'next/link';
import { ExternalLink, Mail } from 'lucide-react';
import type { StudentIdentity } from '@/lib/admin/student-identity';

/**
 * Qui a écrit ? Nom réel, adresse pour répondre, spécialité / voie / formule,
 * et le lien vers le profil — le pseudo automatique reste affiché en second,
 * parce que c'est lui que l'élève voit sur le forum public.
 */
export function StudentIdentityBadge({
  student,
  pseudo,
  compact = false,
}: {
  student: StudentIdentity | null;
  pseudo: string;
  compact?: boolean;
}) {
  if (!student) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono font-semibold text-(--color-ink)">{pseudo}</span>
        <span className="text-(--color-ink-muted)">· profil introuvable</span>
      </div>
    );
  }
  const details = [
    student.specialty,
    student.voie ? `voie ${student.voie}` : null,
    student.offer,
  ].filter(Boolean) as string[];

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link
          href={student.href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-ink) underline-offset-4 hover:underline"
          title="Ouvrir le profil de l’élève"
        >
          {student.name}
          <ExternalLink className="h-3 w-3 text-(--color-ink-muted)" />
        </Link>
        <span className="font-mono text-[11px] text-(--color-ink-muted)">{pseudo}</span>
        {student.email && (
          <a
            href={`mailto:${student.email}`}
            className="inline-flex items-center gap-1 text-xs text-(--color-primary) hover:underline"
          >
            <Mail className="h-3 w-3" />
            {student.email}
          </a>
        )}
      </div>
      {details.length > 0 && !compact && (
        <div className="mt-1 flex flex-wrap gap-1">
          {details.map((d) => (
            <span key={d} className="rounded-full bg-(--color-surface-soft) px-2 py-0.5 text-[11px] font-medium text-(--color-ink-soft)">
              {d}
            </span>
          ))}
        </div>
      )}
      {details.length > 0 && compact && (
        <p className="truncate text-[11px] text-(--color-ink-muted)">{details.join(' · ')}</p>
      )}
    </div>
  );
}
