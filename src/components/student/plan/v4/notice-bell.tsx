'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Notice = { id: string; title: string; body: string | null; href: string | null; cta: string | null };

/** Cloche des nouveautés du planificateur (pastille si une information attend le candidat). */
export function NoticeBell({ notices }: { notices: Notice[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={notices.length > 0 ? `${notices.length} nouveauté${notices.length > 1 ? 's' : ''} du planificateur` : 'Nouveautés du planificateur'}
        className="relative grid h-[44px] w-[44px] place-items-center rounded-full text-(--pl-tab-text) transition hover:bg-(--pl-rose-50)"
      >
        <Bell className="h-[28px] w-[28px]" strokeWidth={1.8} />
        {notices.length > 0 && <span aria-hidden className="absolute right-[9px] top-[8px] h-[9px] w-[9px] rounded-full bg-[#c4091d] ring-2 ring-(--pl-page)" />}
      </button>
      {open && (
        <div role="dialog" aria-label="Nouveautés du planificateur" className="pl-card absolute right-0 top-[52px] z-30 w-[min(340px,calc(100vw-32px))] p-2">
          {notices.length === 0 ? (
            <p className="px-3 py-3 text-[14px] text-(--pl-text)">Rien de nouveau pour le moment.</p>
          ) : (
            <ul className="divide-y divide-(--pl-card-border)">
              {notices.map((n) => (
                <li key={n.id} className="px-3 py-2.5">
                  <p className="text-[14px] font-semibold leading-snug text-(--pl-ink)">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-[13px] leading-snug text-(--pl-text)">{n.body}</p>}
                  {n.href && n.cta && (
                    <Link href={n.href} onClick={() => setOpen(false)} className={cn('mt-1.5 inline-block text-[13px] font-semibold text-(--pl-bordeaux) hover:underline')}>{n.cta}</Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
