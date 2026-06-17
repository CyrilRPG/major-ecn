'use client';

/**
 * Popup tutoriel d'accueil pour les PROFESSEURS.
 *
 * Reprend exactement la direction artistique du popup d'accueil Découverte
 * (`DiscoveryWelcomePopup`) : carte blanche arrondie 28px, cercle d'icône avec
 * accents flottants, cartes colorées, CTA dégradé rouge→orange, checkbox
 * « Ne plus afficher ». Ici sous forme de stepper : on guide le professeur sur
 * où cliquer pour consulter une fiche, l'éditer, modifier QCM et flashcards et
 * répondre sur le forum.
 *
 * Affiché à la première ouverture de la plateforme côté professeur
 * (mémorisé en localStorage).
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, GraduationCap, HelpCircle,
  Layers3, MessagesSquare, Pencil, Sparkles, X, type LucideIcon,
} from 'lucide-react';

const STORAGE_KEY = 'major-ecn:prof-tutorial-dismissed';

const INK = '#1F2937';
const INK_SOFT = '#52607A';

type Step = {
  Icon: LucideIcon;
  tag: string;
  title: string;
  color: string;       // accent principal
  bg: string;          // fond carte
  border: string;      // bordure carte
  body: ReactNode;
};

const STEPS: Step[] = [
  {
    Icon: BookOpen,
    tag: 'Étape 1',
    title: 'Consulter une fiche & les contenus',
    color: '#2563EB', bg: '#EFF4FF', border: '#BFD0F5',
    body: (
      <>
        Depuis l&rsquo;accueil, ouvrez <strong>« Vos collèges »</strong>, choisissez un{' '}
        <strong>collège</strong> puis l&rsquo;<strong>item</strong> qui vous intéresse. La vue du
        cours s&rsquo;ouvre avec ses onglets : <strong>Fiche</strong>, <strong>Vidéo</strong>,{' '}
        <strong>QCM</strong> et <strong>Flashcards</strong>.
      </>
    ),
  },
  {
    Icon: Pencil,
    tag: 'Étape 2',
    title: 'Éditer une fiche',
    color: '#6D28D9', bg: '#F3EEFF', border: '#D6C8F7',
    body: (
      <>
        Dans l&rsquo;onglet <strong>Fiche</strong>, cliquez sur le bouton{' '}
        <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 align-middle text-[11px] font-bold" style={{ background: '#EDE9FE', color: '#6D28D9' }}>
          <Pencil className="h-3 w-3" /> Éditer la fiche
        </span>{' '}
        en haut à droite. Vous modifiez le contenu directement sur le rendu réel
        (gras, couleurs, listes, encadrés), puis <strong>Publier</strong> pour mettre à jour le PDF des élèves.
      </>
    ),
  },
  {
    Icon: HelpCircle,
    tag: 'Étape 3',
    title: 'Modifier les QCM',
    color: '#C0112E', bg: '#FDEEEF', border: '#F5C2C7',
    body: (
      <>
        Ouvrez l&rsquo;onglet <strong>QCM</strong>. Sur chaque question, un petit bouton{' '}
        <span className="inline-flex items-center justify-center rounded-md p-1 align-middle" style={{ background: '#FFE3E6', color: '#C0112E' }}>
          <Pencil className="h-3 w-3" />
        </span>{' '}
        <strong>crayon</strong> vous permet de corriger l&rsquo;énoncé, les propositions, la bonne
        réponse et l&rsquo;explication — directement depuis la vue étudiant.
      </>
    ),
  },
  {
    Icon: Layers3,
    tag: 'Étape 4',
    title: 'Modifier les flashcards',
    color: '#16793C', bg: '#E7F6EC', border: '#C6EBD2',
    body: (
      <>
        Dans l&rsquo;onglet <strong>Flashcards</strong>, le même bouton{' '}
        <span className="inline-flex items-center justify-center rounded-md p-1 align-middle" style={{ background: '#D7F0DF', color: '#16793C' }}>
          <Pencil className="h-3 w-3" />
        </span>{' '}
        <strong>crayon</strong> sur chaque carte ouvre l&rsquo;édition du <strong>recto</strong> et du{' '}
        <strong>verso</strong>. Vos modifications sont visibles instantanément par les élèves.
      </>
    ),
  },
  {
    Icon: MessagesSquare,
    tag: 'Étape 5',
    title: 'Répondre sur le forum',
    color: '#E4002B', bg: '#FFF1EC', border: '#FAD3C4',
    body: (
      <>
        Sur l&rsquo;accueil, la carte{' '}
        <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 align-middle text-[11px] font-bold text-white" style={{ background: 'linear-gradient(90deg,#E4002B,#F97316)' }}>
          <MessagesSquare className="h-3 w-3" /> Forum Q&amp;R
        </span>{' '}
        regroupe les questions des élèves par cours. Cliquez dessus pour{' '}
        <strong>répondre</strong> ; vos réponses peuvent être validées depuis{' '}
        <strong>« Mes questions à valider »</strong>.
      </>
    ),
  },
];

export function ProfTutorialPopup() {
  const [open, setOpen] = useState(false);
  const [neverShow, setNeverShow] = useState(true);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  function close() {
    if (neverShow) localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  if (!open) return null;

  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const Icon = step.Icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="prof-tutorial-title"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Close X */}
        <button
          onClick={close}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F1F5F9]"
          style={{ color: INK_SOFT }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header — cercle d'icône + accents flottants */}
        <div className="flex justify-center">
          <div className="relative">
            <span
              className="flex h-28 w-28 items-center justify-center rounded-full transition-colors"
              style={{ background: `radial-gradient(circle at 50% 50%, ${step.color}33 0%, ${step.color}1A 55%, ${step.color}00 100%)` }}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#FFFFFF', color: step.color, boxShadow: `0 10px 30px -12px ${step.color}80` }}>
                <Icon className="h-8 w-8" strokeWidth={2.2} />
              </span>
            </span>
            <Sparkles aria-hidden className="absolute -left-2 top-1 h-4 w-4" style={{ color: step.color }} strokeWidth={2.4} />
            <span
              aria-hidden
              className="absolute -top-1 right-0 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: step.color, color: '#FFFFFF', boxShadow: `0 6px 20px -8px ${step.color}` }}
            >
              <GraduationCap className="h-3.5 w-3.5" strokeWidth={2.6} />
            </span>
          </div>
        </div>

        {/* Tag étape + titre */}
        <div className="mt-5 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em]"
            style={{ background: step.bg, color: step.color }}
          >
            {step.tag} <span style={{ color: INK_SOFT }}>· sur {STEPS.length}</span>
          </span>
          <h2
            id="prof-tutorial-title"
            className="mt-3 text-[22px] font-black leading-tight tracking-tight sm:text-[26px]"
            style={{ color: INK }}
          >
            {step.title}
          </h2>
          <span aria-hidden className="mx-auto mt-2 block h-[3px] w-16 rounded-full" style={{ background: step.color }} />
        </div>

        {/* Carte de contenu colorée */}
        <div
          className="mt-5 flex items-start gap-3 rounded-2xl border p-4"
          style={{ background: step.bg, borderColor: step.border }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: '#FFFFFF', color: step.color }}>
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <p className="text-[13.5px] leading-relaxed" style={{ color: INK }}>
            {step.body}
          </p>
        </div>

        {/* Indicateur d'étapes (dots cliquables) */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {STEPS.map((s, idx) => (
            <button
              key={idx}
              aria-label={`Étape ${idx + 1}`}
              onClick={() => setI(idx)}
              className="h-2 rounded-full transition-all"
              style={{
                width: idx === i ? 26 : 8,
                background: idx === i ? s.color : '#D7DCE5',
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-5 flex items-center gap-3">
          {i > 0 ? (
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              className="flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3.5 text-[14px] font-bold transition-colors hover:bg-[#F8FAFC]"
              style={{ borderColor: '#E5E9F0', color: INK_SOFT }}
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              className="rounded-2xl border px-4 py-3.5 text-[14px] font-bold transition-colors hover:bg-[#F8FAFC]"
              style={{ borderColor: '#E5E9F0', color: INK_SOFT }}
            >
              Passer
            </button>
          )}

          <button
            type="button"
            onClick={() => (last ? close() : setI((v) => Math.min(STEPS.length - 1, v + 1)))}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_15px_35px_-15px_rgba(228,0,43,0.55)] transition-transform hover:scale-[1.01]"
            style={{ background: 'linear-gradient(90deg, #E4002B 0%, #F97316 100%)' }}
          >
            {last ? <>C&rsquo;est parti ! <Check className="h-5 w-5" /></> : <>Suivant <ArrowRight className="h-5 w-5" /></>}
          </button>
        </div>

        {/* Checkbox "Ne plus afficher" */}
        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 text-[12.5px]" style={{ color: INK_SOFT }}>
          <input
            type="checkbox"
            checked={neverShow}
            onChange={(e) => setNeverShow(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded"
            style={{ accentColor: '#E4002B' }}
          />
          Ne plus afficher ce tutoriel
        </label>
      </div>
    </div>
  );
}
