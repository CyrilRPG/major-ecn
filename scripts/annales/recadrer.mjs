/**
 * Recadrage des figures qui sont en réalité des captures d'écran plein écran.
 *
 * Une partie des corrigés a été composée en photographiant l'écran de l'auteur :
 * la figure utile (diapositive, radiographie, tableau) y flotte au milieu de la
 * barre d'onglets du navigateur avec ses favoris nominatifs, de l'URL du
 * document, de la barre des tâches Windows, voire d'une vignette webcam montrant
 * une personne identifiable. Publier cela tel quel diffuserait des données
 * personnelles de tiers dans un contenu vendu aux élèves.
 *
 * On recadre donc sur le contenu médical. Les coordonnées sont consignées dans
 * `figures/recadrages.json` à côté des sources, pour que le geste reste
 * vérifiable et rejouable — et l'audit exige qu'une image recadrée y figure.
 *
 * Usage :
 *   node scripts/annales/recadrer.mjs --lister --college annales-orthopedie
 *   node scripts/annales/recadrer.mjs --dossier annales-orthopedie/evcf-53-correction \
 *        --figure img-003-008.png --boite 0.18,0.22,0.64,0.60 --motif "capture d’écran navigateur"
 *
 * `--boite` accepte des fractions (0..1) ou des pixels absolus : x,y,largeur,hauteur.
 */
import { pathToFileURL } from 'node:url';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ATELIER } from './extraire.mjs';

const arg = (n) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;

/**
 * Une capture d'écran se reconnaît à sa taille : largeur d'écran usuelle et
 * rapport 16/10 ou 16/9. Une radiographie ou un tableau scanné n'a jamais ces
 * dimensions exactes.
 */
export function estCaptureEcran(largeur, hauteur) {
  const r = largeur / hauteur;
  return largeur >= 1280 && r > 1.45 && r < 2.05;
}

export async function lister(college) {
  const base = join(ATELIER, college);
  const out = [];
  for (const dossier of readdirSync(base)) {
    const fdir = join(base, dossier, 'figures');
    if (!existsSync(fdir)) continue;
    const dejaFait = chargerRecadrages(fdir);
    for (const nom of readdirSync(fdir)) {
      if (!/\.(png|jpg|jpeg|tif|tiff|ppm|pbm)$/i.test(nom)) continue;
      let im;
      try { im = await loadImage(join(fdir, nom)); } catch { continue; }
      if (!estCaptureEcran(im.width, im.height)) continue;
      out.push({
        dossier, figure: nom, largeur: im.width, hauteur: im.height,
        recadree: !!dejaFait[nom],
      });
    }
  }
  return out;
}

/**
 * Boîte du contenu utile dans une capture d'écran, détectée automatiquement.
 *
 * Le contenu pédagogique est posé sur un fond clair (diapositive, document,
 * visionneuse) tandis que le décor à retirer est sombre ou coloré : barre
 * d'onglets, barre des tâches, bandes noires du lecteur vidéo, colonne de
 * recommandations YouTube. On cherche donc la plus grande bande continue de
 * lignes où les pixels clairs dominent, puis la plus grande bande de colonnes
 * — **en ne regardant que les lignes retenues**, et on réitère.
 *
 * Ce va-et-vient est indispensable : compter les colonnes sur toute la hauteur
 * de l'image laisse la barre d'onglets et la barre des tâches, claires et
 * pleine largeur, imposer une boîte large comme l'écran.
 *
 * Renvoie `null` si rien de franc ne se dégage : mieux vaut un recadrage manuel
 * qu'une figure amputée.
 */
