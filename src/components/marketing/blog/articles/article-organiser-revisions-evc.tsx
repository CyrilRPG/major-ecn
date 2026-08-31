/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  ArrowRight, BarChart3, BookOpen, Calendar, CheckCircle2, Clock,
  ClipboardCheck, ClipboardList, Download, FileText, GraduationCap,
  Layers3, Lightbulb, ListChecks, Quote, Repeat, Settings2, Sparkles,
  Target, Timer, Trophy, Users, type LucideIcon,
} from 'lucide-react';
import { ARTICLE_FONT } from '../article-shell';
import { GuideEvcBreadcrumb } from '../guide-evc-links';
import { BrandLogo } from '@/components/brand/brand-logo';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

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

type Section = {
  n: number;
  id: string;
  short: string;
  Icon: LucideIcon;
  title: string;
  body: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    n: 1,
    id: 'point-arrivee',
    short: "Posez votre point d'arrivée",
    Icon: Calendar,
    title: "Commencez par poser votre point d'arrivée",
    body: (
      <>
        <p>
          On organise mal un trajet quand on ne sait pas où ni quand on
          arrive. La première chose à faire n&rsquo;est donc pas
          d&rsquo;ouvrir un cours, mais de regarder le calendrier.
        </p>
        <p className="mt-3">
          Repérez la date de l&rsquo;épreuve, puis comptez le nombre de
          semaines qui vous en séparent. Ce chiffre, c&rsquo;est votre
          capital. Tout le reste va se construire à rebours à partir de lui.
          Un candidat qui dispose de huit mois ne s&rsquo;organise pas comme
          un candidat qui en a trois, et les deux doivent le savoir dès le
          départ pour ne pas se bercer d&rsquo;illusions ni paniquer
          inutilement.
        </p>
        <p className="mt-3">
          Posez aussi, à ce stade, votre voie : interne ou externe. Le format
          des épreuves conditionne la nature de votre entraînement, donc votre
          planning. Si vous avez un doute, notre guide sur{' '}
          <Link href="/blog/comment-se-presenter-aux-evc" className="font-semibold underline" style={{ color: RED }}>
            comment s&rsquo;inscrire aux EVC
          </Link>{' '}
          précise les conditions de chacune.
        </p>
      </>
    ),
  },
  {
    n: 2,
    id: 'trois-phases',
    short: "Découpez en trois grandes phases",
    Icon: Layers3,
    title: "Découpez votre préparation en trois grandes phases",
    body: (
      <>
        <p>
          Une préparation efficace n&rsquo;est pas une longue ligne droite
          uniforme. Elle se découpe en phases, chacune avec un objectif
          différent. La logique du rétroplanning consiste à partir de la fin
          et à remonter.
        </p>

        <div className="mt-5 space-y-3">
          {[
            { phase: 'Apprentissage', period: 'Mois 1 à 3', desc: 'Couvrir le programme, faire ses fiches', color: '#3B82F6', bg: '#EFF6FF' },
            { phase: 'Entraînement', period: 'Mois 4 à 5', desc: 'QCM, cas cliniques, examens blancs', color: RED, bg: RED_SOFT },
            { phase: 'Consolidation', period: 'Dernier mois', desc: 'Révisions, ajustements, confiance', color: '#16793C', bg: '#E7F6EC' },
          ].map((p, i) => (
            <div key={p.phase} className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: BORDER, background: p.bg }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white"
                style={{ background: p.color }}>
                {i + 1}
              </span>
              <div>
                <p className="text-[14px] font-extrabold" style={{ color: INK }}>{p.phase} <span className="font-semibold" style={{ color: INK_SOFT }}>— {p.period}</span></p>
                <p className="mt-0.5 text-[13px]" style={{ color: INK_SOFT }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] italic" style={{ color: INK_MUTED }}>
          Les durées sont indicatives : adaptez-les à votre nombre de
          semaines disponibles.
        </p>

        <p className="mt-4">
          <strong>La phase d&rsquo;apprentissage</strong>, au début.
          C&rsquo;est le moment où vous couvrez le programme, thème par thème,
          où vous construisez vos fiches et où vous posez les bases.
          C&rsquo;est la phase la plus longue. L&rsquo;erreur classique est de
          vouloir tout retenir parfaitement du premier coup : visez plutôt une
          première couverture solide, quitte à approfondir ensuite.
        </p>
        <p className="mt-3">
          <strong>La phase d&rsquo;entraînement</strong>, au milieu. Vous
          basculez progressivement de la lecture vers la pratique. QCM pour la
          voie interne, dossiers et questions courtes pour la voie externe.
          C&rsquo;est ici que les connaissances deviennent des réflexes, et
          que vous repérez vos points faibles réels, ceux que seul
          l&rsquo;entraînement révèle.
        </p>
        <p className="mt-3">
          <strong>La phase de consolidation</strong>, à la fin. Les dernières
          semaines servent à revoir, à refaire des épreuves blanches
          complètes, à colmater les dernières lacunes et à arriver en
          confiance. On n&rsquo;apprend plus de gros nouveaux chapitres à ce
          stade : on affûte ce qui est déjà là.
        </p>
      </>
    ),
  },
  {
    n: 3,
    id: 'hierarchiser',
    short: "Hiérarchisez les thèmes",
    Icon: Target,
    title: "Hiérarchisez les thèmes au lieu de tout traiter à égalité",
    body: (
      <>
        <p>
          Tous les sujets ne se valent pas, et les traiter tous avec la même
          intensité est une perte de temps.
        </p>
        <p className="mt-3">
          Certaines thématiques reviennent presque chaque année.
          D&rsquo;autres sont plus rares. Un planning intelligent donne la
          priorité aux sujets à fort rendement, ceux qui tombent souvent et
          rapportent le plus de points, avant de consacrer du temps aux thèmes
          secondaires. Cela ne veut pas dire ignorer le reste, mais
          ordonner : on sécurise d&rsquo;abord ce qui est le plus probable et
          le plus rentable.
        </p>
        <p className="mt-3">
          Cette hiérarchisation suppose de savoir ce qui tombe réellement aux
          EVC. C&rsquo;est là qu&rsquo;analyser les annales, ou
          s&rsquo;appuyer sur une préparation qui l&rsquo;a déjà fait pour
          vous, fait gagner un temps considérable. Choisir sa spécialité et
          ses priorités demande d&rsquo;ailleurs de bien lire le contexte du
          concours, comme on l&rsquo;explique à propos du{' '}
          <Link href="/blog/evc-ratio-candidats-postes-choix-specialite-2026" className="font-semibold underline" style={{ color: RED }}>
            poids réel du nombre de postes
          </Link>.
        </p>
      </>
    ),
  },
  {
    n: 4,
    id: 'cycles-courts',
    short: "Travaillez par cycles courts et réguliers",
    Icon: Repeat,
    title: "Travaillez par cycles courts et réguliers",
    body: (
      <>
        <p>
          Une fois les phases posées, reste à organiser le quotidien. Et là,
          un principe domine tous les autres : la régularité bat
          l&rsquo;intensité.
        </p>
        <p className="mt-3">
          Le programme est trop vaste pour être mémorisé en bloc. Ce qui ancre
          durablement, c&rsquo;est le rappel espacé : revoir une notion à
          intervalles croissants jusqu&rsquo;à ce qu&rsquo;elle tienne toute
          seule. Concrètement, un rythme de sessions courtes mais fréquentes,
          six jours sur sept, vaut bien mieux que de longues journées
          épuisantes suivies de plusieurs jours sans rien. Une notion vue en
          début de préparation ne reviendra le jour J que si vous
          l&rsquo;avez réactivée entre-temps.
        </p>
        <p className="mt-3">
          Pensez donc votre planning non comme une liste de chapitres à
          cocher une fois, mais comme une boucle : vous avancez sur du nouveau
          tout en réintégrant régulièrement de l&rsquo;ancien. C&rsquo;est
          cette rotation qui fait la différence le jour de l&rsquo;épreuve, y
          compris sur les thèmes vus des mois plus tôt.
        </p>
      </>
    ),
  },
  {
    n: 5,
    id: 'souplesse',
    short: "Gardez de la souplesse et mesurez vos progrès",
    Icon: BarChart3,
    title: "Gardez de la souplesse et mesurez vos progrès",
    body: (
      <>
        <p>
          Un planning trop rigide se brise au premier imprévu, une garde en
          plus, une semaine difficile, un thème qui résiste. Les meilleures
          organisations prévoient de la marge.
        </p>
        <p className="mt-3">
          Laissez des plages tampons pour rattraper le retard sans
          culpabiliser. Acceptez que le plan bouge, tant que la direction
          tient. Et surtout, mesurez votre progression : un planning
          n&rsquo;a de sens que si vous savez où vous en êtes. Refaire
          régulièrement des évaluations, voir ses scores monter, repérer les
          thèmes encore fragiles, c&rsquo;est ce qui permet d&rsquo;ajuster
          le tir avant qu&rsquo;il ne soit trop tard, plutôt que de découvrir
          ses lacunes le jour de l&rsquo;épreuve.
        </p>
        <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-bold"
          style={{ background: RED_SOFT, color: RED }}>
          <Lightbulb className="h-4 w-4 shrink-0" />
          Un bon planning ne vous dit pas seulement quoi réviser. Il vous dit
          où vous en êtes, et ce qu&rsquo;il vous reste à faire.
        </div>
      </>
    ),
  },
  {
    n: 6,
    id: 'resume',
    short: "En résumé : organiser ses révisions EVC",
    Icon: ListChecks,
    title: "En résumé : organiser ses révisions EVC",
    body: (
      <>
        <p>
          Une préparation bien structurée tient en quelques principes simples.
          Les candidats qui s&rsquo;organisent bien sont ceux qui :
        </p>
        <ul className="mt-3 space-y-2">
          {[
            "partent de la date du concours et comptent leurs semaines disponibles ;",
            "découpent leur préparation en phases : apprentissage, entraînement, consolidation ;",
            "priorisent les thèmes à fort rendement avant les sujets secondaires ;",
            "travaillent par cycles courts et réguliers, avec du rappel espacé ;",
            "gardent de la souplesse et mesurent leur progression en continu.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: 7,
    id: 'outil',
    short: "Quand un outil structure tout à votre place",
    Icon: Settings2,
    title: "Quand un outil structure tout ce travail à votre place",
    body: (
      <>
        <p>
          Construire et tenir ce planning soi-même est possible. Mais
          c&rsquo;est aussi chronophage, et facile à laisser dériver quand la
          fatigue s&rsquo;installe. C&rsquo;est précisément le rôle
          d&rsquo;une préparation structurée comme celle de Major ECN :
          transformer tous ces principes en un parcours déjà organisé.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { Icon: ClipboardCheck, t: 'QCM corrigés' },
            { Icon: FileText,       t: 'Cas cliniques' },
            { Icon: ClipboardList,  t: 'Examens blancs' },
            { Icon: Layers3,        t: 'Flashcards' },
            { Icon: Users,          t: 'Accompagnement' },
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
          Sur la plateforme, vous retrouvez un plan de travail clair qui vous
          indique quoi réviser et dans quel ordre, des cours dans toutes les
          spécialités et des entraînements ciblés en voie interne comme en
          voie externe. Vous vous entraînez sur des QCM, des dossiers
          cliniques et des fiches calibrés au niveau des EVC, vous passez des
          examens blancs en conditions réelles, et vous suivez votre
          progression au fil des semaines pour savoir en permanence où vous en
          êtes.
        </p>
        <p className="mt-3">
          C&rsquo;est la différence entre construire seul son chemin et
          avancer sur une route déjà tracée, avec quelqu&rsquo;un qui mesure
          vos progrès à vos côtés.
        </p>
      </>
    ),
  },
  {
    n: 8,
    id: 'commencer',
    short: "Par où commencer",
    Icon: BookOpen,
    title: "Par où commencer concrètement",
    body: (
      <>
        <p>
          Et pour poser dès maintenant les bases de votre méthode, le{' '}
          <Link href="/guide-methodologie-evc-2026" className="font-semibold underline" style={{ color: RED }}>
            Guide Méthodologie EVC 2026
          </Link>{' '}
          gratuit inclut notamment un planning de préparation et une check-list
          pour le jour J.
        </p>
        <p className="mt-4 font-bold" style={{ color: INK }}>
          Le guide vous montre le chemin. Major ECN vous accompagne
          jusqu&rsquo;à la réussite.
        </p>
        <Link href="/guide-methodologie-evc-2026"
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-bold text-white"
          style={{ background: RED }}>
          <Download className="h-4 w-4" /> Télécharger gratuitement le Guide
        </Link>
      </>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "Combien de temps faut-il pour préparer les EVC ?",
    a: "Il n'existe pas de durée universelle. Tout dépend de votre point de départ, de votre voie et du temps disponible chaque semaine. L'important est de commencer le plus tôt possible et d'étaler la préparation : la régularité sur plusieurs mois ancre bien mieux les connaissances qu'un effort intense de dernière minute.",
  },
  {
    q: "Vaut-il mieux réviser thème par thème ou tout mélanger ?",
    a: "Les deux, à des moments différents. En début de préparation, on avance thème par thème pour couvrir le programme. Ensuite, on réintègre régulièrement les thèmes anciens par du rappel espacé, et on s'entraîne sur des sujets mélangés pour se rapprocher des conditions réelles de l'épreuve.",
  },
  {
    q: "Comment savoir si je révise les bons sujets ?",
    a: "En vous appuyant sur ce qui tombe réellement aux EVC. Certaines thématiques reviennent fréquemment et méritent la priorité. Analyser les annales, ou utiliser une préparation qui hiérarchise déjà les sujets pour vous, évite de disperser ses efforts sur des thèmes peu rentables.",
  },
  {
    q: "Faut-il un planning strict ou souple ?",
    a: "Un planning structuré, mais avec de la souplesse. Une trame claire donne une direction, des plages tampons permettent d'absorber les imprévus sans tout dérégler. L'objectif est de tenir le cap global, pas de cocher chaque case à la minute près.",
  },
];

export function ArticleOrganiserRevisionsEvc({ article }: { article: BlogArticleMeta }) {
  return (
    <main style={{ fontFamily: ARTICLE_FONT, background: BG_PAGE }}>
      <ArticleBrandHeader />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20">

        {/* Fil d’Ariane — lien de retour vers la page hub /guide-evc. */}
        <GuideEvcBreadcrumb className="mb-5" title={article.title} category={article.category} />

        {/* ============ HERO ============ */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div>
            <span className="inline-flex items-center rounded-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white"
              style={{ background: RED }}>
              Blog
            </span>
            <h1 className="mt-4 text-[28px] font-black leading-[1.08] tracking-tight sm:text-[36px] lg:text-[40px]"
              style={{ color: INK }}>
              Comment organiser ses révisions jusqu&rsquo;au concours EVC
            </h1>
            <h2 className="mt-1 text-[22px] font-extrabold leading-snug sm:text-[26px]"
              style={{ color: RED }}>
              Rétroplanning, phases et priorisation
            </h2>

            <p className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
              style={{ color: INK_MUTED }}>
              <Clock className="h-3.5 w-3.5" /> Temps de lecture : {article.readingMinutes} minutes
            </p>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Début juillet. Il reste cinq mois avant les EVC. Un médecin
              ouvre pour la première fois ce qu&rsquo;il appelle son
              planning : il imprime une longue liste de chapitres, la pose sur
              son bureau, et se met au travail, plein de bonne volonté. Trois
              semaines plus tard, il relève la tête. Il a beaucoup lu, beaucoup
              surligné. Mais il serait incapable de dire ce qu&rsquo;il a
              vraiment retenu, ni ce qu&rsquo;il lui reste à couvrir.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Beaucoup de candidats aux EVC ne perdent pas à cause d&rsquo;un
              manque de travail. Ils perdent à cause d&rsquo;un manque
              d&rsquo;organisation. Le programme est vaste, le temps est
              compté, et la différence se fait souvent sur la capacité à
              structurer ses mois de préparation.
            </p>

            <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-bold"
              style={{ background: RED_SOFT, color: RED }}>
              <Target className="h-4 w-4 shrink-0" />
              Un candidat organisé qui suit un plan clair va plus loin
              qu&rsquo;un candidat brillant qui travaille au hasard.
            </div>
          </div>

          <div className="relative">
            <span aria-hidden
              className="pointer-events-none absolute -inset-x-3 -bottom-4 -z-10 h-20 rounded-[60px] opacity-50 blur-2xl"
              style={{ background: 'radial-gradient(closest-side, rgba(192,17,46,0.30) 0%, transparent 70%)' }} />

            <div className="relative w-full overflow-hidden rounded-3xl border shadow-md"
              style={{
                borderColor: BORDER,
                background: 'linear-gradient(135deg, #FFF6F7 0%, #FCEAEC 40%, #F0F4FA 100%)',
                boxShadow: '0 30px 60px -28px rgba(15,31,77,0.30), 0 12px 30px -16px rgba(192,17,46,0.18)',
              }}>
              <img
                src="/blog/medecin-planning-revisions-evc.webp"
                alt="Médecin organisant ses révisions EVC avec un planning et des QCM sur la plateforme Major ECN"
                className="block w-full h-auto select-none"
                decoding="async"
                fetchPriority="high"
              />
              <span aria-hidden
                className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
                style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), transparent 70%)' }} />
              <span aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(15,31,77,0.20) 100%)' }} />
              <span
                className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1.5 rounded-full border bg-white/95 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] backdrop-blur"
                style={{ borderColor: BORDER, color: INK, boxShadow: '0 8px 18px -10px rgba(15,31,77,0.30)' }}
              >
                <Calendar className="h-3 w-3" style={{ color: RED }} />
                Organiser ses révisions — la clé de la réussite
              </span>
            </div>
          </div>
        </section>

        {/* ============ CONTENU + SIDEBAR ============ */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <article className="space-y-6">
            {SECTIONS.map((s) => (
              <NumberedSection key={s.id} section={s} />
            ))}

            {/* FAQ */}
            <section id="faq" className="scroll-mt-24 rounded-2xl border bg-white p-5 sm:p-6"
              style={{ borderColor: BORDER }}>
              <h2 className="text-[19px] font-extrabold" style={{ color: INK }}>
                Foire aux questions
              </h2>
              <div className="mt-4 space-y-5">
                {FAQ_ITEMS.map((f) => (
                  <div key={f.q}>
                    <h3 className="text-[14px] font-bold" style={{ color: INK }}>{f.q}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>

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

            {/* CTA Guide gratuit */}
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: RED }}>
                Guide gratuit
              </p>
              <p className="mt-2 text-[13px] font-bold leading-snug" style={{ color: INK }}>
                Guide Méthodologie EVC 2026
              </p>
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
                39 pages : les 4 familles de questions, les 6 erreurs les plus
                coûteuses, planning de révision et check-list jour J.
              </p>
              <Link href="/guide-methodologie-evc-2026"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
                style={{ background: RED }}>
                <Download className="h-4 w-4" /> Télécharger gratuitement
              </Link>
            </div>

            {/* CTA Préparation */}
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
                « La méthodologie et les examens blancs m&rsquo;ont permis de
                comprendre ce qu&rsquo;attendaient les correcteurs et
                d&rsquo;aborder le jour J avec confiance. »
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

            {/* Chiffres */}
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: RED }}>
                Les chiffres Major ECN
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2.5">
                {[
                  { big: '10 000+', sub: 'flashcards' },
                  { big: '10 000+', sub: 'QCM disponibles' },
                  { big: '60+',     sub: 'épreuves blanches' },
                  { big: 'Toutes',  sub: 'les spécialités préparées' },
                  { big: '9 000+',  sub: 'médecins formés' },
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

      {/* Bandeau bas navy */}
      <section className="relative overflow-hidden py-10"
        style={{ background: NAVY }}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { big: 'Depuis 2011',           sub: 'au service des candidats EVC' },
            { big: 'Équipe PH & PU-PH',     sub: 'experts EVC' },
            { big: '9 000+',                sub: 'médecins formés' },
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
          &larr; Tous les articles
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

export const _UNUSED = { Sparkles, Timer, Trophy, GraduationCap };
