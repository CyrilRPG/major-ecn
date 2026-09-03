#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS = join(ROOT, '.corpus-anesthesie-reanimation');
const MANIFEST_PATH = join(CORPUS, 'manifest.json');
const EDITORIAL_PATH = join(CORPUS, 'editorial-quality-audit.json');
const REPORT_PATH = join(CORPUS, 'transversal-quality-audit.json');

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')).sort((a, b) => a.numero - b.numero);
const editorial = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf8'));
const editorialByNumber = new Map(editorial.reports.map((entry) => [entry.numero, entry]));
const eligible = manifest.filter((course) => editorialByNumber.get(course.numero)?.passed);

const stripHtml = (value) => String(value ?? '')
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/\s+/g, ' ')
  .trim();

const normalize = (value) => stripHtml(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[’']/g, ' ')
  .replace(/[^a-z0-9%<>/=+.-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const safeJson = (path) => existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
const uniq = (values) => [...new Set(values)];
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const combinations = (values, size, start = 0, prefix = [], out = []) => {
  if (prefix.length === size) {
    out.push(prefix.join(''));
    return out;
  }
  for (let index = start; index <= values.length - (size - prefix.length); index += 1) {
    combinations(values, size, index + 1, [...prefix, values[index]], out);
  }
  return out;
};
const answerPatternsByCount = new Map(Array.from({ length: 5 }, (_, index) => {
  const count = index + 1;
  return [count, combinations(LETTERS, count)];
}));
const expectedAnswerCountDistribution = (courseNumber) => {
  const extraCount = ((courseNumber - 1) % 5) + 1;
  return Object.fromEntries(Array.from({ length: 5 }, (_, index) => [index + 1, index + 1 === extraCount ? 20 : 19]));
};
const occurrenceMap = () => new Map();
const addOccurrence = (map, text, ref) => {
  const key = normalize(text);
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push({ ...ref, text: stripHtml(text) });
};
const duplicateGroups = (map, { minLength = 1, crossCourse = false } = {}) => [...map.entries()]
  .filter(([text, refs]) => text.length >= minLength && refs.length > 1 && (!crossCourse || new Set(refs.map((ref) => ref.course)).size > 1))
  .map(([normalized, refs]) => ({ normalized, occurrences: refs.length, courses: uniq(refs.map((ref) => ref.course)), refs }))
  .sort((a, b) => b.occurrences - a.occurrences || a.normalized.localeCompare(b.normalized));
const firstSharedNgram = (left, right, size = 6) => {
  const leftWords = normalize(left).split(' ').filter(Boolean);
  const rightText = ` ${normalize(right)} `;
  for (let index = 0; index <= leftWords.length - size; index += 1) {
    const segment = leftWords.slice(index, index + size).join(' ');
    if (rightText.includes(` ${segment} `)) return segment;
  }
  return null;
};

const bannedPatterns = [
  { id: 'concernant', regex: /^\s*concernant\b/i },
  { id: 'completez', regex: /\bcompl[eé]tez\b/i },
  { id: 'nouvel-element', regex: /\bnouvel [eé]l[eé]ment\b/i },
  { id: 'corpus', regex: /\ble corpus\b/i },
  { id: 'source-indique', regex: /\bla source indique\b/i },
  { id: 'chapitre-decrit', regex: /\ble chapitre d[eé]crit\b/i },
  { id: 'selon-source', regex: /\bselon la source\b/i },
  { id: 'dans-chapitre', regex: /\bdans le chapitre\b/i },
  { id: 'cours-precise', regex: /\ble cours pr[eé]cise\b/i },
  { id: 'reference-chapitre', regex: /\b(?:le|du|par le|selon le) chapitre\b/i },
  { id: 'reference-cours', regex: /\b(?:le|du|dans le|selon le) cours\b/i },
  { id: 'annale', regex: /\bannales?\b/i },
  { id: 'm-ecn', regex: /\bm-ecn\b/i },
  { id: 'repere-automatique', regex: /\b(?:rep[eè]re|[eé]tape)\s+\d+\b/i },
];

const globalMaps = {
  proposition: occurrenceMap(), justification: occurrenceMap(), correction: occurrenceMap(),
  flashcardRecto: occurrenceMap(), flashcardVerso: occurrenceMap(), question: occurrenceMap(),
};
const markerHits = [];
const ngramUnits = [];

function visibleFicheTexts(fiche, course) {
  const texts = [];
  const push = (kind, value, ref) => {
    const text = stripHtml(value);
    if (text) texts.push({ course, kind, ref, text });
  };
  push('fiche-title', fiche.title, 'title');
  push('fiche-subtitle', fiche.coverSubtitle, 'coverSubtitle');
  const walkVisible = (value, kind, ref) => {
    if (typeof value === 'string') push(kind, value, ref);
    else if (Array.isArray(value)) value.forEach((item, index) => walkVisible(item, kind, `${ref}.${index + 1}`));
    else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (['sourceBlocks', 'path', 'placement', 'cropTopMm', 'cropBottomMm', 'maxHeightMm', 'kind'].includes(key)) continue;
        walkVisible(item, kind, `${ref}.${key}`);
      }
    }
  };
  walkVisible(fiche.cover, 'cover', 'cover');
  for (const [pi, part] of (fiche.parts || []).entries()) {
    push('part-title', part.title, `P${pi + 1}`);
    for (const [si, section] of (part.sections || []).entries()) {
      push('section-title', section.title, `P${pi + 1}.S${si + 1}`);
      for (const [ri, row] of (section.rows || []).entries()) {
        const base = `P${pi + 1}.S${si + 1}.R${ri + 1}`;
        push('row-title', row.title, base);
        push('row-concept', row.concept, base);
        push('row-content', row.content, base);
        walkVisible(row.bullets, 'row-bullet', `${base}.bullets`);
        push('image-caption', row.image?.caption, base);
      }
    }
  }
  walkVisible(fiche.synthesis, 'synthesis', 'synthesis');
  walkVisible(fiche.eclair, 'eclair', 'eclair');
  return texts;
}

function pdfPages(path) {
  try {
    const candidates = execFileSync('where.exe', ['pdfinfo'], { encoding: 'utf8', windowsHide: true }).split(/\r?\n/).filter(Boolean);
    const wrapper = candidates.find((candidate) => /[\\/]bin[\\/]override[\\/]pdfinfo\.cmd$/i.test(candidate));
    const native = wrapper ? resolve(dirname(wrapper), '..', '..', 'native', 'poppler', 'Library', 'bin', 'pdfinfo.exe') : candidates.find((candidate) => /\.exe$/i.test(candidate));
    if (!native || !existsSync(native)) return null;
    const output = execFileSync(native, [path], { encoding: 'utf8', windowsHide: true });
    return Number(output.match(/^Pages:\s+(\d+)/m)?.[1] || 0);
  } catch {
    return null;
  }
}

const reports = [];
for (const course of eligible) {
  const chapterPath = join(course.deliveryDir, 'chapter.json');
  const modulePath = join(ROOT, 'scripts', 'anesthesie-courses', `chapter-${String(course.numero).padStart(2, '0')}.mjs`);
  const fichePath = join(course.deliveryDir, 'fiche.model.json');
  const htmlPath = join(course.deliveryDir, 'fiche.final.html');
  const pdfPath = join(course.deliveryDir, 'fiche.pdf');
  const coveragePath = join(course.deliveryDir, 'coverage.json');
  const ficheAuditPath = join(course.deliveryDir, 'fiche-audit.json');
  const extractPath = join(course.chapterDir, 'extract.json');
  const chapter = safeJson(chapterPath);
  const fiche = safeJson(fichePath);
  const coverage = safeJson(coveragePath);
  const ficheAudit = safeJson(ficheAuditPath);
  const extract = safeJson(extractPath);
  const errors = [];
  const warnings = [];
  if (!chapter || !fiche || !coverage || !ficheAudit || !extract) {
    errors.push('Un ou plusieurs artefacts JSON obligatoires sont absents.');
    reports.push({ numero: course.numero, title: course.title, passed: false, errors, warnings });
    continue;
  }
  const moduleSource = existsSync(modulePath) ? readFileSync(modulePath, 'utf8') : '';
  if (!moduleSource) errors.push('Module éditorial du chapitre absent.');
  if (/QCM_BALANCE_OVERRIDES|applyQcmBalance|balanceQcmSeries|balanceTargets|targetMasks|oppositeStatement/.test(moduleSource)) {
    errors.push('Transformation QCM automatique détectée dans le module : les propositions doivent rester littérales et éditées individuellement.');
  }

  const series = chapter.series || [];
  const flashcards = chapter.flashcards || [];
  const allQuestions = series.flatMap((serie) => serie.questions || []);
  const isDp = (serie) => stripHtml(serie.vignette).length > 0;
  const qcmSeries = series.filter((serie) => !isDp(serie) && serie.questions?.[0]?.format === 'qcm');
  const dpQcmSeries = series.filter((serie) => isDp(serie) && serie.questions?.[0]?.format === 'qcm');
  const qrocSeries = series.filter((serie) => !isDp(serie) && serie.questions?.[0]?.format === 'qroc');
  const dpQrocSeries = series.filter((serie) => isDp(serie) && serie.questions?.[0]?.format === 'qroc');
  const qcmQuestions = allQuestions.filter((q) => q.format === 'qcm');
  const qrocQuestions = allQuestions.filter((q) => q.format === 'qroc');
  const qcmItems = qcmQuestions.flatMap((q) => q.items || []);
  const qcmOverlapWarnings = [];
  const answerCountDistribution = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [index + 1, 0]));
  const answerLetterDistribution = Object.fromEntries(LETTERS.map((letter) => [letter, 0]));
  const answerPatternDistribution = Object.fromEntries(Array.from(answerPatternsByCount.values()).flat().map((pattern) => [pattern, 0]));

  const exact = {
    proposition: occurrenceMap(), justification: occurrenceMap(), correction: occurrenceMap(),
    flashcardRecto: occurrenceMap(), flashcardVerso: occurrenceMap(), question: occurrenceMap(), vignette: occurrenceMap(),
  };
  const progression = {
    dpSeries: 0, progressiveQuestions: 0, withNewInformation: 0,
    newInformationIncludedInQuestion: 0, dpWithAtLeastFiveSourceSignatures: 0,
    qcmWithFiveItems: 0, qrocWithoutItems: 0,
  };
  const addBoth = (kind, text, ref) => {
    addOccurrence(exact[kind], text, ref);
    if (globalMaps[kind]) addOccurrence(globalMaps[kind], text, ref);
  };

  if (series.length !== 32) errors.push(`${series.length} séries au lieu de 32.`);
  if (qcmSeries.length !== 8 || dpQcmSeries.length !== 8 || qrocSeries.length !== 8 || dpQrocSeries.length !== 8) {
    errors.push(`Répartition des séries ${qcmSeries.length}/${dpQcmSeries.length}/${qrocSeries.length}/${dpQrocSeries.length}, attendu 8/8/8/8.`);
  }
  if (allQuestions.length !== 192 || qcmQuestions.length !== 96 || qrocQuestions.length !== 96) {
    errors.push(`Questions ${allQuestions.length} total, ${qcmQuestions.length} QCM, ${qrocQuestions.length} QROC, attendu 192/96/96.`);
  }
  if (qcmItems.length !== 480) errors.push(`${qcmItems.length} propositions QCM au lieu de 480.`);
  if (flashcards.length < 100 || flashcards.length > 200) errors.push(`${flashcards.length} flashcards, attendu 100-200.`);

  for (const [si, serie] of series.entries()) {
    const sref = { course: course.numero, ref: `S${si + 1}`, label: serie.label };
    const dp = isDp(serie);
    const expectedQuestions = dp ? 7 : 5;
    if ((serie.questions || []).length !== expectedQuestions) errors.push(`${serie.label}: ${(serie.questions || []).length} questions au lieu de ${expectedQuestions}.`);
    const expectedWay = serie.questions?.[0]?.format === 'qcm' ? 'interne' : 'externe';
    if (JSON.stringify(serie.allowed_voies) !== JSON.stringify([expectedWay])) errors.push(`${serie.label}: allowed_voies doit être exactement [${expectedWay}].`);
    if (dp) {
      progression.dpSeries += 1;
      const vignette = stripHtml(serie.vignette);
      addOccurrence(exact.vignette, vignette, sref);
      if (vignette.length < 180) errors.push(`${serie.label}: vignette trop courte (${vignette.length} caractères).`);
      const signatures = new Set();
      for (const [qi, q] of (serie.questions || []).entries()) {
        signatures.add((q.sourceBlocks || []).slice().sort().join('|'));
        if (qi > 0) {
          progression.progressiveQuestions += 1;
          const info = stripHtml(q.newInformation);
          if (!info) errors.push(`${serie.label}, Q${qi + 1}: newInformation absent.`);
          else {
            progression.withNewInformation += 1;
            if (!normalize(q.enonce).includes(normalize(info))) errors.push(`${serie.label}, Q${qi + 1}: newInformation non inclus dans l’énoncé.`);
            else progression.newInformationIncludedInQuestion += 1;
            if (normalize(vignette).includes(normalize(info))) errors.push(`${serie.label}, Q${qi + 1}: newInformation déjà présent dans la vignette initiale.`);
          }
        }
      }
      if (signatures.size < 5) errors.push(`${serie.label}: seulement ${signatures.size} signatures de provenance pour 7 questions.`);
      else progression.dpWithAtLeastFiveSourceSignatures += 1;
    }

    for (const [qi, q] of (serie.questions || []).entries()) {
      const ref = { course: course.numero, ref: `S${si + 1}.Q${qi + 1}`, label: `${serie.label}, Q${qi + 1}` };
      addBoth('question', q.enonce, ref);
      addBoth('correction', q.correction_generale, ref);
      ngramUnits.push({ ...ref, kind: 'correction', text: stripHtml(q.correction_generale) });
      if (!Array.isArray(q.sourceBlocks) || !q.sourceBlocks.length) errors.push(`${ref.label}: sourceBlocks absent.`);
      if (!stripHtml(q.correction_generale)) errors.push(`${ref.label}: correction générale absente.`);
      if (q.format === 'qcm') {
        if (!Array.isArray(q.items) || q.items.length !== 5) errors.push(`${ref.label}: ${q.items?.length ?? 0} propositions au lieu de 5.`);
        else progression.qcmWithFiveItems += 1;
        const letters = (q.items || []).map((item) => item.lettre).join('');
        if (letters !== 'ABCDE') errors.push(`${ref.label}: lettres « ${letters} » au lieu de ABCDE.`);
        const correctItems = (q.items || []).filter((item) => item.is_correct === true);
        const correct = correctItems.length;
        if (correct < 1 || correct > 5) errors.push(`${ref.label}: ${correct} réponses exactes, attendu 1-5.`);
        else {
          answerCountDistribution[correct] += 1;
          const pattern = correctItems.map((item) => item.lettre).join('');
          if (!(pattern in answerPatternDistribution)) errors.push(`${ref.label}: profil de réponses invalide « ${pattern} ».`);
          else answerPatternDistribution[pattern] += 1;
          for (const item of correctItems) answerLetterDistribution[item.lettre] += 1;
        }
        for (const [ii, item] of (q.items || []).entries()) {
          const iref = { ...ref, ref: `${ref.ref}.${item.lettre || ii + 1}`, label: `${ref.label}${item.lettre || ii + 1}` };
          addBoth('proposition', item.enonce, iref);
          addBoth('justification', item.justification, iref);
          ngramUnits.push({ ...iref, kind: 'proposition', text: stripHtml(item.enonce) });
          ngramUnits.push({ ...iref, kind: 'justification', text: stripHtml(item.justification) });
          if (!stripHtml(item.enonce) || !stripHtml(item.justification)) errors.push(`${iref.label}: proposition ou justification vide.`);
        }
        for (let left = 0; left < (q.items || []).length; left += 1) {
          for (let right = left + 1; right < (q.items || []).length; right += 1) {
            const propositionOverlap = firstSharedNgram(q.items[left].enonce, q.items[right].enonce);
            if (propositionOverlap) qcmOverlapWarnings.push({ type: 'qcm-proposition-overlap', ref: ref.ref, letters: `${q.items[left].lettre}/${q.items[right].lettre}`, segment: propositionOverlap });
            const justificationOverlap = firstSharedNgram(q.items[left].justification, q.items[right].justification);
            if (justificationOverlap) qcmOverlapWarnings.push({ type: 'qcm-justification-overlap', ref: ref.ref, letters: `${q.items[left].lettre}/${q.items[right].lettre}`, segment: justificationOverlap });
          }
        }
      } else if (q.format === 'qroc') {
        if (Array.isArray(q.items) && q.items.length) errors.push(`${ref.label}: une QROC ne doit contenir aucune proposition.`);
        else progression.qrocWithoutItems += 1;
        if (!stripHtml(q.reponse_attendue)) errors.push(`${ref.label}: réponse attendue absente.`);
      } else errors.push(`${ref.label}: format inconnu « ${q.format} ».`);
    }
  }

  const expectedCounts = expectedAnswerCountDistribution(course.numero);
  for (const count of [1, 2, 3, 4, 5]) {
    if (answerCountDistribution[count] !== expectedCounts[count]) {
      errors.push(`Distribution QCM: ${answerCountDistribution[count]} question(s) à ${count} réponse(s) juste(s), attendu ${expectedCounts[count]}.`);
    }
    const patternCounts = answerPatternsByCount.get(count).map((pattern) => answerPatternDistribution[pattern]);
    if (Math.max(...patternCounts) - Math.min(...patternCounts) > 1) {
      errors.push(`Profils QCM à ${count} réponse(s): répartition déséquilibrée (${patternCounts.join('/')}).`);
    }
  }
  const letterCounts = LETTERS.map((letter) => answerLetterDistribution[letter]);
  if (Math.max(...letterCounts) - Math.min(...letterCounts) > 2) {
    errors.push(`Lettres justes déséquilibrées: ${LETTERS.map((letter) => `${letter}=${answerLetterDistribution[letter]}`).join(', ')}.`);
  }
  if (qcmOverlapWarnings.length > 10) errors.push(`Banque QCM: ${qcmOverlapWarnings.length} recouvrements textuels entre propositions/justifications, seuil maximal 10.`);
  warnings.push(...qcmOverlapWarnings.slice(0, 40));

  for (const [ci, card] of flashcards.entries()) {
    const ref = { course: course.numero, ref: `F${ci + 1}`, label: `Flashcard ${ci + 1}` };
    addBoth('flashcardRecto', card.recto, ref);
    addBoth('flashcardVerso', card.verso, ref);
    ngramUnits.push({ ...ref, kind: 'flashcard-recto', text: stripHtml(card.recto) });
    ngramUnits.push({ ...ref, kind: 'flashcard-verso', text: stripHtml(card.verso) });
    if (!stripHtml(card.recto).endsWith('?')) errors.push(`Flashcard ${ci + 1}: recto non interrogatif.`);
    if (stripHtml(card.verso).length > 150) errors.push(`Flashcard ${ci + 1}: verso de ${stripHtml(card.verso).length} caractères.`);
    if (!Array.isArray(card.sourceBlocks) || !card.sourceBlocks.length) errors.push(`Flashcard ${ci + 1}: sourceBlocks absent.`);
  }

  const intraDuplicateCounts = {};
  for (const [kind, map] of Object.entries(exact)) {
    const duplicates = duplicateGroups(map, { minLength: kind === 'justification' ? 12 : 5 });
    intraDuplicateCounts[kind] = duplicates.length;
    if (duplicates.length) {
      errors.push(`${kind}: ${duplicates.length} doublon(s) exact(s) intra-cours.`);
      warnings.push(...duplicates.slice(0, 10).map((dup) => ({ type: `duplicate-${kind}`, text: dup.refs[0].text, refs: dup.refs.map((ref) => ref.ref) })));
    }
  }

  const visibleTexts = [
    ...visibleFicheTexts(fiche, course.numero),
    ...series.flatMap((serie, si) => [
      { course: course.numero, kind: 'vignette', ref: `S${si + 1}`, text: stripHtml(serie.vignette) },
      ...(serie.questions || []).flatMap((q, qi) => [
        { course: course.numero, kind: 'question', ref: `S${si + 1}.Q${qi + 1}`, text: stripHtml(q.enonce) },
        { course: course.numero, kind: 'correction', ref: `S${si + 1}.Q${qi + 1}`, text: stripHtml(q.correction_generale) },
        { course: course.numero, kind: 'answer', ref: `S${si + 1}.Q${qi + 1}`, text: stripHtml(q.reponse_attendue) },
        ...(q.items || []).flatMap((item) => [
          { course: course.numero, kind: 'proposition', ref: `S${si + 1}.Q${qi + 1}.${item.lettre}`, text: stripHtml(item.enonce) },
          { course: course.numero, kind: 'justification', ref: `S${si + 1}.Q${qi + 1}.${item.lettre}`, text: stripHtml(item.justification) },
        ]),
      ]),
    ]),
    ...flashcards.flatMap((card, ci) => [
      { course: course.numero, kind: 'flashcard-recto', ref: `F${ci + 1}`, text: stripHtml(card.recto) },
      { course: course.numero, kind: 'flashcard-verso', ref: `F${ci + 1}`, text: stripHtml(card.verso) },
    ]),
  ].filter((entry) => entry.text);
  for (const entry of visibleTexts) {
    for (const pattern of bannedPatterns) if (pattern.regex.test(entry.text)) markerHits.push({ ...entry, marker: pattern.id });
  }

  const sourceImagePaths = new Set((extract.images || []).map((image) => String(image.fichier || image.path || '').replace(/\\/g, '/')));
  const displayed = new Set((fiche.parts || []).flatMap((part) => part.sections || []).flatMap((section) => section.rows || [])
    .filter((row) => row.image?.path).map((row) => String(row.image.path).replace(/\\/g, '/')));
  const omitted = new Set((fiche.imageOmissions || []).map((item) => String(item.path).replace(/\\/g, '/')));
  if (displayed.size + omitted.size !== sourceImagePaths.size) errors.push(`Images: ${displayed.size} affichées + ${omitted.size} omises != ${sourceImagePaths.size} sources.`);
  for (const path of displayed) if (!sourceImagePaths.has(path)) errors.push(`Image affichée absente de l’extraction: ${path}.`);
  for (const path of omitted) if (!sourceImagePaths.has(path)) errors.push(`Image omise absente de l’extraction: ${path}.`);
  if (coverage.sourceImages !== sourceImagePaths.size || coverage.displayedImages !== displayed.size || coverage.omittedImages !== omitted.size) errors.push('Compteurs d’images incohérents dans coverage.json.');
  if (ficheAudit.metrics?.figures !== displayed.size) errors.push(`Audit HTML/PDF: ${ficheAudit.metrics?.figures} figures au lieu de ${displayed.size}.`);
  if (ficheAudit.metrics?.brokenImages || ficheAudit.metrics?.textualImagesOutsideFullRows || ficheAudit.metrics?.sourceNumbering?.length || ficheAudit.metrics?.horizontalOverflow) errors.push('Audit rendu: image cassée, hors pleine largeur, numérotation source ou débordement détecté.');
  if (!ficheAudit.passed || ficheAudit.errors?.length) errors.push('fiche-audit.json n’est pas PASS sans erreur.');
  if (!existsSync(htmlPath) || statSync(htmlPath).size < 1000) errors.push('HTML final absent ou vide.');
  if (!existsSync(pdfPath) || statSync(pdfPath).size < 1000) errors.push('PDF final absent ou vide.');
  const actualPdfPages = existsSync(pdfPath) ? pdfPages(pdfPath) : null;
  if (actualPdfPages !== ficheAudit.pages) errors.push(`PDF: pdfinfo=${actualPdfPages}, fiche-audit=${ficheAudit.pages}.`);
  const previewDir = ficheAudit.rasterAudit?.previewDir;
  const rasterFiles = previewDir && existsSync(previewDir) ? readdirSync(previewDir).filter((name) => /^page-\d+\.png$/i.test(name)) : [];
  if (rasterFiles.length !== ficheAudit.pages || ficheAudit.rasterAudit?.renderedPages !== ficheAudit.pages) errors.push(`Raster: ${rasterFiles.length} PNG, audit=${ficheAudit.rasterAudit?.renderedPages}, PDF=${ficheAudit.pages}.`);
  if ((ficheAudit.rasterAudit?.blankRasterPages || []).length || (ficheAudit.rasterAudit?.topClippedPages || []).length || (ficheAudit.rasterAudit?.rightClippedPages || []).length) errors.push('Audit raster: page blanche ou rognée détectée.');

  const declaredArtifacts = editorialByNumber.get(course.numero)?.artifacts || {};
  const artifactPaths = { chapter: chapterPath, ficheModel: fichePath, coverage: coveragePath, ficheAudit: ficheAuditPath, html: htmlPath, pdf: pdfPath };
  for (const [key, path] of Object.entries(artifactPaths)) {
    if (existsSync(path) && declaredArtifacts[key] && sha256(path) !== declaredArtifacts[key]) warnings.push({ type: 'artifact-changed-since-editorial-audit', artifact: key });
  }

  reports.push({
    numero: course.numero, title: course.title, passed: errors.length === 0, errorCount: errors.length, errors, warnings,
    counts: {
      flashcards: flashcards.length, series: series.length,
      qcmSeries: qcmSeries.length, dpQcmSeries: dpQcmSeries.length, qrocSeries: qrocSeries.length, dpQrocSeries: dpQrocSeries.length,
      questions: allQuestions.length, qcmQuestions: qcmQuestions.length, qrocQuestions: qrocQuestions.length, qcmItems: qcmItems.length,
      dpVignettes: dpQcmSeries.length + dpQrocSeries.length, sourceImages: sourceImagePaths.size, displayedImages: displayed.size, omittedImages: omitted.size,
      htmlBytes: existsSync(htmlPath) ? statSync(htmlPath).size : 0, pdfBytes: existsSync(pdfPath) ? statSync(pdfPath).size : 0,
      pdfPages: actualPdfPages, rasterPages: rasterFiles.length,
    },
    progression,
    qcmAnswerBalance: {
      expectedCounts,
      answerCountDistribution,
      answerLetterDistribution,
      answerPatternDistribution,
    },
    intraCourseExactDuplicateGroups: intraDuplicateCounts,
    markerHits: markerHits.filter((entry) => entry.course === course.numero).length,
    artifactConsistency: {
      htmlPresent: existsSync(htmlPath) && statSync(htmlPath).size >= 1000,
      pdfPresent: existsSync(pdfPath) && statSync(pdfPath).size >= 1000,
      pdfPagesMatchAudit: actualPdfPages === ficheAudit.pages,
      rasterPagesMatchPdf: rasterFiles.length === ficheAudit.pages,
      imagesAccountedFor: displayed.size + omitted.size === sourceImagePaths.size,
      renderAuditPassed: Boolean(ficheAudit.passed && !ficheAudit.errors?.length),
    },
  });
}

