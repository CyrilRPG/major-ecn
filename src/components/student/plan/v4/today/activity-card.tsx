'use client';

import Link from 'next/link';
import { CheckCircle2, ChevronRight, Clock, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ActivityCard } from '@/lib/plan/pages';
import { planSerif } from '../fonts';

/** Couleur du bloc (§28) : nouveaux contenus en bordeaux plein, révisions en teintes claires. */
const BLOCK_TONE: Record<string, string> = {
  NOUVEAU: 'bg-(--pl-pill) text-white',
  NOUVEAU_MOTIVANT: 'bg-(--pl-pill) text-white',
  A_NE_PAS_REPOUSSER: 'bg-[#8a4b12] text-white dark:bg-[#b4743a]',
  DIAGNOSTIC: 'bg-(--pl-rose-200) text-(--pl-bordeaux-strong)',
  CONTROLE: 'bg-(--pl-rose-200) text-(--pl-bordeaux-strong)',
  CONSOLIDATION: 'bg-(--pl-rose-100) text-(--pl-bordeaux-strong)',
  REACTIVATION: 'bg-(--pl-rose-100) text-(--pl-bordeaux-strong)',
  MES_ERREURS: 'bg-[#fdebd8] text-[#7a3b0a] dark:bg-[#3a2a1a] dark:text-[#f3c08c]',
  ENTRAINEMENT: 'bg-(--pl-info) text-(--pl-ink)',
  METHODOLOGIE: 'bg-(--pl-info) text-(--pl-ink)',
  CHECKUP: 'bg-(--pl-info) text-(--pl-ink)',
  CONCOURS_BLANC: 'bg-(--pl-info) text-(--pl-ink)',
};

export function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  if (h === 0) return `${r} min`;
  return r === 0 ? `${h} h` : `${h} h ${String(r).padStart(2, '0')}`;
}

export type CardActions = {
  onPostpone?: (a: ActivityCard) => void;
  onCancel?: (a: ActivityCard) => void;
  onAddToday?: (a: ActivityCard) => void;
  onAdvance?: (a: ActivityCard) => void;
};

