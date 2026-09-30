'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, RotateCcw, Search, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateHeure, formatJour } from '@/lib/decouverte/dates';
import { ANCIENNETE_LABEL, appliquer, FILTRES_DEFAUT, filtresVersQuery, VUE_LABEL, type Anciennete, type ColonneTri, type Filtres, type Vue } from '@/lib/decouverte/filtres';
import type { LigneEvaluee } from '@/lib/decouverte/moteur';
import type { DroitsDecouverte } from '@/lib/decouverte/droits';
import { TYPE_COURT } from '@/lib/decouverte/types';
import { API, BoutonExport, champ, Libelle, StatutBadge } from './commun';

/**
 * Liste des candidats (cahier §9, §10, §27) : colonnes, filtres, recherche,
 * tris, cases à cocher et sélections « tous les candidats à relancer » /
 * « tous les anciens accès ». Les exports reprennent exactement les filtres.
 */

const PAR_PAGE = 50;

const COLONNES: Array<{ cle: ColonneTri; label: string; className?: string }> = [
  { cle: 'candidat', label: 'Candidat' },
  { cle: 'specialite', label: 'Spécialité', className: 'hidden md:table-cell' },
  { cle: 'voie', label: 'Voie', className: 'hidden xl:table-cell' },
  { cle: 'demande', label: 'Demande' },
  { cle: 'connexion', label: 'Première connexion', className: 'hidden lg:table-cell' },
  { cle: 'derniere_relance', label: 'Dernière relance' },
  { cle: 'prochaine', label: 'Prochaine action' },
  { cle: 'echeance', label: 'Date' },
  { cle: 'statut', label: 'Statut' },
];

