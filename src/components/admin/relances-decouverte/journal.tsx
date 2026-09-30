'use client';

import * as React from 'react';
import { Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateHeure } from '@/lib/decouverte/dates';
import type { DroitsDecouverte } from '@/lib/decouverte/droits';
import { TYPE_COURT, type TypeRelance } from '@/lib/decouverte/types';
import { API, appelJson, Message, Panneau } from './commun';

/**
 * Journal (cahier §25) : chaque opération (qui, quand, volume, ventilation,
 * bilan) et chaque modification de paramètres ou de modèle (avant / après),
 * e-mails de test, imports et oppositions saisies. Une opération interrompue
 * se reprend d'ici, sans réexpédier aux destinataires déjà servis.
 */
type Operation = { id: string; type: string; mode: string; type_force: string | null; statut: string; cree_par_nom: string | null; total: number; ventilation: Record<string, number>; bilan: Record<string, unknown>; created_at: string; confirmee_at: string | null; terminee_at: string | null; commentaire: string | null };
type Entree = { id: number; acteur_nom: string | null; action: string; volume: number | null; details: Record<string, unknown>; created_at: string };

const ACTION: Record<string, string> = {
  operation_lancee: 'Envoi lancé', operation_terminee: 'Envoi terminé', operation_annulee: 'Envoi annulé', parametres_modifies: 'Paramètres modifiés',
  email_test: 'E-mail de test', import_historique: 'Import de l’historique', opposition_saisie: 'Opposition saisie',
};
const TYPE_OP: Record<string, string> = { groupe: 'Envoi groupé', individuel: 'Relance individuelle', exceptionnel: 'Relance exceptionnelle' };
const STATUT_OP: Record<string, string> = { preparee: 'Préparée (non confirmée)', en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée' };

function ventilation(v: Record<string, number>) {
  return ['R1', 'R2', 'R3', 'ancien_acces'].filter((k) => v[k]).map((k) => `${TYPE_COURT[k as TypeRelance]} ${v[k]}`).join(' · ') || '—';
}

function resumeDiff(d: Record<string, unknown>): string {
  const diff = d.diff as Record<string, { avant: unknown; apres: unknown }> | undefined;
  if (!diff) return '';
  return Object.entries(diff).map(([k, v]) => k === 'modeles' ? 'modèles d’e-mail modifiés' : `${k} : ${JSON.stringify(v.avant)} → ${JSON.stringify(v.apres)}`).join(' ; ');
}

export function Journal({ droits, onReprendre, cle }: { droits: DroitsDecouverte; onReprendre: (opId: string, type: string) => void; cle: number }) {
  const [data, setData] = React.useState<{ journal: Entree[]; operations: Operation[] } | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  React.useEffect(() => {
    appelJson<{ journal: Entree[]; operations: Operation[] }>(`${API}/journal`).then(setData).catch((e) => setErreur(e instanceof Error ? e.message : 'Journal illisible'));
  }, [cle]);
  if (erreur) return <Message erreur={erreur} />;
  if (!data) return <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Chargement du journal…</p>;
  return (
    <div className="space-y-4">
      <Panneau titre="Opérations d’envoi" description="Qui, quand, volume, ventilation par modèle et bilan.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead className="bg-(--color-surface-soft) text-[11px] uppercase tracking-wide text-(--color-ink-muted)"><tr><th className="px-2 py-2 text-left">Date</th><th className="px-2 py-2 text-left">Par</th><th className="px-2 py-2 text-left">Opération</th><th className="px-2 py-2 text-left">Statut</th><th className="px-2 py-2 text-left">Prévu</th><th className="px-2 py-2 text-left">Bilan</th><th /></tr></thead>
            <tbody>
              {data.operations.map((o) => {
                const b = o.bilan as { envoyes?: number; exclus?: number; echecs?: number };
                const peutReprendre = o.statut === 'en_cours' && (o.type === 'groupe' ? droits.gerer : droits.rediger);
                return (
                  <tr key={o.id} className="border-t border-(--color-border) align-top">
                    <td className="whitespace-nowrap px-2 py-2">{formatDateHeure(o.created_at)}</td>
                    <td className="px-2 py-2">{o.cree_par_nom ?? '—'}</td>
                    <td className="px-2 py-2">{TYPE_OP[o.type] ?? o.type}{o.type_force ? ` (${TYPE_COURT[o.type_force as TypeRelance]})` : ''}{o.commentaire && <p className="text-xs text-(--color-ink-muted)">{o.commentaire}</p>}</td>
                    <td className="px-2 py-2">{STATUT_OP[o.statut] ?? o.statut}{o.terminee_at && <p className="text-xs text-(--color-ink-muted)">{formatDateHeure(o.terminee_at)}</p>}</td>
                    <td className="px-2 py-2">{o.total} e-mail(s)<p className="text-xs text-(--color-ink-muted)">{ventilation(o.ventilation)} · exclus {o.ventilation.exclus ?? 0}</p></td>
                    <td className="px-2 py-2">{o.statut === 'terminee' ? `${b.envoyes ?? 0} envoyé(s), ${b.exclus ?? 0} exclu(s), ${b.echecs ?? 0} échec(s)` : '—'}</td>
                    <td className="px-2 py-2">{peutReprendre && <Button size="sm" variant="outline" onClick={() => onReprendre(o.id, o.type)}><Play /> Reprendre</Button>}</td>
                  </tr>
                );
              })}
              {data.operations.length === 0 && <tr><td colSpan={7} className="px-2 py-6 text-center text-(--color-ink-muted)">Aucune opération.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panneau>
      <Panneau titre="Journal des actions" description="Envois, modifications de cadence et de modèles (avant / après), tests, imports, oppositions.">
        <ul className="divide-y divide-(--color-border) text-sm">
          {data.journal.map((j) => (
            <li key={j.id} className="py-2">
              <p><span className="tabular-nums text-(--color-ink-muted)">{formatDateHeure(j.created_at)}</span> — <strong>{ACTION[j.action] ?? j.action}</strong> · {j.acteur_nom ?? 'Système'}{j.volume !== null ? ` · volume ${j.volume}` : ''}</p>
              {resumeDiff(j.details) && <p className="break-words text-xs text-(--color-ink-soft)">{resumeDiff(j.details)}</p>}
              {j.action === 'email_test' && <p className="text-xs text-(--color-ink-soft)">{String(j.details.type ?? '')} → {String(j.details.email ?? '')} ({String(j.details.statut ?? '')})</p>}
            </li>
          ))}
          {data.journal.length === 0 && <li className="py-6 text-center text-(--color-ink-muted)">Journal vide.</li>}
        </ul>
      </Panneau>
    </div>
  );
}
