/**
 * Assemble une fiche-item de Médecine générale en RÉUTILISANT la grosse fiche
 * de révisions en ligne (item Révisions cardio, cours 551b3dc8…) comme base :
 *  - extrait VERBATIM les tableaux du/des sous-thèmes voulus (⇒ vraies ★ +
 *    vraies images conservées) ;
 *  - renumérote les parties (I/II/…) au nom de l'item ;
 *  - ajoute page de garde + plan (depuis un companion), tables de synthèse,
 *    fiche éclair, et tables d'enrichissement PAE (companion) ;
 *  - produit un corps HTML autoportant prêt pour render-mg-fiche.mjs.
 *
 * Usage :
 *   node scripts/build-cardio-item.mjs <companion.html> <out.html> [--dry]
 *
 * Le companion.html contient des blocs délimités par commentaires :
 *   <!--@META topic=... | letters=A,B | title=... | item=... | plan=a||b||c -->
 *   <!--@ENRICH-->  ... tables .fiche-table d'enrichissement (option) ...
 *   <!--@SYNTHESE--> ... blocs synthèse ...
 *   <!--@ECLAIR-->   ... contenu de la eclair-card ...
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
if (!companionFile) { console.error('Usage: node scripts/build-cardio-item.mjs <companion.html> <out.html> [--dry]'); process.exit(1); }

const TOPICS = ['Facteurs de risque','Hypertension artérielle','Dyslipidémie','Maladie coronaire','Insuffisance cardiaque','Fibrillation atriale','Valvulopathies et prothèses','Maladie thromboembolique et AOMI','Synthèse'];
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(URL, KEY, { auth: { persistSession: false } });
const { data, error } = await sb.from('fiches').select('content_html')
  .eq('cours_id', '551b3dc8-2bbe-4007-93f7-3768ff1fa181').maybeSingle();
if (error || !data) { console.error('Fiche Révisions introuvable', error?.message); process.exit(1); }
const SRC = data.content_html;

function sectionOf(topic) {
  const i = SRC.search(new RegExp('partie-banner-title[^>]*>' + topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const ti = TOPICS.indexOf(topic);
  const j = ti + 1 < TOPICS.length ? SRC.search(new RegExp('partie-banner-title[^>]*>' + TOPICS[ti + 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) : SRC.length;
  return SRC.slice(i - 400, j); // marge amont pour capturer l'ouverture <table>
}

// Récupère les blocs <table class="fiche-table">…</table> dont le sous-titre
// commence par une des lettres demandées.
function extractTables(section, letters) {
  const tables = [];
  const re = /<table class="fiche-table">[\s\S]*?<\/table>/g;
  let m;
  while ((m = re.exec(section))) {
    const t = m[0];
    const sub = /ft-subtitle-text">\s*([A-Z])\./.exec(t.replace(/<[^>]+>/g, m2 => m2).replace(/&nbsp;/g, ' '));
    const letter = sub ? sub[1] : null;
    if (!letters || (letter && letters.includes(letter))) tables.push({ letter, html: t });
  }
  return tables;
}

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
  return {
    meta,
    enrich: grab('ENRICH', 'SYNTHESE|ECLAIR'),
    synthese: grab('SYNTHESE', 'ECLAIR'),
    eclair: grab('ECLAIR', ''),
  };
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildCover(meta) {
  const plan = (meta.plan || '').split('||').map(s => s.trim()).filter(Boolean);
  const planLi = plan.map((p, i) => `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${i + 1}"><span class="cover-plan-num">${ROMAN[i]}</span><span class="cover-plan-text">${esc(p)}</span></a></li>`).join('\n');
  return `<section class="cover"><div class="cover-band"></div><div class="cover-content">
    <div class="cover-head"><img class="cover-logo" src="__LOGO__" alt="Major ECN">
      <div class="cover-matiere">Cardiologie</div>
      <h1 class="cover-title">${esc(meta.title || '')}</h1>
      <div class="cover-year">Année&nbsp;2025-2026</div>
      <div class="cover-item">${esc(meta.item || '')}</div></div>
    <div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${planLi}</ol></div>
    </div></section>`;
}

// Renumérote une table pour l'item : partie-banner-num + ft-tag → roman ; titre
// de bannière → titre de l'item ; lettre de sous-titre → seq A/B/C.
function renumber(table, roman, title, letter) {
  return table
    .replace(/(<span class="partie-banner-num">)[^<]*(<\/span>)/g, `$1${roman}$2`)
    .replace(/(<span class="partie-banner-title(?:[^"]*)">)[^<]*(<\/span>)/g, `$1${esc(title)}$2`)
    .replace(/(<th class="ft-tag">)[^<]*(<\/th>)/g, `$1${roman}$2`)
    .replace(/(<span class="ft-subtitle-text">\s*)[A-Z](\.)/g, `$1${letter}$2`);
}

const comp = parseCompanion(readFileSync(resolve(companionFile), 'utf8'));
const letters = comp.meta.letters ? comp.meta.letters.split(',').map(s => s.trim()) : null;
const section = sectionOf(comp.meta.topic);
const coreTables = extractTables(section, letters);

if (DRY) {
  console.log('Topic:', comp.meta.topic, '| letters:', letters || 'ALL');
  console.log('Core tables:', coreTables.length);
  coreTables.forEach((t, i) => {
    const sub = /ft-subtitle-text">([\s\S]*?)<\/span>/.exec(t.html);
    const stars = (t.html.match(/★/g) || []).length, imgs = (t.html.match(/<img/g) || []).length;
    console.log(`  [${i}] letter=${t.letter} ★=${stars} img=${imgs}  ${sub ? sub[1].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim() : ''}`);
  });
  process.exit(0);
}

// Groupe par lettre pour attribuer un roman par sous-section
const letterOrder = [];
for (const t of coreTables) if (t.letter && !letterOrder.includes(t.letter)) letterOrder.push(t.letter);
const seqLetters = ['A','B','C','D','E','F','G','H'];
const parties = [];
let idx = 0;
for (const t of coreTables) {
  const li = letterOrder.indexOf(t.letter);
  const roman = ROMAN[li] || ROMAN[idx];
  const seqLetter = seqLetters[li] || 'A';
  parties.push(`<section class="partie-page"${idx === 0 ? ' id="partie-1"' : ` id="partie-${li + 1}"`}>${renumber(t.html, roman, comp.meta.title, seqLetter)}</section>`);
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
const stars = (body.match(/★/g) || []).length, imgs = (body.match(/<img/g) || []).length;
console.log(`✔ ${outFile} — ${coreTables.length} tables core, ★=${stars} (dont légende=1), img=${imgs}`);
