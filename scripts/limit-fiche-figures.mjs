/**
 * Limite une fiche à un nombre de figures source utile pour sa pagination.
 * Les premières figures correspondent à la progression du corpus ; les
 * suivantes sont retirées du HTML sans créer d'illustration de remplacement.
 * Usage: node scripts/limit-fiche-figures.mjs <body.html> <maximum>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
const maximum = Number.parseInt(process.argv[3] || '', 10);
if (!process.argv[2] || !Number.isInteger(maximum) || maximum < 1) process.exit(1);
const body = readFileSync(path, 'utf8');
let count = 0;
const repaired = body.replace(/<figure\b[\s\S]*?<\/figure>|<div\b[^>]*\bft-image-block\b[^>]*>[\s\S]*?<\/div>/g, (figure) => (++count <= maximum ? figure : ''));
writeFileSync(path, repaired, 'utf8');
console.log(`✓ Figures conservées : ${Math.min(count, maximum)}/${count}`);
