'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronRight, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import type { Perimetre } from '@/lib/auth/collaborateurs';
import { normaliserRecherche } from '@/lib/equipe/selection-colleges';

type Item = { id: string; titre: string; sousCollege: string | null };

/**
 * Accès dans chaque spécialité retenue : le collège entier (y compris les
 * items créés plus tard), ou seulement les items cochés — le reste du collège
 * reste fermé. Enregistré dans `perimetre.items` ; le serveur en dérive la
 * liste `cours` qu'appliquent la RLS et les gardes.
 */
export function AccesItems({
  selection, nom, perimetre, onChange,
}: {
  selection: string[];
  nom: (id: string) => string;
  perimetre: Perimetre;
  onChange: (p: Perimetre) => void;
}) {
  const [catalogue, setCatalogue] = useState<Record<string, Item[] | 'chargement' | { erreur: string }>>({});
  const [ouvert, setOuvert] = useState<string | null>(null);

  const charger = async (college: string) => {
    if (Array.isArray(catalogue[college])) return;
    setCatalogue((c) => ({ ...c, [college]: 'chargement' }));
    try {
      const res = await fetchAvecJetonFrais('/api/admin/equipe/items', { college });
      const j = (await res.json().catch(() => ({}))) as { items?: Item[]; error?: string };
      setCatalogue((c) => ({ ...c, [college]: res.ok && j.items ? j.items : { erreur: j.error ?? 'Chargement impossible.' } }));
    } catch {
      setCatalogue((c) => ({ ...c, [college]: { erreur: 'Connexion impossible.' } }));
    }
  };

  const setItems = (college: string, ids: string[] | null) => {
    const items = { ...(perimetre.items ?? {}) };
    if (ids === null) delete items[college];
    else items[college] = ids;
    onChange({ ...perimetre, items });
  };

  const choisirMode = (college: string, limite: boolean) => {
    if (!limite) { setItems(college, null); if (ouvert === college) setOuvert(null); return; }
    setItems(college, perimetre.items?.[college] ?? []);
    setOuvert(college);
    void charger(college);
  };

  if (selection.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-(--color-border)">
      <div className="border-b border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
        <span className="text-xs font-semibold text-(--color-ink)">Accès dans chaque spécialité</span>
        <p className="text-[11px] text-(--color-ink-muted)">
          Le collège entier, ou seulement certains items : le reste du collège reste alors fermé.
        </p>
      </div>
      <ul className="divide-y divide-(--color-border)">
        {selection.map((college) => {
          const choisis = perimetre.items?.[college];
          const limite = !!choisis;
          const deplie = limite && ouvert === college;
          return (
            <li key={college} className="bg-(--color-surface)">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => { if (!limite) return; setOuvert(deplie ? null : college); if (!deplie) void charger(college); }}
                  className={cn('flex min-w-0 items-center gap-1.5 text-left text-sm font-medium text-(--color-ink)', !limite && 'cursor-default')}
                  aria-expanded={limite ? deplie : undefined}
                >
                  {limite
                    ? <ChevronRight className={cn('h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform', deplie && 'rotate-90')} />
                    : <span className="w-4" aria-hidden />}
                  <span className="truncate">{nom(college)}</span>
                  {limite && (
                    <span className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      choisis.length === 0 ? 'bg-[#FEF3E2] text-[#B26A00]' : 'bg-(--color-primary-soft) text-(--color-primary-deep)',
                    )}>
                      {choisis.length} item{choisis.length > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
                <span className="inline-flex rounded-lg bg-(--color-surface-soft) p-0.5" role="radiogroup" aria-label={`Accès à ${nom(college)}`}>
                  {([{ v: false, label: 'Collège entier' }, { v: true, label: 'Items choisis' }] as const).map(({ v, label }) => (
                    <button
                      key={label}
                      type="button"
                      role="radio"
                      aria-checked={limite === v}
                      onClick={() => choisirMode(college, v)}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors',
                        limite === v ? 'bg-white text-(--color-ink) shadow-sm' : 'text-(--color-ink-soft) hover:text-(--color-ink)',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </span>
              </div>
              {limite && choisis.length === 0 && !deplie && (
                <p className="flex items-center gap-1.5 px-3 pb-2 text-[11px] text-[#B26A00]">
                  <AlertTriangle className="h-3 w-3" /> Aucun item coché : cette spécialité ne serait pas ouverte.
                </p>
              )}
              {deplie && (
                <ListeItems
                  etat={catalogue[college]}
                  choisis={choisis}
                  onChange={(ids) => setItems(college, ids)}
                  reessayer={() => { setCatalogue((c) => { const n = { ...c }; delete n[college]; return n; }); void charger(college); }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ListeItems({
  etat, choisis, onChange, reessayer,
}: {
  etat: Item[] | 'chargement' | { erreur: string } | undefined;
  choisis: string[];
  onChange: (ids: string[]) => void;
  reessayer: () => void;
}) {
  const [recherche, setRecherche] = useState('');
  const items = useMemo(() => (Array.isArray(etat) ? etat : []), [etat]);
  const visibles = useMemo(() => {
    const mots = normaliserRecherche(recherche).split(/\s+/).filter(Boolean);
    if (mots.length === 0) return items;
    return items.filter((it) => {
      const texte = normaliserRecherche(`${it.titre} ${it.sousCollege ?? ''}`);
      return mots.every((m) => texte.includes(m));
    });
  }, [items, recherche]);
  const coches = new Set(choisis);
  const tousVisiblesCoches = visibles.length > 0 && visibles.every((it) => coches.has(it.id));

  if (!etat || etat === 'chargement') {
    return (
      <p className="flex items-center gap-2 border-t border-(--color-border) bg-(--color-surface-soft)/60 px-4 py-3 text-xs text-(--color-ink-muted)">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Chargement des items…
      </p>
    );
  }
  if (!Array.isArray(etat)) {
    return (
      <p className="flex items-center gap-2 border-t border-(--color-border) bg-(--color-surface-soft)/60 px-4 py-3 text-xs text-(--color-danger)">
        {etat.erreur}
        <button type="button" onClick={reessayer} className="font-semibold underline">Réessayer</button>
      </p>
    );
  }

  const basculer = (id: string) => onChange(coches.has(id) ? choisis.filter((x) => x !== id) : [...choisis, id]);
  const basculerVisibles = () => {
    const ids = new Set(visibles.map((it) => it.id));
    onChange(tousVisiblesCoches ? choisis.filter((x) => !ids.has(x)) : Array.from(new Set([...choisis, ...ids])));
  };

  return (
    <div className="border-t border-(--color-border) bg-(--color-surface-soft)/60 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            type="text"
            role="searchbox"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={`Rechercher parmi ${items.length} items`}
            aria-label="Rechercher un item"
            className="h-9 w-full rounded-lg border border-(--color-border) bg-(--color-surface) pl-8 pr-2 text-xs text-(--color-ink) outline-none focus:border-(--color-primary)"
          />
        </div>
        {visibles.length > 0 && (
          <button type="button" onClick={basculerVisibles} className="text-[11px] font-semibold text-(--color-primary-deep) hover:underline">
            {tousVisiblesCoches ? 'Décocher' : 'Cocher'} {recherche ? 'les résultats' : 'tout'}
          </button>
        )}
      </div>
      <ul className="mt-2 max-h-[260px] space-y-0.5 overflow-y-auto">
        {visibles.length === 0 && (
          <li className="px-1 py-2 text-xs text-(--color-ink-muted)">
            {items.length === 0 ? 'Ce collège n’a encore aucun item.' : 'Aucun item ne correspond.'}
          </li>
        )}
        {visibles.map((it) => (
          <li key={it.id}>
            <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 text-[13px] text-(--color-ink) hover:bg-(--color-surface)">
              <input
                type="checkbox"
                checked={coches.has(it.id)}
                onChange={() => basculer(it.id)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-(--color-border) accent-(--color-primary)"
              />
              <span className="min-w-0">
                {it.sousCollege && <span className="text-(--color-ink-muted)">{it.sousCollege} · </span>}
                {it.titre}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
