import { STATIC_PARCOURS } from '@/lib/parcours/data';
import type { CompletionLite, ParcoursBand } from '@/lib/parcours/parcours';

/**
 * Source des Parcours du Major : la BASE si les tables existent et contiennent
 * des parcours, sinon le catalogue STATIQUE (`data.ts`). Cela permet de voir et
 * tester la section avant que la migration Supabase ne soit appliquée. Dès que
 * la base est amorcée, elle prime automatiquement.
 *
 * Les identifiants statiques (`static-…`) ne correspondent à aucune ligne : en
 * mode statique, les complétions ne sont pas persistées (le runner affiche tout
 * de même le résultat /10).
 */

export type ParcoursRow = {
  id: string; numero: number; titre: string; sous_titre: string | null;
  intro_html: string; vignette_html: string | null; available_at: string; active: boolean;
};
export type QuestionRow = {
  id: string; section: 'qcm' | 'cas_clinique'; format: 'qcm' | 'qroc';
  ordre: number; enonce_html: string;
  items: { lettre: string; texte: string; correct?: boolean }[] | null;
  reponse_attendue: string | null; explication_html: string | null; image_path: string | null;
};

export type ParcoursSource = 'db' | 'static';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sb = any;

/** Liste des parcours (catalogue). DB si disponible, sinon statique. */
export async function fetchParcoursList(sb: Sb): Promise<{ rows: ParcoursRow[]; source: ParcoursSource }> {
  try {
    const { data, error } = await sb
      .from('major_parcours')
      .select('id, numero, titre, sous_titre, intro_html, vignette_html, available_at, active')
      .order('numero', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      return { rows: data as ParcoursRow[], source: 'db' };
    }
  } catch { /* table absente : on bascule sur le statique */ }
  return {
    rows: STATIC_PARCOURS.map((p) => ({
      id: `static-${p.numero}`, numero: p.numero, titre: p.titre, sous_titre: p.sousTitre,
      intro_html: p.introHtml, vignette_html: p.vignetteHtml, available_at: p.availableAt, active: true,
    })),
    source: 'static',
  };
}

/** Un parcours + ses questions, par numéro. DB si disponible, sinon statique. */
export async function fetchParcoursByNumero(
  sb: Sb, numero: number,
): Promise<{ parcours: ParcoursRow; questions: QuestionRow[]; source: ParcoursSource } | null> {
  try {
    const { data } = await sb
      .from('major_parcours')
      .select('id, numero, titre, sous_titre, intro_html, vignette_html, available_at, active')
      .eq('numero', numero)
      .maybeSingle();
    if (data) {
      const { data: q } = await sb
        .from('major_parcours_questions')
        .select('id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html, image_path')
        .eq('parcours_id', (data as ParcoursRow).id)
        .order('section', { ascending: true })
        .order('ordre', { ascending: true });
      return { parcours: data as ParcoursRow, questions: (q ?? []) as QuestionRow[], source: 'db' };
    }
  } catch { /* table absente */ }

  const p = STATIC_PARCOURS.find((x) => x.numero === numero);
  if (!p) return null;
  return {
    parcours: {
      id: `static-${p.numero}`, numero: p.numero, titre: p.titre, sous_titre: p.sousTitre,
      intro_html: p.introHtml, vignette_html: p.vignetteHtml, available_at: p.availableAt, active: true,
    },
    questions: p.questions.map((qq, i) => ({
      id: `static-${p.numero}-${i}`, section: qq.section, format: qq.format, ordre: qq.ordre,
      enonce_html: qq.enonceHtml, items: qq.items, reponse_attendue: qq.reponseAttendue,
      explication_html: qq.explicationHtml, image_path: null,
    })),
    source: 'static',
  };
}

/** Complétions de l'élève. Vide si la table n'existe pas encore. */
export async function fetchCompletions(sb: Sb, userId: string): Promise<CompletionLite[]> {
  try {
    const { data, error } = await sb
      .from('major_parcours_completions')
      .select('parcours_id, score, band')
      .eq('user_id', userId);
    if (error || !Array.isArray(data)) return [];
    return (data as { parcours_id: string; score: number; band: ParcoursBand }[])
      .map((c) => ({ parcoursId: c.parcours_id, band: c.band, score: Number(c.score) }));
  } catch {
    return [];
  }
}
