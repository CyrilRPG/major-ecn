import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile } from 'node:fs/promises';
const f = process.argv[2];
const doc = await getDocument({ data: new Uint8Array(await readFile(f)) }).promise;
let chars = 0;
for (let i = 1; i <= doc.numPages; i++) {
  const tc = await (await doc.getPage(i)).getTextContent();
  chars += tc.items.map(x => x.str).join(' ').length;
}
console.log(`${f.split(/[\/]/).pop()} → ${doc.numPages} pages, ~${chars} caractères`);
