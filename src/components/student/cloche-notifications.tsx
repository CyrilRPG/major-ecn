'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CalendarDays, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Notif = {
  id: string; kind: string; title: string; body: string | null;
  cta_label: string | null; cta_href: string | null; updated_at: string; displayed_at: string | null;
};

const depuis = (iso: string) => {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  return j === 1 ? 'hier' : `il y a ${j} jours`;
};

/**
 * Cloche de l'espace élève : notifications de l'agenda (nouvelle séance,
 * séance mise à jour, lien de visio disponible) et du moteur pédagogique.
 * Rafraîchie à l'ouverture de la page, au retour sur l'onglet et toutes les
 * 2 minutes ; l'ouverture du panneau marque tout comme lu.
 */
export function ClocheNotifications() {
  const [items, setItems] = useState<Notif[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const boite = useRef<HTMLDivElement>(null);

  const charger = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const j = (await res.json()) as { notifications: Notif[]; nonLues: number };
      setItems(j.notifications);
      setNonLues(j.nonLues);
    } catch { /* hors ligne : on garde l'état */ }
  }, []);

  useEffect(() => {
    const t0 = window.setTimeout(() => void charger(), 0);
    const t = window.setInterval(() => { if (document.visibilityState === 'visible') void charger(); }, 120_000);
    const onVis = () => { if (document.visibilityState === 'visible') void charger(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { window.clearTimeout(t0); window.clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, [charger]);

  // Clic à l'extérieur / Échap : fermeture.
  useEffect(() => {
    if (!ouvert) return;
    const onDown = (e: MouseEvent) => { if (boite.current && !boite.current.contains(e.target as Node)) setOuvert(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [ouvert]);

  const basculer = () => {
    const v = !ouvert;
    setOuvert(v);
    if (v && nonLues > 0) {
      setNonLues(0);
      void fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'lues' }) });
    }
  };
  const fermer = (id: string) => {
    setItems((l) => l.filter((n) => n.id !== id));
    void fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'fermer', id }) });
  };

  return (
    <div ref={boite} className="relative">
      <button
        type="button"
        onClick={basculer}
        aria-label={nonLues > 0 ? `Notifications (${nonLues} non lue${nonLues > 1 ? 's' : ''})` : 'Notifications'}
        aria-expanded={ouvert}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-(--color-ink-soft) transition-colors hover:bg-(--color-surface-soft) hover:text-(--color-ink) focus-ring"
      >
        <Bell className="h-[18px] w-[18px]" />
        {nonLues > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E4002B] px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-(--color-surface)">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 top-11 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)">
          <p className="border-b border-(--color-border) px-4 py-2.5 text-sm font-bold text-(--color-ink)">Notifications</p>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-(--color-ink-muted)">Aucune notification pour le moment.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-(--color-border) overflow-y-auto">
              {items.map((n) => {
                const Icone = n.kind === 'agenda_lien' ? Video : n.kind.startsWith('agenda') ? CalendarDays : Bell;
                return (
                  <li key={n.id} className={cn('group relative flex gap-3 px-4 py-3', !n.displayed_at && 'bg-(--color-primary-soft)/40')}>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                      <Icone className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold leading-snug text-(--color-ink)">{n.title}</span>
                      {n.body && <span className="mt-0.5 block text-xs leading-snug text-(--color-ink-soft)">{n.body}</span>}
                      <span className="mt-1 flex items-center gap-3">
                        {n.cta_href && (
                          <Link href={n.cta_href} onClick={() => setOuvert(false)} className="text-xs font-semibold text-(--color-primary) hover:underline">
                            {n.cta_label ?? 'Voir'}
                          </Link>
                        )}
                        <span className="text-[11px] text-(--color-ink-muted)">{depuis(n.updated_at)}</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => fermer(n.id)}
                      aria-label="Retirer la notification"
                      className="absolute right-2 top-2 rounded p-1 text-(--color-ink-muted) opacity-0 transition-opacity hover:bg-(--color-surface-soft) hover:text-(--color-ink) focus:opacity-100 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
