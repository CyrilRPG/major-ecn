/**
 * LECTURE SEULE — vérifie que chaque image référencée par tmp-seances-data.mjs
 * existe toujours, dans l'ancienne extraction (extraits/, celle que
 * tmp-seances-run.mjs consomme) ET dans la nouvelle (verif/, MIN=90).
 * Signale aussi les images DISPONIBLES mais jamais référencées.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SEANCES } from './tmp-seances-data.mjs';

const OLD = 'C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin-Desktop-Major-ecn-projects/0ebfa447-4e7a-4639-829c-ef74cc6400cb/scratchpad/extraits';
const NEW = 'C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin-Desktop-Major-ecn-projects/3436d771-cbd1-48ef-bc86-9c61af22d0fa/scratchpad/verif';

const has = (base, src, f) => fs.existsSync(path.join(base, src, 'img', f));
const pngs = (base, src) => {
  const d = path.join(base, src, 'img');
  return fs.existsSync(d) ? new Set(fs.readdirSync(d).filter((f) => f.endsWith('.png'))) : new Set();
};

let koOld = 0, koNew = 0, tot = 0;
console.log('src'.padEnd(17) + 'réf.  manq.anc  manq.nouv  dispo.anc  dispo.nouv  jamais référencées');
for (const s of SEANCES) {
  const refs = [...new Set(s.questions.flatMap((q) => q.images ?? []))];
  const mo = refs.filter((f) => !has(OLD, s.src, f));
  const mn = refs.filter((f) => !has(NEW, s.src, f));
  const dispoOld = pngs(OLD, s.src), dispoNew = pngs(NEW, s.src);
  const jamais = [...dispoNew].filter((f) => !refs.includes(f));
  tot += refs.length; koOld += mo.length; koNew += mn.length;
  console.log(
    s.src.padEnd(17) + String(refs.length).padStart(3) + String(mo.length).padStart(9) +
    String(mn.length).padStart(10) + String(dispoOld.size).padStart(11) + String(dispoNew.size).padStart(11) +
    String(jamais.length).padStart(15)
  );
  if (mo.length) console.log('   MANQUANTES (anc.) : ' + mo.join(', '));
  if (mn.length) console.log('   MANQUANTES (nouv.) : ' + mn.join(', '));
}
console.log(`\n${tot} référence(s) — ${koOld} introuvable(s) dans extraits/, ${koNew} dans verif/`);
