import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Award, BookOpenCheck, GraduationCap, MonitorSmartphone, ShieldCheck, Users, UsersRound,
} from 'lucide-react';
import { RECUEILS_ANNALES, TOTAL_SUJETS_ANNALES } from '@/lib/data/annales-evc';
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/seo/json-ld';
import {
  Eyebrow, GRAD_BLUE, GRAD_RED, INK_SOFT, JAKARTA, MANROPE, NAVY, RED, RED_DEEP, RED_GRADIENT, Reveal, SectionTitle,
} from '@/components/marketing/home/home-ui';
import { TemoignagesSection } from '@/components/marketing/home/home-social-sections';
import { AnnalesForm } from './annales-form';
import { AnnalesCatalogue } from './annales-catalogue';
import { AnnalesFaq, type QuestionAnnales } from './annales-faq';

/* ============================================================
   /annales-evc — recueils d'annales offerts, page d'acquisition.
   Même langage que l'accueil (home-ui) : H1 en deux blocs de couleur,
   preuves chiffrées, piliers numérotés, visuels réels de la plateforme,
   témoignages vidéo. Aucun chiffre qui ne vienne des recueils livrés
   (lib/data/annales-evc.ts, généré depuis les PDF) ou de l'accueil.
   ============================================================ */

const PREMIERE = Math.min(...RECUEILS_ANNALES.map((r) => r.premiere));
const DERNIERE = Math.max(...RECUEILS_ANNALES.map((r) => r.derniere));
const NB = RECUEILS_ANNALES.length;
const SUJETS = TOTAL_SUJETS_ANNALES.toLocaleString('fr-FR');
const CORRIGES = RECUEILS_ANNALES.filter((r) => r.corriges);

const ETAPES = [
  { n: '01', titre: 'Choisissez', texte: `votre spécialité parmi les ${NB} recueils.` },
  { n: '02', titre: 'Recevez', texte: 'le PDF par e-mail, dans la minute.' },
  { n: '03', titre: 'Entraînez-vous', texte: 'sur les sujets réellement posés au concours.' },
];

/* Bandeau des preuves : le même que l'accueil. */
const PREUVES = [
  { Icon: Award, big: '15 ans d’expertise', small: 'au service de votre réussite' },
  { Icon: Users, big: '+ de 9 000 médecins accompagnés', small: 'depuis 2011' },
  { Icon: GraduationCap, big: 'Les deux voies préparées', small: 'Voie interne (QCM) et voie externe (QROC)' },
  { Icon: ShieldCheck, big: 'Méthode éprouvée', small: 'Mise à jour en continu selon les épreuves officielles' },
  { Icon: UsersRound, big: 'PH, CCA et spécialistes engagés à vos côtés', small: 'jusqu’aux EVC' },
];

const CONTENU = [
  {
    n: '01', titre: 'Classés par session et par épreuve',
    texte: `De ${DERNIERE} à ${PREMIERE} : épreuve fondamentale, QCM de ${DERNIERE} compris, puis épreuve pratique. Sommaire cliquable et signets dans le PDF.`,
  },
  {
    n: '02', titre: 'Les énoncés tels qu’ils ont été posés',
    texte: 'Aucun mot réécrit, aucune correction ajoutée : le sujet officiel, remis en page pour se lire confortablement à l’écran.',
  },
  {
    n: '03', titre: 'Les images à leur place',
    texte: 'Radiographies, scanners, ECG, photographies et tableaux, en haute définition, dans la question qui les appelle.',
  },
  {
    n: '04', titre: 'Les sujets scannés reproduits page à page',
    texte: 'Les sessions 2010 et 2021, diffusées en image, sont restituées à l’identique, sans les mentions de navigation.',
  },
];

