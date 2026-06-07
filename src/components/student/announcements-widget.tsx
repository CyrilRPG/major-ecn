import 'server-only';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight, BarChart3, Calendar, CalendarCheck, CalendarDays, ExternalLink,
  Medal, Megaphone, Trophy, UserCheck, type LucideIcon,
} from 'lucide-react';

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
};

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

/* ------------ Server entry ------------ */
export async function AnnouncementsWidget() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('homepage_announcements')
    .select('id, kind, title, badge_label, badge_tone, icon_key, data, order_index, visible')
    .eq('visible', true)
    .order('order_index', { ascending: true });

  const items = ((data ?? []) as unknown as Announcement[]) ?? [];
  if (items.length === 0) return null;

  return (
    <aside className="space-y-3" aria-label="Annonces et informations EVC">
      {items.map((it) => (
        <AnnouncementCard key={it.id} a={it} />
      ))}
    </aside>
  );
}

/* ------------ Card rendering ------------ */
function AnnouncementCard({ a }: { a: Announcement }) {
  const Icon = pickIcon(a.icon_key);
  const tone = BADGE_TONES[a.badge_tone ?? 'red'];

  return (
    <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
      {/* Header : icône en pastille + titre + badge éventuel */}
      <header className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: tone.bg, color: tone.fg }}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold leading-tight text-(--color-primary)">
            {a.title}
          </h3>
        </div>
        {a.badge_label && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ background: tone.bg, color: tone.fg }}
          >
            {a.badge_label}
          </span>
        )}
      </header>

      {/* Body — varie selon le kind */}
      <div className="mt-3">
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
/* NB. tant que le calendrier officiel des EVC (PAE) n'est pas connu,
 * on n'affiche ni le nombre de jours restants ni les vraies dates :
 * on les remplace par un placeholder « Bientôt communiqué ». */
type CountdownData = { suffix_top?: string; suffix_bottom?: string };
function CountdownBody({ data }: { data: Record<string, unknown> }) {
  const d = data as CountdownData;
  return (
    <div className="relative overflow-hidden rounded-xl bg-(--color-primary-soft)/40 px-4 py-3">
      {d.suffix_top && <p className="text-xs text-(--color-ink-soft)">{d.suffix_top}</p>}
      <p className="mt-1 text-base font-extrabold leading-snug text-(--color-primary)">
        Bientôt communiqué
      </p>
      <p className="mt-1 text-xs leading-snug text-(--color-ink-soft)">
        {d.suffix_bottom ?? 'La date officielle sera annoncée dès sa publication.'}
      </p>
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
        return (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            <EvIcon className="h-4 w-4 shrink-0 text-(--color-primary)" />
            <span className="flex-1 truncate text-(--color-ink-soft)">{e.label}</span>
            <span className="shrink-0 rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-bold text-(--color-ink-soft)">
              Bientôt communiqué
            </span>
          </li>
        );
      })}
    </ul>
  );
}

type InfoData = { body?: string; cta_label?: string; cta_href?: string; cta_external?: boolean };
function InfoBody({ data }: { data: Record<string, unknown> }) {
  const d = data as InfoData;
  return (
    <div>
      {d.body && (
        <p className="text-sm leading-relaxed text-(--color-ink-soft)">{d.body}</p>
      )}
      {d.cta_label && d.cta_href && (
        <a
          href={d.cta_href}
          target={d.cta_external ? '_blank' : undefined}
          rel={d.cta_external ? 'noopener noreferrer' : undefined}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01]"
        >
          {d.cta_label}
          {d.cta_external ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </a>
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
