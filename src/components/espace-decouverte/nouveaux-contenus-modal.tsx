'use client';

/**
 * Popup "Information importante — Nouveaux contenus en cours d'intégration"
 * Affichée au clic sur les entraînements verrouillés (cadenas) en MG, et
 * également utilisable sous forme de bandeau persistant (NouveauxContenusBanner).
 */
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, ClipboardCheck, FileText, Heart, Info,
  Layers3, Lightbulb, Stethoscope, X,
} from 'lucide-react';

const NAVY = '#0F172A';
const NAVY_DEEP = '#1E3A5F';
const BLUE = '#1E40AF';
const RED = '#C0112E';
const GREEN = '#16A34A';
const INK_SOFT = '#475569';
const SOFT_BG = '#F0F4FA';

const CONTENU_LIST = [
  { Icon: FileText,       t: 'Dossiers cliniques' },
  { Icon: ClipboardCheck, t: 'QCM et entraînements' },
  { Icon: FileText,       t: 'Fiches pédagogiques' },
  { Icon: Layers3,        t: 'Flashcards' },
  { Icon: Lightbulb,      t: 'Méthodologie et conseils' },
];

function NouveauxContenusContent() {
  return (
    <>
      <div className="flex items-start gap-2 mb-4">
        <span className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider text-white" style={{ background: BLUE }}>
          <Info className="h-4 w-4" />
          INFORMATION IMPORTANTE
        </span>
      </div>

      <h3 className="text-xl font-black sm:text-2xl" style={{ color: NAVY }}>
        Nouveaux contenus <span style={{ color: GREEN }}>en cours d&rsquo;intégration</span>
      </h3>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: INK_SOFT }}>
        Afin de vous offrir les ressources les plus pertinentes pour réussir les EVC,
        de nouveaux dossiers cliniques, QCM, fiches pédagogiques et supports de révision{' '}
        <span className="font-semibold" style={{ color: GREEN }}>sont actuellement ajoutés à la plateforme après validation par notre équipe pédagogique.</span>
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-lg p-3" style={{ background: SOFT_BG }}>
        <Stethoscope className="h-5 w-5 shrink-0 mt-0.5" style={{ color: BLUE }} />
        <p className="text-sm" style={{ color: NAVY_DEEP }}>
          De nouveaux contenus seront mis à disposition progressivement dans les{' '}
          <strong>prochains jours.</strong>
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: GREEN }} />
        <p className="text-sm" style={{ color: INK_SOFT }}>
          En attendant, l&rsquo;ensemble des ressources déjà disponibles reste accessible.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-5" style={{ borderColor: '#E2E8F0' }}>
        {CONTENU_LIST.map((c) => (
          <div key={c.t} className="flex items-center gap-2 text-xs font-semibold" style={{ color: BLUE }}>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {c.t}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 justify-center">
        <Heart className="h-5 w-5" fill={RED} style={{ color: RED }} />
        <p className="text-sm font-bold" style={{ color: NAVY }}>Merci de votre confiance.</p>
      </div>
      <p className="text-center text-xs mt-1" style={{ color: '#64748B' }}>L&rsquo;équipe Major ECN</p>
    </>
  );
}

/**
 * Modal version : utilisée au clic sur les entraînements verrouillés MG.
 */
export function NouveauxContenusModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(15, 31, 77, 0.45)', backdropFilter: 'blur(2px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nouveaux-contenus-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border p-6 shadow-2xl sm:p-8"
        style={{
          background: 'linear-gradient(to bottom right, #F0F4FA, white, #F0F4FA)',
          borderColor: '#D4DBE8',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="nouveaux-contenus-modal-title" className="sr-only">Information importante</h2>
        <NouveauxContenusContent />

        {/* CTA conversion */}
        <Link
          href="/tarifs"
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_28px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.01]"
          style={{ background: `linear-gradient(90deg, #8B0E22 0%, ${RED} 100%)` }}
        >
          Découvrir nos formules
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Bandeau version compacte : pour la sidebar du dashboard étudiant.
 * Dismissable.
 */
export function NouveauxContenusBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4"
      style={{
        background: 'linear-gradient(to bottom right, #F0F4FA, white, #F0F4FA)',
        borderColor: '#D4DBE8',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <button
        onClick={() => setOpen(false)}
        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
      <NouveauxContenusCompact />
    </div>
  );
}

/** Version ultra-compacte pour la sidebar (titres réduits, pas de grille 5 col). */
function NouveauxContenusCompact() {
  return (
    <>
      <div className="flex items-start gap-2 mb-3 pr-6">
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white" style={{ background: BLUE }}>
          <Info className="h-3 w-3" />
          INFO
        </span>
      </div>

      <h3 className="text-[14px] font-extrabold leading-tight" style={{ color: NAVY }}>
        Nouveaux contenus <span style={{ color: GREEN }}>en cours d&rsquo;intégration</span>
      </h3>
      <p className="mt-2 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
        De nouveaux dossiers cliniques, QCM, fiches et flashcards sont actuellement ajoutés
        à la plateforme après validation par notre équipe pédagogique.
      </p>

      <div className="mt-3 rounded-lg p-2.5" style={{ background: SOFT_BG }}>
        <p className="text-[11.5px] leading-tight" style={{ color: NAVY_DEEP }}>
          De nouveaux contenus seront mis à disposition <strong>dans les prochains jours.</strong>
        </p>
      </div>

      <ul className="mt-3 space-y-1.5">
        {CONTENU_LIST.map((c) => (
          <li key={c.t} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: BLUE }}>
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            {c.t}
          </li>
        ))}
      </ul>

      {/* CTA conversion compact vers /tarifs */}
      <Link
        href="/tarifs"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11.5px] font-extrabold text-white shadow-[0_8px_22px_-10px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.01]"
        style={{ background: `linear-gradient(90deg, #8B0E22 0%, ${RED} 100%)` }}
      >
        Découvrir nos formules
        <ArrowRight className="h-3 w-3" />
      </Link>

      <p className="mt-3 flex items-center justify-center gap-1 text-[11px] font-bold" style={{ color: NAVY }}>
        <Heart className="h-3 w-3" fill={RED} style={{ color: RED }} />
        Merci de votre confiance.
      </p>
      <p className="text-center text-[10px]" style={{ color: '#64748B' }}>L&rsquo;équipe Major ECN</p>
    </>
  );
}
