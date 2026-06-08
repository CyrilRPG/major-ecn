/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, ChevronRight, Clock,
  HelpCircle, Layers3, MessageSquare, Sparkles, Stethoscope, Target,
  TrendingUp, UserCheck, Users,
} from 'lucide-react';
import { ContactForm } from '@/components/marketing/contact-form';

export const metadata = {
  title: 'Nous contacter — Major ECN',
  description:
    "Besoin d'informations sur votre préparation EVC (PAE) ? L'équipe Major ECN vous répond sous 24 h ouvrées : choix de la formule, spécialité, suivi personnalisé.",
};

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const NAVY_DEEP = '#0A1838';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const SOFT_BG = '#F7F8FB';
const FONT = "'Plus Jakarta Sans', sans-serif";

const GRAD_BURGUNDY = 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 55%, #E8742C 100%)';
const GRAD_NAVY_RED = 'linear-gradient(90deg, #0F1F4D 0%, #6B1A2A 50%, #C0112E 100%)';
const gradientText = (grad: string) => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  color: 'transparent',
});

/* ============================================================
   4 mini features (gauche du hero)
   ============================================================ */
const FEATURES = [
  { Icon: Clock,       title: 'Réponse sous 24 h', sub: 'par un membre de l’équipe Major ECN.', tone: RED },
  { Icon: UserCheck,   title: 'Suivi sur mesure',  sub: 'orientation vers la formule adaptée.', tone: '#2563EB' },
  { Icon: Stethoscope, title: 'Spécialistes EVC',  sub: 'enseignants & praticiens en activité.', tone: '#0F8A6A' },
  { Icon: Sparkles,    title: 'Sans engagement',   sub: 'essai gratuit 2 jours, sans CB.',       tone: '#E8742C' },
];

const TRUST_AVATARS = [
  { name: 'Dr Samy K.',     spe: 'Cardiologie',   photo: '/temoignages/drsamy.jpg' },
  { name: 'Dr Leila B.',    spe: 'Pédiatrie',     photo: '/temoignages/dr-leila-bettaieb.jpg' },
  { name: 'Dr Bill B.',     spe: 'Méd. Générale', photo: '/temoignages/drbilly.png' },
  { name: 'Dr Haykel A.',   spe: 'Anesthésie',    photo: '/temoignages/dr-haykel-abdelbaki.jpg' },
  { name: 'Dr Faten K.',    spe: 'Néphrologie',   photo: '/temoignages/drfaten.png' },
];

const STEPS = [
  { n: '01', Icon: MessageSquare, title: 'Vous nous écrivez', sub: 'Décrivez votre situation, votre spécialité visée et vos disponibilités.' },
  { n: '02', Icon: Clock,         title: 'Réponse sous 24 h', sub: 'Notre équipe vous recontacte par email et/ou téléphone.' },
  { n: '03', Icon: Target,        title: 'Conseil personnalisé', sub: 'Bilan rapide de votre niveau et orientation vers la formule adaptée.' },
  { n: '04', Icon: Sparkles,      title: 'Démarrage', sub: 'Accès à la plateforme et lancement de votre préparation EVC.' },
];

const QUICK_FAQ = [
  { q: 'Pour quel public ?',           a: 'PADHUE, médecins UE, étudiants, dentistes, pharmaciens et sages-femmes.', Icon: Users,        tone: RED },
  { q: 'Combien de temps de prépa ?',  a: 'En général de 4 à 12 mois selon votre niveau et vos disponibilités.',     Icon: Calendar,     tone: '#2563EB' },
  { q: 'Quelles spécialités ?',        a: 'Plus de 45 spécialités sont préparées chez Major ECN.',                   Icon: Layers3,      tone: '#7C3AED' },
  { q: 'Possible depuis l’étranger ?', a: '100 % en ligne, accessible depuis la France et l’international.',         Icon: BookOpen,     tone: '#0F8A6A' },
];

/* ============================================================
   PAGE
   ============================================================ */
