// Génère les PDFs Major ECN brandés pour les annales EVC – Médecine générale.
// Pipeline : parse_annale_doc.py (extraction structurée) → pdf-lib avec
// Plus Jakarta Sans embeddée.
//
// Design :
//   - Page de garde : logo Major ECN unique, titre EVCF/EVCP YYYY, encart
//     « N sujets · N questions », bande tricolore en haut/bas.
//   - Chaque sujet sur une nouvelle page.
//   - Vignette clinique dans un encadré bordeaux soft (fond + filet gauche).
//   - Questions numérotées (pastille bordeaux), label « QUESTION N »,
//     texte en police régulière (taille 11.5, leading 16) — pas de gras
//     sur le corps de la question.
//   - Watermark identité appliqué côté serveur (route PDF), pas dans le
//     fichier source.

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

// ─── Palette Major ECN ───────────────────────────────────────────────────────
const BORDEAUX        = rgb(0x6B / 255, 0x1A / 255, 0x2A / 255);
const BORDEAUX_DEEP   = rgb(0x4D / 255, 0x12 / 255, 0x1E / 255);
const BORDEAUX_SOFT   = rgb(0xFB / 255, 0xF5 / 255, 0xF6 / 255);
const INK             = rgb(0x1F / 255, 0x29 / 255, 0x37 / 255);
const INK_SOFT        = rgb(0x4B / 255, 0x55 / 255, 0x63 / 255);
const MUTED           = rgb(0x9A / 255, 0xA1 / 255, 0xAE / 255);
const BORDER          = rgb(0xE5 / 255, 0xE7 / 255, 0xEB / 255);
const CREAM           = rgb(0xFA / 255, 0xFA / 255, 0xF8 / 255);
const WHITE           = rgb(1, 1, 1);
const BLUE            = rgb(0x3B / 255, 0x82 / 255, 0xF6 / 255);
const TEAL            = rgb(0x14 / 255, 0xB8 / 255, 0xA6 / 255);

// ─── Géométrie ───────────────────────────────────────────────────────────────
const PAGE_W = 595, PAGE_H = 842;        // A4 portrait, points
const MARGIN_X = 60;
const HEADER_H = 38;                     // bandeau identité
const FOOTER_H = 36;
const CONTENT_TOP = PAGE_H - HEADER_H - 24;
const CONTENT_BOTTOM = FOOTER_H + 14;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// ─── Utils ───────────────────────────────────────────────────────────────────
function nettoieTexte(s) {
  if (!s) return '';
  return s
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x08\x0b-\x1f]+/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, '-')
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

