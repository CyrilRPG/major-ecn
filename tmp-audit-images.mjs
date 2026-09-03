/**
 * AUDIT LECTURE SEULE — aucune écriture.
 * Compte, pour les cours MG concernés par l'extraction PDF, les séries et le
 * nombre d'images réellement rattachées aux questions (qcm_questions.images).
 * Usage : node tmp-audit-images.mjs
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const COURS = {
  'efc581a1-dcab-4a77-94c6-f6d3409ea0b1': 'GERIA',
  'f0a625f3-d080-42eb-955a-83bf8b65a764': 'PSY',
  '8bbac79d-efa8-40d2-ad2c-2eed47d6b1d6': 'ENDO',
};

const { data: series, error } = await sb.from('qcm_series')
  .select('id, cours_id, type, label, order_index, created_at')
  .in('cours_id', Object.keys(COURS))
  .order('cours_id').order('order_index');
if (error) throw new Error(error.message);

console.log(`${series.length} série(s) sur les 3 cours MG\n`);
let totImg = 0;
for (const s of series) {
  const { data: qs, error: e2 } = await sb.from('qcm_questions')
    .select('id, images').eq('serie_id', s.id);
  if (e2) throw new Error(e2.message);
  const nImg = qs.reduce((n, q) => n + (Array.isArray(q.images) ? q.images.length : 0), 0);
  const qAvecImg = qs.filter((q) => Array.isArray(q.images) && q.images.length).length;
  totImg += nImg;
  console.log(
    `${COURS[s.cours_id].padEnd(5)} ${String(s.type).padEnd(7)} ${String(s.label).slice(0, 52).padEnd(54)} ` +
    `${String(qs.length).padStart(3)} q  ${String(nImg).padStart(3)} img (${qAvecImg} q illustrées)  ${s.created_at?.slice(0, 16) ?? ''}`
  );
}
console.log(`\nTOTAL images rattachées : ${totImg}`);
