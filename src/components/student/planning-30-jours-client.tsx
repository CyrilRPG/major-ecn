'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, ExternalLink, Monitor, NotebookPen, UserRound,
} from 'lucide-react';
import {
  comparerMois, decalerMois, dureeLisible, estAVenir, grilleDuMois, jourParDefaut, libelleJourCourt,
  libelleJourLong, moisDe, plageHoraire, prochainesSeances, regrouperParJour, titreMois,
  type EvenementPlanning, type InstantParis, type Mois,
} from '@/lib/agenda/planning';

/*
 * Palette de la maquette « Mes 30 prochains jours » (24/09/2026) : bordeaux
 * Major ECN et roses pâles, posés en variables CSS locales à la carte.
 * (Rien n'est exporté : une constante d'un module 'use client' arrive vide
 * côté serveur.)
 */
const PALETTE = {
  '--pl-bordeaux': '#861427',
  '--pl-rose': '#FBF1F0',
  '--pl-rose-jour': '#F8E6E8',
  '--pl-icone-bg': '#FCEAEC',
  '--pl-icone-fg': '#A91D2C',
  '--pl-ligne': '#F7F5F3',
} as CSSProperties;

const JOURS_SEMAINE = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Props = {
  evenements: EvenementPlanning[];
  present: InstantParis;
  /** Dernier jour chargé (aujourd'hui + 30). */
  fin: string;
};

