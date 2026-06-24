import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BarChart3, BookOpen, Brain, CheckCircle2,
  ChevronRight, HelpCircle, Scale, Target, TrendingUp, Users,
} from 'lucide-react';
import { ArticleHeader, ArticleFinalCta, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const TOC = [
  { id: 'le-reflexe-naturel', label: 'Le réflexe naturel : foncer vers la spécialité qui a le plus de postes' },
  { id: 'ce-que-disent-les-bilans-du-cng', label: 'Ce que disent vraiment les bilans du CNG' },
  { id: 'leffet-de-troupeau', label: "L'effet de troupeau : pourquoi le calcul s'inverse souvent" },
  { id: 'le-cas-2026', label: 'Le cas 2026 : MIPIC, psychiatrie et médecine générale' },
  { id: 'le-bon-raisonnement', label: 'Le bon raisonnement : ratio, pas volume' },
  { id: 'et-le-niveau-du-candidat', label: 'Et le niveau du candidat, dans tout ça ?' },
  { id: 'comment-construire-ton-arbitrage', label: 'Comment construire ton arbitrage en 4 questions' },
  { id: 'ce-quil-faut-retenir', label: 'Ce qu\'il faut retenir' },
];

const CNG_DATA = [
  { year: '2018', places: 644, inscrits: 6988, ratio: '~11:1', absent: '~60 %' },
  { year: '2017', places: 500, inscrits: '~6 000', ratio: '~12:1', absent: '~55 %' },
  { year: '2016', places: '~420', inscrits: '~5 000', ratio: '~12:1', absent: '~50 %' },
  { year: '2014', places: '~300', inscrits: '~4 500', ratio: '~15:1', absent: '—' },
  { year: '2013', places: '~280', inscrits: '~3 500', ratio: '~12,5:1', absent: '—' },
];

const QUESTIONS = [
  {
    Icon: Target,
    q: 'Sur quelle spécialité ai-je, aujourd\'hui, le niveau le plus solide ?',
    detail: 'Pas celle où je pense pouvoir progresser le plus vite — celle où je suis déjà le plus à l\'aise.',
  },
  {
    Icon: BookOpen,
    q: 'Combien de temps puis-je réellement consacrer à ma préparation avant novembre 2026 ?',
    detail: 'Une bascule vers une spécialité nouvelle (MIPIC, psychiatrie) suppose un travail de fond plus long qu\'un simple maintien à niveau.',
  },
  {
    Icon: Brain,
    q: 'Suis-je en train de choisir cette spécialité parce qu\'elle me convient, ou parce que le tableau des postes m\'a impressionné ?',
    detail: 'Si c\'est la seconde raison, ralentis : c\'est le raisonnement que font la majorité des autres candidats en ce moment même.',
  },
  {
    Icon: CheckCircle2,
    q: 'Ai-je les moyens de m\'entraîner sérieusement, quelle que soit la spécialité choisie ?',
    detail: 'C\'est souvent ce qui fait la différence entre deux candidats de niveau initial comparable.',
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

function Callout({ icon: Icon, children }: { icon: typeof AlertTriangle; children: React.ReactNode }) {
  return (
    <div className="my-5 flex gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" />
      <div className="text-[14px] leading-relaxed text-[#92400E]">{children}</div>
    </div>
  );
}

export function ArticleRatioPostes({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Le nombre de postes par spécialité peut tromper. Ratio candidats/postes, effet de troupeau, données CNG — comment vraiment choisir sa spécialité EVC en 2026."
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

            {/* ─── Section 1 ─── */}
            <SectionTitle id="le-reflexe-naturel">Le réflexe naturel : foncer vers la spécialité qui a le plus de postes</SectionTitle>
            <Paragraph>
              Chaque année, à l&rsquo;ouverture d&rsquo;une session EVC, le même réflexe revient chez une grande partie des candidats PADHUE : consulter le tableau des postes ouverts par spécialité, et se diriger vers celle qui en propose le plus. Le raisonnement semble logique &mdash; plus de postes, donc plus de chances d&rsquo;être reçu.
            </Paragraph>
            <Paragraph>
              En 2026, ce réflexe est particulièrement marqué : la <strong>médecine interne polyvalente et immunologie clinique (MIPIC)</strong> et la <strong>psychiatrie</strong> s&rsquo;ouvrent pour la première fois à tous les médecins généralistes PADHUE, avec un volume de postes important. Mécaniquement, beaucoup de généralistes qui auraient candidaté en médecine générale les années précédentes envisagent désormais de basculer vers ces nouvelles options.
            </Paragraph>
            <Callout icon={AlertTriangle}>
              C&rsquo;est exactement le moment où il faut ralentir et regarder les chiffres autrement.
            </Callout>

            {/* ─── Section 2 ─── */}
            <SectionTitle id="ce-que-disent-les-bilans-du-cng">Ce que disent vraiment les bilans du CNG</SectionTitle>
            <Paragraph>
              Le CNG publie, à l&rsquo;issue de chaque session, un bilan statistique détaillé des EVC. Ces bilans donnent une information bien plus utile que le nombre brut de postes : le <strong>ratio candidats inscrits / postes ouverts</strong>, et le <strong>taux d&rsquo;absentéisme</strong> aux épreuves.
            </Paragraph>

            {/* Tableau CNG */}
            <div className="my-6 overflow-hidden rounded-xl border border-[#ECEEF1] shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-[#0F1F4D] text-white">
                    <th className="px-4 py-3 font-bold">Année</th>
                    <th className="px-4 py-3 font-bold">Places</th>
                    <th className="px-4 py-3 font-bold">Inscrits</th>
                    <th className="px-4 py-3 font-bold">Ratio</th>
                    <th className="px-4 py-3 font-bold">Absentéisme</th>
                  </tr>
                </thead>
                <tbody>
                  {CNG_DATA.map((r, i) => (
                    <tr key={r.year} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FC]'}>
                      <td className="px-4 py-2.5 font-bold text-[#1A2233]">{r.year}</td>
                      <td className="px-4 py-2.5 text-[#3A4556]">{r.places}</td>
                      <td className="px-4 py-2.5 text-[#3A4556]">{r.inscrits}</td>
                      <td className="px-4 py-2.5 font-bold text-[#C0001F]">{r.ratio}</td>
                      <td className="px-4 py-2.5 text-[#3A4556]">{r.absent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-[#ECEEF1] bg-[#F8F9FC] px-4 py-2 text-[11px] italic text-[#9AA1AE]">
                Source : Bilans officiels des EVC, Centre National de Gestion (CNG)
              </div>
            </div>

            <Paragraph>
              Deux enseignements de ces données. D&rsquo;abord, le ratio candidats/postes reste <strong>structurellement élevé</strong> même quand le nombre de places progresse &mdash; preuve que l&rsquo;augmentation des postes attire généralement un afflux de candidats au moins proportionnel. Ensuite, l&rsquo;absentéisme massif (un candidat sur deux ne se présente pas) signifie que le ratio affiché à l&rsquo;inscription n&rsquo;est jamais le ratio réel le jour de l&rsquo;épreuve &mdash; mais il reste le seul chiffre disponible au moment où il faut choisir sa spécialité.
            </Paragraph>

            {/* ─── Section 3 ─── */}
            <SectionTitle id="leffet-de-troupeau">L&rsquo;effet de troupeau : pourquoi le calcul s&rsquo;inverse souvent</SectionTitle>
            <Paragraph>
              Voici le mécanisme qu&rsquo;il faut bien comprendre avant de choisir une spécialité EVC sur la seule base du nombre de postes.
            </Paragraph>
            <Paragraph>
              Un grand nombre de postes ouverts dans une spécialité donnée n&rsquo;est un signal positif que si le nombre de candidats qui s&rsquo;y dirigent reste stable. Or, c&rsquo;est rarement le cas : quand une spécialité s&rsquo;ouvre largement ou voit son volume de postes fortement augmenter, l&rsquo;information circule vite parmi les candidats PADHUE &mdash; forums, réseaux sociaux, bouche-à-oreille, organismes de préparation. Une grande partie des candidats applique alors le même raisonnement simple : &laquo;&nbsp;plus de postes = plus de chances&nbsp;&raquo;. Mécaniquement, ils se reportent en masse vers cette spécialité.
            </Paragraph>

            <div className="my-6 rounded-2xl border-l-4 border-[#C0001F] bg-[#FFF5F6] p-5">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 h-6 w-6 shrink-0 text-[#C0001F]" />
                <div>
                  <p className="text-[15px] font-bold text-[#1A2233]">Le paradoxe de l&rsquo;attractivité</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#52607A]">
                    Le ratio candidats/postes de la spécialité &laquo;&nbsp;généreuse&nbsp;&raquo; peut se dégrader très vite, parfois jusqu&rsquo;à devenir <strong>moins favorable</strong> que celui d&rsquo;une spécialité boudée par tous parce qu&rsquo;elle affiche, en apparence, peu de postes.
                  </p>
                </div>
              </div>
            </div>

            <Paragraph>
              C&rsquo;est un phénomène bien documenté dans tous les systèmes de sélection à effectif limité : la perception du volume de postes influence le comportement des candidats davantage que le ratio réel, parce que ce ratio réel n&rsquo;est connu qu&rsquo;après coup &mdash; une fois les inscriptions closes.
            </Paragraph>

            {/* ─── Section 4 ─── */}
            <SectionTitle id="le-cas-2026">Le cas 2026 : MIPIC, psychiatrie et médecine générale</SectionTitle>
            <Paragraph>Concrètement, pour la session 2026 :</Paragraph>
            <ul className="mb-4 space-y-3 pl-5">
              <li className="flex items-start gap-3 text-[15px] leading-relaxed text-[#3A4556]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0F1F4D]" />
                <span>La <strong>médecine générale</strong> est ouverte avec un nombre de postes plus restreint que la MIPIC ou la psychiatrie &mdash; une situation déjà observée par le passé, où la médecine générale a parfois été proposée avec un nombre de places modeste (40 places lors de certaines sessions antérieures) sans empêcher des candidats bien préparés de réussir année après année.</span>
              </li>
              <li className="flex items-start gap-3 text-[15px] leading-relaxed text-[#3A4556]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C0001F]" />
                <span>La <strong>MIPIC et la psychiatrie</strong> s&rsquo;ouvrent pour la première fois aux généralistes, avec un volume de postes nettement supérieur &mdash; ce qui en fait, par construction, des options qui vont concentrer une part importante des candidatures de généralistes en 2026.</span>
              </li>
            </ul>
            <Paragraph>
              Si une proportion significative des généralistes PADHUE raisonne &laquo;&nbsp;la MIPIC a plus de postes, j&rsquo;ai plus de chances&nbsp;&raquo;, ils vont s&rsquo;y reporter en masse &mdash; ce qui peut faire grimper le ratio candidats/postes de la MIPIC au-delà de ce que suggère le tableau des postes ouverts, pendant que la médecine générale, désormais perçue comme &laquo;&nbsp;petite&nbsp;&raquo; et délaissée, conserve un nombre de candidats proportionnellement plus faible face à ses places.
            </Paragraph>
            <Callout icon={HelpCircle}>
              Il est impossible, avant la clôture des inscriptions, de connaître le ratio réel de chaque spécialité pour la session 2026. C&rsquo;est précisément pour cette raison qu&rsquo;il ne faut pas fonder son choix uniquement sur le nombre de postes affiché.
            </Callout>

            {/* ─── Section 5 ─── */}
            <SectionTitle id="le-bon-raisonnement">Le bon raisonnement : ratio, pas volume</SectionTitle>
            <Paragraph>
              Le nombre de postes n&rsquo;est qu&rsquo;un terme de l&rsquo;équation. L&rsquo;autre &mdash; le nombre de candidats &mdash; dépend directement du comportement collectif, donc difficile à anticiper avec certitude, mais qu&rsquo;on peut raisonner :
            </Paragraph>
            <div className="my-5 space-y-3">
              {[
                { icon: TrendingUp, text: 'Plus une spécialité est médiatisée comme « nouvelle opportunité », plus elle attire de candidats au-delà de son volume de postes.' },
                { icon: Users, text: 'Plus une spécialité est perçue comme délaissée, moins elle attire de candidats — y compris des candidats qui auraient un excellent niveau dans cette discipline.' },
                { icon: Scale, text: 'Le ratio qui compte vraiment n\'est donc pas « postes affichés », mais « postes affichés ÷ candidats qui se présenteront réellement le jour de l\'épreuve ».' },
              ].map((item) => (
                <div key={item.text} className="flex gap-3 rounded-xl border border-[#ECEEF1] bg-white p-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#0F1F4D]" />
                  <p className="text-[14px] leading-relaxed text-[#3A4556]">{item.text}</p>
                </div>
              ))}
            </div>
            <Paragraph>
              Un candidat qui a un très bon niveau et une vraie aisance en médecine générale, par exemple, peut tout à fait avoir statistiquement plus de chances de réussir dans cette spécialité &mdash; même avec un nombre de postes apparemment faible &mdash; que dans une spécialité comme la MIPIC où il devra repartir d&rsquo;une base de connaissances neuve, en concurrence avec un afflux massif d&rsquo;autres généralistes appliquant le même raisonnement que lui.
            </Paragraph>

            {/* ─── Section 6 ─── */}
            <SectionTitle id="et-le-niveau-du-candidat">Et le niveau du candidat, dans tout ça ?</SectionTitle>
            <Paragraph>
              Le ratio candidats/postes n&rsquo;est qu&rsquo;une partie de l&rsquo;équation : encore faut-il savoir où l&rsquo;on se situe soi-même dans la distribution des candidats.
            </Paragraph>
            <Paragraph>
              Dans un concours qui rassemble plusieurs centaines de candidats par spécialité, on observe en général une distribution assez classique : une majorité de candidats au niveau moyen, regroupés autour d&rsquo;une fourchette de notes resserrée, et une minorité de candidats nettement au-dessus du lot. Concrètement, cela veut dire qu&rsquo;un candidat qui a un niveau réellement supérieur à la moyenne du groupe &mdash; parce qu&rsquo;il maîtrise déjà bien sa discipline, qu&rsquo;il a du temps pour préparer méthodiquement l&rsquo;épreuve, et qu&rsquo;il s&rsquo;entraîne avec les bons outils &mdash; a un <strong>avantage qui compte davantage que le ratio brut candidats/postes</strong>.
            </Paragraph>
            <div className="my-6 rounded-2xl border border-[#ECEEF1] bg-[#F0F4FF] p-5">
              <p className="text-[15px] font-bold text-[#0F1F4D]">
                Changer de spécialité pour suivre le flux n&rsquo;a de sens que si le candidat est prêt à investir le travail nécessaire pour devenir, sur cette nouvelle discipline, aussi compétitif qu&rsquo;il l&rsquo;était déjà sur sa spécialité d&rsquo;origine.
              </p>
              <p className="mt-2 text-[14px] text-[#52607A]">
                Rester sur une spécialité avec moins de postes, mais où l&rsquo;on part avec une vraie longueur d&rsquo;avance, peut être une stratégie tout aussi rationnelle &mdash; parfois plus.
              </p>
            </div>

            {/* ─── Section 7 ─── */}
            <SectionTitle id="comment-construire-ton-arbitrage">Comment construire ton arbitrage en 4 questions</SectionTitle>
            <Paragraph>
              Avant de choisir ta spécialité pour la session EVC 2026, pose-toi ces quatre questions, dans cet ordre :
            </Paragraph>
            <div className="my-5 space-y-4">
              {QUESTIONS.map((q, i) => (
                <div key={i} className="flex gap-4 rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1F4D] text-[16px] font-extrabold text-white">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold leading-snug text-[#1A2233]">{q.q}</p>
                    <p className="mt-1 text-[13px] text-[#52607A]">{q.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <Paragraph>
              C&rsquo;est précisément pour répondre à la question n&deg;4 que Major ECN propose des <Link href="/plateforme" className="font-bold text-[#C0001F] hover:underline">préparations EVC structurées sur l&rsquo;ensemble des spécialités couvertes</Link>, avec une méthodologie identique quelle que soit la discipline choisie : programmes actualisés, correcteurs spécialistes, cas cliniques inédits et suivi personnalisé.
            </Paragraph>
            <Paragraph>
              Si tu hésites encore entre rester en médecine générale ou basculer vers la MIPIC, notre article <Link href="/blog/comment-reussir-les-evc-conseils-laureats" className="font-bold text-[#C0001F] hover:underline">Comment réussir les EVC : les conseils que les lauréats auraient aimé connaître plus tôt</Link> détaille la méthodologie qui fait la différence le jour J.
            </Paragraph>
            <Paragraph>
              Tu peux aussi <Link href="/plateforme" className="font-bold text-[#C0001F] hover:underline">tester gratuitement notre méthode</Link>, consulter nos <Link href="/tarifs" className="font-bold text-[#C0001F] hover:underline">formules et tarifs</Link>, ou <Link href="/contact" className="font-bold text-[#C0001F] hover:underline">contacter notre équipe</Link> pour un échange personnalisé sur ton arbitrage de spécialité &mdash; nous accompagnons des candidats PADHUE depuis 2011, toutes spécialités confondues.
            </Paragraph>

            {/* ─── Section 8 ─── */}
            <SectionTitle id="ce-quil-faut-retenir">Ce qu&rsquo;il faut retenir</SectionTitle>
            <div className="my-5 space-y-3">
              {[
                'Le nombre de postes ouverts par spécialité n\'est qu\'une moitié de l\'équation : ce qui compte, c\'est le ratio candidats/postes, qui n\'est connu avec certitude qu\'après la clôture des inscriptions.',
                'Les bilans officiels du CNG montrent un ratio structurellement élevé (10 à 15 candidats pour une place selon les années) et un absentéisme massif aux épreuves, ce qui complique encore l\'anticipation du ratio réel.',
                'Une spécialité qui ouvre massivement ses portes (comme la MIPIC ou la psychiatrie en 2026) attire mécaniquement un afflux de candidats appliquant le même raisonnement — ce qui peut faire grimper son ratio réel au-delà de ce que suggère le tableau des postes.',
                'Le bon critère de choix n\'est pas le volume de postes affiché, mais ton niveau actuel, le temps dont tu disposes pour préparer sérieusement l\'épreuve, et ta capacité à t\'entraîner avec méthode jusqu\'au jour J — quelle que soit la spécialité.',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 rounded-xl bg-[#F0FDF4] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
                  <p className="text-[14px] leading-relaxed text-[#1A2233]">{point}</p>
                </div>
              ))}
            </div>

            {/* Sources */}
            <div className="mt-8 rounded-xl border border-[#ECEEF1] bg-[#F8F9FC] p-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#9AA1AE]">Sources</p>
              <p className="mt-2 text-[12px] text-[#9AA1AE]">
                Bilan des Épreuves de Vérification des Connaissances (EVC), session 2018, Centre National de Gestion (CNG) &mdash; Arrêté du 12 juin 2026 portant ouverture des EVC session 2026.
              </p>
              <p className="mt-2 text-[11px] italic text-[#9AA1AE]">
                Cet article a une vocation informative et stratégique ; il ne se substitue pas aux textes réglementaires officiels publiés par le CNG, seule source faisant foi pour l&rsquo;inscription et le déroulement des EVC.
              </p>
            </div>

            <ArticleFinalCta />
          </div>

          {/* ─── Aside ─── */}
          <aside className="hidden space-y-5 lg:block">
            <div className="sticky top-24 space-y-5">
              <PrepCtaCard
                title="Préparez efficacement les EVC avec Major ECN"
                bullets={[
                  'Toutes les spécialités couvertes',
                  'Plus de 9 000 médecins accompagnés',
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
