import {
  ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Globe, GraduationCap, Heart, LineChart,
  Quote, Shield, Sparkles, Star, Target, TrendingUp, Users, Zap,
} from 'lucide-react';
import { Reveal } from '@/components/marketing/reveal';
import { InscriptionForm } from '@/components/marketing/inscription-form';
import { ManusHero } from '@/components/marketing/manus-hero';
import {
  MethodeSection, ExperienceSection, TemoignagesSection,
  TransformationSection, StatsSection, AudienceSection,
  FAQSection, TrustBanner, FreeTrialBanner,
} from '@/components/marketing/manus-sections';

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
      {/* =================== HERO — Manus arc-en-ciel =================== */}
      <ManusHero />

      {/* === Manus sections (identiques au site Manus du designer) === */}
      <MethodeSection />
      <ExperienceSection />
      <TemoignagesSection />
      <TransformationSection />
      <FreeTrialBanner />
      <TrustBanner />
      <StatsSection />
      <AudienceSection />

      {/* =================== TARIFS — dark charcoal Manus =================== */}
      <section id="tarifs" className="relative isolate overflow-hidden bg-[#1C1C1E] py-20 text-white lg:py-28">
        <div aria-hidden className="absolute -top-32 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#6B1A2A]/40 blur-[120px]" />
        <div aria-hidden className="absolute -bottom-32 right-1/4 -z-10 h-[380px] w-[600px] rounded-full bg-[#3B82F6]/12 blur-[120px]" />
        <div aria-hidden className="absolute -left-32 top-1/3 -z-10 h-[320px] w-[520px] rounded-full bg-[#14B8A6]/10 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur">
              <Sparkles className="h-3 w-3" /> Inscriptions ouvertes — Session 2025
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Votre réussite aux EVC commence ici
            </h2>
            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Choisissez la formule adaptée à vos objectifs. 7 jours d’essai gratuit, sans engagement.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PLANS.map((p, idx) => {
              const hi = p.highlighted;
              return (
                <Reveal
                  key={p.name}
                  delay={idx * 0.1}
                  className={
                    'relative flex flex-col gap-5 rounded-2xl p-7 transition-transform ' +
                    (hi
                      ? 'bg-white text-[#2D2D2D] ring-2 ring-white shadow-2xl shadow-black/40 lg:scale-[1.03]'
                      : 'bg-[rgba(255,255,255,0.04)] text-white ring-1 ring-[rgba(255,255,255,0.12)] hover:ring-[rgba(255,255,255,0.25)]')
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
                </Reveal>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs text-white/55">
            ✓ Essai gratuit 7 jours · Accès complet · Zéro engagement · Annulation instantanée
          </p>
        </div>
      </section>

      {/* =================== FAQ — Manus =================== */}
      <FAQSection />

      {/* =================== FINAL CTA =================== */}
      <section id="cta" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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

            <InscriptionForm />

            <p className="mt-4 text-xs text-(--color-ink-muted)">
              ✓ Essai gratuit 7 jours · Essentiel &amp; Premium : accès immédiat par email d’activation.
              Intensif : un conseiller vous rappelle sous 24 h.
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
