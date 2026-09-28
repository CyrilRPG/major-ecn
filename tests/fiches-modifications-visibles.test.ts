import assert from 'node:assert/strict';
import test from 'node:test';
import { marquerModifications, contientMarques, compterMarques } from '../src/lib/fiches/modifications-visibles';

const INS = (s: string) => `<ins class="maj-ajout">${s}</ins>`;
const DEL = (s: string) => `<del class="maj-retrait">${s}</del>`;

test('identique : rien n’est marqué', () => {
  const h = '<p>Urée &gt; 7 mmol/L</p>';
  assert.equal(marquerModifications(h, h), h);
});

test('un chiffre remplacé : ancien raturé, nouveau surligné, au même endroit', () => {
  const avant = '<table><tr><td class="ft-concept">Urée</td><td><p>Seuil 3,3 mmol/L chez le sujet âgé</p></td></tr></table>';
  const apres = '<table><tr><td class="ft-concept">Urée</td><td><p>Seuil 7,14 mmol/L chez le sujet âgé</p></td></tr></table>';
  assert.equal(
    marquerModifications(avant, apres),
    `<table><tr><td class="ft-concept">Urée</td><td><p>Seuil ${DEL('3,3')}${INS('7,14')} mmol/L chez le sujet âgé</p></td></tr></table>`,
  );
});

test('phrase ajoutée et mots consécutifs remplacés d’un seul tenant', () => {
  const r = marquerModifications('<p>Traitement par amoxicilline seule.</p>', '<p>Traitement par amoxicilline et acide clavulanique.</p>');
  assert.equal(r, `<p>Traitement par amoxicilline ${DEL('seule.')}${INS('et acide clavulanique.')}</p>`);
});

test('ligne de tableau supprimée entière : elle reste visible, raturée, avec sa structure', () => {
  const ligne = '<tr><td>Ancien critère</td><td><p>Obsolète</p></td></tr>';
  const avant = `<table><tbody><tr><td>A</td><td>B</td></tr>${ligne}</tbody></table>`;
  const apres = '<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>';
  const r = marquerModifications(avant, apres);
  assert.match(r, /<tr><td><del class="maj-retrait">Ancien critère<\/del><\/td><td><p><del class="maj-retrait">Obsolète<\/del><\/p><\/td><\/tr><\/tbody>/);
});

test('ligne du milieu supprimée entre lignes de même forme : recalée sur la ligne entière', () => {
  const tr = (a: string, b: string) => `<tr><td class="ft-concept">${a}</td><td class="ft-detail"><p>${b}</p></td></tr>`;
  const avant = `<table><tbody>${tr('A', 'un')}${tr('B', 'deux')}${tr('C', 'trois')}</tbody></table>`;
  const apres = `<table><tbody>${tr('A', 'un')}${tr('C', 'trois')}</tbody></table>`;
  assert.equal(
    marquerModifications(avant, apres),
    `<table><tbody>${tr('A', 'un')}${tr(DEL('B'), DEL('deux'))}${tr('C', 'trois')}</tbody></table>`,
  );
});

test('encadré ajouté : structure de la nouvelle version conservée, texte surligné', () => {
  const avant = '<table><tbody><tr><td>A</td></tr></tbody></table>';
  const apres = '<table><tbody><tr><td>A</td></tr><tr class="ft-reflexe"><td colspan="2"><span>Nouveau piège</span></td></tr></tbody></table>';
  const r = marquerModifications(avant, apres);
  assert.equal(r, `<table><tbody><tr><td>A</td></tr><tr class="ft-reflexe"><td colspan="2"><span>${INS('Nouveau piège')}</span></td></tr></tbody></table>`);
});

test('simple mise en gras : aucune marque', () => {
  const r = marquerModifications('<p>Signe de gravité</p>', '<p>Signe de <strong>gravité</strong></p>');
  assert.equal(contientMarques(r), false);
});

test('suppression à cheval sur deux blocs : texte seul raturé, HTML valide', () => {
  const avant = '<p>Un deux</p><p>trois quatre</p>';
  const apres = '<p>Un quatre</p>';
  const r = marquerModifications(avant, apres);
  assert.equal((r.match(/<p>/g) ?? []).length, (r.match(/<\/p>/g) ?? []).length);
  assert.ok(r.includes('deux') && r.includes('trois'));
  assert.ok(!/<\/p><p>/.test(r), r);
});

test('image remplacée : ancienne raturée, nouvelle surlignée', () => {
  const r = marquerModifications('<figure><img src="a.png"/></figure>', '<figure><img src="b.png"/></figure>');
  assert.equal(r, `<figure>${DEL('<img src="a.png"/>')}${INS('<img src="b.png"/>')}</figure>`);
});

test('grande fiche, petite modification : rapide et localisée', () => {
  const corps = Array.from({ length: 4000 }, (_, i) => `<tr><td>Concept ${i}</td><td><p>Détail numéro ${i} avec plusieurs mots de texte.</p></td></tr>`).join('');
  const avant = `<table>${corps}</table>`;
  const apres = avant.replace('Détail numéro 2500 avec', 'Détail numéro 2500 révisé avec');
  const t0 = Date.now();
  const r = marquerModifications(avant, apres);
  assert.ok(Date.now() - t0 < 2000);
  assert.deepEqual(compterMarques(r), { ajouts: 1, retraits: 0 });
});

test('réécriture totale au-delà du plafond : repli « tout remplacé », jamais d’échec', () => {
  const avant = Array.from({ length: 3000 }, (_, i) => `<p>a${i}</p>`).join('');
  const apres = Array.from({ length: 3000 }, (_, i) => `<p>b${i}</p>`).join('');
  const r = marquerModifications(avant, apres, 50);
  assert.ok(contientMarques(r));
  assert.ok(r.includes('b2999') && r.includes('a2999'));
});

test('marques d’une mise à jour précédente conservées', () => {
  const avant = `<p>Dose ${DEL('1 g')}${INS('2 g')} par jour</p>`;
  const apres = `<p>Dose ${DEL('1 g')}${INS('2 g')} par jour pendant 7 jours</p>`;
  const r = marquerModifications(avant, apres);
  assert.deepEqual(compterMarques(r), { ajouts: 2, retraits: 1 });
});