/** Une activité : bloc, badges, item, raison en une phrase (§33), durée, unités, statut, actions. */
export function ActivityCardView({ a, future = false, actions, compact = false }: { a: ActivityCard; future?: boolean; actions?: CardActions; compact?: boolean }) {
  const [menu, setMenu] = useState(false);
  const done = a.status === 'COMPLETED';
  const closed = ['COMPLETED', 'CANCELLED', 'POSTPONED', 'OVERDUE', 'PARTIALLY_COMPLETED'].includes(a.status) && !future;
  const ratio = a.plannedUnits ? Math.min(1, a.validatedUnits / a.plannedUnits) : null;
  const title = a.itemNames.length > 1 ? a.itemNames.join(' · ') : a.itemName ?? a.coaching?.title ?? a.typeLabel;
  const open = !closed && !done;
  return (
    <article className={cn('pl-card relative flex gap-4 px-[18px] py-[14px]', done && 'opacity-80', compact && 'px-[14px] py-[11px]')} aria-label={`${a.blockLabel} — ${title}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-[10px] py-[3px] text-[11.5px] font-bold uppercase tracking-[0.04em]', BLOCK_TONE[a.block] ?? 'bg-(--pl-info) text-(--pl-ink)')}>{a.blockLabel}</span>
          {a.badges.filter((b) => b.label.toUpperCase() !== a.blockLabel.toUpperCase()).map((b) => (
            <span key={b.key} className="rounded-full border border-(--pl-card-border) bg-(--pl-card) px-[9px] py-[2px] text-[11.5px] font-semibold text-(--pl-bordeaux)">{b.label}</span>
          ))}
          {a.origin === 'ADVANCE' && <span className="rounded-full bg-(--pl-green-bg) px-[9px] py-[2px] text-[11.5px] font-semibold text-(--pl-green)">En avance</span>}
          {(a.origin === 'ADDED' || a.origin === 'EXTRA') && <span className="rounded-full bg-(--pl-green-bg) px-[9px] py-[2px] text-[11.5px] font-semibold text-(--pl-green)">En plus</span>}
          {a.shortVersion && <span className="rounded-full bg-(--pl-info) px-[9px] py-[2px] text-[11.5px] font-semibold text-(--pl-ink)">Version courte</span>}
        </div>
        <h3 className={cn(planSerif.className, 'mt-[7px] text-[17.5px] font-bold leading-snug text-(--pl-ink)', compact && 'text-[16px]')}>
          {title}
          {a.parts && a.parts > 1 && a.part ? <span className="ml-1.5 text-[14px] font-semibold text-(--pl-muted)">· partie {a.part}/{a.parts}</span> : null}
        </h3>
        {a.domainLabel && <p className="text-[13px] text-(--pl-muted)">{a.domainLabel}</p>}
        <p className="mt-[5px] text-[14.5px] leading-snug text-(--pl-text)">{a.reason}</p>
        <div className="mt-[8px] flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-(--pl-muted)">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-[15px] w-[15px]" strokeWidth={2} />{fmtMinutes(a.minutes)}</span>
          {a.unitLabel && <span>{a.unitLabel}{a.validatedUnits > 0 ? ` · ${a.validatedUnits} faite${a.validatedUnits > 1 ? 's' : ''}` : ''}</span>}
          {!a.measurable && open && <span>À valider en fin d’activité</span>}
          {!open && <span className={cn('font-semibold', done ? 'text-(--pl-green)' : 'text-(--pl-bordeaux)')}>{a.statusLabel}</span>}
        </div>
        {ratio !== null && ratio > 0 && (
          <div className="mt-[8px] h-[6px] w-full max-w-[320px] overflow-hidden rounded-full bg-(--pl-rose-100)" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} aria-label="Unités réalisées">
            <div className="h-full rounded-full bg-(--pl-crimson)" style={{ width: `${Math.round(ratio * 100)}%` }} />
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-(--pl-green)"><CheckCircle2 className="h-[18px] w-[18px]" />Terminée</span>
        ) : open ? (
          future ? (
            <button type="button" onClick={() => actions?.onAdvance?.(a)} className="inline-flex h-[38px] items-center gap-1.5 rounded-full border border-(--pl-pill) px-[16px] text-[14px] font-semibold text-(--pl-pill) transition hover:bg-(--pl-rose-50)">
              Commencer maintenant
            </button>
          ) : (
            <Link href={`/planificateur/activite/${a.id}`} className="inline-flex h-[40px] items-center gap-1.5 rounded-full bg-(--pl-pill) px-[18px] text-[14.5px] font-semibold text-white shadow-[0_6px_16px_-10px_rgba(133,0,22,0.8)] transition hover:brightness-110">
              {a.startedAt || a.validatedUnits > 0 ? 'Reprendre' : 'Commencer'}<ChevronRight className="h-[17px] w-[17px]" strokeWidth={2.4} />
            </Link>
          )
        ) : null}
        {open && actions && (
          <div className="relative">
            <button type="button" aria-label="Autres actions" aria-expanded={menu} onClick={() => setMenu((v) => !v)} className="grid h-[32px] w-[32px] place-items-center rounded-full text-(--pl-muted) hover:bg-(--pl-rose-50)">
              <MoreHorizontal className="h-[19px] w-[19px]" />
            </button>
            {menu && (
              <div role="menu" className="pl-card absolute right-0 top-[36px] z-20 w-[230px] py-1.5" onMouseLeave={() => setMenu(false)}>
                {future && actions.onAddToday && <MenuItem onClick={() => { setMenu(false); actions.onAddToday!(a); }}>Ajouter à aujourd’hui</MenuItem>}
                {actions.onPostpone && <MenuItem onClick={() => { setMenu(false); actions.onPostpone!(a); }}>Reporter</MenuItem>}
                {actions.onCancel && <MenuItem onClick={() => { setMenu(false); actions.onCancel!(a); }}>Retirer du planning</MenuItem>}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" role="menuitem" onClick={onClick} className="block w-full px-4 py-2 text-left text-[14px] text-(--pl-ink) hover:bg-(--pl-rose-50)">{children}</button>;
}
