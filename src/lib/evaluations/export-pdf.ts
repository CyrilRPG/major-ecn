import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import {
  MENTION_TRACABILITE, STATUT_LABEL, TYPE_COULEUR, TYPE_COURT, TYPES_ORDRE, evolutions, formatDuree, formatEvolution,
  formatHeure, formatJour, formatNote, formatPourcentage, pointsCourbe, precisionEtat, type Evaluation,
} from './historique-core';

/**
 * Export PDF de l'historique des évaluations (individuel ou collectif) :
 * identité, période, spécialité(s), courbe de progression (individuel) puis
 * liste chronologique — date, nature, intitulé, statut, résultat, durée,
 * évolution. Polices standard (WinAnsi) : tout caractère hors de ce jeu est
 * remplacé avant l'écriture (cf. `propre`).
 */

export type CandidatPdf = { nom: string; email: string | null; promotion: string | null; voie: string | null; specialites: string };
export type GroupePdf = { candidat: CandidatPdf; evaluations: Evaluation[] };

const A4: [number, number] = [595.28, 841.89];
const MARGE = 40;
const LARGEUR = A4[0] - 2 * MARGE;
const MARINE = rgb(0.078, 0.145, 0.306);
const BORDEAUX = rgb(0.545, 0.055, 0.133);
const GRIS = rgb(0.42, 0.45, 0.5);
const TRAIT = rgb(0.86, 0.87, 0.9);
const FOND = rgb(0.965, 0.968, 0.976);

const WINANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');
/** Texte encodable en WinAnsi (polices standard du PDF). */
export function propre(s: string): string {
  return s
    .replace(/[   ]/g, ' ')
    .replace(/−/g, '-')
    .replace(/→/g, '->')
    .replace(/[≤]/g, '<=').replace(/[≥]/g, '>=')
    .split('')
    .map((c) => (c.charCodeAt(0) <= 0xff || WINANSI_EXTRA.has(c) ? c : '?'))
    .join('')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
}

