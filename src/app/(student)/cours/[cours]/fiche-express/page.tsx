import { notFound, redirect } from 'next/navigation';
import { FileText, Sparkles } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { EmptyState } from '@/components/empty-state';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

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
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  const fiche = c.fiches?.[0];
  const hasFiche = !!fiche?.storage_path;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <p className="text-xs font-semibold text-(--color-ink-soft) sm:text-sm">
          Synthèse condensée — dernière page de la fiche de cours
        </p>
      </div>
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