export function Planning30JoursClient({ evenements, present, fin }: Props) {
  const parJour = useMemo(() => regrouperParJour(evenements), [evenements]);
  const [selection, setSelection] = useState(() => jourParDefaut(evenements, present));
  const moisMin = moisDe(present.date);
  const moisMax = moisDe(fin);
  const [mois, setMois] = useState<Mois>(() => moisDe(selection));

  const semaines = useMemo(() => grilleDuMois(mois), [mois]);
  const { genre: genreListe, liste } = useMemo(() => prochainesSeances(evenements, present), [evenements, present]);
  const aucunEvenement = evenements.length === 0;
  const evenementsDuJour = parJour.get(selection) ?? [];

  const peutReculer = comparerMois(mois, moisMin) > 0;
  const peutAvancer = comparerMois(mois, moisMax) < 0;

  const choisir = (date: string) => {
    setSelection(date);
    const m = moisDe(date);
    if (comparerMois(m, mois) !== 0) setMois(m);
  };

  return (
    <article
      className="@container rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6"
      style={PALETTE}
      aria-label="Mes 30 prochains jours"
    >
      <header className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--pl-icone-bg) text-(--pl-icone-fg)">
          <CalendarDays className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-black leading-tight tracking-tight text-(--color-ink)">Mes 30 prochains jours</h3>
          <p className="mt-1 text-[12.5px] leading-snug text-(--color-ink-soft)">Vos séances en direct et événements</p>
        </div>
      </header>

      <div className="mt-4 @min-[620px]:grid @min-[620px]:grid-cols-2 @min-[620px]:items-start @min-[620px]:gap-5">
        {/* ---------------- Calendrier ---------------- */}
        <div>
          <div className="rounded-2xl border border-(--color-border)/80 px-2 pb-1.5 pt-3 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <div className="flex items-center justify-between px-1">
              <BoutonMois
                label="Mois précédent"
                actif={peutReculer}
                onClick={() => setMois((m) => decalerMois(m, -1))}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
              </BoutonMois>
              <p className="text-[15.5px] font-extrabold tracking-tight text-(--color-ink)" aria-live="polite">{titreMois(mois)}</p>
              <BoutonMois
                label="Mois suivant"
                actif={peutAvancer}
                onClick={() => setMois((m) => decalerMois(m, 1))}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
              </BoutonMois>
            </div>

            <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold text-(--color-ink-muted)" aria-hidden>
              {JOURS_SEMAINE.map((j, i) => <span key={i}>{j}</span>)}
            </div>

            <div className="mt-1.5" role="grid" aria-label={titreMois(mois)}>
              {semaines.map((semaine, i) => (
                <div key={i} className="grid grid-cols-7" role="row">
                  {semaine.map((date, k) => (
                    <div key={k} className="flex h-[38px] items-center justify-center" role="gridcell">
                      {date && (
                        <CaseJour
                          date={date}
                          evenements={parJour.get(date) ?? []}
                          aujourdHui={date === present.date}
                          selectionne={date === selection}
                          horsFenetre={date > fin}
                          onChoisir={choisir}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 whitespace-nowrap px-0.5 text-[10.5px] text-(--color-ink-soft)">
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full bg-(--pl-bordeaux)" />Séance en direct
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full border-[1.5px] border-(--pl-bordeaux)" />Autre événement
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full border-[1.5px] border-(--color-border-strong)" />Aucun cours
            </li>
          </ul>
        </div>

        {/* ---------------- Jour choisi + prochaines séances ---------------- */}
        <div className="mt-4 @min-[620px]:mt-0">
          <section className="rounded-2xl bg-(--pl-rose) p-4" aria-live="polite">
            <p className="text-[13px] font-bold text-(--pl-bordeaux)">{libelleJourLong(selection)}</p>
            {evenementsDuJour.length === 0 ? (
              aucunEvenement ? (
                <div className="mt-2">
                  <p className="text-[15px] font-extrabold leading-snug text-(--color-ink)">Aucune séance programmée pour l’instant</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-(--color-ink-soft)">
                    Vos prochains cours en direct apparaîtront ici dès leur programmation. Ajoutez vos propres révisions depuis l’agenda.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-[13.5px] text-(--color-ink-soft)">Aucun cours ni événement ce jour-là.</p>
              )
            ) : (
              evenementsDuJour.map((e, i) => (
                <DetailEvenement key={e.id} e={e} present={present} separe={i > 0} />
              ))
            )}
          </section>

          {!aucunEvenement && (
            <section className="mt-5">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-[15px] font-extrabold tracking-tight text-(--color-ink)">
                  {genreListe === 'direct' ? 'Prochaines séances' : 'Prochains événements'}
                </h4>
                <Link
                  href="/agenda"
                  className="text-[13px] font-bold text-(--pl-bordeaux) underline decoration-[1.5px] underline-offset-4 hover:opacity-80"
                >
                  Voir tout
                </Link>
              </div>
              {liste.length === 0 ? (
                <p className="mt-2.5 text-[12.5px] text-(--color-ink-soft)">Aucune autre séance dans les 30 prochains jours.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {liste.map((e) => (
                    <li key={e.id}>
                      <LigneSeance e={e} active={e.date === selection} onChoisir={choisir} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <Link
            href="/agenda"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-(--pl-bordeaux)/55 bg-(--pl-rose)/60 text-[14px] font-bold text-(--pl-bordeaux) transition-colors hover:bg-(--pl-rose)"
          >
            Voir l’agenda complet <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */

function BoutonMois({ label, actif, onClick, children }: { label: string; actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!actif}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border-strong) bg-(--color-surface) text-(--pl-bordeaux) transition-colors hover:bg-(--pl-rose) disabled:cursor-default disabled:opacity-35 disabled:hover:bg-(--color-surface)"
    >
      {children}
    </button>
  );
}

function CaseJour({
  date, evenements, aujourdHui, selectionne, horsFenetre, onChoisir,
}: {
  date: string;
  evenements: EvenementPlanning[];
  aujourdHui: boolean;
  selectionne: boolean;
  horsFenetre: boolean;
  onChoisir: (date: string) => void;
}) {
  const direct = evenements.filter((e) => e.genre === 'direct').length;
  const autres = evenements.length - direct;
  const numero = Number(date.slice(8, 10));
  const resume = [
    direct > 0 ? `${direct} séance${direct > 1 ? 's' : ''} en direct` : null,
    autres > 0 ? `${autres} autre${autres > 1 ? 's' : ''} événement${autres > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(', ');

  const fond = selectionne
    ? 'bg-(--pl-bordeaux) text-white shadow-[0_6px_14px_-6px_rgba(134,20,39,0.7)]'
    : aujourdHui
      ? 'bg-(--pl-rose-jour) text-(--pl-bordeaux) font-extrabold'
      : horsFenetre
        ? 'text-(--color-ink-muted)'
        : 'text-(--color-ink) hover:bg-(--color-sand-100)';

  return (
    <button
      type="button"
      disabled={horsFenetre}
      onClick={() => onChoisir(date)}
      aria-pressed={selectionne}
      aria-current={aujourdHui ? 'date' : undefined}
      aria-label={`${libelleJourLong(date)}${aujourdHui ? ' (aujourd’hui)' : ''}${resume ? ` — ${resume}` : ''}`}
      className={`relative flex h-[34px] w-[34px] flex-col items-center justify-center rounded-full text-[13px] font-semibold tabular-nums leading-none transition-colors disabled:cursor-default ${fond}`}
    >
      {/* Même position pour tous les numéros d'une ligne, points dessous. */}
      <span className="-mt-[3px]">{numero}</span>
      {evenements.length > 0 && (
        <span aria-hidden className="absolute bottom-[4px] left-1/2 flex -translate-x-1/2 items-center gap-[3px]">
          {direct > 0 && <span className={`h-[5px] w-[5px] rounded-full ${selectionne ? 'bg-white' : 'bg-(--pl-bordeaux)'}`} />}
          {autres > 0 && <span className={`h-[5px] w-[5px] rounded-full border ${selectionne ? 'border-white' : 'border-(--pl-bordeaux)'}`} />}
        </span>
      )}
    </button>
  );
}

function DetailEvenement({ e, present, separe }: { e: EvenementPlanning; present: InstantParis; separe: boolean }) {
  const plage = plageHoraire(e.debut, e.fin);
  const duree = dureeLisible(e.debut, e.fin);
  const ouvert = e.lien && estAVenir(e, present);
  return (
    <div className={separe ? 'mt-3.5 border-t border-(--pl-bordeaux)/10 pt-3.5' : 'mt-1.5'}>
      <p className="text-[18px] font-extrabold leading-snug tracking-tight text-(--color-ink)">{e.titre}</p>
      <ul className="mt-2 space-y-1.5 text-[13.5px] text-(--color-ink)/80">
        <li className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{plage ? <>{plage}{duree && <> ({duree})</>}</> : 'Toute la journée'}</span>
        </li>
        {e.genre === 'direct' ? (
          <li className="flex items-center gap-2.5">
            <Monitor className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Cours en direct{e.lien && /zoom\.us/i.test(e.lien) ? ' - Zoom' : ''}</span>
          </li>
        ) : (
          <li className="flex items-center gap-2.5">
            <NotebookPen className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Événement personnel{e.categorie ? ` - ${e.categorie}` : ''}</span>
          </li>
        )}
        {e.intervenant && (
          <li className="flex items-center gap-2.5">
            <UserRound className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="font-bold text-(--color-ink)">{e.intervenant}</span>
          </li>
        )}
      </ul>
      {ouvert && (
        <a
          href={e.lien!}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--pl-bordeaux) text-[14px] font-bold text-white shadow-[0_10px_22px_-12px_rgba(134,20,39,0.8)] transition-transform hover:scale-[1.01]"
        >
          Accéder à la séance <ExternalLink className="h-4 w-4" strokeWidth={2.4} />
        </a>
      )}
    </div>
  );
}

function LigneSeance({ e, active, onChoisir }: { e: EvenementPlanning; active: boolean; onChoisir: (date: string) => void }) {
  const { jour, numero, mois } = libelleJourCourt(e.date);
  const plage = plageHoraire(e.debut, e.fin);
  return (
    <button
      type="button"
      onClick={() => onChoisir(e.date)}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-colors ${active ? 'bg-(--pl-rose) ring-1 ring-(--pl-bordeaux)/20' : 'bg-(--pl-ligne) hover:bg-(--pl-rose)'}`}
    >
      <span className="w-[88px] shrink-0 whitespace-nowrap leading-tight">
        <span className="block pl-3.5 text-[11px] text-(--color-ink-soft)">{jour} {numero}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[14px] text-(--color-ink)">
          <span
            aria-hidden
            className={`h-2 w-2 shrink-0 rounded-full ${e.genre === 'direct' ? 'bg-(--pl-bordeaux)' : 'border-[1.5px] border-(--pl-bordeaux)'}`}
          />
          {mois}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold text-(--color-ink)">{e.titre}</span>
        {plage && (
          <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-(--color-ink-soft)">
            <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />{plage}
          </span>
        )}
      </span>
    </button>
  );
}
