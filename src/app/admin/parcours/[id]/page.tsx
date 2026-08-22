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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let p: any = null;
  try {
    const res = await admin
      .from('major_parcours')
      .select('id, numero, titre, sous_titre, intro_html, vignette_html, available_at, active')
      .eq('id', id)
      .maybeSingle();
    p = res.data;
  } catch { /* table absente */ }

  // Sans base initialisée (repli statique), l'édition n'est pas possible : on
  // explique au lieu d'un 404.
  if (!p) {
    if (id.startsWith('static-')) {
      return (
        <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-10">
          <Link href="/admin/parcours" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
            <ArrowLeft className="h-4 w-4" /> Tous les parcours
          </Link>
          <div className="rounded-2xl border border-[#E9D8A6] bg-[#FFFBEB] p-6">
            <h1 className="text-lg font-bold text-[#7A5B00]">Édition indisponible pour l’instant</h1>
            <p className="mt-2 text-sm text-[#8A6D1F]">
              La section fonctionne actuellement à partir d’un catalogue intégré à l’application
              (aperçu). Pour éditer les parcours, il faut d’abord créer les tables en base :
              appliquez le fichier <code>supabase/APPLIQUER_DANS_SQL_EDITOR.sql</code> dans le
              SQL Editor de Supabase. Une fois fait, cette page permettra de tout modifier.
            </p>
          </div>
        </main>
      );
    }
    notFound();
  }

  const { data: qRows } = await admin
    .from('major_parcours_questions')
    .select('id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html, image_path')
    .eq('parcours_id', id)
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
