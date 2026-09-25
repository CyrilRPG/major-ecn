/**
 * EVC Arena — mise en page des e-mails (charte sombre et premium, §13 du
 * cahier des charges : fond #0B0F14, rouge Major ECN, or de l'arène, grands
 * chiffres, aucune gamification enfantine).
 *
 * S'appuie sur les primitives communes de `@/lib/email/layout` (document,
 * bouton bulletproof, préheader) ; ce module ne porte que la charte Arena.
 * Module PUR : les URLs (espace, règles, désinscription signée) sont
 * calculées par `emails.ts` et passées en paramètre.
 */
import { EMAIL_SITE, emailAsset, emailButton, emailDocument, esc, spacer, FONT_SERIF } from '@/lib/email/layout';

export const ARENA_MAIL = {
  page: '#05070A',
  bg: '#0B0F14',
  panel: '#0E1620',
  raised: '#131D29',
  raised2: '#182433',
  line: '#223044',
  lineSoft: '#1A2636',
  red: '#E4002B',
  redSoft: '#FF4D66',
  gold: '#E9B949',
  goldSoft: '#F3D488',
  goldDeep: '#8E6B1F',
  text: '#F2F3F5',
  soft: '#C3C9D2',
  muted: '#8A93A0',
  faint: '#5F6875',
  ok: '#2ECC71',
} as const;

/** Titres condensés : Bebas Neue (Apple Mail, iOS) sinon Oswald / Impact. */
export const ARENA_HEAD = "'Bebas Neue', 'Oswald', Impact, 'Haettenschweiler', 'Arial Narrow Bold', 'Franklin Gothic Bold', sans-serif";
export const ARENA_BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const A = ARENA_MAIL;

/* ------------------------------------------------------------------ */
/* Composants                                                          */
/* ------------------------------------------------------------------ */

/** Paragraphe (texte brut échappé). */
export function aP(text: string, o: { color?: string; size?: number; margin?: string } = {}): string {
  return aPHtml(esc(text), o);
}
export function aPHtml(html: string, o: { color?: string; size?: number; margin?: string; align?: 'left' | 'center' } = {}): string {
  const size = o.size ?? 16;
  return `<p style="margin:${o.margin ?? '0 0 16px'};font-family:${ARENA_BODY};font-size:${size}px;line-height:${Math.round(size * 1.6)}px;color:${o.color ?? A.soft};${o.align ? `text-align:${o.align};` : ''}">${html}</p>`;
}

/** « Bonjour Prénom, » */
export function aHello(name: string | null | undefined): string {
  const n = (name ?? '').trim();
  return aPHtml(`Bonjour${n ? ` <strong style="color:${A.text};">${esc(n)}</strong>` : ''},`);
}

/** Bouton rouge Arena, capitales condensées. */
export function aButton(label: string, href: string): string {
  return `${spacer(10)}${emailButton({
    href,
    label,
    bg: A.red,
    color: '#FFFFFF',
    radius: 8,
    height: 54,
    fontSize: 16,
    uppercase: true,
    letterSpacing: '1.6px',
    arrow: true,
  })}${spacer(26)}`;
}