const globalExactDuplicates = Object.fromEntries(Object.entries(globalMaps).map(([kind, map]) => [kind,
  duplicateGroups(map, { minLength: kind === 'justification' ? 25 : 12, crossCourse: true })
    .map((dup) => ({ text: dup.refs[0].text, occurrences: dup.occurrences, courses: dup.courses, refs: dup.refs.map((ref) => `${ref.course}:${ref.ref}`) }))
]));

const ngrams = new Map();
for (const unit of ngramUnits) {
  const words = normalize(unit.text).split(' ').filter(Boolean);
  if (words.length < 8) continue;
  const seen = new Set();
  for (let index = 0; index <= words.length - 8; index += 1) {
    const gram = words.slice(index, index + 8).join(' ');
    if (seen.has(gram)) continue;
    seen.add(gram);
    if (!ngrams.has(gram)) ngrams.set(gram, []);
    ngrams.get(gram).push({ course: unit.course, ref: unit.ref, kind: unit.kind });
  }
}
const repeatedSegments = [...ngrams.entries()]
  .map(([segment, refs]) => ({ segment, occurrences: refs.length, courses: uniq(refs.map((ref) => ref.course)), refs }))
  .filter((entry) => entry.occurrences >= 8 && entry.courses.length >= 4)
  .sort((a, b) => b.courses.length - a.courses.length || b.occurrences - a.occurrences || a.segment.localeCompare(b.segment));

