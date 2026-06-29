'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle, ArrowRight, BookOpen, ChevronRight, Compass, Heart,
  HelpCircle, Lightbulb, MessageCircle, RefreshCcw, Stethoscope, Target,
  TrendingUp, X,
} from 'lucide-react';
import { DiscoveryWelcomePopup } from '@/components/espace-decouverte/discovery-welcome-popup';

const STORAGE_KEY = 'major-ecn:conseils-dismissed';
// Charte cohérente avec le menu (rouge-orange officiel Major ECN)
const PURPLE = '#E4002B';      // ⇐ alias historique conservé : nom legacy mais valeur rouge
const PURPLE_SOFT = '#FFE4E8'; // fond accent doux pour items actifs
const RED = '#E4002B';

type Section = 'demarrer' | 'parcours' | 'methode' | 'faq';

const SECTIONS: { id: Section; label: string; Icon: typeof Lightbulb }[] = [
  { id: 'demarrer', label: 'Comment bien démarrer ?', Icon: Lightbulb },
  { id: 'parcours', label: 'Parcours recommandé',     Icon: Compass },
  { id: 'methode',  label: 'Notre méthode',           Icon: Target },
  { id: 'faq',      label: 'Questions fréquentes',    Icon: HelpCircle },
];

/** Spécialités du popup : chacune avec son image adaptée (uploadée par le client). */
const STARTER_SPECIALTIES = [
  { image: '/flashcards-decor/cardio.png',    label: 'Cardiologie',    color: '#840000', bg: '#FBCCCC' },
  { image: '/flashcards-decor/pneumo.png',    label: 'Pneumologie',    color: '#214980', bg: '#D8E6F9' },
  { image: '/flashcards-decor/geriatrie.png', label: 'Gériatrie',      color: '#2D6B51', bg: '#DAF0E7' },
  { image: '/flashcards-decor/neuro.png',     label: 'Neurologie',     color: '#583474', bg: '#EADEF4' },
  { image: '/flashcards-decor/endocrino.png', label: 'Endocrinologie', color: '#845D40', bg: '#FBEDE3' },
  { image: '/flashcards-decor/nephro.png',    label: 'Néphrologie',    color: '#00572F', bg: '#C2E7D6' },
];

export function ConseilsCenter({ isDecouverte = false }: { isDecouverte?: boolean }) {
  // 'popup' = grand popup d'accueil ; 'panel' = panneau latéral compact ;
  // 'closed' = bouton seul dans le header.
  const [mode, setMode] = useState<'popup' | 'panel' | 'closed'>('closed');
  const [section, setSection] = useState<Section>('demarrer');
  const [neverShow, setNeverShow] = useState(false);

  // Custom event : permet à la TopBar (ou n'importe quel autre composant)
  // d'ouvrir le panneau Conseils sans avoir besoin d'un context global.
  useEffect(() => {
    const onOpen = () => { setSection('demarrer'); setMode('panel'); };
    window.addEventListener('conseils:open', onOpen);
    return () => window.removeEventListener('conseils:open', onOpen);
  }, []);

  // À la première ouverture, montre le grand popup (sauf si déjà fermé une fois).
  // Les utilisateurs Découverte ont leur propre popup d'accueil dédié
  // (DiscoveryWelcomePopup) → on n'affiche PAS le grand popup Conseils
  // standard pour cette population.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDecouverte) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setMode('popup');
  }, [isDecouverte]);

  const closePopup = () => {
    if (neverShow) localStorage.setItem(STORAGE_KEY, '1');
    setMode('closed');
    window.dispatchEvent(new Event('mecn:welcome-closed'));
  };

  return (
    <>
      {/* Popup d'accueil spécifique Découverte (sa propre dismissal en
          localStorage : `major-ecn:welcome-decouverte-dismissed`). */}
      {isDecouverte && <DiscoveryWelcomePopup />}

      {mode === 'popup' && !isDecouverte && (
        <PopupOverlay
          onClose={closePopup}
          neverShow={neverShow}
          onNeverShowChange={setNeverShow}
        />
      )}

      {mode === 'panel' && (
        <PanelOverlay
          section={section}
          onSectionChange={setSection}
          onClose={() => setMode('closed')}
        />
      )}
    </>
  );
}

/* ============================================================
   GRAND POPUP — affiché à la première ouverture
   ============================================================ */
