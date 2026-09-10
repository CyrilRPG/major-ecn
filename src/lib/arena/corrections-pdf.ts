import 'server-only';
import { launchBrowser } from '@/lib/fiches/chromium';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteUrl } from '@/lib/email/send';
import { BILLING_EUR, GEN_FEATURE } from '@/lib/ai/cost';
import { arenaDb, effectiveBareme, getRound, getTournament, listQuestions } from './db';
import { ARENA_BUCKET } from './pdf-url';
import { describeBareme } from './scoring';
import { WARNING_NATURE } from './texts';
import { qrpNs, type QuestionRow, type RoundRow, type TournamentRow } from './types';
import { ARENA_CORRECTIONS_MODEL, questionHasSource, redigerCorrectionEditoriale, type Editorial, type EditorialQuestion } from './corrections-ai';
import { storeCorrectionPages } from './corrections-pages';

/**
 * Corrigé PDF d'une manche (§12.1), au gabarit EVC Arena : page de garde
 * sombre (casque, lauriers, or et bordeaux), pages claires structurées
 * question par question (propositions exactes / inexactes, réponse attendue,
 * justifications, explication, points clés, piège), encadrés de la manche
 * (méthode, erreurs fréquentes, références), barème appliqué, avertissement
 * réglementaire.
 *
 * Deux modes :
 *  - `layout` : mise en page des seuls textes de la base ;
 *  - `ai`     : rédaction éditoriale par IA à partir de ces mêmes textes
 *               (corrections-ai.ts, rien d'inventé), facturée 1 €.
 *
 * Le PDF est stocké dans le bucket privé `arena` (usage interne) et rendu en
 * pages PNG pour la visionneuse des participants (corrections-pages.ts) :
 * aucun fichier ni lien de téléchargement n'est jamais remis à un participant.
 */

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function para(s: string, cls = ''): string {
  return esc(s).split(/\n{2,}/).map((p) => `<p${cls ? ` class="${cls}"` : ''}>${p.replace(/\n/g, '<br>')}</p>`).join('');
}
const fmtDate = (d: Date) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(d);

export type CorrectionsHtmlOptions = {
  editorial?: Pick<Editorial, 'synthese' | 'questions'> | null;
  /** Origine absolue des visuels (casque, lauriers) : `siteUrl()` en production. */
  assetsBase: string;
  generatedAt?: Date;
};

