/**
 * EVC Arena — format d'import des questions (§20). Module pur, testé.
 *
 * Un fichier CSV (séparateur `;` ou `,`) ou tableur, une ligne par question,
 * colonnes (insensibles à la casse et aux accents) :
 *
 *   type            QRM | QRU | QRP
 *   n               nombre de réponses attendues (QRP uniquement)
 *   ponderation     coefficient (défaut 1)
 *   vignette        contexte clinique facultatif
 *   enonce          énoncé de la question
 *   A … K           libellé des propositions (au moins deux)
 *   reponses        lettres exactes, ex. « A, C, D » ou « ACD »
 *   indispensables  lettres marquées indispensables (facultatif)
 *   inacceptables   lettres marquées inacceptables (facultatif)
 *   justification_A … justification_K   (facultatif)
 *   explication     explication détaillée
 *   pieges          pièges de l'énoncé
 *   erreurs         erreurs les plus fréquentes (qualitatif)
 *   references      références officielles
 *
 * Les validations reprennent celles de l'import (§20) : question incomplète,
 * pondération manquante, sans bonne réponse, QRU à plusieurs bonnes réponses,
 * QRP dont n ne correspond pas, proposition à la fois indispensable et
 * inacceptable. Une ligne invalide est rejetée avec son motif ; les autres
 * passent.
 */
import type { QType } from './scoring';
import { LETTERS, sanitizeItems, type ArenaItem } from './types';

export type ImportedQuestion = {
  type: QType;
  expected_count: number | null;
  weight: number;
  enonce: string;
  vignette: string | null;
  items: ArenaItem[];
  explanation: string;
  pieges: string;
  erreurs_frequentes: string;
  references_text: string;
};

export type ImportResult = { questions: ImportedQuestion[]; rejected: { line: number; reason: string }[] };

export const IMPORT_TEMPLATE_HEADER = [
  'type', 'n', 'ponderation', 'vignette', 'enonce', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'reponses', 'indispensables', 'inacceptables',
  'justification_A', 'justification_B', 'justification_C', 'justification_D', 'justification_E',
  'explication', 'pieges', 'erreurs', 'references',
];

export const IMPORT_TEMPLATE_EXAMPLE = [
  'QRM', '', '1', '', 'Concernant l’artérite à cellules géantes, quelles sont les propositions exactes ?',
  'Elle touche préférentiellement les sujets de plus de 50 ans.', 'La VS est habituellement normale.', 'Une claudication de la mâchoire est très évocatrice.', 'La corticothérapie est débutée sans attendre la biopsie.', 'Une biopsie normale élimine le diagnostic.', '', '', '', '', '', '',
  'A, C, D', '', 'E',
  'Pic d’incidence après 70 ans.', 'Le syndrome inflammatoire est quasi constant.', '', '', 'La biopsie peut être négative (atteinte segmentaire).',
  'Explication détaillée…', 'Le piège porte sur la biopsie.', 'Confusion fréquente entre VS normale et CRP normale.', 'Recommandations HAS 2017 ; PNDS.',
];

function key(k: string): string {
  return k
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const ALIASES: Record<string, string> = {
  type: 'type', question_type: 'type',
  n: 'n', nombre_attendu: 'n', nb_reponses: 'n', expected_count: 'n',
  ponderation: 'ponderation', poids: 'ponderation', coefficient: 'ponderation', weight: 'ponderation',
  vignette: 'vignette', contexte: 'vignette',
  enonce: 'enonce', question: 'enonce', intitule: 'enonce',
  reponses: 'reponses', reponse: 'reponses', bonnes_reponses: 'reponses', correct: 'reponses', reponses_attendues: 'reponses',
  indispensables: 'indispensables', indispensable: 'indispensables',
  inacceptables: 'inacceptables', inacceptable: 'inacceptables',
  explication: 'explication', explanation: 'explication', correction: 'explication',
  pieges: 'pieges', piege: 'pieges',
  erreurs: 'erreurs', erreurs_frequentes: 'erreurs',
  references: 'references', reference: 'references', biblio: 'references',
};

function parseLetters(v: string): string[] {
  return [...new Set(v.toUpperCase().replace(/[^A-K]/g, '').split(''))];
}

/** Normalise une ligne brute (clés arbitraires) vers les colonnes attendues. */
export function normalizeRow(row: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    const nk = key(k);
    const val = v === null || v === undefined ? '' : String(v).trim();
    if (/^[a-k]$/.test(nk)) out[nk.toUpperCase()] = val;
    else if (/^(justification|justif|j)_?([a-k])$/.test(nk)) out[`justification_${nk.slice(-1).toUpperCase()}`] = val;
    else if (ALIASES[nk]) out[ALIASES[nk]] = val;
  }
  return out;
}