function PopupOverlay({
  onClose, neverShow, onNeverShowChange,
}: {
  onClose: () => void;
  neverShow: boolean;
  onNeverShowChange: (v: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3 sm:p-6" aria-modal="true" role="dialog">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-(--color-ink-muted) hover:bg-(--color-sand-100)"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header : logo Major ECN officiel + titre */}
        <div className="flex flex-col items-start gap-4 pr-8 sm:flex-row sm:items-center">
          <div className="hidden h-20 w-28 shrink-0 items-center justify-center rounded-2xl bg-[#FCEAEC] p-2 sm:flex">
            <Image src="/major-ecn-logo.png" alt="Major ECN" width={112} height={80} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black tracking-tight text-(--color-ink) sm:text-3xl">
              Bienvenue sur Major ECN <span aria-hidden>👋</span>
            </h2>
            <p className="mt-1 text-base font-bold text-(--color-ink)">
              Comment bien démarrer votre préparation ?
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-(--color-ink-soft)">
              Major ECN est la plateforme de référence pour vous préparer efficacement
              aux Épreuves de Vérification des Connaissances (EVC).
            </p>
          </div>
        </div>

        {/* Par où commencer ? */}
        <section className="mt-6 rounded-2xl border border-(--color-border) bg-[#FAFBFE] p-5">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-(--color-ink)">
            <Compass className="h-4 w-4" style={{ color: RED }} />
            Par où commencer ?
          </h3>
          <p className="mt-1.5 text-[12.5px] text-(--color-ink-soft)">
            Si vous ne savez pas par où commencer, nous vous recommandons de débuter par
            les <strong className="text-(--color-ink)">spécialités les plus transversales</strong> :
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {STARTER_SPECIALTIES.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl p-1.5"
                  style={{ background: s.bg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </span>
                <p className="mt-1.5 text-[10px] font-bold tabular-nums" style={{ color: s.color }}>{i + 1}</p>
                <p className="text-[11px] font-bold leading-tight" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-(--color-ink-soft)">
            Ces spécialités vous permettront d&rsquo;acquérir des bases solides et utiles dans
            de nombreuses situations cliniques.
          </p>
        </section>

        {/* Comment utiliser */}
        <section className="mt-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h3 className="text-center text-base font-extrabold text-(--color-ink)">
            Comment utiliser Major ECN ?
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Target,     bg: '#EDE9FE', fg: '#6D28D9', t: 'Progressez spécialité par spécialité', d: 'Suivez un parcours structuré à votre rythme.' },
              { Icon: Compass,    bg: '#DCFCE7', fg: '#16A34A', t: 'Entraînez-vous régulièrement',         d: 'QCM, fiches, flashcards et cas cliniques.' },
              { Icon: RefreshCcw, bg: '#FEE2E2', fg: '#C0112E', t: 'Révisez chaque jour',                   d: 'Les révisions transversales entretiennent vos acquis et limitent l\'oubli.' },
              { Icon: TrendingUp, bg: '#FEF3C7', fg: '#D97706', t: 'Évaluez-vous et mesurez vos progrès',  d: "Les évaluations officielles vous guident et permettent d'identifier vos priorités." },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: c.bg, color: c.fg }}>
                  <c.Icon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-2 text-[12.5px] font-bold leading-tight text-(--color-ink)">{c.t}</p>
                <p className="mt-1 text-[11px] leading-snug text-(--color-ink-soft)">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Important */}
        <section className="mt-5 flex items-start gap-3 rounded-2xl border border-[#FCD34D]/50 bg-[#FFFBEB] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7]">
            <AlertCircle className="h-4 w-4 text-[#D97706]" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-(--color-ink)">Important</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-(--color-ink-soft)">
              Toutes les spécialités du programme doivent être travaillées.
              Cette recommandation a simplement pour objectif de vous aider à organiser
              efficacement le début de votre préparation.
            </p>
          </div>
        </section>

        {/* CTA + checkbox */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/accueil"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F1F4D] px-6 py-3 text-sm font-extrabold text-white transition-transform hover:scale-[1.02]"
          >
            Commencer ma préparation <ArrowRight className="h-4 w-4" />
          </Link>
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-(--color-ink-soft)">
            <input
              type="checkbox"
              checked={neverShow}
              onChange={(e) => onNeverShowChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-(--color-border) text-(--color-primary) focus:ring-(--color-primary)"
            />
            Ne plus afficher cette fenêtre au démarrage
          </label>
          <p className="mt-1 text-center text-[11px] text-(--color-ink-muted)">
            Vous pourrez retrouver ces conseils à tout moment via le bouton
            <span className="mx-1 inline-flex items-center gap-1 rounded-md border border-[#FCC9D2] bg-[#FFE4E8] px-1.5 py-0.5 font-bold" style={{ color: PURPLE }}>
              <Lightbulb className="h-2.5 w-2.5" /> Conseils
            </span>
            en haut à droite.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PANNEAU SECTIONNÉ — accessible via le bouton, navigation latérale
   ============================================================ */
function PanelOverlay({
  section, onSectionChange, onClose,
}: {
  section: Section;
  onSectionChange: (s: Section) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 p-3 sm:p-6" aria-modal="true" role="dialog">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:flex-row">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-(--color-ink-muted) hover:bg-(--color-sand-100)"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Sidebar nav */}
        <aside className="shrink-0 border-b border-(--color-border) bg-[#FAFBFE] p-4 sm:w-56 sm:border-b-0 sm:border-r">
          <p className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-(--color-ink)">
            <Lightbulb className="h-4 w-4" style={{ color: PURPLE }} />
            Conseils de préparation
          </p>
          <nav className="flex gap-1 overflow-x-auto sm:flex-col sm:gap-0.5 sm:overflow-visible">
            {SECTIONS.map((s) => {
              const active = s.id === section;
              return (
                <button
                  key={s.id}
                  onClick={() => onSectionChange(s.id)}
                  className={'flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors sm:whitespace-normal ' + (active ? 'font-bold text-[#E4002B]' : 'font-medium text-(--color-ink-soft) hover:bg-(--color-sand-100)')}
                >
                  <s.Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1">{s.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-4 hidden border-t border-(--color-border) pt-3 sm:block">
            <p className="flex items-center gap-2 text-[12px] font-bold">
              <MessageCircle className="h-3.5 w-3.5 text-[#E4002B]" />
              <span className="bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] bg-clip-text text-transparent">
                Besoin d&rsquo;aide ?
              </span>
            </p>
            <a href="mailto:contact@major-ecn.fr" className="mt-1 inline-block text-[11px] text-(--color-ink-soft) hover:underline">
              Contactez-nous
            </a>
          </div>
        </aside>

        {/* Contenu de la section */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {section === 'demarrer' && <SectionDemarrer />}
          {section === 'parcours' && <SectionParcours />}
          {section === 'methode'  && <SectionMethode />}
          {section === 'faq'      && <SectionFAQ />}
        </div>
      </div>
    </div>
  );
}

function SectionDemarrer() {
  return (
    <div>
      <h3 className="text-lg font-black tracking-tight text-(--color-ink)">Comment bien démarrer ?</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-(--color-ink-soft)">
        Si vous ne savez pas par où commencer, nous vous recommandons de débuter par les
        <strong className="text-(--color-ink)"> spécialités les plus transversales </strong> :
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STARTER_SPECIALTIES.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center text-center">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl p-1"
              style={{ background: s.bg }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt=""
                className="h-full w-full object-contain"
              />
            </span>
            <p className="mt-1 text-[9px] font-bold tabular-nums" style={{ color: s.color }}>{i + 1}</p>
            <p className="text-[10px] font-bold leading-tight" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12.5px] leading-relaxed text-(--color-ink-soft)">
        Ces spécialités vous permettront d&rsquo;acquérir des bases solides et utiles dans de
        nombreuses situations cliniques.
      </p>
      <Link href="/methode" className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-bold" style={{ color: PURPLE }}>
        Voir tous nos conseils <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function SectionParcours() {
  const steps = [
    { t: 'Lancez le diagnostic initial',  d: 'Quelques QCM ciblés pour identifier votre niveau et vos zones à renforcer.' },
    { t: 'Travaillez les spécialités transversales', d: 'Cardio, Pneumo, Néphro, Endocrino, Gériatrie, Neuro.' },
    { t: 'Alternez fiche + QCM + flashcards', d: 'Le triptyque qui fait progresser durablement.' },
    { t: 'Lancez la révision transversale', d: 'Pour entretenir les spécialités déjà étudiées.' },
    { t: 'Concours blanc & ajustements',   d: 'Conditions réelles puis correction guidée.' },
  ];
  return (
    <div>
      <h3 className="text-lg font-black tracking-tight text-(--color-ink)">Parcours recommandé</h3>
      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li key={s.t} className="flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)]">
              {i + 1}
            </span>
            <div>
              <p className="text-[13px] font-bold text-(--color-ink)">{s.t}</p>
              <p className="text-[12px] text-(--color-ink-soft)">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SectionMethode() {
  return (
    <div>
      <h3 className="text-lg font-black tracking-tight text-(--color-ink)">Notre méthode</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-(--color-ink-soft)">
        Major ECN s&rsquo;appuie sur 15 ans d&rsquo;accompagnement des médecins étrangers et
        sur une méthodologie pensée pour les EVC.
      </p>
      <ul className="mt-4 space-y-2.5">
        {[
          'Apprendre à raisonner comme le jury attend',
          'Structurer ses réponses (hiérarchisation, mots-clés)',
          "Maîtriser la stratégie d'épreuve (temps, choix d'items)",
          'Mesurer ses progrès objectivement (concours blancs)',
        ].map((t) => (
          <li key={t} className="flex items-start gap-2 text-[13px] text-(--color-ink)">
            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: PURPLE }} />
            {t}
          </li>
        ))}
      </ul>
      <Link href="/methode" className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-bold" style={{ color: PURPLE }}>
        Lire la méthode complète <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function SectionFAQ() {
  const items = [
    { q: 'Combien de temps faut-il pour préparer les EVC ?', a: "En moyenne 8 à 12 mois de travail régulier, en fonction de votre spécialité et de votre rythme." },
    { q: 'Toutes les spécialités sont-elles obligatoires ?',  a: 'Oui, le programme officiel impose une connaissance transversale.' },
    { q: 'Puis-je changer de spécialité en cours de route ?', a: "Tout à fait : vous gardez tout l'historique et l'algorithme s'adapte." },
  ];
  return (
    <div>
      <h3 className="text-lg font-black tracking-tight text-(--color-ink)">Questions fréquentes</h3>
      <ul className="mt-3 space-y-3">
        {items.map((it) => (
          <li key={it.q} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5">
            <p className="text-[13px] font-bold text-(--color-ink)">{it.q}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-(--color-ink-soft)">{it.a}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
