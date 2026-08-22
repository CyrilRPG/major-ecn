/**
 * Contrôle bloquant d'un jeu d'annales, avant et après publication.
 *
 * Deux volets :
 *  - `--data <fichier>` : structure (énoncés, réponses, propositions) et surtout
 *    PARITÉ DES FIGURES — chaque figure extraite d'un corrigé doit être citée
 *    par une question ou une proposition, ou déclarée ignorée avec un motif.
 *    C'est la garantie « aucune image du sujet ou du corrigé n'est omise ».
 *  - `--db` : la base reflète bien le fichier de données (séries, questions,
 *    propositions, URL d'images non vides).
 *
 * Usage :
 *   node scripts/annales/audit.mjs --data scripts/annales/data/orthopedie.json [--db]
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { ATELIER } from './extraire.mjs';
import { charger } from './charger.mjs';
import { loadImage } from '@napi-rs/canvas';
import { estCaptureEcran } from './recadrer.mjs';

const arg = (nom) => process.argv.includes(nom) ? process.argv[process.argv.indexOf(nom) + 1] : null;
const dataPath = arg('--data');
if (!dataPath) throw new Error('Usage : --data scripts/annales/data/<college>.json [--db]');
const data = charger(dataPath);

const anomalies = [];
const ko = (ou, quoi) => anomalies.push(ou + ' — ' + quoi);
const vide = (s) => !s || !String(s).replace(/<[^>]*>/g, '').trim();

// ------------------------------------------------------------ 1. structure
const labels = new Set();
for (const s of data.series) {
  const ou = s.label;
  if (labels.has(s.label)) ko(ou, 'libellé de série en double');
  labels.add(s.label);
  if (!/^Annales - .+ - (19|20)\d{2} - EVC[FP]/.test(s.label)) {
    ko(ou, 'libellé hors convention « Annales - <Collège> - <Année> - <Type> »');
  }
  if (!s.questions?.length) ko(ou, 'série sans question');
  if (s.vignette !== undefined && s.vignette !== null && vide(s.vignette)) ko(ou, 'vignette présente mais vide');

  const formats = new Set(s.questions.map((q) => q.format));
  if (formats.size > 1) {
    // Le `kind` de la série — donc la voie qui y a accès — est déduit des
    // formats : mélanger QCM et QROC rendrait la série QROC pour tout le monde.
    ko(ou, 'formats mélangés (' + [...formats].join(', ') + ') : une série = un seul format');
  }

  s.questions.forEach((q, i) => {
    const oq = ou + ' / Q' + (i + 1);
    if (vide(q.enonce)) ko(oq, 'énoncé vide');
    if (q.format !== 'qcm' && q.format !== 'qroc') ko(oq, 'format invalide : ' + q.format);
    if (q.format === 'qcm') {
      const items = q.items ?? [];
      if (items.length < 2) ko(oq, 'QCM avec moins de 2 propositions');
      if (!items.some((it) => it.isCorrect)) ko(oq, 'QCM sans aucune proposition juste');
      const lettres = items.map((it) => it.lettre);
      if (new Set(lettres).size !== lettres.length) ko(oq, 'lettres en double');
      for (const it of items) {
        if (!/^[A-E]$/.test(it.lettre)) ko(oq, 'lettre invalide : ' + it.lettre);
        if (vide(it.enonce)) ko(oq + ' / ' + it.lettre, 'proposition vide');
        if (vide(it.justification)) ko(oq + ' / ' + it.lettre, 'justification manquante');
      }
    } else {
      if (vide(q.reponseAttendue) && vide(q.correctionGenerale)) {
        ko(oq, 'QROC sans réponse attendue ni correction');
      }
      if ((q.items ?? []).length) ko(oq, 'QROC porteur de propositions QCM');
    }
  });
}

// ------------------------------------------------- 2. parité des figures
const citeesParSource = new Map();
for (const s of data.series) {
  const src = s.source;
  const set = citeesParSource.get(src) ?? new Set();
  for (const q of s.questions) {
    for (const img of q.images ?? []) set.add(img);
    for (const it of q.items ?? []) for (const img of it.images ?? []) set.add(img);
  }
  citeesParSource.set(src, set);
}

for (const [src, citees] of citeesParSource) {
  const info = (data.sources ?? {})[src];
  if (!info?.atelier) { ko(src, 'source sans dossier d’atelier déclaré dans `sources`'); continue; }
  const fj = join(ATELIER, info.atelier, 'figures.json');
  if (!existsSync(fj)) { ko(src, 'figures.json introuvable : ' + fj); continue; }
  const dispo = JSON.parse(readFileSync(fj, 'utf8')).figures;
  const ignorees = new Set(info.figuresIgnorees ? Object.keys(info.figuresIgnorees) : []);
  // Le recadrage écrit toujours du PNG : une figure `.jpg` recadrée est citée
  // sous `.png`. On rapproche donc les noms sans leur extension.
  const sansExt = (n) => n.replace(/\.\w+$/, '');
  const citeesNoms = new Set([...citees].map((p) => sansExt(p.split('/').pop())));

  for (const f of dispo) {
    if (citeesNoms.has(sansExt(f.fichier)) || ignorees.has(f.fichier)) continue;
    ko(src, 'figure extraite mais NI citée NI déclarée ignorée : ' + f.fichier + ' (page ' + f.page + ')');
  }
  for (const nom of ignorees) {
    if (!dispo.some((f) => f.fichier === nom)) ko(src, 'figure ignorée inconnue de figures.json : ' + nom);
    if (vide(info.figuresIgnorees[nom])) ko(src, 'figure ignorée sans motif : ' + nom);
  }
  for (const rel of citees) {
    if (!existsSync(join(ATELIER, rel))) ko(src, 'figure citée absente du disque : ' + rel);
  }

  // Aucune capture d'écran ne doit partir en ligne telle quelle : elle emporte
  // la barre d'onglets et ses favoris nominatifs, l'URL, la barre des tâches,
  // parfois une vignette webcam. Toute capture citée doit donc être recadrée,
  // ou explicitement déclarée sans recadrage nécessaire (planche scannée au
  // format d'un écran) via `recadrer.mjs --sans-recadrage`.
  const fRecadrages = join(ATELIER, info.atelier, 'figures', 'recadrages.json');
  const recadrages = existsSync(fRecadrages) ? JSON.parse(readFileSync(fRecadrages, 'utf8')) : {};
  for (const f of dispo) {
    if (!citeesNoms.has(sansExt(f.fichier))) continue;
    if (!(await estFormatEcran(join(ATELIER, info.atelier, 'figures', f.fichier)))) continue;
    if (!(f.fichier in recadrages)) {
      ko(src, 'capture d’écran citée sans recadrage ni dérogation : ' + f.fichier + ' (page ' + f.page + ')');
      continue;
    }
    const r = recadrages[f.fichier];
    // Recadrée : c'est la sortie recadrée qui doit être citée, pas l'originale.
    // `/figures/<nom>` = originale, `/figures/recadre/<nom>` = recadrée.
    if (r.sortie && [...citees].some((p) => p.endsWith('/figures/' + f.fichier))) {
      ko(src, 'capture recadrée mais c’est l’originale qui est citée : ' + f.fichier);
    }
  }
}

/** Une figure a-t-elle le gabarit d'une capture d'écran ? (miroir de recadrer.mjs) */
async function estFormatEcran(chemin) {
  if (!existsSync(chemin)) return false;
  try {
    const im = await loadImage(chemin);
    return estCaptureEcran(im.width, im.height);
  } catch { return false; }
}

