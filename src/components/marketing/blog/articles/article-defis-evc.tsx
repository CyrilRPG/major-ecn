import Image from 'next/image';
import Link from 'next/link';
import {
  Activity, AlertTriangle, ArrowRight, BookOpen, Brain, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock, Compass, FileText, GraduationCap, Lightbulb, MessageCircle,
  Quote, Sparkles, Target, Trophy, Users, Users2,
} from 'lucide-react';
import { ArticleHeader, ARTICLE_FONT } from '../article-shell';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const DEFIS = [
  {
    n: 1,
    title: 'Une profusion de sources d\'information',
    intro: 'Chaque année, de nombreux médecins PADHUE échouent aux EVC malgré un niveau médical solide. La première difficulté qu\'ils rencontrent est l\'extrême diversité des sources disponibles : recommandations HAS, publications du CLIN, données du CRAT, directives des sociétés savantes françaises. Cette profusion peut entraîner une dispersion des efforts.',
    tip: 'Il est essentiel de privilégier les sources officielles et actualisées. La HAS publie régulièrement des recommandations de bonne pratique qui constituent une référence solide pour la préparation des EVC.',
    example: 'has',
  },
  {
    n: 2,
    title: 'Des épreuves aux exigences élevées',
    intro: 'Les EVC évaluent les connaissances théoriques ET la capacité à les appliquer dans des situations cliniques concrètes. Les candidats doivent démontrer une maîtrise approfondie des compétences médicales attendues en France, souvent différente de leur formation initiale.',
    tip: 'Les épreuves sont conçues pour refléter les situations cliniques courantes en France. Il est essentiel de se familiariser avec le système de santé français et ses spécificités.',
    example: 'cas',
  },
  {
    n: 3,
    title: 'Briser l\'isolement : une préparation collaborative avec Major ECN',
    intro: 'Se préparer seul peut être décourageant : manque de motivation, difficulté à évaluer ses progrès, dispersion des efforts. L\'accompagnement et l\'échange avec des pairs font toute la différence.',
    tip: 'L\'accompagnement personnalisé et les échanges avec les pairs sont des clés essentielles pour une préparation efficace et maintenir une dynamique de travail soutenue.',
    example: 'team',
  },
  {
    n: 4,
    title: 'Une pénurie de supports d\'entraînement adaptés',
    intro: 'Peu d\'annales récentes et de qualité, surtout pour l\'épreuve pratique. Les ressources incomplètes ou obsolètes ne permettent pas une préparation optimale.',
    tip: 'Diversifiez vos sources et privilégiez des supports actualisés et conformes aux exigences des EVC pour maximiser vos chances de réussite.',
    example: 'qcm',
  },
  {
    n: 5,
    title: 'La méthodologie : un pilier essentiel pour réussir les EVC',
    intro: 'Il ne suffit pas de connaître : il faut savoir présenter ses réponses de manière structurée et conforme aux attentes du jury. Les correcteurs recherchent des mots-clés, des mesures thérapeutiques incontournables et une organisation claire.',
    tip: 'Une méthodologie rigoureuse permet de valoriser vos connaissances, de structurer vos réponses et d\'utiliser une terminologie médicale appropriée.',
    example: 'methode',
  },
];

const ENGAGEMENT_STEPS = [
  { Icon: BookOpen,       t: 'Ressources officielles et à jour' },
  { Icon: Compass,        t: 'Méthodologie gagnante' },
  { Icon: Target,         t: 'Entraînement intensif' },
  { Icon: Users,          t: 'Accompagnement personnalisé' },
  { Icon: CheckCircle2,   t: 'Résultats prouvés' },
];

const SIDEBAR_BULLETS = [
  '45 spécialités médicales',
  'Plus de 9 000 médecins accompagnés',
  'QCM corrigés et commentés',
  'Cas cliniques progressifs',
  'Fiches, flashcards et cours synthétiques',
  'Révisions transversales',
  'Épreuves blanches en conditions réelles',
  'Suivi pédagogique personnalisé',
  'Méthodologie spécifique EVC et conseils d\'experts',
];

