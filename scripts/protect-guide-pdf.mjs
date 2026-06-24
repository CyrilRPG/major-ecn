/**
 * Protect Guide PDF from Word conversion.
 *
 * Techniques applied:
 * 1. Add dozens of invisible text overlays per page at random positions
 *    with garbled text in tiny font sizes (0.1-0.5pt) and zero opacity.
 *    PDF-to-Word converters extract these as noise, corrupting output.
 * 2. Add overlapping invisible text blocks that break text flow reordering.
 * 3. Set PDF metadata to discourage conversion.
 *
 * Usage: node scripts/protect-guide-pdf.mjs <input.pdf> <output.pdf>
 */
import { readFileSync, writeFileSync } from 'fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const GARBLE_WORDS = [
  'aX7q', 'Zt3m', 'rK9p', 'wE2n', 'bJ6v', 'fL1c', 'yH4d', 'uQ8s',
  'gN5x', 'iA0w', 'oT7r', 'eP3k', 'dM9l', 'cB2j', 'vF6h', 'xW1g',
  'sR4f', 'kG8t', 'mD5y', 'nU0z', 'pI7a', 'lO3b', 'jC9e', 'hV2i',
  'tX6o', 'qY1u', 'wA4p', 'zE8r', 'aK5s', 'bN0d', 'cQ7f', 'dL3g',
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateGarbleBlock(wordCount = 30) {
  return shuffle([...GARBLE_WORDS])
    .slice(0, wordCount)
    .join(' ');
}

async function protectPdf(inputPath, outputPath) {
  console.log(`Reading ${inputPath}...`);
  const inputBytes = readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(inputBytes, { ignoreEncryption: true });

  const pages = pdfDoc.getPages();
  console.log(`PDF has ${pages.length} pages`);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Add 30-50 invisible text fragments at random positions per page
    const fragmentCount = 30 + Math.floor(Math.random() * 20);
    for (let f = 0; f < fragmentCount; f++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 0.1 + Math.random() * 0.4; // 0.1-0.5pt — invisible at any zoom
      const garble = generateGarbleBlock(5 + Math.floor(Math.random() * 10));

      page.drawText(garble, {
        x, y, size, font,
        color: rgb(1, 1, 1),
        opacity: 0.001, // nearly invisible but extractable by converters
      });
    }

    // Add a large invisible text grid that disrupts text flow ordering
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 5; col++) {
        page.drawText(generateGarbleBlock(8), {
          x: col * (width / 5) + Math.random() * 20,
          y: row * (height / 10) + Math.random() * 20,
          size: 0.2,
          font,
          color: rgb(1, 1, 1),
          opacity: 0.001,
        });
      }
    }

    if ((i + 1) % 10 === 0) console.log(`  Processed ${i + 1}/${pages.length} pages`);
  }

  // Set document metadata
  pdfDoc.setTitle('Guide Methodologie EVC 2026 — Major ECN');
  pdfDoc.setAuthor('Major ECN');
  pdfDoc.setSubject('Document protege — Reproduction interdite');
  pdfDoc.setCreator('Major ECN');
  pdfDoc.setProducer('Major ECN — Document securise');

  console.log('Saving protected PDF...');
  const pdfBytes = await pdfDoc.save();
  writeFileSync(outputPath, pdfBytes);
  console.log(`Protected PDF written to ${outputPath} (${(pdfBytes.length / 1024 / 1024).toFixed(1)} MB)`);
}

const [,, input, output] = process.argv;
if (!input || !output) {
  console.error('Usage: node scripts/protect-guide-pdf.mjs <input.pdf> <output.pdf>');
  process.exit(1);
}

protectPdf(input, output).catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
