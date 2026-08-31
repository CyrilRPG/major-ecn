/** Audit des métadonnées d'indexation de chaque page publique (serveur local). */
const BASE = process.argv[2] ?? 'http://localhost:3000';
const PATHS = [
  '/', '/methode', '/plateforme', '/tarifs', '/specialites', '/specialites/medecine-generale',
  '/formules/essentielle', '/formules/intensive', '/formules/programme-approfondi',
  '/temoignages', '/blog', '/guide-evc', '/faq', '/espace-decouverte', '/contact',
  '/recrutement', '/inscription', '/profil-evc', '/guide-methodologie-evc-2026',
  '/cgu', '/cgs', '/conditions-particulieres', '/mentions-legales', '/confidentialite',
  // Pages qui ne doivent PAS être indexées
  '/merci', '/annule', '/espace-decouverte/confirmation', '/guide-methodologie-evc-2026/merci',
  '/acces-expire', '/cyrilwisa', '/login',
];

const rows = [];
for (const p of PATHS) {
  const url = BASE + p;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const html = res.status === 200 ? await res.text() : '';
    const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? '';
    const desc = /<meta name="description" content="([^"]*)"/i.exec(html)?.[1] ?? '';
    const canonical = /<link rel="canonical" href="([^"]*)"/i.exec(html)?.[1] ?? '';
    const robots = /<meta name="robots" content="([^"]*)"/i.exec(html)?.[1] ?? '';
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    rows.push({ p, status: res.status, loc: res.headers.get('location') ?? '', title: title.length, desc: desc.length, canonical, robots, words });
  } catch (e) {
    rows.push({ p, status: 0, err: String(e).slice(0, 60) });
  }
}

console.log('CHEMIN'.padEnd(38), 'ST', 'TITRE', 'DESC', 'MOTS', 'ROBOTS', 'CANONICAL');
for (const r of rows) {
  console.log(
    r.p.padEnd(38),
    String(r.status).padEnd(3),
    String(r.title).padEnd(5),
    String(r.desc).padEnd(4),
    String(r.words ?? '').padEnd(5),
    (r.robots || '-').padEnd(22),
    r.canonical || (r.loc ? '-> ' + r.loc : 'AUCUNE'),
  );
}
