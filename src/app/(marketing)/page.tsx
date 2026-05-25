import {
  ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Globe, GraduationCap, Heart, LineChart, MailCheck,
  Quote, Shield, Sparkles, Star, Target, TrendingUp, Users, Zap,
} from 'lucide-react';

export const metadata = {
  title: 'Major ECN — Préparez les EVC avec excellence',
  description:
    'La plateforme premium de préparation aux EVC pour les médecins à diplôme étranger. Méthode structurée, IA pédagogique, accompagnement humain.',
};

const CONTACT = 'contact@majorecn.fr';

const FEATURES = [
  { Icon: Target,    t: 'QCM Intelligents',   d: 'Adaptés à votre niveau, générés à partir des annales et du programme officiel des EVC.' },
  { Icon: Brain,     t: 'IA Pédagogique',     d: 'Apprentissage personnalisé : l’IA détecte vos lacunes et ajuste vos révisions en temps réel.' },
  { Icon: LineChart, t: 'Suivi Temps Réel',   d: 'Analytics détaillés par spécialité, progression visible, recommandations claires.' },
];

const TIMELINE = [
  { n: 'Semaine 1',   t: 'Diagnostic',        d: 'Évaluation de votre niveau, identification des lacunes, plan personnalisé.' },
  { n: 'Semaine 4',   t: 'Fondamentaux',      d: 'Maîtrise des bases dans chaque spécialité, méthode QCM.' },
  { n: 'Semaine 8',   t: 'Progression',       d: 'Approfondissement, examens blancs, ajustements par l’IA.' },
  { n: 'Semaine 10',  t: 'Perfectionnement',  d: 'Cas cliniques, points difficiles, gestion du stress.' },
  { n: 'Semaine 12',  t: 'Réussite',          d: 'Pic de forme : conditions d’examen, dernière revue, confiance.' },
];

const TEMOIGNAGES = [
  {
    citation: 'J’étais perdue. Maintenant je suis confiante.',
    arc: 'De la confusion à la clarté',
    nom: 'Dr. Marwa B.',
    role: 'Chirurgie générale',
    stat: '87% de réussite',
  },
  {
    citation: 'Major ECN a changé ma vie professionnelle.',
    arc: 'De l’isolement à la communauté',
    nom: 'Dr. Yacine R.',
    role: 'Médecine interne',
    stat: '3 mois de préparation',
  },
  {
    citation: 'Enfin une plateforme à la hauteur de mes ambitions.',
    arc: 'De l’incertitude à la réussite',
    nom: 'Dr. Hala K.',
    role: 'Admise à l’EVC',
    stat: 'Reçue en 1ʳᵉ session',
  },
  {
    citation: 'Tout est structuré, je n’ai plus à improviser.',
    arc: 'De la frustration à l’accomplissement',
    nom: 'Dr. Karim S.',
    role: 'Premier à l’EVC',
    stat: 'Major de promo',
  },
];

const STATS = [
  { v: '2 400+', l: 'Médecins formés' },
  { v: '87 %',   l: 'Taux de réussite' },
  { v: '4 200+', l: 'QCM disponibles', sub: 'mis à jour trimestriellement' },
  { v: '16',     l: 'Spécialités', sub: 'couvertes intégralement' },
  { v: '25+',    l: 'Nationalités', sub: 'représentées' },
  { v: '12 sem.',l: 'Préparation structurée' },
];

const AUDIENCES = [
  { Icon: GraduationCap, t: 'Médecins à diplôme étranger', d: 'Vous avez obtenu votre diplôme hors UE et vous voulez exercer en France.' },
  { Icon: TrendingUp,    t: 'Repreneurs après un échec',   d: 'Vous avez déjà tenté les EVC : on reprend la méthode, en mieux ciblée.' },
  { Icon: Globe,         t: 'Préparation à distance',       d: 'Vous travaillez en parallèle ? La plateforme s’adapte à vos disponibilités.' },
];

