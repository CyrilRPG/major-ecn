import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, ArrowUpRight, CalendarDays, ClipboardCheck, GraduationCap,
  HeartHandshake, LineChart, LogIn, Quote, Sparkles, Star, Target, Users,
} from 'lucide-react';

export const metadata = {
  title: 'Major ECN — Votre prépa EDN & EVC de médecine d’excellence',
  description:
    'La prépa de référence aux EDN et aux EVC : enseignants experts, petits groupes, coaching personnalisé. À Paris et en ligne.',
};

const IMG = {
  hero: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1400&auto=format&fit=crop',
  reform: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1400&auto=format&fit=crop',
};

const SPECIALITES = [
  'Cardiologie', 'Radiologie', 'Pédiatrie', 'Neurologie',
  'Ophtalmologie', 'Chirurgie', 'Gynécologie', 'Psychiatrie',
];

const RAISONS = [
  { Icon: GraduationCap, titre: 'Enseignants experts', desc: 'Des médecins et spécialistes en lien direct avec le métier, sélectionnés parmi les meilleurs classés à l’EDN.' },
  { Icon: Users, titre: 'Petits groupes', desc: 'Un apprentissage facilité et personnalisé — 5 élèves en moyenne par groupe.' },
  { Icon: Target, titre: 'Coaching personnalisé', desc: 'Des conseils d’organisation et de stratégie pour maintenir la motivation jusqu’au jour J.' },
  { Icon: LineChart, titre: 'Suivi sur-mesure', desc: 'Un rythme de travail adapté, un soutien moral et une gestion du stress au quotidien.' },
  { Icon: HeartHandshake, titre: 'Formule sur-mesure', desc: 'Un savoir-faire fondé sur plus de 15 ans d’expérience des concours médicaux.' },
];

const FORMULES = [
  { code: 'D2', titre: 'Formule D2', desc: 'DFASM1 — posez des bases méthodologiques solides dès l’entrée dans le 2e cycle.' },
  { code: 'D3', titre: 'Formule D3', desc: 'DFASM2 — l’année décisive : formules First et Premium, en petits groupes ou sur-mesure.' },
  { code: 'DT', titre: 'EDN — Dernier Tour', desc: 'Une révision intensive de fin de parcours pour arriver au pic de forme le jour J.' },
  { code: 'ECOS', titre: 'Formule ECOS', desc: 'Stations simulées et coaching par des enseignants ayant noté les ECOS nationaux.' },
];

