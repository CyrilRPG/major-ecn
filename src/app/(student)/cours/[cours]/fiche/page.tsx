import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Download, FileText, Pencil } from 'lucide-react';
import { requireUser, profPageReadGuard, getProfessorScope } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { canAccessCollege, parseScope, getContentAccess } from '@/lib/auth/permissions';
import { canWrite } from '@/lib/schemas/professor';

export default async function CoursFichePage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { profile } = await requireUser();
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
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (profile.role !== 'admin' && !getContentAccess(scope.offer).fiche) redirect(`/cours/${coursId}`);
  profPageReadGuard(profile, 'fiche', `/cours/${coursId}`);

  const fiche = c.fiches?.[0];
  // PDF watermarké à la volée avec l'identité de l'utilisateur connecté
  // (route /api/fiches/[cours]/pdf). Pas d'URL signée nécessaire ; l'auth
  // est gérée côté route via Supabase cookies.
  const pdfUrl: string | null = fiche?.storage_path ? `/api/fiches/${coursId}/pdf` : null;
  const initiallyRead = !!c.course_progress?.[0]?.fiche_read;
  const canEdit = profile.role === 'admin'
    || (profile.role === 'professor' && canWrite(getProfessorScope(profile.permission_scope), 'fiche'));
  // Téléchargement : admin toujours ; prof/élève seulement si l'admin l'a autorisé.
  const canDownload = profile.role === 'admin'
    || (profile as { can_download?: boolean }).can_download === true;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
      <div className="mb-2 flex items-center gap-3 sm:mb-3">
        {fiche?.pages && (
          <p className="text-xs text-(--color-ink-soft) sm:text-sm">{fiche.pages} pages</p>
        )}
        {(canEdit || canDownload) && (
          <div className="ml-auto flex items-center gap-2">
            {canDownload && fiche?.storage_path && (
              <a
                href={`/api/fiches/${coursId}/download`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100)"
              >
                <Download className="h-3.5 w-3.5" /> Télécharger
              </a>
            )}
            {canEdit && (
            <Link
              href={`/cours/${coursId}/fiche/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100)"
            >
              <Pencil className="h-3.5 w-3.5" /> Éditer la fiche
            </Link>
            )}
          </div>
        )}
      </div>
      {pdfUrl ? (
        <PdfViewer src={pdfUrl} coursId={coursId} initiallyRead={initiallyRead} />
      ) : (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
          <EmptyState
            icon={FileText}
            title="Fiche bientôt disponible"
            description="La fiche de cours exhaustive est en cours de rédaction par l’équipe pédagogique. Revenez d’ici quelques jours."
          />
        </div>
      )}
    </div>
  );
}
