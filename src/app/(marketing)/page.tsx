import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, CalendarDays, GraduationCap, HeartHandshake, LineChart,
  LogIn, Quote, Sparkles, Star, Target, Users,
} from 'lucide-react';

export const metadata = {
  title: 'Major ECN — Votre prépa EDN & EVC de médecine d’excellence',
  description:
    'La prépa de référence aux EDN et aux EVC : enseignants experts, petits groupes, coaching personnalisé. À Paris et en ligne.',
};

const IMG = {
  hero: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1600&auto=format&fit=crop',
  reform: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1400&auto=format&fit=crop',
};

const FORMULES = [
  { code: 'D2', titre: 'Formule D2', desc: 'DFASM1 — pose des bases méthodologiques solides dès la première année du 2e cycle.' },
  { code: 'D3', titre: 'Formule D3', desc: 'DFASM2 — l’année décisive : formules First et Premium, en petits groupes ou sur-mesure.' },
  { code: 'DT', titre: 'EDN — Dernier Tour', desc: 'Préparation intensive de fin de parcours pour arriver au pic de forme le jour J.' },
  { code: 'ECOS', titre: 'Formule ECOS', desc: 'Stations simulées et coaching par des enseignants ayant noté les ECOS nationaux.' },
];

const RAISONS = [
  { Icon: GraduationCap, titre: 'Nos enseignants', desc: 'Des médecins et spécialistes en lien avec le métier, disponibles tous les jours.' },
  { Icon: Users, titre: 'Petits groupes', desc: 'Apprentissage facilité et personnalisé — 5 élèves en moyenne.' },
  { Icon: Target, titre: 'Coaching personnalisé', desc: 'Conseils d’organisation et de stratégie pour maintenir la motivation.' },
  { Icon: LineChart, titre: 'Suivi sur-mesure', desc: 'Rythme de travail adapté, soutien moral et gestion du stress.' },
  { Icon: HeartHandshake, titre: 'Formule sur-mesure', desc: 'Un savoir-faire fondé sur une solide expérience des concours médicaux.' },
];

const TEMOIGNAGES = [
  { nom: 'Dr. Imene Deneche', role: 'Lauréate des EVC — Médecine générale', texte: 'J’ai été classée 2ᵉ en médecine générale. Sans cette préparation, je n’aurais pas visé aussi haut — et mes collègues aussi ont réussi, classés 3ᵉ, 4ᵉ, 6ᵉ.' },
  { nom: 'Dr. Sandrine Linda Sa’a Talla', role: 'Lauréate des EVC — Médecine générale', texte: 'Le jour J, j’ai obtenu 15,5 de moyenne. L’encadrement bienveillant et la disponibilité de l’équipe ont fait toute la différence : on ne se sent jamais seul.' },
  { nom: 'Dr. Monica Waitzfelder', role: 'Lauréate des EVC — Psychiatrie', texte: 'La formation m’a fait progresser sur tous les plans : méthodologie, connaissances ciblées et confiance en moi. Merci à toute l’équipe — vous êtes redoutables.' },
];

