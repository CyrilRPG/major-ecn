/**
 * Gabarits des e-mails de relance de l'Offre Découverte (R1, R2, R3, ancien
 * accès, nouveau lien) — fidèles aux maquettes du client (1.jpg R1, 2.jpg R2,
 * 3.jpg R3 ; l'ancien accès suit la structure de R3), retouches comprises :
 *  - fond blanc, beaucoup d'espace, bleu marine + bordeaux ;
 *  - logo OFFICIEL (public/email/major-ecn-logo*.png, jamais reconstruit) ;
 *  - VRAIE capture ordinateur + tablette (public/email/decouverte-plateforme-v2.png,
 *    tirée du hero, sans aucun élément daté) ;
 *  - polices du site (Plus Jakarta Sans pour les titres, Manrope pour le
 *    texte) chargées pour les messageries qui les acceptent, repli Arial ;
 *  - AUCUN slogan en haut à droite, AUCUN réseau social ;
 *  - hiérarchie R1 : titre → bouton → 4 bénéfices → petite ligne « Visite
 *    guidée — durée » → aide → pied de page.
 * Robustesse : tables + styles en ligne, bouton VML pour Outlook, colonnes qui
 * s'empilent sous 620 px, images PNG absolues (alt + dimensions).
 *
 * Module PUR : la galerie de prévisualisation, l'aperçu en direct de
 * l'administration (iframe srcDoc) et l'envoi réel partagent ce rendu.
 */
import { EMAIL_SITE, emailAsset, emailButton, emailDocument, esc, spacer, CONTACT_EMAIL, LEGAL_ENTITY, LEGAL_ADDRESS } from '@/lib/email/layout';
import { BENEFICES, remplir, salutation, type Modele, type Variables } from './modeles';
import type { TypeModele } from './types';

export const COULEURS = {
  marine: '#102C5F',
  marineProfond: '#0B1F45',
  bordeaux: '#A3162F',
  texte: '#27324A',
  doux: '#5E6880',
  filet: '#E3E8F0',
  panneau: '#F4F6FA',
  bandeau: '#F2F4F8',
  blanc: '#FFFFFF',
} as const;

const F_TITRE = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
const F_TEXTE = "Manrope, Arial, Helvetica, sans-serif";

/** Polices du site pour les messageries qui les chargent (Apple Mail, iOS, Thunderbird…) ; ignoré par Outlook Windows. */
const POLICES = `<!--[if !mso]><!--><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&amp;family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap" rel="stylesheet"><!--<![endif]-->`;

const CSS = `
@media screen and (max-width:620px){
  .dc-px{padding-left:22px !important;padding-right:22px !important;}
  .dc-col{display:block !important;width:100% !important;max-width:100% !important;box-sizing:border-box !important;}
  .dc-img{padding:18px 22px 0 22px !important;}
  .dc-img img{width:100% !important;max-width:520px !important;height:auto !important;}
  .dc-h1{font-size:31px !important;line-height:37px !important;}
  .dc-top td{display:block !important;width:100% !important;text-align:center !important;padding:4px 16px !important;}
  .dc-benef{width:100% !important;max-width:100% !important;}
  .dc-help-sep{display:none !important;}
  .dc-sep1{border-left:0 !important;}
}`;

export type LiensEmail = {
  acces: string;
  video: string;
  desinscription: string;
  navigateur: string;
};

export type RenduEmail = { subject: string; preheader: string; html: string; text: string };

/** Liens d'un envoi (jeton aléatoire, aucune donnée personnelle dans l'URL). */
export function liensDuJeton(base: string, jeton: string): LiensEmail {
  const b = base.replace(/\/+$/, '');
  return { acces: `${b}/d/a/${jeton}`, video: `${b}/d/v/${jeton}`, desinscription: `${b}/d/u/${jeton}`, navigateur: `${b}/d/w/${jeton}` };
}

/** Titre : « Major ECN » en bordeaux (comme sur les maquettes). */
function titreHtml(titre: string): string {
  return esc(titre).replace(/Major ECN/g, `<span style="color:${COULEURS.bordeaux};">Major ECN</span>`);
}

function para(texte: string, taille = 16): string {
  return `<p style="margin:0 0 14px;font-family:${F_TEXTE};font-size:${taille}px;line-height:${Math.round(taille * 1.6)}px;color:${COULEURS.texte};">${esc(texte)}</p>`;
}

