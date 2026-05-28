import Link from 'next/link';
import { ArrowRight, Brain, LineChart, Quote, Sparkles, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/marketing/reveal';
import { ManusHero } from '@/components/marketing/manus-hero';
import { FreeTrialBanner } from '@/components/marketing/manus-sections';
import { FinalCtaBlock } from '@/components/marketing/extra-sections';

export const metadata = {
  title: 'Major ECN — Préparez les EVC avec excellence',
  description:
    'La plateforme premium de préparation aux EVC pour les médecins à diplôme étranger. Méthode structurée, IA pédagogique, accompagnement humain.',
};

const FEATURES = [
  {
    Icon: Target,
    t: 'QCM intelligents',
    d: 'Adaptés à votre niveau, générés à partir des annales et du programme officiel.',
  },
  {
    Icon: Brain,
    t: 'IA pédagogique',
    d: 'L’IA détecte vos lacunes et ajuste vos révisions en temps réel.',
  },
  {
    Icon: LineChart,
    t: 'Suivi temps réel',
    d: 'Analytics par spécialité, progression visible, recommandations claires.',
  },
];

const KEY_NUMBERS = [
  { v: '87 %',    l: 'Taux de réussite' },
  { v: '2 400+',  l: 'Médecins formés' },
  { v: '4 200+',  l: 'QCM corrigés' },
  { v: '20',      l: 'Spécialités' },
];

const QUICK_LINKS = [
  { href: '/methode',     label: 'Notre méthode',         desc: '6 étapes structurées' },
  { href: '/plateforme',  label: 'La plateforme',         desc: 'QCM, dashboard, lives' },
  { href: '/equipe',      label: 'L’équipe pédagogique',  desc: '25+ enseignants' },
  { href: '/temoignages', label: 'Témoignages',           desc: 'Médecins reçus aux EVC' },
];

const MINI_TEMOIGNAGE = {
  citation: '« J’étais perdue. Aujourd’hui j’ai eu mon EVC en cardiologie. »',
  nom: 'Dr. Marwa B.',
  role: 'Chirurgie générale',
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      {/* HERO — Manus arc-en-ciel */}
      <ManusHero />

      {/* 3 features — value proposition condensée */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ background: 'rgba(107,26,42,0.06)', borderColor: 'rgba(107,26,42,0.2)', color: '#6B1A2A' }}
            >
              <Sparkles className="h-3 w-3" />
              Pourquoi Major ECN
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#2D2D2D] sm:text-4xl lg:text-5xl">
              Tout ce qu’il faut pour réussir les EVC
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.t} delay={i * 0.08}>
                <article className="group h-full rounded-2xl border border-[#E8E7E3] bg-[#FAFAF8] p-6 transition-all hover:-translate-y-1 hover:border-[#6B1A2A]/30 hover:bg-white hover:shadow-xl">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, #6B1A2A, #4D121E)' }}
                  >
                    <f.Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-[#2D2D2D]">{f.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">{f.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Key numbers — 4 stats fortes */}
      <section className="bg-[#FAFAF8] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[#E8E7E3] bg-[#E8E7E3] sm:grid-cols-4">
              {KEY_NUMBERS.map((k) => (
                <div key={k.l} className="bg-white p-7 text-center">
                  <p className="font-display text-4xl font-extrabold tracking-tight text-[#6B1A2A] sm:text-5xl">
                    {k.v}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#7A7A7A]">{k.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mini-témoignage — preuve sociale rapide */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <figure className="relative overflow-hidden rounded-3xl border border-[#E8E7E3] bg-gradient-to-br from-white to-[#F5F5F0] p-8 text-center sm:p-12">
              <Quote className="mx-auto h-8 w-8 text-[#6B1A2A]" />
              <blockquote className="mt-4 font-display text-xl font-bold leading-snug tracking-tight text-[#2D2D2D] sm:text-2xl">
                {MINI_TEMOIGNAGE.citation}
              </blockquote>
              <figcaption className="mt-4 text-sm text-[#5A5A5A]">
                <span className="font-semibold text-[#2D2D2D]">{MINI_TEMOIGNAGE.nom}</span>
                {' — '}
                {MINI_TEMOIGNAGE.role}
              </figcaption>
              <Link
                href="/temoignages"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B1A2A] hover:underline"
              >
                Voir tous les témoignages
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Bannière essai gratuit (sticky on-page) */}
      <FreeTrialBanner />

      {/* Liens rapides — explorer le site */}
      <section className="bg-[#FAFAF8] py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#2D2D2D] sm:text-4xl">
              Découvrez Major ECN en détail
            </h2>
            <p className="mt-3 text-base text-[#5A5A5A]">
              Plongez dans la méthode, l’écosystème pédagogique ou rencontrez l’équipe.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map((q, i) => (
              <Reveal key={q.href} delay={i * 0.06}>
                <Link
                  href={q.href}
                  className="group block h-full rounded-2xl border border-[#E8E7E3] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#6B1A2A]/30 hover:shadow-xl"
                >
                  <p className="font-display text-base font-bold tracking-tight text-[#2D2D2D]">
                    {q.label}
                  </p>
                  <p className="mt-1 text-sm text-[#5A5A5A]">{q.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B1A2A]">
                    Explorer
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final — inscription */}
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}
