import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Download, FileText, Pencil } from 'lucide-react';
import { requireUser, profPageReadGuard, canEditCoursContent } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { canAccessCollege, canDownloadFiche, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { EditHintTooltip } from '@/components/professor/edit-hint-tooltip';
import { ficheLabel, trierFiches } from '@/lib/fiches/documents';

/** Ligne `fiches` telle que sélectionnée ci-dessous. */
type FicheRow = {
  id: string;
  titre: string | null;
  storage_path: string | null;
  pages: number | null;
  order_index: number | null;
  created_at: string | null;
};

/**
 * Onglet « Fiche de cours ».
 *
 * Un item peut porter PLUSIEURS fiches : elles sont toutes ici, sous forme de
 * pastilles (comme les supports de séance), la première ouverte par défaut et
 * `?doc=<id>` pour choisir. Chaque PDF est servi filigrané au nom de l'élève
 * par /api/fiches/[cours]/pdf.
 */
export default async function CoursFichePage({
  params,
  searchParams,
}: {
  params: Promise<{ cours: string }>;
  searchParams: Promise<{ doc?: string; embed?: string }>;
}) {
  const { cours: coursId } = await params;
  const { doc: docId, embed } = await searchParams;
  const embedQs = embed ? `&embed=${encodeURIComponent(embed)}` : '';
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      fiches(id, titre, storage_path, pages, order_index, created_at),
      course_progress(fiche_read)
    `)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (profile.role !== 'admin' && !(await fetchContentAccessForScope(scope)).fiche) redirect(`/cours/${coursId}`);
  profPageReadGuard(profile, 'fiche', `/cours/${coursId}`);

  // Seules les fiches réellement téléversées sont proposées : une ligne sans
  // fichier (fiche en cours de rédaction) ne doit pas créer une pastille vide.
  const toutes = trierFiches((c.fiches ?? []) as unknown as FicheRow[]);
  const fiches = toutes.filter((f) => !!f.storage_path);
  const courant = (docId && fiches.find((f) => f.id === docId)) || fiches[0] || null;
  // L'éditeur en ligne agit sur la fiche PRINCIPALE : on ne propose « Éditer »
  // que lorsque c'est bien elle qui est affichée, pour ne pas laisser croire
  // qu'on modifie le document en cours de lecture.
  const estPrincipale = !!courant && courant.id === toutes[0]?.id;

  const initiallyRead = !!c.course_progress?.[0]?.fiche_read;
  // Écriture sur le type « fiche » ET item attribué : sans la seconde condition,
  // le bouton mène à un éditeur inaccessible (404). Cf. prof-content-access.ts.
  const canEdit = canEditCoursContent(profile, 'fiche', c.matiere_id, c.id);
  // Téléchargement : admin toujours ; sinon droit global (can_download) ou
  // droit accordé sur la spécialité de ce cours (download_colleges).
  const canDownload = canDownloadFiche(
    profile as { role?: string | null; can_download?: boolean | null; download_colleges?: string[] | null },
    c.matiere_id,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
      <div className="mb-2 flex items-center gap-3 sm:mb-3">
        {courant?.pages && (
          <p className="text-xs text-(--color-ink-soft) sm:text-sm">{courant.pages} pages</p>
        )}
        {(canEdit || canDownload) && (
          <div className="ml-auto flex items-center gap-2">
            {canDownload && courant && (
              <a
                href={`/api/fiches/${coursId}/download?doc=${courant.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100)"
              >
                <Download className="h-3.5 w-3.5" /> Télécharger
              </a>
            )}
            {canEdit && estPrincipale && (
            <EditHintTooltip contentType="fiche" message="Cliquez ici pour modifier directement le contenu de la fiche de cours.">
              <Link
                href={`/cours/${coursId}/fiche/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100)"
              >
                <Pencil className="h-3.5 w-3.5" /> Éditer la fiche
              </Link>
            </EditHintTooltip>
            )}
          </div>
        )}
      </div>

      {/* Plusieurs fiches : une pastille par document, la première par défaut. */}
      {fiches.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {fiches.map((f, i) => {
            const actif = f.id === courant?.id;
            return (
              <Link
                key={f.id}
                href={`/cours/${coursId}/fiche?doc=${f.id}${embedQs}`}
                className={
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ' +
                  (actif
                    ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                    : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:bg-(--color-sand-100)')
                }
              >
                <FileText className="h-3.5 w-3.5" />
                {ficheLabel(f, i)}
              </Link>
            );
          })}
        </div>
      )}

      {courant ? (
        <>
          {/* Titre choisi par l'équipe pédagogique, affiché AVANT le document. */}
          <h1 className="mb-2 text-lg font-bold tracking-tight text-(--color-ink) sm:mb-3 sm:text-xl">
            {ficheLabel(courant, fiches.indexOf(courant))}
          </h1>
          <PdfViewer
            key={courant.id}
            src={`/api/fiches/${coursId}/pdf?doc=${courant.id}`}
            coursId={coursId}
            initiallyRead={initiallyRead}
          />
        </>
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
