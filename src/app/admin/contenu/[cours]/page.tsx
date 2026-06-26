import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ClipboardList, FileText, History, Layers3, PlayCircle, Video } from 'lucide-react';
import { profCanAccessCours, requireContentEditor } from '@/lib/auth/require-role';
import { canRead, canWrite, type ContentType } from '@/lib/schemas/professor';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDropzone } from '@/components/admin/content/file-dropzone';
import { BunnyVideoUpload } from '@/components/admin/content/bunny-video-upload';
import { FicheHtmlUpload } from '@/components/admin/content/fiche-html-upload';
import { FlashcardEditor } from '@/components/admin/content/flashcard-editor';
import { EmptyState } from '@/components/empty-state';
import { GenerateButton } from '@/components/admin/generate-buttons';
import { AddAnnaleDialog } from '@/components/admin/content/add-annale-dialog';
import { ReindexButton } from '@/components/admin/reindex-button';
import { QcmSeriesManager } from '@/components/admin/content/qcm-series-manager';
import { BunnyLinkPaste } from '@/components/admin/content/bunny-link-paste';

export default async function AdminCoursPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { scope } = await requireContentEditor();
  // Helpers per content type (admin = tout autorisé)
  const allow = (t: ContentType): { read: boolean; write: boolean } =>
    scope === null ? { read: true, write: true } : { read: canRead(scope, t), write: canWrite(scope, t) };
  const can = {
    qcm: allow('qcm'),
    fiche: allow('fiche'),
    video: allow('video'),
    annale: allow('annale'),
    flashcards: allow('flashcards'),
  };
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, description, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      videos(id, storage_path, bunny_video_id),
      fiches(id, storage_path, pages),
      qcm_series(id, type, label, annee, qcm_questions(id)),
      flashcards(id, recto, verso, order_index)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c) notFound();
  if (!profCanAccessCours(scope, c.matiere_id, c.id)) redirect('/admin/contenu');

  const video = c.videos?.[0];
  const fiche = c.fiches?.[0];
  const qcmSeries = (c.qcm_series ?? []).filter((s) => s.type === 'qcm');
  const annales = (c.qcm_series ?? []).filter((s) => s.type === 'annale');
  const flashcards = (c.flashcards ?? []).sort((a, b) => a.order_index - b.order_index);

  // Vidéos séance approfondie (via colonne type)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: saVideoRows } = await (supabase as any)
    .from('videos')
    .select('id, titre, bunny_video_id')
    .eq('cours_id', coursId)
    .eq('type', 'seance_approfondie')
    .order('created_at', { ascending: true });
  const seanceApprofondieVideos = (saVideoRows ?? []) as { id: string; titre: string; bunny_video_id: string | null }[];

  // Charge le détail complet des séries QCM (questions + items + images + corrigé général)
  // pour l'éditeur intégré côté admin. Une seule requête supplémentaire.
  const qcmSerieIds = qcmSeries.map((s) => s.id);
  const { data: qcmDetail } = qcmSerieIds.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (supabase as any).from('qcm_questions')
        .select('id, serie_id, enonce, order_index, correction_generale, images, qcm_items(id, lettre, enonce, is_correct, justification, images)')
        .in('serie_id', qcmSerieIds)
        .order('order_index', { ascending: true })
    : { data: [] };
  // Vignettes par série (DP)
  const { data: vignetteRows } = qcmSerieIds.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (supabase as any).from('qcm_series')
        .select('id, vignette')
        .in('id', qcmSerieIds)
    : { data: [] };
  const vignetteMap = new Map<string, string | null>(
    ((vignetteRows ?? []) as Array<{ id: string; vignette: string | null }>).map((r) => [r.id, r.vignette])
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/admin/contenu">
          <ArrowLeft />
          Tous les cours
        </Link>
      </Button>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-(--color-primary-deep)">
          {c.matieres?.nom} · {c.matieres?.semestres?.facultes?.nom} · {c.matieres?.semestres?.label}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{c.titre}</h1>
        {c.description && <p className="mt-2 text-(--color-ink-soft) max-w-2xl">{c.description}</p>}
      </header>

      <Tabs defaultValue={can.video.read ? 'video' : can.fiche.read ? 'fiche' : can.qcm.read || can.annale.read ? 'qcm' : 'flashcards'}>
        <TabsList>
          {can.video.read && <TabsTrigger value="video"><PlayCircle className="h-4 w-4 mr-1.5" /> Vidéo</TabsTrigger>}
          {can.fiche.read && <TabsTrigger value="fiche"><FileText className="h-4 w-4 mr-1.5" /> Fiche</TabsTrigger>}
          {(can.qcm.read || can.annale.read) && <TabsTrigger value="qcm"><ClipboardList className="h-4 w-4 mr-1.5" /> QCM &amp; Annales</TabsTrigger>}
          {can.flashcards.read && <TabsTrigger value="flashcards"><Layers3 className="h-4 w-4 mr-1.5" /> Flashcards</TabsTrigger>}
          {can.video.read && <TabsTrigger value="seance-approfondie"><Video className="h-4 w-4 mr-1.5" /> Seance approfondie</TabsTrigger>}
        </TabsList>

        {can.video.read && (
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>Vidéo du cours</CardTitle>
                <CardDescription>
                  {can.video.write
                    ? 'Téléverse un MP4 (ou autre format compatible HTML5). Limite recommandée : 1 Go.'
                    : 'Lecture seule — vous pouvez consulter mais pas modifier la vidéo.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {can.video.write ? (
                  <>
                    {/* Hébergement recommandé : Bunny Stream (CDN, streaming adaptatif). */}
                    <div>
                      <p className="mb-2 text-[13px] font-semibold text-(--color-ink)">Bunny Stream (recommandé)</p>
                      <BunnyVideoUpload
                        coursId={coursId}
                        defaultTitle={c.titre ?? 'Vidéo du cours'}
                        existingBunnyId={(video as { bunny_video_id?: string | null } | undefined)?.bunny_video_id ?? null}
                      />
                    </div>
                    {/* Repli : hébergement direct dans le bucket Supabase. */}
                    <details className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
                      <summary className="cursor-pointer text-[12.5px] font-semibold text-(--color-ink-soft)">
                        Alternative : héberger sur Supabase (fichier direct)
                      </summary>
                      <div className="pt-3">
                        <FileDropzone
                          bucket="videos"
                          table="videos"
                          coursId={coursId}
                          rowId={video?.id}
                          existingPath={video?.storage_path}
                          accept="video/mp4,video/webm,video/ogg"
                          label={video?.storage_path ? 'Vidéo téléversée, la remplacer' : 'Glisse une vidéo MP4 ici'}
                          hint="Format conseillé : H.264 / AAC, 1080p."
                        />
                      </div>
                    </details>
                  </>
                ) : (
                  <p className="text-sm text-(--color-ink-soft)">
                    {(video as { bunny_video_id?: string | null } | undefined)?.bunny_video_id || video?.storage_path ? 'Vidéo présente.' : 'Aucune vidéo téléversée.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {can.fiche.read && (
          <TabsContent value="fiche">
            <Card>
              <CardHeader>
                <CardTitle>Fiche de cours (HTML)</CardTitle>
                <CardDescription>
                  {can.fiche.write
                    ? 'Déposez la fiche en HTML : elle est convertie automatiquement en PDF (charte Major ECN) pour les étudiants. Vous pouvez ensuite l’éditer visuellement.'
                    : 'Lecture seule — vous pouvez consulter mais pas modifier la fiche.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {can.fiche.write ? (
                  <FicheHtmlUpload
                    coursId={coursId}
                    nomCours={c.titre ?? 'Fiche'}
                    annee={process.env.NEXT_PUBLIC_FICHE_YEAR ?? '2025-2026'}
                    existing={!!fiche?.storage_path}
                    pages={fiche?.pages}
                  />
                ) : (
                  <p className="text-sm text-(--color-ink-soft)">
                    {fiche?.storage_path ? `PDF présent${fiche.pages ? ` (${fiche.pages} pages)` : ''}.` : 'Aucune fiche téléversée.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {(can.qcm.read || can.annale.read) && (
        <TabsContent value="qcm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Séries QCM</CardTitle>
                <CardDescription>{qcmSeries.length} série{qcmSeries.length > 1 ? 's' : ''} d’entraînement</CardDescription>
              </CardHeader>
              <CardContent>
                {qcmSeries.length === 0 ? (
                  <EmptyState icon={ClipboardList} title="Pas encore de série" description="Importe des questions ou crée une série depuis cet onglet." />
                ) : (
                  <ul className="space-y-2">
                    {qcmSeries.map((s) => (
                      <li key={s.id} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{s.label}</span>
                        <Badge variant="muted">{s.qcm_questions?.length ?? 0} questions</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Annales</CardTitle>
                  <CardDescription>{annales.length} annale{annales.length > 1 ? 's' : ''}</CardDescription>
                </div>
                {can.annale.write && <AddAnnaleDialog coursId={coursId} />}
              </CardHeader>
              <CardContent>
                {annales.length === 0 ? (
                  <EmptyState icon={History} title="Pas d’annale" description="Ajoute les sujets des années précédentes." />
                ) : (
                  <ul className="space-y-2">
                    {annales.map((s) => (
                      <li key={s.id} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 flex items-center justify-between text-sm">
                        <span className="font-medium">Annale {s.label}</span>
                        <Badge variant="muted">{s.qcm_questions?.length ?? 0} questions</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Génération IA — réservée à l'admin (les profs n'ont aucune trace d'IA). */}
          {can.qcm.write && scope === null && (
            <div className="mt-4">
              <GenerateButton coursId={coursId} kind="qcm" />
            </div>
          )}

          {can.qcm.write && (
            <div className="mt-4">
              <QcmSeriesManager
                coursId={coursId}
                series={qcmSeries.map((s) => ({
                  id: s.id,
                  label: s.label,
                  vignette: vignetteMap.get(s.id) ?? null,
                  questions: ((qcmDetail ?? []) as Array<{
                    id: string; serie_id: string; enonce: string; order_index: number;
                    correction_generale: string | null; images: string[] | null;
                    qcm_items: Array<{ id: string; lettre: string; enonce: string; is_correct: boolean; justification: string | null; images: string[] | null }>;
                  }>)
                    .filter((q) => q.serie_id === s.id)
                    .map((q) => ({
                      id: q.id,
                      enonce: q.enonce,
                      correction_generale: q.correction_generale ?? '',
                      images: q.images ?? [],
                      items: (q.qcm_items ?? []).map((it) => ({
                        lettre: it.lettre as 'A'|'B'|'C'|'D'|'E',
                        enonce: it.enonce,
                        is_correct: it.is_correct,
                        justification: it.justification ?? '',
                        images: it.images ?? [],
                      })),
                    })),
                }))}
              />
            </div>
          )}
        </TabsContent>
        )}

        {can.flashcards.read && (
          <TabsContent value="flashcards">
            {/* Génération IA + réindexation IA : réservées à l'admin. */}
            {can.flashcards.write && scope === null && (
              <div className="mb-4 space-y-3">
                <GenerateButton coursId={coursId} kind="flashcards" />
                <ReindexButton coursId={coursId} />
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Flashcards</CardTitle>
                <CardDescription>{flashcards.length} carte{flashcards.length > 1 ? 's' : ''} pour ce cours{!can.flashcards.write ? ' — lecture seule' : ''}</CardDescription>
              </CardHeader>
              <CardContent>
                {can.flashcards.write ? (
                  <FlashcardEditor coursId={coursId} initial={flashcards} />
                ) : (
                  <ul className="space-y-2">
                    {flashcards.map((f) => (
                      <li key={f.id} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-sm">
                        <p className="font-medium text-(--color-ink)">{f.recto}</p>
                        <p className="mt-1 text-(--color-ink-soft)">{f.verso}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {can.video.read && (
          <TabsContent value="seance-approfondie">
            <Card>
              <CardHeader>
                <CardTitle>Videos Seance Approfondie</CardTitle>
                <CardDescription>
                  {can.video.write
                    ? 'Collez un lien Bunny.net Stream pour ajouter une video de seance approfondie. Ces videos ne sont visibles que par les abonnes Programme Approfondi.'
                    : 'Lecture seule.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {can.video.write ? (
                  <BunnyLinkPaste
                    coursId={coursId}
                    videoType="seance_approfondie"
                    existingVideos={seanceApprofondieVideos}
                  />
                ) : (
                  <p className="text-sm text-(--color-ink-soft)">
                    {seanceApprofondieVideos.length > 0
                      ? `${seanceApprofondieVideos.length} video(s) de seance approfondie.`
                      : 'Aucune video de seance approfondie.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </main>
  );
}
