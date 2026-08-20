import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { NotesEditor } from '@/components/student/notes-editor';

export const dynamic = 'force-dynamic';

export default async function CoursNotesPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select('id, matiere_id')
    .eq('id', coursId)
    .maybeSingle();
  if (!c) redirect('/facultes');
  if (profile.role !== 'admin' && !canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: note } = await db
    .from('course_notes')
    .select('content')
    .eq('user_id', user.id)
    .eq('cours_id', coursId)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-3 sm:px-4 sm:py-6 lg:px-8">
      <NotesEditor coursId={coursId} initialHtml={(note?.content as string) ?? ''} />
    </div>
  );
}
