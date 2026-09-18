/**
 * EVC Arena — passerelle vers Major ECN (cahier des charges complémentaire
 * §11 à §14, §17 à §20).
 *
 * Règles :
 *  - jamais une publicité agressive après un mauvais score : le bloc vient
 *    en DERNIER (score → rang → motivation → correction → prochain objectif
 *    → passerelle), et reste dans l'univers sport / coaching / progression ;
 *  - le discours suit le niveau : < 50 % « progresser », 50–70 % « franchir
 *    un cap », ≥ 70 % « se perfectionner » (§18, §20) ;
 *  - un candidat déjà élève Major ECN ne reçoit JAMAIS un CTA d'achat : il
 *    est renvoyé vers sa préparation (§12, §19) ;
 *  - le lien du prospect vise la page de la spécialité du Battle quand elle
 *    existe (§11), sinon l'annuaire des spécialités ;
 *  - l'administration peut masquer le bloc, fixer l'URL et le texte du CTA
 *    par tournoi (§15).
 *
 * Module pur, testé dans `tests/arena-performance.test.ts`.
 */
import { lienSpecialite, PAGES_SPECIALITES } from '@/lib/data/pages-specialites';
import type { PerformanceLevel } from './performance';

export type PasserelleAudience = 'student' | 'prospect';
export type PasserelleTone = 'progresser' | 'franchir' | 'perfectionner';

export type PasserelleContent = {
  audience: PasserelleAudience;
  tone: PasserelleTone;
  title: string;
  paragraphs: string[];
  /** Ligne de valeurs (« Entraînement • Révisions • … »), prospects seulement. */
  values: string | null;
  cta: { label: string; href: string };
  secondary: { label: string; href: string } | null;
};

