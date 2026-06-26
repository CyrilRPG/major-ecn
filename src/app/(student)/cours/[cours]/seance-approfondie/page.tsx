import { notFound, redirect } from 'next/navigation';
import { Video } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { BunnyVideoPlayer } from '@/components/student/bunny-video-player';
import { bunnyEmbedUrl, getBunnyConfig } from '@/lib/bunny';
import { EmptyState } from '@/components/empty-state';

export default async function SeanceApprofondiePage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const scope = parseScope(profile.permission_scope);
  if (scope.offer !== 'approfondi' && profile.role !== 'admin') redirect(`/cours/${coursId}`);

  const { data: c } = await supabase
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  if (!c) notFound();
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');

  // Vérifier que toutes les séances du prof sont complétées.
  const { data: seanceSeries } = await supabase
    .from('qcm_series')
    .select('id')
    .eq('cours_id', coursId)
    .eq('type', 'seance');
  const seanceIds = (seanceSeries ?? []).map((s) => s.id);
  if (seanceIds.length > 0) {
    const { data: completedSessions } = await supabase
      .from('qcm_sessions')
      .select('serie_id')
      .eq('user_id', user.id)
      .in('serie_id', seanceIds)
      .not('finished_at', 'is', null);
    const completedSerieIds = new Set((completedSessions ?? []).map((s) => s.serie_id));
    if (!seanceIds.every((id) => completedSerieIds.has(id))) {
      redirect(`/cours/${coursId}`);
    }
  }

  // Charger les vidéos de séance approfondie.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: videos } = await (supabase as any)
    .from('videos')
    .select('id, titre, bunny_video_id')
    .eq('cours_id', coursId)
    .eq('type', 'seance_approfondie')
    .order('created_at', { ascending: true });

  type SAVideo = { id: string; titre: string; bunny_video_id: string | null };
  const saVideos = (videos ?? []) as SAVideo[];

  if (saVideos.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
          <EmptyState
            icon={Video}
            title="Vidéos bientôt disponibles"
            description="Les séances approfondies pour ce cours sont en cours de préparation."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7C3AED]">
          {c.matieres?.nom} · Programme Approfondi
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--color-ink)">
          Séances approfondies
        </h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Cours vidéo approfondis par le professeur pour aller plus loin dans la maîtrise de la spécialité.
        </p>
      </div>

      <div className="space-y-8">
        {saVideos.map((v) => {
          const bunnyId = v.bunny_video_id;
          const embed = bunnyId && getBunnyConfig() ? bunnyEmbedUrl(bunnyId) : null;
          return (
            <section key={v.id}>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-(--color-ink)">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3EAFF] text-[#7C3AED]">
                  <Video className="h-4 w-4" />
                </span>
                {v.titre}
              </h2>
              {embed ? (
                <BunnyVideoPlayer embedUrl={embed} coursId={coursId} />
              ) : (
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
                  <EmptyState
                    icon={Video}
                    title="Vidéo bientôt disponible"
                    description="Cette séance approfondie est en cours de post-production."
                  />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
