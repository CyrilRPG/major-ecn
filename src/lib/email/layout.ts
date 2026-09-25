/**
 * Mise en page des e-mails — socle commun Major ECN (et primitives réutilisées
 * par EVC Arena, cf. src/lib/arena/email-layout.ts).
 *
 * Charte « bordeaux » (maquette du 25/09/2026) : fond crème, bordeaux en
 * couleur principale, titres serif (Georgia en repli), en-tête « La référence
 * de votre préparation », hero photo fondu dans le crème, cartes blanches
 * finement bordées, blocs rosés, pied « Ensemble vers votre réussite ».
 * AUCUN réseau social (consigne de Cyril).
 *
 * Règles de robustesse (Gmail, Outlook Windows/Mac, Apple Mail, iOS, Android) :
 * - structure 100 % en tables, styles EN LIGNE (le <style> du <head> ne sert
 *   qu'au responsive et aux clients qui le lisent) ;
 * - conteneur fluide de 600 px (width + max-width), media query < 620 px ;
 * - boutons « bulletproof » : cellule colorée + lien, et rectangle VML pour
 *   Outlook Windows qui ignore padding et border-radius des liens ;
 * - images PNG/JPG absolues (jamais de SVG), alt + width + height ;
 * - photo du hero en image de fond (Gmail, Apple Mail, Outlook.com) : Outlook
 *   Windows affiche le fond crème, sans perte de texte ;
 * - `color-scheme` déclaré pour que les clients n'inversent pas la charte.
 *
 * Module PUR (aucun import serveur) : utilisable par les tests et la galerie
 * de prévisualisation (tmp/_emails-preview/render.mts).
 */

/** Domaine canonique : liens de pied de page et visuels hébergés. */
export const EMAIL_SITE = 'https://www.major-ecn.fr';

export const CONTACT_EMAIL = 'contact@major-ecn.fr';
export const CONTACT_PHONE = '01 47 34 35 71';
export const CONTACT_PHONE_INTL = '+33147343571';
export const LEGAL_ENTITY = 'Major ECN — PAE Formation';
export const LEGAL_ADDRESS = '3 rue Rosa Bonheur, 75015 Paris';

/**
 * Base des visuels (logos, photos, pictogrammes) : toujours le domaine de
 * production en https, que la messagerie du destinataire peut atteindre.
 * `EMAIL_ASSETS_URL` ne sert qu'à la prévisualisation locale.
 */
export function emailAssetsBase(): string {
  const env = typeof process !== 'undefined' ? process.env.EMAIL_ASSETS_URL : undefined;
  return env && env.trim() ? env.trim().replace(/\/+$/, '') : EMAIL_SITE;
}
export function emailAsset(file: string): string {
  return `${emailAssetsBase()}/email/${file.replace(/^\/+/, '')}`;
}

