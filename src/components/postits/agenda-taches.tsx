'use client';

import { useState, useSyncExternalStore, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CalendarClock, Check, ExternalLink, Library, Loader2, StickyNote } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { LIBELLE_RAPPEL, PALETTE, RAPPELS, type Rappel } from '@/lib/postits/regles';
import { libelleEcheance, reporter, type TacheAgenda } from '@/lib/postits/agenda';
import { actionPostit } from './api';

/**
 * Tâches Post-it dans l'agenda élève (§38-44). L'agenda LIT les tâches des
 * Post-it (aucune copie) : cocher, déplacer ou reporter ici écrit la même ligne
 * que le Post-it, via la même route. Les cours officiels restent en lecture
 * seule ; les tâches n'influencent jamais le planificateur (§48).
 */

/* ------------------------------------------------------------------ */
/* Filtres par nature d'activité (§43, §44)                            */
/* ------------------------------------------------------------------ */

export type FiltresAgenda = { direct: boolean; perso: boolean; postit: boolean };
const CLE_FILTRES = 'mecn_agenda_filtres_v1';
const DEFAUT = '{"direct":true,"perso":true,"postit":true}';
const EVENEMENT = 'mecn-agenda-filtres';

function lireFiltres(): string {
  try { return window.localStorage.getItem(CLE_FILTRES) ?? DEFAUT; } catch { return DEFAUT; }
}
function abonner(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENEMENT, cb);
  return () => { window.removeEventListener('storage', cb); window.removeEventListener(EVENEMENT, cb); };
}

/** Filtres mémorisés par appareil ; rendu serveur = tout affiché (pas d'écart d'hydratation). */
export function useFiltresAgenda(): [FiltresAgenda, (f: FiltresAgenda) => void] {
  const brut = useSyncExternalStore(abonner, lireFiltres, () => DEFAUT);
  let f: FiltresAgenda;
  try { f = { ...(JSON.parse(DEFAUT) as FiltresAgenda), ...(JSON.parse(brut) as Partial<FiltresAgenda>) }; } catch { f = JSON.parse(DEFAUT) as FiltresAgenda; }
  const ecrire = (v: FiltresAgenda) => {
    try { window.localStorage.setItem(CLE_FILTRES, JSON.stringify(v)); } catch { /* mode privé */ }
    window.dispatchEvent(new Event(EVENEMENT));
  };
  return [f, ecrire];
}

