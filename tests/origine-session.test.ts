import test from 'node:test';
import assert from 'node:assert/strict';
import { origineSession, sessionEstEtrangere } from '../src/lib/stripe/origine-session';

/**
 * Le compte Stripe est partagé avec Major Odontologie : le webhook ne doit
 * provisionner que les sessions de Major ECN. Cas réel du 13/09/2026 : une
 * inscription Gériatrie (métadonnées ci-dessous) a été prise par le webhook
 * d'odontologie.
 */
const sessionGeriatrie = {
  approfondi_variant: '', college_id: 'col-geriatrie', consent_cgs: '1', consent_cgu: '1',
  consent_cp: '1', first_name: 'RASOANAMBININA ', formule: 'intensive', installments: '1',
  last_name: 'Hasinirina', phone: '+33619173997', source: 'major-ecn-tarifs',
  specialty: 'Gériatrie', voie: 'interne',
};

const sessionOdonto = {
  formule: 'intensive', firstName: 'Léa', lastName: 'Martin', phone: '0600000000',
  situation: 'etudiant', faculte: 'Paris Cité', annee_concours: '2027', installments: '3',
  amount_total_cents: '99500', consent_cgu: '1', consent_cgs: '1', consent_cp: '1',
};

test('reconnaît une session Major ECN signée', () => {
  assert.equal(origineSession({ ...sessionGeriatrie, app: 'major-ecn' }), 'major-ecn');
  assert.equal(sessionEstEtrangere({ ...sessionGeriatrie, app: 'major-ecn' }), false);
});

test('reconnaît une session Major ECN antérieure à la signature (forme des métadonnées)', () => {
  assert.equal(origineSession(sessionGeriatrie), 'major-ecn');
  assert.equal(sessionEstEtrangere(sessionGeriatrie), false);
});

test('écarte une session du tunnel d’odontologie, signée ou non', () => {
  assert.equal(origineSession({ ...sessionOdonto, app: 'major-odonto' }), 'major-odonto');
  assert.equal(sessionEstEtrangere({ ...sessionOdonto, app: 'major-odonto' }), true);
  assert.equal(origineSession(sessionOdonto), 'major-odonto');
  assert.equal(sessionEstEtrangere(sessionOdonto), true);
});

test('une application inconnue explicitement signée n’est pas rejetée (liens privés)', () => {
  assert.equal(origineSession({ app: 'major-pha', formule: 'intensive' }), 'inconnue');
  assert.equal(sessionEstEtrangere({ app: 'major-pha', formule: 'intensive' }), false);
});

test('laisse passer une session sans métadonnées de tunnel (lien de paiement privé)', () => {
  assert.equal(origineSession({ formule: 'intensive', installments: '3' }), 'inconnue');
  assert.equal(sessionEstEtrangere({ formule: 'intensive', installments: '3' }), false);
  assert.equal(sessionEstEtrangere(null), false);
  assert.equal(sessionEstEtrangere(undefined), false);
});
