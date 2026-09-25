/**
 * Mise en page des e-mails — socle commun Major ECN (et primitives réutilisées
 * par EVC Arena, cf. src/lib/arena/email-layout.ts).
 *
 * Règles de robustesse (Gmail, Outlook Windows/Mac, Apple Mail, iOS, Android) :
 * - structure 100 % en tables, styles EN LIGNE (le <style> du <head> ne sert
 *   qu'au responsive et aux clients qui le lisent) ;
 * - conteneur fluide de 600 px (width + max-width), media query < 620 px ;
 * - boutons « bulletproof » : cellule colorée + lien, et rectangle VML pour
 *   Outlook Windows qui ignore padding et border-radius des liens ;
 * - images PNG/JPG absolues (jamais de SVG), alt + width + height ;
 * - polices web-safe : Georgia pour les titres, pile système pour le texte ;
 * - `color-scheme` déclaré pour que les clients n'inversent pas la charte.
 *
 * Module PUR (aucun import serveur) : utilisable par les tests et la galerie
 * de prévisualisation (tmp/_emails-preview/render.ts).
 */

/** Domaine canonique : liens de pied de page et visuels hébergés. */
export const EMAIL_SITE = 'https://www.major-ecn.fr';

export const CONTACT_EMAIL = 'contact@major-ecn.fr';
export const CONTACT_PHONE = '01 47 34 35 71';
export const CONTACT_PHONE_INTL = '+33147343571';
export const LEGAL_ENTITY = 'Major ECN — PAE Formation';
export const LEGAL_ADDRESS = '3 rue Rosa Bonheur, 75015 Paris';

/**
 * Base des visuels (logos, bandeaux, pictogrammes) : toujours le domaine de
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

/** Charte Major ECN : rouge #E4002B du site, marine du logo (#102C5F). */
export const MAJOR = {
  red: '#E4002B',
  redDeep: '#B8001F',
  redSoft: '#FFF4F5',
  redLine: '#F7D3D9',
  navy: '#102C5F',
  navyDeep: '#0A1D40',
  navyInk: '#081733',
  ink: '#141B2B',
  body: '#3B4354',
  muted: '#667085',
  faint: '#98A2B3',
  line: '#E6E8EE',
  panel: '#F6F7F9',
  page: '#EDEFF3',
  white: '#FFFFFF',
  onNavy: '#C8D2E6',
  onNavyMuted: '#8C9AB8',
  success: '#0F7B4B',
  successSoft: '#EEF8F2',
  successLine: '#CBE9D7',
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
<style>table,td,div,p,a,span,h1,h2,h3{font-family:Arial,Helvetica,sans-serif !important;}</style>
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
  .em-px{padding-left:24px !important;padding-right:24px !important;}
  .em-h1{font-size:27px !important;line-height:33px !important;}
  .em-stack{display:block !important;width:100% !important;max-width:100% !important;box-sizing:border-box !important;}
  .em-stack-gap{padding:0 0 12px 0 !important;}
  .em-hide-sm{display:none !important;max-height:0 !important;overflow:hidden !important;}
  .em-btn{width:100% !important;}
  .em-btn a{display:block !important;}
  .em-fluid{width:100% !important;height:auto !important;}
  .em-center-sm{text-align:center !important;}
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
  /** Hauteur totale (VML Outlook) — le padding des autres clients s'y aligne. */
  height?: number;
  align?: 'left' | 'center';
  uppercase?: boolean;
  letterSpacing?: string;
};

/**
 * Bouton « bulletproof » : cellule colorée cliquable partout, rectangle VML
 * arrondi pour Outlook Windows (qui ignore padding/border-radius des <a>).
 */
