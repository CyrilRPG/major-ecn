'use client';

import { useEffect, useState, useTransition } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, ExternalLink, PenLine, Plus, Star, Trash2, User, Video } from 'lucide-react';
import { SignaturePad } from '@/components/student/signature-pad';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { upsertAgendaEvent, deleteAgendaEvent } from '@/app/(student)/agenda/actions';
import { etatEmargement, instantParis, libelleJourLong } from '@/lib/agenda/planning';
import { cesure } from '@/lib/cesure';
import type { SujetAgenda } from '@/lib/agenda/sujets';
import { BlocSujets, CarteSujet, DialogueSujet, PastilleSujet } from '@/components/student/agenda-sujets';
import type { TacheAgenda } from '@/lib/postits/agenda';
import {
  BarreFiltresAgenda, CarteTachePostit, DialogueTachePostit, ordreHoraire, useFiltresAgenda,
} from '@/components/postits/agenda-taches';

/* ────────────────────────────────────────────────────────────────────────── */
/*  Évènements « plateforme » (créés par admin, déjà filtrés côté serveur     */
/*  selon les permissions de l'étudiant)                                       */
/* ────────────────────────────────────────────────────────────────────────── */
export type PlatformEvent = {
  id: string;
  title: string;
  date: string;             // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  college: string | null;
  intervenant: string | null;
  /** Toujours null côté élève : le lien n'est remis qu'après émargement. */
  zoom_url: string | null;
  /** La séance a une visio (sans en donner le lien). */
  visio?: 'zoom' | 'autre' | null;
  notes: string | null;
};

