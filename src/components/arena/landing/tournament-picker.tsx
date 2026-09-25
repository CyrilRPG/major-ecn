import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, FileText, Info, Mail, Timer } from 'lucide-react';
import { ArenaBars } from '../experience-icons';
import { WARNING_NATURE } from '@/lib/arena/texts';
import { seasonLabel, type TournamentCard, type TournamentCardGroups } from '@/lib/arena/tournament-cards';
import { Reveal } from './fx';
import { ArenaNewsForm, CardCountdown } from './tournament-picker-client';

/**
 * « Choisissez votre tournoi » — maquettes client du 24/09/2026 (15_06_19,
 * 15_08_21) : titre bicolore et saison entre deux filets dorés, devise
 * inclinée, tournoi ouvert en grande carte rouge (visuel, édition, format,
 * statut de manche, compte à rebours, entrée dans l'arène), tournois à venir
 * et terminés en cartes compactes à pastille, encart « Autres spécialités à
 * venir » et rappel de la nature du dispositif (§9). Composant serveur ;
 * comptes à rebours et formulaire côté client. Toutes les valeurs viennent
 * des tournois réels (nombre de questions, secondes, manche, échéance).
 */
export function TournamentPicker({ groups, currentSlug, calendarHref, source = 'arena', editions = {}, heading = 'h2', hero = false }: {
  groups: TournamentCardGroups; currentSlug?: string; calendarHref?: string; source?: string;
  /** Libellé d'édition par slug (« 2026 », « Démo ») ; à défaut, l'année de la saison. */
  editions?: Record<string, string>;
  heading?: 'h1' | 'h2';
  /** Page « Calendrier » : le sélecteur ouvre la page, sur la photo de l'arène. */
  hero?: boolean;
}) {
  const all = [...groups.open, ...groups.upcoming, ...groups.finished];
  const season = seasonLabel(all);
  const year = season.replace(/\D+/g, '');
  // Le libellé d'édition est libre (« 2026 », « Édition démo », « Saison 2026 ») : on ne double pas le mot.
  const edition = (c: TournamentCard) => {
    const label = editions[c.slug]?.trim() || year;
    return /^(édition|edition|saison)(\s|$)/i.test(label) ? label : `Édition ${label}`;
  };
  const Heading = heading;

  return (
    <section id="tournois" className={`ev-picker${hero ? ' ev-picker--hero' : ''}`} aria-labelledby="ev-picker-title">
      <div className="ev-wrap">
        {hero && <p className="ev-slant-motto" aria-hidden>Apprendre<br />S’évaluer<br />Progresser</p>}
        <Reveal className="ev-picker-head">
          <Heading id="ev-picker-title" className="ev-picker-title">Choisissez <span>votre tournoi</span></Heading>
          <p className="ev-picker-season"><span aria-hidden />{season}<span aria-hidden /></p>
          <p className="ev-picker-lead">Des tournois par spécialité pour vous entraîner, vous comparer et progresser.</p>
        </Reveal>

        {all.length === 0 ? (
          <p className="ev-picker-empty">Aucun tournoi ouvert pour le moment. Le prochain sera annoncé ici et par courriel.</p>
        ) : (
          <>
            {groups.open.length > 0 && (
              <div className="ev-group">
                <p className="ev-group-title ev-group-title--open"><span aria-hidden />Tournois actuellement ouverts</p>
                <ul className="ev-open-list">
                  {groups.open.map((c) => <OpenCard key={c.id} card={c} edition={edition(c)} current={c.slug === currentSlug} />)}
                </ul>
              </div>
            )}
            {groups.upcoming.length > 0 && (
              <CompactGroup title="Prochains tournois" tone="upcoming" cards={groups.upcoming} edition={edition} currentSlug={currentSlug}
                aside={calendarHref ? <Link href={calendarHref} className="ev-group-link">Voir le calendrier des manches <ArrowRight aria-hidden /></Link> : undefined} />
            )}
            {groups.finished.length > 0 && <CompactGroup title="Tournois terminés" tone="finished" cards={groups.finished} edition={edition} currentSlug={currentSlug} />}
          </>
        )}

        <Reveal delay={0.12} className="ev-news">
          <div className="ev-news-head">
            <span className="ev-news-icon"><Mail aria-hidden strokeWidth={1.6} /></span>
            <p>Autres spécialités<br />à venir</p>
          </div>
          <ArenaNewsForm source={source} />
        </Reveal>

        <p className="ev-nature"><Info aria-hidden /><span>{WARNING_NATURE}</span></p>
      </div>
    </section>
  );
}