export default function ContactPage() {
  return (
    <main className="bg-white" style={{ fontFamily: FONT }}>
      {/* breadcrumb */}
      <nav className="mx-auto max-w-7xl px-4 pt-6 text-[12px] font-semibold sm:px-6 lg:px-8" style={{ color: INK_MUTED }} aria-label="Fil d’ariane">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:underline">Accueil</Link></li>
          <li><ChevronRight className="h-3 w-3" /></li>
          <li style={{ color: NAVY }}>Nous contacter</li>
        </ol>
      </nav>

      {/* ============ HERO 2 colonnes ============ */}
      <section className="relative overflow-hidden bg-white pt-6 pb-14 sm:pb-16 lg:pb-20">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[460px] w-[460px] rounded-full bg-[#C0112E]/6 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#0F1F4D]/5 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">

            {/* LEFT — titre + features + trust */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em]"
                style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
                <MessageSquare className="h-3.5 w-3.5" /> Nous contacter
              </span>

              <h1 className="mt-5 text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.4rem]"
                style={gradientText(GRAD_NAVY_RED)}>
                Besoin d’informations sur votre préparation EVC&nbsp;?<br />
                <span style={gradientText(GRAD_BURGUNDY)}>Notre équipe vous accompagne.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
                Que vous soyez en début de réflexion ou prêt à démarrer, l’équipe
                Major ECN vous oriente vers la formule la plus adaptée à votre
                spécialité, votre niveau et votre date d’EVC.
              </p>

              {/* 4 features */}
              <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${f.tone}14`, color: f.tone }}>
                      <f.Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-extrabold" style={{ color: NAVY }}>{f.title}</p>
                      <p className="text-[12.5px] leading-snug" style={{ color: INK_SOFT }}>{f.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Trust avatars */}
              <div className="mt-8 rounded-2xl border bg-[#F7F8FB] p-4 sm:p-5" style={{ borderColor: BORDER }}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>Ils nous font confiance</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {TRUST_AVATARS.map((a, i) => (
                      <img key={i} src={a.photo} alt={a.name}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm" />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>
                      +9 000&nbsp;médecins accompagnés
                    </p>
                    <p className="text-[11.5px] leading-tight" style={{ color: INK_SOFT }}>
                      depuis plus de 15 ans dans 45+ spécialités.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — CTA card + formulaire */}
            <div className="flex flex-col gap-5">
              {/* CTA "Prêt à commencer ?" */}
              <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-[#0F1F4D] via-[#142454] to-[#0A1838] p-5 text-white shadow-[0_24px_60px_-24px_rgba(15,31,77,0.55)] sm:p-6"
                style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
                <span aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C0112E]/30 blur-3xl" />
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <Sparkles className="h-5 w-5" style={{ color: '#F5D597' }} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">Prêt à commencer&nbsp;?</p>
                    <p className="text-lg font-extrabold leading-tight sm:text-xl">
                      Prêt à commencer votre préparation&nbsp;?
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/85">
                      Découvrez nos formules ou testez la plateforme dès maintenant.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link href="/inscription"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold shadow transition-transform hover:scale-[1.02]"
                    style={{ color: RED }}>
                    <Sparkles className="h-4 w-4" /> Essai gratuit
                  </Link>
                  <Link href="/plateforme"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white backdrop-blur transition-transform hover:scale-[1.02]">
                    Découvrir la plateforme <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Formulaire */}
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ============ Que se passe-t-il après votre demande ? ============ */}
      <section className="relative py-14 sm:py-16 lg:py-20" style={{ background: SOFT_BG }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
              style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
              <TrendingUp className="h-3 w-3" /> Processus simple
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
              Que se passe-t-il après votre demande&nbsp;?
            </h2>
            <p className="mt-3 text-[15px]" style={{ color: INK_SOFT }}>
              Une équipe disponible, un accompagnement clair, du premier message au
              démarrage de votre préparation.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex h-full flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: BORDER }}>
                <span className="text-[42px] font-black leading-none tracking-tight" style={{ color: '#FCEAEC' }}>
                  {s.n}
                </span>
                <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: '#FCEAEC', color: RED }}>
                  <s.Icon className="h-5 w-5" />
                </span>
                <p className="text-base font-extrabold" style={{ color: NAVY }}>{s.title}</p>
                <p className="text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Questions fréquentes ============ */}
      <section className="relative bg-white py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
              style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
              <HelpCircle className="h-3 w-3" /> Questions fréquentes
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
              Questions fréquentes sur les EVC (PAE)
            </h2>
            <p className="mt-3 text-[15px]" style={{ color: INK_SOFT }}>
              Toutes les réponses se trouvent peut-être déjà dans notre FAQ.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_FAQ.map((f, i) => (
              <div key={i} className="flex h-full flex-col gap-2 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: BORDER }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${f.tone}14`, color: f.tone }}>
                  <f.Icon className="h-5 w-5" />
                </span>
                <p className="text-[14px] font-extrabold leading-tight" style={{ color: NAVY }}>{f.q}</p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{f.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/faq"
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-[13px] font-bold transition-colors hover:bg-[#FFF8F9]"
              style={{ borderColor: BORDER, color: NAVY }}>
              Voir toute la FAQ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA final ============ */}
      <section className="relative overflow-hidden py-14 sm:py-16 lg:py-20"
        style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, ${RED_DEEP} 100%)` }}>
        <span aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(232,116,44,0.30), rgba(255,255,255,0))' }} />
        <span aria-hidden className="pointer-events-none absolute -left-32 -bottom-20 h-[360px] w-[360px] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.25), rgba(255,255,255,0))' }} />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white backdrop-blur">
              <Sparkles className="h-3 w-3" /> Démarrer maintenant
            </span>
            <h2 className="mt-5 text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl"
              style={{ letterSpacing: '-0.02em' }}>
              Prêt à réussir les EVC <span style={{ color: '#F5D597' }}>dans votre spécialité&nbsp;?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85">
              Plus de 45&nbsp;spécialités préparées par Major ECN, dont la médecine
              générale, la pédiatrie, la cardiologie et la chirurgie.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/specialites"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02]"
                style={{ color: RED }}>
                Découvrir les spécialités <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/inscription"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-transform hover:scale-[1.02]">
                Démarrer mon essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
