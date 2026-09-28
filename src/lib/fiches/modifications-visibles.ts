/**
 * « Faire apparaître les modifications » d'une fiche (28/09/2026).
 *
 * Quand un enseignant met une fiche à jour (nouvelles recommandations) et coche
 * la case, la fiche enregistrée montre aux élèves l'ancien texte RATURÉ et le
 * nouveau SURLIGNÉ en rouge léger — ce qui les rassure sur ce qui a changé.
 * Case décochée : la fiche reste propre.
 *
 * Module pur (client ET serveur, sans DOM) : comparaison mot à mot de deux
 * versions HTML de la fiche, qui conserve la structure de la NOUVELLE version
 * (tableaux, encadrés, mise en forme) :
 *   - texte ajouté  → `<ins class="maj-ajout">…</ins>` ;
 *   - texte retiré  → `<del class="maj-retrait">…</del>`, à l'endroit où il
 *     se trouvait. Un bloc retiré entier (ligne de tableau, paragraphe) garde
 *     ses balises, raturé ; un fragment qui chevauche plusieurs blocs perd les
 *     siennes (seul son texte revient, raturé), pour ne jamais casser la page ;
 *   - un simple changement de mise en forme (gras, couleur) n'est pas marqué.
 * Les marques d'une mise à jour précédente sont du contenu comme un autre :
 * elles restent jusqu'à « Retirer les marques ».
 */

export const CLASSE_AJOUT = 'maj-ajout';
export const CLASSE_RETRAIT = 'maj-retrait';

/** Styles des marques : injectés dans l'éditeur ET dans le rendu PDF. */
export const CSS_MODIFICATIONS = `
ins.${CLASSE_AJOUT} {
  text-decoration: none;
  color: inherit;
  background: rgba(192, 17, 46, 0.16);
  border-radius: 2px;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
del.${CLASSE_RETRAIT} {
  text-decoration: line-through;
  text-decoration-color: rgba(192, 17, 46, 0.85);
  text-decoration-thickness: 1.5px;
  opacity: 0.6;
}
ins.${CLASSE_AJOUT} img { outline: 3px solid rgba(192, 17, 46, 0.35); outline-offset: 2px; }
del.${CLASSE_RETRAIT} img { opacity: 0.45; filter: grayscale(1); }
`;

/** La fiche porte-t-elle des marques de modification ? */
export function contientMarques(html: string): boolean {
  return new RegExp(`class="[^"]*\\b(?:${CLASSE_AJOUT}|${CLASSE_RETRAIT})\\b`).test(html);
}

type Genre = 'balise' | 'mot' | 'espace' | 'atome';
type Jeton = { t: string; g: Genre };

// Commentaire | balise | espaces | mot (tout le reste jusqu'à un espace ou une balise).
const RE_JETON = /<!--[\s\S]*?-->|<[^>]*>|\s+|[^<\s]+/g;
// Balises « contenu » : une image ajoutée ou retirée est une modification.
const RE_ATOME = /^<(?:img|br|hr)\b/i;
const VIDES = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

export function jetons(html: string): Jeton[] {
  const out: Jeton[] = [];
  for (const m of html.matchAll(RE_JETON)) {
    const t = m[0];
    const g: Genre = t.startsWith('<') ? (RE_ATOME.test(t) ? 'atome' : 'balise') : /^\s/.test(t) ? 'espace' : 'mot';
    out.push({ t, g });
  }
  return out;
}

type Op = '=' | '-' | '+';

/**
 * Script d'édition de Myers (O(ND)) entre deux suites d'entiers, borné : au-delà
 * de `dMax` différences, null (l'appelant se replie sur « tout remplacé »).
 */
