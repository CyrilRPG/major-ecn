import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { FicheHtmlEditor } from '@/components/fiches/fiche-html-editor';
import { FicheEditor } from '@/components/fiches/fiche-editor';
import { emptyFiche, type FicheData } from '@/lib/fiches/types';

export const dynamic = 'force-dynamic';

/**
 * Édition de la fiche (réservé admin / professeur).
 *
 * Flux de décision :
 *   1. Si `content_html` est présent → on ouvre l'éditeur HTML WYSIWYG (Word-like).
 *      C'est le format cible : généré par `major-ecn-fiche` (Python) ou édité
 *      ici, puis converti en PDF côté serveur via Chromium.
 *   2. Sinon, si `content_json` est présent → fallback sur l'éditeur structuré
 *      legacy (pour les fiches déjà éditées dans l'ancien flow).
 *   3. Sinon → nouvel éditeur HTML, page vierge.
 */
export default async function FicheEditPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { profile } = await requireUser();
  if (profile.role !== 'admin' && profile.role !== 'professor') {
    redirect(`/cours/${coursId}/fiche`);
  }

  const supabase = await createClient();
  const { data: c } = await supabase
    .from('cours')
    .select('id, titre, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  if (!c) notFound();

  // content_html / content_json / extracted_text ne sont pas dans les types
  // générés → accès souple.
  const { data: ficheRow } = await supabase
    .from('fiches')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('content_html, content_json' as any)
    .eq('cours_id', coursId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = ficheRow as {
    content_html?: string | null;
    content_json?: FicheData;
  } | null;
  const annee = process.env.NEXT_PUBLIC_FICHE_YEAR ?? '2025-2026';
  const nomCours = c.titre ?? 'Fiche';

  // 1) content_html déjà présent → éditeur HTML WYSIWYG.
  if (row?.content_html && typeof row.content_html === 'string' && row.content_html.trim()) {
    return (
      <FicheHtmlEditor
        coursId={coursId}
        initialHtml={row.content_html}
        nomCours={nomCours}
        annee={annee}
      />
    );
  }

  // 2) content_json legacy → éditeur structuré (rétrocompat).
  if (row?.content_json && typeof row.content_json === 'object') {
    return <FicheEditor coursId={coursId} initial={row.content_json} />;
  }

  // 3) Page vierge → éditeur HTML WYSIWYG (le nouveau standard).
  const seedHtml = `<h1>${escapeHtml(nomCours)}</h1><p></p>`;
  void emptyFiche; // import gardé pour compat future (legacy editor types)
  return (
    <FicheHtmlEditor
      coursId={coursId}
      initialHtml={seedHtml}
      nomCours={nomCours}
      annee={annee}
    />
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}
