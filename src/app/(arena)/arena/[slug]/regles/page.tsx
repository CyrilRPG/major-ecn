import Image from 'next/image';
import Link from 'next/link';
import { Manrope } from 'next/font/google';
import { ArrowLeft, ArrowRight, CalendarDays, ShieldCheck } from 'lucide-react';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { ExperienceNavigation } from '@/components/arena/experience-navigation';
import { PHOTOS } from '@/components/arena/tokens';

export const dynamic = 'force-dynamic';

const rulesBody = Manrope({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-arena-rules-body', display: 'swap' });

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Les règles de l’Arena' });
}

/**
 * « Les règles de l'Arena » — sur la scène fournie par le client le
 * 10/09/2026 (`rules-scene-2026.jpg` : oriflammes, casque sur son socle, sol
 * réfléchissant) : lien de retour, hero (sur-titre, titre, pilule, accroche)
 * à gauche du casque, puis, sur le sol de l'arène, six cartes numérotées
 * moins larges que la scène, encart d'avertissement, bouton d'inscription,
 * lien vers le calendrier et pied de page (couronne de lauriers détourée).
 * Le statut et les destinations des liens suivent le tournoi réel.
 */
const CARDS = [
  { n: '01', title: '3 manches', lines: ['Le tournoi se déroule en trois', 'manches aux dates indiquées', 'dans le calendrier. Chaque', 'manche est accessible pendant', 'une durée limitée.'] },
  { n: '02', title: 'Une seule tentative', lines: ['Une seule tentative par manche.', 'Les questions sont chronométrées', 'individuellement et le passage', 'à la suivante est automatique', 'lorsque le temps est écoulé.', 'Le nombre de questions et la durée', 'sont indiqués avant le lancement', 'de chaque manche.'] },
  { n: '03', title: 'Corrections après clôture', lines: ['À la fermeture de chaque manche,', 'vous accédez à vos résultats', 'et aux corrections détaillées.'] },
  { n: '04', title: 'Classement cumulatif', lines: ['Vos performances se cumulent', 'au fil des manches. Le classement', 'évolue jusqu’au classement final.'], id: 'classement' },
  { n: '05', title: 'Participer au classement final', lines: ['Pour pouvoir intégrer', 'le classement général final,', 'participez aux trois manches.'] },
  { n: '06', title: 'Avatar et distinctions', lines: ['Votre avatar évolue au fil', 'de l’Arena en fonction de vos', 'performances et de votre', 'classement.'] },
] as const;

/** Pictogrammes au même dessin plein / contour que la maquette. */
function RulesIcon({ number }: { number: (typeof CARDS)[number]['n'] }) {
  return <svg className="ar-card-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {number === '01' && <><rect x="8" y="10" width="40" height="40" rx="1" /><path d="M8 22H48M18 5V16M38 5V16" /></>}
    {number === '02' && <><circle cx="28" cy="31" r="20" /><path d="M28 4V10M23 4H33M44 14L47 11M28 20V30" /><circle cx="28" cy="31" r="1.5" fill="currentColor" stroke="none" /></>}
    {number === '03' && <><rect x="10" y="6" width="36" height="44" rx="1" /><path d="M18 17H38M18 27H38M18 37H34" /></>}
    {number === '04' && <g strokeWidth="3.5"><path d="M4 50H53" /><path d="M8 50V37H14V50M21 50V25H27V50M34 50V10H40V50M47 50V3H53V50" /></g>}
    {number === '05' && <><path d="M13 6H43V16C43 28 37 34 28 37C19 34 13 28 13 16Z" fill="currentColor" strokeWidth="2" /><path d="M12 9H6V17C6 25 10 29 18 30M44 9H50V17C50 25 46 29 38 30" strokeWidth="3" /><path d="M25 35H31V44L38 48V52H18V48L25 44Z" fill="currentColor" strokeWidth="2" /></>}
    {number === '06' && <><circle cx="28" cy="16" r="12" /><path d="M8 50C8 26 48 26 48 50Z" /></>}
  </svg>;
}

export default async function RulesPage({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  const base = `/arena/${slug}`;
  const registerHref = ctx.participant ? `${base}/espace` : ctx.registrationOpen ? `${base}/inscription` : base;
  const registerLabel = ctx.participant ? 'Ouvrir mon espace' : ctx.registrationOpen ? 'S’inscrire gratuitement' : 'Voir le tournoi';
  const registrationLabel = ctx.registrationOpen ? 'Inscription ouverte' : ctx.snap.status === 'finished' ? 'Tournoi terminé' : 'Inscriptions fermées';
  const seasonDate = ctx.snap.rounds.find(r => r.opens_at)?.opens_at ?? ctx.snap.tournament.created_at;
  const season = new Date(seasonDate).toLocaleDateString('fr-FR', { year: 'numeric', timeZone: 'Europe/Paris' });

  return (
    <>
    <ExperienceNavigation nav={ctx.nav} />
    <main className={`ar-page ${rulesBody.variable}`}>
      <Link href={base} className="ar-back"><ArrowLeft aria-hidden strokeWidth={2} />Retour à l’Arena</Link>

      <section className="ar-hero">
        <div className="ar-hero-copy">
          <p className="ar-kicker">Règles du tournoi</p>
          <h1 className="ar-title">Les règles<br />de l’Arena</h1>
          <p className="ar-pill"><CalendarDays aria-hidden strokeWidth={2} />{registrationLabel} · Saison {season}</p>
          <p className="ar-lead">Un entraînement pour progresser,<br />se challenger et se mesurer aux autres.</p>
          <span className="ar-lead-rule" aria-hidden />
        </div>
      </section>

      <ol className="ar-grid" aria-label="Règles du tournoi">
        {CARDS.map((c) => (
          <li key={c.n} className="ar-card" id={'id' in c ? c.id : undefined}>
            <div className="ar-card-head">
              <span className="ar-badge">{c.n}</span>
              <RulesIcon number={c.n} />
            </div>
            <h2>{c.title}</h2>
            <p>{c.lines.map((line, i) => <span className="ar-copy-line" key={line}>{i > 0 ? ' ' : ''}{line}</span>)}</p>
          </li>
        ))}
      </ol>

      <div className="ar-warning" role="note">
        <span className="ar-warning-icon"><ShieldCheck strokeWidth={1.7} aria-hidden /></span>
        <p><span>EVC Arena est un entraînement ludique, inspiré des formats d’épreuves des EVC.</span> Il ne s’agit pas d’un concours blanc et les résultats obtenus ne préjugent pas de vos chances de réussite aux épreuves officielles.</p>
      </div>

      <div className="ar-cta">
        <Link href={registerHref} className="ar-button">{registerLabel} <ArrowRight aria-hidden strokeWidth={1.8} /></Link>
        <Link href={`${base}#manches`} className="ar-calendar">Voir le calendrier des manches</Link>
      </div>

      <footer className="ar-footer">
        <span className="ar-footer-rule" aria-hidden />
        <span>Major ECN</span>
        <span className="ar-footer-rule" aria-hidden />
        <Image src={PHOTOS.laurel} alt="" width={485} height={412} sizes="84px" className="ar-footer-emblem" />
        <span className="ar-footer-rule" aria-hidden />
        <span className="ar-footer-tagline">L’excellence pour votre avenir</span>
        <span className="ar-footer-rule" aria-hidden />
      </footer>
    </main>
    </>
  );
}