export function ListeCandidats({ lignes, filtres, setFiltres, specialites, voies, droits, onOuvrir, onEnvoyer }: {
  lignes: LigneEvaluee[];
  filtres: Filtres;
  setFiltres: (f: Filtres) => void;
  specialites: string[];
  voies: string[];
  droits: DroitsDecouverte;
  onOuvrir: (id: string) => void;
  onEnvoyer: (ids: string[]) => void;
}) {
  const [page, setPage] = React.useState(0);
  const [selection, setSelection] = React.useState<Set<string>>(new Set());
  const visibles = React.useMemo(() => appliquer(lignes, filtres), [lignes, filtres]);
  // Nouveaux filtres → retour à la première page (ajustement pendant le rendu, sans effet).
  const [filtresVus, setFiltresVus] = React.useState(filtres);
  if (filtresVus !== filtres) { setFiltresVus(filtres); setPage(0); }
  const pages = Math.max(1, Math.ceil(visibles.length / PAR_PAGE));
  const pageLignes = visibles.slice(page * PAR_PAGE, page * PAR_PAGE + PAR_PAGE);

  const maj = (o: Partial<Filtres>) => setFiltres({ ...filtres, ...o });
  const trierPar = (cle: ColonneTri) => maj({ tri: cle, sens: filtres.tri === cle && filtres.sens === 'asc' ? 'desc' : 'asc' });
  const basculer = (id: string) => setSelection((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const tousAR = lignes.filter((l) => l.evaluation.statut === 'ROUGE').map((l) => l.candidat.id);
  const tousAnciens = lignes.filter((l) => l.evaluation.statut === 'VIOLET' && l.evaluation.prochainType === 'ancien_acces' && l.evaluation.echue).map((l) => l.candidat.id);
  const pageTouteCochee = pageLignes.length > 0 && pageLignes.every((l) => selection.has(l.candidat.id));
  const q = filtresVersQuery(filtres);
  const suffixe = q ? `&${q}` : '';

  return (
    <div className="space-y-3">
      {/* Filtres */}
      <div className="grid grid-cols-2 gap-2 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-3 sm:grid-cols-3 lg:grid-cols-6">
        <Libelle label="Recherche" className="col-span-2 sm:col-span-3 lg:col-span-2">
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
            <input className={cn(champ, 'pl-9')} placeholder="Nom, prénom, e-mail, téléphone" value={filtres.recherche} onChange={(e) => maj({ recherche: e.target.value })} />
          </span>
        </Libelle>
        <Libelle label="Statut / vue">
          <select className={champ} value={filtres.vue} onChange={(e) => maj({ vue: e.target.value as Vue })}>
            {(Object.keys(VUE_LABEL) as Vue[]).map((v) => <option key={v} value={v}>{VUE_LABEL[v]}</option>)}
          </select>
        </Libelle>
        <Libelle label="Spécialité">
          <select className={champ} value={filtres.specialite} onChange={(e) => maj({ specialite: e.target.value })}>
            <option value="">Toutes</option>
            {specialites.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Libelle>
        <Libelle label="Voie">
          <select className={champ} value={filtres.voie} onChange={(e) => maj({ voie: e.target.value })}>
            <option value="">Toutes</option>
            {voies.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Libelle>
        <Libelle label="Ancienneté (depuis l’accès)">
          <select className={champ} value={filtres.anciennete} onChange={(e) => maj({ anciennete: e.target.value as Anciennete })}>
            <option value="">Toutes</option>
            {(Object.keys(ANCIENNETE_LABEL) as Exclude<Anciennete, ''>[]).map((a) => <option key={a} value={a}>{ANCIENNETE_LABEL[a]}</option>)}
          </select>
        </Libelle>
        {filtres.anciennete === 'perso' && (
          <>
            <Libelle label="De (jours)"><input type="number" min={0} className={champ} value={filtres.ancienneteMin ?? ''} onChange={(e) => maj({ ancienneteMin: e.target.value === '' ? null : Number(e.target.value) })} /></Libelle>
            <Libelle label="À (jours)"><input type="number" min={0} className={champ} value={filtres.ancienneteMax ?? ''} onChange={(e) => maj({ ancienneteMax: e.target.value === '' ? null : Number(e.target.value) })} /></Libelle>
          </>
        )}
        <Libelle label="Demande du"><input type="date" className={champ} value={filtres.demandeDu} onChange={(e) => maj({ demandeDu: e.target.value })} /></Libelle>
        <Libelle label="au"><input type="date" className={champ} value={filtres.demandeAu} onChange={(e) => maj({ demandeAu: e.target.value })} /></Libelle>
        <div className="col-span-2 flex items-end sm:col-span-1">
          <Button variant="ghost" size="sm" onClick={() => setFiltres({ ...FILTRES_DEFAUT })}><RotateCcw /> Réinitialiser</Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-(--color-ink-soft)"><strong className="tabular-nums text-(--color-ink)">{visibles.length}</strong> candidat(s)</span>
        {droits.gerer && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setSelection(new Set(tousAR))} disabled={tousAR.length === 0}>
              Sélectionner tous les candidats à relancer ({tousAR.length})
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelection(new Set(tousAnciens))} disabled={tousAnciens.length === 0}>
              Sélectionner tous les anciens accès ({tousAnciens.length})
            </Button>
            {selection.size > 0 && (
              <>
                <Button size="sm" onClick={() => onEnvoyer([...selection])}><Send /> Relancer la sélection ({selection.size})</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelection(new Set())}><X /> Vider</Button>
              </>
            )}
          </>
        )}
        <span className="ml-auto flex flex-wrap gap-2">
          <BoutonExport href={`${API}/export?export=liste&format=csv${suffixe}`} nom="relances-decouverte-liste.csv" label="Liste CSV" />
          <BoutonExport href={`${API}/export?export=liste&format=xlsx${suffixe}`} nom="relances-decouverte-liste.xlsx" label="Liste Excel" />
          <BoutonExport href={`${API}/export?export=historique&format=csv${suffixe}`} nom="relances-decouverte-historique.csv" label="Historique CSV" />
          <BoutonExport href={`${API}/export?export=historique&format=xlsx${suffixe}`} nom="relances-decouverte-historique.xlsx" label="Historique Excel" />
        </span>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead className="bg-(--color-surface-soft) text-[11px] uppercase tracking-wide text-(--color-ink-muted)">
            <tr>
              {droits.gerer && (
                <th className="w-10 px-3 py-2">
                  <input type="checkbox" aria-label="Cocher la page" checked={pageTouteCochee} onChange={() => setSelection((s) => {
                    const n = new Set(s);
                    for (const l of pageLignes) { if (pageTouteCochee) n.delete(l.candidat.id); else n.add(l.candidat.id); }
                    return n;
                  })} />
                </th>
              )}
              {COLONNES.map((c) => (
                <th key={c.cle} className={cn('px-3 py-2 text-left font-semibold', c.className)}>
                  <button type="button" className="inline-flex items-center gap-1 uppercase hover:text-(--color-ink)" onClick={() => trierPar(c.cle)}>
                    {c.label}
                    {filtres.tri === c.cle && (filtres.sens === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageLignes.map((l) => {
              const c = l.candidat, e = l.evaluation;
              const nom = [c.prenom, c.nom].filter(Boolean).join(' ') || '—';
              return (
                <tr key={c.id} className="cursor-pointer border-t border-(--color-border) align-top hover:bg-(--color-surface-soft)" onClick={() => onOuvrir(c.id)}>
                  {droits.gerer && (
                    <td className="px-3 py-2" onClick={(ev) => ev.stopPropagation()}>
                      <input type="checkbox" aria-label={`Sélectionner ${nom}`} checked={selection.has(c.id)} onChange={() => basculer(c.id)} />
                    </td>
                  )}
                  <td className="max-w-[240px] px-3 py-2">
                    <p className="truncate font-medium text-(--color-ink)">{nom}</p>
                    <p className="truncate text-xs text-(--color-ink-soft)">{e.email}</p>
                    {c.telephone && <p className="text-xs text-(--color-ink-muted)">{c.telephone}</p>}
                  </td>
                  <td className="hidden px-3 py-2 text-xs md:table-cell">{c.specialite ?? '—'}</td>
                  <td className="hidden px-3 py-2 text-xs xl:table-cell">{c.voie ?? '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">{formatJour(c.demande_at)}<br /><span className="text-(--color-ink-muted)">J+{e.ancienneteJours}</span></td>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-xs lg:table-cell">{e.connecteAt ? <>{formatDateHeure(e.connecteAt)}{e.connexionApprochee && <span className="text-(--color-ink-muted)"> ≈</span>}</> : '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">{e.derniereRelanceAt ? <>{formatJour(e.derniereRelanceAt)}<br /><span className="text-(--color-ink-muted)">{e.derniereRelanceType}</span></> : '—'}</td>
                  <td className="px-3 py-2 text-xs">{e.prochainType ? <strong>{TYPE_COURT[e.prochainType]}</strong> : null}{e.prochainType ? <br /> : null}<span className="text-(--color-ink-soft)">{e.prochaineAction}</span></td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums">{e.echeance ? formatJour(e.echeance) : '—'}</td>
                  <td className="px-3 py-2">
                    <StatutBadge statut={e.statut} />
                    {e.opposition && e.statut !== 'DESINSCRIT' && <p className="mt-1 text-[10px] text-(--color-ink-muted)">désinscrit</p>}
                  </td>
                </tr>
              );
            })}
            {pageLignes.length === 0 && (
              <tr><td colSpan={10} className="px-3 py-10 text-center text-sm text-(--color-ink-muted)">Aucun candidat pour ces filtres.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft /></Button>
          <span className="tabular-nums">Page {page + 1} / {pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}><ChevronRight /></Button>
        </div>
      )}
    </div>
  );
}
