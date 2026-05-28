// Génère 12 PDFs Major ECN brandés pour les annales code 71 (Médecine générale)
// dans data/medgen-annales/. Ces fichiers sont commités au repo et servis via
// la route /api/medgen-annales/[id]/pdf qui applique le watermark utilisateur.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const OUT_DIR = path.resolve('data/medgen-annales');
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

function extract(src) {
  return execSync(`python3 /tmp/extract_doc.py "${src}"`, { encoding: 'utf-8' });
}

function clean(raw) {
  // Élimine les caractères de contrôle ET les caractères hors WinAnsi
  // (pdf-lib utilise WinAnsiEncoding pour les polices standard).
  return raw
    .split('\n')
    .map(l => l
      .replace(/[\x00-\x1f]+/g, ' ')          // contrôles dont \t
      .replace(/[‘’]/g, "'")         // ' ' typo
      .replace(/[“”]/g, '"')         // " " typo
      .replace(/–|—/g, '-')           // tirets
      .replace(/…/g, '...')                // …
      .replace(/ /g, ' ')                  // nbsp
      .replace(/[•‣◦]/g, '·')    // puces
      .replace(/[^\x09\x0a\x0d\x20-\x7e\xa0-\xff]/g, '') // hors WinAnsi
      .trim())
    .filter(l => l.length >= 3 && !/^\W{4,}$/.test(l))
    .join('\n');
}

function splitParagraphs(text) {
  // Détecte les énoncés "N) " (questions numérotées) pour structurer
  const out = [];
  for (const block of text.split(/\n/)) {
    const t = block.trim();
    if (!t) continue;
    out.push(t);
  }
  return out;
}

function wrap(font, size, text, maxWidth) {
  const words = text.split(/(\s+)/);
  const lines = []; let line = '';
  for (const w of words) {
    if (font.widthOfTextAtSize(line + w, size) > maxWidth && line.length > 0) {
      lines.push(line.trimEnd()); line = w.trimStart();
    } else line += w;
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}

async function generatePdf({ annee, type }, content) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontB = await pdf.embedFont(StandardFonts.HelveticaBold);

  const MARGIN = 56;
  const PAGE_W = 595, PAGE_H = 842;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // Couleurs Major ECN (charte fiches)
  const NAVY = rgb(0x0E / 255, 0x16 / 255, 0x26 / 255);
  const BORDEAUX = rgb(0x6B / 255, 0x1A / 255, 0x2A / 255);
  const BORDEAUX_DEEP = rgb(0x4D / 255, 0x12 / 255, 0x1E / 255);
  const INK = rgb(0x2D / 255, 0x2D / 255, 0x2D / 255);
  const MUTED = rgb(0x7A / 255, 0x7A / 255, 0x7A / 255);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let cursorY = PAGE_H - MARGIN;
  let pageNum = 1;

  const drawHeader = () => {
    // Bande navy avec wordmark
    page.drawRectangle({ x: 0, y: PAGE_H - 36, width: PAGE_W, height: 36, color: NAVY });
    page.drawText('Major', { x: MARGIN, y: PAGE_H - 25, size: 14, font: fontB, color: rgb(1, 1, 1) });
    page.drawText('ECN', { x: MARGIN + 42, y: PAGE_H - 25, size: 14, font: fontB, color: rgb(0xC8 / 255, 0x4A / 255, 0x5A / 255) });
    page.drawText(`${type} ${annee} · Médecine générale`, {
      x: PAGE_W - MARGIN - font.widthOfTextAtSize(`${type} ${annee} · Médecine générale`, 10),
      y: PAGE_H - 23, size: 10, font, color: rgb(0.85, 0.85, 0.85),
    });
    // Bande tricolore fine
    const stripe = (x, w, c) => page.drawRectangle({ x, y: PAGE_H - 39, width: w, height: 3, color: c });
    stripe(0, PAGE_W / 3, BORDEAUX);
    stripe(PAGE_W / 3, PAGE_W / 3, rgb(0x3B / 255, 0x82 / 255, 0xF6 / 255));
    stripe((PAGE_W / 3) * 2, PAGE_W / 3, rgb(0x14 / 255, 0xB8 / 255, 0xA6 / 255));
  };

  const drawFooter = () => {
    page.drawRectangle({ x: MARGIN, y: 32, width: CONTENT_W, height: 0.5, color: MUTED });
    page.drawText(`Annales EVC · Médecine générale (code 71) · ${annee}`, { x: MARGIN, y: 18, size: 8, font, color: MUTED });
    const txt = `Page ${pageNum}`;
    page.drawText(txt, { x: PAGE_W - MARGIN - font.widthOfTextAtSize(txt, 8), y: 18, size: 8, font, color: MUTED });
  };

  drawHeader();
  cursorY = PAGE_H - 60;

  // Titre principal
  page.drawText(`${type} — ${annee}`, { x: MARGIN, y: cursorY, size: 28, font: fontB, color: BORDEAUX_DEEP });
  cursorY -= 22;
  page.drawText('Annales officielles EVC', { x: MARGIN, y: cursorY, size: 12, font, color: MUTED });
  cursorY -= 14;
  page.drawText('Médecine générale', { x: MARGIN, y: cursorY, size: 12, font: fontB, color: INK });
  cursorY -= 28;

  const paragraphs = splitParagraphs(content);
  const sizeBody = 11, lineH = 14.5;

  const newPage = () => {
    drawFooter();
    pageNum += 1;
    page = pdf.addPage([PAGE_W, PAGE_H]);
    drawHeader();
    cursorY = PAGE_H - 60;
  };

  for (const para of paragraphs) {
    // Détecte type de paragraphe : sujet/question/item
    const isSujet = /^Sujet\s*\d|^MEDECINE GENERALE|^Epreuve de v/i.test(para);
    const isQuestion = /^\d+\s*[\)\.]/.test(para);
    const f = isSujet ? fontB : font;
    const sz = isSujet ? 13 : sizeBody;
    const col = isSujet ? BORDEAUX_DEEP : INK;

    if (isSujet) cursorY -= 6;

    const lines = wrap(f, sz, para, CONTENT_W);
    for (const ln of lines) {
      if (cursorY < 50) newPage();
      // Pour les énoncés Q : petite barre bordeaux à gauche
      if (isQuestion && ln === lines[0]) {
        page.drawRectangle({ x: MARGIN - 6, y: cursorY - 2, width: 3, height: 11, color: BORDEAUX });
      }
      page.drawText(ln, { x: MARGIN, y: cursorY, size: sz, font: f, color: col, maxWidth: CONTENT_W });
      cursorY -= sz === 13 ? 17 : lineH;
    }
    cursorY -= isSujet ? 4 : 2;
  }
  drawFooter();
  return await pdf.save();
}

(async () => {
  for (const f of FILES) {
    try {
      const raw = extract(f.src);
      const cleanText = clean(raw);
      const bytes = await generatePdf(f, cleanText);
      const filename = `${f.annee}_${f.type}.pdf`;
      writeFileSync(path.join(OUT_DIR, filename), bytes);
      console.log('OK', filename, bytes.length, 'bytes');
    } catch (e) {
      console.error('FAIL', f.annee, f.type, e.message);
    }
  }
})();
