import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { parseScope } from '@/lib/auth/permissions';
import {
  ArrowRight, BarChart3, Bell, Calendar, CalendarCheck, CalendarDays, ExternalLink,
  Info, Medal, Megaphone, Trophy, UserCheck, type LucideIcon,
} from 'lucide-react';

type Scope = ReturnType<typeof parseScope>;

/** Représente un bloc personnalisable affiché à droite de l'accueil. */
export type Announcement = {
  id: string;
  kind: 'countdown' | 'event_list' | 'info' | 'stat' | 'text';
  title: string;
  badge_label: string | null;
  badge_tone: 'red' | 'green' | 'blue' | 'orange' | 'purple' | 'gray' | null;
  icon_key: string | null;
  data: Record<string, unknown>;
  order_index: number;
  visible: boolean;
  min_offer: 'essentiel' | 'intensif' | 'approfondi' | null;
  target_scope: 'all' | 'full' | 'college' | null;
  target_colleges: string[] | null;
  voies: ('interne' | 'externe')[] | null;
};

// Rang des offres pour comparer avec min_offer (une annonce « intensif+ » n'est
// pas visible par un élève essentiel/découverte).
const OFFER_RANK: Record<string, number> = { decouverte: 0, essentiel: 1, intensif: 2, approfondi: 3 };

/** Un élève gériatrie ne doit voir que les annonces ciblant col-geriatrie,
 *  pas celles ciblant les collèges MG ajoutés par le bonus. */
function effectiveColleges(scope: Scope): string[] {
  if (scope.type !== 'college') return [];
  if (!scope.colleges.includes('col-geriatrie')) return scope.colleges;
  return scope.colleges.filter(
    (c) => c !== 'col-medecine-generale' && !c.startsWith('col-mg-'),
  );
}

/** Une annonce est-elle visible pour le périmètre (offre / collèges) de l'élève ? */
function announcementVisibleFor(a: Announcement, scope: Scope): boolean {
  if (a.min_offer) {
    if ((OFFER_RANK[scope.offer] ?? 0) < (OFFER_RANK[a.min_offer] ?? 0)) return false;
  }
  // Ciblage par voie de concours : si l'annonce cible une/des voie(s) et que
  // l'élève a une voie connue non incluse, on masque. Une liste vide ou les deux
  // voies = visible par tout le monde.
  const vs = a.voies ?? [];
  if (vs.length > 0 && vs.length < 2 && scope.voie && !vs.includes(scope.voie)) return false;
  const ts = a.target_scope ?? 'all';
  if (ts === 'full') {
    // Réservé aux élèves ayant l'accès intégral (toutes les spécialités).
    return scope.type === 'all';
  }
  if (ts === 'college') {
    const ids = a.target_colleges ?? [];
    if (ids.length === 0) return true; // aucun collège coché → tout le monde
    if (scope.type === 'all') return true; // accès intégral → voit tout
    return ids.some((cid) => effectiveColleges(scope).includes(cid));
  }
  return true; // 'all'
}

const ICON_MAP: Record<string, LucideIcon> = {
  calendar: Calendar,
  calendar_days: CalendarDays,
  calendar_check: CalendarCheck,
  user_check: UserCheck,
  chart: BarChart3,
  medal: Medal,
  trophy: Trophy,
  megaphone: Megaphone,
};
function pickIcon(key: string | null | undefined): LucideIcon {
  if (!key) return Megaphone;
  return ICON_MAP[key] ?? Megaphone;
}

/* On evite volontairement le vert : juxtapose au rouge brand, l'effet
 * "feu tricolore" est visuellement agressif. Le ton 'green' est remappe
 * sur un bleu profond, plus doux a cote du rouge primaire. */
const BADGE_TONES: Record<NonNullable<Announcement['badge_tone']>, { bg: string; fg: string }> = {
  red:    { bg: '#FCEAEC', fg: '#A91D2C' },
  green:  { bg: '#EAF1FB', fg: '#1E40AF' },
  blue:   { bg: '#EAF1FB', fg: '#1E40AF' },
  orange: { bg: '#FFEAD9', fg: '#B45B00' },
  purple: { bg: '#F1E8FD', fg: '#6D28D9' },
  gray:   { bg: '#F1F1F4', fg: '#5B6478' },
};

