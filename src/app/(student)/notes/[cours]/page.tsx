import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { NotesEditor } from '@/components/student/notes-editor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const supabase = await createClient();
  const { data: c } = await supabase.from('cours').select('titre').eq('id', coursId).maybeSingle();
  return { title: c ? `Notes · ${c.titre}` : 'Notes' };
}

export default async function NoteEditPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  if (!c) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: note } = await (supabase as any)
    .from('course_notes')
    .select('content')
    .eq('user_id', user.id)
    .eq('cours_id', coursId)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/notes"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm font-medium text-(--color-ink-soft) transition-colors hover:border-(--color-border-strong) hover:text-(--color-ink)"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-(--color-ink-muted)">
            {(c.matieres as { nom: string })?.nom}
          </p>
          <h1 className="truncate text-sm font-semibold text-(--color-ink) sm:text-base">
            {c.titre}
          </h1>
        </div>
      </div>
      <NotesEditor coursId={coursId} initialHtml={(note?.content as string) ?? ''} />
    </div>
  );
}
