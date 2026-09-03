/**
 * Upload des figures des QCM « Entraînement » d'endocrinologie dans le bucket
 * public `qcm-images`, puis écriture du mapping fichier local -> URL publique.
 *
 * À la racine du projet (et non dans le scratchpad) pour que @supabase/supabase-js
 * soit résolu. Le MCP Supabase ne peut pas uploader de binaire.
 *
 * Usage : node upload-endo-qcm-images.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SCRATCH = 'C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin-Desktop-Major-ecn-projects/0ebfa447-4e7a-4639-829c-ef74cc6400cb/scratchpad';
const GEO = join(SCRATCH, 'extraits_geo');
const BUCKET = 'qcm-images';

// --- .env.local parsé à la main ---
const env = {};
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans .env.local');
const sb = createClient(url, key, { auth: { persistSession: false } });

const plan = JSON.parse(readFileSync(join(SCRATCH, 'plan.json'), 'utf8'));

// --- collecte des fichiers, dédupliqués par SHA-1 du contenu ---
const bySha = new Map(); // sha -> { path, uuid, url }
const pathToSha = new Map();
for (const serie of plan) {
  for (const q of serie.questions) {
    for (const rel of q.images) {
      const p = join(GEO, serie.geo, rel);
      if (pathToSha.has(p)) continue;
      if (!existsSync(p)) throw new Error('introuvable : ' + p);
      const buf = readFileSync(p);
      const sha = createHash('sha1').update(buf).digest('hex');
      pathToSha.set(p, sha);
      if (!bySha.has(sha)) bySha.set(sha, { path: p, buf, uuid: randomUUID() });
    }
  }
}
console.log(`${pathToSha.size} fichiers référencés, ${bySha.size} images distinctes (dédup SHA-1)`);

// --- upload ---
let ok = 0, fail = 0;
for (const [sha, rec] of bySha) {
  const name = `${rec.uuid}.png`;
  const { error } = await sb.storage.from(BUCKET).upload(name, rec.buf, {
    contentType: 'image/png', upsert: true,
  });
  if (error) { console.error('ÉCHEC ' + name + ' : ' + error.message); fail++; continue; }
  rec.url = sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  ok++;
  if (ok % 20 === 0) console.log('  ' + ok + '/' + bySha.size);
}
console.log(`upload : ${ok} ok, ${fail} échecs`);
if (fail) process.exit(1);

// --- mapping chemin local -> URL publique ---
const map = {};
for (const [p, sha] of pathToSha) map[p.replace(/\\/g, '/')] = bySha.get(sha).url;
writeFileSync(join(SCRATCH, 'image-urls.json'), JSON.stringify(map, null, 1), 'utf8');
console.log('mapping écrit -> image-urls.json (' + Object.keys(map).length + ' entrées)');
