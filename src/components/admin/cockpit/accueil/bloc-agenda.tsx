'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronLeft, ChevronRight, FileText, Laptop, ListChecks, Phone, Plus, Presentation, Users, Video } from 'lucide-react';
import type { ElementAgenda, GenreAgenda } from '@/lib/cockpit/server/donnees';
import { ajouterJoursIso, lundiDe } from '@/lib/cockpit/regles';
import { cn } from '@/lib/utils';
import { useActionsCockpit } from '../actions-globales';
import { Bouton, Carte, EnteteCarte, Vide, ACTIF } from '../ui';

/** Couleurs de la légende de la maquette : Cours, Réunions, Échéances, Autre. */
export const COULEUR_GENRE: Record<GenreAgenda, string> = {
  cours: '#D92D3A', reunion: '#2F6FD6', echeance: '#EE8A2A', autre: '#2E9A55',
};
export const LIBELLE_GENRE: Record<GenreAgenda, string> = { cours: 'Cours', reunion: 'Réunions', echeance: 'Échéances', autre: 'Autre' };

const ICONE: Record<ElementAgenda['icone'], React.ComponentType<{ className?: string }>> = {
  visio: Video, appel: Phone, document: FileText, equipe: Users, ordinateur: Laptop, cours: Presentation, tache: ListChecks,
};