function Tags({ card }: { card: TournamentCard }) {
  return card.staffOnly ? <span className="ev-card-flag ev-card-flag--staff">Visible du personnel</span> : null;
}

function OpenCard({ card, edition, current }: { card: TournamentCard; edition: string; current: boolean }) {
  return (
    <li className="ev-open-card">
      <span className="ev-open-visual"><Image src={card.visual.src} alt="" width={440} height={368} sizes="170px" /></span>
      <div className="ev-open-name">
        <p className="ev-kicker">{edition}{current && <span className="ev-card-flag">Vous êtes ici</span>}</p>
        <h3>{card.specialty}</h3>
        {card.theme && <p>{card.theme}</p>}
        <Tags card={card} />
      </div>
      <div className="ev-open-facts">
        <dl>
          <div><FileText aria-hidden strokeWidth={1.6} /><dt className="sr-only">Format</dt><dd><strong>{card.questions}</strong> questions</dd></div>
          <div><Timer aria-hidden strokeWidth={1.6} /><dt className="sr-only">Durée</dt><dd><strong>{card.seconds} s</strong> par question</dd></div>
          <div className="ev-open-status"><ArenaBars aria-hidden /><dt className="sr-only">Statut</dt><dd>{card.statusLabel}</dd></div>
        </dl>
        {card.countdown && (
          <div className="ev-open-countdown">
            <span className="ev-dot" aria-hidden />
            <div>
              <CardCountdown kind={card.countdown.kind} at={card.countdown.at} />
              <p>{card.countdown.kind === 'closes' ? 'Ne manquez pas cette manche !' : 'Inscrivez-vous dès maintenant.'}</p>
            </div>
          </div>
        )}
      </div>
      <div className="ev-open-cta">
        <Link href={card.href} className="ev-btn ev-btn--red">{card.cta} <ArrowRight aria-hidden /></Link>
        <Link href={`${card.href}#manches`} className="ev-open-details"><CalendarDays aria-hidden />Voir les détails du tournoi</Link>
      </div>
    </li>
  );
}

function CompactGroup({ title, tone, cards, edition, currentSlug, aside }: {
  title: string; tone: 'upcoming' | 'finished'; cards: TournamentCard[]; edition: (c: TournamentCard) => string; currentSlug?: string; aside?: React.ReactNode;
}) {
  return (
    <div className="ev-group">
      <div className="ev-group-row">
        <p className={`ev-group-title ev-group-title--${tone}`}><span aria-hidden />{title}</p>
        {aside}
      </div>
      <ul className="ev-compact-list">
        {cards.map((c) => (
            <li key={c.id} className="ev-compact-card">
              <div className="ev-compact-head">
                <span className="ev-compact-visual"><Image src={c.visual.src} alt="" width={440} height={368} sizes="96px" /></span>
                <div>
                  <h3>{c.specialty}</h3>
                  <p className="ev-kicker">{edition(c)}</p>
                  {c.slug === currentSlug && <span className="ev-card-flag">Vous êtes ici</span>}
                  <Tags card={c} />
                </div>
                <span className={`ev-pill ev-pill--${tone}`}>{tone === 'finished' ? 'Terminé' : 'À venir'}</span>
              </div>
              <dl className="ev-compact-facts">
                <div><FileText aria-hidden strokeWidth={1.6} /><dt className="sr-only">Format</dt><dd><strong>{c.questions}</strong>questions</dd></div>
                <div><Timer aria-hidden strokeWidth={1.6} /><dt className="sr-only">Durée</dt><dd><strong>{c.seconds} s</strong>par question</dd></div>
              </dl>
              {tone === 'upcoming' && c.countdown && <div className="ev-compact-countdown"><CardCountdown kind={c.countdown.kind} at={c.countdown.at} /></div>}
              <Link href={c.href} className="ev-compact-cta"><ArenaBars aria-hidden /><span>{c.cta}</span><ArrowRight aria-hidden /></Link>
            </li>
        ))}
      </ul>
    </div>
  );
}
