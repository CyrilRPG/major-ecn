import { notFound, redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { EmptyState } from '@/components/empty-state';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';

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
  if (profile.role !== 'admin' && !canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (profile.role !== 'admin' && !(await fetchContentAccessForScope(scope)).ficheExpress) redirect(`/cours/${coursId}`);

  // Un item peut porter plusieurs fiches : il suffit qu'UNE ait un PDF pour que
  // la fiche éclair soit proposée (la route extrait la fiche principale).
  const hasFiche = (c.fiches ?? []).some((f) => !!f.storage_path);

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
      {hasFiche ? (
        <PdfViewer src={`/api/fiches/${coursId}/express`} coursId={coursId} initiallyRead={true} />
      ) : (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
          <EmptyState
            icon={FileText}
            title="Fiche éclair bientôt disponible"
            description="La fiche de cours n'est pas encore publiée. La fiche éclair sera automatiquement générée une fois la fiche complète disponible."
          />
        </div>
      )}
    </div>
  );
}