// --------------------------------------------------------------- 3. base
if (process.argv.includes('--db')) {
  const env = {};
  for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { data: cours } = await sb.from('cours')
    .select('id').eq('matiere_id', data.collegeId).eq('titre', data.coursTitre).maybeSingle();
  if (!cours) ko(data.coursTitre, 'item introuvable en base');
  else {
    const { data: series } = await sb.from('qcm_series')
      .select('id, label, kind, annee, vignette, allowed_voies, qcm_questions(id, format, enonce, images, reponse_attendue, correction_generale, qcm_items(id, lettre, is_correct, justification, images))')
      .eq('cours_id', cours.id).like('label', 'Annales - %');
    const enBase = new Map((series ?? []).map((s) => [s.label, s]));
    for (const s of data.series) {
      const b = enBase.get(s.label);
      if (!b) { ko(s.label, 'série absente de la base'); continue; }
      if (b.qcm_questions.length !== s.questions.length) {
        ko(s.label, b.qcm_questions.length + ' question(s) en base pour ' + s.questions.length + ' attendues');
      }
      if (b.allowed_voies) ko(s.label, 'allowed_voies renseigné : masquerait la série aux élèves sans voie');
      const formatAttendu = s.questions[0]?.format;
      const kindAttendu = formatAttendu === 'qroc' ? 'qroc' : (s.vignette ? 'dp' : 'qcm');
      if (b.kind !== kindAttendu) ko(s.label, 'kind = ' + b.kind + ', attendu ' + kindAttendu);
      const imagesEnBase = b.qcm_questions.reduce((n, q) => n + (q.images?.length ?? 0)
        + q.qcm_items.reduce((m, it) => m + (it.images?.length ?? 0), 0), 0);
      const imagesAttendues = s.questions.reduce((n, q) => n + (q.images?.length ?? 0)
        + (q.items ?? []).reduce((m, it) => m + (it.images?.length ?? 0), 0), 0);
      if (imagesEnBase !== imagesAttendues) {
        ko(s.label, imagesEnBase + ' image(s) en base pour ' + imagesAttendues + ' attendues');
      }
      for (const q of b.qcm_questions) {
        for (const u of q.images ?? []) if (!/^https?:\/\//.test(u)) ko(s.label, 'URL d’image invalide : ' + u);
      }
    }
  }
}

// --------------------------------------------------------------- rapport
const nbQ = data.series.reduce((n, s) => n + s.questions.length, 0);
const nbI = data.series.reduce((n, s) => n + s.questions.reduce((m, q) => m + (q.items ?? []).length, 0), 0);
const nbImg = [...citeesParSource.values()].reduce((n, s) => n + s.size, 0);
console.log(data.nom + ' : ' + data.series.length + ' série(s), ' + nbQ + ' question(s), '
  + nbI + ' proposition(s), ' + nbImg + ' figure(s) citée(s).');
if (anomalies.length) {
  console.error('\n' + anomalies.length + ' anomalie(s) :');
  for (const a of anomalies) console.error('  ✗ ' + a);
  process.exit(1);
}
console.log('Audit OK — aucune anomalie.');
