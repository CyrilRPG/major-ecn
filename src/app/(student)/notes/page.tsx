import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { NotebookPen } from 'lucide-react';
import { NotesGrid } from '@/components/student/notes-grid';
import { HeroStat, StudentHero, StudentPage } from '@/components/student/ui/page-kit';

export const metadata = { title: 'Prises de notes' };
export const dynamic = 'force-dynamic';

export default async function NotesIndexPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: rows } = await db
    .from('course_notes')
    .select('cours_id, content, updated_at, cours:cours_id(titre, matiere_id, matieres(nom))')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  type NoteRow = {
    cours_id: string;
    content: string;
    updated_at: string;
    cours: { titre: string; matiere_id: string; matieres: { nom: string } } | null;
  };

  const notes = ((rows ?? []) as NoteRow[])
    .filter((r) => r.content && r.content.replace(/<[^>]*>/g, '').trim().length > 0)
    .map((r) => ({
      coursId: r.cours_id,
      titre: r.cours?.titre ?? 'Item inconnu',
      college: r.cours?.matieres?.nom ?? '',
      preview: r.content.replace(/<[^>]*>/g, '').slice(0, 200),
      html: r.content,
      updatedAt: r.updated_at,
    }));

  const colleges = new Set(notes.map((n) => n.college).filter(Boolean)).size;

  return (
    <StudentPage>
      <StudentHero
        aide="notes"
        icon={NotebookPen}
        eyebrow="Vos notes de cours"
        title="Prises de notes"
        subtitle="Tout ce que vous avez noté pendant vos cours, au même endroit : retrouvez une note par item, par collège ou par mot-clé."
        stats={notes.length > 0 ? (
          <>
            <HeroStat icon={NotebookPen} value={notes.length} label={notes.length > 1 ? 'items annotés' : 'item annoté'} />
            {colleges > 0 && <HeroStat value={colleges} label={colleges > 1 ? 'collèges' : 'collège'} />}
          </>
        ) : undefined}
      />
      <NotesGrid notes={notes} />
    </StudentPage>
  );
}
