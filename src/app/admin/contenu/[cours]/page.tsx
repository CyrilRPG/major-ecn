import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ClipboardList, FileText, History, Layers3, PlayCircle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDropzone } from '@/components/admin/content/file-dropzone';
import { FlashcardEditor } from '@/components/admin/content/flashcard-editor';
import { EmptyState } from '@/components/empty-state';
import { GenerateButton } from '@/components/admin/generate-buttons';

export default async function AdminCoursPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  await requireAdmin();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, description, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      videos(id, storage_path),
      fiches(id, storage_path, pages),
      qcm_series(id, type, label, annee, qcm_questions(id)),
      flashcards(id, recto, verso, order_index)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c) notFound();

  const video = c.videos?.[0];
  const fiche = c.fiches?.[0];
  const qcmSeries = (c.qcm_series ?? []).filter((s) => s.type === 'qcm');
  const annales = (c.qcm_series ?? []).filter((s) => s.type === 'annale');
  const flashcards = (c.flashcards ?? []).sort((a, b) => a.order_index - b.order_index);

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

      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video"><PlayCircle className="h-4 w-4 mr-1.5" /> Vidéo</TabsTrigger>
          <TabsTrigger value="fiche"><FileText className="h-4 w-4 mr-1.5" /> Fiche</TabsTrigger>
          <TabsTrigger value="qcm"><ClipboardList className="h-4 w-4 mr-1.5" /> QCM &amp; Annales</TabsTrigger>
          <TabsTrigger value="flashcards"><Layers3 className="h-4 w-4 mr-1.5" /> Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Vidéo du cours</CardTitle>
              <CardDescription>
                Téléverse un MP4 (ou autre format compatible HTML5). Limite recommandée : 1 Go.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiche">
          <Card>
            <CardHeader>
              <CardTitle>Fiche de cours (PDF)</CardTitle>
              <CardDescription>Le résumé visible par les étudiants côté lecteur de fiche.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone
                bucket="fiches"
                table="fiches"
                coursId={coursId}
                rowId={fiche?.id}
                existingPath={fiche?.storage_path}
                accept="application/pdf"
                label={fiche?.storage_path ? 'PDF téléversé, le remplacer' : 'Glisse un PDF ici'}
                hint={fiche?.pages ? `${fiche.pages} pages déclarées.` : 'Le nombre de pages est lu automatiquement.'}
              />
            </CardContent>
          </Card>
        </TabsContent>

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
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Annales</CardTitle>
                <CardDescription>{annales.length} annale{annales.length > 1 ? 's' : ''}</CardDescription>
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
          <div className="mt-4">
            <GenerateButton coursId={coursId} kind="qcm" />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Ajouter du contenu QCM manuellement</CardTitle>
              <CardDescription>
                L’éditeur question par question et l’import CSV/Excel (template <code>serie, question_order, enonce, item_lettre, item_enonce, is_correct, justification</code>) sont accessibles via l’onglet de chaque série côté Supabase Studio dans cette version de la démo.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
          <div className="mb-4">
            <GenerateButton coursId={coursId} kind="flashcards" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Flashcards</CardTitle>
              <CardDescription>{flashcards.length} carte{flashcards.length > 1 ? 's' : ''} pour ce cours</CardDescription>
            </CardHeader>
            <CardContent>
              <FlashcardEditor coursId={coursId} initial={flashcards} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
