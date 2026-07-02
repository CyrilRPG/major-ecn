/**
 * Assemble une fiche-item de Médecine générale en RÉUTILISANT une grosse fiche
 * de révisions en ligne (item « Révisions » d'un sous-collège) comme base :
 *  - extrait VERBATIM les tableaux du/des sous-thèmes voulus (⇒ vraies ★ +
 *    vraies images conservées) ;
 *  - renumérote les parties, ajoute page de garde + plan + synthèse + éclair
 *    + enrichissement (companion) ;
 *  - produit un corps HTML autoportant prêt pour render-mg-fiche.mjs.
 *
 * Généralise build-cardio-item.mjs : la fiche source (cours), la liste des
 * thèmes et la matière sont fournis dans le companion via @META :
 *   <!--@META source=<coursIdFicheRevisions> | matiere=Hématologie |
 *        topic=Hémopathies malignes | letters=A,B | title=... | item=... | plan=a||b -->
 *
 * Usage : node scripts/build-mg-item.mjs <companion.html> <out.html> [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
dotenv({ path: join(ROOT, '.env.local') });

const [, , companionFile, outFile, ...flags] = process.argv;
const DRY = flags.includes('--dry');
if (!companionFile) { console.error('Usage: node scripts/build-mg-item.mjs <companion.html> <out.html> [--dry]'); process.exit(1); }

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function parseCompanion(txt) {
  const meta = {};
  const mm = /<!--@META([\s\S]*?)-->/.exec(txt);
  if (mm) for (const part of mm[1].split('|')) {
    const [k, ...v] = part.split('='); if (k && v.length) meta[k.trim()] = v.join('=').trim();
  }
  const grab = (tag, next) => {
    const re = new RegExp('<!--@' + tag + '-->([\\s\\S]*?)(?=<!--@(?:' + next + ')-->|$)');
    const g = re.exec(txt); return g ? g[1].trim() : '';
  };
  return { meta, enrich: grab('ENRICH', 'SYNTHESE|ECLAIR'), synthese: grab('SYNTHESE', 'ECLAIR'), eclair: grab('ECLAIR', '') };
}

const comp = parseCompanion(readFileSync(resolve(companionFile), 'utf8'));
const sourceCours = comp.meta.source;
if (!sourceCours) { console.error('@META source=<coursId> requis'); process.exit(1); }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await sb.from('fiches').select('content_html').eq('cours_id', sourceCours).maybeSingle();
if (error || !data) { console.error('Fiche source introuvable', error?.message); process.exit(1); }
const SRC = data.content_html;

// Liste ordonnée des thèmes (partie-banner non-repeat) telle qu'elle apparaît
// dans la fiche source — sert à borner chaque section.
const TOPICS = (() => {
  const out = [];
  const re = /partie-banner-title(?:\s+partie-banner-title--repeat)?"[^>]*>([\s\S]*?)<\/span>/g;
  let m;
  while ((m = re.exec(SRC))) {
    if (/--repeat/.test(m[0])) continue;
    const t = clean(m[1]);
    if (t && !out.includes(t)) out.push(t);
  }
  return out;
})();

function esctRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function sectionOf(topic) {
  const ti = TOPICS.indexOf(topic);
  if (ti < 0) { console.error('Thème introuvable dans la fiche source :', topic, '\nThèmes:', TOPICS.join(' | ')); process.exit(1); }
  const i = SRC.search(new RegExp('partie-banner-title[^>]*>' + esctRe(topic)));
  const j = ti + 1 < TOPICS.length ? SRC.search(new RegExp('partie-banner-title[^>]*>' + esctRe(TOPICS[ti + 1]))) : SRC.length;
  return SRC.slice(i - 400, j);
}

function extractTables(section, letters) {
  const tables = [];
  const re = /<table class="fiche-table">[\s\S]*?<\/table>/g;
  let m;
  while ((m = re.exec(section))) {
    const sub = /ft-subtitle-text">\s*([A-Z])\./.exec(m[0].replace(/&nbsp;/g, ' '));
    const letter = sub ? sub[1] : null;
    if (!letters || (letter && letters.includes(letter))) tables.push({ letter, html: m[0] });
  }
  return tables;
}

function buildCover(meta) {
  const plan = (meta.plan || '').split('||').map(s => s.trim()).filter(Boolean);
  const planLi = plan.map((p, i) => `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${i + 1}"><span class="cover-plan-num">${ROMAN[i]}</span><span class="cover-plan-text">${esc(p)}</span></a></li>`).join('\n');
  return `<section class="cover"><div class="cover-band"></div><div class="cover-content">
    <div class="cover-head"><img class="cover-logo" src="__LOGO__" alt="Major ECN">
      <div class="cover-matiere">${esc(meta.matiere || '')}</div>
      <h1 class="cover-title">${esc(meta.title || '')}</h1>
      <div class="cover-year">Année&nbsp;2025-2026</div>
      <div class="cover-item">${esc(meta.item || '')}</div></div>
    <div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${planLi}</ol></div>
    <div class="cover-legend"><div class="cover-section-label">Légende</div><div class="cover-legend-items">
      <span class="cover-legend-item"><span class="cover-legend-sym cover-legend-sym--1">★</span><span class="cover-legend-text">Déjà tombé aux EVC</span></span>
      <span class="cover-legend-item"><span class="cover-legend-sym cover-legend-sym--2">◆</span><span class="cover-legend-text">Notion à haut rendement</span></span>
      <span class="cover-legend-item"><span class="cover-legend-sym cover-legend-sym--3">⚠</span><span class="cover-legend-text">Piège classique</span></span>
    </div></div></div></section>`;
}

function renumber(table, roman, title, letter) {
  return table
    .replace(/(<span class="partie-banner-num">)[^<]*(<\/span>)/g, `$1${roman}$2`)
    .replace(/(<span class="partie-banner-title(?:[^"]*)">)[^<]*(<\/span>)/g, `$1${esc(title)}$2`)
    .replace(/(<th class="ft-tag">)[^<]*(<\/th>)/g, `$1${roman}$2`)
    .replace(/(<span class="ft-subtitle-text">\s*)[A-Z](\.)/g, `$1${letter}$2`);
}

const letters = comp.meta.letters ? comp.meta.letters.split(',').map(s => s.trim()) : null;
const section = sectionOf(comp.meta.topic);
const coreTables = extractTables(section, letters);

if (DRY) {
  console.log('Source:', sourceCours, '| Topic:', comp.meta.topic, '| letters:', letters || 'ALL');
  console.log('Core tables:', coreTables.length);
  coreTables.forEach((t, i) => {
    const sub = /ft-subtitle-text">([\s\S]*?)<\/span>/.exec(t.html);
    console.log(`  [${i}] letter=${t.letter} ★=${(t.html.match(/★/g)||[]).length} img=${(t.html.match(/<img/g)||[]).length}  ${sub?clean(sub[1]):''}`);
  });
  console.log('\nThèmes source:', TOPICS.join(' | '));
  process.exit(0);
}

const letterOrder = [];
for (const t of coreTables) if (t.letter && !letterOrder.includes(t.letter)) letterOrder.push(t.letter);
const seqLetters = ['A','B','C','D','E','F','G','H'];
const parties = [];
let idx = 0;
for (const t of coreTables) {
  const li = letterOrder.indexOf(t.letter);
  const roman = ROMAN[li] || ROMAN[idx];
  const seqLetter = seqLetters[li] || 'A';
  parties.push(`<section class="partie-page" id="partie-${(li < 0 ? idx : li) + 1}">${renumber(t.html, roman, comp.meta.title, seqLetter)}</section>`);
  idx++;
}

const enrich = comp.enrich ? `<section class="partie-page">${comp.enrich}</section>` : '';
const synthese = comp.synthese ? `<section class="page synthese-page"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div>${comp.synthese}</section>` : '';
const eclair = comp.eclair ? `<section class="page eclair-page"><div class="eclair-card">${comp.eclair}<div class="eclair-footer"><img src="__LOGO__" class="eclair-logo" alt="Major ECN"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>` : '';

const body = `<div class="page-watermark"><img src="__WATERMARK__" alt=""></div>
<span class="string-source string-source--cours">${esc(comp.meta.title || '')}</span>
<span class="string-source string-source--footer">Major ECN&nbsp;&middot;&nbsp;2025-2026</span>
${buildCover(comp.meta)}
${parties.join('\n')}
${enrich}
${synthese}
${eclair}`;

writeFileSync(resolve(outFile), body, 'utf8');
console.log(`✔ ${outFile} — ${coreTables.length} tables core, ★=${(body.match(/★/g)||[]).length} (dont légende=1), img=${(body.match(/<img/g)||[]).length}`);
