'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BellRing, Check, Loader2, Mail, RotateCcw, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import { preferencesParDefaut, SECTIONS_NOTIF, type CategorieNotif, type Preferences } from '@/lib/notifications/categories';

function Coche({ actif, onChange, libelle, desactive }: { actif: boolean; onChange: (v: boolean) => void; libelle: string; desactive?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={actif}
      aria-label={libelle}
      disabled={desactive}
      onClick={() => onChange(!actif)}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:opacity-35',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102C5F]',
      )}
    >
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors', actif ? 'border-[#111827] bg-[#111827] text-white dark:border-white dark:bg-white dark:text-[#111827]' : 'border-(--color-border-strong) bg-transparent')}>
        {actif && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
    </button>
  );
}

/**
 * « Mes notifications » — un seul écran, simple et lisible : deux canaux
 * indépendants (application, e-mail) pour chaque catégorie, et pour l'e-mail
 * le choix entre l'envoi immédiat et le récapitulatif du soir. Enregistré sur
 * le serveur : mêmes choix sur tous les appareils.
 */
export function PreferencesNotifications() {
  const [p, setP] = useState<Preferences | null>(null);
  const [etat, setEtat] = useState<'repos' | 'enregistrement' | 'enregistre' | 'erreur'>('repos');
  const minuteur = useRef<number | null>(null);

  useEffect(() => {
    fetchAuthentifie('/api/notifications/preferences', { cache: 'no-store' })
      .then((r) => r.json()).then((j: { preferences: Preferences }) => setP(j.preferences))
      .catch(() => setP(preferencesParDefaut()));
  }, []);

  const enregistrer = useCallback((n: Preferences) => {
    setP(n);
    setEtat('enregistrement');
    if (minuteur.current) window.clearTimeout(minuteur.current);
    minuteur.current = window.setTimeout(async () => {
      try {
        const r = await fetchAuthentifie('/api/notifications/preferences', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(n),
        });
        setEtat(r.ok ? 'enregistre' : 'erreur');
      } catch { setEtat('erreur'); }
    }, 500);
  }, []);

  if (!p) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-(--color-ink-muted)" /></div>;

  const cat = (c: CategorieNotif, champ: 'app' | 'email' | 'mode', v: boolean | 'immediat' | 'quotidien') =>
    enregistrer({ ...p, categories: { ...p.categories, [c]: { ...p.categories[c], [champ]: v } } });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h1 className="text-[24px] font-bold text-(--color-ink)">Mes notifications</h1>
            <p className="mt-1 text-[14px] text-(--color-ink-soft)">Personnalisez les alertes Major ECN</p>
          </div>
          <BellRing className="mt-1 h-6 w-6 text-(--color-ink-soft)" />
        </div>

        <div className="mt-5 space-y-1 rounded-2xl bg-(--color-surface-soft) px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="flex-1 text-[16px] font-bold text-(--color-ink)">Notifications sur mon appareil</span>
            <Coche actif={p.appActif} onChange={(v) => enregistrer({ ...p, appActif: v })} libelle="Notifications sur mon appareil" />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex-1 text-[16px] font-bold text-(--color-ink)">Notifications par e-mail</span>
            <Coche actif={p.emailActif} onChange={(v) => enregistrer({ ...p, emailActif: v })} libelle="Notifications par e-mail" />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-0 pr-0.5 text-[13px] text-(--color-ink-soft)">
          <span className="flex w-11 flex-col items-center gap-0.5"><Smartphone className="h-4 w-4" />App</span>
          <span className="flex w-11 flex-col items-center gap-0.5"><Mail className="h-4 w-4" />E-mail</span>
        </div>

        {SECTIONS_NOTIF.map((s, i) => (
          <section key={s.cle} className={cn('py-3', i > 0 && 'border-t border-(--color-border)')}>
            <h2 className="mb-1 text-[18px] font-bold text-(--color-ink)">{s.titre}</h2>
            <ul>
              {s.categories.map((c) => {
                const r = p.categories[c.cle];
                return (
                  <li key={c.cle} className="py-1">
                    <div className="flex items-center gap-1">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] text-(--color-ink)">{c.label}</span>
                        <span className="block text-[12px] leading-snug text-(--color-ink-muted)">{c.aide}</span>
                      </span>
                      <Coche actif={r.app} desactive={!p.appActif} onChange={(v) => cat(c.cle, 'app', v)} libelle={`${c.label} — application`} />
                      <Coche actif={r.email} desactive={!p.emailActif} onChange={(v) => cat(c.cle, 'email', v)} libelle={`${c.label} — e-mail`} />
                    </div>
                    {r.email && p.emailActif && (
                      <div className="mt-1 flex justify-end gap-1 pr-1" role="radiogroup" aria-label={`Envoi des e-mails : ${c.label}`}>
                        {([['immediat', 'Immédiatement'], ['quotidien', 'Récapitulatif du soir']] as const).map(([v, l]) => (
                          <button key={v} type="button" role="radio" aria-checked={r.mode === v} onClick={() => cat(c.cle, 'mode', v)}
                            className={cn('min-h-8 rounded-full border px-3 text-[12px] font-semibold', r.mode === v ? 'border-[#111827] bg-[#111827] text-white dark:border-white dark:bg-white dark:text-[#111827]' : 'border-(--color-border) text-(--color-ink-soft)')}>{l}</button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-(--color-border) pt-4">
          <button type="button" onClick={() => enregistrer(preferencesParDefaut())} className="inline-flex h-11 items-center gap-2 rounded-xl border border-(--color-border) px-4 text-[14px] font-semibold hover:bg-(--color-surface-soft)">
            <RotateCcw className="h-4 w-4" />Réglages recommandés
          </button>
          <span className="text-[13px] text-(--color-ink-muted)" aria-live="polite">
            {etat === 'enregistrement' ? 'Enregistrement…' : etat === 'enregistre' ? '✓ Préférences enregistrées sur tous vos appareils' : etat === 'erreur' ? 'Échec de l’enregistrement, réessayez.' : ''}
          </span>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-(--color-ink-muted)">
          Chaque notification s’ouvre directement sur ce qui a changé. Les annonces marquées « Important » par Major ECN et les messages de l’équipe vous parviennent toujours. Les notifications restent consultables dans la cloche 🔔, même lorsque les alertes de l’appareil sont désactivées.
        </p>
      </div>
    </div>
  );
}
