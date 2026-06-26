import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle, ArrowDown, ArrowRight, BookOpen, CheckCircle2,
  ChevronRight, GraduationCap, Heart, HelpCircle, Lightbulb,
  Scale, Stethoscope, Target, Users,
} from 'lucide-react';
import { ArticleHeader, ArticleFinalCta, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const TOC = [
  { id: 'en-30-secondes', label: 'En 30 secondes' },
  { id: 'pas-une-question-de-places', label: 'Avant tout : ce n’est pas qu’une question de places' },
  { id: 'pourquoi-le-choix-selargit', label: 'Pourquoi le choix de spécialité s’élargit en 2026' },
  { id: 'arbre-de-decision', label: 'L’arbre de décision : quelle spécialité selon votre profil' },
  { id: 'critere-numero-1', label: 'Le critère n°1 : quel médecin voulez-vous être ?' },
  { id: 'tableau-comparatif', label: 'Tableau comparatif synthétique' },
  { id: 'recadrage-postes', label: 'Peu de postes ≠ barre inatteignable' },
  { id: 'nombre-de-postes-2026', label: 'Le nombre de postes EVC 2026' },
  { id: 'ce-que-vous-maitrisez', label: 'Ce que vous maîtrisez déjà, ce qu’il faudra apprendre' },
  { id: 'format-epreuves', label: 'Le format des épreuves EVC' },
  { id: 'apres-les-evc', label: 'Et après les EVC ? Le PCC et les débouchés' },
  { id: 'methode-4-etapes', label: 'Comment trancher : la méthode en 4 étapes' },
  { id: 'faq', label: 'Questions fréquentes' },
];

const POSTES_DATA = [
  { spe: 'Médecine Interne Polyvalente', ext: 213, int: 564, total: 777 },
  { spe: 'Psychiatrie', ext: 198, int: 450, total: 648 },
  { spe: 'Gériatrie', ext: 110, int: 236, total: 346 },
  { spe: 'Médecine d’Urgence', ext: 72, int: 270, total: 342 },
  { spe: 'Médecine Générale', ext: 35, int: 89, total: 124 },
];

const FAQ_ITEMS = [
  {
    q: 'Un médecin généraliste PADHUE peut-il passer les EVC en psychiatrie en 2026 ?',
    a: 'Oui. Depuis l’arrêté du 12 juin 2026, la psychiatrie est ouverte à tout titulaire d’un diplôme de docteur en médecine permettant l’exercice plénier dans son pays d’obtention, sans diplôme de spécialité psychiatrique exigé.',
  },
  {
    q: 'Quelle spécialité compte le plus de postes aux EVC 2026 pour un généraliste ?',
    a: 'La médecine interne polyvalente (777 postes au total), devant la psychiatrie (648). Mais le nombre de postes ne doit pas être le seul critère de choix.',
  },
  {
    q: 'La médecine générale est-elle un mauvais choix à cause du faible nombre de postes ?',
    a: 'Non. La note du dernier admis, indiquée sur le relevé de notes de chaque candidat, reste historiquement accessible en médecine générale (autour de 11–12/20 selon les sessions), et c’est la spécialité où le généraliste maîtrise le mieux le socle.',
  },
  {
    q: 'Faut-il préférer la voie interne ou la voie externe aux EVC ?',
    a: 'La voie interne (une épreuve de QCM) est réservée aux PADHUE remplissant les conditions d’exercice en France ; la voie externe (deux épreuves, EVCF + EVCP) est ouverte aux autres. Le format dépend de la voie, pas de la spécialité.',
  },
  {
    q: 'Peut-on préparer les EVC en 4 mois ?',
    a: 'Oui, avec une préparation EVC structurée et régulière — à condition de démarrer dès l’ouverture des inscriptions, les épreuves ayant lieu dès novembre 2026.',
  },
];

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-10 mb-4 scroll-mt-24 text-[22px] font-extrabold leading-tight tracking-tight text-[#1A2233] sm:text-[26px]">
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[15px] leading-[1.75] text-[#3A4556]">{children}</p>;
}

function Callout({ icon: Icon, children, color = 'amber' }: { icon: typeof AlertTriangle; children: React.ReactNode; color?: 'amber' | 'blue' | 'green' | 'red' }) {
  const colors = {
    amber: { border: '#FDE68A', bg: '#FFFBEB', icon: '#D97706', text: '#92400E' },
    blue:  { border: '#93C5FD', bg: '#EFF6FF', icon: '#2563EB', text: '#1E40AF' },
    green: { border: '#86EFAC', bg: '#F0FDF4', icon: '#16A34A', text: '#166534' },
    red:   { border: '#FCA5A5', bg: '#FEF2F2', icon: '#DC2626', text: '#991B1B' },
  };
  const c = colors[color];
  return (
    <div className="my-5 flex gap-3 rounded-xl border p-4" style={{ borderColor: c.border, background: c.bg }}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: c.icon }} />
      <div className="text-[14px] leading-relaxed" style={{ color: c.text }}>{children}</div>
    </div>
  );
}

