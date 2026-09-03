/**
 * Audit des titres et des associations cours ↔ fiche — Orthopédie 89 à 133.
 *
 * Portée volontairement étroite : cette vérification ne modifie un titre de
 * fiche que lorsque le H1 et le libellé de couverture attestent le même sujet
 * que le cours. Toute fiche dont le contenu relève d'un autre sujet est
 * signalée, jamais renommée pour masquer l'erreur d'association.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputRoot = resolve(`../.corpus-orthopedie/title-audit-089-133-${stamp}`);
mkdirSync(outputRoot, { recursive: true });

const decode = (value) => String(value ?? '')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"');
const text = (value) => decode(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const displayKey = (value) => text(value)
  .normalize('NFC')
  .replace(/[’']/g, "'")
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();
const topicKey = (value) => text(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, "'")
  .replace(/[^\p{L}\p{N}]+/gu, '')
  .trim()
  .toLowerCase();
const h1 = (html) => text(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(String(html ?? ''))?.[1] ?? '');
const coverTitle = (html) => text(/class=["'][^"']*string-source--cours[^"']*["'][^>]*>([\s\S]*?)<\/span>/i.exec(String(html ?? ''))?.[1] ?? '');

const { data: courses, error: coursesError } = await db
  .from('cours')
  .select('id,order_index,titre')
  .eq('matiere_id', 'col-orthopedie')
  .gte('order_index', 89)
  .lte('order_index', 133)
  .order('order_index');
if (coursesError) throw coursesError;
if (courses.length !== 45) throw new Error(`Portée incomplète : ${courses.length}/45 cours lus`);

const rows = [];
const certainCorrections = [];
for (const course of courses) {
  const { data: ficheRows, error: ficheError } = await db
    .from('fiches')
    .select('id,cours_id,titre,content_html')
    .eq('cours_id', course.id);
  if (ficheError) throw ficheError;
  if (ficheRows.length !== 1) {
    rows.push({ coursId: course.id, orderIndex: course.order_index, courseTitle: course.titre, status: 'association-to-review', reason: `${ficheRows.length} fiche(s) trouvée(s)` });
    continue;
  }

  const fiche = ficheRows[0];
  const ficheHeading = h1(fiche.content_html);
  const ficheCover = coverTitle(fiche.content_html);
  const expectedDisplay = displayKey(course.titre);
  const expectedTopic = topicKey(course.titre);
  const titleMatches = displayKey(fiche.titre) === expectedDisplay;
  const h1Matches = displayKey(ficheHeading) === expectedDisplay;
  const coverMatches = displayKey(ficheCover) === expectedDisplay;
  const h1SubjectMatches = topicKey(ficheHeading) === expectedTopic;
  const coverSubjectMatches = topicKey(ficheCover) === expectedTopic;
  const base = {
    coursId: course.id,
    ficheId: fiche.id,
    orderIndex: course.order_index,
    courseTitle: text(course.titre),
    ficheTitleBefore: text(fiche.titre),
    contentH1: ficheHeading,
    coverTitle: ficheCover,
  };

  // #89 is concurrently rebuilt from its source. It is deliberately observed
  // but excluded from conclusions and from any mutation in this audit.
  if (course.order_index === 89) {
    rows.push({ ...base, status: 'excluded-concurrent-reconstruction' });
    continue;
  }
  if (h1Matches && coverMatches && !titleMatches) {
    const targetTitle = text(course.titre).normalize('NFC');
    certainCorrections.push({ ...base, targetTitle, reason: 'H1 et couverture correspondent au titre officiel ; seul le titre de fiche est incomplet/altéré.' });
    rows.push({ ...base, targetTitle, status: 'certain-title-correction' });
    continue;
  }
  if (!h1SubjectMatches || !coverSubjectMatches) {
    rows.push({
      ...base,
      status: 'wrong-subject-reported-no-rename',
      reason: 'Le H1 ou la couverture ne correspond pas au titre officiel : association/contenu à reconstruire, non renommé.',
      matches: { ficheTitle: titleMatches, h1: h1Matches, cover: coverMatches, h1Subject: h1SubjectMatches, coverSubject: coverSubjectMatches },
    });
    continue;
  }
  if (!titleMatches || !h1Matches || !coverMatches) {
    rows.push({
      ...base,
      status: 'minor-title-variant-reported-no-rename',
      reason: 'Même sujet, mais une différence typographique existe entre le titre officiel et le contenu ; aucun renommage automatique car la forme source reste à arbitrer.',
      matches: { ficheTitle: titleMatches, h1: h1Matches, cover: coverMatches },
    });
    continue;
  }
  rows.push({ ...base, status: 'aligned' });
}

const snapshot = {
  createdAt: new Date().toISOString(),
  scope: 'Orthopédie 89–133 ; titres de fiches seulement',
  corrections: certainCorrections,
};
const snapshotJson = `${JSON.stringify(snapshot, null, 2)}\n`;
writeFileSync(join(outputRoot, 'snapshot-before-certain-title-corrections.json'), snapshotJson, 'utf8');

for (const correction of certainCorrections) {
  const { error: updateError } = await db.from('fiches').update({ titre: correction.targetTitle }).eq('id', correction.ficheId);
  if (updateError) throw updateError;
  const { data: readback, error: readError } = await db.from('fiches').select('titre,cours_id').eq('id', correction.ficheId).single();
  if (readError) throw readError;
  if (readback.cours_id !== correction.coursId || readback.titre !== correction.targetTitle) throw new Error(`Readback invalide pour la fiche ${correction.ficheId}`);
  const row = rows.find((candidate) => candidate.ficheId === correction.ficheId);
  row.ficheTitleAfter = readback.titre;
  row.status = 'corrected-title';
}

const report = {
  generatedAt: new Date().toISOString(),
  scope: 'Audit titres et associations cours ↔ fiche — Orthopédie 89–133',
  policy: 'Renommage seulement si titre officiel, H1 et couverture désignent exactement le même sujet ; les erreurs de sujet sont rapportées sans renommage.',
  totals: {
    courses: rows.length,
    excluded: rows.filter((row) => row.status === 'excluded-concurrent-reconstruction').length,
    aligned: rows.filter((row) => row.status === 'aligned').length,
    correctedTitles: rows.filter((row) => row.status === 'corrected-title').length,
    wrongSubjectReported: rows.filter((row) => row.status === 'wrong-subject-reported-no-rename').length,
    minorTitleVariants: rows.filter((row) => row.status === 'minor-title-variant-reported-no-rename').length,
    associationReview: rows.filter((row) => row.status === 'association-to-review').length,
  },
  snapshotSha256: createHash('sha256').update(snapshotJson).digest('hex'),
  rows,
};
writeFileSync(join(outputRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputRoot, totals: report.totals, corrections: certainCorrections.map((row) => ({ orderIndex: row.orderIndex, title: row.targetTitle })) }, null, 2));
