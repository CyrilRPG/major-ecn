import 'server-only';

/**
 * Lancement de Chromium headless pour le rendu PDF.
 *
 * - En production (Vercel / serverless) : binaire `@sparticuz/chromium`.
 * - En local : on peut pointer un Chrome/Chromium via PUPPETEER_EXECUTABLE_PATH
 *   (ex. /Applications/Google Chrome.app/Contents/MacOS/Google Chrome).
 */
import chromium from '@sparticuz/chromium';
import puppeteer, { type Browser } from 'puppeteer-core';

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
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}
