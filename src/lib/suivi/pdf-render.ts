import 'server-only';
import { launchBrowser } from '@/lib/fiches/chromium';

/** HTML → PDF A4 (Chromium headless), même chaîne que les fiches de cours. */
export async function htmlToPdf(html: string): Promise<Uint8Array> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    // Le document est autonome (aucune ressource distante) : `load` suffit et
    // évite l'attente réseau ; c'est aussi ce qu'accepte cette version de puppeteer-core.
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
