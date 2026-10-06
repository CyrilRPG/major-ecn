'use client';

import type { ReactNode } from 'react';

/** Carte d'une spécialité : la présélectionne dans le formulaire et y ramène. */
export function ChoisirSpecialite({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('annales-choisir', { detail: slug }));
        document.getElementById('formulaire-annales')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E5E9F0] bg-white px-4 py-3.5 text-left transition-colors hover:border-[#C0112E]/40 hover:bg-[#FFF8F9]"
    >
      {children}
    </button>
  );
}
