'use client';

/**
 * Lien sécurisé pour le mode Découverte.
 *
 * - Si `locked === false` : rend un Link Next.js normal vers `href`.
 * - Si `locked === true`  : rend un bouton (visuel identique au Link grâce
 *   au prop `className` passé inchangé) qui ouvre LockedContentModal au clic
 *   (popup tarifs / Découverte). Un petit cadenas est ajouté avant les
 *   enfants pour signaler l'état.
 *
 * Permet de "verrouiller" sans dupliquer le markup : un seul composant
 * client gère le branchement.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { LockedContentModal } from './locked-content-modal';

export function DiscoveryGateLink({
  href,
  locked = false,
  className,
  style,
  children,
  ariaLabel,
}: {
  href: string;
  locked?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!locked) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel ?? 'Contenu verrouillé — Découverte'}
        className={className}
        style={style}
      >
        <Lock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        {children}
      </button>
      <LockedContentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