/** Intertitre : filet or + capitales. */
export function aLabel(text: string, color: string = A.gold): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;"><tr>
<td width="22" style="width:22px;border-top:2px solid ${color};font-size:0;line-height:0;">&nbsp;</td>
<td style="padding:0 0 0 10px;font-family:${ARENA_BODY};font-size:12px;line-height:16px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};">${esc(text)}</td>
</tr></table>`;
}

/** Panneau surélevé à filet latéral (or par défaut, rouge pour l'urgence). */
export function aPanel(html: string, o: { accent?: 'gold' | 'red' | 'none'; title?: string; icon?: { file: string; alt: string } } = {}): string {
  const bar = o.accent === 'red' ? A.red : o.accent === 'none' ? A.line : A.gold;
  const title = o.title
    ? `<p style="margin:0 0 10px;font-family:${ARENA_BODY};font-size:11px;line-height:16px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${bar === A.line ? A.muted : bar};">${esc(o.title)}</p>`
    : '';
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr>
<td width="3" style="width:3px;background-color:${bar};font-size:0;line-height:0;" bgcolor="${bar}">&nbsp;</td>
${o.icon ? `<td width="96" valign="middle" align="center" class="em-hide-sm" style="width:96px;padding:16px 0 16px 16px;background-color:${A.raised};border-top:1px solid ${A.line};border-bottom:1px solid ${A.line};" bgcolor="${A.raised}"><img src="${emailAsset(o.icon.file)}" width="64" height="64" alt="${esc(o.icon.alt)}" style="display:block;width:64px;height:64px;border:0;margin:0 auto;"></td>
<td width="18" class="em-hide-sm" style="width:18px;background-color:${A.raised};border-top:1px solid ${A.line};border-bottom:1px solid ${A.line};" bgcolor="${A.raised}"><table role="presentation" border="0" cellpadding="0" cellspacing="0" height="56" align="center"><tr><td width="2" style="width:2px;background-color:${bar};font-size:0;line-height:0;" bgcolor="${bar}">&nbsp;</td></tr></table></td>` : ''}
<td style="padding:18px 20px;background-color:${A.raised};border:1px solid ${A.line};border-left:0;" bgcolor="${A.raised}">${title}${html}</td>
</tr>
</table>`;
}

/** Bloc crème « Pour aller plus loin » (passerelle Major ECN, cf. lib/arena/passerelle.ts). */
export type ArenaPlusLoin = { title: string; lead: string; label: string; href: string };

const CREAM = '#F5ECE2';
const BORDEAUX = '#6E1426';

function plusLoinHtml(o: ArenaPlusLoin): string {
  const picto = (file: string, label: string) => `<td valign="middle" class="em-stack" style="padding:0 6px 10px 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" style="padding:0 7px 0 0;"><img src="${emailAsset(file)}" width="24" height="24" alt="" style="display:block;width:24px;height:24px;border:0;"></td>
<td valign="middle" style="font-family:${ARENA_BODY};font-size:11px;line-height:15px;color:#4A3A3F;white-space:nowrap;">${label}</td>
</tr></table></td>`;
  return `<tr><td class="em-px" style="padding:4px 20px 8px;background-color:${A.panel};" bgcolor="${A.panel}">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${CREAM};border:1px solid #E6D6C4;border-radius:12px;border-collapse:separate;overflow:hidden;" bgcolor="${CREAM}">
<tr>
<td valign="top" class="em-stack" style="padding:24px 8px 12px 26px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 14px;"><tr>
<td width="26" style="width:26px;border-top:1px solid #B9955A;font-size:0;line-height:0;">&nbsp;</td>
<td style="padding:0 10px;font-family:${ARENA_BODY};font-size:10.5px;line-height:14px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${BORDEAUX};">Pour aller plus loin</td>
<td width="26" style="width:26px;border-top:1px solid #B9955A;font-size:0;line-height:0;">&nbsp;</td>
</tr></table>
<h2 class="em-serif" style="margin:0 0 12px;font-family:${FONT_SERIF};font-size:27px;line-height:31px;font-weight:700;letter-spacing:-0.4px;color:${BORDEAUX};">${esc(o.title)}</h2>
<p style="margin:0 0 18px;font-family:${ARENA_BODY};font-size:14px;line-height:21px;color:#3A2E33;">${esc(o.lead)}</p>
${emailButton({ href: o.href, label: o.label, bg: BORDEAUX, color: '#FFFFFF', radius: 6, height: 46, fontSize: 13, uppercase: true, letterSpacing: '1.4px', padX: 22, arrow: true, align: 'left' })}
</td>
<td width="200" valign="top" class="em-hide-sm" style="width:200px;padding:0;"><img src="${emailAsset('arena-plus-loin.jpg')}" width="200" height="231" alt="Même ambition. Plus loin ensemble." style="display:block;width:200px;height:231px;border:0;"></td>
</tr>
<tr><td colspan="2" style="padding:6px 20px 14px 26px;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
${picto('arena-ico-cours.png', 'Cours et fiches<br>de synthèse')}
${picto('arena-ico-qcm.png', 'QCM ou QROC<br>selon votre voie')}
${picto('arena-ico-cas.png', 'Cas cliniques<br>et annales')}
${picto('arena-ico-suivi.png', 'Suivi de progression<br>personnalisé')}
</tr></table>
</td></tr>
</table>
</td></tr>`;
}

