'use client';

import * as React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateHeure } from '@/lib/decouverte/dates';
import { dansVue, FILTRES_DEFAUT, type Filtres, type Vue } from '@/lib/decouverte/filtres';
import type { LigneEvaluee } from '@/lib/decouverte/moteur';
import type { DroitsDecouverte } from '@/lib/decouverte/droits';
import type { Parametres } from '@/lib/decouverte/types';
import { API, appelJson, Message } from './commun';
import { EnvoiDialog, type DemandeDialog } from './envoi-dialog';
import { FicheCandidat } from './fiche';
import { ImportHistorique } from './import-historique';
import { Journal } from './journal';
import { ListeCandidats } from './liste';
import { ParametresModule } from './parametres';
import { Statistiques } from './statistiques';
import { rafraichirResumeRelances } from './use-resume';

/**
 * Module « Relances Offre Découverte » (cahier des charges du client) :
 * compteurs cliquables, liste filtrable, fiche, envois contrôlés, import de
 * l'historique, statistiques, paramétrage et journal. Utilisable sur
 * ordinateur et tablette.
 */

type Etat = {
  maintenant: string;
  droits: DroitsDecouverte;
  parametres: Parametres;
  resume: { aRelancer: number; R1: number; R2: number; R3: number; anciensAcces: number };
  specialites: string[];
  voies: string[];
  lignes: LigneEvaluee[];
};

type Onglet = 'candidats' | 'statistiques' | 'import' | 'parametres' | 'journal';

