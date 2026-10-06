'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { RECUEILS_ANNALES } from '@/lib/data/annales-evc';
import { INK_MUTED, INK_SOFT, MANROPE, NAVY, RED, RED_DEEP } from '@/components/marketing/home/home-ui';

const BORDER = '#E6E4DF';
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'");

/**
 * Choix de la spécialité par recherche (combobox ARIA) : on tape, la liste se filtre
 * (sans accents, sur n'importe quel mot du nom), flèches + Entrée, Échap pour fermer.
 * La valeur part avec le formulaire par un champ caché `specialite`.
 */
export function ChoixSpecialite({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const id = useId();
  const listId = `${id}-liste`;
  const choisi = RECUEILS_ANNALES.find((r) => r.slug === value);
  const [q, setQ] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const boite = useRef<HTMLDivElement>(null);
  const liste = useRef<HTMLUListElement>(null);
  const champ = useRef<HTMLInputElement>(null);

  const resultats = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return RECUEILS_ANNALES;
    const mots = n.split(/\s+/);
    return RECUEILS_ANNALES
      .filter((r) => mots.every((m) => norm(r.nom).includes(m)))
      // les noms qui commencent par la recherche d'abord
      .sort((a, b) => Number(!norm(a.nom).startsWith(n)) - Number(!norm(b.nom).startsWith(n)));
  }, [q]);

  // Clic en dehors : fermeture
  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: MouseEvent) => {
      if (!boite.current?.contains(e.target as Node)) { setOuvert(false); setQ(''); }
    };
    document.addEventListener('mousedown', fermer);
    return () => document.removeEventListener('mousedown', fermer);
  }, [ouvert]);

  // L'option active reste visible dans la liste
  useEffect(() => {
    liste.current?.querySelector<HTMLElement>(`[data-index="${actif}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [actif, ouvert]);

  const valider = (slug: string) => {
    onChange(slug);
    setOuvert(false);
    setQ('');
    champ.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOuvert(true); setActif((a) => Math.min(a + 1, resultats.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') {
      if (ouvert && resultats[actif]) { e.preventDefault(); valider(resultats[actif].slug); }
    } else if (e.key === 'Escape') { setOuvert(false); setQ(''); }
  };

  return (
    <div ref={boite} className="relative mt-1.5">
      <input type="hidden" name="specialite" value={value} />
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: ouvert ? RED : INK_MUTED }} />
      <input
        ref={champ}
        id="an-spe"
        type="text"
        role="combobox"
        aria-expanded={ouvert}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={ouvert && resultats[actif] ? `${id}-${resultats[actif].slug}` : undefined}
        autoComplete="off"
        spellCheck={false}
        // Fermé : le nom de la spécialité choisie ; ouvert : la recherche en cours
        value={ouvert ? q : choisi?.nom ?? ''}
        placeholder={choisi ? choisi.nom : `Rechercher parmi les ${RECUEILS_ANNALES.length} spécialités`}
        onFocus={() => { setOuvert(true); setActif(0); }}
        onClick={() => setOuvert(true)}
        onChange={(e) => { setQ(e.target.value); setOuvert(true); setActif(0); }}
        onKeyDown={onKeyDown}
        className="h-12 w-full rounded-xl border bg-white pl-10 pr-10 text-[14px] font-semibold outline-none transition-colors placeholder:font-medium placeholder:text-[#9AA1B2] focus:border-[#C0112E] focus:ring-2 focus:ring-[#C0112E]/15"
        style={{ borderColor: BORDER, color: NAVY, fontFamily: MANROPE }}
      />
      {ouvert && q ? (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setQ(''); setActif(0); champ.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-[#F5F4F0]"
        >
          <X className="h-4 w-4" style={{ color: INK_MUTED }} />
        </button>
      ) : (
        <ChevronDown
          className={'pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform ' + (ouvert ? 'rotate-180' : '')}
          style={{ color: RED }}
        />
      )}

      {ouvert && (
        <ul
          ref={liste}
          id={listId}
          role="listbox"
          aria-label="Spécialités"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-y-auto rounded-2xl border bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(15,27,61,0.45)]"
          style={{ borderColor: BORDER, fontFamily: MANROPE }}
        >
          {resultats.length === 0 && (
            <li className="px-3 py-4 text-center text-[13px]" style={{ color: INK_SOFT }}>
              Aucune spécialité ne correspond à « {q} ».
            </li>
          )}
          {resultats.map((r, i) => {
            const sel = r.slug === value;
            return (
              <li
                key={r.slug}
                id={`${id}-${r.slug}`}
                data-index={i}
                role="option"
                aria-selected={sel}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => valider(r.slug)}
                onMouseEnter={() => setActif(i)}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2"
                style={{ background: i === actif ? '#FDF1F3' : undefined }}
              >
                <Image src={`/annales-evc/couvertures/${r.slug}.webp`} alt="" width={420} height={594} sizes="24px" className="h-[34px] w-6 shrink-0 rounded-[3px] object-cover shadow-sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold" style={{ color: i === actif ? RED_DEEP : NAVY }}>{r.nom}</span>
                  <span className="block text-[11.5px]" style={{ color: INK_MUTED }}>
                    {r.sujets} sujet{r.sujets > 1 ? 's' : ''} · {r.premiere === r.derniere ? r.premiere : `${r.premiere} – ${r.derniere}`}
                  </span>
                </span>
                {sel && <Check className="h-4 w-4 shrink-0" style={{ color: RED }} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