const summary = {
  generatedAt: new Date().toISOString(),
  manifestCourses: manifest.length,
  editorialPassCourses: eligible.length,
  editorialPendingOrFailed: manifest.filter((course) => !editorialByNumber.get(course.numero)?.passed).map((course) => course.numero),
  transversalPassed: reports.filter((report) => report.passed).length,
  transversalFailed: reports.filter((report) => !report.passed).length,
  totalErrors: reports.reduce((sum, report) => sum + report.errorCount, 0),
  markerHits: markerHits.length,
  exactCrossCourseDuplicateGroups: Object.fromEntries(Object.entries(globalExactDuplicates).map(([key, groups]) => [key, groups.length])),
  longExactCrossCourseDuplicateGroups: {
    propositionsAtLeast60Characters: globalExactDuplicates.proposition.filter((group) => group.text.length >= 60).length,
    justificationsAtLeast60Characters: globalExactDuplicates.justification.filter((group) => group.text.length >= 60).length,
    correctionsAtLeast60Characters: globalExactDuplicates.correction.filter((group) => group.text.length >= 60).length,
    flashcardRectosAtLeast60Characters: globalExactDuplicates.flashcardRecto.filter((group) => group.text.length >= 60).length,
    flashcardVersosAtLeast60Characters: globalExactDuplicates.flashcardVerso.filter((group) => group.text.length >= 60).length,
  },
  repeatedInterCourseSegments: repeatedSegments.length,
  totals: reports.reduce((totals, report) => {
    for (const key of ['flashcards', 'series', 'questions', 'qcmQuestions', 'qrocQuestions', 'qcmItems', 'dpVignettes', 'sourceImages', 'displayedImages', 'omittedImages', 'pdfPages', 'rasterPages']) totals[key] = (totals[key] || 0) + (report.counts?.[key] || 0);
    return totals;
  }, {}),
};
summary.overallPassed = summary.transversalFailed === 0 && summary.markerHits === 0;

const report = { summary, courses: reports, markerHits, globalExactDuplicates, repeatedSegments };
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ summary, report: REPORT_PATH }, null, 2));
if (!summary.overallPassed) process.exitCode = 2;
