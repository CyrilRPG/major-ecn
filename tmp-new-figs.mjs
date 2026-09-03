/**
 * LECTURE SEULE — images que le seuil MIN=90 rend disponibles alors qu'elles
 * étaient écartées auparavant (MIN=200), et qui ne sont donc référencées nulle
 * part dans tmp-seances-data.mjs. Affiche leurs dimensions pour trancher.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SEANCES } from './tmp-seances-data.mjs';

const OLD = 'C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin-Desktop-Major-ecn-projects/0ebfa447-4e7a-4639-829c-ef74cc6400cb/scratchpad/extraits';
const NEW = 'C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin-Desktop-Major-ecn-projects/3436d771-cbd1-48ef-bc86-9c61af22d0fa/scratchpad/verif';

for (const s of SEANCES) {
  const refs = new Set(s.questions.flatMap((q) => q.images ?? []));
  const oldDir = path.join(OLD, s.src, 'img');
  const anciennes = fs.existsSync(oldDir) ? new Set(fs.readdirSync(oldDir)) : new Set();
  const j = JSON.parse(fs.readFileSync(path.join(NEW, s.src, 'extract.json'), 'utf8'));

  const nouvelles = [];
  for (const p of j.pages) {
    for (const im of p.images ?? []) {
      if (!im.file) continue;
      const f = path.basename(im.file);
      if (anciennes.has(f)) continue;              // déjà disponible avant
      nouvelles.push({ f, p: p.page, w: im.w, h: im.h, ref: refs.has(f) });
    }
  }
  if (!nouvelles.length) continue;
  console.log(`\n=== ${s.src} — ${nouvelles.length} image(s) nouvellement disponibles (MIN 200 -> 90) ===`);
  for (const n of nouvelles) {
    const ratio = (Math.max(n.w, n.h) / Math.min(n.w, n.h)).toFixed(1);
    console.log(`  p${String(n.p).padStart(3)}  ${String(n.w).padStart(4)}x${String(n.h).padStart(4)}  ratio ${ratio.padStart(4)}  ${n.ref ? 'RÉFÉRENCÉE' : '—'}  ${n.f}`);
  }
}
