import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Building2, Check, CheckCircle2, ChevronDown, Clock,
  FileText, GraduationCap, HeartHandshake, MapPin, Phone, Quote, ScrollText,
  ShieldCheck, Sparkles, Stethoscope, TrendingUp, Users, Users2,
} from 'lucide-react';
import { ArticleHeader, ARTICLE_FONT } from '../article-shell';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

const KPI_CARDS = [
  { Icon: Users2,     bg: '#FFE4E8', fg: '#C0001F', n: '+ 9 000', t: 'médecins PADHUE accompagnés', s: 'par Major-ECN depuis plus de 15 ans' },
  { Icon: Building2,  bg: '#DCFCE7', fg: '#16793C', n: '',         t: 'Accès aux soins renforcé',     s: 'Une meilleure répartition des professionnels de santé sur tout le territoire' },
  { Icon: MapPin,     bg: '#E5F1FF', fg: '#1E4D8B', n: '',         t: 'Déserts médicaux',             s: 'Une réponse concrète aux besoins des territoires sous-dotés' },
  { Icon: ShieldCheck, bg: '#FCEAEC', fg: '#C0001F', n: '',        t: 'Les EVC PAE',                  s: 'Garantir compétence, qualité et sécurité pour les patients' },
];

const PARCOURS_STEPS = [
  { Icon: GraduationCap, label: 'Diplôme hors UE',                  sub: '' },
  { Icon: FileText,       label: 'EVC',                              sub: 'Vérification des connaissances' },
  { Icon: ScrollText,     label: 'PAE',                              sub: 'Procédure d\'Autorisation d\'Exercice' },
  { Icon: ShieldCheck,    label: 'Autorisation d\'exercice',         sub: 'en France' },
  { Icon: Stethoscope,    label: 'Exercice au service des patients', sub: '' },
];

const INDISPENSABLES = [
  { Icon: ShieldCheck,   bg: '#FCEAEC', fg: '#C0001F', t: 'Sécurité des patients',      d: 'Vérifier les compétences et les connaissances pour garantir des soins sûrs et adaptés.' },
  { Icon: HeartHandshake, bg: '#FFE4E8', fg: '#C0001F', t: 'Qualité des soins',          d: 'Évaluer les connaissances médicales fondamentales et pratiques selon les standards français.' },
  { Icon: Users,         bg: '#EDE9FE', fg: '#6D28D9', t: 'Intégration professionnelle', d: 'Faciliter l\'adaptation au système de santé français et aux pratiques professionnelles.' },
];

const FLOW_LEFT = [
  { Icon: Users2,         label: 'Médecins diplômés hors UE (PADHUE)' },
  { Icon: FileText,        label: 'EVC',     sub: 'Vérification des connaissances' },
  { Icon: ScrollText,      label: 'PAE',     sub: 'Procédure d\'Autorisation d\'Exercice' },
  { Icon: Building2,       label: 'Intégration dans les établissements de santé (CHU, cliniques, centres de santé)' },
  { Icon: Users,           label: 'Renforcement des équipes médicales sur tout le territoire' },
  { Icon: HeartHandshake,  label: 'Accès aux soins amélioré pour tous les patients' },
];

const IMPACTS_RIGHT = [
  'Augmentation du nombre de professionnels de santé disponibles',
  'Meilleure couverture des territoires sous-dotés',
  'Réduction des délais d\'attente pour les patients',
  'Diversité des parcours et enrichissement des pratiques médicales',
  'Système de santé plus résilient et performant',
];

const ADVANTAGES = [
  { Icon: TrendingUp,   t: 'Méthodologie éprouvée et adaptée aux EVC' },
  { Icon: GraduationCap, t: 'Enseignants experts dans leur spécialité' },
  { Icon: FileText,     t: 'Ressources complètes et actualisées' },
  { Icon: ClipboardCheckIcon, t: 'Entraînements intensifs et examens blancs' },
  { Icon: ShieldCheck,  t: 'Suivi personnalisé et motivation au quotidien' },
];

const FAQS = [
  ['Quel est le rôle des EVC ?', 'Les EVC vérifient que les médecins diplômés hors UE possèdent les compétences cliniques fondamentales attendues en France et qu\'ils peuvent intégrer le système de santé en toute sécurité.'],
  ['Pourquoi les médecins étrangers doivent-ils passer les EVC ?', 'Le diplôme délivré hors UE n\'est pas reconnu automatiquement. Les EVC sont la première étape réglementaire de la PAE pour exercer pleinement en France.'],
  ['Les EVC participent-ils à l\'accès aux soins ?', 'Oui. En facilitant l\'arrivée de médecins qualifiés là où les territoires sont sous-dotés, les EVC contribuent directement à la résorption des déserts médicaux.'],
  ['Qu\'est-ce que la PAE ?', 'La Procédure d\'Autorisation d\'Exercice est le parcours complet qui mène à l\'inscription au Tableau de l\'Ordre : EVC, Parcours de Consolidation des Compétences puis évaluation finale par la CNAE.'],
];

