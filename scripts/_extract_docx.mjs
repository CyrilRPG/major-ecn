// Extrait le texte d'un .docx (unzip + parse word/document.xml).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const src = process.argv[2];
const tmpDir = fs.mkdtempSync(process.cwd() + '/scripts/parcours-pdfs/_docx-');
spawnSync('powershell.exe', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${src}' -DestinationPath '${tmpDir}' -Force`], { stdio: 'inherit' });
const xml = fs.readFileSync(tmpDir + '/word/document.xml', 'utf8');
// Concatène tous les <w:t>…</w:t> avec espaces
const parts = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]);
process.stdout.write(parts.join(' ').replace(/\s+/g, ' '));
fs.rmSync(tmpDir, { recursive: true, force: true });
