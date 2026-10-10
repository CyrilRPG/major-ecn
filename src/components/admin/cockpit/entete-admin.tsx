'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, CircleHelp, ClipboardList, GraduationCap, Inbox, ListChecks, Mail, Search, UserRound } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  lireNotifications, marquerNotificationsLues, rechercheGlobale, type NotificationCockpit, type ResultatRecherche,
} from '@/app/admin/cockpit/actions-divers';
import { depuis } from '@/lib/cockpit/regles';
import { cn } from '@/lib/utils';
import { BoutonNouvelleAction } from './actions-globales';
import { useEtatSuivi } from './ui';

/**
 * Bandeau de l'administration (maquette du cockpit) : recherche globale
 * (⌘K / Ctrl+K), « + Nouvelle action », cloche des notifications internes,
 * aide, menu du compte.
 */
export function EnteteAdmin({ estAdmin, nonLues, menuCompte }: { estAdmin: boolean; nonLues: number; menuCompte: React.ReactNode }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-(--color-border) bg-(--color-surface) px-4 sm:gap-3">
      <RechercheGlobale />
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <BoutonNouvelleAction estAdmin={estAdmin} />
        <Cloche nonLuesInitiales={nonLues} />
        <Aide />
                {menuCompte}
      </div>
    </header>
  );
}

const ICONES: Record<ResultatRecherche['type'], typeof Search> = {
  tache: ListChecks, conversation: Mail, candidat: UserRound, enseignant: GraduationCap, reclamation: ClipboardList, demande: Inbox,
};

