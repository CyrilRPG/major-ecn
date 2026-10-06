import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Briques visuelles de l'accueil (maquette du 06/10/2026), au design de
 * l'application : cartes claires, titres marine en Plus Jakarta Sans, encarts
 * rosés et accents bordeaux. Sans état : utilisables côté serveur et client.
 */

export const displayFont = 'font-(family-name:--font-jakarta)';

/** Lien d'action d'un en-tête de section (« Voir mon planning → »). */
export const lienBloc =
  'inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#FDF4F5] px-3 py-1.5 text-[12.5px] font-semibold text-[#C0112E] ring-1 ring-inset ring-[#F6D9DD] transition-colors hover:bg-[#FBE9EC] focus-ring dark:bg-white/5 dark:text-[#F89BA3] dark:ring-(--color-border)';

/** Lien discret de carte (« Voir tout → »). */
export const lienCarte = 'inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#C0112E] hover:underline focus-ring dark:text-[#F89BA3]';

/** Bouton pleine largeur rosé en pied de carte. */
export const boutonCarte =
  'mt-auto flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#FDF4F5] px-3 text-[12.5px] font-semibold text-[#C0112E] ring-1 ring-inset ring-[#F6D9DD] transition-colors hover:bg-[#FBE9EC] focus-ring dark:bg-white/5 dark:text-[#F89BA3] dark:ring-(--color-border)';

/** Pastille numérotée d'une section (1 à 5). */
export function Numero({ n }: { n: number }) {
  return (
    <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#C0112E,#8B0E22)] font-(family-name:--font-jakarta) text-[16px] font-extrabold text-white shadow-[0_8px_18px_-10px_rgba(139,14,34,0.9)]">
      {n}
    </span>
  );
}

/** En-tête de section : numéro, icône, titre, description, action. */
export function EnTeteBloc({ numero, id, icon: Icon, titre, description, action }: {
  numero: number; id: string; icon?: LucideIcon; titre: ReactNode; description?: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 items-start gap-3">
        <Numero n={numero} />
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FDF4F5] text-[#C0112E] ring-1 ring-[#F6D9DD] dark:bg-white/5 dark:ring-(--color-border)" aria-hidden>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h2 id={id} className={cn(displayFont, 'text-[19px] font-extrabold leading-tight tracking-[-0.01em] text-[#14254E] dark:text-(--color-ink)')}>{titre}</h2>
          {description && <p className="mt-0.5 text-[13px] text-(--color-ink-soft)">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Section blanche numérotée (« Où j'en suis ? », « Mes statistiques »…). */
export function Bloc({ numero, id, icon, titre, description, action, children, className }: {
  numero: number; id: string; icon?: LucideIcon; titre: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn('rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5', className)}>
      <EnTeteBloc numero={numero} id={id} icon={icon} titre={titre} description={description} action={action} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Carte intérieure d'une section. */
export function Carte({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-w-0 flex-col rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5', className)}>{children}</div>;
}

/** Titre de carte intérieure avec son icône. */
export function TitreCarte({ icon: Icon, children, action, couleur = '#C0112E' }: { icon: LucideIcon; children: ReactNode; action?: ReactNode; couleur?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-[#14254E] dark:text-(--color-ink)">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${couleur}14`, color: couleur }} aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 leading-tight">{children}</span>
      </p>
      {action}
    </div>
  );
}

/** Anneau de progression (pourcentage au centre ou contenu libre). */
export function Anneau({ pct, couleur, taille = 76, epaisseur = 8, children }: { pct: number; couleur: string; taille?: number; epaisseur?: number; children?: ReactNode }) {
  const r = (taille - epaisseur) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct));
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: taille, height: taille }}>
      <svg viewBox={`0 0 ${taille} ${taille}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={taille / 2} cy={taille / 2} r={r} fill="none" stroke="var(--color-sand-100, #F1F2F4)" strokeWidth={epaisseur} />
        <circle cx={taille / 2} cy={taille / 2} r={r} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} />
      </svg>
      <span className="relative text-center leading-tight">{children}</span>
    </span>
  );
}

const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Jours actifs de la semaine civile (lundi → dimanche). */
export function PointsSemaine({ semaine, className }: { semaine: boolean[]; className?: string }) {
  return (
    <div className={cn('flex gap-2', className)} aria-label={`Jours actifs cette semaine : ${semaine.filter(Boolean).length} sur 7`}>
      {JOURS.map((j, i) => (
        <span key={i} className="flex flex-col items-center gap-1">
          <span className={cn('h-3.5 w-3.5 rounded-full', semaine[i] ? 'bg-[#E4002B]' : 'bg-(--color-sand-100) dark:bg-white/10')} aria-hidden />
          <span className="text-[10px] font-semibold text-(--color-ink-muted)">{j}</span>
        </span>
      ))}
    </div>
  );
}
