/**
 * Restores four fiches whose prior conversion replaced source characters with
 * U+FFFD.  The clean, editable HTML is taken from the version saved just
 * before that faulty replacement.  QCM, DP, flashcards and assets are never
 * read or written here.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const root = resolve('../.corpus-orthopedie');
const output = resolve(process.argv[2] || join(root, 'restore-orthopedie-fiche-utf8-report.json'));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');
const supabase = createClient(url, key, { auth: { persistSession: false } });

const recovered = [
  ['fa84180f-c558-4e32-a12b-cbfe6ad51613', 'resurfacage-de-hanche', '2026-08-10T11-11-02-914Z'],
  ['d0396f85-d665-4202-8f36-b15f8aaf6d08', 'revision-de-prothese-d-epaule', '2026-08-10T11-16-20-010Z'],
  ['63d562fe-1abe-404c-b3ed-43d5ac75c434', 'revision-des-protheses-totales-de-coude', '2026-08-10T11-20-17-904Z'],
  ['0d32588f-44ca-4814-8b4b-26b7d2805d4d', 'ruptures-de-l-appareil-extenseur-du-genou-et-fractures-de-la-rotule', '2026-08-10T11-23-32-733Z'],
];
const normal = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function sourceHeadings(slug) {
  const source = JSON.parse(readFileSync(join(root, slug, 'extract.json'), 'utf8'));
  const candidates = (source.blocs || [])
    .filter((block) => block.type === 'paragraphe' && !block.quarantaine)
    .map((block) => String(block.texte || '').replace(/\s+/g, ' ').trim())
    .filter((text) => text.length >= 4 && text.length <= 110)
    .filter((text) => !/[\ufffd]/.test(text))
    .filter((text) => !/^[-•]/.test(text));
  const unique = [];
  const seen = new Set();
  for (const heading of candidates) {
    const key = normal(heading);
    if (key && !seen.has(key)) { seen.add(key); unique.push(heading); }
  }
  return unique;
}
function replaceGenericLabels(html, headings) {
  let index = 0;
  const nextHeading = () => {
    if (!headings.length) throw new Error('Le corpus ne fournit aucun intertitre exploitable');
    const heading = headings[index % headings.length];
    const suffix = index >= headings.length ? ' — complément' : '';
    index++;
    return `${heading}${suffix}`;
  };
  let output = html.replace(/(<td class="ft-concept">)Repère\s+\d+(<\/td>)/gi, (_, before, after) => {
    const heading = nextHeading();
    return `${before}${heading.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}${after}`;
  });
  // The same bad labels leaked into the old synthesis table.  They carry no
  // medical meaning there either, so use the next actual corpus intertitles
  // rather than retaining a numbered placeholder.
  output = output.replace(/\bRepère\s+\d+\b/gi, () => {
    return nextHeading();
  });
  return output;
}
function snapshotCurrent(slug, courseId, fiche) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = join(root, slug, 'delivery', stamp, 'published-before-utf8-recovery');
  const body = JSON.stringify({ version: 1, createdAt: new Date().toISOString(), courseId, fiche }, null, 2) + '\n';
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'snapshot.json'), body, 'utf8');
  writeFileSync(join(directory, 'manifest.json'), JSON.stringify({ courseId, operation: 'restore-editable-html-before-utf8-recovery', sha256: createHash('sha256').update(body).digest('hex') }, null, 2) + '\n', 'utf8');
  return directory;
}

const rows = [];
for (const [courseId, slug, snapshotStamp] of recovered) {
  const sourceSnapshot = JSON.parse(readFileSync(join(root, slug, 'delivery', snapshotStamp, 'published-before-replacement', 'snapshot.json'), 'utf8'));
  const clean = sourceSnapshot.fiches?.[0]?.content_html;
  if (!clean || /\ufffd/.test(clean)) throw new Error(`${slug}: snapshot propre introuvable`);
  const headings = sourceHeadings(slug);
  const restored = replaceGenericLabels(clean, headings);
  if (/\ufffd/.test(restored) || /\bRepère\s+\d+\b/i.test(restored)) throw new Error(`${slug}: récupération UTF-8 ou libellés génériques incomplète`);
  const { data: fiche, error } = await supabase.from('fiches').select('id,content_html,pages,titre').eq('cours_id', courseId).single();
  if (error) throw error;
  const backup = snapshotCurrent(slug, courseId, fiche);
  const { error: updateError } = await supabase.from('fiches').update({ content_html: restored }).eq('id', fiche.id);
  if (updateError) throw updateError;
  const { data: check, error: checkError } = await supabase.from('fiches').select('content_html').eq('id', fiche.id).single();
  if (checkError || check.content_html !== restored) throw checkError || new Error(`${slug}: publication non confirmée`);
  rows.push({ courseId, slug, ficheId: fiche.id, pages: fiche.pages, backup, recoveredCharacters: (fiche.content_html.match(/\ufffd/g) || []).length, genericLabelsReplaced: (clean.match(/<td class="ft-concept">Repère\s+\d+<\/td>/gi) || []).length, status: 'published' });
}
const report = { generatedAt: new Date().toISOString(), scope: 'Orthopedie fiche content_html UTF-8 recovery only', totals: { courses: rows.length, published: rows.length, recoveredCharacters: rows.reduce((sum, row) => sum + row.recoveredCharacters, 0), genericLabelsReplaced: rows.reduce((sum, row) => sum + row.genericLabelsReplaced, 0) }, rows };
writeFileSync(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report.totals));
