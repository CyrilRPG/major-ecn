'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export type OptionCollege = {
  id: string;
  nom: string;
  /** Précision affichée à droite (ex. le collège parent d'un sous-collège). */
  precision?: string | null;
};

/** Minuscules sans accents : « pédiatrie » se trouve en tapant « pediatrie ». */
export function normaliserRecherche(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * Collèges correspondant à la saisie : ceux dont un mot COMMENCE par la saisie
 * d'abord, puis ceux qui la contiennent ailleurs ; ordre alphabétique ensuite.
 */
export function filtrerColleges(options: OptionCollege[], saisie: string): OptionCollege[] {
  const q = normaliserRecherche(saisie);
  if (!q) return [];
  const rang = (o: OptionCollege) => {
    const nom = normaliserRecherche(o.nom);
    if (nom.startsWith(q)) return 0;
    if (nom.split(/[\s\-'’()]+/).some((mot) => mot.startsWith(q))) return 1;
    if (nom.includes(q)) return 2;
    if (o.precision && normaliserRecherche(o.precision).includes(q)) return 3;
    return -1;
  };
  return options
    .map((o) => ({ o, r: rang(o) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r || a.o.nom.localeCompare(b.o.nom, 'fr'))
    .map((x) => x.o);
}

/**
 * Barre de recherche de collège (28/09/2026) : remplace les listes
 * déroulantes « Choisir un collège… ». Les collèges correspondants
 * apparaissent dès la première lettre ; clic, ou flèches + Entrée, pour
 * choisir. Clavier : ↑ ↓ Entrée Échap.
 *
 * `selection` (choix unique) : le collège retenu s'affiche dans le champ et
 * une croix permet de le retirer. Sans `selection` (choix multiple), le champ
 * se vide après chaque choix.
 */
export function CollegeSearch({
  options,
  onChoisir,
  selection = null,
  onEffacer,
  exclure,
  placeholder = 'Rechercher un collège…',
  disabled = false,
}: {
  options: OptionCollege[];
  onChoisir: (option: OptionCollege) => void;
  selection?: OptionCollege | null;
  onEffacer?: () => void;
  /** Identifiants à ne pas proposer (déjà choisis). */
  exclure?: ReadonlySet<string>;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [saisie, setSaisie] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const listeId = useId();
  const champ = useRef<HTMLInputElement>(null);

  const resultats = useMemo(
    () => filtrerColleges(options, saisie).filter((o) => !exclure?.has(o.id)),
    [options, saisie, exclure],
  );
  const montrer = ouvert && saisie.trim().length > 0;

  const choisir = (o: OptionCollege) => {
    onChoisir(o);
    setSaisie('');
    setActif(0);
    setOuvert(false);
    if (!selection) champ.current?.focus();
  };

  // Choix unique déjà fait, champ non en cours d'édition : on montre le choix.
  const affiche = selection && !ouvert ? selection.nom : saisie;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
        <input
          ref={champ}
          type="text"
          role="combobox"
          aria-expanded={montrer}
          aria-controls={listeId}
          aria-autocomplete="list"
          aria-activedescendant={montrer && resultats[actif] ? `${listeId}-${actif}` : undefined}
          autoComplete="off"
          disabled={disabled}
          value={affiche}
          placeholder={selection ? selection.nom : placeholder}
          onFocus={() => { setOuvert(true); if (selection) setSaisie(''); }}
          onBlur={() => { setOuvert(false); setSaisie(''); }}
          onChange={(e) => { setSaisie(e.target.value); setActif(0); setOuvert(true); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActif((a) => Math.min(a + 1, resultats.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter') {
              // Jamais de soumission du formulaire parent depuis la recherche.
              e.preventDefault();
              if (montrer && resultats[actif]) choisir(resultats[actif]);
            } else if (e.key === 'Escape') { setSaisie(''); setOuvert(false); champ.current?.blur(); }
          }}
          className={`w-full rounded-lg border border-(--color-border) bg-(--color-surface) py-2 pl-9 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] ${selection && onEffacer ? 'pr-9' : 'pr-3'} ${selection && !ouvert ? 'font-semibold text-(--color-ink)' : ''}`}
        />
        {selection && onEffacer && !disabled && (
          <button
            type="button"
            aria-label="Retirer le collège choisi"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onEffacer(); setSaisie(''); champ.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {montrer && (
        <ul
          id={listeId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-(--color-border) bg-(--color-surface) py-1 shadow-(--shadow-lifted)"
        >
          {resultats.length === 0 ? (
            <li className="px-3 py-2 text-sm text-(--color-ink-muted)">Aucun collège ne correspond à « {saisie.trim()} ».</li>
          ) : (
            resultats.map((o, i) => (
              <li
                key={o.id}
                id={`${listeId}-${i}`}
                role="option"
                aria-selected={i === actif}
                // mousedown : le choix passe AVANT la perte de focus du champ.
                onMouseDown={(e) => { e.preventDefault(); choisir(o); }}
                onMouseEnter={() => setActif(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-sm ${i === actif ? 'bg-[#F3EAFF] text-[#5B21B6]' : 'text-(--color-ink)'}`}
              >
                <span className="truncate">{o.nom}</span>
                {o.precision && <span className="shrink-0 text-[11px] text-(--color-ink-muted)">{o.precision}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
