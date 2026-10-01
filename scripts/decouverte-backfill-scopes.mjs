/**
 * Offre Découverte par spécialité (01/10/2026) : pose
 * `permission_scope.decouverte_cours` (item de la spécialité + Méthodologie EVC)
 * sur les comptes découverte EXISTANTS dont la spécialité choisie à
 * l'inscription a un item dédié (cf. src/lib/decouverte/items-specialite.ts —
 * table recopiée ci-dessous, à garder alignée).
 *
 * Ne touche QUE les élèves encore en découverte : `offer = 'decouverte'`, collège
 * `col-decouverte` dans le scope, aucune formule payée. Le reste du scope est
 * conservé tel quel. Les comptes sans item dédié (Médecine générale, autres
 * spécialités) ne sont pas modifiés : sans la clé, ils voient « Pneumologie » et
 * « Méthodologie EVC », comme avant.
 *
 * Sauvegarde JSON des scopes AVANT modification (--sauvegarde <fichier>).
 * Idempotent.
 *
 * Usage : node scripts/decouverte-backfill-scopes.mjs --sauvegarde <fichier.json> [--ecrire]
 *         (sans --ecrire : simulation)
 */
import fs from 'node:fs';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local', quiet: true });

const ECRIRE = process.argv.includes('--ecrire');
const iSauv = process.argv.indexOf('--sauvegarde');
const SAUVEGARDE = iSauv > 0 ? process.argv[iSauv + 1] : null;
if (!SAUVEGARDE) throw new Error('--sauvegarde <fichier.json> obligatoire');

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const METHODOLOGIE = '6b321ef6-ef8a-4174-945a-1e1c60f22c5d';
/** Miroir de ITEMS_DECOUVERTE_SPECIALITE (src/lib/decouverte/items-specialite.ts). */
const ITEMS = [
  { coursId: '4ac2c596-1923-5622-81ce-91908b027495', libelles: ['Pédiatrie'] },
  { coursId: 'bc0b14cc-c696-5e4c-a31d-0f6b1c939f5e', libelles: ['Gynécologie obstétrique', 'Gynécologie-obstétrique', 'Gynécologie médicale'] },
  { coursId: '292a0f27-87e6-5bc2-bd96-6fc341c55cca', libelles: ['Médecine d’urgence', "Médecine d'urgence"] },
];
const norm = (s) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
function coursPour(spe) {
  if (!spe) return null;
  const it = ITEMS.find((i) => i.libelles.some((l) => norm(l) === norm(spe)));
  return it ? [it.coursId, METHODOLOGIE] : null;
}

// Lecture paginée (plafond PostgREST de 1 000 lignes).
const profils = [];
for (let debut = 0; ; debut += 1000) {
  const { data, error } = await db.from('profiles')
    .select('id, email, role, permission_scope')
    .eq('role', 'student')
    .contains('permission_scope', { colleges: ['col-decouverte'] })
    .order('id').range(debut, debut + 999);
  if (error) throw new Error(error.message);
  profils.push(...data);
  if (data.length < 1000) break;
}

const cibles = [];
for (const p of profils) {
  const s = p.permission_scope ?? {};
  if (s.offer !== 'decouverte' || s.paid_formule || s.type !== 'college') continue;
  const spe = (typeof s.signup?.specialty === 'string' && s.signup.specialty.trim()) ? s.signup.specialty : s.specialty_wish;
  const cours = coursPour(typeof spe === 'string' ? spe : null);
  if (!cours) continue;
  const actuel = Array.isArray(s.decouverte_cours) ? s.decouverte_cours : null;
  if (actuel && actuel.length === cours.length && cours.every((c) => actuel.includes(c))) continue;
  cibles.push({ id: p.id, email: p.email, specialite: spe, avant: s, apres: { ...s, decouverte_cours: cours } });
}

console.log(`${profils.length} élèves portent le collège Découverte ; ${cibles.length} compte(s) découverte à mettre à jour.`);
const parSpe = {};
for (const c of cibles) parSpe[c.specialite] = (parSpe[c.specialite] ?? 0) + 1;
console.table(parSpe);

fs.writeFileSync(SAUVEGARDE, JSON.stringify(cibles.map((c) => ({ id: c.id, email: c.email, permission_scope: c.avant })), null, 2));
console.log(`Sauvegarde des scopes d'origine : ${SAUVEGARDE}`);

if (!ECRIRE) {
  console.log('Simulation : relancer avec --ecrire pour appliquer.');
} else {
  let ok = 0;
  for (const c of cibles) {
    const { error } = await db.from('profiles').update({ permission_scope: c.apres }).eq('id', c.id);
    if (error) console.error(`${c.email} : ${error.message}`);
    else ok += 1;
  }
  console.log(`${ok}/${cibles.length} scopes mis à jour.`);
}
