// Génère des PDFs Major ECN brandés pour les annales code 71 (Médecine générale).
// Sortie dans data/medgen-annales/. Charge le contenu via parse_annale_doc.py
// (extraction structurée : sujets → questions → choix proposés).
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve('.');
const OUT_DIR = path.join(ROOT, 'data/medgen-annales');
const FONT_DIR = path.join(ROOT, 'data/fonts');
const LOGO_PATH = path.join(ROOT, 'public/major-ecn-logo.png');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const FILES = [
  { annee: 2009, type: 'EVCF', src: '/tmp/medgen_pdfs/2009_EVCF_raw.doc' },
  { annee: 2010, type: 'EVCP', src: '/tmp/medgen_pdfs/2010_EVCP_raw.doc' },
  { annee: 2011, type: 'EVCF', src: '/tmp/medgen_pdfs/2011_EVCF_raw.doc' },
  { annee: 2011, type: 'EVCP', src: '/tmp/medgen_pdfs/2011_EVCP_raw.doc' },
  { annee: 2012, type: 'EVCF', src: '/tmp/medgen_pdfs/2012_EVCF_raw.doc' },
  { annee: 2013, type: 'EVCP', src: '/tmp/medgen_pdfs/2013_EVCP_raw.doc' },
  { annee: 2015, type: 'EVCF', src: '/tmp/medgen_pdfs/2015_EVCF_raw.doc' },
  { annee: 2015, type: 'EVCP', src: '/tmp/medgen_pdfs/2015_EVCP_raw.doc' },
  { annee: 2016, type: 'EVCF', src: '/tmp/medgen_pdfs/2016_EVCF_raw.doc' },
  { annee: 2017, type: 'EVCF', src: '/tmp/medgen_pdfs/2017_EVCF_raw.doc' },
  { annee: 2017, type: 'EVCP', src: '/tmp/medgen_pdfs/2017_EVCP_raw.doc' },
  { annee: 2019, type: 'EVCF', src: '/tmp/medgen_pdfs/2019_EVCF_raw.doc' },
];

// Palette Major ECN (cohérente avec les fiches)
const NAVY = rgb(0x0E / 255, 0x16 / 255, 0x26 / 255);
const BORDEAUX = rgb(0x6B / 255, 0x1A / 255, 0x2A / 255);
const BORDEAUX_DEEP = rgb(0x4D / 255, 0x12 / 255, 0x1E / 255);
const BORDEAUX_SOFT = rgb(0xF9 / 255, 0xF0 / 255, 0xF2 / 255);
const INK = rgb(0x2D / 255, 0x2D / 255, 0x2D / 255);
const INK_SOFT = rgb(0x4A / 255, 0x4A / 255, 0x4A / 255);
const MUTED = rgb(0x7A / 255, 0x7A / 255, 0x7A / 255);
const BORDER = rgb(0xE8 / 255, 0xE7 / 255, 0xE3 / 255);
const BLUE = rgb(0x3B / 255, 0x82 / 255, 0xF6 / 255);
const TEAL = rgb(0x14 / 255, 0xB8 / 255, 0xA6 / 255);
const AMBER = rgb(0xF5 / 255, 0x9E / 255, 0x0B / 255);

const PAGE_W = 595, PAGE_H = 842;
const MARGIN_X = 56, MARGIN_TOP = 96, MARGIN_BOTTOM = 70;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

function nettoieTexte(s) {
  if (!s) return '';
  return s
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x08\x0b-\x1f]+/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, '-')
    .replace(/…/g, '...')
    .trim();
}

