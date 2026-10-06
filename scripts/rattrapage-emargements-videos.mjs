/**
 * Rattrapage des émargements vidéo (05/10/2026).
 *
 * Toute vidéo visionnée doit avoir sa feuille d'émargement. Les vidéos marquées
 * vues (`course_progress.video_watched`, lecteur à 80 % ou « Marquer comme
 * terminé ») sans AUCUNE feuille vidéo reçoivent une ligne « émargement dû »
 * dans `course_attendances` : l'élève la signera à sa prochaine connexion
 * (fenêtre EmargementsEnAttente du layout élève). Côté admin, la feuille est
 * datée du visionnage (`watched_at`), pas de la signature : à défaut de trace
 * du lecteur, la dernière visite de l'item (`course_progress.last_seen_at`),
 * relevée ici car la signature l'écrase.
 *
 * Élèves seulement. Idempotent (une feuille existante, signée ou non, n'est
 * jamais touchée). Simulation par défaut ; `--apply` pour écrire.
 *
 *   node scripts/rattrapage-emargements-videos.mjs [--apply]
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local', quiet: true });
const appliquer = process.argv.includes('--apply');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function tout(table, select, filtre = (q) => q) {
  const out = [];
  for (let o = 0; ; o += 1000) {
    const { data, error } = await filtre(s.from(table).select(select)).range(o, o + 999);
    if (error) throw new Error(`${table} : ${error.message}`);
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

const eleves = new Set((await tout('profiles', 'id, role', (q) => q.eq('role', 'student'))).map((p) => p.id));
const feuilles = new Set((await tout('course_attendances', 'user_id, cours_id, kind', (q) => q.eq('kind', 'video')))
  .map((a) => `${a.user_id}|${a.cours_id}`));
const vues = (await tout('course_progress', 'user_id, cours_id, last_seen_at', (q) => q.eq('video_watched', true)))
  .filter((r) => eleves.has(r.user_id) && !feuilles.has(`${r.user_id}|${r.cours_id}`));

const coursIds = [...new Set(vues.map((r) => r.cours_id))];
const cours = new Map();
for (let i = 0; i < coursIds.length; i += 100) {
  const { data, error } = await s.from('cours').select('id, titre, matiere_id').in('id', coursIds.slice(i, i + 100));
  if (error) throw new Error(`cours : ${error.message}`);
  for (const c of data) cours.set(c.id, c);
}

const lignes = vues.filter((r) => cours.has(r.cours_id)).map((r) => ({
  user_id: r.user_id,
  cours_id: r.cours_id,
  kind: 'video',
  cours_titre: cours.get(r.cours_id).titre,
  matiere_id: cours.get(r.cours_id).matiere_id,
  watched_at: r.last_seen_at,
  user_agent: 'rattrapage — vidéo marquée vue sans feuille d’émargement',
}));
console.log(`${lignes.length} feuille(s) due(s) à créer pour ${new Set(lignes.map((l) => l.user_id)).size} élève(s)`
  + ` (${vues.length - lignes.length} ignorée(s) : cours supprimé)`);
for (const l of lignes) console.log(`  ${l.user_id.slice(0, 8)}  ${l.matiere_id ?? '—'}  ${l.cours_titre}`);

if (!appliquer) { console.log('\n— simulation : relancer avec --apply pour écrire —'); process.exit(0); }
let ok = 0;
for (const l of lignes) {
  const { error } = await s.from('course_attendances').insert(l);
  if (error && !/duplicate|23505/i.test(`${error.code} ${error.message}`)) console.log(`✗ ${l.user_id} ${l.cours_id} : ${error.message}`);
  else ok += 1;
}
console.log(`✔ ${ok}/${lignes.length} feuille(s) créée(s)`);
