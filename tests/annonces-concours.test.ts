import test from 'node:test';
import assert from 'node:assert/strict';
import {
  completerFiche, datesAVenir, epreuvePassee, etatInscription, ficheDepuisAncienBloc, ficheVide, isoVersSaisieParis,
  joursAvant, messageVisiblePour, normaliserFiche, saisieParisVersIso, specialitesDeLEleve, type MessageAnnonce,
} from '../src/lib/annonces/concours';
import type { PermissionScope } from '../src/types/domain';

const parentDe = new Map<string, string | null>([
  ['col-medecine-generale', null],
  ['col-mg-ophtalmo', 'col-medecine-generale'],
  ['col-geriatrie', null],
  ['col-cardio', null],
]);

test('une élève MG (collège + sous-collèges) n’a qu’UNE spécialité : la MG', () => {
  const scope: PermissionScope = { type: 'college', colleges: ['col-medecine-generale', 'col-mg-ophtalmo'], offer: 'intensif', voie: 'externe' };
  assert.deepEqual(specialitesDeLEleve(scope, parentDe), ['col-medecine-generale']);
});

test('un élève gériatrie ne voit pas la fiche MG de son bonus', () => {
  const scope: PermissionScope = { type: 'college', colleges: ['col-geriatrie', 'col-medecine-generale', 'col-mg-ophtalmo'], offer: 'intensif' };
  assert.deepEqual(specialitesDeLEleve(scope, parentDe), ['col-geriatrie']);
});

test('accès intégral : toutes les spécialités (null)', () => {
  assert.equal(specialitesDeLEleve({ type: 'all', offer: 'approfondi' }, parentDe), null);
});

test('J−113 le 24/09/2026 pour une épreuve le 15/01/2027', () => {
  assert.equal(joursAvant('2027-01-15', new Date('2026-09-24T08:00:00').getTime()), 113);
});

test('inscriptions : à venir, ouvertes, closes', () => {
  const f = { ...ficheVide(), inscription_debut: '2026-06-17T12:00:00.000Z', inscription_fin: '2026-07-16T15:00:00.000Z' };
  assert.equal(etatInscription(f, Date.parse('2026-06-01'))?.etat, 'a_venir');
  assert.equal(etatInscription(f, Date.parse('2026-07-01'))?.etat, 'ouverte');
  assert.equal(etatInscription(f, Date.parse('2026-09-24'))?.etat, 'close');
  assert.equal(etatInscription(ficheVide()), null);
});

test('les dates passées disparaissent, l’épreuve passée masque la fiche', () => {
  const f = normaliserFiche({ date_epreuve: '2026-09-01', dates: [{ label: 'Oral', date: '2026-08-01' }, { label: 'Résultats', date: '2026-10-01' }] });
  const now = Date.parse('2026-09-24T10:00:00');
  assert.deepEqual(datesAVenir(f, now).map((d) => d.label), ['Résultats']);
  assert.equal(epreuvePassee(f, now), false);
  assert.equal(epreuvePassee({ ...f, dates: [] }, now), true);
});

test('les anciens blocs complètent la fiche sans écraser ni dupliquer', () => {
  const base = normaliserFiche({ date_epreuve: '2027-01-15', dates: [{ label: 'Oral', date: '2027-03-01' }] });
  const stat = ficheDepuisAncienBloc({ id: 'x', kind: 'stat', title: 'Postes', target_scope: 'college', target_colleges: ['c'], data: { sub_stats: [{ label: 'Voie externe', value: '35' }, { label: 'Voie interne', value: '89' }] } });
  const cal = ficheDepuisAncienBloc({ id: 'y', kind: 'event_list', title: 'Calendrier', target_scope: 'college', target_colleges: ['c'], data: { events: [{ label: 'Oral', date: '2027-03-01' }, { label: 'Choix', date: '2027-06-01' }] } });
  const cd = ficheDepuisAncienBloc({ id: 'z', kind: 'countdown', title: 'EVC', target_scope: 'college', target_colleges: ['c'], data: { target_date: '2027-02-01' } });
  const f = completerFiche(completerFiche(completerFiche(base, stat), cal), cd);
  assert.equal(f.postes_externe, 35);
  assert.equal(f.postes_interne, 89);
  assert.equal(f.date_epreuve, '2027-01-15');
  assert.deepEqual(f.dates.map((d) => d.label), ['Oral', 'Choix']);
});

test('heure de Paris : aller-retour de la saisie, été comme hiver', () => {
  assert.equal(saisieParisVersIso('2026-06-17T14:00'), '2026-06-17T12:00:00.000Z');
  assert.equal(saisieParisVersIso('2027-01-15T09:00'), '2027-01-15T08:00:00.000Z');
  assert.equal(isoVersSaisieParis('2026-07-16T15:00:00.000Z'), '2026-07-16T17:00');
  assert.equal(saisieParisVersIso('n’importe quoi'), null);
});

const msg = (m: Partial<MessageAnnonce>): MessageAnnonce => ({
  id: 'm', kind: 'info', title: 'T', data: {}, min_offer: null, target_scope: 'all', target_colleges: [], voies: ['interne', 'externe'], ...m,
});

test('messages : spécialité (sous-collège compris), voie, formule, fin d’affichage', () => {
  const mg: PermissionScope = { type: 'college', colleges: ['col-medecine-generale', 'col-mg-ophtalmo'], offer: 'essentiel', voie: 'externe' };
  const cardio: PermissionScope = { type: 'college', colleges: ['col-cardio'], offer: 'essentiel', voie: 'externe' };
  const sp = (s: PermissionScope) => specialitesDeLEleve(s, parentDe);
  const ciblMg = msg({ target_scope: 'college', target_colleges: ['col-medecine-generale'] });
  assert.equal(messageVisiblePour(ciblMg, mg, sp(mg)), true);
  assert.equal(messageVisiblePour(ciblMg, cardio, sp(cardio)), false);
  assert.equal(messageVisiblePour(msg({ target_scope: 'college', target_colleges: ['col-mg-ophtalmo'] }), mg, sp(mg)), true);
  assert.equal(messageVisiblePour(msg({ voies: ['interne'] }), mg, sp(mg)), false);
  assert.equal(messageVisiblePour(msg({ min_offer: 'intensif' }), mg, sp(mg)), false);
  assert.equal(messageVisiblePour(msg({ target_scope: 'full' }), mg, sp(mg)), false);
  assert.equal(messageVisiblePour(msg({ data: { fin_affichage: '2026-09-01' } }), mg, sp(mg), Date.parse('2026-09-24')), false);
  const geria: PermissionScope = { type: 'college', colleges: ['col-geriatrie', 'col-medecine-generale'], offer: 'essentiel' };
  assert.equal(messageVisiblePour(ciblMg, geria, sp(geria)), false);
});