function wrap(font, size, text, maxWidth) {
  const words = text.split(/(\s+)/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (font.widthOfTextAtSize(line + w, size) > maxWidth && line.length > 0) {
      lines.push(line.trimEnd());
      line = w.trimStart();
    } else {
      line += w;
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}

function extract(srcPath, year, type) {
  const json = execSync(`python3 ${ROOT}/scripts/parse_annale_doc.py "${srcPath}" ${year} ${type}`, {
    encoding: 'utf-8',
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(json);
}

async function generatePdf({ annee, type }, data) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fontRegular = await pdf.embedFont(readFileSync(path.join(FONT_DIR, 'PlusJakartaSans-Regular.ttf')));
  const fontBold = await pdf.embedFont(readFileSync(path.join(FONT_DIR, 'PlusJakartaSans-Bold.ttf')));
  const fontExtraBold = await pdf.embedFont(readFileSync(path.join(FONT_DIR, 'PlusJakartaSans-ExtraBold.ttf')));

  // Logo Major ECN pour le fond
  let logoImage = null;
  try {
    if (existsSync(LOGO_PATH)) logoImage = await pdf.embedPng(readFileSync(LOGO_PATH));
  } catch {/* ignore */}

  const drawLogoBackground = (page) => {
    if (!logoImage) return;
    const targetW = PAGE_W * 0.55;
    const scale = targetW / logoImage.width;
    const w = logoImage.width * scale;
    const h = logoImage.height * scale;
    page.drawImage(logoImage, {
      x: (PAGE_W - w) / 2,
      y: (PAGE_H - h) / 2,
      width: w,
      height: h,
      opacity: 0.04,
    });
  };

  const drawHeader = (page, pageNum, totalPages) => {
    // Bande navy en haut
    page.drawRectangle({ x: 0, y: PAGE_H - 44, width: PAGE_W, height: 44, color: NAVY });
    // Wordmark
    page.drawText('Major', { x: MARGIN_X, y: PAGE_H - 28, size: 15, font: fontExtraBold, color: rgb(1, 1, 1) });
    const majorW = fontExtraBold.widthOfTextAtSize('Major', 15);
    page.drawText('ECN', { x: MARGIN_X + majorW + 4, y: PAGE_H - 28, size: 15, font: fontExtraBold, color: rgb(0xC8 / 255, 0x4A / 255, 0x5A / 255) });
    // Référence à droite
    const ref = `${type} ${annee} · Médecine générale`;
    const refW = fontRegular.widthOfTextAtSize(ref, 10);
    page.drawText(ref, { x: PAGE_W - MARGIN_X - refW, y: PAGE_H - 25, size: 10, font: fontRegular, color: rgb(0.85, 0.85, 0.85) });
    // Bande tricolore
    page.drawRectangle({ x: 0, y: PAGE_H - 48, width: PAGE_W / 3, height: 4, color: BORDEAUX });
    page.drawRectangle({ x: PAGE_W / 3, y: PAGE_H - 48, width: PAGE_W / 3, height: 4, color: BLUE });
    page.drawRectangle({ x: (PAGE_W / 3) * 2, y: PAGE_H - 48, width: PAGE_W / 3, height: 4, color: TEAL });
  };

  const drawFooter = (page, pageNum, totalPages) => {
    // Ligne fine
    page.drawRectangle({ x: MARGIN_X, y: 42, width: CONTENT_W, height: 0.5, color: BORDER });
    // Mention gauche
    page.drawText('Annales officielles EVC · Médecine générale', { x: MARGIN_X, y: 25, size: 8, font: fontRegular, color: MUTED });
    // Page N / Total
    const txt = `Page ${pageNum}${totalPages ? ` / ${totalPages}` : ''}`;
    const txtW = fontRegular.widthOfTextAtSize(txt, 8);
    page.drawText(txt, { x: PAGE_W - MARGIN_X - txtW, y: 25, size: 8, font: fontRegular, color: MUTED });
  };

  // ============== PAGE DE GARDE ==============
  const cover = pdf.addPage([PAGE_W, PAGE_H]);
  // Fond crème
  cover.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(0xFA / 255, 0xFA / 255, 0xF8 / 255) });
  // Bande tricolore fine en haut (signature visuelle, sans wordmark)
  cover.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W / 3, height: 6, color: BORDEAUX });
  cover.drawRectangle({ x: PAGE_W / 3, y: PAGE_H - 6, width: PAGE_W / 3, height: 6, color: BLUE });
  cover.drawRectangle({ x: (PAGE_W / 3) * 2, y: PAGE_H - 6, width: PAGE_W / 3, height: 6, color: TEAL });

  // Logo Major ECN — placé en haut, taille modérée, opacité élevée
  if (logoImage) {
    const targetW = PAGE_W * 0.32;
    const scale = targetW / logoImage.width;
    const w = logoImage.width * scale;
    const h = logoImage.height * scale;
    cover.drawImage(logoImage, {
      x: (PAGE_W - w) / 2,
      y: PAGE_H - h - 70,
      width: w,
      height: h,
      opacity: 1,
    });
  }

  // Eyebrow
  const eyebrow = 'ANNALES OFFICIELLES';
  cover.drawText(eyebrow, {
    x: (PAGE_W - fontBold.widthOfTextAtSize(eyebrow, 13)) / 2,
    y: PAGE_H * 0.50,
    size: 13,
    font: fontBold,
    color: BORDEAUX,
  });
  // Titre principal (énorme)
  const titre = `${type} ${annee}`;
  const titreSize = 72;
  cover.drawText(titre, {
    x: (PAGE_W - fontExtraBold.widthOfTextAtSize(titre, titreSize)) / 2,
    y: PAGE_H * 0.40,
    size: titreSize,
    font: fontExtraBold,
    color: BORDEAUX_DEEP,
  });
  // Sous-titre
  const sub = type === 'EVCF' ? 'Connaissances fondamentales' : 'Connaissances pratiques';
  cover.drawText(sub, {
    x: (PAGE_W - fontRegular.widthOfTextAtSize(sub, 18)) / 2,
    y: PAGE_H * 0.34,
    size: 18,
    font: fontRegular,
    color: INK_SOFT,
  });
  // Discipline
  const discipline = 'Médecine générale';
  cover.drawText(discipline, {
    x: (PAGE_W - fontBold.widthOfTextAtSize(discipline, 22)) / 2,
    y: PAGE_H * 0.28,
    size: 22,
    font: fontBold,
    color: INK,
  });
  // Encart info bas de page
  const nbSujets = data.sujets.length;
  const nbQ = data.sujets.reduce((s, sj) => s + sj.questions.length, 0);
  cover.drawRectangle({ x: MARGIN_X, y: 100, width: CONTENT_W, height: 70, color: BORDEAUX_SOFT });
  cover.drawRectangle({ x: MARGIN_X, y: 100, width: CONTENT_W, height: 4, color: BORDEAUX });
  cover.drawText('Cette annale contient', { x: MARGIN_X + 24, y: 145, size: 11, font: fontRegular, color: MUTED });
  cover.drawText(`${nbSujets} sujet${nbSujets > 1 ? 's' : ''} · ${nbQ} question${nbQ > 1 ? 's' : ''}`, {
    x: MARGIN_X + 24, y: 118, size: 18, font: fontBold, color: BORDEAUX_DEEP,
  });
  drawFooter(cover, 1, 0);

  // ============== PAGES CONTENU ==============
  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let cursorY = PAGE_H - MARGIN_TOP;
  let pageNum = 2;
  drawHeader(page, pageNum, 0);
  drawLogoBackground(page);

  const newPage = () => {
    drawFooter(page, pageNum, 0);
    pageNum += 1;
    page = pdf.addPage([PAGE_W, PAGE_H]);
    drawHeader(page, pageNum, 0);
    drawLogoBackground(page);
    cursorY = PAGE_H - MARGIN_TOP;
  };

  const ensureSpace = (need) => {
    if (cursorY - need < MARGIN_BOTTOM) newPage();
  };

  const drawWrappedText = (text, options) => {
    const { size, font, color, lineHeight, maxWidth = CONTENT_W, x = MARGIN_X } = options;
    const lines = wrap(font, size, text, maxWidth);
    for (const ln of lines) {
      ensureSpace(lineHeight);
      page.drawText(ln, { x, y: cursorY, size, font, color });
      cursorY -= lineHeight;
    }
  };

  for (let si = 0; si < data.sujets.length; si++) {
    const sujet = data.sujets[si];

    // Titre du sujet (gros, bordeaux)
    ensureSpace(60);
    if (si > 0) cursorY -= 12;
    // Numéro en pastille
    page.drawRectangle({ x: MARGIN_X, y: cursorY - 4, width: 40, height: 30, color: BORDEAUX });
    const num = String(si + 1).padStart(2, '0');
    const numW = fontExtraBold.widthOfTextAtSize(num, 16);
    page.drawText(num, {
      x: MARGIN_X + (40 - numW) / 2,
      y: cursorY + 4,
      size: 16,
      font: fontExtraBold,
      color: rgb(1, 1, 1),
    });
    // Label "DOSSIER" ou "SUJET"
    page.drawText(sujet.label.toUpperCase(), {
      x: MARGIN_X + 52,
      y: cursorY + 8,
      size: 18,
      font: fontExtraBold,
      color: BORDEAUX_DEEP,
    });
    cursorY -= 38;

    // Bloc vignette clinique (fond bordeaux clair, bord gauche bordeaux)
    if (sujet.enonce && sujet.enonce.length > 20) {
      const enonceClean = nettoieTexte(sujet.enonce);
      const enonceLines = wrap(fontRegular, 11, enonceClean, CONTENT_W - 28);
      const blockH = enonceLines.length * 15 + 28;
      ensureSpace(blockH + 14);
      // Fond
      page.drawRectangle({
        x: MARGIN_X, y: cursorY - blockH + 8,
        width: CONTENT_W, height: blockH,
        color: BORDEAUX_SOFT,
      });
      // Bord gauche bordeaux (4px)
      page.drawRectangle({
        x: MARGIN_X, y: cursorY - blockH + 8,
        width: 4, height: blockH,
        color: BORDEAUX,
      });
      // Eyebrow
      page.drawText('VIGNETTE CLINIQUE', {
        x: MARGIN_X + 16, y: cursorY - 4,
        size: 8.5, font: fontExtraBold, color: BORDEAUX_DEEP,
      });
      let y = cursorY - 20;
      for (const ln of enonceLines) {
        page.drawText(ln, { x: MARGIN_X + 16, y, size: 11, font: fontRegular, color: INK });
        y -= 15;
      }
      cursorY -= blockH + 14;
    }

    // Questions
    for (const q of sujet.questions) {
      const qText = nettoieTexte(q.text);
      if (!qText) continue;

      // Pré-calcule la hauteur du bloc question pour un saut de page propre
      const qLines = wrap(fontRegular, 11.5, qText, CONTENT_W - 50);
      const totalH = 30 + qLines.length * 16 + 14;
      if (cursorY - totalH < MARGIN_BOTTOM) newPage();

      // Pastille numéro à gauche
      page.drawCircle({
        x: MARGIN_X + 14, y: cursorY - 8,
        size: 13,
        color: BORDEAUX,
      });
      const qN = String(q.num);
      const qNW = fontExtraBold.widthOfTextAtSize(qN, 12);
      page.drawText(qN, {
        x: MARGIN_X + 14 - qNW / 2,
        y: cursorY - 12,
        size: 12,
        font: fontExtraBold,
        color: rgb(1, 1, 1),
      });
      // Label QUESTION (gras, petit, gris)
      page.drawText(`QUESTION ${q.num}`, {
        x: MARGIN_X + 36, y: cursorY - 2,
        size: 9, font: fontBold, color: MUTED,
      });
      cursorY -= 20;

      // Texte de la question — police régulière (pas tout en gras)
      for (const ln of qLines) {
        ensureSpace(16);
        page.drawText(ln, { x: MARGIN_X + 36, y: cursorY, size: 11.5, font: fontRegular, color: INK });
        cursorY -= 16;
      }

      cursorY -= 14;
    }
  }

  drawFooter(page, pageNum, 0);

  return await pdf.save();
}

(async () => {
  for (const f of FILES) {
    try {
      const data = extract(f.src, f.annee, f.type);
      const bytes = await generatePdf(f, data);
      const filename = `${f.annee}_${f.type}.pdf`;
      writeFileSync(path.join(OUT_DIR, filename), bytes);
      const nbS = data.sujets.length;
      const nbQ = data.sujets.reduce((s, sj) => s + sj.questions.length, 0);
      console.log(`OK ${filename} — ${nbS} sujets, ${nbQ} questions, ${bytes.length} bytes`);
    } catch (e) {
      console.error(`FAIL ${f.annee} ${f.type}: ${e.message}`);
    }
  }
})();