/* ------------ helpers ------------ */
function daysUntil(targetISO: string): number {
  const ms = new Date(targetISO).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/* ------------ Generic sections → Announcement objects ------------ */
type GenericRow = { section_key: string; college_id: string; data: Record<string, unknown> };
type CollegeInfo = { id: string; nom: string };

function genericToAnnouncements(
  rows: GenericRow[],
  collegeMap: Map<string, string>,
): Announcement[] {
  const result: Announcement[] = [];
  for (const r of rows) {
    const collegeName = collegeMap.get(r.college_id) ?? r.college_id;
    switch (r.section_key) {
      case 'countdown': {
        const d = r.data as { target_date?: string };
        if (!d.target_date) break;
        result.push({
          id: `gen-countdown-${r.college_id}`,
          kind: 'countdown',
          title: collegeName,
          badge_label: null,
          badge_tone: 'red',
          icon_key: 'calendar_check',
          data: {
            target_date: d.target_date,
            suffix_top: 'Il vous reste',
            suffix_bottom: "avant l'épreuve écrite",
            subtitle: 'EVC — Session 2026',
          },
          order_index: -30,
          visible: true,
          min_offer: null,
          target_scope: 'college',
          target_colleges: [r.college_id],
          voies: null,
        });
        break;
      }
      case 'inscription': {
        const d = r.data as { body?: string };
        if (!d.body) break;
        result.push({
          id: `gen-inscription-${r.college_id}`,
          kind: 'info',
          title: "Période d'inscription",
          badge_label: null,
          badge_tone: 'blue',
          icon_key: 'calendar_days',
          data: { body: d.body, subtitle: collegeName },
          order_index: -20,
          visible: true,
          min_offer: null,
          target_scope: 'college',
          target_colleges: [r.college_id],
          voies: null,
        });
        break;
      }
      case 'postes': {
        const d = r.data as { externe?: number; interne?: number };
        if (!d.externe && !d.interne) break;
        const subs: { label: string; value: string }[] = [];
        if (d.externe) subs.push({ label: 'Voie externe', value: String(d.externe) });
        if (d.interne) subs.push({ label: 'Voie interne', value: String(d.interne) });
        result.push({
          id: `gen-postes-${r.college_id}`,
          kind: 'stat',
          title: 'Nombre de postes',
          badge_label: null,
          badge_tone: 'red',
          icon_key: 'chart',
          data: { sub_stats: subs, subtitle: collegeName },
          order_index: -10,
          visible: true,
          min_offer: null,
          target_scope: 'college',
          target_colleges: [r.college_id],
          voies: null,
        });
        break;
      }
      case 'dates_cles': {
        const d = r.data as { body?: string };
        if (!d.body) break;
        result.push({
          id: `gen-dates-${r.college_id}`,
          kind: 'text',
          title: 'Dates clés',
          badge_label: null,
          badge_tone: 'orange',
          icon_key: 'calendar',
          data: { body: d.body, subtitle: collegeName },
          order_index: -5,
          visible: true,
          min_offer: null,
          target_scope: 'college',
          target_colleges: [r.college_id],
          voies: null,
        });
        break;
      }
    }
  }
  return result;
}

/* ------------ Server entry ------------ */
export async function AnnouncementsWidget({ scope }: { scope: Scope }) {
  const supabase = await createClient();
  const [{ data }, { data: genericRaw }, { data: collegesRaw }] = await Promise.all([
    supabase
      .from('homepage_announcements')
      .select('id, kind, title, badge_label, badge_tone, icon_key, data, order_index, visible, min_offer, target_scope, target_colleges, voies')
      .eq('visible', true)
      .order('order_index', { ascending: true }),
    (supabase as any)
      .from('homepage_generic_data')
      .select('section_key, college_id, data'),
    supabase.from('matieres').select('id, nom'),
  ]);

  const collegeMap = new Map(
    ((collegesRaw ?? []) as CollegeInfo[]).map((c) => [c.id, c.nom]),
  );
  const genericAnnouncements = genericToAnnouncements(
    (genericRaw ?? []) as GenericRow[],
    collegeMap,
  );

  const allItems = [
    ...genericAnnouncements,
    ...((data ?? []) as unknown as Announcement[]),
  ];

  // La carte « Médecine Générale — EVC 2026 » est écrite en dur et ne concerne
  // QUE la médecine générale (35 / 89 postes). Les élèves gériatrie ont
  // col-medecine-generale dans leur scope (bonus MG) mais ne doivent PAS voir
  // cette carte — elle n'est pertinente que pour les vrais inscrits en MG.
  const isGeriatrie = scope.type === 'college' && scope.colleges.includes('col-geriatrie');
  const showMgCard = !isGeriatrie
    && (scope.type === 'all'
      || scope.colleges.some((c) => c === 'col-medecine-generale' || c.startsWith('col-mg-')));

  // Anti-doublon : la carte statique ne fait doublon qu'avec l'annonce
  // « Nombre de postes » DE LA MÉDECINE GÉNÉRALE. Une annonce de postes ciblée
  // sur une autre spécialité doit toujours passer — y compris pour un compte à
  // accès intégral, qui voit aussi la carte MG.
  const faitDoublonAvecCarteMg = (it: Announcement) =>
    /nombre\s+de\s+postes/i.test(it.title)
    && (it.target_scope !== 'college'
      || (it.target_colleges ?? []).length === 0
      || (it.target_colleges ?? []).some((c) => c === 'col-medecine-generale' || c.startsWith('col-mg-')));

  const items = allItems
    .filter((it) => !showMgCard || !faitDoublonAvecCarteMg(it))
    .filter((it) => announcementVisibleFor(it, scope))
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <aside className="space-y-3" aria-label="Annonces et informations EVC">
      {showMgCard && <MgEvc2026Card />}
      {items.map((it) => (
        <AnnouncementCard key={it.id} a={it} />
      ))}
    </aside>
  );
}

