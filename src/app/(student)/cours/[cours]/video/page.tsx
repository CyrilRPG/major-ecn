import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FileText, PlayCircle } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { VideoPlayer } from '@/components/student/video-player';
import { NextSteps } from '@/components/student/next-steps';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export default async function CoursVideoPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      videos(id, storage_path)
    `)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  const facId = c.matieres.semestres.faculte_id;
  if (!canAccessFaculte(parseScope(profile.permission_scope), facId)) redirect('/facultes');

  const video = c.videos?.[0];
  let signedUrl: string | null = null;
  if (video?.storage_path) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(video.storage_path, 60 * 60);
    signedUrl = data?.signedUrl ?? null;
  }

  return (
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: c.matieres.semestres.facultes?.nom ?? '', href: `/facultes/${facId}` },
          { label: c.matieres.semestres.label, href: `/facultes/${facId}/${c.matieres.semestre_id}` },
          { label: c.matieres.nom, href: `/matieres/${c.matiere_id}` },
          { label: c.titre, href: `/cours/${coursId}` },
          { label: 'Vidéo' },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-6 lg:px-8 py-12">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-(--color-primary-deep)">Vidéo</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">{c.titre}</h1>
        </header>

        {signedUrl ? (
          <VideoPlayer src={signedUrl} coursId={coursId} />
        ) : (
          <div className="surface-card py-2">
            <EmptyState
              icon={PlayCircle}
              title="Vidéo bientôt disponible"
              description="L’enregistrement de ce cours est en cours de post-production. En attendant, ouvre la fiche de cours pour avancer ta préparation."
              action={
                <Button asChild>
                  <Link href={`/cours/${coursId}/fiche`}>
                    <FileText />
                    Ouvrir la fiche de cours
                  </Link>
                </Button>
              }
            />
          </div>
        )}

        <NextSteps
          coursId={coursId}
          title="Continuer le parcours"
          steps={['fiche', 'qcm', 'flashcards']}
        />
      </main>
    </>
  );
}