/** Ligne de texte dans un panneau. */
export function aLine(html: string, o: { strong?: boolean; margin?: string; size?: number; color?: string } = {}): string {
  const size = o.size ?? (o.strong ? 16 : 14);
  return `<p style="margin:${o.margin ?? '0'};font-family:${ARENA_BODY};font-size:${size}px;line-height:${Math.round(size * 1.55)}px;${o.strong ? `font-weight:700;color:${o.color ?? A.text};` : `color:${o.color ?? A.soft};`}">${html}</p>`;
}

/** Horaires / informations clés : libellé à gauche, valeur à droite. */
export function aFacts(rows: Array<[string, string] | null | false | undefined>): string {
  const list = rows.filter((r): r is [string, string] => Array.isArray(r));
  if (list.length === 0) return '';
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:${A.raised};border:1px solid ${A.line};" bgcolor="${A.raised}">
${list.map(([k, v], i) => `<tr>
<td width="34%" valign="top" style="width:34%;padding:14px 12px 14px 20px;${i < list.length - 1 ? `border-bottom:1px solid ${A.lineSoft};` : ''}font-family:${ARENA_BODY};font-size:11px;line-height:18px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${A.gold};">${esc(k)}</td>
<td valign="top" style="padding:14px 20px 14px 12px;${i < list.length - 1 ? `border-bottom:1px solid ${A.lineSoft};` : ''}font-family:${ARENA_BODY};font-size:15px;line-height:22px;color:${A.text};">${v}</td>
</tr>`).join('\n')}
</table>`;
}

/** Liste à puces numérotées or (règles). */
export function aList(items: string[], o: { numbered?: boolean } = {}): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
${items.map((it, i) => `<tr>
<td width="34" valign="top" style="width:34px;padding:0 0 12px;font-family:${ARENA_HEAD};font-size:18px;line-height:22px;color:${A.gold};">${o.numbered ? String(i + 1).padStart(2, '0') : '&#9670;'}</td>
<td valign="top" style="padding:0 0 12px;font-family:${ARENA_BODY};font-size:14px;line-height:22px;color:${A.soft};">${esc(it)}</td>
</tr>`).join('\n')}
</table>`;
}

export type ArenaStat = { label: string; value: string; unit?: string; sub?: string; accent?: 'gold' | 'red' | 'text' };

/** Grands chiffres (notes, rang) : tuiles côte à côte, empilées sur mobile. */
export function aStats(stats: ArenaStat[]): string {
  const n = stats.length;
  const w = Math.floor(100 / n);
  const cells = stats.map((s, i) => {
    const color = s.accent === 'red' ? A.red : s.accent === 'text' ? A.text : A.gold;
    return `<td width="${w}%" valign="top" class="em-stack em-stack-gap" style="width:${w}%;padding:0 ${i < n - 1 ? 6 : 0}px 0 ${i > 0 ? 6 : 0}px;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${A.raised};border:1px solid ${A.line};border-top:3px solid ${color};" bgcolor="${A.raised}">
<tr><td align="center" style="padding:18px 12px 20px;">
<p style="margin:0 0 6px;font-family:${ARENA_BODY};font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;white-space:nowrap;color:${A.muted};">${esc(s.label)}</p>
<p style="margin:0;font-family:${ARENA_HEAD};font-size:58px;line-height:60px;color:${color};letter-spacing:1px;">${esc(s.value)}${s.unit ? `<span style="font-size:26px;line-height:26px;color:${A.muted};">&nbsp;${esc(s.unit)}</span>` : ''}</p>
${s.sub ? `<p style="margin:6px 0 0;font-family:${ARENA_BODY};font-size:13px;line-height:18px;color:${A.soft};">${esc(s.sub)}</p>` : ''}
</td></tr>
</table>
</td>`;
  }).join('\n');
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;"><tr>
${cells}
</tr></table>`;
}

/** Filet fin. */
export function aRule(margin = '4px 0 24px'): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:${margin};"><tr><td style="border-top:1px solid ${A.line};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>`;
}

