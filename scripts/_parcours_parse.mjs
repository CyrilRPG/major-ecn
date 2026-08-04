/**
 * Parse les textes bruts extraits des « Coaching PAE » en une structure prête
 * à insérer dans Supabase. Produit `scripts/parcours-pdfs/parcours.json`.
 *
 * Convention (arbitrages voir memory parcours-du-major) :
 *  - Parcours N = introduction + cas clinique du PDF N (dénommé « CAS CLINIQUE
 *    DE LA SEMAINE ») ;
 *  - Correction des questions QROC/QCM du cas = « Correction du cas clinique
 *    de la semaine précédente » du PDF N+1 ;
 *  - Parcours 41 n'a pas de PDF suivant → corrections vides.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'scripts/parcours-pdfs';

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const normalise = (s) =>
  s
    .replace(/\s+/g, ' ')
    .replace(/ /g, ' ')
    .trim();

const stripBoilerplate = (txt) =>
  txt
    .replace(/---\s*PAGE\s*\d+\s*---/g, ' ')
    .replace(/PAE Formation[^]*?ce contenu est interdite/g, ' ');

/** Découpe une longue chaîne en paragraphes lisibles SANS jamais couper
 *  une phrase au milieu. Regroupe 3–5 phrases en un paragraphe. */
function paragraphier(txt) {
  const t = normalise(txt);
  if (!t) return [];
  // Découpe stricte en phrases (point / !!! / ?).
  const phrases = t.match(/[^.!?]+(?:[.!?]+["»]?|$)/g) ?? [t];
  const groups = [];
  let buf = [];
  let acc = 0;
  for (const raw of phrases) {
    const p = raw.trim();
    if (!p) continue;
    buf.push(p);
    acc += p.length;
    if (acc > 500 || buf.length >= 4) {
      groups.push(buf.join(' '));
      buf = [];
      acc = 0;
    }
  }
  if (buf.length > 0) groups.push(buf.join(' '));
  return groups.filter((p) => p.length > 30);
}

/** Titre + sous-titre thématiques devinés d'après le premier paragraphe. */
function deviner(paragraphes) {
  const p0 = (paragraphes[0] || '').toLowerCase();
  const c = (mot) => p0.includes(mot);
  if (c('bienvenue') && (c('préparation') || c('coaching n°1'))) return { titre: 'Bien démarrer sa préparation', sousTitre: 'Méthode de travail' };
  if (c('mémoire') || c('retenir') || c('mémoriser')) return { titre: 'Mémoriser efficacement ses cours', sousTitre: 'Techniques de mémorisation' };
  if (c('énoncé') || c('lecture active')) return { titre: 'Bien lire l’énoncé', sousTitre: 'Décortiquer un cas clinique' };
  if (c('qcm')) return { titre: 'Répondre aux QCM', sousTitre: 'Méthodologie des QCM' };
  if (c('qroc') || c('réponse courte')) return { titre: 'Répondre aux QROC', sousTitre: 'Méthodologie des réponses courtes' };
  if (c('rédactionnel') || c('rédiger')) return { titre: 'Rédiger ses réponses', sousTitre: 'Structurer une réponse rédactionnelle' };
  if (c('temps') || c('gestion')) return { titre: 'Gérer son temps', sousTitre: 'Organisation & timing' };
  if (c('stress') || c('gestion du stress')) return { titre: 'Gérer son stress', sousTitre: 'Approche mentale' };
  return { titre: null, sousTitre: null };
}

/** Extrait les sections d'un PDF : rappel, cas clinique, correction précédente.
 *  Les en-têtes de section ne se distinguent QUE par leur casse dans la source :
 *  « CAS CLINIQUE DE LA SEMAINE » (haut de page 4) vs « cas cliniques » (mot du
 *  rappel). On matche donc l'entête FORT (majuscules) OU la forme minuscule
 *  précédée d'un séparateur nettement page-like. */
function decouper(raw) {
  const norm = normalise(stripBoilerplate(raw));

  const RX_CAS = /(?:CAS CLINIQUES?(?:\s+DE\s+LA\s+SEMAINE)?|Cas cliniques?\s+de\s+la\s+semaine)/;
  // Fallback : « Cas clinique » (sans « de la semaine »), rare mais utilisé
  // dans certains coachings — on ne le considère comme un titre de section que
  // s'il apparaît suffisamment loin dans le PDF (après le rappel).
  const RX_CAS_FB = /(?:^|[.!?…»]\s+)Cas clinique(?:s)?\s+(?!(?:de\s+la\s+semaine|de\s+l|clinique))/;
  const RX_COR = /Correction du cas clinique(?:\s+de\s+la\s+semaine\s+pr[ée]c[ée]dente)?/i;
  const RX_QCM = /Correction des QCM/i;

  let iCas = norm.search(RX_CAS);
  if (iCas < 0) {
    const fb = norm.search(RX_CAS_FB);
    if (fb > 2000) iCas = fb;
  }
  const iCor = norm.search(RX_COR);
  const iQcm = norm.search(RX_QCM);

  const iRappelEnd = [iCas, iCor, iQcm].filter((x) => x >= 0).sort((a, b) => a - b)[0] ?? norm.length;
  const mCoach = norm.match(/Coaching PAE\s*(?:n°|N°)?\s*\d+/i);
  const startRappel = mCoach ? mCoach.index + mCoach[0].length : 0;
  const rappel = norm.slice(startRappel, iRappelEnd).trim();

  const casClinique = iCas >= 0
    ? norm.slice(iCas).replace(/^[\s\S]*?Cas clinique[a-zé ]*/i, '').match(/^([\s\S]+?)(?=Correction du cas clinique|Correction des QCM|$)/i)?.[1]?.trim() || ''
    : '';

  const correctionPrev = iCor >= 0
    ? norm.slice(iCor).replace(RX_COR, '').match(/^([\s\S]+?)(?=Correction des QCM|CAS CLINIQUE|Cas clinique de la semaine|$)/)?.[1]?.trim() || ''
    : '';

  return { rappel, casClinique, correctionPrev };
}

/** Sépare vignette (contexte) et questions numérotées.
 *  Deux formats possibles : « 1) » (majoritaire) ou « QUESTION 1 : » (Coaching
 *  PAE 5+). On tente le premier, puis le second en repli. */
function decouperCas(casTxt) {
  const t = normalise(casTxt);
  const patternsQ = [
    { rx: /\b1\s*\)/, split: /(?=\b\d+\s*\))/, strip: /^(\d+)\s*\)\s*/ },
    { rx: /QUESTION\s*1\s*[:\-]/i, split: /(?=QUESTION\s*\d+\s*[:\-])/i, strip: /^QUESTION\s*(\d+)\s*[:\-]\s*/i },
  ];
  for (const P of patternsQ) {
    const i = t.search(P.rx);
    if (i < 0) continue;
    const vignette = t.slice(0, i).trim();
    const bloc = t.slice(i);
    const parts = bloc.split(P.split);
    const questions = parts
      .map((p) => p.trim())
      .filter((p) => P.strip.test(p))
      .map((p) => {
        const m = p.match(P.strip);
        const num = Number(m?.[1] ?? 0);
        const q = p.replace(P.strip, '').trim();
        const items = extraireItemsQCM(q);
        const qClean = items.length > 0 ? q.replace(/\b[A-K]\s*[\.\)][\s\S]+$/, '').trim() : q;
        return { num, texte: qClean, items };
      });
    if (questions.length > 0) return { vignette, questions };
  }
  return { vignette: t, questions: [] };
}

