/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Brain, Calendar, CheckCircle2, ClipboardCheck,
  ClipboardList, Clock, FileText, GraduationCap, Layers3, Lightbulb, Play,
  Quote, RefreshCcw, Sparkles, Target, TrendingUp, Trophy, Users, Users2,
  type LucideIcon,
} from 'lucide-react';
import { ARTICLE_FONT } from '../article-shell';
import { BrandLogo } from '@/components/brand/brand-logo';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

/* Palette de l'article — conforme a la maquette designer IMG_2268. */
const NAVY      = '#0F1F4D';
const NAVY_DEEP = '#0A1838';
const INK       = '#0F172A';
const INK_SOFT  = '#475569';
const INK_MUTED = '#7A8499';
const RED       = '#C0112E';
const RED_SOFT  = '#FCEAEC';
const RED_DEEP  = '#8B0E22';
const BORDER    = '#ECEEF1';
const BG_PAGE   = '#FAFBFE';

/* Sections numerotees de l'article. */
type Section = {
  n: number;
  id: string;
  short: string;        // libelle dans le sommaire (sidebar)
  Icon: LucideIcon;
  title: string;
  body: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    n: 1,
    id: 'connaissances',
    short: 'Les EVC ne récompensent pas que les connaissances',
    Icon: Brain,
    title: 'Les EVC ne récompensent pas uniquement les connaissances',
    body: (
      <p>
        On pourrait penser que le concours récompense simplement celui qui possède
        le plus de connaissances médicales. Dans les faits, les épreuves sont
        construites pour évaluer un raisonnement clinique structuré, une capacité
        à hiérarchiser et à présenter ses idées selon le format attendu par le jury.
        Les candidats qui maîtrisent parfaitement leur cours mais qui ne
        s’entraînent pas à <strong>répondre dans le bon cadre</strong> perdent
        des points évitables. À l’inverse, ceux qui prennent le temps de comprendre
        comment penser et structurer leurs réponses utilisent efficacement leur
        socle de connaissances et progressent rapidement.
      </p>
    ),
  },
  {
    n: 2,
    id: 'tout-reviser',
    short: 'L’erreur la plus fréquente : vouloir tout réviser',
    Icon: RefreshCcw,
    title: 'L’erreur la plus fréquente : vouloir tout réviser',
    body: (
      <p>
        À vouloir tout apprendre, beaucoup finissent par se disperser. Les lauréats
        expliquent régulièrement qu’ils ont commencé à <strong>prioriser
        clairement</strong> dès le départ : sélection des items les plus rentables,
        identification des chapitres récurrents dans les annales, repérage des
        notions transversales. Le temps disponible étant limité, il est essentiel
        d’identifier les notions à fort rendement et de concentrer ses efforts sur
        les éléments réellement susceptibles d’être valorisés le jour J.
      </p>
    ),
  },
  {
    n: 3,
    id: 'groupes',
    short: 'Les groupes de discussion : utile, mais avec précaution',
    Icon: Users2,
    title: 'Les groupes de discussion : utile, mais à manier avec précaution',
    body: (
      <p>
        Ils peuvent apporter du soutien, des retours d’expérience et une émulation
        précieuse. Mais ils peuvent aussi devenir une source d’anxiété, de
        comparaisons et de polémiques sur des détails sans réelle importance pour
        le jour de l’examen. À force de comparer ses échanges, certains candidats
        finissent par penser qu’ils manquent de connaissances ou qu’ils s’y prennent
        mal. Les lauréats sont nombreux à dire qu’ils ont surtout cherché à
        <strong> préserver leur concentration</strong> et leur motivation, en
        choisissant les bons interlocuteurs et en gardant un cap personnel.
      </p>
    ),
  },
  {
    n: 4,
    id: 'examens-blancs',
    short: 'Les examens blancs : un outil sous-estimé',
    Icon: ClipboardCheck,
    title: 'Les examens blancs : un outil souvent sous-estimé',
    body: (
      <>
        <p>
          Les épreuves blanches en conditions réelles sont l’un des leviers les
          plus efficaces et pourtant l’un des plus négligés. Elles permettent :
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            'd’évaluer son niveau réel sur l’ensemble du programme',
            'de travailler la gestion du temps en conditions d’examen',
            'de réduire le stress du jour J',
            'd’améliorer la qualité et la précision des réponses',
            'd’identifier les chapitres encore à consolider',
          ].map((it) => (
            <li key={it} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RED }} />
              {it}
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Beaucoup de candidats déclarent que certaines notions ne sont vraiment
          maîtrisées qu’après les avoir affrontées dans le contexte d’un examen
          blanc.
        </p>
      </>
    ),
  },
  {
    n: 5,
    id: 'correcteur',
    short: 'Comprendre ce qu’attend réellement le correcteur',
    Icon: Lightbulb,
    title: 'Comprendre ce qu’attend réellement le correcteur',
    body: (
      <>
        <p>
          Le correcteur évalue rapidement&nbsp;:
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            'la pertinence des éléments retenus',
            'la structuration du raisonnement',
            'la capacité à prioriser les informations importantes',
            'la qualité de l’argumentation et de la conclusion',
          ].map((it) => (
            <li key={it} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RED }} />
              {it}
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Savoir exactement ce qu’il attend, c’est <strong>rendre lisible</strong>
          ce que l’on a appris. Un bon entraînement passe par la lecture de corrigés
          détaillés et la confrontation à des grilles de correction proches des
          attentes du jury.
        </p>
      </>
    ),
  },
  {
    n: 6,
    id: 'regularite',
    short: 'Une préparation efficace repose sur la régularité',
    Icon: Calendar,
    title: 'Une préparation efficace repose sur la régularité',
    body: (
      <p>
        La plupart des lauréats partagent un même constat&nbsp;: ils ont travaillé
        à un rythme régulier plutôt que par à-coups intenses. Plusieurs heures par
        semaine, étalées sur plusieurs mois, permettent de construire des
        automatismes solides, de réduire la fatigue cognitive et de consolider
        durablement les notions. La régularité crée progressivement des
        automatismes et permet de conserver les connaissances sur la durée plutôt
        que de tout réviser en urgence à la dernière minute.
      </p>
    ),
  },
  {
    n: 7,
    id: 'accompagnement',
    short: 'Comment Major ECN accompagne les candidats',
    Icon: GraduationCap,
    title: 'Comment Major ECN accompagne les candidats aux EVC',
    body: (
      <>
        <p>
          Depuis 2011, Major ECN accompagne les médecins préparant les EVC dans le
          cadre de la PAE. Notre préparation s’appuie sur plusieurs outils
          complémentaires&nbsp;:
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[
            { Icon: Play,            t: 'Cours enregistrés' },
            { Icon: ClipboardCheck,  t: 'QCM corrigés' },
            { Icon: FileText,        t: 'Cas cliniques' },
            { Icon: ClipboardList,   t: 'Examens blancs' },
            { Icon: Layers3,         t: 'Flashcards' },
            { Icon: Users,           t: 'Accompagnement' },
          ].map((b) => (
            <div key={b.t} className="flex flex-col items-center gap-1.5 rounded-xl border bg-white p-3 text-center"
              style={{ borderColor: BORDER }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: RED_SOFT, color: RED }}>
                <b.Icon className="h-4 w-4" />
              </span>
              <p className="text-[10px] font-extrabold leading-tight" style={{ color: INK }}>{b.t}</p>
            </div>
          ))}
        </div>
        <p className="mt-3">
          Notre plateforme couvre plus de 45 spécialités et reste accessible à
          tout moment, en ligne, depuis la France comme à l’international.
        </p>
      </>
    ),
  },
  {
    n: 8,
    id: 'methode',
    short: 'Une question de méthode autant que de travail',
    Icon: Trophy,
    title: 'Réussir les EVC : une question de méthode autant que de travail',
    body: (
      <>
        <p>
          Aucune préparation, aussi complète soit-elle, ne remplacera l’investissement
          personnel du candidat. Mais les lauréats le confirment&nbsp;: ce qui fait
          la différence sur la durée, c’est la <strong>persévérance</strong> et
          la capacité à maintenir des efforts constants.
        </p>
        <p className="mt-3">
          Mais les témoignages des lauréats convergent souvent vers une même
          conclusion&nbsp;: disposer d’une méthode claire, d’un accompagnement
          adapté et d’outils conçus pour le concours change profondément la
          confiance et l’efficacité d’une préparation.
        </p>
        <p className="mt-3">
          Si vous préparez actuellement les EVC dans le cadre de la Procédure
          d’Autorisation d’Exercice, gardez à l’esprit qu’il n’est pas nécessaire
          de tout savoir parfaitement&nbsp;: l’essentiel est de travailler
          régulièrement, de progresser semaine après semaine et d’avancer avec
          une méthode cohérente jusqu’au jour de l’examen. <span aria-hidden>🚀</span>
        </p>
      </>
    ),
  },
];

