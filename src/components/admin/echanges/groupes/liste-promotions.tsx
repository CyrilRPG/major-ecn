'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, MessageSquare, Search, UserRound, Users } from 'lucide-react';
import { LIBELLE_STATUT, type StatutGroupe } from '@/lib/echanges/regles';
import { Carte, champ, Vide } from '@/components/admin/cockpit/ui';
import { depuis, PastilleStatutGroupe, PastilleVisibilite, type LignePromotion } from './commun';

const STATUTS: StatutGroupe[] = ['brouillon', 'active', 'cloturee'];

/**
 * Liste des promotions en cours (brouillon, active, clôturée) : filtres par
 * statut et recherche ; tableau sur grand écran, cartes sur mobile. Une
 * ligne ouvre la fiche de la promotion.
 */
export function ListePromotions({ lignes }: { lignes: LignePromotion[] }) {
  const router = useRouter();
  const [statut, setStatut] = React.useState<StatutGroupe | 'tous'>('tous');
  const [q, setQ] = React.useState('');
  const s = q.trim().toLowerCase();
  const liste = lignes.filter((l) => (statut === 'tous' || l.statut === statut)
    && (!s || [l.nom, l.promotion, l.specialite, l.annee ? String(l.annee) : null].some((x) => x?.toLowerCase().includes(s))));
  const compte = (st: StatutGroupe) => lignes.filter((l) => l.statut === st).length;
  const fiche = (id: string) => `/admin/echanges/groupes/${id}`;

  return (
    <Carte>
      <div className="flex flex-wrap items-center gap-3 border-b border-(--color-border) p-3 sm:p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input className={`${champ} pl-8`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une promotion, une année, une spécialité…" aria-label="Rechercher une promotion" />
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrer par statut">
          {(['tous', ...STATUTS] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatut(st)}
              aria-pressed={statut === st}
              className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors focus-ring ${statut === st ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft) hover:text-(--color-ink)'}`}
            >
              {st === 'tous' ? `Toutes (${lignes.length})` : `${LIBELLE_STATUT[st]} (${compte(st)})`}
            </button>
          ))}
        </div>
      </div>

      {liste.length === 0 ? (
        <Vide>{lignes.length === 0 ? 'Aucune promotion pour le moment. Créez la première avec « Nouvelle promotion ».' : 'Aucune promotion ne correspond à ces filtres.'}</Vide>
      ) : (
        <>
          {/* Grand écran : tableau */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-(--color-border) text-[12px] text-(--color-ink-muted)">
                <tr>
                  <th className="px-4 py-2 font-medium">Promotion</th>
                  <th className="px-3 py-2 font-medium">Spécialité</th>
                  <th className="px-3 py-2 font-medium">Statut</th>
                  <th className="px-3 py-2 text-right font-medium">Candidats</th>
                  <th className="px-3 py-2 text-right font-medium">Enseignants</th>
                  <th className="px-3 py-2 text-right font-medium">Messages 7 j</th>
                  <th className="px-3 py-2 text-right font-medium">Questions en attente</th>
                  <th className="px-3 py-2 font-medium">Dernière activité</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {liste.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => router.push(fiche(l.id))}
                    className="cursor-pointer transition-colors hover:bg-(--color-surface-soft)"
                  >
                    <td className="px-4 py-2.5">
                      <Link href={fiche(l.id)} onClick={(e) => e.stopPropagation()} className="font-semibold text-(--color-ink) hover:text-(--color-primary) hover:underline">{l.nom}</Link>
                      <p className="text-[12px] text-(--color-ink-muted)">{[l.annee, l.promotion].filter(Boolean).join(' · ') || '—'}</p>
                    </td>
                    <td className="px-3 py-2.5 text-(--color-ink-soft)">{l.specialite ?? 'Toutes'}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col items-start gap-1">
                        <PastilleStatutGroupe statut={l.statut} />
                        <PastilleVisibilite visible={l.visible} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{l.candidats.toLocaleString('fr-FR')}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{l.enseignants}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{l.messages7j.toLocaleString('fr-FR')}</td>
                    <td className={`px-3 py-2.5 text-right tabular-nums ${l.questionsEnAttente > 0 ? 'font-semibold text-[#C2570C]' : ''}`}>{l.questionsEnAttente}</td>
                    <td className="px-3 py-2.5 text-(--color-ink-soft)" suppressHydrationWarning>{depuis(l.dernierMessage)}</td>
                    <td className="pr-3 text-(--color-ink-muted)"><ChevronRight className="h-4 w-4" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablette : cartes */}
          <ul className="divide-y divide-(--color-border) lg:hidden">
            {liste.map((l) => (
              <li key={l.id}>
                <Link href={fiche(l.id)} className="block px-3 py-3 transition-colors hover:bg-(--color-surface-soft) sm:px-4">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-(--color-ink)">{l.nom}</p>
                      <p className="truncate text-[12px] text-(--color-ink-muted)">
                        {[l.annee, l.promotion, l.specialite ?? 'Toutes spécialités'].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <PastilleStatutGroupe statut={l.statut} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-(--color-ink-soft)">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {l.candidats.toLocaleString('fr-FR')}</span>
                    <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" /> {l.enseignants}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {l.messages7j} / 7 j</span>
                    {l.questionsEnAttente > 0 && <span className="font-semibold text-[#C2570C]">{l.questionsEnAttente} question{l.questionsEnAttente > 1 ? 's' : ''} en attente</span>}
                    <PastilleVisibilite visible={l.visible} />
                    <span className="text-(--color-ink-muted)" suppressHydrationWarning>{depuis(l.dernierMessage)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Carte>
  );
}
