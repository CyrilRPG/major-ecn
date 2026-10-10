import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronRight, MessagesSquare, UserRound, Users } from 'lucide-react';
import { acteurBackOffice, listeGroupes, peut } from '@/lib/echanges/serveur/admin';
import { Carte, Vide } from '@/components/admin/cockpit/ui';
import { dateParis, PastilleConservation } from '@/components/admin/echanges/groupes/commun';

export const metadata = { title: 'Archives — Échanges' };
export const dynamic = 'force-dynamic';

/**
 * Promotions archivées (§80, §104) : consultables en lecture seule (fiche
 * sans transition possible, conversation en lecture seule). La conservation
 * légale bloque la purge et l'effacement RGPD.
 */
export default async function ArchivesPage() {
  const a = await acteurBackOffice();
  if (!a || !peut(a, 'gerer_groupes')) redirect('/admin/echanges');
  const groupes = (await listeGroupes(a, ['archivee']))
    .sort((x, y) => (y.archivee_at ?? '').localeCompare(x.archivee_at ?? ''));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-(--color-ink)">Archives <span className="text-(--color-primary)">({groupes.length})</span></h2>
        <p className="text-sm text-(--color-ink-soft)">Promotions archivées, consultables en lecture seule. Les réponses versées à l’archivage sont dans la bibliothèque.</p>
      </div>
      <Carte>
        {groupes.length === 0 ? (
          <Vide>Aucune promotion archivée.</Vide>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-(--color-border) text-[12px] text-(--color-ink-muted)">
                  <tr>
                    <th className="px-4 py-2 font-medium">Promotion</th>
                    <th className="px-3 py-2 font-medium">Spécialité</th>
                    <th className="px-3 py-2 font-medium">Archivée le</th>
                    <th className="px-3 py-2 text-right font-medium">Candidats</th>
                    <th className="px-3 py-2 text-right font-medium">Enseignants</th>
                    <th className="px-3 py-2 font-medium">Dernier message</th>
                    <th className="px-3 py-2 font-medium">Conservation</th>
                    <th className="px-4 py-2 text-right font-medium">Consulter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border)">
                  {groupes.map((g) => (
                    <tr key={g.id} className="hover:bg-(--color-surface-soft)">
                      <td className="px-4 py-2.5">
                        <Link href={`/admin/echanges/groupes/${g.id}`} className="font-semibold text-(--color-ink) hover:text-(--color-primary) hover:underline">{g.nom}</Link>
                        <p className="text-[12px] text-(--color-ink-muted)">{[g.annee, g.promotion].filter(Boolean).join(' · ') || '—'}</p>
                      </td>
                      <td className="px-3 py-2.5 text-(--color-ink-soft)">{g.specialite_nom ?? 'Toutes'}</td>
                      <td className="px-3 py-2.5 text-(--color-ink-soft)">{dateParis(g.archivee_at, true)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{g.candidats.toLocaleString('fr-FR')}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{g.enseignants}</td>
                      <td className="px-3 py-2.5 text-(--color-ink-soft)">{dateParis(g.dernierMessage)}</td>
                      <td className="px-3 py-2.5">{g.conservation_legale ? <PastilleConservation /> : <span className="text-(--color-ink-muted)">—</span>}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-3 whitespace-nowrap text-[12.5px] font-medium">
                          <Link href={`/admin/echanges/groupes/${g.id}`} className="text-(--color-primary) hover:underline">Fiche</Link>
                          <Link href={`/echanges/${g.id}`} className="text-(--color-primary) hover:underline">Conversation</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-(--color-border) lg:hidden">
              {groupes.map((g) => (
                <li key={g.id} className="px-3 py-3 sm:px-4">
                  <Link href={`/admin/echanges/groupes/${g.id}`} className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-(--color-ink)">{g.nom}</p>
                      <p className="truncate text-[12px] text-(--color-ink-muted)">
                        {[g.annee, g.promotion, g.specialite_nom ?? 'Toutes spécialités'].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-(--color-ink-muted)" />
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-(--color-ink-soft)">
                    <span>Archivée le {dateParis(g.archivee_at)}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {g.candidats.toLocaleString('fr-FR')}</span>
                    <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" /> {g.enseignants}</span>
                    {g.conservation_legale && <PastilleConservation />}
                    <Link href={`/echanges/${g.id}`} className="inline-flex items-center gap-1 font-medium text-(--color-primary) hover:underline">
                      <MessagesSquare className="h-3.5 w-3.5" /> Conversation
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Carte>
    </div>
  );
}
