import 'server-only';
import { MODELES_DEFAUT } from '../questionnaires-defaut';
import type { Famille, Question, TypeSeance } from '../types';
import { journaliser, qdb } from './base';

export type QuestionnaireLigne = {
  id: string;
  code: string;
  famille: Famille;
  titre: string;
  intro: string | null;
  questions: Question[];
  type_seance: TypeSeance | null;
  version: number;
  actif: boolean;
  updated_at: string;
};

/** Crée en base les modèles par défaut absents (idempotent). */
export async function assurerQuestionnaires(): Promise<void> {
  const db = qdb();
  const { data } = await db.from('qualite_questionnaires').select('code');
  const presents = new Set(((data ?? []) as { code: string }[]).map((r) => r.code));
  const manquants = MODELES_DEFAUT.filter((m) => !presents.has(m.code));
  if (!manquants.length) return;
  const { data: crees, error } = await db.from('qualite_questionnaires').upsert(
    manquants.map((m) => ({
      code: m.code, famille: m.famille, titre: m.titre, intro: m.intro || null, questions: m.questions,
      type_seance: m.typeSeance ?? null, version: 1, actif: true,
    })),
    { onConflict: 'code', ignoreDuplicates: true },
  ).select('id, code, titre, intro, questions');
  if (error) { console.error('[qualite] questionnaires :', error.message); return; }
  const lignes = (crees ?? []) as { id: string; code: string; titre: string; intro: string | null; questions: Question[] }[];
  if (lignes.length) {
    await db.from('qualite_questionnaires_versions').insert(lignes.map((l) => ({
      questionnaire_id: l.id, version: 1, titre: l.titre, intro: l.intro, questions: l.questions,
    })));
    await journaliser(lignes.map((l) => ({ objet_type: 'questionnaire', objet_id: l.id, action: 'cree_modele_defaut', details: { code: l.code } })));
  }
}

export async function listerQuestionnaires(): Promise<QuestionnaireLigne[]> {
  await assurerQuestionnaires();
  const { data } = await qdb().from('qualite_questionnaires')
    .select('id, code, famille, titre, intro, questions, type_seance, version, actif, updated_at')
    .order('famille').order('code');
  return (data ?? []) as QuestionnaireLigne[];
}

export type QuestionnaireCompose = {
  questionnaireId: string | null;
  code: string;
  version: number;
  titre: string;
  intro: string | null;
  questions: Question[];
};

/**
 * Questionnaire à envoyer pour une famille. Pour le questionnaire à chaud, les
 * questions complémentaires du type de séance (méthodologie, QCM, dossiers…)
 * sont insérées avant les questions de texte libre (§4.2).
 */
export function composer(
  questionnaires: QuestionnaireLigne[],
  famille: Famille,
  opts: { seuil?: number; typeSeance?: TypeSeance | null } = {},
): QuestionnaireCompose | null {
  const actifs = questionnaires.filter((q) => q.actif && q.famille === famille);
  if (famille === 'PROGRESS') {
    const code = `PROGRESS_${opts.seuil ?? 33}`;
    const q = actifs.find((x) => x.code === code) ?? actifs.find((x) => x.code === (opts.seuil && opts.seuil >= 50 ? 'PROGRESS_66' : 'PROGRESS_33'));
    return q ? { questionnaireId: q.id, code: q.code, version: q.version, titre: q.titre, intro: q.intro, questions: q.questions } : null;
  }
  if (famille === 'HOT') {
    const base = actifs.find((x) => !x.type_seance);
    if (!base) return null;
    const complement = opts.typeSeance ? actifs.find((x) => x.type_seance === opts.typeSeance) : null;
    let questions = base.questions;
    if (complement) {
      const i = questions.findIndex((q) => q.type === 'texte' || q.type === 'oui_non');
      const pos = i < 0 ? questions.length : i;
      const ids = new Set(questions.map((q) => q.id));
      const ajout = complement.questions.filter((q) => !ids.has(q.id));
      questions = [...questions.slice(0, pos), ...ajout, ...questions.slice(pos)];
    }
    return {
      questionnaireId: base.id,
      code: complement ? `${base.code}+${complement.code}` : base.code,
      version: base.version,
      titre: base.titre,
      intro: base.intro,
      questions,
    };
  }
  const q = actifs[0];
  return q ? { questionnaireId: q.id, code: q.code, version: q.version, titre: q.titre, intro: q.intro, questions: q.questions } : null;
}
