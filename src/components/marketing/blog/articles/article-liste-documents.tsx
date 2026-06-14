import Image from 'next/image';
import {
  AlertTriangle, ArrowRight, BadgeCheck, BookOpen, Building2, Check, CheckCircle2,
  ChevronDown, ClipboardCheck, Clock, FileBadge, FileCheck2, FileText,
  GraduationCap, Globe2, IdCard, Languages, Lightbulb, ListChecks, Lock, Phone,
  ScrollText, ShieldCheck, Smartphone, Sparkles, Stethoscope, Users,
} from 'lucide-react';
import { ArticleHeader, ArticleFinalCta, ARTICLE_FONT } from '../article-shell';
import { NewsletterForm } from '../newsletter-form';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';
import { getRelatedArticles } from '@/lib/data/blog-articles';
import Link from 'next/link';

const INFO_CARDS = [
  { Icon: IdCard,    bg: '#FFE4E8', fg: '#C0001F', t: 'Pièce d\'identité',          d: 'Carte d\'identité, passeport ou titre de séjour valide à la date de clôture des inscriptions.' },
  { Icon: GraduationCap, bg: '#EDE9FE', fg: '#6D28D9', t: 'Diplôme',                   d: 'Diplôme d\'origine reconnu dans le pays de délivrance (médecin, pharmacien, dentiste ou sage-femme).' },
  { Icon: Globe2,    bg: '#E5F1FF', fg: '#1E4D8B', t: 'Traductions officielles',   d: 'Toutes les pièces doivent être rédigées en français ou accompagnées d\'une traduction officielle assermentée.' },
  { Icon: FileBadge, bg: '#FCEAEC', fg: '#C0001F', t: 'Justificatifs complémentaires', d: 'Attestations et documents spécifiques selon votre situation (statut, résidence, etc.).' },
];

const PARCOURS = [
  { Icon: GraduationCap, t: 'Diplôme hors UE' },
  { Icon: ClipboardCheck, t: 'Inscription EVC' },
  { Icon: FileText,       t: 'Épreuves écrites' },
  { Icon: Building2,      t: 'PCC' },
  { Icon: BadgeCheck,     t: 'Autorisation d\'exercice' },
];

const DOCS = [
  'Pièce d\'identité valide (carte, passeport ou titre de séjour).',
  'Diplôme d\'origine (doctorat, pharmacie, chirurgie dentaire ou sage-femme).',
  'Passeport.',
  'Titre de séjour en cours de validité.',
  'Justificatif de statut (réfugié, apatride, bénéficiaire de l\'asile ou protection subsidiaire, le cas échéant).',
  'Justificatif de résidence en France.',
  'Tout document prouvant votre retour en France (pour les Français rappelés par les autorités).',
];

const LANG_DIPLOMAS = [
  { Icon: Languages,    t: 'TCF ou TEF',                  s: 'Niveau minimum B2' },
  { Icon: FileCheck2,    t: 'DELF B2',                     s: 'Diplôme d\'Études en Langue Française' },
  { Icon: GraduationCap, t: 'Baccalauréat français',       s: 'Quelle que soit votre nationalité' },
  { Icon: GraduationCap, t: 'Diplôme universitaire français', s: 'Équivalent ou supérieur à un Bac' },
  { Icon: BookOpen,      t: 'Études en français',          s: 'Attestation de votre établissement' },
  { Icon: ShieldCheck,   t: 'Statut particulier',          s: 'Tout document prouvant la maîtrise de la langue (réfugié, apatride, etc.)' },
];

const PROGRAMME = [
  { Icon: Stethoscope, label: 'Médecins',                bg: '#FCEAEC', fg: '#C0001F', items: ['Arrêté du 4 juillet 2003 (biologie médicale)', 'Arrêté du 22 sept. 2004 (DES médecine)', 'Arrêté du 22 sept. 2004 (DESC)'] },
  { Icon: GraduationCap, label: 'Chirurgiens-dentistes', bg: '#EDE9FE', fg: '#6D28D9', items: ['Arrêté du 8 avril 2013 (régime des études)', 'Arrêtés de 1995, 1997 et 1999', '(orientations odontologiques)'] },
  { Icon: BookOpen,    label: 'Pharmaciens',             bg: '#DCFCE7', fg: '#16793C', items: ['Arrêté du 8 avril 2013', '(régime des études)'] },
  { Icon: Users,       label: 'Sages-femmes',            bg: '#FEF3E2', fg: '#B26A00', items: ['Arrêté du 11 mars 2013', '(cadre du diplôme d\'État)'] },
];

