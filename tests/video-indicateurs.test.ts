import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerIndicateursVideo, paliersFranchis, type LigneEvenementVideo } from '../src/lib/marketing/video-evenements';

const l = (visitor_id: string, event: string, created_at: string, source: string | null = null): LigneEvenementVideo =>
  ({ visitor_id, event, source, created_at });

test('indicateurs : clics par source, taux en visiteurs distincts', () => {
  const r = calculerIndicateursVideo([
    l('aaaaaaaa', 'play_click', '2026-10-01T08:00:00Z', 'hero_image'),
    l('aaaaaaaa', 'play', '2026-10-01T08:00:02Z'),
    l('aaaaaaaa', 'complete', '2026-10-01T08:03:00Z'),
    l('aaaaaaaa', 'play_click', '2026-10-01T09:00:00Z', 'hero_button'),
    l('aaaaaaaa', 'play', '2026-10-01T09:00:02Z'),
    l('aaaaaaaa', 'complete', '2026-10-01T09:03:00Z'), // revoir : un seul visiteur complet
    l('aaaaaaaa', 'signup', '2026-10-01T09:10:00Z'),
    l('bbbbbbbb', 'play_click', '2026-10-02T08:00:00Z', 'page_email'),
    l('bbbbbbbb', 'play', '2026-10-02T08:00:01Z'),
    l('bbbbbbbb', 'progress_25', '2026-10-02T08:01:00Z'),
    l('cccccccc', 'signup', '2026-10-02T10:00:00Z'), // inscrit sans avoir vu la vidéo : ignoré
    l('dddddddd', 'signup', '2026-10-02T10:00:00Z'),
    l('dddddddd', 'play', '2026-10-02T11:00:00Z'), // inscription AVANT la lecture : ignorée
  ]);
  assert.equal(r.clicsPlay, 3);
  assert.deepEqual(r.clicsParSource.filter((s) => s.clics > 0), [
    { source: 'hero_image', clics: 1 }, { source: 'hero_button', clics: 1 }, { source: 'page_email', clics: 1 },
  ]);
  assert.equal(r.lectures, 4);
  assert.equal(r.visiteursPlay, 3);
  assert.equal(r.visiteursComplet, 1);
  assert.equal(r.tauxComplet, 1 / 3);
  assert.equal(r.visiteursInscrits, 1);
  assert.equal(r.tauxInscription, 1 / 3);
  assert.deepEqual(r.parJour.map((j) => j.jour), ['2026-10-01', '2026-10-02']);
  assert.equal(r.parJour[0].complets, 1);
});

test('indicateurs : aucun play → taux null, jamais de division par zéro', () => {
  const r = calculerIndicateursVideo([l('aaaaaaaa', 'play_click', '2026-10-01T22:30:00Z', 'hero_image')]);
  assert.equal(r.tauxComplet, null);
  assert.equal(r.tauxInscription, null);
  assert.equal(r.parJour[0].jour, '2026-10-02'); // 00:30 à Paris
});

test('paliers : chacun une seule fois, même en sautant dans la vidéo', () => {
  assert.deepEqual(paliersFranchis(0.2, new Set()), []);
  assert.deepEqual(paliersFranchis(0.8, new Set()), ['progress_25', 'progress_50', 'progress_75']);
  assert.deepEqual(paliersFranchis(0.6, new Set(['progress_25'])), ['progress_50']);
});
