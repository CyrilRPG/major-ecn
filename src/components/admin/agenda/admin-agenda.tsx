'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import {
  AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Edit, Layers, Link2, Plus, Printer, Search, Trash2, X,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { upsertPlatformEvent, deletePlatformEvent } from '@/app/admin/agenda/actions';
import {
  DUREE_PAR_DEFAUT, TEINTE_TOUTES, disposer, minutes, palettesSpecialites, type Place, type Teinte,
} from '@/lib/agenda/admin-vue';

export type PlatformEventRow = {
  id: string;
  title: string;
  date: string;          // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  college: string | null;
  intervenant: string | null;
  zoom_url: string | null;
  notes: string | null;
  required_offers: string[] | null;
  scope_type: 'all' | 'college';
  scope_colleges: string[] | null;
  voies: string[] | null;
};

type College = { id: string; nom: string; parentId?: string | null };
const MG_COLLEGE_ID = 'col-medecine-generale';
const FORMULES = ['essentiel', 'intensif', 'approfondi'] as const;
type Formule = (typeof FORMULES)[number];
const FORMULE_LABEL: Record<Formule, string> = { essentiel: 'Essentiel', intensif: 'Intensif', approfondi: 'Approfondi' };

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAYS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
/** Hauteur d'une heure dans la grille horaire (px). */
const H_HEURE = 52;

// Dates du jour AFFICHÉ, en heure locale. Surtout pas `toISOString()` : à
// Paris (UTC+1/+2), minuit local est encore la veille en UTC, et chaque
// évènement était enregistré un jour trop tôt (ORL du 29/09 stocké le 28).
/** « AAAA-MM-JJ » → minuit local de ce jour. */
function depuisCle(cle: string): Date {
  const [a, m, j] = cle.split('-').map(Number);
  return new Date(a, m - 1, j);
}
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const plusJours = (cle: string, n: number) => { const d = depuisCle(cle); d.setDate(d.getDate() + n); return dateKey(d); };
const plusMois = (cle: string, n: number) => { const d = depuisCle(cle); d.setDate(1); d.setMonth(d.getMonth() + n); return dateKey(d); };
const lundiDe = (cle: string) => { const d = depuisCle(cle); return plusJours(cle, -((d.getDay() + 6) % 7)); };
const premierDuMois = (cle: string) => `${cle.slice(0, 7)}-01`;
const dernierDuMois = (cle: string) => plusJours(plusMois(premierDuMois(cle), 1), -1);

