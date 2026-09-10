import Link from 'next/link';
import Image from 'next/image';
import { Oswald } from 'next/font/google';
import type { ReactNode } from 'react';
import { ADMIN_ARENA, ADMIN_DISPLAY, GOLD_LINE } from './admin-ui';

/**
 * Coque premium de l'administration EVC Arena (hub et page tournoi).
 *
 * Bandeau sombre aux couleurs de l'arène (casque, wordmark, titre condensé,
 * statut, lien vers la landing publique), parcours guidé en cinq étapes sur
 * la page tournoi, barre secondaire pour les onglets d'exploitation. Le corps
 * de page reste sur le fond clair de l'admin.
 *
 * Oswald est chargée ICI, une seule fois, et exposée par la variable
 * `--font-oswald` (même nom que dans l'arène publique) sur la racine.
 */
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-oswald', display: 'swap' });

export type StepState = 'done' | 'current' | 'todo';
export type StepDef = { key: string; label: string; sub: string; state: StepState; href: string; active?: boolean };
export type TabDef = { key: string; label: string; href: string; active?: boolean; badge?: number };

const STATUS_TONE: Record<string, { bg: string; fg: string; ring: string }> = {
  draft: { bg: 'rgba(255,255,255,0.06)', fg: '#B8BEC8', ring: 'rgba(255,255,255,0.18)' },
  scheduled: { bg: 'rgba(212,169,74,0.14)', fg: '#E8C878', ring: 'rgba(212,169,74,0.5)' },
  registration_open: { bg: 'rgba(46,204,113,0.14)', fg: '#5FE39A', ring: 'rgba(46,204,113,0.5)' },
  round_open: { bg: 'rgba(228,0,43,0.18)', fg: '#FF3B57', ring: 'rgba(228,0,43,0.55)' },
  round_closed: { bg: 'rgba(245,179,43,0.14)', fg: '#F5B32B', ring: 'rgba(245,179,43,0.5)' },
  finished: { bg: 'rgba(255,255,255,0.08)', fg: '#F2F3F5', ring: 'rgba(255,255,255,0.22)' },
  archived: { bg: 'rgba(255,255,255,0.04)', fg: '#7E8794', ring: 'rgba(255,255,255,0.12)' },
};

