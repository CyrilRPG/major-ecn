import Image from 'next/image';
import { User, Stethoscope, Building2, TrendingUp, MapPin, BookOpen, Award, ShieldCheck, Briefcase, ListChecks, AlertTriangle } from 'lucide-react';
import { ArticleHeader, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import { NewsletterForm } from '../newsletter-form';
import { ArticleSidebarPopular } from '../article-sidebar-popular';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const STATUS = [
  { Icon: User,        bg: '#EDE9FE', fg: '#6D28D9', label: 'Faisant Fonction d\'Interne (FFI)',  brut: '≈ 1 450 €' },
  { Icon: Stethoscope, bg: '#DCFCE7', fg: '#16A34A', label: 'Praticien Attaché Associé (PAA)',     brut: '≈ 3 000 €' },
  { Icon: Building2,   bg: '#FDE7E9', fg: '#C0001F', label: 'Praticien Hospitalier (PH) débutant', brut: '≈ 4 500 €' },
  { Icon: TrendingUp,  bg: '#E5F1FF', fg: '#1E4D8B', label: 'Praticien Hospitalier (PH) expérimenté', brut: 'jusqu\'à 9 200 €' },
];

const TOC = [
  'Qui sont les médecins PADHUE ?',
  'Rémunérations selon les statuts',
  'FFI : salaire et conditions',
  'Praticien Attaché Associé (PAA)',
  'Praticien Hospitalier (PH)',
  'Pourquoi les rémunérations varient-elles autant ?',
  'L\'impact des EVC et de la PAE',
  'Major ECN, votre partenaire pour réussir les EVC',
  'À retenir',
];

export function ArticleRemuneration({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="La France fait appel à de nombreux médecins titulaires de diplômes obtenus hors de l'Union européenne (PADHUE). Avant d'exercer pleinement, ces praticiens passent par les Épreuves de Vérification des Connaissances (EVC), première étape de la Procédure d'Autorisation d'Exercice (PAE)."
          rightArea={
            <div
              className="relative w-full overflow-hidden rounded-2xl border"
              style={{
                borderColor: '#E5E9F0',
                boxShadow: '0 18px 40px -22px rgba(15,31,77,0.30)',
                background: 'linear-gradient(135deg,#E7F6EC 0%,#DBEAFE 100%)',
              }}
            >
              <Image
                src="/blog/remuneration-hero.webp"
                alt="Médecin en blouse au bureau consultant ses documents de rémunération"
                width={1600}
                height={1067}
                className="block w-full h-auto select-none object-contain"
                priority
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 40%, rgba(15,31,77,0.18) 100%)' }}
              />
              {/* Badge "PAE" en haut-gauche */}
              <span
                className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] backdrop-blur"
                style={{ color: '#1E4D8B', boxShadow: '0 6px 14px -8px rgba(15,31,77,0.20)' }}
              >
                <Stethoscope className="h-2.5 w-2.5" />
                Médecin PADHUE
              </span>
            </div>
          }
        />

        {/* Bloc rémunérations 4 colonnes */}
        <section id="section-2" className="mb-6 scroll-mt-24 rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9AA1AE]">
            2. Rémunérations indicatives des médecins étrangers en France selon le statut
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STATUS.map((s) => (
              <div key={s.label} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-4">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: s.bg, color: s.fg }}
                >
                  <s.Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-[12px] font-bold leading-tight text-[#1A2233]">{s.label}</p>
                <p className="mt-2 text-[22px] font-black tabular-nums" style={{ color: s.fg }}>
                  {s.brut}
                </p>
                <p className="text-[11px] text-[#9AA1AE]">brut mensuel</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] italic text-[#9AA1AE]">
            Ces montants sont des moyennes indicatives et peuvent varier selon l&rsquo;établissement, la région et l&rsquo;expérience.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ─── Contenu ─── */}
          <div className="space-y-6">
            <Section
              num={1} icon={User} accent="#6D28D9" bg="#EDE9FE"
              title="Qui sont les médecins PADHUE ?"
              illustrationBg="linear-gradient(135deg,#EDE9FE 0%,#FDE7E9 100%)"
              illustrationImage="/blog/remuneration-padhue.webp"
              illustrationAlt="Médecin PADHUE souriant en blouse blanche, exercant en France"
            >
              <p>
                Le sigle PADHUE désigne les Praticiens à Diplôme Hors Union Européenne :
                médecins, chirurgiens-dentistes, sages-femmes et pharmaciens dont le titre
                a été délivré dans un pays situé en dehors de l&rsquo;Union européenne, de
                l&rsquo;Espace économique européen ou de la Suisse. En France, leur diplôme
                n&rsquo;est pas reconnu automatiquement : un parcours d&rsquo;autorisation
                d&rsquo;exercice est imposé par le Code de la santé publique.
              </p>
              <p className="mt-2">
                Ce parcours porte le nom de Procédure d&rsquo;Autorisation d&rsquo;Exercice (PAE).
                Il s&rsquo;ouvre par les Épreuves de Vérification des Connaissances (EVC), des
                examens nationaux destinés à attester d&rsquo;un socle de compétences cliniques
                aligné sur les standards de formation français. Après les EVC, le praticien
                effectue un Parcours de Consolidation des Compétences (PCC) en milieu hospitalier
                agréé, avant d&rsquo;obtenir une autorisation pleine et entière d&rsquo;exercer.
              </p>
              <p className="mt-2 text-[#52607A]">
                Avant chacune de ces étapes, le statut professionnel — et donc la rémunération —
                évolue de manière significative. Comprendre ces transitions est indispensable
                pour anticiper les écarts de salaire que nous détaillons ci-dessous.
              </p>
              <Callout>PADHUE = Praticien à Diplôme Hors Union Européenne</Callout>
            </Section>

            <Section
              num={3} icon={Award} accent="#6D28D9" bg="#EDE9FE"
              title="Faisant Fonction d'Interne (FFI)"
              illustrationBg="linear-gradient(135deg,#E7F6EC 0%,#DCFCE7 100%)"
              illustrationImage="/blog/remuneration-ffi.webp"
              illustrationAlt="Faisant Fonction d'Interne (FFI) en service hospitalier"
              right
            >
              <p>
                Le statut de Faisant Fonction d&rsquo;Interne est très souvent la première
                porte d&rsquo;entrée des médecins étrangers dans l&rsquo;hôpital public français.
                Recruté en CDD par un établissement, le FFI partage le quotidien des internes
                — services, gardes, contre-visites — sous la supervision étroite d&rsquo;un
                médecin titulaire (PH, PU-PH, MCU-PH). Ce statut permet de se familiariser
                avec la pratique hospitalière française pendant la préparation aux EVC.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <SalaryBox bg="#EDE9FE" fg="#6D28D9" label="Salaire brut mensuel" value="≈ 1 450 €" />
                <SalaryBox bg="#FDE7E9" fg="#C0001F" label="Salaire net estimé" value="1 200 € – 1 300 €" />
              </div>
              <p className="mt-3 text-[12.5px] text-[#52607A]">
                Le niveau de rémunération est aligné sur la grille des internes : il reste
                modeste au regard de la charge de travail et des responsabilités exercées.
                Les indemnités de gardes et d&rsquo;astreintes peuvent toutefois augmenter
                sensiblement le salaire net en fin de mois.
              </p>
              <Characteristics
                items={[
                  'Formation et supervision par des médecins titulaires.',
                  'Statut temporaire : ne garantit pas une stabilité à long terme.',
                  'Heures de travail élevées : gardes de nuit, week-ends et jours fériés fréquents.',
                  'La réussite des EVC est indispensable pour accéder à un poste mieux rémunéré.',
                ]}
              />
            </Section>

            <Section
              num={4} icon={Stethoscope} accent="#16A34A" bg="#DCFCE7"
              title="Praticien Attaché Associé (PAA)"
              illustrationBg="linear-gradient(135deg,#DBEAFE 0%,#E7F6EC 100%)"
              illustrationImage="/blog/remuneration-paa.webp"
              illustrationAlt="Praticien Attaché Associé (PAA) consultant un dossier patient"
            >
              <p>
                Une fois les EVC validées, le médecin PADHUE peut accéder au statut de
                Praticien Attaché Associé. Le PAA est rattaché à une équipe médicale et
                participe aux consultations, à la prise en charge des patients hospitalisés
                et aux gardes — avec un niveau d&rsquo;autonomie supérieur à celui du FFI,
                tout en restant sous la responsabilité d&rsquo;un praticien titulaire référent.
              </p>
              <p className="mt-2 text-[#52607A]">
                C&rsquo;est généralement le statut occupé pendant le Parcours de Consolidation
                des Compétences (PCC), période d&rsquo;exercice supervisé d&rsquo;une durée de
                deux ans pour les médecins. Le contrat est le plus souvent un CDD renouvelable,
                ce qui maintient une certaine précarité statutaire avant l&rsquo;autorisation
                définitive d&rsquo;exercice.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <SalaryBox bg="#DCFCE7" fg="#16A34A" label="Salaire brut mensuel" value="≈ 3 000 €" />
                <SalaryBox bg="#FDE7E9" fg="#C0001F" label="Salaire net estimé" value="≈ 2 400 €" />
              </div>
              <Characteristics
                items={[
                  'Plus d\'autonomie et de responsabilités dans la prise en charge des patients.',
                  'Poste souvent précaire : contrats à durée déterminée (CDD).',
                  'Rémunération plus équitable que la FFI, mais encore insuffisante pour beaucoup de médecins étrangers.',
                ]}
              />
            </Section>

            <Section
              num={5} icon={Building2} accent="#C0001F" bg="#FDE7E9"
              title="Praticien Hospitalier (PH)"
              illustrationBg="linear-gradient(135deg,#FDE7E9 0%,#EDE9FE 100%)"
              illustrationImage="/blog/remuneration-ph.webp"
              illustrationAlt="Praticien Hospitalier (PH) titulaire en milieu hospitalier"
              right
            >
              <p>
                Le grade de Praticien Hospitalier est le statut de titulaire de la fonction
                publique hospitalière. Il s&rsquo;obtient après l&rsquo;autorisation définitive
                d&rsquo;exercice délivrée à l&rsquo;issue de la PAE et l&rsquo;inscription au
                Tableau de l&rsquo;Ordre des médecins. Le PH bénéficie d&rsquo;un contrat à
                durée indéterminée et d&rsquo;une carrière organisée en treize échelons
                d&rsquo;ancienneté.
              </p>
              <p className="mt-2 text-[#52607A]">
                La rémunération évolue automatiquement avec l&rsquo;ancienneté, les sujétions
                particulières (gardes, astreintes, temps additionnel) et les éventuelles
                primes liées à l&rsquo;exercice en zone sous-dotée ou en spécialité prioritaire.
                C&rsquo;est ce statut qui ouvre l&rsquo;accès aux postes à responsabilités —
                chef de service, chef de pôle, voire PU-PH après concours universitaire.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <SalaryBox bg="#EDE9FE" fg="#6D28D9" label="Début de carrière" value="≈ 4 500 €" sub="Salaire brut mensuel" />
                <SalaryBox bg="#DCFCE7" fg="#16A34A" label="Fin de carrière" value="jusqu'à 9 200 €" sub="Salaire brut mensuel" />
                <SalaryBox bg="#FDE7E9" fg="#C0001F" label="Salaire net estimé" value="3 600 € – 7 000 €" />
              </div>
              <Characteristics
                items={[
                  'Stabilité professionnelle : contrat à durée indéterminée (CDI).',
                  'Avantages sociaux : congés payés, couverture sociale complète, retraite plus avantageuse.',
                  'Évolution de carrière : possibilité d\'évoluer vers des postes à responsabilités (chef de service, PU-PH, etc.).',
                  'Responsabilités accrues : gestion d\'équipes, direction de services ou d\'unités hospitalières.',
                ]}
              />
            </Section>

            <Section
              num={6} icon={MapPin} accent="#C0001F" bg="#FDE7E9"
              title="Pourquoi les rémunérations varient-elles autant ?"
            >
              <p>
                Les écarts de rémunération entre un FFI et un PH expérimenté peuvent
                représenter un facteur supérieur à six. Ces différences ne sont pas
                arbitraires : elles reflètent l&rsquo;évolution du statut, des responsabilités
                et du périmètre d&rsquo;exercice du praticien tout au long de la PAE.
                Au-delà de l&rsquo;ancienneté, plusieurs leviers expliquent la dispersion
                des salaires observés en France.
              </p>
              <p className="mt-2 text-[13.5px] text-[#52607A]">Plusieurs facteurs expliquent ces écarts de salaire :</p>
              <ul className="mt-3 space-y-2 text-[13.5px] text-[#1A2233]">
                <CheckLi>Région d&rsquo;exercice (coût de la vie, tension de l&rsquo;offre de soins).</CheckLi>
                <CheckLi>Ancienneté et expérience professionnelle.</CheckLi>
                <CheckLi>Spécialité médicale exercée.</CheckLi>
                <CheckLi>Gardes, astreintes et sujétions particulières.</CheckLi>
                <CheckLi>Type d&rsquo;établissement (public, CHU, clinique…).</CheckLi>
              </ul>
            </Section>

            <Section
              num={7} icon={ShieldCheck} accent="#C0001F" bg="#FDE7E9"
              title="L'impact des EVC et de la PAE sur la rémunération"
            >
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
                {['Réussite des EVC', 'Parcours PAE', 'Accès aux postes titulaires', 'Meilleure rémunération', 'Évolution professionnelle'].map((s, i) => (
                  <div key={s} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3 text-center">
                    <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#FDE7E9] text-[12px] font-extrabold text-[#C0001F]">
                      {i + 1}
                    </span>
                    <p className="mt-2 text-[11.5px] font-semibold leading-snug text-[#1A2233]">{s}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[12.5px] text-[#52607A]">
                La réussite des EVC est l&rsquo;étape clé qui permet aux médecins étrangers d&rsquo;obtenir
                leur autorisation d&rsquo;exercice et d&rsquo;accéder à des postes plus stables, reconnus et mieux rémunérés.
              </p>
            </Section>

            <Section
              num={8} icon={BookOpen} accent="#C0001F" bg="#FDE7E9"
              title="Major ECN, votre partenaire pour réussir les EVC"
              soft
            >
              <div className="grid items-center gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  Les Épreuves de Vérification des Connaissances (EVC) constituent une étape déterminante
                  pour les médecins étrangers souhaitant obtenir leur autorisation d&rsquo;exercice en France
                  dans le cadre de la PAE.
                  <p className="mt-2 text-[13px] text-[#52607A]">
                    Depuis plus de 15 ans, Major ECN accompagne les candidats aux EVC grâce à une préparation
                    complète et ciblée.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {['toutes les spécialités couvertes', 'QCM corrigés', 'Cas cliniques', 'Révisions transversales', 'Épreuves blanches'].map((b) => (
                      <span key={b} className="rounded-lg bg-[#FDE7E9] px-2.5 py-1.5 text-center text-[11px] font-semibold text-[#C0001F]">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <span aria-hidden
                    className="pointer-events-none absolute -inset-x-2 -bottom-2 -z-10 h-12 rounded-[40px] opacity-50 blur-2xl"
                    style={{ background: 'radial-gradient(closest-side, rgba(192,0,31,0.35) 0%, transparent 70%)' }} />
                  <div
                    className="relative overflow-hidden rounded-2xl border bg-white"
                    style={{ borderColor: '#FACBD0', boxShadow: '0 18px 36px -22px rgba(192,0,31,0.30)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/plateforme/laptop-phone-dashboard.png"
                      alt="Plateforme Major ECN sur ordinateur portable et smartphone"
                      className="block h-auto w-full select-none"
                      loading="lazy"
                      decoding="async"
                    />
                    <span aria-hidden className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-40 blur-2xl"
                      style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), transparent 70%)' }} />
                  </div>
                </div>
              </div>
              <a
                href="/plateforme"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-transform hover:scale-[1.01]"
              >
                Découvrir la préparation EVC de Major ECN →
              </a>
            </Section>

            <RetentionBlock
              num={9}
              title="À retenir"
              text="La réussite des EVC constitue généralement l'étape déterminante permettant aux médecins étrangers d'accéder à des postes plus stables, reconnus et mieux rémunérés au sein du système de santé français."
            />
          </div>

          {/* ─── Aside ─── */}
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <SidebarToc items={TOC} />
            <PrepCtaCard />
            <section className="rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Recevez nos meilleurs conseils EVC</h3>
              <p className="mt-1 text-[12px] text-[#52607A]">
                Chaque semaine, nos conseils et actualités directement dans votre boîte mail.
              </p>
              <NewsletterForm />
              <p className="mt-2 text-[11px] text-[#9AA1AE]">Pas de spam, désinscription en 1 clic.</p>
            </section>
            <ArticleSidebarPopular currentSlug={article.slug} />
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ─────────────── Sous-composants ─────────────── */

function Section({
  num, icon: Icon, accent, bg, title, children,
  illustrationBg, illustrationIcon: IIcon, illustrationImage, illustrationAlt,
  right = false, soft = false,
}: {
  num: number; icon: React.ElementType; accent: string; bg: string;
  title: string; children: React.ReactNode;
  illustrationBg?: string; illustrationIcon?: React.ElementType;
  illustrationImage?: string; illustrationAlt?: string;
  right?: boolean;
  soft?: boolean;
}) {
  void accent;
  const hasIllustration = !!IIcon || !!illustrationImage;
  return (
    <section
      id={`section-${num}`}
      className="scroll-mt-24 rounded-2xl border p-5 sm:p-6"
      style={
        soft
          ? { background: 'linear-gradient(135deg,#FFF1F3 0%,#FFE4E8 100%)', borderColor: '#FACBD0' }
          : { background: '#FFFFFF', borderColor: '#ECEEF1' }
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: bg, color: accent }}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h2 className="text-[18px] font-extrabold leading-snug text-[#1A2233]">
          {num}. {title}
        </h2>
      </div>
      <div className={`grid items-start gap-4 ${hasIllustration ? 'lg:grid-cols-[1.6fr_1fr]' : ''} mt-3`}>
        <div className={`text-[13.5px] leading-relaxed text-[#1A2233] ${right ? 'order-2 lg:order-1' : ''}`}>
          {children}
        </div>
        {hasIllustration && (
          <div
            className={`order-1 ${right ? 'lg:order-2' : ''} hidden overflow-hidden rounded-xl border lg:block`}
            style={{ background: illustrationBg, borderColor: '#ECEEF1' }}
          >
            {illustrationImage ? (
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={illustrationImage}
                  alt={illustrationAlt ?? title}
                  className="block h-auto w-full select-none"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
                  style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(15,31,77,0.10) 100%)' }}
                />
              </div>
            ) : IIcon ? (
              <div className="flex h-44 w-full items-center justify-center">
                <IIcon className="h-12 w-12 text-[#1A2233]/30" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function SalaryBox({ bg, fg, label, value, sub }: { bg: string; fg: string; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: bg }}>
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: fg }}>{label}</p>
      <p className="mt-0.5 text-[16px] font-black tabular-nums text-[#1A2233]">{value}</p>
      {sub && <p className="text-[10px] text-[#9AA1AE]">{sub}</p>}
    </div>
  );
}

function Characteristics({ items }: { items: string[] }) {
  return (
    <div className="mt-3 rounded-xl bg-[#FAFBFE] p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#9AA1AE]">
        <ListChecks className="mr-1 inline h-3 w-3" /> Caractéristiques
      </p>
      <ul className="mt-1.5 space-y-1 text-[12.5px] text-[#1A2233]">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-1.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9AA1AE]" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckLi({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M2 6l3 3 5-6" />
        </svg>
      </span>
      {children}
    </li>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#EDE9FE] px-3 py-1.5 text-[12px] font-semibold text-[#6D28D9]">
      <span className="h-2 w-2 rounded-full bg-[#6D28D9]" /> {children}
    </p>
  );
}

function RetentionBlock({ num, title, text }: { num: number; title: string; text: string }) {
  return (
    <section id={`section-${num}`} className="scroll-mt-24 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309]">
          <AlertTriangle className="h-4.5 w-4.5" />
        </span>
        <div>
          <h2 className="text-[18px] font-extrabold text-[#1A2233]">{num}. {title}</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#1A2233]">{text}</p>
        </div>
      </div>
    </section>
  );
}

function SidebarToc({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
      <h3 className="text-[15px] font-bold text-[#1A2233]">Dans cet article</h3>
      <ol className="mt-3 space-y-2 text-[12.5px]">
        {items.map((t, i) => (
          <li key={t} className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFE4E8] text-[10px] font-extrabold text-[#E4002B]">
              {i + 1}
            </span>
            <a href={`#section-${i + 1}`} className="text-[#1A2233] hover:text-[#E4002B]">{t}</a>
          </li>
        ))}
      </ol>
    </section>
  );
}
