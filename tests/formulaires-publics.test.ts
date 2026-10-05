import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { estParametreSensible } from '../src/lib/auth/formulaires-auth';
import {
  estChampContact,
  parametresSensiblesDe,
  redirectionSansSaisie,
} from '../src/lib/formulaires-publics';

const SITE = 'https://www.major-ecn.fr';
const URLENCODED = { 'content-type': 'application/x-www-form-urlencoded' };

function cible(chemin: string, init: { method?: string; headers?: Record<string, string> } = {}) {
  return redirectionSansSaisie(new NextRequest(SITE + chemin, init))?.href ?? null;
}

test('contact : tous les champs nommés du formulaire sont purgés', () => {
  for (const nom of [
    'company', 'first_name', 'last_name', 'email', 'Email', 'phone', 'objet', 'specialite', 'message',
    'cf-turnstile-response',
  ]) {
    assert.equal(estChampContact(nom), true, nom);
  }
});

test('contact : les paramètres légitimes passent', () => {
  for (const nom of [
    'motif', 'utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid', '_rsc', 'embed',
    'x-vercel-protection-bypass',
  ]) {
    assert.equal(estChampContact(nom), false, nom);
  }
});

test('une liste par page : e-mail purgé seulement là où un formulaire le saisit', () => {
  assert.equal(parametresSensiblesDe('/contact'), estChampContact);
  assert.equal(parametresSensiblesDe('/login'), estParametreSensible);
  assert.equal(parametresSensiblesDe('/forgot-password'), estParametreSensible);
  assert.equal(parametresSensiblesDe('/auth/setup-password'), estParametreSensible);
  for (const page of ['/', '/tarifs', '/admin/crm', '/admin/emails', '/contact/merci']) {
    assert.equal(parametresSensiblesDe(page), null, page);
  }
  assert.equal(cible('/admin/crm?email=jean%40example.test'), null);
});

test('contact : POST natif → même page en GET', () => {
  assert.equal(cible('/contact', { method: 'POST', headers: URLENCODED }), `${SITE}/contact`);
  assert.equal(
    cible('/contact?motif=etablissement', { method: 'POST', headers: URLENCODED }),
    `${SITE}/contact?motif=etablissement`,
  );
  assert.equal(cible('/contact', { method: 'POST' }), `${SITE}/contact`);
});

test('contact : URL déjà polluée → champs retirés, motif et utm gardés', () => {
  const polluee = '/contact?motif=etablissement&company=&first_name=Jean&last_name=Dupont'
    + '&email=jean%40example.test&phone=%2B33+6+12+34+56+78&objet=Autre&specialite=P%C3%A9diatrie'
    + '&message=Bonjour%2C+je+souhaite&utm_source=google&gclid=abc';
  assert.equal(cible(polluee), `${SITE}/contact?motif=etablissement&utm_source=google&gclid=abc`);
  assert.equal(cible('/contact?email=jean%40example.test'), `${SITE}/contact`);
});

test('contact : URL saine et actions serveur passent', () => {
  assert.equal(cible('/contact'), null);
  assert.equal(cible('/contact?motif=etablissement&utm_source=google'), null);
  assert.equal(cible('/contact?_rsc=1x2y3'), null);
  assert.equal(cible('/contact', { method: 'HEAD' }), null);
  assert.equal(
    cible('/contact', { method: 'POST', headers: { 'next-action': 'abc123', 'content-type': 'text/plain;charset=UTF-8' } }),
    null,
  );
  assert.equal(cible('/contact', { method: 'POST', headers: { 'content-type': 'multipart/form-data; boundary=----x' } }), null);
});

test('pages d’authentification : même garde qu’avant', () => {
  assert.equal(cible('/login?next=%2Fcours%2Fx&email=qa%40example.test&password=secret'), `${SITE}/login?next=%2Fcours%2Fx`);
  assert.equal(cible('/login', { method: 'POST', headers: URLENCODED }), `${SITE}/login`);
  // `message` n'est pas un champ d'identification : il ne concerne que /contact.
  assert.equal(cible('/login?message=x'), null);
});

test('pages sans formulaire public : rien ne change', () => {
  assert.equal(cible('/tarifs', { method: 'POST', headers: URLENCODED }), null);
  assert.equal(cible('/tarifs?email=jean%40example.test'), null);
});