const RULES = [
  { Icon: CheckCircle2, t: 'Présence obligatoire à toutes les épreuves',     fg: '#16A34A' },
  { Icon: Clock,        t: 'Respect des horaires et des consignes',          fg: '#16A34A' },
  { Icon: Lock,         t: 'Anonymat total (aucune mention identifiable)',    fg: '#16A34A' },
  { Icon: ListChecks,   t: 'Matériel autorisé selon la convocation',         fg: '#16A34A' },
  { Icon: Smartphone,   t: 'Téléphone et appareils électroniques interdits', fg: '#C0001F' },
  { Icon: AlertTriangle, t: 'Fraude = exclusion immédiate et définitive',    fg: '#C0001F' },
];

const FAQS = [
  ['Quels documents fournir pour les EVC ?', 'Pièce d\'identité valide, diplôme d\'origine reconnu, traductions officielles si nécessaire, et justificatifs liés à votre situation administrative.'],
  ['Comment traduire son diplôme pour les EVC ?', 'La traduction doit être réalisée par un traducteur agréé près d\'une cour d\'appel et accompagnée du document original.'],
  ['Quel niveau de français pour les EVC ?', 'Le niveau B2 minimum est exigé, prouvé par un TCF/TEF, un DELF B2, un baccalauréat français ou un diplôme universitaire français.'],
  ['Combien de fois peut-on passer les EVC ?', 'Vous disposez de quatre tentatives au maximum. Les inscriptions sans présentation effective ne sont pas comptabilisées depuis la réforme 2021.'],
  ['Quelle est la différence entre EVC et PAE ?', 'Les EVC sont la première étape (l\'examen) ; la PAE est la procédure globale qui comprend EVC, PCC et autorisation d\'exercice définitive.'],
  ['Où envoyer son dossier EVC ?', 'À l\'ARS (Agence régionale de santé) de votre lieu de résidence, ou de votre lieu d\'exercice si vous êtes déjà en France.'],
  ['Comment se déroulent les EVC ?', 'Deux épreuves écrites anonymes et indépendantes, chacune de 2 heures, notées sur 20, avec un coefficient 1.'],
];

