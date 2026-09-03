#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS = join(ROOT, '.corpus-anesthesie-reanimation');
const MANIFEST = join(CORPUS, 'manifest.json');
const SNAPSHOT = join(CORPUS, 'snapshot-prepublish.json');
const SNAPSHOT_ASSETS = join(CORPUS, 'snapshot-prepublish-assets');
const REPORT = join(CORPUS, 'publish-report.json');
const EDITORIAL_AUDIT = join(CORPUS, 'editorial-quality-audit.json');
const BRAND_LOGO = join(ROOT, 'public', 'major-ecn-logo.png');
const ACTIVATION_MIGRATION = join(ROOT, 'supabase', 'migrations', '20260821120000_anesthesie_reanimation_publication_guard.sql');
const PREFLIGHT = process.argv.includes('--preflight') || !process.argv.some((arg) => ['--stage', '--activate', '--restore-snapshot'].includes(arg));
const STAGE = process.argv.includes('--stage');
const ACTIVATE = process.argv.includes('--activate');
const RESTORE = process.argv.includes('--restore-snapshot');
const RESTORE_CONFIRMATION = process.argv.find((arg) => /^--confirm-restore=/.test(arg))?.split('=')[1] || '';
const LIMIT = Number(process.argv.find((arg) => /^--limit=/.test(arg))?.split('=')[1] || 0);
const selectedModes = [PREFLIGHT, STAGE, ACTIVATE, RESTORE].filter(Boolean).length;
if (selectedModes !== 1) throw new Error('Choisir un seul mode : --preflight, --stage, --activate ou --restore-snapshot.');
if (LIMIT && !STAGE) throw new Error('--limit est réservé au mode --stage.');
if (RESTORE && RESTORE_CONFIRMATION !== 'col-anesthesie-reanimation') {
  throw new Error('Restauration refusée : ajouter --confirm-restore=col-anesthesie-reanimation.');
}

let db = null;
if (!PREFLIGHT) {
  config({ path: join(ROOT, '.env.local') });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Variables Supabase absentes : aucune opération distante n’a été tentée.');
  }
  db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')).sort((a, b) => a.numero - b.numero);

