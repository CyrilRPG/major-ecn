/**
 * Prépare l'insertion des 42 parcours en base à partir de `parcours.json` :
 * produit un fichier SQL applicable via l'éditeur SQL Supabase (ou l'outil
 * apply_migration). Les tables `major_parcours` et `major_parcours_questions`
 * doivent déjà exister (voir migration `20260804190000_parcours_du_major`).
 *
 * Sortie : `scripts/parcours-pdfs/parcours-seed.sql`
 */
import fs from 'node:fs';

const j = JSON.parse(fs.readFileSync('scripts/parcours-pdfs/parcours.json', 'utf8'));

/** Quote SQL en dollar-quoting pour éviter tout échappement. */
function q(s) {
  if (s === null || s === undefined) return 'null';
  return `$hs$${String(s).replace(/\$hs\$/g, '$ hs$')}$hs$`;
}
function qJson(v) {
  return `$jj$${JSON.stringify(v).replace(/\$jj\$/g, '$ jj$')}$jj$::jsonb`;
}

const out = [];
out.push('-- Contenu des 42 parcours (généré par _parcours_seed.mjs).');

for (const p of j) {
  out.push(
    `update public.major_parcours set titre=${q(p.titre)}, sous_titre=${q(p.sousTitre)}, intro_html=${q(p.introHtml)}, vignette_html=${q(p.vignetteHtml)} where numero=${p.numero};`,
  );
  out.push(`delete from public.major_parcours_questions where parcours_id=(select id from public.major_parcours where numero=${p.numero});`);
  for (const question of p.questions) {
    out.push(
      `insert into public.major_parcours_questions (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html) ` +
      `select id, ${q(question.section)}, ${q(question.format)}, ${question.ordre}, ${q(question.enonceHtml)}, ${qJson(question.items)}, ${q(question.reponseAttendue)}, ${q(question.explicationHtml)} ` +
      `from public.major_parcours where numero=${p.numero};`,
    );
  }
}

fs.writeFileSync('scripts/parcours-pdfs/parcours-seed.sql', out.join('\n'));
console.log(`ok: ${j.length} parcours → scripts/parcours-pdfs/parcours-seed.sql (${out.length} statements)`);