function RechercheGlobale() {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [res, setRes] = React.useState<ResultatRecherche[]>([]);
  const [ouvert, setOuvert] = React.useState(false);
  const [actif, setActif] = React.useState(0);
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const raccourci = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', raccourci);
    return () => window.removeEventListener('keydown', raccourci);
  }, []);

  React.useEffect(() => {
    if (q.trim().length < 2) return;
    const t = setTimeout(async () => {
      setRes(await rechercheGlobale(q));
      setActif(0);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const aller = (r: ResultatRecherche) => {
    setOuvert(false);
    setQ('');
    router.push(r.href);
  };

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
      <input
        ref={ref}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOuvert(true); }}
        onFocus={() => setOuvert(true)}
        onBlur={() => setTimeout(() => setOuvert(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActif((a) => Math.min(a + 1, res.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => Math.max(a - 1, 0)); }
          if (e.key === 'Enter' && res[actif]) aller(res[actif]);
          if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
        }}
        placeholder="Rechercher un candidat, un enseignant, une tâche, une réclamation…"
        className="h-10 w-full rounded-xl border border-(--color-border) bg-white pl-9 pr-14 text-sm text-(--color-ink) placeholder:text-(--color-ink-muted) focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15"
        aria-label="Recherche globale"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-(--color-border) bg-(--color-surface-soft) px-1.5 text-[11px] text-(--color-ink-muted) sm:block">⌘ K</kbd>
      {ouvert && q.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-(--color-border) bg-white shadow-xl">
          {res.length === 0 || q.trim().length < 2 ? (
            <p className="px-4 py-3 text-sm text-(--color-ink-muted)">Aucun résultat dans vos données.</p>
          ) : (
            <ul className="max-h-[60vh] overflow-auto py-1">
              {res.map((r, i) => {
                const I = ICONES[r.type];
                return (
                  <li key={`${r.type}:${r.id}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => aller(r)}
                      className={cn('flex w-full items-center gap-3 px-4 py-2 text-left', i === actif ? 'bg-(--color-primary-soft)' : 'hover:bg-(--color-surface-soft)')}
                    >
                      <I className="h-4 w-4 shrink-0 text-(--color-primary)" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-(--color-ink)">{r.titre}</span>
                        <span className="block truncate text-[12px] text-(--color-ink-muted)">{r.sousTitre}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="border-t border-(--color-border) px-4 py-1.5 text-[11px] text-(--color-ink-muted)">La recherche ne porte que sur les données auxquelles vous avez accès.</p>
        </div>
      )}
    </div>
  );
}

function Cloche({ nonLuesInitiales }: { nonLuesInitiales: number }) {
  const router = useRouter();
  const [ouvert, setOuvert] = React.useState(false);
  const [liste, setListe] = React.useState<NotificationCockpit[] | null>(null);
  const [nonLues, setNonLues] = useEtatSuivi(nonLuesInitiales);
  const panneau = React.useRef<HTMLDivElement>(null);

  const charger = React.useCallback(async () => {
    const r = await lireNotifications();
    setListe(r.liste);
    setNonLues(r.nonLues);
  }, [setNonLues]);

  // Rafraîchissement discret toutes les 2 minutes, onglet visible seulement.
  React.useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') void charger(); }, 120_000);
    return () => clearInterval(t);
  }, [charger]);

  React.useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: MouseEvent) => { if (panneau.current && !panneau.current.contains(e.target as Node)) setOuvert(false); };
    document.addEventListener('mousedown', dehors);
    return () => document.removeEventListener('mousedown', dehors);
  }, [ouvert, charger]);

  return (
    <div className="relative" ref={panneau}>
      <button
        type="button"
        onClick={() => { if (!ouvert) void charger(); setOuvert((o) => !o); }}
        aria-label={nonLues > 0 ? `Notifications, ${nonLues} non lues` : 'Notifications'}
        className="relative grid h-10 w-10 place-items-center rounded-lg text-(--color-ink) hover:bg-(--color-surface-soft) focus-ring"
      >
        <Bell className="h-5 w-5" />
        {nonLues > 0 && (
          <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#D92D3A] px-1 text-[10.5px] font-bold text-white">
            {nonLues > 99 ? '99+' : nonLues}
          </span>
        )}
      </button>
      {ouvert && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-(--color-border) bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2.5">
            <p className="text-sm font-semibold text-(--color-ink)">Notifications</p>
            {nonLues > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-(--color-primary) hover:underline"
                onClick={async () => { await marquerNotificationsLues(); await charger(); router.refresh(); }}
              >
                <CheckCheck className="h-3.5 w-3.5" /> Tout marquer comme lu
              </button>
            )}
          </div>
          {liste === null ? (
            <p className="px-4 py-6 text-center text-sm text-(--color-ink-muted)">Chargement…</p>
          ) : liste.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-(--color-ink-muted)">Aucune notification.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-(--color-border) overflow-auto">
              {liste.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.lien ?? '/admin/cockpit'}
                    onClick={async () => { setOuvert(false); await marquerNotificationsLues([n.id]); router.refresh(); }}
                    className={cn('block px-4 py-2.5 hover:bg-(--color-surface-soft)', !n.lu_at && 'bg-(--color-primary-soft)')}
                  >
                    <span className="flex items-start gap-2">
                      {!n.lu_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D92D3A]" />}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-(--color-ink)">
                          {n.titre}
                          {n.nombre > 1 && <span className="ml-1 rounded-full bg-(--color-primary-soft) px-1.5 text-[11px] text-(--color-primary)">×{n.nombre}</span>}
                        </span>
                        {n.corps && <span className="line-clamp-2 block text-[12.5px] text-(--color-ink-soft)">{n.corps}</span>}
                        <span className="block text-[11.5px] text-(--color-ink-muted)">{depuis(n.updated_at)}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/cockpit/parametres" onClick={() => setOuvert(false)} className="block border-t border-(--color-border) px-4 py-2 text-center text-[12.5px] text-(--color-primary) hover:bg-(--color-surface-soft)">
            Réglages des notifications
          </Link>
        </div>
      )}
    </div>
  );
}

function Aide() {
  const [ouvert, setOuvert] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} aria-label="Aide" className="hidden h-10 w-10 place-items-center rounded-lg text-(--color-ink) hover:bg-(--color-surface-soft) focus-ring sm:grid">
        <CircleHelp className="h-5 w-5" />
      </button>
      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Votre cockpit en 1 minute</DialogTitle>
            <DialogDescription>Tout ce qui demande votre intervention, au même endroit.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm text-(--color-ink)">
            <li><strong>+ Nouvelle action</strong> : tâche, rendez-vous, relance, appel, demande client, note — en un formulaire court.</li>
            <li><strong>Mes 3 priorités</strong> : épinglez et réordonnez vos priorités du jour depuis « Mes tâches ».</li>
            <li><strong>Relancer</strong> un enseignant : l’IA peut proposer un brouillon, mais rien ne part sans votre validation. Sa réponse arrive dans la messagerie <em>et</em> en copie dans vos e-mails.</li>
            <li><strong>Confidentialité</strong> : vos tâches, notes et rendez-vous sont privés, même pour les autres administrateurs. Vous partagez ce que vous voulez, avec qui vous voulez (consulter, commenter, modifier), et vous pouvez révoquer.</li>
            <li><strong>⌘ K / Ctrl + K</strong> : recherche immédiate.</li>
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
