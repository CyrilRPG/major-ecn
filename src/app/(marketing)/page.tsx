import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/marketing/reveal';
import { ManusHero } from '@/components/marketing/manus-hero';
import { ExperienceSection, FreeTrialBanner, StatsSection } from '@/components/marketing/manus-sections';
import {
  EcosystemSection, QCMPreviewSection, DashboardPreviewSection,
  FinalCtaBlock, BeyondPlatformSection, ToolsGridSection,
} from '@/components/marketing/extra-sections';

export const metadata = {
  title: 'Major ECN — Préparez les EVC avec excellence',
  description:
    'La plateforme premium de préparation aux EVC pour les médecins à diplôme étranger. Méthode structurée, IA pédagogique, accompagnement humain.',
};

const QUICK_LINKS = [
  { href: '/methode',     label: 'Notre méthode',         desc: '6 étapes structurées' },
  { href: '/equipe',      label: 'L’équipe pédagogique',  desc: '25+ enseignants' },
  { href: '/temoignages', label: 'Témoignages',           desc: 'Médecins reçus aux EVC' },
  { href: '/faq',         label: 'Questions fréquentes',  desc: 'Toutes les réponses' },
];


export default async function HomePage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      {/* HERO */}
      <ManusHero />

      {/* « Bien plus qu'une plateforme de cours » + grille d'outils */}
      <BeyondPlatformSection />
      <ToolsGridSection />

      {/* PLATEFORME — Carousel d'images cliquables + écosystème + previews */}
      <ExperienceSection />
      <EcosystemSection />
      <QCMPreviewSection />
      <DashboardPreviewSection />

      {/* PREUVE — « Une plateforme qui prouve sa valeur » (stats détaillées) */}
      <StatsSection />

      {/* Liens rapides — explorer le site */}
      <section className="bg-[#FAFAF8] py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight gradient-bord-amber sm:text-4xl">
              Découvrez Major ECN en détail
            </h2>
            <p className="mt-3 text-base text-[#5A5A5A]">
              Plongez dans la méthode, rencontrez l’équipe ou parcourez la FAQ.
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

      {/* Bannière essai gratuit — juste avant l'inscription */}
      <FreeTrialBanner />

      {/* CTA final — inscription */}
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}