const fmt = (cle: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fr-FR', o).format(depuisCle(cle));
const horaire = (e: PlatformEventRow) =>
  e.start_time ? `${e.start_time.slice(0, 5)}${e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ''}` : 'Journée';
const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const debutMin = (e: PlatformEventRow) => (e.start_time ? minutes(e.start_time) : 0);
const finMin = (e: PlatformEventRow) => {
  const d = debutMin(e);
  const f = e.end_time ? minutes(e.end_time) : d + DUREE_PAR_DEFAUT;
  return f > d ? f : d + DUREE_PAR_DEFAUT;
};

type Vue = 'jour' | 'semaine' | 'mois' | 'liste';
type PresetListe = '3' | '6' | '12' | 'perso';

/** Couleurs d'un évènement : une par spécialité ciblée (bleu nuit si toutes). */
type Couleurs = (e: PlatformEventRow) => Teinte[];

/* ════════════════════════════════════════════════════════════════════════ */
export function AdminAgenda({
  events, colleges, aujourdHui,
}: {
  events: PlatformEventRow[];
  colleges: College[];
  /** Aujourd'hui à Paris (AAAA-MM-JJ), fourni par le serveur. */
  aujourdHui?: string;
}) {
  const today = aujourdHui ?? dateKey(new Date());
  const [vue, setVue] = useState<Vue>('semaine');
  const [ancre, setAncre] = useState(today);
  const [preset, setPreset] = useState<PresetListe>('3');
  const [debutListe, setDebutListe] = useState(premierDuMois(today));
  const [finListe, setFinListe] = useState(plusJours(plusMois(premierDuMois(today), 3), -1));

  // Filtres
  const [specialite, setSpecialite] = useState<string | null>(null);
  const [inclureToutes, setInclureToutes] = useState(true);
  const [formules, setFormules] = useState<Formule[]>([...FORMULES]);
  const [recherche, setRecherche] = useState('');

  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<PlatformEventRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const nomDe = useMemo(() => new Map(colleges.map((c) => [c.id, c.nom])), [colleges]);
  const parentDe = useMemo(() => new Map(colleges.filter((c) => c.parentId).map((c) => [c.id, c.parentId!])), [colleges]);
  const teintes = useMemo(() => palettesSpecialites(colleges.map((c) => c.id)), [colleges]);
  const couleurs: Couleurs = useMemo(() => (e) => {
    if (e.scope_type !== 'college' || !(e.scope_colleges ?? []).length) return [TEINTE_TOUTES];
    return (e.scope_colleges ?? []).map((id) => teintes.get(id) ?? TEINTE_TOUTES);
  }, [teintes]);
  const libelleNom = (id: string) => {
    const p = parentDe.get(id);
    return p === MG_COLLEGE_ID ? `MG · ${nomDe.get(id) ?? id}` : (nomDe.get(id) ?? id);
  };

  const filtres = useMemo(() => {
    const q = normaliser(recherche.trim());
    const toutesFormules = formules.length === FORMULES.length;
    // Une spécialité de MG couvre aussi les évènements visant toute la MG ;
    // la MG couvre ceux de chacune de ses spécialités.
    const couvre = (id: string) => {
      if (!specialite) return true;
      if (id === specialite) return true;
      if (parentDe.get(id) === specialite) return true;
      if (parentDe.get(specialite) === id) return true;
      return false;
    };
    return (e: PlatformEventRow) => {
      if (!toutesFormules && !(e.required_offers ?? []).some((o) => formules.includes(o as Formule))) return false;
      if (specialite) {
        if (e.scope_type === 'all') { if (!inclureToutes) return false; }
        else if (!(e.scope_colleges ?? []).some(couvre)) return false;
      }
      if (q && !normaliser(`${e.title} ${e.intervenant ?? ''} ${e.college ?? ''}`).includes(q)) return false;
      return true;
    };
  }, [recherche, formules, specialite, inclureToutes, parentDe]);

  const visibles = useMemo(() => events.filter(filtres), [events, filtres]);
  const parJour = useMemo(() => {
    const m = new Map<string, PlatformEventRow[]>();
    for (const e of visibles) (m.get(e.date) ?? m.set(e.date, []).get(e.date)!).push(e);
    for (const l of m.values()) l.sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
    return m;
  }, [visibles]);

  // Plage affichée
  const plage = useMemo((): { debut: string; fin: string; libelle: string } => {
    if (vue === 'jour') return { debut: ancre, fin: ancre, libelle: fmt(ancre, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) };
    if (vue === 'semaine') {
      const debut = lundiDe(ancre); const fin = plusJours(debut, 6);
      const memeMois = debut.slice(0, 7) === fin.slice(0, 7);
      return {
        debut, fin,
        libelle: memeMois
          ? `${fmt(debut, { day: 'numeric' })} → ${fmt(fin, { day: 'numeric', month: 'long', year: 'numeric' })}`
          : `${fmt(debut, { day: 'numeric', month: 'long' })} → ${fmt(fin, { day: 'numeric', month: 'long', year: 'numeric' })}`,
      };
    }
    if (vue === 'mois') return { debut: premierDuMois(ancre), fin: dernierDuMois(ancre), libelle: fmt(ancre, { month: 'long', year: 'numeric' }) };
    const [d, f] = debutListe <= finListe ? [debutListe, finListe] : [finListe, debutListe];
    return { debut: d, fin: f, libelle: `${fmt(d, { day: 'numeric', month: 'short', year: 'numeric' })} → ${fmt(f, { day: 'numeric', month: 'short', year: 'numeric' })}` };
  }, [vue, ancre, debutListe, finListe]);

  const dansPlage = useMemo(
    () => visibles.filter((e) => e.date >= plage.debut && e.date <= plage.fin),
    [visibles, plage],
  );
  const sansLien = dansPlage.filter((e) => !e.zoom_url).length;

  // Légende : spécialités présentes sur la période (ordre de la plateforme).
  const legende = useMemo(() => {
    const presentes = new Set<string>();
    let toutes = false;
    for (const e of dansPlage) {
      if (e.scope_type !== 'college' || !(e.scope_colleges ?? []).length) toutes = true;
      else for (const id of e.scope_colleges ?? []) presentes.add(id);
    }
    return { ids: colleges.map((c) => c.id).filter((id) => presentes.has(id)), toutes };
  }, [dansPlage, colleges]);

  const naviguer = (sens: -1 | 1) => {
    if (vue === 'jour') setAncre((a) => plusJours(a, sens));
    else if (vue === 'semaine') setAncre((a) => plusJours(a, 7 * sens));
    else if (vue === 'mois') setAncre((a) => plusMois(a, sens));
    else {
      const mois = preset === 'perso' ? null : Number(preset);
      if (mois) {
        const debut = plusMois(premierDuMois(debutListe), sens * mois);
        setDebutListe(debut); setFinListe(plusJours(plusMois(debut, mois), -1));
      } else {
        const duree = Math.round((depuisCle(finListe).getTime() - depuisCle(debutListe).getTime()) / 86_400_000) + 1;
        setDebutListe((d) => plusJours(d, sens * duree)); setFinListe((f) => plusJours(f, sens * duree));
      }
    }
  };
  const choisirPreset = (p: PresetListe) => {
    setPreset(p);
    if (p !== 'perso') {
      const debut = premierDuMois(today);
      setDebutListe(debut); setFinListe(plusJours(plusMois(debut, Number(p)), -1));
    }
  };
  const ouvrir = (e: PlatformEventRow) => { setEditing(e); setCreatingFor(e.date); };
  const creer = (cle: string) => { setEditing(null); setCreatingFor(cle); };
  const libelleSpecialites = (e: PlatformEventRow) => libelleScope(e, nomDe);

  // Impression : seule la zone de l'agenda sort (en paysage, couleurs comprises).
  const imprimer = () => {
    document.body.classList.add('impression-agenda');
    const fin = () => { document.body.classList.remove('impression-agenda'); window.removeEventListener('afterprint', fin); };
    window.addEventListener('afterprint', fin);
    window.print();
  };

  const enAvant = vue !== 'liste' && !(today >= plage.debut && today <= plage.fin);
  const resumeFiltres = [
    specialite ? libelleNom(specialite) : 'Toutes les spécialités',
    formules.length === FORMULES.length ? 'toutes formules' : formules.map((f) => FORMULE_LABEL[f]).join(', '),
    recherche.trim() ? `« ${recherche.trim()} »` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <style>{CSS_IMPRESSION}</style>

      {/* ── Barre de vue ── */}
      <div className="no-print flex flex-wrap items-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 py-2 shadow-(--shadow-soft)">
        <div className="inline-flex rounded-xl bg-(--color-surface-soft) p-0.5" role="tablist" aria-label="Vue">
          {([['jour', 'Jour'], ['semaine', 'Semaine'], ['mois', 'Mois'], ['liste', 'Plage / plusieurs mois']] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={vue === v}
              onClick={() => setVue(v)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                vue === v ? 'bg-(--color-surface) text-(--color-ink) shadow-sm' : 'text-(--color-ink-soft) hover:text-(--color-ink)',
              )}
            >{l}</button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {vue === 'liste' && (
            <>
              <select
                value={preset}
                onChange={(e) => choisirPreset(e.target.value as PresetListe)}
                aria-label="Durée de la plage"
                className="h-8 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-xs font-semibold text-(--color-ink)"
              >
                <option value="3">3 mois</option>
                <option value="6">6 mois</option>
                <option value="12">12 mois</option>
                <option value="perso">Dates personnalisées</option>
              </select>
              <input
                type="date" value={debutListe} aria-label="Début de la plage"
                onChange={(e) => { if (e.target.value) { setDebutListe(e.target.value); setPreset('perso'); } }}
                className="h-8 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-xs text-(--color-ink)"
              />
              <span className="text-xs text-(--color-ink-muted)">→</span>
              <input
                type="date" value={finListe} aria-label="Fin de la plage"
                onChange={(e) => { if (e.target.value) { setFinListe(e.target.value); setPreset('perso'); } }}
                className="h-8 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-xs text-(--color-ink)"
              />
            </>
          )}
          <button type="button" onClick={() => naviguer(-1)} aria-label="Période précédente"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-[10rem] text-center text-sm font-semibold text-(--color-ink) first-letter:uppercase">{plage.libelle}</p>
          <button type="button" onClick={() => naviguer(1)} aria-label="Période suivante"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)">
            <ChevronRight className="h-4 w-4" />
          </button>
          {enAvant && (
            <button type="button" onClick={() => setAncre(today)}
              className="rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[11px] font-semibold text-(--color-primary-deep) hover:bg-(--color-primary)/15">
              Aujourd’hui
            </button>
          )}
          <button
            type="button"
            onClick={imprimer}
            className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-lg border border-(--color-border) px-2.5 text-xs font-semibold text-(--color-ink-soft) hover:border-(--color-primary)/50 hover:text-(--color-ink)"
          >
            <Printer className="h-3.5 w-3.5" /> Imprimer
          </button>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="no-print flex flex-wrap items-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5">
        <ChoixSpecialite colleges={colleges} valeur={specialite} onChange={setSpecialite} />
        {specialite && (
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-(--color-ink-soft)">
            <input type="checkbox" checked={inclureToutes} onChange={(e) => setInclureToutes(e.target.checked)} className="h-3.5 w-3.5" />
            avec les évènements « toutes spécialités »
          </label>
        )}
        <span className="mx-1 hidden h-5 w-px bg-(--color-border) sm:block" aria-hidden />
        <div className="flex flex-wrap gap-1.5" aria-label="Formules">
          {FORMULES.map((f) => {
            const actif = formules.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={actif}
                onClick={() => setFormules((cur) => (actif ? (cur.length > 1 ? cur.filter((x) => x !== f) : cur) : [...cur, f]))}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors',
                  actif ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)' : 'border-(--color-border) text-(--color-ink-muted) hover:text-(--color-ink)',
                )}
              >{FORMULE_LABEL[f]}</button>
            );
          })}
        </div>
        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)}
            placeholder="Titre, intervenant…" aria-label="Rechercher un évènement"
            className="h-8 w-full rounded-lg border border-(--color-border) bg-(--color-surface) pl-8 pr-2 text-xs text-(--color-ink) outline-none focus:border-(--color-primary)"
          />
        </div>
        <p className="w-full text-[11px] text-(--color-ink-muted)">
          {dansPlage.length} évènement{dansPlage.length > 1 ? 's' : ''} sur la période
          {sansLien > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 font-semibold text-[#B45309]">
              <AlertTriangle className="h-3 w-3" /> {sansLien} sans lien de visio
            </span>
          )}
        </p>
      </div>

      {message && (
        <p className="no-print flex items-start justify-between gap-3 rounded-xl border border-[#16793C]/30 bg-[#E7F6EC] px-3 py-2 text-xs font-semibold text-[#16793C]">
          {message}
          <button type="button" onClick={() => setMessage(null)} aria-label="Fermer" className="rounded p-0.5 hover:bg-white/60"><X className="h-3.5 w-3.5" /></button>
        </p>
      )}

      {/* ── Zone imprimable ── */}
      <div className="zone-impression flex flex-col gap-3">
        <div className="print-only mb-1 items-baseline justify-between border-b-2 border-[#1C2E49] pb-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B5934A]">Major ECN · Agenda des cours en direct</p>
            <p className="text-lg font-bold text-[#1C2E49] first-letter:uppercase">{plage.libelle}</p>
          </div>
          <p className="text-right text-[10px] text-[#55606E]">{resumeFiltres}<br />{dansPlage.length} évènement{dansPlage.length > 1 ? 's' : ''}</p>
        </div>

        {/* Légende des couleurs : clic = filtre sur la spécialité */}
        {(legende.ids.length > 0 || legende.toutes) && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 py-2">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Légende</span>
            {legende.toutes && <PastilleLegende teinte={TEINTE_TOUTES} libelle="Toutes spécialités" />}
            {legende.ids.map((id) => (
              <PastilleLegende
                key={id}
                teinte={teintes.get(id) ?? TEINTE_TOUTES}
                libelle={libelleNom(id)}
                actif={specialite === id}
                onClick={() => setSpecialite((s) => (s === id ? null : id))}
              />
            ))}
          </div>
        )}

        {(vue === 'semaine' || vue === 'jour') && (
          <GrilleHoraire
            jours={vue === 'jour' ? [plage.debut] : Array.from({ length: 7 }, (_, i) => plusJours(plage.debut, i))}
            today={today} parJour={parJour} couleurs={couleurs} specialites={libelleSpecialites}
            detail={vue === 'jour'} onOpen={ouvrir} onCreate={creer}
          />
        )}

        {vue === 'mois' && (
          <GrilleMois
            debut={plage.debut} fin={plage.fin} today={today} parJour={parJour} couleurs={couleurs}
            onOpen={ouvrir} onCreate={creer}
            onJour={(cle) => { setAncre(cle); setVue('jour'); }}
          />
        )}

        {vue === 'liste' && (
          <ListeEvenements events={dansPlage} specialites={libelleSpecialites} couleurs={couleurs} today={today} onOpen={ouvrir} />
        )}
      </div>

      {/* Monté à l'ouverture seulement, et remonté pour chaque évènement : les
          états du formulaire partent toujours de l'évènement ouvert. */}
      {creatingFor && (
        <EventFormDialog
          key={editing?.id ?? `nouveau-${creatingFor}`}
          open
          date={depuisCle(creatingFor)}
          initial={editing}
          colleges={colleges}
          passe={creatingFor < today}
          onClose={() => { setCreatingFor(null); setEditing(null); }}
          onSaved={(m) => setMessage(m)}
        />
      )}
    </div>
  );
}

