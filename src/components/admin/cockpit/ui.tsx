'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PRIORITE_LABEL, STATUT_TACHE_LABEL, STATUT_DEMANDE_LABEL, STATUT_RECLAMATION_LABEL, STATUT_AMELIORATION_LABEL,
  initiales, type Priorite,
} from '@/lib/cockpit/regles';

/**
 * Kit visuel du cockpit : uniquement les jetons de la plateforme (couleurs,
 * cartes, boutons, typographie de l'administration) — la maquette du
 * 08/10/2026 ne fixe que la DISPOSITION des blocs. Touches de couleur
 * sémantiques pour les priorités et statuts. Rouge = urgence, orange =
 * haute, bleu = normale, gris = basse ; vert (green-*, jamais emerald/teal
 * qui rendent du rouge dans ce projet) = résolu / en cours favorable.
 */

export const C = {
  bordeaux: 'var(--color-primary)',
  bordeauxFonce: 'var(--color-primary-deep)',
  bordeauxClair: 'var(--color-primary-soft)',
  beige: 'var(--color-surface-soft)',
  carte: 'var(--color-surface)',
  ligne: 'var(--color-border)',
  encre: 'var(--color-ink)',
  doux: 'var(--color-ink-soft)',
  pale: 'var(--color-ink-muted)',
} as const;

