import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { FicheWysiwygEditor } from '@/components/fiches/fiche-wysiwyg-editor';

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

  // content_html n'est pas dans les types générés → accès souple.
  const { data: ficheRow } = await supabase
    .from('fiches')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('content_html' as any)
    .eq('cours_id', coursId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = ficheRow as { content_html?: string | null } | null;
  const annee = process.env.NEXT_PUBLIC_FICHE_YEAR ?? '2025-2026';
  const nomCours = c.titre ?? 'Fiche';

  // Si une source HTML existe déjà → on l'ouvre ; sinon page vierge.
  // Le legacy content_json n'est plus utilisé (la base contient 0 ligne avec
  // ce champ rempli — vérifié 2026-06-17). Les fiches existantes sont soit
  // déjà en HTML, soit régénérées via le générateur Python qui produit
  // directement content_html.
  const initialHtml = (row?.content_html && typeof row.content_html === 'string' && row.content_html.trim())
    ? row.content_html
    : `<h1>${escapeHtml(nomCours)}</h1><p></p>`;

  return (
    <FicheWysiwygEditor
      coursId={coursId}
      initialHtml={initialHtml}
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
