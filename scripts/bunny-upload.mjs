/**
 * Upload de vidéos vers Bunny Stream (library configurée dans .env.local).
 *
 * Usage :
 *   node scripts/bunny-upload.mjs <fichier.mp4> "<titre>"
 *   node scripts/bunny-upload.mjs --manifest <manifest.json>
 *
 * Le manifeste est un tableau [{ "file": "...", "title": "..." }, ...].
 * Idempotent : si une vidéo du même titre existe déjà dans la librairie, elle
 * est réutilisée au lieu d'être remontée (les fichiers font 300 à 800 Mo).
 *
 * Écrit sur stdout une ligne JSON par vidéo : { title, guid, status, skipped }.
 */
import { createReadStream, readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { dirname, basename, join } from 'node:path';
import { Readable } from 'node:stream';

function env() {
  const raw = readFileSync('.env.local', 'utf8');
  const out = {};
  for (const line of raw.split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) out[m[1]] = m[2].trim();
  }
  const libraryId = out.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = out.BUNNY_STREAM_API_KEY;
  if (!libraryId || !apiKey) throw new Error('BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY absents de .env.local');
  return { libraryId, apiKey };
}

// macOS écrit les accents en NFD : on retrouve le fichier par nom normalisé.
function resolvePath(p) {
  if (existsSync(p)) return p;
  const dir = dirname(p);
  const want = basename(p).normalize('NFC');
  const hit = readdirSync(dir).find((f) => f.normalize('NFC') === want);
  if (!hit) throw new Error(`Introuvable : ${p}`);
  return join(dir, hit);
}

const { libraryId, apiKey } = env();
const API = `https://video.bunnycdn.com/library/${libraryId}`;
const H = { AccessKey: apiKey, accept: 'application/json' };

async function listVideos() {
  const out = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`${API}/videos?page=${page}&itemsPerPage=100`, { headers: H });
    if (!r.ok) throw new Error(`list ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    out.push(...(j.items ?? []));
    if (out.length >= (j.totalItems ?? 0) || !(j.items ?? []).length) break;
  }
  return out;
}

async function deleteVideo(guid) {
  const r = await fetch(`${API}/videos/${guid}`, { method: 'DELETE', headers: H });
  if (!r.ok) throw new Error(`delete ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

async function createVideo(title) {
  const r = await fetch(`${API}/videos`, {
    method: 'POST',
    headers: { ...H, 'content-type': 'application/json' },
    body: JSON.stringify({ title: title.slice(0, 200) }),
  });
  if (!r.ok) throw new Error(`create ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).guid;
}

async function uploadVideo(guid, file) {
  const size = statSync(file).size;
  const r = await fetch(`${API}/videos/${guid}`, {
    method: 'PUT',
    headers: { ...H, 'content-type': 'application/octet-stream', 'content-length': String(size) },
    body: Readable.toWeb(createReadStream(file)),
    duplex: 'half',
  });
  if (!r.ok) throw new Error(`upload ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

/** Les coupures réseau (ECONNRESET) sont fréquentes sur des PUT de 400 Mo. */
async function uploadWithRetry(guid, file, tries = 4) {
  for (let n = 1; ; n++) {
    try {
      await uploadVideo(guid, file);
      return;
    } catch (e) {
      if (n >= tries) throw e;
      const wait = 5000 * n;
      console.error(`  ! ${e.message ?? e} — reprise ${n}/${tries - 1} dans ${wait / 1000} s`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

const args = process.argv.slice(2);
let jobs;
if (args[0] === '--manifest') {
  jobs = JSON.parse(readFileSync(args[1], 'utf8'));
} else {
  jobs = [{ file: args[0], title: args[1] ?? basename(args[0]) }];
}

const existing = await listVideos();
const byTitle = new Map(existing.map((v) => [v.title.trim(), v]));

// Statuts Bunny : 0 Created (vide), 1 Uploaded, 2 Processing, 3 Transcoding,
// 4 Finished, 5 Error, 6 UploadFailed.
// Les octets sont déjà chez Bunny dès le statut 1 — inutile (et refusé : « The
// video has already been uploaded ») de remonter une vidéo en cours d'encodage.
// On ne remonte donc que les coquilles vides et les échecs.
const UPLOADED = new Set([1, 2, 3, 4]);
const REUPLOAD = new Set([0, 5, 6]);
let failures = 0;

for (const job of jobs) {
  const title = job.title.trim();
  // Tout le traitement d'une vidéo est isolé : une coupure réseau (DNS, reset)
  // ne doit jamais interrompre la boucle et priver les suivantes de leur tour.
  try {
    const file = resolvePath(job.file);
    const already = byTitle.get(title);
    if (already && UPLOADED.has(already.status)) {
      console.log(JSON.stringify({ title, guid: already.guid, status: already.status, skipped: true }));
      continue;
    }
    // Une vidéo en échec (0/5/6) ne peut PAS être re-PUT : Bunny répond « The
    // video has already been uploaded ». On supprime la coquille et on recrée.
    if (already) {
      console.error(`  ↺ ${title} : statut ${already.status} — suppression et recréation`);
      await deleteVideo(already.guid);
    }
    const mb = (statSync(file).size / 1024 / 1024).toFixed(0);
    const guid = await createVideo(title);
    console.error(`→ ${title} (${mb} Mo)…`);
    const t0 = Date.now();
    await uploadWithRetry(guid, file);
    console.error(`  ok en ${Math.round((Date.now() - t0) / 1000)} s`);
    console.log(JSON.stringify({ title, guid, status: 'uploaded', skipped: false }));
  } catch (e) {
    failures++;
    console.error(`  ÉCHEC : ${e.message ?? e}`);
    console.log(JSON.stringify({ title, status: 'failed', error: String(e.message ?? e) }));
  }
}

if (failures) {
  console.error(`\n${failures} échec(s) — relancer la même commande reprendra où ça s'est arrêté.`);
  process.exit(1);
}