async function must(query, label) {
  const result = await query;
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

const chunk = (rows, size = 250) => Array.from({ length: Math.ceil(rows.length / size) }, (_, index) => rows.slice(index * size, (index + 1) * size));
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const stagedStoragePath = (course) => {
  const pdfPath = join(course.deliveryDir, 'fiche.pdf');
  return `${course.courseId}/fiche-${sha256(pdfPath).slice(0, 16)}.pdf`;
};

function validateLocalManifest() {
  if (manifest.length !== 43) throw new Error(`Manifest incomplet : ${manifest.length}/43 cours.`);
  const numbers = manifest.map((course) => course.numero);
  const expectedNumbers = Array.from({ length: 43 }, (_, index) => index + 1);
  if (numbers.some((numero, index) => numero !== expectedNumbers[index])) {
    throw new Error(`Numérotation du manifeste invalide : ${numbers.join(', ')}.`);
  }
  for (const [field, values] of [
    ['courseId', manifest.map((course) => course.courseId)],
    ['slug', manifest.map((course) => course.slug)],
    ['deliveryDir', manifest.map((course) => course.deliveryDir)],
  ]) {
    if (new Set(values).size !== 43 || values.some((value) => !value)) throw new Error(`Manifest : ${field} absent ou dupliqué.`);
  }

  const totals = { series: 0, questions: 0, items: 0, flashcards: 0, qroc: 0, dp: 0 };
  for (const course of manifest) {
    const chapterDir = resolve(course.chapterDir);
    const deliveryDir = resolve(course.deliveryDir);
    const chapterRelative = relative(resolve(CORPUS), chapterDir);
    const deliveryRelative = relative(chapterDir, deliveryDir);
    if (!chapterRelative || chapterRelative.startsWith('..') || isAbsolute(chapterRelative)
        || !deliveryRelative || deliveryRelative.startsWith('..') || isAbsolute(deliveryRelative)) {
      throw new Error(`Chapitre ${course.numero} : chemin hors corpus.`);
    }
    if (resolve(course.finalHtml) !== resolve(course.deliveryDir, 'fiche.final.html')) {
      throw new Error(`Chapitre ${course.numero} : chemin HTML final incohérent.`);
    }
    const files = ['chapter.json', 'fiche.model.json', 'coverage.json', 'fiche-audit.json', 'fiche.final.html', 'fiche.pdf'];
    for (const file of files) {
      if (!existsSync(join(course.deliveryDir, file))) throw new Error(`Chapitre ${course.numero} : artefact absent (${file}).`);
    }
    const chapter = JSON.parse(readFileSync(join(course.deliveryDir, 'chapter.json'), 'utf8'));
    const series = chapter.series || [];
    const questions = series.flatMap((serie) => serie.questions || []);
    const items = questions.flatMap((question) => question.items || []);
    const families = { qcm: 0, dpQcm: 0, qroc: 0, dpQroc: 0 };
    for (const serie of series) {
      const isDpQroc = /^DP QROC\b/i.test(serie.label || '');
      const isQroc = !isDpQroc && /^QROC\b/i.test(serie.label || '');
      const isDpQcm = /^DP QCM\b/i.test(serie.label || '');
      const isQcm = /^QCM\b/i.test(serie.label || '');
      const family = isDpQroc ? 'dpQroc' : isQroc ? 'qroc' : isDpQcm ? 'dpQcm' : isQcm ? 'qcm' : null;
      if (!family) throw new Error(`Chapitre ${course.numero} : famille inconnue (${serie.label}).`);
      families[family] += 1;
      const expectedVoie = family === 'qroc' || family === 'dpQroc' ? 'externe' : 'interne';
      if (!Array.isArray(serie.allowed_voies) || serie.allowed_voies.length !== 1 || serie.allowed_voies[0] !== expectedVoie) {
        throw new Error(`Chapitre ${course.numero} : voie invalide (${serie.label}).`);
      }
      const expectedQuestions = family === 'dpQcm' || family === 'dpQroc' ? 7 : 5;
      if ((serie.questions || []).length !== expectedQuestions) throw new Error(`Chapitre ${course.numero} : volume invalide (${serie.label}).`);
    }
    if (Object.values(families).some((count) => count !== 8)) throw new Error(`Chapitre ${course.numero} : banques incomplètes ${JSON.stringify(families)}.`);
    if (series.length !== 32 || questions.length !== 192 || items.length !== 480 || chapter.flashcards?.length < 100 || chapter.flashcards?.length > 200) {
      throw new Error(`Chapitre ${course.numero} : comptages locaux invalides.`);
    }
    const qroc = questions.filter((question) => question.format === 'qroc');
    if (qroc.length !== 96 || qroc.some((question) => !question.reponse_attendue || (question.items || []).length !== 0)) {
      throw new Error(`Chapitre ${course.numero} : QROC locaux invalides.`);
    }
    totals.series += series.length;
    totals.questions += questions.length;
    totals.items += items.length;
    totals.flashcards += chapter.flashcards.length;
    totals.qroc += qroc.length;
    totals.dp += families.dpQcm + families.dpQroc;
  }
  return totals;
}

function localPreflight() {
  const totals = validateLocalManifest();
  const audit = requireGlobalEditorialAudit();
  if (!existsSync(ACTIVATION_MIGRATION)) throw new Error('Migration de garde transactionnelle absente.');
  const guardSql = readFileSync(ACTIVATION_MIGRATION, 'utf8');
  for (const token of ['activate_anesthesie_reanimation', "access_type = 'specific'", 'replace_cours_generated_content']) {
    if (!guardSql.includes(token)) throw new Error(`Migration de garde incomplète : ${token}.`);
  }
  const result = {
    mode: 'preflight', remoteCalls: 0, ready: true, courses: manifest.length,
    editorialAudit: `${audit.summary.passed}/${audit.summary.courses}`,
    totals,
    requiredMigration: ACTIVATION_MIGRATION,
    next: 'Appliquer les migrations, puis exécuter --stage. --activate reste une commande séparée et transactionnelle.',
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function validateSnapshotState(state) {
  const arrays = ['courses', 'series', 'questions', 'items', 'flashcards', 'fiches', 'ficheAssets', 'stagedStoragePaths'];
  if (state?.schemaVersion !== 1 || !state.createdAt || !state.manifestSha256) throw new Error('Instantané : en-tête ou version invalide.');
  for (const field of arrays) if (!Array.isArray(state[field])) throw new Error(`Instantané : tableau ${field} absent.`);
  if (state.matiere && !state.matiere.id) throw new Error('Instantané : collège invalide.');
  for (const asset of state.ficheAssets) {
    if (!asset.storagePath || !asset.localPath || !asset.sha256) throw new Error('Instantané : référence de PDF incomplète.');
    if (!existsSync(asset.localPath) || sha256(asset.localPath) !== asset.sha256) throw new Error(`Instantané : PDF absent ou altéré (${asset.localPath}).`);
  }
  return state;
}

async function insertBatches(table, rows, label) {
  for (const [index, batch] of chunk(rows).entries()) {
    await must(db.from(table).insert(batch), `${label} (${index + 1}/${Math.ceil(rows.length / 250)})`);
  }
}

async function assertStagingSafe() {
  const college = await must(db.from('matieres').select('id,access_type').eq('id', 'col-anesthesie-reanimation').maybeSingle(), 'préflight distant : collège');
  if (!college) return;
  if (college.access_type !== 'specific') {
    throw new Error(`Staging refusé : le collège existant est en accès ${college.access_type}. Une republication ne doit jamais effacer une progression active.`);
  }
  const courses = await must(db.from('cours').select('id').eq('matiere_id', 'col-anesthesie-reanimation'), 'préflight distant : cours');
  const courseIds = courses.map((course) => course.id);
  if (!courseIds.length) return;
  const series = await must(db.from('qcm_series').select('id').in('cours_id', courseIds), 'préflight distant : séries');
  const questions = [];
  for (const ids of chunk(series.map((serie) => serie.id), 100)) {
    questions.push(...await must(db.from('qcm_questions').select('id').in('serie_id', ids), 'préflight distant : questions'));
  }
  const cards = await must(db.from('flashcards').select('id').in('cours_id', courseIds), 'préflight distant : flashcards');
  for (const ids of chunk(series.map((serie) => serie.id), 100)) {
    const sessions = await must(db.from('qcm_sessions').select('id').in('serie_id', ids).limit(1), 'préflight distant : sessions QCM');
    if (sessions.length) throw new Error('Staging refusé : des sessions QCM existent déjà sur ce collège.');
  }
  for (const ids of chunk(questions.map((question) => question.id), 100)) {
    const attempts = await must(db.from('qcm_attempts').select('id').in('question_id', ids).limit(1), 'préflight distant : tentatives QCM');
    if (attempts.length) throw new Error('Staging refusé : des tentatives QCM existent déjà sur ce collège.');
  }
  for (const ids of chunk(cards.map((card) => card.id), 100)) {
    const reviews = await must(db.from('flashcard_reviews').select('id').in('flashcard_id', ids).limit(1), 'préflight distant : révisions de flashcards');
    if (reviews.length) throw new Error('Staging refusé : des révisions de flashcards existent déjà sur ce collège.');
  }
}

function requireGlobalEditorialAudit() {
  if (!existsSync(EDITORIAL_AUDIT)) throw new Error('Audit éditorial global absent.');
  const editorialAudit = JSON.parse(readFileSync(EDITORIAL_AUDIT, 'utf8'));
  if (editorialAudit.summary?.courses !== 43 || editorialAudit.summary?.passed !== 43 || editorialAudit.summary?.failed !== 0
      || !Array.isArray(editorialAudit.reports) || editorialAudit.reports.some((entry) => !entry.passed)) {
    throw new Error(`Audit éditorial global incomplet ou en échec (${editorialAudit.summary?.passed || 0}/43).`);
  }
  for (const course of manifest) {
    const report = editorialAudit.reports.find((entry) => entry.numero === course.numero);
    const expected = report?.artifacts;
    const current = {
      chapter: join(course.deliveryDir, 'chapter.json'),
      ficheModel: join(course.deliveryDir, 'fiche.model.json'),
      coverage: join(course.deliveryDir, 'coverage.json'),
      ficheAudit: join(course.deliveryDir, 'fiche-audit.json'),
      html: join(course.deliveryDir, 'fiche.final.html'),
      pdf: join(course.deliveryDir, 'fiche.pdf'),
    };
    for (const [name, path] of Object.entries(current)) {
      if (!expected?.[name] || !existsSync(path) || sha256(path) !== expected[name]) {
        throw new Error(`Audit périmé ou artefact modifié après validation : chapitre ${course.numero}, ${name}.`);
      }
    }
  }
  return editorialAudit;
}

async function snapshot() {
  const matiere = await must(db.from('matieres').select('*').eq('id', 'col-anesthesie-reanimation').maybeSingle(), 'snapshot collège');
  const courses = await must(db.from('cours').select('*').eq('matiere_id', 'col-anesthesie-reanimation').order('order_index'), 'snapshot cours');
  const courseIds = courses.map((course) => course.id);
  const series = courseIds.length ? await must(db.from('qcm_series').select('*').in('cours_id', courseIds), 'snapshot séries') : [];
  const questions = [];
  for (const ids of chunk(series.map((serie) => serie.id), 100)) {
    questions.push(...await must(db.from('qcm_questions').select('*').in('serie_id', ids), 'snapshot questions'));
  }
  const items = [];
  for (const ids of chunk(questions.map((question) => question.id), 100)) {
    items.push(...await must(db.from('qcm_items').select('*').in('question_id', ids), 'snapshot propositions'));
  }
  const flashcards = courseIds.length ? await must(db.from('flashcards').select('*').in('cours_id', courseIds), 'snapshot flashcards') : [];
  const fiches = courseIds.length ? await must(db.from('fiches').select('*').in('cours_id', courseIds), 'snapshot fiches') : [];
  mkdirSync(SNAPSHOT_ASSETS, { recursive: true });
  const ficheAssets = [];
  for (const fiche of fiches) {
    if (!fiche.storage_path) continue;
    const download = await db.storage.from('fiches').download(fiche.storage_path);
    if (download.error) throw new Error(`snapshot PDF ${fiche.storage_path}: ${download.error.message}`);
    const bytes = Buffer.from(await download.data.arrayBuffer());
    const digest = createHash('sha256').update(bytes).digest('hex');
    const localPath = join(SNAPSHOT_ASSETS, `${fiche.id}-${digest.slice(0, 16)}.pdf`);
    writeFileSync(localPath, bytes);
    ficheAssets.push({ ficheId: fiche.id, storagePath: fiche.storage_path, localPath, sha256: digest });
  }
  const state = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    manifestSha256: sha256(MANIFEST),
    // Un chemin versionné évite de relire une ancienne réponse CDN juste après
    // un upsert sur le chemin canonique. L'instantané sait précisément quels
    // objets supprimer en cas de restauration.
    stagedStoragePaths: manifest.map(stagedStoragePath),
    matiere, courses, series, questions, items, flashcards, fiches, ficheAssets,
  };
  validateSnapshotState(state);
  writeFileSync(SNAPSHOT, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  return state;
}

async function restoreSnapshot(state) {
  const currentCourses = await must(db.from('cours').select('id').eq('matiere_id', 'col-anesthesie-reanimation'), 'restauration : lecture cours actuels');
  const currentCourseIds = currentCourses.map((course) => course.id);
  if (currentCourseIds.length) {
    await must(db.from('cours').update({ access_type: 'specific' }).in('id', currentCourseIds), 'restauration : restriction immédiate des cours');
    await must(db.from('qcm_series').delete().in('cours_id', currentCourseIds), 'restauration : suppression séries partielles');
    await must(db.from('flashcards').delete().in('cours_id', currentCourseIds), 'restauration : suppression flashcards partielles');
    await must(db.from('fiches').delete().in('cours_id', currentCourseIds), 'restauration : suppression fiches partielles');
  }
  await must(db.from('matieres').update({ access_type: 'specific' }).eq('id', 'col-anesthesie-reanimation'), 'restauration : restriction immédiate du collège');

  const stagedStoragePaths = Array.isArray(state.stagedStoragePaths)
    ? state.stagedStoragePaths
    : manifest.map(stagedStoragePath);
  if (stagedStoragePaths.length) {
    const removal = await db.storage.from('fiches').remove(stagedStoragePaths);
    if (removal.error) throw new Error(`restauration : nettoyage des PDF partiels : ${removal.error.message}`);
  }

  if (!state.matiere) {
    if (currentCourseIds.length) await must(db.from('cours').delete().in('id', currentCourseIds), 'restauration : suppression des cours créés');
    await must(db.from('matieres').delete().eq('id', 'col-anesthesie-reanimation'), 'restauration : suppression du collège créé');
    return;
  }

  await must(db.from('matieres').upsert(state.matiere, { onConflict: 'id' }), 'restauration : collège');
  if (currentCourseIds.length) await must(db.from('cours').delete().in('id', currentCourseIds), 'restauration : remise à zéro des cours');
  await insertBatches('cours', state.courses, 'restauration : cours');
  await insertBatches('qcm_series', state.series, 'restauration : séries');
  await insertBatches('qcm_questions', state.questions, 'restauration : questions');
  await insertBatches('qcm_items', state.items, 'restauration : propositions');
  await insertBatches('flashcards', state.flashcards, 'restauration : flashcards');
  await insertBatches('fiches', state.fiches, 'restauration : fiches');
  for (const asset of state.ficheAssets || []) {
    if (!existsSync(asset.localPath)) throw new Error(`restauration : sauvegarde PDF absente (${asset.localPath})`);
    if (asset.sha256 && sha256(asset.localPath) !== asset.sha256) throw new Error(`restauration : sauvegarde PDF altérée (${asset.localPath})`);
    const upload = await db.storage.from('fiches').upload(asset.storagePath, readFileSync(asset.localPath), { contentType: 'application/pdf', upsert: true });
    if (upload.error) throw new Error(`restauration PDF ${asset.storagePath}: ${upload.error.message}`);
  }
}

async function ensureTree() {
  await must(db.from('matieres').upsert({
    id: 'col-anesthesie-reanimation', semestre_id: 'edn-prog', nom: 'Anesthésie-Réanimation',
    icon_key: 'Activity', color_hex: '#7C3AED', order_index: 14, parent_matiere_id: null,
    access_type: 'specific', min_offer: null,
  }, { onConflict: 'id' }), 'création collège');
  await must(db.from('cours').upsert(manifest.map((course) => ({
    id: course.courseId, matiere_id: 'col-anesthesie-reanimation', titre: course.title,
    description: `Chapitre ${course.numero} — support Anesthésie-Réanimation pour la préparation aux EVC.`,
    order_index: course.numero, importance: 0, access_type: 'specific',
  })), { onConflict: 'id' }), 'création des 43 cours');
}

function localBrandAssets() {
  if (!existsSync(BRAND_LOGO)) throw new Error(`Logo Major ECN local absent : ${BRAND_LOGO}`);
  const logo = `data:image/png;base64,${readFileSync(BRAND_LOGO).toString('base64')}`;
  return { watermark: logo, logo };
}

async function publishCourse(course, assets) {
  const chapter = JSON.parse(readFileSync(join(course.deliveryDir, 'chapter.json'), 'utf8'));
  const validation = JSON.parse(readFileSync(join(course.deliveryDir, 'fiche-audit.json'), 'utf8'));
  if (!validation.passed) throw new Error(`${course.title}: audit fiche local en échec.`);
  if (chapter.series.length !== 32 || chapter.flashcards.length < 100 || chapter.flashcards.length > 200) throw new Error(`${course.title}: paquet local incomplet.`);

  // La banque complète est remplacée dans une transaction PostgreSQL unique.
  // Le collège reste en accès « specific » pendant les opérations de stockage
  // qui suivent : aucun état intermédiaire n'est visible par les étudiants.
  await must(db.rpc('replace_cours_generated_content', {
    p_cours_id: course.courseId,
    p_payload: { series: chapter.series, flashcards: chapter.flashcards },
    p_replace: true,
  }), `${course.title}: remplacement atomique des banques`);

  {
    const pdfPath = join(course.deliveryDir, 'fiche.pdf');
    const pdf = readFileSync(pdfPath);
    const pages = (await PDFDocument.load(pdf)).getPageCount();
    const storagePath = stagedStoragePath(course);
    const upload = await db.storage.from('fiches').upload(storagePath, pdf, { contentType: 'application/pdf', upsert: true });
    if (upload.error) throw new Error(`${course.title}: upload PDF: ${upload.error.message}`);
    const html = readFileSync(course.finalHtml, 'utf8').replaceAll('__WATERMARK__', assets.watermark).replaceAll('__LOGO__', assets.logo);
    const fichePatch = { titre: course.title, storage_path: storagePath, pages, content_html: html, content_format: 'html', order_index: 1 };
    await must(db.from('fiches').delete().eq('cours_id', course.courseId), `${course.title}: suppression des fiches antérieures`);
    await must(db.from('fiches').insert({ cours_id: course.courseId, ...fichePatch }), `${course.title}: publication de la fiche canonique`);
  }
  return auditCourse(course);
}

async function auditCourse(course) {
  const series = await must(db.from('qcm_series').select('id,label,kind,allowed_voies').eq('cours_id', course.courseId).eq('type', 'qcm'), `${course.title}: audit séries`);
  const questions = await must(db.from('qcm_questions').select('id,serie_id,format,reponse_attendue').in('serie_id', series.map((serie) => serie.id)), `${course.title}: audit questions`);
  const items = await must(db.from('qcm_items').select('id,question_id').in('question_id', questions.map((question) => question.id)), `${course.title}: audit items`);
  const cards = await must(db.from('flashcards').select('id').eq('cours_id', course.courseId), `${course.title}: audit flashcards`);
  const fiches = await must(db.from('fiches').select('id,pages,storage_path,content_html').eq('cours_id', course.courseId), `${course.title}: audit fiche`);
  const qroc = questions.filter((question) => question.format === 'qroc');
  const counts = { series: series.length, questions: questions.length, items: items.length, flashcards: cards.length, qroc: qroc.length, fiches: fiches.length, pages: fiches[0]?.pages || 0 };
  if (counts.series !== 32 || counts.questions !== 192 || counts.items !== 480 || counts.flashcards < 100 || counts.flashcards > 200 || counts.qroc !== 96 || counts.fiches !== 1 || counts.pages < 7 || counts.pages > 40) {
    throw new Error(`${course.title}: audit DB invalide ${JSON.stringify(counts)}`);
  }
  if (qroc.some((question) => !question.reponse_attendue)) throw new Error(`${course.title}: QROC sans réponse attendue.`);
  const questionCounts = new Map(series.map((serie) => [serie.id, questions.filter((question) => question.serie_id === serie.id).length]));
  for (const serie of series) {
    const isDp = /^DP/i.test(serie.label);
    const isQroc = /^QROC|^DP QROC/i.test(serie.label);
    if (questionCounts.get(serie.id) !== (isDp ? 7 : 5)) throw new Error(`${course.title}: volume incorrect pour ${serie.label}.`);
    const expectedVoie = isQroc ? 'externe' : 'interne';
    if (!Array.isArray(serie.allowed_voies) || serie.allowed_voies.length !== 1 || serie.allowed_voies[0] !== expectedVoie) throw new Error(`${course.title}: voie incorrecte pour ${serie.label}.`);
  }
  const itemCounts = new Map();
  for (const item of items) itemCounts.set(item.question_id, (itemCounts.get(item.question_id) || 0) + 1);
  for (const question of questions) {
    const expectedItems = question.format === 'qroc' ? 0 : 5;
    if ((itemCounts.get(question.id) || 0) !== expectedItems) throw new Error(`${course.title}: nombre d'items incorrect pour une question ${question.format}.`);
  }
  if (!fiches[0]?.storage_path || !fiches[0]?.content_html || /__LOGO__|__WATERMARK__|__IMGFILE:/.test(fiches[0].content_html)) throw new Error(`${course.title}: fiche HTML/PDF incomplète.`);
  const storedPdf = await db.storage.from('fiches').download(fiches[0].storage_path);
  if (storedPdf.error) throw new Error(`${course.title}: PDF stocké illisible : ${storedPdf.error.message}`);
  const storedPages = (await PDFDocument.load(await storedPdf.data.arrayBuffer())).getPageCount();
  if (storedPages !== counts.pages) throw new Error(`${course.title}: PDF stocké incohérent (${storedPages} pages au lieu de ${counts.pages}).`);
  return counts;
}

async function activate() {
  try { requireGlobalEditorialAudit(); } catch (error) { throw new Error(`Activation refusée : ${error instanceof Error ? error.message : String(error)}`); }
  const currentCollege = await must(db.from('matieres').select('access_type').eq('id', 'col-anesthesie-reanimation').single(), 'contrôle accès collège avant activation');
  const currentCourses = await must(db.from('cours').select('id,access_type').eq('matiere_id', 'col-anesthesie-reanimation'), 'contrôle accès cours avant activation');
  if (currentCollege.access_type !== 'specific' || currentCourses.length !== 43 || currentCourses.some((course) => course.access_type !== 'specific')) {
    throw new Error('Activation refusée : le collège et ses 43 cours doivent être intégralement en accès restreint avant le basculement final.');
  }
  const reports = [];
  for (const course of manifest) reports.push({ numero: course.numero, title: course.title, ...(await auditCourse(course)) });
  const transaction = await must(db.rpc('activate_anesthesie_reanimation', { p_dry_run: false }), 'activation transactionnelle collège + 43 cours');
  const activatedCollege = await must(db.from('matieres').select('access_type').eq('id', 'col-anesthesie-reanimation').single(), 'audit accès collège activé');
  const activatedCourses = await must(db.from('cours').select('id,access_type').eq('matiere_id', 'col-anesthesie-reanimation'), 'audit accès cours activés');
  if (activatedCollege.access_type !== 'all' || activatedCourses.length !== 43 || activatedCourses.some((course) => course.access_type !== 'all')) {
    throw new Error('Activation incomplète détectée après basculement.');
  }
  writeFileSync(REPORT, `${JSON.stringify({ activatedAt: new Date().toISOString(), transaction, reports }, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ activated: true, courses: reports.length }, null, 2));
}

if (PREFLIGHT) {
  localPreflight();
} else if (RESTORE) {
  if (!existsSync(SNAPSHOT)) throw new Error(`Instantané absent : ${SNAPSHOT}`);
  const savedState = validateSnapshotState(JSON.parse(readFileSync(SNAPSHOT, 'utf8')));
  await restoreSnapshot(savedState);
  console.log(JSON.stringify({ restored: true, snapshot: SNAPSHOT, createdAt: savedState.createdAt }, null, 2));
} else if (ACTIVATE) {
  validateLocalManifest();
  await activate();
} else if (STAGE) {
  validateLocalManifest();
  try { requireGlobalEditorialAudit(); } catch (error) { throw new Error(`Publication refusée : ${error instanceof Error ? error.message : String(error)}`); }
  await assertStagingSafe();
  const savedState = await snapshot();
  try {
    await ensureTree();
    const assets = localBrandAssets();
    const reports = [];
    const targets = LIMIT ? manifest.slice(0, LIMIT) : manifest;
    for (const [index, course] of targets.entries()) {
      const counts = await publishCourse(course, assets);
      reports.push({ numero: course.numero, title: course.title, ...counts });
      console.log(`[${index + 1}/${targets.length}] ${course.title} — DB validée`);
    }
    const activationReadiness = targets.length === 43
      ? await must(db.rpc('activate_anesthesie_reanimation', { p_dry_run: true }), 'validation transactionnelle avant activation')
      : { ready: false, reason: `lot partiel ${targets.length}/43` };
    writeFileSync(REPORT, `${JSON.stringify({ stagedAt: new Date().toISOString(), activated: false, activationReadiness, reports }, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ staged: true, courses: reports.length, collegeAccess: 'specific', activationReadiness }, null, 2));
  } catch (error) {
    try {
      await restoreSnapshot(savedState);
    } catch (restoreError) {
      throw new AggregateError([error, restoreError], 'La publication a échoué et la restauration automatique a également échoué. Le collège a été replacé en accès restreint autant que possible.');
    }
    throw new Error(`Publication annulée et instantané restauré : ${error instanceof Error ? error.message : String(error)}`);
  }
}
