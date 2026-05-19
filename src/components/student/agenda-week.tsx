'use client';

import { useState } from 'react';
import { CalendarDays, Clock, ExternalLink, User, Video } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

type Ev = {
  day: number; // 1=Mon .. 7=Sun
  start: string;
  end: string;
  titre: string;
  college: string;
  intervenant: string;
  zoom: string;
};

const EVENTS: Ev[] = [
  { day: 1, start: '18:00', end: '20:00', titre: 'Insuffisance cardiaque — item 234', college: 'Cardiologie', intervenant: 'Dr. A. Lemaire (cardiologue, CHU)', zoom: 'https://zoom.us/j/8421007781' },
  { day: 2, start: '19:00', end: '21:00', titre: 'Asthme de l’adulte — item 209', college: 'Pneumologie', intervenant: 'Dr. C. Bonnet (pneumologue)', zoom: 'https://zoom.us/j/9120553340' },
  { day: 3, start: '18:30', end: '20:30', titre: 'Infections urinaires — item 161', college: 'Maladies infectieuses', intervenant: 'Dr. M. Haddad (infectiologue)', zoom: 'https://zoom.us/j/7785512094' },
  { day: 4, start: '18:00', end: '20:00', titre: 'ECOS blanc — stations cardio-pneumo', college: 'ECOS', intervenant: 'Équipe Major ECN', zoom: 'https://zoom.us/j/6650091123' },
  { day: 5, start: '19:00', end: '20:30', titre: 'Dernier Tour — Néphrologie', college: 'Néphrologie', intervenant: 'Dr. S. Roux (néphrologue)', zoom: 'https://zoom.us/j/5540982217' },
  { day: 6, start: '10:00', end: '12:30', titre: 'Concours blanc EDN — DP & QI', college: 'Transversal', intervenant: 'Équipe Major ECN', zoom: 'https://zoom.us/j/3398120475' },
];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function weekDates(): Date[] {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function AgendaWeek() {
  const dates = weekDates();
  const todayKey = new Date().toDateString();
  const [selected, setSelected] = useState<(Ev & { date: Date }) | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:min-h-0 lg:grid-cols-7">
        {dates.map((date, i) => {
          const dayNum = i + 1;
          const evs = EVENTS.filter((e) => e.day === dayNum);
          const isToday = date.toDateString() === todayKey;
          return (
            <div
              key={i}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-(--color-surface) shadow-(--shadow-soft) ${
                isToday ? 'border-(--color-primary) ring-1 ring-(--color-primary)/30' : 'border-(--color-border)'
              }`}
            >
              <div
                className={`flex items-baseline justify-between px-4 py-3 ${
                  isToday ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft)'
                }`}
              >
                <span className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-(--color-ink)'}`}>
                  {DAYS[i]}
                </span>
                <span
                  className={`text-xs tabular-nums ${
                    isToday ? 'text-white/80' : 'text-(--color-ink-muted)'
                  }`}
                >
                  {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3">
                {evs.length === 0 && (
                  <div className="flex flex-1 items-center justify-center">
                    <span className="text-xs text-(--color-ink-muted)">Aucun cours</span>
                  </div>
                )}
                {evs.map((e, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setSelected({ ...e, date })}
                    className="group flex flex-col rounded-xl border border-(--color-border) bg-(--color-primary-soft) p-4 text-left transition-all hover:-translate-y-0.5 hover:border-(--color-primary) hover:shadow-(--shadow-soft) focus-ring"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-(--color-primary-deep)">
                      <Clock className="h-3.5 w-3.5" />
                      {e.start} – {e.end}
                    </span>
                    <span className="mt-2 block text-sm font-semibold leading-snug text-(--color-ink)">
                      {e.titre}
                    </span>
                    <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-(--color-surface) px-2 py-0.5 text-[11px] font-medium text-(--color-ink-soft)">
                      {e.college}
                    </span>
                    <span className="mt-2 flex items-center gap-1 text-[11px] text-(--color-ink-muted)">
                      <Video className="h-3 w-3" />
                      Cours en visio
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={selected != null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-(--color-primary)" />
                  {selected.titre}
                </DialogTitle>
                <DialogDescription>{selected.college}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-(--color-ink)">
                  <CalendarDays className="h-4 w-4 text-(--color-ink-muted)" />
                  {selected.date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </div>
                <div className="flex items-center gap-2.5 text-(--color-ink)">
                  <Clock className="h-4 w-4 text-(--color-ink-muted)" />
                  {selected.start} – {selected.end}
                </div>
                <div className="flex items-center gap-2.5 text-(--color-ink)">
                  <User className="h-4 w-4 text-(--color-ink-muted)" />
                  {selected.intervenant}
                </div>
                <a
                  href={selected.zoom}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Video className="h-4 w-4" />
                  Rejoindre le cours sur Zoom
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
