import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown,
  Clock, FileText, Folder, ListChecks, Phone, Quote, Sparkles,
} from 'lucide-react';
import { ArticleHeader, ArticleFinalCta, ARTICLE_FONT } from '../article-shell';
import { BrandLogo } from '@/components/brand/brand-logo';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';
import { getRelatedArticles } from '@/lib/data/blog-articles';

const INTRO_CARDS = [
  { Icon: ListChecks,    bg: '#FFE4E8', fg: '#C0001F', t: 'Conditions d\'inscription', d: 'Qui peut s\'inscrire aux EVC ? Liste A ou liste B : quelles différences et critères d\'éligibilité.' },
  { Icon: BookOpen,      bg: '#FCEAEC', fg: '#C0001F', t: 'Épreuves EVC',              d: 'Deux épreuves écrites de 2 heures chacune pour évaluer vos connaissances fondamentales et pratiques.' },
  { Icon: Folder,        bg: '#FEF3E2', fg: '#B26A00', t: 'Dossier administratif',     d: 'Les documents à fournir et les modalités d\'envoi du dossier à l\'ARS compétente.' },
  { Icon: Building2Icon, bg: '#EDE9FE', fg: '#6D28D9', t: 'Parcours PAE',              d: 'Les EVC sont la 1re étape de la Procédure d\'Autorisation d\'Exercice en France.' },
];

const TESTIMONIALS = [
  {
    initials: 'SE',
    name: 'Dr. SY Ely Cheikh Ibrahima',
    spec: 'Lauréat EVC Endocrinologie-Diabétologie 2025',
    photo: '/temoignages/dr-sy-ely-cheikh-ibrahima.jpg',
    text: "J'ai particulièrement apprécié la qualité de l'accompagnement, la disponibilité de l'équipe et le suivi tout au long de la préparation. J'ai obtenu de brillants résultats et réussi les EVC.",
  },
  {
    initials: 'LO',
    name: 'Dr. Lilia Ouled Ben Ahmed',
    spec: 'Lauréate EVC Odontologie 2025',
    photo: '/temoignages/dr-lilia-ouled-ben-ahmed.jpg',
    text: "Les supports sont clairs, synthétiques et permettent d'aller à l'essentiel sans se disperser. Cette préparation m'a permis d'aborder les épreuves avec davantage de confiance.",
  },
  {
    initials: 'AS',
    name: 'Dr. Ahmed SIFAOUI',
    spec: 'Lauréat EVC Gériatrie 2025',
    photo: '/temoignages/dr-ahmed-sifaoui.png',
    text: "Ce que j'ai particulièrement apprécié chez Major ECN, c'est le fait de savoir exactement sur quoi concentrer mes efforts. Je savais quoi réviser, quand le réviser et comment avancer progressivement.",
  },
];

const FAQS = [
  ['Qui peut passer les EVC ?', 'Tout titulaire d\'un diplôme de médecine, chirurgie dentaire, pharmacie ou sage-femme obtenu dans un État non membre de l\'UE/EEE permettant d\'exercer dans ce pays.'],
  ['Quelle est la différence entre la liste A et la liste B ?', 'La liste A est un concours avec un nombre de postes limité ; la liste B est un examen ouvert à certains publics protégés (réfugiés, apatrides, etc.) où il suffit d\'obtenir 10/20.'],
  ['Combien de fois peut-on passer les EVC ?', 'Quatre tentatives au total. L\'absence injustifiée compte comme une tentative.'],
  ['Existe-t-il une note éliminatoire ?', 'Oui. Une note inférieure ou égale à 6/20 à l\'une des épreuves écrites est éliminatoire.'],
  ['Quels documents fournir pour son dossier ?', 'Diplôme ou titre permettant d\'exercer, pièce d\'identité, traductions certifiées si nécessaire, formulaire de candidature et tout justificatif demandé par l\'ARS.'],
  ['Où envoyer son dossier EVC ?', 'La candidature se réalise en ligne directement sur la plateforme officielle du CNG pendant la période d\'inscription indiquée dans l\'arrêté d\'ouverture.'],
  ['Comment se déroulent les épreuves ?', 'Deux épreuves écrites de 2 heures chacune, anonymes, notées sur 20 et affectées du coefficient 1.'],
  ['Comment bien préparer les EVC ?', 'Une préparation structurée combinant cours synthétiques, QCM corrigés, cas cliniques progressifs et épreuves blanches maximise vos chances de réussite.'],
];

