import test from 'node:test';
import assert from 'node:assert/strict';
import { activeArenaSection, arenaSection, arenaSectionHref } from '../src/lib/arena/navigation';

test('chaque menu conserve le tournoi et mène à une destination réelle', () => {
  assert.equal(arenaSectionHref('interne', 'accueil'), '/arena/interne');
  assert.equal(arenaSectionHref('interne', 'accueil', true), '/arena/interne/espace');
  assert.equal(arenaSectionHref('interne', 'regles'), '/arena/interne/regles');
  assert.equal(arenaSectionHref('interne', 'calendrier'), '/arena/interne#manches');
  assert.equal(arenaSectionHref('interne', 'classement'), '/arena/interne/classement');
  for (const section of ['regles', 'calendrier', 'classement'] as const) {
    assert.equal(arenaSectionHref('', section), `/arena?vue=${section}#tournois`);
    assert.equal(activeArenaSection('/arena', '#tournois', section), section);
  }
  assert.equal(arenaSection('../connexion'), 'accueil');
});

test('le calendrier est actif seul et le retour à l’accueil retire son état actif', () => {
  assert.equal(activeArenaSection('/arena/interne', '#manches'), 'calendrier');
  assert.equal(activeArenaSection('/arena/interne', ''), 'accueil');
  assert.equal(activeArenaSection('/arena/interne/espace', '#compte'), 'accueil');
  assert.equal(activeArenaSection('/arena/interne/regles', '#classement'), 'regles');
  assert.equal(activeArenaSection('/arena/interne/classement', ''), 'classement');
  assert.equal(activeArenaSection('/arena/interne/manche/1/corrections', ''), 'accueil');
});

test('les accès et formulaires ne sont pas présentés comme l’accueil', () => {
  for (const path of ['/arena/connexion', '/arena/connecter', '/arena/confirmer', '/arena/desinscription', '/arena/mot-de-passe-oublie', '/arena/interne/inscription', '/arena/interne/confirmez-votre-email']) {
    assert.equal(activeArenaSection(path, ''), null, path);
  }
});