/** Échappement HTML. `null`/`undefined` deviennent une chaîne vide (jamais « undefined » dans un mail). */
export function esc(s: unknown): string {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

/* ================================================================== */
/* Jetons                                                             */
/* ================================================================== */

/**
 * Charte Major ECN — bordeaux échantillonné sur la maquette (titres #6E0F28,
 * bouton #8E1B35). Les anciens noms (`red`, `navy`…) restent exportés pour
 * les gabarits existants et pointent désormais sur les bordeaux.
 */
export const MAJOR = {
  bordeaux: '#6E0F28',
  bordeauxBtn: '#8E1B35',
  bordeauxDeep: '#560B1F',
  bordeauxSoft: '#F6E7E7',
  rose: '#F4ECE8',
  cream: '#FAF7F3',
  paper: '#FFFFFF',
  sand: '#F5EFE9',
  /* Compatibilité : ces clés sont lues par les gabarits. */
  red: '#8E1B35',
  redDeep: '#6E0F28',
  redSoft: '#FBF3F2',
  redLine: '#EFD9D9',
  navy: '#6E0F28',
  navyDeep: '#560B1F',
  navyInk: '#3A0816',
  ink: '#2B2233',
  body: '#3D3540',
  muted: '#716770',
  faint: '#A39AA0',
  line: '#EADFD8',
  panel: '#F7F2ED',
  page: '#F2ECE6',
  white: '#FFFFFF',
  onNavy: '#F3E6E8',
  onNavyMuted: '#D5BFC4',
  success: '#2E6B4A',
  successSoft: '#EFF6F1',
  successLine: '#D3E6DA',
} as const;

export const FONT_SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
export const FONT_SERIF = "Georgia, 'Times New Roman', Times, serif";
export const FONT_MONO = "'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace";

/* ================================================================== */
/* Primitives partagées (document, bouton, préheader)                 */
/* ================================================================== */

/** Texte de prévisualisation caché (ligne grise sous l'objet dans la boîte de réception). */
export function preheaderHtml(text: string | null | undefined): string {
  const t = (text ?? '').trim();
  if (!t) return '';
  // Remplissage invisible : empêche le client d'afficher la suite du corps après le préheader.
  const filler = '&#847;&zwnj;&nbsp;'.repeat(60);
  return `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(t)}${filler}</div>`;
}

type DocumentOptions = {
  title: string;
  preheader?: string | null;
  scheme: 'light' | 'dark';
  pageBg: string;
  /** Balises supplémentaires dans le <head> (polices web, styles propres). */
  headExtra?: string;
  /** CSS responsive / clients modernes, ajouté au <style> commun. */
  css?: string;
  body: string;
};

/** Squelette HTML complet d'un e-mail (doctype, VML Outlook, responsive, préheader). */
export function emailDocument(o: DocumentOptions): string {
  const scheme = o.scheme === 'dark' ? 'dark' : 'light';
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<meta name="color-scheme" content="${scheme}">
<meta name="supported-color-schemes" content="${scheme}">
<title>${esc(o.title)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>table,td,div,p,a,span{font-family:Arial,Helvetica,sans-serif;} h1,h2,.em-serif{font-family:Georgia,serif !important;}</style>
<![endif]-->
${o.headExtra ?? ''}
<style>
:root{color-scheme:${scheme};supported-color-schemes:${scheme};}
body{margin:0 !important;padding:0 !important;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
a{text-decoration:none;}
a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important;}
u + #body a{color:inherit;text-decoration:none;}
@media screen and (max-width:620px){
  .em-container{width:100% !important;max-width:100% !important;}
  .em-outer{padding:0 !important;}
  .em-card{border-radius:0 !important;}
  .em-px{padding-left:20px !important;padding-right:20px !important;}
  .em-h1{font-size:30px !important;line-height:35px !important;}
  .em-stack{display:block !important;width:100% !important;max-width:100% !important;box-sizing:border-box !important;}
  .em-stack-gap{padding:0 0 12px 0 !important;}
  .em-hide-sm{display:none !important;max-height:0 !important;overflow:hidden !important;mso-hide:all !important;}
  .em-show-sm{display:block !important;max-height:none !important;overflow:visible !important;font-size:inherit !important;line-height:inherit !important;}
  .em-hero-bg{background-image:none !important;height:auto !important;}
  .em-full{width:100% !important;max-width:100% !important;}
  .em-btn{width:100% !important;}
  .em-btn a{display:block !important;}
  .em-fluid{width:100% !important;height:auto !important;}
  .em-center-sm{text-align:center !important;}
  .em-nopad-sm{padding-left:0 !important;padding-right:0 !important;}
}
${o.css ?? ''}
</style>
</head>
<body id="body" style="margin:0;padding:0;background-color:${o.pageBg};" bgcolor="${o.pageBg}">
${preheaderHtml(o.preheader)}
${o.body}
</body>
</html>`;
}

export type ButtonOptions = {
  href: string;
  label: string;
  bg?: string;
  color?: string;
  /** Bouton secondaire : fond transparent + bordure. */
  outline?: boolean;
  borderColor?: string;
  radius?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  /** Hauteur totale (VML Outlook) — le padding des autres clients s'y aligne. */
  height?: number;
  /** Marge intérieure horizontale du lien. */
  padX?: number;
  align?: 'left' | 'center';
  uppercase?: boolean;
  letterSpacing?: string;
  /** Flèche → après le libellé. */
  arrow?: boolean;
};

/**
 * Bouton « bulletproof » : cellule colorée cliquable partout, rectangle VML
 * arrondi pour Outlook Windows (qui ignore padding/border-radius des <a>).
 */
export function emailButton(o: ButtonOptions): string {
  const bg = o.bg ?? MAJOR.bordeauxBtn;
  const color = o.color ?? MAJOR.white;
  const radius = o.radius ?? 6;
  const height = o.height ?? 52;
  const fontSize = o.fontSize ?? 16;
  const font = o.fontFamily ?? FONT_SANS;
  const weight = o.fontWeight ?? 700;
  const border = o.outline ? (o.borderColor ?? color) : bg;
  const fill = o.outline ? 'transparent' : bg;
  const label = esc(o.label);
  const arrow = o.arrow ? '&nbsp;&nbsp;&nbsp;&rarr;' : '';
  const href = esc(o.href);
  const padX = o.padX ?? 34;
  // Largeur estimée du VML (Outlook ne sait pas « s'adapter au texte »).
  const vmlWidth = Math.max(220, Math.min(520, Math.round(o.label.length * fontSize * 0.6 + padX * 2 + (o.arrow ? 36 : 0))));
  const arc = Math.round((radius / height) * 100);
  const padV = Math.max(10, Math.round((height - fontSize * 1.25) / 2) - (o.outline ? 2 : 0));
  const transform = o.uppercase ? 'text-transform:uppercase;' : '';
  const spacing = o.letterSpacing ? `letter-spacing:${o.letterSpacing};` : '';
  const align = o.align ?? 'center';
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}" class="em-btn" style="margin:${align === 'center' ? '0 auto' : '0'};">
<tr><td align="center" ${o.outline ? '' : `bgcolor="${bg}"`} style="border-radius:${radius}px;background-color:${fill};${o.outline ? `border:1.5px solid ${border};` : ''}">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${height}px;v-text-anchor:middle;width:${vmlWidth}px;" arcsize="${arc}%" ${o.outline ? `strokecolor="${border}" strokeweight="1.5px" filled="f"` : `stroke="f" fillcolor="${bg}"`}>
<w:anchorlock/>
<center style="color:${color};font-family:${o.fontFamily === FONT_SERIF ? 'Georgia,serif' : 'Arial,Helvetica,sans-serif'};font-size:${fontSize}px;font-weight:bold;${transform}${spacing}">${label}${arrow}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-- -->
<a href="${href}" target="_blank" rel="noopener" style="display:inline-block;padding:${padV}px ${padX}px;font-family:${font};font-size:${fontSize}px;line-height:${Math.round(fontSize * 1.25)}px;font-weight:${weight};color:${color};text-decoration:none;border-radius:${radius}px;${transform}${spacing}mso-hide:all;"><span style="color:${color};">${label}${arrow}</span></a>
<!--<![endif]-->
</td></tr>
</table>`;
}

/** Espace vertical fiable (Outlook ignore les marges des tables). */
export function spacer(px: number): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td height="${px}" style="height:${px}px;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

/** Image absolue décrite (alt + dimensions), bloc. */
function img(file: string, w: number, h: number, alt = '', style = ''): string {
  return `<img src="${emailAsset(file)}" width="${w}" height="${h}" alt="${esc(alt)}" style="display:block;width:${w}px;height:${h}px;border:0;${style}">`;
}

/* ================================================================== */
/* Composants Major ECN (corps de message)                            */
/* ================================================================== */

const P_STYLE = `margin:0 0 14px;font-family:${FONT_SANS};font-size:15px;line-height:24px;color:${MAJOR.body};`;

/** Paragraphe à partir de HTML déjà sûr. */
export function pHtml(html: string, opts: { size?: number; color?: string; margin?: string; align?: 'left' | 'center' } = {}): string {
  const size = opts.size ?? 15;
  return `<p style="margin:${opts.margin ?? '0 0 14px'};font-family:${FONT_SANS};font-size:${size}px;line-height:${Math.round(size * 1.6)}px;color:${opts.color ?? MAJOR.body};${opts.align ? `text-align:${opts.align};` : ''}">${html}</p>`;
}
/** Paragraphe de texte brut (échappé). */
export function p(text: string, opts?: Parameters<typeof pHtml>[1]): string {
  return pHtml(esc(text), opts);
}

/** « Bonjour Prénom, » — le prénom en gras, formule neutre sans prénom. */
export function greeting(name: string | null | undefined, fallback = ''): string {
  const n = (name ?? '').trim() || fallback;
  return `<p style="${P_STYLE}font-size:16px;color:${MAJOR.ink};">Bonjour${n ? ` <strong style="color:${MAJOR.ink};">${esc(n)}</strong>` : ''},</p>`;
}

/** Intertitre de section : capitales espacées bordeaux + filet. */
export function sectionTitle(text: string, color: string = MAJOR.bordeaux): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:10px 0 14px;">
<tr><td style="font-family:${FONT_SANS};font-size:11px;line-height:16px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${color};padding:0 0 8px;border-bottom:1px solid ${MAJOR.line};">${esc(text)}</td></tr>
</table>`;
}

/** Titre d'article en serif. */
export function heading(text: string, size = 22): string {
  return `<h2 class="em-serif" style="margin:6px 0 14px;font-family:${FONT_SERIF};font-size:${size}px;line-height:${Math.round(size * 1.3)}px;font-weight:700;color:${MAJOR.bordeaux};">${esc(text)}</h2>`;
}

/** Bouton principal : bordeaux plein, texte serif blanc et flèche. */
export function button(href: string, label: string, opts: Partial<ButtonOptions> = {}): string {
  return `${spacer(6)}${emailButton({ href, label, fontFamily: FONT_SERIF, fontSize: 19, fontWeight: 400, height: 54, padX: 56, arrow: true, ...opts })}${spacer(opts.outline ? 24 : 10)}`;
}
/** Bouton secondaire (contour bordeaux). */
export function buttonSecondary(href: string, label: string): string {
  return button(href, label, { outline: true, color: MAJOR.bordeaux, borderColor: MAJOR.bordeaux, height: 46, fontSize: 16, padX: 32 });
}

/** « 🔒 Lien sécurisé — valable … » sous un bouton (texte réel de validité seulement). */
export function secureNote(text: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;"><tr>
<td valign="middle" style="padding:0 6px 0 0;">${img('ico-lock.png', 14, 14, '')}</td>
<td valign="middle" style="font-family:${FONT_SANS};font-size:13px;line-height:18px;color:${MAJOR.muted};">${esc(text)}</td>
</tr></table>`;
}

/** « Si le bouton ne fonctionne pas… » + URL cliquable, discret. */
export function linkFallback(href: string, lead = 'Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :'): string {
  return `<p style="margin:0 0 22px;font-family:${FONT_SANS};font-size:12px;line-height:18px;color:${MAJOR.faint};text-align:center;">${esc(lead)}<br><a href="${esc(href)}" target="_blank" rel="noopener" style="color:${MAJOR.bordeaux};text-decoration:underline;word-break:break-all;font-family:${FONT_MONO};font-size:11px;">${esc(href)}</a></p>`;
}

export type CalloutTone = 'brand' | 'navy' | 'neutral' | 'success';
const TONES: Record<CalloutTone, { bg: string; border: string; bar: string; title: string }> = {
  brand: { bg: MAJOR.rose, border: MAJOR.line, bar: MAJOR.bordeaux, title: MAJOR.bordeaux },
  navy: { bg: MAJOR.paper, border: MAJOR.line, bar: MAJOR.bordeaux, title: MAJOR.bordeaux },
  neutral: { bg: MAJOR.panel, border: MAJOR.line, bar: '#CDBFB8', title: MAJOR.muted },
  success: { bg: MAJOR.successSoft, border: MAJOR.successLine, bar: MAJOR.success, title: MAJOR.success },
};

/** Encadré à filet latéral : titre en capitales espacées + contenu HTML. */
export function callout(o: { title?: string; html: string; tone?: CalloutTone; icon?: string }): string {
  const t = TONES[o.tone ?? 'brand'];
  const title = o.title
    ? `<p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:11px;line-height:16px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:${t.title};">${o.icon ? `${o.icon}&nbsp; ` : ''}${esc(o.title)}</p>`
    : '';
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
<tr>
<td width="3" style="width:3px;background-color:${t.bar};font-size:0;line-height:0;" bgcolor="${t.bar}">&nbsp;</td>
<td style="padding:18px 20px;background-color:${t.bg};border:1px solid ${t.border};border-left:0;border-radius:0 10px 10px 0;" bgcolor="${t.bg}">
${title}${o.html}
</td>
</tr>
</table>`;
}

/** Petit texte dans un encadré. */
export function small(html: string, opts: { color?: string; margin?: string; italic?: boolean } = {}): string {
  return `<p style="margin:${opts.margin ?? '0'};font-family:${FONT_SANS};font-size:14px;line-height:22px;color:${opts.color ?? MAJOR.body};${opts.italic ? 'font-style:italic;' : ''}">${html}</p>`;
}

/** Liste à pastilles (✓ par défaut), une ligne par table pour l'alignement Outlook. */
export function iconList(items: string[], o: { icon?: string; tone?: 'brand' | 'navy' | 'danger' | 'success'; size?: number; html?: boolean } = {}): string {
  const icon = o.icon ?? '&#10003;';
  const palette = {
    brand: { bg: MAJOR.bordeauxSoft, fg: MAJOR.bordeaux },
    navy: { bg: MAJOR.bordeauxSoft, fg: MAJOR.bordeaux },
    danger: { bg: MAJOR.bordeauxSoft, fg: MAJOR.bordeauxBtn },
    success: { bg: '#E6F1EA', fg: MAJOR.success },
  }[o.tone ?? 'brand'];
  const size = o.size ?? 15;
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
${items.map((it) => `<tr>
<td width="34" valign="top" style="width:34px;padding:0 0 11px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="22" height="22" align="center" valign="middle" style="width:22px;height:22px;border-radius:11px;background-color:${palette.bg};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:22px;font-weight:700;color:${palette.fg};" bgcolor="${palette.bg}">${icon}</td></tr></table>
</td>
<td valign="top" style="padding:1px 0 11px;font-family:${FONT_SANS};font-size:${size}px;line-height:${Math.round(size * 1.47)}px;color:${MAJOR.body};">${o.html ? it : esc(it)}</td>
</tr>`).join('\n')}
</table>`;
}

/** En-tête de carte : pictogramme + titre en capitales espacées bordeaux. */
function cardHeader(title: string, icon: string | null): string {
  return `<tr><td colspan="2" style="padding:16px 20px 14px;border-bottom:1px solid ${MAJOR.line};">
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
${icon ? `<td valign="middle" style="padding:0 14px 0 0;">${img(icon, 24, 24, '')}</td>` : ''}
<td valign="middle" style="font-family:${FONT_SANS};font-size:11px;line-height:16px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${MAJOR.bordeaux};">${esc(title)}</td>
</tr></table>
</td></tr>`;
}

/**
 * Carte récapitulative à fond blanc, bordée finement.
 * - mode liste (défaut) : libellé à gauche, valeur à droite ;
 * - `grid: true` : grille 2 colonnes, libellé au-dessus d'une valeur serif bordeaux (maquette).
 */
export function summaryTable(rows: Array<[string, string] | null | false | undefined>, o: { title?: string; labelWidth?: number; grid?: boolean; icon?: string | null } = {}): string {
  const list = rows.filter((r): r is [string, string] => Array.isArray(r));
  if (list.length === 0) return '';
  const head = o.title ? cardHeader(o.title, o.icon === undefined ? 'ico-recap.png' : o.icon) : '';
  let body: string;
  if (o.grid) {
    const cell = ([label, value]: [string, string], last: boolean) =>
      `<p style="margin:0 0 4px;font-family:${FONT_SANS};font-size:13px;line-height:18px;color:${MAJOR.muted};">${esc(label)}</p>
<div class="em-serif" style="font-family:${FONT_SERIF};font-size:19px;line-height:26px;font-weight:700;color:${MAJOR.bordeaux};${last ? '' : `padding:0 0 14px;margin:0 0 14px;border-bottom:1px solid ${MAJOR.line};`}">${value}</div>`;
    const half = Math.ceil(list.length / 2);
    const left = list.slice(0, half), right = list.slice(half);
    body = `<tr>
<td width="50%" valign="top" class="em-stack" style="width:50%;padding:18px 20px;">${left.map((r, i) => cell(r, i === left.length - 1)).join('')}</td>
<td width="50%" valign="top" class="em-stack" style="width:50%;padding:18px 20px;border-left:1px solid ${MAJOR.line};">${right.map((r, i) => cell(r, i === right.length - 1)).join('')}</td>
</tr>`;
  } else {
    const lw = o.labelWidth ?? 36;
    body = list.map(([label, value], i) => `<tr>
<td width="${lw}%" valign="top" style="width:${lw}%;padding:12px 12px 12px 20px;${i < list.length - 1 ? `border-bottom:1px solid ${MAJOR.line};` : ''}font-family:${FONT_SANS};font-size:13px;line-height:20px;color:${MAJOR.muted};">${esc(label)}</td>
<td valign="top" style="padding:12px 20px 12px 12px;${i < list.length - 1 ? `border-bottom:1px solid ${MAJOR.line};` : ''}font-family:${FONT_SANS};font-size:14px;line-height:21px;font-weight:600;color:${MAJOR.ink};word-break:break-word;">${value}</td>
</tr>`).join('\n');
  }
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background-color:${MAJOR.paper};border:1px solid ${MAJOR.line};border-radius:12px;border-collapse:separate;overflow:hidden;" bgcolor="${MAJOR.paper}">
${head}${body}
</table>`;
}

/** Valeur monospace (identifiants). */
export function mono(s: string): string {
  return `<span style="font-family:${FONT_MONO};font-size:13px;font-weight:500;">${esc(s)}</span>`;
}
/** Lien mailto. */
export function mailto(email: string, color: string = MAJOR.bordeaux): string {
  return `<a href="mailto:${esc(email)}" style="color:${color};text-decoration:underline;font-weight:600;">${esc(email)}</a>`;
}

/** Citation / message rapporté (texte brut, retours à la ligne conservés). */
export function quote(text: string, o: { label?: string; tone?: 'neutral' | 'brand' } = {}): string {
  const brand = o.tone === 'brand';
  const bg = brand ? MAJOR.rose : MAJOR.paper;
  const label = o.label
    ? `<p style="margin:0 0 8px;font-family:${FONT_SANS};font-size:11px;line-height:16px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:${MAJOR.bordeaux};">${esc(o.label)}</p>`
    : '';
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
<tr><td style="padding:18px 20px;background-color:${bg};border:1px solid ${MAJOR.line};border-radius:12px;" bgcolor="${bg}">
${label}<p style="margin:0;font-family:${FONT_SANS};font-size:15px;line-height:24px;color:${MAJOR.ink};white-space:pre-wrap;">${esc(text).replace(/\r?\n/g, '<br>')}</p>
</td></tr>
</table>`;
}

/** Citation éditoriale mise en exergue (campagnes). */
export function pullQuote(lineA: string, lineB: string): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:4px 0 26px;">
<tr><td align="center" style="padding:26px 28px;background-color:${MAJOR.rose};border:1px solid ${MAJOR.line};border-radius:12px;" bgcolor="${MAJOR.rose}">
<p class="em-serif" style="margin:0 0 4px;font-family:${FONT_SERIF};font-size:34px;line-height:30px;color:${MAJOR.bordeauxBtn};">&ldquo;</p>
<p class="em-serif" style="margin:0 0 8px;font-family:${FONT_SERIF};font-size:17px;line-height:26px;font-style:italic;color:${MAJOR.body};">${esc(lineA)}</p>
<p class="em-serif" style="margin:0;font-family:${FONT_SERIF};font-size:21px;line-height:29px;font-weight:700;color:${MAJOR.bordeaux};">${esc(lineB)}</p>
</td></tr>
</table>`;
}

/** Filet horizontal. */
export function divider(margin = '6px 0 26px'): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:${margin};"><tr><td style="border-top:1px solid ${MAJOR.line};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>`;
}