export function ArticleCommentSinscrire({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Conditions d'inscription, liste A et liste B, documents à fournir, nombre de tentatives et procédure auprès de l'ARS : le guide complet Major ECN pour réussir votre candidature aux EVC."
          rightArea={<HeroBookImage />}
        />

        {/* 4 info cards en intro */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INTRO_CARDS.map((c) => (
            <div key={c.t} className="rounded-2xl border border-[#ECEEF1] bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.fg }}>
                <c.Icon className="h-4 w-4" />
              </span>
              <p className="mt-2.5 text-[13px] font-bold" style={{ color: c.fg }}>{c.t}</p>
              <p className="mt-1 text-[11.5px] leading-snug text-[#52607A]">{c.d}</p>
            </div>
          ))}
        </section>

        {/* Sections 1 + 2 + 3 */}
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Section 1 — Qui peut se présenter */}
          <NumberedBox num={1} title="Qui peut se présenter aux EVC ?">
            <p className="text-[12.5px] text-[#1A2233]">
              Les EVC s&rsquo;adressent aux titulaires d&rsquo;un diplôme, certificat ou autre titre
              obtenu dans un État non membre de l&rsquo;Union européenne ou de l&rsquo;Espace
              économique européen permettant d&rsquo;exercer en tant que médecin,
              chirurgien-dentiste, sage-femme ou pharmacien.
            </p>
            <div className="mt-3 rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#C0001F]">Sont concernés :</p>
              <ul className="mt-2 space-y-1 text-[12px] text-[#1A2233]">
                {['Médecins diplômés hors UE / EEE', 'Chirurgiens-dentistes', 'Pharmaciens', 'Sages-femmes'].map((s) => (
                  <li key={s} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#C0001F]" /> {s}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex justify-center">
              <Image
                src="/blog/illustration-qui-peut-evc.webp"
                alt="Illustration médecin PADHUE avec tablette"
                width={1024}
                height={1536}
                className="h-auto w-2/5 select-none"
              />
            </div>
          </NumberedBox>

          {/* Section 2 — Les Épreuves (infographie) */}
          <div className="overflow-hidden rounded-2xl border border-[#ECEEF1] bg-white shadow-sm">
            <Image
              src="/blog/infographie-epreuves-evc.webp"
              alt="Les Épreuves de Vérification des Connaissances : voie externe (Liste A) avec 2 épreuves écrites de 2h, et voie interne avec épreuve unique QCM"
              width={1402}
              height={1122}
              className="w-full h-auto"
            />
          </div>

          {/* Section 3 — Liste A vs B (infographie) */}
          <div className="overflow-hidden rounded-2xl border border-[#ECEEF1] bg-white shadow-sm">
            <Image
              src="/blog/infographie-liste-a-b-evc.webp"
              alt="Liste A ou Liste B : quelle différence ? Tableau comparatif des critères, épreuves et conditions d'admission pour les EVC"
              width={1536}
              height={1024}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Sections 4 + 5 — côte à côte (infographies) */}
        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[#ECEEF1] bg-white shadow-sm">
            <Image
              src="/blog/infographie-justifier-francais-evc.webp"
              alt="Comment justifier de votre maîtrise du français : TCF/TEF niveau B2, DELF B2 ou DALF, baccalauréat français, diplôme universitaire français, études en français, situation particulière"
              width={1177}
              height={1336}
              className="w-full h-auto"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#ECEEF1] bg-white shadow-sm">
            <Image
              src="/blog/infographie-tentatives-evc.webp"
              alt="Combien de tentatives pour les EVC : 4 tentatives maximum, note éliminatoire à 6/20"
              width={1220}
              height={1289}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Section 6 — envoi dossier (constrainte pour éviter le surdimensionnement) */}
        <section className="mb-6 mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#ECEEF1] bg-white shadow-sm">
          <Image
            src="/blog/infographie-envoi-dossier-evc.webp"
            alt="Où envoyer son dossier de candidature : étapes de la candidature sur la plateforme du CNG"
            width={1061}
            height={1483}
            className="w-full h-auto"
          />
        </section>

        {/* Bloc Major ECN — pourquoi choisir + plateforme */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <BrandLogo className="h-12 w-auto sm:h-14" />
                <h3 className="text-[18px] font-extrabold leading-snug text-[#1A2233]">
                  Pourquoi plus de 9 000 médecins ont choisi Major ECN ?
                </h3>
              </div>
              <p className="mt-2 text-[12.5px] text-[#52607A]">
                Depuis plus de 15 ans, Major ECN accompagne les médecins PADHUE dans leur préparation aux EVC,
                première étape de la Procédure d&rsquo;Autorisation d&rsquo;Exercice (PAE).
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[11.5px] text-[#1A2233]">
                {['Plus de 15 ans d\'expérience', 'Plus de 9 000 médecins accompagnés', 'toutes les spécialités médicales', 'QCM corrigés et commentés', 'Cas cliniques progressifs', 'Flashcards', 'Révisions transversales', 'Épreuves blanches', 'Accompagnement pédagogique personnalisé'].map((b) => (
                  <li key={b} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 text-[#C0001F]" /> {b}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <Image
                src="/blog/illustration-cng-laptop.webp"
                alt="Illustration inscription en ligne sur la plateforme du CNG"
                width={1024}
                height={1536}
                className="h-auto w-3/4 select-none"
              />
            </div>
          </div>
          <div className="mt-5 border-t border-[#FACBD0]/50 pt-4">
            <p className="mb-3 text-center text-[11.5px] font-bold text-[#1A2233]">Découvrez la plateforme Major ECN</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <PlatformShot label="Tableau de bord"        src="/accueil.png" />
              <PlatformShot label="Entraînement ciblé"     src="/entrainement.png" />
              <PlatformShot label="Cours par item EDN"     src="/cours.png" />
              <PlatformShot label="Annales EVC corrigées"  src="/annales.png" />
            </div>
            <ul className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10.5px] font-semibold text-[#52607A]">
              <li className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-[#C0001F]" /> Accessible 24h/24</li>
              <li className="inline-flex items-center gap-1"><FileText className="h-3 w-3 text-[#C0001F]" /> Suivi détaillé de vos progrès</li>
              <li className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#C0001F]" /> Mises à jour régulières</li>
              <li className="inline-flex items-center gap-1"><Phone className="h-3 w-3 text-[#C0001F]" /> Application mobile</li>
            </ul>
          </div>
        </section>

        {/* Témoignages */}
        <section className="mb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-[18px] font-extrabold text-[#1A2233]">Ils ont réussi les EVC avec Major ECN</h3>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <article key={t.initials} className="rounded-2xl border border-[#ECEEF1] bg-white p-4 shadow-sm">
                <Quote className="h-5 w-5 text-[#F59E0B]" />
                <p className="mt-2 text-[12.5px] italic leading-relaxed text-[#1A2233]">« {t.text} »</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <Image
                    src={t.photo}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-[#FFE4E8]"
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold leading-tight text-[#1A2233]">{t.name}</p>
                    <p className="text-[10px] leading-tight text-[#9AA1AE]">{t.spec}</p>
                  </div>
                </div>
              </article>
            ))}
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
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#C0001F]">Une préparation structurée fait la différence !</p>
              <h3 className="mt-2 text-[18px] font-extrabold leading-snug text-[#1A2233]">
                Ne laissez pas le hasard décider de votre avenir.
              </h3>
              <p className="mt-1 text-[12.5px] text-[#52607A]">
                Commencez votre préparation dès maintenant avec Major ECN.
              </p>
            </div>
            <div className="flex justify-center">
              <Image
                src="/blog/illustration-preparation-evc.webp"
                alt="Parcours de préparation structuré pour réussir les EVC"
                width={1163}
                height={1353}
                className="h-auto w-2/5 select-none"
              />
            </div>
            <Link
              href="/plateforme"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-3 text-[13.5px] font-extrabold text-white shadow-sm transition-transform hover:scale-[1.01]"
            >
              Découvrir la préparation EVC <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Bandeau final */}
        <ArticleFinalCta />
      </div>
    </main>
  );
}

/* ─────────────── helpers ─────────────── */

function HeroBookImage() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border"
      style={{
        borderColor: '#E5E9F0',
        boxShadow: '0 18px 40px -22px rgba(15,31,77,0.30)',
        background: 'linear-gradient(135deg,#E5F1FF 0%,#F0E4FF 50%,#FFE4E8 100%)',
      }}
    >
      <Image
        src="/blog/sinscrire-evc-hero.webp"
        alt="Médecin PADHUE préparant son inscription aux EVC"
        width={1920}
        height={1280}
        className="block w-full h-auto select-none"
        priority
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 40%, rgba(15,31,77,0.18) 100%)' }}
      />
      <span
        className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] backdrop-blur"
        style={{ color: '#16793C', boxShadow: '0 6px 14px -8px rgba(15,31,77,0.20)' }}
      >
        <ShieldCheckIcon className="h-2.5 w-2.5" />
        Inscription EVC
      </span>
    </div>
  );
}

/* Petit shield-check inline pour ne pas tirer une icone supplementaire. */
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function NumberedBox({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FFE4E8] text-[12px] font-extrabold text-[#C0001F]">
          {num}
        </span>
        <h2 className="text-[15px] font-extrabold leading-snug text-[#1A2233]">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PlatformShot({ label, src = '/accueil.png' }: { label: string; src?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#FACBD0] bg-white">
      <p className="border-b border-[#F2F3F5] px-2 py-1 text-center text-[9px] font-bold text-[#1A2233]">{label}</p>
      <div className="relative aspect-video">
        <Image src={src} alt="" fill className="object-cover object-top" sizes="(max-width:1024px) 25vw, 180px" />
      </div>
    </div>
  );
}

// Workaround for missing Building2 in initial imports
function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="6" width="8" height="14" />
      <rect x="13" y="3" width="8" height="17" />
      <path d="M6 10h2M6 14h2M6 18h2M16 7h2M16 11h2M16 15h2" />
    </svg>
  );
}
