/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BookOpen, Brain, CheckCircle2, Clock,
  ClipboardCheck, ClipboardList, Download, FileText, GraduationCap,
  Layers3, Lightbulb, Play, Quote, Shield, Sparkles, Target,
  Timer, Trophy, UserX, Users, type LucideIcon,
} from 'lucide-react';
import { ARTICLE_FONT } from '../article-shell';
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
    id: 'enjeu',
    short: 'Derrière chaque échec, bien plus qu’un concours',
    Icon: UserX,
    title: 'Derrière chaque échec, il y a bien plus qu’un concours',
    body: (
      <p>
        Avant de parler méthode, il faut dire ce qui se joue réellement. Un
        échec aux EVC, ce n&rsquo;est pas une ligne en moins sur un CV. Derrière
        un nom absent de la liste, il y a souvent plusieurs années de
        préparation. Une famille restée au pays qui attend de pouvoir se
        réunir. Une carrière mise sur pause, parfois à des milliers de
        kilomètres. Des projets de vie entiers qui restent suspendus à un
        résultat. Pour beaucoup de médecins à diplôme étranger, les EVC ne
        sont pas un examen de plus. C&rsquo;est la possibilité de reprendre
        enfin le métier pour lequel ils se sont battus, et de retrouver une
        vie normale. C&rsquo;est justement parce que l&rsquo;enjeu est aussi
        lourd qu&rsquo;on ne peut pas se permettre de laisser une mauvaise
        stratégie décider à notre place.
      </p>
    ),
  },
  {
    n: 2,
    id: 'malentendu',
    short: 'La première cause d’échec : un malentendu sur l’épreuve',
    Icon: AlertTriangle,
    title: 'La première cause d’échec n’est pas le niveau, c’est un malentendu sur l’épreuve',
    body: (
      <>
        <p>
          Beaucoup de candidats arrivent avec une idée fausse de ce qu&rsquo;on
          attend d&rsquo;eux. Ils pensent passer un examen de médecine. Ils
          passent en fait un examen de méthode appliquée à la médecine. Ce
          n&rsquo;est pas la même chose, et la nuance coûte cher.
        </p>
        <p className="mt-3">
          La voie interne et la voie externe ne se jouent même pas sur le même
          terrain. En voie interne, ce sont des QCM, des QRU et des QRM, où un
          mot mal lu, une négation cachée dans l&rsquo;énoncé ou une
          proposition à moitié vraie peuvent vous faire perdre tous les points
          d&rsquo;une question d&rsquo;un coup. En voie externe, avec les
          épreuves EVCF et EVCP, c&rsquo;est presque l&rsquo;inverse : on
          attend une copie construite, hiérarchisée, qui montre un
          raisonnement clinique. Deux logiques opposées. Deux entraînements à
          mener séparément.
        </p>
        <p className="mt-3">
          Préparer les deux de la même manière, c&rsquo;est partir avec un
          handicap dès le départ. Et c&rsquo;est pourtant ce que font la
          plupart des candidats qui avancent seuls. C&rsquo;est d&rsquo;ailleurs
          l&rsquo;un des{' '}
          <Link href="/blog/decryptage-defis-evc" className="font-semibold underline" style={{ color: RED }}>
            cinq grands obstacles
          </Link>{' '}
          qu&rsquo;on a détaillés dans notre analyse.
        </p>
      </>
    ),
  },
  {
    n: 3,
    id: 'supports',
    short: 'L’erreur silencieuse : réviser sur les mauvais supports',
    Icon: FileText,
    title: 'L’erreur silencieuse : réviser sur des supports qui ne visent pas le bon concours',
    body: (
      <>
        <p>
          Voilà un piège que personne ne voit venir, parce qu&rsquo;il donne
          l&rsquo;impression de bien travailler. Vous révisez des heures, vous
          faites des fiches, vous avancez dans un gros manuel. Et depuis le
          début, vous visez à côté.
        </p>
        <p className="mt-3">
          Une bonne partie des supports qui circulent ont été pensés pour
          l&rsquo;internat français. Pour des externes de vingt-trois ans qui
          passent un autre concours, avec d&rsquo;autres attendus. Certains
          datent d&rsquo;il y a dix ans. Les recommandations ont changé depuis,
          les pratiques aussi, et il arrive même que des corrigés d&rsquo;annales
          qui passent de main en main contiennent des réponses fausses. Vous
          mémorisez alors une erreur en étant convaincu que c&rsquo;est la
          bonne réponse. Le jour de l&rsquo;épreuve, cette certitude se
          retourne contre vous.
        </p>
        <p className="mt-3">
          La règle tient en une phrase : un support qui n&rsquo;a pas été conçu
          pour les EVC et la PAE, ce n&rsquo;est pas un raccourci, c&rsquo;est
          un détour. Mieux vaut moins de matériel, mais du juste, du récent,
          validé par des praticiens qui connaissent vraiment ce concours.
        </p>
      </>
    ),
  },
  {
    n: 4,
    id: 'temps',
    short: 'Le temps : l’adversaire découvert trop tard',
    Icon: Timer,
    title: 'Le temps : l’adversaire que beaucoup découvrent trop tard',
    body: (
      <>
        <p>
          On parle beaucoup des connaissances, et presque jamais de la montre.
          Pourtant, le jour J, le chrono élimine autant de monde que les
          lacunes.
        </p>
        <p className="mt-3">
          En QCM, un candidat qui n&rsquo;a jamais travaillé son rythme
          s&rsquo;enlise sur les premières questions, voit le temps filer,
          commence à paniquer, et finit par bâcler la fin, là où se trouvaient
          peut-être ses points les plus faciles. En épreuve rédactionnelle,
          celui qui n&rsquo;a pas l&rsquo;habitude de structurer vite passe
          vingt minutes à chercher son plan au lieu de l&rsquo;écrire. La
          gestion du temps, ce n&rsquo;est pas un détail d&rsquo;organisation.
          C&rsquo;est une compétence à part entière, qui ne s&rsquo;improvise
          pas, et qui se travaille bien avant l&rsquo;examen, chrono en main.
        </p>
        <p className="mt-3">
          Si vous n&rsquo;avez pas reproduit les conditions réelles avant le
          jour J, c&rsquo;est le jour J que vous les découvrirez. Le pire
          moment pour ça.
        </p>
      </>
    ),
  },
  {
    n: 5,
    id: 'isolement',
    short: 'L’isolement, ce multiplicateur d’erreurs',
    Icon: Shield,
    title: 'L’isolement, ce multiplicateur d’erreurs',
    body: (
      <>
        <p>
          Travailler seul a un coût caché. Quand personne ne relit vos
          réponses, vos erreurs deviennent invisibles à vos propres yeux. Vous
          répétez les mêmes maladresses de raisonnement, vous croyez maîtriser
          un thème que vous avez compris de travers, et rien ne vient corriger
          le tir. On peut accumuler des centaines d&rsquo;heures de travail
          dans la mauvaise direction sans s&rsquo;en apercevoir.
        </p>
        <p className="mt-3">
          Un regard extérieur, ça change tout. Pas pour vous tenir la main,
          mais pour vous dire ce que vous ne pouvez pas voir tout seul. Que
          votre plan de réponse oublie systématiquement l&rsquo;urgence vitale.
          Que vous tombez toujours dans le même genre de piège en QRM. Que
          votre gestion du temps tient sur deux questions mais s&rsquo;écroule
          sur la troisième. Ces ajustements-là, très précis, sont presque
          impossibles à faire en solo. Et ce sont souvent eux qui font
          basculer un résultat.
        </p>
        <p className="mt-3">
          C&rsquo;est aussi pour ça que la régularité tient mieux quand on
          n&rsquo;est pas seul. Tout seul, on lâche au bout de quelques
          semaines. Encadré, on s&rsquo;accroche. Les{' '}
          <Link href="/blog/comment-reussir-les-evc-conseils-laureats" className="font-semibold underline" style={{ color: RED }}>
            conseils que les lauréats auraient aimé connaître plus tôt
          </Link>{' '}
          reviennent presque tous, d&rsquo;une façon ou d&rsquo;une autre, à
          ce constat.
        </p>
      </>
    ),
  },
  {
    n: 6,
    id: 'laureats',
    short: 'Ce qui sépare vraiment ceux qui réussissent',
    Icon: Trophy,
    title: 'Ce qui sépare vraiment ceux qui réussissent',
    body: (
      <>
        <p>
          Si on devait résumer tout ça, voici ce que les lauréats ont compris
          et que les autres saisissent trop tard.
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            'Ils ont arrêté de voir les EVC comme un test de connaissances pour les aborder comme un exercice de méthode.',
            'Ils ont préparé la voie interne et la voie externe séparément, parce que ce sont deux exercices différents.',
            'Ils se sont entraînés en conditions réelles, chrono en main, jusqu’à ce que le format ne leur réserve plus aucune surprise.',
            'Ils ont analysé leurs erreurs au lieu de les éviter.',
            'La plupart ne sont pas restés seuls : ils se sont appuyés sur un cadre, une méthode, des retours réguliers.',
          ].map((it) => (
            <li key={it} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RED }} />
              {it}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: 7,
    id: 'cle',
    short: 'Les EVC récompensent les mieux préparés',
    Icon: Target,
    title: 'Les EVC ne récompensent pas les meilleurs médecins',
    body: (
      <>
        <p>
          Cette idée mérite qu&rsquo;on s&rsquo;y arrête une seconde, parce
          qu&rsquo;elle résume tout :
        </p>
        <div className="mt-4 rounded-xl border-l-4 py-3 pl-4 pr-3" style={{ borderColor: RED, background: RED_SOFT }}>
          <p className="text-[14px] font-bold italic" style={{ color: RED }}>
            « Les EVC ne récompensent pas les meilleurs médecins. Elles
            récompensent les candidats qui ont compris les règles du jeu. »
          </p>
        </div>
        <p className="mt-4">
          Et si on le dit encore plus simplement : vous n&rsquo;avez pas
          besoin d&rsquo;être le meilleur médecin pour réussir les EVC. Vous
          devez être le candidat le mieux préparé. Aucun de ces leviers ne
          demande un don particulier. Ils demandent une bonne stratégie,
          posée tôt. Et c&rsquo;est précisément ce qui manque à ceux qui
          échouent malgré un excellent niveau.
        </p>
      </>
    ),
  },
  {
    n: 8,
    id: 'resume',
    short: 'En résumé : ce que font les candidats qui réussissent',
    Icon: Lightbulb,
    title: 'En résumé : ce que font les candidats qui réussissent',
    body: (
      <>
        <p>
          Avant de passer à l&rsquo;action, gardez en tête ce que les
          lauréats ont en commun. Ceux qui décrochent leur autorisation
          d&rsquo;exercice sont presque toujours ceux qui :
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            'comprennent précisément ce que le jury attend, en voie interne comme en voie externe ;',
            'travaillent avec une méthode, pas seulement avec des connaissances ;',
            's’entraînent dans les conditions réelles de l’examen, chrono en main ;',
            'analysent leurs erreurs pour ne plus les refaire ;',
            'révisent sur des supports pensés pour les EVC, à jour des recommandations.',
          ].map((it) => (
            <li key={it} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#16793C' }} />
              {it}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: 9,
    id: 'commencer',
    short: 'Par où commencer concrètement',
    Icon: BookOpen,
    title: 'Par où commencer concrètement',
    body: (
      <>
        <p>
          La méthode ne s&rsquo;invente pas la veille de l&rsquo;épreuve. Elle
          se construit. Et plus vous posez les bonnes bases tôt, plus le
          chemin est court.
        </p>
        <p className="mt-3">
          Pour partir dans la bonne direction sans perdre de temps, on a réuni
          l&rsquo;essentiel dans un document gratuit : le{' '}
          <strong>Guide Méthodologie EVC 2026</strong>. En 39 pages, il passe
          en revue les quatre familles de questions et la façon d&rsquo;y
          répondre, les pièges du QCM en voie interne comme ceux de la copie
          rédigée en voie externe, les six erreurs qui coûtent le plus de
          points, un planning de préparation, et une check-list à parcourir
          avant le jour J. Avec des exemples concrets tirés des vraies
          épreuves.
        </p>
        <p className="mt-3 font-semibold" style={{ color: INK }}>
          C&rsquo;est le bon point de départ pour arrêter de réviser à
          l&rsquo;aveugle.
        </p>
      </>
    ),
  },
  {
    n: 10,
    id: 'accompagnement',
    short: 'Aller jusqu’au bout : la préparation Major ECN',
    Icon: GraduationCap,
    title: 'Aller jusqu’au bout : la préparation Major ECN',
    body: (
      <>
        <p>
          Un guide vous donne la carte. Reste à faire le trajet, et
          c&rsquo;est là que l&rsquo;accompagnement change la donne.
        </p>
        <p className="mt-3">
          Depuis plus de quinze ans, on voit les mêmes erreurs revenir,
          session après session. La confusion entre savoir et méthode.
          L&rsquo;entraînement sur de mauvais supports. La découverte du
          chrono le jour J. L&rsquo;isolement qui fait dévier sans
          qu&rsquo;on s&rsquo;en rende compte. Ce sont ces erreurs-là,
          observées auprès de plus de 9 000 médecins accompagnés, qui
          nous ont poussés à construire une méthode entièrement dédiée
          aux EVC.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { Icon: Play,           t: 'Cours enregistrés' },
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

export function ArticleEchecEvc({ article }: { article: BlogArticleMeta }) {
  return (
    <main style={{ fontFamily: ARTICLE_FONT, background: BG_PAGE }}>
      <ArticleBrandHeader />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20">

        {/* ============ HERO ============ */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div>
            <span className="inline-flex items-center rounded-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white"
              style={{ background: RED }}>
              Blog
            </span>
            <h1 className="mt-4 text-[28px] font-black leading-[1.08] tracking-tight sm:text-[36px] lg:text-[40px]"
              style={{ color: INK }}>
              Pourquoi des médecins excellents échouent aux EVC
            </h1>
            <h2 className="mt-1 text-[22px] font-extrabold leading-snug sm:text-[26px]"
              style={{ color: RED }}>
              (et comment ne pas en faire partie)
            </h2>

            <p className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
              style={{ color: INK_MUTED }}>
              <Clock className="h-3.5 w-3.5" /> Temps de lecture : {article.readingMinutes} minutes
            </p>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Il y a une scène qui revient à chaque session des Épreuves de
              Vérification des Connaissances. Un médecin avec quinze ans de
              bloc derrière lui, des centaines de gardes, une vraie réputation
              dans son pays, sort de l&rsquo;épreuve en se disant que ça
              s&rsquo;est bien passé. Quelques semaines plus tard, la liste
              du CNG tombe. Son nom n&rsquo;y est pas.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Et à côté de lui, un confrère beaucoup plus jeune, à peine
              sorti de l&rsquo;internat, a réussi. Comment c&rsquo;est
              possible ?
            </p>

            <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-bold"
              style={{ background: RED_SOFT, color: RED }}>
              <Brain className="h-4 w-4 shrink-0" />
              Les EVC ne mesurent pas ce que vous savez — elles mesurent
              votre capacité à le restituer.
            </div>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Avant la réforme de mai 2025, le taux de réussite moyen
              tournait autour de 15 %. Depuis que la voie externe a été
              isolée, on est plutôt autour de <strong>10 %</strong>. Neuf
              candidats sur dix repartent sans leur autorisation
              d&rsquo;exercice. Et le niveau médical, à lui seul,
              n&rsquo;explique pas qui se retrouve dans les 10 % qui passent.
            </p>
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
                src="/blog/medecin-fenetre-echec-evc.webp"
                alt="Médecin regardant par la fenêtre — pourquoi des médecins excellents échouent aux EVC"
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
                <AlertTriangle className="h-3 w-3" style={{ color: RED }} />
                Taux de réussite voie externe : ~10 %
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

export const _UNUSED = { Sparkles };
