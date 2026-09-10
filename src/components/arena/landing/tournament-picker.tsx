import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileText, Info, Mail, Timer } from 'lucide-react';
import { Container } from '../arena-ui';
import { ARENA, BODY, DISPLAY, HEADLINE } from '../tokens';
import { WARNING_NATURE } from '@/lib/arena/texts';
import { seasonLabel, type TournamentCard, type TournamentCardGroups } from '@/lib/arena/tournament-cards';
import { Reveal } from './fx';
import { ArenaNewsForm, CardCountdown } from './tournament-picker-client';

/**
 * Section « Choisissez votre tournoi » (maquette client du 10/09/2026, bloc
 * « Choisissez votre Arena ») : titre encadré de filets dorés, saison,
 * groupes « Tournois actuellement ouverts » (point vert) et « Prochains
 * tournois » (point orange, lien calendrier), cartes par spécialité (visuel
 * déposé à la création du tournoi ou visuel de la spécialité, format,
 * statut de manche et compte à rebours, appel à l'action), encart
 * « Autres spécialités à venir » et rappel de la nature du dispositif.
 * Composant serveur ; comptes à rebours et formulaire côté client.
 */
export function TournamentPicker({ groups, currentSlug, calendarHref, source = 'arena' }: { groups: TournamentCardGroups; currentSlug?: string; calendarHref?: string; source?: string }) {
  const all = [...groups.open, ...groups.upcoming, ...groups.finished];
  const season = seasonLabel(all);
  const empty = all.length === 0;

  return (
    <section id="tournois" className="relative py-14 sm:py-20" style={{ background: 'linear-gradient(180deg, rgba(11,15,20,0.92) 0%, rgba(11,15,20,0.97) 100%)' }}>
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <div className="flex w-full items-center justify-center gap-4 sm:gap-6">
            <span aria-hidden className="hidden h-px flex-1 max-w-[140px] sm:block" style={{ background: 'linear-gradient(90deg, rgba(212,169,74,0), #D4A94A)' }} />
            <h2 className="text-[2rem] leading-none sm:text-[2.7rem]" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Choisissez votre tournoi
            </h2>
            <span aria-hidden className="hidden h-px flex-1 max-w-[140px] sm:block" style={{ background: 'linear-gradient(90deg, #D4A94A, rgba(212,169,74,0))' }} />
          </div>
          <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.3em]" style={{ color: ARENA.gold, fontFamily: DISPLAY }}>{season}</p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: ARENA.text, fontFamily: BODY }}>
            Des tournois par spécialité pour vous entraîner, vous comparer et progresser.
          </p>
        </Reveal>

        {empty ? (
          <Reveal delay={0.1} className="mx-auto mt-10 max-w-xl">
            <div className="rounded-2xl px-6 py-10 text-center" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
              <p className="text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Aucun tournoi ouvert pour le moment. Le prochain sera annoncé ici et par courriel.</p>
            </div>
          </Reveal>
        ) : (
          <>
            {groups.open.length > 0 && <CardGroup title="Tournois actuellement ouverts" dot={ARENA.ok} cards={groups.open} currentSlug={currentSlug} tone="open" />}
            {groups.upcoming.length > 0 && (
              <CardGroup title="Prochains tournois" dot={ARENA.warn} cards={groups.upcoming} currentSlug={currentSlug} tone="upcoming" aside={calendarHref ? <Link href={calendarHref} className="inline-flex items-center gap-2 text-[13px] underline underline-offset-4 hover:text-white" style={{ color: ARENA.goldSoft, fontFamily: BODY }}>Voir le calendrier complet <ArrowRight className="h-4 w-4" /></Link> : undefined} />
            )}
            {groups.finished.length > 0 && <CardGroup title="Tournois terminés" dot={ARENA.textMuted} cards={groups.finished} currentSlug={currentSlug} tone="finished" />}
          </>
        )}

        {/* Autres spécialités à venir */}
        <Reveal delay={0.15} className="mt-10">
          <div className="grid gap-6 rounded-2xl p-6 sm:p-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-10" style={{ background: 'rgba(20,26,34,0.82)', boxShadow: `inset 0 0 0 1px rgba(212,169,74,0.35), 0 24px 48px -32px rgba(0,0,0,0.9)`, backdropFilter: 'blur(6px)' }}>
            <div className="flex items-center gap-5 lg:border-r lg:pr-8" style={{ borderColor: 'rgba(212,169,74,0.25)' }}>
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(212,169,74,0.7)', color: ARENA.gold }}><Mail className="h-8 w-8" strokeWidth={1.6} /></span>
              <p className="text-[1.25rem] leading-tight" style={{ fontFamily: DISPLAY, color: ARENA.text, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Autres spécialités<br />à venir</p>
            </div>
            <ArenaNewsForm source={source} />
          </div>
        </Reveal>

        <p className="mx-auto mt-8 flex max-w-3xl items-start justify-center gap-2 text-center text-[12.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ARENA.gold }} aria-hidden />
          <span>{WARNING_NATURE}</span>
        </p>
      </Container>
    </section>
  );
}

function CardGroup({ title, dot, cards, currentSlug, tone, aside }: { title: string; dot: string; cards: TournamentCard[]; currentSlug?: string; tone: 'open' | 'upcoming' | 'finished'; aside?: React.ReactNode }) {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-3 text-[15px] font-semibold" style={{ color: tone === 'open' ? '#8CE2B0' : tone === 'upcoming' ? '#F5C76A' : ARENA.textSoft, fontFamily: BODY }}>
          <span aria-hidden className="inline-block h-3 w-3 rounded-full" style={{ background: dot, boxShadow: `0 0 12px ${dot}` }} />
          {title}
        </p>
        {aside}
      </div>
      <ul className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.07} className="h-full">
            <TournamentCardView card={c} current={c.slug === currentSlug} tone={tone} />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

function TournamentCardView({ card, current, tone }: { card: TournamentCard; current: boolean; tone: 'open' | 'upcoming' | 'finished' }) {
  const open = tone === 'open';
  const dot = open ? ARENA.ok : tone === 'upcoming' ? ARENA.warn : ARENA.textMuted;
  const border = open ? 'rgba(228,0,43,0.55)' : 'rgba(212,169,74,0.35)';
  return (
    <li className="h-full">
      <article
        className="arena-lift flex h-full flex-col rounded-2xl p-5"
        style={{ background: 'linear-gradient(180deg, rgba(20,26,34,0.9), rgba(11,15,20,0.94))', boxShadow: `inset 0 0 0 1px ${border}, 0 24px 48px -32px rgba(0,0,0,0.95)`, backdropFilter: 'blur(4px)' }}
      >
        <div className="flex items-center gap-4">
          <span className="relative block h-[92px] w-[110px] shrink-0 overflow-hidden rounded-xl">
            <Image src={card.visual.src} alt="" width={440} height={368} sizes="110px" className="h-full w-full object-contain" />
          </span>
          <h3 className="min-w-0 flex-1 text-[1.15rem] leading-tight sm:text-[1.25rem]" style={{ fontFamily: DISPLAY, color: ARENA.text, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            {card.specialty}
            {current && <span className="mt-1 block text-[10px] font-bold tracking-[0.2em]" style={{ color: ARENA.goldSoft, fontFamily: BODY }}>Vous êtes ici</span>}
            {card.staffOnly && <span className="mt-1 block text-[10px] font-bold tracking-[0.2em]" style={{ color: ARENA.preview, fontFamily: BODY }}>Visible du personnel</span>}
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 pt-4" style={{ borderTop: `1px solid ${ARENA.line}` }}>
          <Meta icon={<FileText className="h-6 w-6" strokeWidth={1.7} />} value={String(card.questions)} label="questions" />
          <Meta icon={<Timer className="h-6 w-6" strokeWidth={1.7} />} value={`${card.seconds} s`} label="par question" divider />
        </div>

        <div className="mt-4 flex-1 rounded-xl px-4 py-3 text-center" style={{ background: open ? 'rgba(46,204,113,0.08)' : 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${open ? 'rgba(46,204,113,0.25)' : ARENA.line}` }}>
          <p className="flex items-center justify-center gap-2 text-[14px] font-semibold" style={{ color: open ? '#8CE2B0' : tone === 'upcoming' ? '#F5C76A' : ARENA.textSoft, fontFamily: BODY }}>
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
            {card.statusLabel}
          </p>
          {card.theme && <p className="mt-1 text-[13px]" style={{ color: ARENA.text, fontFamily: BODY }}>{card.theme}</p>}
          {card.countdown && <CardCountdown kind={card.countdown.kind} at={card.countdown.at} />}
        </div>

        <Link
          href={card.href}
          className="mt-4 inline-flex h-12 items-center justify-center gap-3 rounded-lg text-[13px] uppercase tracking-[0.16em] text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.99]"
          style={{ background: open ? 'linear-gradient(180deg, #B0102F 0%, #7E0A22 100%)' : 'linear-gradient(180deg, rgba(122,10,33,0.55), rgba(90,8,25,0.55))', boxShadow: `inset 0 0 0 1px ${open ? 'rgba(255,120,140,0.55)' : 'rgba(212,169,74,0.45)'}`, fontFamily: DISPLAY, fontWeight: 600 }}
        >
          {card.cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </article>
    </li>
  );
}

function Meta({ icon, value, label, divider }: { icon: React.ReactNode; value: string; label: string; divider?: boolean }) {
  return (
    <div className="flex items-center gap-3" style={divider ? { borderLeft: `1px solid ${ARENA.line}`, paddingLeft: 12 } : undefined}>
      <span style={{ color: ARENA.gold }}>{icon}</span>
      <span className="leading-tight">
        <span className="block text-[15px] font-bold" style={{ color: ARENA.text, fontFamily: BODY }}>{value}</span>
        <span className="block text-[12px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{label}</span>
      </span>
    </div>
  );
}