function DecisionTree() {
  return (
    <div className="my-8 overflow-x-auto">
      <div className="mx-auto min-w-[340px] max-w-[700px]">
        {/* Top node */}
        <div className="mx-auto w-fit rounded-2xl border-2 border-[#9CA3AF] bg-[#F9FAFB] px-6 py-4 text-center">
          <p className="text-[17px] font-extrabold text-[#1A2233]">Quel m&eacute;decin voulez-vous &ecirc;tre&nbsp;?</p>
          <p className="mt-1 text-[13px] italic text-[#6B7280]">Commencez par l&rsquo;envie, pas par les postes</p>
        </div>

        {/* Arrow down */}
        <div className="flex justify-center py-2"><ArrowDown className="h-5 w-5 text-[#9CA3AF]" /></div>

        {/* Question node */}
        <div className="mx-auto w-fit rounded-2xl border-2 border-[#3B82F6] bg-[#EFF6FF] px-6 py-4 text-center">
          <p className="text-[15px] font-bold text-[#1E3A5F]">Suivre vos patients sur tous les aspects de leur sant&eacute;&nbsp;?</p>
          <p className="mt-1 text-[13px] italic text-[#3B82F6]">Le suivi global, le lien dans la dur&eacute;e</p>
        </div>

        {/* Arrow down to 3 branches */}
        <div className="flex justify-center py-2"><ArrowDown className="h-5 w-5 text-[#9CA3AF]" /></div>

        {/* Three answer boxes */}
        <div className="grid grid-cols-3 gap-3">
          {/* Left: Oui */}
          <div className="space-y-2 text-center">
            <div className="rounded-xl border-2 border-[#B45309] bg-[#FEF3C7] px-3 py-2.5">
              <p className="text-[13px] font-bold text-[#92400E]">Oui, c&rsquo;est mon m&eacute;tier</p>
            </div>
            <ArrowDown className="mx-auto h-4 w-4 text-[#9CA3AF]" />
            <div className="rounded-xl border-2 border-[#1E4D8B] bg-[#DBEAFE] px-3 py-3">
              <p className="text-[14px] font-extrabold text-[#1E3A5F]">M&eacute;decine g&eacute;n&eacute;rale</p>
              <p className="mt-1 text-[11px] italic text-[#3B6EB5]">Votre c&oelig;ur de m&eacute;tier</p>
              <p className="text-[11px] italic text-[#3B6EB5]">Socle maximal</p>
            </div>
          </div>

          {/* Center: Cas complexes */}
          <div className="space-y-2 text-center">
            <div className="rounded-xl border-2 border-[#059669] bg-[#D1FAE5] px-3 py-2.5">
              <p className="text-[13px] font-bold text-[#065F46]">Plut&ocirc;t les cas complexes</p>
            </div>
            <ArrowDown className="mx-auto h-4 w-4 text-[#9CA3AF]" />
            <div className="rounded-xl border-2 border-[#059669] bg-[#ECFDF5] px-3 py-3">
              <p className="text-[14px] font-extrabold text-[#065F46]">M&eacute;decine interne polyvalente</p>
              <p className="mt-1 text-[11px] italic text-[#10B981]">Un &eacute;largissement</p>
            </div>
          </div>

          {/* Right: Santé mentale */}
          <div className="space-y-2 text-center">
            <div className="rounded-xl border-2 border-[#DC2626] bg-[#FFE4E6] px-3 py-2.5">
              <p className="text-[13px] font-bold text-[#991B1B]">Plut&ocirc;t la sant&eacute; mentale</p>
            </div>
            <ArrowDown className="mx-auto h-4 w-4 text-[#9CA3AF]" />
            <div className="rounded-xl border-2 border-[#DC2626] bg-[#FFF1F2] px-3 py-3">
              <p className="text-[14px] font-extrabold text-[#991B1B]">Psychiatrie</p>
              <p className="mt-1 text-[11px] italic text-[#EF4444]">&Eacute;volution marqu&eacute;e</p>
              <p className="text-[11px] italic text-[#EF4444]">Si vraie app&eacute;tence</p>
            </div>
          </div>
        </div>

        {/* Bottom tie-breaker box */}
        <div className="mt-6 rounded-2xl border-2 border-[#D97706] bg-[#FEF9EE] px-5 py-4 text-center">
          <p className="text-[15px] font-extrabold text-[#1A2233]">&Agrave; motivation &eacute;gale entre deux sp&eacute;cialit&eacute;s</p>
          <p className="mt-1 text-[13px] text-[#78716C]">Le nombre de postes sert d&rsquo;arbitrage, jamais de point de d&eacute;part</p>
          <p className="mt-1 text-[13px] font-semibold text-[#B45309]">MIP&nbsp;: 777 &middot; Psychiatrie&nbsp;: 648 &middot; M&eacute;decine g&eacute;n&eacute;rale&nbsp;: 124</p>
        </div>
      </div>
    </div>
  );
}