/** Mention discrète. */
export function note(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_SANS};font-size:13px;line-height:21px;color:${MAJOR.muted};">${html}</p>`;
}

/** Panneau rosé à pictogramme rond (blocs « chances », « contact »). */
function iconPanel(icon: string, inner: string): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 14px;background-color:${MAJOR.rose};border-radius:10px;" bgcolor="${MAJOR.rose}"><tr>
<td width="92" valign="middle" align="center" class="em-hide-sm" style="width:92px;padding:18px 0 18px 18px;">${img(icon, 56, 56, '')}</td>
<td width="1" class="em-hide-sm" style="width:1px;padding:18px 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" height="60"><tr><td width="1" style="width:1px;background-color:#D9C8C4;font-size:0;line-height:0;" bgcolor="#D9C8C4">&nbsp;</td></tr></table></td>
<td valign="middle" style="padding:18px 22px;">${inner}</td>
</tr></table>`;
}

/** Bloc contact : casque, e-mail et téléphone réels du site (aucun horaire inventé). */
export function contactCard(title = 'Une question pour démarrer ?', lead = 'Notre équipe est à votre écoute pour vous accompagner dans la prise en main de votre espace.'): string {
  return iconPanel('ico-contact.png', `<p style="margin:0 0 4px;font-family:${FONT_SANS};font-size:16px;line-height:22px;font-weight:700;color:${MAJOR.ink};">${esc(title)}</p>