function libelleJour(iso: string, aujourdHui: string): string {
  if (iso === aujourdHui) return 'Aujourd’hui';
  if (iso === ajouterJoursIso(aujourdHui, 1)) return 'Demain';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** « Mon agenda » : Aujourd'hui / Semaine / Mois (§2, addendum A). */
export function BlocAgenda({
  elements, aujourdHui, jour, onJour, className,
}: {
  elements: ElementAgenda[];
  aujourdHui: string;
  jour: string;
  onJour: (j: string) => void;
  className?: string;
}) {
  const { ouvrir } = useActionsCockpit();
  const [vue, setVue] = React.useState<'jour' | 'semaine' | 'mois'>('jour');
  const lundi = lundiDe(jour);
  const filtre = (e: ElementAgenda) =>
    vue === 'jour' ? e.date === jour
      : vue === 'semaine' ? e.date >= lundi && e.date <= ajouterJoursIso(lundi, 6)
        : e.date.slice(0, 7) === jour.slice(0, 7) && e.date >= (jour.slice(0, 7) === aujourdHui.slice(0, 7) ? aujourdHui : jour.slice(0, 8) + '01');
  const liste = elements.filter(filtre);
  const parJour = new Map<string, ElementAgenda[]>();
  for (const e of liste) parJour.set(e.date, [...(parJour.get(e.date) ?? []), e]);

  return (
    <Carte className={cn('flex flex-col', className)}>
      <EnteteCarte icone={CalendarDays} titre="Mon agenda" lien="/admin/cockpit/agenda" />
      <div className="mx-4 mb-2 grid grid-cols-3 gap-1 rounded-xl bg-(--color-surface-soft) p-1 sm:mx-5" role="tablist">
        {([['jour', jour === aujourdHui ? 'Aujourd’hui' : libelleJour(jour, aujourdHui)], ['semaine', 'Semaine'], ['mois', 'Mois']] as const).map(([v, l]) => (
          <button key={v} type="button" role="tab" aria-selected={vue === v} onClick={() => { setVue(v); if (v === 'jour' && vue === 'jour') onJour(aujourdHui); }}
            className={cn('truncate rounded-lg py-1.5 text-[13px] font-medium capitalize transition-colors', vue === v ? ACTIF : 'text-(--color-ink-soft) hover:bg-white')}>
            {l}
          </button>
        ))}
      </div>
      <div className="max-h-[300px] min-h-[180px] flex-1 overflow-y-auto px-4 sm:px-5">
        {liste.length === 0 ? (
          <Vide>Rien de prévu {vue === 'jour' ? 'ce jour-là' : vue === 'semaine' ? 'cette semaine' : 'ce mois-ci'}.</Vide>
        ) : vue === 'jour' ? (
          <ul className="divide-y divide-(--color-border)">{liste.map((e) => <LigneAgenda key={e.id} e={e} aujourdHui={aujourdHui} />)}</ul>
        ) : (
          [...parJour.entries()].map(([j, es]) => (
            <div key={j} className="pb-2">
              <p className="sticky top-0 bg-(--color-surface) py-1 text-[11.5px] font-semibold uppercase tracking-wide text-(--color-primary)">{libelleJour(j, aujourdHui)}</p>
              <ul className="divide-y divide-(--color-border)">{es.map((e) => <LigneAgenda key={e.id} e={e} aujourdHui={aujourdHui} />)}</ul>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center px-4 pb-4 pt-2">
        <Bouton taille="sm" onClick={() => ouvrir('rdv', vue === 'jour' && jour !== aujourdHui ? { debut: new Date(`${jour}T09:00:00`).toISOString() } : undefined)}>
          <Plus /> Ajouter un rendez-vous
        </Bouton>
      </div>
    </Carte>
  );
}

function LigneAgenda({ e, aujourdHui }: { e: ElementAgenda; aujourdHui: string }) {
  const I = ICONE[e.icone];
  const couleur = COULEUR_GENRE[e.genre];
  const contenu = (
    <>
      <span className="w-[86px] shrink-0 pt-0.5 text-[12.5px] tabular-nums text-(--color-ink-soft)">
        {e.debut ? `${e.debut}${e.fin ? ` – ${e.fin}` : ''}` : 'Journée'}
      </span>
      <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-[2.5px] bg-white" style={{ borderColor: couleur }} />
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-[13.5px] font-semibold text-(--color-ink)', e.terminee && 'text-(--color-ink-muted) line-through')}>{e.titre}</span>
        {e.sousTitre && <span className="block truncate text-[12px] text-(--color-ink-soft)">{e.sousTitre}</span>}
      </span>
    </>
  );
  return (
    <li className="flex items-start gap-2 py-2">
      {e.href ? <Link href={e.href} className="flex min-w-0 flex-1 items-start gap-2 hover:opacity-80">{contenu}</Link> : <span className="flex min-w-0 flex-1 items-start gap-2">{contenu}</span>}
      {e.lienVisio && e.date === aujourdHui ? (
        <a href={e.lienVisio} target="_blank" rel="noopener" className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#C9D8F2] bg-[#EEF4FD] px-2 py-1 text-[12px] font-medium text-[#2F5DA8] hover:bg-[#E2ECFB]">
          <Video className="h-3.5 w-3.5" /> Rejoindre
        </a>
      ) : (
        <I className="mt-0.5 h-[18px] w-[18px] shrink-0 text-(--color-ink-soft)" />
      )}
    </li>
  );
}

/** Mini-calendrier du mois, points de couleur par type d'évènement. */
export function BlocCalendrier({
  elements, aujourdHui, jour, onJour, className,
}: {
  elements: ElementAgenda[];
  aujourdHui: string;
  jour: string;
  onJour: (j: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const [mois, setMois] = React.useState(aujourdHui.slice(0, 7));
  const [y, m] = mois.split('-').map(Number);
  const premier = `${mois}-01`;
  const debutGrille = lundiDe(premier);
  const jours = Array.from({ length: 42 }, (_, i) => ajouterJoursIso(debutGrille, i));
  const semaines = jours.slice(35, 42).every((j) => j.slice(0, 7) !== mois) ? jours.slice(0, 35) : jours;
  const genresParJour = new Map<string, Set<GenreAgenda>>();
  for (const e of elements) {
    const s = genresParJour.get(e.date) ?? new Set<GenreAgenda>();
    s.add(e.genre);
    genresParJour.set(e.date, s);
  }
  const charges = elements.length > 0 ? { min: elements[0].date, max: elements[elements.length - 1].date } : null;
  const titre = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const decaler = (n: number) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setMois(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  };
  const prochain = elements.find((e) => (e.source === 'rdv' || e.source === 'suivi') && e.date >= aujourdHui);

  return (
    <Carte className={cn('flex flex-col', className)}>
      <header className="flex items-center px-4 pb-1 pt-4 sm:px-5">
        <h2 className="text-[20px] font-semibold capitalize text-(--color-ink)">{titre}</h2>
        <div className="ml-auto flex gap-1">
          <button type="button" aria-label="Mois précédent" onClick={() => decaler(-1)} className="grid h-8 w-8 place-items-center rounded-lg text-(--color-ink) hover:bg-(--color-surface-soft)"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Mois suivant" onClick={() => decaler(1)} className="grid h-8 w-8 place-items-center rounded-lg text-(--color-ink) hover:bg-(--color-surface-soft)"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </header>
      <div className="px-3 sm:px-4">
        <div className="grid grid-cols-7 pb-1 text-center text-[12px] font-medium text-(--color-ink-soft)">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((j, i) => <span key={i}>{j}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {semaines.map((j) => {
            const horsMois = j.slice(0, 7) !== mois;
            const genres = [...(genresParJour.get(j) ?? [])];
            const estAujourdhui = j === aujourdHui;
            const selectionne = j === jour && !estAujourdhui;
            return (
              <button
                key={j}
                type="button"
                onClick={() => (charges && j >= charges.min && j <= charges.max ? onJour(j) : router.push(`/admin/cockpit/agenda?jour=${j}`))}
                className="flex flex-col items-center py-0.5 focus-ring rounded-lg"
                aria-label={j}
                aria-pressed={j === jour}
              >
                <span className={cn(
                  'grid h-8 w-8 place-items-center rounded-full text-[13px] tabular-nums',
                  horsMois ? 'text-(--color-ink-muted)' : 'text-(--color-ink)',
                  estAujourdhui && 'bg-[linear-gradient(135deg,#E4002B_0%,#F97316_100%)] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(228,0,43,0.7)]',
                  selectionne && 'ring-2 ring-(--color-primary)',
                )}>
                  {Number(j.slice(8))}
                </span>
                <span className="flex h-1.5 gap-0.5">
                  {genres.slice(0, 3).map((g) => <span key={g} className="h-1.5 w-1.5 rounded-full" style={{ background: COULEUR_GENRE[g] }} />)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 border-t border-(--color-border) py-2.5 text-[12px] text-(--color-ink-soft)">
          {(Object.keys(COULEUR_GENRE) as GenreAgenda[]).map((g) => (
            <span key={g} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COULEUR_GENRE[g] }} />{LIBELLE_GENRE[g]}</span>
          ))}
        </div>
      </div>
      <div className="mt-auto flex items-center gap-3 border-t border-(--color-border) px-4 py-3 sm:px-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)"><CalendarDays className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-(--color-ink)">Prochain rendez-vous</p>
          <p className="truncate text-[12.5px] text-(--color-primary)">
            {prochain ? `${libelleJour(prochain.date, aujourdHui).toLowerCase()}${prochain.debut ? ` à ${prochain.debut}` : ''} · ${prochain.titre}` : 'Aucun rendez-vous à venir'}
          </p>
        </div>
        <Link href={prochain?.href ?? '/admin/cockpit/agenda'} className="shrink-0 rounded-lg bg-(--color-primary) px-3 py-2 text-[12.5px] font-medium text-white hover:bg-(--color-primary-deep)">
          Voir les détails
        </Link>
      </div>
    </Carte>
  );
}
