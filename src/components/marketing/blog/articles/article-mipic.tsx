import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BookOpen, CalendarDays, CheckCircle2,
  ChevronDown, ChevronRight, FileText, FlaskConical, HelpCircle,
  Info, Lightbulb, Stethoscope, Users, Zap,
} from 'lucide-react';
import { ArticleHeader, ArticleFinalCta, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const TOC = [
  { id: 'ce-que-change-le-cng', label: 'MIPIC : ce que change réellement le CNG en 2026' },
  { id: 'padhue-pae-evc', label: 'PADHUE, PAE, EVC : les bons mots sur les bonnes notions' },
  { id: 'trois-disciplines', label: 'Médecine interne, polyvalente, immunologie clinique : trois disciplines' },
  { id: 'postes-calendrier', label: 'Postes ouverts et calendrier de la session 2026' },
  { id: 'programme-epreuve', label: 'Ce que l\'épreuve MIPIC va probablement évaluer' },
  { id: 'generaliste-mipic', label: 'Un généraliste PADHUE peut-il viser la MIPIC ?' },
  { id: 'piege-nombre-postes', label: 'Le nombre de postes n\'est pas le bon critère' },
  { id: 'preparation-major-ecn', label: 'Comment se préparer à la MIPIC avec Major ECN' },
  { id: 'faq', label: 'FAQ — MIPIC, PAE, PADHUE' },
  { id: 'a-retenir', label: 'Ce qu\'il faut retenir' },
];

const INFO_CARDS = [
  { Icon: Zap, title: 'Nouveauté CNG', text: 'L\'épreuve de médecine interne devient « MIPIC », commune mais pondérée selon le profil.' },
  { Icon: Users, title: 'Accès généralistes', text: 'Ouverte pour la 1ère fois aux médecins généralistes PADHUE en 2026.' },
  { Icon: CalendarDays, title: 'Inscriptions', text: 'Clôture le 16 juillet 2026 à 17h, exclusivement sur la plateforme du CNG.' },
  { Icon: FileText, title: 'Épreuves', text: 'À partir de novembre 2026. Note ≤ 6/20 = élimination automatique.' },
];

const CALENDAR = [
  { label: 'Ouverture des inscriptions', value: 'Plateforme CNG' },
  { label: 'Clôture des inscriptions', value: '16 juillet 2026 — 17h00' },
  { label: 'Épreuves écrites', value: 'À partir de novembre 2026' },
  { label: 'Voie externe', value: '2 épreuves de 2h (EVCP + EVCF)' },
  { label: 'Voie interne', value: '1 épreuve QCM de 2h' },
  { label: 'Choix de poste', value: '1er trimestre 2027' },
];

const PROGRAMME = [
  { title: 'Socle polyvalent hospitalier', text: 'Décompensations cardio-respiratoires, sepsis, troubles métaboliques, sujet âgé poly-pathologique.' },
  { title: 'Maladies auto-immunes systémiques', text: 'Lupus, sclérodermie, Sjögren, myopathies inflammatoires, SAPL.' },
  { title: 'Vascularites systémiques', text: 'Horton/PPR, vascularites à ANCA, Takayasu, PAN.' },
  { title: 'Immunologie clinique', text: 'Sarcoïdose, cytopénies auto-immunes, déficits immunitaires fréquents.' },
  { title: 'Syndromes transversaux', text: 'Fièvre prolongée inexpliquée, AEG, polyadénopathies, hyperferritinémie.' },
];

const FAQ = [
  { q: 'Qu\'est-ce que la MIPIC aux EVC ?', a: 'La MIPIC (Médecine Interne Polyvalente et Immunologie Clinique) est la nouvelle dénomination, confirmée par le CNG pour la session EVC 2026, de l\'ancienne épreuve de médecine interne. Épreuve commune, pondération et parcours de consolidation adaptés à chaque orientation.' },
  { q: 'La MIPIC est-elle accessible aux médecins généralistes PADHUE ?', a: 'Oui. La session EVC 2026 ouvre pour la première fois cette spécialité, ainsi que la psychiatrie, à tous les médecins titulaires d\'un diplôme permettant l\'exercice plenier dans leur pays d\'obtention.' },
  { q: 'Quand s\'inscrire aux EVC 2026 pour la MIPIC ?', a: 'Exclusivement en ligne sur la plateforme du CNG, avec clôture le 16 juillet 2026 à 17h00. Aucune candidature n\'est acceptée après cette date.' },
  { q: 'Quelle note minimale faut-il obtenir aux EVC ?', a: 'Toute note ≤ 6/20 à l\'une des épreuves entraîne une élimination automatique, indépendamment de la moyenne générale.' },
  { q: 'Le programme détaillé de la MIPIC est-il déjà publié ?', a: 'Non, à ce jour. Le CNG a communiqué sur la structure de l\'épreuve (pondération, parcours de consolidation différenciés) mais pas encore sur son contenu précis module par module.' },
  { q: 'Major ECN propose-t-il une préparation dédiée à la MIPIC ?', a: 'Oui. Major ECN prépare déjà les candidats à cette nouvelle spécialité : tu peux t\'inscrire dès maintenant pour suivre les cours et la préparation MIPIC, sans attendre la publication du programme détaillé par le CNG.' },
];

const TAKEAWAYS = [
  'La MIPIC remplace l\'ancienne épreuve de médecine interne, avec une épreuve commune mais une pondération et des parcours de consolidation adaptés à chaque orientation — confirmation officielle du CNG pour 2026.',
  'Cette spécialité, comme la psychiatrie, devient accessible pour la première fois aux médecins généralistes PADHUE dans le cadre de la PAE.',
  'Inscriptions closes le 16 juillet 2026 à 17h sur la plateforme du CNG ; épreuves dès novembre 2026.',
  'Le programme précis n\'est pas encore publié, mais les référentiels des sociétés savantes permettent déjà d\'anticiper les grandes familles de pathologies à travailler.',
  'Le nombre de postes affiché n\'est pas, à lui seul, un bon indicateur de tes chances de réussite.',
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

function Callout({ icon: Icon, variant = 'info', children }: { icon: typeof AlertTriangle; variant?: 'info' | 'warn' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: { border: '#93C5FD', bg: '#EFF6FF', icon: '#2563EB', text: '#1E40AF' },
    warn: { border: '#FDE68A', bg: '#FFFBEB', icon: '#D97706', text: '#92400E' },
    tip:  { border: '#86EFAC', bg: '#F0FDF4', icon: '#16A34A', text: '#166534' },
  };
  const s = styles[variant];
  return (
    <div className="my-5 flex gap-3 rounded-xl border p-4" style={{ borderColor: s.border, background: s.bg }}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: s.icon }} />
      <div className="text-[14px] leading-relaxed" style={{ color: s.text }}>{children}</div>
    </div>
  );
}

