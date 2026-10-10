'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus, Search, Users } from 'lucide-react';
import type { TacheVisible } from '@/lib/cockpit/server/taches';
import { basculerTerminee, creerTache } from '@/app/admin/cockpit/actions-taches';
import {
  ajouterJoursIso, CATEGORIES_DEFAUT, comparerTaches, estOuverte, estUrgente, libelleCategorie, libelleEcheance, lundiDe, peut,
  STATUT_TACHE_LABEL, type StatutTache,
} from '@/lib/cockpit/regles';
import { cn } from '@/lib/utils';
import { MenuTache } from '../menu-tache';
import { Carte, EntetePage, PastillePriorite, PastilleStatut, Toast, useEtatSuivi, useMessage, Vide, champ, Bouton } from '../ui';
import type { Membre } from '../formulaires';
import { TiroirTache } from './tiroir-tache';

const VUES = [
  ['ouvertes', 'Toutes ouvertes'],
  ['aujourdhui', 'Aujourd’hui'],
  ['semaine', 'Cette semaine'],
  ['retard', 'En retard'],
  ['attente', 'En attente de réponse'],
  ['reponses', 'Réponses reçues'],
  ['partagees', 'Partagées avec moi'],
  ['confiees', 'Confiées à l’équipe'],
  ['terminees', 'Terminées'],
  ['archivees', 'Archivées'],
] as const;
type Vue = (typeof VUES)[number][0];

