import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Assistant strictement borné aux contenus pédagogiques du cours.
 * Aucune génération hors-contenu : on récupère flashcards + items QCM du cours,
 * on fait un appariement par mots-clés, et on renvoie les passages pertinents.
 */

const STOP = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'à', 'au', 'aux', 'en', 'dans',
  'que', 'qui', 'quoi', 'est', 'sont', 'ce', 'cette', 'ces', 'pour', 'par', 'sur', 'avec', 'se',
  'sa', 'son', 'ses', 'il', 'elle', 'on', 'je', 'tu', 'nous', 'vous', 'me', 'ma', 'mon', 'mes',
  'comment', 'pourquoi', 'quelle', 'quel', 'quels', 'quelles', 'est-ce', "qu'est",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { coursId, message } = (await req.json().catch(() => ({}))) as { coursId?: string; message?: string };
  if (!coursId || !message) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });

  const { data: cours } = await supabase.from('cours').select('id, titre').eq('id', coursId).maybeSingle();
  if (!cours) return NextResponse.json({ error: 'Cours introuvable ou non accessible.' }, { status: 404 });

  const [{ data: flashcards }, { data: items }] = await Promise.all([
    supabase.from('flashcards').select('recto, verso').eq('cours_id', coursId),
    supabase
      .from('qcm_items')
      .select('enonce, justification, qcm_questions!inner(enonce, qcm_series!inner(cours_id))')
      .eq('qcm_questions.qcm_series.cours_id', coursId)
      .limit(600),
  ]);

  const q = tokens(message);
  if (q.length === 0) {
    return NextResponse.json({
      reply: `Précise ta question sur « ${cours.titre} » et je te répondrai à partir de la fiche, des flashcards et des QCM de ce cours.`,
    });
  }

  type Passage = { text: string; source: string };
  const corpus: Passage[] = [];
  for (const f of flashcards ?? []) {
    corpus.push({ text: `${f.recto} : ${f.verso}`, source: 'Flashcard' });
  }
  for (const it of (items ?? []) as Array<{ enonce: string; justification: string; qcm_questions: { enonce: string } }>) {
    if (it.justification && it.justification.trim().length > 0) {
      corpus.push({
        text: `${it.qcm_questions.enonce} ${it.enonce} ${it.justification}`,
        source: 'QCM',
      });
    }
  }

  const scored = corpus
    .map((p) => {
      const pt = new Set(tokens(p.text));
      let score = 0;
      for (const w of q) if (pt.has(w)) score += 1;
      return { p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) {
    return NextResponse.json({
      reply: `Je ne trouve pas de réponse à cette question dans les contenus pédagogiques de « ${cours.titre} ». Reformule en restant sur le cours, ou consulte la fiche directement.`,
    });
  }

  const body = scored
    .map((s, i) => `${i + 1}. ${s.p.text.trim()}`)
    .join('\n\n');

  return NextResponse.json({
    reply: `D’après les contenus pédagogiques de « ${cours.titre} » :\n\n${body}\n\nCes éléments proviennent uniquement des flashcards et QCM de ce cours.`,
  });
}