/** Palette pour les évènements plateforme (par collège, libellé texte). */
const COLLEGE_PALETTE: Record<string, { bg: string; fg: string; tag: string }> = {
  'Cardiologie':           { bg: '#FFF1E6', fg: '#B35900', tag: '#FCD9A8' },
  'Pneumologie':           { bg: '#E5F1FF', fg: '#1E4D8B', tag: '#BBD7F7' },
  'Maladies infectieuses': { bg: '#E7F6EC', fg: '#16793C', tag: '#BFE2C9' },
  'ECOS':                  { bg: '#FFF7DC', fg: '#8A6300', tag: '#F3E0A0' },
  'Néphrologie':           { bg: '#FDE7E9', fg: '#C0001F', tag: '#FACBD0' },
  'Transversal':           { bg: '#FFEED5', fg: '#A65500', tag: '#F4D2A1' },
};
const DEFAULT_PALETTE = { bg: '#FDE7E9', fg: '#C0001F', tag: '#FACBD0' };
const paletteFor = (college: string | null | undefined) => {
  if (!college) return DEFAULT_PALETTE;
  return COLLEGE_PALETTE[college] ?? DEFAULT_PALETTE;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Évènements personnels (un par étudiant, depuis la DB)                    */
/* ────────────────────────────────────────────────────────────────────────── */
export type UserEvent = {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  category: string | null;
  color_key: ColorKey;
  notes: string | null;
};

type ColorKey = 'violet' | 'rose' | 'bleu' | 'vert' | 'orange' | 'turquoise';
const COLORS: Record<ColorKey, { bg: string; fg: string; tag: string; label: string }> = {
  violet:    { bg: '#F1E8FD', fg: '#5B2BB8', tag: '#D9C5F4', label: 'Violet' },
  rose:      { bg: '#FCE7F1', fg: '#8C1A55', tag: '#F0BFD8', label: 'Rose' },
  bleu:      { bg: '#E5F1FF', fg: '#1E4D8B', tag: '#BBD7F7', label: 'Bleu' },
  vert:      { bg: '#E7F6EC', fg: '#16793C', tag: '#BFE2C9', label: 'Vert' },
  orange:    { bg: '#FFEED5', fg: '#A65500', tag: '#F4D2A1', label: 'Orange' },
  turquoise: { bg: '#E0F2EF', fg: '#0F6F66', tag: '#BADFD8', label: 'Turquoise' },
};

/* ────────────────────────────────────────────────────────────────────────── */
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/**
 * Renvoie les 7 jours (lundi → dimanche) de la semaine courante décalée
 * de `offset` semaines (négatif = passé, positif = futur).
 */
function weekDates(offset = 0, aujourdHui?: string): Date[] {
  // Jour de référence donné par le serveur en heure de PARIS : le rendu serveur
  // (UTC) et le navigateur tombent ainsi sur la même semaine, même le lundi
  // entre minuit et 2 h.
  const now = aujourdHui ? depuisCle(aujourdHui) : new Date();
  const dow = (now.getDay() + 6) % 7; // 0 = lundi
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - dow + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// Date du jour AFFICHÉ, en heure locale. Surtout pas `toISOString()` : à
// Paris (UTC+1/+2), minuit local est encore la veille en UTC, et chaque
// évènement était enregistré un jour trop tôt (ORL du 29/09 stocké le 28).
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** « AAAA-MM-JJ » → minuit local de ce jour. */
function depuisCle(cle: string): Date {
  const [a, m, j] = cle.split('-').map(Number);
  return new Date(a, m - 1, j);
}
/** Semaines entre la semaine de `aujourdHui` et celle de `cible` (lundi → lundi). */
function ecartSemaines(aujourdHui: string, cible: string): number {
  const lundi = (d: Date) => { const x = new Date(d); x.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return x; };
  const jours = Math.round((lundi(depuisCle(cible)).getTime() - lundi(depuisCle(aujourdHui)).getTime()) / 86_400_000);
  return Math.round(jours / 7);
}

/* ════════════════════════════════════════════════════════════════════════ */
export function AgendaWeek({
  userEvents, platformEvents = [], signedEventIds = [], aujourdHui, seanceInitiale = null, sujets = [], tachesPostit = [],
}: {
  userEvents: UserEvent[];
  platformEvents?: PlatformEvent[];
  /** Sessions déjà émargées par l'étudiant : on ne redemande pas sa signature. */
  signedEventIds?: string[];
  /** Aujourd'hui à Paris (AAAA-MM-JJ), fourni par le serveur. */
  aujourdHui?: string;
  /** Séance à ouvrir d'emblée (lien « Émarger et accéder » du planning). */
  seanceInitiale?: string | null;
  /** Séances datées de la bibliothèque (sujet à préparer, replay), cf. lib/agenda/sujets. */
  sujets?: SujetAgenda[];
  /** Tâches datées des Post-it (lues dans les Post-it, jamais copiées). */
  tachesPostit?: TacheAgenda[];
}) {
  const initiale = seanceInitiale ? platformEvents.find((e) => e.id === seanceInitiale) ?? null : null;
  // Décalage en semaines par rapport à la semaine courante (0 = cette
  // semaine, -1 = semaine précédente, +1 = semaine prochaine…).
  const [weekOffset, setWeekOffset] = useState(() =>
    initiale && aujourdHui ? ecartSemaines(aujourdHui, initiale.date) : 0);
  const dates = weekDates(weekOffset, aujourdHui);
  const todayKey = (aujourdHui ? depuisCle(aujourdHui) : new Date()).toDateString();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformEvent | null>(initiale);
  const [selectedPersonal, setSelectedPersonal] = useState<UserEvent | null>(null);
  const [creatingFor, setCreatingFor] = useState<Date | null>(null);
  const [editing, setEditing] = useState<UserEvent | null>(null);
  const [sujetOuvert, setSujetOuvert] = useState<SujetAgenda | null>(null);
  // Natures d'activité affichées (cours en direct, personnelles, tâches Post-it).
  const [filtres, setFiltres] = useFiltresAgenda();
  const [tacheOuverte, setTacheOuverte] = useState<string | null>(null);

  // Libellé de la semaine en cours (ex. « 27 mai → 2 juin 2026 »).
  const weekLabel = (() => {
    const first = dates[0];
    const last = dates[6];
    const sameMonth = first.getMonth() === last.getMonth();
    const fmtDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' });
    const fmtFull = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });
    const year = last.getFullYear();
    return sameMonth
      ? `${fmtDay.format(first)} → ${fmtFull.format(last)} ${year}`
      : `${fmtFull.format(first)} → ${fmtFull.format(last)} ${year}`;
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Barre de navigation semaine */}
      <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 py-2 shadow-(--shadow-soft)">
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o - 1)}
          aria-label="Semaine précédente"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-ink)"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <p className="text-sm font-semibold text-(--color-ink) first-letter:uppercase">
            {weekLabel}
          </p>
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[11px] font-semibold text-(--color-primary-deep) hover:bg-(--color-primary)/15"
            >
              Aujourd’hui
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o + 1)}
          aria-label="Semaine suivante"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-ink)"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <BarreFiltresAgenda filtres={filtres} onChange={setFiltres} nbTaches={tachesPostit.filter((t) => !t.fait).length} />

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:min-h-0 lg:grid-cols-7">
        {dates.map((date, i) => {
          // Évènements plateforme du jour (déjà filtrés par permissions
          // côté serveur).
          const platformEvs = platformEvents
            .filter((e) => filtres.direct && e.date === dateKey(date))
            .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
          const dayUserEvs = userEvents
            .filter((e) => filtres.perso && e.date === dateKey(date))
            .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
          const dayTaches = filtres.postit ? tachesPostit.filter((t) => t.date === dateKey(date)) : [];
          // Sujets sans séance correspondante dans l'agenda : carte à part.
          const daySujets = sujets.filter((s) => s.date === dateKey(date) && !s.evenementId);
          const isToday = date.toDateString() === todayKey;
          return (
            <div
              key={i}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-(--color-surface) shadow-(--shadow-soft) ${
                isToday ? 'border-(--color-primary) ring-2 ring-(--color-primary)/40' : 'border-(--color-border)'
              }`}
            >
              <div
                className={`flex items-baseline justify-between px-4 py-3 ${
                  isToday ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft)'
                }`}
              >
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${isToday ? 'text-white' : 'text-(--color-ink)'}`}>
                  {DAYS[i]}
                  {isToday && <Star className="h-3.5 w-3.5 fill-current" />}
                </span>
                <span className={`text-xs tabular-nums ${isToday ? 'text-white/80' : 'text-(--color-ink-muted)'}`}>
                  {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3">
                {platformEvs.length === 0 && dayUserEvs.length === 0 && daySujets.length === 0 && dayTaches.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-6">
                    <span className="text-xs text-(--color-ink-muted)">Aucun cours</span>
                  </div>
                )}

                {/* Évènements plateforme */}
                {platformEvs.map((e) => {
                  const pal = paletteFor(e.college);
                  return (
                    <button
                      key={`pf-${e.id}`}
                      type="button"
                      onClick={() => setSelectedPlatform(e)}
                      className="group flex min-w-0 flex-col rounded-xl border border-transparent p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-soft) focus-ring"
                      style={{ background: pal.bg, order: ordreHoraire(e.start_time) }}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: pal.fg }}>
                        <Clock className="h-3.5 w-3.5" />
                        {e.start_time ? `${e.start_time.slice(0, 5)}${e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ''}` : 'Journée'}
                      </span>
                      <span className="mt-2 block text-sm font-semibold leading-snug text-(--color-ink) hyphens-manual [overflow-wrap:anywhere]">
                        {cesure(e.title)}
                      </span>
                      {e.college && (
                        <span
                          className="mt-1.5 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{ background: pal.tag, color: pal.fg }}
                        >
                          {e.college}
                        </span>
                      )}
                      {(e.visio || e.zoom_url) && (
                        <span className="mt-2 flex items-center gap-1 text-[11px] text-(--color-ink-muted)">
                          <Video className="h-3 w-3" />
                          Cours en visio
                        </span>
                      )}
                      <PastilleSujet sujets={sujets.filter((s) => s.evenementId === e.id)} />
                    </button>
                  );
                })}

                {/* Sujets à préparer sans séance correspondante */}
                {daySujets.map((s) => (
                  <CarteSujet key={`sj-${s.id}`} sujet={s} onOpen={() => setSujetOuvert(s)} />
                ))}

                {/* Évènements personnels (dashed-border pour distinguer) */}
                {dayUserEvs.map((e) => {
                  const c = COLORS[e.color_key] ?? COLORS.violet;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedPersonal(e)}
                      className="group flex min-w-0 flex-col rounded-xl border border-dashed p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-soft) focus-ring"
                      style={{ background: c.bg, borderColor: c.fg + '55', order: ordreHoraire(e.start_time) }}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: c.fg }}>
                        <Clock className="h-3.5 w-3.5" />
                        {e.start_time ? `${e.start_time.slice(0, 5)}${e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ''}` : 'Journée'}
                      </span>
                      <span className="mt-2 block text-sm font-semibold leading-snug text-(--color-ink) hyphens-manual [overflow-wrap:anywhere]">
                        {cesure(e.title)}
                      </span>
                      {e.category && (
                        <span
                          className="mt-1.5 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{ background: c.tag, color: c.fg }}
                        >
                          {e.category}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Tâches Post-it : à leur heure, ou en tête de journée (ordre CSS). */}
                {dayTaches.map((t) => (
                  <CarteTachePostit key={`pi-${t.id}`} tache={t} onOpen={() => setTacheOuverte(t.id)} />
                ))}

                {/* Bouton « + Ajouter » discret en pied de colonne */}
                <button
                  type="button"
                  onClick={() => { setEditing(null); setCreatingFor(date); }}
                  className="order-last mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-(--color-border) py-2 text-xs font-medium text-(--color-ink-muted) transition-colors hover:border-(--color-primary)/60 hover:bg-(--color-primary-soft)/40 hover:text-(--color-primary)"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog : détail d'un évènement plateforme (lecture seule, lien Zoom) */}
      <Dialog open={selectedPlatform != null} onOpenChange={(o) => !o && setSelectedPlatform(null)}>
        <DialogContent className="max-w-md">
          {selectedPlatform && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-(--color-primary)" />
                  {selectedPlatform.title}
                </DialogTitle>
                {selectedPlatform.college && <DialogDescription>{selectedPlatform.college}</DialogDescription>}
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-(--color-ink)">
                  <CalendarDays className="h-4 w-4 text-(--color-ink-muted)" />
                  {new Date(selectedPlatform.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </div>
                {selectedPlatform.start_time && (
                  <div className="flex items-center gap-2.5 text-(--color-ink)">
                    <Clock className="h-4 w-4 text-(--color-ink-muted)" />
                    {selectedPlatform.start_time.slice(0, 5)}
                    {selectedPlatform.end_time && ` – ${selectedPlatform.end_time.slice(0, 5)}`}
                  </div>
                )}
                {selectedPlatform.intervenant && (
                  <div className="flex items-center gap-2.5 text-(--color-ink)">
                    <User className="h-4 w-4 text-(--color-ink-muted)" />
                    {selectedPlatform.intervenant}
                  </div>
                )}
                {selectedPlatform.notes && (
                  <p className="rounded-lg bg-(--color-surface-soft) p-3 text-xs text-(--color-ink-soft) whitespace-pre-wrap">
                    {selectedPlatform.notes}
                  </p>
                )}
                {(selectedPlatform.visio || selectedPlatform.zoom_url) && (
                  <ZoomJoinBlock
                    key={selectedPlatform.id}
                    event={selectedPlatform}
                    alreadySigned={signedEventIds.includes(selectedPlatform.id)}
                  />
                )}
                <BlocSujets sujets={sujets.filter((s) => s.evenementId === selectedPlatform.id)} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog : sujet sans séance correspondante dans l'agenda */}
      <DialogueSujet sujet={sujetOuvert} onClose={() => setSujetOuvert(null)} />

      {/* Dialog : détail d'un évènement personnel (édition + suppression) */}
      <PersonalEventDialog
        event={selectedPersonal}
        onClose={() => setSelectedPersonal(null)}
        onEdit={(e) => { setSelectedPersonal(null); setEditing(e); setCreatingFor(new Date(e.date + 'T00:00:00')); }}
      />

      {/* Dialog : tâche d'un Post-it (même ligne que dans le Post-it) */}
      <DialogueTachePostit
        key={tacheOuverte ?? 'aucune'}
        tache={tachesPostit.find((t) => t.id === tacheOuverte) ?? null}
        onClose={() => setTacheOuverte(null)}
        aujourdHui={aujourdHui ?? dateKey(new Date())}
      />

      {/* Dialog : création / édition d'un évènement personnel */}
      <EventFormDialog
        open={creatingFor != null}
        date={creatingFor}
        initial={editing}
        onClose={() => { setCreatingFor(null); setEditing(null); }}
      />
    </div>
  );
}

/* ───────────── Émargement obligatoire avant d'ouvrir le lien Zoom ─────────
 *
 * L'émargement porte une SIGNATURE MANUSCRITE, comme les vidéos de la
 * plateforme : les deux origines ont ainsi la même valeur probatoire.
 *
 * Déroulé en deux temps, volontairement : on signe, PUIS le lien Zoom
 * s'active sous forme de vraie ancre. Ouvrir la fenêtre en JavaScript après
 * l'attente réseau se ferait bloquer par les bloqueurs de pop-up, qui
 * n'autorisent `window.open` que dans le geste utilisateur lui-même.
 */
function ZoomJoinBlock({ event, alreadySigned }: { event: PlatformEvent; alreadySigned: boolean }) {
  const [signature, setSignature] = useState<string | null>(null);
  const [signed, setSigned] = useState(alreadySigned);
  // Le lien n'est jamais dans la page : la route le remet après émargement
  // (ou tout de suite si la séance est déjà émargée).
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fenêtre d'émargement (1 h avant → 3 h après), même règle que la route.
  const [fenetre] = useState(() => etatEmargement(event, instantParis()));

  // Séance déjà émargée : on récupère le lien sans redemander de signature.
  useEffect(() => {
    if (!alreadySigned) return;
    let annule = false;
    demanderLienSeance(event.id)
      .then((u) => { if (!annule) setUrl(u); })
      .catch((e) => { if (!annule) setError(e instanceof Error ? e.message : 'Lien indisponible'); });
    return () => { annule = true; };
  }, [alreadySigned, event.id]);

  async function emarger() {
    if (!signature || busy) return;
    setBusy(true);
    setError(null);
    try {
      const u = await demanderLienSeance(event.id, signature);
      setUrl(u);
      setSigned(true);
    } catch (e) {
      // Contrairement à l'ancien comportement « best-effort », on n'ouvre PAS
      // le lien si l'émargement a échoué : une session suivie sans émargement
      // laisse un trou dans le dossier de formation.
      setError(e instanceof Error ? e.message : 'Émargement impossible');
    } finally {
      setBusy(false);
    }
  }

  if (!signed && fenetre.etat !== 'ouvert') {
    return (
      <p className="mt-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3 text-[13px] leading-snug text-(--color-ink-soft)">
        {fenetre.etat === 'avant' && fenetre.ouverture
          ? <>L’émargement et le lien du cours ouvriront le {libelleJourLong(fenetre.ouverture.date).toLowerCase()} à {fenetre.ouverture.heure.replace(':', ' h ')}, une heure avant le début.</>
          : <>Cette séance est terminée : l’émargement est clos.</>}
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-2.5">
      {!signed ? (
        <>
          <div className="rounded-xl border p-3" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-[13px] leading-snug text-(--color-ink)">
              Signez votre émargement pour accéder à la session{' '}
              <span className="font-semibold text-(--color-danger)">(obligatoire)</span>.
            </p>
            <div className="mt-2.5">
              <SignaturePad onChange={setSignature} disabled={busy} />
            </div>
          </div>
          {error && (
            <p className="text-[12.5px] font-semibold text-(--color-danger)">{error}</p>
          )}
          <button
            type="button"
            onClick={emarger}
            disabled={!signature || busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PenLine className="h-4 w-4" />
            {busy ? 'Émargement…' : 'Valider mon émargement'}
          </button>
        </>
      ) : (
        <>
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-(--color-primary)">
            <Check className="h-3.5 w-3.5" /> Émargement enregistré.
          </p>
          {error && <p className="text-[12.5px] font-semibold text-(--color-danger)">{error}</p>}
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              <Video className="h-4 w-4" />
              Rejoindre le cours{event.visio === 'zoom' ? ' sur Zoom' : ''}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : !error && (
            <p className="text-[12.5px] text-(--color-ink-soft)">Récupération du lien…</p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Émarge (avec signature) ou, pour une séance déjà émargée, redemande
 * simplement le lien : /api/presences ne le remet qu'à un élève émargé.
 */
async function demanderLienSeance(eventId: string, signaturePng?: string): Promise<string | null> {
  const res = await fetchAvecJetonFrais('/api/presences', {
    eventId,
    ...(signaturePng ? { signaturePng } : {}),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string; zoomUrl?: string | null };
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? 'Votre session a expiré. Rechargez la page, puis réémargez.'
        : json.error ?? 'Émargement impossible',
    );
  }
  return json.zoomUrl ?? null;
}

/* ──────────────────────── Dialog : détail évènement perso ────────────── */
function PersonalEventDialog({
  event,
  onClose,
  onEdit,
}: {
  event: UserEvent | null;
  onClose: () => void;
  onEdit: (e: UserEvent) => void;
}) {
  const [, startTransition] = useTransition();
  const c = event ? COLORS[event.color_key] ?? COLORS.violet : COLORS.violet;
  return (
    <Dialog open={event != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {event && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" style={{ color: c.fg }} />
                {event.title}
              </DialogTitle>
              <DialogDescription>{event.category}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2.5 text-(--color-ink)">
                <CalendarDays className="h-4 w-4 text-(--color-ink-muted)" />
                {new Date(event.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </div>
              {event.start_time && (
                <div className="flex items-center gap-2.5 text-(--color-ink)">
                  <Clock className="h-4 w-4 text-(--color-ink-muted)" />
                  {event.start_time.slice(0, 5)}
                  {event.end_time && ` – ${event.end_time.slice(0, 5)}`}
                </div>
              )}
              {event.notes && (
                <p className="rounded-lg bg-(--color-surface-soft) p-3 text-xs text-(--color-ink-soft) whitespace-pre-wrap">
                  {event.notes}
                </p>
              )}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('Supprimer cet évènement ?')) return;
                    startTransition(async () => {
                      // Une suppression échouée fermait la fenêtre comme si tout allait bien.
                      const res = await deleteAgendaEvent(event.id).catch(() => ({ error: 'Suppression impossible (connexion ?).' }));
                      if ('error' in res && res.error) alert(res.error);
                      else onClose();
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-ink-soft) hover:border-(--color-primary)/60 hover:text-(--color-primary)"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(event)}
                  className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Modifier
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────── Dialog : formulaire ajout/edit ─────────────── */
function EventFormDialog({
  open, date, initial, onClose,
}: {
  open: boolean;
  date: Date | null;
  initial: UserEvent | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (formData: FormData) => {
    setErr(null);
    startTransition(async () => {
      const res = await upsertAgendaEvent(formData);
      if (res.error) setErr(res.error);
      else onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Modifier l’évènement' : 'Ajouter un évènement'}</DialogTitle>
          <DialogDescription>
            {date?.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-3">
          {initial && <input type="hidden" name="id" value={initial.id} />}
          <input type="hidden" name="date" value={initial?.date ?? (date ? dateKey(date) : '')} />

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-(--color-ink-soft)">Titre</span>
            <input
              name="title"
              defaultValue={initial?.title ?? ''}
              required
              maxLength={120}
              placeholder="Ex. : Réviser cardiologie — items 230 à 234"
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-(--color-ink-soft)">Début</span>
              <input
                type="time"
                name="start_time"
                defaultValue={initial?.start_time?.slice(0, 5) ?? ''}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-(--color-ink-soft)">Fin</span>
              <input
                type="time"
                name="end_time"
                defaultValue={initial?.end_time?.slice(0, 5) ?? ''}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-(--color-ink-soft)">Catégorie</span>
              <select
                name="category"
                defaultValue={initial?.category ?? 'Révision'}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
              >
                <option>Révision</option>
                <option>Examen</option>
                <option>Stage</option>
                <option>Autre</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-(--color-ink-soft)">Couleur</span>
              <select
                name="color_key"
                defaultValue={initial?.color_key ?? 'violet'}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
              >
                {(Object.keys(COLORS) as ColorKey[]).map((k) => (
                  <option key={k} value={k}>{COLORS[k].label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-(--color-ink-soft)">Notes (optionnel)</span>
            <textarea
              name="notes"
              defaultValue={initial?.notes ?? ''}
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
            />
          </label>

          {err && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{err}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-ink-soft) hover:bg-(--color-surface-soft)"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-soft) hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Enregistrement…' : (initial ? 'Mettre à jour' : 'Ajouter')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
