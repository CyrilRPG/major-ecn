import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PAGES_FORMULAIRE_AUTH,
  estParametreSensible,
  estSoumissionNative,
  purgerParametresSensibles,
} from '../src/lib/auth/formulaires-auth';

test('les champs d’identification sont sensibles', () => {
  for (const nom of [
    'email', 'Email', 'e-mail', 'password', 'Password', 'passwd', 'newPassword', 'new-password',
    'current-password', 'password_confirmation', 'pwd', 'mdp', 'mot_de_passe', 'motdepasse',
    'confirm', 'confirmation',
  ]) {
    assert.equal(estParametreSensible(nom), true, nom);
  }
});

test('les paramètres légitimes des pages d’authentification passent', () => {
  for (const nom of [
    // /login (middleware, require-role), /auth/setup-password (liens d'activation)
    'next', 'reason', 'disabled', 'expired', 'error', 'error_code', 'error_description',
    'code', 'token_hash', 'type',
    // Next, vitrine, Vercel
    '_rsc', 'embed', 'utm_source', 'gclid', 'x-vercel-protection-bypass', 'x-vercel-set-bypass-cookie',
    'passerelle', 'emailing',
  ]) {
    assert.equal(estParametreSensible(nom), false, nom);
  }
});

test('purge : la soumission GET de /login perd e-mail et mot de passe, garde next', () => {
  const url = new URL('https://www.major-ecn.fr/login?next=%2Fcours%2Fx&email=qa%40example.test&password=secret');
  assert.equal(purgerParametresSensibles(url), true);
  assert.equal(url.href, 'https://www.major-ecn.fr/login?next=%2Fcours%2Fx');
});

test('purge : paramètre répété, casse quelconque', () => {
  const url = new URL('https://www.major-ecn.fr/login?password=a&PASSWORD=b&password=c&reason=autre-appareil');
  assert.equal(purgerParametresSensibles(url), true);
  assert.equal(url.search, '?reason=autre-appareil');
});

test('purge : URL saine inchangée', () => {
  const href = 'https://www.major-ecn.fr/auth/setup-password?error=otp_expired&error_code=403';
  const url = new URL(href);
  assert.equal(purgerParametresSensibles(url), false);
  assert.equal(url.href, href);
});

test('soumission native : POST de formulaire, pas les actions serveur', () => {
  const h = (entetes: Record<string, string>) => new Headers(entetes);
  assert.equal(estSoumissionNative('POST', h({ 'content-type': 'application/x-www-form-urlencoded' })), true);
  assert.equal(estSoumissionNative('POST', h({})), true);
  // Action serveur appelée par React (JS actif)
  assert.equal(estSoumissionNative('POST', h({ 'next-action': 'abc123', 'content-type': 'text/plain;charset=UTF-8' })), false);
  // Action serveur sans JavaScript (amélioration progressive)
  assert.equal(estSoumissionNative('POST', h({ 'content-type': 'multipart/form-data; boundary=----x' })), false);
  assert.equal(estSoumissionNative('GET', h({})), false);
  assert.equal(estSoumissionNative('HEAD', h({})), false);
});

test('pages couvertes', () => {
  assert.deepEqual([...PAGES_FORMULAIRE_AUTH].sort(), ['/auth/setup-password', '/forgot-password', '/login']);
});