function myers(a: Int32Array, b: Int32Array, dMax: number): Op[] | null {
  const n = a.length, m = b.length, max = n + m;
  const off = max + 1;
  const v = new Int32Array(2 * max + 3);
  // trace[d] = fenêtre [-d-1, d+1] de V AVANT le pas d : O(D²) en mémoire.
  const trace: Int32Array[] = [];
  for (let d = 0; d <= Math.min(max, dMax); d++) {
    trace.push(v.slice(off - d - 1, off + d + 2));
    for (let k = -d; k <= d; k += 2) {
      let x = (k === -d || (k !== d && v[off + k - 1] < v[off + k + 1])) ? v[off + k + 1] : v[off + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      v[off + k] = x;
      if (x >= n && y >= m) return retracer(trace, n, m);
    }
  }
  return null;
}

function retracer(trace: Int32Array[], n: number, m: number): Op[] {
  const ops: Op[] = [];
  let x = n, y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const lire = (k: number) => trace[d][k + d + 1];
    const k = x - y;
    const kPrec = (k === -d || (k !== d && lire(k - 1) < lire(k + 1))) ? k + 1 : k - 1;
    const xPrec = lire(kPrec);
    const yPrec = xPrec - kPrec;
    while (x > xPrec && y > yPrec) { ops.push('='); x--; y--; }
    if (d > 0) {
      if (x === xPrec) ops.push('+'); else ops.push('-');
    }
    x = xPrec; y = yPrec;
  }
  return ops.reverse();
}

type Tronçon = { op: Op; j: Jeton[] };

function comparer(avant: Jeton[], apres: Jeton[], dMax: number): Tronçon[] {
  // Préfixe et suffixe communs d'abord : une mise à jour ne touche en général
  // qu'une petite partie d'une fiche de plusieurs dizaines de pages.
  let p = 0;
  while (p < avant.length && p < apres.length && avant[p].t === apres[p].t) p++;
  let s = 0;
  while (s < avant.length - p && s < apres.length - p && avant[avant.length - 1 - s].t === apres[apres.length - 1 - s].t) s++;
  const a = avant.slice(p, avant.length - s), b = apres.slice(p, apres.length - s);

  const ids = new Map<string, number>();
  const id = (t: string) => { let v = ids.get(t); if (v === undefined) { v = ids.size; ids.set(t, v); } return v; };
  const ops = myers(Int32Array.from(a, (j) => id(j.t)), Int32Array.from(b, (j) => id(j.t)), dMax)
    ?? [...a.map((): Op => '-'), ...b.map((): Op => '+')];

  const out: Tronçon[] = [];
  const pousser = (op: Op, j: Jeton) => {
    const der = out[out.length - 1];
    if (der && der.op === op) der.j.push(j); else out.push({ op, j: [j] });
  };
  for (let i = 0; i < p; i++) pousser('=', avant[i]);
  let ia = 0, ib = 0;
  for (const op of ops) {
    if (op === '=') { pousser('=', b[ib]); ia++; ib++; }
    else if (op === '-') pousser('-', a[ia++]);
    else pousser('+', b[ib++]);
  }
  for (let i = apres.length - s; i < apres.length; i++) pousser('=', apres[i]);
  return out;
}

/**
 * Une suppression isolée peut glisser le long des jetons identiques qui
 * l'entourent sans changer le résultat (supprimer `<tr>A</tr>` entre deux
 * lignes = supprimer `A</tr><tr>`). Myers choisit une position arbitraire,
 * souvent à cheval sur deux blocs : on cherche la position où le fragment est
 * un bloc complet, pour qu'il revienne raturé AVEC sa structure.
 */
function recaler(tr: Tronçon[]): Tronçon[] {
  for (let i = 1; i < tr.length - 1; i++) {
    const [g, c, d] = [tr[i - 1], tr[i], tr[i + 1]];
    if (c.op !== '-' || g.op !== '=' || d.op !== '=' || equilibre(c.j)) continue;
    // Suite S = gauche + supprimé + droite ; la suppression est la fenêtre [p, p + r).
    const S = g.j.concat(c.j, d.j), r = c.j.length;
    let p = g.j.length;
    // Tout à gauche…
    for (let n = 0; n < 500 && p > 0 && S[p - 1].t === S[p + r - 1].t; n++) p--;
    // …puis vers la droite, jusqu'à la première position équilibrée.
    let trouve = equilibre(S.slice(p, p + r));
    for (let n = 0; !trouve && n < 1000 && p + r < S.length && S[p].t === S[p + r].t; n++) {
      p++;
      trouve = equilibre(S.slice(p, p + r));
    }
    if (trouve) { g.j = S.slice(0, p); c.j = S.slice(p, p + r); d.j = S.slice(p + r); }
  }
  return tr.filter((t) => t.j.length > 0);
}