/** Positionnement selon le niveau (§18, §20). */
export function passerelleTone(level: PerformanceLevel): PasserelleTone {
  return level === 'non_classe' ? 'progresser' : level === 'classe' ? 'franchir' : 'perfectionner';
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Mots-clés du libellé / identifiant de spécialité → slug de l'annuaire. */
const SPECIALTY_RULES: [RegExp, string][] = [
  [/odonto|dentaire/, 'odontologie'],
  [/orthop|traumato/, 'chirurgie-orthopedique-et-traumatologie'],
  [/anesth/, 'anesthesie-reanimation'],
  [/cardio/, 'cardiologie-et-maladies-vasculaires'],
  [/pediat/, 'pediatrie'],
  [/psychiat/, 'psychiatrie'],
  [/radio|imagerie/, 'radiologie-et-imagerie-medicale'],
  [/urgence/, 'medecine-d-urgence'],
  [/medecine generale|\bmg\b|col-mg\b/, 'medecine-generale'],
  [/intensive|reanimation|\bmir\b/, 'medecine-intensive-reanimation'],
  [/pneumo/, 'pneumologie'],
  [/geriat/, 'geriatrie'],
  [/neurolog/, 'neurologie'],
  [/interne/, 'medecine-interne'],
  [/gyneco/, 'gynecologie-medicale'],
];

/**
 * Page Major ECN de la spécialité du Battle : page dédiée quand elle existe
 * (§11 : Psychiatrie → préparation Psychiatrie…), sinon la carte de la
 * spécialité dans l'annuaire, sinon l'annuaire lui-même.
 */
export function majorEcnSpecialtyUrl(specialty: string, specialtyId?: string | null): string {
  const hay = norm(`${specialty} ${specialtyId ?? ''}`);
  for (const [re, slug] of SPECIALTY_RULES) if (re.test(hay)) return lienSpecialite(slug);
  return '/specialites';
}

/** Vrai quand la spécialité dispose de sa page dédiée. */
export function hasDedicatedPage(url: string): boolean {
  return [...PAGES_SPECIALITES.values()].includes(url);
}

/** URL retenue : celle fixée par l'administration, sinon celle de la spécialité. */
export function passerelleUrl(t: { specialty: string; specialty_id?: string | null; passerelle_url?: string | null }): string {
  const custom = (t.passerelle_url ?? '').trim();
  if (custom) return custom;
  return majorEcnSpecialtyUrl(t.specialty, t.specialty_id);
}

/**
 * Lien de l'élève déjà inscrit : son collège Major ECN quand la spécialité du
 * Battle en a un, sinon son accueil. « Redirection vers les contenus
 * correspondant aux faiblesses détectées » (§12) : à défaut d'un lien question
 * par question, le collège de la spécialité est le point d'entrée le plus
 * proche des thèmes travaillés.
 */
export function studentTrainingUrl(collegeId: string | null | undefined): string {
  return collegeId ? `/matieres/${encodeURIComponent(collegeId)}` : '/accueil';
}

const PROSPECT_COPY: Record<PasserelleTone, { title: string; paragraphs: string[]; cta: string }> = {
  progresser: {
    title: 'Besoin d’un coach pour passer au niveau supérieur ?',
    paragraphs: [
      'Major ECN peut vous accompagner dans votre préparation aux EVC.',
      'Il reste du travail. Faites-vous accompagner pour structurer votre entraînement et progresser régulièrement : entraînez-vous, consolidez vos connaissances et bénéficiez d’un accompagnement structuré pour progresser Battle après Battle et, surtout, vous préparer à l’épreuve réelle.',
    ],
    cta: 'Progresser avec Major ECN',
  },
  franchir: {
    title: 'Envie de passer au niveau supérieur ?',
    paragraphs: [
      'Major ECN vous accompagne pour transformer votre entraînement en véritable préparation aux EVC.',
      'Vous avez déjà de solides acquis. Travaillez vos points faibles, gagnez en régularité et franchissez le prochain cap : cours, entraînements, révisions, méthodologie et accompagnement, avec le niveau de coaching adapté à votre préparation.',
    ],
    cta: 'Passer au niveau supérieur avec Major ECN',
  },
  perfectionner: {
    title: 'Passez en mode haute performance avec Major ECN',
    paragraphs: [
      'Même lorsque le niveau est déjà excellent, l’entraînement continue.',
      'Votre niveau est déjà élevé. Major ECN vous accompagne pour consolider vos acquis, travailler la précision, la rapidité, les automatismes et la régularité, et continuer à repousser votre niveau de performance jusqu’aux EVC.',
    ],
    cta: 'Me perfectionner avec Major ECN',
  },
};

const STUDENT_COPY: Record<PasserelleTone, { title: string; paragraphs: string[]; cta: string }> = {
  progresser: {
    title: 'Votre entraînement continue sur Major ECN',
    paragraphs: [
      'Profitez de votre préparation pour travailler les points qui vous ont coûté des points pendant ce Battle.',
      'Reprenez les thèmes de cette manche dans vos cours, vos entraînements et vos révisions, puis revenez plus fort au prochain Battle.',
    ],
    cta: 'Continuer mon entraînement sur Major ECN',
  },
  franchir: {
    title: 'Votre entraînement continue sur Major ECN',
    paragraphs: [
      'Votre Battle vient de mettre en évidence vos points forts et les axes à consolider.',
      'Retrouvez votre préparation Major ECN pour travailler vos points faibles, gagner en régularité et franchir le prochain cap.',
    ],
    cta: 'Poursuivre mon entraînement',
  },
  perfectionner: {
    title: 'Continuez votre entraînement',
    paragraphs: [
      'Votre Battle vient de mettre en évidence vos points forts et les derniers axes à perfectionner.',
      'Retrouvez votre préparation Major ECN et continuez à travailler votre rapidité, vos automatismes et les thèmes sur lesquels vous pouvez encore gagner des points.',
    ],
    cta: 'Poursuivre mon entraînement',
  },
};

export const PASSERELLE_VALUES = 'Entraînement • Révisions • Méthodologie • Accompagnement';

/** Contenu complet du bloc, ou null quand l'administration l'a désactivé. */
export function passerelleContent(input: {
  enabled: boolean;
  level: PerformanceLevel;
  audience: PasserelleAudience;
  /** Page Major ECN du prospect (cf. `passerelleUrl`). */
  prospectUrl: string;
  /** Lien de l'élève (cf. `studentTrainingUrl`). */
  studentUrl: string;
  /** Texte de CTA fixé par l'administration (prospects), sinon celui du niveau. */
  ctaOverride?: string | null;
}): PasserelleContent | null {
  if (!input.enabled) return null;
  const tone = passerelleTone(input.level);
  if (input.audience === 'student') {
    const copy = STUDENT_COPY[tone];
    return {
      audience: 'student', tone, title: copy.title, paragraphs: copy.paragraphs, values: null,
      cta: { label: copy.cta, href: input.studentUrl }, secondary: null,
    };
  }
  const copy = PROSPECT_COPY[tone];
  const custom = (input.ctaOverride ?? '').trim();
  return {
    audience: 'prospect', tone, title: copy.title, paragraphs: copy.paragraphs, values: PASSERELLE_VALUES,
    cta: { label: custom || copy.cta, href: input.prospectUrl },
    secondary: { label: 'Voir les formules', href: hasDedicatedPage(input.prospectUrl) ? `${input.prospectUrl}#formules` : '/specialites' },
  };
}