/**
 * Impression : `window.print()` pose `impression-agenda` sur <body> ; seule la
 * zone de l'agenda reste visible, en A4 paysage, avec ses couleurs.
 */
const CSS_IMPRESSION = `
.print-only { display: none; }
@media print {
  @page { size: A4 landscape; margin: 10mm; }
  body.impression-agenda * { visibility: hidden !important; }
  body.impression-agenda .zone-impression, body.impression-agenda .zone-impression * { visibility: visible !important; }
  body.impression-agenda .zone-impression { position: absolute; left: 0; top: 0; width: 100%; }
  body.impression-agenda .zone-impression .print-only { display: flex; }
  body.impression-agenda .zone-impression .no-print { display: none !important; }
  body.impression-agenda .zone-impression * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-shadow: none !important; }
  body.impression-agenda .zone-impression .grille-scroll { overflow: visible !important; max-height: none !important; }
  body.impression-agenda .zone-impression section, body.impression-agenda .zone-impression tr { break-inside: avoid; }
}
`;

function PastilleLegende({ teinte, libelle, actif = false, onClick }: { teinte: Teinte; libelle: string; actif?: boolean; onClick?: () => void }) {
  const corps = (
    <>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: teinte.vive }} />
      {libelle}
    </>
  );
  const classe = 'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold';
  if (!onClick) return <span className={classe} style={{ background: teinte.fond, color: teinte.encre, borderColor: teinte.bord }}>{corps}</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={cn(classe, 'transition-shadow hover:shadow-sm', actif && 'ring-2 ring-offset-1')}
      style={{ background: teinte.fond, color: teinte.encre, borderColor: teinte.bord, ['--tw-ring-color' as string]: teinte.vive }}
    >{corps}</button>
  );
}