export function emailButton(o: ButtonOptions): string {
  const bg = o.bg ?? MAJOR.red;
  const color = o.color ?? MAJOR.white;
  const radius = o.radius ?? 10;
  const height = o.height ?? 52;
  const fontSize = o.fontSize ?? 16;
  const font = o.fontFamily ?? FONT_SANS;
  const border = o.outline ? (o.borderColor ?? color) : bg;
  const fill = o.outline ? 'transparent' : bg;
  const label = esc(o.label);
  const href = esc(o.href);
  // Largeur estimée du VML (Outlook ne sait pas « s'adapter au texte »).
  const vmlWidth = Math.max(200, Math.min(520, Math.round(o.label.length * fontSize * 0.62 + 64)));
  const arc = Math.round((radius / height) * 100);
  const padV = Math.max(10, Math.round((height - fontSize * 1.25) / 2) - (o.outline ? 2 : 0));
  const transform = o.uppercase ? 'text-transform:uppercase;' : '';
  const spacing = o.letterSpacing ? `letter-spacing:${o.letterSpacing};` : '';
  const align = o.align ?? 'center';
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}" class="em-btn" style="margin:${align === 'center' ? '0 auto' : '0'};">
<tr><td align="center" ${o.outline ? '' : `bgcolor="${bg}"`} style="border-radius:${radius}px;background-color:${fill};${o.outline ? `border:2px solid ${border};` : ''}">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${height}px;v-text-anchor:middle;width:${vmlWidth}px;" arcsize="${arc}%" ${o.outline ? `strokecolor="${border}" strokeweight="2px" filled="f"` : `stroke="f" fillcolor="${bg}"`}>
<w:anchorlock/>
<center style="color:${color};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:bold;${transform}">${label}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-- -->
<a href="${href}" target="_blank" rel="noopener" style="display:inline-block;padding:${padV}px 34px;font-family:${font};font-size:${fontSize}px;line-height:${Math.round(fontSize * 1.25)}px;font-weight:700;color:${color};text-decoration:none;border-radius:${radius}px;${transform}${spacing}mso-hide:all;"><span style="color:${color};">${label}</span></a>
<!--<![endif]-->
</td></tr>
</table>`;
}

/** Espace vertical fiable (Outlook ignore les marges des tables). */
export function spacer(px: number): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td height="${px}" style="height:${px}px;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

/* ================================================================== */
/* Composants Major ECN (corps de message)                            */
/* ================================================================== */

const P_STYLE = `margin:0 0 16px;font-family:${FONT_SANS};font-size:16px;line-height:26px;color:${MAJOR.body};`;

/** Paragraphe à partir de HTML déjà sûr. */
export function pHtml(html: string, opts: { size?: number; color?: string; margin?: string; align?: 'left' | 'center' } = {}): string {
  const size = opts.size ?? 16;
  return `<p style="margin:${opts.margin ?? '0 0 16px'};font-family:${FONT_SANS};font-size:${size}px;line-height:${Math.round(size * 1.62)}px;color:${opts.color ?? MAJOR.body};${opts.align ? `text-align:${opts.align};` : ''}">${html}</p>`;
}
/** Paragraphe de texte brut (échappé). */
export function p(text: string, opts?: Parameters<typeof pHtml>[1]): string {
  return pHtml(esc(text), opts);
}

/** « Bonjour Prénom, » — le prénom en gras, formule neutre sans prénom. */
export function greeting(name: string | null | undefined, fallback = ''): string {
  const n = (name ?? '').trim() || fallback;
  return `<p style="${P_STYLE}">Bonjour${n ? ` <strong style="color:${MAJOR.ink};">${esc(n)}</strong>` : ''},</p>`;
}

/** Intertitre de section (petites capitales rouges + filet). */
export function sectionTitle(text: string, color: string = MAJOR.red): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 14px;">
<tr><td style="font-family:${FONT_SANS};font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${color};padding:0 0 8px;border-bottom:1px solid ${MAJOR.line};">${esc(text)}</td></tr>
</table>`;
}

/** Titre d'article en serif (campagnes, encadrés éditoriaux). */
export function heading(text: string, size = 22): string {
  return `<h2 style="margin:6px 0 14px;font-family:${FONT_SERIF};font-size:${size}px;line-height:${Math.round(size * 1.3)}px;font-weight:700;color:${MAJOR.ink};">${esc(text)}</h2>`;
}

/** Bouton principal centré, avec respiration. */
export function button(href: string, label: string, opts: Partial<ButtonOptions> = {}): string {
  return `${spacer(8)}${emailButton({ href, label, ...opts })}${spacer(24)}`;
}
/** Bouton secondaire (contour marine). */
export function buttonSecondary(href: string, label: string): string {
  return button(href, label, { outline: true, color: MAJOR.navy, borderColor: MAJOR.navy, height: 48, fontSize: 15 });
}