export function ArenaAdminShell({
  title, subtitle, eyebrow, breadcrumb, status, landingHref, landingLabel = 'Voir la landing', stats, steps, tabs, notice, children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Sur-titre à droite du wordmark (ex. « Tournois »). */
  eyebrow?: string;
  breadcrumb?: { href: string; label: string }[];
  status?: { key: string; label: string };
  landingHref: string;
  landingLabel?: string;
  stats?: { label: string; value: ReactNode }[];
  steps?: StepDef[];
  tabs?: TabDef[];
  /** Avertissement (intégrité…) affiché sous le titre. */
  notice?: ReactNode;
  children: ReactNode;
}) {
  const tone = status ? STATUS_TONE[status.key] ?? STATUS_TONE.draft : null;
  return (
    <div className={`${oswald.variable} min-h-full`}>
      <header className="relative isolate overflow-hidden text-[#F2F3F5]" style={{ background: ADMIN_ARENA.bg }}>
        {/* Halo doré et rouge, très discrets, pour donner de la profondeur au bandeau. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(60% 120% at 0% 0%, rgba(212,169,74,0.16) 0%, rgba(212,169,74,0) 60%), radial-gradient(40% 100% at 100% 100%, rgba(228,0,43,0.18) 0%, rgba(228,0,43,0) 60%)' }} />
        <div className="mx-auto w-full max-w-6xl px-4 pt-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: ADMIN_DISPLAY, color: ADMIN_ARENA.textMuted }}>
              {breadcrumb?.map((b) => (
                <span key={b.href} className="flex items-center gap-2">
                  <Link href={b.href} className="transition-colors hover:text-[#F2F3F5]">{b.label}</Link>
                  <span aria-hidden style={{ color: ADMIN_ARENA.goldDeep }}>/</span>
                </span>
              ))}
              <span style={{ color: ADMIN_ARENA.textSoft }}>{eyebrow ?? 'Administration'}</span>
            </p>
            <Link href={landingHref} target="_blank" className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-white/10" style={{ fontFamily: ADMIN_DISPLAY, color: ADMIN_ARENA.goldSoft, boxShadow: 'inset 0 0 0 1px rgba(212,169,74,0.45)' }}>
              {landingLabel} ↗
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-5 pb-5">
            <div className="flex min-w-0 items-center gap-4">
              <Image src="/arena/helmet-320.png" alt="" width={72} height={72} priority className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_6px_16px_rgba(212,169,74,0.35)] sm:h-[72px] sm:w-[72px]" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.26em]" style={{ fontFamily: ADMIN_DISPLAY }}>
                  <span>EVC</span> <span style={{ color: ADMIN_ARENA.red }}>ARENA</span> <span style={{ color: ADMIN_ARENA.goldDeep }}>·</span> <span style={{ color: ADMIN_ARENA.gold }}>BY MAJOR ECN</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-[28px] leading-none uppercase sm:text-[34px]" style={{ fontFamily: ADMIN_DISPLAY, fontWeight: 600, letterSpacing: '0.03em' }}>{title}</h1>
                  {status && tone && (
                    <span className="rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ background: tone.bg, color: tone.fg, boxShadow: `inset 0 0 0 1px ${tone.ring}`, fontFamily: ADMIN_DISPLAY }}>
                      {status.label}
                    </span>
                  )}
                </div>
                {subtitle && <p className="mt-1.5 text-sm" style={{ color: ADMIN_ARENA.textSoft }}>{subtitle}</p>}
                {notice && <div className="mt-2 text-xs font-semibold" style={{ color: ADMIN_ARENA.redSoft }}>{notice}</div>}
              </div>
            </div>
            {stats && stats.length > 0 && (
              <dl className="flex flex-wrap gap-x-6 gap-y-2">
                {stats.map((s) => (
                  <div key={s.label} className="min-w-16">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: ADMIN_ARENA.textMuted, fontFamily: ADMIN_DISPLAY }}>{s.label}</dt>
                    <dd className="text-2xl leading-none tabular-nums" style={{ fontFamily: ADMIN_DISPLAY, fontWeight: 600 }}>{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {steps && steps.length > 0 && <Stepper steps={steps} />}

        {/* Filet doré de clôture du bandeau. */}
        <div aria-hidden className="h-[2px] w-full" style={{ background: GOLD_LINE }} />
      </header>

      {tabs && tabs.length > 0 && (
        <nav aria-label="Autres onglets" className="border-b border-(--color-border) bg-(--color-surface)">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-1 px-4 py-2 lg:px-8">
            <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-ink-muted)" style={{ fontFamily: ADMIN_DISPLAY }}>Exploitation</span>
            {tabs.map((tab) => (
              <Link key={tab.key} href={tab.href} className={`rounded-(--radius-button) px-3 py-1.5 text-sm font-semibold transition-colors ${tab.active ? 'bg-(--color-ink) text-white' : 'text-(--color-ink-soft) hover:bg-(--color-surface-sunken)'}`}>
                {tab.label}
                {tab.badge ? <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: ADMIN_ARENA.red }}>{tab.badge}</span> : null}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}

/** Parcours guidé : 1 Paramètres → 2 Manches → 3 Questions → 4 Corrigés → 5 Publication. */
function Stepper({ steps }: { steps: StepDef[] }) {
  return (
    <nav aria-label="Parcours de préparation" className="mx-auto w-full max-w-6xl px-4 pb-5 lg:px-8">
      <ol className="grid gap-2 sm:grid-cols-5">
        {steps.map((s, i) => {
          const done = s.state === 'done';
          const current = s.state === 'current';
          const circle: React.CSSProperties = done
            ? { background: 'linear-gradient(180deg, #E8C878 0%, #D4A94A 55%, #B8892E 100%)', color: '#1A1205' }
            : current
              ? { background: 'rgba(228,0,43,0.16)', color: '#FF3B57', boxShadow: 'inset 0 0 0 1.5px rgba(228,0,43,0.7)' }
              : { background: 'rgba(255,255,255,0.05)', color: ADMIN_ARENA.textMuted, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)' };
          return (
            <li key={s.key} className="relative">
              {i < steps.length - 1 && <span aria-hidden className="absolute top-[22px] left-[calc(50%+22px)] hidden h-px w-[calc(100%-44px)] sm:block" style={{ background: done ? 'rgba(212,169,74,0.6)' : 'rgba(255,255,255,0.12)' }} />}
              <Link
                href={s.href}
                aria-current={s.active ? 'step' : undefined}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors sm:flex-col sm:items-center sm:text-center"
                style={{ background: s.active ? 'rgba(255,255,255,0.06)' : 'transparent', boxShadow: s.active ? 'inset 0 0 0 1px rgba(212,169,74,0.5)' : undefined }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold tabular-nums" style={{ ...circle, fontFamily: ADMIN_DISPLAY }}>
                  {done ? '✓' : current ? '●' : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] uppercase tracking-[0.1em]" style={{ fontFamily: ADMIN_DISPLAY, fontWeight: 600, color: done ? ADMIN_ARENA.goldSoft : current ? '#F2F3F5' : ADMIN_ARENA.textSoft }}>
                    <span style={{ color: ADMIN_ARENA.textMuted }}>{i + 1} </span>{s.label}
                  </span>
                  <span className="block truncate text-[11px]" style={{ color: ADMIN_ARENA.textMuted }}>{s.sub}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
