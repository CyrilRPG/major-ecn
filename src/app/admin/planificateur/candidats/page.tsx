import Link from 'next/link';
import { candidatesList } from '@/lib/plan/admin';
import { PLANNER_STATUS_LABEL, type PlannerStatus } from '@/lib/plan/types';
import { fmtDateShort, fmtDateTime } from '@/lib/suivi/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/** Candidats ayant un planning : statut, mode prioritaire, réalisation sur 7 jours, dernier recalcul. */
export default async function PlanCandidatsPage() {
  const rows = await candidatesList();
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Candidats</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{rows.length} candidat(s) avec un planning. La réalisation se mesure aux unités validées (questions soumises, cartes auto-évaluées), jamais au temps passé.</p>
      </header>
      <div className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
        <Table>
          <TableHeader><TableRow><TableHead>Candidat</TableHead><TableHead>Préparation</TableHead><TableHead>Épreuve</TableHead><TableHead>Statut</TableHead><TableHead>Réalisation 7 j</TableHead><TableHead>Dernier recalcul</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-sm text-(--color-ink-soft)">Aucun candidat n’a encore de planning.</TableCell></TableRow>}
            {rows.map((r) => (
              <TableRow key={r.userId}>
                <TableCell><Link href={`/admin/planificateur/candidats/${r.userId}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{r.name}</Link><br /><span className="text-xs text-(--color-ink-muted)">{r.email}</span></TableCell>
                <TableCell className="text-sm">{r.specialite ?? '—'}</TableCell>
                <TableCell className="text-sm">{r.examDate ? fmtDateShort(`${r.examDate}T12:00:00Z`) : '—'}</TableCell>
                <TableCell className="text-sm">{PLANNER_STATUS_LABEL[r.status as PlannerStatus] ?? r.status}{r.priorityMode ? ' · mode prioritaire' : ''}{!r.migrated ? ' · ancienne version' : ''}</TableCell>
                <TableCell className="text-sm tabular-nums">{r.completion7 === null ? '—' : `${Math.round(r.completion7 * 100)} %`}</TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{fmtDateTime(r.lastGenerated)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