export async function boiteAuto(chemin, { seuilClair = 225, part = 0.30, marge = 0.006, passes = 3 } = {}) {
  const im = await loadImage(chemin);
  const L = 480;
  const H = Math.max(1, Math.round(L * im.height / im.width));
  const cv = createCanvas(L, H);
  const ctx = cv.getContext('2d');
  ctx.drawImage(im, 0, 0, L, H);
  const px = ctx.getImageData(0, 0, L, H).data;
  const clair = (x, y) => {
    const i = (y * L + x) * 4;
    return px[i] >= seuilClair && px[i + 1] >= seuilClair && px[i + 2] >= seuilClair;
  };

  /** Plus longue plage d'indices où le compte dépasse `part` du total. */
  const bande = (compte, debutMin, finMax, total) => {
    let meilleur = null, debut = -1;
    for (let i = debutMin; i <= finMax; i++) {
      const ok = i < finMax && compte[i] > part * total;
      if (ok && debut < 0) debut = i;
      if (!ok && debut >= 0) {
        if (!meilleur || i - debut > meilleur[1] - meilleur[0]) meilleur = [debut, i];
        debut = -1;
      }
    }
    return meilleur;
  };

  let x0 = 0, x1 = L, y0 = 0, y1 = H;
  for (let p = 0; p < passes; p++) {
    const parLigne = new Array(H).fill(0);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (clair(x, y)) parLigne[y]++;
    const lignes = bande(parLigne, y0, y1, x1 - x0);
    if (!lignes) return null;
    [y0, y1] = lignes;

    const parColonne = new Array(L).fill(0);
    for (let x = x0; x < x1; x++) for (let y = y0; y < y1; y++) if (clair(x, y)) parColonne[x]++;
    const colonnes = bande(parColonne, x0, x1, y1 - y0);
    if (!colonnes) return null;
    [x0, x1] = colonnes;
  }

  // Une boîte minuscule n'est pas la figure : c'est une puce ou un liseré.
  if ((y1 - y0) < 0.18 * H || (x1 - x0) < 0.18 * L) return null;

  const fx = im.width / L, fy = im.height / H;
  const m = Math.round(marge * im.width);
  const x = Math.max(0, Math.round(x0 * fx) - m);
  const y = Math.max(0, Math.round(y0 * fy) - m);
  const w = Math.min(im.width - x, Math.round((x1 - x0) * fx) + 2 * m);
  const h = Math.min(im.height - y, Math.round((y1 - y0) * fy) + 2 * m);
  return [x, y, w, h];
}

function fichierRecadrages(fdir) { return join(fdir, 'recadrages.json'); }
function chargerRecadrages(fdir) {
  const f = fichierRecadrages(fdir);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {};
}

export async function recadrer({ dossier, figure, boite, motif }) {
  const fdir = join(ATELIER, dossier, 'figures');
  const src = join(fdir, figure);
  if (!existsSync(src)) throw new Error('Figure introuvable : ' + src);
  if (!motif) throw new Error('Un motif de recadrage est obligatoire (traçabilité).');

  const im = await loadImage(src);
  const [a, b, c, d] = boite.split(',').map(Number);
  if ([a, b, c, d].some((n) => !Number.isFinite(n))) throw new Error('--boite attend x,y,largeur,hauteur');
  const frac = [a, b, c, d].every((n) => n >= 0 && n <= 1);
  const x = Math.round(frac ? a * im.width : a);
  const y = Math.round(frac ? b * im.height : b);
  const w = Math.round(frac ? c * im.width : c);
  const h = Math.round(frac ? d * im.height : d);
  if (w <= 0 || h <= 0 || x + w > im.width || y + h > im.height) {
    throw new Error('Boîte hors de l’image (' + im.width + 'x' + im.height + ')');
  }

  const cv = createCanvas(w, h);
  cv.getContext('2d').drawImage(im, x, y, w, h, 0, 0, w, h);
  const dest = join(fdir, 'recadre', figure.replace(/\.\w+$/, '.png'));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, cv.toBuffer('image/png'));

  const reg = chargerRecadrages(fdir);
  reg[figure] = { boite: [x, y, w, h], source: [im.width, im.height], motif, sortie: 'recadre/' + figure.replace(/\.\w+$/, '.png') };
  writeFileSync(fichierRecadrages(fdir), JSON.stringify(reg, null, 2), 'utf8');
  return { dest, x, y, w, h };
}

/**
 * Planche-contact d'un dossier : une seule image regroupant les captures, avec
 * une grille de repères en dixièmes. Elle sert à choisir les boîtes de
 * recadrage en regardant une planche plutôt que 185 fichiers un par un — les
 * captures d'un même corrigé partagent presque toujours la même mise en page,
 * donc la même boîte.
 */