const COMPTEURS: Array<{ vue: Vue; label: string; ton: string }> = [
  { vue: 'a_relancer', label: 'À relancer', ton: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200' },
  { vue: 'en_attente', label: 'En attente', ton: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200' },
  { vue: 'actives', label: 'Activés', ton: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200' },
  { vue: 'anciens', label: 'Anciens accès', ton: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200' },
  { vue: 'termines', label: 'Terminés', ton: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200' },
  { vue: 'desinscrits', label: 'Désinscrits', ton: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200' },
  { vue: 'erreurs', label: 'Adresses en erreur', ton: 'border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200' },
];

export function ModuleRelances({ filtresInitiaux }: { filtresInitiaux: Partial<Filtres> }) {
  const [etat, setEtat] = React.useState<Etat | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [chargement, setChargement] = React.useState(false);
  const [onglet, setOnglet] = React.useState<Onglet>('candidats');
  const [filtres, setFiltres] = React.useState<Filtres>({ ...FILTRES_DEFAUT, ...filtresInitiaux });
  const [ficheId, setFicheId] = React.useState<string | null>(null);
  const [envoi, setEnvoi] = React.useState<DemandeDialog | null>(null);
  const [cleJournal, setCleJournal] = React.useState(0);
  // Relance lancée depuis une fiche : la fiche se referme le temps de l'envoi puis se rouvre à jour.
  const [ficheRetour, setFicheRetour] = React.useState<string | null>(null);
  // Chaque ouverture de la fenêtre d'envoi = une nouvelle intention (nouvelle clé d'idempotence).
  const [cleEnvoi, setCleEnvoi] = React.useState(0);
  const ouvrirEnvoi = (dm: DemandeDialog) => { setCleEnvoi((k) => k + 1); setEnvoi(dm); };

  const charger = React.useCallback(async () => {
    try {
      const e = await appelJson<Etat>(`${API}/etat`);
      setEtat(e); setErreur(null);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Chargement impossible');
    } finally {
      setChargement(false);
    }
  }, []);
  React.useEffect(() => { void Promise.resolve().then(charger); }, [charger]);

  async function synchroniser() {
    setChargement(true); setErreur(null);
    try { await appelJson(`${API}/synchroniser`, { body: {} }); await charger(); rafraichirResumeRelances(); } catch (e) { setErreur(e instanceof Error ? e.message : 'Synchronisation impossible'); setChargement(false); }
  }

  const apresEnvoi = (envoye: boolean) => {
    setEnvoi(null);
    if (envoye) { void charger(); setCleJournal((k) => k + 1); rafraichirResumeRelances(); }
  };

  const d = etat?.droits;
  const onglets: Array<[Onglet, string, boolean]> = [
    ['candidats', 'Candidats', true], ['statistiques', 'Statistiques', true], ['import', 'Import de l’historique', !!d?.gerer],
    ['parametres', 'Paramètres', true], ['journal', 'Journal', true],
  ];
  const compte = (v: Vue) => etat?.lignes.filter((l) => dansVue(l, v)).length ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-5 sm:px-4 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-(--color-ink) sm:text-2xl">Relances Offre Découverte</h1>
          <p className="text-sm text-(--color-ink-soft)">Candidats jamais connectés : qui relancer, quand et avec quel modèle. Les envois restent sous votre contrôle.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-(--color-ink-muted)">
          {etat?.parametres.derniereSynchroAt && <span>Synchronisé le {formatDateHeure(etat.parametres.derniereSynchroAt)}</span>}
          <Button variant="outline" size="sm" onClick={() => void synchroniser()} disabled={chargement}>{chargement ? <Loader2 className="animate-spin" /> : <RefreshCw />} Actualiser</Button>
        </div>
      </div>

      {etat?.parametres.pause && <Message erreur="Envois en pause (Paramètres) : les relances restent signalées mais aucun e-mail ne part." />}
      <Message erreur={erreur} />

      {etat && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {COMPTEURS.map((c) => (
            <button key={c.vue} type="button" onClick={() => { setOnglet('candidats'); setFiltres({ ...FILTRES_DEFAUT, vue: c.vue }); }}
              className={cn('rounded-(--radius-card) border p-3 text-left transition-shadow hover:shadow-(--shadow-soft) focus-ring', c.ton, filtres.vue === c.vue && onglet === 'candidats' && 'ring-2 ring-(--color-primary)')}>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{c.label}</p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums">{compte(c.vue)}</p>
              {c.vue === 'a_relancer' && <p className="text-[11px]">R1 {etat.resume.R1} · R2 {etat.resume.R2} · R3 {etat.resume.R3}</p>}
            </button>
          ))}
        </div>
      )}

      <nav aria-label="Relances Offre Découverte" className="-mb-px flex flex-wrap gap-1 border-b border-(--color-border)">
        {onglets.filter(([, , v]) => v).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setOnglet(k)} className={cn('border-b-2 px-3 py-2.5 text-sm font-medium', onglet === k ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-ink-soft) hover:text-(--color-ink)')}>{l}</button>
        ))}
      </nav>

      {!etat && !erreur && <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Chargement des candidats…</p>}

      {etat && onglet === 'candidats' && (
        <ListeCandidats lignes={etat.lignes} filtres={filtres} setFiltres={setFiltres} specialites={etat.specialites} voies={etat.voies} droits={etat.droits}
          onOuvrir={setFicheId} onEnvoyer={(ids) => ouvrirEnvoi({ type: 'groupe', candidatIds: ids })} />
      )}
      {etat && onglet === 'statistiques' && <Statistiques lignes={etat.lignes} specialites={etat.specialites} voies={etat.voies} />}
      {etat && onglet === 'import' && d?.gerer && <ImportHistorique onImporte={() => { void charger(); setCleJournal((k) => k + 1); rafraichirResumeRelances(); }} />}
      {etat && onglet === 'parametres' && <ParametresModule key={`${etat.parametres.version}-${etat.parametres.pause}`} initial={etat.parametres} droits={etat.droits} onEnregistre={() => { void charger(); setCleJournal((k) => k + 1); rafraichirResumeRelances(); }} />}
      {etat && onglet === 'journal' && <Journal droits={etat.droits} cle={cleJournal} onReprendre={(id) => ouvrirEnvoi({ reprendre: id })} />}

      <FicheCandidat key={ficheId ?? 'aucune'} id={ficheId} onFermer={() => setFicheId(null)} onChange={() => void charger()} onRelancer={(dm) => { setFicheRetour(ficheId); setFicheId(null); ouvrirEnvoi(dm); }} />
      <EnvoiDialog key={cleEnvoi} demande={envoi} onFermer={(envoye) => { apresEnvoi(envoye); if (ficheRetour) { setFicheId(ficheRetour); setFicheRetour(null); } }} />
    </div>
  );
}
