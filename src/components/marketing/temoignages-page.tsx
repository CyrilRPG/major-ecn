'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Page Témoignages — refonte pixel-perfect (maquette designer).
 * Header + trust row + témoignages vidéo + témoignages écrits filtrables +
 * témoignage à la une + trust row + CTA inscription.
 */
import { useState } from 'react';
import {
  ArrowRight, BookOpen, Calendar, GraduationCap, Heart, MessageCircle,
  Play, Quote, ShieldCheck, Stethoscope, Trophy, Users,
} from 'lucide-react';
import { Reveal } from './reveal';

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
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.5rem]" style={{ color: NAVY }}>
          Leur histoire, <span style={{ color: RED }}>leur réussite</span>
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
type VideoItem = { name: string; role: string; spec: string; duration: string };
const VIDEOS: VideoItem[] = [
  { name: 'Dr Haykel Abdelbaki', role: 'Lauréat des EVC',  spec: 'Radiologie',           duration: '0:56' },
  { name: 'Dr Amélie Lamure',    role: 'Lauréate des EVC', spec: 'Anesthésie-Réanimation', duration: '0:48' },
  { name: 'Dr Albert M.',        role: 'Lauréat des EVC',  spec: 'Médecine générale',    duration: '0:44' },
  { name: 'Dr Leïla K.',         role: 'Lauréate des EVC', spec: 'Gériatrie',            duration: '0:52' },
];
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

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VIDEOS.map((v) => (
              <article key={v.name} className="overflow-hidden rounded-2xl">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
                  <div aria-hidden className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25), transparent 55%)',
                  }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-2xl">
                      <Play className="h-6 w-6" style={{ color: RED }} fill="currentColor" />
                    </span>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {v.duration}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold" style={{ background: '#FCEAEC', color: RED }}>
                    {v.spec}
                  </span>
                  <p className="mt-2 text-[15px] font-extrabold" style={{ color: NAVY }}>{v.name}</p>
                  <p className="text-[12px]" style={{ color: INK_SOFT }}>{v.role}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <a href="#all-videos" className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[#FCEAEC]"
              style={{ borderColor: RED, color: RED }}>
              Voir tous les témoignages vidéo <ArrowRight className="h-4 w-4" />
            </a>
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
};
const WRITTEN: WrittenTesti[] = [
  { name: 'Dr Amélie Lamure',    spec: 'Anesthésie-Réanimation', initials: 'AL',
    short: 'Une équipe présente, disponible et impliquée à chaque étape. J\'ai trouvé de véritables partenaires à mes côtés.' },
  { name: 'Dr Haykel Abdelbaki', spec: 'Radiologie',           initials: 'HA',
    short: 'Les cours sont clairs, le planning respecté et les concours blancs proches de l\'examen réel.' },
  { name: 'Dr Albert M.',        spec: 'Médecine générale',    initials: 'AM',
    short: 'Major ECN m\'a permis de garder le cap et d\'avancer sereinement jusqu\'au jour J.' },
  { name: 'Dr Sarah B.',         spec: 'Pédiatrie',            initials: 'SB',
    short: 'Les annales corrigées et les mots-clés m\'ont aidée à comprendre ce que les jurys attendent vraiment.' },
  { name: 'Dr Nabil T.',         spec: 'Cardiologie',          initials: 'NT',
    short: 'L\'accompagnement personnalisé fait toute la différence.' },
  { name: 'Dr Leïla K.',         spec: 'Gériatrie',            initials: 'LK',
    short: 'Organisation, sérieux et qualité des contenus : les clés de ma réussite.' },
  { name: 'Dr Youssef E.',       spec: 'Anesthésie-Réanimation', initials: 'YE',
    short: 'Les concours blancs m\'ont permis d\'évaluer mon niveau et de gagner une vraie confiance.' },
  { name: 'Dr Maria C.',         spec: 'Médecine générale',    initials: 'MC',
    short: 'Grâce à Major ECN, j\'ai abordé les EVC avec méthode et sérénité.' },
];
const SPECIALTIES = ['Tous', 'Médecine générale', 'Radiologie', 'Anesthésie-Réanimation', 'Gériatrie', 'Cardiologie', 'Pédiatrie'] as const;

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
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
                    {w.initials}
                  </span>
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
                <a className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: RED }}>
                  Lire le témoignage <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <a href="#all-written" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}>
            Voir tous les témoignages écrits <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============ TÉMOIGNAGE À LA UNE ============ */
type Featured = {
  name: string;
  initials: string;
  spec: string;
  role: string;
  /** Photo dans /public/temoignages/<photo> ; fallback initiales si absente. */
  photo: string;
  quote: string;
  paragraphs: string[];
};
const FEATURED: Featured[] = [
  {
    name: 'Dr Haykel Abdelbaki',
    initials: 'HA',
    spec: 'Radiologie',
    role: 'Lauréat des EVC',
    photo: '/temoignages/dr-haykel-abdelbaki.jpg',
    quote: 'Sérieux, qualité et accompagnement : les clés de ma réussite.',
    paragraphs: [
      "Les cours sont actualisés, clairs et parfaitement adaptés aux exigences du concours. Les concours blancs organisés dans des conditions proches de l'examen m'ont permis de me préparer concrètement au jour J. L'équipe pédagogique est à l'écoute et prend le temps d'identifier les difficultés de chaque candidat.",
      "Au-delà des supports et des enseignements, j'ai trouvé chez Major ECN un cadre de travail structuré et rassurant qui m'a permis d'aborder les épreuves avec davantage de confiance.",
    ],
  },
  {
    name: 'Dr Leila Bettaieb',
    initials: 'LB',
    spec: 'Médecine générale',
    role: 'Lauréate des EVC MG',
    photo: '/temoignages/Leila.jpg',
    quote: "Une méthode claire, de bons supports et un véritable accompagnement.",
    paragraphs: [
      "J'ai particulièrement apprécié le travail réalisé autour des cas cliniques corrigés. Pouvoir s'entraîner sur un grand nombre de dossiers et comprendre précisément ce qui était attendu dans les réponses m'a énormément aidée à progresser.",
      "Au-delà des connaissances, cette préparation m'a surtout permis d'acquérir une véritable méthodologie de travail et de réponse aux épreuves, ce qui fait souvent la différence le jour du concours.",
      "Bien sûr, il faut travailler sérieusement et réviser régulièrement. Aucune formation ne peut apprendre ou mémoriser à votre place 😊. Mais lorsqu'on dispose d'une méthode claire, de bons supports et d'un accompagnement adapté, on avance beaucoup plus sereinement.",
      "J'ai également beaucoup apprécié la disponibilité de l'équipe. À plusieurs reprises, j'ai pu poser mes questions et obtenir des réponses qui m'ont permis de continuer à avancer sans rester bloquée dans mes révisions.",
      "Je recommande sincèrement Major ECN à tous les candidats qui recherchent non seulement des cours et des entraînements de qualité, mais aussi un véritable accompagnement tout au long de leur préparation.",
    ],
  },
];

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
        {t.paragraphs.map((p, i) => (
          <p key={i} className={(i === 0 ? 'mt-4 ' : 'mt-3 ') + 'text-[13.5px] leading-relaxed'} style={{ color: INK_SOFT }}>
            {p}
          </p>
        ))}
        <a href="#full" className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}>
          Lire le témoignage complet <ArrowRight className="h-4 w-4" />
        </a>
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
        <a href="/inscription" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white"
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