export function ArticleMipic({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Tu te prépares aux EVC 2026 et tu hésites à candidater en médecine interne polyvalente ? Ce guide Major ECN fait le point sur la préparation EVC médecine interne polyvalente : ce que change le CNG avec la MIPIC, le calendrier de la session, et ce qu'un médecin PADHUE doit savoir avant d'engager sa préparation PAE pour le concours EVC 2026."
        />

        {/* En bref */}
        <Callout icon={Info}>
          <strong>En bref —</strong> La MIPIC remplace l&rsquo;épreuve de médecine interne aux EVC 2026, avec une pondération adaptée selon ton profil. Elle s&rsquo;ouvre pour la première fois aux généralistes PADHUE. Inscriptions closes le 16&nbsp;juillet&nbsp;2026 à 17h ; épreuves dès novembre. Avant de candidater, lis aussi la <a href="#piege-nombre-postes" className="font-bold underline">section&nbsp;7 sur le piège du nombre de postes</a>.
        </Callout>

        {/* Info cards */}
        <div className="my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INFO_CARDS.map((c) => (
            <div key={c.title} className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
              <c.Icon className="mb-2 h-6 w-6 text-[#C0001F]" />
              <p className="text-[13px] font-extrabold text-[#1A2233]">{c.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#52607A]">{c.text}</p>
            </div>
          ))}
        </div>

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

            {/* ─── Section 1 : Ce que change le CNG ─── */}
            <SectionTitle id="ce-que-change-le-cng">MIPIC : ce que change réellement le CNG en 2026</SectionTitle>
            <p className="mb-4 text-[14px] font-bold italic text-[#52607A]">Une fusion d&rsquo;épreuve, pas une simple opération cosmétique</p>
            <Paragraph>
              Le Centre National de Gestion (CNG) a confirmé, pour la session EVC 2026, que l&rsquo;ancienne épreuve de médecine interne disparaît au profit d&rsquo;une épreuve renommée &laquo;&nbsp;Médecine Interne Polyvalente et Immunologie Clinique&nbsp;&raquo;, abrégée <strong>MIPIC</strong>.
            </Paragraph>
            <Paragraph>
              L&rsquo;épreuve reste unique pour les deux composantes — médecine interne polyvalente et immunologie clinique — mais intègre une <strong>pondération différenciée</strong> selon le profil du candidat, ainsi que des parcours de consolidation des compétences propres à chacune des deux orientations.
            </Paragraph>
            <Callout icon={Info}>
              <strong>À retenir —</strong> Un médecin formé en immunologie clinique et un médecin polyvalent hospitalier ne seront pas évalués selon un référentiel strictement identique, même si l&rsquo;épreuve écrite reste commune.
            </Callout>

            <div className="my-6 rounded-2xl border border-[#ECEEF1] bg-[#F8F9FC] p-5">
              <p className="mb-3 text-[14px] font-extrabold text-[#1A2233]">Ce qu&rsquo;on peut en déduire concrètement</p>
              <div className="space-y-3">
                {[
                  { title: 'Pas un copier-coller.', text: 'Le changement de nom traduit une volonté d\'élargir le périmètre vers la pratique hospitalière polyvalente.' },
                  { title: 'Bonne nouvelle pour les profils mixtes.', text: 'La pondération différenciée évite de désavantager un candidat plus exposé à la polyvalence qu\'à l\'immunologie pointue.' },
                  { title: 'Deux trajectoires après l\'épreuve.', text: 'Les « parcours de consolidation » distincts confirment un suivi différencié dans la procédure d\'autorisation d\'exercice (PAE).' },
                  { title: 'Programme détaillé non publié.', text: 'Il faut s\'appuyer, en attendant, sur la définition officielle de la spécialité et les référentiels des sociétés savantes.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#C0001F]" />
                    <p className="text-[14px] leading-relaxed text-[#3A4556]">
                      <strong className="text-[#1A2233]">{item.title}</strong>{' '}{item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Section 2 : PADHUE, PAE, EVC ─── */}
            <SectionTitle id="padhue-pae-evc">PADHUE, PAE, EVC : les bons mots sur les bonnes notions</SectionTitle>
            <p className="mb-4 text-[14px] font-bold italic text-[#52607A]">Trois sigles, trois étapes d&rsquo;un même parcours</p>
            <div className="my-5 space-y-3">
              {[
                { sigle: 'PADHUE', def: 'Praticiens À Diplôme Hors Union Européenne (médecins, dentistes, sages-femmes, pharmaciens).' },
                { sigle: 'EVC', def: 'Épreuves de Vérification des Connaissances organisées par le CNG : l\'étape obligatoire pour obtenir le droit d\'exercer en France.' },
                { sigle: 'PAE', def: 'Procédure d\'Autorisation d\'Exercice : le dispositif global qui inclut les EVC, le parcours de consolidation des compétences, puis l\'autorisation définitive.' },
              ].map((item) => (
                <div key={item.sigle} className="flex gap-3 rounded-xl border border-[#ECEEF1] bg-white p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0F1F4D]" />
                  <p className="text-[14px] leading-relaxed text-[#3A4556]">
                    <strong className="text-[#1A2233]">{item.sigle}</strong> — {item.def}
                  </p>
                </div>
              ))}
            </div>
            <Paragraph>
              Réussir l&rsquo;EVC MIPIC n&rsquo;ouvre pas un exercice plénier immédiat : il ouvre l&rsquo;accès, via la procédure nationale de choix de poste, à un établissement de santé pour le parcours de consolidation, condition de la PAE. Si ces notions restent floues, notre <Link href="/blog/comment-se-presenter-aux-evc" className="font-bold text-[#C0001F] hover:underline">guide complet sur l&rsquo;inscription aux EVC</Link> détaille chaque étape pas à pas, ainsi que la <Link href="/blog/evc-pae-liste-documents-fournir" className="font-bold text-[#C0001F] hover:underline">liste des documents à fournir</Link> pour ton dossier de candidature.
            </Paragraph>

            {/* ─── Section 3 : Trois disciplines ─── */}
            <SectionTitle id="trois-disciplines">Médecine interne, polyvalente, immunologie clinique : trois disciplines sous un même intitulé</SectionTitle>
            <p className="mb-4 text-[14px] font-bold italic text-[#52607A]">Pourquoi cette fusion dans la nomenclature EVC</p>
            <div className="my-5 space-y-3">
              {[
                { Icon: Stethoscope, title: 'La médecine interne', text: 'la discipline historique des maladies systémiques, des pathologies auto-immunes et des tableaux cliniques complexes qui ne se rattachent à aucun organe unique.' },
                { Icon: Users, title: 'La médecine polyvalente', text: 'un mode d\'exercice hospitalier, souvent en aval des urgences, centré sur la prise en charge globale de patients adultes poly-pathologiques.' },
                { Icon: FlaskConical, title: 'L\'immunologie clinique', text: 'déficits immunitaires, maladies auto-immunes et pathologies à médiation immune nécessitant une expertise biologique et thérapeutique spécifique (biothérapies, immunosuppresseurs).' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 rounded-xl border border-[#ECEEF1] bg-white p-4">
                  <item.Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#0F1F4D]" />
                  <p className="text-[14px] leading-relaxed text-[#3A4556]">
                    <strong className="text-[#1A2233]">{item.title}</strong> — {item.text}
                  </p>
                </div>
              ))}
            </div>
            <Paragraph>
              En alignant la nomenclature EVC sur cette réalité de terrain, le CNG cherche à répondre aux besoins réels des services hospitaliers, où exercent aussi bien des internistes formés que des médecins polyvalents généralistes.
            </Paragraph>

            {/* ─── Section 4 : Calendrier ─── */}
            <SectionTitle id="postes-calendrier">Postes ouverts et calendrier de la session 2026</SectionTitle>
            <p className="mb-4 text-[14px] font-bold italic text-[#52607A]">Les dates à ne pas manquer</p>
            <div className="my-6 overflow-hidden rounded-xl border border-[#ECEEF1] shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-[#0F1F4D] text-white">
                    <th className="px-4 py-3 font-bold">Étape</th>
                    <th className="px-4 py-3 font-bold">Date / Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {CALENDAR.map((r, i) => (
                    <tr key={r.label} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FC]'}>
                      <td className="px-4 py-2.5 font-bold text-[#1A2233]">{r.label}</td>
                      <td className="px-4 py-2.5 text-[#3A4556]">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout icon={AlertTriangle} variant="warn">
              <strong>Important —</strong> Toute note ≤ 6/20 à l&rsquo;une des épreuves entraîne l&rsquo;élimination automatique, quelle que soit la moyenne générale. Une seule candidature par candidat : une spécialité, une ARS, une voie.
            </Callout>

            {/* ─── Section 5 : Programme ─── */}
            <SectionTitle id="programme-epreuve">Ce que l&rsquo;épreuve MIPIC va probablement évaluer</SectionTitle>
            <p className="mb-4 text-[14px] font-bold italic text-[#52607A]">En l&rsquo;absence de programme officiel détaillé</p>
            <Paragraph>
              À partir de la définition officielle de la spécialité et des référentiels des sociétés savantes (SFMP, SNFMI, HAS, EULAR) :
            </Paragraph>
            <div className="my-5 space-y-3">
              {PROGRAMME.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-xl border border-[#ECEEF1] bg-white p-4">
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#0F1F4D]" />
                  <p className="text-[14px] leading-relaxed text-[#3A4556]">
                    <strong className="text-[#1A2233]">{item.title}</strong> — {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* ─── Section 6 : Généraliste → MIPIC ─── */}
            <SectionTitle id="generaliste-mipic">Un généraliste PADHUE peut-il viser la MIPIC ?</SectionTitle>
            <p className="mb-4 text-[14px] font-bold italic text-[#52607A]">Le socle est là ; le travail ciblé reste à faire</p>
            <Paragraph>
              Un médecin généraliste expérimenté possède déjà une part substantielle du socle de médecine polyvalente. Les blocs auto-immuns, vascularites et immunologie clinique demandent en revanche un apprentissage spécifique — mais bien balisé par des référentiels stables.
            </Paragraph>
            <div className="my-6 rounded-2xl border border-[#ECEEF1] bg-[#F0FDF4] p-5">
              <div className="space-y-3">
                {[
                  'Un vrai point d\'appui sur le socle polyvalent : décompensations, urgences infectieuses, troubles métaboliques, sujet âgé poly-pathologique.',
                  'Trois blocs à renforcer en priorité : maladies auto-immunes systémiques, vascularites, immunologie clinique.',
                  'Des référentiels stables et mémorisables (HAS, EULAR, SNFMI) pour combler l\'écart avec une méthode structurée.',
                ].map((text) => (
                  <div key={text} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
                    <p className="text-[14px] leading-relaxed text-[#1A2233]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Section 7 : Piège nombre de postes ─── */}
            <SectionTitle id="piege-nombre-postes">Avant de te décider : le nombre de postes n&rsquo;est pas le bon critère</SectionTitle>
            <p className="mb-4 text-[14px] font-bold italic text-[#52607A]">Un piège fréquent chez les candidats PADHUE</p>
            <Paragraph>
              Beaucoup de candidats choisissent leur spécialité en regardant uniquement le nombre de postes ouverts. C&rsquo;est un raisonnement risqué : si tous les candidats appliquent la même logique, ils se concentrent sur les mêmes spécialités, et le ratio réel candidats/postes peut finir par y être plus défavorable qu&rsquo;ailleurs.
            </Paragraph>
            <Callout icon={Lightbulb} variant="tip">
              <strong>Lecture complémentaire —</strong>{' '}
              <Link href="/blog/evc-ratio-candidats-postes-choix-specialite-2026" className="font-bold underline">
                EVC 2026 : pourquoi le nombre de postes ne doit pas guider ton choix de spécialité
              </Link>{' '}
              — avec les ratios candidats/postes officiels du CNG sur les dernières sessions.
            </Callout>

            {/* ─── Section 8 : Préparation Major ECN ─── */}
            <SectionTitle id="preparation-major-ecn">Comment se préparer à la MIPIC avec Major ECN</SectionTitle>
            <div className="my-6 overflow-hidden rounded-2xl border border-[#ECEEF1] bg-[linear-gradient(135deg,#0F1F4D_0%,#5C1827_60%,#C0112E_100%)] p-6 text-white sm:p-8">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/60">Pourquoi une préparation structurée change tout</p>
              <h3 className="mt-2 text-[22px] font-black leading-tight sm:text-[26px]">
                Une épreuve au nom nouveau, un contenu que nous maîtrisons déjà
              </h3>
              <p className="mt-4 text-[15px] leading-[1.75] text-white/90">
                La MIPIC, en tant qu&rsquo;appellation et format d&rsquo;épreuve, est inédite aux EVC 2026 : aucune annale officielle n&rsquo;existe encore sous ce nom, et personne n&rsquo;a encore passé cette épreuve précise. Mais le contenu médical qui la compose — maladies systémiques, pathologies auto-immunes, vascularites, syndromes internistes — n&rsquo;est pas un terrain nouveau pour nous : <strong>Major ECN prépare déjà les candidats à la médecine interne depuis plusieurs années</strong>, avec des correcteurs spécialistes, des cas cliniques inédits et des référentiels HAS / EULAR / SNFMI à jour.
              </p>
              <p className="mt-3 text-[15px] leading-[1.75] text-white/90">
                C&rsquo;est cette différence qui compte pour ta préparation : repartir de zéro sur une spécialité totalement inconnue n&rsquo;a rien à voir avec s&rsquo;appuyer sur un contenu déjà éprouvé, simplement recalibré sur le nouveau format.
              </p>
              <p className="mt-3 text-[14px] text-white/70">
                Depuis 2011, Major ECN accompagne des candidats <strong>PADHUE</strong> sur l&rsquo;ensemble du parcours <strong>EVC / PAE</strong> — et adapte déjà son contenu de médecine interne pour intégrer la pondération MIPIC annoncée par le CNG.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  'Correcteurs spécialistes en activité',
                  'Cas cliniques inédits, calibrés EVC',
                  'Référentiels HAS / EULAR / SNFMI à jour',
                  'Suivi personnalisé de progression',
                ].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-[13px] text-white/90">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#86EFAC]" />
                    {b}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-extrabold text-[#C0001F] shadow-sm transition-transform hover:scale-[1.02]">
                  Démarrer ma préparation MIPIC <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/specialites" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-white/10">
                  Voir toutes les spécialités
                </Link>
              </div>
              <p className="mt-5 text-[12px] text-white/50">
                La préparation MIPIC est <strong className="text-white/70">disponible dès maintenant</strong> chez Major ECN. Nos formules (<Link href="/tarifs" className="underline">voir les tarifs</Link>) s&rsquo;organisent en 3 niveaux : Essentielle, Intensive, Programme Approfondi.
              </p>
            </div>

            {/* ─── Section 9 : FAQ ─── */}
            <SectionTitle id="faq">FAQ — MIPIC, PAE, PADHUE</SectionTitle>
            <div className="my-5 space-y-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-xl border border-[#ECEEF1] bg-white shadow-sm">
                  <summary className="flex cursor-pointer items-center gap-3 px-5 py-4 text-[15px] font-bold text-[#1A2233] [&::-webkit-details-marker]:hidden">
                    <HelpCircle className="h-5 w-5 shrink-0 text-[#C0001F]" />
                    <span className="flex-1">{item.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#9AA1AE] transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[#ECEEF1] px-5 py-4 text-[14px] leading-relaxed text-[#3A4556]">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>

            {/* ─── Section 10 : À retenir ─── */}
            <SectionTitle id="a-retenir">Ce qu&rsquo;il faut retenir</SectionTitle>
            <div className="my-5 space-y-3">
              {TAKEAWAYS.map((point, i) => (
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
                Centre National de Gestion (CNG), session EVC 2026 — Arrêté du 12 juin 2026 (JO du 13 juin 2026) — Fédération Hospitalière de France — Société Française de Médecine Polyvalente (SFMP) — CNP MIPIC.
              </p>
              <p className="mt-2 text-[11px] italic text-[#9AA1AE]">
                Cet article a une vocation informative et ne se substitue pas aux textes réglementaires officiels publiés par le CNG.
              </p>
            </div>

            <ArticleFinalCta />
          </div>

          {/* ─── Aside ─── */}
          <aside className="hidden space-y-5 lg:block">
            <div className="sticky top-24 space-y-5">
              <PrepCtaCard
                title="Préparez la MIPIC avec Major ECN"
                bullets={[
                  'Spécialité MIPIC disponible dès maintenant',
                  'Correcteurs internistes en activité',
                  'Cas cliniques inédits calibrés EVC',
                  'Référentiels HAS / EULAR / SNFMI',
                  'Épreuves blanches en conditions réelles',
                  'Suivi pédagogique personnalisé',
                ]}
                ctaLabel="Démarrer ma préparation"
                ctaHref="/contact"
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
