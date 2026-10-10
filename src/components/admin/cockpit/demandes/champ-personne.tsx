'use client';

import * as React from 'react';
import { Loader2, Search, UserRound, X } from 'lucide-react';
import { rechercherPersonnes, type Personne } from '@/app/admin/cockpit/actions-divers';
import { Avatar, champ } from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';

/**
 * Identité d'un client / candidat : recherche dans la base Major ECN (élèves)
 * ou saisie libre (prospect, parent, personne extérieure). Choisir un
 * résultat lie le dossier au compte ; retaper le nom le délie.
 */
export function ChampPersonne({
  id, valeurId, valeurLabel, onChange, placeholder = 'Nom, prénom ou e-mail…', requis,
}: {
  id?: string;
  valeurId: string | null;
  valeurLabel: string;
  onChange: (v: { id: string | null; label: string; email?: string | null }) => void;
  placeholder?: string;
  requis?: boolean;
}) {
  const [resultats, setResultats] = React.useState<Personne[]>([]);
  const [ouvert, setOuvert] = React.useState(false);
  const [enCours, setEnCours] = React.useState(false);
  const [actif, setActif] = React.useState(0);
  const minuterie = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const requete = React.useRef(0);
  const listeId = React.useId();

  React.useEffect(() => () => { if (minuterie.current) clearTimeout(minuterie.current); }, []);

  function chercher(q: string) {
    if (minuterie.current) clearTimeout(minuterie.current);
    if (q.trim().length < 2) {
      setResultats([]);
      setOuvert(false);
      return;
    }
    minuterie.current = setTimeout(async () => {
      const n = ++requete.current;
      setEnCours(true);
      try {
        const r = await rechercherPersonnes(q, 'eleve');
        if (n !== requete.current) return;
        setResultats(r);
        setActif(0);
        setOuvert(true);
      } catch {
        if (n === requete.current) setResultats([]);
      } finally {
        if (n === requete.current) setEnCours(false);
      }
    }, 250);
  }

  function choisir(p: Personne) {
    onChange({ id: p.id, label: p.nom, email: p.email });
    setOuvert(false);
    setResultats([]);
  }

  return (
    <div className="relative">
      {valeurId ? (
        <div className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-white px-2.5 py-1.5">
          <Avatar nom={valeurLabel || '?'} taille={26} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-(--color-ink)">{valeurLabel}</span>
            <span className="block text-[11.5px] text-[#1F7A3E]">Compte Major ECN lié</span>
          </span>
          <button
            type="button"
            onClick={() => onChange({ id: null, label: valeurLabel })}
            className="rounded-md p-1 text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink) focus-ring"
            aria-label="Délier le compte (saisie libre)"
            title="Délier le compte (saisie libre)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            id={id}
            className={cn(champ, 'pl-9 pr-9')}
            value={valeurLabel}
            required={requis}
            autoComplete="off"
            role="combobox"
            aria-expanded={ouvert}
            aria-controls={listeId}
            aria-autocomplete="list"
            placeholder={placeholder}
            onChange={(e) => {
              onChange({ id: null, label: e.target.value });
              chercher(e.target.value);
            }}
            onFocus={() => { if (resultats.length > 0) setOuvert(true); }}
            onBlur={() => setTimeout(() => setOuvert(false), 150)}
            onKeyDown={(e) => {
              if (!ouvert || resultats.length === 0) return;
              if (e.key === 'ArrowDown') { e.preventDefault(); setActif((a) => Math.min(resultats.length - 1, a + 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => Math.max(0, a - 1)); }
              else if (e.key === 'Enter') { e.preventDefault(); choisir(resultats[actif]); }
              else if (e.key === 'Escape') setOuvert(false);
            }}
          />
          {enCours && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-(--color-ink-muted)" />}
        </div>
      )}
      {!valeurId && ouvert && (
        <ul
          id={listeId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-64 overflow-y-auto rounded-xl border border-(--color-border) bg-white p-1 shadow-lg"
        >
          {resultats.length === 0 ? (
            <li className="px-3 py-2 text-[13px] text-(--color-ink-muted)">
              Aucun élève trouvé — le nom saisi sera conservé tel quel.
            </li>
          ) : (
            resultats.map((p, i) => (
              <li key={p.id} role="option" aria-selected={i === actif}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choisir(p)}
                  className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left', i === actif ? 'bg-(--color-primary-soft)' : 'hover:bg-(--color-surface-soft)')}
                >
                  <Avatar nom={p.nom} taille={26} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium text-(--color-ink)">{p.nom}</span>
                    {p.email && <span className="block truncate text-[11.5px] text-(--color-ink-soft)">{p.email}</span>}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {!valeurId && (
        <p className="mt-1 flex items-center gap-1 text-[11.5px] text-(--color-ink-muted)">
          <UserRound className="h-3 w-3" /> Recherche dans la base Major ECN, ou saisie libre.
        </p>
      )}
    </div>
  );
}