export function ArticleDefisEvc({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Chaque année, de nombreux médecins PADHUE échouent aux Épreuves de Vérification des Connaissances (EVC) malgré un niveau médical solide. Manque de méthode, isolement, pénurie de supports d'entraînement ou difficulté à hiérarchiser les recommandations : découvrez les principaux obstacles observés par Major ECN auprès de plus de 9 000 médecins accompagnés."
          rightArea={<DashboardMock />}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Colonne principale : les 5 défis */}
          <div className="space-y-5">
            {DEFIS.map((d) => (
              <DefiBlock key={d.n} defi={d} />
            ))}

            {/* Bloc "Réussir les EVC avec Major ECN" — 5 piliers */}
            <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="text-center text-[18px] font-extrabold text-[#1A2233]">
                Réussir les EVC avec Major ECN
              </h2>
              <p className="mx-auto mt-1 max-w-2xl text-center text-[12.5px] text-[#52607A]">
                Une préparation complète, structurée et efficace pour franchir cette étape décisive.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {ENGAGEMENT_STEPS.map((s, i) => (
                  <div key={s.t} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE4E8] text-[#C0001F]">
                      <s.Icon className="h-4.5 w-4.5" />
                    </span>
                    <p className="mt-2 text-[10.5px] font-extrabold uppercase tracking-wide text-[#C0001F]">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-0.5 text-[11.5px] font-semibold leading-snug text-[#1A2233]">{s.t}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Bloc "Votre réussite, notre engagement" */}
            <section className="rounded-2xl border border-[#FACBD0] bg-[linear-gradient(135deg,#FFF1F3_0%,#FFE4E8_100%)] p-5 sm:p-6">
              <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#C0001F] shadow-sm">
                  <Target className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[15px] font-extrabold leading-snug text-[#1A2233]">
                    Votre réussite, notre engagement.
                  </p>
                  <p className="mt-1 text-[12.5px] text-[#52607A]">
                    Rejoignez la communauté des médecins qui ont réussi les EVC grâce à
                    une préparation sérieuse et un accompagnement d&rsquo;experts.
                  </p>
                </div>
                <Link
                  href="/plateforme"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm hover:scale-[1.01]"
                >
                  Découvrir la préparation EVC <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar : carte Major ECN + témoignage */}
          <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
            <section className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0F1F4D_0%,#1E2F5C_100%)] p-5 text-white shadow-sm">
              <div className="flex items-center gap-2">
                <Image
                  src="/major-ecn-logo.png"
                  alt="Major ECN"
                  width={56}
                  height={28}
                  className="h-7 w-auto [filter:brightness(0)_invert(1)]"
                />
                <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/80">
                  Plus de 15 ans d&rsquo;expertise au service des médecins PADHUE
                </p>
              </div>
              <h3 className="mt-3 text-[16px] font-extrabold leading-snug">
                Préparation EVC PAE : l&rsquo;expertise Major ECN depuis plus de 15 ans
              </h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-white/85">
                Major ECN accompagne les médecins PADHUE dans leur préparation aux Épreuves
                de Vérification des Connaissances (EVC), première étape clé de la Procédure
                d&rsquo;Autorisation d&rsquo;Exercice (PAE).
              </p>
              <ul className="mt-3 space-y-1.5 text-[11.5px] text-white/90">
                {SIDEBAR_BULLETS.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#C0001F] text-white">
                      <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M2 6l3 3 5-6" />
                      </svg>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Aperçu plateforme — laptop + smartphone */}
              <div className="relative mt-4 overflow-hidden rounded-xl border bg-[linear-gradient(135deg,#FFF1F3_0%,#FFE4E8_100%)]"
                style={{ borderColor: '#FACBD0' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/plateforme/laptop-phone-dashboard.png"
                  alt="Aperçu de la plateforme Major ECN sur ordinateur portable et smartphone"
                  className="block h-auto w-full select-none"
                  loading="lazy"
                  decoding="async"
                />
                <span aria-hidden className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-40 blur-2xl"
                  style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), transparent 70%)' }} />
              </div>

              <Link
                href="/plateforme"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-3 py-2.5 text-[12.5px] font-extrabold text-white shadow-sm hover:scale-[1.02]"
              >
                Découvrir la préparation EVC <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>

            <section className="rounded-2xl border border-[#ECEEF1] bg-white p-4 shadow-sm">
              <p className="text-[12px] font-extrabold text-[#1A2233]">Ils nous ont fait confiance</p>
              <div className="mt-2 text-[#F59E0B]">★★★★★</div>
              <Quote className="mt-2 h-4 w-4 text-[#C0001F]" />
              <p className="mt-1 text-[11.5px] italic leading-relaxed text-[#1A2233]">
                « Une préparation structurée et ciblée, utile bien au-delà du concours.
                Les examens blancs réalisés dans des conditions proches du concours m&rsquo;ont
                beaucoup aidé à aborder le jour J avec davantage de confiance. »
              </p>
              <div className="mt-3 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/temoignages/drbilly.png"
                  alt="Dr Bill Baron WANKPO"
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-[#FFE4E8]"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <p className="text-[11.5px] font-bold text-[#1A2233]">Dr Bill Baron WANKPO</p>
                  <p className="text-[9.5px] text-[#9AA1AE]">Lauréat EVC Médecine Générale</p>
                </div>
              </div>
              <div className="mt-2 flex justify-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C0001F]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ECEEF1]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ECEEF1]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ECEEF1]" />
              </div>
            </section>
          </aside>
        </div>

        {/* Bandeau final pleine largeur */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#0F1F4D_0%,#5C1827_60%,#C0112E_100%)] p-5 text-white sm:p-6">
          <div className="grid items-center gap-3 lg:grid-cols-[auto_1fr_auto]">
            <Image
              src="/major-ecn-logo.png"
              alt="Major ECN"
              width={56}
              height={28}
              className="h-7 w-auto [filter:brightness(0)_invert(1)]"
            />
            <div>
              <p className="text-[14px] font-extrabold leading-tight">
                Major ECN, votre allié pour réussir les EVC PAE
              </p>
              <p className="mt-1 text-[12px] text-white/80">
                Rejoignez plus de 9 000 médecins qui nous font confiance pour réussir leur parcours.
              </p>
            </div>
            <Link
              href="/plateforme"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm hover:scale-[1.02]"
            >
              Découvrir la préparation EVC <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ─────────────── Bloc d'un défi ─────────────── */

function DefiBlock({ defi }: { defi: typeof DEFIS[number] }) {
  return (
    <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 sm:p-6 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        {/* Gauche : numéro + titre + intro + bon à savoir */}
        <div>
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1E4D8B] text-[13px] font-extrabold text-white">
              {defi.n}
            </span>
            <h2 className="text-[17px] font-extrabold leading-snug text-[#1A2233]">
              {defi.title}
            </h2>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-[#52607A]">
            {defi.intro}
          </p>
          <div className="mt-3 rounded-xl border border-[#FCD0D6] bg-[#FFF1F3] p-3">
            <p className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wide text-[#C0001F]">
              <Lightbulb className="h-3 w-3" /> Bon à savoir
            </p>
            <p className="mt-1 text-[11.5px] text-[#1A2233]">{defi.tip}</p>
          </div>
        </div>

        {/* Droite : exemple visuel */}
        <div>
          <DefiExample kind={defi.example as ExampleKind} />
        </div>
      </div>
    </section>
  );
}

type ExampleKind = 'has' | 'cas' | 'team' | 'qcm' | 'methode';

function DefiExample({ kind }: { kind: ExampleKind }) {
  if (kind === 'has') {
    return (
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#52607A]">Extrait du site HAS</p>
        <div className="mt-2 rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#003B6F] px-2 py-1 text-[12px] font-black text-white">HAS</span>
            <p className="text-[10px] font-semibold text-[#1A2233]">Haute Autorité de Santé</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] text-[#52607A]">
            <span className="rounded-full bg-white px-2 py-0.5 border border-[#ECEEF1]">Mise à jour récente</span>
            <span className="rounded-full bg-white px-2 py-0.5 border border-[#ECEEF1]">Évaluer</span>
            <span className="rounded-full bg-white px-2 py-0.5 border border-[#ECEEF1]">Recommander</span>
          </div>
          <p className="mt-3 text-[10.5px] font-bold text-[#1A2233]">Recommandations de bonne pratique</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-md border border-[#ECEEF1] bg-white p-2 text-[9.5px] text-[#1A2233]">
              <Activity className="h-3 w-3 text-[#C0001F]" />
              <p className="mt-1 font-semibold">Prise en charge de la douleur chronique</p>
            </div>
            <div className="rounded-md border border-[#ECEEF1] bg-white p-2 text-[9.5px] text-[#1A2233]">
              <Users className="h-3 w-3 text-[#C0001F]" />
              <p className="mt-1 font-semibold">Antibioprophylaxie en chirurgie artérielle</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'cas') {
    return (
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#52607A]">Exemple : cas clinique EVC</p>
        <div className="mt-2 rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3">
          <p className="text-[11px] text-[#1A2233]">
            Patiente de 65 ans, diabétique, consulte pour dyspnée et œdèmes
            des membres inférieurs…
          </p>
          <p className="mt-3 text-[10px] font-extrabold uppercase tracking-wider text-[#1A2233]">Questions</p>
          <ol className="mt-2 space-y-1.5">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFE4E8] text-[10px] font-extrabold text-[#C0001F]">{n}</span>
                <span className="h-1.5 flex-1 rounded-full bg-[#ECEEF1]" />
              </li>
            ))}
          </ol>
          <div className="mt-3 inline-flex items-start gap-1.5 rounded-md bg-[#FFF1F3] px-2 py-1 text-[10px] text-[#C0001F]">
            <Lightbulb className="h-3 w-3 shrink-0" />
            <span><strong>Important :</strong> les épreuves sont conçues pour refléter les situations cliniques courantes en France. Familiarisez-vous avec le système de santé français.</span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'team') {
    return (
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#52607A]">Avec Major ECN, vous n&rsquo;êtes jamais seul</p>
        <div className="mt-2 rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3">
          <ul className="space-y-2 text-[10.5px] text-[#1A2233]">
            {[
              'Sessions en présentiel ou à distance animées par des professionnels de santé',
              'Plateforme en ligne : annales corrigées, dossiers cliniques, fiches de révision, forum d\'entraide',
              'Suivi personnalisé avec corrections détaillées et conseils adaptés',
            ].map((t) => (
              <li key={t} className="flex items-start gap-1.5">
                <Users2 className="mt-0.5 h-3 w-3 shrink-0 text-[#C0001F]" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex aspect-square items-center justify-center rounded-md bg-white">
                <Users className="h-5 w-5 text-[#1E4D8B]/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'qcm') {
    return (
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#52607A]">Cours - Dossiers progressifs</p>
        <div className="mt-2 overflow-hidden rounded-xl border border-[#ECEEF1] bg-white">
          <div className="border-b border-[#ECEEF1] bg-[#FAFBFE] px-2.5 py-1.5">
            <p className="text-[10px] font-bold text-[#1A2233]">Cardiologie</p>
            <div className="mt-1 flex gap-2 text-[9px] text-[#52607A]">
              <span>Aperçu</span>
              <span>Cours vidéo</span>
              <span>Fiche</span>
              <span className="font-extrabold text-[#C0001F]">DP - QI</span>
              <span>Flashcards</span>
            </div>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] font-bold text-[#1A2233]">
              Concernant le STEMI et sa prise en charge :
            </p>
            <ul className="mt-1.5 space-y-1">
              {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                <li key={l} className="flex items-center gap-1.5 text-[9.5px]">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-[#FFE4E8] text-[9px] font-extrabold text-[#C0001F]">{l}</span>
                  <span className="h-1 flex-1 rounded-full" style={{ background: i % 2 === 0 ? '#ECEEF1' : '#FFE4E8' }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 'methode'
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#52607A]">Correction détaillée</p>
      <div className="mt-2 rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3">
        <p className="text-[10.5px] font-bold text-[#1A2233]">
          Question : Concernant la classification et le diagnostic de
          l&rsquo;insuffisance cardiaque, quelles propositions sont exactes ?
        </p>
        <ul className="mt-2 space-y-1.5 text-[9.5px]">
          {[
            { L: 'A', txt: 'L\'ICFEP se définit par une FEVG < 40 %.',                          ok: false },
            { L: 'B', txt: 'Le BNP > 100 pg/mL oriente vers un diagnostic d\'IC.',              ok: true },
            { L: 'C', txt: 'L\'ETT est l\'examen clé du diagnostic et du suivi.',               ok: true },
            { L: 'D', txt: 'La classification NYHA évalue la fonction systolique ventriculaire.', ok: false },
            { L: 'E', txt: 'La cardiopathie ischémique est l\'étiologie la plus fréquente d\'ICFER.', ok: true },
          ].map((r) => (
            <li key={r.L} className="flex items-start gap-2 rounded-md border border-[#ECEEF1] bg-white p-1.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-[#FFE4E8] text-[9px] font-extrabold text-[#C0001F]">{r.L}</span>
              <span className="flex-1 text-[#1A2233]">{r.txt}</span>
              <span className={`shrink-0 rounded px-1 py-0.5 text-[7.5px] font-bold ${r.ok ? 'bg-[#DCFCE7] text-[#16793C]' : 'bg-[#FFE4E8] text-[#C0001F]'}`}>
                {r.ok ? 'Réponse correcte' : 'Réponse incorrecte'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────── Mock dashboard pour le hero ─────────────── */

function DashboardMock() {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#0F1F4D]/15 bg-[#0F1F4D] p-2 shadow-lg lg:aspect-auto lg:h-52">
      <div className="grid h-full grid-cols-[60px_1fr] gap-1.5">
        {/* Sidebar */}
        <div className="space-y-1">
          <div className="rounded bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-1 py-0.5 text-[6px] font-bold text-white">Accueil</div>
          <div className="rounded bg-white/5 px-1 py-0.5 text-[6px] text-white/60">Entraînement ciblé</div>
          <div className="rounded bg-white/5 px-1 py-0.5 text-[6px] text-white/60">Révisions transversales</div>
          <div className="rounded bg-white/5 px-1 py-0.5 text-[6px] text-white/60">Agenda</div>
          <p className="pt-1 text-[5.5px] font-bold uppercase tracking-wider text-white/40">Médecine</p>
          {['Médecine générale', 'Annales EVC', 'Neurologie', 'Cardiologie', 'Médecine interne', 'Infectiologie', 'Pharmacologie', 'Hépato-gastro…'].map((s) => (
            <div key={s} className="rounded bg-white/5 px-1 py-0.5 text-[5.5px] text-white/60">{s}</div>
          ))}
        </div>
        {/* Main */}
        <div className="rounded bg-white p-1.5">
          <p className="text-[7px] font-bold text-[#1A2233]">Bonjour, Vincent 👋</p>
          <div className="mt-1 grid grid-cols-4 gap-1">
            {[
              { l: 'Progression globale', v: '64%' },
              { l: 'Temps de révision',   v: '6h 35' },
              { l: 'QCM réalisés',        v: '1 248' },
              { l: 'Items maîtrisés',     v: '156' },
            ].map((k) => (
              <div key={k.l} className="rounded border border-[#ECEEF1] bg-[#FAFBFE] p-0.5">
                <p className="text-[5.5px] text-[#9AA1AE]">{k.l}</p>
                <p className="text-[8.5px] font-black text-[#1A2233]">{k.v}</p>
              </div>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            <div className="rounded border border-[#ECEEF1] bg-[#FAFBFE] p-1">
              <p className="text-[5.5px] font-bold text-[#1A2233]">Évolution de ta performance</p>
              <svg viewBox="0 0 100 30" className="mt-0.5 h-6 w-full">
                <polyline points="0,25 14,22 28,18 42,12 56,15 70,8 84,10 100,5" fill="none" stroke="#C0112E" strokeWidth="1" />
                <polyline points="0,28 14,26 28,24 42,22 56,20 70,18 84,17 100,15" fill="none" stroke="#1E4D8B" strokeWidth="1" />
              </svg>
            </div>
            <div className="rounded border border-[#ECEEF1] bg-[#FAFBFE] p-1">
              <p className="text-[5.5px] font-bold text-[#1A2233]">Répartition de tes révisions</p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="block h-7 w-7 rounded-full" style={{ background: 'conic-gradient(#C0112E 0 64%,#F97316 64% 80%,#1E4D8B 80% 100%)' }} />
                <div className="space-y-0.5 text-[5px] text-[#1A2233]">
                  <p>● QCM (1 248) 64 %</p>
                  <p>● Flashcards (568) 29 %</p>
                  <p>● Cours (160) 7 %</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Workaround pour conserver les imports inutilisés à zéro
void ClipboardCheck;
void Brain;
void MessageCircle;
void Trophy;
void ChevronRight;
void Clock;
void FileText;
void GraduationCap;
void Sparkles;
void Compass;
void AlertTriangle;