/* ============================================================
   ARTICLE
   ============================================================ */
export function ArticleConseilsLaureats({ article }: { article: BlogArticleMeta }) {
  return (
    <main style={{ fontFamily: ARTICLE_FONT, background: BG_PAGE }}>
      {/* Header brandé Major ECN */}
      <ArticleBrandHeader />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20">

        {/* ============ HERO ============ */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* Gauche : badge + titre + intro */}
          <div>
            <span className="inline-flex items-center rounded-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white"
              style={{ background: RED }}>
              Blog
            </span>
            <h1 className="mt-4 text-[28px] font-black leading-[1.08] tracking-tight sm:text-[36px] lg:text-[40px]"
              style={{ color: INK }}>
              {article.title.split(':')[0]}<span style={{ color: INK }}>&nbsp;:</span>
            </h1>
            <h2 className="mt-1 text-[22px] font-extrabold leading-snug sm:text-[26px]"
              style={{ color: RED }}>
              {article.title.includes(':') ? article.title.split(':').slice(1).join(':').trim() : ''}
            </h2>

            <p className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
              style={{ color: INK_MUTED }}>
              <Clock className="h-3.5 w-3.5" /> Temps de lecture : {article.readingMinutes} minutes
            </p>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Chaque année, de nombreux médecins diplômés hors de l’Union européenne
              se présentent aux Épreuves de Vérification des Connaissances (EVC)
              dans le cadre de la Procédure d’Autorisation d’Exercice (PAE).
            </p>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Certains exercent déjà depuis plusieurs années dans leur pays
              d’origine. D’autres travaillent en France dans le cadre de différents
              statuts. Tous partagent pourtant la même interrogation&nbsp;:
            </p>

            <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-bold"
              style={{ background: RED_SOFT, color: RED }}>
              <ArrowRight className="h-4 w-4 shrink-0" />
              Comment maximiser ses chances de réussir les EVC&nbsp;?
            </div>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Après avoir échangé avec de nombreux lauréats, l’un des constats
              revient régulièrement&nbsp;: la réussite ne dépend pas uniquement
              du niveau médical du candidat.
            </p>
          </div>

          {/* Droite : photo médecin réfléchie sur laptop (préparation EVC) */}
          <div className="relative">
            {/* Halos colorés */}
            <span aria-hidden
              className="pointer-events-none absolute -inset-x-3 -bottom-4 -z-10 h-20 rounded-[60px] opacity-50 blur-2xl"
              style={{ background: 'radial-gradient(closest-side, rgba(192,17,46,0.30) 0%, transparent 70%)' }} />

            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border shadow-md"
              style={{
                borderColor: BORDER,
                background:
                  'linear-gradient(135deg, #FFF6F7 0%, #FCEAEC 40%, #F0F4FA 100%)',
                boxShadow: '0 30px 60px -28px rgba(15,31,77,0.30), 0 12px 30px -16px rgba(192,17,46,0.18)',
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/blog/reussir-evc-asian-laptop.jpg"
                alt="Médecin préparant les Épreuves de Vérification des Connaissances (EVC) avec méthode"
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{ objectPosition: '55% 30%' }}
                decoding="async"
                fetchPriority="high"
              />
              {/* Sheen lumineux discret */}
              <span aria-hidden
                className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
                style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), transparent 70%)' }} />
              {/* Vignette douce en bas */}
              <span aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(15,31,77,0.20) 100%)' }} />
              {/* Badge bottom */}
              <span
                className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1.5 rounded-full border bg-white/95 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] backdrop-blur"
                style={{ borderColor: BORDER, color: INK, boxShadow: '0 8px 18px -10px rgba(15,31,77,0.30)' }}
              >
                <BookOpen className="h-3 w-3" style={{ color: RED }} />
                Méthode validée par 9000+ médecins
              </span>
            </div>
          </div>
        </section>

        {/* ============ CONTENU + SIDEBAR ============ */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Colonne principale : 8 sections numerotees */}
          <article className="space-y-6">
            {SECTIONS.map((s) => (
              <NumberedSection key={s.id} section={s} />
            ))}
          </article>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            {/* Sommaire */}
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: RED }}>
                Dans cet article
              </p>
              <ul className="mt-3 space-y-2.5">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}
                      className="flex items-start gap-2 text-[12.5px] leading-snug transition-colors hover:underline"
                      style={{ color: INK }}>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-extrabold"
                        style={{ background: RED_SOFT, color: RED }}>
                        {s.n}
                      </span>
                      <span>{s.short}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA "Préparez les EVC avec une méthode éprouvée" */}
            <div className="relative overflow-hidden rounded-2xl border p-5 text-white shadow-[0_24px_60px_-30px_rgba(192,17,46,0.55)]"
              style={{
                background: `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 65%, ${NAVY_DEEP} 100%)`,
                borderColor: 'rgba(255,255,255,0.18)',
              }}>
              <p className="text-base font-extrabold leading-tight">
                Préparez les EVC avec une méthode éprouvée
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] leading-snug text-white/90">
                {[
                  'Cours ciblés, QCM, cas cliniques',
                  'Examens blancs et méthodologie',
                  'Suivi pédagogique personnalisé',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/methode"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold"
                style={{ color: RED }}>
                Découvrir la méthode <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Témoignage */}
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: RED }}>
                Ils ont réussi les EVC avec Major ECN
              </p>
              <Quote className="mt-3 h-4 w-4" style={{ color: RED }} fill="currentColor" />
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK }}>
                « La méthodologie et les examens blancs m’ont permis de comprendre
                ce qu’attendaient les correcteurs et d’aborder le jour J avec 2&nbsp;ans
                d’avance. »
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[10.5px] font-extrabold text-white"
                  style={{ background: RED }}>MK</span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[12.5px] font-extrabold" style={{ color: INK }}>Dr M., lauréate EVC</p>
                  <p className="text-[11px]" style={{ color: INK_MUTED }}>Cardiologie</p>
                </div>
              </div>
            </div>

            {/* Chiffres Major ECN */}
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: RED }}>
                Les chiffres Major ECN
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2.5">
                {[
                  { big: '2 288',  sub: 'flashcards' },
                  { big: '5 000+', sub: 'QCM disponibles' },
                  { big: '50+',    sub: 'concours blancs' },
                  { big: '45+',    sub: 'spécialités préparées' },
                  { big: '9 000+', sub: 'médecins formés' },
                ].map((s) => (
                  <li key={s.sub} className="flex items-baseline justify-between border-b pb-2 last:border-b-0 last:pb-0"
                    style={{ borderColor: BORDER }}>
                    <span className="text-[18px] font-black tabular-nums" style={{ color: RED }}>{s.big}</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: INK_SOFT }}>{s.sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Bandeau bas navy "Depuis 2011 / Équipe PH / 9 000+ / Plateforme 100% dédiée" */}
      <section className="relative overflow-hidden py-10"
        style={{ background: NAVY }}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { big: 'Depuis 2011',    sub: 'au service des candidats EVC' },
            { big: 'Équipe PH & PU-PH', sub: 'experts EVC' },
            { big: '9 000+',         sub: 'médecins formés' },
            { big: 'Plateforme 100% dédiée', sub: 'aux EVC (PAE)' },
          ].map((c) => (
            <div key={c.big} className="text-center text-white">
              <p className="text-base font-extrabold leading-tight sm:text-lg">{c.big}</p>
              <p className="mt-1 text-[11.5px] text-white/75">{c.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */

function ArticleBrandHeader() {
  return (
    <header className="border-b bg-white" style={{ borderColor: BORDER }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Major ECN" className="inline-flex items-center">
          <BrandLogo className="h-9 w-auto sm:h-10" />
        </Link>
        <Link href="/blog"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors hover:bg-(--color-sand-100)"
          style={{ color: INK }}>
          ← Tous les articles
        </Link>
      </div>
    </header>
  );
}

function NumberedSection({ section }: { section: Section }) {
  const { n, id, Icon, title, body } = section;
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border bg-white p-5 sm:p-6"
      style={{ borderColor: BORDER }}>
      <header className="flex items-start gap-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-black text-white"
          style={{ background: RED }}>
          {n}
        </span>
        <h2 className="flex-1 text-[18px] font-extrabold leading-snug sm:text-[19px]"
          style={{ color: INK }}>
          {title}
        </h2>
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex"
          style={{ background: RED_SOFT, color: RED }}>
          <Icon className="h-5 w-5" />
        </span>
      </header>
      <div className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
        {body}
      </div>
    </section>
  );
}

/* Unused but exported for compatibility with article-shell utilities. */
export const _UNUSED = { Sparkles, TrendingUp, BookOpen, Target };
