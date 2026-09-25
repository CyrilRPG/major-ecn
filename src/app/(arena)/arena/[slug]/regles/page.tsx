import { CalendarDays, Info, Timer, Trophy, Wifi } from 'lucide-react';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { ArenaBackdropPhoto } from '@/components/arena/arena-backdrop';
import { ArenaPage } from '@/components/arena/arena-shell';
import { ArenaBars } from '@/components/arena/experience-icons';
import { LandingBareme, type BaremeCard } from '@/components/arena/landing/bareme-board';
import { RulesAccordion } from '@/components/arena/rules-accordion';
import { PHOTOS } from '@/components/arena/tokens';
import { effectiveBareme } from '@/lib/arena/db';
import { describeBareme } from '@/lib/arena/scoring';
import { publicRules, WARNING_CONNECTION, WARNING_NATURE } from '@/lib/arena/texts';
import { roundState } from '@/lib/arena/time';
import { qrpNs } from '@/lib/arena/types';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Les règles de l’Arena' });
}

/** Titres courts de la maquette pour les douze règles publiques (§19), dans leur ordre. */
const RULE_TITLES = [
  'Trois manches', 'Format des manches', 'Corrections après clôture', 'Classement cumulatif',
  'Votre personnage', 'Classement général', 'Inscription', 'Égalité',
  'Seuil de classement', 'Conditions pour les trophées', 'Rangs et effectif', 'Esprit du tournoi',
];

/**
 * « Les règles de l'Arena » — maquette client du 24/09/2026 (15_18_15) puis
 * barème (15_13_48) : hero sur la photo de l'arène (règlement, titre bicolore,
 * encart « tournoi ludique » + « connexion »), quatre cartes 01-04, bouton et
 * panneau des 12 règles détaillées (textes `publicRules`, §19), barème réel de
 * la manche en cours (CNG par défaut, grille du tournoi sinon), pied de page
 * complet. Les seuils (classement, distinction) viennent du tournoi.
 */
export default async function RulesPage({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  const t = ctx.snap.tournament;
  const rounds = ctx.snap.rounds;
  const now = new Date();
  const texts = publicRules(t);
  const rules = texts.map((text, i) => ({ title: RULE_TITLES[i] ?? `Règle ${i + 1}`, text }));
  const distinction = Math.max(t.threshold_pct ?? 50, t.distinction_pct ?? 70);

  const baremeRound = rounds.find((r) => roundState(r, now) === 'open') ?? rounds.find((r) => roundState(r, now) === 'upcoming') ?? rounds[0] ?? null;
  const bareme = baremeRound ? effectiveBareme(t, baremeRound) : t.bareme;
  const ns = qrpNs(baremeRound ? ctx.snap.questionsByRound.get(baremeRound.id) ?? [] : []);
  const cards: BaremeCard[] = (['QRM', 'QRU', 'QRP'] as const).map((k) => ({ type: k, ...describeBareme(k, bareme, ns) }));

  const CARDS = [
    { n: '01', icon: <CalendarDays aria-hidden strokeWidth={1.5} />, title: 'Trois manches', text: 'Les dates et heures d’ouverture et de clôture de chaque manche figurent dans le calendrier du tournoi.' },
    { n: '02', icon: <Timer aria-hidden strokeWidth={1.5} />, title: 'Une seule tentative', text: 'Chaque manche se joue une seule fois. Chaque question est chronométrée : le temps écoulé, on passe à la suivante.' },
    { n: '03', icon: <ArenaBars aria-hidden />, title: 'Classement cumulé', text: 'Votre score s’ajoute au classement général du tournoi, provisoire après M1 et M2, final après M3.', id: 'classement' },
    { n: '04', icon: <Trophy aria-hidden strokeWidth={1.5} />, title: 'Seuils et distinctions', text: `Les trophées Or, Argent et Bronze exigent une place sur le podium et un score d’au moins ${distinction} %. Un premier sous ce seuil est félicité pour sa place.` },
  ];

  return (
    <ArenaPage nav={ctx.nav} immersive footer="full">
      <ArenaBackdropPhoto src={PHOTOS.heroArena} srcMobile={PHOTOS.heroArenaMobile} />
      <section className="ev-rules" aria-labelledby="ev-rules-title">
        <div className="ev-wrap">
          <div className="ev-rules-hero">
            <div className="ev-rules-copy">
              <p className="ev-eyebrow"><span aria-hidden className="ev-rule" />Règlement</p>
              <h1 id="ev-rules-title" className="ev-title-xl">Les règles <em>de l’Arena.</em></h1>
              <p className="ev-rules-lead">Un cadre clair, un challenge exigeant, pour progresser <br />en conditions réelles.</p>
            </div>
            <aside className="ev-rules-info" aria-label="À savoir avant de jouer">
              <div>
                <Info aria-hidden className="ev-rules-info-dot" />
                <div><h2>Un tournoi ludique d’entraînement</h2><p>{WARNING_NATURE}</p></div>
              </div>
              <div>
                <Wifi aria-hidden className="ev-rules-info-wifi" />
                <div><h2>Connexion</h2><p>{WARNING_CONNECTION}</p></div>
              </div>
            </aside>
          </div>

          <ol className="ev-rules-cards" aria-label="L’essentiel du règlement">
            {CARDS.map((c) => (
              <li key={c.n} id={c.id}>
                <div className="ev-rules-card-head">
                  <span className="ev-rules-card-icon">{c.icon}</span>
                  <div><span className="ev-rules-card-num">{c.n}</span><h2>{c.title}</h2></div>
                </div>
                <p>{c.text}</p>
              </li>
            ))}
          </ol>

          <RulesAccordion rules={rules} />
        </div>
      </section>

      <LandingBareme
        header
        cards={cards}
        roundLabel={baremeRound ? `Barème affiché : manche ${baremeRound.number}${baremeRound.bareme_locked_at ? ' (verrouillé)' : ''}.` : ''}
      />
    </ArenaPage>
  );
}
