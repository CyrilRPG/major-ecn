'use client';

import * as React from 'react';
import { Layers, PhoneOutgoing, Search, X } from 'lucide-react';
import { rattacherReclamations } from '@/app/admin/cockpit/actions-dossiers';
import {
  AMELIORATION_OUVERTE, CATEGORIES_RECLAMATION, CATEGORIE_RECLAMATION_LABEL, POIDS_PRIORITE, PRIORITES, PRIORITE_LABEL,
  RECLAMATION_OUVERTE, STATUTS_RECLAMATION, STATUT_RECLAMATION_LABEL, TYPES_PROBLEME, TYPE_PROBLEME_LABEL, type Priorite,
} from '@/lib/cockpit/regles';
import {
  Avatar, Bouton, Carte, Etiquette, PastillePriorite, PastilleStatut, Toast, useMessage, Vide, champ, Libelle,
} from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';
import { dateCourte, Fenetre, majUrl, numero3, selectFiltre } from '../demandes/outils';
import { FormulaireAmelioration } from './formulaire-amelioration';
import type { AmeliorationLigne, ContexteDossiers, ReclamationLigne } from './vue-reclamations';

export const TON_CATEGORIE: Record<string, 'bleu' | 'violet' | 'orange' | 'bordeaux' | 'vert' | 'gris'> = {
  fonctionnalite: 'bleu', contenu: 'violet', pedagogie: 'vert', technique: 'orange', service: 'bordeaux', facturation: 'bordeaux', autre: 'gris',
};

