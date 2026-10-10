'use client';

import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle2, MessagesSquare, Server, ShieldAlert, Users } from 'lucide-react';
import { Carte, EnteteCarte, Etiquette, Vide } from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';
import { duree, nombre, Tuile, type CronAffiche, type TonTuile } from './commun';

/**
 * Tableau de bord des Échanges : indicateurs cliquables (chaque tuile mène à
 * l'onglet qui permet d'agir), promotions actives les plus vivantes et santé
 * technique. Les tuiles sont choisies côté serveur selon le niveau de la
 * personne : ce composant n'affiche que ce qu'il reçoit.
 */

export type TuileTdb = { cle: string; libelle: string; valeur: number; aide?: string; href?: string | null; ton?: TonTuile };
export type SectionTdb = { cle: 'promotions' | 'activite' | 'questions' | 'moderation'; titre: string; tuiles: TuileTdb[] };

export type PromotionActive = {
  id: string; nom: string; promotion: string | null; candidats: number; enseignants: number; messages7j: number;
  questionsEnAttente: number; dernier: string; href: string | null;
};

export type SanteTechnique = { crons: CronAffiche[]; erreurs7j: number; emailsEchec: number; lienJournal: string | null };

const ICONES = { promotions: Users, activite: MessagesSquare, questions: Activity, moderation: ShieldAlert } as const;

export function TableauDeBordEchanges({
  sections, promotions, lienPromotions, sante,
}: {
  sections: SectionTdb[];
  promotions: PromotionActive[];
  lienPromotions: string | null;
  sante: SanteTechnique | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        {sections.filter((s) => s.tuiles.length > 0).map((s) => (
          <Carte key={s.cle}>
            <EnteteCarte icone={ICONES[s.cle]} titre={s.titre} />
            <div className="grid grid-cols-2 gap-2.5 px-4 pb-4 sm:grid-cols-3 sm:px-5">
              {s.tuiles.map((t) => (
                <Tuile key={t.cle} libelle={t.libelle} valeur={nombre(t.valeur)} aide={t.aide} href={t.href} ton={t.ton} />
              ))}
            </div>
          </Carte>
        ))}
      </div>

      <div className={cn('grid gap-4', sante && 'xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]')}>
        <Carte>
          <EnteteCarte icone={Users} titre="Promotions actives" compteur={promotions.length} lien={lienPromotions ?? undefined} lienLabel="Toutes les promotions" />
          {promotions.length === 0 ? (
            <Vide>Aucune promotion active pour le moment.</Vide>
          ) : (
            <div className="overflow-x-auto px-4 pb-4 sm:px-5">
              <table className="w-full min-w-[560px] text-[13px]">
                <thead>
                  <tr className="border-b border-(--color-border) text-left text-[12px] text-(--color-ink-muted)">
                    <th className="py-2 pr-3 font-medium">Promotion</th>
                    <th className="px-2 py-2 text-right font-medium">Candidats</th>
                    <th className="px-2 py-2 text-right font-medium">Enseignants</th>
                    <th className="px-2 py-2 text-right font-medium">Messages 7 j</th>
                    <th className="px-2 py-2 text-right font-medium">Questions</th>
                    <th className="py-2 pl-2 text-right font-medium">Dernier message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border)">
                  {promotions.map((p) => (
                    <tr key={p.id}>
                      <td className="max-w-[260px] py-2 pr-3">
                        {p.href ? (
                          <Link href={p.href} className="font-medium text-(--color-ink) hover:text-(--color-primary) hover:underline">{p.nom}</Link>
                        ) : (
                          <span className="font-medium text-(--color-ink)">{p.nom}</span>
                        )}
                        {p.promotion && <span className="ml-1.5 text-(--color-ink-muted)">· {p.promotion}</span>}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{nombre(p.candidats)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{nombre(p.enseignants)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{nombre(p.messages7j)}</td>
                      <td className="px-2 py-2 text-right">
                        {p.questionsEnAttente > 0 ? <Etiquette ton="orange">{nombre(p.questionsEnAttente)} en attente</Etiquette> : <span className="text-(--color-ink-muted)">—</span>}
                      </td>
                      <td className="whitespace-nowrap py-2 pl-2 text-right text-(--color-ink-soft)">{p.dernier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Carte>

        {sante && (
          <Carte>
            <EnteteCarte icone={Server} titre="Santé technique" lien={sante.lienJournal ?? undefined} lienLabel="Journal technique" />
            <div className="space-y-3 px-4 pb-4 sm:px-5">
              <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border)">
                {sante.crons.map((c) => (
                  <li key={c.nom} className="flex items-start gap-2.5 px-3 py-2.5">
                    {c.enRetard
                      ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B42318]" aria-label="En retard" />
                      : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-label="À l’heure" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-(--color-ink)">{c.libelle}</p>
                      <p className="text-[12px] text-(--color-ink-muted)">
                        <code className="text-[11.5px]">{c.nom}</code> · dernier passage {c.dernier === '—' ? 'jamais enregistré' : `${c.dernier} (${c.ilYa})`} · durée {duree(c.dureeMs)}
                      </p>
                      {c.enRetard && <p className="mt-0.5 text-[12px] font-medium text-[#B42318]">Aucun passage depuis plus de 30 min (tâche prévue toutes les 5 min).</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-2.5">
                <Tuile
                  libelle="Erreurs (7 derniers jours)"
                  valeur={nombre(sante.erreurs7j)}
                  ton={sante.erreurs7j > 0 ? 'alerte' : 'ok'}
                  href={sante.lienJournal ? `${sante.lienJournal}&niveau=erreur` : null}
                />
                <Tuile
                  libelle="E-mails en échec"
                  valeur={nombre(sante.emailsEchec)}
                  ton={sante.emailsEchec > 0 ? 'alerte' : 'ok'}
                  href={sante.lienJournal ? `${sante.lienJournal}&source=email` : null}
                />
              </div>
            </div>
          </Carte>
        )}
      </div>
    </div>
  );
}
