import fs from 'node:fs';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const SRC_DIR = 'C:/Users/Admin/Desktop/Major-ecn-projects/contenus/PARCOURS MAJOR';
const OUT_DIR = 'scripts/parcours-pdfs';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function extract(file) {
  const buf = fs.readFileSync(file);
  const pdf = await getDocument({ data: new Uint8Array(buf) }).promise;
  let out = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    out += `\n\n--- PAGE ${i} ---\n` + content.items.map(it => ('str' in it ? it.str : '')).join(' ').replace(/\s+/g, ' ');
  }
  return out.trim();
}

for (let n = 1; n <= 41; n++) {
  const src = path.join(SRC_DIR, `Coaching PAE ${n} 20242025.pdf`);
  if (!fs.existsSync(src)) { console.error('miss', n); continue; }
  const out = path.join(OUT_DIR, `pae-${n}.txt`);
  if (fs.existsSync(out) && fs.statSync(out).size > 100) { continue; }
  try {
    const text = await extract(src);
    fs.writeFileSync(out, text);
    console.log(`ok pae-${n} (${text.length} chars)`);
  } catch (e) {
    console.error('err', n, e.message);
  }
}