function hex(h: string): RGB {
  const n = parseInt(h.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Découpe un texte en lignes tenant dans `largeur`. */
function couper(texte: string, police: PDFFont, taille: number, largeur: number): string[] {
  const mots = propre(texte).split(/\s+/).filter(Boolean);
  const lignes: string[] = [];
  let cur = '';
  for (const m of mots) {
    const essai = cur ? `${cur} ${m}` : m;
    if (police.widthOfTextAtSize(essai, taille) <= largeur) { cur = essai; continue; }
    if (cur) lignes.push(cur);
    // Mot plus long que la colonne : coupé au caractère.
    let reste = m;
    while (police.widthOfTextAtSize(reste, taille) > largeur && reste.length > 1) {
      let i = reste.length - 1;
      while (i > 1 && police.widthOfTextAtSize(reste.slice(0, i), taille) > largeur) i--;
      lignes.push(reste.slice(0, i));
      reste = reste.slice(i);
    }
    cur = reste;
  }
  if (cur) lignes.push(cur);
  return lignes.length ? lignes : [''];
}

type Ctx = { doc: PDFDocument; page: PDFPage; y: number; f: PDFFont; fb: PDFFont; titre: string };

function nouvellePage(c: Ctx) {
  c.page = c.doc.addPage(A4);
  c.y = A4[1] - MARGE;
  c.page.drawText(propre(`Major ECN — ${c.titre}`), { x: MARGE, y: A4[1] - 24, size: 8, font: c.f, color: GRIS });
}

function texte(c: Ctx, s: string, opts: { taille?: number; gras?: boolean; couleur?: RGB; x?: number; ecart?: number } = {}) {
  const taille = opts.taille ?? 10;
  const police = opts.gras ? c.fb : c.f;
  for (const l of couper(s, police, taille, LARGEUR - ((opts.x ?? MARGE) - MARGE))) {
    if (c.y < MARGE + 40) nouvellePage(c);
    c.page.drawText(l, { x: opts.x ?? MARGE, y: c.y - taille, size: taille, font: police, color: opts.couleur ?? MARINE });
    c.y -= taille + (opts.ecart ?? 3);
  }
}

/** Courbe de progression : abscisse = dates, ordonnée = résultat en %. */
function courbe(c: Ctx, liste: Evaluation[]) {
  const pts = pointsCourbe(liste);
  const H = 170;
  if (c.y - H - 40 < MARGE + 40) nouvellePage(c);
  c.y -= 6;
  texte(c, 'Courbe de progression (résultat en %)', { taille: 11, gras: true });
  if (pts.length === 0) { texte(c, 'Aucune évaluation notée sur la période.', { couleur: GRIS }); return; }
  const x0 = MARGE + 30, x1 = MARGE + LARGEUR - 6, yBas = c.y - H, yHaut = c.y - 8;
  const tMin = pts[0].t, tMax = pts[pts.length - 1].t;
  const marge = Math.max(86_400_000, (tMax - tMin) * 0.04);
  const X = (t: number) => x0 + ((t - (tMin - marge)) / ((tMax + marge) - (tMin - marge))) * (x1 - x0);
  const Y = (p: number) => yBas + (Math.max(0, Math.min(100, p)) / 100) * (yHaut - yBas);
  for (const v of [0, 25, 50, 75, 100]) {
    c.page.drawLine({ start: { x: x0, y: Y(v) }, end: { x: x1, y: Y(v) }, thickness: 0.5, color: TRAIT });
    c.page.drawText(`${v} %`, { x: MARGE, y: Y(v) - 3, size: 7, font: c.f, color: GRIS });
  }
  // Graduations de dates (5 au plus).
  const n = Math.min(5, pts.length);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? pts[0].t : tMin + ((tMax - tMin) * i) / (n - 1);
    const lib = new Date(t).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: '2-digit' });
    c.page.drawText(lib, { x: X(t) - 14, y: yBas - 11, size: 7, font: c.f, color: GRIS });
  }
  for (const type of TYPES_ORDRE) {
    const serie = pts.filter((p) => p.type === type);
    const coul = hex(TYPE_COULEUR[type]);
    for (let i = 1; i < serie.length; i++) {
      c.page.drawLine({ start: { x: X(serie[i - 1].t), y: Y(serie[i - 1].pourcentage) }, end: { x: X(serie[i].t), y: Y(serie[i].pourcentage) }, thickness: 1.6, color: coul });
    }
    for (const p of serie) c.page.drawCircle({ x: X(p.t), y: Y(p.pourcentage), size: 2.6, color: coul, borderColor: rgb(1, 1, 1), borderWidth: 0.8 });
  }
  c.y = yBas - 22;
  // Légende.
  let x = MARGE;
  for (const type of TYPES_ORDRE) {
    const nb = pts.filter((p) => p.type === type).length;
    if (!nb) continue;
    const lib = propre(`${TYPE_COURT[type]} (${nb})`);
    c.page.drawCircle({ x: x + 3, y: c.y + 3, size: 3, color: hex(TYPE_COULEUR[type]) });
    c.page.drawText(lib, { x: x + 9, y: c.y, size: 8, font: c.f, color: MARINE });
    x += 18 + c.f.widthOfTextAtSize(lib, 8);
  }
  c.y -= 16;
}

const COLS = [
  { titre: 'Date', l: 58 },
  { titre: 'Nature', l: 78 },
  { titre: 'Intitulé', l: 150 },
  { titre: 'Statut', l: 58 },
  { titre: 'Résultat', l: 84 },
  { titre: 'Durée', l: 42 },
  { titre: 'Évol.', l: 45 },
];

function entete(c: Ctx) {
  const h = 16;
  c.page.drawRectangle({ x: MARGE, y: c.y - h, width: LARGEUR, height: h, color: FOND });
  let x = MARGE + 4;
  for (const col of COLS) {
    c.page.drawText(propre(col.titre), { x, y: c.y - 11, size: 8, font: c.fb, color: MARINE });
    x += col.l;
  }
  c.y -= h;
}