function barreHaut(preheader: string, lienNavigateur: string): string {
  return `<tr><td style="background-color:${COULEURS.bandeau};" bgcolor="${COULEURS.bandeau}">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="dc-top"><tr>
<td class="dc-px" style="padding:12px 0 12px 32px;font-family:${F_TEXTE};font-size:12px;line-height:18px;color:${COULEURS.doux};">${esc(preheader)}</td>
<td align="right" class="dc-px" style="padding:12px 32px 12px 12px;font-family:${F_TEXTE};font-size:12px;line-height:18px;white-space:nowrap;"><a href="${esc(lienNavigateur)}" target="_blank" rel="noopener" style="color:${COULEURS.marine};text-decoration:underline;">Voir cet email dans votre navigateur</a></td>
</tr></table>
</td></tr>`;
}

function entete(): string {
  return `<tr><td class="dc-px" style="padding:30px 32px 6px;">
<a href="${EMAIL_SITE}" target="_blank" rel="noopener"><img src="${emailAsset('major-ecn-logo.png')}" width="150" height="76" alt="Major ECN" style="display:block;width:150px;height:76px;border:0;"></a>
</td></tr>`;
}

function hero(m: Modele): string {
  const long = m.titre.length;
  const taille = long > 52 ? 30 : long > 40 ? 33 : 36;
  const surtitre = m.surtitre.trim()
    ? `<p style="margin:0 0 12px;font-family:${F_TEXTE};font-size:12px;line-height:16px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;color:${COULEURS.marine};">${esc(m.surtitre)}</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td width="44" height="3" style="width:44px;height:3px;background-color:${COULEURS.bordeaux};font-size:0;line-height:0;" bgcolor="${COULEURS.bordeaux}">&nbsp;</td></tr></table>`
    : '';
  return `<tr><td style="padding:26px 0 0;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td class="dc-col dc-px" width="292" valign="middle" style="width:292px;padding:0 10px 0 32px;">
${surtitre}<h1 class="dc-h1" style="margin:0;font-family:${F_TITRE};font-size:${taille}px;line-height:${Math.round(taille * 1.16)}px;font-weight:800;letter-spacing:-0.6px;color:${COULEURS.marine};">${titreHtml(m.titre)}</h1>
</td>
<td class="dc-col dc-img" width="276" valign="middle" style="width:276px;padding:0 8px 0 0;">
<img src="${emailAsset('decouverte-plateforme-v2.png')}" width="276" height="168" alt="La plateforme Major ECN sur ordinateur et tablette" style="display:block;width:276px;height:168px;border:0;">
</td>
</tr></table>
</td></tr>`;
}

function corps(m: Modele, v: Variables, liens: LiensEmail): string {
  const paragraphes = m.paragraphes.map((x) => para(remplir(x, v))).join('');
  const sousCta = m.sousCta.trim()
    ? `<tr><td style="padding:14px 0 0;font-family:${F_TEXTE};font-size:14px;line-height:22px;color:${COULEURS.doux};">${esc(remplir(m.sousCta, v))}</td></tr>`
    : '';
  // Bouton seul dans sa cellule : la ligne qui suit ne vient jamais s'enrouler autour.
  return `<tr><td class="dc-px" style="padding:26px 32px 4px;">
<p style="margin:0 0 16px;font-family:${F_TITRE};font-size:18px;line-height:26px;font-weight:700;color:${COULEURS.marine};">${esc(salutation(v.prenom))}</p>
${paragraphes}
${spacer(10)}
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
<tr><td align="left">${emailButton({ href: liens.acces, label: remplir(m.cta, v), bg: COULEURS.bordeaux, color: COULEURS.blanc, radius: 6, height: 56, fontFamily: F_TEXTE, fontSize: 16, fontWeight: 700, padX: 30, align: 'left', uppercase: true, letterSpacing: '0.4px', arrow: true })}</td></tr>
${sousCta}
</table>
</td></tr>`;
}

