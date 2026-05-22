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

export default function QuiSommesNousPage() {
  return (
    <>
      <section className="border-b border-(--color-border) bg-(--color-surface-soft)">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">Qui sommes-nous</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-(--color-ink) sm:text-5xl">
            La référence des prépas EDN &amp; EVC de médecine
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-(--color-ink-soft)">
            Major ECN accompagne les étudiants en médecine qui préparent les EDN (anciennement ECN)
            et, depuis plus de 15 ans, les concours EVC pour la PAE. Un savoir-faire fondé sur une
            solide expérience de la préparation aux concours de l’enseignement supérieur.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-(--color-sidebar)">
            <Image src={IMG} alt="L’équipe Major ECN" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h2 className="font-display text-3xl tracking-tight text-(--color-ink)">Notre mission</h2>
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
              Découvrir nos enseignants <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALEURS.map((v) => (
            <div key={v.t} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <v.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-(--color-ink)">{v.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-(--color-ink-soft)">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-3xl bg-(--color-primary) p-9 text-white lg:p-12">
          <h2 className="font-display text-3xl tracking-tight">Votre spécialité, notre priorité</h2>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            À vos côtés pour vous faire réussir dans les meilleures conditions.
          </p>
          <Link
            href="/inscription"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-(--color-primary) transition-transform hover:scale-[1.03]"
          >
            Inscrivez-vous maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
