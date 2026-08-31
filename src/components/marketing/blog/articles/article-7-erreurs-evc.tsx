/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Clock, ClipboardCheck,
  ClipboardList, Compass, Download, FileText, GraduationCap, Layers3,
  Lightbulb, ListOrdered, Play, Quote, Search, Sparkles, Target,
  Timer, Trophy, Users, UserX, type LucideIcon,
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
    id: 'cadrage',
    short: 'Préparer voie interne et externe comme un même concours',
    Icon: Compass,
    title: "Erreur n°1 : préparer la voie interne et la voie externe comme si c'était le même concours",
    body: (
      <>
        <p>
          C&rsquo;est l&rsquo;erreur de cadrage initiale, et elle empoisonne
          tout le reste de la préparation.
        </p>
        <p className="mt-3">
          Depuis la réforme, les deux voies n&rsquo;ont presque plus rien en
          commun dans leur format. La voie interne, c&rsquo;est une seule
          épreuve de QCM. La voie externe, c&rsquo;est deux épreuves :
          l&rsquo;EVCF en questions à réponses courtes, et l&rsquo;EVCP en
          dossiers cliniques progressifs. Or un QCM et un dossier clinique ne
          récompensent pas du tout les mêmes réflexes. Le QCM sanctionne
          l&rsquo;imprécision et récompense la rapidité de décision. Le
          dossier progressif récompense la construction, la hiérarchisation,
          la capacité à dérouler un raisonnement.
        </p>
        <p className="mt-3">
          Un candidat qui s&rsquo;entraîne uniquement sur des dossiers et se
          retrouve en QCM va se faire piéger sur la précision. Celui qui ne
          fait que du QCM et bascule en rédactionnel va rendre une copie en
          vrac. Avant même d&rsquo;ouvrir un cours, il faut savoir quelle
          voie on prépare, et caler son entraînement dessus. C&rsquo;est une
          décision stratégique, pas un détail. Et elle dépend de votre
          éligibilité : pour savoir laquelle vous concerne, notre{' '}
          <Link href="/blog/comment-se-presenter-aux-evc" className="font-semibold underline" style={{ color: RED }}>
            guide sur comment s&rsquo;inscrire aux EVC
          </Link>{' '}
          détaille les conditions de chaque voie.
        </p>
      </>
    ),
  },
  {
    n: 2,
    id: 'negation',
    short: 'Lire les QCM trop vite et tomber dans le piège',
    Icon: Search,
    title: 'Erreur n°2 : lire les QCM trop vite et tomber dans le piège de la négation',
    body: (
      <>
        <p>
          En voie interne, la lecture est une compétence à part entière. On ne
          le croit pas tant qu&rsquo;on ne s&rsquo;est pas fait avoir.
        </p>
        <p className="mt-3">
          Le piège classique, c&rsquo;est la question formulée à la négative.
          Prenez un énoncé du type :
        </p>
        <div className="mt-3 rounded-xl border-l-4 py-3 pl-4 pr-3" style={{ borderColor: RED, background: RED_SOFT }}>
          <p className="text-[13px] font-semibold italic" style={{ color: INK }}>
            « Parmi les propositions suivantes, laquelle est FAUSSE ? »
          </p>
        </div>
        <p className="mt-3">
          Un candidat pressé lit « parmi les propositions suivantes,
          laquelle est… », son cerveau complète automatiquement « vraie »,
          et il coche une proposition correcte. La réponse est juste sur le
          fond, fausse dans le contexte de la question. Point perdu, alors
          que la connaissance était parfaitement là.
        </p>
        <p className="mt-3">
          Il y a aussi les doubles négations, les « jamais », les
          « toujours », les « sauf », ces petits mots qui retournent
          complètement le sens d&rsquo;un item. En QCM, la moitié du
          travail consiste à lire l&rsquo;énoncé comme un piège potentiel,
          pas comme une évidence. Le réflexe à installer : relire chaque
          question une seconde fois, et repérer activement le mot qui
          pourrait tout faire basculer.
        </p>
      </>
    ),
  },
  {
    n: 3,
    id: 'urgence-vitale',
    short: "Oublier l'urgence vitale dans les dossiers cliniques",
    Icon: AlertTriangle,
    title: "Erreur n°3 : oublier l'urgence vitale dans les dossiers cliniques",
    body: (
      <>
        <p>
          En voie externe, sur un dossier progressif, c&rsquo;est
          l&rsquo;erreur qui fait le plus mal. Parce qu&rsquo;elle ne coûte
          pas un point, elle en coûte plusieurs d&rsquo;un coup, et elle
          envoie un très mauvais signal au jury.
        </p>
        <p className="mt-3">
          Le scénario est presque toujours le même. Prenez un dossier qui
          s&rsquo;ouvre sur un patient polytraumatisé arrivant aux urgences.
          Le candidat se jette sur le diagnostic lésionnel, déroule sa prise
          en charge, détaille les examens d&rsquo;imagerie. Tout est juste.
          Sauf qu&rsquo;il a oublié de mentionner, en premier,
          qu&rsquo;il fallait évaluer les fonctions vitales et stabiliser le
          patient avant tout le reste.
        </p>
        <p className="mt-3">
          Devant une détresse, on sécurise avant de réfléchir à la suite. Un
          correcteur qui voit un raisonnement brillant mais qui ne commence
          pas par l&rsquo;urgence se dit qu&rsquo;il a affaire à
          quelqu&rsquo;un qui sait beaucoup de choses, mais qui ne
          hiérarchise pas comme un médecin doit le faire.
        </p>
        <p className="mt-3 font-semibold" style={{ color: INK }}>
          La parade tient en un réflexe : sur chaque dossier, avant de
          répondre, se demander s&rsquo;il existe un risque immédiat à
          écarter. Si oui, il passe en tête. Toujours.
        </p>
      </>
    ),
  },
  {
    n: 4,
    id: 'desordre',
    short: 'Répondre juste, mais en désordre',
    Icon: ListOrdered,
    title: 'Erreur n°4 : répondre juste, mais en désordre',
    body: (
      <>
        <p>
          Voilà une erreur qu&rsquo;on sous-estime énormément, surtout quand
          on a un bon niveau.
        </p>
        <p className="mt-3">
          Beaucoup de candidats pensent qu&rsquo;un correcteur va chercher
          les bonnes idées partout dans la copie et les compter, peu importe
          où elles se trouvent. En réalité, une copie qui part dans tous les
          sens fatigue le lecteur, et un lecteur fatigué passe à côté de
          choses. Si votre réponse mélange diagnostic, traitement et
          surveillance dans le même paragraphe touffu, le correcteur doit
          faire le tri à votre place. Et il ne le fera pas toujours en votre
          faveur.
        </p>
        <p className="mt-3">
          Une réponse qui rapporte des points, c&rsquo;est une réponse
          qu&rsquo;on peut noter facilement. Structurée, hiérarchisée, avec
          les mots-clés visibles, organisée selon une logique claire que le
          jury attend. Les grilles de correction des EVC ne sont pas
          publiques, mais elles fonctionnent par items attendus. Plus votre
          copie épouse cette logique, plus chaque point se coche tout seul.
          La forme n&rsquo;est pas de la cosmétique. C&rsquo;est ce qui rend
          vos connaissances lisibles.
        </p>
      </>
    ),
  },
  {
    n: 5,
    id: 'supports',
    short: 'Réviser sur des supports qui ne visent pas le bon niveau',
    Icon: FileText,
    title: 'Erreur n°5 : réviser sur des supports qui ne visent pas le bon niveau',
    body: (
      <>
        <p>
          Celle-ci est sournoise, parce qu&rsquo;elle donne l&rsquo;impression
          de bien travailler tout en sabotant la préparation en silence.
        </p>
        <p className="mt-3">
          Une grande partie des ressources qui circulent ont été pensées pour
          l&rsquo;internat français, pour des externes en sixième année. Le
          niveau visé n&rsquo;est pas celui d&rsquo;un médecin thésé qui
          passe les EVC. Vous révisez consciencieusement, mais sur une cible
          trop basse, et vous arrivez le jour J avec un calibrage
          d&rsquo;étudiant face à des attentes de senior.
        </p>
        <p className="mt-3">
          À l&rsquo;inverse, certains manuels d&rsquo;internat datent de dix
          ans, et les recommandations ont bougé depuis. Vous mémorisez alors
          une réponse devenue fausse. Le pire, ce sont les annales qui
          passent de main en main avec des corrigés non vérifiés. Vous
          apprenez une erreur en étant convaincu que c&rsquo;est la bonne
          réponse.
        </p>
        <p className="mt-3">
          Le filtre est simple : un support fiable, c&rsquo;est un support
          conçu pour les EVC, à jour des recommandations HAS et des sociétés
          savantes, et corrigé par des gens qui connaissent le concours. Le
          reste, c&rsquo;est du temps perdu déguisé en travail.
        </p>
      </>
    ),
  },
  {
    n: 6,
    id: 'temps',
    short: "Découvrir la gestion du temps le jour de l'épreuve",
    Icon: Timer,
    title: "Erreur n°6 : découvrir la gestion du temps le jour de l'épreuve",
    body: (
      <>
        <p>
          On révise des mois sans jamais sortir un chronomètre, et on
          découvre la contrainte de temps au pire moment possible : pendant
          l&rsquo;examen.
        </p>
        <p className="mt-3">
          Le format ne pardonne pas l&rsquo;improvisation. En QCM, avec une
          cadence d&rsquo;environ une minute par question, si vous passez
          trois minutes sur une seule question difficile, vous venez
          d&rsquo;emprunter le temps de deux autres questions, souvent plus
          faciles, que vous traiterez à toute vitesse en fin d&rsquo;épreuve.
          Celui qui s&rsquo;attarde sur les premières se retrouve à courir
          sur les dernières, là où se cachaient peut-être ses points les plus
          accessibles. En épreuve rédactionnelle, deux heures passent vite,
          et le candidat qui n&rsquo;a pas l&rsquo;habitude de structurer
          rapidement gaspille un quart d&rsquo;heure à chercher son plan au
          lieu de l&rsquo;écrire.
        </p>
        <p className="mt-3">
          La gestion du temps n&rsquo;est pas un trait de caractère,
          c&rsquo;est une compétence qui se travaille. En conditions réelles,
          chrono lancé, sur des épreuves blanches complètes.
          L&rsquo;objectif, c&rsquo;est qu&rsquo;au jour J le rythme soit
          déjà un automatisme, et que la seule chose qui vous reste à gérer
          soit le contenu.
        </p>
      </>
    ),
  },
  {
    n: 7,
    id: 'seul',
    short: 'Travailler seul, sans jamais faire corriger ses réponses',
    Icon: UserX,
    title: 'Erreur n°7 : travailler seul, sans jamais faire corriger ses réponses',
    body: (
      <>
        <p>
          C&rsquo;est sans doute l&rsquo;erreur la plus invisible, parce
          qu&rsquo;elle ne se voit pas pendant qu&rsquo;on la commet. On la
          découvre seulement le jour des résultats.
        </p>
        <p className="mt-3">
          Quand personne ne relit vos réponses, vos angles morts restent des
          angles morts. Vous croyez maîtriser un thème que vous comprenez de
          travers. Vous refaites le même type de faute en QRM sans vous en
          apercevoir. Vous oubliez systématiquement la même rubrique dans
          vos dossiers, et comme rien ne vous le signale, l&rsquo;erreur
          s&rsquo;installe et devient une habitude.
        </p>
        <p className="mt-3">
          Un correcteur extérieur change la donne, parce qu&rsquo;il voit ce
          que vous ne pouvez pas voir sur votre propre copie. Il ne
          s&rsquo;agit pas d&rsquo;être assisté, mais d&rsquo;avoir un
          retour précis sur ce qui ne va pas, tant qu&rsquo;il est encore
          temps de corriger. C&rsquo;est souvent là que se joue la
          différence entre deux candidats de même niveau : l&rsquo;un a été
          corrigé et a ajusté, l&rsquo;autre a répété ses erreurs
          jusqu&rsquo;au bout. C&rsquo;est l&rsquo;un des constats centraux
          de notre{' '}
          <Link href="/blog/pourquoi-des-medecins-echouent-aux-evc" className="font-semibold underline" style={{ color: RED }}>
            analyse des raisons pour lesquelles les candidats échouent aux EVC
          </Link>.
        </p>
      </>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "Quelle est l'erreur la plus fréquente aux EVC ?",
    a: "La plus répandue est le mauvais cadrage de la préparation : traiter la voie interne (QCM) et la voie externe (EVCF en QROC et EVCP en dossiers cliniques) de la même façon, alors qu'elles n'évaluent pas les mêmes réflexes. Vient ensuite la lecture trop rapide des QCM, qui fait perdre des points sur des questions pourtant connues.",
  },
  {
    q: 'Peut-on échouer aux EVC avec un bon niveau médical ?',
    a: "Oui, et c'est fréquent. Les EVC évaluent autant la méthode que les connaissances : hiérarchisation, structuration de la réponse, gestion du temps, lecture des énoncés. Un excellent médecin qui néglige ces aspects peut tomber sous la barre, pendant qu'un candidat moins expérimenté mais mieux préparé réussit.",
  },
  {
    q: 'Comment éviter de perdre des points bêtement aux EVC ?',
    a: "En transformant les bons réflexes en automatismes : relire chaque QCM, placer l'urgence vitale en tête des dossiers, structurer ses réponses, s'entraîner au timing en conditions réelles et faire corriger ses copies. Un guide méthodologique et un entraînement encadré accélèrent nettement cette acquisition.",
  },
  {
    q: "Combien y a-t-il d'épreuves aux EVC ?",
    a: "La voie interne comporte une seule épreuve, en QCM. La voie externe en comporte deux : l'EVCF (questions à réponses courtes) et l'EVCP (dossiers cliniques progressifs). Le format conditionne directement la méthode de préparation.",
  },
];