const FAQ = [
  { q: 'À qui s’adresse Major ECN ?',
    a: 'Major ECN est destiné aux médecins titulaires d’un diplôme étranger (hors UE) souhaitant exercer en France. Que vous soyez en phase de préparation initiale ou en reprise après un échec, notre plateforme s’adapte à votre niveau et à vos besoins spécifiques.' },
  { q: 'Quelle est la durée recommandée de préparation ?',
    a: 'Notre parcours standard est de 12 semaines. Cependant, la plateforme s’adapte à votre emploi du temps et à votre niveau initial. Certains candidats préparent en 8 semaines intensives, d’autres en 6 mois à temps partiel. L’IA génère un plan personnalisé dès votre inscription.' },
  { q: 'Les QCM sont-ils conformes au programme officiel des EVC ?',
    a: 'Oui, absolument. Tous nos QCM sont rédigés par des médecins spécialistes français et mis à jour chaque trimestre selon le programme officiel des Épreuves de Vérification des Connaissances. Nous couvrons intégralement les 16 spécialités du programme.' },
  { q: 'Comment fonctionne l’IA pédagogique ?',
    a: 'Notre IA analyse vos réponses en temps réel, identifie vos erreurs récurrentes et vos lacunes par spécialité. Elle génère des explications personnalisées, ajuste la difficulté des QCM et vous propose des révisions ciblées au bon moment. C’est comme avoir un tuteur médical disponible 24h/24.' },
  { q: 'Puis-je accéder à la plateforme depuis mon téléphone ?',
    a: 'Oui. Major ECN est entièrement responsive et fonctionne sur tous les appareils (ordinateur, tablette, smartphone). Une application mobile est également disponible sur iOS et Android, avec un mode hors ligne pour réviser sans connexion.' },
  { q: 'Y a-t-il un engagement minimum ?',
    a: 'Non. Tous nos abonnements sont sans engagement et résiliables à tout moment. Vous commencez avec 7 jours d’essai gratuit pour tester la plateforme sans risque. Si vous n’êtes pas satisfait, vous ne payez rien.' },
  { q: 'Proposez-vous un accompagnement humain ?',
    a: 'Oui. Les formules Premium et Intensif incluent un tuteur dédié — un médecin ou un professionnel de santé qui vous accompagne tout au long de votre préparation. Des sessions de questions-réponses en groupe sont également organisées chaque semaine.' },
];

const PLANS = [
  {
    name: 'Essentiel', price: '49', period: '/mois',
    desc: 'Pour démarrer votre préparation.',
    features: ['Accès à tous les QCM', 'Flashcards & révision', 'Suivi de progression', 'Communauté étudiants'],
    cta: 'Commencer', highlighted: false,
  },
  {
    name: 'Premium', price: '89', period: '/mois',
    desc: 'La préparation complète recommandée.',
    features: ['Tout Essentiel +', 'IA pédagogique avancée', 'Analytics détaillés', 'Examens blancs illimités', 'Tuteur dédié', 'Mode concours'],
    cta: 'Choisir Premium', highlighted: true, badge: 'Le plus populaire',
  },
  {
    name: 'Intensif', price: '149', period: '/mois',
    desc: 'Accompagnement personnalisé maximal.',
    features: ['Tout Premium +', 'Sessions 1:1 avec un médecin', 'Plan d’étude sur mesure', 'Accès prioritaire au support', 'Garantie satisfaction'],
    cta: 'Contacter l’équipe', highlighted: false,
  },
];

