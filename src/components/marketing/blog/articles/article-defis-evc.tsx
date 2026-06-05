import { BookOpen, FileText, Users, Activity, Compass, Lightbulb, ShieldCheck, Target, ClipboardCheck, Trophy, GraduationCap } from 'lucide-react';
import { ArticleHeader, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import { ArticleSidebarPopular } from '../article-sidebar-popular';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const DEFIS = [
  { n: 1, title: 'Une profusion de sources d\'information', icon: BookOpen,
    intro: 'Le programme des EVC s\'appuie sur un corpus vaste et hétérogène : recommandations de la Haute Autorité de Santé, conférences de consensus des sociétés savantes françaises, données du CRAT, référentiels des collèges d\'enseignants. Sans hiérarchisation, le candidat passe l\'essentiel de son temps à chercher la bonne information au lieu de l\'assimiler.',
    tip: 'Privilégiez en première ligne les recommandations de la HAS et les référentiels actualisés des collèges d\'enseignants français : ce sont ces sources que le jury attend de retrouver dans vos réponses, en particulier pour les arguments thérapeutiques et les conduites à tenir.' },
  { n: 2, title: 'Des épreuves aux exigences élevées', icon: Activity,
    intro: 'Les EVC ne se contentent pas d\'évaluer des connaissances : elles testent la capacité à les mobiliser face à des vignettes cliniques calquées sur la pratique hospitalière française. La typologie des questions (QRU, QRM, raisonnement multi-étapes) demande un entraînement spécifique, distinct de celui des examens du pays d\'origine.',
    tip: 'Familiarisez-vous avec les codes de l\'épreuve française : importance accordée aux mots-clés du raisonnement clinique, hiérarchisation des examens complémentaires, place centrale de la justification thérapeutique conforme aux recommandations.' },
  { n: 3, title: 'Briser l\'isolement : une préparation collaborative avec Major ECN', icon: Users,
    intro: 'La préparation aux EVC s\'étale sur plusieurs mois et combine charge cognitive, contraintes administratives et, le plus souvent, exercice professionnel en parallèle. Avancer seul rend l\'évaluation de ses progrès difficile, entretient les angles morts et fragilise la régularité du travail.',
    tip: 'Intégrez un programme structuré qui combine corrections détaillées, échanges avec des pairs candidats et accompagnement d\'enseignants. La rétroaction régulière sur vos productions est l\'un des leviers les plus efficaces pour progresser.' },
  { n: 4, title: 'Une pénurie de supports d\'entraînement adaptés', icon: FileText,
    intro: 'Les annales officielles d\'EVC sont peu nombreuses et leur disponibilité reste limitée. Les supports généralistes du concours national de médecine ne couvrent pas l\'intégralité des spécificités des EVC, en particulier sur l\'épreuve d\'analyse clinique.',
    tip: 'Combinez QCM corrigés conformes au format EVC, dossiers cliniques progressifs alignés sur les annales récentes, et fiches de synthèse mises à jour. La diversité et l\'actualisation des supports sont déterminantes.' },
  { n: 5, title: 'La méthodologie : un pilier essentiel pour réussir les EVC', icon: Compass,
    intro: 'Au-delà du contenu, ce sont la structure de la réponse, la précision de la terminologie et la justesse des arguments qui font la différence à l\'examen. Une bonne connaissance mal présentée peut être insuffisante face à des correcteurs qui recherchent des mots-clés précis et un raisonnement médical lisible.',
    tip: 'Travaillez la méthodologie de réponse en amont du contenu : entraînez-vous à rédiger sous pression de temps, à structurer en plan court, à utiliser la terminologie attendue et à hiérarchiser systématiquement vos propositions.' },
];

const PILIERS = [
  { Icon: BookOpen,       t: 'Ressources officielles et à jour' },
  { Icon: Compass,        t: 'Méthodologie gagnante' },
  { Icon: Target,         t: 'Entraînement intensif' },
  { Icon: Users,          t: 'Accompagnement personnalisé' },
  { Icon: ClipboardCheck, t: 'Résultats prouvés' },
];

export function ArticleDefisEvc({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Les Épreuves de Vérification des Connaissances (EVC PAE) constituent une étape cruciale pour les médecins diplômés hors de l'union européenne souhaitant exercer en France. Décryptage des 5 grands défis rencontrés par les candidats… et comment les transformer en opportunités."
          rightArea={
            <div className="hidden h-44 w-full overflow-hidden rounded-2xl border border-[#ECEEF1] bg-[linear-gradient(135deg,#0E1626_0%,#2D0518_100%)] p-3 lg:block">
              <div className="grid h-full grid-cols-[80px_1fr] gap-2 rounded-xl bg-[#0E1626] p-2 text-white">
                <div className="space-y-1.5">
                  <div className="rounded bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-1.5 py-1 text-[8px] font-bold">Accueil</div>
                  <div className="rounded bg-white/5 px-1.5 py-1 text-[8px] text-white/60">Entraînement ciblé</div>
                  <div className="rounded bg-white/5 px-1.5 py-1 text-[8px] text-white/60">Révisions transversales</div>
                  <div className="rounded bg-white/5 px-1.5 py-1 text-[8px] text-white/60">Agenda</div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="rounded bg-white p-1.5"><p className="text-[7px] text-[#9AA1AE]">Progression</p><p className="text-[12px] font-black text-[#1A2233]">64%</p></div>
                  <div className="rounded bg-white p-1.5"><p className="text-[7px] text-[#9AA1AE]">QCM réalisés</p><p className="text-[12px] font-black text-[#1A2233]">1 248</p></div>
                  <div className="rounded bg-white p-1.5"><p className="text-[7px] text-[#9AA1AE]">Temps</p><p className="text-[12px] font-black text-[#1A2233]">6h 35</p></div>
                  <div className="rounded bg-white p-1.5"><p className="text-[7px] text-[#9AA1AE]">Items maîtrisés</p><p className="text-[12px] font-black text-[#1A2233]">156</p></div>
                </div>
              </div>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Body */}
          <div className="space-y-5">
            {DEFIS.map((d) => (
              <section key={d.n} className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
                <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FDE7E9] text-[12px] font-extrabold text-[#C0001F]">
                        {d.n}
                      </span>
                      <h2 className="text-[18px] font-extrabold leading-snug text-[#1A2233]">{d.title}</h2>
                    </div>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-[#52607A]">{d.intro}</p>
                    <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-[#FFF1F3] px-3 py-2 text-[12px] text-[#1A2233]">
                      <Lightbulb className="h-3.5 w-3.5 shrink-0 text-[#C0001F]" />
                      <span><strong className="text-[#C0001F]">Bon à savoir :</strong> {d.tip}</span>
                    </p>
                  </div>
                  <div className="hidden h-40 items-center justify-center rounded-xl bg-[#F6F7F9] lg:flex">
                    <d.icon className="h-12 w-12 text-[#1A2233]/30" />
                  </div>
                </div>
              </section>
            ))}

            {/* Réussir les EVC */}
            <section className="rounded-2xl border border-[#ECEEF1] bg-white p-6">
              <h2 className="text-[20px] font-extrabold text-[#1A2233]">Réussir les EVC avec Major ECN</h2>
              <p className="mt-1 text-[13px] text-[#52607A]">
                Une préparation complète, structurée et efficace pour franchir cette étape décisive.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {PILIERS.map((p) => (
                  <div key={p.t} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3 text-center">
                    <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDE7E9] text-[#C0001F]">
                      <p.Icon className="h-4.5 w-4.5" />
                    </span>
                    <p className="mt-2 text-[12px] font-semibold leading-snug text-[#1A2233]">{p.t}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid items-center gap-4 rounded-2xl bg-[linear-gradient(135deg,#FFE4E8_0%,#FFFBEB_100%)] p-4 sm:grid-cols-[1.4fr_1fr]">
                <div>
                  <p className="text-[15px] font-extrabold text-[#1A2233]">Votre réussite, notre engagement.</p>
                  <p className="mt-1 text-[12.5px] text-[#52607A]">
                    Rejoignez la communauté des médecins qui ont réussi les EVC grâce à une préparation
                    sérieuse et un accompagnement d&rsquo;experts.
                  </p>
                </div>
                <a href="/plateforme" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-3 text-[13px] font-bold text-white shadow-sm">
                  Découvrir la préparation EVC →
                </a>
              </div>
            </section>
          </div>

          {/* Aside */}
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-2xl border border-[#0E1626]/15 bg-[linear-gradient(135deg,#0E1626_0%,#2D0518_100%)] p-5 text-white shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">Plus de 15 ans d&rsquo;expertise au service des médecins PADHUE</p>
              <h3 className="mt-2 text-[18px] font-extrabold leading-snug">Préparation EVC PAE : l&rsquo;expertise Major ECN depuis plus de 15 ans</h3>
              <p className="mt-2 text-[12px] text-white/80">
                Major ECN accompagne les médecins PADHUE dans leur préparation aux Épreuves de
                Vérification des Connaissances (EVC), première étape clé de la PAE.
              </p>
              <ul className="mt-3 space-y-1 text-[12px]">
                {['45 spécialités médicales', 'QCM corrigés et commentés', 'Cas cliniques progressifs', 'Révisions transversales', 'Épreuves blanches', 'Suivi pédagogique personnalisé'].map((b) => (
                  <li key={b} className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3 w-3 text-[#E4002B]" /> {b}</li>
                ))}
              </ul>
              <a href="/plateforme" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-bold text-white">
                Découvrir la préparation EVC →
              </a>
              <div className="mt-3 space-y-1.5 text-[11px] text-white/70">
                <p className="inline-flex items-center gap-2"><Users className="h-3 w-3" /> +9 000 médecins accompagnés</p>
                <p className="inline-flex items-center gap-2"><Trophy className="h-3 w-3" /> Plateforme n°1 pour la préparation EVC</p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Ils nous font confiance</h3>
              <p className="mt-2 text-[12.5px] italic leading-relaxed text-[#1A2233]">
                « Grâce à Major ECN, j&rsquo;ai pu structurer mes révisions, comprendre la méthodologie
                et prendre confiance. Les corrections détaillées et les cas cliniques m&rsquo;ont
                vraiment fait progresser. »
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE4E8] text-[10px] font-extrabold text-[#C0001F]">AM</span>
                <div>
                  <p className="text-[12px] font-bold text-[#1A2233]">Dr. A. M.</p>
                  <p className="text-[10px] text-[#9AA1AE]">Médecin généraliste — Admis aux EVC 2023</p>
                </div>
              </div>
            </section>

            <PrepCtaCard />
            <ArticleSidebarPopular currentSlug={article.slug} />
          </aside>
        </div>
      </div>

      {/* Bandeau bas */}
      <div className="mt-8 bg-[linear-gradient(90deg,#0E1626_0%,#2D0518_100%)] py-4 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div>
            <p className="text-[14px] font-extrabold">Major ECN, votre allié pour réussir les EVC PAE</p>
            <p className="text-[12px] text-white/70">Rejoignez plus de 9 000 médecins qui nous font confiance pour réussir leur parcours.</p>
          </div>
          <a href="/plateforme" className="inline-flex items-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-bold text-white">
            Découvrir la préparation EVC →
          </a>
        </div>
      </div>
    </main>
  );
}
