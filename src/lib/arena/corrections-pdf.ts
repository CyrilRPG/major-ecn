import 'server-only';
import { launchBrowser } from '@/lib/fiches/chromium';
import { arenaDb, effectiveBareme, getRound, getTournament, listQuestions } from './db';
import { ARENA_BUCKET } from './pdf-url';
import { describeBareme } from './scoring';
import { WARNING_NATURE } from './texts';
import { qrpNs, type QuestionRow, type RoundRow, type TournamentRow } from './types';

/**
 * PDF de corrections (§12.1) généré par la plateforme depuis le contenu saisi
 * en administration : réponse attendue et explication item par item, pièges
 * de l'énoncé, erreurs les plus fréquentes (qualitatif, sans effectif),
 * encadré méthodologique, références. Stocké dans le bucket privé `arena`,
 * servi par URL signée. Un PDF fourni par Major ECN peut le remplacer.
 */

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function para(s: string): string {
  return esc(s).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

export function correctionsHtml(t: TournamentRow, r: RoundRow, questions: QuestionRow[]): string {
  const bareme = effectiveBareme(t, r);
  const ns = qrpNs(questions);
  const baremeHtml = (['QRM', 'QRU', 'QRP'] as const)
    .map((k) => {
      const d = describeBareme(k, bareme, ns);
      return `<div class="bareme"><h4>${k} — ${esc(d.title)}</h4><ul>${d.lines.map((l) => `<li>${esc(l.situation)} : <b>${esc(l.points)}</b></li>`).join('')}</ul></div>`;
    })
    .join('');
  const qHtml = questions
    .map((q, i) => {
      const expected = q.items.filter((it) => it.is_correct).map((it) => it.lettre).join(' + ') || '—';
      return `<section class="q">
  <h3>Question ${i + 1} <span class="tag">${q.type}${q.type === 'QRP' ? ` · n = ${q.expected_count ?? q.items.filter((it) => it.is_correct).length}` : ''}${q.weight !== 1 ? ` · coefficient ${q.weight}` : ''}${q.neutralized_at ? ' · NEUTRALISÉE' : ''}</span></h3>
  ${q.vignette ? `<div class="vignette">${para(q.vignette)}</div>` : ''}
  <div class="enonce">${para(q.enonce)}</div>
  <ol class="items">${q.items.map((it) => `<li class="${it.is_correct ? 'ok' : ''}"><b>${it.lettre}.</b> ${esc(it.enonce)}${it.indispensable ? ' <i>(indispensable)</i>' : ''}${it.inacceptable ? ' <i>(inacceptable)</i>' : ''}${it.justification ? `<div class="justif">${esc(it.justification)}</div>` : ''}</li>`).join('')}</ol>
  <p class="expected">Réponse attendue : <b>${esc(expected)}</b></p>
  ${q.explanation ? `<div class="block"><h5>Explication</h5>${para(q.explanation)}</div>` : ''}
  ${q.pieges ? `<div class="block"><h5>Pièges de l’énoncé</h5>${para(q.pieges)}</div>` : ''}
  ${q.erreurs_frequentes ? `<div class="block"><h5>Erreurs les plus fréquentes</h5>${para(q.erreurs_frequentes)}</div>` : ''}
  ${q.references_text ? `<p class="refs">Références : ${esc(q.references_text)}</p>` : ''}
</section>`;
    })
    .join('');

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Corrections — manche ${r.number}</title>
<style>
  @page { size: A4; margin: 18mm 16mm 20mm 16mm; }
  body { font-family: "Helvetica Neue", Arial, sans-serif; color: #1A2233; font-size: 11pt; line-height: 1.45; }
  header { border-bottom: 3px solid #E4002B; padding-bottom: 8px; margin-bottom: 16px; }
  header .brand { font-weight: 800; letter-spacing: .18em; color: #E4002B; font-size: 10pt; }
  h1 { font-size: 20pt; margin: 4px 0 0; letter-spacing: -.02em; }
  h2 { font-size: 14pt; margin: 22px 0 8px; color: #14254E; }
  h3 { font-size: 12.5pt; margin: 0 0 6px; }
  h4 { font-size: 10.5pt; margin: 8px 0 2px; }
  h5 { font-size: 10pt; margin: 0 0 3px; color: #14254E; text-transform: uppercase; letter-spacing: .08em; }
  .meta { color: #6B7280; font-size: 10pt; }
  .warning, .methodo, .errors { border-left: 4px solid #E4002B; background: #FBF7F7; padding: 8px 12px; margin: 10px 0; }
  .methodo { border-color: #14254E; background: #F3F5FA; }
  .bareme { display: inline-block; vertical-align: top; width: 31%; margin-right: 2%; font-size: 9.5pt; }
  .bareme ul { margin: 2px 0 0; padding-left: 16px; }
  .q { page-break-inside: avoid; border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 12px; }
  .tag { font-size: 9pt; color: #E4002B; font-weight: 700; margin-left: 6px; }
  .vignette { background: #F6F7F9; padding: 6px 10px; border-radius: 6px; font-size: 10pt; }
  .enonce { font-weight: 700; margin: 6px 0; }
  .items { list-style: none; padding: 0; margin: 6px 0; }
  .items li { padding: 4px 8px; border: 1px solid #E5E7EB; border-radius: 6px; margin-bottom: 3px; }
  .items li.ok { border-color: #22C55E; background: #F0FDF4; }
  .justif { font-size: 9.5pt; color: #4B5563; margin-top: 2px; }
  .expected { margin: 6px 0; }
  .block { margin: 6px 0; }
  .refs { font-size: 9pt; color: #6B7280; }
  footer { position: fixed; bottom: -12mm; left: 0; right: 0; font-size: 8.5pt; color: #6B7280; }
</style></head><body>
<header>
  <div class="brand">EVC ARENA · MAJOR ECN</div>
  <h1>Corrections — manche ${r.number}${r.theme ? ` · ${esc(r.theme)}` : ''}</h1>
  <p class="meta">${esc(t.title)}${t.edition_label ? ` · ${esc(t.edition_label)}` : ''} · ${esc(t.specialty)}</p>
</header>
${r.corrections_intro ? para(r.corrections_intro) : ''}
${r.corrections_methodo ? `<div class="methodo"><h5>Méthode</h5>${para(r.corrections_methodo)}</div>` : ''}
${r.corrections_errors ? `<div class="errors"><h5>Erreurs les plus fréquentes sur la manche</h5>${para(r.corrections_errors)}</div>` : ''}
<h2>Barème appliqué</h2>
${baremeHtml}
<h2>Questions</h2>
${qHtml}
${r.corrections_references ? `<h2>Références et recommandations</h2>${para(r.corrections_references)}` : ''}
<div class="warning"><p>${esc(WARNING_NATURE)}</p></div>
<footer>Major ECN — EVC Arena — corrections de la manche ${r.number}. Document personnel, diffusion interdite.</footer>
</body></html>`;
}

export async function generateCorrectionsPdf(roundId: string): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const r = await getRound(roundId);
  const t = r ? await getTournament(r.tournament_id) : null;
  if (!r || !t) return { ok: false, error: 'Manche introuvable.' };
  const questions = await listQuestions(r.id);
  if (questions.length === 0) return { ok: false, error: 'Aucune question.' };
  const html = correctionsHtml(t, r, questions);
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '18mm', right: '16mm', bottom: '20mm', left: '16mm' } });
    const path = `${t.id}/corrections-m${r.number}-${Date.now()}.pdf`;
    const db = arenaDb();
    const { error } = await db.storage.from(ARENA_BUCKET).upload(path, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });
    if (error) return { ok: false, error: error.message };
    await db.from('arena_rounds').update({ corrections_pdf_path: path, corrections_pdf_source: 'generated', corrections_pdf_generated_at: new Date().toISOString() }).eq('id', r.id);
    return { ok: true, path };
  } finally {
    await browser.close();
  }
}
