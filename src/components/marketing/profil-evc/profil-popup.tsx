'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ProfilDiagnostic } from './profil-diagnostic';
import { ProfilTeaser } from './profil-teaser';

const LS_DISMISSED = 'profil-evc-dismissed';
const LS_DONE = 'profil-evc-done';
const DISMISS_COOLDOWN_DAYS = 7;
const MIN_DELAY_MS = 20_000;
const SCROLL_TRIGGER = 0.55;

function isEligible(): boolean {
  try {
    if (localStorage.getItem(LS_DONE)) return false;
    const d = localStorage.getItem(LS_DISMISSED);
    if (d) {
      const ts = parseInt(d, 10);
      if (Date.now() - ts < DISMISS_COOLDOWN_DAYS * 864e5) return false;
    }
    return true;
  } catch { return false; }
}

export function ProfilPopup({ autoOpen = true }: { autoOpen?: boolean }) {
  const [open, setOpen] = useState(false);
  // « teaser » = message léger « Avant de partir… » (déclenchement intelligent) ;
  // « full » = diagnostic complet (bouton flottant / hero / nav, ou après clic CTA).
  const [view, setView] = useState<'teaser' | 'full'>('teaser');
  const [startStep, setStartStep] = useState<'intro' | 'form'>('intro');
  const shownRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openPopup = useCallback((mode: 'teaser' | 'full') => {
    if (shownRef.current) return;
    shownRef.current = true;
    setView(mode);
    setStartStep('intro');
    setOpen(true);
  }, []);

  // Depuis le teaser : lance le diagnostic (formulaire) sans re-dérouler l'intro.
  const startFromTeaser = useCallback(() => {
    setStartStep('form');
    setView('full');
  }, []);

  const closePopup = useCallback(() => {
    setOpen(false);
    try { localStorage.setItem(LS_DISMISSED, String(Date.now())); } catch {}
  }, []);

  // Ouverture manuelle (boutons flottant / hero / nav) → diagnostic complet.
  useEffect(() => {
    function manual() { shownRef.current = false; openPopup('full'); }
    window.addEventListener('open-profil-popup', manual);
    return () => window.removeEventListener('open-profil-popup', manual);
  }, [openPopup]);

  // Déclenchement automatique : exit-intent (desktop) + scroll 55%.
  useEffect(() => {
    if (!autoOpen || !isEligible()) return;
    const start = Date.now();
    let minPassed = false;
    const minTimer = setTimeout(() => { minPassed = true; }, MIN_DELAY_MS);

    const tryTrigger = () => {
      if (shownRef.current || !minPassed) return;
      if (Date.now() - start < MIN_DELAY_MS) return;
      openPopup('teaser');
    };
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h >= SCROLL_TRIGGER) tryTrigger();
    };
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && window.innerWidth > 768) tryTrigger();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onMouseLeave);
    return () => {
      clearTimeout(minTimer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseLeave);
    };
  }, [autoOpen, openPopup]);

  // Escape + scroll lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePopup(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, closePopup]);

  const markDone = useCallback(() => {
    try { localStorage.setItem(LS_DONE, '1'); localStorage.removeItem(LS_DISMISSED); } catch {}
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-3 sm:p-6"
      style={{ background: 'rgba(15,31,77,0.6)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Diagnostic Profil EVC"
      onClick={(e) => { if (e.target === e.currentTarget) closePopup(); }}
    >
      {view === 'teaser' ? (
        <ProfilTeaser onStart={startFromTeaser} onClose={closePopup} />
      ) : (
        <div
          ref={dialogRef}
          className="relative my-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <button
            type="button"
            onClick={closePopup}
            aria-label="Fermer"
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-md backdrop-blur transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
          <ProfilDiagnostic startStep={startStep} onResult={markDone} />
        </div>
      )}
    </div>
  );
}