const OFFRE = [
  { titre: 'Annales corrigées et commentées', texte: 'La réponse attendue et la méthode pour la construire, question par question.' },
  { titre: 'Cours structurés pour l’EVC', texte: 'Les notions qui tombent, priorisées par spécialité et mises à jour selon les recommandations.' },
  { titre: 'Au format exact de votre voie', texte: 'Voie interne en QCM, voie externe en QROC : vous vous entraînez comme le jour de l’épreuve.' },
  { titre: 'Des enseignants qui exercent en France', texte: 'PH, CCA et spécialistes, en cours en direct et pour répondre à vos questions.' },
];

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.major-ecn.fr').replace(/\/$/, '');

/** Les recueils, en liste structurée : chaque spécialité a sa page. */
const LISTE_RECUEILS = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Annales EVC par spécialité',
  numberOfItems: NB,
  itemListElement: RECUEILS_ANNALES.map((r, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `Annales EVC ${r.nom}`,
    url: `${SITE}/annales-evc/${r.slug}`,
  })),
};

const FAQ: QuestionAnnales[] = [
  {
    q: 'Où trouver les annales de l’EVC ?',
    r: `Sur cette page : les sujets officiels de ${PREMIERE} à ${DERNIERE} sont réunis par spécialité, ${NB} recueils au total. Choisissez la vôtre, le PDF vous est envoyé par e-mail.`,
  },
  {
    q: 'Qu’appelle-t-on les EVC ?',
    r: 'Les épreuves de vérification des connaissances (EVC) sont le concours de la procédure d’autorisation d’exercice (PAE), organisé par le CNG pour les praticiens diplômés hors Union européenne. Elles comportent une épreuve fondamentale et une épreuve pratique par spécialité.',
  },
  {
    q: 'Le recueil est-il vraiment gratuit ?',
    r: 'Oui. Le recueil de votre spécialité vous est envoyé par e-mail sans frais et sans inscription à une formation. Le lien de téléchargement reste valable deux ans.',
  },
  {
    q: 'D’où viennent les sujets ?',
    r: `Ce sont les sujets officiels des épreuves de vérification des connaissances, publiés par le Centre national de gestion (CNG), de ${PREMIERE} à ${DERNIERE}. Leur texte n’est pas modifié.`,
  },
  {
    q: 'Les corrigés sont-ils inclus ?',
    r: `Non, le recueil contient les sujets seuls. Les annales corrigées et commentées sont sur la plateforme Major ECN, aujourd’hui pour ${CORRIGES.length} spécialités.`,
  },
  {
    q: 'Voie interne ou voie externe : quel recueil choisir ?',
    r: 'Il y a un recueil par spécialité, valable pour les deux voies : il réunit l’épreuve fondamentale, QCM compris, et l’épreuve pratique de chaque session.',
  },
  {
    q: 'Certaines sessions manquent-elles ?',
    r: 'Il n’y a pas eu de session en 2022. Quelques sujets sont absents ou vides dans les archives officielles, par exemple l’épreuve pratique 2024 de cardiologie : ils ne peuvent donc pas figurer dans les recueils.',
  },
  {
    q: 'Je n’ai pas reçu l’e-mail.',
    r: 'Regardez dans les courriers indésirables. Le bouton de téléchargement s’affiche aussi sur cette page dès l’envoi. Si besoin, écrivez-nous depuis la page contact.',
  },
];