/** Retourne les items A. B. C. si la question contient des propositions QCM. */
function extraireItemsQCM(qtxt) {
  // A. Texte 1 B. Texte 2 …
  const rx = /\b([A-K])\s*[\.\)]\s+(.+?)(?=\s+[A-K]\s*[\.\)]|$)/g;
  const items = [];
  let m;
  while ((m = rx.exec(qtxt))) {
    const lettre = m[1];
    const texte = m[2].trim();
    if (texte.length > 3 && texte.length < 250) items.push({ lettre, texte });
  }
  return items.length >= 3 ? items : [];
}

/** Sépare les corrections numérotées « 1) [q]\n[r] » ou « QUESTION 1 : [q]\n[r] ». */
function decouperCorrections(corTxt) {
  const t = normalise(corTxt);
  const patternsC = [
    { split: /(?=\b\d+\s*\))/, strip: /^(\d+)\s*\)\s*/ },
    { split: /(?=QUESTION\s*\d+\s*[:\-])/i, strip: /^QUESTION\s*(\d+)\s*[:\-]\s*/i },
  ];
  for (const P of patternsC) {
    const parts = t.split(P.split);
    const out = {};
    for (const p of parts) {
      if (!P.strip.test(p)) continue;
      const num = Number(p.match(P.strip)?.[1] ?? 0);
      const body = p.replace(P.strip, '').trim();
      const iq = body.indexOf('?');
      const r = iq >= 0 ? body.slice(iq + 1).trim() : body;
      const rep = r.match(/R[ée]ponse\s*:?\s*([A-K,\s]+)/i);
      out[num] = {
        reponse: r,
        lettresCorrectes: rep
          ? Array.from(new Set(rep[1].replace(/[^A-K]/g, '').split('')))
          : [],
      };
    }
    if (Object.keys(out).length > 0) return out;
  }
  return {};
}

