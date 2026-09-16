import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext } from '@/lib/plan/service';
import { MASTERY_STATUSES, MASTERY_STATUS_LABEL, REFERENCE_STATEMENT, type MasteryStatus } from '@/lib/plan/types';
import { Badge } from '@/components/ui/badge';
import { ItemActions } from '@/components/student/plan/item-actions';
import { MasteryBar, PriorityBadge } from '@/components/student/plan/ui';
import { fmtDateShort } from '@/lib/suivi/format';

const STATUS_VARIANT: Record<MasteryStatus, 'success' | 'warning' | 'primary' | 'outline' | 'muted' | 'danger'> = {
  maitrise: 'success', a_reactiver: 'outline', a_consolider: 'warning', en_cours: 'primary', programme: 'primary', a_travailler: 'danger', non_evalue: 'muted',
};

/**
 * Programme complet (complément §5) : TOUS les items, y compris ceux qui ne
 * sont pas actuellement prioritaires. Aucun item ne disparaît parce que son
 * score de priorité est faible.
 */
export default async function ProgrammePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user } = await requireUser();
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const sp = await searchParams;
  const filtre = typeof sp.filtre === 'string' ? sp.filtre : '';
  const q = typeof sp.q === 'string' ? sp.q.trim().toLowerCase() : '';
  const insufficient = new Set(ctx.coverage.insufficientIds);
  const nextSession = new Map<string, string>();
  for (const s of ctx.sessions) if (s.status === 'planifiee' && s.item_id && s.day >= ctx.today && !nextSession.has(s.item_id)) nextSession.set(s.item_id, s.day);

  let rows = ctx.statuses.map((r) => ({ ...r, priority: ctx.priorities.get(r.item.id)!, next: nextSession.get(r.item.id) ?? null }));
  if (filtre === 'insuffisant') rows = rows.filter((r) => insufficient.has(r.item.id));
  else if ((MASTERY_STATUSES as string[]).includes(filtre)) rows = rows.filter((r) => r.status === filtre);
  if (q) rows = rows.filter((r) => r.item.nom_item.toLowerCase().includes(q));
  rows.sort((a, b) => b.priority.score - a.priority.score || a.item.nom_item.localeCompare(b.item.nom_item, 'fr'));
  const c = ctx.coverage;

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Programme complet</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{c.total} items au programme · {c.counts.maitrise + c.counts.a_reactiver} maîtrisés · {c.counts.a_consolider} à consolider · {c.counts.a_travailler + c.counts.programme + c.counts.en_cours} à travailler · {c.counts.non_evalue} non encore évalués — couverture du programme : <strong className="text-(--color-ink)">{c.coveragePct} %</strong>.</p>
      </header>
      <p className="rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-xs text-(--color-ink-soft)">{REFERENCE_STATEMENT}</p>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={q} placeholder="Rechercher un item…" className="h-9 min-w-48 flex-1 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink)" />
        <select name="filtre" defaultValue={filtre} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)">
          <option value="">Tous les statuts</option>
          <option value="insuffisant">Insuffisamment travaillés</option>
          {MASTERY_STATUSES.map((s) => <option key={s} value={s}>{MASTERY_STATUS_LABEL[s]}</option>)}
        </select>
        <button type="submit" className="h-9 rounded-(--radius-button) bg-(--color-primary) px-3 text-sm font-medium text-(--color-primary-fg)">Filtrer</button>
        {(filtre || q) && <Link href="/planificateur/programme" className="text-sm text-(--color-ink-soft) underline-offset-4 hover:underline">Tout afficher</Link>}
      </form>

      <ul className="divide-y divide-(--color-border) rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
        {rows.length === 0 && <li className="p-4 text-sm text-(--color-ink-soft)">Aucun item pour ce filtre.</li>}
        {rows.map((r) => (
          <li key={r.item.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-(--color-ink)">
                {r.item.cours_id ? <Link href={`/cours/${r.item.cours_id}`} className="underline-offset-4 hover:underline">{r.item.nom_item}</Link> : r.item.nom_item}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-(--color-ink-soft)">
                <Badge variant={STATUS_VARIANT[r.status]}>{MASTERY_STATUS_LABEL[r.status]}</Badge>
                <PriorityBadge tier={r.priority.tier} />
                {r.next && <span>Prochaine séance : {fmtDateShort(`${r.next}T12:00:00Z`)}</span>}
              </p>
              <p className="mt-1 text-xs text-(--color-ink-muted)">{r.priority.reasons[0]}</p>
            </div>
            <MasteryBar score={r.mastery?.score ?? null} />
            <ItemActions itemId={r.item.id} hasQuestions={!!r.item.cours_id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