export default function HomePage() {
  return (
    <>
      {/* =================== HERO =================== */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[680px] bg-gradient-to-b from-(--color-surface-soft) via-white to-white" />
        <div aria-hidden className="absolute -right-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-(--color-primary)/12 blur-[120px]" />
        <div aria-hidden className="absolute -left-24 top-72 -z-10 h-[280px] w-[280px] rounded-full bg-(--color-primary)/8 blur-[100px]" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20">
          {/* LEFT */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary) shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-(--color-primary)" />
              La plateforme leader des EVC
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-(--color-ink) sm:text-5xl lg:text-[3.75rem]">
              Préparez les EVC,{' '}
              <span className="bg-gradient-to-r from-(--color-primary) to-[#A83A4A] bg-clip-text text-transparent">
                construisez votre réussite
              </span>
              .
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-(--color-ink-soft) sm:text-lg">
              Une plateforme structurée. Un accompagnement humain. Une vraie chance de réussite —
              pour les médecins à diplôme étranger qui veulent exercer en France.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#tarifs"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-(--color-primary)/20 transition-transform hover:scale-[1.025]"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#temoignages"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-semibold text-(--color-ink) transition-colors hover:text-(--color-primary)"
              >
                <Heart className="h-5 w-5 text-(--color-primary)" />
                Écouter les réussites
              </a>
            </div>

            <p className="mt-5 text-xs text-(--color-ink-muted)">
              ✓ Essai gratuit 7 jours · Accès complet · Zéro engagement · Annulation instantanée
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-(--color-border) pt-7">
              {[
                { v: '2 400+', l: 'Médecins formés' },
                { v: '87 %',   l: 'Taux de réussite' },
                { v: '4 200+', l: 'QCM' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-2xl font-bold tracking-tight text-(--color-ink) sm:text-3xl">{s.v}</dt>
                  <dd className="mt-0.5 text-xs text-(--color-ink-muted) sm:text-sm">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* RIGHT — Mock dashboard */}
          <div className="relative">
            <DashboardMock />
            <span className="absolute -top-3 right-3 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-(--color-primary) shadow-lg ring-1 ring-(--color-border) sm:inline-flex">
              <TrendingUp className="h-3.5 w-3.5" /> 87 % réussite
            </span>
            <span className="absolute -bottom-3 -left-3 hidden items-center gap-1.5 rounded-full bg-(--color-primary) px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:inline-flex">
              <BookOpen className="h-3.5 w-3.5" /> 4 200+ QCM
            </span>
          </div>
        </div>
      </section>

      {/* =================== MÉTHODE — 3 features =================== */}
      <section id="methode" className="border-t border-(--color-border) bg-(--color-surface-soft) py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-(--color-primary)">La méthode</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-(--color-ink) sm:text-4xl lg:text-5xl">
              Diagnostic précis. Structure progressive.
              <br className="hidden sm:block" />
              Suivi intelligent. Réussite garantie.
            </h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.t}
                className="card-lift group rounded-2xl border border-(--color-border) bg-white p-7 shadow-sm hover:border-(--color-primary)/40 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary) transition-colors group-hover:bg-(--color-primary) group-hover:text-white">
                  <f.Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-(--color-ink)">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-(--color-ink-soft)">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== EXPÉRIENCE — Device mockups =================== */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-(--color-primary)">L’expérience complète</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-(--color-ink) sm:text-4xl lg:text-5xl">
              Dashboards réels. QCM adaptatifs.
              <br className="hidden sm:block" />
              Progression visible.
            </h2>
            <p className="mt-4 text-base text-(--color-ink-soft)">
              Sur ordinateur, tablette ou téléphone — la plateforme s’adapte à votre rythme.
            </p>
          </div>

          <div className="mt-14 grid items-end gap-6 lg:grid-cols-[1.6fr_0.5fr_1fr]">
            <DeviceFrame label="Dashboard Desktop" sub="Analytics temps réel · Inclus" variant="desktop" />
            <DeviceFrame label="Mobile Premium" sub="Progression en direct" variant="mobile" />
            <DeviceFrame label="Tablet Complet" sub="Analytics complets" variant="tablet" />
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Brain,       t: 'Apprentissage adaptatif', d: 'L’IA ajuste les QCM selon vos résultats.' },
              { Icon: LineChart,   t: 'Analytics avancés',       d: 'Performance par spécialité, par thème.' },
              { Icon: TrendingUp,  t: 'Suivi de progression',    d: 'Vous voyez exactement où vous en êtes.' },
              { Icon: Zap,         t: 'Performance premium',     d: 'Vitesse et fluidité exceptionnelles.' },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-5">
                <x.Icon className="h-5 w-5 text-(--color-primary)" strokeWidth={1.8} />
                <p className="mt-3 text-sm font-bold text-(--color-ink)">{x.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-(--color-ink-soft)">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TÉMOIGNAGES =================== */}
      <section id="temoignages" className="bg-(--color-surface-soft) py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-(--color-primary)">Témoignages</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-(--color-ink) sm:text-4xl lg:text-5xl">
              2 400+ médecins ont réussi
              <br className="hidden sm:block" />
              les EVC avec Major ECN
            </h2>
            <p className="mt-4 text-base text-(--color-ink-soft)">
              Écoutez comment ils ont transformé leur parcours EVC.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {TEMOIGNAGES.map((t) => (
              <figure
                key={t.nom}
                className="card-lift relative flex flex-col rounded-2xl border border-(--color-border) bg-white p-7 shadow-sm hover:shadow-lg"
              >
                <Quote className="h-7 w-7 text-(--color-primary)/30" />
                <blockquote className="mt-3 font-display text-lg font-semibold leading-snug text-(--color-ink) sm:text-xl">
                  « {t.citation} »
                </blockquote>
                <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-(--color-primary)">
                  <Sparkles className="h-3 w-3" /> {t.arc}
                </p>
                <figcaption className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-(--color-border) pt-4">
                  <div>
                    <p className="text-sm font-bold text-(--color-ink)">{t.nom}</p>
                    <p className="text-xs text-(--color-ink-muted)">{t.role}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-(--color-primary)">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t.stat}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TRANSFORMATION TIMELINE =================== */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-(--color-primary)">Votre transformation</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-(--color-ink) sm:text-4xl lg:text-5xl">
              De l’isolement à la confiance.
              <br className="hidden sm:block" />
              De la confusion à la structure.
            </h2>
          </div>

          {/* Before / After chips */}
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">Avant</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Désorganisé', 'Perdu', 'Stressé', 'Sans méthode', 'Incertain'].map((w) => (
                  <span key={w} className="rounded-full border border-(--color-border) bg-white px-3 py-1 text-xs font-medium text-(--color-ink-soft)">
                    {w}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-(--color-primary)/30 bg-(--color-primary-soft) p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-(--color-primary)">Après</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Motivé', 'Structuré', 'Progressif', 'Confiant', 'Réussi'].map((w) => (
                  <span key={w} className="rounded-full bg-(--color-primary) px-3 py-1 text-xs font-semibold text-white">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-14">
            <h3 className="font-display text-xl font-bold tracking-tight text-(--color-ink) sm:text-2xl">
              Votre parcours avec Major ECN
            </h3>
            <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {TIMELINE.map((s, i) => (
                <li key={s.n} className="relative rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-primary)">{s.n}</p>
                  <p className="mt-2 font-display text-lg font-bold text-(--color-ink)">{s.t}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-(--color-ink-soft)">{s.d}</p>
                  <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-(--color-primary) text-[11px] font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* =================== STATS / RÉSULTATS =================== */}
      <section className="bg-(--color-surface-soft) py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-(--color-primary)">Résultats &amp; crédibilité</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-(--color-ink) sm:text-4xl">
              Des chiffres qui parlent d’eux-mêmes
            </h2>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((s) => (
              <div key={s.l} className="rounded-2xl border border-(--color-border) bg-white p-5 text-center">
                <dt className="font-display text-2xl font-extrabold tracking-tight text-(--color-primary) sm:text-3xl">{s.v}</dt>
                <dd className="mt-2 text-xs font-semibold text-(--color-ink)">{s.l}</dd>
                {s.sub && <dd className="mt-0.5 text-[11px] text-(--color-ink-muted)">{s.sub}</dd>}
              </div>
            ))}
          </dl>

          <ul className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 text-sm text-(--color-ink-soft) sm:flex-row sm:flex-wrap sm:justify-center">
            {[
              'Contenu rédigé par des médecins spécialistes français',
              'Mis à jour chaque trimestre selon le programme officiel',
              'Accompagnement personnalisé par un tuteur dédié',
            ].map((p) => (
              <li key={p} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-(--color-primary)" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* =================== AUDIENCE =================== */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-(--color-primary)">À qui s’adresse Major ECN ?</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-(--color-ink) sm:text-4xl">
              Une plateforme pensée pour vous
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCES.map((a) => (
              <div key={a.t} className="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                  <a.Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-base font-bold text-(--color-ink)">{a.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TARIFS — dark bordeaux =================== */}
      <section id="tarifs" className="relative isolate overflow-hidden bg-(--color-primary-deep) py-20 text-white lg:py-28">
        <div aria-hidden className="absolute -top-32 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-(--color-primary)/40 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur">
              <Sparkles className="h-3 w-3" /> Inscriptions ouvertes — Session 2025
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Votre réussite aux EVC commence ici
            </h2>
            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Choisissez la formule adaptée à vos objectifs. 7 jours d’essai gratuit, sans engagement.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => {
              const hi = p.highlighted;
              return (
                <article
                  key={p.name}
                  className={
                    'relative flex flex-col gap-5 rounded-2xl p-7 transition-transform ' +
                    (hi
                      ? 'bg-white text-(--color-ink) ring-2 ring-white shadow-2xl shadow-black/30 lg:scale-[1.03]'
                      : 'bg-white/[0.04] text-white ring-1 ring-white/12 hover:ring-white/25')
                  }
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-(--color-primary) px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      {p.badge}
                    </span>
                  )}
                  <div>
                    <p className={'text-[11px] font-bold uppercase tracking-[0.14em] ' + (hi ? 'text-(--color-primary)' : 'text-white/50')}>
                      {p.name}
                    </p>
                    <div className="mt-3 flex items-end gap-1">
                      <span className={'font-display text-5xl font-extrabold tracking-tight ' + (hi ? 'text-(--color-ink)' : 'text-white')}>
                        {p.price} €
                      </span>
                      <span className={'mb-1.5 text-sm font-medium ' + (hi ? 'text-(--color-ink-muted)' : 'text-white/60')}>
                        {p.period}
                      </span>
                    </div>
                    <p className={'mt-2 text-sm ' + (hi ? 'text-(--color-ink-soft)' : 'text-white/70')}>{p.desc}</p>
                  </div>

                  <ul className="space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className={'flex items-start gap-2.5 text-sm ' + (hi ? 'text-(--color-ink)' : 'text-white/85')}>
                        <Check className={'mt-0.5 h-4 w-4 shrink-0 ' + (hi ? 'text-(--color-primary)' : 'text-white')} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={p.name === 'Intensif' ? `mailto:${CONTACT}` : '#cta'}
                    className={
                      'mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] ' +
                      (hi
                        ? 'bg-(--color-primary) text-white shadow-lg shadow-(--color-primary)/25'
                        : 'bg-white text-(--color-primary-deep)')
                    }
                  >
                    {p.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs text-white/55">
            ✓ Essai gratuit 7 jours · Accès complet · Zéro engagement · Annulation instantanée
          </p>
        </div>
      </section>

      {/* =================== FAQ =================== */}
      <section id="faq" className="bg-(--color-surface-soft) py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-(--color-primary)">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-(--color-ink) sm:text-4xl">
              Questions fréquentes
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-(--color-border) bg-white p-5 shadow-sm transition-colors open:border-(--color-primary)/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-(--color-ink) marker:hidden sm:text-base">
                  {f.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary)">
                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-(--color-border) bg-white p-6 text-center">
            <p className="text-sm font-medium text-(--color-ink)">
              Une question non listée ? Notre équipe répond en moins de 24 h.
            </p>
            <a
              href={`mailto:${CONTACT}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-(--color-primary) hover:underline"
            >
              Contacter l’équipe <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* =================== FINAL CTA =================== */}
      <section id="cta" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-(--color-border) bg-gradient-to-br from-white to-(--color-surface-soft) p-9 text-center shadow-sm sm:p-12">
            <div aria-hidden className="absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-(--color-primary)/12 blur-[100px]" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-primary)">
              <ClipboardCheck className="h-3.5 w-3.5" /> Prêt à commencer ?
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-(--color-ink) sm:text-4xl lg:text-5xl">
              Rejoignez 2 400+ médecins
              <br className="hidden sm:block" />
              qui ont réussi avec Major ECN
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-(--color-ink-soft)">
              Accès immédiat à la plateforme, 7 jours d’essai gratuit, sans engagement.
            </p>

            <form
              action={`mailto:${CONTACT}`}
              method="post"
              encType="text/plain"
              className="mx-auto mt-7 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Votre email professionnel"
                className="flex-1 rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-6 py-3 text-sm font-bold text-white shadow-lg shadow-(--color-primary)/20 transition-transform hover:scale-[1.025]"
              >
                <MailCheck className="h-4 w-4" />
                Commencer
              </button>
            </form>

            <p className="mt-4 text-xs text-(--color-ink-muted)">
              ✓ Essai gratuit 7 jours · Accès complet · Zéro engagement
            </p>
          </div>

          {/* Trust badges */}
          <ul className="mt-10 grid grid-cols-2 gap-3 text-center text-[11px] font-semibold text-(--color-ink-soft) sm:grid-cols-3 lg:grid-cols-6">
            {[
              { Icon: Shield,        t: 'Contenu certifié par des spécialistes' },
              { Icon: TrendingUp,    t: '87 % de taux de réussite' },
              { Icon: Zap,           t: 'Accès 24h/24, 7j/7' },
              { Icon: BookOpen,      t: '4 200+ QCM disponibles' },
              { Icon: Users,         t: '2 400+ médecins formés' },
              { Icon: ClipboardCheck,t: 'Mis à jour chaque trimestre' },
            ].map((b) => (
              <li key={b.t} className="flex flex-col items-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
                <b.Icon className="h-4 w-4 text-(--color-primary)" />
                {b.t}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/* ============ CSS-drawn dashboard mockup (no image dependency) ============ */
function DashboardMock() {
  return (
    <div className="relative rounded-2xl border border-(--color-border) bg-white shadow-2xl shadow-black/10">
      {/* browser bar */}
      <div className="flex items-center gap-1.5 border-b border-(--color-border) px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 truncate text-[11px] text-(--color-ink-muted)">app.majorecn.fr / dashboard</span>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-3 p-4 sm:p-5">
        {/* sidebar */}
        <aside className="hidden flex-col gap-1.5 rounded-xl bg-(--color-surface-soft) p-2.5 sm:flex">
          {['Dashboard', 'QCM', 'Flashcards', 'Examens', 'Statistiques'].map((l, i) => (
            <span
              key={l}
              className={
                'rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ' +
                (i === 0 ? 'bg-white text-(--color-primary) shadow-sm' : 'text-(--color-ink-soft)')
              }
            >
              {l}
            </span>
          ))}
        </aside>

        {/* content */}
        <div className="min-w-0 space-y-3 sm:col-start-2 sm:col-end-3">
          <div>
            <p className="text-xs font-semibold text-(--color-ink-muted)">Bonjour, Dr. Benyamina 👋</p>
            <p className="font-display text-sm font-bold text-(--color-ink)">Voici votre progression</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { t: 'Progression', v: '68%' },
              { t: 'QCM',         v: '1 245' },
              { t: 'Réussite',    v: '74%' },
            ].map((k) => (
              <div key={k.t} className="rounded-lg border border-(--color-border) bg-white p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">{k.t}</p>
                <p className="mt-0.5 font-display text-base font-extrabold text-(--color-ink)">{k.v}</p>
              </div>
            ))}
          </div>
          {/* chart */}
          <div className="rounded-lg border border-(--color-border) bg-(--color-surface-soft) p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Progression — 6 mois</p>
            <svg viewBox="0 0 220 70" className="mt-1.5 h-16 w-full">
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B1A2A" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6B1A2A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,60 L18,55 L38,50 L60,42 L82,38 L106,30 L130,28 L156,20 L182,16 L210,12 L220,10 L220,70 L0,70 Z" fill="url(#ga)" />
              <path d="M0,60 L18,55 L38,50 L60,42 L82,38 L106,30 L130,28 L156,20 L182,16 L210,12" stroke="#6B1A2A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="210" cy="12" r="3" fill="#6B1A2A" />
            </svg>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-(--color-primary-soft) px-3 py-2">
            <Star className="h-3.5 w-3.5 text-(--color-primary)" />
            <p className="text-[11px] font-semibold text-(--color-primary)">+12 % depuis la semaine dernière</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Device frames for the "expérience complète" section ============ */
function DeviceFrame({
  label, sub, variant,
}: { label: string; sub: string; variant: 'desktop' | 'mobile' | 'tablet' }) {
  const w =
    variant === 'desktop' ? 'aspect-[16/10]' :
    variant === 'tablet'  ? 'aspect-[4/5]'   :
                            'aspect-[9/16]';
  return (
    <figure>
      <div className={`relative ${w} overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface-soft) shadow-lg`}>
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-white via-(--color-surface-soft) to-(--color-primary-soft)/40">
          <div className="w-[78%] space-y-2">
            <div className="h-1.5 w-12 rounded-full bg-(--color-primary)" />
            <div className="h-2 w-3/4 rounded-full bg-(--color-ink)/85" />
            <div className="h-1.5 w-full rounded-full bg-(--color-ink)/15" />
            <div className="h-1.5 w-5/6 rounded-full bg-(--color-ink)/15" />
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <div className="h-7 rounded-md bg-(--color-primary)/15" />
              <div className="h-7 rounded-md bg-(--color-primary)/25" />
              <div className="h-7 rounded-md bg-(--color-primary)/10" />
            </div>
            <div className="mt-2 h-12 rounded-md border border-(--color-border) bg-white" />
          </div>
        </div>
      </div>
      <figcaption className="mt-4 px-1">
        <p className="text-sm font-bold text-(--color-ink)">{label}</p>
        <p className="text-xs text-(--color-ink-muted)">{sub}</p>
      </figcaption>
    </figure>
  );
}