export function Article7ErreursEvc({ article }: { article: BlogArticleMeta }) {
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
              Les 7 erreurs qui coûtent le plus de points aux EVC
            </h1>
            <h2 className="mt-1 text-[22px] font-extrabold leading-snug sm:text-[26px]"
              style={{ color: RED }}>
              (et comment les éviter en 2026)
            </h2>

            <p className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
              style={{ color: INK_MUTED }}>
              <Clock className="h-3.5 w-3.5" /> Temps de lecture : {article.readingMinutes} minutes
            </p>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              La plupart des points perdus aux Épreuves de Vérification des
              Connaissances ne se perdent pas sur ce qu&rsquo;on ignore. Ils
              se perdent sur ce qu&rsquo;on sait, mais qu&rsquo;on restitue
              mal.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Après avoir accompagné plus de 9 000 médecins vers les EVC
              depuis plus de quinze ans, ce sont ces mêmes erreurs
              qu&rsquo;on voit revenir, session après session. Si vous
              préparez les EVC 2026, ces sept-là sont précisément celles qui
              séparent un candidat admis d&rsquo;un candidat qui devra
              repasser les épreuves.
            </p>

            <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-bold"
              style={{ background: RED_SOFT, color: RED }}>
              <Target className="h-4 w-4 shrink-0" />
              Ces erreurs n&rsquo;ont rien à voir avec le niveau médical — et
              ce sont les plus faciles à corriger.
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
                src="/blog/medecin-7-erreurs-evc.webp"
                alt="Médecin concentré devant un dossier — les 7 erreurs qui coûtent le plus de points aux EVC"
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
                <Lightbulb className="h-3 w-3" style={{ color: RED }} />
                7 erreurs de méthode à éliminer
              </span>
            </div>
          </div>
        </section>

        {/* ============ CONTENU + SIDEBAR ============ */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Sections numérotées */}
            <article className="space-y-6">
              {SECTIONS.map((s) => (
                <NumberedSection key={s.id} section={s} />
              ))}
            </article>

            {/* Résumé check-list */}
            <section className="rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: BORDER }}>
              <header className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: '#16793C' }}>
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h2 className="flex-1 text-[18px] font-extrabold leading-snug sm:text-[19px]"
                  style={{ color: INK }}>
                  En résumé : les 7 erreurs à éliminer avant le jour J
                </h2>
              </header>
              <ul className="mt-4 space-y-2">
                {[
                  'Préparer spécifiquement sa voie (QCM en interne, EVCF + EVCP en externe)',
                  'Lire chaque QCM deux fois et traquer les négations',
                  "Placer l'urgence vitale en tête de chaque dossier clinique",
                  "Structurer ses réponses pour qu'elles soient faciles à noter",
                  'Réviser sur des supports calibrés EVC et à jour',
                  "S'entraîner au timing en conditions réelles, chrono en main",
                  'Faire corriger ses réponses au lieu de travailler en aveugle',
                ].map((it) => (
                  <li key={it} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#16793C' }} />
                    {it}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                Reprenez-les une par une. Aucune n&rsquo;est une question de
                savoir médical. Toutes sont des questions de méthode, de
                lecture, de hiérarchisation, de format, de préparation.
                C&rsquo;est exactement ce qui explique le paradoxe des EVC,
                où des médecins très expérimentés échouent pendant que des
                candidats moins chevronnés réussissent du premier coup. Le
                niveau ouvre la porte. La méthode fait passer.
              </p>
            </section>

            {/* CTA guide */}
            <section className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: BORDER, background: RED_SOFT }}>
              <h2 className="text-[18px] font-extrabold leading-snug" style={{ color: INK }}>
                Transformer ces 7 erreurs en 7 réflexes
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                On a réuni l&rsquo;essentiel dans le{' '}
                <strong>Guide Méthodologie EVC 2026</strong>, gratuit. En
                39 pages, il détaille les quatre familles de questions et la
                bonne façon d&rsquo;y répondre, les pièges propres au QCM de
                la voie interne comme à la copie de la voie externe, les six
                erreurs qui pèsent le plus dans la note, un planning de
                préparation et une check-list à passer en revue avant le
                jour J.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/guide-methodologie-evc-2026"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-bold text-white shadow-[0_15px_35px_-15px_rgba(192,17,46,0.55)]"
                  style={{ background: RED }}>
                  <Download className="h-4 w-4" /> Télécharger le guide gratuit
                </Link>
                <Link href="/methode"
                  className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-[14px] font-bold"
                  style={{ borderColor: BORDER, color: INK }}>
                  Découvrir Major ECN <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            {/* FAQ */}
            <section className="rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: BORDER }}>
              <h2 className="text-[18px] font-extrabold" style={{ color: INK }}>
                Foire aux questions
              </h2>
              <div className="mt-4 space-y-4">
                {FAQ_ITEMS.map((f) => (
                  <div key={f.q}>
                    <h3 className="text-[14px] font-bold" style={{ color: INK }}>
                      {f.q}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
                      {f.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            {/* Sommaire */}
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: RED }}>
                Les 7 erreurs
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

            {/* CTA Guide */}
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: RED }}>
                Guide gratuit
              </p>
              <p className="mt-2 text-[13px] font-bold leading-snug" style={{ color: INK }}>
                Guide Méthodologie EVC 2026
              </p>
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
                39 pages : les 4 familles de questions, les 6 erreurs les
                plus coûteuses, planning de révision et check-list jour J.
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
                « Les examens blancs m&rsquo;ont appris à gérer mon temps et
                à structurer mes réponses. Le jour J, je savais exactement
                quoi écrire en premier. »
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[10.5px] font-extrabold text-white"
                  style={{ background: RED }}>AB</span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[12.5px] font-extrabold" style={{ color: INK }}>Dr A., lauréat EVC</p>
                  <p className="text-[11px]" style={{ color: INK_MUTED }}>Médecine générale</p>
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

export const _UNUSED = { Sparkles, Trophy, BookOpen };