<p style="margin:0 0 12px;font-family:${FONT_SANS};font-size:14px;line-height:21px;color:${MAJOR.body};">${esc(lead)}</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
<td class="em-stack em-stack-gap" style="padding:0 22px 0 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td valign="middle" style="padding:0 8px 0 0;">${img('ico-mail.png', 20, 20, '')}</td><td valign="middle" style="font-family:${FONT_SANS};font-size:14px;line-height:20px;"><a href="mailto:${CONTACT_EMAIL}" style="color:${MAJOR.ink};text-decoration:none;">${CONTACT_EMAIL}</a></td></tr></table></td>
<td class="em-stack"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td valign="middle" style="padding:0 8px 0 0;">${img('ico-phone.png', 20, 20, '')}</td><td valign="middle" style="font-family:${FONT_SANS};font-size:14px;line-height:20px;"><a href="tel:${CONTACT_PHONE_INTL}" style="color:${MAJOR.ink};text-decoration:none;">${CONTACT_PHONE}</a></td></tr></table></td>
</tr></table>`);
}

/** Bloc « Nous mettons toutes les chances de votre côté » (accueil, achat). */
export function chancesBlock(): string {
  return iconPanel('ico-cible.png', `<p style="margin:0 0 4px;font-family:${FONT_SANS};font-size:16px;line-height:22px;font-weight:700;color:${MAJOR.bordeaux};">Nous mettons toutes les chances de votre côté</p>
