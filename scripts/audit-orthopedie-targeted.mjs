/** Focused read-only audit for a list of Orthopédie course ids.
 * Usage: node scripts/audit-orthopedie-targeted.mjs <report.json> <courseId> [...courseId]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';

dotenv({ path: '.env.local' });
const [output, ...ids] = process.argv.slice(2);
if (!output || !ids.length || !/audit-production-.*\.json$/i.test(output)) throw new Error('Usage: report audit-production-*.json + au moins un coursId');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
// The database stores editable HTML.  Strip markup before testing the
// pedagogical opening of a DP question; otherwise `<p><em>Nouvel élément` is
// normalized as `pemnouvelelement` and valid dossiers are falsely rejected.
const normalize = (v) => String(v || '').replace(/<[^>]+>/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const mechanical = /temps technique dÃ©crit dans le corpus|quel repÃ¨re technique|synthÃ¨se issue de|\brepÃ¨re\s*\d+\b/i;
// The data may be valid Unicode even when this historic audit source was
// opened with a legacy code page.  Normalise signatures before testing them.
const isMechanical = (value) => /tempstechniquedecritdanslecorpus|quelreperetechnique|syntheseissued|reperes?\d+$/.test(normalize(value));
const rows = [];
for (const id of ids) {
  const { data: course, error: ce } = await supabase.from('cours').select('id,order_index,titre').eq('id', id).single(); if (ce) throw ce;
  const { data: fiche } = await supabase.from('fiches').select('pages,content_html').eq('cours_id', id).order('order_index').limit(1).maybeSingle();
  const { data: series } = await supabase.from('qcm_series').select('id,label,vignette').eq('cours_id', id);
  const seriesIds = (series || []).map(s => s.id);
  const { data: questions } = seriesIds.length ? await supabase.from('qcm_questions').select('id,serie_id,enonce').in('serie_id', seriesIds) : { data: [] };
  const questionIds = (questions || []).map(q => q.id);
  const { count: itemCount } = questionIds.length ? await supabase.from('qcm_items').select('*', { count: 'exact', head: true }).in('question_id', questionIds) : { count: 0 };
  const { data: cards, count: cardCount } = await supabase.from('flashcards').select('recto,verso', { count: 'exact' }).eq('cours_id', id);
  const qcm = (series || []).filter(s => /^QCM\b/i.test(s.label || ''));
  const dp = (series || []).filter(s => /^DP\b/i.test(s.label || ''));
  const fronts = new Set((cards || []).map(c => normalize(c.recto)).filter(Boolean));
  const directCardQuestions = (questions || []).filter(q => fronts.has(normalize((q.enonce || '').replace(/^nouvel Ã©lÃ©ment\s*:\s*/i, '')))).length;
  let html = null;
  if (fiche) { await page.setContent(`<!doctype html><html><body>${fiche.content_html || ''}</body></html>`, { waitUntil: 'load' }); html = await page.evaluate(() => {
    const tables = [...document.querySelectorAll('table.fiche-table')];
    return { textCharacters: document.body.innerText.replace(/\s+/g,' ').trim().length, parts: document.querySelectorAll('section.partie-page').length, ficheTables: tables.length, figures: document.querySelectorAll('figure.ft-figure').length, tableErrors: tables.filter(t=>t.querySelectorAll(':scope > thead > .ft-head-row').length!==1||t.querySelectorAll(':scope > thead > .ft-banner-row').length!==1).length, repeatErrors: [...document.querySelectorAll('section.partie-page')].filter(p=>[...p.querySelectorAll(':scope > table.fiche-table')].slice(1).some(t=>!t.querySelector('.partie-banner-title--repeat'))).length, bareDetails: document.querySelectorAll('td.ft-detail:not(.content)').length, listless: [...document.querySelectorAll('td.ft-detail.content')].filter(c=>!c.querySelector(':scope > ul')).length, synthesis: document.querySelectorAll('section.synthese-page').length, eclair: document.querySelectorAll('.fiche-eclair-page').length, eclairLast: (()=>{const e=document.querySelector('.fiche-eclair-page');return !!e && e===document.body.lastElementChild;})(), mechanicalFiche: /synthÃ¨se issue de|\brepÃ¨re\s*\d+\b/i.test(document.body.innerText), dataImages:(document.body.innerHTML.match(/data:image/g)||[]).length }; }); }
  const dpErrors = dp.flatMap(s => { const sq=(questions||[]).filter(q=>q.serie_id===s.id); const issues=[]; if (!s.vignette || String(s.vignette).replace(/<[^>]+>/g,'').length<260) issues.push('vignette'); if (!/(patient|patiente|homme|femme|adolescent|adolescente|jeune adulte)/i.test(s.vignette||'')) issues.push('patient'); if (!/(suivi|contrôle|postopératoire|rééducation|mise en charge)/i.test(s.vignette||'')) issues.push('suivi'); if (sq.length!==7) issues.push('7Q'); if (sq.slice(1).some(q=>!normalize(q.enonce).startsWith('nouvelelement'))) issues.push('nouvel-element'); return issues.length?[{label:s.label,issues}]:[]; });
  const defects=[...(!fiche?['missing-fiche']:[]),...(html&&(!html.parts||html.parts<4||html.parts>7||html.tableErrors||html.repeatErrors||html.bareDetails||html.listless||html.synthesis!==1||html.eclair!==1||!html.eclairLast||html.mechanicalFiche)?['html']:[]),...(fiche&&(fiche.pages<7||fiche.pages>40)?['pages']:[]),...(qcm.length!==8||dp.length!==8||questions.length!==96||itemCount!==480||cardCount<100||cardCount>200?['counts']:[]),...(directCardQuestions?['qcm-card-repetition']:[]),...(dpErrors.length?['dp']:[]),...((cards||[]).some(c=>mechanical.test(`${c.recto} ${c.verso}`))|| (questions||[]).some(q=>mechanical.test(q.enonce||'')) ? ['mechanical']:[])];
  if (html) {
    const eclairState = await page.evaluate(() => {
      const eclair = document.querySelector('.fiche-eclair-page, .eclair-page');
      return { count: document.querySelectorAll('.fiche-eclair-page, .eclair-page').length, isLast: !!eclair && eclair === document.body.lastElementChild, text: document.body.innerText };
    });
    html.eclair = eclairState.count;
    html.eclairLast = eclairState.isLast;
    html.listless = await page.evaluate(
      () => [...document.querySelectorAll('td.ft-detail.content')]
        // A figure-only detail cell is an intentional full-width illustration;
        // narrative cells must otherwise be represented by a list.
        // A comparison table is an intentional editable content structure,
        // just like a list or a standalone figure.  Flag only narrative cells
        // which have no structured child at all.
        .filter((cell) => !cell.querySelector('ul') && !cell.querySelector('figure.ft-figure') && !cell.querySelector('table')).length,
    );
    html.mechanicalFiche = isMechanical(eclairState.text);
    const htmlValid = html.parts >= 4 && html.parts <= 7 && !html.tableErrors && !html.repeatErrors && !html.bareDetails && !html.listless && html.synthesis === 1 && html.eclair === 1 && html.eclairLast && !html.mechanicalFiche;
    if (htmlValid) {
      const position = defects.indexOf('html');
      if (position >= 0) defects.splice(position, 1);
    }
  }
  rows.push({orderIndex:course.order_index,title:course.titre,coursId:id,pages:fiche?.pages??null,html,qcm:qcm.length,dp:dp.length,questions:questions.length,items:itemCount,flashcards:cardCount,directCardQuestions,dpErrors,defects,status:defects.length?'repair':'ok'});
}
await browser.close();
const report={generatedAt:new Date().toISOString(),scope:'orthopedie entries 97-101',totals:{courses:rows.length,ok:rows.filter(r=>r.status==='ok').length,repair:rows.filter(r=>r.status==='repair').length},rows};
const dest=resolve(output); mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,`${JSON.stringify(report,null,2)}\n`,'utf8');console.log(JSON.stringify(report.totals));console.table(rows.map(r=>({n:r.orderIndex,status:r.status,pages:r.pages,defects:r.defects.join(','),title:r.title})));