export function correctionsHtml(t: TournamentRow, r: RoundRow, questions: QuestionRow[], opts: CorrectionsHtmlOptions): string {
  const bareme = effectiveBareme(t, r);
  const ns = qrpNs(questions);
  const generatedAt = opts.generatedAt ?? new Date();
  const edito = new Map<number, EditorialQuestion>((opts.editorial?.questions ?? []).map((q) => [q.index, q]));
  const actives = questions.filter((q) => !q.neutralized_at);

  const baremeHtml = (['QRM', 'QRU', 'QRP'] as const)
    .map((k) => {
      const d = describeBareme(k, bareme, ns);
      return `<div class="bareme"><h4>${k}<span>${esc(d.title)}</span></h4><ul>${d.lines.map((l) => `<li><span>${esc(l.situation)}</span><b>${esc(l.points)}</b></li>`).join('')}</ul></div>`;
    })
    .join('');

  const qHtml = actives
    .map((q, i) => {
      const index = i + 1;
      const expected = q.items.filter((it) => it.is_correct).map((it) => it.lettre).join(' + ') || '—';
      const e = edito.get(index);
      const hasSource = questionHasSource(q);
      const corrige = e
        ? `${e.explication ? `<div class="block"><h5>Explication</h5>${para(e.explication)}</div>` : ''}
           ${e.points_cles.length ? `<div class="block keys"><h5>Points clés</h5><ul>${e.points_cles.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
           ${e.piege ? `<div class="callout piege"><h5>Piège à retenir</h5><p>${esc(e.piege)}</p></div>` : ''}`
        : `${q.explanation ? `<div class="block"><h5>Explication</h5>${para(q.explanation)}</div>` : ''}
           ${q.pieges ? `<div class="callout piege"><h5>Pièges de l’énoncé</h5>${para(q.pieges)}</div>` : ''}
           ${q.erreurs_frequentes ? `<div class="block"><h5>Erreurs les plus fréquentes</h5>${para(q.erreurs_frequentes)}</div>` : ''}`;
      return `<section class="q">
  <div class="q-head">
    <span class="q-num">${index}</span>
    <div class="q-meta"><span class="tag">${q.type}${q.type === 'QRP' ? ` · n = ${q.expected_count ?? q.items.filter((it) => it.is_correct).length}` : ''}</span>${q.weight !== 1 ? `<span class="tag muted">coefficient ${q.weight}</span>` : ''}${q.type === 'QRM' ? '<span class="tag muted">plusieurs réponses</span>' : q.type === 'QRU' ? '<span class="tag muted">réponse unique</span>' : ''}</div>
  </div>
  ${q.vignette ? `<div class="vignette">${para(q.vignette)}</div>` : ''}
  <div class="enonce">${para(q.enonce)}</div>
  ${q.images.length ? `<div class="images">${q.images.map((src) => `<img src="${esc(src)}" alt="">`).join('')}</div>` : ''}
  <ol class="items">${q.items.map((it) => `<li class="${it.is_correct ? 'ok' : 'ko'}"><span class="mark">${it.is_correct ? '✓' : '✗'}</span><span class="lettre">${it.lettre}</span><div><p class="prop">${esc(it.enonce)}${it.indispensable ? ' <em class="rule">indispensable</em>' : ''}${it.inacceptable ? ' <em class="rule">inacceptable</em>' : ''}</p>${it.justification ? `<p class="justif">${esc(it.justification)}</p>` : ''}</div></li>`).join('')}</ol>
  <p class="expected"><span>Réponse attendue</span><b>${esc(expected)}</b></p>
  ${corrige}
  ${!hasSource ? '<p class="nosource">Aucune justification rédigée n’est fournie dans la source de cette question : seule la réponse attendue est indiquée.</p>' : ''}
  ${q.references_text ? `<p class="refs">Références : ${esc(q.references_text)}</p>` : ''}
</section>`;
    })
    .join('');

  const neutralisees = questions.filter((q) => q.neutralized_at);
  const synthese = opts.editorial?.synthese ?? [];

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Correction détaillée — manche ${r.number}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { --red: #E4002B; --bordeaux: #7A0A21; --gold: #C79A3B; --gold-soft: #E8C878; --ink: #1A2233; --ink-soft: #4B5563; --muted: #7E8794; --line: #E5E7EB; --ok: #1B8A4A; }
  @page { size: A4; margin: 14mm 14mm 18mm 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Inter, Roboto, "Helvetica Neue", Arial, sans-serif; color: var(--ink); font-size: 10.5pt; line-height: 1.5; }
  h1, h2, h3, h4, .display { font-family: Oswald, "Arial Narrow", Impact, sans-serif; text-transform: uppercase; letter-spacing: .04em; font-weight: 600; }
  p { margin: 0 0 6px; }
  /* Page de garde : panneau sombre dans la boîte de page */
  .cover { height: 263mm; border-radius: 14px; background: radial-gradient(ellipse 80% 60% at 50% 0%, #1E2734 0%, #0B0F14 62%); color: #F2F3F5; padding: 22mm 18mm; position: relative; overflow: hidden; page-break-after: always; display: flex; flex-direction: column; }
  .cover .brand { display: flex; align-items: center; gap: 14px; }
  .cover .brand img { width: 46px; height: auto; }
  .cover .brand b { font-family: Oswald, sans-serif; font-size: 17pt; letter-spacing: .12em; color: var(--gold-soft); }
  .cover .brand small { display: block; font-size: 8pt; letter-spacing: .28em; color: #B8BEC8; font-weight: 500; }
  .cover .laurel { position: absolute; right: 14mm; top: 16mm; width: 120px; opacity: .9; }
  .cover .kicker { margin-top: 42mm; font-family: Oswald, sans-serif; font-size: 10pt; letter-spacing: .32em; color: var(--red); }
  .cover h1 { font-size: 34pt; line-height: 1.02; margin: 8px 0 0; letter-spacing: .03em; }
  .cover h1 span { display: block; color: var(--gold-soft); }
  .cover .rule { width: 92px; height: 3px; margin: 16px 0; background: linear-gradient(90deg, var(--gold-soft), var(--gold)); }
  .cover .theme { font-size: 15pt; font-weight: 600; color: #F2F3F5; }
  .cover .tour { margin-top: 4px; font-size: 11pt; color: #B8BEC8; }
  .cover .facts { margin-top: 18mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .cover .fact { border: 1px solid rgba(212,169,74,.35); border-radius: 10px; padding: 10px 12px; }
  .cover .fact b { display: block; font-family: Oswald, sans-serif; font-size: 22pt; color: var(--gold-soft); line-height: 1; }
  .cover .fact span { font-size: 8pt; letter-spacing: .18em; text-transform: uppercase; color: #B8BEC8; }
  .cover .foot { margin-top: auto; font-size: 8.5pt; color: #B8BEC8; line-height: 1.5; border-top: 1px solid rgba(255,255,255,.12); padding-top: 10px; }
  .cover .foot b { color: #F2F3F5; }
  /* Pages de contenu */
  .strip { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--gold); padding-bottom: 6px; margin-bottom: 14px; }
  .strip b { font-family: Oswald, sans-serif; letter-spacing: .18em; color: var(--bordeaux); font-size: 9.5pt; text-transform: uppercase; }
  .strip span { font-size: 8.5pt; color: var(--muted); }
  h2 { font-size: 15pt; margin: 18px 0 8px; color: var(--bordeaux); }
  h2 small { display: block; font-family: Inter, sans-serif; text-transform: none; letter-spacing: 0; font-weight: 500; font-size: 9pt; color: var(--muted); }
  .intro { font-size: 11pt; color: var(--ink-soft); }
  .callout { border-left: 4px solid var(--bordeaux); background: #FBF6F7; border-radius: 0 8px 8px 0; padding: 8px 12px; margin: 8px 0; }
  .callout.methodo { border-color: var(--gold); background: #FBF8F0; }
  .callout.piege { border-color: var(--red); background: #FFF4F6; }
  .callout h5, .block h5 { font-family: Oswald, sans-serif; font-size: 8.5pt; letter-spacing: .2em; text-transform: uppercase; margin: 0 0 4px; color: var(--bordeaux); }
  .callout.piege h5 { color: var(--red); }
  .synthese ul { margin: 4px 0 0; padding-left: 18px; }
  .synthese li { margin: 2px 0; }
  .baremes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .bareme { border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; font-size: 8.5pt; }
  .bareme h4 { margin: 0 0 4px; font-size: 11pt; color: var(--bordeaux); }
  .bareme h4 span { display: block; font-family: Inter, sans-serif; text-transform: none; letter-spacing: 0; font-weight: 500; font-size: 8pt; color: var(--muted); }
  .bareme ul { list-style: none; margin: 0; padding: 0; }
  .bareme li { display: flex; justify-content: space-between; gap: 6px; border-top: 1px dashed var(--line); padding: 3px 0; }
  .bareme li b { color: var(--ink); white-space: nowrap; }
  /* Une question peut s'étendre sur deux pages (la première question laissait
     une page blanche derrière le titre « Questions ») ; seules ses briques
     internes restent insécables. */
  .baremes, .keep { break-inside: avoid; }
  h2 { break-after: avoid; }
  .q { border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px 10px; margin: 0 0 12px; }
  .q-head, .vignette, .enonce, .items li, .expected, .callout, .block, .images { break-inside: avoid; }
  .q-head, .enonce { break-after: avoid; }
  .q-num { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: var(--bordeaux); color: #fff; font-family: Oswald, sans-serif; font-size: 13pt; font-weight: 600; }
  .q-meta { display: flex; gap: 6px; flex-wrap: wrap; }
  .tag { font-family: Oswald, sans-serif; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: var(--red); border: 1px solid rgba(228,0,43,.35); border-radius: 999px; padding: 2px 8px; }
  .tag.muted { color: var(--muted); border-color: var(--line); }
  .vignette { background: #F6F7F9; border-radius: 8px; padding: 6px 10px; font-size: 9.5pt; color: var(--ink-soft); margin-bottom: 6px; }
  .enonce { font-weight: 700; font-size: 11pt; margin: 4px 0 8px; }
  .images { display: flex; gap: 8px; flex-wrap: wrap; margin: 4px 0 8px; }
  .images img { max-height: 60mm; max-width: 48%; border-radius: 6px; border: 1px solid var(--line); }
  .items { list-style: none; padding: 0; margin: 0 0 8px; }
  .items li { display: grid; grid-template-columns: 18px 18px 1fr; gap: 8px; align-items: start; padding: 5px 8px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 4px; }
  .items li.ok { border-color: rgba(27,138,74,.45); background: #F1FBF4; }
  .items li.ko { background: #FFFFFF; }
  .items .mark { font-weight: 700; text-align: center; }
  .items li.ok .mark { color: var(--ok); }
  .items li.ko .mark { color: #C4C9D2; }
  .items .lettre { font-family: Oswald, sans-serif; font-weight: 600; text-align: center; }
  .items .prop { margin: 0; }
  .items .justif { margin: 2px 0 0; font-size: 9pt; color: var(--ink-soft); }
  .items em.rule { font-style: normal; font-size: 7.5pt; letter-spacing: .12em; text-transform: uppercase; color: var(--red); margin-left: 4px; }
  .expected { display: flex; align-items: center; gap: 10px; margin: 6px 0 8px; padding: 6px 10px; border-radius: 8px; background: var(--bordeaux); color: #fff; }
  .expected span { font-family: Oswald, sans-serif; font-size: 8.5pt; letter-spacing: .2em; text-transform: uppercase; }
  .expected b { font-family: Oswald, sans-serif; font-size: 13pt; letter-spacing: .1em; }
  .block { margin: 6px 0; }
  .keys ul { margin: 0; padding-left: 16px; }
  .nosource { font-size: 9pt; color: var(--muted); font-style: italic; }
  .refs { font-size: 8.5pt; color: var(--muted); margin-top: 6px; }
  .warning { border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; font-size: 9pt; color: var(--ink-soft); margin-top: 16px; }
  .neutral { font-size: 9pt; color: var(--muted); }
</style></head><body>
<section class="cover">
  <div class="brand"><img src="${esc(opts.assetsBase)}/arena/helmet-320.png" alt=""><div><b>EVC ARENA</b><small>BY MAJOR ECN</small></div></div>
  <img class="laurel" src="${esc(opts.assetsBase)}/arena/laurel-gold.png" alt="">
  <p class="kicker">Correction détaillée</p>
  <h1>Manche ${r.number}<span>${esc(t.specialty)}</span></h1>
  <div class="rule"></div>
  ${r.theme ? `<p class="theme">${esc(r.theme)}</p>` : ''}
  <p class="tour">${esc(t.title)}${t.edition_label ? ` · ${esc(t.edition_label)}` : ''}</p>
  <div class="facts">
    <div class="fact"><b>${actives.length}</b><span>questions</span></div>
    <div class="fact"><b>${t.seconds_per_question} s</b><span>par question</span></div>
    <div class="fact"><b>${(['QRM', 'QRU', 'QRP'] as const).filter((k) => actives.some((q) => q.type === k)).join(' · ') || '—'}</b><span>formats</span></div>
  </div>
  <div class="foot"><b>Document personnel</b>, consultable uniquement dans l’espace EVC Arena du participant. Ni téléchargement, ni diffusion. Corrections établies par l’équipe pédagogique Major ECN${opts.editorial ? ', mises en forme par assistance rédactionnelle' : ''} — ${fmtDate(generatedAt)}.</div>
</section>

<div class="strip"><b>EVC Arena · Correction détaillée · Manche ${r.number}</b><span>${esc(t.title)} — ${esc(t.specialty)}</span></div>
${r.corrections_intro ? `<div class="intro">${para(r.corrections_intro)}</div>` : ''}
${synthese.length ? `<div class="callout synthese"><h5>L’essentiel de la manche</h5><ul>${synthese.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
${r.corrections_methodo ? `<div class="callout methodo"><h5>Méthode${r.theme ? ` · ${esc(r.theme)}` : ''}</h5>${para(r.corrections_methodo)}</div>` : ''}
${r.corrections_errors ? `<div class="callout"><h5>Erreurs les plus fréquentes sur la manche</h5>${para(r.corrections_errors)}</div>` : ''}

<div class="keep"><h2>Barème appliqué<small>${r.bareme_locked_at ? 'Barème verrouillé à l’ouverture de la manche.' : 'Barème du tournoi.'}</small></h2>
<div class="baremes">${baremeHtml}</div></div>

<h2>Questions<small>${actives.length} question${actives.length > 1 ? 's' : ''}${neutralisees.length ? ` · ${neutralisees.length} neutralisée${neutralisees.length > 1 ? 's' : ''} (retirée${neutralisees.length > 1 ? 's' : ''} du barème)` : ''}</small></h2>
${qHtml}
${neutralisees.length ? `<p class="neutral">Questions neutralisées : ${neutralisees.map((q) => `n° ${questions.indexOf(q) + 1}${q.neutralized_reason ? ` (${esc(q.neutralized_reason)})` : ''}`).join(', ')}. Les scores ont été recalculés.</p>` : ''}
${r.corrections_references ? `<h2>Références et recommandations</h2>${para(r.corrections_references)}` : ''}
<div class="warning">${esc(WARNING_NATURE)}</div>
</body></html>`;
}

export type GenerateOptions = {
  mode: 'layout' | 'ai';
  /** Auteur de la génération (facturation et journal). */
  actor: { id: string; label: string };
};

export type GenerateResult =
  | { ok: true; path: string; pages: number; mode: 'layout' | 'ai'; costUsd: number; priceEur: number }
  | { ok: false; error: string };

/** Génère le corrigé PDF d'une manche, le stocke, le rend en pages et l'attache à la manche. */
export async function generateCorrectionsPdf(roundId: string, opts: GenerateOptions): Promise<GenerateResult> {
  const r = await getRound(roundId);
  const t = r ? await getTournament(r.tournament_id) : null;
  if (!r || !t) return { ok: false, error: 'Manche introuvable.' };
  const questions = await listQuestions(r.id);
  if (questions.filter((q) => !q.neutralized_at).length === 0) return { ok: false, error: 'Aucune question active dans cette manche.' };

  let editorial: Editorial | null = null;
  if (opts.mode === 'ai') {
    if (!questions.some(questionHasSource)) return { ok: false, error: 'Aucune question ne porte de justification ni d’explication : il n’y a rien à rédiger. Complétez les corrigés (banque, saisie ou import) ou générez la mise en page simple.' };
    editorial = await redigerCorrectionEditoriale(t, r, questions);
  }

  const html = correctionsHtml(t, r, questions, { editorial, assetsBase: siteUrl(), generatedAt: new Date() });
  const browser = await launchBrowser();
  let pdf: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 45_000 });
    // Polices Google et visuels distants : on attend leur chargement avant l'impression.
    await page.evaluate(() => (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready).catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, 400));
    pdf = await page.pdf({
      format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<div></div>',
      footerTemplate: '<div style="width:100%;padding:0 14mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif;font-size:7.5px;color:#7E8794"><span>EVC Arena · Major ECN — Document personnel, diffusion interdite</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
      margin: { top: '14mm', right: '14mm', bottom: '18mm', left: '14mm' },
    });
  } finally {
    await browser.close();
  }

  const db = arenaDb();
  const path = `${t.id}/corrections-m${r.number}-${opts.mode}-${Date.now()}.pdf`;
  const { error } = await db.storage.from(ARENA_BUCKET).upload(path, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });
  if (error) return { ok: false, error: error.message };
  const pages = await storeCorrectionPages({ tournamentId: t.id, roundNumber: r.number, pdf, previous: r.corrections_pages ?? 0 });
  await db.from('arena_rounds').update({
    corrections_pdf_path: path,
    corrections_pdf_source: opts.mode === 'ai' ? 'ai' : 'generated',
    corrections_pdf_generated_at: new Date().toISOString(),
    corrections_pages: pages,
  }).eq('id', r.id).throwOnError();

  const priceEur = opts.mode === 'ai' ? BILLING_EUR.arena_corrections : 0;
  if (opts.mode === 'ai' && editorial) {
    // Facturation IA : forfait par corrigé généré (catégorie « Générations IA »).
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (createAdminClient() as any).from('ai_generations').insert({
        admin_id: opts.actor.id,
        cours_id: null,
        cours_titre: `${t.title} · manche ${r.number}`,
        kind: 'arena_corrections',
        feature: GEN_FEATURE.arenaCorrections,
        items_count: questions.filter((q) => !q.neutralized_at).length,
        input_tokens: editorial.usage.input_tokens,
        output_tokens: editorial.usage.output_tokens,
        cost_usd: editorial.costUsd,
        price_eur: priceEur,
        status: 'success',
        model: editorial.model || ARENA_CORRECTIONS_MODEL,
        faculte_id: t.faculte_id,
      });
    } catch (e) {
      console.error('[arena] facturation du corrigé IA impossible', e);
    }
  }
  return { ok: true, path, pages, mode: opts.mode, costUsd: editorial?.costUsd ?? 0, priceEur };
}
