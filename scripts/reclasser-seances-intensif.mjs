/**
 * Reclasse en « Cours vidéo » les séances approfondies ouvertes à la Formule
 * Intensive.
 *
 * Règle demandée : une vidéo dont les permissions incluent `intensif` appartient
 * aux Cours vidéo, pas aux Séances approfondies — pour que les contenus
 * intensif et approfondi restent séparés.
 *
 * Les formules (`offers`) et les voies ne sont PAS touchées : seul le `type`
 * change. L'`order_index` est réattribué à la suite des cours vidéo déjà
 * présents dans l'item, en conservant l'ordre relatif d'origine.
 *
 * Lecture seule par défaut ; passer `--apply` pour écrire.
 *
 *   node scripts/reclasser-seances-intensif.mjs           (aperçu)
 *   node scripts/reclasser-seances-intensif.mjs --apply   (écriture)
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: toutes, error } = await sb
  .from('videos')
  .select('id, titre, type, offers, order_index, cours_id, cours:cours_id(titre)')
  .order('order_index', { ascending: true });
if (error) throw error;

const aDeplacer = toutes.filter(
  (v) => v.type === 'seance_approfondie' && (v.offers ?? []).includes('intensif'),
);
if (aDeplacer.length === 0) {
  console.log('Aucune séance approfondie ouverte à la Formule Intensive.');
  process.exit(0);
}

// Point de départ de la numérotation : après les cours vidéo déjà en place.
const departParCours = new Map();
for (const v of toutes) {
  if (v.type !== 'cours') continue;
  const max = departParCours.get(v.cours_id) ?? -1;
  if ((v.order_index ?? 0) > max) departParCours.set(v.cours_id, v.order_index ?? 0);
}

const parCours = new Map();
for (const v of aDeplacer) {
  if (!parCours.has(v.cours_id)) parCours.set(v.cours_id, []);
  parCours.get(v.cours_id).push(v);
}

let n = 0;
for (const [coursId, videos] of parCours) {
  let ordre = (departParCours.get(coursId) ?? -1) + 1;
  console.log(`\n${videos[0].cours?.titre ?? coursId} (${videos.length})`);
  for (const v of videos) {
    console.log(`  · ${v.titre} — ${JSON.stringify(v.offers)} → cours, position ${ordre + 1}`);
    if (APPLY) {
      const { error: upErr } = await sb
        .from('videos')
        .update({ type: 'cours', order_index: ordre })
        .eq('id', v.id);
      if (upErr) throw upErr;
    }
    ordre++;
    n++;
  }
}

console.log(`\n${n} vidéo(s) ${APPLY ? 'reclassées' : 'à reclasser (aperçu, rien écrit)'}.`);