<p style="margin:0 0 6px;font-family:${FONT_SANS};font-size:14px;line-height:21px;color:${MAJOR.body};">Votre espace a été pensé pour vous offrir les meilleures conditions de préparation : contenus structurés, entraînements, révisions, accompagnement et suivi de votre progression.</p>
<p style="margin:0 0 4px;font-family:${FONT_SANS};font-size:14px;line-height:21px;font-weight:700;color:${MAJOR.bordeaux};">Votre régularité et votre travail personnel feront toute la différence.</p>
<p style="margin:0;font-family:${FONT_SANS};font-size:14px;line-height:21px;color:${MAJOR.body};">Avancez à votre rythme, mais gardez le cap : nous sommes à vos côtés tout au long de votre préparation.</p>`);
}

/** Rangée « Votre préparation vous attend » : 6 pictogrammes (grille 3 × 2 sur mobile). */
export function preparationBlock(): string {
  const items: Array<[string, string]> = [
    ['ico-cours.png', 'Cours live<br>et replays'],
    ['ico-fiches.png', 'Fiches<br>de synthèse'],
    ['ico-qcm.png', 'QCM / QROC<br>(selon votre voie)'],
    ['ico-cas.png', 'Cas cliniques<br>et annales'],
    ['ico-suivi.png', 'Suivi de votre<br>progression'],
    ['ico-ia.png', 'Outils IA<br>et flashcards'],
  ];
  const cell = ([icon, label]: [string, string]) => `<td width="66" valign="top" align="center" style="width:66px;padding:0;">
