/**
 * Aligne les images en base sur les fichiers de données, sans toucher au reste.
 *
 * `publier.mjs --force` supprime puis recrée les questions : par cascade, il
 * effacerait les tentatives déjà enregistrées par les élèves. Quand seule
 * l'iconographie change — une figure du sujet officiel rattachée après coup,
 * une capture d'écran remplacée par la planche d'origine — ce script suffit :
 * il téléverse ce qui manque dans le bucket, puis met à jour les seules
 * colonnes `images` de `qcm_questions` et `qcm_items`.
 *
 * Usage : node scripts/annales/sync-images.mjs [--data <dossier>] [--ecrire]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, isAbsolute } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { ATELIER } from './extraire.mjs';
import { charger } from './charger.mjs';

const BUCKET = 'qcm-images';
const CACHE_IMAGES = 'scripts/annales/images-publiees.json';
const arg = (n) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
const ECRIRE = process.argv.includes('--ecrire');

const env = {};
for (const ligne of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = ligne.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const dossiers = arg('--data') ? [arg('--data')]
  : readdirSync('scripts/annales/data').map((c) => 'scripts/annales/data/' + c);

const cheminFigure = (p) => (isAbsolute(p) ? p : join(ATELIER, p));

/* ------------------------------------------ 1. état attendu, par série ---- */

/** label → { questions: [images[]], items: Map<'i:lettre', images[]> } */
const attendu = new Map();
const citees = new Set();
for (const d of dossiers) {
  for (const s of charger(d).series ?? []) {
    const q = s.questions.map((x) => x.images ?? []);
    const items = new Map();
    s.questions.forEach((x, i) => {
      for (const it of x.items ?? []) items.set(i + ':' + it.lettre, it.images ?? []);
    });
    for (const l of [...q.flat(), ...[...items.values()].flat()]) citees.add(l);
    attendu.set(s.label, { questions: q, items });
  }
}
const manquantes = [...citees].filter((p) => !existsSync(cheminFigure(p)));
if (manquantes.length) {
  console.error('Figures absentes du disque :\n  ' + manquantes.join('\n  '));
  process.exit(1);
}

/* ------------------------------------------------- 2. téléversement ------- */

const cache = existsSync(CACHE_IMAGES) ? JSON.parse(readFileSync(CACHE_IMAGES, 'utf8')) : {};
const urls = {};
let televersees = 0;
for (const rel of citees) {
  const buf = readFileSync(cheminFigure(rel));
  const sha = createHash('sha1').update(buf).digest('hex');
  if (cache[sha]) { urls[rel] = cache[sha]; continue; }
  const ext = (rel.match(/\.(\w+)$/) ?? [, 'png'])[1].toLowerCase();
  const nom = 'annales/' + sha + '.' + ext;
  if (!ECRIRE) { urls[rel] = '(à téléverser)/' + nom; televersees++; continue; }
  const { error } = await sb.storage.from(BUCKET).upload(nom, buf, {
    contentType: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/' + ext, upsert: true,
  });
  if (error) throw new Error('téléversement ' + rel + ' : ' + error.message);
  urls[rel] = sb.storage.from(BUCKET).getPublicUrl(nom).data.publicUrl;
  cache[sha] = urls[rel];
  televersees++;
}
if (ECRIRE && televersees) writeFileSync(CACHE_IMAGES, JSON.stringify(cache, null, 1), 'utf8');
console.log(citees.size + ' figure(s) citée(s), ' + televersees + ' nouvelle(s) au bucket.');

/* --------------------------------------------------- 3. mise à jour ------- */

const { data: series, error } = await sb.from('qcm_series')
  .select('id, label, qcm_questions(id, order_index, images, qcm_items(id, lettre, images))')
  .like('label', 'Annales - %');
if (error) throw new Error(error.message);

const memes = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
let nq = 0, ni = 0;
for (const s of series) {
  const att = attendu.get(s.label);
  if (!att) { console.log('⚠ en base mais absente des données : ' + s.label); continue; }
  for (const q of s.qcm_questions) {
    const cible = (att.questions[q.order_index] ?? []).map((p) => urls[p]);
    if (!memes(q.images ?? [], cible)) {
      nq++;
      console.log('── ' + s.label + ' · Q' + (q.order_index + 1) + ' : '
        + (q.images ?? []).length + ' → ' + cible.length + ' image(s)');
      if (ECRIRE) {
        const { error: e } = await sb.from('qcm_questions').update({ images: cible }).eq('id', q.id);
        if (e) throw new Error(s.label + ' Q' + (q.order_index + 1) + ' : ' + e.message);
      }
    }
    for (const it of q.qcm_items ?? []) {
      const c = (att.items.get(q.order_index + ':' + it.lettre) ?? []).map((p) => urls[p]);
      if (memes(it.images ?? [], c)) continue;
      ni++;
      console.log('── ' + s.label + ' · Q' + (q.order_index + 1) + it.lettre + ' : '
        + (it.images ?? []).length + ' → ' + c.length + ' image(s)');
      if (ECRIRE) {
        const { error: e } = await sb.from('qcm_items').update({ images: c }).eq('id', it.id);
        if (e) throw new Error(s.label + ' Q' + (q.order_index + 1) + it.lettre + ' : ' + e.message);
      }
    }
  }
}
console.log('\n' + nq + ' question(s) et ' + ni + ' proposition(s) à corriger'
  + (ECRIRE ? ' — mises à jour.' : ' — APERÇU (relancer avec --ecrire).'));
