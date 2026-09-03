#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { validateCollegePackage } from './lib/college-content-package.mjs';
import { coverageBodyBlocks, coveragePercent } from './lib/anesthesie-coverage.mjs';
import { validateFicheModel } from './lib/orthopedie-fiche.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS = join(ROOT, '.corpus-anesthesie-reanimation');
const MANIFEST = join(CORPUS, 'manifest.json');
const REPORT = join(CORPUS, 'editorial-quality-audit.json');
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')).sort((a, b) => a.numero - b.numero);
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

const reports = manifest.map((course) => {
  const chapterPath = join(course.deliveryDir, 'chapter.json');
  const fichePath = join(course.deliveryDir, 'fiche.model.json');
  const coveragePath = join(course.deliveryDir, 'coverage.json');
  const ficheAuditPath = join(course.deliveryDir, 'fiche-audit.json');
  const htmlPath = join(course.deliveryDir, 'fiche.final.html');
  const pdfPath = join(course.deliveryDir, 'fiche.pdf');
  if (!existsSync(chapterPath) || !existsSync(fichePath)) {
    return { numero: course.numero, title: course.title, passed: false, errors: ['Paquet ou modèle de fiche absent.'] };
  }
  const chapter = JSON.parse(readFileSync(chapterPath, 'utf8'));
  const fiche = JSON.parse(readFileSync(fichePath, 'utf8'));
  const extract = JSON.parse(readFileSync(join(course.chapterDir, 'extract.json'), 'utf8'));
  const packageAudit = validateCollegePackage({
    fiche,
    facts: chapter.flashcards,
    series: chapter.series,
    chapterDir: course.chapterDir,
  });
  const ficheAudit = validateFicheModel(fiche, course.chapterDir);
  const errors = [...ficheAudit.errors.map((error) => `Fiche : ${error}`), ...packageAudit.errors];
  const allQuestions = (chapter.series || []).flatMap((serie) => serie.questions || []);
  const qcmQuestions = allQuestions.filter((question) => question.format === 'qcm');
  const qrocQuestions = allQuestions.filter((question) => question.format === 'qroc');
  const itemCount = qcmQuestions.reduce((sum, question) => sum + (question.items?.length || 0), 0);
  if (allQuestions.length !== 192) errors.push(`Comptage : ${allQuestions.length} questions, attendu 192.`);
  if (qcmQuestions.length !== 96 || qrocQuestions.length !== 96) errors.push(`Comptage : ${qcmQuestions.length} QCM et ${qrocQuestions.length} QROC, attendu 96/96.`);
  if (itemCount !== 480) errors.push(`Comptage : ${itemCount} propositions QCM, attendu 480.`);

  const bodyBlocks = coverageBodyBlocks(extract);
  const ficheBlocks = new Set(fiche.parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((row) => row.sourceBlocks || []))));
  const flashcardBlocks = new Set((chapter.flashcards || []).flatMap((card) => card.sourceBlocks || []));
  const questionBlocks = new Set(allQuestions.flatMap((question) => question.sourceBlocks || []));
  const liveCoverage = {
    ficheCoveragePercent: coveragePercent(ficheBlocks, bodyBlocks),
    flashcardCoveragePercent: coveragePercent(flashcardBlocks, bodyBlocks),
    questionCoveragePercent: coveragePercent(questionBlocks, bodyBlocks),
  };
  if (liveCoverage.ficheCoveragePercent < 75) errors.push(`Couverture réelle de la fiche : ${liveCoverage.ficheCoveragePercent} %, minimum 75 %.`);
  if (liveCoverage.flashcardCoveragePercent < 60) errors.push(`Couverture réelle des flashcards : ${liveCoverage.flashcardCoveragePercent} %, minimum 60 %.`);
  if (liveCoverage.questionCoveragePercent < 70) errors.push(`Couverture réelle des banques : ${liveCoverage.questionCoveragePercent} %, minimum 70 %.`);
  if (!existsSync(coveragePath)) {
    errors.push('Rapport de couverture absent.');
  } else {
    const declaredCoverage = JSON.parse(readFileSync(coveragePath, 'utf8'));
    for (const [key, value] of Object.entries(liveCoverage)) {
      if (declaredCoverage[key] !== value) errors.push(`Rapport de couverture incohérent pour ${key} (${declaredCoverage[key] ?? 'absent'} au lieu de ${value}).`);
    }
    if (declaredCoverage.displayedImages !== ficheAudit.displayedImagePaths.length) errors.push(`Rapport de couverture incohérent pour displayedImages (${declaredCoverage.displayedImages ?? 'absent'} au lieu de ${ficheAudit.displayedImagePaths.length}).`);
    if (declaredCoverage.omittedImages !== ficheAudit.omittedImagePaths.length) errors.push(`Rapport de couverture incohérent pour omittedImages (${declaredCoverage.omittedImages ?? 'absent'} au lieu de ${ficheAudit.omittedImagePaths.length}).`);
    if (JSON.stringify(declaredCoverage.imageOmissions || []) !== JSON.stringify(fiche.imageOmissions || [])) errors.push('Rapport de couverture incohérent pour les justifications d’images omises.');
  }
  if (!existsSync(htmlPath)) errors.push('HTML final absent.');
  if (!existsSync(pdfPath)) errors.push('PDF final absent.');
  let renderedAudit = null;
  if (!existsSync(ficheAuditPath)) {
    errors.push('Audit PDF absent.');
  } else {
    renderedAudit = JSON.parse(readFileSync(ficheAuditPath, 'utf8'));
    if (!renderedAudit.passed || renderedAudit.errors?.length) errors.push(`Audit PDF en échec (${renderedAudit.errors?.join(' ; ') || 'état non validé'}).`);
    if (!Number.isInteger(renderedAudit.pages)) errors.push('PDF : nombre de pages absent de l’audit rendu.');
    else if (renderedAudit.pages < 7 || renderedAudit.pages > 40) errors.push(`PDF : ${renderedAudit.pages} pages, attendu 7-40.`);
    if (!Number.isFinite(renderedAudit.metrics?.visibleCharacters)) errors.push('PDF : métrique de caractères visibles absente.');
    else if (renderedAudit.metrics.visibleCharacters > 50000) errors.push(`PDF : ${renderedAudit.metrics.visibleCharacters} caractères visibles, maximum 50 000.`);
    if (!Number.isInteger(renderedAudit.rasterAudit?.renderedPages) || renderedAudit.rasterAudit.renderedPages !== renderedAudit.pages) errors.push('PDF : comptage raster absent ou incohérent avec le document final.');
    if (renderedAudit.metrics?.textualImagesOutsideFullRows) errors.push('PDF : image textuelle hors ligne pleine largeur.');
    if (renderedAudit.metrics?.brokenImages || renderedAudit.metrics?.horizontalOverflow) errors.push('PDF : image cassée ou débordement horizontal détecté.');
  }
  return {
    numero: course.numero,
    title: course.title,
    passed: errors.length === 0,
    errorCount: errors.length,
    errors,
    metrics: {
      flashcards: chapter.flashcards?.length || 0,
      series: chapter.series?.length || 0,
      ficheN2Rows: ficheAudit.n2Rows,
      ficheFlatRows: ficheAudit.flatRows,
      ficheN2Sections: ficheAudit.n2Sections,
      questions: allQuestions.length,
      qcmItems: itemCount,
      pages: renderedAudit?.pages ?? 0,
      ...liveCoverage,
    },
    artifacts: {
      chapter: sha256(chapterPath),
      ficheModel: sha256(fichePath),
      coverage: existsSync(coveragePath) ? sha256(coveragePath) : null,
      ficheAudit: existsSync(ficheAuditPath) ? sha256(ficheAuditPath) : null,
      html: existsSync(htmlPath) ? sha256(htmlPath) : null,
      pdf: existsSync(pdfPath) ? sha256(pdfPath) : null,
    },
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  courses: reports.length,
  passed: reports.filter((report) => report.passed).length,
  failed: reports.filter((report) => !report.passed).length,
  totalErrors: reports.reduce((sum, report) => sum + (report.errorCount || report.errors.length), 0),
};
writeFileSync(REPORT, `${JSON.stringify({ summary, reports }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ summary, report: REPORT }, null, 2));
if (summary.failed) process.exitCode = 2;