export function parseImportedRows(rows: Record<string, unknown>[]): ImportResult {
  const questions: ImportedQuestion[] = [];
  const rejected: ImportResult['rejected'] = [];
  rows.forEach((raw, i) => {
    const line = i + 2; // ligne 1 = en-tête
    const r = normalizeRow(raw);
    const allEmpty = Object.values(r).every((v) => !v);
    if (allEmpty) return;
    const typeRaw = (r.type || '').toUpperCase();
    const type: QType | null = typeRaw === 'QRM' || typeRaw === 'QRU' || typeRaw === 'QRP' ? typeRaw : null;
    if (!type) { rejected.push({ line, reason: `Type inconnu « ${r.type || ''} » (QRM, QRU ou QRP attendu).` }); return; }
    const enonce = r.enonce ?? '';
    if (!enonce) { rejected.push({ line, reason: 'Énoncé vide.' }); return; }
    const weightRaw = r.ponderation ? Number(String(r.ponderation).replace(',', '.')) : 1;
    if (!Number.isFinite(weightRaw) || weightRaw <= 0) { rejected.push({ line, reason: 'Pondération invalide.' }); return; }
    const correct = new Set(parseLetters(r.reponses ?? ''));
    const indis = new Set(parseLetters(r.indispensables ?? ''));
    const inac = new Set(parseLetters(r.inacceptables ?? ''));
    const rawItems = LETTERS.filter((l) => (r[l] ?? '').length > 0).map((l) => ({
      enonce: r[l],
      is_correct: correct.has(l),
      indispensable: indis.has(l),
      inacceptable: inac.has(l),
      justification: r[`justification_${l}`] ?? '',
    }));
    // Les lettres de réponse doivent viser des propositions existantes.
    const present = new Set(LETTERS.filter((l) => (r[l] ?? '').length > 0));
    const unknown = [...correct, ...indis, ...inac].filter((l) => !present.has(l));
    if (unknown.length) { rejected.push({ line, reason: `Lettre(s) sans proposition : ${[...new Set(unknown)].join(', ')}.` }); return; }
    const nRaw = r.n ? Number(r.n) : null;
    const expected_count = type === 'QRP' ? (nRaw && Number.isInteger(nRaw) && nRaw >= 1 ? nRaw : correct.size) : null;
    const { items, issues } = sanitizeItems(rawItems, type, expected_count);
    if (issues.length) { rejected.push({ line, reason: issues.join(' ') }); return; }
    questions.push({
      type,
      expected_count,
      weight: weightRaw,
      enonce,
      vignette: r.vignette || null,
      items,
      explanation: r.explication ?? '',
      pieges: r.pieges ?? '',
      erreurs_frequentes: r.erreurs ?? '',
      references_text: r.references ?? '',
    });
  });
  return { questions, rejected };
}

/** Fichier modèle CSV (séparateur « ; », BOM UTF-8 pour Excel). */
export function importTemplateCsv(): string {
  const esc = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return '﻿' + [IMPORT_TEMPLATE_HEADER.map(esc).join(';'), IMPORT_TEMPLATE_EXAMPLE.map(esc).join(';')].join('\n');
}
