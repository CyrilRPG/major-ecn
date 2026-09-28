import test from 'node:test';
import assert from 'node:assert/strict';
import { alertesSeance, tailleLisible, type SeanceBilan } from '../src/lib/videos/bilan-publication';
import { filtrerColleges } from '../src/components/admin/college-search';

const seance = (p: Partial<SeanceBilan> = {}): SeanceBilan => ({
  titre: 'Cours 1 — Introduction',
  aVenir: false,
  bunnyId: 'abc',
  liveAt: null,
  voies: ['interne', 'externe'],
  offers: ['intensif'],
  deniedUserIds: [],
  allowedUserIds: [],
  supports: [{ nom: 'dossier.pdf', taille: 200_000, mime: 'application/pdf', differentes: false, voies: [], offers: [] }],
  ...p,
});
const ctx = (lot: SeanceBilan[], existantes: { titre: string; bunnyId: string | null }[] = []) =>
  ({ type: 'cours' as const, existantes, lot });
const textes = (s: SeanceBilan, c = ctx([s])) => alertesSeance(s, 0, c).map((a) => a.texte).join(' | ');

test('séance conforme : aucune alerte', () => {
  const s = seance();
  assert.deepEqual(alertesSeance(s, 0, ctx([s])), []);
});

test('formule de la catégorie oubliée, voie unique', () => {
  const s = seance({ offers: ['essentiel'], voies: ['interne'] });
  const t = textes(s);
  assert.match(t, /Formule Intensive non cochée/);
  assert.match(t, /Réservée à la voie interne/);
});

test('doublons : titre et vidéo Bunny déjà dans l’item, ou dans le lot', () => {
  const s = seance();
  assert.match(textes(s, ctx([s], [{ titre: 'cours 1 — introduction', bunnyId: 'abc' }])), /déjà ce titre.*déjà publiée/);
  const lot = [s, seance()];
  assert.match(alertesSeance(lot[0], 0, ctx(lot)).map((a) => a.texte).join(), /deux fois.*deux séances/);
});

test('supports : non-PDF, vide, joint deux fois, audience propre vide', () => {
  const s = seance({
    supports: [
      { nom: 'a.docx', taille: 10, mime: 'application/msword', differentes: false, voies: [], offers: [] },
      { nom: 'b.pdf', taille: 0, mime: 'application/pdf', differentes: true, voies: ['interne'], offers: [] },
      { nom: 'B.pdf', taille: 5, mime: 'application/pdf', differentes: false, voies: [], offers: [] },
    ],
  });
  const t = textes(s);
  assert.match(t, /a\.docx » n’est pas un PDF/);
  assert.match(t, /b\.pdf » est vide/);
  assert.match(t, /B\.pdf » est joint deux fois/);
  assert.match(t, /audience propre sans aucune formule/);
});

test('séance à venir sans document ni date', () => {
  const t = textes(seance({ aVenir: true, bunnyId: null, supports: [] }));
  assert.match(t, /invisible des élèves/);
  assert.match(t, /sans date/);
});

test('support déjà en ligne (taille inconnue) : pas de faux « non PDF »', () => {
  const s = seance({ supports: [{ nom: 'Dossier 1', taille: null, mime: null, differentes: false, voies: [], offers: [] }] });
  assert.deepEqual(alertesSeance(s, 0, ctx([s])), []);
});

test('taille lisible', () => {
  assert.equal(tailleLisible(2_500_000), '2,4 Mo');
  assert.equal(tailleLisible(2048), '2 Ko');
});

test('recherche de collège : sans accents, début de mot d’abord', () => {
  const opts = [
    { id: 'a', nom: 'Chirurgie pédiatrique' },
    { id: 'b', nom: 'Pédiatrie' },
    { id: 'c', nom: 'Cardiologie' },
    { id: 'd', nom: 'Pneumologie', precision: 'Médecine générale' },
  ];
  assert.deepEqual(filtrerColleges(opts, 'pedia').map((o) => o.id), ['b', 'a']);
  assert.deepEqual(filtrerColleges(opts, 'logie').map((o) => o.id), ['c', 'd']);
  assert.deepEqual(filtrerColleges(opts, 'générale').map((o) => o.id), ['d']);
  assert.deepEqual(filtrerColleges(opts, '  '), []);
});
