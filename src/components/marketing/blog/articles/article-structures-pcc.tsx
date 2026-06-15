import { CheckCircle2, Building2, Stethoscope, ClipboardCheck, Award, ChevronDown, Users, GraduationCap, BookOpen, Activity, Target, AlertTriangle, Info, Home, HeartPulse, FileText, Building, Heart } from 'lucide-react';
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
  'Validation finale & autorisation d\'exercice',
  'FAQ — Vos questions fréquentes',
  'À retenir',
];

const STRUCTURES = [
  { type: 'CHU (Centres Hospitalo-Universitaires)', medical: 5, clinique: 5, formation: 5, perspectives: 5, exemples: 'Hôpitaux universitaires, pôles spécialisés, recherche, CHU régionaux' },
  { type: 'Établissements privés (ESPIC et cliniques agréés)', medical: 4, clinique: 4, formation: 3, perspectives: 4, exemples: 'Cliniques privées, ESPIC, établissements de santé privés d\'intérêt collectif' },
  { type: 'Structures sanitaires agréées', medical: 4, clinique: 4, formation: 3, perspectives: 4, exemples: 'Centres de santé, SSR, établissements spécialisés' },
  { type: 'Structures médico-sociales agréées (selon le projet professionnel)', medical: 3, clinique: 3, formation: 3, perspectives: 3, exemples: 'EHPAD, PMI, services médico-sociaux, structures habilitées' },
];

/* Nouvelle table pixel-perfect — structures habilitées avec icônes colorées,
   colonne "PCC possible ?" Oui (vert) et particularités. */