/** Tableau des réclamations clients (cartes sur mobile), filtres et regroupement en amélioration. */
export function ListeReclamations({
  reclamations, ameliorations, noms, membres, moiId, estAdmin, filtreRecontacter,
}: ContexteDossiers & { filtreRecontacter: boolean }) {
  const [statut, setStatut] = React.useState('ouvertes');
  const [categorie, setCategorie] = React.useState('');
  const [typeProbleme, setTypeProbleme] = React.useState('');
  const [priorite, setPriorite] = React.useState('');
  const [aMoi, setAMoi] = React.useState(false);
  const [nonRegroupees, setNonRegroupees] = React.useState(false);
  const [tri, setTri] = React.useState<'recentes' | 'priorite'>('recentes');
  const [recherche, setRecherche] = React.useState('');
  const [selection, setSelection] = React.useState<Set<string>>(() => new Set());
  const [regrouper, setRegrouper] = React.useState(false);
  const [message, setMessage] = useMessage();

  const numeros = new Map(ameliorations.map((a) => [a.id, a.numero]));
  const terme = recherche.trim().toLowerCase();
  const filtrees = reclamations
    .filter((r) => (filtreRecontacter ? r.a_recontacter : true))
    .filter((r) => (filtreRecontacter || statut === 'toutes' ? true : statut === 'ouvertes' ? RECLAMATION_OUVERTE(r.statut) : r.statut === statut))
    .filter((r) => !categorie || r.categorie === categorie)
    .filter((r) => !typeProbleme || r.type_probleme === typeProbleme)
    .filter((r) => !priorite || r.priorite === priorite)
    .filter((r) => !aMoi || r.assignee_id === moiId)
    .filter((r) => !nonRegroupees || !r.amelioration_id)
    .filter((r) => !terme || [r.candidat_label, r.sujet, r.description, r.specialite].some((s) => s && s.toLowerCase().includes(terme)))
    .sort((a, b) => {
      if (tri === 'priorite') {
        const pa = POIDS_PRIORITE[a.priorite as Priorite] ?? 2;
        const pb = POIDS_PRIORITE[b.priorite as Priorite] ?? 2;
        if (pa !== pb) return pa - pb;
      }
      return b.created_at.localeCompare(a.created_at);
    });

  const selectionVisible = filtrees.filter((r) => selection.has(r.id));
  const toutCoche = filtrees.length > 0 && selectionVisible.length === filtrees.length;

  function basculer(id: string) {
    setSelection((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function basculerTout() {
    setSelection(toutCoche ? new Set() : new Set(filtrees.map((r) => r.id)));
  }

  const ouvrir = (id: string) => majUrl({ a: null, r: id });

  return (
    <>
      <Carte>
        <div className="flex flex-wrap items-center gap-2 border-b border-(--color-border) px-4 py-3 sm:px-5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
            <input
              type="search"
              className={cn(champ, 'h-8 py-1 pl-9 text-[13px]')}
              placeholder="Candidat, sujet, spécialité…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              aria-label="Rechercher une réclamation"
            />
          </div>
          <select className={selectFiltre} value={statut} onChange={(e) => setStatut(e.target.value)} aria-label="Statut" disabled={filtreRecontacter}>
            <option value="ouvertes">Ouvertes</option>
            <option value="toutes">Tous les statuts</option>
            {STATUTS_RECLAMATION.map((s) => <option key={s} value={s}>{STATUT_RECLAMATION_LABEL[s]}</option>)}
          </select>
          <select className={selectFiltre} value={categorie} onChange={(e) => setCategorie(e.target.value)} aria-label="Catégorie">
            <option value="">Toutes catégories</option>
            {CATEGORIES_RECLAMATION.map((c) => <option key={c} value={c}>{CATEGORIE_RECLAMATION_LABEL[c]}</option>)}
          </select>
          <select className={selectFiltre} value={typeProbleme} onChange={(e) => setTypeProbleme(e.target.value)} aria-label="Nature du problème">
            <option value="">Toutes natures</option>
            {TYPES_PROBLEME.map((t) => <option key={t} value={t}>{TYPE_PROBLEME_LABEL[t]}</option>)}
          </select>
          <select className={selectFiltre} value={priorite} onChange={(e) => setPriorite(e.target.value)} aria-label="Priorité">
            <option value="">Toutes priorités</option>
            {PRIORITES.map((p) => <option key={p} value={p}>{PRIORITE_LABEL[p]}</option>)}
          </select>
          <select className={selectFiltre} value={tri} onChange={(e) => setTri(e.target.value as 'recentes' | 'priorite')} aria-label="Tri">
            <option value="recentes">Plus récentes</option>
            <option value="priorite">Par priorité</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1 px-4 py-2 text-[13px] text-(--color-ink-soft) sm:px-5">
          <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-(--color-surface-soft)">
            <input type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={filtreRecontacter} onChange={(e) => majUrl({ filtre: e.target.checked ? 'recontacter' : null })} />
            À recontacter
          </label>
          <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-(--color-surface-soft)">
            <input type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={aMoi} onChange={(e) => setAMoi(e.target.checked)} />
            Assignées à moi
          </label>
          <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-(--color-surface-soft)">
            <input type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={nonRegroupees} onChange={(e) => setNonRegroupees(e.target.checked)} />
            Non regroupées
          </label>
          <span className="ml-auto text-[12px] text-(--color-ink-muted)">{filtrees.length} réclamation{filtrees.length > 1 ? 's' : ''}</span>
        </div>

        {selection.size > 0 && (
          <div className="sticky top-0 z-10 mx-3 mb-2 flex flex-wrap items-center gap-2 rounded-xl bg-(--color-ink) px-3 py-2 text-[13px] text-white shadow-lg sm:mx-4">
            <span className="font-medium">{selection.size} sélectionnée{selection.size > 1 ? 's' : ''}</span>
            <Bouton type="button" taille="xs" className="bg-white text-(--color-primary) hover:bg-(--color-primary-soft)" onClick={() => setRegrouper(true)}>
              <Layers /> Regrouper dans une amélioration
            </Bouton>
            <button type="button" onClick={() => setSelection(new Set())} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-white/80 hover:bg-white/10 focus-ring">
              <X className="h-3.5 w-3.5" /> Désélectionner
            </button>
          </div>
        )}

        {filtrees.length === 0 ? (
          <Vide>{reclamations.length === 0 ? 'Aucune réclamation enregistrée pour le moment.' : 'Aucune réclamation ne correspond à ces filtres.'}</Vide>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-y border-(--color-border) bg-(--color-surface-soft) text-[11.5px] uppercase tracking-wide text-(--color-ink-muted)">
                    <th className="w-10 py-2 pl-5 pr-1">
                      <input type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={toutCoche} onChange={basculerTout} aria-label="Tout sélectionner" />
                    </th>
                    <th className="px-3 py-2 font-medium">Client</th>
                    <th className="px-3 py-2 font-medium">Sujet</th>
                    <th className="px-3 py-2 font-medium">Catégorie</th>
                    <th className="px-3 py-2 font-medium">Statut</th>
                    <th className="px-3 py-2 pr-5 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrees.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => ouvrir(r.id)}
                      className={cn('cursor-pointer border-b border-(--color-border) last:border-0 hover:bg-(--color-surface-soft)', selection.has(r.id) && 'bg-(--color-primary-soft)/40')}
                    >
                      <td className="py-3 pl-5 pr-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-(--color-primary)"
                          checked={selection.has(r.id)}
                          onChange={() => basculer(r.id)}
                          aria-label={`Sélectionner la réclamation de ${r.candidat_label}`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar nom={r.candidat_label} taille={34} />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); ouvrir(r.id); }}
                              className="block max-w-[200px] truncate text-left font-medium text-(--color-ink) hover:text-(--color-primary) focus-ring"
                            >
                              {r.candidat_label}
                            </button>
                            <span className="block max-w-[200px] truncate text-[12px] text-(--color-ink-muted)">{r.specialite ? `(${r.specialite})` : '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[320px] px-3 py-3">
                        <p className="truncate text-(--color-ink)">{r.sujet}</p>
                        <LigneIndices r={r} numeros={numeros} />
                      </td>
                      <td className="px-3 py-3">
                        <Etiquette ton={TON_CATEGORIE[r.categorie] ?? 'gris'}>{CATEGORIE_RECLAMATION_LABEL[r.categorie] ?? r.categorie}</Etiquette>
                      </td>
                      <td className="px-3 py-3"><PastilleStatut statut={r.statut} /></td>
                      <td className="whitespace-nowrap px-3 py-3 pr-5 text-right text-(--color-ink-soft)">{dateCourte(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="grid gap-2 px-3 pb-3 md:hidden">
              {filtrees.map((r) => (
                <li key={r.id} className={cn('flex gap-2 rounded-xl border bg-white p-3', selection.has(r.id) ? 'border-(--color-primary)/40 bg-(--color-primary-soft)/40' : 'border-(--color-border)')}>
                  <input
                    type="checkbox"
                    className="mt-2 h-4 w-4 shrink-0 accent-(--color-primary)"
                    checked={selection.has(r.id)}
                    onChange={() => basculer(r.id)}
                    aria-label={`Sélectionner la réclamation de ${r.candidat_label}`}
                  />
                  <button type="button" onClick={() => ouvrir(r.id)} className="min-w-0 flex-1 text-left focus-ring">
                    <div className="flex items-start gap-2.5">
                      <Avatar nom={r.candidat_label} taille={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-(--color-ink)">{r.candidat_label}</span>
                          <PastilleStatut statut={r.statut} className="ml-auto shrink-0" />
                        </div>
                        <p className="text-[12px] text-(--color-ink-muted)">{r.specialite ?? '—'} · {dateCourte(r.created_at)}</p>
                        <p className="mt-1 line-clamp-2 text-[13px] text-(--color-ink)">{r.sujet}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Etiquette ton={TON_CATEGORIE[r.categorie] ?? 'gris'} className="text-[11px]">{CATEGORIE_RECLAMATION_LABEL[r.categorie] ?? r.categorie}</Etiquette>
                          <LigneIndices r={r} numeros={numeros} enLigne />
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Carte>

      <DialogueRegrouper
        ouvert={regrouper}
        onOuvert={setRegrouper}
        ids={[...selection]}
        reclamations={reclamations}
        ameliorations={ameliorations}
        membres={membres}
        estAdmin={estAdmin}
        noms={noms}
        onFini={(ameliorationId, n) => {
          setRegrouper(false);
          setSelection(new Set());
          setMessage(`${n} réclamation${n > 1 ? 's' : ''} rattachée${n > 1 ? 's' : ''}`);
          majUrl({ vue: 'ameliorations', r: null, filtre: null, a: ameliorationId });
        }}
      />
      <Toast message={message} />
    </>
  );
}

function LigneIndices({ r, numeros, enLigne }: { r: ReclamationLigne; numeros: Map<string, number>; enLigne?: boolean }) {
  const elements: React.ReactNode[] = [];
  if (r.priorite === 'urgente' || r.priorite === 'haute') elements.push(<PastillePriorite key="p" priorite={r.priorite} />);
  if (r.amelioration_id && numeros.has(r.amelioration_id)) {
    elements.push(<Etiquette key="a" ton="violet" className="text-[11px]"><Layers className="mr-1 h-3 w-3" />n° {numero3(numeros.get(r.amelioration_id))}</Etiquette>);
  }
  if (r.a_recontacter) {
    elements.push(<Etiquette key="c" ton="vert" className="text-[11px]"><PhoneOutgoing className="mr-1 h-3 w-3" />À recontacter</Etiquette>);
  }
  if (elements.length === 0) return null;
  return enLigne ? <>{elements}</> : <div className="mt-1 flex flex-wrap items-center gap-1">{elements}</div>;
}

function DialogueRegrouper({
  ouvert, onOuvert, ids, reclamations, ameliorations, membres, estAdmin, onFini,
}: {
  ouvert: boolean;
  onOuvert: (o: boolean) => void;
  ids: string[];
  reclamations: ReclamationLigne[];
  ameliorations: AmeliorationLigne[];
  membres: { id: string; nom: string }[];
  estAdmin: boolean;
  noms: Record<string, string>;
  onFini: (ameliorationId: string, n: number) => void;
}) {
  const ouvertes = ameliorations.filter((a) => AMELIORATION_OUVERTE(a.statut)).sort((a, b) => b.numero - a.numero);
  const [mode, setMode] = React.useState<'existante' | 'nouvelle'>(estAdmin ? 'nouvelle' : 'existante');
  const [choix, setChoix] = React.useState('');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  const choisies = reclamations.filter((r) => ids.includes(r.id));
  const candidats = new Set(choisies.map((r) => r.candidat_id ?? r.candidat_label.trim().toLowerCase())).size;
  // Préremplissage : le sujet le plus fréquent devient le titre proposé.
  const frequences = new Map<string, number>();
  for (const r of choisies) frequences.set(r.sujet, (frequences.get(r.sujet) ?? 0) + 1);
  const sujetPrincipal = [...frequences.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const probleme = choisies.map((r) => `• ${r.candidat_label}${r.specialite ? ` (${r.specialite})` : ''} : ${r.sujet}`).join('\n').slice(0, 4000);
  const priorite = choisies.reduce<Priorite>((best, r) => (
    (POIDS_PRIORITE[r.priorite as Priorite] ?? 2) < POIDS_PRIORITE[best] ? (r.priorite as Priorite) : best
  ), 'basse');

  function rattacherExistante() {
    if (!choix) {
      setErreur('Choisissez une amélioration.');
      return;
    }
    setErreur(null);
    startTransition(async () => {
      const r = await rattacherReclamations(ids, choix);
      if (!r.ok) setErreur(r.erreur);
      else onFini(choix, ids.length);
    });
  }

  return (
    <Fenetre
      ouvert={ouvert}
      onOuvert={onOuvert}
      large
      titre="Regrouper dans une amélioration"
      sousTitre={`${ids.length} réclamation${ids.length > 1 ? 's' : ''} · ${candidats} candidat${candidats > 1 ? 's' : ''} distinct${candidats > 1 ? 's' : ''} — chaque dossier individuel est conservé.`}
    >
      {ouvert && (
        <div className="grid gap-4">
          <div className="inline-flex w-fit rounded-lg border border-(--color-border) bg-white p-0.5">
            {estAdmin && (
              <button
                type="button"
                onClick={() => setMode('nouvelle')}
                aria-pressed={mode === 'nouvelle'}
                className={cn('h-8 rounded-md px-3 text-[13px] font-medium focus-ring', mode === 'nouvelle' ? 'bg-(--color-primary) text-white' : 'text-(--color-ink-soft) hover:bg-(--color-primary-soft)')}
              >
                Nouvelle amélioration
              </button>
            )}
            <button
              type="button"
              onClick={() => setMode('existante')}
              aria-pressed={mode === 'existante'}
              className={cn('h-8 rounded-md px-3 text-[13px] font-medium focus-ring', mode === 'existante' ? 'bg-(--color-primary) text-white' : 'text-(--color-ink-soft) hover:bg-(--color-primary-soft)')}
            >
              Amélioration existante
            </button>
          </div>

          {mode === 'nouvelle' && estAdmin ? (
            <FormulaireAmelioration
              membres={membres}
              reclamationIds={ids}
              initial={{ titre: sujetPrincipal.slice(0, 300), probleme, priorite }}
              onAnnuler={() => onOuvert(false)}
              onFini={(id) => onFini(id, ids.length)}
            />
          ) : (
            <div className="grid gap-3">
              {ouvertes.length === 0 ? (
                <p className="text-sm text-(--color-ink-soft)">Aucune amélioration ouverte{estAdmin ? ' : créez-en une.' : '.'}</p>
              ) : (
                <div>
                  <Libelle htmlFor="regrouper-choix">Amélioration</Libelle>
                  <select id="regrouper-choix" className={champ} value={choix} onChange={(e) => setChoix(e.target.value)}>
                    <option value="">Choisir…</option>
                    {ouvertes.map((a) => (
                      <option key={a.id} value={a.id}>
                        n° {numero3(a.numero)} — {a.titre} ({a.candidats} candidat{a.candidats > 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}
              <div className="flex justify-end gap-2 border-t border-(--color-border) pt-3">
                <Bouton type="button" variante="fantome" onClick={() => onOuvert(false)}>Annuler</Bouton>
                <Bouton type="button" onClick={rattacherExistante} enCours={enCours} disabled={ouvertes.length === 0}>
                  <Layers /> Rattacher
                </Bouton>
              </div>
            </div>
          )}
        </div>
      )}
    </Fenetre>
  );
}
