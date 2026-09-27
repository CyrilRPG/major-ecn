/**
 * Audit de TOUTE la plateforme : questions qui demandent d'exploiter un
 * document ou des résultats que l'élève ne voit nulle part.
 *
 * Voir src/lib/qcm/donnees-manquantes.ts pour la règle et son origine
 * (« Interprétez les gaz du sang » sans gaz, 26-27/09/2026).
 *
 * Lecture seule. Toutes les séries, toutes les questions, paginées par 1 000
 * (plafond PostgREST) ; les séries de questions isolées sont jugées question
 * par question, les autres comme un dossier servi entier.
 *
 * Usage : npx tsx scripts/audit-dossiers-incomplets.mts [--json chemin] [--visibles]
 *   --visibles : ignore les séries retirées aux élèves (allowed_offers = []).
 * Sort en erreur (code 1) s'il reste au moins une question incomplète visible.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { manquesDuDossier, texteBrut, type QuestionPourAudit } from '../src/lib/qcm/donnees-manquantes';
import { estSerieDeQuestionsIsolees } from '../src/lib/pedago/dossiers';

const env: Record<string, string> = {};
for (const ligne of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = ligne.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const args = process.argv.slice(2);
const cheminJson = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const visiblesSeules = args.includes('--visibles');

async function toutLire<T>(table: string, select: string): Promise<T[]> {
  const lignes: T[] = [];
  for (let debut = 0; ; debut += 1000) {
    const { data, error } = await sb.from(table).select(select).order('id').range(debut, debut + 999);
    if (error) throw new Error(`${table} : ${error.message}`);
    lignes.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) return lignes;
  }
}

type Serie = { id: string; label: string | null; vignette: string | null; type: string | null; cours_id: string; allowed_offers: string[] | null };
type Question = { id: string; serie_id: string; order_index: number; enonce: string | null; images: string[] | null; qcm_items: { images: string[] | null }[] };
type Cours = { id: string; titre: string | null };

const [series, questions, cours] = await Promise.all([
  toutLire<Serie>('qcm_series', 'id,label,vignette,type,cours_id,allowed_offers'),
  toutLire<Question>('qcm_questions', 'id,serie_id,order_index,enonce,images,qcm_items(images)'),
  toutLire<Cours>('cours', 'id,titre'),
]);
const titreCours = new Map(cours.map((c) => [c.id, c.titre ?? '']));
const parSerie = new Map<string, Question[]>();
for (const q of questions) {
  const liste = parSerie.get(q.serie_id) ?? [];
  liste.push(q);
  parSerie.set(q.serie_id, liste);
}

type Ligne = { serie_id: string; label: string; cours: string; retiree: boolean; question_id: string; rang: number; genre: string; objet: string; enonce: string };
const resultats: Ligne[] = [];
for (const s of series) {
  const retiree = Array.isArray(s.allowed_offers) && s.allowed_offers.length === 0;
  if (visiblesSeules && retiree) continue;
  const qs = (parSerie.get(s.id) ?? []).sort((a, b) => a.order_index - b.order_index);
  if (!qs.length) continue;
  const pourAudit: QuestionPourAudit[] = qs.map((q) => ({
    enonce: q.enonce,
    images: [...(q.images ?? []), ...(q.qcm_items ?? []).flatMap((it) => it.images ?? [])],
  }));
  const isolee = estSerieDeQuestionsIsolees({ label: s.label, vignette: s.vignette, type: s.type, nbQuestions: qs.length });
  const manques = isolee
    ? pourAudit.flatMap((q, i) => manquesDuDossier(null, [q]).map((m) => ({ ...m, index: i })))
    : manquesDuDossier(s.vignette, pourAudit);
  for (const m of manques) {
    resultats.push({
      serie_id: s.id, label: s.label ?? '', cours: titreCours.get(s.cours_id) ?? s.cours_id, retiree,
      question_id: qs[m.index].id, rang: m.index + 1, genre: m.genre, objet: m.objet,
      enonce: texteBrut(qs[m.index].enonce).replace(/\s+/g, ' ').trim().slice(0, 220),
    });
  }
}

const visibles = resultats.filter((r) => !r.retiree);
const parCours = new Map<string, number>();
for (const r of visibles) parCours.set(r.cours, (parCours.get(r.cours) ?? 0) + 1);
console.log(`${series.length} séries, ${questions.length} questions lues.`);
console.log(`${visibles.length} question(s) incomplète(s) visibles des élèves, dans ${new Set(visibles.map((r) => r.serie_id)).size} série(s) ; ${resultats.length - visibles.length} dans des séries retirées.`);
for (const [c, n] of [...parCours].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${c}`);
if (cheminJson) writeFileSync(cheminJson, JSON.stringify(resultats, null, 1));
process.exitCode = visibles.length ? 1 : 0;
