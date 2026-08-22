/**
 * Audit APPROFONDI des annales publiées — ce que `audit.mjs` ne couvre pas.
 *
 * `audit.mjs` valide la structure des fichiers de données et la parité des
 * figures ; avec `--db`, il compare des COMPTEURS. Il ne dit pas si le texte
 * réellement stocké est le bon, ni si les images sont téléchargeables.
 *
 * Trois volets ici :
 *  1. BASE ↔ DONNÉES, champ par champ : énoncé, réponse attendue, correction,
 *     propositions, justifications, URL d'images et leur ORDRE, rattachement à
 *     l'item et au collège attendus, drapeaux d'accès (type, allowed_voies…).
 *  2. IMAGES EN LIGNE : chaque URL distincte est téléchargée, son SHA-1 comparé
 *     à celui du fichier local, son content-type et son poids vérifiés.
 *  3. QUALITÉ RÉDACTIONNELLE : pieds de page PAE Formation oubliés, mojibake,
 *     ligatures « ti » corrompues par l'extraction, marqueurs de page résiduels,
 *     balises HTML hors liste blanche, énoncés ou corrections trop courts,
 *     doublons d'énoncés dans une même série.
 *
 * Usage : node scripts/annales/audit-publie.mjs [--college pneumologie] [--sans-images]
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { ATELIER } from './extraire.mjs';
import { charger } from './charger.mjs';

const TOUS = ['anesthesie-reanimation', 'cardiologie', 'geriatrie', 'gynecologie', 'medecine-generale',
  'medecine-urgence', 'orthopedie', 'pediatrie', 'pneumologie', 'psychiatrie'];

const arg = (n) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null);
const COLLEGES = arg('--college') ? [arg('--college')] : TOUS;
const SANS_IMAGES = process.argv.includes('--sans-images');

const env = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const chemin = (p) => (isAbsolute(p) ? p : join(ATELIER, p));

const pb = [];
const ko = (grav, ou, quoi) => pb.push({ grav, ou, quoi });
const sansHtml = (s) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ');

// Motifs de non-qualité, tirés des incidents rencontrés pendant la production.
const PIEDS = /Rosa Bonheur|major-?\s*ec\s*n\s*\.fr|Toute reproduction|01\s*\.\s*47\s*\.\s*34|PAE Formation/i;
const MOJIBAKE = /Ã[©¨ªàâ®¯°±]|â€|ï¿½|�/;
const LIGATURES = /\bQues-on\b|\bpa&ent|\bfonc&on|\bges-on|[a-zéè]&[a-z]{2,}/i;
const MARQUEUR = /^\s*---\s*p\d+|=== PAGE \d+ ===|\(page sans texte|\(figure seule\)/i;
const BALISES_OK = new Set(['b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'br', 'span', 'img']);

const cache = JSON.parse(readFileSync('scripts/annales/images-publiees.json', 'utf8'));
const shaDe = (rel) => createHash('sha1').update(readFileSync(chemin(rel))).digest('hex');

// ---------------------------------------------------------------- 1. lecture
const attendu = new Map();
for (const c of COLLEGES) {
  const d = charger('scripts/annales/data/' + c);
  for (const s of d.series) {
    if (attendu.has(s.label)) ko('BLOQUANT', s.label, 'libellé de série utilisé par deux collèges');
    attendu.set(s.label, { college: d.nom, coursTitre: d.coursTitre, collegeId: d.collegeId, serie: s });
  }
}

// ------------------------------------------------- 2. qualité rédactionnelle
const urls = new Map(); // url -> { rel, sha }
let nbQ = 0, nbItems = 0, nbRefsImg = 0;
for (const [label, { college, serie }] of attendu) {
  const vus = new Map();
  serie.questions.forEach((q, i) => {
    nbQ++;
    const ou = college + ' / ' + label + ' / Q' + (i + 1);
    const champs = [['énoncé', q.enonce], ['réponse attendue', q.reponseAttendue], ['correction', q.correctionGenerale]];
    for (const it of q.items ?? []) {
      champs.push(['proposition ' + it.lettre, it.enonce], ['justification ' + it.lettre, it.justification]);
    }
    if (serie.vignette && i === 0) champs.push(['vignette', serie.vignette]);
    for (const [nom, v] of champs) {
      if (v == null) continue;
      const s = String(v);
      if (PIEDS.test(s)) ko('BLOQUANT', ou, 'pied de page PAE Formation dans la ' + nom);
      if (MOJIBAKE.test(s)) ko('BLOQUANT', ou, 'encodage cassé (mojibake) dans la ' + nom);
      if (LIGATURES.test(s)) ko('BLOQUANT', ou, 'ligature « ti » corrompue dans la ' + nom);
      if (MARQUEUR.test(s)) ko('BLOQUANT', ou, 'marqueur d’extraction résiduel dans la ' + nom);
      // Une balise n'existe que si « < » est COLLÉ à une lettre (ou à « / »).
      for (const m of s.matchAll(/<\/?([a-zA-Z][\w-]*)/g)) {
        if (!BALISES_OK.has(m[1].toLowerCase())) ko('BLOQUANT', ou, 'balise hors liste blanche <' + m[1] + '> dans la ' + nom);
      }
      // « < » de comparaison : c'est du texte, mais il a longtemps cassé le
      // rendu (cf. tests/rich-text.test.ts). On le signale pour surveillance.
      for (const _ of s.matchAll(/<\s+[a-zA-Z]/g)) ko('MINEUR', ou, '« < » de comparaison suivi d’une lettre dans la ' + nom);
      const o = (s.match(/<(b|strong|i|em|u|sub|sup|span)\b/gi) ?? []).length;
      const f = (s.match(/<\/(b|strong|i|em|u|sub|sup|span)\s*>/gi) ?? []).length;
      if (o !== f) ko('MAJEUR', ou, 'balises non équilibrées dans la ' + nom + ' (' + o + ' ouvertes / ' + f + ' fermées)');
    }
    const e = sansHtml(q.enonce).trim();
    if (e.length < 25) ko('MAJEUR', ou, 'énoncé très court (' + e.length + ' caractères)');
    const cle = e.replace(/\s+/g, ' ').toLowerCase();
    if (vus.has(cle)) ko('MAJEUR', ou, 'énoncé identique à la question ' + vus.get(cle) + ' de la même série');
    else vus.set(cle, i + 1);
    if (q.format === 'qroc') {
      const r = (sansHtml(q.reponseAttendue) + ' ' + sansHtml(q.correctionGenerale)).trim();
      if (r.length < 20) ko('MAJEUR', ou, 'correction QROC très courte (' + r.length + ' caractères)');
    } else {
      nbItems += (q.items ?? []).length;
      const j = (q.items ?? []).filter((it) => it.isCorrect).length;
      if (j === (q.items ?? []).length) ko('MINEUR', ou, 'QCM dont toutes les propositions sont justes');
      if (j === 0) ko('BLOQUANT', ou, 'QCM sans aucune proposition juste');
    }
    for (const img of [...(q.images ?? []), ...(q.items ?? []).flatMap((it) => it.images ?? [])]) {
      nbRefsImg++;
      if (!existsSync(chemin(img))) { ko('BLOQUANT', ou, 'figure absente du disque : ' + img); continue; }
      const sha = shaDe(img);
      const url = cache[sha];
      if (!url) ko('BLOQUANT', ou, 'figure jamais téléversée (absente du cache) : ' + img);
      else urls.set(url, { rel: img, sha });
    }
  });
}
console.log('Fichiers de données : ' + attendu.size + ' séries · ' + nbQ + ' questions · ' + nbItems
  + ' propositions · ' + nbRefsImg + ' références d’image (' + urls.size + ' fichiers distincts).');

// -------------------------------------------------------- 3. base ↔ données
const { data: enBase, error: e1 } = await sb.from('qcm_series')
  .select('id, label, type, kind, annee, vignette, cours_id, allowed_voies, allowed_offers, is_revisions, mg_series')
  .like('label', 'Annales - %');
if (e1) throw e1;
const { data: cours } = await sb.from('cours').select('id, titre, matiere_id')
  .in('id', [...new Set(enBase.map((s) => s.cours_id))]);
const coursParId = new Map(cours.map((c) => [c.id, c]));
const baseParLabel = new Map(enBase.map((s) => [s.label, s]));

if (COLLEGES.length === TOUS.length) {
  for (const l of baseParLabel.keys()) {
    if (!attendu.has(l)) ko('MAJEUR', l, 'série en base sans fichier de données correspondant');
  }
}

let nbQBase = 0, nbImgBase = 0;
for (const [label, { college, coursTitre, collegeId, serie }] of attendu) {
  const b = baseParLabel.get(label);
  if (!b) { ko('BLOQUANT', label, 'série absente de la base'); continue; }
  const c = coursParId.get(b.cours_id);
  if (!c) ko('BLOQUANT', label, 'item introuvable en base');
  else {
    if (c.titre !== coursTitre) ko('BLOQUANT', label, 'rattachée à « ' + c.titre + ' » au lieu de « ' + coursTitre + ' »');
    if (c.matiere_id !== collegeId) ko('BLOQUANT', label, 'collège ' + c.matiere_id + ' au lieu de ' + collegeId);
  }
  if (b.type !== 'qcm') ko('BLOQUANT', label, 'type = ' + b.type + ' au lieu de qcm');
  if (b.annee !== serie.annee) ko('MAJEUR', label, 'annee = ' + b.annee + ' au lieu de ' + serie.annee);
  if (b.allowed_voies) ko('BLOQUANT', label, 'allowed_voies renseigné : masquerait la série aux élèves sans voie');
  if (b.allowed_offers) ko('MAJEUR', label, 'allowed_offers renseigné');
  if ((serie.vignette ?? '') !== (b.vignette ?? '')) ko('MAJEUR', label, 'vignette différente de la source');
  const kindAttendu = serie.questions[0]?.format === 'qroc' ? 'qroc' : (serie.vignette ? 'dp' : 'qcm');
  if (b.kind !== kindAttendu) ko('MAJEUR', label, 'kind = ' + b.kind + ' au lieu de ' + kindAttendu);

  const { data: qs, error: e2 } = await sb.from('qcm_questions')
    .select('id, order_index, format, enonce, reponse_attendue, correction_generale, images, qcm_items(lettre, enonce, is_correct, justification, images)')
    .eq('serie_id', b.id).order('order_index');
  if (e2) throw e2;
  nbQBase += qs.length;
  if (qs.length !== serie.questions.length) {
    ko('BLOQUANT', label, qs.length + ' questions en base pour ' + serie.questions.length + ' attendues');
    continue;
  }
  serie.questions.forEach((q, i) => {
    const bq = qs[i];
    const ou = college + ' / ' + label + ' / Q' + (i + 1);
    if (bq.order_index !== i) ko('MAJEUR', ou, 'order_index = ' + bq.order_index + ' au lieu de ' + i);
    if (bq.format !== q.format) ko('BLOQUANT', ou, 'format = ' + bq.format + ' au lieu de ' + q.format);
    if (bq.enonce !== q.enonce) ko('BLOQUANT', ou, 'énoncé différent de la source');
    const rep = q.format === 'qcm'
      ? (q.items ?? []).filter((it) => it.isCorrect).map((it) => it.lettre).sort().join('')
      : (q.reponseAttendue ?? '');
    if ((bq.reponse_attendue ?? '') !== rep) ko('BLOQUANT', ou, 'réponse attendue différente de la source');
    if ((bq.correction_generale ?? null) !== (q.correctionGenerale ?? null)) ko('BLOQUANT', ou, 'correction différente de la source');

    const att = (q.images ?? []).map((p) => cache[shaDe(p)]);
    const got = bq.images ?? [];
    nbImgBase += got.length;
    if (got.length !== att.length) ko('BLOQUANT', ou, got.length + ' image(s) en base pour ' + att.length + ' attendue(s)');
    else att.forEach((u, k) => { if (got[k] !== u) ko('BLOQUANT', ou, 'image ' + (k + 1) + ' : URL ou ordre différent en base'); });

    const attIt = [...(q.items ?? [])].sort((a, z) => a.lettre.localeCompare(z.lettre));
    const gotIt = [...(bq.qcm_items ?? [])].sort((a, z) => a.lettre.localeCompare(z.lettre));
    if (gotIt.length !== attIt.length) ko('BLOQUANT', ou, gotIt.length + ' proposition(s) en base pour ' + attIt.length);
    else attIt.forEach((it, k) => {
      if (gotIt[k].lettre !== it.lettre) ko('BLOQUANT', ou, 'lettres de propositions différentes');
      if (gotIt[k].enonce !== it.enonce) ko('BLOQUANT', ou, 'proposition ' + it.lettre + ' différente de la source');
      if (gotIt[k].is_correct !== it.isCorrect) ko('BLOQUANT', ou, 'is_correct différent pour la proposition ' + it.lettre);
      if ((gotIt[k].justification ?? null) !== (it.justification ?? null)) ko('BLOQUANT', ou, 'justification ' + it.lettre + ' différente de la source');
      nbImgBase += (gotIt[k].images ?? []).length;
    });
  });
}
console.log('Base de données    : ' + baseParLabel.size + ' séries · ' + nbQBase + ' questions · '
  + nbImgBase + ' références d’image.');

// ------------------------------------------------------- 4. images en ligne
if (!SANS_IMAGES) {
  const liste = [...urls.keys()];
  let ok = 0, octets = 0;
  const tailles = [];
  for (let i = 0; i < liste.length; i += 24) {
    await Promise.all(liste.slice(i, i + 24).map(async (url) => {
      const { rel, sha } = urls.get(url);
      try {
        // Le stockage renvoie des 5xx passagers quand on l'interroge en rafale :
        // on retente avant de conclure à une image manquante.
        let r = null;
        for (let essai = 0; essai < 3; essai++) {
          r = await fetch(url);
          if (r.ok || r.status < 500) break;
          await new Promise((res) => setTimeout(res, 400 * (essai + 1)));
        }
        if (!r.ok) return ko('BLOQUANT', rel, 'image inaccessible en ligne : HTTP ' + r.status + ' après 3 essais');
        const buf = Buffer.from(await r.arrayBuffer());
        if (createHash('sha1').update(buf).digest('hex') !== sha) {
          return ko('BLOQUANT', rel, 'le fichier en ligne diffère du fichier local (SHA-1)');
        }
        const ct = r.headers.get('content-type') ?? '';
        if (!/^image\//.test(ct)) ko('MAJEUR', rel, 'content-type inattendu en ligne : ' + ct);
        if (buf.length < 512) ko('MAJEUR', rel, 'image en ligne suspecte (' + buf.length + ' octets)');
        octets += buf.length; tailles.push(buf.length); ok++;
      } catch (e) { ko('BLOQUANT', rel, 'téléchargement impossible : ' + e.message); }
    }));
    if ((i + 24) % 240 === 0) process.stdout.write('   ' + Math.min(i + 24, liste.length) + '/' + liste.length + '\r');
  }
  tailles.sort((a, b) => a - b);
  console.log('Images en ligne    : ' + ok + '/' + liste.length + ' téléchargées et identiques au local · '
    + (octets / 1048576).toFixed(1) + ' Mo · médiane ' + (tailles[Math.floor(tailles.length / 2)] / 1024).toFixed(0) + ' Ko'
    + ' · max ' + (tailles.at(-1) / 1048576).toFixed(1) + ' Mo.');
}

// --------------------------------------------------------------- 5. rapport
const parGrav = { BLOQUANT: [], MAJEUR: [], MINEUR: [] };
for (const p of pb) parGrav[p.grav].push(p);
console.log('\n===================== RÉSULTAT =====================');
for (const g of ['BLOQUANT', 'MAJEUR', 'MINEUR']) {
  const l = parGrav[g];
  console.log(g + ' : ' + l.length);
  const agr = new Map();
  for (const p of l) {
    const k = p.quoi.replace(/\s*:.*$/, '').replace(/\(\d+[^)]*\)/, '(…)');
    (agr.get(k) ?? agr.set(k, []).get(k)).push(p);
  }
  for (const [k, v] of [...agr].sort((a, b) => b[1].length - a[1].length)) {
    console.log('   ' + String(v.length).padStart(4) + '× ' + k);
    for (const p of v.slice(0, 6)) console.log('        – ' + p.ou + (p.quoi.includes(':') ? ' → ' + p.quoi : ''));
    if (v.length > 6) console.log('        … et ' + (v.length - 6) + ' autre(s)');
  }
}
if (parGrav.BLOQUANT.length === 0 && parGrav.MAJEUR.length === 0) {
  console.log('\nAucune anomalie bloquante ni majeure.');
}
