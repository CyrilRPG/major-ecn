'use client';

/**
 * Première étape du tunnel d'inscription : « Quelle spécialité préparez-vous ? »
 *
 * Le bouton « S'inscrire » n'envoie plus vers une page ; il ouvre ce choix.
 * La spécialité retenue conduit au bloc « Choisissez votre formule » de la page
 * correspondante (cf. lienChoixFormule), d'où elle est portée jusqu'au module
 * de paiement.
 *
 * La liste proposée est celle des spécialités réellement inscriptibles en
 * ligne : ce sont les seuls libellés que le formulaire de paiement sait
 * présélectionner. Les autres spécialités passent par le formulaire de contact.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ENROLLABLE_SPECIALTIES } from '@/lib/data/enrollable-colleges';
import { lienChoixFormule } from '@/lib/tunnel-inscription';

const NAVY = '#0F1F4D';
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const INK_SOFT = '#5B6478';
const INK_MUTED = '#8A93A6';
const LINE = '#E4E7EF';

export function DialogueSpecialite({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  /* Le dialogue est rendu dans <body> par un portail. Sans cela il reste
     enfant de l'en-tête, dont le backdrop-filter fait office de bloc
     conteneur pour les descendants en position fixed : « inset-0 » se
     résolvait alors sur les 96 px de la barre de navigation, et le haut du
     dialogue sortait de l'écran. */
  const router = useRouter();
  const boite = useRef<HTMLDivElement>(null);

  // Fermeture au clavier + verrouillage du défilement d'arrière-plan.
  useEffect(() => {
    if (!ouvert) return;
    const surEchap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false);
    };
    document.addEventListener('keydown', surEchap);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    boite.current?.focus();
    return () => {
      document.removeEventListener('keydown', surEchap);
      document.body.style.overflow = overflow;
    };
  }, [ouvert]);

  function choisir(specialite: string) {
    setOuvert(false);
    router.push(lienChoixFormule(specialite));
  }

  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className={className} style={style}>
        {children}
      </button>

      {ouvert && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          style={{ background: 'rgba(9,18,38,0.55)', backdropFilter: 'blur(3px)' }}
          onClick={() => setOuvert(false)}
        >
          <div
            ref={boite}
            role="dialog"
            aria-modal="true"
            aria-label="Quelle spécialité préparez-vous ?"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl outline-none sm:rounded-3xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ color: RED }}>
                  Inscription
                </p>
                <h2 className="mt-3 text-[1.45rem] font-black leading-tight tracking-tight sm:text-[1.7rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                  Quelle spécialité préparez-vous&nbsp;?
                </h2>
                <p className="mt-2.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                  Nous vous emmenons directement aux formules de votre spécialité.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer"
                className="shrink-0 rounded-full px-3 py-1.5 text-[18px] font-black leading-none transition-colors hover:bg-[#F1F3F8]"
                style={{ color: INK_MUTED }}
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {ENROLLABLE_SPECIALTIES.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => choisir(s.name)}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-[#FDF2F4]"
                  style={{ border: `1px solid ${LINE}` }}
                >
                  <span className="text-[13.5px] font-black" style={{ color: NAVY }}>{s.name}</span>
                  <span aria-hidden className="text-[13px] font-black" style={{ color: RED }}>→</span>
                </button>
              ))}
            </div>

            <p className="mt-6 border-t pt-5 text-[12.5px] leading-relaxed" style={{ borderColor: LINE, color: INK_SOFT }}>
              Votre spécialité n’apparaît pas dans cette liste&nbsp;?{' '}
              <Link
                href="/contact"
                onClick={() => setOuvert(false)}
                className="font-black underline underline-offset-4"
                style={{ color: RED_DEEP }}
              >
                Contactez-nous
              </Link>
              , nous préparons l’ensemble des spécialités des EVC.
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