export async function planche(dossier, { colonnes = 3, largeurVignette = 620, depuis = 0, combien = 9, restants = false } = {}) {
  const fdir = join(ATELIER, dossier, 'figures');
  const noms = readdirSync(fdir).filter((n) => /\.(png|jpg|jpeg)$/i.test(n)).sort();
  const dejaFait = chargerRecadrages(fdir);
  const retenus = [];
  for (const nom of noms) {
    let im;
    try { im = await loadImage(join(fdir, nom)); } catch { continue; }
    if (!estCaptureEcran(im.width, im.height)) continue;
    // `--restants` : ne montrer que les captures encore dépourvues de boîte.
    if (restants && dejaFait[nom]) continue;
    retenus.push({ nom, im });
  }
  const lot = retenus.slice(depuis, depuis + combien);
  if (!lot.length) return { fichier: null, total: retenus.length, montrees: 0 };

  const hauteurVignette = Math.round(largeurVignette * lot[0].im.height / lot[0].im.width);
  const marge = 26;
  const lignes = Math.ceil(lot.length / colonnes);
  const cv = createCanvas(colonnes * largeurVignette, lignes * (hauteurVignette + marge));
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, cv.width, cv.height);

  lot.forEach((f, i) => {
    const cx = (i % colonnes) * largeurVignette;
    const cy = Math.floor(i / colonnes) * (hauteurVignette + marge);
    ctx.drawImage(f.im, cx, cy + marge, largeurVignette, hauteurVignette);
    ctx.fillStyle = '#F9FAFB';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText((depuis + i) + ' · ' + f.nom + '  ' + f.im.width + 'x' + f.im.height, cx + 6, cy + 18);
    // Repères en dixièmes : les boîtes se lisent directement en fractions.
    ctx.strokeStyle = 'rgba(239,68,68,0.55)';
    ctx.lineWidth = 1;
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(239,68,68,0.95)';
    for (let k = 1; k < 10; k++) {
      const gx = cx + (k / 10) * largeurVignette;
      const gy = cy + marge + (k / 10) * hauteurVignette;
      ctx.beginPath(); ctx.moveTo(gx, cy + marge); ctx.lineTo(gx, cy + marge + hauteurVignette); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx + largeurVignette, gy); ctx.stroke();
      ctx.fillText('.' + k, gx + 2, cy + marge + 12);
      ctx.fillText('.' + k, cx + 2, gy - 2);
    }
  });

  const dest = join(ATELIER, dossier, 'planche-' + depuis + '.png');
  writeFileSync(dest, cv.toBuffer('image/png'));
  return { fichier: dest, total: retenus.length, montrees: lot.length, noms: lot.map((f) => f.nom) };
}

const MOTIF_DEFAUT = 'capture d’écran : recadrage sur le contenu médical (barre d’onglets et favoris, '
  + 'URL, barre des tâches et vignette webcam retirées)';

/**
 * Recadre les captures d'écran d'un corrigé, CHACUNE avec sa propre boîte.
 *
 * On a d'abord cherché une boîte unique par corrigé, en pariant sur une
 * géométrie constante. Les planches-contact ont infirmé ce pari : dans un même
 * corrigé se côtoient une visionneuse PDF, un lecteur vidéo, une page Facebook
 * et une page YouTube. Aucune boîte commune ne peut à la fois tout conserver et
 * tout nettoyer — la détection se fait donc image par image.
 *
 * Une boîte qui couvre presque toute l'image n'a rien nettoyé : la capture part
 * alors en traitement manuel (`--boite`) plutôt que d'être publiée avec sa
 * barre d'onglets.
 */
export async function recadrerAuto(dossier, { motif = MOTIF_DEFAUT, partMax = 0.80 } = {}) {
  const fdir = join(ATELIER, dossier, 'figures');
  const faits = [], ignores = [], boites = {};
  for (const nom of readdirSync(fdir).sort()) {
    if (!/\.(png|jpg|jpeg)$/i.test(nom)) continue;
    let im;
    try { im = await loadImage(join(fdir, nom)); } catch { continue; }
    if (!estCaptureEcran(im.width, im.height)) continue;

    let b = null;
    for (const reglage of [{ part: 0.30 }, { part: 0.20 }, { part: 0.12 }, { part: 0.12, seuilClair: 170 }]) {
      const c = await boiteAuto(join(fdir, nom), reglage);
      if (c && (c[2] * c[3]) / (im.width * im.height) <= partMax) { b = c; break; }
    }
    if (!b) { ignores.push(nom); continue; }
    await recadrer({ dossier, figure: nom, boite: b.join(','), motif });
    boites[nom] = b;
    faits.push(nom);
  }
  return { faits, ignores, boites };
}

/**
 * Marque une figure comme n'ayant PAS besoin de recadrage.
 *
 * Le détecteur se fonde sur les dimensions : une planche d'anatomie scannée en
 * 1416×851 a le format d'un écran sans en être une. La consigner évite qu'elle
 * ressorte indéfiniment dans les captures « à traiter » — et permet à l'audit
 * d'exiger que toute capture citée soit, elle, bel et bien recadrée.
 */
export function sansRecadrage(dossier, figure, motif) {
  const fdir = join(ATELIER, dossier, 'figures');
  if (!existsSync(join(fdir, figure))) throw new Error('Figure introuvable : ' + figure);
  if (!motif) throw new Error('Un motif est obligatoire (traçabilité).');
  const reg = chargerRecadrages(fdir);
  reg[figure] = { boite: null, sortie: null, motif };
  writeFileSync(fichierRecadrages(fdir), JSON.stringify(reg, null, 2), 'utf8');
}

