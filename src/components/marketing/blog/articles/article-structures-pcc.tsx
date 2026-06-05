import { CheckCircle2, Building2, Stethoscope, ClipboardCheck, Award, ChevronDown, Users, GraduationCap, BookOpen, Activity, Target, AlertTriangle } from 'lucide-react';
import { ArticleHeader, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import { NewsletterForm } from '../newsletter-form';
import { ArticleSidebarPopular } from '../article-sidebar-popular';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const PARCOURS = [
  { Icon: ClipboardCheck, bg: '#E5F1FF', fg: '#1E4D8B', label: 'Épreuves de Vérification des Connaissances (EVC)', sub: 'Validation des connaissances médicales' },
  { Icon: Building2,      bg: '#DCFCE7', fg: '#16A34A', label: 'Parcours de Consolidation des Compétences (PCC)', sub: '2 ans pour les médecins · 1 an pour les chirurgiens-dentistes et sages-femmes' },
  { Icon: Users,          bg: '#FEF3E2', fg: '#B26A00', label: 'Commission Nationale d\'Autorisation d\'Exercice (CNAE)', sub: 'Évaluation du parcours et de la compétence professionnelle' },
  { Icon: Award,          bg: '#FDE7E9', fg: '#C0001F', label: 'Autorisation d\'exercice', sub: 'Inscription définitive au Tableau de l\'Ordre des médecins' },
];

const TOC = [
  'Qui est concerné par la PAE ?',
  'Comprendre les EVC',
  'Le PCC après les EVC',
  'Où réaliser son PCC ?',
  'Les CHU : la structure de référence',
  'Établissements privés et ESPIC',
  'Structures sanitaires et médico-sociales agréées',
  'Validation finale du parcours',
  'Autorisation d\'exercice',
  'Préparer les EVC avec Major ECN',
  'FAQ — Vos questions fréquentes',
];

const STRUCTURES = [
  { type: 'CHU (Centres Hospitalo-Universitaires)', medical: 5, clinique: 5, formation: 5, perspectives: 5, exemples: 'Hôpitaux universitaires, pôles spécialisés, recherche, CHU régionaux' },
  { type: 'Établissements privés (ESPIC et cliniques agréés)', medical: 4, clinique: 4, formation: 3, perspectives: 4, exemples: 'Cliniques privées, ESPIC, établissements de santé privés d\'intérêt collectif' },
  { type: 'Structures sanitaires agréées', medical: 4, clinique: 4, formation: 3, perspectives: 4, exemples: 'Centres de santé, SSR, établissements spécialisés' },
  { type: 'Structures médico-sociales agréées (selon le projet professionnel)', medical: 3, clinique: 3, formation: 3, perspectives: 3, exemples: 'EHPAD, PMI, services médico-sociaux, structures habilitées' },
];

const FAQS = [
  ['Qu\'est-ce que le PCC après les EVC ?', 'Le Parcours de Consolidation des Compétences est une période d\'exercice supervisé qui suit la réussite des EVC.'],
  ['Combien de temps dure le PCC pour les médecins ?', '2 ans pour les médecins, 1 an pour les chirurgiens-dentistes et sages-femmes.'],
  ['Où réaliser son PCC après les EVC ?', 'Dans une structure agréée ou habilitée dans le cadre de la PAE : CHU, ESPIC, clinique agréée, structure sanitaire ou médico-sociale agréée.'],
  ['Peut-on effectuer son PCC dans une clinique ?', 'Oui, à condition que la clinique soit agréée par les autorités compétentes pour accueillir des praticiens en parcours PAE.'],
  ['Quelle est la différence entre EVC et PAE ?', 'Les EVC sont l\'épreuve d\'entrée. La PAE est la procédure globale qui inclut les EVC, le PCC, la CNAE et l\'autorisation finale.'],
  ['Comment obtenir l\'autorisation d\'exercice en France ?', 'En réussissant les EVC, validant le PCC et obtenant un avis favorable de la CNAE.'],
  ['Comment préparer efficacement les EVC ?', 'Avec une préparation structurée et complète comme celle proposée par Major ECN.'],
];

export function ArticleStructuresPcc({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="CHU, établissements privés, ESPIC et structures agréées : découvrez où effectuer votre Parcours de Consolidation des Compétences (PCC) après les Épreuves de Vérification des Connaissances (EVC) et comment obtenir votre autorisation d'exercice."
          rightArea={
            <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#DBEAFE_0%,#E7F6EC_100%)] lg:aspect-auto lg:h-48">
              <div className="flex h-full items-center justify-center">
                <Building2 className="h-16 w-16 text-[#1E4D8B]/40" />
              </div>
            </div>
          }
        />

        {/* Parcours en 4 étapes */}
        <section className="mb-6 rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-[#1A2233]">Le parcours PAE en 4 étapes clés</h2>
          <div className="grid items-stretch gap-3 sm:grid-cols-4">
            {PARCOURS.map((p, i) => (
              <div key={p.label} className="relative rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-4">
                <span
                  className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-extrabold text-white"
                  style={{ background: p.fg }}
                >
                  {i + 1}
                </span>
                <span className="mt-2 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: p.bg, color: p.fg }}>
                  <p.Icon className="h-5 w-5" />
                </span>
                <p className="mt-2 text-[12.5px] font-bold leading-snug text-[#1A2233]">{p.label}</p>
                <p className="mt-1 text-[11px] text-[#52607A]">{p.sub}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-[#E5F1FF] px-3 py-2 text-[11px] text-[#1E4D8B]">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-[#1E4D8B]" />
            Depuis la réforme 2025, une saisine anticipée de la CNAE peut être possible après 6 mois de PCC dans certains cas (avis favorable du responsable de structure et de la commission compétente).
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Contenu */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <BoxSection num={1} title="Qui est concerné par la PAE ?">
                <ul className="space-y-2 text-[13px] text-[#1A2233]">
                  <ListIcon Icon={Users} label="Médecins PADHUE" sub="Diplômes obtenus en dehors de l'UE" />
                  <ListIcon Icon={Building2} label="Français ou étrangers diplômés hors UE" sub="Diplômes obtenus dans un pays tiers" />
                  <ListIcon Icon={ClipboardCheck} label="Diplômes non reconnus automatiquement" sub="Nécessitent une procédure spécifique" />
                  <ListIcon Icon={Award} label="Parcours EVC puis PCC avant autorisation d'exercice" />
                </ul>
              </BoxSection>
              <BoxSection num={2} title="Les EVC : une étape nationale">
                <p className="text-[13px] text-[#52607A]">Les Épreuves de Vérification des Connaissances permettent d&rsquo;évaluer :</p>
                <ul className="mt-2 space-y-1.5 text-[13px] text-[#1A2233]">
                  <CheckSmall>Les connaissances médicales</CheckSmall>
                  <CheckSmall>Le raisonnement clinique</CheckSmall>
                  <CheckSmall>La prise en charge thérapeutique</CheckSmall>
                  <CheckSmall>La compréhension du système de santé français</CheckSmall>
                  <CheckSmall>La capacité d&rsquo;intégration professionnelle</CheckSmall>
                </ul>
              </BoxSection>
            </div>

            <BoxSection num={3} title="Le Parcours de Consolidation des Compétences (PCC)">
              <p className="text-[13px] text-[#1A2233]">
                Le PCC est réalisé dans une structure agréée ou habilitée dans le cadre de la PAE.
                Le praticien est rattaché à une UFR de médecine de son lieu d&rsquo;affectation.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  { Icon: GraduationCap, t: 'Suivi universitaire obligatoire' },
                  { Icon: Stethoscope,   t: 'Activité clinique encadrée' },
                  { Icon: Activity,      t: 'Montée progressive en autonomie' },
                  { Icon: Target,        t: 'Évaluation continue' },
                  { Icon: CheckCircle2,  t: 'Acquisition et consolidation des compétences' },
                ].map((s) => (
                  <div key={s.t} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3 text-center">
                    <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#16A34A]">
                      <s.Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-2 text-[11px] font-semibold leading-snug text-[#1A2233]">{s.t}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-[#DCFCE7] px-3 py-2 text-[11px] text-[#16793C]">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-[#16A34A]" />
                Nouveauté 2025 : dans certains cas, une saisine anticipée de la CNAE peut être possible
                après environ 6 mois de PCC, sous avis favorable du responsable de structure et de la commission compétente.
              </p>
            </BoxSection>

            {/* Tableau comparatif */}
            <BoxSection num={4} title="Où réaliser son PCC ? Les structures d'accueil agréées">
              <p className="text-[12.5px] text-[#52607A]">
                Le PCC doit être réalisé dans une structure agréée ou habilitée dans le cadre de la PAE.
                Toutes les structures ne sont pas éligibles.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[680px] border-separate border-spacing-0 text-[12px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-[#9AA1AE]">
                      <th className="border-b border-[#ECEEF1] pb-2 pr-2">Type de structure</th>
                      <th className="border-b border-[#ECEEF1] pb-2 px-2">Encadrement médical</th>
                      <th className="border-b border-[#ECEEF1] pb-2 px-2">Activité clinique</th>
                      <th className="border-b border-[#ECEEF1] pb-2 px-2">Formation &amp; suivi universitaire</th>
                      <th className="border-b border-[#ECEEF1] pb-2 px-2">Perspectives professionnelles</th>
                      <th className="border-b border-[#ECEEF1] pb-2 pl-2">Exemples</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#1A2233]">
                    {STRUCTURES.map((s) => (
                      <tr key={s.type}>
                        <td className="border-b border-[#F2F3F5] py-3 pr-2 font-semibold">{s.type}</td>
                        <td className="border-b border-[#F2F3F5] py-3 px-2"><Stars n={s.medical} /></td>
                        <td className="border-b border-[#F2F3F5] py-3 px-2"><Stars n={s.clinique} /></td>
                        <td className="border-b border-[#F2F3F5] py-3 px-2"><Stars n={s.formation} /></td>
                        <td className="border-b border-[#F2F3F5] py-3 px-2"><Stars n={s.perspectives} /></td>
                        <td className="border-b border-[#F2F3F5] py-3 pl-2 text-[11px] text-[#52607A]">{s.exemples}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-[#FEF3C7] px-3 py-2 text-[11px] text-[#92400E]">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Toutes les structures ne sont pas éligibles. L&rsquo;affectation est décidée par le CNG ou l&rsquo;ARS
                en fonction des postes disponibles et du projet professionnel du candidat.
              </p>
            </BoxSection>

            <div className="grid gap-4 sm:grid-cols-3">
              <SmallBlock num={5} title="Les CHU : la structure de référence"
                bullets={['Encadrement universitaire reconnu', 'Large palette de spécialités', 'Recherche et innovation', 'Formation continue de haut niveau', 'Multiples opportunités professionnelles']} />
              <SmallBlock num={6} title="Établissements privés et ESPIC"
                bullets={['Activité clinique importante et diversifiée', 'Encadrement médical de qualité', 'Intégration progressive et accompagnée', 'Découverte du fonctionnement du secteur privé', 'Excellentes perspectives d\'intégration']} />
              <SmallBlock num={7} title="Structures sanitaires et médico-sociales agréées"
                bullets={['Centres de santé, SSR, PMI, CSAPA…', 'Établissements et services habilités', 'Selon le projet professionnel du candidat', 'Cadre d\'activité varié et formateur']} />
            </div>

            <BoxSection num={8} title="Validation finale du parcours : le chemin vers l'autorisation d'exercice">
              <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {['Fin du PCC (2 ans validés)', 'Rapport d\'évaluation par le responsable de structure', 'Avis de la commission compétente', 'Saisine de la CNAE (évaluation finale)', 'Autorisation d\'exercice délivrée par le Ministère de la Santé'].map((s, i) => (
                  <li key={s} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3 text-center">
                    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#FDE7E9] text-[11px] font-extrabold text-[#C0001F]">{i + 1}</span>
                    <p className="mt-2 text-[11.5px] font-semibold leading-snug text-[#1A2233]">{s}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[12px] text-[#52607A]">
                Depuis 2025, une saisine anticipée de la CNAE peut être possible après 6 mois de PCC
                pour certains médecins, sous avis favorable du responsable de structure et de la commission compétente.
              </p>
            </BoxSection>

            <section className="rounded-2xl border border-[#ECEEF1] bg-[#FFF1F3] p-5">
              <h2 className="text-[18px] font-extrabold text-[#1A2233]">FAQ — Vos questions fréquentes</h2>
              <ul className="mt-3 space-y-2">
                {FAQS.map(([q, a]) => (
                  <li key={q} className="rounded-xl border border-[#FACBD0] bg-white p-3">
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between text-[13px] font-semibold text-[#1A2233]">
                        {q}
                        <ChevronDown className="h-4 w-4 text-[#9AA1AE] transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-2 text-[12.5px] text-[#52607A]">{a}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309]">
                  <Target className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#1A2233]">À retenir</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#1A2233]">
                    La réussite des Épreuves de Vérification des Connaissances (EVC) constitue la première étape
                    de la Procédure d&rsquo;Autorisation d&rsquo;Exercice (PAE). Après les EVC, les médecins réalisent
                    un Parcours de Consolidation des Compétences (PCC) de 2 ans dans une structure agréée avant
                    d&rsquo;obtenir leur autorisation d&rsquo;exercice définitive.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { Icon: ClipboardCheck, t: 'EVC', sub: '(étape 1)' },
                  { Icon: Building2,      t: 'PCC', sub: '(2 ans)' },
                  { Icon: Users,          t: 'CNAE', sub: '(évaluation)' },
                  { Icon: Award,          t: 'Autorisation d\'exercice', sub: '' },
                ].map((s) => (
                  <div key={s.t} className="rounded-lg border border-[#FCD34D] bg-white p-3 text-center">
                    <s.Icon className="mx-auto h-5 w-5 text-[#B45309]" />
                    <p className="mt-1 text-[12px] font-bold text-[#1A2233]">{s.t}</p>
                    {s.sub && <p className="text-[10px] text-[#9AA1AE]">{s.sub}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Aside */}
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <SidebarTocCompact items={TOC} />
            <PrepCtaCard
              title="Préparation EVC PADHUE : l'expertise Major ECN depuis 15 ans"
              bullets={[
                '45 spécialités médicales',
                'QCM corrigés et commentés',
                'Cas cliniques progressifs',
                'Révisions transversales',
                'Épreuves blanches',
                'Suivi pédagogique personnalisé',
                'Méthodologie spécifique EVC et conseils d\'experts',
              ]}
              ctaLabel="Découvrir la préparation EVC"
            />
            <section className="rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Recevez nos meilleurs conseils EVC</h3>
              <NewsletterForm />
            </section>
            <ArticleSidebarPopular currentSlug={article.slug} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function BoxSection({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
      <h2 className="text-[16px] font-extrabold text-[#1A2233]">{num}. {title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SmallBlock({ num, title, bullets }: { num: number; title: string; bullets: string[] }) {
  return (
    <section className="rounded-2xl border border-[#ECEEF1] bg-white p-4 shadow-sm">
      <p className="text-[12px] font-extrabold uppercase tracking-wide text-[#9AA1AE]">Section {num}</p>
      <h3 className="mt-0.5 text-[14px] font-bold leading-snug text-[#1A2233]">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-[12px] text-[#1A2233]">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#16A34A]" /> {b}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ListIcon({ Icon, label, sub }: { Icon: React.ElementType; label: string; sub?: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E5F1FF] text-[#1E4D8B]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-semibold text-[#1A2233]">{label}</p>
        {sub && <p className="text-[11px] text-[#9AA1AE]">{sub}</p>}
      </div>
    </li>
  );
}

function CheckSmall({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
      {children}
    </li>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[#F59E0B]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? '' : 'opacity-25'}>★</span>
      ))}
    </span>
  );
}

function SidebarTocCompact({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
      <h3 className="text-[15px] font-bold text-[#1A2233]">Dans cet article</h3>
      <ol className="mt-3 space-y-1.5 text-[12px]">
        {items.map((t, i) => (
          <li key={t} className="flex items-start gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FFE4E8] text-[9px] font-extrabold text-[#E4002B]">{i + 1}</span>
            <a href={`#sec-${i + 1}`} className="text-[#1A2233] hover:text-[#E4002B]">{t}</a>
          </li>
        ))}
      </ol>
    </section>
  );
}