const STRUCTURES_HABILITEES: Array<{
  Icon: typeof Building2;
  iconBg: string;
  iconFg: string;
  title: string;
  subtitle?: string;
  details: string[];
}> = [
  { Icon: Building2,   iconBg: '#E5F1FF', iconFg: '#1E4D8B', title: 'CHU',
    subtitle: '(Centres Hospitaliers Universitaires)',
    details: ['Activité universitaire et hospitalière,', 'plateau technique complet, recherche.'] },
  { Icon: Building,    iconBg: '#DCFCE7', iconFg: '#16A34A', title: 'Centre Hospitalier',
    subtitle: '(CH)',
    details: ['Activité hospitalière de proximité', 'ou spécialisée.'] },
  { Icon: HeartPulse,  iconBg: '#EDE9FE', iconFg: '#6D28D9', title: 'Établissement de Santé Privé',
    subtitle: 'd’Intérêt Collectif (ESPIC)',
    details: ['Établissements privés à but non lucratif', '(ex : fondations, centres spécialisés).'] },
  { Icon: Stethoscope, iconBg: '#FFE4E8', iconFg: '#C0001F', title: 'Clinique privée habilitée',
    details: ['Selon l’habilitation accordée', 'pour l’accueil des lauréats de la PAE.'] },
  { Icon: Heart,       iconBg: '#DCFCE7', iconFg: '#0F8A6A', title: 'Centre de santé habilité',
    details: ['Structures de soins de premier recours', 'habilitées, selon les postes ouverts.'] },
  { Icon: Home,        iconBg: '#FEF3E2', iconFg: '#D97706', title: 'Structure médico-sociale habilitée',
    details: ['Structures pouvant proposer des missions', 'en lien avec le projet professionnel.'] },
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
            <div
              className="relative w-full overflow-hidden rounded-2xl border"
              style={{
                borderColor: '#E5E9F0',
                boxShadow: '0 18px 40px -22px rgba(15,31,77,0.30)',
                background: 'linear-gradient(135deg,#DBEAFE 0%,#E7F6EC 100%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/blog/medecins-essentiels-corridor.jpg"
                alt="Équipe médicale dans un couloir de CHU, structure d'accueil pour le PCC"
                className="block h-auto w-full select-none"
                decoding="async"
                fetchPriority="high"
              />
              <span aria-hidden className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 40%, rgba(15,31,77,0.18) 100%)' }} />
              <span
                className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] backdrop-blur"
                style={{ color: '#1E4D8B', boxShadow: '0 6px 14px -8px rgba(15,31,77,0.20)' }}
              >
                <Building2 className="h-2.5 w-2.5" />
                Structures d&rsquo;accueil PAE
              </span>
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
                Le PCC est une période d&rsquo;exercice supervisé qui fait suite à la réussite
                des EVC. Sa durée est fixée à deux années pour les médecins, et à un an pour
                les chirurgiens-dentistes et les sages-femmes. Pendant toute cette période,
                le praticien est affecté à un poste hospitalier rémunéré, sous la responsabilité
                pédagogique d&rsquo;un médecin titulaire et le rattachement administratif
                d&rsquo;une UFR de médecine ou de l&rsquo;université dont dépend son lieu
                d&rsquo;exercice.
              </p>
              <p className="mt-2 text-[13px] text-[#52607A]">
                L&rsquo;objectif du PCC est double : confirmer la capacité du candidat à exercer
                en autonomie dans le système de santé français et lui permettre de compléter
                sa formation par des enseignements universitaires ciblés. Une évaluation continue
                ponctue ce parcours et conditionne la suite de la procédure.
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

            {/* Tableau pixel-perfect — structures d'accueil habilitées */}
            <BoxSection num={4} title="Où réaliser son PCC ? Les structures d'accueil habilitées">
              <p className="text-[13px] text-[#1A2233]">
                Le PCC doit être réalisé dans une structure habilitée à accueillir des lauréats de la PAE.
              </p>
              <p className="mt-1 text-[13px] text-[#1A2233]">
                Toutes les structures de santé ne sont pas automatiquement éligibles.
              </p>

              {/* Tableau structures */}
              <div className="mt-4 overflow-hidden rounded-2xl border" style={{ borderColor: '#ECEEF1' }}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-[12.5px]">
                    <thead>
                      <tr className="text-white" style={{ background: '#1E4D8B' }}>
                        <th className="px-4 py-3 text-left text-[12px] font-extrabold">Type de structure</th>
                        <th className="px-4 py-3 text-center text-[12px] font-extrabold">PCC possible&nbsp;?</th>
                        <th className="px-4 py-3 text-left text-[12px] font-extrabold">Particularités</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STRUCTURES_HABILITEES.map((s, idx) => (
                        <tr key={s.title} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFE]'}>
                          {/* Col 1 — Type + icône */}
                          <td className="border-t border-[#F2F3F5] px-4 py-4 align-top">
                            <div className="flex items-start gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: s.iconBg, color: s.iconFg }}>
                                <s.Icon className="h-5 w-5" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[13px] font-extrabold leading-snug text-[#1A2233]">{s.title}</p>
                                {s.subtitle && (
                                  <p className="text-[11.5px] leading-snug text-[#52607A]">{s.subtitle}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Col 2 — Oui badge */}
                          <td className="border-t border-[#F2F3F5] px-4 py-4 align-middle text-center">
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#16A34A]">
                              <CheckCircle2 className="h-4.5 w-4.5 fill-[#16A34A] text-white" />
                              Oui
                            </span>
                          </td>
                          {/* Col 3 — Particularités */}
                          <td className="border-t border-[#F2F3F5] px-4 py-4 align-top text-[12px] text-[#1A2233]">
                            {s.details.map((d, di) => (
                              <p key={di} className="leading-snug">{d}</p>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2 cards : Important (bleu) + À retenir (vert) */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* Important — bleu */}
                <div className="rounded-2xl border p-4"
                  style={{ background: '#F0F5FF', borderColor: '#DCE6FF' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 0 0 3px #DCE6FF inset' }}>
                      <Info className="h-4 w-4" style={{ color: '#1E4D8B' }} />
                    </span>
                    <p className="text-[14px] font-extrabold" style={{ color: '#1E4D8B' }}>Important</p>
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-[#1A2233]">
                    Le Parcours de Consolidation des Compétences (PCC) doit être réalisé dans une{' '}
                    <a href="#" className="font-bold underline" style={{ color: '#1E4D8B' }}>structure habilitée</a>{' '}
                    à accueillir des lauréats de la PAE.
                  </p>
                  <span aria-hidden className="my-3 block h-px" style={{ background: '#DCE6FF' }} />
                  <p className="text-[12.5px] leading-relaxed text-[#1A2233]">
                    Les postes disponibles sont publiés dans le cadre de la procédure nationale.
                    Toutes les structures de santé ne sont pas automatiquement éligibles.
                  </p>
                </div>

                {/* À retenir — vert */}
                <div className="rounded-2xl border p-4"
                  style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 0 0 3px #BBF7D0 inset' }}>
                      <GraduationCap className="h-4 w-4" style={{ color: '#16A34A' }} />
                    </span>
                    <p className="text-[14px] font-extrabold" style={{ color: '#16A34A' }}>À retenir</p>
                  </div>
                  <ul className="mt-3 space-y-2 text-[12.5px] text-[#1A2233]">
                    {[
                      'PCC de 2 ans pour les médecins.',
                      'Inscription universitaire obligatoire dans le cadre du PCC.',
                      'Réalisation du PCC dans une structure habilitée.',
                      'Affectation sur un poste ouvert dans le cadre de la PAE.',
                      'Le CHU n’est pas obligatoire.',
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 leading-snug">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 fill-[#16A34A] text-white" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Références */}
              <p className="mt-4 text-[11.5px] leading-snug text-[#52607A]">
                <span className="font-extrabold text-[#1A2233]">Références :</span>{' '}
                Décret n°&nbsp;2025-447 du 15&nbsp;mai 2025 relatif au parcours de consolidation des compétences des docteurs juniors en médecine
                et à la procédure d&rsquo;affectation — Articles R.&nbsp;632-39-1 à R.&nbsp;632-39-11 du Code de l&rsquo;éducation.
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
              <p className="text-[12.5px] text-[#1A2233]">
                À l&rsquo;issue du Parcours de Consolidation des Compétences, la procédure
                d&rsquo;autorisation d&rsquo;exercice se conclut par une étape d&rsquo;évaluation
                en plusieurs temps. Le candidat constitue un dossier reprenant l&rsquo;ensemble
                de son parcours hospitalier et universitaire, qui est soumis successivement à
                son responsable de structure, à la commission régionale compétente, puis à la
                Commission Nationale d&rsquo;Autorisation d&rsquo;Exercice (CNAE) instituée
                auprès du Centre National de Gestion.
              </p>
              <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {['Fin du PCC (2 ans validés)', 'Rapport d\'évaluation par le responsable de structure', 'Avis de la commission compétente', 'Saisine de la CNAE (évaluation finale)', 'Autorisation d\'exercice délivrée par le Ministère de la Santé'].map((s, i) => (
                  <li key={s} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3 text-center">
                    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#FDE7E9] text-[11px] font-extrabold text-[#C0001F]">{i + 1}</span>
                    <p className="mt-2 text-[11.5px] font-semibold leading-snug text-[#1A2233]">{s}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[12px] text-[#52607A]">
                Une fois l&rsquo;avis favorable de la CNAE obtenu, l&rsquo;arrêté
                d&rsquo;autorisation d&rsquo;exercice est délivré par le ministère chargé de
                la santé. Le praticien peut alors s&rsquo;inscrire au Tableau de
                l&rsquo;Ordre, ce qui ouvre l&rsquo;accès à l&rsquo;exercice de plein droit
                — y compris en secteur libéral. Depuis 2025, une saisine anticipée de la
                CNAE est ouverte dans certains cas dès six mois de PCC, sous avis favorable
                du responsable de structure et de la commission compétente.
              </p>
            </BoxSection>

            <section id="sec-9" className="scroll-mt-24 rounded-2xl border border-[#ECEEF1] bg-[#FFF1F3] p-5">
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

            <section id="sec-10" className="scroll-mt-24 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-5">
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
    <section id={`sec-${num}`} className="scroll-mt-24 rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
      <h2 className="text-[16px] font-extrabold text-[#1A2233]">{num}. {title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SmallBlock({ num, title, bullets }: { num: number; title: string; bullets: string[] }) {
  return (
    <section id={`sec-${num}`} className="scroll-mt-24 rounded-2xl border border-[#ECEEF1] bg-white p-4 shadow-sm">
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
