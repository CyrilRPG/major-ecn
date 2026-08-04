import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { ParcoursEditor, type EditorParcours, type EditorQuestion } from '@/components/admin/parcours/parcours-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Éditer un parcours' };

export default async function AdminParcoursEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: p } = await admin
    .from('major_parcours')
    .select('id, numero, titre, sous_titre, intro_html, vignette_html, available_at, active')
    .eq('id', id)
    .maybeSingle();
  if (!p) notFound();

  const { data: qRows } = await admin
    .from('major_parcours_questions')
    .select('id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html, image_path')
    .eq('parcours_id', id)
    .order('section', { ascending: true })
    .order('ordre', { ascending: true });

  const parcours = p as EditorParcours;
  const questions = (qRows ?? []) as EditorQuestion[];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/admin/parcours" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
        <ArrowLeft className="h-4 w-4" /> Tous les parcours
      </Link>
      <ParcoursEditor parcours={parcours} initialQuestions={questions} />
    </main>
  );
}
