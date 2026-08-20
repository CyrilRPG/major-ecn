import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope, scopeOffers } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { supportVisible, eleveAutorise, eleveExclu } from '@/lib/videos/audience';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { EmptyState } from '@/components/empty-state';
import { supportPageTitle, type SupportVideoType } from '@/lib/student/supports';

/**
 * Supports d'une séance : consultation en ligne uniquement.
 *
 * Une séance peut porter plusieurs documents : on liste ceux-ci et on affiche
 * celui choisi (`?doc=`), le premier par défaut. Chaque PDF est rendu en
 * <canvas> (comme les fiches) — pas de visionneuse native, donc pas de bouton
 * de téléchargement ni d'impression — et filigrané au nom de l'élève par
 * /api/supports/[videoId]/pdf. Cette page contrôle les mêmes droits que la
 * route, pour que rien ne s'affiche qui ne serait pas servi.
 */
export default async function SupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ cours: string; videoId: string }>;
  searchParams: Promise<{ doc?: string; embed?: string }>;
}) {
  const { cours: coursId, videoId } = await params;
  const { doc: docId, embed } = await searchParams;
  const embedQs = embed ? `&embed=${encodeURIComponent(embed)}` : '';
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase as any)
    .from('videos')
    .select(`
      id, titre, type, cours_id, voies, offers, denied_user_ids, allowed_user_ids,
      video_supports(id, titre, order_index, voies, offers),
      cours:cours_id(id, titre, matiere_id, matieres(nom, access_type))
    `)
    .eq('id', videoId)
    .maybeSingle();

  type SupportDoc = { id: string; titre: string; order_index: number; voies: string[] | null; offers: string[] | null };
  const video = row as {
    id: string; titre: string; type: SupportVideoType; cours_id: string;
    voies: string[] | null; offers: string[] | null;
    denied_user_ids: string[] | null; allowed_user_ids: string[] | null;
    video_supports?: SupportDoc[] | null;
    cours?: { id: string; titre: string; matiere_id: string; matieres?: { nom?: string; access_type?: string } | null } | null;
  } | null;

  if (!video?.cours || video.cours_id !== coursId) notFound();

  const isStaff = profile.role === 'admin' || profile.role === 'professor';
  const scope = parseScope(profile.permission_scope);

  let docs = (video.video_supports ?? []).slice().sort((a, b) => a.order_index - b.order_index);
  if (!isStaff) {
    // Autorisation nominative sur la séance : contourne le cadenas collège pour
    // que l'élève puisse ouvrir les supports qui lui sont destinés (l'exclusion
    // continue de primer).
    const autorise = eleveAutorise(video, user.id) && !eleveExclu(video, user.id);
    const collegeAccess = (video.cours.matieres?.access_type as 'all' | 'specific' | undefined) ?? 'all';
    if (!canAccessCollege(scope, video.cours.matiere_id, collegeAccess) && !autorise) redirect('/facultes');
    const access = await fetchContentAccessForScope(scope);
    // Chaque support porte ses PROPRES permissions si l'admin les a définies,
    // sinon il hérite de celles de la vidéo (voies + formules + exclusions).
    const droitFormule = video.type === 'seance_approfondie' ? access.seanceApprofondie : access.video;
    docs = docs.filter((d) => supportVisible(d, video, {
      offres: scopeOffers(scope), voie: scope.voie ?? null, droitFormule, userId: user.id,
    }));
    if (docs.length === 0) redirect(`/cours/${coursId}`);
  }

  const courant = (docId && docs.find((d) => d.id === docId)) || docs[0] || null;

  // Le support prend la couleur de la vidéo dont il dépend : rouge pour un
  // cours vidéo, violet pour une séance approfondie — comme les cartes de
  // l'aperçu de l'item.
  const accent = video.type === 'seance_approfondie' ? '#7C3AED' : '#E4002B';

  const entete = (
    <div className="mb-2 sm:mb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
        {video.cours.matieres?.nom}
      </p>
      <h1 className="mt-0.5 text-lg font-bold tracking-tight text-(--color-ink) sm:text-xl">
        {supportPageTitle({ videoId: video.id, titre: video.titre, type: video.type })}
      </h1>
    </div>
  );

  if (!courant) {
    return (
      <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
        {entete}
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
          <EmptyState
            icon={FileText}
            title="Aucun support pour l’instant"
            description="Les documents de cette séance seront ajoutés prochainement."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
      {entete}

      {/* Plusieurs documents : un onglet par document, le premier par défaut. */}
      {docs.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {docs.map((d, i) => {
            const actif = d.id === courant.id;
            return (
              <Link
                key={d.id}
                href={`/cours/${coursId}/support/${videoId}?doc=${d.id}${embedQs}`}
                className={
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ' +
                  (actif
                    ? ''
                    : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:bg-(--color-sand-100)')
                }
                style={actif
                  ? { borderColor: accent, background: `color-mix(in srgb, ${accent} 12%, white)`, color: accent }
                  : undefined}
              >
                <FileText className="h-3.5 w-3.5" />
                {d.titre?.trim() || `Document ${i + 1}`}
              </Link>
            );
          })}
        </div>
      )}

      <PdfViewer
        key={courant.id}
        src={`/api/supports/${videoId}/pdf?doc=${courant.id}`}
        coursId={coursId}
        initiallyRead={false}
        canMarkRead={false}
        notice={docs.length > 1
          ? `${courant.titre} — consultable en ligne uniquement.`
          : 'Support consultable en ligne uniquement.'}
      />
    </div>
  );
}
