'use client';

import Link from 'next/link';
import { ClipboardList, Lightbulb } from 'lucide-react';
import type { AmeliorationResume, ReclamationResume } from '@/lib/cockpit/server/donnees';
import { CATEGORIE_RECLAMATION_LABEL } from '@/lib/cockpit/regles';
import { Avatar, Carte, EnteteCarte, PastillePriorite, PastilleStatut, Vide } from '../ui';

function dateCourte(iso: string): string {
  const d = new Date(iso);
  const auj = new Date();
  if (d.toDateString() === auj.toDateString()) return 'Aujourd’hui';
  if (d.toDateString() === new Date(auj.getTime() - 86_400_000).toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/** « Réclamations clients récentes » — vue individuelle de la rubrique Réclamations & Améliorations. */
export function BlocReclamations({ reclamations, ouvertes, aRecontacter }: { reclamations: ReclamationResume[]; ouvertes: number; aRecontacter: number }) {
  return (
    <Carte className="flex flex-col">
      <EnteteCarte icone={ClipboardList} titre="Réclamations clients récentes" compteur={ouvertes} lien="/admin/cockpit/reclamations" />
      {aRecontacter > 0 && (
        <p className="mx-4 mb-1 rounded-lg bg-[#FFF3E0] px-3 py-1.5 text-[12px] text-[#B45309] sm:mx-5">
          {aRecontacter} client{aRecontacter > 1 ? 's' : ''} à recontacter après correction
        </p>
      )}
      <div className="flex-1 overflow-x-auto px-4 pb-3 sm:px-5">
        {reclamations.length === 0 ? <Vide>Aucune réclamation enregistrée.</Vide> : (
          <table className="w-full table-fixed text-left text-[12px]">
            <thead className="text-[11.5px] text-(--color-ink-soft)">
              <tr><th className="w-[30%] py-1.5 font-medium">Client</th><th className="w-[28%] font-medium">Sujet</th><th className="hidden w-[16%] font-medium 2xl:table-cell">Catégorie</th><th className="w-[22%] font-medium">Statut</th><th className="w-[20%] text-right font-medium 2xl:w-[14%]">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {reclamations.slice(0, 5).map((r) => (
                <tr key={r.id} className="hover:bg-(--color-surface-soft)">
                  <td className="py-2 pr-2">
                    <Link href={`/admin/cockpit/reclamations?r=${r.id}`} className="flex min-w-0 items-center gap-2">
                      <Avatar nom={r.candidat_label} taille={24} />
                      <span className="truncate text-(--color-ink)">{r.candidat_label}{r.specialite ? ` (${r.specialite})` : ''}</span>
                    </Link>
                  </td>
                  <td className="truncate pr-2 text-(--color-ink)">{r.sujet}</td>
                  <td className="hidden truncate pr-2 text-(--color-ink-soft) 2xl:table-cell">{CATEGORIE_RECLAMATION_LABEL[r.categorie] ?? r.categorie}</td>
                  <td className="pr-2"><PastilleStatut statut={r.statut} /></td>
                  <td className="text-right text-(--color-ink-soft)">{dateCourte(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Carte>
  );
}

/** « Améliorations à piloter » — reproches récurrents regroupés, nombre de candidats concernés. */
export function BlocAmeliorations({ ameliorations, total, aValider }: { ameliorations: AmeliorationResume[]; total: number; aValider: number }) {
  const tri = [...ameliorations].sort((a, b) => b.candidats - a.candidats);
  return (
    <Carte className="flex flex-col">
      <EnteteCarte icone={Lightbulb} titre="Améliorations à piloter" compteur={total} lien="/admin/cockpit/reclamations?vue=ameliorations"
        badge={aValider > 0 ? <span className="rounded-full bg-[#E8F0FC] px-2 py-0.5 text-[11.5px] font-medium text-[#2F5DA8]">{aValider} à valider</span> : null} />
      <div className="flex-1 overflow-x-auto px-4 pb-3 sm:px-5">
        {tri.length === 0 ? <Vide>Aucune amélioration en cours.</Vide> : (
          <table className="w-full table-fixed text-left text-[12px]">
            <thead className="text-[11.5px] text-(--color-ink-soft)">
              <tr><th className="w-[38%] py-1.5 font-medium">Titre</th><th className="w-[14%] text-center font-medium">Candidats</th><th className="hidden w-[18%] font-medium 2xl:table-cell">Priorité</th><th className="w-[26%] font-medium">Statut</th><th className="w-[22%] text-right font-medium 2xl:w-[14%]">Échéance</th></tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {tri.slice(0, 5).map((a) => (
                <tr key={a.id} className="hover:bg-(--color-surface-soft)">
                  <td className="py-2 pr-2">
                    <Link href={`/admin/cockpit/reclamations?vue=ameliorations&a=${a.id}`} className="block truncate text-(--color-ink) hover:text-(--color-primary)">{a.titre}</Link>
                  </td>
                  <td className="text-center font-semibold text-(--color-ink)">{a.candidats}</td>
                  <td className="hidden pr-2 2xl:table-cell"><PastillePriorite priorite={a.priorite} /></td>
                  <td className="pr-2"><PastilleStatut statut={a.statut} /></td>
                  <td className="text-right text-(--color-ink-soft)">{a.echeance ? new Date(`${a.echeance}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Carte>
  );
}
