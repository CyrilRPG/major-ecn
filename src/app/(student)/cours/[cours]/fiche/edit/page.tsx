import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { FicheEditor } from '@/components/fiches/fiche-editor';
import { emptyFiche, type FicheData } from '@/lib/fiches/types';

export const dynamic = 'force-dynamic';

/**
 * Édition de la fiche (réservé admin / professeur). Charge la source structurée
 * `content_json` si présente, sinon initialise une fiche vierge pré-remplie avec
 * la matière et le titre du cours.
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

  // content_json / extracted_text ne sont pas dans les types générés → accès souple.
  const { data: ficheRow } = await supabase
    .from('fiches')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('content_json, extracted_text' as any)
    .eq('cours_id', coursId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = ficheRow as { content_json?: FicheData; extracted_text?: string | null } | null;
  const stored = row?.content_json ?? null;
  const annee = process.env.NEXT_PUBLIC_FICHE_YEAR ?? '2025-2026';

  let initial: FicheData;
  if (stored && typeof stored === 'object') {
    // 1) Source structurée déjà éditée → on la reprend telle quelle.
    initial = stored;
  } else {
    // 2) Pas encore de source structurée : on pré-charge le texte source extrait
    //    du PDF (s'il existe) comme point de départ éditable. Le PDF actuellement
    //    affiché aux élèves N'EST PAS modifié tant que le prof n'a pas « Publié ».
    const base = emptyFiche({
      matiere: c.matieres?.nom ?? '',
      nom_cours: c.titre ?? '',
      annee,
    });
    const extracted = (row?.extracted_text ?? '').trim();
    if (extracted) {
      base.parties = [
        {
          numero: 'I',
          titre: 'Contenu à structurer',
          sous_parties: [
            {
              lettre: 'A',
              titre: 'Texte source (à découper en lignes / tableaux)',
              rows: [{ concept: '', detail_md: extracted, kind: 'normal' }],
              images: [],
            },
          ],
        },
      ];
      base.plan = [{ numero: 'I', titre: 'Contenu à structurer', resume: '', sous_parties: [] }];
    }
    initial = base;
  }

  return <FicheEditor coursId={coursId} initial={initial} />;
}