export function Carte({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn('surface-card-bare min-w-0', className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function EnteteCarte({
  icone: Icone, titre, compteur, badge, lien, lienLabel = 'Voir tout', actions, className,
}: {
  icone: React.ComponentType<{ className?: string }>;
  titre: React.ReactNode;
  compteur?: number | null;
  badge?: React.ReactNode;
  lien?: string;
  lienLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-4 pb-2 sm:px-5', className)}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
        <Icone className="h-4 w-4" />
      </span>
      <h2 className="text-[17px] font-semibold tracking-tight text-(--color-ink)">
        {titre}
        {typeof compteur === 'number' && <span className="ml-1 text-(--color-primary)">({compteur})</span>}
      </h2>
      {badge}
      <div className="ml-auto flex items-center gap-2">
        {actions}
        {lien && (
          <Link href={lien} className="inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-(--color-primary) hover:underline focus-ring">
            {lienLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </header>
  );
}

const TON_PRIORITE: Record<string, string> = {
  urgente: 'bg-[#FCE4E4] text-[#B42318] ring-[#F5C2C0]',
  haute: 'bg-[#FFF0E1] text-[#C2570C] ring-[#FBD3AE]',
  normale: 'bg-[#E8F0FC] text-[#2F5DA8] ring-[#C9D8F2]',
  basse: 'bg-[#EEF0F2] text-[#5B6470] ring-[#D8DCE1]',
};
export function PastillePriorite({ priorite, className }: { priorite: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset', TON_PRIORITE[priorite] ?? TON_PRIORITE.normale, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {PRIORITE_LABEL[priorite as Priorite] ?? priorite}
    </span>
  );
}

const TON_STATUT: Record<string, string> = {
  // tâches
  a_faire: 'bg-[#F3EEF0] text-(--color-ink-soft)', en_cours: 'bg-[#E6F4EA] text-[#1F7A3E]', attente_reponse: 'bg-[#FFF3E0] text-[#B45309]',
  reponse_recue: 'bg-[#E8F0FC] text-[#2F5DA8]', reportee: 'bg-[#F1EDF7] text-[#6B4FA0]', terminee: 'bg-[#E6F4EA] text-[#1F7A3E]', annulee: 'bg-[#EEF0F2] text-[#5B6470]',
  // demandes
  a_traiter: 'bg-[#FFF0E1] text-[#C2570C]', en_attente: 'bg-[#FFF3E0] text-[#B45309]',
  // réclamations
  a_analyser: 'bg-[#FCE4EC] text-[#A3245A]', resolu: 'bg-[#E6F4EA] text-[#1F7A3E]', cloturee: 'bg-[#EEF0F2] text-[#5B6470]',
  // améliorations
  a_planifier: 'bg-[#FFF0E1] text-[#C2570C]', a_valider: 'bg-[#E8F0FC] text-[#2F5DA8]', realisee: 'bg-[#E6F4EA] text-[#1F7A3E]',
  verifiee: 'bg-[#E6F4EA] text-[#1F7A3E]', abandonnee: 'bg-[#EEF0F2] text-[#5B6470]',
};
const LIBELLES_STATUT: Record<string, string> = {
  ...STATUT_TACHE_LABEL, ...STATUT_DEMANDE_LABEL, ...STATUT_RECLAMATION_LABEL, ...STATUT_AMELIORATION_LABEL,
};
export function PastilleStatut({ statut, libelle, className }: { statut: string; libelle?: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11.5px] font-medium', TON_STATUT[statut] ?? 'bg-[#F3EEF0] text-(--color-ink-soft)', className)}>
      {libelle ?? LIBELLES_STATUT[statut] ?? statut}
    </span>
  );
}

const TON_ETIQUETTE: Record<string, string> = {
  bordeaux: 'bg-(--color-primary-soft) text-(--color-primary)',
  bleu: 'bg-[#E8F0FC] text-[#2F5DA8]',
  vert: 'bg-[#E6F4EA] text-[#1F7A3E]',
  orange: 'bg-[#FFF0E1] text-[#C2570C]',
  gris: 'bg-[#EEF0F2] text-[#5B6470]',
  violet: 'bg-[#F1EDF7] text-[#6B4FA0]',
};
export function Etiquette({ ton = 'bleu', children, className }: { ton?: keyof typeof TON_ETIQUETTE; children: React.ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium', TON_ETIQUETTE[ton], className)}>{children}</span>;
}

const TEINTES_AVATAR = ['var(--color-primary)', '#2F5DA8', '#1F7A3E', '#C2570C', '#6B4FA0', '#5B6470', '#A3245A'];
export function Avatar({ nom, taille = 36, className }: { nom: string; taille?: number; className?: string }) {
  let h = 0;
  for (const c of nom) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const teinte = TEINTES_AVATAR[h % TEINTES_AVATAR.length];
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full font-semibold text-white', className)}
      style={{ width: taille, height: taille, background: teinte, fontSize: Math.round(taille * 0.36) }}
    >
      {initiales(nom)}
    </span>
  );
}

type BoutonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'plein' | 'contour' | 'doux' | 'fantome' | 'danger';
  taille?: 'xs' | 'sm' | 'md';
  enCours?: boolean;
};
export const Bouton = React.forwardRef<HTMLButtonElement, BoutonProps>(function Bouton(
  { variante = 'plein', taille = 'md', enCours, className, children, disabled, ...props }, ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || enCours}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-(--radius-button) font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
        taille === 'xs' && 'h-7 px-2.5 text-[12px]',
        taille === 'sm' && 'h-8 px-3 text-[13px]',
        taille === 'md' && 'h-10 px-4 text-sm',
        variante === 'plein' && 'bg-(--color-primary) text-white shadow-sm hover:bg-(--color-primary-deep)',
        variante === 'contour' && 'border border-(--color-border) bg-white text-(--color-primary) hover:bg-(--color-primary-soft)',
        variante === 'doux' && 'bg-(--color-primary-soft) text-(--color-primary) hover:bg-(--color-primary-soft)',
        variante === 'fantome' && 'text-(--color-ink-soft) hover:bg-(--color-surface-soft) hover:text-(--color-ink)',
        variante === 'danger' && 'bg-[#B42318] text-white hover:bg-[#912018]',
        className,
      )}
      {...props}
    >
      {enCours && <Loader2 className="animate-spin" />}
      {children}
    </button>
  );
});

export const champ =
  'w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm text-(--color-ink) placeholder:text-(--color-ink-muted) focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15';

export function Libelle({ children, htmlFor, aide }: { children: React.ReactNode; htmlFor?: string; aide?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[12.5px] font-medium text-(--color-ink-soft)">
      {children}
      {aide && <span className="ml-1 font-normal text-(--color-ink-muted)">{aide}</span>}
    </label>
  );
}

export function Vide({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('px-4 py-6 text-center text-sm text-(--color-ink-muted) sm:px-5', className)}>{children}</p>;
}

/** Bandeau de page des sous-rubriques du cockpit. */
export function EntetePage({ surTitre = 'Mon cockpit', titre, sousTitre, actions }: { surTitre?: string; titre: string; sousTitre?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-(--color-ink-muted)">{surTitre}</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{titre}</h1>
        {sousTitre && <p className="mt-0.5 max-w-3xl text-sm text-(--color-ink-soft)">{sousTitre}</p>}
      </div>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Gabarit commun des pages du cockpit (mêmes marges que les autres pages d'administration). */
export function PageCockpit({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn('w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10', className)}>{children}</main>;
}

/**
 * État local initialisé depuis une valeur du serveur et ré-aligné quand
 * celle-ci change (après `router.refresh()`), sans effet : ajustement pendant
 * le rendu, le motif recommandé par React.
 */
export function useEtatSuivi<T>(source: T, cle: unknown = source): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [etat, setEtat] = React.useState(source);
  const [precedente, setPrecedente] = React.useState(cle);
  if (!Object.is(precedente, cle)) {
    setPrecedente(cle);
    setEtat(source);
  }
  return [etat, setEtat];
}

/** Retour d'action : message bref, effacé tout seul. */
export function useMessage(): [string | null, (m: string | null) => void] {
  const [m, setM] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!m) return;
    const t = setTimeout(() => setM(null), 4000);
    return () => clearTimeout(t);
  }, [m]);
  return [m, setM];
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-xl bg-(--color-ink) px-4 py-2.5 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}
