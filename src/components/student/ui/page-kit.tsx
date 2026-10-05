import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Charpente commune des pages du menu élève (Accueil, Parcours du Major,
 * Mon planning, Mes priorités, EVC Check-up, Entraînement ciblé, Révisions
 * transversales, Agenda, Prises de notes, Questions à revoir, Mes
 * entraînements, Épreuves blanches).
 *
 * - En-tête premium sombre : l'ADN du Parcours du Major et de la barre
 *   latérale (nuit → prune → bordeaux, accents or, filigrane de la rubrique).
 * - Titres de section façon site vitrine : sur-titre bordeaux en capitales,
 *   titre marine en Plus Jakarta Sans.
 * - Cartes claires, encarts rosés, boutons rouge → orange de l'application.
 *
 * Composants serveur (aucun état) : utilisables partout.
 */

const LARGEUR = {
  /** Fil vertical (Parcours du Major). */
  narrow: 'max-w-3xl',
  /** Page standard. */
  default: 'max-w-6xl',
  /** Tableau de bord avec colonne latérale (Accueil, Révisions transversales). */
  wide: 'max-w-[1640px]',
} as const;

export function StudentPage({ width = 'default', className, children }: { width?: keyof typeof LARGEUR; className?: string; children: ReactNode }) {
  return <div className={cn('relative mx-auto flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7', LARGEUR[width], className)}>{children}</div>;
}

/** Police d'affichage du site vitrine. */
export const displayFont = 'font-(family-name:--font-jakarta)';

/** Bouton principal sur l'en-tête sombre (rouge → orange de l'application). */
export const heroCta =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 text-sm font-bold text-white shadow-[0_10px_28px_-12px_rgba(228,0,43,0.9)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C84B]/80';
/** Bouton secondaire sur l'en-tête sombre. */
export const heroGhost =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C84B]/80';

/**
 * En-tête d'une page du menu élève. `icon` = l'icône de la rubrique dans le
 * menu (repère visuel), reprise en filigrane doré sauf `watermark` explicite.
 */
