'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Page Témoignages — refonte pixel-perfect (maquette designer).
 * Header + trust row + témoignages vidéo + témoignages écrits filtrables +
 * témoignage à la une + trust row + CTA inscription.
 */
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, GraduationCap, Heart, MessageCircle,
  Play, Quote, ShieldCheck, Stethoscope, Trophy, Users,
} from 'lucide-react';
import { Reveal } from './reveal';
import { FEATURED_TESTIMONIES, type Featured } from '@/lib/data/featured-testimonies';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK = '#0F172A';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const SOFT_BG = '#FDF2F4';
const FONT = "'Plus Jakarta Sans', sans-serif";

/* ============ HEADER ============ */
function TemoignagesHeader() {
  return (
    <section className="bg-white pt-12 pb-10 sm:pt-16 sm:pb-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em]"
          style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
          <Trophy className="h-3.5 w-3.5" /> Témoignages de lauréats
        </span>
        <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]"
          style={{
            backgroundImage: 'linear-gradient(90deg, #0F1F4D 0%, #6B1A2A 45%, #C0112E 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
          }}>
          Leur histoire, leur réussite
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
          Des médecins qui ont préparé les EVC avec Major ECN racontent,
          sans filtre, leur parcours et ce qui les a aidés à réussir.
        </p>

        {/* Trust row */}
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-10">
          {[
            { Icon: Calendar, big: 'Depuis 2011',                sub: 'au service des candidats EVC' },
            { Icon: Users,    big: '+45 spécialités préparées',  sub: 'toutes disciplines' },
            { Icon: ShieldCheck, big: 'Voie interne et voie externe', sub: 'accompagnement dédié' },
            { Icon: Trophy,   big: 'Parcours authentiques',      sub: 'témoignages vérifiés' },
          ].map((t) => (
            <div key={t.big} className="flex items-center gap-3 text-left">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                <t.Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{t.big}</p>
                <p className="text-[11px] leading-tight" style={{ color: INK_SOFT }}>{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ TÉMOIGNAGES VIDÉO ============ */
const REAL_VIDEOS = [
  { name: "Dr Sami KABAWEH",       spec: "Radiodiagnostic & imagerie médicale", year: "Lauréat EVC",        videoSrc: "/temoignages/T1 FINAL V2.mp4", bgGrad: "linear-gradient(135deg, #14254E 0%, #6D28D9 50%, #A91D2C 100%)" },
  { name: "Dr Karim KHIAREDDINE",  spec: "Anesthésie réanimation",              year: "Lauréat EVC 2025",   videoSrc: "/temoignages/T2 FINAL V2.mp4", bgGrad: "linear-gradient(135deg, #2A1A4A 0%, #6D28D9 55%, #A91D2C 100%)" },
  { name: "Dr Ely Cheikh SY",      spec: "Endocrinologie & métabolisme",        year: "Lauréat EVC 2025",   videoSrc: "/temoignages/T3 FINAL V2.mp4", bgGrad: "linear-gradient(135deg, #0F4438 0%, #16793C 55%, #A91D2C 100%)" },
  { name: "Dr Ahmed SIFAOUI",      spec: "Gériatrie",                           year: "Lauréat EVC 2025",   videoSrc: "/temoignages/T4 Final V2.mp4", bgGrad: "linear-gradient(135deg, #6B1A2A 0%, #B45309 55%, #E8742C 100%)" },
  { name: "Dr Ahena HAROUN",       spec: "Chirurgie viscérale & digestive",     year: "Lauréate EVC 2024",  videoSrc: "/temoignages/T5 FINAL V2.mp4", bgGrad: "linear-gradient(135deg, #4B0F1B 0%, #A91D2C 55%, #E8742C 100%)" },
];
type RealVideo = (typeof REAL_VIDEOS)[number];

function VideoCard({ v }: { v: RealVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <article className="snap-start shrink-0 w-[220px] overflow-hidden rounded-2xl border bg-white sm:w-[200px]" style={{ borderColor: BORDER }}>
      <div className="relative aspect-[9/16] w-full overflow-hidden" style={{ background: v.bgGrad }}>
        <video
          src={v.videoSrc}
          controls
          playsInline
          preload="metadata"
          aria-label={`Témoignage vidéo de ${v.name}`}
          className="absolute inset-0 h-full w-full bg-black object-contain"
          onLoadedData={(e) => { e.currentTarget.currentTime = 3; }}
          onPlay={(e) => {
            if (e.currentTarget.currentTime >= 2.5) e.currentTarget.currentTime = 0;
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
        {!isPlaying && (
          <span
            className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg"
            style={{ background: RED }}
          >
            <Trophy className="h-3 w-3" />
            {v.year}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[14px] font-extrabold leading-tight" style={{ color: NAVY }}>{v.name}</p>
        <p className="mt-0.5 text-[12px] font-bold" style={{ color: RED }}>{v.spec}</p>
      </div>
    </article>
  );
}

function VideosSection() {
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-white p-6 sm:p-8" style={{ borderColor: BORDER }}>
          <div className="text-center">
            <h2 className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
              <Play className="h-5 w-5" style={{ color: RED }} fill="currentColor" />
              <span className="text-[12px] uppercase tracking-[0.2em]" style={{ color: NAVY }}>Témoignages vidéo</span>
            </h2>
            <p className="mt-2 text-[14px]" style={{ color: INK_SOFT }}>
              Découvrez le parcours de nos lauréats en vidéo
            </p>
          </div>

          <div className="mt-8 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide sm:justify-center sm:overflow-visible sm:flex-wrap">
            {REAL_VIDEOS.map((v) => (
              <VideoCard key={v.name} v={v} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ TÉMOIGNAGES ÉCRITS ============ */
type WrittenTesti = {
  name: string;
  spec: string;
  short: string;
  initials: string;
  /** Photo dans /public/temoignages/<file> — sinon initiales en fallback. */
  photo?: string;
  /** Slug de l'article-temoignage complet (route /temoignages/[slug]). */
  slug?: string;
};
const WRITTEN: WrittenTesti[] = [
  // Témoignages avec photo (issus de FEATURED_TESTIMONIES) -- carte avec
  // photo et lien "Lire le témoignage" actif.
  { name: 'Dr Ahmed SIFAOUI',    spec: 'Gériatrie',                   initials: 'AS',
    photo: '/temoignages/dr-ahmed-sifaoui.png', slug: 'dr-ahmed-sifaoui',
    short: "Une méthode et un cadre qui font la différence, même quand le nombre de postes se réduit." },
  { name: 'Dr Haykel Abdelbaki', spec: 'Radiologie',                  initials: 'HA',
    photo: '/temoignages/dr-haykel-abdelbaki.jpg', slug: 'dr-haykel-abdelbaki',
    short: "Sérieux, qualité et accompagnement : les clés de ma réussite." },
  { name: 'Dr Amélie Lamure',    spec: 'Anesthésie-Réanimation',      initials: 'AL',
    photo: '/temoignages/dr-amelie-lamure.jpg', slug: 'dr-amelie-lamure',
    short: "Une équipe présente, disponible et impliquée à chaque étape." },
  { name: 'Dr Leila Bettaieb',   spec: 'Médecine générale',           initials: 'LB',
    photo: '/temoignages/dr-leila-bettaieb.jpg', slug: 'dr-leila-bettaieb',
    short: "Une méthode claire, de bons supports et un véritable accompagnement." },
  { name: 'Dr Bill Baron WANKPO', spec: 'Médecine générale',          initials: 'BW',
    photo: '/temoignages/drbilly.png', slug: 'dr-bill-baron-wankpo',
    short: "Une préparation structurée et ciblée, utile bien au-delà du concours." },
  { name: 'Dr Samy KABAWEH',     spec: 'Radiologie',                  initials: 'SK',
    photo: '/temoignages/drsamy.jpg', slug: 'dr-samy-kabaweh',
    short: "Cette préparation m'a vraiment permis de franchir un cap." },
  { name: 'Dr Faten Hnania',     spec: 'Médecine générale',           initials: 'FH',
    photo: '/temoignages/drfaten.png', slug: 'dr-faten-hnania',
    short: "Un cadre clair et une méthode de travail sérieuse." },
  { name: 'Dr Lilia Ouled Ben Ahmed', spec: 'Odontologie',            initials: 'LO',
    photo: '/temoignages/dr-lilia-ouled-ben-ahmed.jpg', slug: 'dr-lilia-ouled-ben-ahmed',
    short: "Une préparation sérieuse, structurée et adaptée aux nouvelles modalités EVC 2025." },

  // Témoignages additionnels en attente de photo -- carte avec initiales.
  { name: 'Dr Lynda SEMAI',          spec: 'Ophtalmologie',                       initials: 'LS',
    slug: 'dr-lynda-semai', short: "Une préparation rigoureuse qui m'a guidée vers la réussite des EVC en ophtalmologie." },
  { name: 'Dr Sandrine Linda SA’A TALLA', spec: 'Médecine générale',              initials: 'ST',
    slug: 'dr-sandrine-linda-saa-talla', short: "Une méthode claire et un accompagnement qui m'ont menée à la réussite des EVC en médecine générale." },
  { name: 'Dr Monica WAITZFELDER',   spec: 'Psychiatrie',                         initials: 'MW',
    slug: 'dr-monica-waitzfelder', short: "Après une première tentative en solo sans succès, la formation Major ECN m'a apporté la méthode qui a fait la différence." },
  { name: 'Dr Imene DENECHE',        spec: 'Médecine générale',                   initials: 'ID',
    slug: 'dr-imene-deneche', short: "Classée 2ᵉ en médecine générale grâce à une méthode efficace et à des dossiers proches du jour J." },
  { name: 'Dr Lamia BOUDEBZA',       spec: 'Médecine générale',                   initials: 'LB',
    slug: 'dr-lamia-boudebza', short: "Une formation qui fait gagner du temps, donne de la méthode et de la confiance pour le jour J." },
  { name: 'Dr Joée MAEVAZAKA',       spec: 'Chirurgie viscérale',                 initials: 'JM',
    slug: 'dr-joee-maevazaka', short: "Une méthode rigoureuse qui change vraiment la donne après une préparation en solo." },
  { name: 'Dr Carlyse MINKALA',      spec: 'Radiodiagnostic et imagerie médicale',initials: 'CM',
    slug: 'dr-carlyse-minkala', short: "Classée 11ᵉ sur 120 en radiodiagnostic grâce à un accompagnement précis et des conseils utiles." },
  { name: 'Dr A. SEMÊVO',            spec: 'Endocrinologie',                      initials: 'AS',
    slug: 'dr-a-semevo',
    short: "Après une première tentative manquée en solo, la méthode m'a permis de valider l'EVC en endocrinologie." },
  { name: 'Dr Ikram HADJIJ',         spec: 'Gériatrie',                           initials: 'IH',
    slug: 'dr-ikram-hadjij', short: "Une préparation structurée qui m'a permis de réussir les EVC en gériatrie." },
];
const SPECIALTIES = [
  'Tous',
  'Médecine générale',
  'Radiologie',
  'Anesthésie-Réanimation',
  'Gériatrie',
  'Cardiologie',
  'Pédiatrie',
  'Odontologie',
  'Ophtalmologie',
  'Psychiatrie',
  'Chirurgie viscérale',
  'Radiodiagnostic et imagerie médicale',
  'Endocrinologie',
] as const;

function WrittenSection() {
  const [tab, setTab] = useState<string>('Tous');
  const list = tab === 'Tous' ? WRITTEN : WRITTEN.filter((w) => w.spec === tab);

  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] font-extrabold" style={{ color: NAVY }}>
            <MessageCircle className="h-4 w-4" style={{ color: RED }} />
            Témoignages écrits
          </h2>
          <p className="mt-2 text-[14px]" style={{ color: INK_SOFT }}>
            Lisez les parcours et conseils de nos lauréats
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-white p-2" style={{ borderColor: BORDER }}>
          {SPECIALTIES.map((s) => (
            <button key={s} onClick={() => setTab(s)}
              className={'rounded-xl px-3.5 py-2 text-[12.5px] font-bold transition-colors ' + (tab === s ? 'text-white' : 'hover:bg-[#FCEAEC]')}
              style={tab === s ? { background: RED, color: 'white' } : { color: INK_SOFT }}>
              {s}
            </button>
          ))}
          <button className="rounded-xl px-3.5 py-2 text-[12.5px] font-bold" style={{ color: INK_SOFT }}>Plus ▾</button>
        </div>

        {/* Grid */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((w) => (
            <Reveal key={w.name}>
              <article className="flex h-full flex-col rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <header className="flex items-start gap-3">
                  {w.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.photo} alt={w.name}
                      className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
                      {w.initials}
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                    style={{ background: '#FCEAEC', color: RED }}>
                    {w.spec === 'Pédiatrie' && <Heart className="h-2.5 w-2.5" />}
                    {w.spec === 'Cardiologie' && <Heart className="h-2.5 w-2.5" />}
                    {w.spec === 'Radiologie' && <Trophy className="h-2.5 w-2.5" />}
                    {w.spec === 'Gériatrie' && <Heart className="h-2.5 w-2.5" />}
                    {w.spec.split('-').join('-­')}
                  </span>
                </header>
                <p className="mt-3 text-[14.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{w.name}</p>
                <p className="mt-0.5 text-[12px]" style={{ color: INK_SOFT }}>Lauréat des EVC</p>
                <p className="mt-1 text-[12px]" style={{ color: '#F59E0B' }}>★★★★★</p>
                <div className="mt-3 flex items-start gap-2">
                  <Quote className="h-4 w-4 shrink-0" style={{ color: RED }} fill="currentColor" />
                  <p className="text-[12.5px] leading-relaxed" style={{ color: INK }}>{w.short}</p>
                </div>
                {w.slug ? (
                  <Link href={`/temoignages/${w.slug}`}
                    className="mt-auto inline-flex items-center gap-1 pt-4 text-[12px] font-bold hover:underline"
                    style={{ color: RED }}>
                    Lire le témoignage <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="mt-auto pt-4 text-[11px] italic" style={{ color: INK_MUTED }}>
                    Témoignage complet à venir
                  </span>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ TÉMOIGNAGE À LA UNE ============ */
const FEATURED = FEATURED_TESTIMONIES;

function FeaturedCard({ t }: { t: Featured }) {
  return (
    <div className="rounded-3xl p-6 sm:p-8 grid gap-6 lg:grid-cols-[260px_1fr_280px] items-center"
      style={{ background: SOFT_BG, border: `1px solid #F3D9DD` }}>
      {/* Left avatar + name */}
      <div className="text-center">
        <span className="relative mx-auto block h-32 w-32 overflow-hidden rounded-full"
          style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
          <img
            src={t.photo}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = 'none';
              const sib = img.nextElementSibling as HTMLElement | null;
              if (sib) sib.style.display = 'flex';
            }}
          />
          <span
            aria-hidden
            className="hidden h-full w-full items-center justify-center text-3xl font-black text-white"
          >
            {t.initials}
          </span>
        </span>
        <p className="mt-4 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: RED }}>
          Témoignage à la une
        </p>
        <p className="mt-1 text-base font-extrabold" style={{ color: NAVY }}>{t.name}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
          style={{ background: 'white', color: RED, border: `1px solid #F3D9DD` }}>
          <Trophy className="h-3 w-3" /> {t.spec}
        </span>
        <p className="mt-1 text-[11px]" style={{ color: INK_SOFT }}>{t.role}</p>
      </div>

      {/* Center — quote + paragraphs */}
      <div>
        <Quote className="h-6 w-6" style={{ color: RED }} fill="currentColor" />
        <p className="mt-2 text-xl font-black leading-tight" style={{ color: NAVY }}>
          &ldquo;{t.quote}&rdquo;
        </p>
        {/* Extrait : 2 premiers paragraphes + lien vers la page complète. */}
        {t.paragraphs.slice(0, 2).map((p, i) => (
          <p key={i} className={(i === 0 ? 'mt-4 ' : 'mt-3 ') + 'text-[13.5px] leading-relaxed'} style={{ color: INK_SOFT }}>
            {p}
          </p>
        ))}
        <Link
          href={`/temoignages/${t.slug}`}
          className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold"
          style={{ color: RED }}
        >
          Voir plus <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <div className="mt-5">
          <Link
            href={`/temoignages/${t.slug}`}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}
          >
            Lire le témoignage complet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Right — decorative card */}
      <div className="hidden lg:block">
        <div className="relative aspect-square overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
          <div aria-hidden className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)',
          }} />
          <div className="absolute left-5 top-5 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Major ECN</span>
          </div>
          <p className="absolute bottom-5 left-5 right-5 text-[13px] font-bold leading-snug text-white">
            Référentiel EVC<br />Méthodologie & accompagnement
          </p>
        </div>
      </div>
    </div>
  );
}

function FeaturedSection() {
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {FEATURED.map((t) => (
          <FeaturedCard key={t.name} t={t} />
        ))}
      </div>
    </section>
  );
}

/* ============ TRUST ROW BIS ============ */
function TrustRowBis() {
  const items = [
    { Icon: Calendar,    big: 'Depuis 2011',              sub: 'au service des candidats aux EVC' },
    { Icon: Users,       big: 'Des médecins accompagnés', sub: 'tout au long de leur préparation' },
    { Icon: BookOpen,    big: 'Une méthodologie éprouvée', sub: 'adaptée aux exigences des EVC (PAE)' },
    { Icon: GraduationCap, big: 'Toutes disciplines',     sub: 'médecins, pharmaciens, odontologistes et sages-femmes' },
  ];
  return (
    <section className="bg-white py-8" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-6 sm:p-7 grid grid-cols-2 gap-6 sm:grid-cols-4" style={{ background: SOFT_BG, border: `1px solid #F3D9DD` }}>
          {items.map((i) => (
            <div key={i.big} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                <i.Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{i.big}</p>
                <p className="text-[11px] leading-tight" style={{ color: INK_SOFT }}>{i.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ CTA INSCRIPTION ============ */
function TemoignagesCta() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-16" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl rounded-2xl p-6 sm:p-7 grid items-center gap-4 sm:grid-cols-[1fr_auto_auto]"
        style={{ background: '#FFF1F3', border: `1px solid #F3D9DD` }}>
        <div>
          <h3 className="text-lg font-extrabold" style={{ color: NAVY }}>Vous préparez les EVC&nbsp;?</h3>
          <p className="mt-1 text-[13.5px]" style={{ color: INK_SOFT }}>
            Rejoignez un accompagnement conçu par des experts pour maximiser vos chances de réussite.
          </p>
        </div>
        <a href="/tarifs" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white"
          style={{ background: RED }}>
          Découvrir nos préparations <ArrowRight className="h-4 w-4" />
        </a>
        <span aria-hidden className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'white', border: `1px solid #F3D9DD` }}>
          <BookOpen className="h-5 w-5" style={{ color: RED }} />
        </span>
      </div>
    </section>
  );
}

/* ============ PAGE ============ */
export function TemoignagesPageContent() {
  return (
    <>
      <TemoignagesHeader />
      <VideosSection />
      <WrittenSection />
      <FeaturedSection />
      <TrustRowBis />
      <TemoignagesCta />
    </>
  );
}
