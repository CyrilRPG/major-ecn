import type { CSSProperties, ReactNode } from 'react';

/**
 * EVC Arena — jetons et briques visuelles de l'ADMINISTRATION (module sans
 * directive : importable à l'identique par les composants serveur et client).
 *
 * L'admin reste sur le fond clair du reste du back-office ; l'univers Arena
 * (fond #0B0F14, or, rouge Major ECN, titres condensés Oswald) n'apparaît
 * que dans l'en-tête, le parcours guidé et les accents (pastilles numérotées,
 * barres de progression). La police Oswald est chargée une seule fois dans
 * `admin-shell.tsx`, qui pose la variable `--font-oswald` sur la page.
 */
export const ADMIN_ARENA = {
  bg: '#0B0F14',
  surface: '#141A22',
  raised: '#1A1F26',
  gold: '#D4A94A',
  goldSoft: '#E8C878',
  goldDeep: '#8E6B1F',
  red: '#E4002B',
  redSoft: '#FF3B57',
  ok: '#2ECC71',
  text: '#F2F3F5',
  textSoft: '#B8BEC8',
  textMuted: '#7E8794',
} as const;

/** Titres condensés en capitales (maquettes client). */
export const ADMIN_DISPLAY = "var(--font-oswald), 'Oswald', 'Arial Narrow', Impact, sans-serif";
export const CAPS_TITLE: CSSProperties = { fontFamily: ADMIN_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 };

/** Filet doré (dégradé) des séparateurs et soulignements. */
export const GOLD_LINE = 'linear-gradient(90deg, rgba(212,169,74,0) 0%, #E8C878 30%, #D4A94A 50%, #E8C878 70%, rgba(212,169,74,0) 100%)';
export const GOLD_FILL = 'linear-gradient(180deg, #E8C878 0%, #D4A94A 55%, #B8892E 100%)';

/** Pastille dorée numérotée (numéro d'étape, de manche, de question). */
export function GoldBadge({ children, size = 'md', tone = 'gold', className = '' }: { children: ReactNode; size?: 'sm' | 'md' | 'lg'; tone?: 'gold' | 'muted' | 'ok' | 'red'; className?: string }) {
  const dim = size === 'lg' ? 'h-10 min-w-10 px-2 text-base' : size === 'sm' ? 'h-6 min-w-6 px-1.5 text-[11px]' : 'h-8 min-w-8 px-2 text-[13px]';
  const style: CSSProperties =
    tone === 'gold' ? { background: GOLD_FILL, color: '#1A1205', boxShadow: '0 1px 2px rgba(142,107,31,0.35)' }
      : tone === 'ok' ? { background: ADMIN_ARENA.ok, color: '#062B15' }
        : tone === 'red' ? { background: ADMIN_ARENA.red, color: '#fff' }
          : { background: 'var(--color-surface-sunken)', color: 'var(--color-ink-soft)' };
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums ${dim} ${className}`} style={{ ...style, fontFamily: ADMIN_DISPLAY, letterSpacing: '0.02em' }}>
      {children}
    </span>
  );
}

/** Barre de progression fine (questions d'une manche, étapes…). */
export function ArenaProgress({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const full = max > 0 && value >= max;
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-(--color-surface-sunken) ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${ratio * 100}%`, background: full ? ADMIN_ARENA.ok : GOLD_FILL }} />
    </div>
  );
}

/**
 * Carte d'étape de l'admin : en-tête avec pastille dorée numérotée, titre
 * condensé, description, zone d'actions à droite, puis contenu.
 */
export function ArenaCard({ number, title, description, aside, children, className = '', tone = 'default' }: { number?: ReactNode; title: ReactNode; description?: ReactNode; aside?: ReactNode; children?: ReactNode; className?: string; tone?: 'default' | 'locked' }) {
  return (
    <section className={`overflow-hidden rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft) ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-(--color-border) px-5 py-4" style={{ background: tone === 'locked' ? 'var(--color-surface-soft)' : undefined }}>
        <div className="flex min-w-0 items-start gap-3">
          {number !== undefined && <GoldBadge size="lg" tone={tone === 'locked' ? 'muted' : 'gold'}>{number}</GoldBadge>}
          <div className="min-w-0">
            <h3 className="text-lg leading-tight text-(--color-ink)" style={CAPS_TITLE}>{title}</h3>
            {description && <div className="mt-0.5 text-xs text-(--color-ink-soft)">{description}</div>}
          </div>
        </div>
        {aside && <div className="flex shrink-0 flex-wrap items-center gap-2">{aside}</div>}
      </header>
      {children !== undefined && <div className="p-5">{children}</div>}
    </section>
  );
}

/** Petit libellé de section (capitales espacées) au-dessus d'un groupe de champs. */
export function SectionLabel({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
      <p className="text-xs uppercase text-(--color-ink-muted)" style={{ fontFamily: ADMIN_DISPLAY, letterSpacing: '0.16em', fontWeight: 600 }}>{children}</p>
      {hint && <p className="text-xs text-(--color-ink-muted)">{hint}</p>}
    </div>
  );
}

/** Pastille de statut (tournoi, manche, import). */
export function StatusPill({ children, tone = 'muted', className = '' }: { children: ReactNode; tone?: 'muted' | 'ok' | 'red' | 'gold' | 'blue' | 'amber'; className?: string }) {
  const cls = {
    muted: 'bg-(--color-surface-sunken) text-(--color-ink-soft)',
    ok: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    gold: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${cls} ${className}`}>{children}</span>;
}
