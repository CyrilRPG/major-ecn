import test from 'node:test';
import assert from 'node:assert/strict';
import { contientImageHtml, libelleCourtQuestion, questionAUneImage } from '../src/lib/qcm/images';

/* Badge « image » de l'index de série (éditeur) et du panneau admin : une
   question a une image si `qcm_questions.images`, un `qcm_items.images`, ou
   une balise <img dans l'énoncé / le corrigé / la vignette de la série. */

const nue = { enonce: 'Quel est le diagnostic ?', correction_generale: null, images: [], items: [{ images: [] }, { images: null }] };

test('aucune image : tableaux vides, HTML sans <img', () => {
  assert.equal(questionAUneImage(nue), false);
  assert.equal(questionAUneImage(nue, null), false);
  assert.equal(questionAUneImage(nue, '<p>Homme de 54 ans, fumeur.</p>'), false);
  assert.equal(questionAUneImage({}), false);
  assert.equal(questionAUneImage({ images: null, items: null, enonce: null }), false);
});

test('qcm_questions.images non vide', () => {
  assert.equal(questionAUneImage({ ...nue, images: ['qcm/abc/ecg.png'] }), true);
});

test('un qcm_items.images non vide suffit', () => {
  assert.equal(questionAUneImage({ ...nue, items: [{ images: [] }, { images: ['qcm/abc/item-b.png'] }] }), true);
});

test('<img dans l’énoncé, le corrigé général ou la vignette de la série', () => {
  assert.equal(questionAUneImage({ ...nue, enonce: 'Voici l’ECG : <img src="/x.png"> Quel rythme ?' }), true);
  assert.equal(questionAUneImage({ ...nue, correction_generale: '<p>Le scanner</p><IMG SRC="/y.png" />' }), true);
  assert.equal(questionAUneImage(nue, '<p>Radio :</p><img src="/z.png">'), true);
});

test('contientImageHtml : « img » dans le texte n’est pas une balise', () => {
  assert.equal(contientImageHtml('image du poumon, imgs'), false);
  assert.equal(contientImageHtml('<image>'), false);
  assert.equal(contientImageHtml('<img>'), true);
  assert.equal(contientImageHtml(null), false);
});

test('libelleCourtQuestion : dernière ligne non vide de l’énoncé, en texte brut', () => {
  assert.equal(
    libelleCourtQuestion('<p>Homme de 54 ans, fumeur, dyspnée.</p><p>Quel est le diagnostic le plus probable ?</p>'),
    'Quel est le diagnostic le plus probable ?',
  );
  assert.equal(libelleCourtQuestion('Vignette ligne 1\nLigne 2<br>\n\nQuelle&nbsp;conduite à tenir ?  \n'), 'Quelle conduite à tenir ?');
  assert.equal(libelleCourtQuestion('Question simple'), 'Question simple');
  assert.equal(libelleCourtQuestion('<p>Texte</p><img src="/x.png">'), 'Texte');
  assert.equal(libelleCourtQuestion(''), '');
  assert.equal(libelleCourtQuestion(null), '');
});

test('libelleCourtQuestion : tronqué avec une ellipse', () => {
  const long = 'Q'.repeat(120);
  const court = libelleCourtQuestion(long, 40);
  assert.equal(court.length, 40);
  assert.ok(court.endsWith('…'));
});
