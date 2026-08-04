import fs from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/_extract_pae.mjs <pdf>'); process.exit(1); }
const buf = fs.readFileSync(src);
const uint8 = new Uint8Array(buf);
const pdf = await getDocument({ data: uint8 }).promise;
let out = '';
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  const items = content.items.map(it => ('str' in it ? it.str : ''));
  out += `\n\n--- PAGE ${i} ---\n` + items.join(' ').replace(/\s+/g, ' ');
}
process.stdout.write(out);
