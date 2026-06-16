/**
 * CSS de la charte « médicale sobre » prêt à l'emploi (client OU serveur).
 *
 * `styles.css` référence les polices en relatif (`url("fonts/X.ttf")`) : on
 * réécrit ce préfixe vers `fontBaseUrl` (ex. `/fonts/fiches` côté navigateur,
 * `https://site/fonts/fiches` côté Chromium).
 */
import { FICHE_CSS_RAW } from './template/styles-css';

export function ficheCss(fontBaseUrl: string): string {
  const base = fontBaseUrl.replace(/\/+$/, '');
  return FICHE_CSS_RAW.replace(/url\("fonts\//g, `url("${base}/`);
}