/* ------------------------------------------------------------------ */
/* Gabarit                                                             */
/* ------------------------------------------------------------------ */

export type ArenaShellOptions = {
  subject: string;
  preheader?: string | null;
  /** Ligne au-dessus du titre (ex. « Manche 2 · Ouverture »). */
  eyebrow?: string | null;
  title: string;
  bodyHtml: string;
  tournament: { title: string; edition_label?: string | null; specialty?: string | null };
  links: { landing: string; space: string; rules: string };
  /** « Mon espace » du pied de page (lien de confirmation/connexion si pertinent). */
  accessUrl?: string | null;
  /** Lien de désinscription signé (participants uniquement). */
  unsubscribeUrl?: string | null;
  /** Raison de réception affichée en pied de page. */
  reason?: string | null;
  /** Mention légale « tournoi ludique d'entraînement… » (texts.ts, §9). */
  legalNotice?: string | null;
  /** Site Major ECN (lien du pied de page). */
  siteUrl?: string;
  /** Bloc crème « Pour aller plus loin » (résultats, inscription) ; absent des mails techniques. */
  plusLoin?: ArenaPlusLoin | null;
};

/** E-mail complet à la charte EVC Arena. */
export function arenaShell(o: ArenaShellOptions): string {
  const site = (o.siteUrl ?? EMAIL_SITE).replace(/\/+$/, '');
  const t = o.tournament;
  const strip = [t.title, t.edition_label].filter(Boolean).map((s) => esc(s)).join(`<span style="color:${A.goldDeep};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`);
  const footLink = (href: string, label: string) =>
    `<a href="${esc(href)}" target="_blank" rel="noopener" style="color:${A.soft};text-decoration:none;font-weight:600;">${label}</a>`;
  const sep = `<span style="color:${A.faint};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`;
  const eyebrow = o.eyebrow
    ? `<p style="margin:0 0 10px;font-family:${ARENA_BODY};font-size:12px;line-height:16px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:${A.gold};">${esc(o.eyebrow)}</p>`
    : '';
  const legal = o.legalNotice
    ? `<tr><td class="em-px" style="padding:0 40px 22px;background-color:${A.panel};" bgcolor="${A.panel}">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td style="padding:14px 16px;border:1px solid ${A.line};background-color:${A.bg};" bgcolor="${A.bg}">
<p style="margin:0;font-family:${ARENA_BODY};font-size:12px;line-height:19px;color:${A.muted};"><strong style="color:${A.soft};letter-spacing:1.2px;text-transform:uppercase;font-size:10px;">Nature du dispositif&nbsp;&nbsp;</strong>${esc(o.legalNotice)}</p>
</td></tr></table>
</td></tr>`
    : '';

  const body = `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${A.page};" bgcolor="${A.page}">
<tr><td align="center" class="em-outer" style="padding:28px 12px 40px;">
<!--[if mso]><table role="presentation" width="600" align="center" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" class="em-container em-card" style="width:100%;max-width:600px;background-color:${A.bg};border:1px solid ${A.lineSoft};border-radius:14px;overflow:hidden;border-collapse:separate;" bgcolor="${A.bg}">
<tr><td style="padding:0;background-color:${A.bg};" bgcolor="${A.bg}"><a href="${esc(o.links.landing)}" target="_blank" rel="noopener"><img src="${emailAsset('evc-arena-banner.jpg')}" width="600" height="210" alt="EVC Arena by Major ECN" class="em-fluid" style="display:block;width:100%;max-width:600px;height:auto;border:0;color:${A.text};font-family:${ARENA_HEAD};font-size:32px;letter-spacing:2px;background-color:${A.bg};"></a></td></tr>
<tr><td class="em-px" align="center" style="padding:6px 40px 18px;background-color:${A.bg};" bgcolor="${A.bg}">
<p style="margin:0;font-family:${ARENA_BODY};font-size:11px;line-height:18px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:${A.soft};">${strip}</p>
</td></tr>
<tr><td style="height:2px;font-size:0;line-height:0;background-color:${A.gold};background-image:linear-gradient(90deg,${A.bg} 0%,${A.gold} 30%,${A.gold} 70%,${A.bg} 100%);" bgcolor="${A.gold}">&nbsp;</td></tr>
<tr><td class="em-px" style="padding:40px 40px 16px;background-color:${A.panel};" bgcolor="${A.panel}">
${eyebrow}<h1 class="em-h1" style="margin:0 0 22px;font-family:${ARENA_HEAD};font-size:40px;line-height:44px;font-weight:400;letter-spacing:1px;text-transform:uppercase;color:${A.text};">${esc(o.title)}</h1>
${o.bodyHtml}
</td></tr>
${legal}
${o.plusLoin ? plusLoinHtml(o.plusLoin) : ''}
<tr><td align="center" style="padding:26px 24px 24px;background-color:${A.panel};" bgcolor="${A.panel}">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"><tr>
<td width="90" class="em-hide-sm" style="width:90px;border-top:1px solid ${A.gold};font-size:0;line-height:0;">&nbsp;</td>
<td style="padding:0 22px;font-family:${ARENA_BODY};font-size:11px;line-height:16px;letter-spacing:4px;text-transform:uppercase;color:${A.soft};white-space:nowrap;">Ensemble vers votre réussite</td>
<td width="90" class="em-hide-sm" style="width:90px;border-top:1px solid ${A.gold};font-size:0;line-height:0;">&nbsp;</td>
</tr></table>
</td></tr>
<tr><td class="em-px" align="center" style="padding:28px 40px 32px;background-color:${A.page};" bgcolor="${A.page}">
<img src="${emailAsset('evc-arena-helmet.png')}" width="27" height="36" alt="" style="display:block;width:27px;height:36px;border:0;margin:0 auto 10px;">
<p style="margin:0 0 6px;font-family:${ARENA_HEAD};font-size:18px;line-height:22px;letter-spacing:2px;color:${A.text};">EVC <span style="color:${A.red};">ARENA</span> <span style="font-family:${ARENA_BODY};font-size:10px;letter-spacing:3px;color:${A.muted};font-weight:700;">&nbsp;BY MAJOR ECN</span></p>
<p style="margin:0 0 16px;font-family:${ARENA_BODY};font-size:10px;line-height:16px;letter-spacing:3px;text-transform:uppercase;color:${A.gold};">Apprendre · S’évaluer · Progresser</p>
<p style="margin:0 0 18px;font-family:${ARENA_BODY};font-size:13px;line-height:20px;">${footLink(o.accessUrl ?? o.links.space, 'Mon espace')}${sep}${footLink(o.links.rules, 'Règles')}${sep}${footLink(site, 'major-ecn.fr')}</p>
<p style="margin:20px 0 8px;font-family:${ARENA_BODY};font-size:11px;line-height:18px;color:${A.muted};">${esc(o.reason ?? 'Vous recevez cet email parce que vous êtes inscrit(e) au tournoi EVC Arena de Major ECN.')}${o.unsubscribeUrl ? `<br><a href="${esc(o.unsubscribeUrl)}" target="_blank" rel="noopener" style="color:${A.soft};text-decoration:underline;">Ne plus recevoir les informations Major ECN</a>` : ''}</p>
<p style="margin:0;font-family:${ARENA_BODY};font-size:11px;line-height:18px;color:${A.faint};">Major ECN — préparation aux EVC depuis 2011. © ${new Date().getFullYear()} Major ECN — PAE Formation.</p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>`;

  const headExtra = `<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&amp;family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"><!--<![endif]-->`;
  const css = `@media screen and (max-width:620px){ .em-h1{font-size:34px !important;line-height:38px !important;} }`;
  return emailDocument({ title: o.subject, preheader: o.preheader, scheme: 'dark', pageBg: A.page, headExtra, css, body });
}

/** Pied de la version texte, cohérent avec le HTML. */
export function arenaTextFooter(o: { space: string; unsubscribeUrl?: string | null; legalNotice?: string | null }): string {
  return [
    '',
    '—',
    'EVC Arena · by Major ECN — Apprendre · S’évaluer · Progresser',
    `Mon espace : ${o.space}`,
    o.legalNotice ? o.legalNotice : null,
    o.unsubscribeUrl ? `Ne plus recevoir les informations Major ECN : ${o.unsubscribeUrl}` : null,
  ].filter((l) => l !== null).join('\n');
}