${img(icon, 44, 44, '', 'margin:0 auto 6px;')}
<p style="margin:0;font-family:${FONT_SANS};font-size:10px;line-height:13px;color:${MAJOR.body};text-align:center;">${label}</p>
</td>`;
  // Deux tables flottantes de 3 pictogrammes : côte à côte à 600 px, empilées (grille 3 × 2) sur mobile.
  const group = (list: Array<[string, string]>) => `<table role="presentation" width="198" border="0" cellpadding="0" cellspacing="0" align="left" class="em-full" style="width:198px;margin:0 0 6px;"><tr>${list.map(cell).join('')}</tr></table>`;
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;background-color:${MAJOR.panel};border-radius:10px;" bgcolor="${MAJOR.panel}"><tr>
<td width="106" valign="middle" class="em-stack" style="width:106px;padding:18px 2px 18px 16px;">
<p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:11px;line-height:18px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:${MAJOR.bordeaux};">Votre préparation vous attend</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="32" style="width:32px;border-top:2px solid ${MAJOR.bordeaux};font-size:0;line-height:0;">&nbsp;</td></tr></table>
</td>
<td width="412" valign="middle" class="em-stack" style="width:412px;padding:16px 4px 10px;">
${group(items.slice(0, 3))}
${group(items.slice(3))}
</td>
</tr></table>`;
}

/** Signature d'équipe. */
export function signature(o: { closing?: string; team?: string; role?: string } = {}): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:10px 0 0;">
<tr><td style="padding:18px 0 4px;">
<p style="margin:0 0 4px;font-family:${FONT_SANS};font-size:15px;line-height:22px;color:${MAJOR.body};">${esc(o.closing ?? 'À très bientôt,')}</p>
<p class="em-serif" style="margin:0;font-family:${FONT_SERIF};font-size:19px;line-height:26px;font-weight:700;color:${MAJOR.bordeaux};">${esc(o.team ?? 'L’équipe Major ECN')}</p>
<p style="margin:3px 0 0;font-family:${FONT_SANS};font-size:10px;line-height:16px;letter-spacing:3px;text-transform:uppercase;color:${MAJOR.muted};">${esc(o.role ?? 'La référence de votre préparation')}</p>
</td></tr>
</table>`;
}

/* ================================================================== */
/* Gabarit Major ECN                                                  */
/* ================================================================== */

/**
 * - `service` : e-mail transactionnel (compte, paiement, forum, suivi) ;
 * - `marketing` : prospection — lien de désinscription OBLIGATOIRE ;
 * - `internal` : notification réservée à l'équipe (version allégée, sans photo).
 */
export type MajorAudience = 'service' | 'marketing' | 'internal';

export type MajorEmailOptions = {
  /** Objet du mail (balise <title>). */
  subject: string;
  /** Texte d'aperçu dans la boîte de réception. */
  preheader?: string | null;
  /** Sur-titre bordeaux espacé (ex. « Inscription confirmée »). */
  eyebrow?: string | null;
  /** Grand titre serif du hero. */
  title?: string | null;
  /** Sous-titre en capitales très espacées. */
  lead?: string | null;
  /** Premiers paragraphes, à gauche de la photo (salutation, message principal). */
  intro?: string | null;
  /** Visuel d'article (campagnes), affiché en tête du corps. */
  heroImage?: { src: string; alt: string; width: number; height: number; href?: string } | null;
  /** Ancienne étiquette d'en-tête (conservée pour compatibilité, sans effet visuel). */
  tag?: string | null;
  bodyHtml: string;
  audience?: MajorAudience;
  /** Photo du hero ; `false` pour une version allégée (défaut : sans photo pour l'interne). */
  photo?: boolean;
  /** « Vous recevez cet e-mail parce que… » */
  reason?: string | null;
  /** Lien de désinscription (marketing). */
  unsubscribeUrl?: string | null;
};

const CAPS = (size: number, spacing: number, color: string, weight = 400) =>
  `font-family:${FONT_SANS};font-size:${size}px;line-height:${Math.round(size * 1.6)}px;letter-spacing:${spacing}px;text-transform:uppercase;font-weight:${weight};color:${color};`;

function majorHeaderInner(): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" width="130" style="width:130px;"><a href="${EMAIL_SITE}" target="_blank" rel="noopener">${img('major-ecn-logo-bordeaux.png', 130, 65, 'Major ECN')}</a></td>
<td valign="middle" width="20" style="width:20px;">&nbsp;</td>
<td valign="middle" width="1" class="em-hide-sm" style="width:1px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" height="46"><tr><td width="1" style="width:1px;background-color:#D8CBC5;font-size:0;line-height:0;" bgcolor="#D8CBC5">&nbsp;</td></tr></table></td>
<td valign="middle" class="em-hide-sm" style="padding:0 0 0 18px;${CAPS(10, 3, '#5A4E55')}">La référence<br>de votre préparation</td>
<td valign="top" align="right" class="em-hide-sm">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="right">
<tr><td style="${CAPS(9, 2.6, '#6E6268')}text-align:left;">Exigence<br>Bienveillance<br>Réussite</td></tr>
<tr><td style="padding:7px 0 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="30" style="width:30px;border-top:2px solid ${MAJOR.bordeauxBtn};font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
</table></td>
</tr></table>`;
}

