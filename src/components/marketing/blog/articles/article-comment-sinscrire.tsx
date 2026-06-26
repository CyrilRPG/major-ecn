import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronDown,
  ClipboardCheck, Clock, FileBadge, FileText, Folder, GraduationCap, IdCard,
  ListChecks, MapPin, Phone, Phone as Phone2, Quote, ScrollText, Sparkles,
  Stethoscope, Target, Trophy, Users,
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

const SECTIONS_TOP = [
  { num: 1, title: 'Qui peut se présenter aux EVC ?' },
  { num: 2, title: 'Les Épreuves de Vérification des Connaissances (EVC)' },
  { num: 3, title: 'Liste A ou Liste B : quelle différence ?' },
];

const COMPARE_TABLE: Array<{ critere: string; aTitle: string; bTitle: string; aDetails?: string[]; bDetails?: string[]; aHighlight?: string; bHighlight?: string }> = [
  { critere: 'Nature',     aTitle: 'Concours',                                bTitle: 'Épreuve spécifique (voie interne)' },
  { critere: 'Sélection',  aTitle: 'Nombre de postes limité',                 bTitle: 'Nombre de postes limité' },
  {
    critere: 'Épreuves',
    aTitle: '2 épreuves écrites',
    aDetails: ['1re épreuve : connaissances fondamentales', 'Durée : 2h • Note sur 20 • Coefficient 1', '2e épreuve : connaissances pratiques', 'Durée : 2h • Note sur 20 • Coefficient 1'],
    bTitle: '1 épreuve écrite unique (QCM)',
    bDetails: ['Durée : 2h • Note sur 20 • Coefficient 1'],
  },
  {
    critere: 'Admission',
    aTitle: 'Admission des candidats selon les résultats obtenus dans la spécialité,',
    aHighlight: 'dans la limite des postes ouverts.',
    bTitle: 'Admission des candidats selon les résultats obtenus dans la spécialité,',
    bHighlight: 'dans la limite des postes ouverts.',
  },
];

const LISTE_B = [
  'Réfugiés politiques',
  'Bénéficiaires de la protection subsidiaire',
  'Apatrides',
  'Français ayant regagné le territoire national à la demande des autorités françaises',
  'Bénéficiaires de l\'asile territorial',
];

const DOCS = [
  { Icon: GraduationCap, t: 'Diplôme ou titre',                 s: 'permettant d\'exercer',         highlight: false },
  { Icon: IdCard,        t: 'Pièce d\'identité',                s: 'en cours de validité',          highlight: false },
  { Icon: FileText,      t: 'Traductions assermentées',         s: 'en français',                   highlight: true  },
  { Icon: ClipboardCheck, t: 'Formulaire d\'inscription',       s: 'CNG',                            highlight: false },
  { Icon: FileBadge,     t: 'Justificatifs complémentaires',    s: 'selon votre situation',         highlight: false },
];

const ENVOI_STEPS: Array<{ Icon: typeof BookOpen; t: string; key?: boolean }> = [
  { Icon: BookOpen,       t: 'Préparation EVC' },
  { Icon: ScrollText,     t: 'Dépôt du dossier en ligne sur la plateforme du CNG', key: true },
  { Icon: ClipboardCheck, t: 'Épreuves écrites' },
  { Icon: Sparkles,       t: 'Résultats' },
  { Icon: Users,          t: 'PCC' },
  { Icon: CheckCircle2,   t: 'Autorisation d\'exercice' },
];

