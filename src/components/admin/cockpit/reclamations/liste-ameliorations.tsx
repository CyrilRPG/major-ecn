'use client';

import * as React from 'react';
import { CalendarClock, ListTodo, PhoneOutgoing, Search, UserRound, Users, Wrench } from 'lucide-react';
import {
  AMELIORATION_OUVERTE, POIDS_PRIORITE, STATUTS_AMELIORATION, STATUT_AMELIORATION_LABEL, libelleEcheance, type Priorite,
} from '@/lib/cockpit/regles';
import { Carte, PastillePriorite, PastilleStatut, Vide, champ } from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';
import { estEnRetard, majUrl, numero3, selectFiltre } from '../demandes/outils';
import type { AmeliorationLigne, ContexteDossiers } from './vue-reclamations';

type Tri = 'frequence' | 'gravite' | 'echeance';

/** Ordre de pilotage : ouvertes d'abord, puis fréquence (candidats distincts) et gravité (priorité). */
export function trierAmeliorations(liste: AmeliorationLigne[], tri: Tri): AmeliorationLigne[] {
  const poids = (a: AmeliorationLigne) => POIDS_PRIORITE[a.priorite as Priorite] ?? 2;
  return [...liste].sort((a, b) => {
    const oa = AMELIORATION_OUVERTE(a.statut) ? 0 : 1;
    const ob = AMELIORATION_OUVERTE(b.statut) ? 0 : 1;
    if (oa !== ob) return oa - ob;
    if (tri === 'echeance') {
      const ea = a.echeance ?? '9999-12-31';
      const eb = b.echeance ?? '9999-12-31';
      if (ea !== eb) return ea < eb ? -1 : 1;
    }
    if (tri === 'gravite' && poids(a) !== poids(b)) return poids(a) - poids(b);
    if (a.candidats !== b.candidats) return b.candidats - a.candidats;
    if (poids(a) !== poids(b)) return poids(a) - poids(b);
    return b.numero - a.numero;
  });
}

export function ListeAmeliorations({ ameliorations, noms, moiId, aujourdHui }: ContexteDossiers) {
  const [statut, setStatut] = React.useState('ouvertes');
  const [tri, setTri] = React.useState<Tri>('frequence');
  const [aMoi, setAMoi] = React.useState(false);
  const [recherche, setRecherche] = React.useState('');

  const terme = recherche.trim().toLowerCase();
  const filtrees = trierAmeliorations(
    ameliorations
      .filter((a) => (statut === 'toutes' ? true : statut === 'ouvertes' ? AMELIORATION_OUVERTE(a.statut) : a.statut === statut))
      .filter((a) => !aMoi || a.responsable_id === moiId)
      .filter((a) => !terme || [a.titre, a.module, a.probleme, a.action_prevue, `n° ${numero3(a.numero)}`].some((s) => s && s.toLowerCase().includes(terme))),
    tri,
  );
  const maxCandidats = Math.max(1, ...filtrees.map((a) => a.candidats));

  return (
    <Carte>
      <div className="flex flex-wrap items-center gap-2 border-b border-(--color-border) px-4 py-3 sm:px-5">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            type="search"
            className={cn(champ, 'h-8 py-1 pl-9 text-[13px]')}
            placeholder="Titre, module, n°…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            aria-label="Rechercher une amélioration"
          />
        </div>
        <select className={selectFiltre} value={statut} onChange={(e) => setStatut(e.target.value)} aria-label="Statut">
          <option value="ouvertes">En cours de pilotage</option>
          <option value="toutes">Tous les statuts</option>
          {STATUTS_AMELIORATION.map((s) => <option key={s} value={s}>{STATUT_AMELIORATION_LABEL[s]}</option>)}
        </select>
        <select className={selectFiltre} value={tri} onChange={(e) => setTri(e.target.value as Tri)} aria-label="Tri">
          <option value="frequence">Par fréquence</option>
          <option value="gravite">Par gravité</option>
          <option value="echeance">Par échéance</option>
        </select>
        <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-[13px] text-(--color-ink-soft) hover:bg-(--color-surface-soft)">
          <input type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={aMoi} onChange={(e) => setAMoi(e.target.checked)} />
          Dont je suis responsable
        </label>
      </div>

      {filtrees.length === 0 ? (
        <Vide>
          {ameliorations.length === 0
            ? 'Aucune amélioration pour le moment. Sélectionnez des réclamations récurrentes pour les regrouper.'
            : 'Aucune amélioration ne correspond à ces filtres.'}
        </Vide>
      ) : (
        <ul className="grid gap-3 p-3 sm:p-4 lg:grid-cols-2">
          {filtrees.map((a) => {
            const ouverte = AMELIORATION_OUVERTE(a.statut);
            const retard = estEnRetard({ echeance: a.echeance, statut: ouverte ? 'ouverte' : 'terminee' }, aujourdHui);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => majUrl({ r: null, a: a.id })}
                  className={cn(
                    'group flex h-full w-full flex-col rounded-2xl border bg-white p-4 text-left transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(60,20,30,0.25)] focus-ring',
                    ouverte ? 'border-(--color-border)' : 'border-(--color-border) opacity-75',
                  )}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--color-primary)">Amélioration n° {numero3(a.numero)}</span>
                    <span className="ml-auto flex flex-wrap items-center gap-1.5">
                      <PastillePriorite priorite={a.priorite} />
                      <PastilleStatut statut={a.statut} />
                    </span>
                  </div>
                  <p className="mt-1.5 text-[17px] font-semibold leading-snug text-(--color-ink) group-hover:text-(--color-primary)">
                    {a.titre}
                  </p>
                  {a.module && <p className="mt-0.5 text-[12.5px] text-(--color-ink-soft)">{a.module}</p>}
                  {a.probleme && <p className="mt-2 line-clamp-2 text-[13px] text-(--color-ink-soft)">{a.probleme}</p>}

                  <div className="mt-3">
                    <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
                      <span className="inline-flex items-center gap-1 font-medium text-(--color-ink)">
                        <Users className="h-3.5 w-3.5 text-(--color-primary)" />
                        {a.candidats} candidat{a.candidats > 1 ? 's' : ''} concerné{a.candidats > 1 ? 's' : ''}
                      </span>
                      <span className="text-(--color-ink-muted)">{a.reclamations} réclamation{a.reclamations > 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-(--color-surface-soft)" aria-hidden>
                      <div className="h-full rounded-full bg-(--color-primary)" style={{ width: `${Math.round((a.candidats / maxCandidats) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-(--color-ink-soft)">
                    {ouverte && (
                      a.tache_id ? (
                        <span className="inline-flex items-center gap-1 text-[#1F7A3E]"><ListTodo className="h-3.5 w-3.5" /> Tâche de pilotage créée</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#C2570C]"><Wrench className="h-3.5 w-3.5" /> 1 correction à piloter</span>
                      )
                    )}
                    {a.aRecontacter > 0 && (
                      <span className="inline-flex items-center gap-1 font-medium text-[#1F7A3E]">
                        <PhoneOutgoing className="h-3.5 w-3.5" /> {a.aRecontacter} à recontacter
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5" />
                      {a.responsable_id ? (a.responsable_id === moiId ? 'Moi' : noms[a.responsable_id] ?? '—') : 'Sans responsable'}
                    </span>
                    {a.echeance && (
                      <span className={cn('inline-flex items-center gap-1', retard && 'font-medium text-[#B42318]')}>
                        <CalendarClock className="h-3.5 w-3.5" /> {retard ? 'En retard · ' : ''}{libelleEcheance(a.echeance, aujourdHui)}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Carte>
  );
}
