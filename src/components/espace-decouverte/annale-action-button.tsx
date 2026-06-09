'use client';

/**
 * Bouton "Ouvrir" sur la liste des annales.
 * - Si locked (offre Découverte) : ouvre le popup LockedContentModal au clic
 *   pour pousser vers /tarifs.
 * - Sinon : redirige vers la page de l'annale.
 */
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Lock } from 'lucide-react';
import { LockedContentModal } from './locked-content-modal';

export function AnnaleActionButton({
  href,
  locked,
}: {
  href: string;
  locked: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!locked) {
    return (
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-3.5 py-2 text-xs font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-105"
      >
        <FileText className="h-3.5 w-3.5" />
        Ouvrir
        <ArrowRight className="h-3 w-3" />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-[#FCEAEC]"
        style={{ borderColor: 'rgba(192,17,46,0.25)', color: '#C0112E' }}
      >
        <Lock className="h-3.5 w-3.5" />
        Verrouillé
        <ArrowRight className="h-3 w-3" />
      </button>
      <LockedContentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
