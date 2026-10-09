import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dateValide, estBloquee, heureNormalisee, jourDeLaSemaine, montantFactureEur, verifierSeances,
  type EvenementExistant, type SeanceIa,
} from '../src/lib/agenda/import-ia-regles';

const catalogue = [
  { id: 'col-imagerie-medicale', nom: 'Imagerie médicale' },
  { id: 'col-orthopedie', nom: 'Orthopédie' },
];
const base: SeanceIa = {
  ref: 's1', titre: 'Imagerie tête et cou', date: '2026-11-04', jour_ecrit: 'Mercredi',
  debut: '20:00', fin: '22:00', intervenant: 'Dr Jean Michel', toutes_specialites: false,
  specialites: ['col-imagerie-medicale'], formules: ['intensif', 'approfondi'], voies: ['interne', 'externe'], notes: null,
};
const ctx = { aujourdHui: '2026-10-09', catalogue, existants: [] as EvenementExistant[] };

test('dates : calendrier réel et jour de la semaine sans fuseau', () => {
  assert.equal(dateValide('2026-11-04'), true);
  assert.equal(dateValide('2026-04-31'), false);
  assert.equal(dateValide('4 novembre'), false);
  assert.equal(jourDeLaSemaine('2026-11-04'), 'mercredi');
  assert.equal(jourDeLaSemaine('2026-11-19'), 'jeudi');
  assert.equal(jourDeLaSemaine('2027-01-06'), 'mercredi');
});

test('heures : formats usuels normalisés', () => {
  assert.equal(heureNormalisee('20h'), '20:00');
  assert.equal(heureNormalisee('9 h 15'), '09:15');
  assert.equal(heureNormalisee('20:30'), '20:30');
  assert.equal(heureNormalisee('25h'), null);
  assert.equal(heureNormalisee(null), null);
});

test('séance complète et cohérente : aucune alerte', () => {
  const [s] = verifierSeances([base], ctx);
  assert.deepEqual(s.alertes, []);
  assert.equal(s.scope_type, 'college');
  assert.deepEqual(s.scope_colleges, ['col-imagerie-medicale']);
  assert.deepEqual(s.required_offers, ['intensif', 'approfondi']);
  assert.equal(estBloquee(s), false);
});

test('jour écrit contredit par la date : bloquant', () => {
  const [s] = verifierSeances([{ ...base, date: '2026-11-05' }], ctx);
  assert.equal(estBloquee(s), true);
  assert.match(s.alertes[0].message, /mercredi.*jeudi/i);
});

test('spécialité hors catalogue, formules ou voies manquantes : bloquant', () => {
  const [a] = verifierSeances([{ ...base, specialites: ['col-radiologie'] }], ctx);
  assert.equal(estBloquee(a), true);
  assert.deepEqual(a.scope_colleges, []);
  const [b] = verifierSeances([{ ...base, formules: [] }], ctx);
  assert.equal(estBloquee(b), true);
  const [c] = verifierSeances([{ ...base, voies: [] }], ctx);
  assert.equal(estBloquee(c), true);
});

test('toutes spécialités : aucune spécialité exigée', () => {
  const [s] = verifierSeances([{ ...base, toutes_specialites: true, specialites: [] }], ctx);
  assert.equal(s.scope_type, 'all');
  assert.equal(estBloquee(s), false);
});

test('fin avant début : bloquant ; date passée : simple attention', () => {
  const [a] = verifierSeances([{ ...base, debut: '22:00', fin: '20:00' }], ctx);
  assert.equal(estBloquee(a), true);
  const [b] = verifierSeances([{ ...base, date: '2026-10-07', jour_ecrit: null }], ctx);
  assert.equal(estBloquee(b), false);
  assert.equal(b.alertes[0].niveau, 'attention');
});

test('doublon avec l’agenda existant (même jour, même créneau, même spécialité)', () => {
  const existant: EvenementExistant = {
    id: 'e1', title: 'Imagerie ORL', date: '2026-11-04', start_time: '20:30:00', end_time: '22:30:00', intervenant: null,
    required_offers: ['approfondi'], scope_type: 'college', scope_colleges: ['col-imagerie-medicale'], voies: ['interne'],
  };
  const [s] = verifierSeances([base], { ...ctx, existants: [existant] });
  assert.equal(s.alertes.length, 1);
  assert.match(s.alertes[0].message, /Imagerie ORL/);
  // Autre spécialité au même moment : pas un doublon.
  const [t] = verifierSeances([base], { ...ctx, existants: [{ ...existant, scope_colleges: ['col-orthopedie'] }] });
  assert.deepEqual(t.alertes, []);
});

test('séances triées par date puis heure', () => {
  const out = verifierSeances([
    { ...base, ref: 'b', date: '2026-11-18', jour_ecrit: null },
    { ...base, ref: 'a', date: '2026-11-04' },
  ], ctx);
  assert.deepEqual(out.map((s) => s.ref), ['a', 'b']);
});

test('montant facturé : proportionnel au coût, nul sans coût', () => {
  assert.equal(montantFactureEur(0), 0);
  assert.equal(montantFactureEur(Number.NaN), 0);
  assert.ok(montantFactureEur(0.05) > 0.05);
});
