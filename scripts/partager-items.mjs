/**
 * Partage d'items entre collèges (migration 20261005220000_items_partages).
 *
 * Pour chaque partage déclaré dans PARTAGES : crée dans le collège d'accueil un
 * cours « jumeau » du cours source, le lie à la source par `partage_lier()` (qui
 * copie fiche, séries, questions, propositions et flashcards et jumelle chaque
 * ligne), puis rend le PDF de la fiche jumelle avec la couverture du collège
 * d'accueil. Ensuite, toute modification faite depuis l'un ou l'autre collège
 * est répercutée par les déclencheurs de la base : ce sont les mêmes items.
 *
 * Le jumeau est un vrai cours du collège d'accueil (`access_type = 'all'`) : les
 * élèves de ce collège le voient sans recevoir le moindre accès au collège
 * d'origine, et rien n'y nomme ce collège (couverture de fiche comprise).
 * `linked_to_cours_id` = source : le contenu n'est pas facturé deux fois
 * (`admin_facturation_lines()` dédoublonne sur ce lien).
 *
 * Identifiant du jumeau en UUID v5 (source + collège) : le script est
 * idempotent ; un partage déjà lié n'est pas recopié. Le collège d'accueil est
 * ensuite renuméroté : les nouveaux items prennent leur place alphabétique, les
 * items existants gardent leur ordre relatif, « Replays - Révisions » et
 * « Annales - … » restent en tête.
 *
 * Usage : node scripts/partager-items.mjs [--dry-run]
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';

dotenv({ path: '.env.local', quiet: true });
const DRY = process.argv.includes('--dry-run');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const NAMESPACE = 'c3f1a2d4-7b8e-4f90-a1b2-3c4d5e6f7a80';
const URGENCE = { matiere: 'col-mir', couverture: 'Médecine d’urgence' };

/**
 * [cours source, titre attendu de la source, titre dans le collège d'accueil,
 *  libellé de couverture de la source, collège d'accueil]
 * Demande du 05/10/2026 : items de pédiatrie dans la plateforme Médecine d'urgence.
 */
const PARTAGES = [
  ['ad025fd4-31ae-4820-9c51-5a1a82456eba', 'Bronchiolite aiguë du nourrisson', 'Bronchiolite aiguë du nourrisson', 'Pédiatrie', URGENCE],
  ['36c879ad-bbc1-4f39-98b9-908bb1cab7aa', 'Asthme', "Asthme de l'enfant", 'Pédiatrie', URGENCE],
  ['760d6aba-a8c4-4dd4-94e1-d766b75beb31', 'Mort inattendue du nourrisson', 'Mort inattendue du nourrisson', 'Pédiatrie', URGENCE],
  ['f07817fc-d2ff-4b41-a676-87d66f6aeaf2', 'Boiteries et infections ostéoarticulaires', "Boiteries et infections ostéoarticulaires de l'enfant", 'Pédiatrie', URGENCE],
  ['e7600508-72ec-4c3f-98ab-f95c0393b605', 'Douleurs abdominopelviennes', "Douleurs abdominales aiguës de l'enfant (invagination, appendicite, adénolymphite)", 'Pédiatrie', URGENCE],
  ['c19baab5-8262-4105-8567-e3c250b818f3', 'Éruptions fébriles', "Éruptions fébriles et viroses de l'enfant", 'Pédiatrie', URGENCE],
  ['ea56a82e-8508-4cb3-a462-c558ef334ef8', 'Fièvre aiguë', "Fièvre aiguë de l'enfant et du nourrisson", 'Pédiatrie', URGENCE],
  ['7d416042-6902-4d7e-b92c-4d86e78f7bb2', 'Convulsions, crises d’épilepsie, épilepsie', "Convulsions et crises fébriles de l'enfant", 'Pédiatrie', URGENCE],
  ['92450a94-bff9-414f-bcf3-6e6033cbb858', 'Diabète de type 1 et de type 2', "Diabète de l'enfant", 'Pédiatrie', URGENCE],
  ['76c7dbc8-8639-45cc-9053-91e775ae9ec3', 'Diarrhée aiguë', "Gastro-entérite aiguë de l'enfant", 'Pédiatrie', URGENCE],
];

function uuidv5(nom) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const h = Buffer.from(createHash('sha1').update(Buffer.concat([ns, Buffer.from(nom, 'utf8')])).digest().subarray(0, 16));
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
const jumeauDe = (source, matiere) => uuidv5(`partage:${source}:${matiere}`);

async function ok(promesse, quoi) {
  const { data, error } = await promesse;
  if (error) throw new Error(`${quoi} : ${error.message}`);
  return data;
}

// ── 1. Contrôles ─────────────────────────────────────────────────────────────
const sources = await ok(db.from('cours')
  .select('id, matiere_id, titre, description, importance, hidden_blocks')
  .in('id', PARTAGES.map((p) => p[0])), 'lecture des sources');
for (const [id, titre] of PARTAGES) {
  const c = sources.find((s) => s.id === id);
  if (!c) throw new Error(`cours source ${id} introuvable`);
  if (c.titre !== titre) throw new Error(`cours ${id} : « ${c.titre} » ≠ « ${titre} » attendu`);
}
const dejaLies = new Set((await ok(db.from('cours_partages').select('cours_id'), 'cours_partages')).map((r) => r.cours_id));