function benefices(): string {
  const cellule = (b: (typeof BENEFICES)[number], separe: boolean | 'mobile-sans') => `<td width="130" valign="top" align="center"${separe === 'mobile-sans' ? ' class="dc-sep1"' : ''} style="width:130px;padding:20px 8px 18px;${separe ? `border-left:1px solid ${COULEURS.filet};` : ''}">
<img src="${emailAsset(b.icone)}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border:0;margin:0 auto 10px;">
<p style="margin:0 0 4px;font-family:${F_TITRE};font-size:14px;line-height:19px;font-weight:700;color:${COULEURS.marine};text-align:center;">${esc(b.titre)}</p>
<p style="margin:0;font-family:${F_TEXTE};font-size:12px;line-height:17px;color:${COULEURS.doux};text-align:center;">${esc(b.texte)}</p>
</td>`;
  // Deux tables de deux bénéfices : 4 colonnes à 600 px, grille 2 × 2 sur mobile.
  const groupe = (a: number) => `<table role="presentation" width="260" border="0" cellpadding="0" cellspacing="0" align="left" class="dc-benef" style="width:260px;"><tr>${cellule(BENEFICES[a], a > 0 ? 'mobile-sans' : false)}${cellule(BENEFICES[a + 1], true)}</tr></table>`;
  return `<tr><td class="dc-px" style="padding:30px 32px 0;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${COULEURS.panneau};border-radius:12px;" bgcolor="${COULEURS.panneau}"><tr><td style="padding:0 8px;">
<!--[if mso]><table role="presentation" width="520" border="0" cellpadding="0" cellspacing="0"><tr><td width="260" valign="top"><![endif]-->
${groupe(0)}
<!--[if mso]></td><td width="260" valign="top"><![endif]-->
${groupe(2)}
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</td></tr>`;
}

function ligneVideo(m: Modele, v: Variables, liens: LiensEmail): string {
  const lien = remplir(m.ligneVideo, v).trim();
  if (!m.video || !lien) return '';
  const intro = remplir(m.ligneVideoIntro, v).trim();
  return `<tr><td class="dc-px" style="padding:22px 32px 0;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td width="44" valign="middle" style="width:44px;padding:0 12px 0 0;"><a href="${esc(liens.video)}" target="_blank" rel="noopener"><img src="${emailAsset('decouverte-ico-video.png')}" width="36" height="36" alt="" style="display:block;width:36px;height:36px;border:0;"></a></td>
<td valign="middle" style="font-family:${F_TEXTE};font-size:14px;line-height:21px;color:${COULEURS.doux};">
${intro ? `${esc(intro)}<br>` : ''}<a href="${esc(liens.video)}" target="_blank" rel="noopener" style="color:${COULEURS.bordeaux};text-decoration:underline;font-weight:600;">${esc(lien)}</a>
</td>
</tr></table>
</td></tr>`;
}

function aide(m: Modele, v: Variables): string {
  const titre = remplir(m.aideTitre, v).trim();
  const texte = remplir(m.aideTexte, v).trim();
  if (!titre && !texte) return '';
  return `<tr><td class="dc-px" style="padding:28px 32px 0;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid ${COULEURS.filet};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:22px 0 0;"><tr>
<td width="64" valign="middle" style="width:64px;"><img src="${emailAsset('decouverte-ico-aide.png')}" width="52" height="52" alt="" style="display:block;width:52px;height:52px;border:0;"></td>
<td width="1" valign="middle" class="dc-help-sep" style="width:1px;padding:0 18px 0 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" height="44"><tr><td width="1" style="width:1px;background-color:${COULEURS.filet};font-size:0;line-height:0;" bgcolor="${COULEURS.filet}">&nbsp;</td></tr></table></td>
<td valign="middle" style="padding:0 0 0 14px;">
${titre ? `<p style="margin:0 0 3px;font-family:${F_TITRE};font-size:15px;line-height:21px;font-weight:700;color:${COULEURS.marine};">${esc(titre)}</p>` : ''}
${texte ? `<p style="margin:0;font-family:${F_TEXTE};font-size:14px;line-height:21px;color:${COULEURS.doux};">${esc(texte)}</p>` : ''}
</td>
</tr></table>
</td></tr>`;
}

function signature(m: Modele): string {
  if (!m.signature.trim()) return '';
  return `<tr><td class="dc-px" style="padding:24px 32px 0;"><p style="margin:0;font-family:${F_TITRE};font-size:16px;line-height:22px;font-weight:700;color:${COULEURS.marine};">${esc(m.signature)}</p></td></tr>`;
}

