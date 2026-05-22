import Link from 'next/link';
import { ArrowRight, Quote, Star } from 'lucide-react';

export const metadata = {
  title: 'Témoignages',
  description: 'Lauréats des EDN et des EVC : ils racontent leur préparation avec Major ECN et leur réussite au concours.',
};

const FEATURED = {
  nom: 'Dr. Imene Deneche',
  role: 'Lauréate des EVC — Médecine générale',
  texte:
    'J’ai été classée 2ᵉ en médecine générale. Sans cette préparation, je n’aurais pas visé aussi haut — et je n’ai pas été la seule : mes collègues aussi ont réussi, classés 3ᵉ, 4ᵉ, 6ᵉ. L’accompagnement de Major ECN change vraiment la donne.',
};

const TEMOIGNAGES = [
  {
    nom: 'Dr. Sandrine Linda Sa’a Talla',
    role: 'Lauréate des EVC — Médecine générale',
    texte: 'Le jour J, j’ai obtenu 15,5 de moyenne. L’encadrement bienveillant et la disponibilité de l’équipe ont fait toute la différence : on ne se sent jamais seul.',
  },
  {
    nom: 'Dr. Monica Waitzfelder',
    role: 'Lauréate des EVC — Psychiatrie',
    texte: 'La formation m’a fait progresser sur tous les plans : méthodologie, connaissances ciblées et confiance en moi. Merci à toute l’équipe — vous êtes redoutables.',
  },
  {
    nom: 'Dr. Samy Kabaweh',
    role: 'Lauréat des EVC — Radiologie',
    texte: 'Cette préparation a joué un rôle essentiel pour nous deux et pour l’avenir de nos enfants. Merci encore à toute l’équipe de Major ECN.',
  },
  {
    nom: 'Dr. Josée Maevazaka',
    role: 'Lauréate des EVC — Chirurgie viscérale',
    texte: 'Sans cette structure, cette méthode et cet appui, je n’y serais pas arrivée. Major ECN m’a donné un cadre et une confiance qui ont tout changé.',
  },
];

const STATS = [
  { v: '96 %', l: 'obtiennent leur spécialité' },
  { v: '15 ans', l: 'd’accompagnement EVC' },
  { v: '5/5', l: 'note des lauréats' },
];

export default function TemoignagesPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-navy relative isolate overflow-hidden text-white">
        <div aria-hidden className="hero-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-accent)">Vos témoignages</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.06] tracking-tight sm:text-5xl">
            Ils sont venus chez Major ECN, ils ont réussi
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
            Derrière chaque classement, une histoire de travail et d’accompagnement.
            Découvrez les parcours de nos lauréats des EDN et des EVC.
          </p>
          <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/10 pt-7">
            {STATS.map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl tracking-tight text-white sm:text-3xl">{s.v}</dt>
                <dd className="mt-0.5 text-xs text-white/50">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-5 pt-20 lg:px-8 lg:pt-24">
        <figure className="relative overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-8 lg:p-12">
          <div aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-(--color-primary)/8 blur-3xl" />
          <Quote className="relative h-10 w-10 text-(--color-accent)" />
          <blockquote className="relative mt-4 max-w-3xl font-display text-2xl leading-snug tracking-tight text-(--color-ink) sm:text-3xl">
            « {FEATURED.texte} »
          </blockquote>
          <div className="relative mt-5 flex items-center gap-1 text-(--color-accent)">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
          </div>
          <figcaption className="relative mt-3 text-sm">
            <span className="font-semibold text-(--color-ink)">{FEATURED.nom}</span>
            <span className="text-(--color-ink-muted)"> — {FEATURED.role}</span>
          </figcaption>
        </figure>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {TEMOIGNAGES.map((t) => (
            <figure
              key={t.nom}
              className="card-lift flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) hover:shadow-(--shadow-lifted)"
            >
              <Quote className="h-7 w-7 text-(--color-accent)" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-(--color-ink)">{t.texte}</blockquote>
              <div className="mt-5 flex items-center gap-1 text-(--color-accent)">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <figcaption className="mt-3 border-t border-(--color-border) pt-3">
                <p className="text-sm font-semibold text-(--color-ink)">{t.nom}</p>
                <p className="text-xs text-(--color-ink-muted)">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-(--color-primary) p-9 text-white lg:p-12">
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Et si la prochaine réussite, c’était la vôtre ?</h2>
              <p className="mt-2 max-w-xl text-sm text-white/80">
                Rejoignez Major ECN et donnez-vous toutes les chances de réussir votre concours.
              </p>
            </div>
            <Link
              href="/inscription"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-(--color-primary) transition-transform hover:scale-[1.03]"
            >
              Inscrivez-vous maintenant
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