// ── 2. Jumeaux : création, liaison, PDF ───────────────────────────────────
const crees = new Set();
for (const [sourceId, , titreJumeau, couvertureSource, accueil] of PARTAGES) {
  const source = sources.find((s) => s.id === sourceId);
  const jumeauId = jumeauDe(sourceId, accueil.matiere);
  const existe = await ok(db.from('cours').select('id, matiere_id').eq('id', jumeauId).maybeSingle(), 'jumeau');
  if (existe && existe.matiere_id !== accueil.matiere) throw new Error(`${jumeauId} existe hors de ${accueil.matiere}`);
  const homonyme = await ok(db.from('cours').select('id').eq('matiere_id', accueil.matiere).eq('titre', titreJumeau).neq('id', jumeauId), 'homonymes');
  if (homonyme.length) throw new Error(`« ${titreJumeau} » existe déjà dans ${accueil.matiere}`);

  console.log(`${dejaLies.has(jumeauId) ? '=' : '+'} ${titreJumeau}  ←  ${source.titre} [${source.matiere_id}]`);
  if (DRY) continue;

  if (!existe) {
    await ok(db.from('cours').insert({
      id: jumeauId, matiere_id: accueil.matiere, titre: titreJumeau, description: source.description,
      order_index: 9999, access_type: 'all', importance: source.importance, hidden_blocks: source.hidden_blocks,
      linked_to_cours_id: sourceId,
    }), `création ${titreJumeau}`);
    crees.add(jumeauId);
  }
  if (!dejaLies.has(jumeauId)) {
    const n = await ok(db.rpc('partage_lier', {
      p_source: sourceId, p_miroir: jumeauId,
      p_libelle_source: couvertureSource, p_libelle_miroir: accueil.couverture, p_exclure_series: null,
    }), `liaison ${titreJumeau}`);
    console.log(`    copié : ${JSON.stringify(n)}`);
    await rendreFichesJumeau(jumeauId, titreJumeau);
  }
}

/** Rend localement (Chrome) le PDF de chaque fiche du jumeau, couverture comprise. */
async function rendreFichesJumeau(coursId, titre) {
  const fiches = await ok(db.from('fiches').select('id, storage_path, content_html').eq('cours_id', coursId), 'fiches jumeau');
  for (const f of fiches) {
    if (!f.content_html) continue;
    const dossier = mkdtempSync(join(os.tmpdir(), 'partage-'));
    const corps = join(dossier, 'body.html');
    const pdf = join(dossier, 'fiche.pdf');
    writeFileSync(corps, f.content_html, 'utf8');
    execFileSync('node', ['scripts/render-mg-fiche.mjs', coursId, corps, titre, '--no-publish', '--pdf', pdf], { stdio: 'inherit' });
    const octets = readFileSync(pdf);
    const pages = (await PDFDocument.load(octets)).getPageCount();
    const chemin = `${coursId}/fiche-${f.id.slice(0, 8)}.pdf`;
    const { error } = await db.storage.from('fiches').upload(chemin, octets, { contentType: 'application/pdf', upsert: true });
    if (error) throw new Error(`upload ${chemin} : ${error.message}`);
    await ok(db.rpc('partage_fiche_set_pdf', { p_fiche_id: f.id, p_storage_path: chemin, p_pages: pages }), 'set_pdf');
    console.log(`    fiche : ${chemin} (${pages} p.)`);
  }
}

// ── 3. Renumérotation des collèges d'accueil ─────────────────────────────────
const cle = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[œŒ]/g, 'oe').toLowerCase();
const enTete = (t) => t === 'Replays - Révisions' || /^Annales\b/.test(t);
for (const matiere of [...new Set(PARTAGES.map((p) => p[4].matiere))]) {
  const nouveaux = new Set(PARTAGES.filter((p) => p[4].matiere === matiere).map((p) => jumeauDe(p[0], matiere)));
  const cours = await ok(db.from('cours').select('id, titre, order_index').eq('matiere_id', matiere)
    .order('order_index').order('titre'), 'collège');
  const tete = cours.filter((c) => enTete(c.titre));
  const anciens = cours.filter((c) => !enTete(c.titre) && !nouveaux.has(c.id));
  const ordre = [...anciens];
  for (const n of cours.filter((c) => nouveaux.has(c.id)).sort((a, b) => cle(a.titre).localeCompare(cle(b.titre), 'fr'))) {
    const rang = ordre.findIndex((c) => !nouveaux.has(c.id) && cle(c.titre).localeCompare(cle(n.titre), 'fr') > 0);
    ordre.splice(rang < 0 ? ordre.length : rang, 0, n);
  }
  const final = [...tete.map((c) => ({ ...c, nouveau: 0 })), ...ordre.map((c, i) => ({ ...c, nouveau: i + 1 }))];
  const deplaces = final.filter((c) => c.order_index !== c.nouveau);
  if (!DRY) for (const c of deplaces) await ok(db.from('cours').update({ order_index: c.nouveau }).eq('id', c.id), 'renumérotation');
  console.log(`\n${matiere} : ${final.length} items, ${deplaces.length} renumérotés`);
  for (const c of final) console.log(`  ${String(c.nouveau).padStart(2)} ${nouveaux.has(c.id) ? '+' : ' '} ${c.titre}`);
}
console.log(DRY ? '\n--dry-run : aucune écriture.' : `\nTerminé (${crees.size} cours créés).`);
