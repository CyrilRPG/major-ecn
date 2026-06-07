import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronDown,
  ClipboardCheck, Clock, FileBadge, FileText, Folder, GraduationCap, IdCard,
  ListChecks, MapPin, Phone, Phone as Phone2, Quote, ScrollText, Sparkles,
  Stethoscope, Users,
} from 'lucide-react';
import { ArticleHeader, ARTICLE_FONT } from '../article-shell';
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

const COMPARE_TABLE = [
  { critere: 'Nature',     a: 'Concours',                    b: 'Examen' },
  { critere: 'Sélection',  a: 'Nombre de postes limité',     b: 'Note minimale de 10/20' },
  { critere: 'Classement', a: 'Classement des candidats',    b: 'Obtention de la note requise' },
  { critere: 'Objectif',   a: 'Être classé parmi les admis', b: 'Obtenir au moins 10/20' },
];

const LISTE_B = [
  'Réfugiés politiques',
  'Bénéficiaires de la protection subsidiaire',
  'Apatrides',
  'Français ayant regagné le territoire national à la demande des autorités françaises',
  'Bénéficiaires de l\'asile territorial',
];

const DOCS = [
  { Icon: GraduationCap, t: 'Diplôme ou titre permettant d\'exercer' },
  { Icon: IdCard,        t: 'Pièce d\'identité en cours de validité' },
  { Icon: FileText,      t: 'Traductions certifiées (le cas échéant)' },
  { Icon: ClipboardCheck, t: 'Formulaire de candidature à l\'EVC' },
  { Icon: FileBadge,     t: 'Justificatifs demandés par l\'ARS' },
];

const ENVOI_STEPS = [
  { Icon: BookOpen,       t: 'Préparation EVC' },
  { Icon: FileText,       t: 'Inscription' },
  { Icon: ClipboardCheck, t: 'Épreuves écrites' },
  { Icon: Sparkles,       t: 'Résultats' },
  { Icon: Users,          t: 'PCC' },
  { Icon: CheckCircle2,   t: 'Autorisation d\'exercice' },
];

const TESTIMONIALS = [
  { initials: 'YK', name: 'Dr. Y. K.', spec: 'Admis EVC Médecine Générale Session 2024', text: 'Une préparation complète, des QCM de qualité et un suivi irréprochable. J\'ai obtenu les EVC dès ma 1re tentative !' },
  { initials: 'SR', name: 'Dr. S. R.', spec: 'Admise EVC Pédiatrie Session 2024',         text: 'Les cas cliniques et les fiches m\'ont permis d\'être prête le jour J. Merci à toute l\'équipe Major ECN !' },
  { initials: 'MT', name: 'Dr. M. T.', spec: 'Admis EVC Cardiologie Session 2024',        text: 'La plateforme est intuitive, les corrections détaillées et très pédagogiques. Je recommande à 100 %.' },
];

const FAQS = [
  ['Qui peut passer les EVC ?', 'Tout titulaire d\'un diplôme de médecine, chirurgie dentaire, pharmacie ou sage-femme obtenu dans un État non membre de l\'UE/EEE permettant d\'exercer dans ce pays.'],
  ['Quelle est la différence entre la liste A et la liste B ?', 'La liste A est un concours avec un nombre de postes limité ; la liste B est un examen ouvert à certains publics protégés (réfugiés, apatrides, etc.) où il suffit d\'obtenir 10/20.'],
  ['Combien de fois peut-on passer les EVC ?', 'Trois tentatives au total, comptabilisées depuis la réforme. L\'absence injustifiée compte comme une tentative.'],
  ['Existe-t-il une note éliminatoire ?', 'Oui. Une note inférieure ou égale à 6/20 à l\'une des épreuves écrites est éliminatoire.'],
  ['Quels documents fournir pour son dossier ?', 'Diplôme ou titre permettant d\'exercer, pièce d\'identité, traductions certifiées si nécessaire, formulaire de candidature et tout justificatif demandé par l\'ARS.'],
  ['Où envoyer son dossier EVC ?', 'À l\'ARS du lieu de votre résidence en France, dans les délais indiqués dans l\'arrêté d\'ouverture des inscriptions.'],
  ['Comment se déroulent les épreuves ?', 'Deux épreuves écrites de 2 heures chacune, anonymes, notées sur 20 et affectées du coefficient 1.'],
  ['Comment bien préparer les EVC ?', 'Une préparation structurée combinant cours synthétiques, QCM corrigés, cas cliniques progressifs et concours blancs maximise vos chances de réussite.'],
];

