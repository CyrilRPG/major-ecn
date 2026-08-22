/**
 * « Toutes les annales sont-elles réellement FAISABLES par un élève ? »
 *
 * Les autres audits contrôlent la fidélité au corpus (`audit.mjs`,
 * `audit-sujets.mjs`) et la conformité de la base aux fichiers de données
 * (`audit-publie.mjs`). Celui-ci se place du côté de l'élève et refait, série
 * par série, le chemin qu'il parcourt :
 *
 *   1. l'item d'accueil existe et est rattaché à un collège de la faculté ;
 *   2. la série est LISIBLE par tous les profils d'élève plausibles — la règle
 *      d'accès est importée depuis `qcm-access-rules.ts`, pas réécrite ici,
 *      pour qu'aucune divergence ne s'installe ;
 *   3. elle est ATTEIGNABLE dans la navigation par année de l'onglet DP · QI ;
 *   4. chaque question est RÉPONDABLE : énoncé, propositions, corrigé, images ;
 *   5. rien ne manque : effectifs base ↔ données, aucune série ni item orphelin.
 *
 * Usage : npx tsx scripts/annales/audit-realisable.mts [--college pneumologie]
 */
import { readFileSync, readdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { canStudentReadSerie, type QcmAccessContext, type SerieAccessRow } from '../../src/lib/data/qcm-access-rules';
import { estSerieAnnale, anneeDeSerieAnnale } from '../../src/lib/data/annales';
import { charger } from './charger.mjs';

const arg = (n: string) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
const college = arg('--college');

const env: Record<string, string> = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const anomalies: string[] = [];
const ko = (ou: string, quoi: string) => anomalies.push(ou + ' — ' + quoi);
const texte = (s: unknown) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/* ------------------------------------------------- 1. état attendu -------- */

type QData = {
  format: string; enonce: string; images?: string[];
  reponseAttendue?: string; correctionGenerale?: string;
  items?: { lettre: string; enonce: string; isCorrect?: boolean; justification?: string; images?: string[] }[];
};
type SData = { label: string; annee: number; questions: QData[] };

const attendu = new Map<string, { college: string; serie: SData }>();
for (const col of readdirSync('scripts/annales/data')) {
  if (college && col !== college) continue;
  for (const s of (charger('scripts/annales/data/' + col).series ?? []) as SData[]) {
    if (attendu.has(s.label)) ko(s.label, 'libellé de série en double dans les données');
    attendu.set(s.label, { college: col, serie: s });
  }
}

/* ------------------------------------------------------ 2. la base ------- */

type Row = SerieAccessRow & {
  annee: number | null; order_index: number; cours_id: string;
  vignette: string | null;
  cours: { id: string; titre: string; matiere_id: string; matieres: { id: string; nom: string; semestre_id: string } } | null;
  qcm_questions: {
    id: string; order_index: number; format: string; enonce: string;
    reponse_attendue: string | null; correction_generale: string | null; images: string[] | null;
    qcm_items: { lettre: string; enonce: string; is_correct: boolean; justification: string | null; images: string[] | null }[];
  }[];
};

const { data, error } = await sb.from('qcm_series')
  .select('id, label, type, kind, allowed_voies, allowed_offers, mg_series, is_revisions, annee, order_index, cours_id, vignette,'
    + ' cours(id, titre, matiere_id, matieres(id, nom, semestre_id)),'
    + ' qcm_questions(id, order_index, format, enonce, reponse_attendue, correction_generale, images,'
    + ' qcm_items(lettre, enonce, is_correct, justification, images))')
  .like('label', 'Annales - %');
if (error) throw new Error(error.message);
const series = (data ?? []) as unknown as Row[];
const suivies = series.filter((s) => !college || attendu.has(s.label));

/* ------------------------- 3. profils d'élève à qui la série doit s'ouvrir */

const OFFRES = ['decouverte', 'essentiel', 'intensif', 'approfondi'];
const PROFILS: { nom: string; ctx: QcmAccessContext }[] = [];
for (const voie of ['interne', 'externe', null] as const) {
  for (const offre of OFFRES) {
    PROFILS.push({
      nom: (voie ?? 'sans voie') + ' / ' + offre,
      ctx: { isStaff: false, voie, offers: new Set([offre]), geriatrieMgBonus: false },
    });
  }
}
// Élève Gériatrie consultant les items bonus de Médecine générale.
PROFILS.push({
  nom: 'gériatrie (bonus MG) / intensif',
  ctx: { isStaff: false, voie: 'interne', offers: new Set(['intensif']), geriatrieMgBonus: true },
});

/* ------------------------------------------------------ 4. contrôles ----- */

const parCours = new Map<string, Row[]>();

for (const s of suivies) {
  const ou = s.label;
  const att = attendu.get(s.label);
  if (!att) { ko(ou, 'publiée mais absente des fichiers de données'); continue; }

  // (1) chemin d'accès
  if (!s.cours) { ko(ou, 'rattachée à un item inexistant (cours_id ' + s.cours_id + ')'); continue; }
  if (!s.cours.matieres) ko(ou, 'item « ' + s.cours.titre + ' » rattaché à un collège inexistant');
  parCours.set(s.cours_id, [...(parCours.get(s.cours_id) ?? []), s]);

  // (2) visibilité — la règle est celle de l'application, importée telle quelle
  const formats = s.qcm_questions.map((q) => q.format);
  const aveugles = PROFILS.filter((p) => !canStudentReadSerie(s, p.ctx, formats)).map((p) => p.nom);
  if (aveugles.length) ko(ou, 'invisible pour ' + aveugles.length + ' profil(s) : ' + aveugles.join(', '));

  // (3) navigation par année
  const an = anneeDeSerieAnnale(s);
  if (an === null) ko(ou, 'aucune année exploitable : la série n’apparaîtra sous aucune session');
  else {
    const dansLibelle = s.label.match(/\b((?:19|20)\d{2})\b/);
    if (dansLibelle && Number(dansLibelle[1]) !== an) {
      ko(ou, 'année incohérente : colonne ' + an + ', libellé ' + dansLibelle[1]);
    }
    if (att.serie.annee !== an) ko(ou, 'année en base (' + an + ') ≠ données (' + att.serie.annee + ')');
  }
  if (!estSerieAnnale(s.label)) ko(ou, 'libellé non reconnu comme annale par estSerieAnnale()');

  // (4) réalisabilité question par question
  if (s.qcm_questions.length === 0) { ko(ou, 'série sans aucune question : impossible à ouvrir'); continue; }
  if (s.qcm_questions.length !== att.serie.questions.length) {
    ko(ou, s.qcm_questions.length + ' question(s) en base pour ' + att.serie.questions.length + ' attendues');
  }
  const ordres = s.qcm_questions.map((q) => q.order_index).sort((a, b) => a - b);
  const attendus = ordres.map((_, i) => i);
  if (ordres.join() !== attendus.join()) ko(ou, 'order_index non continus : ' + ordres.join(', '));

  for (const q of [...s.qcm_questions].sort((a, b) => a.order_index - b.order_index)) {
    const oq = ou + ' / Q' + (q.order_index + 1);
    if (!texte(q.enonce)) ko(oq, 'énoncé vide : rien à lire pour l’élève');
    if (q.format !== 'qcm' && q.format !== 'qroc') { ko(oq, 'format inconnu : ' + q.format); continue; }
    if (q.format === 'qcm') {
      const items = q.qcm_items ?? [];
      if (items.length < 2) ko(oq, 'QCM avec ' + items.length + ' proposition(s) : non jouable');
      if (!items.some((it) => it.is_correct)) ko(oq, 'QCM sans proposition juste : aucune réponse possible');
      if (items.every((it) => it.is_correct) && items.length > 1) {
        // Toléré (certaines questions EVC le sont), mais on veut le savoir.
        ko(oq, 'INFO QCM dont toutes les propositions sont justes');
      }
      const lettres = items.map((it) => it.lettre);
      if (new Set(lettres).size !== lettres.length) ko(oq, 'lettres de proposition en double');
      for (const it of items) {
        if (!texte(it.enonce)) ko(oq + it.lettre, 'proposition sans énoncé');
        if (!texte(it.justification)) ko(oq + it.lettre, 'proposition sans justification : correction muette');
      }
    } else if (!texte(q.reponse_attendue) && !texte(q.correction_generale)) {
      ko(oq, 'QROC sans réponse attendue ni correction : non corrigeable');
    }
    for (const u of [...(q.images ?? []), ...(q.qcm_items ?? []).flatMap((it) => it.images ?? [])]) {
      if (!/^https:\/\/\S+$/.test(u)) ko(oq, 'URL d’image inexploitable : ' + u);
    }
  }
}

// (5) complétude
for (const [label, { college: col }] of attendu) {
  if (!series.some((s) => s.label === label)) ko(label, 'présente dans les données (' + col + ') mais PAS publiée');
}
for (const [coursId, lot] of parCours) {
  const titre = lot[0].cours!.titre;
  const annees = new Set(lot.map((s) => anneeDeSerieAnnale(s)).filter((a) => a !== null));
  if (annees.size === 0) ko(titre, 'item d’annales sans aucune session exploitable (' + coursId + ')');
}

/* --------------------------------------------------------- 5. rapport ---- */

const questions = suivies.reduce((n, s) => n + s.qcm_questions.length, 0);
const propositions = suivies.reduce((n, s) => n + s.qcm_questions.reduce((m, q) => m + (q.qcm_items?.length ?? 0), 0), 0);
const sessions = new Set(suivies.map((s) => (s.cours?.matiere_id ?? '?') + ':' + anneeDeSerieAnnale(s)));
console.log(suivies.length + ' annale(s) publiée(s) · ' + questions + ' questions · ' + propositions + ' propositions');
console.log(parCours.size + ' item(s) d’accueil · ' + sessions.size + ' session(s) (collège × année) · '
  + PROFILS.length + ' profil(s) d’élève testés');

const infos = anomalies.filter((a) => a.includes('INFO '));
const dures = anomalies.filter((a) => !a.includes('INFO '));
if (infos.length) console.log('\n' + infos.length + ' point(s) d’attention :\n  ' + infos.map((a) => a.replace('INFO ', '')).join('\n  '));
if (dures.length === 0) {
  console.log('\n✅ Toutes les annales sont ouvrables, visibles de tous les profils et jouables de bout en bout.');
} else {
  console.log('\n❌ ' + dures.length + ' anomalie(s) :\n  ' + dures.join('\n  '));
  process.exitCode = 1;
}