const METHODE = [
  { n: '01', t: 'Bilan & objectifs', d: 'Nous évaluons votre niveau, vos points faibles et la spécialité visée pour bâtir un plan de travail sur-mesure.' },
  { n: '02', t: 'Cours & méthodologie', d: 'Cours en petits groupes ou en individuel : méthodologie DP, QI, LCA et ECOS, fiches de révision ciblées.' },
  { n: '03', t: 'Entraînement & coaching', d: 'Tests réguliers, examens blancs, suivi de progression et soutien moral jusqu’au jour du concours.' },
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
      {/* ============ HERO ============ */}
      <section className="hero-navy relative isolate overflow-hidden text-white">
        <div aria-hidden className="hero-grid absolute inset-0 -z-10" />
        <div aria-hidden className="absolute -left-32 top-1/3 -z-10 h-80 w-80 rounded-full bg-(--color-primary)/20 blur-[120px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-24">
          {/* LEFT — content */}
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] py-1.5 pl-3 pr-4 backdrop-blur">
              <span className="flex items-center gap-0.5 text-(--color-accent)">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
              <span className="text-xs font-medium text-white/75">
                Recommandé par les lauréats EDN &amp; EVC
              </span>
            </div>

            <h1 className="mt-7 font-display text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.65rem]">
              Votre prépa EDN de médecine{' '}
              <span className="relative inline-block whitespace-nowrap italic text-(--color-accent)">
                d’excellence
                <svg
                  aria-hidden
                  viewBox="0 0 240 14"
                  className="absolute -bottom-1.5 left-0 h-3 w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 8.5C48 3.5 150 2.5 237 6.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              La réussite aux Épreuves Dématérialisées Nationales est une étape cruciale.
              Méthodologie éprouvée, enseignants experts et coaching personnalisé —
              pour exceller à votre rythme, à Paris comme en ligne.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '90ms' }}>
              <Link
                href="/inscription"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-7 py-4 text-base font-semibold text-white shadow-(--shadow-lifted) transition-transform hover:scale-[1.025]"
              >
                Inscrivez-vous maintenant
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/18 bg-white/[0.06] px-7 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
              >
                <LogIn className="h-5 w-5" />
                Se connecter à mon espace
              </Link>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/10 pt-7">
              {[
                { v: '15 ans', l: 'd’expérience EVC / PAE' },
                { v: '≈ 5', l: 'élèves par groupe' },
                { v: '96 %', l: 'obtiennent leur spécialité' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-2xl tracking-tight text-white sm:text-3xl">{s.v}</dt>
                  <dd className="mt-0.5 text-xs text-white/50">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* RIGHT — image composition */}
          <div className="relative animate-rise" style={{ animationDelay: '140ms' }}>
            <div aria-hidden className="absolute -right-6 -top-6 -z-10 h-44 w-44 rounded-full bg-(--color-primary)/25 blur-3xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.7rem] ring-1 ring-white/12 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.6)]">
              <Image
                src={IMG.hero}
                alt="Étudiants en médecine en préparation aux EDN"
                fill
                priority
                sizes="(max-width:1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-(--color-sidebar)/55 via-transparent to-transparent" />
            </div>

            {/* floating credibility card */}
            <div className="absolute -bottom-7 -left-5 hidden items-center gap-3.5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-lifted) sm:flex">
              <svg viewBox="0 0 64 64" className="h-14 w-14 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-primary-soft)" strokeWidth="9" />
                <circle
                  cx="32" cy="32" r="26" fill="none" stroke="var(--color-primary)" strokeWidth="9"
                  strokeLinecap="round" strokeDasharray="163.4" strokeDashoffset="6.5"
                />
              </svg>
              <div>
                <p className="font-display text-xl tracking-tight text-(--color-ink)">96 %</p>
                <p className="max-w-[9rem] text-xs leading-snug text-(--color-ink-soft)">
                  obtiennent la spécialité de leur choix
                </p>
              </div>
            </div>

            {/* floating session chip */}
            <div className="absolute -right-4 top-7 hidden items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 shadow-(--shadow-lifted) sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-medium text-(--color-ink-muted)">Session EDN</p>
                <p className="text-xs font-semibold text-(--color-ink)">20–23 oct. 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* specialties strip */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-7 gap-y-2 px-5 py-5 lg:px-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-accent)">
              Toutes les spécialités
            </span>
            {SPECIALITES.map((s) => (
              <span key={s} className="text-sm text-white/45">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ POURQUOI ============ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="mb-11 max-w-2xl">
          <p className="eyebrow">Pourquoi Major ECN</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
            Les bonnes raisons de nous choisir
          </h2>
          <p className="mt-3 text-base leading-relaxed text-(--color-ink-soft)">
            Un accompagnement humain et exigeant, pensé pour transformer vos efforts en résultats.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RAISONS.map((r) => (
            <div
              key={r.titre}
              className="card-lift rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) hover:border-(--color-border-strong) hover:shadow-(--shadow-lifted)"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <r.Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-(--color-ink)">{r.titre}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{r.desc}</p>
            </div>
          ))}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-(--color-sidebar) p-6 text-white">
            <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-(--color-primary)/30 blur-2xl" />
            <div className="relative">
              <Sparkles className="h-6 w-6 text-(--color-accent)" />
              <p className="mt-4 font-display text-xl tracking-tight">Votre spécialité, notre priorité.</p>
              <p className="mt-2 text-sm text-white/65">
                À vos côtés pour réussir dans les meilleures conditions.
              </p>
            </div>
            <Link href="/formules" className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              Découvrir nos formules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FORMULES ============ */}
      <section className="border-y border-(--color-border) bg-(--color-surface-soft) py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="eyebrow">Nos formules</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
                Un accompagnement pour chaque étape
              </h2>
            </div>
            <Link
              href="/formules"
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border-strong) bg-(--color-surface) px-4 py-2.5 text-sm font-semibold text-(--color-ink) transition-colors hover:border-(--color-primary)"
            >
              Toutes les formules
              <ArrowRight className="h-4 w-4 text-(--color-primary)" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FORMULES.map((f) => (
              <Link
                key={f.code}
                href="/formules"
                className="card-lift group flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) hover:border-(--color-primary) hover:shadow-(--shadow-lifted)"
              >
                <span className="inline-flex w-fit rounded-lg bg-(--color-primary-soft) px-3 py-1 font-display text-sm font-semibold text-(--color-primary-deep)">
                  {f.code}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-(--color-ink)">{f.titre}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-(--color-ink-soft)">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary)">
                  Voir le programme
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MÉTHODE ============ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="mb-11 max-w-2xl">
          <p className="eyebrow">Notre méthode</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
            Une préparation structurée, du bilan au jour J
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {METHODE.map((m, i) => (
            <div
              key={m.n}
              className="relative rounded-2xl border border-(--color-border) bg-(--color-surface) p-7 shadow-(--shadow-soft)"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-4xl tracking-tight text-(--color-primary-soft)">{m.n}</span>
                {i < METHODE.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-(--color-border-strong)" />
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-(--color-ink)">{m.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ RÉFORME EDN 2026 ============ */}
      <section className="border-y border-(--color-border) bg-(--color-surface-soft) py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-(--color-sidebar) shadow-(--shadow-lifted)">
              <Image src={IMG.reform} alt="Préparation aux EDN" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <p className="eyebrow">EDN 2026</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
              Comprendre la réforme, anticiper l’examen
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-(--color-ink-soft)">
              Les Épreuves Dématérialisées Nationales regroupent, pour la première session,
              quatre épreuves de trois heures. La première session aura lieu du 20 au 23 octobre 2026.
            </p>
            <ul className="mt-6 space-y-2.5">
              {EDN_DATES.map((d) => (
                <li key={d.t} className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-(--color-primary)" />
                  <span className="flex-1 text-sm font-medium text-(--color-ink)">{d.t}</span>
                  <span className="text-xs text-(--color-ink-muted)">{d.j} · {d.h}</span>
                </li>
              ))}
            </ul>
            <Link href="/en-savoir-plus" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary)">
              Tout savoir sur les EDN &amp; ECOS
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TÉMOIGNAGES ============ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="eyebrow">Vos témoignages</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
              Ils sont venus chez Major ECN, ils en parlent
            </h2>
          </div>
          <Link href="/temoignages" className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary)">
            Tous les témoignages
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
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

      {/* ============ CTA RÉDUCTION IMPÔTS ============ */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-(--color-primary) text-white">
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
          <div className="relative grid gap-8 p-9 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:p-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
                <ClipboardCheck className="h-3.5 w-3.5" /> Avantage fiscal
              </p>
              <h2 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
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
