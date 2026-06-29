import { notFound, redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { EmptyState } from '@/components/empty-state';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccess } from '@/lib/auth/formula-permissions';

export default async function FicheExpressPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label)),
      fiches(id, storage_path, pages)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c || !c.matieres) notFound();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (profile.role !== 'admin' && !(await fetchContentAccess(scope.offer)).ficheExpress) redirect(`/cours/${coursId}`);

  const fiche = c.fiches?.[0];
  const hasFiche = !!fiche?.storage_path;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
      {hasFiche ? (
        <PdfViewer src={`/api/fiches/${coursId}/express`} coursId={coursId} initiallyRead={true} />
      ) : (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
          <EmptyState
            icon={FileText}
            title="Fiche Express bientôt disponible"
            description="La fiche de cours n'est pas encore publiée. La fiche express sera automatiquement générée une fois la fiche complète disponible."
          />
        </div>
      )}
    </div>
  );
}
