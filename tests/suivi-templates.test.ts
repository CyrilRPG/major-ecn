import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_TEMPLATES, renderTemplate, templateVariablesUsed } from '../src/lib/suivi/templates';
import { EMAIL_TEMPLATE_KEYS } from '../src/lib/suivi/types';

test('renderTemplate remplace les variables, tolère espaces et casse', () => {
  const out = renderTemplate('Bonjour {{prenom}}, RDV le {{ date }} à {{HEURE}} : {{lien}}', {
    prenom: 'Sara', date: 'lundi 12 janvier 2026', heure: '09:10', lien: 'https://major-ecn.fr/reservation/abc',
  });
  assert.equal(out, 'Bonjour Sara, RDV le lundi 12 janvier 2026 à 09:10 : https://major-ecn.fr/reservation/abc');
});

test('une variable absente est vidée, jamais laissée en clair', () => {
  assert.equal(renderTemplate('Bonjour {{prenom}} ({{specialite}})', { prenom: 'Sara' }), 'Bonjour Sara ()');
  assert.equal(renderTemplate('Aucune variable', {}), 'Aucune variable');
});

test('les sept modèles par défaut existent et utilisent des variables connues', () => {
  const known = new Set(['prenom', 'specialite', 'date', 'heure', 'lien']);
  for (const key of EMAIL_TEMPLATE_KEYS) {
    const t = DEFAULT_TEMPLATES[key];
    assert.ok(t, `modèle ${key}`);
    assert.equal(t.key, key);
    assert.ok(t.subject.length > 0 && t.body.length > 0);
    for (const v of templateVariablesUsed(`${t.subject}\n${t.body}`)) assert.ok(known.has(v), `${key} : variable inconnue ${v}`);
  }
  // Le rappel J-1 (§9) porte date, heure et le lien de déplacement.
  const rappel = DEFAULT_TEMPLATES.reminder_before;
  const used = templateVariablesUsed(`${rappel.subject}\n${rappel.body}`);
  for (const v of ['date', 'heure', 'lien']) assert.ok(used.includes(v), `rappel : ${v}`);
});
