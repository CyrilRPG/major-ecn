/** Tutoriel vidéo : quelle vidéo pour quel élève (jamais plus que ses accès). */
import assert from 'node:assert/strict';
import test from 'node:test';
import { cleTutoriel, videoTutoriel, type TutorielEntree } from '../src/lib/student/tutoriel-video';

const base: TutorielEntree = { offer: 'intensif', isDecouverte: false, medecineGenerale: false, planning: false, voie: 'interne' };

test('Découverte : une seule vidéo, quelle que soit la voie', () => {
  assert.equal(cleTutoriel({ ...base, isDecouverte: true }), 'decouverte');
  assert.equal(cleTutoriel({ ...base, offer: 'decouverte', voie: 'externe' }), 'decouverte');
});

test('formule × voie × Médecine générale / planning', () => {
  assert.equal(cleTutoriel(base), 'intensif-hors-mg-interne');
  assert.equal(cleTutoriel({ ...base, voie: 'externe' }), 'intensif-hors-mg-externe');
  assert.equal(cleTutoriel({ ...base, offer: 'essentiel', medecineGenerale: true, planning: true }), 'essentiel-mg-interne');
  assert.equal(cleTutoriel({ ...base, offer: 'approfondi', planning: true, voie: 'externe' }), 'approfondi-planning-externe');
  // La Médecine générale l'emporte sur le planning seul (elle l'inclut).
  assert.equal(cleTutoriel({ ...base, medecineGenerale: true, planning: false }), 'intensif-mg-interne');
});

test('voie absente → interne ; offre inconnue → Intensive', () => {
  assert.equal(cleTutoriel({ ...base, voie: null }), 'intensif-hors-mg-interne');
  assert.equal(cleTutoriel({ ...base, offer: null }), 'intensif-hors-mg-interne');
});

test('toutes les clés existent parmi les 19 compositions Remotion', () => {
  const attendues = new Set(['decouverte', ...['essentiel', 'intensif', 'approfondi'].flatMap((o) => ['interne', 'externe'].flatMap((v) => ['mg', 'hors-mg', 'planning'].map((f) => `${o}-${f}-${v}`)))]);
  for (const offer of ['decouverte', 'essentiel', 'intensif', 'approfondi', null]) {
    for (const voie of ['interne', 'externe', null] as const) {
      for (const medecineGenerale of [true, false]) {
        for (const planning of [true, false]) {
          for (const isDecouverte of [true, false]) {
            assert.ok(attendues.has(cleTutoriel({ offer, voie, medecineGenerale, planning, isDecouverte })));
          }
        }
      }
    }
  }
  assert.equal(attendues.size, 19);
});

test('repli : jamais une vidéo qui montre plus que les accès', () => {
  const videos = { 'intensif-hors-mg-interne': 'v-hors', 'intensif-planning-interne': 'v-plan', 'approfondi-mg-interne': 'v-appro' };
  // MG sans sa vidéo → planning (MG moins le Parcours), puis hors MG.
  assert.deepEqual(videoTutoriel({ ...base, medecineGenerale: true, planning: true }, videos), { cle: 'intensif-planning-interne', videoId: 'v-plan' });
  assert.deepEqual(videoTutoriel({ ...base, medecineGenerale: true, planning: true }, { 'intensif-hors-mg-interne': 'v-hors' }), { cle: 'intensif-hors-mg-interne', videoId: 'v-hors' });
  // Hors MG : jamais la vidéo planning ni une autre formule.
  assert.equal(videoTutoriel(base, { 'intensif-planning-interne': 'v-plan', 'approfondi-hors-mg-interne': 'x' }), null);
  // Autre voie : jamais.
  assert.equal(videoTutoriel({ ...base, voie: 'externe' }, videos), null);
  // Découverte : seulement la sienne.
  assert.equal(videoTutoriel({ ...base, isDecouverte: true }, videos), null);
});
