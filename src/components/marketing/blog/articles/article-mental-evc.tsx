/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  ArrowRight, Battery, BookOpen, Brain, CheckCircle2, Clock,
  ClipboardCheck, ClipboardList, Download, FileText, GraduationCap,
  Heart, Layers3, Lightbulb, Quote, Shield, Sparkles, Target,
  Timer, Trophy, Users, Zap, type LucideIcon,
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
    id: 'motivation-profonde',
    short: "Ils savent pourquoi ils le font",
    Icon: Heart,
    title: "Ils savent précisément pourquoi ils le font",
    body: (
      <>
        <p>
          La motivation du premier jour ne tient jamais toute seule sur la
          durée. Au quatrième mois de préparation, « je veux réussir » ne
          suffit plus à se lever tôt un dimanche pour réviser.
        </p>
        <p className="mt-3">
          Les candidats qui tiennent ont un point commun : leur objectif est
          concret, presque palpable. Ils ne préparent pas un examen abstrait.
          Ils préparent une vie. Reprendre une médecine choisie plutôt que
          subie. Offrir une stabilité à leur famille. En finir avec la
          précarité administrative. Rejoindre des proches, ou les faire venir.
          Ce « pourquoi » profond agit comme un moteur de réserve, celui qui
          se déclenche exactement quand la motivation de surface
          s&rsquo;épuise.
        </p>
        <p className="mt-3">
          Le réflexe des lauréats, c&rsquo;est de garder ce pourquoi visible.
          Une note sur le bureau, une image, une phrase. Quelque chose qui
          rappelle, dans les moments de doute, que l&rsquo;effort du jour sert
          un projet beaucoup plus grand que la révision du jour. Ce
          n&rsquo;est pas un détail de développement personnel. On a vu des
          candidats continuer à réviser sans relâche alors que le nombre de
          postes de leur voie venait d&rsquo;être divisé par trois, là où
          d&rsquo;autres ont baissé les bras à la même nouvelle. La différence
          entre les deux ne tenait pas à leur niveau, mais à la solidité de
          leur motivation profonde. C&rsquo;est ce qui sépare l&rsquo;abandon
          en novembre de la présence à l&rsquo;épreuve.
        </p>
      </>
    ),
  },
  {
    n: 2,
    id: 'decouper-etapes',
    short: "Ils transforment une montagne en marches",
    Icon: Target,
    title: "Ils transforment une montagne en marches",
    body: (
      <>
        <p>
          Quand on regarde l&rsquo;ensemble du programme des EVC d&rsquo;un
          coup, c&rsquo;est écrasant. Et un objectif écrasant paralyse plus
          qu&rsquo;il ne motive.
        </p>
        <p className="mt-3">
          Ceux qui réussissent ne se laissent pas submerger par
          l&rsquo;immensité de la tâche, parce qu&rsquo;ils ne la regardent
          jamais en entier. Ils la découpent. Un objectif pour le mois, un
          pour la semaine, un pour la séance du jour. Du coup, chaque journée
          a une cible atteignable, et chaque cible atteinte produit un petit
          sentiment de victoire. Ces micro-réussites, mises bout à bout,
          entretiennent la dynamique bien mieux qu&rsquo;une lointaine date
          d&rsquo;examen.
        </p>
        <p className="mt-3">
          Il y a là une mécanique psychologique simple mais puissante. On
          tient à un effort quand on voit qu&rsquo;il progresse. En se fixant
          des étapes courtes et visibles, le candidat se donne en permanence
          la preuve qu&rsquo;il avance. C&rsquo;est cette preuve, renouvelée
          chaque jour, qui nourrit la persévérance sur plusieurs mois.
        </p>
      </>
    ),
  },
  {
    n: 3,
    id: 'mauvais-jours',
    short: "Ils acceptent les mauvais jours sans dramatiser",
    Icon: Shield,
    title: "Ils acceptent les mauvais jours sans tout remettre en cause",
    body: (
      <>
        <p>
          Voici une différence subtile mais déterminante entre ceux qui
          craquent et ceux qui tiennent : leur réaction face à une mauvaise
          journée.
        </p>
        <p className="mt-3">
          Tout le monde a des jours sans. Une séance où rien ne rentre, un
          blanc total sur un sujet qu&rsquo;on croyait acquis, une fatigue qui
          rend la concentration impossible. Le candidat fragile interprète ces
          moments comme un signe d&rsquo;échec global. Il se dit qu&rsquo;il
          n&rsquo;y arrivera jamais, et ce découragement lui coûte parfois
          plusieurs jours de paralysie, voire fait tout dérailler.
        </p>
        <p className="mt-3">
          Le candidat qui réussit, lui, sait qu&rsquo;un mauvais jour
          n&rsquo;est qu&rsquo;un mauvais jour. Pas un verdict. Il
          l&rsquo;accepte, il referme ses livres sans dramatiser, et il
          recommence le lendemain. Cette capacité à ne pas s&rsquo;effondrer
          au premier obstacle, à reprendre après une chute, c&rsquo;est de la
          résilience pure. Et sur une préparation de plusieurs mois, la
          résilience compte autant que l&rsquo;intelligence.
        </p>
        <p className="mt-3">
          Le parcours du Dr Ahmed Sifaoui, lauréat EVC de gériatrie en voie
          externe, illustre bien cette mécanique. En pleine préparation, il
          apprend la réduction drastique des postes en voie externe. De son
          propre aveu, il en prend un coup au moral et se demande à plusieurs
          reprises si cela vaut encore la peine de continuer. Ce qui
          l&rsquo;a sauvé, dit-il en substance, c&rsquo;est d&rsquo;avoir
          déjà été engagé dans la préparation : les cours continuaient, un
          objectif restait à atteindre, et ce cadre l&rsquo;a aidé à
          « rester concentré malgré les doutes ». La structure a tenu là où
          la motivation seule aurait pu lâcher.
        </p>
        <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-bold"
          style={{ background: RED_SOFT, color: RED }}>
          <Brain className="h-4 w-4 shrink-0" />
          « Ce qui sépare souvent un admis d&rsquo;un recalé, ce n&rsquo;est
          pas la connaissance. C&rsquo;est la capacité à continuer quand la
          motivation baisse. »
        </div>
      </>
    ),
  },
  {
    n: 4,
    id: 'proteger-energie',
    short: "Ils protègent leur énergie",
    Icon: Battery,
    title: "Ils protègent leur énergie au lieu de la brûler",
    body: (
      <>
        <p>
          L&rsquo;erreur de beaucoup de candidats motivés, c&rsquo;est de
          tout donner trop vite. Des journées de douze heures les premières
          semaines, l&rsquo;enthousiasme du départ, puis l&rsquo;épuisement
          et le décrochage avant même d&rsquo;arriver à mi-parcours.
        </p>
        <p className="mt-3">
          Ceux qui vont au bout gèrent leur préparation comme une course de
          fond, pas comme un sprint. Une préparation aux EVC, c&rsquo;est
          souvent plusieurs centaines d&rsquo;heures de travail réparties sur
          de longs mois. À cette échelle, le rythme compte autant que
          l&rsquo;effort : celui qui part trop fort s&rsquo;éteint avant la
          ligne d&rsquo;arrivée. Ils savent que l&rsquo;endurance se
          construit en préservant son énergie. Ils dorment, parce qu&rsquo;un
          cerveau fatigué mémorise mal et raisonne lentement. Ils gardent des
          moments de coupure, parce qu&rsquo;un esprit qui ne se repose
          jamais finit par saturer. Ils maintiennent un minimum de vie à
          côté, parce que s&rsquo;enfermer totalement mène droit au burn-out.
        </p>
        <p className="mt-3">
          Ce n&rsquo;est pas de la paresse, c&rsquo;est de la stratégie. Un
          candidat reposé qui travaille trois heures avec une vraie
          concentration apprend davantage qu&rsquo;un candidat épuisé qui
          passe huit heures le regard dans le vide. Protéger son énergie,
          c&rsquo;est protéger sa capacité à durer jusqu&rsquo;au jour J.
        </p>
        <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-bold"
          style={{ background: RED_SOFT, color: RED }}>
          <Zap className="h-4 w-4 shrink-0" />
          « Vous n&rsquo;avez pas besoin d&rsquo;être le meilleur médecin.
          Vous devez être celui qui tient jusqu&rsquo;au bout. »
        </div>
      </>
    ),
  },
  {
    n: 5,
    id: 'apprivoiser-stress',
    short: "Ils apprivoisent le stress",
    Icon: Brain,
    title: "Ils apprivoisent le stress au lieu de le combattre",
    body: (
      <>
        <p>
          Le stress fait partie du jeu. Vouloir le supprimer complètement est
          une bataille perdue, et les candidats qui réussissent ne cherchent
          pas à le faire disparaître. Ils apprennent à vivre avec.
        </p>
        <p className="mt-3">
          Une partie du stress vient de l&rsquo;inconnu et de
          l&rsquo;anticipation : la peur de manquer de temps, la crainte du
          jour J, l&rsquo;angoisse de ne pas être prêt. Les lauréats
          désamorcent une bonne part de cette angoisse par la préparation
          elle-même. Plus on se sent prêt, moins on a peur. Le travail
          régulier n&rsquo;est donc pas seulement une question
          d&rsquo;apprentissage, c&rsquo;est aussi un puissant réducteur
          d&rsquo;anxiété. Chaque séance accomplie est une brique de
          confiance en plus.
        </p>
        <p className="mt-3">
          Ils savent aussi qu&rsquo;un certain niveau de stress est utile. Il
          aiguise l&rsquo;attention, mobilise les ressources. Le but
          n&rsquo;est pas le calme plat, mais un stress maîtrisé, qui pousse
          sans paralyser. Apprendre à reconnaître ce point d&rsquo;équilibre,
          à respirer, à se recentrer avant une échéance, fait partie de la
          préparation au même titre que les révisions.
        </p>
      </>
    ),
  },
  {
    n: 6,
    id: 'entourer',
    short: "Ils s'entourent au lieu de s'isoler",
    Icon: Users,
    title: "Ils s'entourent plutôt que de s'isoler dans le silence",
    body: (
      <>
        <p>
          La préparation aux EVC peut être solitaire, et cette solitude pèse
          lourd sur le moral, surtout pour les candidats loin de leurs proches
          ou récemment arrivés en France.
        </p>
        <p className="mt-3">
          Ceux qui tiennent ne traversent pas cette épreuve dans le silence
          complet. Ils gardent un lien, sous une forme ou une autre. Des
          proches au courant de ce qu&rsquo;ils vivent et qui les soutiennent.
          D&rsquo;autres candidats avec qui partager les doutes et les
          avancées. Un cadre qui rappelle qu&rsquo;on n&rsquo;est pas seul à
          ramer. Ce soutien moral ne change rien aux connaissances, mais il
          change tout à la capacité à tenir. Se sentir épaulé, savoir que
          quelqu&rsquo;un croit en vous et suit votre progression, ça allège
          énormément la charge mentale.
        </p>
        <p className="mt-3">
          Le Dr Sifaoui raconte ainsi avoir été entouré d&rsquo;amis, dont
          certains n&rsquo;étaient même pas médecins, qui prenaient le temps
          de l&rsquo;interroger sur ses fiches. Avec le recul, il a presque
          l&rsquo;impression qu&rsquo;ils ont « passé le concours » avec lui,
          tant ils se sont investis. Ce genre de soutien ne fait pas gagner de
          points directement, mais il porte un candidat dans les moments où,
          seul, il aurait flanché.
        </p>
        <p className="mt-3">
          C&rsquo;est aussi pour ça qu&rsquo;un accompagnement structuré fait
          souvent la différence, bien au-delà du contenu pédagogique. Il rompt
          l&rsquo;isolement, donne un rythme, et maintient la flamme dans les
          moments où, seul, on l&rsquo;aurait laissée s&rsquo;éteindre.
        </p>
      </>
    ),
  },
  {
    n: 7,
    id: 'resume',
    short: "En résumé : le mental des candidats qui réussissent",
    Icon: CheckCircle2,
    title: "En résumé : le mental des candidats qui réussissent",
    body: (
      <>
        <p>
          La préparation aux EVC est autant un marathon psychologique
          qu&rsquo;un défi intellectuel. Les candidats qui vont au bout sont
          presque toujours ceux qui :
        </p>
        <ul className="mt-3 space-y-2">
          {[
            "gardent leur « pourquoi » profond bien visible pour tenir dans la durée ;",
            "découpent l'objectif en étapes courtes et atteignables ;",
            "acceptent les mauvais jours sans tout remettre en question ;",
            "gèrent leur énergie comme une course de fond, pas un sprint ;",
            "apprivoisent le stress au lieu de vouloir l'éliminer ;",
            "s'entourent plutôt que de s'enfermer dans le silence.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          Aucune de ces qualités n&rsquo;est innée. Le mental, comme la
          méthode, ça se construit et ça s&rsquo;entretient.
        </p>
      </>
    ),
  },
  {
    n: 8,
    id: 'methode-mental',
    short: "Le mental ne remplace pas la méthode, il la porte",
    Icon: Lightbulb,
    title: "Le mental ne remplace pas la méthode, il la porte",
    body: (
      <>
        <p>
          Soyons clairs : tenir bon ne suffit pas à réussir les EVC. La force
          mentale ne remplace ni les connaissances, ni la méthode de réponse,
          ni l&rsquo;entraînement. Mais elle est ce qui vous permet
          d&rsquo;aller au bout de tout le reste.
        </p>
        <p className="mt-3">
          On peut avoir la meilleure méthode du monde : si on abandonne en
          cours de route, ou si on arrive épuisé et paralysé par le stress le
          jour J, elle ne sert à rien. Le mental, c&rsquo;est le socle sur
          lequel repose tout le travail. Les candidats qui réussissent
          l&rsquo;ont compris, et ils le travaillent avec autant de sérieux
          que leurs cours.
        </p>
        <p className="mt-3">
          Vous n&rsquo;avez pas besoin d&rsquo;être le meilleur médecin pour
          réussir les EVC. Vous devez être le candidat le mieux préparé, dans
          la tête comme dans les connaissances.
        </p>
        <p className="mt-3">
          C&rsquo;est d&rsquo;ailleurs, en substance, le conseil que le Dr
          Sifaoui adresse aux futurs candidats : rester concentré sur son
          objectif, travailler avec régularité, et ne pas se laisser
          décourager par ce qu&rsquo;on peut lire ou entendre autour de soi.
          Un conseil qui résume assez bien l&rsquo;état d&rsquo;esprit de ceux
          qui vont au bout.
        </p>
      </>
    ),
  },
  {
    n: 9,
    id: 'commencer',
    short: "Construire une préparation qui tient",
    Icon: BookOpen,
    title: "Construire une préparation qui tient sur la durée",
    body: (
      <>
        <p>
          Un mental solide se nourrit aussi d&rsquo;une préparation bien
          structurée. Quand on sait où on va, qu&rsquo;on a un plan clair et
          qu&rsquo;on mesure ses progrès, on doute beaucoup moins.
        </p>
        <p className="mt-3">
          On a réuni cette structure dans le{' '}
          <Link href="/guide-methodologie-evc-2026" className="font-semibold underline" style={{ color: RED }}>
            Guide Méthodologie EVC 2026
          </Link>
          , gratuit. En 39 pages, il pose une méthode claire pour répondre à
          chaque type de question, les pièges à éviter, les erreurs qui
          coûtent le plus de points, un planning de préparation pour étaler
          votre travail sans vous épuiser, et une check-list pour aborder le
          jour J avec sérénité. De quoi avancer avec un cap, et donc avec
          moins d&rsquo;angoisse.
        </p>
        <p className="mt-4 font-bold" style={{ color: INK }}>
          C&rsquo;est le point de départ d&rsquo;une préparation qu&rsquo;on
          tient jusqu&rsquo;au bout.
        </p>
        <Link href="/guide-methodologie-evc-2026"
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-bold text-white"
          style={{ background: RED }}>
          <Download className="h-4 w-4" /> Télécharger gratuitement le Guide
        </Link>
      </>
    ),
  },
  {
    n: 10,
    id: 'accompagnement',
    short: "Aller plus loin avec Major ECN",
    Icon: GraduationCap,
    title: "Vous souhaitez aller plus loin ? Découvrir Major ECN",
    body: (
      <>
        <p>
          Le guide vous montre le chemin. Major ECN vous accompagne
          jusqu&rsquo;à la réussite.
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
          Vous y trouvez ce que la préparation en solitaire ne peut pas
          offrir : des contenus à jour pour chaque spécialité, des
          entraînements ciblés en voie interne comme en voie externe, des
          examens blancs en conditions réelles, des corrections qui pointent
          vos angles morts, et un suivi qui mesure votre progression
          jusqu&rsquo;au jour de l&rsquo;épreuve.
        </p>
      </>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "Comment rester motivé pendant toute la préparation aux EVC ?",
    a: "En gardant un objectif concret et visible, et en découpant la préparation en étapes courtes. La motivation de départ s'épuise toujours ; ce qui tient sur la durée, c'est un « pourquoi » profond bien ancré et des petites victoires régulières qui entretiennent la dynamique.",
  },
  {
    q: "Comment gérer le stress avant les EVC ?",
    a: "Le stress se réduit surtout par la préparation : plus on se sent prêt, moins on a peur. Un travail régulier, des objectifs atteints et un peu d'entraînement aux conditions de l'épreuve transforment l'angoisse de l'inconnu en confiance. L'idée n'est pas de supprimer le stress, mais de le maintenir à un niveau qui stimule sans paralyser.",
  },
  {
    q: "Comment éviter l'épuisement pendant une préparation longue ?",
    a: "En traitant la préparation comme une course de fond. Dormir suffisamment, garder des coupures, préserver un minimum de vie personnelle et viser une concentration de qualité plutôt qu'un volume d'heures. Un candidat reposé apprend mieux qu'un candidat épuisé.",
  },
  {
    q: "Le mental compte-t-il vraiment dans la réussite aux EVC ?",
    a: "Oui. À connaissances et méthode comparables, la capacité à tenir sur plusieurs mois, à encaisser les mauvais jours et à gérer la pression fait souvent la différence entre ceux qui vont au bout et ceux qui décrochent. Le mental ne remplace pas le travail, mais il permet de le mener à terme.",
  },
];

export function ArticleMentalEvc({ article }: { article: BlogArticleMeta }) {
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
              La méthode que suivent les candidats qui réussissent aux EVC
            </h1>
            <h2 className="mt-1 text-[22px] font-extrabold leading-snug sm:text-[26px]"
              style={{ color: RED }}>
              Gérer le stress et tenir jusqu&rsquo;au bout
            </h2>

            <p className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
              style={{ color: INK_MUTED }}>
              <Clock className="h-3.5 w-3.5" /> Temps de lecture : {article.readingMinutes} minutes
            </p>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              26 mars 2026, midi. Les résultats des Épreuves de Vérification
              des Connaissances viennent de tomber. Depuis plusieurs minutes,
              un médecin fixe son écran sans bouger. Il fait défiler la liste
              une deuxième fois, une troisième. Son nom n&rsquo;y est pas. À
              quelques kilomètres de là, un autre candidat, moins expérimenté
              que lui, vient de voir le sien apparaître.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Pendant quinze ans, on a vu cette scène se rejouer à chaque
              session. Et à force d&rsquo;accompagner plus de 9 000 médecins
              vers les EVC, on a fini par comprendre une chose : ce qui sépare
              les deux, ce n&rsquo;est presque jamais le niveau médical.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Cet article ne parle donc pas de QCM ni de dossiers cliniques.
              Il parle de l&rsquo;autre moitié de la préparation, celle dont
              presque personne ne parle : <strong>le mental</strong>. Et de la
              façon dont les candidats qui réussissent le gèrent, parfois sans
              même s&rsquo;en rendre compte.
            </p>

            <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-bold"
              style={{ background: RED_SOFT, color: RED }}>
              <Brain className="h-4 w-4 shrink-0" />
              Le mental — ce qui sépare les candidats qui abandonnent de ceux
              qui réussissent.
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
                src="/blog/medecin-mental-evc.webp"
                alt="Médecin en blouse dans un couloir d'hôpital — le mental, ce qui sépare les candidats qui abandonnent de ceux qui réussissent"
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
                <Brain className="h-3 w-3" style={{ color: RED }} />
                Le mental : la clé invisible de la réussite
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

export const _UNUSED = { Sparkles, Timer, Trophy };
