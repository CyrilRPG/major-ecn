import { CheckCircle2, ShieldCheck, Users, Building2, MapPin, HeartHandshake, BookOpen, ClipboardCheck, ArrowUp, GraduationCap, Stethoscope, FileText, ChevronDown } from 'lucide-react';
import { ArticleHeader, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import { NewsletterForm } from '../newsletter-form';
import { ArticleSidebarPopular } from '../article-sidebar-popular';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const TOC = [
  'Qu\'est-ce que les EVC ?',
  'Le rôle clé dans l\'intégration des professionnels',
  'Les EVC et l\'amélioration de l\'accès aux soins',
  'Major-ECN : un accompagnement dédié',
  'Les avantages d\'une préparation structurée',
  'Perspectives d\'avenir pour l\'accès aux soins',
];

const RECAP = [
  { Icon: CheckCircle2, t: 'Les EVC sont une étape obligatoire pour de nombreux PADHUE.' },
  { Icon: ShieldCheck,  t: 'Elles garantissent la qualité et la sécurité des soins.' },
  { Icon: Users,        t: 'Elles facilitent l\'intégration des professionnels de santé formés à l\'étranger.' },
  { Icon: ClipboardCheck, t: 'La réussite des EVC constitue la première étape de la Procédure d\'Autorisation d\'Exercice (PAE).' },
];

const FAQ_BOTTOM = [
  ['Les EVC sont-elles obligatoires ?', 'Oui, pour les médecins diplômés hors UE souhaitant exercer en France.'],
  ['Qui doit passer les EVC ?', 'Les médecins, sages-femmes, pharmaciens et chirurgiens-dentistes diplômés hors Union européenne.'],
  ['Les EVC concernent-elles les pharmaciens ?', 'Oui, les EVC concernent aussi les pharmaciens diplômés hors UE.'],
  ['Comment se préparer aux EVC ?', 'Avec une préparation structurée et complète comme celle proposée par Major ECN.'],
  ['Quel est le rôle de la PAE ?', 'La PAE est la procédure globale qui inclut les EVC, le PCC, et l\'autorisation finale d\'exercice.'],
];

export function ArticleImpactEvc({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Un regard à travers le prisme de Major-ECN sur la manière dont les EVC renforcent le système de santé français."
          rightArea={
            <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#E5F1FF_0%,#FFE4E8_100%)] lg:aspect-auto lg:h-44">
              <div className="flex h-full items-center justify-center">
                <Stethoscope className="h-16 w-16 text-[#1E4D8B]/40" />
              </div>
            </div>
          }
        />

        {/* Auteur */}
        <div className="-mt-1 mb-6 inline-flex items-center gap-2 rounded-lg border border-[#ECEEF1] bg-white px-3 py-2 text-[12px] shadow-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE4E8] text-[10px] font-extrabold text-[#C0001F]">ME</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9AA1AE]">Rédigé par</p>
            <p className="font-semibold text-[#1A2233]">L&rsquo;équipe pédagogique Major ECN</p>
          </div>
        </div>

        {/* Sommaire en haut + récap */}
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
          <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#9AA1AE]"><BookOpen className="mr-1 inline h-3.5 w-3.5" /> Sommaire</h3>
            <ol className="mt-3 space-y-1.5 text-[12.5px]">
              {TOC.map((t, i) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFE4E8] text-[10px] font-extrabold text-[#E4002B]">{i + 1}</span>
                  <a href={`#impact-${i + 1}`} className="text-[#1A2233] hover:text-[#E4002B]">{t}</a>
                </li>
              ))}
            </ol>
            <a href="#top" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#9AA1AE] hover:text-[#1A2233]">
              <ArrowUp className="h-3 w-3" /> Haut de la page
            </a>
          </section>
          <section className="rounded-2xl border border-[#ECEEF1] bg-[#EDE9FE]/40 p-5">
            <h3 className="text-[13px] font-bold text-[#1A2233]">À retenir</h3>
            <ul className="mt-3 grid gap-2.5 text-[12.5px] text-[#1A2233] sm:grid-cols-2">
              {RECAP.map((r) => (
                <li key={r.t} className="flex items-start gap-2"><r.Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" /> {r.t}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Article body + aside */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Sec n={1} title="Les Épreuves de Vérification des Connaissances : qu'est-ce que c'est ?">
              <p>
                Les EVC sont des examens requis pour les candidats qui détiennent des diplômes étrangers et qui souhaitent exercer
                en France en tant que médecins, sages-femmes, pharmaciens ou chirurgiens-dentistes. Elles se composent de deux
                épreuves écrites, conçues pour évaluer les connaissances fondamentales et pratiques.
              </p>
              <div className="mt-3 rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#9AA1AE]">Les EVC concernent</p>
                <ul className="mt-1.5 grid grid-cols-2 gap-1.5 text-[12px] text-[#1A2233]">
                  {[['Users', 'Médecins'], ['Users', 'Sages-femmes'], ['Users', 'Pharmaciens'], ['Lightbulb', 'Chirurgiens-dentistes']].map(([, label]) => (
                    <li key={label} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" /> {label}</li>
                  ))}
                </ul>
              </div>
            </Sec>

            <Sec n={2} title="Un rôle clé pour l'intégration des professionnels de santé">
              <p>
                La proposition de loi actuelle vise à simplifier le parcours d&rsquo;intégration des professionnels
                formés à l&rsquo;étranger, ce qui souligne l&rsquo;importance des EVC. En s&rsquo;assurant que ces professionnels
                répondent aux normes de qualité et de sécurité, les EVC garantissent non seulement une intégration
                réussie, mais aussi la protection de la santé publique.
              </p>
              <div className="mt-3 rounded-xl border border-[#DCFCE7] bg-[#E7F6EC] p-3 text-[12px] text-[#16793C]">
                <p className="font-bold">Pourquoi les EVC sont importantes ?</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { Icon: ShieldCheck, t: 'Sécurité des patients' },
                    { Icon: CheckCircle2, t: 'Harmonisation des compétences' },
                    { Icon: HeartHandshake, t: 'Intégration progressive' },
                    { Icon: Building2, t: 'Reconnaissance professionnelle' },
                  ].map((s) => (
                    <div key={s.t} className="rounded-lg bg-white p-2 text-center">
                      <s.Icon className="mx-auto h-4 w-4 text-[#16A34A]" />
                      <p className="mt-1 text-[11px] font-semibold text-[#1A2233]">{s.t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Sec>

            <Sec n={3} title="Les EVC et l'amélioration de l'accès aux soins">
              <p>
                Les EVC jouent un rôle essentiel dans le renforcement du système de santé français. En facilitant
                l&rsquo;accès à la profession, elles permettent de répondre aux besoins croissants de la population.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  { Icon: Users, t: 'Plus de professionnels de santé' },
                  { Icon: Building2, t: 'Renforcement des établissements de santé' },
                  { Icon: MapPin, t: 'Réduction des déserts médicaux' },
                  { Icon: HeartHandshake, t: 'Amélioration de la continuité et de la qualité des soins' },
                ].map((s) => (
                  <div key={s.t} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3 text-center">
                    <s.Icon className="mx-auto h-5 w-5 text-[#1E4D8B]" />
                    <p className="mt-2 text-[11.5px] font-semibold leading-snug text-[#1A2233]">{s.t}</p>
                  </div>
                ))}
              </div>
            </Sec>

            <Sec n={4} title="Major-ECN : un accompagnement dédié aux EVC">
              <p>
                Chez Major-ECN, nous comprenons les défis uniques auxquels sont confrontés les candidats aux EVC.
                C&rsquo;est pourquoi nous avons mis en place des programmes de préparation adaptés, qui couvrent les
                connaissances nécessaires et offrent un soutien personnalisé.
              </p>
            </Sec>

            <Sec n={5} title="Les avantages d'une préparation structurée">
              <p>
                S&rsquo;inscrire à un programme de préparation comme celui de Major-ECN permet aux candidats de bénéficier
                d&rsquo;une approche structurée et ciblée.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { Icon: Compass4, t: 'Méthodologie', sub: 'Organisation efficace et plan de travail personnalisé.' },
                  { Icon: Stethoscope, t: 'Entraînement', sub: 'QCM, cas cliniques et annales pour se préparer.' },
                  { Icon: BookOpen, t: 'Révisions', sub: 'Fiches, révisions transversales et rappels clés.' },
                  { Icon: ClipboardCheck, t: 'Évaluation', sub: 'Tests blancs et suivi régulier de la progression.' },
                ].map((s) => (
                  <div key={s.t} className="rounded-xl border border-[#ECEEF1] bg-white p-3 text-center">
                    <s.Icon className="mx-auto h-5 w-5 text-[#C0001F]" />
                    <p className="mt-2 text-[12px] font-bold text-[#1A2233]">{s.t}</p>
                    <p className="mt-1 text-[11px] leading-snug text-[#52607A]">{s.sub}</p>
                  </div>
                ))}
              </div>
            </Sec>

            <Sec n={6} title="Un avenir prometteur pour l'accès aux soins">
              <p>
                La combinaison des EVC et de la proposition de loi pour améliorer l&rsquo;accès aux soins représente
                une avancée significative pour le système de santé français.
              </p>
            </Sec>

            {/* CTA gros */}
            <section className="overflow-hidden rounded-2xl border border-[#0E1626]/15 bg-[linear-gradient(135deg,#0E1626_0%,#3B1268_100%)] p-6 text-white">
              <div className="grid items-center gap-4 sm:grid-cols-[1.4fr_1fr]">
                <div>
                  <h3 className="text-[20px] font-extrabold leading-tight">Vous préparez les EVC ?</h3>
                  <p className="mt-1 text-[13px] text-white/80">Une plateforme conçue exclusivement pour les candidats aux EVC</p>
                  <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[12px]">
                    {['15 ans d\'expérience', 'Cas cliniques', '45 spécialités couvertes', 'Révisions transversales', 'QCM corrigés', 'Épreuves blanches', 'Accompagnement pédagogique personnalisé'].map((b) => (
                      <li key={b} className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 h-3 w-3 text-[#16A34A]" /> {b}</li>
                    ))}
                  </ul>
                </div>
                <a href="/plateforme" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-3 text-[13px] font-bold">
                  Découvrir Major ECN →
                </a>
              </div>
            </section>

            {/* FAQ bas */}
            <section>
              <h3 className="text-[15px] font-bold text-[#1A2233]">Questions fréquentes</h3>
              <ul className="mt-3 space-y-2">
                {FAQ_BOTTOM.map(([q, a]) => (
                  <li key={q} className="rounded-xl border border-[#ECEEF1] bg-white p-3">
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
          </div>

          {/* Aside */}
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-2xl border border-[#0E1626]/15 bg-[linear-gradient(135deg,#0E1626_0%,#3B1268_100%)] p-5 text-white">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">Major-ECN, votre partenaire pour réussir les EVC</p>
              <ul className="mt-3 space-y-1.5 text-[12px]">
                {['Préparation EVC dédiée', 'QCM, cas cliniques et fiches', 'Révisions transversales', 'Épreuves blanches', 'Suivi personnalisé', 'Équipe pédagogique experte'].map((b) => (
                  <li key={b} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 text-[#E4002B]" /> {b}</li>
                ))}
              </ul>
              <a href="/plateforme" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-bold">
                Découvrir la plateforme →
              </a>
            </section>

            <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Les EVC en quelques chiffres</h3>
              <ul className="mt-3 space-y-2.5">
                {[
                  { v: '45', sub: 'spécialités préparées' },
                  { v: '15 ans', sub: 'd\'expérience dans la préparation EVC' },
                  { v: '1000+', sub: 'médecins accompagnés chaque année' },
                  { v: 'Équipe experte', sub: 'composée de PH, Chef de service, CCA et de spécialistes' },
                  { v: 'QCM, cas cliniques, fiches et épreuves blanches', sub: '' },
                ].map((s) => (
                  <li key={s.v} className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFE4E8] text-[#C0001F]"><GraduationCap className="h-3.5 w-3.5" /></span>
                    <div>
                      <p className="text-[13px] font-bold text-[#1A2233]">{s.v}</p>
                      {s.sub && <p className="text-[11px] text-[#9AA1AE]">{s.sub}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-[#FED7AA] bg-[#FFFBEB] p-5">
              <p className="text-[12px] italic leading-relaxed text-[#1A2233]">
                « La préparation Major ECN m&rsquo;a permis d&rsquo;aborder les EVC avec une méthodologie claire
                et une meilleure organisation de mes révisions. »
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE4E8] text-[10px] font-extrabold text-[#C0001F]">DH</span>
                <div>
                  <p className="text-[12px] font-bold text-[#1A2233]">Dr H.</p>
                  <p className="text-[10px] text-[#9AA1AE]">Lauréat EVC PAE</p>
                </div>
              </div>
            </section>

            <PrepCtaCard />
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

function Sec({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={`impact-${n}`} className="scroll-mt-24 rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
      <h2 className="text-[18px] font-extrabold leading-snug text-[#1A2233]">{n}. {title}</h2>
      <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#1A2233]">{children}</div>
    </section>
  );
}

// alias pour éviter conflit d'import
import { Compass as Compass4 } from 'lucide-react';
import { Lightbulb } from 'lucide-react';
void Lightbulb;