function tableau(c: Ctx, liste: Evaluation[]) {
  const evo = evolutions(liste);
  const tri = [...liste].sort((a, b) => a.date.localeCompare(b.date) || a.cle.localeCompare(b.cle));
  if (c.y < MARGE + 80) nouvellePage(c);
  entete(c);
  const T = 7.5;
  for (const e of tri) {
    const precision = precisionEtat(e);
    const cellules = [
      [formatJour(e.date), formatHeure(e.date)],
      [TYPE_COURT[e.type]],
      [e.intitule, ...(e.specialite ? [e.specialite] : []), ...(e.archive ? ['(tentative archivée)'] : [])],
      [STATUT_LABEL[e.statut], ...(precision && e.statut !== 'termine' ? [precision] : [])],
      e.statut === 'termine' && e.pourcentage !== null ? [formatPourcentage(e.pourcentage), formatNote(e) ?? ''] : [e.statut === 'termine' ? (precision ?? '—') : '—'],
      [formatDuree(e.dureeSecondes)],
      [formatEvolution(evo.get(e.cle))],
    ];
    // Première valeur d'une cellule (repliée sur plusieurs lignes au besoin) en marine, gras pour l'intitulé et le résultat ; les précisions en gris.
    const lignes = cellules.map((cell, i) => cell.flatMap((s, j) => couper(s, j === 0 && (i === 2 || i === 4) ? c.fb : c.f, T, COLS[i].l - 8).map((l) => ({ l, principal: j === 0 }))));
    const h = Math.max(...lignes.map((l) => l.length)) * (T + 2) + 6;
    if (c.y - h < MARGE + 30) { nouvellePage(c); entete(c); }
    let x = MARGE + 4;
    lignes.forEach((l, i) => {
      l.forEach((s, k) => c.page.drawText(s.l, { x, y: c.y - 4 - T - k * (T + 2), size: T, font: s.principal && (i === 2 || i === 4) ? c.fb : c.f, color: s.principal ? MARINE : GRIS }));
      x += COLS[i].l;
    });
    c.y -= h;
    c.page.drawLine({ start: { x: MARGE, y: c.y }, end: { x: MARGE + LARGEUR, y: c.y }, thickness: 0.4, color: TRAIT });
  }
}

function identite(c: Ctx, g: GroupePdf, periode: string) {
  const ev = g.evaluations;
  texte(c, g.candidat.nom, { taille: 14, gras: true, ecart: 4 });
  const lignes = [
    g.candidat.email ? `E-mail : ${g.candidat.email}` : null,
    `Promotion : ${g.candidat.promotion ?? '—'} · Voie : ${g.candidat.voie ?? '—'}`,
    `Spécialité(s) : ${g.candidat.specialites || '—'}`,
    `Période : ${periode} · ${ev.length} évaluation${ev.length > 1 ? 's' : ''} (${ev.filter((e) => e.statut === 'termine').length} terminée${ev.filter((e) => e.statut === 'termine').length > 1 ? 's' : ''})`,
  ].filter((x): x is string => !!x);
  for (const l of lignes) texte(c, l, { taille: 9, couleur: GRIS });
  c.y -= 6;
}

export async function pdfEvaluations(groupes: GroupePdf[], opts: { titre: string; periode: string; filtres: string; courbe: boolean; genereLe: Date }): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(propre(opts.titre));
  doc.setProducer('Major ECN');
  doc.setCreationDate(opts.genereLe);
  const c: Ctx = { doc, page: undefined as unknown as PDFPage, y: 0, f: await doc.embedFont(StandardFonts.Helvetica), fb: await doc.embedFont(StandardFonts.HelveticaBold), titre: opts.titre };
  nouvellePage(c);

  texte(c, 'HISTORIQUE DES ÉVALUATIONS', { taille: 9, gras: true, couleur: BORDEAUX, ecart: 4 });
  texte(c, opts.titre, { taille: 17, gras: true, ecart: 6 });
  texte(c, `Généré le ${formatJour(opts.genereLe.toISOString())} à ${formatHeure(opts.genereLe.toISOString())} · ${opts.filtres}`, { taille: 8.5, couleur: GRIS });
  c.y -= 8;

  if (groupes.length === 0) texte(c, 'Aucune évaluation pour ces critères.', { couleur: GRIS });
  groupes.forEach((g, i) => {
    if (i > 0) {
      if (c.y < MARGE + 200) nouvellePage(c);
      else { c.y -= 10; c.page.drawLine({ start: { x: MARGE, y: c.y }, end: { x: MARGE + LARGEUR, y: c.y }, thickness: 1, color: BORDEAUX }); c.y -= 12; }
    }
    identite(c, g, opts.periode);
    if (opts.courbe) courbe(c, g.evaluations);
    if (g.evaluations.length > 0) tableau(c, g.evaluations);
  });

  c.y -= 12;
  texte(c, `Natures : Check-up = évaluation diagnostique (EVC Check-up) ; Suivi = évaluation de suivi (réévaluations, bilans) ; Interrogation = interrogation de spécialité ou de fin d’item ; Entraînement = révision transversale du quotidien. Évolution : écart avec l’évaluation précédente de même nature, en points de pourcentage. Une tentative archivée (reprise, réinitialisation, suppression) reste dans l’historique.`, { taille: 7.5, couleur: GRIS });
  texte(c, MENTION_TRACABILITE, { taille: 7.5, couleur: GRIS });

  const pages = doc.getPages();
  pages.forEach((p, i) => p.drawText(`Page ${i + 1} / ${pages.length}`, { x: A4[0] - MARGE - 50, y: 22, size: 8, font: c.f, color: GRIS }));
  return doc.save();
}