/** « Si le bouton ne fonctionne pas… » + URL cliquable, dans un cartouche discret. */
export function linkFallback(href: string, lead = 'Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :'): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="padding:14px 16px;background-color:${MAJOR.panel};border:1px solid ${MAJOR.line};border-radius:10px;" bgcolor="${MAJOR.panel}">
<p style="margin:0 0 6px;font-family:${FONT_SANS};font-size:12px;line-height:18px;color:${MAJOR.muted};">${esc(lead)}</p>
<p style="margin:0;font-family:${FONT_MONO};font-size:12px;line-height:18px;word-break:break-all;"><a href="${esc(href)}" target="_blank" rel="noopener" style="color:${MAJOR.navy};text-decoration:underline;">${esc(href)}</a></p>
</td></tr>
</table>`;
}

export type CalloutTone = 'brand' | 'navy' | 'neutral' | 'success';
const TONES: Record<CalloutTone, { bg: string; border: string; bar: string; title: string }> = {
  brand: { bg: MAJOR.redSoft, border: MAJOR.redLine, bar: MAJOR.red, title: MAJOR.redDeep },
  navy: { bg: '#F3F6FB', border: '#DCE3EF', bar: MAJOR.navy, title: MAJOR.navy },
  neutral: { bg: MAJOR.panel, border: MAJOR.line, bar: '#C5CBD6', title: MAJOR.muted },
  success: { bg: MAJOR.successSoft, border: MAJOR.successLine, bar: MAJOR.success, title: MAJOR.success },
};

/** Encadré à filet latéral : titre en petites capitales + contenu HTML. */
export function callout(o: { title?: string; html: string; tone?: CalloutTone; icon?: string }): string {
  const t = TONES[o.tone ?? 'brand'];
  const title = o.title
    ? `<p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${t.title};">${o.icon ? `${o.icon}&nbsp; ` : ''}${esc(o.title)}</p>`
    : '';
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr>
<td width="4" style="width:4px;background-color:${t.bar};border-radius:10px 0 0 10px;font-size:0;line-height:0;" bgcolor="${t.bar}">&nbsp;</td>
<td style="padding:18px 20px;background-color:${t.bg};border:1px solid ${t.border};border-left:0;border-radius:0 10px 10px 0;" bgcolor="${t.bg}">
${title}${o.html}
</td>
</tr>
</table>`;
}

/** Petit texte dans un encadré (lignes internes d'un callout). */
export function small(html: string, opts: { color?: string; margin?: string; italic?: boolean } = {}): string {
  return `<p style="margin:${opts.margin ?? '0'};font-family:${FONT_SANS};font-size:14px;line-height:22px;color:${opts.color ?? MAJOR.body};${opts.italic ? 'font-style:italic;' : ''}">${html}</p>`;
}

/**
 * Liste à pastilles iconographiées (✓ par défaut) : une table par ligne pour
 * un alignement parfait partout, y compris Outlook.
 */
export function iconList(items: string[], o: { icon?: string; tone?: 'brand' | 'navy' | 'danger' | 'success'; size?: number; html?: boolean } = {}): string {
  const icon = o.icon ?? '&#10003;';
  const palette = {
    brand: { bg: '#FDE7EA', fg: MAJOR.red },
    navy: { bg: '#E6ECF6', fg: MAJOR.navy },
    danger: { bg: '#FDE7EA', fg: MAJOR.redDeep },
    success: { bg: '#E3F4EA', fg: MAJOR.success },
  }[o.tone ?? 'brand'];
  const size = o.size ?? 15;
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
${items.map((it) => `<tr>
<td width="34" valign="top" style="width:34px;padding:0 0 12px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="22" height="22" align="center" valign="middle" style="width:22px;height:22px;border-radius:11px;background-color:${palette.bg};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:22px;font-weight:700;color:${palette.fg};" bgcolor="${palette.bg}">${icon}</td></tr></table>
</td>
<td valign="top" style="padding:1px 0 12px;font-family:${FONT_SANS};font-size:${size}px;line-height:${Math.round(size * 1.47)}px;color:${MAJOR.body};">${o.html ? it : esc(it)}</td>
</tr>`).join('\n')}
</table>`;
}