const TESTIMONIALS = [
  {
    initials: 'SE',
    name: 'Dr. SY Ely Cheikh Ibrahima',
    spec: 'Lauréat EVC Endocrinologie-Diabétologie 2025',
    photo: '/temoignages/dr-sy-ely-cheikh-ibrahima.jpg',
    text: "J'ai particulièrement apprécié la qualité de l'accompagnement, la disponibilité de l'équipe et le suivi tout au long de la préparation. J'ai obtenu plus de 17/20 de moyenne et réussi les EVC.",
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
          </NumberedBox>

          {/* Section 2 — Les Épreuves (pixel-perfect : Voie externe + Voie interne + Important) */}
          <NumberedBox num={2} title="Les Épreuves de Vérification des Connaissances (EVC)">
            <p className="text-[12.5px] text-[#1A2233]">
              Les EVC consistent en deux épreuves écrites, chacune d&rsquo;une durée de deux heures,
              notées sur 20 et affectées d&rsquo;un coefficient de 1.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {/* Voie externe — Liste A */}
              <div className="rounded-2xl border bg-[#F5F8FF] p-4" style={{ borderColor: '#DCE6FF' }}>
                <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: '#DCE6FF' }}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5EDFF] text-[#1E4D8B]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[14px] font-extrabold leading-tight text-[#1E4D8B]">Voie externe</p>
                    <p className="text-[11px] text-[#1E4D8B]/80">(Liste A — Voie concours)</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border bg-white p-3" style={{ borderColor: '#DCE6FF' }}>
                    <div className="flex items-start gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E4D8B] text-[11px] font-extrabold text-white">1</span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-extrabold text-[#1A2233]">1re épreuve</p>
                        <p className="text-[11px] font-semibold text-[#1E4D8B]">Connaissances fondamentales</p>
                        <p className="mt-1 text-[10.5px] text-[#52607A]">Épreuve écrite — Durée&nbsp;: 2h — /20 — Coefficient 1</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white p-3" style={{ borderColor: '#DCE6FF' }}>
                    <div className="flex items-start gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E4D8B] text-[11px] font-extrabold text-white">2</span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-extrabold text-[#1A2233]">2e épreuve</p>
                        <p className="text-[11px] font-semibold text-[#1E4D8B]">Connaissances pratiques</p>
                        <p className="mt-1 text-[10.5px] text-[#52607A]">Épreuve écrite — Durée&nbsp;: 2h — /20 — Coefficient 1</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white p-3" style={{ borderColor: '#DCE6FF' }}>
                    <div className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1E4D8B]" />
                      <p className="text-[11px] leading-snug text-[#1A2233]">
                        <span className="font-extrabold">Nombre de postes limité.</span>{' '}
                        Admission selon les résultats obtenus dans la spécialité, dans la limite des postes ouverts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voie interne — Liste B */}
              <div className="rounded-2xl border bg-[#FFF6F8] p-4" style={{ borderColor: '#FACBD0' }}>
                <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: '#FACBD0' }}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE4E8] text-[#C0001F]">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[14px] font-extrabold leading-tight text-[#C0001F]">Voie interne</p>
                    <p className="text-[11px] text-[#C0001F]/80">(Voie réservée aux praticiens en exercice)</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border bg-white p-3" style={{ borderColor: '#FACBD0' }}>
                    <div className="flex items-start gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C0001F] text-[11px] font-extrabold text-white">1</span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-extrabold text-[#1A2233]">Épreuve unique</p>
                        <p className="text-[11px] font-semibold text-[#C0001F]">Épreuve de connaissances</p>
                        <p className="mt-1 text-[10.5px] text-[#52607A]">Épreuve écrite — Format QCM</p>
                        <p className="text-[10.5px] text-[#52607A]">Durée&nbsp;: 2h — /20 — Coefficient 1</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white p-3" style={{ borderColor: '#FACBD0' }}>
                    <div className="flex items-start gap-2">
                      <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C0001F]" />
                      <p className="text-[11px] font-semibold text-[#1A2233]">Nombre de postes limité.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white p-3" style={{ borderColor: '#FACBD0' }}>
                    <div className="flex items-start gap-2">
                      <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C0001F]" />
                      <p className="text-[11px] leading-snug text-[#1A2233]">
                        Voie réservée aux praticiens en exercice remplissant les conditions d&rsquo;éligibilité réglementaires.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important — alerte orange */}
            <div className="mt-4 rounded-xl border bg-[#FFFBEB] p-3" style={{ borderColor: '#FCE4A5' }}>
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#D97706]" style={{ boxShadow: '0 0 0 2px #F59E0B inset' }}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-extrabold text-[#92400E]">Important</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-[#1A2233]">
                    Les modalités des épreuves peuvent évoluer.<br />
                    Vérifiez systématiquement l&rsquo;arrêté d&rsquo;ouverture et les informations publiées par le <strong>CNG</strong> avant votre inscription.
                  </p>
                </div>
              </div>
            </div>
          </NumberedBox>

          {/* Section 3 — Liste A vs B (pixel-perfect : tableau rouge/bleu + Qui peut s'inscrire + Important) */}
          <NumberedBox num={3} title="Liste A ou Liste B : quelle différence ?">
            <div className="overflow-hidden rounded-2xl border" style={{ borderColor: '#ECEEF1' }}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[11.5px]">
                  <thead>
                    <tr>
                      <th className="bg-[#F7F9FC] px-3 py-2.5 text-left text-[11px] font-extrabold text-[#1A2233]">
                        <span className="inline-flex items-center gap-1.5">
                          <ListChecks className="h-3.5 w-3.5 text-[#9AA1AE]" />
                          Critères
                        </span>
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-extrabold text-white" style={{ background: '#E5102E' }}>
                        <span className="inline-flex items-center gap-2">
                          <ScrollText className="h-3.5 w-3.5" />
                          Liste A (Voie concours)
                        </span>
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-extrabold text-white" style={{ background: '#1E4D8B' }}>
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          Liste B (Voie interne)
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_TABLE.map((r, idx) => (
                      <tr key={r.critere} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFE]'}>
                        <td className="border-t border-[#F2F3F5] px-3 py-3 align-top">
                          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#1A2233]">
                            {r.critere === 'Nature' && <ClipboardCheck className="h-3.5 w-3.5 text-[#1E4D8B]" />}
                            {r.critere === 'Sélection' && <Target className="h-3.5 w-3.5 text-[#1E4D8B]" />}
                            {r.critere === 'Épreuves' && <Clock className="h-3.5 w-3.5 text-[#1E4D8B]" />}
                            {r.critere === 'Admission' && <CheckCircle2 className="h-3.5 w-3.5 text-[#1E4D8B]" />}
                            {r.critere}
                          </span>
                        </td>
                        <td className="border-t border-[#F2F3F5] px-3 py-3 align-top text-[11.5px] text-[#1A2233]">
                          <p className={r.critere === 'Épreuves' ? 'font-extrabold text-[#E5102E]' : ''}>
                            {r.aTitle}
                          </p>
                          {r.aHighlight && <span className="font-semibold text-[#E5102E]">{r.aHighlight}</span>}
                          {r.aDetails && (
                            <ul className="mt-1.5 space-y-0.5 text-[10.5px] text-[#1A2233]">
                              {r.aDetails.map((d, di) => (
                                <li key={di} className="flex items-start gap-1.5">
                                  <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-[#1A2233]" />
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="border-t border-[#F2F3F5] px-3 py-3 align-top text-[11.5px] text-[#1A2233]">
                          <p className={r.critere === 'Épreuves' ? 'font-extrabold text-[#1E4D8B]' : ''}>
                            {r.bTitle}
                          </p>
                          {r.bHighlight && <span className="font-semibold text-[#1E4D8B]">{r.bHighlight}</span>}
                          {r.bDetails && (
                            <ul className="mt-1.5 space-y-0.5 text-[10.5px] text-[#1A2233]">
                              {r.bDetails.map((d, di) => (
                                <li key={di} className="flex items-start gap-1.5">
                                  <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-[#1A2233]" />
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Qui peut s'inscrire en liste B */}
            <div className="mt-4 rounded-2xl border p-4" style={{ background: '#F0F5FF', borderColor: '#DCE6FF' }}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5EDFF] text-[#1E4D8B]">
                  <Users className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-extrabold text-[#1E4D8B]">
                    Qui peut s&rsquo;inscrire en liste B (voie interne) ?
                  </p>
                  <ul className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1.5 text-[11.5px] text-[#1A2233] sm:grid-cols-2">
                    {LISTE_B.map((b) => (
                      <li key={b} className="flex items-start gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1E4D8B]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Important */}
            <div className="mt-3 rounded-xl border p-3" style={{ background: '#FFF6F8', borderColor: '#FACBD0' }}>
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#E5102E]" style={{ boxShadow: '0 0 0 2px #E5102E inset' }}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-extrabold text-[#E5102E]">Important</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-[#1A2233]">
                    Les modalités peuvent évoluer. Vérifiez systématiquement <strong>l&rsquo;arrêté d&rsquo;ouverture</strong> et les informations publiées par le CNG avant votre inscription.
                  </p>
                </div>
              </div>
            </div>
          </NumberedBox>
        </section>

        {/* Section 4 — Documents (pixel-perfect) */}
        <section className="mb-6">
          <NumberedBox num={4} title="Documents nécessaires pour l'inscription aux EVC">
            <p className="text-[13px] text-[#1A2233]">
              Votre dossier de candidature déposé sur la plateforme du CNG{' '}
              <span className="font-extrabold text-[#1E4D8B]">doit comporter</span> les pièces suivantes&nbsp;:
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {DOCS.map((d) => (
                <li
                  key={d.t}
                  className={`rounded-2xl border p-3 text-center transition-colors ${
                    d.highlight ? 'bg-white' : 'bg-white'
                  }`}
                  style={{
                    borderColor: d.highlight ? '#FCD0D6' : '#ECEEF1',
                    boxShadow: d.highlight
                      ? '0 8px 24px -16px rgba(192,0,31,0.30)'
                      : '0 4px 14px -10px rgba(15,31,77,0.15)',
                  }}
                >
                  <span
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                      d.highlight ? 'bg-[#FFF1F3]' : 'bg-[#F4F6FA]'
                    }`}
                  >
                    <d.Icon
                      className="h-6 w-6"
                      style={{ color: d.highlight ? '#C0001F' : '#1E4D8B' }}
                    />
                  </span>
                  <p
                    className={`mt-2.5 text-[12px] font-extrabold leading-tight ${
                      d.highlight ? 'text-[#C0001F]' : 'text-[#1E4D8B]'
                    }`}
                  >
                    {d.t}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[#52607A]">{d.s}</p>
                </li>
              ))}
            </ul>

            {/* Alerte rouge */}
            <div className="mt-4 rounded-2xl border p-4" style={{ background: '#FFF6F8', borderColor: '#FACBD0' }}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#C0001F]" style={{ boxShadow: '0 0 0 2px #C0001F inset' }}>
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold leading-snug text-[#C0001F]">
                    Tous les documents rédigés dans une langue étrangère doivent être accompagnés d&rsquo;une traduction assermentée en français.
                  </p>
                  <p className="mt-1 text-[11.5px] text-[#1A2233]">
                    Les traductions libres ou réalisées par le candidat ne sont pas acceptées.
                  </p>
                </div>
              </div>
            </div>
          </NumberedBox>
        </section>

        {/* Sections 5 + 6 — côte à côte */}
        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* Section 5 — Tentatives (pixel-perfect : QUATRE tentatives + timeline + note + référence) */}
          <NumberedBox num={5} title="Combien de tentatives pour les EVC ?">
            <p className="text-[13px] text-[#1A2233]">
              Vous disposez de <span className="font-extrabold">quatre tentatives</span> pour réussir les Épreuves de Vérification des Connaissances.
            </p>
            <div className="mt-5 flex items-center justify-between">
              {[1, 2, 3, 4].map((n, i) => (
                <div key={n} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-extrabold"
                      style={{
                        background: i < 3
                          ? `rgba(192,0,31,${0.10 + i * 0.06})`
                          : '#C0001F',
                        color: i < 3 ? '#C0001F' : 'white',
                        boxShadow: i === 3 ? '0 8px 18px -10px rgba(192,0,31,0.50)' : 'none',
                      }}
                    >
                      {n}
                    </span>
                    <span className="mt-1.5 text-[11px] font-semibold text-[#1A2233]">Tentative {n}</span>
                  </div>
                  {i < 3 && <span className="text-[#9AA1AE] mb-5">⇢</span>}
                </div>
              ))}
            </div>

            {/* Note éliminatoire */}
            <div className="mt-5 rounded-2xl border p-4" style={{ background: '#FFF6F8', borderColor: '#FACBD0' }}>
              <p className="inline-flex items-center gap-2 text-[13px] font-extrabold text-[#C0001F]">
                <AlertTriangle className="h-4 w-4" />
                Note éliminatoire
              </p>
              <p className="mt-1.5 text-[12px] text-[#1A2233]">
                Une note inférieure ou égale à 6/20 à l&rsquo;une des épreuves écrites est éliminatoire.
              </p>
            </div>

            {/* Référence */}
            <a
              href="#"
              className="mt-3 inline-flex w-full items-center gap-2 rounded-xl border p-3 text-[12px] font-semibold transition-colors hover:bg-[#EDE9FE]/40"
              style={{ background: '#F4F1FE', borderColor: '#E5DCFC', color: '#6D28D9' }}
            >
              <FileText className="h-3.5 w-3.5" />
              Référence&nbsp;: Règlement des EVC 2026
              <span className="ml-auto inline-flex items-center" aria-hidden>↗</span>
            </a>
          </NumberedBox>

          {/* Section 6 — Envoi du dossier (pixel-perfect : CNG + timeline 6 étapes + étape clé + alerte) */}
          <NumberedBox num={6} title="Où envoyer son dossier de candidature ?">
            <p className="text-[12.5px] leading-relaxed text-[#1A2233]">
              La candidature aux EVC s&rsquo;effectue en ligne sur la <strong>plateforme officielle du CNG</strong>.
              Le candidat crée son espace, complète son dossier et téléverse les pièces justificatives demandées pendant la période d&rsquo;inscription.
            </p>
            <ul className="mt-4 space-y-2.5">
              {ENVOI_STEPS.map((s) => (
                <li
                  key={s.t}
                  className={`relative flex items-center gap-3 rounded-xl p-2.5 ${
                    s.key ? 'border bg-[#FFF6F8]' : ''
                  }`}
                  style={s.key ? { borderColor: '#FACBD0' } : undefined}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: s.key ? '#FFE4E8' : '#EDE9FE',
                      color: s.key ? '#C0001F' : '#6D28D9',
                    }}
                  >
                    <s.Icon className="h-4 w-4" />
                  </span>
                  <p className={`flex-1 text-[12px] leading-snug ${s.key ? 'font-extrabold text-[#1A2233]' : 'font-semibold text-[#1A2233]'}`}>
                    {s.t}
                  </p>
                  {s.key && (
                    <span className="rounded-full bg-[#C0001F] px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                      Étape clé
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Alerte violette */}
            <div className="mt-4 rounded-2xl border p-3.5" style={{ background: '#F4F1FE', borderColor: '#E5DCFC' }}>
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#6D28D9]" style={{ boxShadow: '0 0 0 2px #6D28D9 inset' }}>
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <p className="text-[12px] font-semibold leading-snug text-[#1A2233]">
                  La candidature se réalise <strong>directement sur la plateforme du CNG</strong> pendant la période officielle d&rsquo;inscription.
                </p>
              </div>
            </div>
          </NumberedBox>
        </section>

        {/* Bloc Major ECN — pourquoi choisir + plateforme */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:items-center">
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
            <div>
              <p className="mb-3 text-center text-[11.5px] font-bold text-[#1A2233]">Découvrez la plateforme Major ECN</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <PlatformShot label="Tableau de bord"        src="/accueil.png" />
                <PlatformShot label="Entraînement ciblé"     src="/entrainement.png" />
                <PlatformShot label="Cours par item EDN"     src="/cours.png" />
                <PlatformShot label="Annales EVC corrigées"  src="/annales.png" />
              </div>
              <ul className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10.5px] font-semibold text-[#52607A]">
                <li className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-[#C0001F]" /> Accessible 24h/24</li>
                <li className="inline-flex items-center gap-1"><FileText className="h-3 w-3 text-[#C0001F]" /> Suivi détaillé</li>
                <li className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#C0001F]" /> Mises à jour régulières</li>
                <li className="inline-flex items-center gap-1"><Phone2 className="h-3 w-3 text-[#C0001F]" /> Application mobile</li>
              </ul>
            </div>
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

/* Image hero : photo médecin préparant son dossier en ligne, avec un badge
 * vert "Étape essentielle de la PAE" en haut à droite. */
function HeroBookImage() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#ECEEF1] bg-[linear-gradient(135deg,#E5F1FF_0%,#FFE4E8_100%)]"
      style={{ boxShadow: '0 18px 40px -22px rgba(15,31,77,0.30)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/blog/practitioners/practitioner-female-laptop.jpg"
        alt="Médecin PADHUE préparant son dossier d'inscription aux EVC en ligne"
        className="block aspect-[4/3] w-full object-cover object-top select-none"
        decoding="async"
        fetchPriority="high"
      />
      {/* Badge "Etape essentielle de la PAE" — coin haut-droit (maquette). */}
      <div className="absolute right-3 top-3 flex max-w-[60%] items-start gap-1.5 rounded-xl border border-[#16793C]/30 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
        <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16793C]" />
        <p className="text-[9.5px] font-semibold leading-snug text-[#1A2233]">
          <span className="font-extrabold text-[#16793C]">Étape essentielle</span> de la Procédure d&rsquo;Autorisation d&rsquo;Exercice (PAE) en France
        </p>
      </div>
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

// Reuse Phone for spacing — but keep export simple
void Phone;
