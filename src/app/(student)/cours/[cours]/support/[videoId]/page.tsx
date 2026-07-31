import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { supportPageTitle, type SupportVideoType } from '@/lib/student/supports';

/**
 * Support d'une séance : consultation en ligne uniquement.
 *
 * Le PDF est rendu en <canvas> (comme les fiches) : pas de visionneuse native,
 * donc pas de bouton de téléchargement ni d'impression, et il est filigrané au
 * nom de l'élève par /api/supports/[videoId]/pdf. Cette page contrôle les mêmes
 * droits que la route, pour que rien ne s'affiche qui ne serait pas servi.
 */
export default async function SupportPage({
  params,
}: {
  params: Promise<{ cours: string; videoId: string }>;
}) {
  const { cours: coursId, videoId } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase as any)
    .from('videos')
    .select('id, titre, type, support_path, cours_id, cours:cours_id(id, titre, matiere_id, matieres(nom, access_type))')
    .eq('id', videoId)
    .maybeSingle();

  const video = row as {
    id: string; titre: string; type: SupportVideoType; support_path: string | null; cours_id: string;
    cours?: { id: string; titre: string; matiere_id: string; matieres?: { nom?: string; access_type?: string } | null } | null;
  } | null;

  if (!video?.support_path || !video.cours || video.cours_id !== coursId) notFound();

  const isStaff = profile.role === 'admin' || profile.role === 'professor';
  const scope = parseScope(profile.permission_scope);
  if (!isStaff) {
    const collegeAccess = (video.cours.matieres?.access_type as 'all' | 'specific' | undefined) ?? 'all';
    if (!canAccessCollege(scope, video.cours.matiere_id, collegeAccess)) redirect('/facultes');
    const access = await fetchContentAccessForScope(scope);
    const allowed = video.type === 'seance_approfondie' ? access.seanceApprofondie : access.video;
    if (!allowed) redirect(`/cours/${coursId}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
      <div className="mb-2 sm:mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7C3AED]">
          {video.cours.matieres?.nom}
        </p>
        <h1 className="mt-0.5 text-lg font-bold tracking-tight text-(--color-ink) sm:text-xl">
          {supportPageTitle({ videoId: video.id, titre: video.titre, type: video.type })}
        </h1>
      </div>
      <PdfViewer
        src={`/api/supports/${videoId}/pdf`}
        coursId={coursId}
        initiallyRead={false}
        canMarkRead={false}
        notice="Support consultable en ligne uniquement."
      />
    </div>
  );
}
