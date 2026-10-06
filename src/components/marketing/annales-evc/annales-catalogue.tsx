'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Search } from 'lucide-react';
import { RECUEILS_ANNALES } from '@/lib/data/annales-evc';
import { INK_MUTED, INK_SOFT, JAKARTA, MANROPE, NAVY, RED, RED_DEEP } from '@/components/marketing/home/home-ui';

const BORDER = '#E6E4DF';
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Présélectionne la spécialité dans le formulaire et y ramène. */
function choisir(slug: string) {
  window.dispatchEvent(new CustomEvent('annales-choisir', { detail: slug }));
  document.getElementById('formulaire-annales')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Les 51 recueils : recherche instantanée, couverture réelle, clic = présélection du formulaire. */
export function AnnalesCatalogue() {
  const [q, setQ] = useState('');
  const [tout, setTout] = useState(false);
  const needle = norm(q.trim());
  const liste = useMemo(
    () => (needle ? RECUEILS_ANNALES.filter((r) => norm(r.nom).includes(needle)) : RECUEILS_ANNALES),
    [needle],
  );

  return (
    <div style={{ fontFamily: JAKARTA }}>
      <div className="mx-auto max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2" style={{ color: INK_MUTED }} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher ma spécialité (ex. cardiologie, pédiatrie…)"
            aria-label="Rechercher une spécialité"
            className="h-[52px] w-full rounded-2xl border bg-white pl-11 pr-4 text-[14px] font-semibold outline-none shadow-[0_18px_40px_-32px_rgba(15,27,61,0.45)] transition-shadow placeholder:font-medium focus:ring-2 focus:ring-[#C0112E]/25"
            style={{ borderColor: BORDER, color: NAVY, fontFamily: MANROPE }}
          />
        </div>
        <p className="mt-2 text-center text-[12px]" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
          {needle ? `${liste.length} recueil${liste.length > 1 ? 's' : ''} trouvé${liste.length > 1 ? 's' : ''}` : 'Cliquez sur votre spécialité : elle est sélectionnée dans le formulaire.'}
        </p>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {liste.map((r, i) => (
          // Téléphone : les 9 premiers, le reste derrière « Afficher les 51 spécialités » (la recherche montre tout)
          <li key={r.slug} className={!tout && !needle && i >= 9 ? 'hidden sm:block' : undefined}>
            {/* Vrai lien (indexé, ouvrable dans un onglet) ; un clic simple présélectionne le formulaire de la page */}
            <a
              href={`/annales-evc/${r.slug}`}
              title={`Annales EVC ${r.nom}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                choisir(r.slug);
              }}
              className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-3 pr-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C0112E]/35 hover:shadow-[0_24px_50px_-34px_rgba(139,14,34,0.55)]"
              style={{ borderColor: BORDER }}
            >
              <span className="relative block w-[52px] shrink-0 overflow-hidden rounded-[5px] shadow-[0_10px_20px_-10px_rgba(15,27,61,0.6)] ring-1 ring-black/5">
                <Image src={`/annales-evc/couvertures/${r.slug}.webp`} alt="" width={420} height={594} sizes="52px" className="h-auto w-full" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                  <span className="sr-only">Annales EVC </span>{r.nom}
                </span>
                <span className="mt-1 block text-[12.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  {r.sujets} sujet{r.sujets > 1 ? 's' : ''} · {r.premiere === r.derniere ? `session ${r.premiere}` : `${r.premiere} – ${r.derniere}`}
                </span>
              </span>
              <ArrowRight className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: RED }} />
            </a>
          </li>
        ))}
      </ul>
      {!tout && !needle && liste.length > 9 && (
        <div className="mt-5 text-center sm:hidden">
          <button
            type="button"
            onClick={() => setTout(true)}
            className="inline-flex items-center gap-2 rounded-xl border-2 bg-white px-6 py-3.5 text-[14px] font-black tracking-tight"
            style={{ borderColor: '#E7C9CD', color: RED_DEEP }}
          >
            Afficher les {liste.length} spécialités
          </button>
        </div>
      )}
      {liste.length === 0 && (
        <p className="mt-6 text-center text-[13.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
          Aucune spécialité ne correspond. Essayez un autre mot, par exemple « chirurgie » ou « médecine ».
        </p>
      )}
    </div>
  );
}
