/**
 * Audit d'indexation : sitemap + liens internes du site en production.
 * Ne modifie rien — requêtes GET publiques uniquement.
 */
const BASE = process.argv[2] ?? 'https://www.major-ecn.fr';
const CONCURRENCY = 6;

const seen = new Map(); // url -> {status, location, canonical, robots, title}
const linkSources = new Map(); // url -> Set(pages qui la lient)

function abs(href, from) {
  try {
    const u = new URL(href, from);
    if (u.origin !== new URL(BASE).origin) return null;
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

async function probe(url) {
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'MajorEcnAudit/1.0' } });
    const status = res.status;
    const location = res.headers.get('location');
    let html = '';
    if (status === 200 && (res.headers.get('content-type') || '').includes('text/html')) {
      html = await res.text();
    } else {
      await res.arrayBuffer().catch(() => {});
    }
    const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(html)?.[1] ?? null;
    const robots = /<meta[^>]+name="robots"[^>]+content="([^"]+)"/i.exec(html)?.[1] ?? null;
    const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? null;
    const links = new Set();
    for (const m of html.matchAll(/<a[^>]+href="([^"#][^"]*)"/gi)) {
      const a = abs(m[1], url);
      if (a) links.add(a);
    }
    return { status, location, canonical, robots, title, links: [...links] };
  } catch (e) {
    return { status: 0, error: String(e).slice(0, 120), links: [] };
  }
}

async function runPool(urls, fn) {
  const queue = [...urls];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const u = queue.shift();
      await fn(u);
    }
  });
  await Promise.all(workers);
}

const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`SITEMAP: ${sitemapUrls.length} URL`);

// 1. Toutes les URL du sitemap
await runPool(sitemapUrls, async (u) => {
  const r = await probe(u);
  seen.set(u, r);
  for (const l of r.links) {
    if (!linkSources.has(l)) linkSources.set(l, new Set());
    linkSources.get(l).add(u);
  }
});

// 2. Liens internes découverts et non encore testés
const discovered = [...linkSources.keys()].filter((u) => !seen.has(u));
console.log(`LIENS INTERNES NON LISTES AU SITEMAP: ${discovered.length}`);
await runPool(discovered, async (u) => {
  const r = await probe(u);
  seen.set(u, r);
});

const rows = [...seen.entries()].map(([url, r]) => ({ url, ...r, from: [...(linkSources.get(url) ?? [])] }));

const bad = rows.filter((r) => r.status >= 400 || r.status === 0);
const redirects = rows.filter((r) => r.status >= 300 && r.status < 400);
const canonMismatch = rows.filter(
  (r) => r.status === 200 && r.canonical && r.canonical.replace(/\/$/, '') !== r.url.replace(/\/$/, ''),
);
const noindex = rows.filter((r) => r.robots && /noindex/i.test(r.robots));

console.log(`\n===== 404 / erreurs (${bad.length}) =====`);
for (const r of bad) {
  console.log(`${r.status}  ${r.url}`);
  if (r.from.length) console.log(`      lié depuis : ${r.from.slice(0, 3).join(' , ')}`);
}

console.log(`\n===== redirections (${redirects.length}) =====`);
for (const r of redirects) console.log(`${r.status} -> ${r.location}   ${r.url}`);

console.log(`\n===== canonique différente de l'URL (${canonMismatch.length}) =====`);
for (const r of canonMismatch) console.log(`${r.url}\n      canonical: ${r.canonical}`);

console.log(`\n===== noindex (${noindex.length}) =====`);
for (const r of noindex) console.log(`${r.url}  [${r.robots}]`);

console.log(`\n===== total testé : ${rows.length} =====`);
