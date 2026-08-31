/**
 * Vérifie que chaque ancienne adresse connue de la Search Console aboutit à
 * une page réelle : suit la chaîne de redirections et rapporte le statut final.
 *
 *   node scripts/seo/verifier-redirections.mjs https://www.major-ecn.fr
 *
 * Les URL testées viennent des exports « Introuvable (404) » et « Page avec
 * redirection » du 31/08/2026. Toute ligne KO signale une redirection perdue.
 */
const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');

/** Anciennes adresses (chemin seul : le domaine et le protocole sont normalisés en amont). */
const ANCIENNES_URL = [
  '/nous-contacter/',
  '/category/soins-en-france/',
  '/concours-medecins-etrangers/',
  '/impact-evc-acces-soins-integration-professionnels/',
  '/megamenu/blog-mega-menu/',
  '/megamenu/homepage-mega-menu/',
  '/formules-major-ecn-preparation-ecn/preparation-ecos-edn-coaching-intensif/',
  '/formules-major-ecn-preparation-ecn/d2-medecine-dfasm1-preparation-ecn/',
  '/formules-major-ecn-preparation-ecn/d3-medecine-dfasm2-accompagnement-personnalise/',
  '/formules-major-ecn-preparation-ecn/dernier-tour-edn-preparation-intensive/',
  '/formules-major-ecn-preparation-ecn/preparation-evc-pae-medecine/',
  '/formules-major-ecn-preparation-ecn/',
  '/reduction-dimpot/',
  '/reduction-dimpot',
  '/faq-major-ecn-preparation-ecn/',
  '/conseils/',
  '/formule-d4/',
  '/formule-d3/',
  '/d4-special-dernier-tour/',
  '/evc-pae-liste-complete-des-documents-a-fournir-et-les-regles-a-connaitre-pour-une-candidature-reussie/',
  '/enseignants-major-ecn/',
  '/inscription-programme/',
  '/concours-evc-pae/',
  '/evc-pae-comment-se-presenterw/',
  '/structures-daccueil-pour-les-laureats-pae-chu-cliniques-ou-secteur-prive/',
  '/tarifs-major-ecn-preparation-ecn/',
  '/qui-sommes-nous-major-ecn/',
  '/qui-sommes-nous/',
  '/temoignages-major-ecn-preparation-ecn/',
  '/reforme-ecn-edn-ecos-parcours-medical/',
  '/quelle-remuneration-pour-un-medecin-etranger-en-pratiquant-en-france/',
  '/limpact-des-epreuves-de-verification-des-connaissances-sur-lacces-aux-soins-et-lintegration-des-professionnels-de-sante-un-regard-a-travers-le-prisme-de-major-ecn/',
  '/stagiaire-associe-une-passerelle-meconnue-mais-decisive-pour-les-medecins-etrangers-en-france/',
  '/decryptage-des-principaux-defis-des-epreuves-de-verification-des-connaissances-evc/',
  '/evc-pae-documents-candidature/',
  '/nos-conseils/',
  '/comment-se-presenter-aux-epreuves-de-verification-des-connaissances/',
];

/**
 * URL laissées volontairement en 404 : une adresse parasite ou un fichier de
 * l'ancien thème doit répondre « cette page n'existe pas », pas rediriger vers
 * une page sans rapport (Google traite cela comme une erreur douce).
 */
const ATTENDUES_EN_404 = ['/20', '/wp-content/themes/histudy/'];

async function suivre(chemin) {
  let url = BASE + chemin;
  const sauts = [];
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) return { statut: res.status, url, sauts };
      url = loc.startsWith('http') ? loc : BASE + loc;
      sauts.push(url);
      continue;
    }
    return { statut: res.status, url, sauts };
  }
  return { statut: 'boucle', url, sauts };
}

let ko = 0;
console.log('=== Anciennes adresses ===');
for (const chemin of ANCIENNES_URL) {
  const r = await suivre(chemin);
  const ok = r.statut === 200;
  if (!ok) ko++;
  console.log(
    (ok ? 'OK  ' : 'KO  ') +
      chemin.padEnd(70).slice(0, 70) +
      ' -> ' + r.statut + '  ' + r.url.replace(BASE, '') +
      (r.sauts.length > 1 ? '  (' + r.sauts.length + ' sauts)' : ''),
  );
}

console.log('\n=== Laissées en 404 (comportement voulu) ===');
for (const chemin of ATTENDUES_EN_404) {
  const r = await suivre(chemin);
  const ok = r.statut === 404;
  if (!ok) ko++;
  console.log((ok ? 'OK  ' : 'KO  ') + chemin.padEnd(70).slice(0, 70) + ' -> ' + r.statut);
}

console.log('\n' + (ko === 0 ? 'Toutes les adresses aboutissent.' : ko + ' adresse(s) à corriger.'));
process.exit(ko === 0 ? 0 : 1);
