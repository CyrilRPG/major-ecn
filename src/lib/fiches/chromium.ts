import 'server-only';

/**
 * Lancement de Chromium headless pour le rendu PDF.
 *
 * On utilise `@sparticuz/chromium-min` plutôt que `@sparticuz/chromium` :
 * cette version ne contient PAS le binaire Chromium (qui pèse ~85 Mo et
 * faisait exploser la limite Vercel Function de 300 Mo). Le binaire est
 * téléchargé au cold-start depuis la release GitHub correspondant à la
 * version installée (149.0.0). Coût : ~3-5 s de latence supplémentaire au
 * premier appel après un cold-start ; ensuite il est en cache /tmp.
 *
 * - En production (Vercel) : binaire téléchargé via `chromium.executablePath(url)`.
 * - En local : on pointe un Chrome/Chromium via PUPPETEER_EXECUTABLE_PATH
 *   (ex. /Applications/Google Chrome.app/Contents/MacOS/Google Chrome).
 */
import chromium from '@sparticuz/chromium-min';
import puppeteer, { type Browser } from 'puppeteer-core';

/** URL du tarball Chromium pour @sparticuz/chromium-min 149.0.0. La version
 *  doit STRICTEMENT correspondre à la version du package npm — sinon le
 *  téléchargement échoue avec une erreur cryptique. À mettre à jour
 *  conjointement quand on bump le package. */
const CHROMIUM_TARBALL_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar';

export async function launchBrowser(): Promise<Browser> {
  const localPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (localPath) {
    return puppeteer.launch({
      executablePath: localPath,
      headless: true,
      args: ['--no-sandbox', '--font-render-hinting=none'],
    });
  }
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(CHROMIUM_TARBALL_URL),
    headless: true,
  });
}
