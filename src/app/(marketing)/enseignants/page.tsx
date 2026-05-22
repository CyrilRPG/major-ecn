import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Award, MessagesSquare, Sparkles, Stethoscope, Video } from 'lucide-react';

export const metadata = {
  title: 'Nos enseignants',
  description: 'Des médecins et spécialistes reconnus, sélectionnés parmi les meilleurs classés à l’ECN et l’EDN, pédagogues et disponibles.',
};

const IMG = 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1400&auto=format&fit=crop';

const ATOUTS = [
  { Icon: Stethoscope, t: 'Des praticiens en exercice', d: 'Médecins et spécialistes reconnus dans leur domaine, en lien direct avec le métier.' },
  { Icon: Award, t: 'Sélectionnés parmi les meilleurs', d: 'Recrutés parmi les 200 premiers à l’ECN et à l’EDN, internes, chefs de clinique et majors de promotion.' },
  { Icon: MessagesSquare, t: 'Pédagogues et à l’écoute', d: 'Explications claires et détaillées, sessions de questions-réponses en direct, soutien et motivation.' },
  { Icon: Video, t: 'Contenus actualisés', d: 'Cas cliniques représentatifs du concours et cours alignés sur les recommandations de la HAS.' },
];

export default function EnseignantsPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-navy relative isolate overflow-hidden text-white">
        <div aria-hidden className="hero-grid absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-accent)">Nos enseignants</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.07] tracking-tight sm:text-5xl">
              Des experts, pédagogues et disponibles
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65">
              Nos formateurs sont des médecins et spécialistes reconnus dans leur domaine.
              Passionnés par l’enseignement, ils vous accompagnent à chaque étape de votre
              préparation aux concours EDN et EVC.
            </p>
            <Link
              href="/inscription"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-(--color-primary) px-6 py-3.5 text-base font-semibold text-white shadow-(--shadow-lifted) transition-transform hover:scale-[1.03]"
            >
              Rejoindre Major ECN
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="relative">
            <div aria-hidden className="absolute -right-5 -top-5 -z-10 h-40 w-40 rounded-full bg-(--color-primary)/25 blur-3xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-white/12 shadow-(--shadow-lifted)">
              <Image src={IMG} alt="Enseignant Major ECN" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ATOUTS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">Ce qui fait la différence</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
            Une équipe pédagogique d’exception
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {ATOUTS.map((a) => (
            <div
              key={a.t}
              className="card-lift rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) hover:border-(--color-border-strong) hover:shadow-(--shadow-lifted)"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <a.Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-(--color-ink)">{a.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{a.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-8 lg:grid-cols-[1.6fr_1fr] lg:items-center lg:p-10">
          <div>
            <Sparkles className="h-6 w-6 text-(--color-accent)" />
            <h2 className="mt-4 font-display text-2xl tracking-tight text-(--color-ink)">Une pédagogie interactive</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-(--color-ink-soft)">
              Nos enseignants privilégient le face-à-face pédagogique pour encourager les échanges
              et garantir une meilleure assimilation des notions. Interactivité des cours, coaching,
              explications détaillées et disponibilité au quotidien : tout est pensé pour votre réussite.
            </p>
            <Link href="/formules" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary)">
              Découvrir nos formules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
            <p className="font-display text-3xl tracking-tight text-(--color-primary)">Top 200</p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              Nos enseignants figurent parmi les meilleurs classés à l’ECN et à l’EDN.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
