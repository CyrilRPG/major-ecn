import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Pencil, Video } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { BunnyVideoPlayer } from '@/components/student/bunny-video-player';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { EmptyState } from '@/components/empty-state';

export default async function SeanceApprofondiePage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const isAdmin = profile.role === 'admin';

  const scope = parseScope(profile.permission_scope);
  if (scope.offer !== 'approfondi' && !isAdmin) redirect(`/cours/${coursId}`);

  const { data: c } = await supabase
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  if (!c) notFound();
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');

  // Admins bypass séance completion check.
  if (!isAdmin) {
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
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: videos } = await (supabase as any)
    .from('videos')
    .select('id, titre, bunny_video_id')
    .eq('cours_id', coursId)
    .eq('type', 'seance_approfondie')
    .order('created_at', { ascending: true });

  type SAVideo = { id: string; titre: string; bunny_video_id: string | null };
  const saVideos = (videos ?? []) as SAVideo[];
  const BUNNY_LIBRARY = process.env.BUNNY_STREAM_LIBRARY_ID ?? '691475';
  const watermarkText = `Accès réservé à ${profile.first_name} ${profile.last_name} — ${user.email}`;

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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
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
        {isAdmin && (
          <Link
            href={`/admin/contenu/${coursId}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs font-semibold text-(--color-ink-soft) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-ink)"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </Link>
        )}
      </div>

      <div className="space-y-8">
        {saVideos.map((v) => {
          const bunnyId = v.bunny_video_id;
          const embed = bunnyId && BUNNY_LIBRARY ? bunnyEmbedUrl(bunnyId, { libraryId: BUNNY_LIBRARY }) : null;
          return (
            <section key={v.id}>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-(--color-ink)">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3EAFF] text-[#7C3AED]">
                  <Video className="h-4 w-4" />
                </span>
                {v.titre}
              </h2>
              {embed ? (
                <BunnyVideoPlayer embedUrl={embed} coursId={coursId} watermarkText={watermarkText} />
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