export function ListeTaches({
  taches, aujourdHui, moiId, membres, vueInitiale, ouverte,
}: {
  taches: TacheVisible[];
  aujourdHui: string;
  moiId: string;
  membres: Membre[];
  vueInitiale: string;
  ouverte: string | null;
}) {
  const router = useRouter();
  const [vue, setVue] = React.useState<Vue>((VUES.some(([v]) => v === vueInitiale) ? vueInitiale : 'ouvertes') as Vue);
  const [categorie, setCategorie] = React.useState('');
  const [q, setQ] = React.useState('');
  const [rapide, setRapide] = React.useState('');
  const [selection, setSelection] = useEtatSuivi<string | null>(ouverte);
  const [message, setMessage] = useMessage();
  const [enCours, start] = React.useTransition();

  const lundi = lundiDe(aujourdHui);
  const priorites = taches.filter((t) => t.priorite_jour === aujourdHui && t.rang_priorite).sort((a, b) => (a.rang_priorite ?? 9) - (b.rang_priorite ?? 9)).map((t) => t.id);
  const filtrees = taches.filter((t) => {
    if (vue === 'archivees') { if (!t.archivee_at) return false; }
    else if (t.archivee_at) return false;
    switch (vue) {
      case 'ouvertes': if (!estOuverte(t.statut)) return false; break;
      case 'aujourdhui': if (!estOuverte(t.statut) || !t.echeance || t.echeance > aujourdHui) return false; break;
      case 'semaine': if (!estOuverte(t.statut) || !t.echeance || t.echeance > ajouterJoursIso(lundi, 6)) return false; break;
      case 'retard': if (!estOuverte(t.statut) || !t.echeance || t.echeance >= aujourdHui) return false; break;
      case 'attente': if (t.statut !== 'attente_reponse') return false; break;
      case 'reponses': if (t.statut !== 'reponse_recue') return false; break;
      case 'partagees': if (!t.partagee) return false; break;
      case 'confiees': if (t.owner_id !== moiId || !t.assignee_id) return false; break;
      case 'terminees': if (t.statut !== 'terminee' && t.statut !== 'annulee') return false; break;
    }
    if (categorie && t.categorie !== categorie) return false;
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      if (![t.titre, t.description, t.notes, t.lien_label].some((x) => x?.toLowerCase().includes(s))) return false;
    }
    return true;
  }).sort(comparerTaches);

  // Compteurs des vues « à surveiller » ; -1 = pas de compteur affiché.
  const compte = (v: Vue): number => {
    const regle: Partial<Record<Vue, (t: TacheVisible) => boolean>> = {
      ouvertes: (t) => estOuverte(t.statut),
      aujourdhui: (t) => estOuverte(t.statut) && !!t.echeance && t.echeance <= aujourdHui,
      retard: (t) => estOuverte(t.statut) && !!t.echeance && t.echeance < aujourdHui,
      attente: (t) => t.statut === 'attente_reponse',
      reponses: (t) => t.statut === 'reponse_recue',
      partagees: (t) => t.partagee,
    };
    const f = regle[v];
    return f ? taches.filter((t) => !t.archivee_at && f(t)).length : -1;
  };

  const categories = [...new Set([...CATEGORIES_DEFAUT, ...taches.map((t) => t.categorie)])];
  const tache = selection ? taches.find((t) => t.id === selection) ?? null : null;

  const creerRapide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rapide.trim()) return;
    start(async () => {
      const r = await creerTache({ titre: rapide.trim(), echeance: vue === 'aujourdhui' ? aujourdHui : undefined });
      if (!r.ok) return setMessage(r.erreur);
      setRapide('');
      setMessage('Tâche créée — ouvrez-la pour compléter la fiche si besoin.');
      router.refresh();
    });
  };

  const ouvrirTache = (id: string | null) => {
    setSelection(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('t', id); else url.searchParams.delete('t');
    window.history.replaceState(null, '', url.toString());
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <EntetePage
        titre="Mes tâches"
        sousTitre="Privées par défaut. Partagez une tâche avec la personne de votre choix (consulter, commenter ou modifier) et révoquez à tout moment."
        actions={
          <a href="/api/cockpit/export?type=taches" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-3 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary-soft)">
            <Download className="h-4 w-4" /> Exporter (CSV)
          </a>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Vues des tâches">
          {VUES.map(([v, l]) => {
            const n = compte(v);
            return (
              <button key={v} type="button" onClick={() => { setVue(v); if (v === 'archivees' && !taches.some((t) => t.archivee_at)) router.push('/admin/cockpit/taches?vue=archivees'); }}
                className={cn('flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] font-medium',
                  vue === v ? 'bg-(--color-primary) text-white' : 'text-(--color-ink) hover:bg-white')}>
                {l}
                {n >= 0 && <span className={cn('rounded-full px-1.5 text-[11px]', vue === v ? 'bg-white/25' : 'bg-white text-(--color-ink-soft)')}>{n}</span>}
              </button>
            );
          })}
        </nav>

        <Carte className="min-w-0">
          <form onSubmit={creerRapide} className="flex gap-2 border-b border-(--color-border) p-3 sm:p-4">
            <input className={champ} value={rapide} onChange={(e) => setRapide(e.target.value)} placeholder="Ajouter une tâche (titre seul, Entrée pour créer)…" aria-label="Nouvelle tâche" />
            <Bouton type="submit" enCours={enCours}><Plus /> <span className="hidden sm:inline">Ajouter</span></Bouton>
          </form>
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
              <input className={cn(champ, 'pl-8')} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer…" />
            </div>
            <select className={cn(champ, 'w-auto')} value={categorie} onChange={(e) => setCategorie(e.target.value)} aria-label="Catégorie">
              <option value="">Toutes catégories</option>
              {categories.map((c) => <option key={c} value={c}>{libelleCategorie(c)}</option>)}
            </select>
          </div>
          <ul className="divide-y divide-(--color-border)">
            {filtrees.length === 0 && <Vide>Aucune tâche dans cette vue.</Vide>}
            {filtrees.map((t) => {
              const fait = t.statut === 'terminee';
              const retard = estOuverte(t.statut) && !!t.echeance && t.echeance < aujourdHui;
              return (
                <li key={t.id} className={cn('flex items-center gap-3 px-3 py-2.5 sm:px-4', selection === t.id && 'bg-(--color-primary-soft)')}>
                  <input type="checkbox" checked={fait} disabled={!peut(t.niveau, 'modification')} aria-label="Terminée"
                    onChange={() => start(async () => { const r = await basculerTerminee(t.id); if (!r.ok) setMessage(r.erreur); router.refresh(); })}
                    className="h-[18px] w-[18px] shrink-0 accent-(--color-primary)" />
                  <button type="button" onClick={() => ouvrirTache(t.id)} className="min-w-0 flex-1 text-left">
                    <span className={cn('block truncate text-[14px] font-medium text-(--color-ink)', fait && 'text-(--color-ink-muted) line-through')}>
                      {priorites.includes(t.id) && <span className="mr-1.5 rounded bg-(--color-primary) px-1.5 text-[10.5px] font-semibold text-white">P{priorites.indexOf(t.id) + 1}</span>}
                      {t.partagee && <Users className="mr-1 inline h-3.5 w-3.5 text-[#2F5DA8]" aria-label="Partagée avec moi" />}
                      {t.titre}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-(--color-ink-soft)">
                      <span>{libelleCategorie(t.categorie)}</span>
                      {t.lien_label && <span>· {t.lien_label}</span>}
                      {t.assignee_id && t.owner_id === moiId && <span>· confiée à {membres.find((m) => m.id === t.assignee_id)?.nom ?? 'un collaborateur'}</span>}
                      {t.recurrence !== 'aucune' && <span>· récurrente</span>}
                    </span>
                  </button>
                  <PastilleStatut statut={t.statut} libelle={STATUT_TACHE_LABEL[t.statut as StatutTache]} className="hidden md:inline-flex" />
                  <PastillePriorite priorite={t.priorite} className={cn('hidden sm:inline-flex', estUrgente(t, aujourdHui) && 'ring-2')} />
                  <span className={cn('hidden w-[110px] shrink-0 text-right text-[12.5px] text-(--color-ink-soft) sm:block', retard && 'font-medium text-[#C0262D]')}>
                    {libelleEcheance(t.echeance, aujourdHui, t.heure)}
                  </span>
                  <MenuTache tache={t} prioritesDuJour={priorites} onModifier={(x) => ouvrirTache(x.id)} onRetour={setMessage} />
                </li>
              );
            })}
          </ul>
        </Carte>
      </div>
      {tache && <TiroirTache key={tache.id} tache={tache} membres={membres} onFermer={() => ouvrirTache(null)} onMessage={setMessage} />}
      {selection && !tache && (
        <p className="mt-3 text-sm text-(--color-ink-soft)">Cette tâche n’existe pas ou ne vous est pas accessible.</p>
      )}
      <Toast message={message} />
    </div>
  );
}
