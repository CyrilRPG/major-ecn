import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Clapperboard, ClipboardList, FileText, GraduationCap, History, Layers3, PlayCircle } from 'lucide-react';
import { profCanAccessCours, requireContentEditor } from '@/lib/auth/require-role';
import { canRead, canWrite, type ContentType } from '@/lib/schemas/professor';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FicheHtmlUpload } from '@/components/admin/content/fiche-html-upload';
import { FlashcardEditor } from '@/components/admin/content/flashcard-editor';
import { EmptyState } from '@/components/empty-state';
import { GenerateButton } from '@/components/admin/generate-buttons';
import { AddAnnaleDialog } from '@/components/admin/content/add-annale-dialog';
import { ReindexButton } from '@/components/admin/reindex-button';
import { QcmSeriesManager } from '@/components/admin/content/qcm-series-manager';
import { InterrogationPanel } from '@/components/admin/content/interrogation-panel';

/** Ligne `videos` telle que sélectionnée ci-dessous (types générés incomplets). */
type ManagedVideoRow = {
  id: string;
  titre: string;
  storage_path: string | null;
  bunny_video_id: string | null;
  type: string | null;
  order_index: number | null;
  support_path: string | null;
};

export default async function AdminCoursPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { scope } = await requireContentEditor();
  // Helpers per content type (admin = tout autorisé)
  const allow = (t: ContentType): { read: boolean; write: boolean } =>
    scope === null ? { read: true, write: true } : { read: canRead(scope, t), write: canWrite(scope, t) };
  const can = {
    qcm: allow('qcm'),
    dp: allow('dp'),
    qroc: allow('qroc'),
    fiche: allow('fiche'),
    video: allow('video'),
    annale: allow('annale'),
    flashcards: allow('flashcards'),
  };
  // L'onglet « QCM & Annales » regroupe QCM, DP et QROC : visible dès qu'un des trois (ou les annales) est accessible.
  const canQcmFamilyRead = can.qcm.read || can.dp.read || can.qroc.read;
  const canQcmFamilyWrite = can.qcm.write || can.dp.write || can.qroc.write;
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, description, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      videos(id, titre, storage_path, bunny_video_id, type, order_index, support_path),
      fiches(id, storage_path, pages),
      qcm_series(id, type, label, annee, qcm_questions(id)),
      flashcards(id, recto, verso, order_index)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c) notFound();
  if (!profCanAccessCours(scope, c.matiere_id, c.id)) redirect('/admin/contenu');

  // Collèges pour l'onglet Interrogations (champ « spécialité » d'une question).
  const { data: interroColsRaw } = await supabase.from('matieres').select('id, nom, parent_matiere_id').order('nom');
  const interroColleges = ((interroColsRaw ?? []) as unknown as { id: string; nom: string; parent_matiere_id: string | null }[])
    .map((m) => ({ id: m.id, nom: m.nom, parentId: m.parent_matiere_id }));

  // Deux listes indépendantes, chacune dans l'ordre choisi par l'administrateur.
  // Le TYPE porte la permission élève : `cours` → Formule Intensive,
  // `seance_approfondie` → Programme Approfondi (cf. formula_permissions).
  const allVideos = ((c.videos ?? []) as unknown as ManagedVideoRow[])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((v) => ({
      id: v.id,
      titre: v.titre,
      bunny_video_id: v.bunny_video_id,
      storage_path: v.storage_path,
      order_index: v.order_index ?? 0,
      support_path: v.support_path,
      type: (v.type ?? 'cours') as 'cours' | 'seance_approfondie',
    }));
  const coursVideos = allVideos.filter((v) => v.type === 'cours');
  const seanceApprofondieVideos = allVideos.filter((v) => v.type === 'seance_approfondie');
  const nbSupports = allVideos.filter((v) => !!v.support_path).length;
  const fiche = c.fiches?.[0];
  const qcmSeries = (c.qcm_series ?? []).filter((s) => s.type === 'qcm');
  const annales = (c.qcm_series ?? []).filter((s) => s.type === 'annale');
  const flashcards = (c.flashcards ?? []).sort((a, b) => a.order_index - b.order_index);

  // Charge le détail complet des séries QCM (questions + items + images + corrigé général)
  // pour l'éditeur intégré côté admin. Une seule requête supplémentaire.
  const qcmSerieIds = qcmSeries.map((s) => s.id);
  const { data: qcmDetail } = qcmSerieIds.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (supabase as any).from('qcm_questions')
        .select('id, serie_id, format, enonce, reponse_attendue, order_index, correction_generale, commentaire_enseignant, images, qcm_items(id, lettre, enonce, is_correct, justification, images)')
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

      <Tabs defaultValue={can.video.read ? 'video' : can.fiche.read ? 'fiche' : canQcmFamilyRead || can.annale.read ? 'qcm' : 'flashcards'}>
        <TabsList>
          {can.video.read && <TabsTrigger value="video"><PlayCircle className="h-4 w-4 mr-1.5" /> Vidéos</TabsTrigger>}
          {can.fiche.read && <TabsTrigger value="fiche"><FileText className="h-4 w-4 mr-1.5" /> Fiche</TabsTrigger>}
          {(canQcmFamilyRead || can.annale.read) && <TabsTrigger value="qcm"><ClipboardList className="h-4 w-4 mr-1.5" /> QCM &amp; Annales</TabsTrigger>}
          {can.flashcards.read && <TabsTrigger value="flashcards"><Layers3 className="h-4 w-4 mr-1.5" /> Flashcards</TabsTrigger>}
          {canQcmFamilyRead && <TabsTrigger value="interrogations"><GraduationCap className="h-4 w-4 mr-1.5" /> Interrogations</TabsTrigger>}
        </TabsList>

        {canQcmFamilyRead && (
          <TabsContent value="interrogations">
            <InterrogationPanel coursId={coursId} colleges={interroColleges} />
          </TabsContent>
        )}

        {can.video.read && (
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>Vidéos de cet item</CardTitle>
                <CardDescription>
                  Les vidéos se gèrent désormais dans l’onglet « Vidéos » de l’administration :
                  collège, item, catégorie, puis ordre, nom et lien Bunny.net.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
                    <span className="font-medium">Cours vidéo</span>
                    <Badge variant={coursVideos.length > 0 ? 'primary' : 'muted'}>
                      {coursVideos.length}
                    </Badge>
                  </li>
                  <li className="flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
                    <span className="font-medium">Séances approfondies</span>
                    <Badge variant={seanceApprofondieVideos.length > 0 ? 'primary' : 'muted'}>
                      {seanceApprofondieVideos.length}
                    </Badge>
                  </li>
                  <li className="flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
                    <span className="font-medium">Supports de séance</span>
                    <Badge variant={nbSupports > 0 ? 'primary' : 'muted'}>{nbSupports}</Badge>
                  </li>
                </ul>
                {can.video.write && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/videos">
                      <Clapperboard />
                      Ouvrir la bibliothèque vidéo
                    </Link>
                  </Button>
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

        {(canQcmFamilyRead || can.annale.read) && (
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
          {canQcmFamilyWrite && scope === null && (
            <div className="mt-4">
              <GenerateButton coursId={coursId} kind="qcm" />
            </div>
          )}

          {canQcmFamilyWrite && (
            <div className="mt-4">
              <QcmSeriesManager
                coursId={coursId}
                series={qcmSeries.map((s) => ({
                  id: s.id,
                  label: s.label,
                  vignette: vignetteMap.get(s.id) ?? null,
                  questions: ((qcmDetail ?? []) as Array<{
                    id: string; serie_id: string; format: 'qcm' | 'qroc' | null; enonce: string;
                    reponse_attendue: string | null; order_index: number;
                    correction_generale: string | null; commentaire_enseignant: string | null;
                    images: string[] | null;
                    qcm_items: Array<{ id: string; lettre: string; enonce: string; is_correct: boolean; justification: string | null; images: string[] | null }>;
                  }>)
                    .filter((q) => q.serie_id === s.id)
                    .map((q) => ({
                      id: q.id,
                      format: q.format ?? 'qcm',
                      enonce: q.enonce,
                      reponse_attendue: q.reponse_attendue ?? '',
                      correction_generale: q.correction_generale ?? '',
                      commentaire_enseignant: q.commentaire_enseignant ?? '',
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
      </Tabs>
    </main>
  );
}