function pied(liens: LiensEmail): string {
  const lien = (href: string, label: string) => `<a href="${esc(href)}" target="_blank" rel="noopener" style="color:${COULEURS.marine};text-decoration:underline;">${label}</a>`;
  const sep = `<span style="color:#B7BFCD;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`;
  return `<tr><td style="padding:36px 0 0;"></td></tr>
<tr><td align="center" style="padding:26px 32px;background-color:${COULEURS.marine};" bgcolor="${COULEURS.marine}">
<a href="${EMAIL_SITE}" target="_blank" rel="noopener"><img src="${emailAsset('major-ecn-logo-white.png')}" width="140" height="71" alt="Major ECN" style="display:block;width:140px;height:71px;border:0;margin:0 auto;"></a>
</td></tr>
<tr><td align="center" class="dc-px" style="padding:22px 32px 10px;font-family:${F_TEXTE};font-size:13px;line-height:20px;color:${COULEURS.marine};">
${lien(liens.desinscription, 'Se désinscrire')}${sep}${lien(`${EMAIL_SITE}/mentions-legales`, 'Mentions légales')}${sep}${lien(`${EMAIL_SITE}/contact`, 'Contact')}
</td></tr>
<tr><td align="center" class="dc-px" style="padding:0 32px 30px;font-family:${F_TEXTE};font-size:11px;line-height:17px;color:#8A93A6;">
Vous recevez cet email car vous avez demandé un accès découverte à Major ECN.<br>${esc(LEGAL_ENTITY)} · ${esc(LEGAL_ADDRESS)}
</td></tr>`;
}

/** Rendu complet d'un e-mail du module. `test` : objet préfixé « [TEST] ». */
export function rendreEmailDecouverte(type: TypeModele, m: Modele, v: Variables, liens: LiensEmail, opts: { test?: boolean } = {}): RenduEmail {
  const objet = remplir(m.objet, v).trim();
  const subject = opts.test ? `[TEST] ${objet}` : objet;
  const preheader = remplir(m.preheader, v).trim();
  const avecBenefices = m.benefices && (type === 'R1' || type === 'R2');
  const body = `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${COULEURS.blanc};" bgcolor="${COULEURS.blanc}">
<tr><td align="center" style="padding:0;">
<!--[if mso]><table role="presentation" width="600" align="center" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" class="em-container" style="width:100%;max-width:600px;background-color:${COULEURS.blanc};" bgcolor="${COULEURS.blanc}">
${barreHaut(preheader, liens.navigateur)}
${entete()}
${hero(m)}
${corps(m, v, liens)}
${avecBenefices ? benefices() : ''}
${ligneVideo(m, v, liens)}
${aide(m, v)}
${signature(m)}
${pied(liens)}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>`;
  const html = emailDocument({ title: subject, preheader, scheme: 'light', pageBg: COULEURS.blanc, headExtra: POLICES, css: CSS, body });

  const lignes: string[] = [salutation(v.prenom), '', ...m.paragraphes.map((x) => remplir(x, v)).flatMap((x) => [x, '']),
    `${remplir(m.cta, v)} : ${liens.acces}`];
  if (m.sousCta.trim()) lignes.push(remplir(m.sousCta, v));
  if (avecBenefices) lignes.push('', BENEFICES.map((b) => b.titre).join(' • '));
  if (m.video && m.ligneVideo.trim()) {
    lignes.push('', [remplir(m.ligneVideoIntro, v).trim(), `${remplir(m.ligneVideo, v)} : ${liens.video}`].filter(Boolean).join(' '));
  }
  const aideTxt = [remplir(m.aideTitre, v).trim(), remplir(m.aideTexte, v).trim()].filter(Boolean).join(' ');
  if (aideTxt) lignes.push('', aideTxt);
  if (m.signature.trim()) lignes.push('', m.signature);
  lignes.push('', '—', 'Major ECN · www.major-ecn.fr', CONTACT_EMAIL,
    `Voir cet email dans votre navigateur : ${liens.navigateur}`, `Se désinscrire : ${liens.desinscription}`);
  return { subject, preheader, html, text: lignes.join('\n') };
}