/** Tableau récapitulatif libellé → valeur (valeurs en HTML sûr). */
export function summaryTable(rows: Array<[string, string] | null | false | undefined>, o: { title?: string; labelWidth?: number } = {}): string {
  const list = rows.filter((r): r is [string, string] => Array.isArray(r));
  if (list.length === 0) return '';
  const lw = o.labelWidth ?? 36;
  const head = o.title
    ? `<tr><td colspan="2" style="padding:14px 18px;background-color:${MAJOR.panel};border-bottom:1px solid ${MAJOR.line};font-family:${FONT_SANS};font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${MAJOR.muted};" bgcolor="${MAJOR.panel}">${esc(o.title)}</td></tr>`
    : '';
  const body = list.map(([label, value], i) => `<tr>
<td width="${lw}%" valign="top" style="width:${lw}%;padding:12px 12px 12px 18px;${i < list.length - 1 ? `border-bottom:1px solid ${MAJOR.line};` : ''}font-family:${FONT_SANS};font-size:13px;line-height:20px;color:${MAJOR.muted};">${esc(label)}</td>
<td valign="top" style="padding:12px 18px 12px 12px;${i < list.length - 1 ? `border-bottom:1px solid ${MAJOR.line};` : ''}font-family:${FONT_SANS};font-size:14px;line-height:21px;font-weight:600;color:${MAJOR.ink};word-break:break-word;">${value}</td>
</tr>`).join('\n');
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${MAJOR.line};border-radius:12px;border-collapse:separate;overflow:hidden;">
${head}${body}
</table>`;
}

/** Valeur monospace (adresses e-mail, identifiants). */
export function mono(s: string): string {
  return `<span style="font-family:${FONT_MONO};font-size:13px;font-weight:500;">${esc(s)}</span>`;
}
/** Lien mailto. */
export function mailto(email: string, color: string = MAJOR.navy): string {
  return `<a href="mailto:${esc(email)}" style="color:${color};text-decoration:underline;font-weight:600;">${esc(email)}</a>`;
}

/** Citation / message rapporté (texte brut, retours à la ligne conservés). */
export function quote(text: string, o: { label?: string; tone?: 'neutral' | 'brand' } = {}): string {
  const brand = o.tone === 'brand';
  const bg = brand ? MAJOR.redSoft : MAJOR.panel;
  const bd = brand ? MAJOR.redLine : MAJOR.line;
  const label = o.label
    ? `<p style="margin:0 0 8px;font-family:${FONT_SANS};font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${brand ? MAJOR.redDeep : MAJOR.muted};">${esc(o.label)}</p>`
    : '';
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="padding:18px 20px 18px 20px;background-color:${bg};border:1px solid ${bd};border-radius:12px;" bgcolor="${bg}">
${label}<p style="margin:0;font-family:${FONT_SANS};font-size:15px;line-height:24px;color:${MAJOR.ink};white-space:pre-wrap;">${esc(text).replace(/\r?\n/g, '<br>')}</p>
</td></tr>
</table>`;
}

/** Citation éditoriale mise en exergue (campagnes). */
export function pullQuote(lineA: string, lineB: string): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:4px 0 28px;">
<tr><td align="center" style="padding:26px 28px;background-color:${MAJOR.navy};border-radius:14px;" bgcolor="${MAJOR.navy}">
<p style="margin:0 0 6px;font-family:${FONT_SERIF};font-size:30px;line-height:30px;color:${MAJOR.red};">&ldquo;</p>
<p style="margin:0 0 8px;font-family:${FONT_SERIF};font-size:17px;line-height:26px;font-style:italic;color:${MAJOR.onNavy};">${esc(lineA)}</p>
<p style="margin:0;font-family:${FONT_SERIF};font-size:20px;line-height:28px;font-weight:700;color:${MAJOR.white};">${esc(lineB)}</p>
</td></tr>
</table>`;
}

/** Filet horizontal. */
export function divider(margin = '8px 0 28px'): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:${margin};"><tr><td style="border-top:1px solid ${MAJOR.line};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>`;
}

/** Mention discrète (conditions, validité d'un lien…). */
export function note(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_SANS};font-size:13px;line-height:21px;color:${MAJOR.muted};">${html}</p>`;
}