export function ArticleListeDocuments({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Découvrez tous les documents nécessaires pour votre inscription aux Épreuves de Vérification des Connaissances (EVC), les justificatifs acceptés, les exigences linguistiques, le nombre de tentatives autorisées et les règles essentielles pour constituer un dossier conforme."
          rightArea={<HeroVisual />}
        />

        {/* 4 cartes d'introduction */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INFO_CARDS.map((c) => (
            <div key={c.t} className="flex gap-3 rounded-2xl border border-[#ECEEF1] bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.fg }}>
                <c.Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[13px] font-bold leading-snug" style={{ color: c.fg }}>{c.t}</p>
                <p className="mt-1.5 text-[11.5px] leading-snug text-[#52607A]">{c.d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Section 1 + 2 + 3 grille 3 colonnes */}
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <NumberedBox num={1} title="Qui doit constituer un dossier EVC ?">
            <p className="text-[12.5px] text-[#52607A]">Le parcours PAE pour les diplômés hors UE</p>
            <ul className="mt-4 space-y-2">
              {PARCOURS.map((p, i) => (
                <li key={p.t} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFE4E8] text-[#C0001F]">
                    <p.Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[13px] font-semibold text-[#1A2233]">{p.t}</span>
                  {i < PARCOURS.length - 1 && (
                    <ChevronDown className="ml-auto h-4 w-4 text-[#9AA1AE]" />
                  )}
                </li>
              ))}
            </ul>
          </NumberedBox>

          <NumberedBox num={2} title="Liste complète des documents à fournir">
            <p className="text-[12.5px] text-[#52607A]">Préparez chaque pièce avec soin.</p>
            <ul className="mt-3 space-y-2">
              {DOCS.map((d) => (
                <li key={d} className="flex items-start gap-2 text-[12.5px] text-[#1A2233]">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
                  {d}
                </li>
              ))}
            </ul>
          </NumberedBox>

          <NumberedBox num={3} title="Documents rédigés dans une langue étrangère">
            <p className="text-[12.5px] text-[#1A2233]">Une traduction officielle est obligatoire.</p>
            <ul className="mt-3 space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFE4E8] text-[#C0001F]">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12.5px] font-bold text-[#1A2233]">Document original</p>
                  <p className="text-[11.5px] text-[#52607A]">(langue étrangère)</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#6D28D9]">
                  <Languages className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12.5px] font-bold text-[#1A2233]">Traduction par un traducteur assermenté</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#16793C]">
                  <FileCheck2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12.5px] font-bold text-[#1A2233]">Dossier recevable par l&rsquo;administration</p>
                </div>
              </li>
            </ul>
          </NumberedBox>
        </section>

        {/* Section 4 : Niveau de français */}
        <NumberedBlock num={4} title="Comment prouver votre niveau de français ?">
          <p className="mb-3 text-[13px] text-[#52607A]">
            Fournissez l&rsquo;un des justificatifs suivants :
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LANG_DIPLOMAS.map((d) => (
              <div key={d.t} className="flex items-start gap-3 rounded-xl bg-[#FAFBFE] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFE4E8] text-[#C0001F]">
                  <d.Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12.5px] font-bold text-[#1A2233]">{d.t}</p>
                  <p className="text-[11.5px] text-[#52607A]">{d.s}</p>
                </div>
              </div>
            ))}
          </div>
        </NumberedBlock>

        {/* Section 5 + 6 + 7 */}
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Section 5 — tentatives */}
          <NumberedBox num={5} title="Combien de tentatives aux EVC ?">
            <p className="text-[12.5px] text-[#52607A]">
              Depuis la réforme de 2021, vous disposez de 4 tentatives maximum.
            </p>
            <div className="mt-4 flex items-center justify-between gap-2">
              {[1, 2, 3, 4].map((n, i) => (
                <div key={n} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE4E8] text-[13px] font-extrabold text-[#C0001F]">
                      {n}
                    </span>
                    <span className="mt-1 text-[10px] font-semibold text-[#1A2233]">Tentative {n}</span>
                  </div>
                  {i < 3 && <ChevronRightCustom />}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-[#FCD0D6] bg-[#FFF1F3] p-3">
              <p className="text-[11px] font-bold text-[#C0001F]">Bon à savoir</p>
              <ul className="mt-1.5 space-y-1 text-[11.5px] text-[#1A2233]">
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 text-[#C0001F]" /> Les tentatives avant 2021 ne sont pas comptabilisées.</li>
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 text-[#C0001F]" /> Chaque inscription = 1 tentative, même en cas d&rsquo;absence.</li>
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 text-[#C0001F]" /> Absence injustifiée = tentative perdue.</li>
              </ul>
            </div>
            <div className="mt-3 inline-flex items-start gap-2 rounded-lg bg-[#FEF3C7] px-3 py-2 text-[11px] text-[#92400E]">
              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
              <span>
                <strong>Conseil Major ECN :</strong> Commencez votre préparation le plus tôt possible pour maximiser vos chances de réussite.
              </span>
            </div>
          </NumberedBox>

          {/* Section 6 — épreuves */}
          <NumberedBox num={6} title="Comment se déroulent les EVC ?">
            <p className="text-[12.5px] text-[#52607A]">
              Deux épreuves écrites, anonymes et indépendantes.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <EpreuveCard label="Épreuve théorique" Icon={BookOpen} />
              <EpreuveCard label="Épreuve pratique" Icon={Stethoscope} />
            </div>
            <p className="mt-3 text-[12.5px] text-[#1A2233]">
              Vérifie vos connaissances scientifiques fondamentales à l&rsquo;exercice de la profession et de la spécialité choisie. Évalue votre capacité à mobiliser vos connaissances dans des situations cliniques ou professionnelles concrètes.
            </p>
            <div className="mt-3 inline-flex items-start gap-2 rounded-lg bg-[#FFF1F3] px-3 py-2 text-[11px] text-[#C0001F]">
              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
              <span>
                <strong>Bon à savoir :</strong> les sujets sont identiques pour tous les candidats d&rsquo;une même spécialité. L&rsquo;anonymat des copies garantit l&rsquo;impartialité des corrections.
              </span>
            </div>
          </NumberedBox>

          {/* Section 7 — programme officiel */}
          <NumberedBox num={7} title="Programme officiel des EVC">
            <p className="text-[12.5px] text-[#52607A]">
              Références réglementaires : arrêté du 9 juillet 2021.
            </p>
            <ul className="mt-3 space-y-2.5">
              {PROGRAMME.map((p) => (
                <li key={p.label} className="rounded-lg border border-[#ECEEF1] bg-[#FAFBFE] p-2.5">
                  <p className="inline-flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color: p.fg }}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: p.bg }}>
                      <p.Icon className="h-3 w-3" />
                    </span>
                    {p.label}
                  </p>
                  <ul className="mt-1 space-y-0.5 pl-7 text-[10.5px] text-[#52607A]">
                    {p.items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                </li>
              ))}
            </ul>
          </NumberedBox>
        </section>

        {/* Section 8 — règles du jour J */}
        <NumberedBlock num={8} title="Les règles à respecter le jour des EVC" subtitle="Un concours national encadré par des règles strictes.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {RULES.map((r) => (
              <div key={r.t} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: r.fg === '#C0001F' ? '#FFE4E8' : '#DCFCE7', color: r.fg }}>
                  <r.Icon className="h-5 w-5" />
                </span>
                <p className="mt-2 text-[11.5px] font-semibold leading-snug text-[#1A2233]">{r.t}</p>
              </div>
            ))}
          </div>
        </NumberedBlock>

        {/* Bloc plateforme Major ECN */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#C0001F]">
                <Sparkles className="h-3 w-3" /> Plus de 15 ans d&rsquo;expérience
              </p>
              <h3 className="mt-2 text-[18px] font-extrabold leading-snug text-[#1A2233]">
                dans la préparation EVC
              </h3>
              <p className="mt-2 text-[12.5px] text-[#52607A]">
                Depuis plus de 15 ans, Major ECN accompagne les médecins PADHUE
                dans leur préparation aux Épreuves de Vérification des Connaissances (EVC).
              </p>
              <p className="mt-3 text-[12px] font-bold text-[#1A2233]">Plus de 9 000 médecins accompagnés</p>
              <ul className="mt-2 grid grid-cols-2 gap-1.5 text-[11.5px] text-[#1A2233]">
                {['45 spécialités médicales', 'QCM corrigés et commentés', 'Cas cliniques progressifs', 'Flashcards', 'Révisions transversales', 'Épreuves blanches', 'Accompagnement pédagogique personnalisé'].map((b) => (
                  <li key={b} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 text-[#C0001F]" /> {b}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-center text-[11.5px] font-bold text-[#1A2233]">Découvrez la plateforme Major ECN</p>
              <div className="grid grid-cols-3 gap-2">
                <PlatformShot label="Dashboard complet" />
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

        {/* Articles similaires */}
        <RelatedRow currentSlug={article.slug} />

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
              <h3 className="mt-2 text-[20px] font-extrabold leading-snug text-[#1A2233]">
                Rejoignez la préparation Major ECN
              </h3>
              <p className="mt-1 text-[12.5px] text-[#52607A]">
                et mettez toutes les chances de votre côté.
              </p>
              <NewsletterForm />
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

function HeroVisual() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#ECEEF1] bg-[linear-gradient(135deg,#FFF1F3_0%,#FFE4E8_50%,#EDE9FE_100%)] lg:aspect-auto lg:h-52">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-32 w-44">
          <span className="absolute left-0 top-2 flex h-28 w-32 rotate-[-3deg] items-center justify-center rounded-md bg-white shadow-md">
            <FileText className="h-9 w-9 text-[#C0001F]/30" />
          </span>
          <span className="absolute right-0 bottom-0 flex h-24 w-28 rotate-[4deg] items-center justify-center rounded-md bg-white shadow-md">
            <ScrollText className="h-8 w-8 text-[#1E4D8B]/30" />
          </span>
        </div>
      </div>
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#1A2233]">
        <ShieldCheck className="h-3 w-3 text-[#C0001F]" />
        Dossier de candidature
      </span>
    </div>
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

function NumberedBlock({ num, title, subtitle, children }: { num: number; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-[#ECEEF1] bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FFE4E8] text-[12px] font-extrabold text-[#C0001F]">
          {num}
        </span>
        <div>
          <h2 className="text-[17px] font-extrabold leading-snug text-[#1A2233]">{title}</h2>
          {subtitle && <p className="mt-1 text-[12.5px] text-[#52607A]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function EpreuveCard({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <div className="rounded-lg border border-[#ECEEF1] bg-[#FAFBFE] p-2.5 text-center">
      <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-[#FFE4E8] text-[#C0001F]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-1 text-[10.5px] font-bold text-[#1A2233]">{label}</p>
      <div className="mt-1.5 flex justify-around text-[9px] text-[#52607A]">
        <span><strong className="block text-[#1A2233]">2h</strong>Durée</span>
        <span><strong className="block text-[#1A2233]">/20</strong>Notation</span>
        <span><strong className="block text-[#1A2233]">Coef. 1</strong>Coefficient</span>
      </div>
    </div>
  );
}

function ChevronRightCustom() {
  return <span className="text-[#9AA1AE]">→</span>;
}

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

function RelatedRow({ currentSlug }: { currentSlug: string }) {
  const related = getRelatedArticles(currentSlug, 4);
  return (
    <section className="mb-8">
      <p className="mb-3 text-[12px] font-bold text-[#1A2233]">Vous aimerez aussi · Les articles similaires</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((a) => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="group overflow-hidden rounded-xl border border-[#ECEEF1] bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/9] bg-[linear-gradient(135deg,#FFF1F3_0%,#EDE9FE_100%)]">
              <span className="absolute inset-0 flex items-center justify-center">
                <Stethoscope className="h-10 w-10 text-[#9AA1AE]/40" />
              </span>
            </div>
            <div className="p-3">
              <p className="line-clamp-3 text-[12.5px] font-bold leading-snug text-[#1A2233] group-hover:text-[#C0001F]">
                {a.title}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-[#C0001F]">
                Lire l&rsquo;article <ArrowRight className="h-3 w-3" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

