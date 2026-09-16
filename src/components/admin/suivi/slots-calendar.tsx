import Link from 'next/link';
import { addDays, addMonths, daysInMonth, fmtMonthLabel, isoWeekday, todayKey, type DayKey } from '@/lib/suivi/format';
import { cn } from '@/lib/utils';

export type SlotsDay = { day: DayKey; slots: number; remaining: number; booked: number; labels: string[] };

/** Calendrier mensuel des créneaux (§3) — composant serveur, N mois côte à côte. */
export function SlotsCalendar({ anchor, months, days }: { anchor: DayKey; months: number; days: SlotsDay[] }) {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const today = todayKey();
  const list = Array.from({ length: months }, (_, i) => addMonths(anchor, i));
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {list.map((m) => {
        const n = daysInMonth(m);
        const lead = isoWeekday(m) - 1;
        const cells: (DayKey | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: n }, (_, i) => addDays(m, i))];
        return (
          <div key={m} className="rounded-lg border border-(--color-border) p-3">
            <p className="mb-2 text-sm font-semibold capitalize text-(--color-ink)">{fmtMonthLabel(m)}</p>
            <div className="grid grid-cols-7 gap-1 text-[10px] text-(--color-ink-muted)">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i} className="text-center">{d}</span>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <span key={`e${i}`} />;
                const d = byDay.get(day);
                const past = day < today;
                return (
                  <Link
                    key={day}
                    href={`/admin/suivi/agenda?view=week&date=${day}`}
                    title={d ? `${d.slots} créneau(x) · ${d.remaining} place(s) restante(s) · ${d.booked} réservé(s) · ${d.labels.join(', ')}` : 'Aucun créneau'}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-center rounded-md border text-[11px] leading-tight',
                      d
                        ? (d.remaining > 0
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100'
                          : 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100')
                        : 'border-(--color-border) text-(--color-ink-muted)',
                      past && 'opacity-50',
                      day === today && 'ring-2 ring-(--color-primary)',
                    )}
                  >
                    <span className="font-medium">{Number(day.slice(8, 10))}</span>
                    {d && <span className="tabular-nums">{d.remaining}/{d.slots}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-(--color-ink-muted) md:col-span-2 xl:col-span-3">Dans chaque case : places restantes / créneaux du jour. Vert = il reste des places, ambre = complet ou bloqué.</p>
    </div>
  );
}
