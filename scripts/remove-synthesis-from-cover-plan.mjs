import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const path = resolve(process.argv[2] || '');
if (!process.argv[2]) process.exit(1);
const body = readFileSync(path, 'utf8');
const repaired = body.replace(/<li class="cover-plan-item">[\s\S]*?Synthèse[\s\S]*?<\/li>/i, '');
if (repaired === body) process.exit(2);
writeFileSync(path, repaired, 'utf8');
console.log(`✓ Synthèse retirée du plan de garde : ${path}`);
