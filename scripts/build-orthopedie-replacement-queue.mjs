/**
 * Construit la file déterministe de reprise Orthopédie à partir de l'audit
 * structurel et pédagogique. Le fichier obtenu est un manifeste de reprise,
 * jamais une source de contenu : chaque chapitre devra être réécrit depuis
 * son extract.json puis publié transactionnellement.
 *
 * Usage: node scripts/build-orthopedie-replacement-queue.mjs <audit.json> <queue.json>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [auditFile, outputFile] = process.argv.slice(2);
if (!auditFile || !outputFile) throw new Error('usage: node scripts/build-orthopedie-replacement-queue.mjs <audit.json> <queue.json>');
const audit = JSON.parse(readFileSync(resolve(auditFile), 'utf8'));
const worklist = JSON.parse(readFileSync(resolve('../.corpus-orthopedie/worklist.json'), 'utf8'));
const titleKey = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'`]/g, '').replace(/[^a-z0-9]+/gi, '').toLowerCase();
const byTitle = new Map(worklist.map((entry) => [titleKey(entry.titre), entry]));
const aliases = new Map([
  [titleKey('Chirurgie du disque intervertébral cervical'), 'chrirugie-du-disque-intervertebral-cervical'],
  [titleKey('Couverture et pertes de substances post-traumatiques du membre inférieur'), 'couverture-pertes-de-substances-post-traumatique-du-mebre-inferieur-rausky-emc-c'],
  [titleKey('Traitement chirurgical des lésions du LCA'), 'traitement-chirurgicale-des-lesions-du-lca'],
  [titleKey('Traitement chirurgical des malformations de la paroi thoracique antérieure'), 'traitement-chirurgicale-des-malformations-de-la-paroi-thoracique-anterieure'],
]);
for (const [alias, slug] of aliases) {
  const entry = worklist.find((candidate) => candidate.slug === slug);
  if (entry) byTitle.set(alias, entry);
}
const queue = audit.rows
  .filter((row) => row.status !== 'ok')
  .map((row) => {
    const entry = byTitle.get(titleKey(row.title));
    return {
      orderIndex: row.orderIndex,
      courseId: entry?.coursId || null,
      slug: entry?.slug || null,
      title: row.title,
      action: row.status === 'missing' ? 'produce-complete' : 'replace-complete',
      defects: row.defects || [],
      mechanical: (row.defects || []).includes('mechanical-content'),
      status: 'pending',
    };
  });
const unmatched = queue.filter((entry) => !entry.courseId || !entry.slug);
if (unmatched.length) throw new Error(`appariement worklist incomplet : ${unmatched.map((entry) => `ch${entry.orderIndex} ${entry.title}`).join(' | ')}`);
const output = { version: 1, createdAt: new Date().toISOString(), total: queue.length, queue };
mkdirSync(dirname(resolve(outputFile)), { recursive: true });
writeFileSync(resolve(outputFile), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ total: queue.length, produce: queue.filter((entry) => entry.action === 'produce-complete').length, replace: queue.filter((entry) => entry.action === 'replace-complete').length, mechanical: queue.filter((entry) => entry.mechanical).length }));
