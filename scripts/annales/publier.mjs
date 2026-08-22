/**
 * Publication d'un jeu d'annales : upload des figures puis insertion des séries.
 *
 * Passe par PostgREST (service role) plutôt que par du SQL brut : les énoncés
 * sont truffés d'apostrophes typographiques, de guillemets et de HTML, le JSON
 * supprime tout risque d'échappement. `kind` et `mg_series` sont laissés aux
 * triggers de la base.
 *
 * Idempotent : une série dont le libellé existe déjà sur l'item est ignorée,
 * sauf `--force` qui la remplace (questions et items compris).
 *
 * Usage :
 *   node scripts/annales/publier.mjs --data scripts/annales/data/orthopedie.json [--dry-run] [--force]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { ATELIER } from './extraire.mjs';
import { charger } from './charger.mjs';

const BUCKET = 'qcm-images';
const CACHE_IMAGES = 'scripts/annales/images-publiees.json';

const arg = (nom) => process.argv.includes(nom) ? process.argv[process.argv.indexOf(nom) + 1] : null;
const a = (nom) => process.argv.includes(nom);
const dataPath = arg('--data');
const dryRun = a('--dry-run');
const force = a('--force');
if (!dataPath) throw new Error('Usage : --data scripts/annales/data/<college>.json [--dry-run] [--force]');

// --- .env.local parsé à la main (pas de dotenv dans les scripts du dépôt) ---
const env = {};
for (const ligne of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = ligne.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const data = charger(dataPath);
const cheminFigure = (p) => (isAbsolute(p) ? p : join(ATELIER, p));

// ---------------------------------------------------------------- 1. figures
// Toutes les figures citées, question par question et item par item : c'est le
// décompte qui sert ensuite de contrôle de parité « aucune image omise ».
const citees = [];
for (const s of data.series) {
  for (const q of s.questions) {
    for (const img of q.images ?? []) citees.push(img);
    for (const it of q.items ?? []) for (const img of it.images ?? []) citees.push(img);
  }
}
const manquantes = [...new Set(citees)].filter((p) => !existsSync(cheminFigure(p)));
if (manquantes.length) {
  console.error('Figures introuvables sur le disque :\n  ' + manquantes.join('\n  '));
  process.exit(1);
}
console.log(citees.length + ' référence(s) de figure, ' + new Set(citees).size + ' fichier(s) distinct(s).');

const cache = existsSync(CACHE_IMAGES) ? JSON.parse(readFileSync(CACHE_IMAGES, 'utf8')) : {};
const urls = {};        // chemin relatif -> URL publique
const parSha = new Map(); // sha -> URL (déduplication du contenu)
for (const rel of new Set(citees)) {
  const buf = readFileSync(cheminFigure(rel));
  const sha = createHash('sha1').update(buf).digest('hex');
  if (cache[sha]) { urls[rel] = cache[sha]; parSha.set(sha, cache[sha]); continue; }
  if (parSha.has(sha)) { urls[rel] = parSha.get(sha); continue; }
  const ext = (rel.match(/\.(\w+)$/) ?? [, 'png'])[1].toLowerCase();
  const nom = 'annales/' + sha + '.' + ext;
  if (dryRun) { urls[rel] = '(dry-run)/' + nom; parSha.set(sha, urls[rel]); continue; }
  const { error } = await sb.storage.from(BUCKET).upload(nom, buf, {
    contentType: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/' + ext, upsert: true,
  });
  if (error) throw new Error('upload ' + rel + ' : ' + error.message);
  const url = sb.storage.from(BUCKET).getPublicUrl(nom).data.publicUrl;
  cache[sha] = url; urls[rel] = url; parSha.set(sha, url);
}
if (!dryRun) writeFileSync(CACHE_IMAGES, JSON.stringify(cache, null, 1), 'utf8');
console.log('Figures publiées : ' + parSha.size + ' distinctes.');

// ------------------------------------------------------------------ 2. item
let coursId = data.coursId ?? null;
if (!coursId) {
  const { data: existant, error } = await sb.from('cours')
    .select('id').eq('matiere_id', data.collegeId).eq('titre', data.coursTitre).maybeSingle();
  if (error) throw error;
  coursId = existant?.id ?? null;
}
if (!coursId) {
  if (dryRun) { coursId = '(dry-run)'; }
  else {
    const { data: max } = await sb.from('cours')
      .select('order_index').eq('matiere_id', data.collegeId).order('order_index', { ascending: false }).limit(1);
    const { data: cree, error } = await sb.from('cours').insert({
      matiere_id: data.collegeId,
      titre: data.coursTitre,
      order_index: data.coursOrderIndex ?? ((max?.[0]?.order_index ?? -1) + 1),
    }).select('id').single();
    if (error) throw error;
    coursId = cree.id;
    console.log('Item créé : ' + data.coursTitre + ' (' + coursId + ')');
  }
} else {
  console.log('Item existant : ' + data.coursTitre + ' (' + coursId + ')');
}

// ---------------------------------------------------------------- 3. séries
const { data: dejaLa, error: eLire } = dryRun ? { data: [] } : await sb.from('qcm_series')
  .select('id, label').eq('cours_id', coursId).like('label', 'Annales - %');
if (eLire) throw eLire;
const parLabel = new Map((dejaLa ?? []).map((s) => [s.label, s.id]));

let nbSeries = 0, nbQuestions = 0, nbItems = 0, nbImages = 0;
for (const s of data.series) {
  if (parLabel.has(s.label)) {
    if (!force) { console.log('  (déjà publiée, ignorée) ' + s.label); continue; }
    const id = parLabel.get(s.label);
    const { data: qs } = await sb.from('qcm_questions').select('id').eq('serie_id', id);
    if (qs?.length) await sb.from('qcm_items').delete().in('question_id', qs.map((q) => q.id));
    await sb.from('qcm_questions').delete().eq('serie_id', id);
    await sb.from('qcm_series').delete().eq('id', id);
    console.log('  (remplacée) ' + s.label);
  }

  const lignesQ = s.questions.map((q, i) => ({
    enonce: q.enonce,
    order_index: i,
    format: q.format,
    reponse_attendue: q.format === 'qcm'
      ? (q.items ?? []).filter((it) => it.isCorrect).map((it) => it.lettre).sort().join('')
      : (q.reponseAttendue ?? ''),
    correction_generale: q.correctionGenerale ?? null,
    images: (q.images ?? []).map((p) => urls[p]),
  }));
  nbImages += lignesQ.reduce((n, q) => n + q.images.length, 0)
    + s.questions.reduce((n, q) => n + (q.items ?? []).reduce((m, it) => m + (it.images ?? []).length, 0), 0);

  if (dryRun) {
    nbSeries++; nbQuestions += lignesQ.length;
    nbItems += s.questions.reduce((n, q) => n + (q.items ?? []).length, 0);
    console.log('  [dry-run] ' + s.label + ' — ' + lignesQ.length + ' question(s)');
    continue;
  }

  const { data: serie, error: e1 } = await sb.from('qcm_series').insert({
    cours_id: coursId, type: 'qcm', label: s.label, annee: s.annee,
    order_index: s.orderIndex ?? nbSeries, vignette: s.vignette ?? null,
    // Pas d'allowed_voies : la voie est déjà tranchée par `kind` (QCM → interne,
    // QROC → externe). La renseigner masquerait la série aux élèves sans voie.
  }).select('id').single();
  if (e1) throw new Error(s.label + ' : ' + e1.message);

  const { data: qIns, error: e2 } = await sb.from('qcm_questions')
    .insert(lignesQ.map((q) => ({ ...q, serie_id: serie.id })))
    .select('id, order_index');
  if (e2) throw new Error(s.label + ' (questions) : ' + e2.message);
  const parOrdre = new Map(qIns.map((q) => [q.order_index, q.id]));

  const lignesI = [];
  s.questions.forEach((q, i) => {
    for (const it of q.items ?? []) {
      lignesI.push({
        question_id: parOrdre.get(i),
        lettre: it.lettre,
        enonce: it.enonce,
        is_correct: !!it.isCorrect,
        justification: it.justification ?? '',
        images: (it.images ?? []).map((p) => urls[p]),
      });
    }
  });
  if (lignesI.length) {
    const { error: e3 } = await sb.from('qcm_items').insert(lignesI);
    if (e3) throw new Error(s.label + ' (items) : ' + e3.message);
  }

  nbSeries++; nbQuestions += lignesQ.length; nbItems += lignesI.length;
  console.log('  ✓ ' + s.label + ' — ' + lignesQ.length + ' question(s), ' + lignesI.length + ' proposition(s)');
}

console.log('\n' + nbSeries + ' série(s), ' + nbQuestions + ' question(s), ' + nbItems
  + ' proposition(s), ' + nbImages + ' image(s) rattachée(s).' + (dryRun ? '  [DRY-RUN, rien écrit]' : ''));