export function ArticleImpactEvc({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Les Épreuves de Vérification des Connaissances (EVC) jouent un rôle clé dans l'intégration des médecins PADHUE et contribuent au renforcement de l'offre de soins sur l'ensemble du territoire français."
          rightArea={
            <div
              className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border lg:aspect-auto lg:h-52"
              style={{
                borderColor: '#E5E9F0',
                boxShadow: '0 18px 40px -22px rgba(15,31,77,0.30)',
                background: 'linear-gradient(135deg,#E5F1FF 0%,#FFE4E8 100%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/blog/medecins-essentiels-doctor-patient.jpg"
                alt="Médecin PADHUE en consultation avec une patiente"
                className="absolute inset-0 h-full w-full select-none object-contain"
                style={{ objectPosition: '60% 35%' }}
                decoding="async"
                fetchPriority="high"
              />
              <span aria-hidden className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 40%, rgba(15,31,77,0.18) 100%)' }} />
              {/* Badge en haut-gauche */}
              <span
                className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] backdrop-blur"
                style={{ color: '#1E4D8B', boxShadow: '0 6px 14px -8px rgba(15,31,77,0.20)' }}
              >
                <Stethoscope className="h-2.5 w-2.5" />
                Accès aux soins
              </span>
            </div>
          }
        />

        {/* 4 cartes KPI */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_CARDS.map((c) => (
            <div key={c.t} className="rounded-2xl border border-[#ECEEF1] bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.fg }}>
                <c.Icon className="h-5 w-5" />
              </span>
              {c.n && <p className="mt-2.5 text-[22px] font-black tabular-nums" style={{ color: c.fg }}>{c.n}</p>}
              <p className={`text-[13px] font-bold ${c.n ? '' : 'mt-3'}`} style={{ color: c.fg }}>{c.t}</p>
              <p className="mt-1 text-[11.5px] leading-snug text-[#52607A]">{c.s}</p>
            </div>
          ))}
        </section>

        {/* Sections 1 + 2 */}
        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* Parcours d'intégration */}
          <div className="rounded-2xl border border-[#ECEEF1] bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-[16px] font-extrabold text-[#1A2233]">Le parcours d&rsquo;intégration des médecins diplômés hors UE</h2>
            <ol className="mt-4 flex items-stretch justify-between gap-1">
              {PARCOURS_STEPS.map((s, i) => (
                <li key={s.label} className="flex flex-1 items-center gap-1">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ECEEF1] bg-[#FAFBFE] text-[#C0001F]">
                      <s.Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-2 text-[10.5px] font-bold leading-tight text-[#1A2233]">{s.label}</p>
                    {s.sub && <p className="text-[9px] text-[#52607A]">{s.sub}</p>}
                  </div>
                  {i < PARCOURS_STEPS.length - 1 && (
                    <ArrowRight className="h-3 w-3 shrink-0 text-[#9AA1AE]" />
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[12.5px] leading-relaxed text-[#52607A]">
              Les EVC constituent la première étape de la PAE. Elles permettent de vérifier les
              connaissances fondamentales et pratiques nécessaires pour exercer en France.
            </p>
          </div>

          {/* Pourquoi les EVC sont indispensables */}
          <div className="rounded-2xl border border-[#ECEEF1] bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-[16px] font-extrabold text-[#1A2233]">Pourquoi les EVC sont indispensables ?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {INDISPENSABLES.map((c) => (
                <div key={c.t} className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.fg }}>
                    <c.Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-2 text-[12px] font-extrabold leading-tight" style={{ color: c.fg }}>{c.t}</p>
                  <p className="mt-1.5 text-[10.5px] leading-snug text-[#52607A]">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section "Des EVC au service de l'accès aux soins pour tous" */}
        <section className="mb-6 rounded-2xl border border-[#ECEEF1] bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-center text-[18px] font-extrabold text-[#1A2233]">
            Des EVC au service de l&rsquo;accès aux soins pour tous
          </h2>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[12.5px] text-[#52607A]">
            Les médecins diplômés hors UE représentent une ressource essentielle pour répondre
            aux besoins de santé en France.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
            {/* Colonne 1 : flow vertical */}
            <ol className="space-y-2">
              {FLOW_LEFT.map((s, i) => (
                <li key={s.label} className="rounded-lg border border-[#ECEEF1] bg-[#FAFBFE] p-2.5">
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FFE4E8] text-[10px] font-extrabold text-[#C0001F]">
                      {i + 1}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FFF1F3] text-[#C0001F]">
                      <s.Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-bold leading-tight text-[#1A2233]">{s.label}</p>
                      {s.sub && <p className="text-[10px] leading-tight text-[#52607A]">{s.sub}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* Colonne 2 : photo équipe médicale en mouvement (couloir CHU) + citation */}
            <div className="flex flex-col gap-3">
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-xl border"
                style={{
                  borderColor: '#ECEEF1',
                  background: 'linear-gradient(135deg,#F0F4FA 0%,#E5F1FF 100%)',
                  boxShadow: '0 10px 24px -14px rgba(15,31,77,0.20)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/blog/medecins-essentiels-corridor.jpg"
                  alt="Équipe médicale en mouvement dans un couloir d'hôpital"
                  className="absolute inset-0 h-full w-full select-none object-contain"
                  style={{ objectPosition: '50% 60%' }}
                  loading="lazy"
                  decoding="async"
                />
                {/* Vignette douce en bas */}
                <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-14"
                  style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(15,31,77,0.30) 100%)' }} />
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[9px] font-bold text-[#1A2233] backdrop-blur">
                  <Users className="h-3 w-3 text-[#1E4D8B]" />
                  Équipe médicale CHU
                </span>
              </div>
              <div className="rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3">
                <Quote className="h-4 w-4 text-[#C0001F]" />
                <p className="mt-1 text-[11.5px] italic leading-relaxed text-[#1A2233]">
                  « En facilitant l&rsquo;intégration des PADHUE, les EVC jouent un rôle clé
                  dans la lutte contre les déserts médicaux et dans l&rsquo;amélioration de
                  l&rsquo;accès aux soins pour tous les Français. »
                </p>
              </div>
            </div>

            {/* Colonne 3 : impacts */}
            <div>
              <h3 className="text-[14px] font-extrabold text-[#1A2233]">Les impacts concrets sur le système de santé</h3>
              <ul className="mt-3 space-y-2">
                {IMPACTS_RIGHT.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[12px] text-[#1A2233]">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#FCD0D6] bg-[#FFF1F3] p-2.5">
                <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-[#C0001F]" />
                <p className="text-[11px] text-[#1A2233]">
                  <strong className="text-[#C0001F]">Un enjeu majeur</strong> pour l&rsquo;avenir
                  de la santé en France.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc Major ECN + plateforme */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#C0001F]">
                <Sparkles className="h-3 w-3" /> Major ECN
              </p>
              <h3 className="mt-2 text-[18px] font-extrabold leading-snug text-[#1A2233]">
                + de 9 000 médecins accompagnés vers la réussite des EVC
              </h3>
              <p className="mt-2 text-[12.5px] text-[#52607A]">
                Depuis plus de 15 ans, Major-ECN accompagne les médecins PADHUE dans leur préparation
                aux Épreuves de Vérification des Connaissances (EVC), première étape de la Procédure
                d&rsquo;Autorisation d&rsquo;Exercice (PAE).
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[11.5px] text-[#1A2233]">
                {['45 spécialités médicales', 'Révisions transversales', 'QCM corrigés et commentés', 'Épreuves blanches', 'Cas cliniques progressifs', 'Accompagnement pédagogique personnalisé', 'Flashcards'].map((b) => (
                  <li key={b} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 text-[#C0001F]" /> {b}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-center text-[11.5px] font-bold text-[#1A2233]">Découvrez la plateforme Major-ECN</p>
              <div className="grid grid-cols-3 gap-2">
                <PlatformShot label="Tableau de bord complet" />
                <PlatformShot label="QCM corrigés et commentés" />
                <PlatformShot label="Corrections détaillées" />
              </div>
              <ul className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10.5px] font-semibold text-[#52607A]">
                <li className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-[#C0001F]" /> Accessible 24h/24</li>
                <li className="inline-flex items-center gap-1"><FileText className="h-3 w-3 text-[#C0001F]" /> Suivi détaillé de vos progrès</li>
                <li className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#C0001F]" /> Mises à jour régulières</li>
                <li className="inline-flex items-center gap-1"><Phone className="h-3 w-3 text-[#C0001F]" /> Application mobile</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Témoignage + avantages */}
        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
          <article className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
            <p className="text-[13px] font-extrabold text-[#1A2233]">Ils ont réussi les EVC avec Major-ECN</p>
            <div className="mt-3 text-[#F59E0B]">★★★★★</div>
            <p className="mt-2 text-[12px] italic leading-relaxed text-[#1A2233]">
              « Une préparation complète, des QCM de qualité et un suivi personnalisé m&rsquo;ont
              permis d&rsquo;aborder les EVC avec confiance. Les cas cliniques et les fiches
              m&rsquo;ont vraiment aidé. »
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE4E8] text-[11px] font-extrabold text-[#C0001F]">
                YK
              </span>
              <div>
                <p className="text-[12px] font-bold text-[#1A2233]">Dr. Y. K.</p>
                <p className="text-[10px] text-[#9AA1AE]">Admis EVC Médecine Générale Session 2024</p>
              </div>
            </div>
          </article>

          <div className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
            <h3 className="text-[15px] font-extrabold text-[#1A2233]">Les avantages d&rsquo;une préparation structurée</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              {ADVANTAGES.map((a) => (
                <div key={a.t} className="text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE4E8] text-[#C0001F]">
                    <a.Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-2 text-[10.5px] font-semibold leading-tight text-[#1A2233]">{a.t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ + CTA finale */}
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-[#ECEEF1] bg-white p-5 sm:p-6">
            <h3 className="text-[18px] font-extrabold text-[#1A2233]">FAQ — Vos questions fréquentes</h3>
            <ul className="mt-3 divide-y divide-[#F2F3F5]">
              {FAQS.map(([q, a]) => (
                <li key={q}>
                  <details className="group py-2.5">
                    <summary className="flex cursor-pointer items-center justify-between text-[13.5px] font-semibold text-[#1A2233]">
                      {q}
                      <ChevronDown className="h-4 w-4 text-[#9AA1AE] transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-[12.5px] text-[#52607A]">{a}</p>
                  </details>
                </li>
              ))}
            </ul>
            <Link href="/blog" className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#C0001F] hover:underline">
              Voir toutes les questions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 sm:p-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#C0001F]">Prêt à réussir les EVC ?</p>
              <h3 className="mt-2 text-[18px] font-extrabold leading-snug text-[#1A2233]">
                Rejoignez la préparation Major-ECN
              </h3>
              <p className="mt-1 text-[12.5px] text-[#52607A]">
                et mettez toutes les chances de votre côté pour réussir les EVC.
              </p>
            </div>
            <Link
              href="/plateforme"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-3 text-[13.5px] font-extrabold text-white shadow-sm transition-transform hover:scale-[1.01]"
            >
              Préparer les EVC avec Major-ECN <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Bandeau final */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#0F1F4D_0%,#5C1827_60%,#C0112E_100%)] p-5 text-white sm:p-6">
          <div className="grid items-center gap-3 lg:grid-cols-[auto_1fr_auto]">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <ScrollText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[14px] font-extrabold leading-tight">Réussir les EVC avec Major-ECN</p>
              <p className="mt-1 text-[12px] text-white/80">
                Depuis plus de 15 ans, Major-ECN accompagne les médecins PADHUE dans leur préparation
                aux Épreuves de Vérification des Connaissances (EVC) grâce à une plateforme complète :
                QCM corrigés, cas cliniques, flashcards, épreuves blanches et méthodologie spécifique EVC.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[11px] text-white/85">
              <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#F5D597]" /> Méthodologie spécifique EVC</span>
              <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3 text-[#F5D597]" /> Plateforme n°1 EVC PAE</span>
              <span className="inline-flex items-center gap-1"><Users className="h-3 w-3 text-[#F5D597]" /> Équipe pédagogique médicale</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-[#F5D597]" /> Résultats prouvés</span>
            </div>
          </div>
        </section>

        <p className="mt-3 text-center text-[10px] italic text-[#9AA1AE]">
          Major ECN — Organisme de formation spécialisé dans la préparation des Épreuves de
          Vérification des Connaissances (EVC) — PAE
        </p>
      </div>
    </main>
  );
}

/* ─────────────── helpers ─────────────── */

function PlatformShot({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#FACBD0] bg-white">
      <p className="border-b border-[#F2F3F5] px-2 py-1 text-center text-[9px] font-bold text-[#1A2233]">{label}</p>
      <div className="relative aspect-video">
        <Image src="/accueil.png" alt="" fill className="object-cover object-top" sizes="(max-width:1024px) 33vw, 200px" />
      </div>
    </div>
  );
}

// Icon helper for ClipboardCheck since lucide naming
function ClipboardCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}