export function BarreFiltresAgenda({ filtres, onChange, nbTaches }: { filtres: FiltresAgenda; onChange: (f: FiltresAgenda) => void; nbTaches: number }) {
  const puces: { cle: keyof FiltresAgenda; label: string; pastille: ReactNode }[] = [
    { cle: 'direct', label: 'Cours en direct', pastille: <span className="h-2.5 w-2.5 rounded-full bg-[#B35900]" /> },
    { cle: 'perso', label: 'Activités personnelles', pastille: <span className="h-2.5 w-2.5 rounded-full border border-dashed border-[#5B2BB8] bg-[#F1E8FD]" /> },
    { cle: 'postit', label: `Tâches Post-it${nbTaches ? ` (${nbTaches})` : ''}`, pastille: <StickyNote className="h-3.5 w-3.5 text-[#6E0F28]" /> },
  ];
  return (
    <div role="group" aria-label="Afficher dans l’agenda" className="mb-3 flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">Afficher</span>
      {puces.map((p) => {
        const actif = filtres[p.cle];
        return (
          <button
            key={p.cle}
            type="button"
            aria-pressed={actif}
            onClick={() => onChange({ ...filtres, [p.cle]: !actif })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-semibold transition-colors',
              actif ? 'border-(--color-ink)/15 bg-(--color-surface) text-(--color-ink) shadow-(--shadow-soft)' : 'border-dashed border-(--color-border) text-(--color-ink-muted) line-through decoration-1',
            )}
          >
            {p.pastille}
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

/** Rang d'affichage dans la colonne du jour : sans heure en tête, puis par heure. */
export function ordreHoraire(heure: string | null | undefined): number {
  const m = /^(\d{2}):(\d{2})/.exec(heure ?? '');
  return m ? 1 + Number(m[1]) * 60 + Number(m[2]) : 0;
}

/* ------------------------------------------------------------------ */
/* Carte et fenêtre d'une tâche                                        */
/* ------------------------------------------------------------------ */

async function enregistrer(id: string, patch: Record<string, unknown>) {
  await actionPostit({ action: 'tacheModifier', id, ...patch });
}

/** Une tâche Post-it dans la colonne du jour : couleur de sa note + petit Post-it (§43). */
export function CarteTachePostit({ tache, onOpen }: { tache: TacheAgenda; onOpen: () => void }) {
  const router = useRouter();
  const [, demarrer] = useTransition();
  const [optimiste, setOptimiste] = useState<{ base: boolean; v: boolean } | null>(null);
  const [erreur, setErreur] = useState(false);
  const fait = optimiste && optimiste.base === tache.fait ? optimiste.v : tache.fait;
  const c = PALETTE[tache.couleur];

  const cocher = () => {
    setOptimiste({ base: tache.fait, v: !fait });
    setErreur(false);
    demarrer(async () => {
      try {
        await enregistrer(tache.id, { fait: !fait });
        router.refresh();
      } catch {
        setOptimiste(null);
        setErreur(true);
      }
    });
  };

  return (
    <div
      className={cn('group flex min-w-0 items-start gap-2 rounded-xl border-l-4 px-2.5 py-2 text-left transition-shadow hover:shadow-(--shadow-soft)', fait && 'opacity-70')}
      style={{ order: ordreHoraire(tache.heure), background: `color-mix(in srgb, ${c.fond} 45%, white)`, borderLeftColor: c.bandeau }}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={fait}
        aria-label={fait ? 'Marquer la tâche comme à faire' : 'Marquer la tâche comme terminée'}
        onClick={cocher}
        className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border-[1.5px]"
        style={{ borderColor: c.encre, background: fait ? c.encre : 'white' }}
      >
        {fait && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </button>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left focus-ring">
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: c.encre }}>
          <StickyNote className="h-3 w-3 shrink-0" />
          {tache.heure ? tache.heure.replace(':', 'h') : 'Tâche du jour'}
          {fait && <span className="ml-auto rounded-full bg-white/70 px-1.5 text-[10px] font-bold">Terminée</span>}
        </span>
        <span className={cn('mt-0.5 block text-[13px] font-semibold leading-snug text-(--color-ink) [overflow-wrap:anywhere]', fait && 'line-through')}>{tache.texte}</span>
        <span className="mt-0.5 block truncate text-[11px] text-(--color-ink-muted)">{tache.postitTitre} · {tache.origine}</span>
        {erreur && <span className="mt-0.5 block text-[11px] font-semibold text-[#9B0F2C]">Non enregistré, réessayez.</span>}
      </button>
    </div>
  );
}

/**
 * Fenêtre d'une tâche Post-it depuis l'agenda : terminer, déplacer (date et
 * heure), reporter, rappels, et retour vers l'item et le Post-it (§39-42, §45).
 */
export function DialogueTachePostit({ tache, onClose, aujourdHui }: { tache: TacheAgenda | null; onClose: () => void; aujourdHui: string }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  if (!tache) return null;
  const c = PALETTE[tache.couleur];

  const appliquer = async (patch: { fait?: boolean; date?: string | null; heure?: string | null; rappels?: Rappel[] }, fermer = true) => {
    setEnCours(true);
    setErreur(null);
    try {
      await enregistrer(tache.id, patch);
      router.refresh();
      if (fermer) onClose();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      setEnCours(false);
    }
  };

  const champ = 'h-9 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm';

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2 pr-6">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[4px]" style={{ background: c.fond, color: c.encre }}><StickyNote className="h-4 w-4" /></span>
            <span className={cn(tache.fait && 'line-through')}>{tache.texte}</span>
          </DialogTitle>
          <DialogDescription>
            Tâche du Post-it « {tache.postitTitre} » · {tache.origine}
            {tache.postitArchive && ' (Post-it archivé)'}
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          disabled={enCours}
          onClick={() => appliquer({ fait: !tache.fait })}
          className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold', tache.fait ? 'border border-(--color-border) text-(--color-ink)' : 'bg-[#6E0F28] text-white hover:bg-[#5A0B20]')}
        >
          <Check className="h-4 w-4" /> {tache.fait ? 'Remettre à faire' : 'Marquer comme terminée'}
        </button>

        <form
          className="space-y-2 rounded-xl border border-(--color-border) p-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const date = String(fd.get('date') || '') || null;
            const heure = String(fd.get('heure') || '') || null;
            void appliquer({ date, heure: date ? heure : null });
          }}
        >
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-(--color-ink-muted)"><CalendarClock className="h-3.5 w-3.5" /> Déplacer</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-(--color-ink-soft)">Date<input name="date" type="date" defaultValue={tache.date} required className={champ} /></label>
            <label className="text-xs text-(--color-ink-soft)">Heure (facultatif)<input name="heure" type="time" defaultValue={tache.heure ?? ''} className={champ} /></label>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="submit" disabled={enCours} className="rounded-lg bg-[#6E0F28] px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-60">
              {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
            </button>
            <span className="ml-1 text-[12px] text-(--color-ink-soft)">Reporter :</span>
            {[{ j: 1, l: '+1 jour' }, { j: 7, l: '+1 semaine' }].map(({ j, l }) => (
              <button key={j} type="button" disabled={enCours} onClick={() => appliquer(reporter(tache, j, aujourdHui))} className="rounded-full border border-(--color-border) px-2.5 py-1 text-[12px] font-semibold hover:bg-(--color-surface-soft)">
                {l}
              </button>
            ))}
          </div>
          <p className="text-[11.5px] text-(--color-ink-muted)">Le Post-it est mis à jour en même temps : c’est la même tâche.</p>
        </form>

        {tache.heure && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[12px] font-semibold text-(--color-ink-soft)"><Bell className="h-3.5 w-3.5" /> Rappel :</span>
            {RAPPELS.map((r) => {
              const actif = tache.rappels.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={actif}
                  disabled={enCours}
                  onClick={() => appliquer({ rappels: actif ? tache.rappels.filter((x) => x !== r) : [...tache.rappels, r] }, false)}
                  className={cn('rounded-full px-2.5 py-1 text-[12px] font-semibold', actif ? 'bg-[#6E0F28] text-white' : 'border border-(--color-border) hover:bg-(--color-surface-soft)')}
                >
                  {LIBELLE_RAPPEL[r]}
                </button>
              );
            })}
          </div>
        )}

        {erreur && <p className="text-sm font-semibold text-[#9B0F2C]">{erreur}</p>}

        <div className="flex flex-wrap gap-2 border-t border-(--color-border) pt-3">
          {tache.lien && !tache.postitArchive && (
            <Link href={tache.lien} className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-[13px] font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)">
              <ExternalLink className="h-3.5 w-3.5" /> Ouvrir l’item et le Post-it
            </Link>
          )}
          <Link href={`/mes-post-it?postit=${tache.postitId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-[13px] font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)">
            <Library className="h-3.5 w-3.5" /> Voir le Post-it
          </Link>
          <button type="button" disabled={enCours} onClick={() => appliquer({ date: null, heure: null })} className="ml-auto text-[12.5px] font-semibold text-(--color-ink-soft) underline-offset-2 hover:underline">
            Retirer de l’agenda
          </button>
        </div>
        <p className="text-[11.5px] text-(--color-ink-muted)">{libelleEcheance(tache.date, tache.heure)} · Sans effet sur votre planificateur ni vos statistiques.</p>
      </DialogContent>
    </Dialog>
  );
}