/** Bloc « Une question ? » avec téléphone et e-mail. */
export function contactCard(title = 'Une question sur votre préparation ?', lead = 'Notre équipe est à votre disposition pour vous accompagner et répondre à vos questions.'): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:4px 0 28px;">
<tr><td style="padding:22px 24px;background-color:${MAJOR.panel};border:1px solid ${MAJOR.line};border-radius:14px;" bgcolor="${MAJOR.panel}">
<p style="margin:0 0 6px;font-family:${FONT_SANS};font-size:16px;line-height:22px;font-weight:700;color:${MAJOR.ink};">${esc(title)}</p>
<p style="margin:0 0 14px;font-family:${FONT_SANS};font-size:14px;line-height:22px;color:${MAJOR.body};">${esc(lead)}</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
<td class="em-stack em-stack-gap" style="padding:0 24px 0 0;font-family:${FONT_SANS};font-size:14px;line-height:20px;"><a href="tel:${CONTACT_PHONE_INTL}" style="color:${MAJOR.navy};font-weight:700;text-decoration:none;">&#9990;&nbsp; ${CONTACT_PHONE}</a></td>
<td class="em-stack" style="font-family:${FONT_SANS};font-size:14px;line-height:20px;"><a href="mailto:${CONTACT_EMAIL}" style="color:${MAJOR.navy};font-weight:700;text-decoration:none;">&#9993;&nbsp; ${CONTACT_EMAIL}</a></td>
</tr></table>
</td></tr>
</table>`;
}

/** Signature d'équipe. */
export function signature(o: { closing?: string; team?: string; role?: string } = {}): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:12px 0 0;">
<tr><td style="padding:20px 0 0;border-top:1px solid ${MAJOR.line};">
<p style="margin:0 0 4px;font-family:${FONT_SANS};font-size:15px;line-height:22px;color:${MAJOR.body};">${esc(o.closing ?? 'À très bientôt,')}</p>
<p style="margin:0;font-family:${FONT_SERIF};font-size:18px;line-height:26px;font-weight:700;color:${MAJOR.ink};">${esc(o.team ?? 'L’équipe Major ECN')}</p>
<p style="margin:2px 0 0;font-family:${FONT_SANS};font-size:12px;line-height:18px;letter-spacing:1.2px;text-transform:uppercase;color:${MAJOR.red};font-weight:700;">${esc(o.role ?? 'Préparation aux EVC')}</p>
</td></tr>
</table>`;
}

/* ================================================================== */
/* Gabarit Major ECN                                                  */
/* ================================================================== */

/**
 * - `service` : e-mail transactionnel (compte, paiement, forum, suivi) ;
 * - `marketing` : prospection — lien de désinscription OBLIGATOIRE ;
 * - `internal` : notification réservée à l'équipe.
 */
export type MajorAudience = 'service' | 'marketing' | 'internal';

export type MajorEmailOptions = {
  /** Objet du mail (balise <title>). */
  subject: string;
  /** Texte d'aperçu dans la boîte de réception. */
  preheader?: string | null;
  /** Petite ligne au-dessus du titre (catégorie). */
  eyebrow?: string | null;
  /** Grand titre du bandeau. */
  title?: string | null;
  /** Chapô sous le titre (texte brut). */
  lead?: string | null;
  /** Visuel pleine largeur à la place du bandeau marine (campagnes). */
  heroImage?: { src: string; alt: string; width: number; height: number; href?: string } | null;
  /** Étiquette à droite du logo (ex. « Sécurité du compte »). */
  tag?: string | null;
  bodyHtml: string;
  audience?: MajorAudience;
  /** « Vous recevez cet e-mail parce que… » */
  reason?: string | null;
  /** Lien de désinscription (marketing). */
  unsubscribeUrl?: string | null;
};

