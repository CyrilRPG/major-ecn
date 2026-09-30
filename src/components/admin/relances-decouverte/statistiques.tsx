'use client';

import * as React from 'react';
import { formatDuree } from '@/lib/decouverte/dates';
import { filtrer, filtresVersQuery, FILTRES_DEFAUT, type Filtres } from '@/lib/decouverte/filtres';
import { calculerKpi, formatTaux } from '@/lib/decouverte/kpi';
import type { LigneEvaluee } from '@/lib/decouverte/moteur';
import { TYPES_RELANCE, TYPE_COURT } from '@/lib/decouverte/types';
import { API, BoutonExport, champ, Libelle, Panneau } from './commun';

/**
 * Statistiques (cahier §21) : demandes, jamais connectés, en attente, à
 * relancer, activés, terminés, désinscrits ; par modèle : envoyés, ouvertures
 * (indicatives), clics plateforme et vidéo, premières connexions attribuées,
 * taux d'activation, délais moyen/médian, taux de désinscription. Vue par
 * spécialité, voie et période de demande ; exports CSV / Excel du même
 * périmètre (statistiques et historique).
 */
export function Statistiques({ lignes, specialites, voies }: { lignes: LigneEvaluee[]; specialites: string[]; voies: string[] }) {
  const [f, setF] = React.useState<Filtres>({ ...FILTRES_DEFAUT });
  const choisies = React.useMemo(() => filtrer(lignes, f), [lignes, f]);
  const k = React.useMemo(() => calculerKpi(choisies), [choisies]);
  const q = filtresVersQuery(f);
  const s = q ? `&${q}` : '';
  const carte = (label: string, valeur: string | number, aide?: string) => (
    <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-(--color-ink)">{valeur}</p>
      {aide && <p className="text-[11px] text-(--color-ink-soft)">{aide}</p>}
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-3 sm:grid-cols-4">
        <Libelle label="Spécialité"><select className={champ} value={f.specialite} onChange={(e) => setF({ ...f, specialite: e.target.value })}><option value="">Toutes</option>{specialites.map((x) => <option key={x}>{x}</option>)}</select></Libelle>
        <Libelle label="Voie"><select className={champ} value={f.voie} onChange={(e) => setF({ ...f, voie: e.target.value })}><option value="">Toutes</option>{voies.map((x) => <option key={x}>{x}</option>)}</select></Libelle>
        <Libelle label="Demande du"><input type="date" className={champ} value={f.demandeDu} onChange={(e) => setF({ ...f, demandeDu: e.target.value })} /></Libelle>
        <Libelle label="au"><input type="date" className={champ} value={f.demandeAu} onChange={(e) => setF({ ...f, demandeAu: e.target.value })} /></Libelle>
      </div>
      <div className="flex flex-wrap gap-2">
        <BoutonExport href={`${API}/export?export=stats&format=csv${s}`} nom="relances-decouverte-statistiques.csv" label="Statistiques CSV" />
        <BoutonExport href={`${API}/export?export=stats&format=xlsx${s}`} nom="relances-decouverte-statistiques.xlsx" label="Statistiques Excel" />
        <BoutonExport href={`${API}/export?export=historique&format=csv${s}`} nom="relances-decouverte-historique.csv" label="Historique CSV" />
        <BoutonExport href={`${API}/export?export=historique&format=xlsx${s}`} nom="relances-decouverte-historique.xlsx" label="Historique Excel" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {carte('Demandes', k.demandes)}
        {carte('Jamais connectés', k.jamaisConnectes)}
        {carte('En attente', k.enAttente)}
        {carte('À relancer', k.aRelancer, `R1 ${k.aRelancerParNiveau.R1} · R2 ${k.aRelancerParNiveau.R2} · R3 ${k.aRelancerParNiveau.R3}`)}
        {carte('Activés', k.actives, `taux global ${formatTaux(k.tauxActivationGlobal)}`)}
        {carte('Terminés', k.termines, `anciens accès : ${k.anciensAcces}`)}
        {carte('Désinscrits', k.desinscrits, `adresses en erreur : ${k.erreurs}`)}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {carte('Connexions attribuées à une relance', k.connexionsAttribueesTotal, `sans relance attribuée : ${k.connexionsSansRelance}`)}
        {carte('Délai moyen relance → connexion', formatDuree(k.delaiMoyenSec) || '—')}
        {carte('Délai médian relance → connexion', formatDuree(k.delaiMedianSec) || '—')}
      </div>
      <Panneau titre="Par modèle" description="Ouvertures : indicatives seulement (pixels bloqués ou préchargés). Les taux reposent sur les premières connexions attribuées.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[13px]">
            <thead className="bg-(--color-surface-soft) text-[11px] uppercase tracking-wide text-(--color-ink-muted)">
              <tr>{['Modèle', 'Envoyés', 'dont importés', 'Délivrés', 'Ouverts*', 'Clics plateforme', 'Clics vidéo', 'Bounces', 'Échecs', 'Connexions', 'Taux d’activation', 'Délai moyen', 'Délai médian', 'Désinscriptions', 'Taux désinscr.'].map((h) => <th key={h} className="px-2 py-2 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {TYPES_RELANCE.map((t) => {
                const m = k.parModele[t];
                return (
                  <tr key={t} className="border-t border-(--color-border) tabular-nums">
                    <td className="px-2 py-2 font-semibold">{TYPE_COURT[t]}</td><td className="px-2 py-2">{m.envoyes}</td><td className="px-2 py-2">{m.dontImportes}</td><td className="px-2 py-2">{m.delivres}</td>
                    <td className="px-2 py-2">{m.ouverts}</td><td className="px-2 py-2">{m.clicsCta}</td><td className="px-2 py-2">{m.clicsVideo}</td><td className="px-2 py-2">{m.bounces}</td><td className="px-2 py-2">{m.echecs}</td>
                    <td className="px-2 py-2">{m.connexionsAttribuees}</td><td className="px-2 py-2">{formatTaux(m.tauxActivation)}</td><td className="px-2 py-2">{formatDuree(m.delaiMoyenSec) || '—'}</td><td className="px-2 py-2">{formatDuree(m.delaiMedianSec) || '—'}</td>
                    <td className="px-2 py-2">{m.desinscriptions}</td><td className="px-2 py-2">{formatTaux(m.tauxDesinscription)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panneau>
    </div>
  );
}