/** Spécialités d'un évènement en clair : « Maladies infectieuses », « Cardiologie, Pneumologie +2 ». */
function libelleScope(e: PlatformEventRow, nomDe: Map<string, string>): string {
  if (e.scope_type !== 'college') return 'Toutes spécialités';
  const noms = (e.scope_colleges ?? []).map((id) => nomDe.get(id) ?? id);
  if (noms.length === 0) return 'Aucune spécialité';
  return noms.length <= 2 ? noms.join(', ') : `${noms.slice(0, 2).join(', ')} +${noms.length - 2}`;
}

/** Bande colorée verticale : une couleur par spécialité ciblée. */
const bande = (ts: Teinte[]) => (ts.length === 1
  ? ts[0].vive
  : `linear-gradient(180deg, ${ts.map((t, i) => `${t.vive} ${(i / ts.length) * 100}% ${((i + 1) / ts.length) * 100}%`).join(', ')})`);

/* ──────────────────────── Jour / semaine : grille horaire ──────────────────────── */
function GrilleHoraire({
  jours, today, parJour, couleurs, specialites, detail, onOpen, onCreate,
}: {
  jours: string[]; today: string; parJour: Map<string, PlatformEventRow[]>;
  couleurs: Couleurs; specialites: (e: PlatformEventRow) => string; detail: boolean;
  onOpen: (e: PlatformEventRow) => void; onCreate: (cle: string) => void;
}) {
  const evsDe = (cle: string) => parJour.get(cle) ?? [];
  const horaires = jours.flatMap((j) => evsDe(j).filter((e) => e.start_time));
  // Fenêtre horaire : 8 h → 22 h au minimum, élargie aux séances affichées.
  const hDebut = Math.min(8, ...horaires.map((e) => Math.floor(debutMin(e) / 60)));
  const hFin = Math.max(22, ...horaires.map((e) => Math.ceil(finMin(e) / 60)));
  const heures = Array.from({ length: Math.max(1, hFin - hDebut) }, (_, i) => hDebut + i);
  const hauteur = heures.length * H_HEURE;
  const sansHeure = jours.some((j) => evsDe(j).some((e) => !e.start_time));
  // Un jour chargé de cours simultanés s'élargit d'autant : chaque cours garde
  // une largeur lisible au lieu d'être écrasé dans une colonne standard.
  const placesDe = new Map(jours.map((j) => {
    const evs = evsDe(j).filter((e) => e.start_time);
    return [j, disposer(evs.map((e) => ({ id: e.id, debut: debutMin(e), fin: finMin(e) })))];
  }));
  const voiesDe = (j: string) => Math.max(1, ...[...(placesDe.get(j)?.values() ?? [])].map((p) => p.voies));
  const colonnes = detail
    ? `3.25rem repeat(${jours.length}, minmax(0, 1fr))`
    : `3.25rem ${jours.map((j) => { const v = voiesDe(j); return `minmax(${8.5 * Math.min(v, 3)}rem, ${v}fr)`; }).join(' ')}`;
  const largeurMin = detail ? undefined : `${3.25 + jours.reduce((t, j) => t + 8.5 * Math.min(voiesDe(j), 3), 0)}rem`;

  return (
    <div className="grille-scroll overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
      <div style={{ minWidth: largeurMin }}>
        {/* En-têtes de jours */}
        <div className="grid border-b border-(--color-border)" style={{ gridTemplateColumns: colonnes }}>
          <span />
          {jours.map((cle) => {
            const isToday = cle === today;
            const n = evsDe(cle).length;
            const d = depuisCle(cle);
            return (
              <div key={cle} className={cn('flex items-center justify-between gap-1 border-l border-(--color-border) px-2.5 py-2', isToday && 'bg-(--color-primary-soft)/60')}>
                <span className="flex items-baseline gap-1.5">
                  <span className={cn('text-xs font-semibold uppercase tracking-wide', isToday ? 'text-(--color-primary-deep)' : 'text-(--color-ink-muted)')}>
                    {detail ? fmt(cle, { weekday: 'long' }) : DAYS[(d.getDay() + 6) % 7].slice(0, 3)}
                  </span>
                  <span className={cn(
                    'flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-bold tabular-nums',
                    isToday ? 'bg-(--color-primary) text-white' : 'text-(--color-ink)',
                  )}>{d.getDate()}</span>
                  {n > 0 && <span className="text-[11px] text-(--color-ink-muted)">{n} évt</span>}
                </span>
                <button
                  type="button"
                  onClick={() => onCreate(cle)}
                  aria-label={`Ajouter un évènement le ${fmt(cle, { day: 'numeric', month: 'long' })}`}
                  className="no-print rounded-md p-1 text-(--color-ink-muted) hover:bg-(--color-primary-soft) hover:text-(--color-primary)"
                ><Plus className="h-3.5 w-3.5" /></button>
              </div>
            );
          })}
        </div>

        {/* Journée entière (sans horaire) */}
        {sansHeure && (
          <div className="grid border-b border-(--color-border) bg-(--color-surface-soft)/50" style={{ gridTemplateColumns: colonnes }}>
            <span className="px-1.5 py-1.5 text-right text-[10px] text-(--color-ink-muted)">Journée</span>
            {jours.map((cle) => (
              <div key={cle} className="space-y-1 border-l border-(--color-border) p-1">
                {evsDe(cle).filter((e) => !e.start_time).map((e) => {
                  const ts = couleurs(e);
                  return (
                    <button key={e.id} type="button" onClick={() => onOpen(e)}
                      className="block w-full truncate rounded-md px-2 py-1 text-left text-[11px] font-semibold"
                      style={{ background: ts[0].fond, color: ts[0].encre, boxShadow: `inset 3px 0 0 ${ts[0].vive}` }}>
                      {e.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Grille horaire */}
        <div className="grid" style={{ gridTemplateColumns: colonnes }}>
          <div className="relative" style={{ height: hauteur }}>
            {heures.map((h, i) => (
              <span key={h} className="absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums text-(--color-ink-muted)" style={{ top: i * H_HEURE }}>
                {i === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
              </span>
            ))}
          </div>
          {jours.map((cle) => {
            const evs = evsDe(cle).filter((e) => e.start_time);
            const places = placesDe.get(cle)!;
            return (
              <div
                key={cle}
                className={cn('relative border-l border-(--color-border)', cle === today && 'bg-(--color-primary-soft)/25')}
                style={{ height: hauteur }}
                onDoubleClick={() => onCreate(cle)}
                title="Double-clic pour ajouter un évènement"
              >
                {heures.map((h, i) => (
                  <span key={h} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-(--color-border)/70" style={{ top: i * H_HEURE }} />
                ))}
                {evs.map((e) => (
                  <BlocHoraire
                    key={e.id} e={e} place={places.get(e.id)!} hDebut={hDebut}
                    teintes={couleurs(e)} scope={specialites(e)} detail={detail} onOpen={onOpen}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BlocHoraire({
  e, place, hDebut, teintes, scope, detail, onOpen,
}: {
  e: PlatformEventRow; place: Place; hDebut: number; teintes: Teinte[]; scope: string; detail: boolean;
  onOpen: (e: PlatformEventRow) => void;
}) {
  const top = ((debutMin(e) - hDebut * 60) / 60) * H_HEURE;
  const height = Math.max(((finMin(e) - debutMin(e)) / 60) * H_HEURE - 3, 30);
  const largeur = 100 / place.voies;
  const t = teintes[0];
  const parallele = place.simultanes > 1;
  return (
    <button
      type="button"
      onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}
      onDoubleClick={(ev) => ev.stopPropagation()}
      className="absolute overflow-hidden rounded-lg border text-left transition-shadow hover:z-10 hover:shadow-lg focus-ring"
      style={{
        top: top + 1.5, height, left: `calc(${place.voie * largeur}% + 3px)`, width: `calc(${largeur}% - 6px)`,
        background: t.fond, borderColor: parallele ? t.vive : t.bord, color: t.encre,
      }}
      title={`${horaire(e)} · ${e.title} · ${scope}`}
    >
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: bande(teintes) }} />
      <span className="block py-1 pl-3 pr-1.5">
        <span className="flex items-center gap-1 text-[10px] font-bold tabular-nums">
          {horaire(e)}
          {parallele && (
            <span className="ml-auto inline-flex items-center gap-0.5 rounded px-1 text-[9px] font-bold text-white" style={{ background: t.vive }}>
              <Layers className="h-2.5 w-2.5" /> {place.simultanes}
            </span>
          )}
        </span>
        <span className="block text-xs font-bold leading-tight text-(--color-ink)">{e.title}</span>
        <span className="mt-0.5 block truncate text-[10px] font-semibold">{scope}</span>
        {(height > 70 || detail) && (
          <span className="mt-0.5 block truncate text-[10px] opacity-80">
            {(e.required_offers ?? []).map((o) => FORMULE_LABEL[o as Formule] ?? o).join(' · ')}
            {(e.voies ?? []).length === 1 ? ` · ${e.voies![0] === 'interne' ? 'Interne' : 'Externe'}` : ''}
          </span>
        )}
        {detail && e.intervenant && <span className="block truncate text-[10px] opacity-80">{e.intervenant}</span>}
        {!e.zoom_url && (
          <span className="no-print mt-0.5 inline-flex items-center gap-0.5 rounded bg-white/80 px-1 text-[9px] font-bold text-[#B45309]">
            <Link2 className="h-2.5 w-2.5" /> lien manquant
          </span>
        )}
      </span>
    </button>
  );
}

/* ──────────────────────── Mois ──────────────────────── */
function GrilleMois({
  debut, fin, today, parJour, couleurs, onOpen, onCreate, onJour,
}: {
  debut: string; fin: string; today: string; parJour: Map<string, PlatformEventRow[]>; couleurs: Couleurs;
  onOpen: (e: PlatformEventRow) => void; onCreate: (cle: string) => void; onJour: (cle: string) => void;
}) {
  const premier = lundiDe(debut);
  const cases: string[] = [];
  for (let c = premier; c <= fin || cases.length % 7 !== 0; c = plusJours(c, 1)) cases.push(c);
  const mois = debut.slice(0, 7);
  return (
    <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
      <div className="grid grid-cols-7 border-b border-(--color-border) bg-[#1C2E49]">
        {DAYS_COURTS.map((d) => <span key={d} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white/90">{d}</span>)}
      </div>
      <div className="grid grid-cols-7">
        {cases.map((cle) => {
          const evs = parJour.get(cle) ?? [];
          const horsMois = cle.slice(0, 7) !== mois;
          const isToday = cle === today;
          const avecHeure = evs.filter((e) => e.start_time);
          const places = disposer(avecHeure.map((e) => ({ id: e.id, debut: debutMin(e), fin: finMin(e) })));
          const simultanes = Math.max(0, ...[...places.values()].map((p) => p.simultanes));
          return (
            <div
              key={cle}
              className={cn(
                'group relative min-h-[7.5rem] border-b border-r border-(--color-border) p-1.5 [&:nth-child(7n)]:border-r-0',
                horsMois && 'bg-(--color-surface-soft)/70',
              )}
            >
              <div className="mb-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onJour(cle)}
                  className={cn(
                    'flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs tabular-nums',
                    isToday ? 'bg-(--color-primary) font-bold text-white' : horsMois ? 'text-(--color-ink-muted)' : 'font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)',
                  )}
                  aria-label={`Voir le ${fmt(cle, { day: 'numeric', month: 'long' })}`}
                >{Number(cle.slice(8))}</button>
                {simultanes > 1 && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-[#1C2E49] px-1.5 py-0.5 text-[10px] font-bold text-white" title={`${simultanes} cours en même temps`}>
                    <Layers className="h-2.5 w-2.5" /> ×{simultanes}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onCreate(cle)}
                  aria-label={`Ajouter un évènement le ${fmt(cle, { day: 'numeric', month: 'long' })}`}
                  className="no-print ml-auto rounded p-0.5 text-(--color-ink-muted) opacity-0 transition-opacity hover:text-(--color-primary) focus:opacity-100 group-hover:opacity-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                {evs.slice(0, 4).map((e) => {
                  const ts = couleurs(e);
                  const parallele = (places.get(e.id)?.simultanes ?? 1) > 1;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onOpen(e)}
                      title={`${horaire(e)} · ${e.title}`}
                      className="relative block w-full truncate rounded-md py-0.5 pl-2.5 pr-1 text-left text-[11px] font-semibold"
                      style={{ background: ts[0].fond, color: ts[0].encre, outline: parallele ? `1.5px solid ${ts[0].vive}` : undefined }}
                    >
                      <span className="absolute inset-y-0 left-0 w-1 rounded-l-md" style={{ background: bande(ts) }} />
                      {e.start_time ? <span className="tabular-nums">{e.start_time.slice(0, 5)} </span> : null}
                      <span className="text-(--color-ink)">{e.title}</span>
                    </button>
                  );
                })}
                {evs.length > 4 && (
                  <button type="button" onClick={() => onJour(cle)} className="px-1.5 text-[11px] font-semibold text-(--color-primary-deep) hover:underline">
                    +{evs.length - 4} autre{evs.length - 4 > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────── Liste (plage) ──────────────────────── */
function ListeEvenements({
  events, specialites, couleurs, today, onOpen,
}: {
  events: PlatformEventRow[];
  specialites: (e: PlatformEventRow) => string;
  couleurs: Couleurs;
  today: string;
  onOpen: (e: PlatformEventRow) => void;
}) {
  const groupes = useMemo(() => {
    const m = new Map<string, PlatformEventRow[]>();
    for (const e of [...events].sort((a, b) => a.date.localeCompare(b.date) || (a.start_time ?? '').localeCompare(b.start_time ?? ''))) {
      const mois = e.date.slice(0, 7);
      (m.get(mois) ?? m.set(mois, []).get(mois)!).push(e);
    }
    return [...m.entries()];
  }, [events]);
  // Séances simultanées (même jour, horaires qui se recouvrent).
  const enParallele = useMemo(() => {
    const out = new Set<string>();
    const parJour = new Map<string, PlatformEventRow[]>();
    for (const e of events) if (e.start_time) (parJour.get(e.date) ?? parJour.set(e.date, []).get(e.date)!).push(e);
    for (const evs of parJour.values()) {
      for (const [id, p] of disposer(evs.map((e) => ({ id: e.id, debut: debutMin(e), fin: finMin(e) })))) if (p.simultanes > 1) out.add(id);
    }
    return out;
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-4 py-10 text-center text-sm text-(--color-ink-muted)">
        Aucun évènement sur cette période avec ces filtres.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {groupes.map(([mois, evs]) => (
        <section key={mois} className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
          <h2 className="flex items-center justify-between bg-[#1C2E49] px-4 py-2 text-sm font-semibold text-white first-letter:uppercase">
            {fmt(`${mois}-01`, { month: 'long', year: 'numeric' })}
            <span className="text-xs font-normal text-white/75">{evs.length} évènement{evs.length > 1 ? 's' : ''}</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wide text-(--color-ink-muted)">
                <tr>
                  <th className="w-[12%] px-4 py-2 font-semibold">Date</th>
                  <th className="w-[11%] px-2 py-2 font-semibold">Horaire</th>
                  <th className="w-[25%] px-2 py-2 font-semibold">Évènement</th>
                  <th className="w-[18%] px-2 py-2 font-semibold">Spécialités</th>
                  <th className="w-[14%] px-2 py-2 font-semibold">Formules</th>
                  <th className="w-[9%] px-2 py-2 font-semibold">Voie</th>
                  <th className="w-[11%] px-4 py-2 font-semibold">Visio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {evs.map((e) => {
                  const ts = couleurs(e);
                  return (
                    <tr
                      key={e.id}
                      onClick={() => onOpen(e)}
                      className={cn('cursor-pointer hover:bg-(--color-surface-soft)', e.date < today && 'opacity-60')}
                      style={{ boxShadow: `inset 4px 0 0 ${ts[0].vive}` }}
                    >
                      <td className="whitespace-nowrap px-4 py-2 font-semibold text-(--color-ink) first-letter:uppercase">{fmt(e.date, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td className="whitespace-nowrap px-2 py-2 tabular-nums">
                        {horaire(e)}
                        {enParallele.has(e.id) && (
                          <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-[#1C2E49] px-1 text-[9px] font-bold text-white" title="Autre cours au même moment">
                            <Layers className="h-2.5 w-2.5" /> parallèle
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <span className="font-semibold text-(--color-ink)">{e.title}</span>
                        {e.intervenant && <span className="block text-(--color-ink-muted)">{e.intervenant}</span>}
                      </td>
                      <td className="px-2 py-2">
                        <span className="inline-flex flex-wrap items-center gap-1">
                          {ts.slice(0, 4).map((t, i) => <span key={i} className="h-2 w-2 rounded-full" style={{ background: t.vive }} />)}
                          <span className="font-semibold" style={{ color: ts[0].encre }}>{specialites(e)}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2">{(e.required_offers ?? []).map((o) => FORMULE_LABEL[o as Formule] ?? o).join(', ')}</td>
                      <td className="px-2 py-2">{(e.voies ?? []).length === 1 ? (e.voies![0] === 'interne' ? 'Interne' : 'Externe') : 'Les deux'}</td>
                      <td className="px-4 py-2">
                        {e.zoom_url
                          ? <span className="inline-flex items-center gap-1 font-semibold text-[#16793C]"><Link2 className="h-3.5 w-3.5" /> Lien</span>
                          : <span className="inline-flex items-center gap-1 font-semibold text-[#B45309]"><AlertTriangle className="h-3.5 w-3.5" /> Manquant</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

/* ──────────────────────── Filtre spécialité (avec recherche) ──────────────────────── */
function ChoixSpecialite({
  colleges, valeur, onChange,
}: { colleges: College[]; valeur: string | null; onChange: (id: string | null) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const [q, setQ] = useState('');
  const nom = (id: string) => {
    const c = colleges.find((x) => x.id === id);
    if (!c) return id;
    return c.parentId === MG_COLLEGE_ID ? `Médecine générale · ${c.nom}` : c.nom;
  };
  const options = useMemo(() => {
    const mots = normaliser(q).split(/\s+/).filter(Boolean);
    return colleges
      .filter((c) => !c.parentId || c.parentId === MG_COLLEGE_ID)
      .map((c) => ({ id: c.id, libelle: c.parentId === MG_COLLEGE_ID ? `Médecine générale · ${c.nom}` : c.nom }))
      .filter((o) => mots.every((m) => normaliser(o.libelle).includes(m)));
  }, [colleges, q]);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold',
          valeur ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)' : 'border-(--color-border) text-(--color-ink-soft) hover:text-(--color-ink)',
        )}
      >
        {valeur ? nom(valeur) : 'Toutes les spécialités'}
        {valeur && (
          <span
            role="button" tabIndex={0} aria-label="Retirer le filtre spécialité"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(null); } }}
            className="rounded p-0.5 hover:bg-white/60"
          ><X className="h-3 w-3" /></span>
        )}
      </button>
      {ouvert && (
        <div className="absolute left-0 top-9 z-30 w-72 rounded-xl border border-(--color-border) bg-(--color-surface) p-2 shadow-lg">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--color-ink-muted)" />
            <input
              autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setOuvert(false); if (e.key === 'Enter' && options[0]) { onChange(options[0].id); setOuvert(false); setQ(''); } }}
              placeholder="Rechercher une spécialité…" aria-label="Rechercher une spécialité"
              className="h-8 w-full rounded-lg border border-(--color-border) bg-(--color-surface) pl-8 pr-2 text-xs outline-none focus:border-(--color-primary)"
            />
          </div>
          <ul className="mt-1.5 max-h-64 overflow-y-auto">
            <li>
              <button type="button" onClick={() => { onChange(null); setOuvert(false); setQ(''); }}
                className="w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold text-(--color-ink-soft) hover:bg-(--color-surface-soft)">
                Toutes les spécialités
              </button>
            </li>
            {options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => { onChange(o.id); setOuvert(false); setQ(''); }}
                  className={cn('w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-(--color-surface-soft)', valeur === o.id ? 'font-semibold text-(--color-primary-deep)' : 'text-(--color-ink)')}
                >{o.libelle}</button>
              </li>
            ))}
            {options.length === 0 && <li className="px-2 py-1.5 text-xs text-(--color-ink-muted)">Aucune spécialité ne correspond.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────── Dialog formulaire ──────────────────────── */
function EventFormDialog({
  open, date, initial, colleges, passe = false, onClose, onSaved,
}: {
  open: boolean;
  date: Date | null;
  initial: PlatformEventRow | null;
  colleges: College[];
  /** Jour déjà passé : on prévient (création a posteriori). */
  passe?: boolean;
  onClose: () => void;
  /** Message de confirmation affiché au-dessus de l'agenda (notifications). */
  onSaved?: (message: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [zoom, setZoom] = useState(initial?.zoom_url ?? '');
  const [notifier, setNotifier] = useState(false);
  const [notifierLien, setNotifierLien] = useState(false);
  // Lien de visio ajouté ou changé : on propose d'en prévenir les élèves.
  const lienNouveau = zoom.trim() !== '' && zoom.trim() !== (initial?.zoom_url ?? '');
  const [err, setErr] = useState<string | null>(null);
  const [scopeType, setScopeType] = useState<'all' | 'college'>(initial?.scope_type ?? 'all');
  const [scopeColleges, setScopeColleges] = useState<string[]>(initial?.scope_colleges ?? []);
  const [offers, setOffers] = useState<string[]>(initial?.required_offers ?? ['essentiel', 'intensif', 'approfondi']);
  const [voies, setVoies] = useState<string[]>(initial?.voies ?? ['interne', 'externe']);
  const [rechercheSpe, setRechercheSpe] = useState('');

  const topColleges = useMemo(() => colleges.filter((c) => !c.parentId), [colleges]);
  const mgSpecialties = useMemo(() => colleges.filter((c) => c.parentId === MG_COLLEGE_ID), [colleges]);
  const nomDe = useMemo(() => new Map(colleges.map((c) => [c.id, c.parentId === MG_COLLEGE_ID ? `MG · ${c.nom}` : c.nom])), [colleges]);
  const correspond = (c: College) => {
    const mots = normaliser(rechercheSpe).split(/\s+/).filter(Boolean);
    const texte = normaliser(c.parentId === MG_COLLEGE_ID ? `medecine generale ${c.nom}` : c.nom);
    return mots.every((m) => texte.includes(m));
  };
  const topFiltres = topColleges.filter(correspond);
  const mgFiltres = mgSpecialties.filter(correspond);

  // Double clic sur « Enregistrer » : un seul envoi (sinon deux évènements).
  const enVol = useRef(false);

  const onSubmit = (formData: FormData) => {
    if (enVol.current) return;
    // Ajoute manuellement les checkboxes non incluses dans le form
    formData.delete('required_offers');
    offers.forEach((o) => formData.append('required_offers', o));
    formData.set('scope_type', scopeType);
    formData.delete('scope_colleges');
    if (scopeType === 'college') {
      scopeColleges.forEach((c) => formData.append('scope_colleges', c));
    }
    formData.delete('voies');
    voies.forEach((v) => formData.append('voies', v));
    if (notifier) formData.set('notifier', 'on'); else formData.delete('notifier');
    if (notifierLien && lienNouveau) formData.set('notifier_lien', 'on'); else formData.delete('notifier_lien');
    setErr(null);
    enVol.current = true;
    startTransition(async () => {
      try {
        const res = await upsertPlatformEvent(formData) as { error?: string; notifies?: number; avertissement?: string };
        if (res.error) setErr(res.error);
        else {
          if (res.avertissement) onSaved?.(res.avertissement);
          else if (notifier || (notifierLien && lienNouveau)) {
            onSaved?.(res.notifies
              ? `Notification envoyée à ${res.notifies} élève${res.notifies > 1 ? 's' : ''} concerné${res.notifies > 1 ? 's' : ''}.`
              : 'Évènement enregistré : aucun élève concerné à notifier.');
          }
          onClose();
        }
      } catch {
        setErr('Enregistrement impossible (connexion ?). Réessayez.');
      } finally {
        enVol.current = false;
      }
    });
  };

  const onDelete = () => {
    if (!initial) return;
    if (!confirm('Supprimer cet évènement ?')) return;
    setErr(null);
    startTransition(async () => {
      // La suppression échouée fermait la fenêtre comme si tout allait bien.
      const res = await deletePlatformEvent(initial.id).catch(() => ({ error: 'Suppression impossible (connexion ?).' }));
      if ('error' in res && res.error) setErr(res.error);
      else onClose();
    });
  };

  const toggleOffer = (o: string) => {
    setOffers((cur) => cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
  };
  const toggleCollege = (id: string) => {
    setScopeColleges((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };
  const toggleVoie = (v: string) => {
    // Au moins une voie doit rester sélectionnée.
    setVoies((cur) => cur.includes(v) ? (cur.length > 1 ? cur.filter((x) => x !== v) : cur) : [...cur, v]);
  };

  const caseCollege = (c: College) => (
    <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-(--color-surface-soft)">
      <input
        type="checkbox"
        checked={scopeColleges.includes(c.id)}
        onChange={() => toggleCollege(c.id)}
        className="h-3.5 w-3.5 rounded border-(--color-border)"
      />
      <span className="text-(--color-ink)">{c.nom}</span>
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-(--color-primary)" />
            {initial ? 'Modifier l’évènement' : 'Nouvel évènement plateforme'}
          </DialogTitle>
          <DialogDescription>
            {date?.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
            {passe && !initial && (
              <span className="mt-1 block font-semibold text-[#B45309]">
                Ce jour est déjà passé : l’évènement sera créé a posteriori.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          {initial && <input type="hidden" name="id" value={initial.id} />}
          <input type="hidden" name="date" value={initial?.date ?? (date ? dateKey(date) : '')} />

          <Field label="Titre">
            <input
              name="title" required maxLength={180}
              defaultValue={initial?.title ?? ''}
              placeholder="Ex. : Insuffisance cardiaque — item 234"
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Début">
              <input type="time" name="start_time" defaultValue={initial?.start_time?.slice(0, 5) ?? ''}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
            </Field>
            <Field label="Fin">
              <input type="time" name="end_time" defaultValue={initial?.end_time?.slice(0, 5) ?? ''}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Collège (libellé)">
              <input name="college" defaultValue={initial?.college ?? ''}
                placeholder="Ex. : Cardiologie, ECOS, Transversal…"
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
            </Field>
            <Field label="Intervenant">
              <input name="intervenant" defaultValue={initial?.intervenant ?? ''}
                placeholder="Ex. : Dr. A. Lemaire (cardiologue)"
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
            </Field>
          </div>

          <Field label="Lien Zoom">
            <input name="zoom_url" type="url" value={zoom} onChange={(e) => setZoom(e.target.value)}
              placeholder="https://zoom.us/j/…"
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
          </Field>

          <Field label="Informations pour les élèves (affichées dans leur agenda)">
            <textarea name="notes" rows={2} maxLength={2000} defaultValue={initial?.notes ?? ''}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
          </Field>

          {/* ────── Permissions ────── */}
          <fieldset className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3.5">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-(--color-ink-soft)">
              Qui voit cet évènement ?
            </legend>

            <p className="mb-2 text-xs font-semibold text-(--color-ink)">Formules autorisées</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {FORMULES.map((o) => (
                <label key={o} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  offers.includes(o)
                    ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                    : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface)'
                }`}>
                  <input type="checkbox" className="sr-only" checked={offers.includes(o)} onChange={() => toggleOffer(o)} />
                  {FORMULE_LABEL[o]}
                </label>
              ))}
            </div>

            <p className="mb-1 text-xs font-semibold text-(--color-ink)">Voie de concours</p>
            <p className="mb-2 text-[11px] text-(--color-ink-soft)">
              <strong>Interne</strong> = QCM/DP · <strong>Externe</strong> = QROC/DP-QROC.
              Sélectionnez une voie ou les deux ; seuls les étudiants de la voie
              cochée verront l’évènement.
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {([
                { value: 'interne', label: 'Voie interne' },
                { value: 'externe', label: 'Voie externe' },
              ] as const).map((v) => (
                <label key={v.value} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  voies.includes(v.value)
                    ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                    : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface)'
                }`}>
                  <input type="checkbox" className="sr-only" checked={voies.includes(v.value)} onChange={() => toggleVoie(v.value)} />
                  {v.label}
                </label>
              ))}
            </div>

            <p className="mb-2 text-xs font-semibold text-(--color-ink)">Spécialités concernées</p>
            <div className="mb-3 flex gap-2">
              {(['all', 'college'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setScopeType(t)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    scopeType === t
                      ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                      : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface)'
                  }`}
                >
                  {t === 'all' ? 'Toutes les spécialités' : 'Spécialités ciblées'}
                </button>
              ))}
            </div>

            {scopeType === 'college' && (
              <div className="space-y-2 rounded-lg border border-(--color-border) bg-(--color-surface) p-2">
                {/* Recherche dans la liste des spécialités */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--color-ink-muted)" />
                  <input
                    type="search"
                    value={rechercheSpe}
                    onChange={(e) => setRechercheSpe(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    placeholder="Rechercher une spécialité (ex. cardio, pédiatrie…)"
                    aria-label="Rechercher une spécialité"
                    className="h-9 w-full rounded-lg border border-(--color-border) bg-(--color-surface) pl-8 pr-2 text-xs outline-none focus:border-(--color-primary)"
                  />
                </div>
                {scopeColleges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {scopeColleges.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-(--color-primary-soft) py-0.5 pl-2 pr-1 text-[11px] font-semibold text-(--color-primary-deep)">
                        {nomDe.get(id) ?? id}
                        <button type="button" onClick={() => toggleCollege(id)} aria-label={`Retirer ${nomDe.get(id) ?? id}`} className="rounded-full p-0.5 hover:bg-white/60">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {topFiltres.length > 0 && (
                    <>
                      <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Collèges</p>
                      <div className="grid grid-cols-2 gap-1.5">{topFiltres.map(caseCollege)}</div>
                    </>
                  )}
                  {mgFiltres.length > 0 && (
                    <>
                      <p className="px-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Médecine générale — spécialités</p>
                      <div className="grid grid-cols-2 gap-1.5">{mgFiltres.map(caseCollege)}</div>
                    </>
                  )}
                  {topFiltres.length === 0 && mgFiltres.length === 0 && (
                    <p className="px-1 py-2 text-xs text-(--color-ink-muted)">Aucune spécialité ne correspond.</p>
                  )}
                </div>
              </div>
            )}
          </fieldset>

          {/* ────── Notifications de l'espace élève ────── */}
          <fieldset className="space-y-2 rounded-xl border border-(--color-border) p-3.5">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-(--color-ink-soft)">Notifier les élèves</legend>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-(--color-ink)">
              <input type="checkbox" checked={notifier} onChange={(e) => setNotifier(e.target.checked)} className="mt-0.5 h-4 w-4" />
              <span>
                Envoyer une notification aux élèves concernés
                <span className="block text-[11px] text-(--color-ink-muted)">
                  {initial ? '« Séance mise à jour »' : '« Nouvelle séance »'} dans leur espace (cloche), pour les élèves qui voient cet évènement.
                </span>
              </span>
            </label>
            {lienNouveau && (
              <label className="flex cursor-pointer items-start gap-2 text-sm text-(--color-ink)">
                <input type="checkbox" checked={notifierLien} onChange={(e) => setNotifierLien(e.target.checked)} className="mt-0.5 h-4 w-4" />
                <span>
                  Prévenir que le lien de la visio est disponible
                  <span className="block text-[11px] text-(--color-ink-muted)">Notification « Lien de la visio disponible » : l’élève l’obtient en émargeant.</span>
                </span>
              </label>
            )}
          </fieldset>

          {err && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{err}</p>}

          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              {initial && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-ink-soft) hover:border-(--color-primary)/60 hover:text-(--color-primary) disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-ink-soft) hover:bg-(--color-surface-soft)"
              >Annuler</button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-soft) hover:opacity-90 disabled:opacity-50"
              >
                {initial ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {pending ? 'Enregistrement…' : (initial ? 'Mettre à jour' : 'Créer')}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-(--color-ink-soft)">{label}</span>
      {children}
    </label>
  );
}
