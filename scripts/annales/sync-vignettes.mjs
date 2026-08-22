/**
 * Aligne `qcm_series.vignette` en base sur la valeur des fichiers de données.
 *
 * Sert après une retouche éditoriale des vignettes : `publier.mjs --force`
 * supprimerait puis recréerait les questions, ce qui effacerait par cascade les
 * tentatives déjà enregistrées par les élèves. Ici on ne touche qu'au champ.
 *
 * Usage : node scripts/annales/sync-vignettes.mjs [--ecrire]
 */
import { readFileSync, readdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { charger } from './charger.mjs';

const APPLIQUER = process.argv.includes('--ecrire');
const env = {};
for (const ligne of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = ligne.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const attendu = new Map();
// Chargement PAR DOSSIER : c'est la seule forme qui normalise les fichiers
// "une série à plat" (sans tableau `series`).
for (const col of readdirSync('scripts/annales/data')) {
  for (const s of charger('scripts/annales/data/' + col).series ?? []) attendu.set(s.label, s.vignette ?? null);
}

const { data: rows, error } = await sb.from('qcm_series').select('id, label, vignette').like('label', 'Annales - %');
if (error) throw new Error(error.message);

let ecarts = 0, inconnues = 0;
for (const r of rows) {
  if (!attendu.has(r.label)) { inconnues++; console.log('⚠ en base mais absente des données : ' + r.label); continue; }
  const cible = attendu.get(r.label);
  if ((r.vignette ?? null) === cible) continue;
  ecarts++;
  console.log('── ' + r.label);
  console.log('   base    : ' + String(r.vignette ?? '(vide)').replace(/\s+/g, ' ').slice(0, 110));
  console.log('   données : ' + String(cible ?? '(vide)').replace(/\s+/g, ' ').slice(0, 110));
  if (APPLIQUER) {
    const { error: e } = await sb.from('qcm_series').update({ vignette: cible }).eq('id', r.id);
    if (e) throw new Error(r.label + ' : ' + e.message);
  }
}
const manquantes = [...attendu.keys()].filter((l) => !rows.some((r) => r.label === l));
for (const l of manquantes) console.log('⚠ dans les données mais absente de la base : ' + l);
console.log('\n' + rows.length + ' série(s) en base, ' + ecarts + ' vignette(s) à corriger'
  + (APPLIQUER ? ' — mises à jour.' : ' — APERÇU (relancer avec --ecrire).')
  + (inconnues || manquantes.length ? '  [' + inconnues + ' orpheline(s) base, ' + manquantes.length + ' orpheline(s) données]' : ''));
