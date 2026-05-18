import { notFound, redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { NextSteps } from '@/components/student/next-steps';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export default async function CoursFichePage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      fiches(id, storage_path, pages),
      course_progress(fiche_read)
    `)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  const facId = c.matieres.semestres.faculte_id;
  if (!canAccessFaculte(parseScope(profile.permission_scope), facId)) redirect('/facultes');

  const fiche = c.fiches?.[0];
  let signedUrl: string | null = null;
  if (fiche?.storage_path) {
    const { data } = await supabase.storage.from('fiches').createSignedUrl(fiche.storage_path, 60 * 60);
    signedUrl = data?.signedUrl ?? null;
  }
  const initiallyRead = !!c.course_progress?.[0]?.fiche_read;

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
          { label: 'Fiche' },
        ]}
      />
      <main className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-12">
        <header className="mb-8 flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-(--color-primary-deep)">Fiche de cours</p>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">{c.titre}</h1>
          </div>
          {fiche?.pages && (
            <span className="text-sm text-(--color-ink-soft)">{fiche.pages} pages</span>
          )}
        </header>

        {signedUrl ? (
          <PdfViewer src={signedUrl} coursId={coursId} initiallyRead={initiallyRead} />
        ) : (
          <div className="surface-card py-2">
            <EmptyState
              icon={FileText}
              title="Fiche bientôt disponible"
              description="La fiche de cours est en cours de rédaction par l’équipe pédagogique. Reviens d’ici quelques jours."
            />
          </div>
        )}

        <NextSteps
          coursId={coursId}
          title="Passe à l’entraînement"
          steps={['qcm', 'annales', 'flashcards']}
        />
      </main>
      <input type="hidden" name="user-id" value={user.id} />
    </>
  );
}
