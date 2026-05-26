import { Activity, ClipboardCheck, Target, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/admin/stats/kpi-card';
import { ActivityArea, SuccessRateBar, TopCoursesBar } from '@/components/admin/stats/charts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Statistiques' };

function isoDayKey(d: Date) { return d.toISOString().slice(0, 10); }

export default async function AdminStatsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000);

  const [
    { count: studentsCount },
    { count: sessions7d },
    { data: attempts },
    { data: sessions30 },
    { data: profiles },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('qcm_sessions').select('id', { count: 'exact', head: true }).gte('started_at', sevenDaysAgo),
    supabase
      .from('qcm_attempts')
      .select('id, user_id, is_correct, attempted_at, qcm_questions!inner(serie_id, qcm_series!inner(cours_id, cours!inner(id, titre, matieres!inner(id, nom))))'),
    supabase.from('qcm_sessions').select('id, user_id, started_at').gte('started_at', thirtyDaysAgo.toISOString()),
    supabase.from('profiles').select('id, first_name, last_name, promotion, permission_scope').eq('role', 'student'),
  ]);

  const activeUsers7d = new Set<string>();
  let attemptsTotal = 0, attemptsCorrect = 0;
  const coursTitleHits = new Map<string, { titre: string; count: number }>();
  const matiereSuccess = new Map<string, { nom: string; total: number; correct: number }>();
  const userStats = new Map<string, { total: number; correct: number }>();

  for (const a of (attempts ?? []) as Array<{
    user_id: string; is_correct: boolean; attempted_at: string;
    qcm_questions: { qcm_series: { cours_id: string; cours: { id: string; titre: string; matieres: { id: string; nom: string } } } };
  }>) {
    const at = new Date(a.attempted_at);
    if (at.getTime() >= Date.now() - 7 * 86400_000) activeUsers7d.add(a.user_id);
    attemptsTotal++;
    if (a.is_correct) attemptsCorrect++;
    const cours = a.qcm_questions.qcm_series.cours;
    const cur = coursTitleHits.get(cours.id) ?? { titre: cours.titre, count: 0 };
    cur.count++;
    coursTitleHits.set(cours.id, cur);
    const mat = cours.matieres;
    const m = matiereSuccess.get(mat.id) ?? { nom: mat.nom, total: 0, correct: 0 };
    m.total++; if (a.is_correct) m.correct++;
    matiereSuccess.set(mat.id, m);
    const us = userStats.get(a.user_id) ?? { total: 0, correct: 0 };
    us.total++; if (a.is_correct) us.correct++;
    userStats.set(a.user_id, us);
  }

  const successRate = attemptsTotal > 0 ? Math.round((attemptsCorrect / attemptsTotal) * 100) : 0;

  // Activity area (30j)
  const days: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    days.push({ label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), value: 0 });
  }
  const dayIndex = (d: string) => {
    const target = isoDayKey(new Date(d));
    return days.findIndex((x, i) => {
      const cur = new Date(Date.now() - (29 - i) * 86400_000);
      return isoDayKey(cur) === target;
    });
  };
  for (const s of sessions30 ?? []) {
    const i = dayIndex(s.started_at);
    if (i >= 0) days[i].value++;
  }

  const topCourses = [...coursTitleHits.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((c) => ({ label: c.titre.length > 22 ? c.titre.slice(0, 22) + '…' : c.titre, value: c.count }));

  const successByMatiere = [...matiereSuccess.values()]
    .sort((a, b) => (b.correct / Math.max(1, b.total)) - (a.correct / Math.max(1, a.total)))
    .map((m) => ({ label: m.nom, value: m.total > 0 ? (m.correct / m.total) * 100 : 0 }));

  const leaderboard = [...userStats.entries()]
    .map(([userId, s]) => {
      const p = (profiles ?? []).find((pr) => pr.id === userId);
      return {
        id: userId,
        name: `${p?.first_name ?? ''} ${p?.last_name ?? ''}`.trim() || 'Sans nom',
        promotion: p?.promotion,
        attempts: s.total,
        rate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      };
    })
    .sort((a, b) => b.attempts - a.attempts || b.rate - a.rate)
    .slice(0, 10);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-8 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Statistiques globales</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">Activité, réussite et engagement en temps réel.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard Icon={Users}          label="Élèves inscrits"          value={studentsCount ?? 0} accent="#E4002B" />
        <KpiCard Icon={Activity}       label="Actifs (7 j)"             value={activeUsers7d.size} accent="#C0001F" hint="QCM, flashcards ou progression" />
        <KpiCard Icon={ClipboardCheck} label="Sessions QCM (7 j)"        value={sessions7d ?? 0} accent="#5B8DEF" />
        <KpiCard Icon={Target}         label="Taux de réussite moyen"    value={`${successRate}%`} accent="#16A34A" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Activité sur 30 jours</CardTitle>
            <CardDescription>Nombre de sessions QCM démarrées par jour.</CardDescription>
          </CardHeader>
          <CardContent><ActivityArea data={days} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 des cours les plus travaillés</CardTitle>
            <CardDescription>Mesuré au nombre de questions tentées.</CardDescription>
          </CardHeader>
          <CardContent><TopCoursesBar data={topCourses} /></CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Taux de réussite par matière</CardTitle>
          <CardDescription>Moyenne sur l’ensemble des tentatives.</CardDescription>
        </CardHeader>
        <CardContent><SuccessRateBar data={successByMatiere} /></CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Leaderboard activité</CardTitle>
          <CardDescription>Élèves les plus actifs et leur taux de réussite.</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-(--color-ink-soft)">Pas encore de données. Tes élèves doivent faire au moins une question pour apparaître ici.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Promo</TableHead>
                  <TableHead className="text-right">Tentatives</TableHead>
                  <TableHead className="text-right">Réussite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8"><AvatarFallback>{initials(u.name.split(' ')[0], u.name.split(' ').slice(-1)[0])}</AvatarFallback></Avatar>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{u.promotion && <Badge variant="outline">{u.promotion}</Badge>}</TableCell>
                    <TableCell className="text-right tabular-nums">{u.attempts}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={u.rate >= 70 ? 'success' : u.rate >= 50 ? 'warning' : 'danger'}>{u.rate}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