function majorHeader(): string {
  return `<tr><td class="em-px" style="padding:24px 32px 18px;background-color:${MAJOR.cream};" bgcolor="${MAJOR.cream}">${majorHeaderInner()}</td></tr>`;
}

function majorHero(o: MajorEmailOptions, photo: boolean): string {
  if (!o.title) return '';
  const len = (o.title ?? '').length;
  const size = photo ? (len > 58 ? 25 : len > 34 ? 30 : 36) : (len > 58 ? 24 : 28);
  const eyebrow = o.eyebrow
    ? `<p style="margin:0 0 10px;${CAPS(11, 3.5, MAJOR.bordeauxBtn)}">${esc(o.eyebrow)}</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td width="40" style="width:40px;border-top:1.5px solid ${MAJOR.bordeauxBtn};font-size:0;line-height:0;">&nbsp;</td></tr></table>`
    : '';
  const title = `<h1 class="em-h1 em-serif" style="margin:0;font-family:${FONT_SERIF};font-size:${size}px;line-height:${Math.round(size * 1.14)}px;font-weight:700;letter-spacing:-0.4px;color:${MAJOR.bordeaux};">${esc(o.title)}</h1>`;
  const lead = o.lead
    ? `<p style="margin:16px 0 0;${CAPS(11, 3.6, '#3D3439')}">${esc(o.lead.replace(/\.\s*$/, ''))}</p>`
    : '';
  const intro = o.intro ? `<div style="margin:22px 0 0;">${o.intro}</div>` : '';
  if (!photo) {
    return `<tr><td class="em-px" style="padding:10px 32px 26px;background-color:${MAJOR.cream};border-bottom:1px solid ${MAJOR.line};" bgcolor="${MAJOR.cream}">${eyebrow}${title}${lead}${intro}</td></tr>`;
  }
  const hero = emailAsset('major-hero.jpg');
  return `<tr><td class="em-hero-bg" valign="top" height="440" style="height:440px;background-color:${MAJOR.cream};background-image:url('${hero}');background-repeat:no-repeat;background-position:right top;background-size:600px 440px;" bgcolor="${MAJOR.cream}">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
<tr><td class="em-px" colspan="2" style="padding:24px 32px 12px;">${majorHeaderInner()}</td></tr>
<tr><td colspan="2" class="em-show-sm" style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:0;line-height:0;">
<img src="${emailAsset('major-hero-mobile.jpg')}" width="600" height="300" alt="" class="em-fluid" style="display:block;width:100%;max-width:600px;height:auto;border:0;">
</td></tr>
<tr><td class="em-px em-full" width="340" valign="top" style="width:340px;padding:26px 0 0 32px;">${eyebrow}${title}</td><td class="em-hide-sm" style="font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="em-px" colspan="2" style="padding:0 32px;">${lead}</td></tr>
<tr><td class="em-px em-full" width="352" valign="top" style="width:352px;padding:0 0 6px 32px;font-family:${FONT_SANS};font-size:15px;line-height:24px;color:${MAJOR.body};">${intro}</td><td class="em-hide-sm" style="font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>`;
}

