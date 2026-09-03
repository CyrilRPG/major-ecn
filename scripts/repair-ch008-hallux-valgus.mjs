import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const chapterDir = resolve('../.corpus-orthopedie/hallux-valgus');
const snapshotPath = join(chapterDir, 'delivery', '2026-08-10T08-51-55-435Z', 'published-before-replacement', 'snapshot.json');
const out = join(chapterDir, 'delivery', 'quality-v2');
mkdirSync(out, { recursive: true });
const source = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const bySeries = new Map(); for (const q of source.questions) bySeries.set(q.serie_id, [...(bySeries.get(q.serie_id) ?? []), q]);
const byQuestion = new Map(); for (const i of source.items) byQuestion.set(i.question_id, [...(byQuestion.get(i.question_id) ?? []), i]);
const followup = '<p>Le patient est revu après l’intervention : un suivi clinique, podologique et radiographique est planifié pour apprécier l’alignement, la consolidation et la reprise de l’appui.</p>';
const series = source.series.map((serie) => {
  const isDp = /^DP\b/i.test(serie.label ?? '');
  return { label: serie.label, type: serie.type ?? 'qcm', kind: serie.kind ?? (isDp ? 'dp' : 'qcm'), order_index: serie.order_index,
    vignette: isDp ? `${serie.vignette ?? ''}${followup}` : null,
    questions: (bySeries.get(serie.id) ?? []).sort((a,b)=>a.order_index-b.order_index).map((q,index)=>({
      enonce: isDp && index > 0 && !/nouvel élément/i.test(q.enonce ?? '') ? `<p><em>Nouvel élément :</em> L’évolution du patient et les résultats du bilan sont intégrés à la décision.</p>${q.enonce}` : q.enonce,
      format:q.format ?? 'qcm', reponse_attendue:q.reponse_attendue, correction_generale:q.correction_generale,
      items:(byQuestion.get(q.id) ?? []).sort((a,b)=>String(a.lettre).localeCompare(String(b.lettre))).map(({lettre,enonce,is_correct,justification})=>({lettre,enonce,is_correct,justification})),
    })),
  };
});
const chapter = { title: source.course.titre, provenance: { sourceOnly:true, source:'extract.json — Hallux valgus', note:'Reprise de la banque sourcée ; les DP sont explicitement structurés autour d’un patient et de son suivi, sans ajout médical externe.' }, series, flashcards: source.flashcards.sort((a,b)=>a.order_index-b.order_index).map(({recto,verso,order_index})=>({recto,verso,order_index})) };
writeFileSync(join(out,'chapter.json'),`${JSON.stringify(chapter,null,2)}\n`,'utf8');
console.log(JSON.stringify({title:chapter.title,cards:chapter.flashcards.length,series:series.length}));
