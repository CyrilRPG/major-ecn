import Link from 'next/link';
import { ArrowRight, CalendarClock, CheckCircle2, Clock, PencilRuler } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope } from '@/lib/auth/permissions';
import { isExamTargeted } from '@/lib/exams/targeting';
import { examWindow, resultsVisible } from '@/lib/exams/window';
import { IndexHeader } from '@/components/shell/index-view';

export const metadata = { title: 'Épreuves blanches' };
export const dynamic = 'force-dynamic';

export default async function StudentExamsPage() {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const promotion = (profile as { promotion?: string }).promotion;

  const supabase = await createClient();
  // Lecture RLS : seules les épreuves publiées sont visibles.
  const { data: examsRaw } = await supabase
    .from('mock_exams')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('id, title, college_id, duration_minutes, instructions, min_offer, target_colleges, voies, target_promos, publish_at, exam_mode, qroc_mode, open_at, close_at, absence_mode, rattrapage_open_at, rattrapage_close_at, results_publish_mode, results_publish_at') as any;

  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessible = ((examsRaw ?? []) as any[])
    .filter((e) => !e.publish_at || new Date(e.publish_at).getTime() <= now)
    .filter((e) => isExamTargeted(e, scope, promotion));

  // Copies de l'élève (statut par épreuve)
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (admin as any)
    .from('mock_exam_submissions').select('exam_id, status, percentage').eq('user_id', user.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subByExam = new Map<string, { status: string; percentage: number }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const s of (subs ?? []) as any[]) {
    const prev = subByExam.get(s.exam_id);
    if (!prev || s.status !== 'in_progress') subByExam.set(s.exam_id, { status: s.status, percentage: s.percentage });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: colsRaw } = await (admin as any).from('matieres').select('id, nom');
  const collegeName = new Map<string, string>(((colsRaw ?? []) as { id: string; nom: string }[]).map((c) => [c.id, c.nom]));

  return (
    <div>
      <IndexHeader
        context="Entraînement"
        title="Épreuves blanches"
        meta={accessible.length > 0 ? `${accessible.length} disponible${accessible.length > 1 ? 's' : ''}` : undefined}
      />
      <div className="px-6 py-6 lg:px-10">
        {accessible.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary)"><PencilRuler className="h-6 w-6" /></span>
            <p className="mt-4 font-display text-lg font-semibold text-(--color-ink)">Aucune épreuve blanche pour le moment</p>
            <p className="mt-2 text-sm text-(--color-ink-soft)">De nouvelles épreuves seront publiées ici par l’équipe pédagogique.</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {accessible.map((e) => {
              const sub = subByExam.get(e.id);
              const done = sub && (sub.status === 'graded' || sub.status === 'submitted');
              const win = examWindow(e, null, now, !!done);
              const scheduled = e.exam_mode === 'scheduled';
              // Badge + libellé du CTA selon l'état.
              let badge: React.ReactNode = null;
              let cta = 'Composer';
              if (done) {
                const visible = resultsVisible(e, now);
                badge = <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[11px] font-bold text-[#16793C]"><CheckCircle2 className="h-3 w-3" /> {visible ? `${sub!.percentage}%` : 'remise'}</span>;
                cta = visible ? 'Voir mes résultats' : 'Copie remise';
              } else if (scheduled && win.reason === 'before') {
                badge = <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1FB] px-2 py-0.5 text-[11px] font-bold text-[#1E40AF]"><CalendarClock className="h-3 w-3" /> {win.opensAt ? new Date(win.opensAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'programmée'}</span>;
                cta = 'Programmée';
              } else if (scheduled && !win.canCompose) {
                badge = <span className="inline-flex items-center gap-1 rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-semibold text-(--color-ink-soft)">Absent</span>;
                cta = 'Fenêtre fermée';
              } else if (e.duration_minutes) {
                badge = <span className="inline-flex items-center gap-1 rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-semibold text-(--color-ink-soft)"><Clock className="h-3 w-3" /> {e.duration_minutes} min</span>;
                cta = win.reason === 'rattrapage' ? 'Rattrapage — composer' : 'Composer';
              }
              return (
                <li key={e.id}>
                  <Link href={`/epreuves-blanches/${e.id}`} className="group flex h-full flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted)">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)"><PencilRuler className="h-4.5 w-4.5" /></span>
                      {badge}
                    </div>
                    <p className="mt-3 flex-1 font-semibold text-(--color-ink)">{e.title}</p>
                    <p className="mt-1 text-xs text-(--color-ink-muted)">{e.college_id ? (collegeName.get(e.college_id) ?? '') : 'Transversale'}{scheduled ? ' · programmée' : ''}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-(--color-primary)">
                      {cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
