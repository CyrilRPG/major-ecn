import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { QcmJoint, QcmJointEnvoi } from './qcm-joint';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Item = { lettre: string; enonce: string; correct: boolean };

/** Seule la réponse vient du navigateur : bornée aux lettres existantes. */
function reponseDe(envoi: QcmJointEnvoi, format: 'qcm' | 'qroc', items: Item[]): QcmJoint['reponseEleve'] {
  if (format === 'qroc') {
    const texte = (envoi.texte ?? '').trim().slice(0, 2000);
    return texte ? { texte } : null;
  }
  if (!Array.isArray(envoi.lettres)) return null;
  const valides = new Set(items.map((it) => it.lettre));
  return { lettres: [...new Set(envoi.lettres.filter((l) => valides.has(l)))].sort() };
}

/**
 * Instantané de la question jointe (énoncé, propositions, corrigé, réponse de
 * l'élève), relu en base. null = question introuvable ou hors de son accès.
 *
 *  - banque (`qcm_questions`) : lue avec le client de l'ÉLÈVE — la RLS garantit
 *    qu'il ne joint qu'une question qu'il peut déjà lire, corrigé compris ;
 *  - examen (`mock_exam_questions`, lu en service-role comme les pages
 *    d'épreuve) : épreuve publiée, et soit interrogation de spécialité (corrigé
 *    affiché question par question), soit copie déjà rendue — jamais pendant
 *    une épreuve blanche en cours, l'instantané contient le corrigé.
 */
export async function chargerQcmJoint(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  envoi: QcmJointEnvoi,
  userId: string,
): Promise<QcmJoint | null> {
  if (!UUID.test(envoi.questionId ?? '')) return null;
  return envoi.source === 'examen'
    ? chargerQuestionExamen(envoi, userId)
    : chargerQuestionBanque(supabase, envoi);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function chargerQuestionBanque(supabase: any, envoi: QcmJointEnvoi): Promise<QcmJoint | null> {
  const { data: q } = await supabase
    .from('qcm_questions')
    .select('id, serie_id, enonce, format, reponse_attendue, qcm_items(lettre, enonce, is_correct), qcm_series(id, label, cours_id, cours(titre, matiere_id))')
    .eq('id', envoi.questionId)
    .maybeSingle();
  if (!q) return null;

  const serie = (q.qcm_series ?? null) as {
    id: string; label: string | null; cours_id: string | null;
    cours: { titre: string | null; matiere_id: string | null } | null;
  } | null;
  const items: Item[] = ((q.qcm_items ?? []) as { lettre: string; enonce: string; is_correct: boolean }[])
    .sort((a, b) => a.lettre.localeCompare(b.lettre))
    .map((it) => ({ lettre: it.lettre, enonce: it.enonce, correct: !!it.is_correct }));

  // Rang dans la série : même ordre que le lecteur (order_index).
  let numero: number | null = null;
  if (q.serie_id) {
    const { data: ordre } = await supabase
      .from('qcm_questions').select('id').eq('serie_id', q.serie_id)
      .order('order_index', { ascending: true }).order('id', { ascending: true });
    const i = ((ordre ?? []) as { id: string }[]).findIndex((r) => r.id === q.id);
    numero = i >= 0 ? i + 1 : null;
  }

  const format: 'qcm' | 'qroc' = q.format === 'qroc' ? 'qroc' : 'qcm';
  return {
    source: 'qcm',
    questionId: q.id,
    examenId: null,
    matiereId: serie?.cours?.matiere_id ?? null,
    serieId: serie?.id ?? q.serie_id ?? null,
    serieLabel: serie?.label ?? null,
    coursId: serie?.cours_id ?? null,
    coursTitre: serie?.cours?.titre ?? null,
    numero,
    format,
    enonce: q.enonce ?? '',
    items,
    reponseAttendue: q.reponse_attendue ?? null,
    reponseEleve: reponseDe(envoi, format, items),
  };
}

async function chargerQuestionExamen(envoi: QcmJointEnvoi, userId: string): Promise<QcmJoint | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: q } = await db
    .from('mock_exam_questions')
    .select('id, exam_id, order_index, format, enonce, items, reponse_attendue, college_id')
    .eq('id', envoi.questionId)
    .maybeSingle();
  if (!q) return null;
  const { data: exam } = await db
    .from('mock_exams').select('id, title, status, specialite_id').eq('id', q.exam_id).maybeSingle();
  if (!exam || exam.status !== 'published') return null;
  if (!exam.specialite_id) {
    const { data: copie } = await db
      .from('mock_exam_submissions').select('id')
      .eq('exam_id', exam.id).eq('user_id', userId).in('status', ['submitted', 'graded'])
      .limit(1).maybeSingle();
    if (!copie) return null;
  }

  const { data: ordre } = await db
    .from('mock_exam_questions').select('id').eq('exam_id', exam.id)
    .order('order_index', { ascending: true }).order('id', { ascending: true });
  const i = ((ordre ?? []) as { id: string }[]).findIndex((r) => r.id === q.id);

  const items: Item[] = ((q.items ?? []) as { lettre: string; enonce: string; is_correct?: boolean }[])
    .map((it) => ({ lettre: it.lettre, enonce: it.enonce, correct: !!it.is_correct }))
    .sort((a, b) => a.lettre.localeCompare(b.lettre));
  const format: 'qcm' | 'qroc' = q.format === 'qroc' ? 'qroc' : 'qcm';
  return {
    source: 'examen',
    questionId: q.id,
    examenId: exam.id,
    matiereId: q.college_id ?? exam.specialite_id ?? null,
    serieId: null,
    serieLabel: exam.title ?? null,
    coursId: null,
    coursTitre: null,
    numero: i >= 0 ? i + 1 : null,
    format,
    enonce: q.enonce ?? '',
    items,
    reponseAttendue: q.reponse_attendue ?? null,
    reponseEleve: reponseDe(envoi, format, items),
  };
}
