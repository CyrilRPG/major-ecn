/**
 * Injecte les VRAIES images de la fiche « Cardiologie » en ligne (item Révisions,
 * cours 551b3dc8…) dans une fiche-item séparée, par correspondance de légende
 * (alt). La fiche Révisions est la base de référence (correctifs + bonnes images
 * + étoiles). Les placeholders `__IMG_xxx__` de la fiche-item sont remplacés par
 * la balise <img> data-URI extraite de la fiche source.
 *
 * Usage : node scripts/inject-cardio-images.mjs <itemHtmlIn> <itemHtmlOut>
 *
 * Le mapping placeholder → sous-chaîne d'alt est défini ci-dessous.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
dotenv({ path: join(ROOT, '.env.local') });

const [, , inFile, outFile] = process.argv;
if (!inFile || !outFile) { console.error('Usage: node scripts/inject-cardio-images.mjs <in> <out>'); process.exit(1); }

// placeholder → sous-chaîne présente dans l'attribut alt de l'image source
const IMG_MAP = {
  __IMG_LDL_OBJECTIVES__: 'Objectifs thérapeutiques LDL',
  __IMG_ECG_SCA__: 'Tracé ECG 12 dérivations illustrant un syndrome coronarien',
  __IMG_TERRITOIRES_ECG__: 'Territoires ECG et artères coronaires',
  __IMG_REPERFUSION__: 'modes de présentation du patient, composantes du temps',
  __IMG_SCA_NST_ALGO__: 'Algorithme diagnostique du SCA non ST+',
  __IMG_SCA_RISQUE__: 'Stratification du risque ischémique',
  __IMG_ACR_ALGO__: "réanimation médicalisée de l'ACR",
  __IMG_NYHA__: 'Classification de la dyspnée selon la NYHA',
  __IMG_HFREF__: "prise en charge de l'IC à FEVG altérée",
  __IMG_IM_PRIMITIVE__: "prise en charge de l'IM primitive sévère",
  __IMG_CARPENTIER__: 'Classification de Carpentier des insuffisances mitrales',
  __IMG_CARPENTIER_MVT__: 'mouvements valvulaires mitraux selon Carpentier',
  __IMG_TAVI__: 'SAVR vs TAVI dans le RA serré',
  __IMG_DUKE_DETAIL__: 'Critères majeurs (hémocultures, imagerie) et mineurs',
  __IMG_DUKE__: "Critères de Duke pour le diagnostic d'endocardite",
  __IMG_EI_ATB__: "Antibiothérapie empirique de l'endocardite",
  __IMG_EI_CARDIOPATHIES__: "risque (groupe A) et à risque intermédiaire",
  __IMG_PROTHESE_CHOIX__: 'Choix du type de prothèse avant remplacement',
  __IMG_AVK_RELAIS__: 'relais AVK-héparine périopératoire',
  __IMG_EP_RISQUE__: "Stratification du risque de l'EP",
  __IMG_MTEV_PROPHY__: 'Prophylaxie de la MTEV selon le niveau de risque',
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(URL, KEY, { auth: { persistSession: false } });
const { data, error } = await sb.from('fiches').select('content_html')
  .eq('cours_id', '551b3dc8-2bbe-4007-93f7-3768ff1fa181').maybeSingle();
if (error || !data) { console.error('Fiche Révisions introuvable', error?.message); process.exit(1); }
const src = data.content_html;

function findImg(altSub) {
  // capture la balise <img ...> dont l'alt contient altSub
  const re = new RegExp('<img\\b[^>]*alt="[^"]*' + altSub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^"]*"[^>]*>', 'i');
  const m = re.exec(src);
  return m ? m[0] : null;
}

let html = readFileSync(resolve(inFile), 'utf8');
let injected = 0, missing = [];
for (const [ph, altSub] of Object.entries(IMG_MAP)) {
  if (!html.includes(ph)) continue;
  const tag = findImg(altSub);
  if (!tag) { missing.push(ph); continue; }
  // largeur raisonnable pour l'impression
  const tag2 = tag.replace(/<img\b/i, '<img style="max-width:100%;height:auto;border-radius:4px"');
  html = html.replaceAll(ph, tag2);
  injected++;
}
if (missing.length) console.warn('⚠ images non trouvées :', missing.join(', '));
writeFileSync(resolve(outFile), html, 'utf8');
console.log(`✔ ${injected} image(s) injectée(s) → ${outFile}`);