/** HTML du rappel : détecte des sous-titres via marqueurs typographiques
 *  (« è », « → », « ➔ »), puis paragraphe les blocs. Fallback : découpe en
 *  paragraphes réguliers si aucun marqueur trouvé. */
function rappelToHtml(rappel) {
  const t = normalise(rappel);
  if (!t) return '';
  // Le marqueur « è » (ou → / ➔) est utilisé dans plusieurs PDFs pour ouvrir
  // une nouvelle sous-partie. On l'utilise pour créer des sous-titres <h3>.
  const parts = t.split(/\s[è→➔]\s+/);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const sect = parts[i].trim();
    if (!sect) continue;
    if (i > 0) {
      // Extrait la 1re phrase comme titre <h3>.
      const m = sect.match(/^(.+?[.!?])\s*(.*)$/s);
      if (m) {
        const titre = m[1].replace(/[.!?]$/, '').trim();
        // Ne garde en <h3> qu'une accroche courte.
        if (titre.length <= 90) {
          out.push(`<h3>${escape(titre)}</h3>`);
          for (const p of paragraphier(m[2])) out.push(`<p>${escape(p)}</p>`);
          continue;
        }
      }
    }
    for (const p of paragraphier(sect)) out.push(`<p>${escape(p)}</p>`);
  }
  return out.join('\n');
}

function vignetteToHtml(vignette) {
  const t = normalise(vignette);
  if (!t) return null;
  const paragraphes = paragraphier(t);
  return paragraphes.map((p) => `<p>${escape(p)}</p>`).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
const OUT = [];
for (let n = 1; n <= 41; n++) {
  const raw = fs.readFileSync(path.join(DIR, `pae-${n}.txt`), 'utf8');
  const rawNext = n < 41 ? fs.readFileSync(path.join(DIR, `pae-${n + 1}.txt`), 'utf8') : '';

  const cur = decouper(raw);
  const nxt = rawNext ? decouper(rawNext) : { correctionPrev: '' };
  const corrections = decouperCorrections(nxt.correctionPrev || '');

  const { vignette, questions } = decouperCas(cur.casClinique);
  const paragraphes = paragraphier(cur.rappel);
  const devin = deviner(paragraphes);

  OUT.push({
    numero: n,
    titre: devin.titre || `Coaching ${n}`,
    sousTitre: devin.sousTitre,
    introHtml: rappelToHtml(cur.rappel),
    vignetteHtml: vignetteToHtml(vignette),
    questions: questions.map((q, i) => {
      const cor = corrections[q.num] || {};
      const isQCM = q.items.length > 0 && cor.lettresCorrectes && cor.lettresCorrectes.length > 0;
      return {
        section: 'cas_clinique',
        format: isQCM ? 'qcm' : 'qroc',
        ordre: i,
        enonceHtml: `<p>${escape(q.texte)}</p>`,
        items: isQCM
          ? q.items.map((it) => ({ ...it, correct: cor.lettresCorrectes.includes(it.lettre) }))
          : [],
        reponseAttendue: isQCM ? null : (cor.reponse || null),
        explicationHtml: cor.reponse ? `<p>${escape(cor.reponse)}</p>` : null,
      };
    }),
  });
}

// Parcours 42 : source .docx, non extrait ici — laissé vide (l'admin le remplira).
OUT.push({
  numero: 42,
  titre: 'Dernière ligne droite',
  sousTitre: 'Ultime coaching',
  introHtml: '',
  vignetteHtml: null,
  questions: [],
});

fs.writeFileSync(path.join(DIR, 'parcours.json'), JSON.stringify(OUT, null, 2));
console.log(`ok: ${OUT.length} parcours → ${DIR}/parcours.json`);
