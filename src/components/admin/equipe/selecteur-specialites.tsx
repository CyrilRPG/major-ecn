'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ChevronRight, Globe2, ListChecks, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FORMULES, FORMULE_LABEL, type Formule, type Perimetre } from '@/lib/auth/collaborateurs';
import {
  basculerColonneFormule, basculerCollege, basculerTous, etatParent, filtrerArbre, formulesDeLigne,
  normaliserRecherche, sousCollegesCouverts, type CollegeChoix,
} from '@/lib/equipe/selection-colleges';
import { Pastille } from './controles';

/**
 * Périmètre d'un collaborateur : « certaines spécialités » (recherche,
 * sélection en pastilles, arbre collège → sous-collèges) ou « toutes », puis
 * les formules autorisées dans chaque spécialité retenue.
 */
export function SelecteurSpecialites({
  colleges, perimetre, onChange,
}: { colleges: CollegeChoix[]; perimetre: Perimetre; onChange: (p: Perimetre) => void }) {
  const [recherche, setRecherche] = useState('');
  const toutes = perimetre.specialites === 'toutes';
  const selection = useMemo(() => (perimetre.specialites === 'toutes' ? [] : perimetre.specialites), [perimetre.specialites]);
  const lignes = useMemo(() => filtrerArbre(colleges, recherche), [colleges, recherche]);
  // Parents dépliés : ceux dont une partie seulement est cochée, au départ.
  const [deplies, setDeplies] = useState<Set<string>>(() => new Set(colleges.filter((c) => etatParent(c, selection) === 'partiel').map((c) => c.id)));
  const basculerDeplie = (id: string) => setDeplies((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const noms = useMemo(() => {
    const m = new Map<string, { nom: string; parent: string | null; estParent: boolean }>();
    for (const c of colleges) {
      m.set(c.id, { nom: c.nom, parent: null, estParent: !!c.enfants?.length });
      for (const e of c.enfants ?? []) m.set(e.id, { nom: e.nom, parent: c.nom, estParent: false });
    }
    return m;
  }, [colleges]);

  const setSelection = (s: string[]) => onChange({ ...perimetre, specialites: s });
  const basculer = (id: string) => setSelection(basculerCollege(selection, id, colleges));
  // Identifiants visibles dans le résultat de recherche (collège entier, ou sous-collèges trouvés).
  const visibles = useMemo(() => lignes.flatMap((l) => (
    l.deplie ? l.enfants.map((e) => e.id) : [l.college.id]
  )), [lignes]);
  const tousVisiblesCoches = visibles.length > 0 && visibles.every((id) => {
    const parent = colleges.find((c) => c.enfants?.some((e) => e.id === id));
    return selection.includes(id) || (!!parent && selection.includes(parent.id));
  });

  // Formules : une ligne par spécialité retenue, ou la ligne « toutes ».
  const lignesFormules = toutes
    ? [{ cle: '*', nom: 'Toutes les spécialités' }]
    : selection.map((id) => ({ cle: id, nom: libelle(noms.get(id), id) }));
  const cles = lignesFormules.map((l) => l.cle);
  const basculerFormule = (cle: string, f: Formule) => {
    const actuelles = formulesDeLigne(perimetre, cle);
    onChange({ ...perimetre, formules: { ...perimetre.formules, [cle]: actuelles.includes(f) ? actuelles.filter((x) => x !== f) : [...actuelles, f] } });
  };

  return (
    <div className="space-y-5">
      {/* Certaines / toutes */}
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Étendue du périmètre">
        {([
          { v: false, titre: 'Certaines spécialités', aide: 'La personne ne voit que les collèges cochés.', Icone: ListChecks },
          { v: true, titre: 'Toutes les spécialités', aide: 'Y compris celles créées plus tard.', Icone: Globe2 },
        ] as const).map(({ v, titre, aide, Icone }) => (
          <button
            key={titre}
            type="button"
            role="radio"
            aria-checked={toutes === v}
            onClick={() => onChange({ ...perimetre, specialites: v ? 'toutes' : (toutes ? [] : selection) })}
            className={cn(
              'flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors focus-ring',
              toutes === v ? 'border-(--color-primary) bg-(--color-primary-soft)/60' : 'border-(--color-border) bg-(--color-surface) hover:border-(--color-primary)/40',
            )}
          >
            <Icone className={cn('mt-0.5 h-4 w-4 shrink-0', toutes === v ? 'text-(--color-primary)' : 'text-(--color-ink-muted)')} />
            <span>
              <span className="block text-sm font-semibold text-(--color-ink)">{titre}</span>
              <span className="block text-xs text-(--color-ink-muted)">{aide}</span>
            </span>
          </button>
        ))}
      </div>

      {toutes ? (
        <p className="flex items-start gap-2 rounded-xl bg-[#FEF3E2] px-3 py-2 text-xs text-[#B26A00]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          La personne verra tous les collèges, comme un administrateur, dans chacun de ses modules. À réserver à un responsable qui intervient réellement partout.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
            <input
              type="text"
              role="searchbox"
              enterKeyHint="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un collège ou un sous-collège (ex. cardio, pédiatrie…)"
              aria-label="Rechercher un collège"
              className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) pl-9 pr-9 text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-muted) focus:border-(--color-primary)"
            />
            {recherche && (
              <button type="button" onClick={() => setRecherche('')} aria-label="Effacer la recherche" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink)">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sélection */}
          <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) p-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
                {selection.length === 0 ? 'Aucune spécialité cochée' : `${selection.length} sélectionnée${selection.length > 1 ? 's' : ''}`}
              </span>
              {selection.length > 0 && (
                <button type="button" onClick={() => setSelection([])} className="text-[11px] font-semibold text-(--color-ink-soft) hover:text-(--color-primary)">Tout effacer</button>
              )}
            </div>
            {selection.length === 0 ? (
              <p className="px-0.5 text-xs text-(--color-ink-muted)">Cochez ci-dessous les spécialités sur lesquelles la personne intervient.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selection.map((id) => {
                  const n = noms.get(id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full bg-(--color-surface) py-1 pl-2.5 pr-1 text-xs font-semibold text-(--color-ink) shadow-sm ring-1 ring-(--color-border)">
                      {n?.parent && <span className="font-normal text-(--color-ink-muted)">{n.parent} ·</span>}
                      {n?.nom ?? id}
                      {n?.estParent && <span className="font-normal text-(--color-ink-muted)">(tout)</span>}
                      <button type="button" onClick={() => basculer(id)} aria-label={`Retirer ${n?.nom ?? id}`} className="rounded-full p-0.5 text-(--color-ink-muted) hover:bg-(--color-primary-soft) hover:text-(--color-primary)">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Arbre */}
          <div className="overflow-hidden rounded-xl border border-(--color-border)">
            {recherche && (
              <div className="flex items-center justify-between gap-2 border-b border-(--color-border) bg-(--color-surface-soft) px-3 py-1.5 text-xs text-(--color-ink-soft)">
                <span>{visibles.length === 0 ? 'Aucun collège ne correspond.' : `${visibles.length} résultat${visibles.length > 1 ? 's' : ''}`}</span>
                {visibles.length > 0 && (
                  <button type="button" onClick={() => setSelection(basculerTous(selection, visibles, !tousVisiblesCoches, colleges))} className="font-semibold text-(--color-primary-deep) hover:underline">
                    {tousVisiblesCoches ? 'Décocher les résultats' : 'Cocher les résultats'}
                  </button>
                )}
              </div>
            )}
            <ul className="max-h-[300px] divide-y divide-(--color-border) overflow-y-auto">
              {lignes.map(({ college: c, enfants, deplie: forceDeplie }) => {
                const aEnfants = !!c.enfants?.length;
                const etat = aEnfants ? etatParent(c, selection) : (selection.includes(c.id) ? 'coche' : 'vide');
                const ouvert = aEnfants && (forceDeplie || deplies.has(c.id));
                return (
                  <li key={c.id} className="bg-(--color-surface)">
                    <div className="flex items-center gap-2 px-3 py-2 hover:bg-(--color-surface-soft)">
                      {aEnfants ? (
                        <button type="button" onClick={() => basculerDeplie(c.id)} aria-label={ouvert ? `Replier ${c.nom}` : `Déplier ${c.nom}`} aria-expanded={ouvert} className="rounded-md p-0.5 text-(--color-ink-muted) hover:bg-(--color-border)/60 hover:text-(--color-ink)">
                          <ChevronRight className={cn('h-4 w-4 transition-transform', ouvert && 'rotate-90')} />
                        </button>
                      ) : <span className="w-5" aria-hidden />}
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-sm text-(--color-ink)">
                        <CaseTriple etat={etat} onChange={() => basculer(c.id)} />
                        <span className="truncate font-medium"><Surligne texte={c.nom} recherche={recherche} /></span>
                      </label>
                      {aEnfants && (
                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', etat === 'vide' ? 'bg-(--color-surface-soft) text-(--color-ink-muted)' : 'bg-(--color-primary-soft) text-(--color-primary-deep)')}>
                          {sousCollegesCouverts(c, selection)}/{c.enfants!.length} sous-collèges
                        </span>
                      )}
                    </div>
                    {ouvert && (
                      <div className="grid gap-x-4 gap-y-1 border-t border-(--color-border) bg-(--color-surface-soft)/60 py-2 pl-12 pr-3 sm:grid-cols-2">
                        {enfants.map((e) => (
                          <label key={e.id} className="flex cursor-pointer items-center gap-2 rounded-md py-0.5 text-[13px] text-(--color-ink)">
                            <CaseTriple etat={selection.includes(c.id) || selection.includes(e.id) ? 'coche' : 'vide'} onChange={() => basculer(e.id)} />
                            <span className="truncate"><Surligne texte={e.nom} recherche={recherche} /></span>
                          </label>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Formules */}
      {lignesFormules.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-(--color-border)">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
            <span className="text-xs font-semibold text-(--color-ink)">Formules autorisées</span>
            <span className="flex flex-wrap gap-1.5">
              {FORMULES.map((f) => (
                <Pastille
                  key={f}
                  taille="sm"
                  coche={cles.every((k) => formulesDeLigne(perimetre, k).includes(f))}
                  onChange={() => onChange(basculerColonneFormule(perimetre, cles, f))}
                  title={`${FORMULE_LABEL[f]} : partout`}
                >
                  {FORMULE_LABEL[f]} partout
                </Pastille>
              ))}
            </span>
          </div>
          <ul className="max-h-[220px] divide-y divide-(--color-border) overflow-y-auto">
            {lignesFormules.map((l) => (
              <li key={l.cle} className="flex flex-wrap items-center justify-between gap-2 bg-(--color-surface) px-3 py-2">
                <span className="min-w-0 truncate text-sm font-medium text-(--color-ink)">{l.nom}</span>
                <span className="flex flex-wrap gap-1.5">
                  {FORMULES.map((f) => (
                    <Pastille key={f} taille="sm" coche={formulesDeLigne(perimetre, l.cle).includes(f)} onChange={() => basculerFormule(l.cle, f)} title={`${l.nom} — ${FORMULE_LABEL[f]}`}>
                      {FORMULE_LABEL[f]}
                    </Pastille>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function libelle(n: { nom: string; parent: string | null; estParent: boolean } | undefined, id: string): string {
  if (!n) return id;
  if (n.parent) return `${n.parent} · ${n.nom}`;
  return n.estParent ? `${n.nom} (tout)` : n.nom;
}

/** Case à cocher à trois états (parent partiellement couvert). */
function CaseTriple({ etat, onChange }: { etat: 'coche' | 'partiel' | 'vide'; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = etat === 'partiel'; }, [etat]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={etat === 'coche'}
      aria-checked={etat === 'partiel' ? 'mixed' : etat === 'coche'}
      onChange={onChange}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-(--color-border) accent-(--color-primary)"
    />
  );
}

/** Met en gras la partie du nom qui correspond à la recherche (sans accents). */
function Surligne({ texte, recherche }: { texte: string; recherche: string }) {
  const mot = normaliserRecherche(recherche).split(/\s+/).filter(Boolean)[0];
  if (!mot) return <>{texte}</>;
  const i = normaliserRecherche(texte).indexOf(mot);
  // La normalisation ne change pas la longueur des lettres latines usuelles.
  if (i < 0 || normaliserRecherche(texte).length !== texte.length) return <>{texte}</>;
  return <>{texte.slice(0, i)}<mark className="rounded bg-[#FFF3C4] px-0.5 text-inherit">{texte.slice(i, i + mot.length)}</mark>{texte.slice(i + mot.length)}</>;
}
