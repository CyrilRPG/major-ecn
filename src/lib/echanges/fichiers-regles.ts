/**
 * Pièces jointes — contrôles PURS (CDC §69-70) : extension, type réel (octets
 * de tête), contenus actifs d'un PDF, nom affiché. Testés dans
 * tests/echanges-fichiers.test.ts.
 */

export const EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'application/pdf': ['pdf'],
};

export const LIBELLE_FORMAT: Record<string, string> = {
  'image/jpeg': 'JPG', 'image/png': 'PNG', 'image/webp': 'WEBP', 'image/gif': 'GIF', 'application/pdf': 'PDF',
};

export function extensionDe(nom: string): string {
  const m = /\.([a-z0-9]{1,8})$/i.exec(nom.trim());
  return m ? m[1].toLowerCase() : '';
}

/** Type déclaré cohérent avec l'extension, et autorisé par Major ECN. */
export function formatAccepte(nom: string, mime: string, autorises: string[]): boolean {
  if (!autorises.includes(mime)) return false;
  const exts = EXTENSIONS[mime];
  return !!exts && exts.includes(extensionDe(nom));
}

/** Type RÉEL d'après les premiers octets (le type déclaré par le navigateur ne prouve rien). */
export function typeReel(octets: Uint8Array): string | null {
  const b = octets;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png';
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif';
  // %PDF- dans les 1 024 premiers octets (tolérance de la norme).
  const tete = new TextDecoder('latin1').decode(b.slice(0, 1024));
  if (tete.includes('%PDF-')) return 'application/pdf';
  return null;
}

/** Clés d'un PDF qui exécutent ou embarquent du contenu actif : refusées. */
const CLES_DANGEREUSES = [/\/JavaScript\b/, /\/JS\s*[(<\[]/, /\/Launch\b/, /\/EmbeddedFiles?\b/, /\/RichMedia\b/, /\/SubmitForm\b/, /\/ImportData\b/];

export function pdfDangereux(texteBrut: string): string | null {
  for (const re of CLES_DANGEREUSES) {
    const m = re.exec(texteBrut);
    if (m) return m[0].replace(/[\s(<[]/g, '');
  }
  return null;
}

/** Extraction grossière du texte visible d'un flux de contenu PDF (Tj / TJ). */
export function texteDuFluxPdf(flux: string): string {
  const out: string[] = [];
  const reTj = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
  const reTJ = /\[((?:\((?:\\.|[^\\)])*\)|[^\]])*)\]\s*TJ/g;
  const dec = (s: string) => s.replace(/\\([nrtbf()\\])/g, (_m, c: string) => ({ n: '\n', r: '', t: ' ', b: '', f: '', '(': '(', ')': ')', '\\': '\\' }[c] ?? c));
  for (const m of flux.matchAll(reTj)) out.push(dec(m[1]));
  for (const m of flux.matchAll(reTJ)) {
    const parts = [...m[1].matchAll(/\(((?:\\.|[^\\)])*)\)/g)].map((x) => dec(x[1]));
    out.push(parts.join(''));
  }
  return out.join(' ');
}

/**
 * Nom affiché d'un fichier. Pour un enseignant ou l'équipe, jamais le nom
 * d'origine (il peut contenir un nom de famille, §15) : un nom générique.
 */
export function nomAffiche(nomOrigine: string, mime: string, generique: boolean, rang = 1): string {
  const ext = (EXTENSIONS[mime]?.[0] ?? extensionDe(nomOrigine)) || 'bin';
  if (generique) return `${mime.startsWith('image/') ? 'Image' : 'Document'}-${rang}.${ext}`;
  const base = nomOrigine
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.[a-z0-9]{1,8}$/i, '')
    .slice(0, 100) || 'fichier';
  return `${base}.${ext}`;
}

export function tailleLisible(octets: number | null): string {
  if (!octets && octets !== 0) return '';
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
}
