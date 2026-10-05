/**
 * Sous-compétences d'une question (§10.3) et catégorie d'une erreur (§16) —
 * module PUR.
 *
 * Chaque question porte idéalement item_id + competency_tags[]. La banque de
 * la plateforme n'en porte aucun : un étiquetage AUTOMATIQUE par mots-clés
 * (énoncé et propositions, sans accents) en propose une première version,
 * stockée et corrigeable au back-office (source « auto » / « admin »).
 * Une question peut porter plusieurs sous-compétences ; une question que rien
 * ne caractérise reste sans étiquette (elle compte pour le score, pas pour la
 * couverture).
 */
import { COMPETENCY_TAGS, type CompetencyTag, type ErrorCategory } from './model';

/** Version des règles d'étiquetage (toute modification des motifs l'incrémente). */
export const COMPETENCY_RULES_VERSION = 1;

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

/** Motifs par sous-compétence, appliqués au texte normalisé. */
const RULES: Record<CompetencyTag, RegExp[]> = {
  diagnostic: [/\bdiagnosti/, /\bdefini(tion|ssez|r)\b/, /\bhypothese/, /\bevoquez\b/, /\bquel est (votre|le) diagnostic/, /\bcriteres? (diagnosti|de definition)/, /\bclassification\b/, /\bdiagnostic differentiel/],
  clinique: [/\bexamen clinique/, /\bsignes? cliniques?/, /\bsymptom/, /\bsemiolog/, /\binterrogatoire/, /\ba l'?examen\b/, /\btableau clinique/, /\banamnese/, /\bpalpation|auscultation|percussion/],
  examens: [/\bexamens? (complementaire|biologique|paraclinique|d'imagerie|de premiere intention)/, /\bbilan\b/, /\bbiolog/, /\bimagerie/, /\bradiograph/, /\bscanner|tomodensitometr|\btdm\b/, /\birm\b/, /\bechograph/, /\becg\b|electrocardiogram/, /\bdosage/, /\bponction/, /\bgaz du sang|\bgds\b/, /\bnfs\b|hemogramme/, /\bionogramme/, /\bbiopsie/, /\bendoscop|fibroscop|coloscop/, /\becbu\b|bandelette/, /\bhemoculture/, /\bserolog/],
  gravite: [/\bgravite/, /\bsignes? de gravite/, /\bgrave\b/, /\burgence/, /\bsevere|severite/, /\bchoc\b/, /\bdetresse/, /\bpronostic vital/, /\bcriteres? d'hospitalisation/, /\bdecompens/, /\bmenace/],
  etiologies: [/\betiolog/, /\bcauses?\b/, /\bfacteurs? de risque/, /\bphysiopatholog/, /\bmecanisme (physiopatho|de survenue)/, /\bfacteurs? (favorisant|declenchant)/, /\borigine\b/],
  conduite: [/\bconduite a tenir/, /\bprise en charge/, /\bque (faites|proposez|prescrivez)-vous/, /\bcomment (prenez|traitez|orientez)/, /\borientation\b/, /\bhospitalis/, /\bdemarche\b/, /\bpremiere intention/, /\bmesures? (immediates?|d'urgence)/],
  traitement: [/\btraitement/, /\btherapeuti/, /\bprescri/, /\bantibiot/, /\bmedicament/, /\bposologie|\bdose\b|\bmg\/kg|\bmg\b/, /\bchirurgi/, /\btraite(r|z)\b/, /\bordonnance/, /\banticoagul|antiagreg|corticoid|insulin/],
  surveillance: [/\bsurveillance/, /\bsurveiller/, /\bsuivi\b/, /\bcontrole\b/, /\breevaluation/, /\bmonitorage/, /\brythme de (suivi|controle)/],
  complications: [/\bcomplication/, /\bsequelle/, /\bevolution\b/, /\brisque evolutif/, /\brecidive|recurrence/],
  prevention: [/\bprevention|preventi(f|ve)/, /\bdepistage/, /\bvaccin/, /\beducation (therapeutique|du patient)/, /\bprophyla/, /\bhygien/, /\bconseils?\b/, /\bsevrage tabagique|arret du tabac/],
  pharmacologie: [/\bcontre-?indication/, /\beffets? (indesirables?|secondaires?)/, /\binteractions? medicamenteuses?/, /\bpharmacolog/, /\bmecanisme d'action/, /\biatrogen/, /\bclasse (therapeutique|medicamenteuse)/],
};

/** Sous-compétences détectées dans une question (énoncé + propositions). */
export function inferCompetencyTags(q: { enonce?: string | null; propositions?: (string | null | undefined)[]; correction?: string | null }): CompetencyTag[] {
  const text = norm([q.enonce ?? '', ...(q.propositions ?? []).map((x) => x ?? '')].join(' \n '));
  if (!text.trim()) return [];
  const out: CompetencyTag[] = [];
  for (const tag of COMPETENCY_TAGS) if (RULES[tag].some((re) => re.test(text))) out.push(tag);
  return out;
}

/**
 * Sous-compétences obligatoires d'un item déduites de sa banque de questions :
 * celles qui portent au moins `minShare` des questions étiquetées (poids 1).
 * Le back-office peut les remplacer (item.competencies).
 */
export function mandatoryFromBank(tagCounts: Partial<Record<CompetencyTag, number>>, taggedQuestions: number, minShare: number): Partial<Record<CompetencyTag, number>> {
  const out: Partial<Record<CompetencyTag, number>> = {};
  if (taggedQuestions <= 0) return out;
  for (const tag of COMPETENCY_TAGS) {
    const n = tagCounts[tag] ?? 0;
    if (n > 0 && n / taggedQuestions >= minShare) out[tag] = 1;
  }
  return out;
}

/**
 * Catégorie d'une erreur (§16), « si possible » : déduite des sous-compétences
 * de la question. Posologie quand le texte parle de dose ; « oubli » et
 * « piège EVC » ne se déduisent pas automatiquement (catégorie posée par
 * l'équipe ou par le candidat).
 */
export function errorCategoryOf(tags: CompetencyTag[], text?: string | null): ErrorCategory {
  const t = norm(text ?? '');
  if (tags.includes('traitement') && /\bposologie|\bdose\b|\bmg\/kg|\bmg\b/.test(t)) return 'posologie';
  if (tags.includes('pharmacologie')) return 'contre_indication';
  if (tags.includes('traitement')) return 'traitement';
  if (tags.includes('conduite') || tags.includes('gravite')) return 'conduite_a_tenir';
  if (tags.includes('examens')) return 'examen';
  if (tags.includes('diagnostic') || tags.includes('clinique')) return 'diagnostic';
  if (tags.includes('surveillance')) return 'surveillance';
  if (tags.includes('prevention')) return 'prevention';
  return 'raisonnement';
}
