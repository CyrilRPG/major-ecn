import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, HeartHandshake, ShieldCheck, Target, Users } from 'lucide-react';

export const metadata = {
  title: 'Qui sommes-nous',
  description: 'Major ECN, la prépa de référence aux EDN et aux EVC : plus de 15 ans d’expérience au service de la réussite des étudiants en médecine.',
};

const IMG = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1400&auto=format&fit=crop';

const VALEURS = [
  { Icon: ShieldCheck, t: 'Expérience', d: 'Plus de 15 ans de préparation aux concours médicaux et aux EVC pour la PAE.' },
  { Icon: Users, t: 'Proximité', d: 'Des petits groupes de 5 élèves en moyenne et un suivi individuel constant.' },
  { Icon: Target, t: 'Exigence', d: 'Une méthodologie éprouvée, des contenus alignés sur les recommandations HAS.' },
  { Icon: HeartHandshake, t: 'Accompagnement', d: 'Soutien moral, gestion du stress et coaching jusqu’au jour J.' },
];

const CHIFFRES = [
  { v: '15 ans', l: 'd’expérience des concours' },
  { v: '≈ 5', l: 'élèves par groupe' },
  { v: '96 %', l: 'spécialité de leur choix' },
  { v: 'Paris', l: '& en ligne' },
];

export default function QuiSommesNousPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-(--color-border) bg-(--color-surface-soft)">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 50% 60% at 90% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 70%)',
          }}
        />
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="eyebrow">Qui sommes-nous</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.06] tracking-tight text-(--color-ink) sm:text-5xl">
            La référence des prépas EDN &amp; EVC de médecine
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-(--color-ink-soft)">
            Major ECN accompagne les étudiants en médecine qui préparent les EDN (anciennement ECN)
            et, depuis plus de 15 ans, les concours EVC pour la PAE. Un savoir-faire fondé sur une
            solide expérience de la préparation aux concours de l’enseignement supérieur.
          </p>
          <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-(--color-border) pt-7 sm:grid-cols-4">
            {CHIFFRES.map((c) => (
              <div key={c.l}>
                <dt className="font-display text-2xl tracking-tight text-(--color-primary) sm:text-3xl">{c.v}</dt>
                <dd className="mt-0.5 text-xs text-(--color-ink-soft)">{c.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div aria-hidden className="absolute -left-5 -top-5 -z-10 h-40 w-40 rounded-full bg-(--color-primary)/12 blur-3xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-(--color-sidebar) shadow-(--shadow-lifted)">
              <Image src={IMG} alt="L’équipe Major ECN" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <p className="eyebrow">Notre mission</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
              Vous mener vers la spécialité de vos rêves
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-(--color-ink-soft)">
              Leader des prépas EDN de médecine, nous proposons une formation complète, disponible
              à Paris et en ligne, conçue pour maximiser les chances de réussite en D2, D3 et D4 —
              les dernières années du 2e cycle des études médicales.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">
              Que vous visiez la radiologie, la cardiologie, l’ophtalmologie, la chirurgie ou toute
              autre spécialité, notre centre de préparation répond à vos besoins, avec une pédagogie
              personnalisée et des enseignants d’exception.
            </p>
            <Link href="/enseignants" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary)">
              Découvrir nos enseignants
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* VALEURS */}
        <div className="mt-16">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow">Nos valeurs</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
              Ce qui guide notre accompagnement
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map((v) => (
              <div
                key={v.t}
                className="card-lift rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) hover:border-(--color-border-strong) hover:shadow-(--shadow-lifted)"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                  <v.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-(--color-ink)">{v.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-(--color-ink-soft)">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-(--color-primary) p-9 text-white lg:p-12">
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Votre spécialité, notre priorité</h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              À vos côtés pour vous faire réussir dans les meilleures conditions.
            </p>
            <Link
              href="/inscription"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-(--color-primary) transition-transform hover:scale-[1.03]"
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