export function ArticleChoixSpecialitePadhue({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Guide de d&eacute;cision pour les PADHUE g&eacute;n&eacute;ralistes qui pr&eacute;parent les EVC 2026 (voie interne et voie externe) &mdash; par l'&eacute;quipe de pr&eacute;paration EVC / PAE Major ECN."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ─── Colonne principale ─── */}
          <div>
            {/* Sommaire */}
            <nav className="mb-8 rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-[14px] font-extrabold uppercase tracking-[0.14em] text-[#1A2233]">Sommaire</h2>
              <ol className="space-y-1.5">
                {TOC.map((t, i) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="group flex items-start gap-2 text-[13px] text-[#52607A] hover:text-[#C0001F]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F1F3F8] text-[10px] font-bold text-[#52607A] group-hover:bg-[#FCEAEC] group-hover:text-[#C0001F]">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{t.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* ─── En 30 secondes ─── */}
            <SectionTitle id="en-30-secondes">&nbsp;&#9201; En 30&nbsp;secondes</SectionTitle>
            <div className="my-5 space-y-3">
              {[
                'Vous aimez la médecine générale ? Restez en médecine générale.',
                'Vous aimez les maladies complexes et transversales ? Pensez à la médecine interne polyvalente.',
                'Vous êtes attiré par la santé mentale ? La psychiatrie peut être un excellent choix.',
                'Ne choisissez jamais une spécialité uniquement pour le nombre de postes.',
              ].map((point) => (
                <div key={point} className="flex gap-3 rounded-xl bg-[#F0FDF4] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
                  <p className="text-[14px] leading-relaxed text-[#1A2233]">{point}</p>
                </div>
              ))}
            </div>
            <Paragraph>
              Ce qui fait r&eacute;ussir les EVC, ce n&rsquo;est pas la sp&eacute;cialit&eacute; &laquo;&nbsp;la moins encombr&eacute;e&nbsp;&raquo; &mdash; c&rsquo;est la qualit&eacute; de votre pr&eacute;paration. Pour aller plus loin, consultez notre <Link href="/guide-methodologie-evc-2026" className="font-bold text-[#C0001F] hover:underline">guide m&eacute;thodologie EVC 2026</Link>.
            </Paragraph>

            {/* ─── Avant tout ─── */}
            <SectionTitle id="pas-une-question-de-places">Avant tout&nbsp;: ce n&rsquo;est pas qu&rsquo;une question de places</SectionTitle>
            <Paragraph>
              Depuis la publication des arr&ecirc;t&eacute;s au Journal officiel le 13&nbsp;juin 2026, la m&ecirc;me question revient en boucle dans les groupes de PADHUE et chez les candidats &agrave; la pr&eacute;paration EVC&nbsp;:
            </Paragraph>
            <div className="my-5 rounded-2xl border-l-4 border-[#3B82F6] bg-[#EFF6FF] p-5">
              <p className="text-[15px] font-bold italic text-[#1E40AF]">
                &laquo;&nbsp;Je suis m&eacute;decin g&eacute;n&eacute;raliste. On me dit que je peux d&eacute;sormais tenter les EVC en Psychiatrie ou en M&eacute;decine Interne Polyvalente. Je pars sur laquelle&nbsp;?&nbsp;&raquo;
              </p>
            </div>
            <Paragraph>
              La question est l&eacute;gitime. Mais la fa&ccedil;on de se la poser change tout.
            </Paragraph>
            <Paragraph>
              Beaucoup la traduisent aussit&ocirc;t par&nbsp;: &laquo;&nbsp;Quelle sp&eacute;cialit&eacute; me donne le plus de chances d&rsquo;&ecirc;tre laur&eacute;at, l&agrave; o&ugrave; il y a le plus de postes et le moins de concurrents&nbsp;?&nbsp;&raquo; Le r&eacute;flexe se comprend quand l&rsquo;enjeu est d&rsquo;exercer en France. Mais ce raisonnement peut vous emmener au mauvais endroit.
            </Paragraph>
            <Callout icon={AlertTriangle}>
              La sp&eacute;cialit&eacute; que vous choisissez aujourd&rsquo;hui, vous l&rsquo;exercerez demain &mdash; pas seulement le temps des r&eacute;visions. R&eacute;ussir un concours pour pratiquer ensuite, pendant des ann&eacute;es, un m&eacute;tier choisi par calcul de places et non par envie, ce n&rsquo;est pas une r&eacute;ussite&nbsp;: c&rsquo;est un pi&egrave;ge.
            </Callout>
            <Paragraph>
              Dans ce guide, on remet les crit&egrave;res dans le bon ordre. D&rsquo;abord ce que vous voulez vraiment faire. Ensuite l&rsquo;effort que &ccedil;a demande. Et seulement apr&egrave;s, &agrave; motivation comparable, le nombre de places comme arbitrage &mdash; jamais comme point de d&eacute;part.
            </Paragraph>

            {/* ─── Pourquoi le choix s'élargit ─── */}
            <SectionTitle id="pourquoi-le-choix-selargit">Pourquoi le choix de sp&eacute;cialit&eacute; s&rsquo;&eacute;largit pour les g&eacute;n&eacute;ralistes en 2026</SectionTitle>
            <Paragraph>
              Jusqu&rsquo;en 2025, un m&eacute;decin g&eacute;n&eacute;raliste PADHUE n&rsquo;avait que trois portes d&rsquo;entr&eacute;e aux EVC&nbsp;: m&eacute;decine g&eacute;n&eacute;rale, g&eacute;riatrie, m&eacute;decine d&rsquo;urgence.
            </Paragraph>
            <Paragraph>
              L&rsquo;arr&ecirc;t&eacute; du 12&nbsp;juin 2026, qui modifie l&rsquo;article&nbsp;3 de l&rsquo;arr&ecirc;t&eacute; du 9&nbsp;juillet 2021, ajoute deux sp&eacute;cialit&eacute;s accessibles &agrave; tout titulaire d&rsquo;un dipl&ocirc;me de docteur en m&eacute;decine ouvrant droit &agrave; l&rsquo;exercice pl&eacute;nier dans son pays d&rsquo;obtention&nbsp;: la <strong>Psychiatrie</strong> et la <strong>M&eacute;decine Interne Polyvalente et Immunologie Clinique</strong>.
            </Paragraph>
            <Paragraph>
              Vous passez ainsi de trois &agrave; cinq sp&eacute;cialit&eacute;s possibles. C&rsquo;est une ouverture r&eacute;elle. Mais &laquo;&nbsp;ouvert&nbsp;&raquo; ne veut pas dire &laquo;&nbsp;bon choix pour vous&nbsp;&raquo;&nbsp;: &ccedil;a, c&rsquo;est &agrave; votre parcours d&rsquo;en d&eacute;cider.
            </Paragraph>
            <Callout icon={Lightbulb} color="blue">
              Pour comprendre l&rsquo;ensemble des nouveaut&eacute;s de la session (postes, voies, calendrier), appuyez-vous sur notre <Link href="/guide-methodologie-evc-2026" className="font-bold text-[#1E40AF] hover:underline">guide m&eacute;thodologie EVC 2026</Link>, qui d&eacute;taille le format des &eacute;preuves voie interne (QCM) et voie externe (EVCF / EVCP).
            </Callout>

            {/* ─── Arbre de décision ─── */}
            <SectionTitle id="arbre-de-decision">L&rsquo;arbre de d&eacute;cision&nbsp;: quelle sp&eacute;cialit&eacute; EVC selon votre profil&nbsp;?</SectionTitle>
            <DecisionTree />
            <Paragraph>
              Gardez cet arbre en t&ecirc;te&nbsp;: il r&eacute;sume tout le reste de l&rsquo;article. Le principe est simple &mdash; vous partez de l&rsquo;envie (quel m&eacute;decin voulez-vous &ecirc;tre&nbsp;?), et le nombre de postes ne sert qu&rsquo;&agrave; d&eacute;partager deux sp&eacute;cialit&eacute;s qui vous conviennent d&eacute;j&agrave; autant l&rsquo;une que l&rsquo;autre.
            </Paragraph>

            {/* ─── Critère n°1 ─── */}
            <SectionTitle id="critere-numero-1">Le crit&egrave;re n&deg;1&nbsp;: quel m&eacute;decin voulez-vous &ecirc;tre&nbsp;?</SectionTitle>
            <Paragraph>
              Avant de regarder le moindre chiffre, posez-vous la vraie question. Ces trois sp&eacute;cialit&eacute;s ne sont pas trois variantes d&rsquo;un m&ecirc;me m&eacute;tier. Ce sont trois directions diff&eacute;rentes.
            </Paragraph>

            {/* MG */}
            <h3 className="mt-6 mb-2 text-[18px] font-bold text-[#1E4D8B]">M&eacute;decine g&eacute;n&eacute;rale&nbsp;: rester sur votre c&oelig;ur de m&eacute;tier</h3>
            <Paragraph>
              C&rsquo;est votre sp&eacute;cialit&eacute;. Vous en ma&icirc;trisez d&eacute;j&agrave; le raisonnement, le p&eacute;rim&egrave;tre et le quotidien.
            </Paragraph>
            <Paragraph>
              La pr&eacute;paration EVC porte ici sur la m&eacute;thode et la mise au niveau attendu d&rsquo;un m&eacute;decin senior &mdash; pas sur l&rsquo;apprentissage d&rsquo;un nouveau m&eacute;tier. Pour beaucoup de g&eacute;n&eacute;ralistes, c&rsquo;est la voie o&ugrave; le socle de d&eacute;part est le plus solide.
            </Paragraph>

            {/* Psychiatrie */}
            <h3 className="mt-6 mb-2 text-[18px] font-bold text-[#991B1B]">Psychiatrie&nbsp;: une &eacute;volution importante de votre pratique</h3>
            <Paragraph>
              Soyons clairs&nbsp;: passer de la m&eacute;decine g&eacute;n&eacute;rale &agrave; la psychiatrie repr&eacute;sente une &eacute;volution importante de votre pratique. Ce n&rsquo;est pas une simple mise &agrave; niveau.
            </Paragraph>
            <Paragraph>
              Le rapport au patient, la temporalit&eacute; du soin, les outils, la s&eacute;miologie, le quotidien&nbsp;: beaucoup d&rsquo;&eacute;l&eacute;ments diff&egrave;rent. C&rsquo;est une excellente orientation &mdash; pour qui a une vraie app&eacute;tence pour la sant&eacute; mentale.
            </Paragraph>
            <Paragraph>
              Si vous avez d&eacute;j&agrave; suivi des patients psychiatriques, si cette dimension vous a toujours int&eacute;ress&eacute;, alors le choix est coh&eacute;rent. Si vous vous y projetez seulement parce qu&rsquo;il y a des postes, interrogez-vous s&eacute;rieusement&nbsp;: c&rsquo;est un m&eacute;tier que vous exercerez chaque jour.
            </Paragraph>

            {/* MIP */}
            <h3 className="mt-6 mb-2 text-[18px] font-bold text-[#065F46]">M&eacute;decine interne polyvalente&nbsp;: &eacute;largir votre terrain</h3>
            <Paragraph>
              Ici, on reste proche de votre logique. La m&eacute;decine interne polyvalente est, par nature, transversale &mdash; comme la m&eacute;decine g&eacute;n&eacute;rale.
            </Paragraph>
            <Paragraph>
              Vous y retrouvez une grande partie de votre univers&nbsp;: cardiologie, infectiologie, troubles m&eacute;taboliques, h&eacute;matologie clinique, h&eacute;patologie. La marche &agrave; franchir concerne surtout les pathologies plus pointues de la sp&eacute;cialit&eacute;. C&rsquo;est un prolongement de votre pratique, pas une rupture.
            </Paragraph>
            <div className="my-6 rounded-2xl border border-[#ECEEF1] bg-[#F0F4FF] p-5">
              <p className="text-[15px] font-bold text-[#0F1F4D]">
                En r&eacute;sum&eacute;&nbsp;: la psychiatrie repr&eacute;sente l&rsquo;&eacute;volution de pratique la plus marqu&eacute;e, la m&eacute;decine interne un &eacute;largissement, la m&eacute;decine g&eacute;n&eacute;rale un approfondissement.
              </p>
              <p className="mt-2 text-[14px] text-[#52607A]">
                Cela devrait peser bien avant le nombre de postes.
              </p>
            </div>

            {/* ─── Tableau comparatif ─── */}
            <SectionTitle id="tableau-comparatif">Tableau comparatif synth&eacute;tique</SectionTitle>
            <div className="my-6 overflow-hidden rounded-xl border border-[#ECEEF1] shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-[#0F1F4D] text-white">
                    <th className="px-4 py-3 font-bold">Crit&egrave;re</th>
                    <th className="px-4 py-3 font-bold">M&eacute;d. g&eacute;n&eacute;rale</th>
                    <th className="px-4 py-3 font-bold">M&eacute;d. interne</th>
                    <th className="px-4 py-3 font-bold">Psychiatrie</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { c: 'Continuité avec la pratique', mg: '★★★★★', mip: '★★★★☆', psy: '★★☆☆☆' },
                    { c: 'Volume de postes 2026', mg: 'Faible', mip: 'Très élevé', psy: 'Élevé' },
                    { c: 'Ampleur du changement', mg: 'Faible', mip: 'Modéré', psy: 'Important' },
                    { c: 'Si vous aimez…', mg: 'le suivi global', mip: 'les cas complexes', psy: 'la santé mentale' },
                  ].map((r, i) => (
                    <tr key={r.c} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FC]'}>
                      <td className="px-4 py-2.5 font-bold text-[#1A2233]">{r.c}</td>
                      <td className="px-4 py-2.5 text-[#3A4556]">{r.mg}</td>
                      <td className="px-4 py-2.5 text-[#3A4556]">{r.mip}</td>
                      <td className="px-4 py-2.5 text-[#3A4556]">{r.psy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout icon={CheckCircle2} color="green">
              Le meilleur choix n&rsquo;est pas forc&eacute;ment la sp&eacute;cialit&eacute; avec le plus de postes, mais celle qui correspond &agrave; votre projet professionnel &mdash; et pour laquelle vous serez pr&ecirc;t &agrave; vous investir durablement.
            </Callout>

            {/* ─── Recadrage postes ─── */}
            <SectionTitle id="recadrage-postes">Le recadrage qui change tout&nbsp;: peu de postes &ne; barre inatteignable</SectionTitle>
            <Paragraph>
              C&rsquo;est ici que beaucoup de candidats se trompent &mdash; et se d&eacute;couragent &agrave; tort.
            </Paragraph>
            <Paragraph>
              Le raisonnement classique&nbsp;: &laquo;&nbsp;Il n&rsquo;y a qu&rsquo;une poign&eacute;e de postes en m&eacute;decine g&eacute;n&eacute;rale, donc la barre d&rsquo;admission doit &ecirc;tre &eacute;norme, donc c&rsquo;est perdu d&rsquo;avance.&nbsp;&raquo; <strong>C&rsquo;est faux.</strong> Le nombre de places et le niveau exig&eacute; pour passer ne varient pas dans les m&ecirc;mes proportions.
            </Paragraph>
            <Paragraph>
              En m&eacute;decine g&eacute;n&eacute;rale, la note du dernier admis se situe historiquement autour de <strong>11 &agrave; 12 sur 20</strong>, sans jamais s&rsquo;envoler. Et nous sommes bien plac&eacute;s pour le savoir&nbsp;: cette note du dernier admis figure directement sur le relev&eacute; de notes que chaque candidat re&ccedil;oit apr&egrave;s les &eacute;preuves. Depuis 2011, nous accompagnons des candidats aux EVC &mdash; et session apr&egrave;s session, leurs relev&eacute;s nous le confirment&nbsp;: en m&eacute;decine g&eacute;n&eacute;rale, 12/20 constitue en pratique une sorte de plafond pour le dernier admis, rarement davantage (11, 11,5, 12 selon les ann&eacute;es).
            </Paragraph>
            <div className="my-6 rounded-2xl border-l-4 border-[#C0001F] bg-[#FFF5F6] p-5">
              <p className="text-[15px] font-bold text-[#1A2233]">
                Ce qui vous s&eacute;pare de l&rsquo;admission, ce n&rsquo;est pas le nombre de places&nbsp;: c&rsquo;est l&rsquo;&eacute;cart de pr&eacute;paration entre vous et les autres candidats.
              </p>
              <p className="mt-2 text-[14px] text-[#52607A]">
                C&rsquo;est pr&eacute;cis&eacute;ment ce que travaille une <Link href="/plateforme" className="font-bold text-[#C0001F] hover:underline">pr&eacute;paration EVC m&eacute;thodique et structur&eacute;e</Link>. Pour creuser ce point, voyez aussi notre analyse du <Link href="/blog/evc-ratio-candidats-postes-choix-specialite-2026" className="font-bold text-[#C0001F] hover:underline">vrai ratio candidats / postes aux EVC 2026</Link>.
              </p>
            </div>
            <Callout icon={AlertTriangle}>
              <strong>Deux nuances honn&ecirc;tes.</strong> D&rsquo;une part, ces chiffres d&eacute;pendent des sessions et des modalit&eacute;s de classement (liste principale, liste des candidats r&eacute;fugi&eacute;s&hellip;)&nbsp;: un ordre de grandeur historique n&rsquo;est pas une garantie pour la session 2026. D&rsquo;autre part, ce raisonnement vaut pour la m&eacute;decine g&eacute;n&eacute;rale. Il ne se transpose pas aux sp&eacute;cialit&eacute;s tr&egrave;s convoit&eacute;es (radiologie, cardiologie&hellip;), o&ugrave; la note du dernier admis a pu grimper bien plus haut.
            </Callout>
            <Paragraph>
              La cons&eacute;quence est lib&eacute;ratrice&nbsp;: la raret&eacute; des postes en m&eacute;decine g&eacute;n&eacute;rale n&rsquo;est pas une raison de fuir cette sp&eacute;cialit&eacute; par calcul. Si c&rsquo;est la voie qui vous correspond, elle reste pleinement jouable.
            </Paragraph>

            {/* ─── Nombre de postes 2026 ─── */}
            <SectionTitle id="nombre-de-postes-2026">Le nombre de postes EVC 2026&nbsp;: un crit&egrave;re d&rsquo;arbitrage, pas un point de d&eacute;part</SectionTitle>
            <Paragraph>
              Maintenant que les chiffres sont &agrave; leur place, regardons-les &mdash; comme un &eacute;l&eacute;ment parmi d&rsquo;autres.
            </Paragraph>
            <div className="my-6 overflow-hidden rounded-xl border border-[#ECEEF1] shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-[#0F1F4D] text-white">
                    <th className="px-4 py-3 font-bold">Sp&eacute;cialit&eacute;</th>
                    <th className="px-4 py-3 font-bold text-center">Voie ext.</th>
                    <th className="px-4 py-3 font-bold text-center">Voie int.</th>
                    <th className="px-4 py-3 font-bold text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {POSTES_DATA.map((r, i) => (
                    <tr key={r.spe} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FC]'}>
                      <td className="px-4 py-2.5 font-bold text-[#1A2233]">{r.spe}</td>
                      <td className="px-4 py-2.5 text-center text-[#3A4556]">{r.ext}</td>
                      <td className="px-4 py-2.5 text-center text-[#3A4556]">{r.int}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-[#C0001F]">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paragraph>
              La m&eacute;decine interne polyvalente est la mieux dot&eacute;e en 2026, la psychiatrie suit de pr&egrave;s, la m&eacute;decine g&eacute;n&eacute;rale offre nettement moins de places.
            </Paragraph>
            <Paragraph>
              Mais ce fait ne devient un argument que pour d&eacute;partager deux sp&eacute;cialit&eacute;s qui vous conviennent d&eacute;j&agrave; autant l&rsquo;une que l&rsquo;autre. Le volume de postes ne doit jamais cr&eacute;er l&rsquo;envie &agrave; lui seul.
            </Paragraph>
            <Callout icon={Users} color="blue">
              <strong>Un mot sur l&rsquo;effet d&rsquo;entra&icirc;nement.</strong> L&rsquo;argument &laquo;&nbsp;ces sp&eacute;cialit&eacute;s viennent d&rsquo;ouvrir, la concurrence y est encore faible, prenez de l&rsquo;avance&nbsp;&raquo; circule beaucoup. Le souci&nbsp;: tous les candidats lisent le m&ecirc;me argument au m&ecirc;me moment. Une fen&ecirc;tre d&rsquo;opportunit&eacute; dont tout le monde parle se referme vite.
            </Callout>

            {/* ─── Ce que vous maîtrisez déjà ─── */}
            <SectionTitle id="ce-que-vous-maitrisez">Ce que vous ma&icirc;trisez d&eacute;j&agrave;, ce qu&rsquo;il faudra apprendre</SectionTitle>
            <Paragraph>
              Une fois l&rsquo;envie clarifi&eacute;e, le deuxi&egrave;me vrai crit&egrave;re est concret.
            </Paragraph>

            <h3 className="mt-6 mb-2 text-[18px] font-bold text-[#991B1B]">En psychiatrie</h3>
            <Paragraph>
              Vous croisez d&eacute;j&agrave; la psychiatrie au quotidien&nbsp;: d&eacute;pression et troubles de l&rsquo;humeur, troubles anxieux, suivi des antid&eacute;presseurs et anxiolytiques, addictions, rep&eacute;rage du risque suicidaire, troubles cognitifs du sujet &acirc;g&eacute;.
            </Paragraph>
            <Paragraph>
              Ce qui demande un travail cibl&eacute;&nbsp;: la s&eacute;miologie psychiatrique fine et les grands syndromes (schizophr&eacute;nie, psychoses, trouble bipolaire), la pharmacologie des antipsychotiques et thymo&shy;r&eacute;gulateurs avec leurs surveillances, le cadre l&eacute;gal (SPDT, SPDRE, mesures de protection), la p&eacute;dopsychiatrie et les urgences psychiatriques. Des domaines pr&eacute;cis, mais abord&eacute;s depuis un autre point de d&eacute;part que votre pratique habituelle.
            </Paragraph>

            <h3 className="mt-6 mb-2 text-[18px] font-bold text-[#065F46]">En m&eacute;decine interne polyvalente</h3>
            <Paragraph>
              Le recoupement avec votre pratique de g&eacute;n&eacute;raliste est important, car les deux sp&eacute;cialit&eacute;s sont transversales&nbsp;: cardiologie de l&rsquo;interniste, infectiologie, troubles m&eacute;taboliques, h&eacute;matologie clinique, h&eacute;patologie rel&egrave;vent d&rsquo;un socle que vous connaissez d&eacute;j&agrave; en grande partie.
            </Paragraph>
            <Paragraph>
              Le vrai effort porte sur les modules sp&eacute;cifiques&nbsp;: maladies auto-immunes syst&eacute;miques, vascularites, immunologie clinique, syndromes internistes plus rares et bioth&eacute;rapies associ&eacute;es. Des blocs exigeants, appuy&eacute;s sur des recommandations r&eacute;centes que les r&eacute;f&eacute;rentiels d&rsquo;externes n&rsquo;effleurent qu&rsquo;en surface. Pour aller plus loin, consultez notre article d&eacute;di&eacute;&nbsp;: <Link href="/blog/evc-medecine-interne-polyvalente-mipic-2026" className="font-bold text-[#C0001F] hover:underline">tout ce qu&rsquo;il faut savoir sur les EVC de m&eacute;decine interne polyvalente (MIPIC) 2026</Link>.
            </Paragraph>

            <h3 className="mt-6 mb-2 text-[18px] font-bold text-[#1E4D8B]">En m&eacute;decine g&eacute;n&eacute;rale</h3>
            <Paragraph>
              C&rsquo;est le terrain o&ugrave; votre marche &agrave; franchir est la plus courte, puisqu&rsquo;il s&rsquo;agit de votre sp&eacute;cialit&eacute;. L&rsquo;enjeu est moins d&rsquo;apprendre du nouveau que de structurer, d&rsquo;actualiser selon les recommandations fran&ccedil;aises en vigueur, et d&rsquo;atteindre le niveau de rigueur attendu d&rsquo;un m&eacute;decin senior &agrave; l&rsquo;&eacute;crit.
            </Paragraph>

            {/* ─── Format des épreuves ─── */}
            <SectionTitle id="format-epreuves">Le format des &eacute;preuves EVC&nbsp;: identique pour les trois sp&eacute;cialit&eacute;s</SectionTitle>
            <Paragraph>
              Bonne nouvelle pour votre choix&nbsp;: le format d&eacute;pend de votre voie, pas de la sp&eacute;cialit&eacute;.
            </Paragraph>
            <div className="my-5 space-y-3">
              <div className="flex gap-3 rounded-xl border border-[#ECEEF1] bg-white p-4">
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#0F1F4D]" />
                <div>
                  <p className="text-[14px] font-bold text-[#1A2233]">Voie interne</p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-[#3A4556]">ATE en cours, deux ans d&rsquo;exercice en ETP en France sur les trois derni&egrave;res ann&eacute;es, ou statut outre-mer&nbsp;: une seule &eacute;preuve de 2&nbsp;heures, sous forme de QCM (QRU et QRM).</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-[#ECEEF1] bg-white p-4">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#0F1F4D]" />
                <div>
                  <p className="text-[14px] font-bold text-[#1A2233]">Voie externe</p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-[#3A4556]">Deux &eacute;preuves de 2&nbsp;heures, &agrave; coefficient &eacute;gal &mdash; l&rsquo;&eacute;preuve de connaissances fondamentales (EVCF) et l&rsquo;&eacute;preuve de connaissances pratiques (EVCP, dossiers cliniques). Ici, la m&eacute;thodologie de r&eacute;daction p&egrave;se autant que le savoir.</p>
                </div>
              </div>
            </div>
            <Paragraph>
              Ce qui change d&rsquo;une sp&eacute;cialit&eacute; &agrave; l&rsquo;autre, ce n&rsquo;est donc pas la forme, mais le contenu et les pi&egrave;ges propres &agrave; chaque discipline. Notre <Link href="/guide-methodologie-evc-2026" className="font-bold text-[#C0001F] hover:underline">guide m&eacute;thodologie EVC 2026</Link> d&eacute;taille les r&eacute;flexes attendus pour chaque format.
            </Paragraph>

            {/* ─── Après les EVC ─── */}
            <SectionTitle id="apres-les-evc">Et apr&egrave;s les EVC&nbsp;? Le PCC et les d&eacute;bouch&eacute;s</SectionTitle>
            <Paragraph>
              R&eacute;ussir les EVC ouvre sur un Parcours de Consolidation des Comp&eacute;tences (PCC) de deux ans, puis l&rsquo;autorisation d&eacute;finitive d&rsquo;exercice.
            </Paragraph>
            <Paragraph>
              Sur ce plan, les trois sp&eacute;cialit&eacute;s offrent de r&eacute;elles perspectives en France&nbsp;: la psychiatrie comme la m&eacute;decine interne polyvalente sont des disciplines en forte tension &agrave; l&rsquo;h&ocirc;pital, et la m&eacute;decine g&eacute;n&eacute;rale reste un besoin structurel partout. Aucune de ces voies n&rsquo;est un mauvais pari &mdash; mais ce crit&egrave;re ne devrait pas, &agrave; lui seul, d&eacute;cider &agrave; votre place aujourd&rsquo;hui.
            </Paragraph>

            {/* ─── Méthode en 4 étapes ─── */}
            <SectionTitle id="methode-4-etapes">Alors, comment trancher&nbsp;? La m&eacute;thode en 4&nbsp;&eacute;tapes</SectionTitle>
            <div className="my-5 space-y-4">
              {[
                { n: 1, text: 'Commencez par l’envie. Est-ce un métier que vous vous voyez exercer ? La psychiatrie vous attire-t-elle vraiment, ou est-ce le nombre de postes qui vous y pousse ?' },
                { n: 2, text: 'Mesurez l’effort réel. Combien de terrain nouveau devez-vous couvrir ? Médecine générale et médecine interne vous laissent sur un socle familier ; la psychiatrie demande d’entrer dans un autre univers.' },
                { n: 3, text: 'Ne vous laissez pas paralyser par le nombre de postes. En médecine générale, la barre reste accessible. Le peu de places n’est pas un couperet.' },
                { n: 4, text: 'Utilisez le volume de postes en dernier, pour départager deux spécialités qui vous conviennent déjà autant l’une que l’autre.' },
              ].map((step) => (
                <div key={step.n} className="flex gap-4 rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1F4D] text-[16px] font-extrabold text-white">
                    {step.n}
                  </div>
                  <p className="text-[15px] leading-snug text-[#3A4556]">{step.text}</p>
                </div>
              ))}
            </div>
            <div className="my-6 rounded-2xl border-l-4 border-[#C0001F] bg-[#FFF5F6] p-5">
              <p className="text-[15px] font-bold text-[#1A2233]">
                L&rsquo;essentiel tient en une phrase&nbsp;: ce qui fait la diff&eacute;rence le jour des EVC, ce n&rsquo;est pas la sp&eacute;cialit&eacute; choisie, c&rsquo;est la qualit&eacute; de votre pr&eacute;paration.
              </p>
              <p className="mt-2 text-[14px] text-[#52607A]">
                Un candidat solide et bien entra&icirc;n&eacute; se d&eacute;marque, quelle que soit la voie. Un candidat livr&eacute; &agrave; lui-m&ecirc;me peine, m&ecirc;me sur le cr&eacute;neau le plus &laquo;&nbsp;ouvert&nbsp;&raquo;.
              </p>
            </div>
            <Paragraph>
              Les &eacute;preuves d&eacute;marrent en novembre 2026. Le temps utile, vous l&rsquo;avez encore &mdash; &agrave; condition de commencer maintenant, sur la sp&eacute;cialit&eacute; que vous aurez vraiment choisie, avec une <Link href="/plateforme" className="font-bold text-[#C0001F] hover:underline">pr&eacute;paration EVC adapt&eacute;e &agrave; votre profil</Link>.
            </Paragraph>

            {/* ─── FAQ ─── */}
            <SectionTitle id="faq">Questions fr&eacute;quentes &mdash; EVC 2026 pour les g&eacute;n&eacute;ralistes PADHUE</SectionTitle>
            <div className="my-5 space-y-4">
              {FAQ_ITEMS.map((item) => (
                <div key={item.q} className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C0001F]" />
                    <div>
                      <p className="text-[15px] font-bold leading-snug text-[#1A2233]">{item.q}</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-[#52607A]">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── CTA final profil ─── */}
            <div className="my-8 rounded-2xl bg-[linear-gradient(135deg,#0F1F4D_0%,#1E3A8A_100%)] p-6 text-white">
              <div className="flex items-center gap-3">
                <Target className="h-7 w-7 shrink-0 text-white/80" />
                <h3 className="text-[18px] font-extrabold">Vous h&eacute;sitez encore entre plusieurs sp&eacute;cialit&eacute;s&nbsp;?</h3>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-white/90">
                Faites analyser votre profil et votre parcours afin d&rsquo;identifier la voie EVC la plus coh&eacute;rente avec votre exp&eacute;rience, vos objectifs et le temps dont vous disposez. Un choix de sp&eacute;cialit&eacute; align&eacute; avec votre pratique, c&rsquo;est d&eacute;j&agrave; une grande partie du chemin vers la r&eacute;ussite.
              </p>
              <Link
                href="/plateforme"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C0001F] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
              >
                D&eacute;couvrir la m&eacute;thode et la pr&eacute;paration EVC 2026 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* ─── Guide CTA ─── */}
            <div className="my-6 flex flex-col items-center gap-4 rounded-2xl border border-[#ECEEF1] bg-white p-6 shadow-sm sm:flex-row">
              <Image
                src="/guides/guide-cover.png"
                alt="Guide Méthodologie EVC 2026"
                width={120}
                height={160}
                className="h-auto w-[100px] rounded-lg shadow-md"
              />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-[16px] font-extrabold text-[#1A2233]">Guide M&eacute;thodologie EVC 2026 &mdash; Major ECN</p>
                <p className="mt-1 text-[13px] text-[#52607A]">T&eacute;l&eacute;chargez gratuitement le guide m&eacute;thodologie EVC 2026 (39&nbsp;pages).</p>
                <Link
                  href="/guide-methodologie-evc-2026"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:scale-[1.01]"
                >
                  T&eacute;l&eacute;charger gratuitement <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <Paragraph>
              Et demandez votre analyse de profil pour partir sur la bonne sp&eacute;cialit&eacute;, d&egrave;s aujourd&rsquo;hui.
            </Paragraph>

            {/* Sources */}
            <div className="mt-8 rounded-xl border border-[#ECEEF1] bg-[#F8F9FC] p-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#9AA1AE]">Sources</p>
              <p className="mt-2 text-[12px] text-[#9AA1AE]">
                Arr&ecirc;t&eacute; du 12&nbsp;juin 2026 portant ouverture des EVC session 2026&nbsp;; arr&ecirc;t&eacute; du 12&nbsp;juin 2026 modifiant l&rsquo;arr&ecirc;t&eacute; du 9&nbsp;juillet 2021&nbsp;; Journal officiel du 13&nbsp;juin 2026&nbsp;; Centre national de gestion (CNG)&nbsp;; notes du dernier admis figurant sur les relev&eacute;s de notes des candidats accompagn&eacute;s par Major ECN depuis 2011&nbsp;; F&eacute;d&eacute;ration hospitali&egrave;re de France.
              </p>
            </div>

            <ArticleFinalCta />
          </div>

          {/* ─── Aside ─── */}
          <aside className="hidden space-y-5 lg:block">
            <div className="sticky top-24 space-y-5">
              <PrepCtaCard
                title="Pr&eacute;parez efficacement les EVC avec Major ECN"
                bullets={[
                  'Toutes les spécialités couvertes',
                  'Plus de 9 000 médecins accompagnés',
                  'QCM corrigés et commentés',
                  'Cas cliniques progressifs',
                  'Épreuves blanches en conditions réelles',
                  'Suivi pédagogique personnalisé',
                ]}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
