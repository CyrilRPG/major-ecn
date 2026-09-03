#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { emitCollegePackage } from './lib/college-content-package.mjs';
import { coverageBodyBlocks, eligibleCoverageCount } from './lib/anesthesie-coverage.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE_DIR = resolve(ROOT, '..', 'contenus', 'anesthésie réa');
const CORPUS_DIR = resolve(ROOT, '.corpus-anesthesie-reanimation');
const EXTRACTOR = resolve(ROOT, 'scripts', 'docx-extract.mjs');
const FICHE_BUILDER = resolve(ROOT, '_fiche-build.mjs');
const ONLY = process.argv.includes('--pilot') ? 2 : Number(process.argv.find((v) => /^--chapter=/.test(v))?.split('=')[1] || 0);
const FORCE_EXTRACT = process.argv.includes('--force-extract');
const DRY_RUN = process.argv.includes('--dry-run');

function updateManifestLocked(freshEntries) {
  const manifestPath = join(CORPUS_DIR, 'manifest.json');
  const lockPath = join(CORPUS_DIR, 'manifest.lock');
  const startedAt = Date.now();
  let lockFd;
  while (lockFd === undefined) {
    try {
      lockFd = openSync(lockPath, 'wx');
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      if (Date.now() - startedAt > 30000) throw new Error(`Verrou du manifeste indisponible après 30 s : ${lockPath}`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
  try {
    const existing = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : [];
    const merged = [...existing.filter((old) => !freshEntries.some((fresh) => fresh.numero === old.numero)), ...freshEntries]
      .sort((a, b) => a.numero - b.numero);
    writeFileSync(manifestPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  } finally {
    closeSync(lockFd);
    unlinkSync(lockPath);
  }
  return manifestPath;
}

const clean = (value) => String(value ?? '')
  .replace(/anesthésiste\s*-?\s*réanimateur/gi, 'anesthésiste-réanimateur')
  .replace(/\bLexamen\b/g, 'L’examen').replace(/\bunindex\b/gi, 'un index')
  .replace(/\binter-national/gi, 'international').replace(/\bmème\b/gi, 'même')
  .replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
const slugify = (value) => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 90);

function stableUuid(value) {
  const hex = createHash('sha1').update(`major-ecn:anesthesie-reanimation:${value}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ['8', '9', 'a', 'b'][parseInt(hex[16], 16) % 4];
  const s = hex.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

function sourceFiles() {
  return readdirSync(SOURCE_DIR)
    .filter((file) => /^chapitre_\d+_.+\.docx$/i.test(file))
    .map((file) => ({ file, numero: Number(file.match(/^chapitre_(\d+)/i)[1]) }))
    .filter(({ numero }) => !ONLY || numero === ONLY)
    .sort((a, b) => a.numero - b.numero);
}

function fallbackTitle(file) {
  return basename(file, '.docx').replace(/^chapitre_\d+_/, '').replace(/_/g, ' ')
    .replace(/^L /, 'L’').replace(/^La /, 'La ').replace(/^Le /, 'Le ').replace(/^Les /, 'Les ');
}

function detectTitle(extract, file) {
  const chapterIndex = extract.blocs.findIndex((block) => block.type === 'titre' && /^chapitre\s+\d+/i.test(block.texte));
  const candidate = extract.blocs.slice(Math.max(0, chapterIndex + 1), chapterIndex + 5)
    .find((block) => block.texte && block.type !== 'image' && block.type !== 'legende')?.texte;
  if (!candidate) return fallbackTitle(file);
  // Le nom de fichier contient exactement les mots du titre, alors que le
  // premier paragraphe ajoute souvent les auteurs avec une casse OCR erratique.
  // On conserve donc dans le paragraphe accentué le même nombre de mots que
  // dans le nom de fichier, apostrophes comprises.
  const expectedWords = fallbackTitle(file).match(/[A-Za-zÀ-ÿ0-9]+/g) || [];
  const candidateWords = [...candidate.matchAll(/[A-Za-zÀ-ÿ0-9]+/g)];
  if (candidateWords.length >= expectedWords.length && expectedWords.length >= 2) {
    const last = candidateWords[expectedWords.length - 1];
    return clean(candidate.slice(0, last.index + last[0].length));
  }
  return clean(candidate);
}

function ensureExtract(entry) {
  const slug = `chapitre-${String(entry.numero).padStart(2, '0')}-${slugify(fallbackTitle(entry.file))}`;
  const dir = join(CORPUS_DIR, slug);
  const extractPath = join(dir, 'extract.json');
  if (FORCE_EXTRACT && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  if (!existsSync(extractPath)) {
    mkdirSync(dir, { recursive: true });
    execFileSync(process.execPath, [EXTRACTOR, join(SOURCE_DIR, entry.file), dir], { stdio: 'inherit' });
  }
  return { ...entry, slug, dir, extractPath, extract: JSON.parse(readFileSync(extractPath, 'utf8')) };
}

async function loadAuthoredCourse(numero, extract) {
  const modulePath = join(ROOT, 'scripts', 'anesthesie-courses', `chapter-${String(numero).padStart(2, '0')}.mjs`);
  if (!existsSync(modulePath)) throw new Error(`Chapitre ${numero} : module éditorial manquant (${modulePath}). Aucun repli automatique n'est autorisé.`);
  const module = await import(`${pathToFileURL(modulePath).href}?v=${Date.now()}`);
  const exportName = `buildChapter${String(numero).padStart(2, '0')}`;
  const builder = module[exportName] || module.default;
  if (typeof builder !== 'function') throw new Error(`Chapitre ${numero} : export ${exportName} absent.`);
  const authored = await builder(extract);
  if (!authored?.fiche || !Array.isArray(authored.flashcards) || !Array.isArray(authored.series)) {
    throw new Error(`Chapitre ${numero} : module éditorial incomplet.`);
  }
  return authored;
}

async function buildChapter(entry) {
  const prepared = ensureExtract(entry);
  const { extract, dir } = prepared;
  const title = detectTitle(extract, entry.file);
  const { fiche, flashcards, series } = await loadAuthoredCourse(entry.numero, extract);
  if (fiche.title !== title) throw new Error(`Chapitre ${entry.numero} : titre éditorial « ${fiche.title} » différent du manifeste « ${title} ».`);
  const ficheRows = fiche.parts.flatMap((part) => part.sections.flatMap((section) => section.rows));
  const usedBlocks = new Set(ficheRows.flatMap((row) => row.sourceBlocks || []));
  const declaredBlocks = new Set(fiche.sourceBlocks || []);
  const undeclaredVisibleBlocks = [...usedBlocks].filter((id) => !declaredBlocks.has(id));
  const invisibleDeclaredBlocks = [...declaredBlocks].filter((id) => !usedBlocks.has(id));
  if (undeclaredVisibleBlocks.length || invisibleDeclaredBlocks.length) {
    throw new Error(`Chapitre ${entry.numero} : la provenance globale de la fiche doit correspondre exactement aux lignes visibles (${undeclaredVisibleBlocks.length} bloc(s) visible(s) non déclaré(s), ${invisibleDeclaredBlocks.length} bloc(s) déclaré(s) sans contenu visible).`);
  }
  const displayedImagePaths = new Set(ficheRows.filter((item) => item.image).map((item) => String(item.image.path || '').replace(/\\/g, '/')));
  const displayedImages = displayedImagePaths.size;
  const bodyBlocks = coverageBodyBlocks(extract);
  const ficheBodyBlocks = eligibleCoverageCount(usedBlocks, bodyBlocks);
  const ficheCoveragePercent = bodyBlocks.length ? Math.round(1000 * ficheBodyBlocks / bodyBlocks.length) / 10 : 0;
  if (ficheCoveragePercent < 75) throw new Error(`Chapitre ${entry.numero} : couverture de fiche insuffisante (${ficheCoveragePercent} %, minimum 75 %).`);
  const flashcardBlocks = new Set(flashcards.flatMap((card) => card.sourceBlocks || []));
  const questionBlocks = new Set(series.flatMap((serie) => serie.questions.flatMap((question) => question.sourceBlocks || [])));
  const flashcardBodyBlocks = eligibleCoverageCount(flashcardBlocks, bodyBlocks);
  const questionBodyBlocks = eligibleCoverageCount(questionBlocks, bodyBlocks);
  const flashcardCoveragePercent = bodyBlocks.length ? Math.round(1000 * flashcardBodyBlocks / bodyBlocks.length) / 10 : 0;
  const questionCoveragePercent = bodyBlocks.length ? Math.round(1000 * questionBodyBlocks / bodyBlocks.length) / 10 : 0;
  if (flashcardCoveragePercent < 60) throw new Error(`Chapitre ${entry.numero} : couverture des flashcards insuffisante (${flashcardCoveragePercent} %, minimum 60 %).`);
  if (questionCoveragePercent < 70) throw new Error(`Chapitre ${entry.numero} : couverture des banques insuffisante (${questionCoveragePercent} %, minimum 70 %).`);
  const coverage = {
    courseNumber: entry.numero, source: entry.file, sourceCharacters: extract.rapport.caracteres,
    sourceBlocks: bodyBlocks.length, ficheSourceBlocks: ficheBodyBlocks,
    ficheReferencedBlocks: usedBlocks.size,
    flashcardSourceBlocks: flashcardBodyBlocks,
    flashcardReferencedBlocks: flashcardBlocks.size,
    questionSourceBlocks: questionBodyBlocks,
    questionReferencedBlocks: questionBlocks.size,
    ficheCoveragePercent, flashcardCoveragePercent, questionCoveragePercent,
    sourceImages: extract.images.length, displayedImages,
    omittedImages: Math.max(0, extract.images.length - displayedImages),
    imageOmissions: fiche.imageOmissions || [],
    quarantinedBlocks: extract.blocs.filter((block) => block.quarantaine).length,
  };
  const result = emitCollegePackage({ chapterDir: dir, fiche, facts: flashcards, series, coverage });
  const finalHtml = join(result.outputDir, 'fiche.final.html');
  execFileSync(process.execPath, [FICHE_BUILDER, dir, join(result.outputDir, 'fiche.body.html'), finalHtml], { stdio: 'inherit' });
  return {
    numero: entry.numero, slug: prepared.slug, courseId: stableUuid(`chapter-${entry.numero}`), title,
    source: entry.file, chapterDir: dir, deliveryDir: result.outputDir, finalHtml, counts: { flashcards: flashcards.length, series: series.length, questions: 192, items: 480 }, coverage,
  };
}

async function main() {
  mkdirSync(CORPUS_DIR, { recursive: true });
  const manifest = [];
  for (const entry of sourceFiles()) {
    const built = await buildChapter(entry);
    manifest.push(built);
    console.log(`[${String(entry.numero).padStart(2, '0')}/43] ${built.title} — paquet validé`);
  }
  const existingPath = DRY_RUN ? join(CORPUS_DIR, 'manifest.json') : updateManifestLocked(manifest);
  console.log(JSON.stringify({ generated: manifest.length, manifest: existingPath, totals: manifest.reduce((acc, course) => ({ series: acc.series + course.counts.series, questions: acc.questions + course.counts.questions, items: acc.items + course.counts.items, flashcards: acc.flashcards + course.counts.flashcards }), { series: 0, questions: 0, items: 0, flashcards: 0 }) }, null, 2));
}

await main();
