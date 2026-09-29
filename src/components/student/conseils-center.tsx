'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ChevronRight, Compass, HelpCircle, Lightbulb, MessageCircle, Target, X,
} from 'lucide-react';
import { WELCOME_PAR_DEFAUT, type WelcomeConfig } from '@/lib/student/welcome';

// Charte cohérente avec le menu (rouge-orange officiel Major ECN)
const PURPLE = '#E4002B';      // ⇐ alias historique conservé : nom legacy mais valeur rouge

type Section = 'demarrer' | 'parcours' | 'methode' | 'faq';

const SECTIONS: { id: Section; label: string; Icon: typeof Lightbulb }[] = [
  { id: 'demarrer', label: 'Comment bien démarrer ?', Icon: Lightbulb },
  { id: 'parcours', label: 'Parcours recommandé',     Icon: Compass },
  { id: 'methode',  label: 'Notre méthode',           Icon: Target },
  { id: 'faq',      label: 'Questions fréquentes',    Icon: HelpCircle },
];

export function ConseilsCenter({
  welcome = WELCOME_PAR_DEFAUT,
}: {
  /** Contenu d'accueil, résolu côté serveur selon la spécialité. */
  welcome?: WelcomeConfig;
}) {
  // Panneau « Conseils de préparation », ouvert par le bouton de la barre du
  // haut. Le grand popup d'accueil n'existe plus : son texte s'affiche sous le
  // tutoriel vidéo (components/student/tutoriel-video).
  const [ouvert, setOuvert] = useState(false);
  const [section, setSection] = useState<Section>('demarrer');

  // Custom event : permet à la TopBar (ou n'importe quel autre composant)
  // d'ouvrir le panneau Conseils sans avoir besoin d'un context global.
  useEffect(() => {
    const onOpen = () => { setSection('demarrer'); setOuvert(true); };
    window.addEventListener('conseils:open', onOpen);
    return () => window.removeEventListener('conseils:open', onOpen);
  }, []);

  if (!ouvert) return null;
  return (
    <PanelOverlay
      welcome={welcome}
      section={section}
      onSectionChange={setSection}
      onClose={() => setOuvert(false)}
    />
  );
}

/* ============================================================
   PANNEAU SECTIONNÉ — accessible via le bouton, navigation latérale
   ============================================================ */
function PanelOverlay({
  welcome, section, onSectionChange, onClose,
}: {
  welcome: WelcomeConfig;
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
          {section === 'demarrer' && <SectionDemarrer welcome={welcome} />}
          {section === 'parcours' && <SectionParcours />}
          {section === 'methode'  && <SectionMethode />}
          {section === 'faq'      && <SectionFAQ />}
        </div>
      </div>
    </div>
  );
}

function SectionDemarrer({ welcome }: { welcome: WelcomeConfig }) {
  return (
    <div>
      <h3 className="text-lg font-black tracking-tight text-(--color-ink)">{welcome.accroche}</h3>
      {welcome.demarrageActif && welcome.specialites.length > 0 && (
        <>
          <p className="mt-2 text-[13px] leading-relaxed text-(--color-ink-soft)">{welcome.demarrageIntro}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {welcome.specialites.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl p-1"
                  style={{ background: s.bg }}>
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-base font-black" style={{ color: s.color }}>
                      {s.label.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </span>
                <p className="mt-1 text-[9px] font-bold tabular-nums" style={{ color: s.color }}>{i + 1}</p>
                <p className="text-[10px] font-bold leading-tight" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
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