function majorFooter(o: { audience: MajorAudience; reason?: string | null; unsubscribeUrl?: string | null }): string {
  const year = new Date().getFullYear();
  const link = (href: string, label: string) =>
    `<a href="${href}" target="_blank" rel="noopener" style="color:${MAJOR.white};text-decoration:none;font-weight:600;">${label}</a>`;
  const sep = `<span style="color:${MAJOR.onNavyMuted};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`;
  if (o.audience === 'internal') {
    return `<tr><td class="em-px" style="padding:22px 40px;background-color:${MAJOR.navyDeep};" bgcolor="${MAJOR.navyDeep}">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" width="96" style="width:96px;"><img src="${emailAsset('major-ecn-logo-white.png')}" width="84" height="42" alt="Major ECN" style="display:block;width:84px;height:42px;border:0;"></td>
<td valign="middle" style="font-family:${FONT_SANS};font-size:12px;line-height:18px;color:${MAJOR.onNavy};">${esc(o.reason ?? 'Notification interne générée automatiquement par la plateforme Major ECN.')}<br><span style="color:${MAJOR.onNavyMuted};">Document réservé à l’équipe — ne pas transférer.</span></td>
</tr></table>
</td></tr>`;
  }
  const reason = o.reason ?? (o.audience === 'marketing'
    ? 'Vous recevez cet e-mail car vous vous êtes inscrit(e) sur Major ECN.'
    : 'Cet e-mail de service concerne votre compte Major ECN.');
  const unsub = o.unsubscribeUrl
    ? `<br><a href="${esc(o.unsubscribeUrl)}" target="_blank" rel="noopener" style="color:${MAJOR.onNavy};text-decoration:underline;">Se désabonner</a>`
    : '';
  return `<tr><td class="em-px" align="center" style="padding:36px 40px 32px;background-color:${MAJOR.navyDeep};" bgcolor="${MAJOR.navyDeep}">
<a href="${EMAIL_SITE}" target="_blank" rel="noopener"><img src="${emailAsset('major-ecn-logo-white.png')}" width="120" height="60" alt="Major ECN" style="display:block;width:120px;height:60px;border:0;margin:0 auto;"></a>
<p style="margin:14px 0 20px;font-family:${FONT_SERIF};font-size:15px;line-height:22px;font-style:italic;color:${MAJOR.onNavy};">La préparation aux EVC depuis 2011</p>
<p style="margin:0 0 20px;font-family:${FONT_SANS};font-size:13px;line-height:20px;">${link(EMAIL_SITE, 'Le site')}${sep}${link(`${EMAIL_SITE}/plateforme`, 'La plateforme')}${sep}${link(`${EMAIL_SITE}/contact`, 'Nous contacter')}${sep}${link(`${EMAIL_SITE}/faq`, 'FAQ')}</p>
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:24px 0 0;"><tr><td style="border-top:1px solid #1E3563;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>
<p style="margin:20px 0 6px;font-family:${FONT_SANS};font-size:12px;line-height:19px;color:${MAJOR.onNavy};"><a href="mailto:${CONTACT_EMAIL}" style="color:${MAJOR.onNavy};text-decoration:none;">${CONTACT_EMAIL}</a>${sep}<a href="tel:${CONTACT_PHONE_INTL}" style="color:${MAJOR.onNavy};text-decoration:none;">${CONTACT_PHONE}</a></p>
<p style="margin:0 0 14px;font-family:${FONT_SANS};font-size:12px;line-height:19px;color:${MAJOR.onNavyMuted};">${esc(LEGAL_ENTITY)} · ${esc(LEGAL_ADDRESS)}</p>
<p style="margin:0 0 14px;font-family:${FONT_SANS};font-size:11px;line-height:18px;color:${MAJOR.onNavyMuted};">${esc(reason)}${unsub}</p>
<p style="margin:0;font-family:${FONT_SANS};font-size:11px;line-height:18px;color:${MAJOR.onNavyMuted};">© ${year} Major ECN&nbsp;·&nbsp;<a href="${EMAIL_SITE}/mentions-legales" style="color:${MAJOR.onNavyMuted};text-decoration:underline;">Mentions légales</a>&nbsp;·&nbsp;<a href="${EMAIL_SITE}/confidentialite" style="color:${MAJOR.onNavyMuted};text-decoration:underline;">Confidentialité</a></p>
</td></tr>`;
}

