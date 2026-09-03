/**
 * Editorial-quality triage for Orthopédie fiches.
 *
 * This is deliberately stricter than the structural audit: a valid DOM must
 * not hide OCR fragments, generic template headings, dangling references, or
 * missing numeric values. It never writes to the database.
 *
 * Usage: node scripts/audit-orthopedie-fiche-editorial-quality.mjs <report.json>
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
const output = process.argv[2];
if (!output?.toLowerCase().endsWith('.json')) throw new Error('Usage: node scripts/audit-orthopedie-fiche-editorial-quality.mjs <report.json>');
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const minPosition = Number(option('--min-position', '1'));
const maxPosition = Number(option('--max-position', '133'));

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const worklist = JSON.parse(readFileSync(resolve('../.corpus-orthopedie/worklist.json'), 'utf8'));
const strip = (value) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const occurrences = (value, pattern) => (String(value).match(pattern) ?? []).length;
const selectedWorklist = worklist.slice(Math.max(0, minPosition - 1), Math.max(0, maxPosition));
const primaryFicheByCourse = new Map();
// content_html contains embedded source images; retrieving all 133 rows in a
// single PostgREST statement can exceed the hosted statement timeout.  Small
// read-only batches keep the audit reliable without changing its scope.
for (let start = 0; start < selectedWorklist.length; start += 8) {
  const ids = selectedWorklist.slice(start, start + 8).map((entry) => entry.coursId);
  const { data: ficheRows, error: fichesError } = await supabase
    .from('fiches').select('id,cours_id,titre,content_html,pages,order_index')
    .in('cours_id', ids)
    .order('order_index');
  if (fichesError) throw fichesError;
  for (const fiche of ficheRows ?? []) {
    if (!primaryFicheByCourse.has(fiche.cours_id)) primaryFicheByCourse.set(fiche.cours_id, fiche);
  }
}

const rows = [];
for (const entry of selectedWorklist) {
  const fiche = primaryFicheByCourse.get(entry.coursId);
  if (!fiche) { rows.push({ coursId: entry.coursId, slug: entry.slug, title: entry.titre, status: 'missing', reasons: ['fiche manquante'] }); continue; }

  const html = String(fiche.content_html ?? '');
  const plain = strip(html);
  const reasons = [];
  const genericHeadingCount = occurrences(html, /(?:Principes et repères|Évaluation et décision|Technique et sécurité|Suites et situations à risque|Repères du chapitre|Éléments pratiques)/gi);
  // A real percentage may contain a space before the sign (e.g. "19,3 %").
  // Flag only a bare sign not preceded by a digit, with or without that space.
  const danglingPercentages = occurrences(plain, /(?<!\d)(?<!\d\s)%(?=$|[\s,.;:)])/g);
  // A word such as “figure” inside a complete caption or a sentence is not
  // a broken reference.  Only a standalone trailing token is an editorial
  // fragment (the prior broad rule created false positives on valid captions).
  const danglingReferences = occurrences(plain, /(?:^|[.!?]\s+)(?:Fig(?:ure)?|Tableau)\.?\s*(?=$|[.!?])/gim);
  const syntheticCover = /Synthèse issue du corpus|Repères du chapitre|Éléments pratiques/i.test(html);
  const fragments = occurrences(plain, /(?:^|\s)(?:de|du|des|et|à|pour|avec|une|un|la|le|les)\s*$/gim);
  const malformedCells = [...html.matchAll(/<td[^>]*class=["'][^"']*ft-concept[^"']*["'][^>]*>([\s\S]*?)<\/td>/gi)]
    .map((match) => strip(match[1]))
    .filter((cell) => cell.length > 0 && (cell.length < 3 || /(?:^|\s)(?:de|du|des|et|à|pour|avec|une|un|la|le|les|tige\.)$/i.test(cell))).length;
  const replacementChars = occurrences(plain, /�/g);

  if (syntheticCover && genericHeadingCount >= 4) reasons.push('gabarit générique de fiche');
  if (danglingPercentages) reasons.push(`${danglingPercentages} pourcentage(s) sans valeur`);
  if (danglingReferences >= 3) reasons.push(`${danglingReferences} référence(s) de figure/tableau incomplète(s)`);
  if (malformedCells >= 3) reasons.push(`${malformedCells} cellule(s) de concept tronquée(s)`);
  if (fragments >= 5) reasons.push(`${fragments} fin(s) de phrase fragmentaire(s)`);
  if (replacementChars) reasons.push(`${replacementChars} caractère(s) de remplacement`);

  rows.push({
    coursId: entry.coursId,
    slug: entry.slug,
    title: entry.titre,
    ficheTitle: fiche.titre,
    pages: fiche.pages,
    status: reasons.length ? 'rebuild' : 'review',
    reasons,
    metrics: { genericHeadingCount, danglingPercentages, danglingReferences, malformedCells, fragments, replacementChars },
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  scope: 'Orthopédie — audit éditorial lecture seule',
  positions: [minPosition, maxPosition],
  totals: {
    courses: rows.length,
    rebuildCandidates: rows.filter((row) => row.status === 'rebuild').length,
    reviewCandidates: rows.filter((row) => row.status === 'review').length,
    missing: rows.filter((row) => row.status === 'missing').length,
  },
  rows,
};
mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(resolve(output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.totals));
console.table(rows.filter((row) => row.status !== 'review').map((row) => ({ title: row.title, status: row.status, reasons: row.reasons.join(' · ') })));
