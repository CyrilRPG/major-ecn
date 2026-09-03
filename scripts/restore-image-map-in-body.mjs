import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const [,, bodyArg, mapArg] = process.argv;
if (!bodyArg || !mapArg) throw new Error('usage: node restore-image-map-in-body.mjs <body.html> <image-map.json>');
const bodyPath = resolve(bodyArg), mapPath = resolve(mapArg);
let body = readFileSync(bodyPath, 'utf8');
for (const [token, dataUri] of Object.entries(JSON.parse(readFileSync(mapPath, 'utf8')))) body = body.replaceAll(token, dataUri);
writeFileSync(bodyPath, body, 'utf8');
console.log(`✓ Images restaurées : ${bodyPath}`);