/** E-mail complet à la charte Major ECN. */
export function majorEmail(o: MajorEmailOptions): string {
  const audience = o.audience ?? 'service';
  const tag = o.tag ?? (audience === 'internal' ? 'Notification interne' : o.eyebrow ?? null);
  const header = `<tr><td style="height:4px;background-color:${MAJOR.red};font-size:0;line-height:0;" bgcolor="${MAJOR.red}">&nbsp;</td></tr>
<tr><td class="em-px" style="padding:${o.heroImage ? '16px 40px' : '22px 40px'};background-color:${MAJOR.white};" bgcolor="${MAJOR.white}">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
${o.heroImage
  ? `<td valign="middle" style="font-family:${FONT_SERIF};font-size:15px;line-height:20px;font-weight:700;color:${MAJOR.navy};"><a href="${EMAIL_SITE}" target="_blank" rel="noopener" style="color:${MAJOR.navy};text-decoration:none;">La lettre <span style="color:${MAJOR.red};">Major ECN</span></a></td>`
  : `<td valign="middle"><a href="${EMAIL_SITE}" target="_blank" rel="noopener"><img src="${emailAsset('major-ecn-logo.png')}" width="112" height="56" alt="Major ECN" style="display:block;width:112px;height:56px;border:0;"></a></td>`}
${tag ? `<td valign="middle" align="right" class="em-hide-sm" style="font-family:${FONT_SANS};font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${MAJOR.muted};">${esc(tag)}</td>` : ''}
</tr></table>
</td></tr>`;

  let hero = '';
  if (o.heroImage) {
    const img = `<img src="${esc(o.heroImage.src)}" width="${o.heroImage.width}" height="${o.heroImage.height}" alt="${esc(o.heroImage.alt)}" class="em-fluid" style="display:block;width:100%;max-width:${o.heroImage.width}px;height:auto;border:0;">`;
    hero = `<tr><td style="padding:0;background-color:${MAJOR.panel};" bgcolor="${MAJOR.panel}">${o.heroImage.href ? `<a href="${esc(o.heroImage.href)}" target="_blank" rel="noopener">${img}</a>` : img}</td></tr>`;
  } else if (o.title) {
    const eyebrow = o.eyebrow
      ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr>
<td width="28" style="width:28px;border-top:2px solid ${MAJOR.red};font-size:0;line-height:0;">&nbsp;</td>
<td style="padding:0 0 0 10px;font-family:${FONT_SANS};font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#FF8FA0;">${esc(o.eyebrow)}</td>
</tr></table>`
      : '';
    const lead = o.lead
      ? `<p style="margin:14px 0 0;font-family:${FONT_SANS};font-size:16px;line-height:25px;color:${MAJOR.onNavy};">${esc(o.lead)}</p>`
      : '';
    const pad = audience === 'internal' ? '28px 40px 28px' : '40px 40px 38px';
    hero = `<tr><td class="em-px" style="padding:${pad};background-color:${MAJOR.navy};background-image:linear-gradient(135deg,${MAJOR.navy} 0%,${MAJOR.navyDeep} 100%);" bgcolor="${MAJOR.navy}">
${eyebrow}<h1 class="em-h1" style="margin:0;font-family:${FONT_SERIF};font-size:${audience === 'internal' ? 26 : 32}px;line-height:${audience === 'internal' ? 32 : 39}px;font-weight:700;color:${MAJOR.white};">${esc(o.title)}</h1>
${lead}
</td></tr>
<tr><td style="height:3px;font-size:0;line-height:0;background-color:${MAJOR.red};" bgcolor="${MAJOR.red}">&nbsp;</td></tr>`;
  }

  const body = `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${MAJOR.page};" bgcolor="${MAJOR.page}">
<tr><td align="center" class="em-outer" style="padding:32px 12px 40px;">
<!--[if mso]><table role="presentation" width="600" align="center" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" class="em-container em-card" style="width:100%;max-width:600px;background-color:${MAJOR.white};border-radius:16px;overflow:hidden;border-collapse:separate;box-shadow:0 12px 40px rgba(16,44,95,0.10);" bgcolor="${MAJOR.white}">
${header}
${hero}
<tr><td class="em-px" style="padding:40px 40px 36px;background-color:${MAJOR.white};font-family:${FONT_SANS};font-size:16px;line-height:26px;color:${MAJOR.body};" bgcolor="${MAJOR.white}">
${o.bodyHtml}
</td></tr>
${majorFooter({ audience, reason: o.reason, unsubscribeUrl: o.unsubscribeUrl })}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>`;

  return emailDocument({ title: o.subject, preheader: o.preheader, scheme: 'light', pageBg: MAJOR.page, body });
}

/**
 * Version texte : corps + pied de page cohérent avec le HTML (signature,
 * coordonnées, désinscription pour le marketing).
 */
export function majorText(lines: Array<string | null | false | undefined>, o: { audience?: MajorAudience; unsubscribeUrl?: string | null } = {}): string {
  const body = lines.filter((l): l is string => typeof l === 'string').join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const audience = o.audience ?? 'service';
  if (audience === 'internal') return `${body}\n\n—\nNotification interne Major ECN.`;
  const foot = [
    '—',
    `Major ECN · ${EMAIL_SITE.replace('https://', '')}`,
    `${CONTACT_EMAIL} · ${CONTACT_PHONE}`,
    o.unsubscribeUrl ? `Se désabonner : ${o.unsubscribeUrl}` : null,
  ].filter(Boolean).join('\n');
  return `${body}\n\n${foot}`;
}