// ─── Rendu PDF ───────────────────────────────────────────────────────────────
async function generatePdf({ annee, type }, data) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fontRegular   = await pdf.embedFont(readFileSync(path.join(FONT_DIR, 'PlusJakartaSans-Regular.ttf')));
  const fontBold      = await pdf.embedFont(readFileSync(path.join(FONT_DIR, 'PlusJakartaSans-Bold.ttf')));
  const fontExtraBold = await pdf.embedFont(readFileSync(path.join(FONT_DIR, 'PlusJakartaSans-ExtraBold.ttf')));

  let logoImage = null;
  try {
    if (existsSync(LOGO_PATH)) logoImage = await pdf.embedPng(readFileSync(LOGO_PATH));
  } catch {/* ignore */}

  // ---- helpers de page ------------------------------------------------------
  const tricolor = (page, y, height = 3) => {
    page.drawRectangle({ x: 0,            y, width: PAGE_W / 3, height, color: BORDEAUX });
    page.drawRectangle({ x: PAGE_W / 3,   y, width: PAGE_W / 3, height, color: BLUE });
    page.drawRectangle({ x: 2 * PAGE_W / 3, y, width: PAGE_W / 3, height, color: TEAL });
  };

  const drawPageHeader = (page, sujetLabel) => {
    // Bandeau supérieur sobre : titre annale à gauche, mention sujet à droite.
    const y = PAGE_H - HEADER_H;
    page.drawRectangle({ x: 0, y, width: PAGE_W, height: HEADER_H, color: CREAM });
    page.drawRectangle({ x: 0, y, width: PAGE_W, height: 0.5, color: BORDER });
    // Titre annale
    const left = `${type} ${annee} · Médecine générale`;
    page.drawText(left, {
      x: MARGIN_X, y: y + 14,
      size: 9.5, font: fontBold, color: BORDEAUX_DEEP,
    });
    // Sujet courant (à droite)
    if (sujetLabel) {
      const rightTxt = sujetLabel;
      const rw = fontRegular.widthOfTextAtSize(rightTxt, 9.5);
      page.drawText(rightTxt, {
        x: PAGE_W - MARGIN_X - rw, y: y + 14,
        size: 9.5, font: fontRegular, color: INK_SOFT,
      });
    }
    tricolor(page, y - 3, 2.5);
  };

  const drawPageFooter = (page, pageNum) => {
    // Filet + pagination + signature discrète
    page.drawRectangle({ x: MARGIN_X, y: FOOTER_H + 8, width: CONTENT_W, height: 0.4, color: BORDER });
    page.drawText('Annales officielles EVC · Médecine générale', {
      x: MARGIN_X, y: FOOTER_H - 10,
      size: 8, font: fontRegular, color: MUTED,
    });
    const txt = `${pageNum}`;
    const txtW = fontBold.widthOfTextAtSize(txt, 9);
    page.drawText(txt, {
      x: PAGE_W - MARGIN_X - txtW, y: FOOTER_H - 10,
      size: 9, font: fontBold, color: BORDEAUX_DEEP,
    });
  };

  // ─── PAGE DE GARDE ─────────────────────────────────────────────────────────
  const cover = pdf.addPage([PAGE_W, PAGE_H]);
  cover.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: CREAM });
  // Bande tricolore en haut et en bas
  tricolor(cover, PAGE_H - 6, 6);
  tricolor(cover, 0, 6);

  // Logo Major ECN — un seul, centré, haut de page
  if (logoImage) {
    const targetW = 130;
    const scale = targetW / logoImage.width;
    const w = logoImage.width * scale;
    const h = logoImage.height * scale;
    cover.drawImage(logoImage, {
      x: (PAGE_W - w) / 2,
      y: PAGE_H - h - 80,
      width: w,
      height: h,
      opacity: 1,
    });
  }

  // Bloc central
  const centerY = PAGE_H * 0.50;
  const eyebrow = 'ANNALES OFFICIELLES EVC';
  cover.drawText(eyebrow, {
    x: (PAGE_W - fontBold.widthOfTextAtSize(eyebrow, 11)) / 2,
    y: centerY + 90,
    size: 11, font: fontBold, color: BORDEAUX,
  });
  // Titre principal
  const titre = `${type} ${annee}`;
  const titreSize = 68;
  cover.drawText(titre, {
    x: (PAGE_W - fontExtraBold.widthOfTextAtSize(titre, titreSize)) / 2,
    y: centerY + 18,
    size: titreSize, font: fontExtraBold, color: BORDEAUX_DEEP,
  });
  // Sous-titre type d'épreuve
  const sub = type === 'EVCF' ? 'Épreuve de vérification des connaissances fondamentales'
                              : 'Épreuve de vérification des connaissances pratiques';
  const subW = fontRegular.widthOfTextAtSize(sub, 12);
  cover.drawText(sub, {
    x: (PAGE_W - subW) / 2, y: centerY - 4,
    size: 12, font: fontRegular, color: INK_SOFT,
  });
  // Discipline
  const discipline = 'Médecine générale';
  cover.drawText(discipline, {
    x: (PAGE_W - fontBold.widthOfTextAtSize(discipline, 16)) / 2,
    y: centerY - 36,
    size: 16, font: fontBold, color: INK,
  });

  // Encart info
  const nbSujets = data.sujets.length;
  const nbQ = data.sujets.reduce((s, sj) => s + sj.questions.length, 0);
  const cardY = 120;
  const cardH = 96;
  cover.drawRectangle({ x: MARGIN_X, y: cardY, width: CONTENT_W, height: cardH, color: WHITE });
  cover.drawRectangle({ x: MARGIN_X, y: cardY, width: CONTENT_W, height: cardH, borderColor: BORDER, borderWidth: 0.6 });
  cover.drawRectangle({ x: MARGIN_X, y: cardY + cardH - 4, width: CONTENT_W, height: 4, color: BORDEAUX });

  // Stats : nb sujets | nb questions
  const colW = CONTENT_W / 2;
  cover.drawText('SUJETS', {
    x: MARGIN_X + 28, y: cardY + cardH - 36,
    size: 9, font: fontBold, color: MUTED,
  });
  cover.drawText(String(nbSujets), {
    x: MARGIN_X + 28, y: cardY + 24,
    size: 32, font: fontExtraBold, color: BORDEAUX_DEEP,
  });
  // Séparateur vertical
  cover.drawRectangle({ x: MARGIN_X + colW, y: cardY + 16, width: 0.6, height: cardH - 36, color: BORDER });
  cover.drawText('QUESTIONS', {
    x: MARGIN_X + colW + 28, y: cardY + cardH - 36,
    size: 9, font: fontBold, color: MUTED,
  });
  cover.drawText(String(nbQ), {
    x: MARGIN_X + colW + 28, y: cardY + 24,
    size: 32, font: fontExtraBold, color: BORDEAUX_DEEP,
  });

  // Mention bas de cover
  const mention = 'Document à usage personnel · Reproduction interdite';
  const mentionW = fontRegular.widthOfTextAtSize(mention, 9);
  cover.drawText(mention, {
    x: (PAGE_W - mentionW) / 2, y: 28,
    size: 9, font: fontRegular, color: MUTED,
  });

  // ─── PAGES CONTENU ─────────────────────────────────────────────────────────
  let page;
  let cursorY;
  let pageNum = 1; // la cover compte
  let currentSujetLabel = '';

  const newContentPage = () => {
    pageNum += 1;
    page = pdf.addPage([PAGE_W, PAGE_H]);
    drawPageHeader(page, currentSujetLabel);
    drawPageFooter(page, pageNum);
    cursorY = CONTENT_TOP;
  };

  const ensure = (need) => {
    if (cursorY - need < CONTENT_BOTTOM) newContentPage();
  };

  for (let si = 0; si < data.sujets.length; si++) {
    const sujet = data.sujets[si];
    currentSujetLabel = sujet.label;

    // Chaque sujet sur sa propre page
    newContentPage();

    // ---- Bandeau « SUJET N » ------------------------------------------------
    // Pastille bordeaux + numéro + libellé latin
    const num = String(si + 1).padStart(2, '0');
    // Eyebrow
    page.drawText('SUJET', {
      x: MARGIN_X, y: cursorY,
      size: 10, font: fontBold, color: BORDEAUX,
    });
    cursorY -= 16;
    // Numéro géant
    page.drawText(num, {
      x: MARGIN_X, y: cursorY - 28,
      size: 40, font: fontExtraBold, color: BORDEAUX_DEEP,
    });
    const numW = fontExtraBold.widthOfTextAtSize(num, 40);
    // Mention « Cas clinique · n questions »
    const meta = `Cas clinique · ${sujet.questions.length} question${sujet.questions.length > 1 ? 's' : ''}`;
    page.drawText(meta, {
      x: MARGIN_X + numW + 14,
      y: cursorY - 16,
      size: 10, font: fontRegular, color: INK_SOFT,
    });
    cursorY -= 50;
    // Filet de séparation
    page.drawRectangle({ x: MARGIN_X, y: cursorY, width: CONTENT_W, height: 0.6, color: BORDER });
    cursorY -= 22;

    // ---- Vignette clinique --------------------------------------------------
    const enonceClean = nettoieTexte(sujet.enonce);
    if (enonceClean && enonceClean.length > 20) {
      const sz = 11;
      const lh = 16;
      const innerPad = 18;
      const innerW = CONTENT_W - innerPad * 2 - 4; // -4 pour la barre gauche
      const lines = wrap(fontRegular, sz, enonceClean, innerW);
      // Eyebrow au-dessus
      page.drawText('VIGNETTE CLINIQUE', {
        x: MARGIN_X + 4, y: cursorY,
        size: 8.5, font: fontBold, color: BORDEAUX,
      });
      cursorY -= 14;
      // Hauteur du bloc
      const blockH = innerPad + lines.length * lh + innerPad - (lh - sz);
      // Si pas assez de place pour au moins 3 lignes, on saute de page
      const minH = innerPad + 3 * lh + innerPad;
      if (cursorY - Math.min(blockH, minH) < CONTENT_BOTTOM) {
        newContentPage();
      }
      // On dessine en plusieurs morceaux si débordement
      let renderedFrom = 0;
      while (renderedFrom < lines.length) {
        const available = cursorY - CONTENT_BOTTOM - innerPad * 2;
        const linesFit = Math.max(1, Math.floor(available / lh));
        const linesToDraw = lines.slice(renderedFrom, renderedFrom + linesFit);
        const drawH = innerPad + linesToDraw.length * lh + innerPad - (lh - sz);
        // Fond
        page.drawRectangle({
          x: MARGIN_X, y: cursorY - drawH,
          width: CONTENT_W, height: drawH,
          color: BORDEAUX_SOFT,
        });
        // Filet gauche bordeaux
        page.drawRectangle({
          x: MARGIN_X, y: cursorY - drawH,
          width: 3, height: drawH,
          color: BORDEAUX,
        });
        // Texte
        let ly = cursorY - innerPad - sz + 2;
        for (const ln of linesToDraw) {
          page.drawText(ln, { x: MARGIN_X + innerPad + 4, y: ly, size: sz, font: fontRegular, color: INK });
          ly -= lh;
        }
        cursorY -= drawH;
        renderedFrom += linesToDraw.length;
        if (renderedFrom < lines.length) {
          newContentPage();
        }
      }
      cursorY -= 22;
    }

    // ---- Questions ---------------------------------------------------------
    for (const q of sujet.questions) {
      const qText = nettoieTexte(q.text);
      if (!qText) continue;

      const sz = 11.5;
      const lh = 16;
      const innerLeft = 40; // espace réservé au numéro
      const qLines = wrap(fontRegular, sz, qText, CONTENT_W - innerLeft);
      const labelH = 18;
      const blockH = labelH + qLines.length * lh + 18;

      // Si trop bas, saute de page (en gardant le sujet courant en header)
      if (cursorY - blockH < CONTENT_BOTTOM) newContentPage();

      // Pastille numéro (cercle bordeaux + chiffre blanc)
      page.drawCircle({
        x: MARGIN_X + 12, y: cursorY - 8,
        size: 13,
        color: BORDEAUX,
      });
      const qN = String(q.num);
      const qNS = qN.length === 1 ? 11 : 10;
      const qNW = fontExtraBold.widthOfTextAtSize(qN, qNS);
      page.drawText(qN, {
        x: MARGIN_X + 12 - qNW / 2,
        y: cursorY - 12,
        size: qNS, font: fontExtraBold, color: WHITE,
      });
      // Label « QUESTION N »
      page.drawText(`QUESTION ${q.num}`, {
        x: MARGIN_X + innerLeft - 8, y: cursorY - 2,
        size: 8.5, font: fontBold, color: BORDEAUX,
      });
      cursorY -= labelH;

      // Texte de la question (régulier, pas en gras)
      let ly = cursorY;
      for (const ln of qLines) {
        // Saut de page si nécessaire au milieu d'une question
        if (ly < CONTENT_BOTTOM + lh) {
          newContentPage();
          ly = cursorY;
        }
        page.drawText(ln, { x: MARGIN_X + innerLeft - 8, y: ly, size: sz, font: fontRegular, color: INK });
        ly -= lh;
      }
      cursorY = ly - 4;

      // Propositions (vrai/faux) — rendues en liste avec case à cocher
      if (q.propositions && q.propositions.length) {
        cursorY -= 6;
        // Eyebrow « Propositions »
        if (cursorY < CONTENT_BOTTOM + 30) newContentPage();
        page.drawText('PROPOSITIONS · cochez VRAI ou FAUX', {
          x: MARGIN_X + innerLeft - 8, y: cursorY,
          size: 8, font: fontBold, color: BORDEAUX,
        });
        cursorY -= 14;
        for (let pi = 0; pi < q.propositions.length; pi++) {
          const pText = nettoieTexte(q.propositions[pi]);
          if (!pText) continue;
          const propLines = wrap(fontRegular, 10.5, pText, CONTENT_W - innerLeft - 60);
          const pBlockH = propLines.length * 14 + 4;
          if (cursorY - pBlockH < CONTENT_BOTTOM) newContentPage();
          // Cases ☐ V / ☐ F
          const boxY = cursorY - 9;
          const boxSize = 9;
          // V
          page.drawRectangle({
            x: MARGIN_X + innerLeft - 8, y: boxY, width: boxSize, height: boxSize,
            borderColor: INK_SOFT, borderWidth: 0.6,
          });
          page.drawText('V', {
            x: MARGIN_X + innerLeft - 8 + boxSize + 3, y: boxY + 1,
            size: 7.5, font: fontBold, color: INK_SOFT,
          });
          // F
          page.drawRectangle({
            x: MARGIN_X + innerLeft - 8 + boxSize + 14, y: boxY, width: boxSize, height: boxSize,
            borderColor: INK_SOFT, borderWidth: 0.6,
          });
          page.drawText('F', {
            x: MARGIN_X + innerLeft - 8 + boxSize * 2 + 17, y: boxY + 1,
            size: 7.5, font: fontBold, color: INK_SOFT,
          });
          // Texte de la proposition
          let py = cursorY;
          const txOffset = innerLeft - 8 + boxSize * 2 + 30;
          for (const ln of propLines) {
            if (py < CONTENT_BOTTOM + 14) newContentPage();
            page.drawText(ln, { x: MARGIN_X + txOffset, y: py, size: 10.5, font: fontRegular, color: INK });
            py -= 14;
          }
          cursorY = py - 2;
        }
      }

      cursorY -= 10;
    }
  }

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
