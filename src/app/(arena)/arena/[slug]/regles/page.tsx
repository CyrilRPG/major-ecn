import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, ClipboardList, ShieldCheck, Timer, Trophy, UserRound } from 'lucide-react';
import { ArenaOriflammes, LaurelIcon, OriflammeEvcArena } from '@/components/arena/arena-oriflammes';
import { PHOTOS } from '@/components/arena/tokens';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Les règles de l’Arena' });
}

/**
 * « Les règles de l'Arena » — reproduction de la maquette client (portrait
 * 1024 × 1536) : lien de retour, deux oriflammes suspendues au bord supérieur
 * (HTML/SVG, hors de la photo de fond), hero (sur-titre, titre, pilule,
 * accroche), casque spartiate à droite, six cartes numérotées, encart
 * d'avertissement, bouton d'inscription, lien vers le calendrier et pied de
 * page. Textes repris tels quels. Le fond unique vient du layout Arena.
 */
const CARDS = [
  { n: '01', icon: CalendarDays, title: '3 manches', text: 'Le tournoi se déroule en trois manches aux dates indiquées dans le calendrier. Chaque manche est accessible pendant une durée limitée.' },
  { n: '02', icon: Timer, title: 'Une seule tentative', text: 'Une seule tentative par manche. Les questions sont chronométrées individuellement et le passage à la suivante est automatique lorsque le temps est écoulé. Le nombre de questions et la durée sont indiqués avant le lancement de chaque manche.' },
  { n: '03', icon: ClipboardList, title: 'Corrections après clôture', text: 'À la fermeture de chaque manche, vous accédez à vos résultats et aux corrections détaillées.' },
  { n: '04', icon: BarChart3, title: 'Classement cumulatif', text: 'Vos performances se cumulent au fil des manches. Le classement évolue jusqu’au classement final.', id: 'classement' },
  { n: '05', icon: Trophy, title: 'Participer au classement final', text: 'Pour pouvoir intégrer le classement général final, participez aux trois manches.' },
  { n: '06', icon: UserRound, title: 'Avatar et distinctions', text: 'Votre avatar évolue au fil de l’Arena en fonction de vos performances et de votre classement.' },
] as const;

export default async function RulesPage({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  const base = `/arena/${slug}`;
  // Même bouton pour tous ; un participant connecté est conduit à son espace.
  const registerHref = ctx.participant ? `${base}/espace` : ctx.registrationOpen ? `${base}/inscription` : base;

  return (
    <div className="ar-page">
      <Link href={base} className="ar-back"><ArrowLeft aria-hidden strokeWidth={2} />Retour à l’Arena</Link>

      <section className="ar-hero">
        <ArenaOriflammes
          left={<OriflammeEvcArena />}
          right={
            <>
              <LaurelIcon className="arena-oriflamme-icon" />
              <span className="arena-oriflamme-rule" />
              <p className="arena-oriflamme-text"><span>Plus qu’un</span><span>entraînement,</span><span>une communauté</span><span>d’excellence</span></p>
            </>
          }
        />
        <div className="ar-hero-copy">
          <p className="ar-kicker">Règles du tournoi</p>
          <h1 className="ar-title">Les règles<br />de l’Arena</h1>
          <p className="ar-pill"><CalendarDays aria-hidden strokeWidth={1.8} />Inscription ouverte · Saison 2026</p>
          <p className="ar-lead">Un entraînement pour progresser,<br />se challenger et se mesurer aux autres.</p>
          <span className="ar-lead-rule" aria-hidden />
        </div>
        <div className="ar-helmet" aria-hidden>
          <Image src={PHOTOS.helmet} alt="" width={880} height={1186} priority sizes="(max-width: 640px) 130px, (max-width: 1024px) 170px, 220px" />
        </div>
      </section>

      <ol className="ar-grid" aria-label="Règles du tournoi">
        {CARDS.map((c) => (
          <li key={c.n} className="ar-card" id={'id' in c ? c.id : undefined}>
            <div className="ar-card-head">
              <span className="ar-badge">{c.n}</span>
              <c.icon className="ar-card-icon" strokeWidth={1.5} aria-hidden />
            </div>
            <h2>{c.title}</h2>
            <p>{c.text}</p>
          </li>
        ))}
      </ol>

      <div className="ar-warning" role="note">
        <ShieldCheck strokeWidth={1.5} aria-hidden />
        <p>EVC Arena est un entraînement ludique, inspiré des formats d’épreuves des EVC. Il ne s’agit pas d’un concours blanc et les résultats obtenus ne préjugent pas de vos chances de réussite aux épreuves officielles.</p>
      </div>

      <div className="ar-cta">
        <Link href={registerHref} className="ar-button">S’inscrire gratuitement <ArrowRight aria-hidden strokeWidth={2.2} /></Link>
        <Link href={`${base}#manches`} className="ar-calendar">Voir le calendrier des manches</Link>
      </div>

      <footer className="ar-footer">
        <span>Major ECN</span>
        <span className="ar-footer-rule" aria-hidden />
        <LaurelIcon className="ar-footer-emblem" />
        <span className="ar-footer-rule" aria-hidden />
        <span>L’excellence pour votre avenir</span>
      </footer>
    </div>
  );
}
