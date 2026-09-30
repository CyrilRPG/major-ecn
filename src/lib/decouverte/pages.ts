/**
 * Pages publiques légères des liens d'e-mail (/d/a, /d/u, /d/c…) : HTML
 * autonome, sans JavaScript (les passerelles de sécurité des messageries qui
 * « détonent » les liens exécutent le JS — aucune action ne part sans un vrai
 * clic sur un bouton de formulaire), non indexable.
 *
 * Module PUR.
 */

export function echapper(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'));
}

/** « sara.b@gmail.com » → « s•••••@gmail.com » (jamais l'adresse complète sur une page publique). */
export function masquerEmail(email: string): string {
  const [local, domaine] = email.split('@');
  if (!domaine) return '•••';
  return `${local.slice(0, 1)}${'•'.repeat(Math.max(3, Math.min(8, local.length - 1)))}@${domaine}`;
}

export type Bouton =
  | { genre: 'formulaire'; action: string; libelle: string; secondaire?: boolean; champs?: Record<string, string> }
  | { genre: 'lien'; href: string; libelle: string; secondaire?: boolean };

export function pagePublique(o: { titre: string; surtitre?: string; paragraphes: string[]; boutons?: Bouton[]; note?: string; ton?: 'normal' | 'succes' | 'alerte' }): string {
  const boutons = (o.boutons ?? []).map((b) => {
    const cls = b.secondaire ? 'btn sec' : 'btn';
    if (b.genre === 'lien') return `<a class="${cls}" href="${echapper(b.href)}">${echapper(b.libelle)}</a>`;
    const champs = Object.entries(b.champs ?? {}).map(([k, v]) => `<input type="hidden" name="${echapper(k)}" value="${echapper(v)}">`).join('');
    return `<form method="POST" action="${echapper(b.action)}">${champs}<button type="submit" class="${cls}">${echapper(b.libelle)}</button></form>`;
  }).join('');
  const barre = o.ton === 'succes' ? '#2F9E5B' : o.ton === 'alerte' ? '#A3162F' : '#A3162F';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer">
<title>${echapper(o.titre)} — Major ECN</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:Manrope,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#F4F6FA;color:#27324A;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px}
  .carte{background:#fff;border:1px solid #E3E8F0;border-radius:20px;padding:34px 30px 30px;max-width:460px;width:100%;box-shadow:0 24px 60px -34px rgba(16,44,95,.45)}
  .logo{display:block;width:130px;height:auto;margin:0 0 22px}
  .sur{font-size:12px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:#102C5F;margin:0 0 10px}
  .filet{width:40px;height:3px;background:${barre};border-radius:2px;margin:0 0 18px}
  h1{font-family:"Plus Jakarta Sans",Manrope,Arial,sans-serif;font-size:24px;line-height:1.25;margin:0 0 14px;color:#102C5F;font-weight:800}
  p{font-size:15px;line-height:1.6;margin:0 0 14px;color:#3A4560}
  form{margin:0}
  .btn{display:block;width:100%;border:0;border-radius:8px;background:#A3162F;color:#fff;font:700 15px/1.2 Manrope,Arial,sans-serif;letter-spacing:.3px;text-transform:uppercase;padding:16px 18px;cursor:pointer;text-align:center;text-decoration:none;margin:10px 0 0}
  .btn:hover{background:#8C1128}
  .btn.sec{background:#fff;color:#102C5F;border:1.5px solid #CBD3E1;text-transform:none;letter-spacing:0}
  .btn.sec:hover{background:#F4F6FA}
  .note{font-size:12px;color:#7A849A;margin:18px 0 0;line-height:1.5}
</style></head><body>
  <main class="carte">
    <img class="logo" src="/email/major-ecn-logo.png" width="130" height="66" alt="Major ECN">
    ${o.surtitre ? `<p class="sur">${echapper(o.surtitre)}</p><div class="filet"></div>` : ''}
    <h1>${echapper(o.titre)}</h1>
    ${o.paragraphes.map((x) => `<p>${echapper(x)}</p>`).join('')}
    ${boutons}
    ${o.note ? `<p class="note">${echapper(o.note)}</p>` : ''}
  </main>
</body></html>`;
}

export const ENTETES_PAGE: Record<string, string> = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};