/* ------------ Carte statique : EVC Médecine Générale — Session 2026 ------------
 * Annonce officielle ajoutée en dur (hors système d'annonces DB) pour garantir
 * son affichage : période d'inscription + nombre de postes par voie d'accès +
 * compte à rebours vers la date d'épreuve. */
const MG_EXAM_DATE = '2027-01-15';
function MgEvc2026Card() {
  const days = daysUntil(MG_EXAM_DATE);
  return (
    <article className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
      <header className="flex items-start gap-3.5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: '#FCEAEC', color: '#A91D2C' }}
        >
          <CalendarCheck className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-black leading-tight tracking-tight text-(--color-ink)">
            Médecine Générale
          </h3>
          <p className="mt-0.5 text-[17px] font-black leading-tight tracking-tight text-(--color-primary)">
            EVC — Session 2026
          </p>
        </div>
      </header>

      <span
        aria-hidden
        className="mt-3 block h-[3px] w-12 rounded-full"
        style={{ background: 'var(--color-primary)' }}
      />

      {/* Compte à rebours */}
      <div className="relative mt-4 overflow-hidden rounded-xl bg-(--color-primary-soft)/40 px-4 py-3">
        <p className="text-xs text-(--color-ink-soft)">Il vous reste</p>
        <p className="mt-1 text-2xl font-black leading-none text-(--color-primary)">
          {days === 0 ? "Aujourd'hui" : <>J−{days}</>}
        </p>
        <p className="mt-1 text-xs leading-snug text-(--color-ink-soft)">
          avant l&rsquo;épreuve écrite
        </p>
        <Calendar
          aria-hidden
          className="pointer-events-none absolute -right-3 -bottom-2 h-20 w-20 text-(--color-primary)/10"
        />
      </div>

      {/* Période d'inscription */}
      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">
          Période d&rsquo;inscription
        </p>
        <p className="mt-1 text-[14.5px] leading-relaxed text-(--color-ink-soft)">
          Du <strong className="text-(--color-ink)">mercredi 17 juin 2026 à 14&nbsp;h</strong> (heure de Paris)
          au <strong className="text-(--color-ink)">jeudi 16 juillet 2026 inclus, à 17&nbsp;h</strong>.
        </p>
      </div>

      {/* Nombre de postes */}
      <div className="mt-4 border-t border-(--color-border) pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">
          Nombre de postes
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-(--color-border) px-3 py-2.5">
            <p className="text-[11px] font-semibold text-(--color-ink-soft)">Voie externe</p>
            <p className="text-2xl font-black tabular-nums text-(--color-primary)">35</p>
          </div>
          <div className="rounded-2xl border border-(--color-border) px-3 py-2.5">
            <p className="text-[11px] font-semibold text-(--color-ink-soft)">Voie interne</p>
            <p className="text-2xl font-black tabular-nums text-(--color-primary)">89</p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------ Card rendering ------------ */
function AnnouncementCard({ a }: { a: Announcement }) {
  const Icon = pickIcon(a.icon_key);
  const tone = BADGE_TONES[a.badge_tone ?? 'red'];
  const subtitle = (a.data as { subtitle?: string }).subtitle;
  // Lorsque l'icône est `user_check` avec ton bleu, on affiche un petit badge "i"
  // en overlay sur l'icône utilisateur (pixel-perfect maquette).
  const showInfoOverlay = a.icon_key === 'user_check' && a.badge_tone === 'blue';

  return (
    <article className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
      {/* Header : icône en pastille + titre/subtitle + badge éventuel */}
      <header className="flex items-start gap-3.5">
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: tone.bg, color: tone.fg }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
          {showInfoOverlay && (
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2"
              style={{
                background: tone.fg,
                color: tone.bg,
                // @ts-expect-error custom CSS prop
                '--tw-ring-color': '#FFFFFF',
              }}
            >
              <Info className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-black leading-tight tracking-tight text-(--color-ink)">
            {a.title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[17px] font-black leading-tight tracking-tight text-(--color-primary)">
              {subtitle}
            </p>
          )}
        </div>
        {a.badge_label && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[12px] font-bold"
            style={{ background: tone.bg, color: tone.fg }}
          >
            {showInfoOverlay && <Info className="h-3 w-3" strokeWidth={3} />}
            {a.badge_label}
          </span>
        )}
      </header>

      {/* Trait d'accent rouge sous le header (pixel-perfect maquette) */}
      {subtitle && (
        <span
          aria-hidden
          className="mt-3 block h-[3px] w-12 rounded-full"
          style={{ background: 'var(--color-primary)' }}
        />
      )}

      {/* Body — varie selon le kind */}
      <div className="mt-4">
        {a.kind === 'countdown'   && <CountdownBody data={a.data} />}
        {a.kind === 'event_list'  && <EventListBody data={a.data} />}
        {a.kind === 'info'        && <InfoBody data={a.data} />}
        {a.kind === 'stat'        && <StatBody data={a.data} />}
        {a.kind === 'text'        && <TextBody data={a.data} />}
      </div>
    </article>
  );
}

/* ------------ Bodies ------------ */
/* Le compteur affiche le nombre de jours restants dès qu'une `target_date` est
 * renseignée par l'admin. Sans date, on garde le placeholder « Bientôt communiqué ». */
type CountdownData = { suffix_top?: string; suffix_bottom?: string; target_date?: string };
function CountdownBody({ data }: { data: Record<string, unknown> }) {
  const d = data as CountdownData;
  const hasDate = typeof d.target_date === 'string' && !Number.isNaN(new Date(d.target_date).getTime());
  const days = hasDate ? daysUntil(d.target_date as string) : null;
  return (
    <div className="relative overflow-hidden rounded-xl bg-(--color-primary-soft)/40 px-4 py-3">
      {d.suffix_top && <p className="text-xs text-(--color-ink-soft)">{d.suffix_top}</p>}
      {hasDate ? (
        <>
          <p className="mt-1 text-2xl font-black leading-none text-(--color-primary)">
            {days === 0 ? "Aujourd'hui" : <>J−{days}</>}
          </p>
          <p className="mt-1 text-xs leading-snug text-(--color-ink-soft)">
            {d.suffix_bottom ?? `Épreuve le ${fmtDate(d.target_date as string)}`}
          </p>
        </>
      ) : (
        <>
          <p className="mt-1 text-base font-extrabold leading-snug text-(--color-primary)">
            Bientôt communiqué
          </p>
          <p className="mt-1 text-xs leading-snug text-(--color-ink-soft)">
            {d.suffix_bottom ?? 'La date officielle sera annoncée dès sa publication.'}
          </p>
        </>
      )}
      <Calendar
        aria-hidden
        className="pointer-events-none absolute -right-3 -bottom-2 h-20 w-20 text-(--color-primary)/10"
      />
    </div>
  );
}

type Event = { label: string; date?: string; icon?: string };
type EventListData = { events?: Event[] };
function EventListBody({ data }: { data: Record<string, unknown> }) {
  const d = data as EventListData;
  const events = d.events ?? [];
  if (events.length === 0) return null;
  return (
    <ul className="space-y-2.5">
      {events.map((e, i) => {
        const EvIcon = pickIcon(e.icon ?? 'calendar_check');
        const hasDate = typeof e.date === 'string' && !Number.isNaN(new Date(e.date).getTime());
        return (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            <EvIcon className="h-4 w-4 shrink-0 text-(--color-primary)" />
            <span className="flex-1 truncate text-(--color-ink-soft)">{e.label}</span>
            <span className="shrink-0 rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-bold text-(--color-ink-soft)">
              {hasDate ? fmtDate(e.date as string) : 'Bientôt communiqué'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

type InfoData = {
  body?: string;
  cta_label?: string;
  cta_href?: string;
  cta_external?: boolean;
  footer_note?: string;
};
function InfoBody({ data }: { data: Record<string, unknown> }) {
  const d = data as InfoData;
  return (
    <div>
      {d.body && (
        <p className="text-[14.5px] leading-relaxed text-(--color-ink-soft)">{d.body}</p>
      )}
      {d.cta_label && d.cta_href && (
        <a
          href={d.cta_href}
          target={d.cta_external ? '_blank' : undefined}
          rel={d.cta_external ? 'noopener noreferrer' : undefined}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-(--color-primary) px-4 py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_30px_-10px_rgba(192,17,46,0.45)] transition-transform hover:scale-[1.01]"
        >
          {d.cta_label}
          {d.cta_external ? <ExternalLink className="h-4 w-4" strokeWidth={2.5} /> : <ArrowRight className="h-4 w-4" strokeWidth={2.5} />}
        </a>
      )}
      {d.footer_note && (
        <div
          className="mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3"
          style={{ background: '#EAF1FB', borderColor: 'rgba(30,64,175,0.15)' }}
        >
          <Bell
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: '#1E40AF' }}
            strokeWidth={2}
          />
          <p className="text-[12.5px] leading-relaxed" style={{ color: '#1F2937' }}>
            {d.footer_note}
          </p>
        </div>
      )}
    </div>
  );
}

type SubStat = { label: string; value: string };
type StatData = {
  value?: string;
  value_suffix?: string;
  sub_stats?: SubStat[];
  footer_note?: string;
};
function StatBody({ data }: { data: Record<string, unknown> }) {
  const d = data as StatData;
  /* Tant que les chiffres officiels (places, dates, etc.) ne sont pas connus,
   * on masque les valeurs numeriques et on affiche un placeholder. */
  return (
    <div>
      {(d.value || d.value_suffix) && (
        <p className="flex items-baseline gap-2">
          <span className="text-base font-extrabold leading-snug text-(--color-primary)">
            Bientôt communiqué
          </span>
          {d.value_suffix && <span className="text-sm text-(--color-ink-soft)">{d.value_suffix}</span>}
        </p>
      )}
      {d.sub_stats && d.sub_stats.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-(--color-border) pt-3">
          {d.sub_stats.map((s, i) => (
            <div key={i}>
              <p className="text-xs text-(--color-ink-soft)">{s.label}</p>
              <p className="mt-0.5 text-[12px] font-bold text-(--color-ink-soft)">Bientôt communiqué</p>
            </div>
          ))}
        </div>
      )}
      {d.footer_note && (
        <p className="mt-3 text-[11px] italic text-(--color-ink-muted)">{d.footer_note}</p>
      )}
    </div>
  );
}

type TextData = { body?: string };
function TextBody({ data }: { data: Record<string, unknown> }) {
  const d = data as TextData;
  if (!d.body) return null;
  return <p className="text-sm leading-relaxed text-(--color-ink-soft)">{d.body}</p>;
}