/** Planche-contact des SORTIES recadrées : une image pour vérifier tout un lot. */
export async function verifier(dossier, { colonnes = 3, largeurVignette = 560 } = {}) {
  const rdir = join(ATELIER, dossier, 'figures', 'recadre');
  if (!existsSync(rdir)) return null;
  const noms = readdirSync(rdir).filter((n) => /\.png$/i.test(n)).sort();
  if (!noms.length) return null;
  const ims = [];
  for (const n of noms) ims.push({ n, im: await loadImage(join(rdir, n)) });
  const hauteurs = ims.map((o) => Math.round(largeurVignette * o.im.height / o.im.width));
  const hMax = Math.max(...hauteurs);
  const marge = 24;
  const lignes = Math.ceil(ims.length / colonnes);
  const cv = createCanvas(colonnes * largeurVignette, lignes * (hMax + marge));
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ims.forEach((o, i) => {
    const x = (i % colonnes) * largeurVignette;
    const y = Math.floor(i / colonnes) * (hMax + marge);
    ctx.drawImage(o.im, x, y + marge, largeurVignette, hauteurs[i]);
    ctx.fillStyle = '#F9FAFB';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(o.n + '  ' + o.im.width + 'x' + o.im.height, x + 6, y + 17);
  });
  const dest = join(ATELIER, dossier, 'verif-recadrages.png');
  writeFileSync(dest, cv.toBuffer('image/png'));
  return { fichier: dest, nombre: ims.length };
}

async function principal() {
  if (process.argv.includes('--sans-recadrage')) {
    for (const figure of (arg('--figure') ?? '').split(',').filter(Boolean)) {
      sansRecadrage(arg('--dossier'), figure, arg('--motif'));
      console.log('sans recadrage : ' + figure);
    }
    return;
  }
  if (process.argv.includes('--verif')) {
    const r = await verifier(arg('--dossier'));
    console.log(r ? r.fichier + '  (' + r.nombre + ' image(s))' : 'aucun recadrage à vérifier');
    return;
  }
  if (process.argv.includes('--auto')) {
    const dossier = arg('--dossier');
    const boiteManuelle = arg('--boite');
    if (boiteManuelle) {
      // Reprise d'un lot mal détecté : une seule boîte, imposée à toutes les
      // captures du corrigé.
      const l = (await lister(dossier.split('/')[0])).filter((c) => dossier.endsWith(c.dossier));
      for (const c of l) await recadrer({ dossier, figure: c.figure, boite: boiteManuelle, motif: MOTIF_DEFAUT });
      console.log(dossier + ' : ' + l.length + ' recadrée(s) avec la boîte imposée ' + boiteManuelle);
      return;
    }
    const r = await recadrerAuto(dossier);
    console.log(dossier + ' : ' + r.faits.length + ' recadrée(s), boîte(s) ' + JSON.stringify(r.boites ?? {})
      + (r.ignores?.length ? ' — ' + r.ignores.length + ' à faire à la main : ' + r.ignores.join(', ') : ''));
    return;
  }
  if (process.argv.includes('--planche')) {
    const r = await planche(arg('--dossier'), {
      depuis: Number(arg('--depuis') ?? 0),
      combien: Number(arg('--combien') ?? 9),
      restants: process.argv.includes('--restants'),
    });
    console.log(r.fichier ? r.fichier + '\n' + r.montrees + '/' + r.total + ' capture(s) : ' + r.noms.join(', ') : 'aucune capture');
    return;
  }
  if (process.argv.includes('--lister')) {
    const college = arg('--college');
    if (!college) throw new Error('--lister exige --college <slug>');
    const l = await lister(college);
    for (const c of l) {
      console.log((c.recadree ? '[fait] ' : '[  à faire  ] ') + c.dossier + '/' + c.figure + '  ' + c.largeur + 'x' + c.hauteur);
    }
    console.log('\n' + l.length + ' capture(s) d’écran, ' + l.filter((c) => !c.recadree).length + ' à recadrer.');
    return;
  }
  const r = await recadrer({
    dossier: arg('--dossier'), figure: arg('--figure'), boite: arg('--boite'), motif: arg('--motif'),
  });
  console.log('Recadré → ' + r.dest + '  (' + r.w + 'x' + r.h + ' à partir de ' + r.x + ',' + r.y + ')');
}

// `process.argv[1]` est absent sous `node -e` : ce module doit rester importable.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await principal();
