import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { resolveFontUrls, stripPageAtRules } from '../src/lib/fiches/charte-pure';

const CHARTE = 'src/lib/fiches/charte-styles.css';
const charte = readFileSync(CHARTE, 'utf8');
const sansCommentaires = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

test('charte éditeur : les @page et leurs boîtes de marge disparaissent', () => {
  const editeur = sansCommentaires(stripPageAtRules(charte));
  assert.doesNotMatch(editeur, /@page|@top-left|@bottom-right/);
});

test('charte éditeur : toutes les autres règles restent, dans l’ordre', () => {
  // Fins de ligne CRLF possibles dans une copie de travail Windows.
  const lf = (css: string) => css.replace(/\r\n/g, '\n');
  const editeur = lf(stripPageAtRules(charte));
  // La charte est formatée par Prettier : chaque règle de premier niveau
  // s'ouvre en colonne 0 par une ligne terminée par « { ».
  const ouvertures = lf(charte).split('\n').filter((l) => /^[^\s}/].*\{$/.test(l) && !l.startsWith('@page'));
  assert.ok(ouvertures.length > 150, `${ouvertures.length} règles lues dans la charte`);
  let depuis = 0;
  for (const ligne of ouvertures) {
    const at = editeur.indexOf(`\n${ligne}\n`, depuis);
    assert.notEqual(at, -1, `règle perdue par l'éditeur : ${ligne}`);
    depuis = at + ligne.length;
  }
});

test('@page : boîtes imbriquées, accolade dans une chaîne, @page cité en commentaire', () => {
  assert.equal(
    stripPageAtRules('a{x:1}\n@page{size:A4;@top-left{content:"}"}}\nb{y:2}'),
    'a{x:1}\n\nb{y:2}',
  );
  assert.equal(stripPageAtRules('@page :first{margin:0;@top-right{content:none}}c{z:3}'), 'c{z:3}');
  const cite = '/* la marge @page du haut */\na{x:1}\n.b{content:"@page"}';
  assert.equal(stripPageAtRules(cite), cite);
});

test('polices : chaque url("fonts/…") pointe vers la base servie', () => {
  for (const base of ['/fonts/fiches', '/fonts/fiches/']) {
    const css = resolveFontUrls(charte, base);
    assert.doesNotMatch(css, /url\("fonts\//);
    assert.match(css, /url\("\/fonts\/fiches\/Inter-Regular\.ttf"\)/);
  }
});

test('aucune copie de la charte sous src/ : charte-styles.css est la seule source', () => {
  const copies: string[] = [];
  const parcourir = (dossier: string) => {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = join(dossier, e.name);
      if (e.isDirectory()) parcourir(chemin);
      else if (/\.(css|ts|tsx)$/.test(e.name) && chemin.replace(/\\/g, '/') !== CHARTE
        && /Charte « médicale sobre »\r?\n\s*Feuille de style des fiches/.test(readFileSync(chemin, 'utf8'))) {
        copies.push(chemin);
      }
    }
  };
  parcourir('src');
  assert.deepEqual(copies, [], 'Lire la charte par charteCss / charteCssForEditor (src/lib/fiches/charte.ts).');
});