export function StudentHero({
  icon: Icon, watermark, eyebrow, title, subtitle, actions, stats, links, children, compact = false, titleAs: Title = 'h1', className,
}: {
  icon: LucideIcon;
  watermark?: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Boutons (classes `heroCta` / `heroGhost`). */
  actions?: ReactNode;
  /** Pastilles chiffrées (`HeroStat`). */
  stats?: ReactNode;
  /** Rubriques que la page alimente (`HeroLinks`). */
  links?: ReactNode;
  children?: ReactNode;
  /** Variante basse pour les pages plein écran (Agenda). */
  compact?: boolean;
  titleAs?: 'h1' | 'p';
  className?: string;
}) {
  return (
    <header
      className={cn(
        'relative isolate overflow-hidden rounded-3xl border border-[#E9D8A6]/70 text-white shadow-[0_24px_60px_-30px_rgba(45,5,24,0.65)]',
        'bg-[linear-gradient(135deg,#0E1626_0%,#1C1434_40%,#2A1130_70%,#2D0518_100%)]',
        compact ? 'px-5 py-4 sm:px-6' : 'px-5 py-6 sm:px-8 sm:py-7',
        className,
      )}
    >
      <span aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <span aria-hidden className="pointer-events-none absolute -left-24 -top-28 -z-10 h-72 w-72 rounded-full bg-[#E4002B]/20 blur-3xl" />
      <span aria-hidden className={cn('pointer-events-none absolute -z-10 text-[#F5C84B] opacity-[0.15]', compact ? '-right-3 -top-7 [&>svg]:h-32 [&>svg]:w-32' : '-right-8 -top-10 [&>svg]:h-48 [&>svg]:w-48')}>
        {watermark ?? <Icon strokeWidth={1.2} />}
      </span>

      <div className={cn('flex flex-wrap justify-between gap-x-6', compact ? 'items-center gap-y-3' : 'items-end gap-y-4')}>
        <div className="min-w-0 max-w-3xl">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5C84B]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/15">
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            {eyebrow}
          </p>
          <Title className={cn(displayFont, 'mt-2 font-extrabold leading-[1.1] tracking-[-0.02em] text-balance', compact ? 'text-[22px] sm:text-[26px]' : 'text-[26px] sm:text-[32px]')}>{title}</Title>
          {subtitle && <div className={cn('max-w-2xl leading-relaxed text-white/70 text-pretty', compact ? 'mt-1 text-[13px] sm:text-sm' : 'mt-2 text-sm sm:text-[15px]')}>{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {/* Téléphone : pastilles en grille 2 colonnes (sinon une par ligne) ; au-delà, en ligne. */}
      {stats && <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">{stats}</div>}
      {children && <div className="mt-5">{children}</div>}
      {links}
      <span aria-hidden className="absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,200,75,0.55),transparent)]" />
    </header>
  );
}

/** Pastille chiffrée de l'en-tête (même gabarit que le Parcours du Major). */
export function HeroStat({ icon: Icon, dot, value, label, href }: { icon?: LucideIcon; dot?: string; value: ReactNode; label: ReactNode; href?: string }) {
  const body = (
    <>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-[#F5C84B]">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : <span className={cn('h-2.5 w-2.5 rounded-full', dot ?? 'bg-[#F5C84B]')} aria-hidden />}
      </span>
      <span className="text-[13px] leading-tight">
        <span className="font-bold tabular-nums text-white">{value}</span>
        <span className="ml-1 text-white/60">{label}</span>
      </span>
    </>
  );
  const cls = 'flex min-w-0 items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 ring-1 ring-inset ring-white/10 sm:px-3';
  if (!href) return <div className={cls}>{body}</div>;
  return (
    <a href={href} className={cn(cls, 'transition-colors hover:bg-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C84B]/80')}>
      {body}
    </a>
  );
}

/** Barre de progression dorée de l'en-tête. */
export function HeroProgress({ label, value }: { label: string; value: number }) {
  const v = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="col-span-2 min-w-[160px] flex-1">
      <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-white/60">
        <span>{label}</span>
        <span className="tabular-nums">{v} %</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#B8860B,#F5C84B)]" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/**
 * Interconnexion pédagogique rendue visible : les rubriques que l'activité de
 * la page met à jour (uniquement des liens réels du moteur pédagogique).
 */
export function HeroLinks({ label = 'Vos résultats mettent à jour', links }: { label?: string; links: { href: string; label: string }[] }) {
  if (links.length === 0) return null;
  return (
    <p className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/55">
      <span className="mr-0.5">{label}</span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="rounded-full bg-white/[0.07] px-2.5 py-1 font-semibold text-white/85 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C84B]/80">
          {l.label}
        </Link>
      ))}
    </p>
  );
}

/** Titre de section façon site vitrine. */
export function SectionTitle({
  eyebrow, title, description, action, id, as: H = 'h2', className,
}: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode; id?: string; as?: 'h2' | 'h3'; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-4 gap-y-2', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B0E22] dark:text-[#F89BA3]">{eyebrow}</p>}
        <H id={id} className={cn(displayFont, 'font-extrabold tracking-[-0.01em] text-[#14254E] dark:text-(--color-ink)', eyebrow ? 'mt-1' : '', H === 'h2' ? 'text-lg sm:text-xl' : 'text-base')}>{title}</H>
        {description && <p className="mt-1 max-w-3xl text-sm text-(--color-ink-soft)">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Carte claire standard. */
export function Panel({ className, children, id, ...aria }: { className?: string; children: ReactNode; id?: string; 'aria-labelledby'?: string }) {
  return (
    <section id={id} {...aria} className={cn('rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6', className)}>
      {children}
    </section>
  );
}

/** Encart rosé du site vitrine (conseil, mode d'emploi). */
export function Callout({ icon: Icon, title, children, action, className }: { icon: LucideIcon; title?: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-start gap-3 rounded-2xl border border-[#F6D9DD] bg-[#FDF4F5] px-4 py-3.5 dark:border-(--color-border) dark:bg-(--color-surface)', className)}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#8B0E22] shadow-(--shadow-xs) dark:bg-white/10 dark:text-[#F89BA3]">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-(--color-ink-soft)">
        {title && <p className="font-semibold text-[#14254E] dark:text-(--color-ink)">{title}</p>}
        {children}
      </div>
      {action}
    </div>
  );
}