const EDN_DATES = [
  { j: 'Lundi après-midi', h: '14 h 30 – 17 h 30', t: '1ʳᵉ unité de composition' },
  { j: 'Mardi matin', h: '9 h – 12 h', t: '2ᵉ unité de composition' },
  { j: 'Mardi après-midi', h: '14 h 30 – 17 h 30', t: '3ᵉ unité de composition' },
  { j: 'Mercredi matin', h: '9 h – 12 h', t: 'Lecture critique d’articles (LCA)' },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-(--color-sidebar) text-white">
        <Image
          src={IMG.hero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-(--color-sidebar) via-(--color-sidebar)/85 to-(--color-sidebar)/55" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-(--color-accent)" />
            Prépa de référence aux EDN &amp; EVC — depuis plus de 15 ans
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Votre prépa EDN de médecine{' '}
            <span className="italic text-(--color-accent)">d’excellence</span>.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            La réussite aux Épreuves Dématérialisées Nationales est une étape cruciale.
            Grâce à une méthodologie éprouvée et des outils innovants, Major ECN vous donne
            toutes les clés pour exceller — à Paris et en ligne.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-7 py-4 text-base font-semibold text-white shadow-(--shadow-lifted) transition-transform hover:scale-[1.03]"
            >
              Inscrivez-vous maintenant
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <LogIn className="h-5 w-5" />
              Se connecter à mon espace
            </Link>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6">
            {[
              { v: '15 ans', l: 'd’expérience EVC / PAE' },
              { v: '≈ 5', l: 'élèves par groupe' },
              { v: 'Paris + ligne', l: 'présentiel ou à distance' },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl text-white sm:text-3xl">{s.v}</dt>
                <dd className="mt-1 text-xs text-white/55">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 5 RAISONS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">Pourquoi Major ECN</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
            Les 5 bonnes raisons de nous choisir
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RAISONS.map((r) => (
            <div
              key={r.titre}
              className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) transition-all hover:-translate-y-1 hover:shadow-(--shadow-lifted)"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <r.Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-(--color-ink)">{r.titre}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{r.desc}</p>
            </div>
          ))}
          <div className="flex flex-col justify-center rounded-2xl bg-(--color-primary) p-6 text-white">
            <p className="font-display text-xl">Votre spécialité, notre priorité.</p>
            <p className="mt-2 text-sm text-white/80">À vos côtés pour réussir dans les meilleures conditions.</p>
            <Link href="/inscription" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
              Découvrir nos formules <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FORMULES */}
      <section className="bg-(--color-surface-soft) py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">Nos formules</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
                Un accompagnement pour chaque étape
              </h2>
            </div>
            <Link href="/formules" className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary)">
              Toutes les formules <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FORMULES.map((f) => (
              <Link
                key={f.code}
                href="/formules"
                className="group flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) transition-all hover:-translate-y-1 hover:border-(--color-accent) hover:shadow-(--shadow-lifted)"
              >
                <span className="inline-flex w-fit rounded-lg bg-(--color-primary-soft) px-3 py-1 font-display text-sm font-semibold text-(--color-primary-deep)">
                  {f.code}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-(--color-ink)">{f.titre}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-(--color-ink-soft)">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-accent-deep)">
                  Voir le programme
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RÉFORME / EN SAVOIR PLUS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-(--color-sidebar)">
            <Image src={IMG.reform} alt="Préparation aux EDN" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">EDN 2026</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
              Comprendre la réforme, anticiper l’examen
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-(--color-ink-soft)">
              Les Épreuves Dématérialisées Nationales regroupent, pour la première session,
              quatre épreuves de trois heures. La première session aura lieu du 20 au 23 octobre 2026.
            </p>
            <ul className="mt-5 space-y-2.5">
              {EDN_DATES.map((d) => (
                <li key={d.t} className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-(--color-primary)" />
                  <span className="flex-1 text-sm font-medium text-(--color-ink)">{d.t}</span>
                  <span className="text-xs text-(--color-ink-muted)">{d.j} · {d.h}</span>
                </li>
              ))}
            </ul>
            <Link href="/en-savoir-plus" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary)">
              Tout savoir sur les EDN &amp; ECOS <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="bg-(--color-surface-soft) py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">Vos témoignages</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
              Ils sont venus chez Major ECN, ils en parlent
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {TEMOIGNAGES.map((t) => (
              <figure key={t.nom} className="flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
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
        </div>
      </section>

      {/* RÉDUCTION IMPÔTS + CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-(--color-primary) text-white">
          <div className="grid gap-8 p-9 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Avantage fiscal</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
                Jusqu’à 50 % de réduction d’impôts
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80">
                Une nouvelle étape vers votre avenir médical commence. Notre équipe vous explique
                comment bénéficier de l’avantage fiscal et vous accompagne dès l’inscription.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-(--color-primary) transition-transform hover:scale-[1.03]"
              >
                Inscrivez-vous maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-base font-medium text-white hover:bg-white/10"
              >
                Une question ? Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