function majorFooter(o: { audience: MajorAudience; reason?: string | null; unsubscribeUrl?: string | null }): string {
  const year = new Date().getFullYear();
  const sep = `<span style="color:#C9BBB5;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`;
  const internal = o.audience === 'internal';
  const reason = o.reason ?? (internal
    ? 'Notification interne générée automatiquement par la plateforme Major ECN — document réservé à l’équipe.'
    : o.audience === 'marketing'
      ? 'Vous recevez cet e-mail car vous vous êtes inscrit(e) sur Major ECN.'
      : 'Cet e-mail de service concerne votre compte Major ECN.');
  const unsub = o.unsubscribeUrl
    ? `<br><a href="${esc(o.unsubscribeUrl)}" target="_blank" rel="noopener" style="color:${MAJOR.muted};text-decoration:underline;">Se désabonner</a>`
    : '';
  return `<tr><td class="em-px" style="padding:26px 32px 12px;background-color:${MAJOR.cream};border-top:1px solid ${MAJOR.line};" bgcolor="${MAJOR.cream}">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td width="120" valign="middle" class="em-stack" style="width:120px;"><a href="${EMAIL_SITE}" target="_blank" rel="noopener">${img('major-ecn-logo-bordeaux.png', 110, 55, 'Major ECN', 'margin:0 auto;')}</a></td>
<td valign="middle" align="center" class="em-stack" style="padding:10px 0 0;">
<p style="margin:0 0 10px;${CAPS(10, 4, '#4A4046')}text-align:center;">Ensemble vers votre réussite</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"><tr><td width="44" style="width:44px;border-top:2px solid ${MAJOR.bordeauxBtn};font-size:0;line-height:0;">&nbsp;</td></tr></table>
</td>
<td width="120" class="em-hide-sm" style="width:120px;">&nbsp;</td>
</tr></table>
</td></tr>
<tr><td class="em-px" align="center" style="padding:14px 32px 30px;background-color:${MAJOR.cream};" bgcolor="${MAJOR.cream}">
${internal ? '' : `<p style="margin:0 0 6px;font-family:${FONT_SANS};font-size:12px;line-height:19px;color:${MAJOR.muted};"><a href="mailto:${CONTACT_EMAIL}" style="color:${MAJOR.muted};text-decoration:none;">${CONTACT_EMAIL}</a>${sep}<a href="tel:${CONTACT_PHONE_INTL}" style="color:${MAJOR.muted};text-decoration:none;">${CONTACT_PHONE}</a>${sep}<a href="${EMAIL_SITE}" style="color:${MAJOR.muted};text-decoration:none;">www.major-ecn.fr</a></p>
<p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:11px;line-height:18px;color:${MAJOR.faint};">${esc(LEGAL_ENTITY)} · ${esc(LEGAL_ADDRESS)}</p>`}
<p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:11px;line-height:18px;color:${MAJOR.faint};">${esc(reason)}${unsub}</p>
<p style="margin:0;font-family:${FONT_SANS};font-size:11px;line-height:18px;color:${MAJOR.faint};">© ${year} Major ECN&nbsp;·&nbsp;<a href="${EMAIL_SITE}/mentions-legales" style="color:${MAJOR.faint};text-decoration:underline;">Mentions légales</a>&nbsp;·&nbsp;<a href="${EMAIL_SITE}/confidentialite" style="color:${MAJOR.faint};text-decoration:underline;">Confidentialité</a></p>
</td></tr>`;
}

/** E-mail complet à la charte Major ECN. */
export function majorEmail(o: MajorEmailOptions): string {
  const audience = o.audience ?? 'service';
  const photo = o.photo ?? audience !== 'internal';
  const cover = o.heroImage
    ? (() => {
        const w = 536, h = Math.round((o.heroImage.height / o.heroImage.width) * w);
        const im = `<img src="${esc(o.heroImage.src)}" width="${w}" height="${h}" alt="${esc(o.heroImage.alt)}" class="em-fluid" style="display:block;width:100%;max-width:${w}px;height:auto;border:0;border-radius:10px;">`;
        return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td>${o.heroImage.href ? `<a href="${esc(o.heroImage.href)}" target="_blank" rel="noopener">${im}</a>` : im}</td></tr></table>`;
      })()
    : '';
  const body = `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${MAJOR.page};" bgcolor="${MAJOR.page}">
<tr><td align="center" class="em-outer" style="padding:28px 12px 36px;">
<!--[if mso]><table role="presentation" width="600" align="center" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" class="em-container em-card" style="width:100%;max-width:600px;background-color:${MAJOR.cream};border:1px solid ${MAJOR.line};border-radius:14px;overflow:hidden;border-collapse:separate;" bgcolor="${MAJOR.cream}">
${photo && o.title ? '' : majorHeader()}
${majorHero(o, photo)}
<tr><td class="em-px" style="padding:${photo && o.title ? '14px' : '26px'} 32px 18px;background-color:${MAJOR.cream};font-family:${FONT_SANS};font-size:15px;line-height:24px;color:${MAJOR.body};" bgcolor="${MAJOR.cream}">
${cover}${o.bodyHtml}
</td></tr>
${majorFooter({ audience, reason: o.reason, unsubscribeUrl: o.unsubscribeUrl })}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>`;

  return emailDocument({ title: o.subject, preheader: o.preheader, scheme: 'light', pageBg: MAJOR.page, body });
}

/**
 * Version texte : corps + pied de page cohérent avec le HTML (coordonnées,
 * désinscription pour le marketing).
 */
export function majorText(lines: Array<string | null | false | undefined>, o: { audience?: MajorAudience; unsubscribeUrl?: string | null } = {}): string {
  const body = lines.filter((l): l is string => typeof l === 'string').join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const audience = o.audience ?? 'service';
  if (audience === 'internal') return `${body}\n\n—\nNotification interne Major ECN.`;
  const foot = [
    '—',
    `Major ECN · Ensemble vers votre réussite · ${EMAIL_SITE.replace('https://', '')}`,
    `${CONTACT_EMAIL} · ${CONTACT_PHONE}`,
    o.unsubscribeUrl ? `Se désabonner : ${o.unsubscribeUrl}` : null,
  ].filter(Boolean).join('\n');
  return `${body}\n\n${foot}`;
}
