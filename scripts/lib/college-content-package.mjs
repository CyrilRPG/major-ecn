import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './orthopedie-fiche.mjs';

const stripHtml = (value) => String(value ?? '')
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim();

const normalizedKey = (value) => stripHtml(value)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '');

function semanticCoreKey(value) {
  let text = stripHtml(value);
  let previous;
  do {
    previous = text;
    text = text
      .replace(/\s+(?:ce point est appliqu[eé] ici [àa]|cette explication tranche le probl[eè]me de|le point discriminant\s*,?\s*dans ce cas\s*,?\s*est)\b.*$/i, '')
      .replace(/^(?:dans|pour|au sein de|lors de)\s+[^,]{3,160},\s*/i, '')
      .replace(/^(?:d[eè]s|lorsque|au moment o[uù])\s+[^,]{3,140},\s*/i, '');
  } while (text !== previous);
  return normalizedKey(text);
}

const GENERATION_SCAFFOLD = /\b(?:rep[eè]re\s*\d+|s[eé]rie\s*\d+|[àa]\s+l['’]?[eé]tape\s*\d+|au\s+cours\s+du\s+suivi\s*,?\s+l['’][eé]quipe\s+r[eé][eé]value\s+maintenant|compl[eé]tez\s+pr[eé]cis[eé]ment|contrairement\s+au\s+cours|nouvel\s+[eé]l[eé]ment\s*:|question\s*:|dans\s+le\s+dossier\s+[«"]|l['’][eé]valuation\s+initiale\s+du\s+dossier|lorsque\s+la\s+(?:premi[eè]re|deuxi[eè]me|troisi[eè]me)\s+donn[eé]e\s+modifie\s+la\s+strat[eé]gie|ce\s+point\s+est\s+appliqu[eé]\s+ici\s+[àa]|cette\s+explication\s+tranche\s+le\s+probl[eè]me\s+de|le\s+point\s+discriminant\s*,?\s+dans\s+ce\s+cas\s*,?\s+est|ne\s+change\s+pas\s+le\s+fait\s+suivant|rend\s+cette\s+distinction\s+imm[eé]diatement\s+utile|en\s+illustre\s+l['’]enjeu\s+pratique|la\s+cons[eé]quence\s+attendue\s+d[eé]pend\s+ici\s+de|l['’]argument\s+reste\s+d[eé]cisif\s+avec|ce\s+m[eé]canisme\s+concerne|conduit\s+[àa]\s+juger\s+que|cette\s+r[eè]gle\s+garde\s+ici\s+sa\s+port[eé]e\s+clinique|la\s+conduite\s+coh[eé]rente\s+avec|repose\s+sur\s+une\s+hi[eé]rarchie\s+claire|corpus\b|selon\s+la\s+source\b|la\s+source\s+(?:indique|pr[eé]cise|d[eé]crit|rapporte|cite)\b|le\s+chapitre\s+(?:indique|pr[eé]cise|d[eé]crit|rapporte|cite)\b)/i;
const GENERIC_CORRECTION = /^(?:(?:vrai|faux)\.?\s*(?:le cours (?:pr[eé]cise|indique)|cette proposition (?:reprend|modifie)|les r[eé]ponses exactes reprennent)|la r[eé]solution exige de relier les donn[eé]es du chapitre|il faut mobiliser les rep[eè]res? (?:du chapitre|source))/i;

function uniqueCount(values) {
  return new Set(values.map(normalizedKey).filter(Boolean)).size;
}

function repeatedPhrases(values, width = 6, minimumUses = 8) {
  const counts = new Map();
  for (const value of values) {
    const words = stripHtml(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]+/g) || [];
    const phrases = new Set(Array.from({ length: Math.max(0, words.length - width + 1) }, (_, index) => words.slice(index, index + width).join(' ')));
    for (const phrase of phrases) counts.set(phrase, (counts.get(phrase) || 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count >= minimumUses).sort((a, b) => b[1] - a[1]);
}

function serieFamily(label) {
  const value = String(label ?? '').trim();
  if (/^DP\s+QROC\b/i.test(value)) return 'dpQroc';
  if (/^QROC\b/i.test(value)) return 'qroc';
  if (/^DP(?:\s+QCM)?\b/i.test(value)) return 'dpQcm';
  if (/^QCM\b/i.test(value)) return 'qcm';
  return null;
}

export function validateCollegePackage({ fiche, facts, series, chapterDir }) {
  const errors = [];
  const extractPath = join(resolve(chapterDir), 'extract.json');
  const sourceBlockIds = existsSync(extractPath)
    ? new Set(JSON.parse(readFileSync(extractPath, 'utf8')).blocs.map((block) => block.id).filter(Boolean))
    : new Set();
  const validateProvenance = (sourceBlocks, label) => {
    if (!Array.isArray(sourceBlocks) || sourceBlocks.length === 0) {
      errors.push(`${label} : provenance absente.`);
      return;
    }
    const unknown = sourceBlocks.filter((id) => !sourceBlockIds.has(id));
    if (unknown.length) errors.push(`${label} : blocs source inconnus (${unknown.join(', ')}).`);
  };
  if (!fiche?.title || !fiche?.matiere) errors.push('Fiche : title et matiere sont obligatoires.');
  if (!Array.isArray(facts) || facts.length < 100 || facts.length > 200) {
    errors.push(`Flashcards : 100-200 attendues, reçu ${facts?.length ?? 0}.`);
  }
  const rectos = new Set();
  const versos = new Set();
  for (const [index, fact] of (facts || []).entries()) {
    const key = normalizedKey(fact.recto);
    if (!key || rectos.has(key)) errors.push(`Flashcard ${index + 1} : recto vide ou dupliqué.`);
    rectos.add(key);
    const recto = stripHtml(fact.recto);
    if (recto.length < 12 || recto.length > 145 || !/[?]$/.test(recto)) errors.push(`Flashcard ${index + 1} : recto non conforme (question directe de 12-145 caractères attendue).`);
    if (GENERATION_SCAFFOLD.test(recto) || /[.…]{2,}/.test(recto)) errors.push(`Flashcard ${index + 1} : formulation automatique ou texte à trous interdit.`);
    const versoLength = stripHtml(fact.verso).length;
    if (!versoLength || versoLength > 150) errors.push(`Flashcard ${index + 1} : verso ${versoLength} caractères (maximum 150).`);
    if (GENERATION_SCAFFOLD.test(stripHtml(fact.verso))) errors.push(`Flashcard ${index + 1} : référence éditoriale ou formulation automatique interdite au verso.`);
    const versoKey = normalizedKey(fact.verso);
    if (!versoKey || versos.has(versoKey)) errors.push(`Flashcard ${index + 1} : verso vide ou dupliqué.`);
    versos.add(versoKey);
    validateProvenance(fact.sourceBlocks, `Flashcard ${index + 1}`);
  }

  if (!Array.isArray(series) || series.length !== 32) {
    errors.push(`Séries : 32 attendues, reçu ${series?.length ?? 0}.`);
  }
  const expectedFamilies = { qcm: 8, dpQcm: 8, qroc: 8, dpQroc: 8 };
  const families = { qcm: 0, dpQcm: 0, qroc: 0, dpQroc: 0 };
  const stems = new Set();
  const labels = new Set();
  const vignettes = new Set();
  const correctPatterns = new Set();
  const corrections = new Set();
  const qcmItemStems = new Set();
  const qcmItemJustifications = new Set();
  const qcmEditorialUnits = [];
  const correctByLetter = Object.fromEntries('ABCDE'.split('').map((letter) => [letter, 0]));
  for (const [seriesIndex, entry] of (series || []).entries()) {
    const family = serieFamily(entry.label);
    if (!family) {
      errors.push(`Série ${seriesIndex + 1} : libellé non reconnu (${entry.label || 'vide'}).`);
      continue;
    }
    const labelKey = normalizedKey(entry.label);
    if (!labelKey || labels.has(labelKey)) errors.push(`Série ${seriesIndex + 1} : libellé vide ou dupliqué.`);
    labels.add(labelKey);
    families[family] += 1;
    const isDp = family === 'dpQcm' || family === 'dpQroc';
    const isQroc = family === 'qroc' || family === 'dpQroc';
    const expectedQuestions = isDp ? 7 : 5;
    const expectedVoie = isQroc ? 'externe' : 'interne';
    if (!Array.isArray(entry.allowed_voies) || entry.allowed_voies.length !== 1 || entry.allowed_voies[0] !== expectedVoie) {
      errors.push(`${entry.label} : voie ${expectedVoie} attendue.`);
    }
    if (!Array.isArray(entry.questions) || entry.questions.length !== expectedQuestions) {
      errors.push(`${entry.label} : ${expectedQuestions} questions attendues.`);
      continue;
    }
    const vignette = stripHtml(entry.vignette);
    if (isDp && (vignette.length < 220 || vignette.length > 1800)) errors.push(`${entry.label} : vignette clinique de 220-1800 caractères attendue.`);
    if (isDp && !/\b(?:patient|patiente|enfant|nouveau-n[eé]|femme|homme)\b/i.test(vignette)) errors.push(`${entry.label} : patient identifiable absent de la vignette.`);
    if (GENERATION_SCAFFOLD.test(vignette)) errors.push(`${entry.label} : échafaudage de génération visible.`);
    if (isDp) {
      const vignetteKey = normalizedKey(vignette);
      if (vignettes.has(vignetteKey)) errors.push(`${entry.label} : vignette dupliquée.`);
      vignettes.add(vignetteKey);
    }
    const dpSourceSignatures = [];
    for (const [questionIndex, question] of entry.questions.entries()) {
      const enonce = stripHtml(question.enonce);
      const key = normalizedKey(enonce);
      if (enonce.length < 20) errors.push(`${entry.label}, Q${questionIndex + 1} : énoncé trop court.`);
      if (stems.has(key)) errors.push(`${entry.label}, Q${questionIndex + 1} : énoncé dupliqué.`);
      stems.add(key);
      if (GENERATION_SCAFFOLD.test(enonce)) errors.push(`${entry.label}, Q${questionIndex + 1} : échafaudage ou formulation automatique visible.`);
      if (/\b(?:quelles propositions sont exactes|concernant [«"])/i.test(enonce)) errors.push(`${entry.label}, Q${questionIndex + 1} : énoncé générique interdit.`);
      validateProvenance(question.sourceBlocks, `${entry.label}, Q${questionIndex + 1}`);
      dpSourceSignatures.push((question.sourceBlocks || []).slice().sort().join('|'));
      const correction = stripHtml(question.correction_generale);
      if (!isQroc) qcmEditorialUnits.push(correction);
      if (correction.length < 45) errors.push(`${entry.label}, Q${questionIndex + 1} : correction générale explicative insuffisante.`);
      if (key.length >= 20 && normalizedKey(correction).includes(key)) errors.push(`${entry.label}, Q${questionIndex + 1} : la correction recopie l’énoncé au lieu de synthétiser le raisonnement.`);
      if (GENERIC_CORRECTION.test(correction)) errors.push(`${entry.label}, Q${questionIndex + 1} : correction générale générique interdite.`);
      if (GENERATION_SCAFFOLD.test(correction)) errors.push(`${entry.label}, Q${questionIndex + 1} : référence éditoriale ou formulation automatique interdite dans la correction.`);
      const correctionKey = semanticCoreKey(correction);
      if (!correctionKey || corrections.has(correctionKey)) errors.push(`${entry.label}, Q${questionIndex + 1} : correction générale vide ou dupliquée dans le cours.`);
      corrections.add(correctionKey);
      if (isDp && questionIndex > 0) {
        const newInformation = stripHtml(question.newInformation);
        if (newInformation.length < 25) errors.push(`${entry.label}, Q${questionIndex + 1} : donnée progressive explicite absente.`);
        if (newInformation && !normalizedKey(enonce).includes(normalizedKey(newInformation))) errors.push(`${entry.label}, Q${questionIndex + 1} : la nouvelle donnée doit apparaître naturellement dans l’énoncé.`);
        if (GENERATION_SCAFFOLD.test(newInformation)) errors.push(`${entry.label}, Q${questionIndex + 1} : transition progressive artificielle.`);
      }
      const items = Array.isArray(question.items) ? question.items : [];
      if (isQroc) {
        if (items.length !== 0) errors.push(`${entry.label}, Q${questionIndex + 1} : un QROC ne doit pas contenir d'items.`);
        const answer = stripHtml(question.reponse_attendue);
        if (!answer || answer.length > 180) errors.push(`${entry.label}, Q${questionIndex + 1} : réponse attendue absente ou trop longue.`);
        if (/[.…]{2,}/.test(enonce)) errors.push(`${entry.label}, Q${questionIndex + 1} : QROC à trou interdit.`);
      } else {
        if (items.length !== 5) errors.push(`${entry.label}, Q${questionIndex + 1} : cinq items requis.`);
        const correct = items.filter((item) => item.is_correct).length;
        if (correct < 1 || correct > 5) errors.push(`${entry.label}, Q${questionIndex + 1} : une à cinq réponses justes requises.`);
        const correctPattern = items.filter((item) => item.is_correct).map((item) => item.lettre).join('');
        correctPatterns.add(correctPattern);
        for (const letter of correctPattern) correctByLetter[letter] += 1;
        const letters = items.map((item) => item.lettre).join('');
        if (letters !== 'ABCDE') errors.push(`${entry.label}, Q${questionIndex + 1} : lettres A-E requises dans l'ordre.`);
        if (uniqueCount(items.map((item) => item.enonce)) !== items.length) errors.push(`${entry.label}, Q${questionIndex + 1} : propositions dupliquées.`);
        for (const item of items) {
          const itemText = stripHtml(item.enonce);
          qcmEditorialUnits.push(itemText);
          if (!itemText) errors.push(`${entry.label}, Q${questionIndex + 1}${item.lettre} : proposition vide.`);
          if (GENERATION_SCAFFOLD.test(itemText)) errors.push(`${entry.label}, Q${questionIndex + 1}${item.lettre} : référence éditoriale ou formulation automatique interdite.`);
          const itemKey = semanticCoreKey(item.enonce);
          if (!itemKey || qcmItemStems.has(itemKey)) errors.push(`${entry.label}, Q${questionIndex + 1}${item.lettre} : proposition vide ou recopiée dans une autre question.`);
          qcmItemStems.add(itemKey);
          const justification = stripHtml(item.justification);
          qcmEditorialUnits.push(justification);
          if (justification.length < 35) errors.push(`${entry.label}, Q${questionIndex + 1}${item.lettre} : justification spécifique insuffisante.`);
          if (GENERIC_CORRECTION.test(justification) || GENERATION_SCAFFOLD.test(justification)) errors.push(`${entry.label}, Q${questionIndex + 1}${item.lettre} : justification automatique interdite.`);
          const justificationKey = semanticCoreKey(justification);
          if (!justificationKey || qcmItemJustifications.has(justificationKey)) errors.push(`${entry.label}, Q${questionIndex + 1}${item.lettre} : justification vide ou recopiée dans une autre question.`);
          qcmItemJustifications.add(justificationKey);
        }
      }
    }
    if (isDp && uniqueCount(dpSourceSignatures) < 5) errors.push(`${entry.label} : progression insuffisamment diversifiée dans les sources mobilisées.`);
  }
  for (const [family, expected] of Object.entries(expectedFamilies)) {
    if (families[family] !== expected) errors.push(`Répartition ${family} : ${families[family]}, attendu ${expected}.`);
  }
  const reusedFlashcardStems = [...rectos].filter((recto) => stems.has(recto));
  if (reusedFlashcardStems.length) errors.push(`Banques : ${reusedFlashcardStems.length} question(s) recopiée(s) depuis les flashcards.`);
  if (correctPatterns.size < 10) errors.push(`QCM : profils de réponses trop répétitifs (${correctPatterns.size} seulement).`);
  for (const [letter, count] of Object.entries(correctByLetter)) if (count < 10) errors.push(`QCM : la lettre ${letter} n'est correcte que ${count} fois.`);
  const boilerplate = repeatedPhrases(qcmEditorialUnits);
  if (boilerplate.length) {
    errors.push(`QCM : segments rédactionnels répétés détectés (${boilerplate.slice(0, 8).map(([phrase, count]) => `« ${phrase} » ×${count}`).join(' ; ')}).`);
  }
  const serialized = JSON.stringify({ fiche, facts, series });
  if (/[★]|m-ecn/i.test(serialized)) errors.push('Marqueur d’annale interdit détecté.');
  if (!resolve(chapterDir)) errors.push('chapterDir invalide.');
  return { errors, families, flashcards: facts?.length ?? 0 };
}

export function emitCollegePackage({ chapterDir, outputDir, fiche, facts, series, coverage = {} }) {
  const dir = resolve(chapterDir);
  const out = resolve(outputDir || join(dir, 'delivery', 'source-quality-v1'));
  const validation = validateCollegePackage({ fiche, facts, series, chapterDir: dir });
  if (validation.errors.length) throw new Error(`Paquet pédagogique invalide :\n- ${validation.errors.join('\n- ')}`);
  const body = compileFicheModel(fiche, dir);
  mkdirSync(out, { recursive: true });
  const chapter = {
    title: fiche.title,
    matiere: fiche.matiere,
    provenance: {
      extract: 'extract.json',
      sourceOnly: true,
      annalesUsedForCalibrationOnly: true,
      visibleAnnalesMarkers: false,
    },
    flashcards: facts,
    series,
  };
  writeFileSync(join(out, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
  writeFileSync(join(out, 'fiche.body.html'), body, 'utf8');
  writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
  writeFileSync(join(out, 'coverage.json'), `${JSON.stringify({
    ...coverage,
    flashcards: facts.length,
    qcmQuestions: 40,
    dpQcmQuestions: 56,
    qrocQuestions: 40,
    dpQrocQuestions: 56,
  }, null, 2)}\n`, 'utf8');
  return { outputDir: out, body, validation };
}
