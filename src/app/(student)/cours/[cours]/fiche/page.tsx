import { notFound, redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

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
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  const fiche = c.fiches?.[0];
  // PDF watermarké à la volée avec l'identité de l'utilisateur connecté
  // (route /api/fiches/[cours]/pdf). Pas d'URL signée nécessaire ; l'auth
  // est gérée côté route via Supabase cookies.
  const pdfUrl: string | null = fiche?.storage_path ? `/api/fiches/${coursId}/pdf` : null;
  const initiallyRead = !!c.course_progress?.[0]?.fiche_read;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      {fiche?.pages && (
        <p className="mb-3 text-sm text-(--color-ink-soft)">{fiche.pages} pages</p>
      )}
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