export function AnnalesEvcPage() {
  return (
    <div style={{ fontFamily: JAKARTA }}>
      <JsonLd
        data={[
          faqSchema(FAQ.map((f) => ({ q: f.q, a: f.r }))),
          LISTE_RECUEILS,
          breadcrumbSchema([{ name: 'Accueil', path: '/' }, { name: 'Annales EVC', path: '/annales-evc' }]),
        ]}
      />

      {/* ============ HÉROS ============ */}
      <section className="relative isolate overflow-hidden bg-white pb-6 pt-8 sm:pt-10 lg:pt-14">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/6 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#14254E]/5 blur-3xl" />

        {/* Téléphone : accroche, formulaire, puis le détail ; ordinateur : texte à gauche, formulaire à droite. */}
        <div className="mx-auto grid w-full max-w-[88rem] grid-cols-1 items-start gap-x-14 gap-y-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-black tracking-tight sm:text-[14px]" style={{ color: NAVY }}>
              <span><span style={{ color: RED }}>Offert</span> par Major ECN</span>
              <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: NAVY }} />
              <span><span style={{ color: RED }}>15 ans</span> de préparation aux EVC</span>
            </p>

            <h1
              className="mt-5 text-[2.15rem] font-black leading-[1.04] tracking-tight sm:text-[2.9rem] lg:text-[3.05rem] xl:text-[3.4rem]"
              style={{ letterSpacing: '-0.03em' }}
            >
              <span className="block" style={{ color: NAVY }}>Les annales officielles de&nbsp;l’EVC.</span>
              <span className="mt-1 block" style={{ color: RED_DEEP }}>Toute votre spécialité, en&nbsp;un&nbsp;PDF.</span>
            </h1>

            <span aria-hidden className="mt-6 block h-1 w-16 rounded-full" style={{ background: RED }} />

            <p className="mt-5 text-[1.02rem] font-black leading-snug tracking-tight sm:text-[1.15rem]" style={{ color: NAVY }}>
              <span style={{ color: RED }}>{SUJETS}</span> sujets officiels · <span style={{ color: RED }}>{NB}</span> spécialités · sessions{' '}
              <span style={{ color: RED }}>{PREMIERE}</span> à <span style={{ color: RED }}>{DERNIERE}</span>
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24">
            <AnnalesForm />
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <div className="rounded-2xl px-5 py-4 sm:px-6" style={{ background: '#FDF1F3' }}>
              <p className="text-[14px] font-black leading-snug tracking-tight sm:text-[15px]" style={{ color: RED_DEEP }}>
                Réunis et mis en page par l’équipe pédagogique Major ECN.
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed sm:text-[14px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                Chaque sujet publié par le CNG, épreuve fondamentale et épreuve pratique, avec ses clichés, ECG et
                tableaux. Les corrigés, eux, sont sur la plateforme.
              </p>
            </div>

            <ol className="mt-7 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-3 sm:gap-x-0 sm:divide-x sm:divide-[#EDECE8]">
              {ETAPES.map((e) => (
                <li key={e.n} className="sm:px-4 first:sm:pl-0 last:sm:pr-0">
                  <span className="block text-[15px] font-black tabular-nums" style={{ color: RED }}>{e.n}</span>
                  <span className="mt-1.5 block text-[14px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{e.titre}</span>
                  <span className="mt-1.5 block text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{e.texte}</span>
                </li>
              ))}
            </ol>

            {/* Le livre : trois pages réelles du recueil de pédiatrie */}
            <div className="relative mt-10 hidden h-[330px] lg:block" aria-hidden>
              <div className="absolute left-0 top-6 w-[210px] -rotate-6 overflow-hidden rounded-xl shadow-[0_30px_60px_-25px_rgba(15,27,61,0.55)] ring-1 ring-black/5">
                <Image src="/annales-evc/apercu-sommaire.webp" alt="" width={840} height={1188} sizes="210px" className="h-auto w-full" />
              </div>
              <div className="absolute left-[150px] top-0 z-10 w-[230px] overflow-hidden rounded-xl shadow-[0_40px_80px_-25px_rgba(15,27,61,0.6)] ring-1 ring-black/5">
                <Image src="/annales-evc/couvertures/pediatrie.webp" alt="" width={420} height={594} sizes="230px" className="h-auto w-full" />
              </div>
              <div className="absolute left-[320px] top-8 w-[210px] rotate-6 overflow-hidden rounded-xl shadow-[0_30px_60px_-25px_rgba(15,27,61,0.55)] ring-1 ring-black/5">
                <Image src="/annales-evc/apercu-image.webp" alt="" width={840} height={1188} sizes="210px" className="h-auto w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Bandeau des preuves (identique à l'accueil) */}
        <div className="mx-auto mt-12 w-full max-w-[88rem] px-4 sm:mt-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-6 rounded-3xl px-6 py-7 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-5 lg:divide-x lg:divide-[#EDECE8]" style={{ background: '#FBFAFB' }}>
            {PREUVES.map((t) => (
              <div key={t.big} className="flex items-center gap-3.5 lg:px-5 first:lg:pl-0 last:lg:pr-0">
                <t.Icon className="h-9 w-9 shrink-0" strokeWidth={1.6} style={{ color: RED_DEEP }} />
                <div>
                  <p className="text-[13.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{t.big}</p>
                  <p className="mt-1 text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{t.small}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LE RECUEIL ============ */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFAFB 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Eyebrow icon={<BookOpenCheck className="h-3.5 w-3.5" />}>À l’intérieur du recueil</Eyebrow>
            <div className="mt-5">
              <SectionTitle line1="Les sujets du concours," line2="mis en page pour travailler." rule />
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Reveal>
              <div className="relative mx-auto h-[420px] max-w-[520px] sm:h-[520px]">
                <div className="absolute left-0 top-10 w-[46%] -rotate-[5deg] overflow-hidden rounded-xl bg-white shadow-[0_30px_70px_-30px_rgba(15,27,61,0.55)] ring-1 ring-black/5">
                  <Image src="/annales-evc/apercu-sommaire.webp" alt="Sommaire du recueil de pédiatrie, classé par session" width={840} height={1188} sizes="(max-width:1024px) 46vw, 240px" className="h-auto w-full" />
                </div>
                <div className="absolute right-0 top-14 w-[46%] rotate-[5deg] overflow-hidden rounded-xl bg-white shadow-[0_30px_70px_-30px_rgba(15,27,61,0.55)] ring-1 ring-black/5">
                  <Image src="/annales-evc/apercu-image.webp" alt="Page d’épreuve pratique avec une radiographie" width={840} height={1188} sizes="(max-width:1024px) 46vw, 240px" className="h-auto w-full" />
                </div>
                <div className="absolute left-1/2 top-0 z-10 w-[56%] -translate-x-1/2 overflow-hidden rounded-xl bg-white shadow-[0_50px_100px_-30px_rgba(15,27,61,0.65)] ring-1 ring-black/10">
                  <Image src="/annales-evc/apercu-sujet.webp" alt="Page de l’épreuve fondamentale QCM 2025 de pédiatrie" width={840} height={1188} sizes="(max-width:1024px) 56vw, 290px" className="h-auto w-full" />
                </div>
              </div>
            </Reveal>

            <div className="space-y-4">
              {CONTENU.map((c, i) => (
                <Reveal key={c.n} delay={i * 0.07}>
                  <div className="flex gap-4 rounded-3xl bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,27,61,0.3)] sm:p-6" style={{ border: '1px solid rgba(192,17,46,0.10)' }}>
                    <span className="text-[15px] font-black tabular-nums" style={{ color: RED }}>{c.n}</span>
                    <div>
                      <p className="text-[15.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{c.titre}</p>
                      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{c.texte}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ LES RECUEILS ============ */}
      <section id="specialites" className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-52 top-20 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/5 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Eyebrow>{NB} recueils</Eyebrow>
            <div className="mt-5">
              <SectionTitle line1="Un recueil" line2="pour chaque spécialité." gradient={GRAD_BLUE} />
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
              De l’allergologie à l’urologie, chaque recueil réunit toutes les sessions de la spécialité.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="mt-10">
            <AnnalesCatalogue />
          </Reveal>
        </div>
      </section>

      {/* ============ MAJOR ECN — LA PRÉPARATION ============ */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(180deg, #FBFAFB 0%, #FFFFFF 70%)' }}>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-40 -z-10 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-[#14254E]/4 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-4xl text-center">
            <Eyebrow icon={<MonitorSmartphone className="h-3.5 w-3.5" />}>Après les annales</Eyebrow>
            <div className="mt-5">
              <SectionTitle line1="Les sujets vous montrent l’épreuve." line2="Major ECN vous prépare à la réussir." gradient={GRAD_RED} rule />
            </div>
            <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
              Depuis 2011, plus de 9&nbsp;000 médecins ont préparé les EVC avec Major ECN : une plateforme complète et des
              enseignants praticiens hospitaliers, spécialistes et CCA exerçant en France.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl shadow-[0_60px_140px_-40px_rgba(15,27,61,0.55)] ring-1 ring-black/10">
                <Image
                  src="/homepage/plateforme-complete.png"
                  alt="Plateforme Major ECN sur ordinateur et mobile — tableau de bord, QROC du jour et entraînement QCM"
                  width={1536}
                  height={1024}
                  className="w-full"
                  sizes="(max-width:1024px) 100vw, 55vw"
                />
              </div>
            </Reveal>

            <div>
              <ol className="space-y-5">
                {OFFRE.map((o, i) => (
                  <Reveal key={o.titre} delay={i * 0.07}>
                    <li className="flex gap-4">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[14px] font-black tabular-nums text-white" style={{ background: RED_GRADIENT }}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[15.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{o.titre}</p>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{o.texte}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>

              <Reveal delay={0.2}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/espace-decouverte"
                    className="group inline-flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-[14.5px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02]"
                    style={{ background: RED_GRADIENT }}
                  >
                    Accéder à l’espace découverte gratuit
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/tarifs"
                    className="group inline-flex items-center justify-center gap-3 rounded-xl border-2 bg-white px-6 py-4 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FBEEEF]"
                    style={{ borderColor: '#E7C9CD', color: RED_DEEP }}
                  >
                    Voir les formules
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Spécialités dont les annales sont déjà corrigées */}
          <Reveal delay={0.1} className="mt-12">
            <div className="rounded-3xl border px-6 py-6 sm:px-8" style={{ background: '#FDF6F7', borderColor: 'rgba(192,17,46,0.12)' }}>
              <p className="text-[15px] font-black tracking-tight" style={{ color: RED_DEEP }}>
                Annales déjà corrigées et commentées sur la plateforme
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {CORRIGES.map((r) => (
                  <li key={r.slug} className="rounded-full border bg-white px-3.5 py-1.5 text-[12.5px] font-bold" style={{ borderColor: 'rgba(192,17,46,0.18)', color: NAVY, fontFamily: MANROPE }}>
                    {r.nom}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ TÉMOIGNAGES (accueil) ============ */}
      <TemoignagesSection />

      {/* ============ QUESTIONS ============ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-8">
          <Reveal>
            <SectionTitle line1="Vos questions" line2="sur les recueils" />
            <p className="mt-5 max-w-md text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
              Une autre question sur les EVC ou sur la préparation ? Toutes les réponses sont dans la{' '}
              <Link href="/faq" className="font-bold underline underline-offset-2" style={{ color: RED }}>FAQ Major ECN</Link>.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <AnnalesFaq questions={FAQ} />
          </Reveal>
        </div>
      </section>

      {/* ============ DERNIER APPEL ============ */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:py-12"
            style={{ background: 'radial-gradient(90% 130% at 100% 0%, rgba(192,17,46,0.45) 0%, rgba(192,17,46,0) 55%), linear-gradient(150deg, #1B2D5E 0%, #14254E 55%, #0C1733 100%)' }}
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFC107]" style={{ fontFamily: MANROPE }}>Votre recueil vous attend</p>
              <h2 className="mt-3 text-[1.7rem] font-black leading-[1.1] tracking-tight sm:text-[2.3rem]" style={{ letterSpacing: '-0.02em' }}>
                Commencez par les sujets.
                <br />
                <span className="text-white/80">Nous nous occupons du reste.</span>
              </h2>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <a
                href="#formulaire-annales"
                className="group inline-flex items-center justify-center gap-3 rounded-xl px-7 py-4 text-[15px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.75)] transition-transform hover:scale-[1.02]"
                style={{ background: RED_GRADIENT }}
              >
                Recevoir les annales de ma spécialité
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </a>
              <Link href="/methode" className="text-[14px] font-bold text-white/80 underline-offset-4 hover:text-white hover:underline">
                Découvrir la méthode Major ECN
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