/** Un espace isolé entre deux changements rejoint les deux (marques d'un seul tenant). */
function lisser(tr: Tronçon[]): Tronçon[] {
  const out: Tronçon[] = [];
  for (let i = 0; i < tr.length; i++) {
    const c = tr[i];
    const entreDeux = c.op === '=' && i > 0 && i < tr.length - 1 && tr[i - 1].op !== '=' && tr[i + 1].op !== '='
      && c.j.every((j) => j.g === 'espace');
    if (entreDeux) { out.push({ op: '-', j: [...c.j] }, { op: '+', j: [...c.j] }); continue; }
    out.push(c);
  }
  // Regroupe chaque suite de changements : tout le retiré, puis tout l'ajouté.
  const res: Tronçon[] = [];
  for (let i = 0; i < out.length;) {
    if (out[i].op === '=') { res.push(out[i]); i++; continue; }
    const moins: Jeton[] = [], plus: Jeton[] = [];
    while (i < out.length && out[i].op !== '=') { (out[i].op === '-' ? moins : plus).push(...out[i].j); i++; }
    if (moins.length) res.push({ op: '-', j: moins });
    if (plus.length) res.push({ op: '+', j: plus });
  }
  return res;
}

function nomBalise(t: string): { nom: string; fermante: boolean } | null {
  const m = /^<(\/?)([a-z][a-z0-9-]*)/i.exec(t);
  return m ? { nom: m[2].toLowerCase(), fermante: m[1] === '/' } : null;
}

/** Les balises du fragment s'ouvrent et se ferment toutes à l'intérieur ? */
function equilibre(j: Jeton[]): boolean {
  const pile: string[] = [];
  for (const x of j) {
    if (x.g !== 'balise') continue;
    const b = nomBalise(x.t);
    if (!b || VIDES.has(b.nom) || x.t.endsWith('/>')) continue;
    if (!b.fermante) pile.push(b.nom);
    else if (pile.pop() !== b.nom) return false;
  }
  return pile.length === 0;
}

function emettre(j: Jeton[], op: '-' | '+'): string {
  const balise = op === '+' ? 'ins' : 'del';
  const classe = op === '+' ? CLASSE_AJOUT : CLASSE_RETRAIT;
  // Retiré : les balises ne reviennent que si le fragment est un bloc complet.
  const garderBalises = op === '+' || equilibre(j);
  let out = '', tampon: Jeton[] = [];
  const vider = () => {
    if (!tampon.length) return;
    let debut = 0, fin = tampon.length;
    while (debut < fin && tampon[debut].g === 'espace') debut++;
    while (fin > debut && tampon[fin - 1].g === 'espace') fin--;
    const avantTxt = tampon.slice(0, debut).map((x) => x.t).join('');
    const coeur = tampon.slice(debut, fin).map((x) => x.t).join('');
    const apresTxt = tampon.slice(fin).map((x) => x.t).join('');
    out += coeur ? `${avantTxt}<${balise} class="${classe}">${coeur}</${balise}>${apresTxt}` : avantTxt + apresTxt;
    tampon = [];
  };
  for (const x of j) {
    if (x.g === 'balise') {
      vider();
      // Sinon : balise de l'ancienne version, abandonnée (seul le texte revient).
      if (garderBalises) out += x.t;
    } else {
      tampon.push(x);
    }
  }
  vider();
  // Fragment retiré sans ses balises : ses morceaux raturés sont collés, on les
  // sépare d'un espace pour que les mots ne fusionnent pas.
  return garderBalises ? out : out.replace(/<\/del><del class="[^"]*">/g, ' ');
}

/**
 * HTML de la fiche avec les modifications apparentes : structure de `apres`,
 * ajouts surlignés, retraits raturés. Sans différence de texte, renvoie `apres`
 * tel quel.
 */
export function marquerModifications(avant: string, apres: string, dMax = 2000): string {
  if (avant === apres) return apres;
  const tr = lisser(recaler(comparer(jetons(avant), jetons(apres), dMax)));
  let out = '';
  for (const t of tr) {
    if (t.op === '=') out += t.j.map((x) => x.t).join('');
    else out += emettre(t.j, t.op);
  }
  return out;
}

/** Nombre de passages modifiés (pour l'affichage « 3 modifications »). */
export function compterMarques(html: string): { ajouts: number; retraits: number } {
  const n = (c: string) => (html.match(new RegExp(`<(?:ins|del) class="${c}"`, 'g')) ?? []).length;
  return { ajouts: n(CLASSE_AJOUT), retraits: n(CLASSE_RETRAIT) };
}