export function ArticleCommentSinscrire({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader
          article={article}
          subtitle="Conditions d'inscription, liste A et liste B, documents à fournir, nombre de tentatives et procédure auprès de l'ARS : le guide complet Major ECN pour réussir votre candidature aux EVC."
          rightArea={
            <div className="relative">
              <HeroBookImage />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-[10px] font-extrabold text-[#16793C] shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                Étape essentielle de la PAE
              </span>
            </div>
          }
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

          {/* Section 2 — Les Épreuves */}
          <NumberedBox num={2} title="Les Épreuves de Vérification des Connaissances (EVC)">
            <p className="text-[12.5px] text-[#1A2233]">
              Les EVC consistent en deux épreuves écrites, chacune d&rsquo;une durée de 2 heures,
              notées sur 20 et affectées d&rsquo;un coefficient de 1.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[#ECEEF1] bg-[#FAFBFE] p-2.5 text-center">
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-[#EDE9FE] text-[#6D28D9]">
                  <Brain className="h-4 w-4" />
                </span>
                <p className="mt-1 text-[10.5px] font-bold leading-tight text-[#1A2233]">1re épreuve<br />Connaissances fondamentales</p>
              </div>
              <div className="rounded-lg border border-[#ECEEF1] bg-[#FAFBFE] p-2.5 text-center">
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-[#FFE4E8] text-[#C0001F]">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <p className="mt-1 text-[10.5px] font-bold leading-tight text-[#1A2233]">2e épreuve<br />Connaissances pratiques</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-[#ECEEF1] bg-white px-3 py-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3 text-[#C0001F]" /> Durée : 2 heures chacune</span>
              <span className="inline-flex items-center gap-1.5"><ListChecks className="h-3 w-3 text-[#C0001F]" /> Coefficient : 1</span>
            </div>
          </NumberedBox>

          {/* Section 3 — Liste A vs B */}
          <NumberedBox num={3} title="Liste A ou Liste B : quelle différence ?">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="border-b border-[#ECEEF1] py-1.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-[#9AA1AE]">Critères</th>
                    <th className="border-b border-[#ECEEF1] py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-white" style={{ background: '#C0001F' }}>Liste A (Concours)</th>
                    <th className="border-b border-[#ECEEF1] py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-white" style={{ background: '#1E4D8B' }}>Liste B (Examen)</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_TABLE.map((r) => (
                    <tr key={r.critere}>
                      <td className="border-b border-[#F2F3F5] py-2 pr-2 font-bold text-[#1A2233]">{r.critere}</td>
                      <td className="border-b border-[#F2F3F5] py-2 text-center text-[#1A2233]">{r.a}</td>
                      <td className="border-b border-[#F2F3F5] py-2 text-center text-[#1A2233]">{r.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-lg border border-[#FCD0D6] bg-[#FFF1F3] p-2.5">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#C0001F]">Qui peut s&rsquo;inscrire en liste B ?</p>
              <ul className="mt-1.5 grid grid-cols-1 gap-x-3 gap-y-1 text-[11px] text-[#1A2233] sm:grid-cols-2">
                {LISTE_B.map((b) => (
                  <li key={b} className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#C0001F]" /> {b}</li>
                ))}
              </ul>
            </div>
          </NumberedBox>
        </section>

        {/* Sections 4 + 5 + 6 */}
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Section 4 — Documents */}
          <NumberedBox num={4} title="Documents nécessaires pour l'inscription aux EVC">
            <p className="text-[12.5px] text-[#52607A]">Votre dossier de candidature doit contenir les pièces suivantes :</p>
            <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5 lg:grid-cols-5">
              {DOCS.map((d) => (
                <li key={d.t} className="rounded-lg border border-[#ECEEF1] bg-[#FAFBFE] p-2 text-center">
                  <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-[#FFE4E8] text-[#C0001F]">
                    <d.Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="mt-1.5 text-[9.5px] font-bold leading-tight text-[#1A2233]">{d.t}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-[#FEF3C7] px-2.5 py-1.5 text-[11px] text-[#92400E]">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>Toutes les pièces justificatives doivent être rédigées en français ou traduites par un traducteur agréé.</span>
            </p>
          </NumberedBox>

          {/* Section 5 — Tentatives */}
          <NumberedBox num={5} title="Combien de tentatives pour les EVC ?">
            <p className="text-[12.5px] text-[#1A2233]">
              Vous disposez de <strong>trois tentatives</strong> pour réussir
              les Épreuves de Vérification des Connaissances.
            </p>
            <div className="mt-4 flex items-center justify-between">
              {[1, 2, 3].map((n, i) => (
                <div key={n} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE4E8] text-[13px] font-extrabold text-[#C0001F]">
                      {n}
                    </span>
                    <span className="mt-1 text-[10px] font-semibold text-[#1A2233]">Tentative {n}</span>
                  </div>
                  {i < 2 && <span className="text-[#9AA1AE]">→</span>}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-[#FCD0D6] bg-[#FFF1F3] p-3">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#C0001F]">
                <AlertTriangle className="h-3 w-3" /> Note éliminatoire
              </p>
              <p className="mt-1 text-[11.5px] text-[#1A2233]">
                Une note inférieure ou égale à 6/20 à l&rsquo;une des épreuves écrites est éliminatoire.
              </p>
            </div>
          </NumberedBox>

          {/* Section 6 — Envoi du dossier */}
          <NumberedBox num={6} title="Où envoyer son dossier de candidature ?">
            <p className="text-[12.5px] text-[#1A2233]">
              Le dossier de demande de candidature doit être envoyé à l&rsquo;ARS
              de votre lieu de résidence, indiquée dans l&rsquo;arrêté d&rsquo;ouverture.
            </p>
            <ul className="mt-3 space-y-2">
              {ENVOI_STEPS.map((s, i) => (
                <li key={s.t} className="flex items-center gap-2 text-[11.5px] text-[#1A2233]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#EDE9FE] text-[#6D28D9]">
                    <s.Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-semibold">{s.t}</span>
                  {i === 1 && <span className="ml-auto text-[10px] text-[#9AA1AE]">étape clé</span>}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#FAFBFE] p-2.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1E4D8B]" />
              <p className="text-[11px] text-[#1A2233]">
                Vous résidez en France ? Adressez votre dossier à l&rsquo;ARS de votre lieu de résidence.
              </p>
            </div>
          </NumberedBox>
        </section>

        {/* Bloc Major ECN — pourquoi choisir + plateforme */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#C0001F]">
                <Sparkles className="h-3 w-3" /> Major ECN
              </p>
              <h3 className="mt-2 text-[18px] font-extrabold leading-snug text-[#1A2233]">
                Pourquoi plus de 9 000 médecins ont choisi Major ECN ?
              </h3>
              <p className="mt-2 text-[12.5px] text-[#52607A]">
                Depuis plus de 15 ans, Major ECN accompagne les médecins PADHUE dans leur préparation aux EVC,
                première étape de la Procédure d&rsquo;Autorisation d&rsquo;Exercice (PAE).
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[11.5px] text-[#1A2233]">
                {['Plus de 15 ans d\'expérience', 'Plus de 9 000 médecins accompagnés', '45 spécialités médicales', 'QCM corrigés et commentés', 'Cas cliniques progressifs', 'Flashcards', 'Révisions transversales', 'Épreuves blanches', 'Accompagnement pédagogique personnalisé'].map((b) => (
                  <li key={b} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 text-[#C0001F]" /> {b}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-center text-[11.5px] font-bold text-[#1A2233]">Découvrez la plateforme Major ECN</p>
              <div className="grid grid-cols-3 gap-2">
                <PlatformShot label="Tableau de bord complet" />
                <PlatformShot label="QCM corrigés et commentés" />
                <PlatformShot label="Corrections détaillées" />
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
            <div className="flex items-center gap-2 text-[12px]">
              <span className="font-extrabold text-[#16A34A]">Excellent</span>
              <span className="text-[#F59E0B]">★★★★★</span>
              <span className="font-bold text-[#1A2233]">4,8 / 5</span>
              <span className="text-[10.5px] text-[#9AA1AE]">Basé sur plus de 1 200 avis sur Trustpilot</span>
            </div>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <article key={t.initials} className="rounded-2xl border border-[#ECEEF1] bg-white p-4 shadow-sm">
                <Quote className="h-5 w-5 text-[#F59E0B]" />
                <p className="mt-2 text-[12.5px] italic leading-relaxed text-[#1A2233]">« {t.text} »</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE4E8] text-[10px] font-extrabold text-[#C0001F]">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-[#1A2233]">{t.name}</p>
                    <p className="text-[10px] text-[#9AA1AE]">{t.spec}</p>
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
        <section className="mt-8 overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#0F1F4D_0%,#5C1827_60%,#C0112E_100%)] p-5 text-white sm:p-6">
          <div className="grid items-center gap-3 lg:grid-cols-[auto_1fr_auto]">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <ScrollText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[14px] font-extrabold leading-tight">Réussir les EVC avec Major ECN</p>
              <p className="mt-1 text-[12px] text-white/80">
                Depuis plus de 15 ans, Major ECN accompagne les médecins PADHUE dans leur préparation
                aux Épreuves de Vérification des Connaissances (EVC) grâce à une plateforme complète
                comprenant QCM corrigés, cas cliniques, flashcards, épreuves blanches et méthodologie spécifique EVC.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[11px] text-white/85">
              <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#F5D597]" /> Méthodologie spécifique EVC</span>
              <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3 text-[#F5D597]" /> Plateforme n°1 EVC PAE</span>
              <span className="inline-flex items-center gap-1"><Users className="h-3 w-3 text-[#F5D597]" /> Équipe pédagogique experte</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-[#F5D597]" /> Résultats prouvés</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ─────────────── helpers ─────────────── */

function HeroBookImage() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#ECEEF1] bg-[linear-gradient(135deg,#E5F1FF_0%,#FFE4E8_100%)] lg:aspect-auto lg:h-56">
      <div className="absolute inset-0 flex items-center justify-center">
        <BookOpen className="h-16 w-16 text-[#1E4D8B]/40" />
      </div>
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
