import Link from 'next/link';
import { listColleges, listProfiles, listStudentsByIds, planDb } from '@/lib/plan/db';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { fmtDateShort, fmtDateTime } from '@/lib/suivi/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/** Candidats ayant un planning : couverture, avancement, dernier recalcul. */
export default async function PlanCandidatsPage() {
  const [profiles, colleges] = await Promise.all([listProfiles(), listColleges()]);
  const onboarded = profiles.filter((p) => p.onboarding_done);
  const students = new Map((await listStudentsByIds(onboarded.map((p) => p.user_id))).map((s) => [s.id, s]));
  const nameOf = new Map(colleges.map((c) => [c.id, c.nom]));
  type M = { user_id: string; status: string };
  const mastery = onboarded.length > 0 ? await fetchAllRows<M>((from, to) => planDb().from('plan_mastery').select('user_id, status').in('user_id', onboarded.map((p) => p.user_id).slice(0, 500)).order('user_id').order('item_id').range(from, to)) : [];
  const stats = new Map<string, { total: number; covered: number }>();
  for (const m of mastery) {
    const s = stats.get(m.user_id) ?? { total: 0, covered: 0 };
    s.total++; if (m.status === 'maitrise' || m.status === 'a_reactiver' || m.status === 'a_consolider') s.covered++;
    stats.set(m.user_id, s);
  }
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Candidats</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{onboarded.length} candidat(s) avec un planning généré.</p>
      </header>
      <div className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
        <Table>
          <TableHeader><TableRow><TableHead>Candidat</TableHead><TableHead>Spécialité</TableHead><TableHead>Voie</TableHead><TableHead>Épreuves</TableHead><TableHead>Couverture</TableHead><TableHead>Dernier recalcul</TableHead><TableHead>Information acceptée</TableHead></TableRow></TableHeader>
          <TableBody>
            {onboarded.length === 0 && <TableRow><TableCell colSpan={7} className="text-sm text-(--color-ink-soft)">Aucun candidat n’a encore généré de planning.</TableCell></TableRow>}
            {onboarded.map((p) => {
              const s = students.get(p.user_id);
              const st = stats.get(p.user_id);
              return (
                <TableRow key={p.user_id}>
                  <TableCell><Link href={`/admin/planificateur/candidats/${p.user_id}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{[s?.first_name, s?.last_name].filter(Boolean).join(' ') || s?.email || p.user_id.slice(0, 8)}</Link><br /><span className="text-xs text-(--color-ink-muted)">{s?.email}</span></TableCell>
                  <TableCell className="text-sm">{p.specialite_id ? nameOf.get(p.specialite_id) ?? p.specialite_id : '—'}</TableCell>
                  <TableCell className="text-sm">{p.voie ?? '—'}</TableCell>
                  <TableCell className="text-sm">{p.exam_date ? fmtDateShort(`${p.exam_date}T12:00:00Z`) : '—'}</TableCell>
                  <TableCell className="text-sm tabular-nums">{st && st.total > 0 ? `${Math.round((st.covered / st.total) * 100)} % (${st.covered}/${st.total})` : '—'}</TableCell>
                  <TableCell className="text-xs text-(--color-ink-soft)">{fmtDateTime(p.last_generated_at)} · v{p.plan_version}</TableCell>
                  <TableCell className="text-xs text-(--color-ink-soft)">{fmtDateTime(p.consent_accepted_at)} (v{p.consent_version ?? '—'})</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
