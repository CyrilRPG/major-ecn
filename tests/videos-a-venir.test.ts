import assert from 'node:assert/strict';
import test from 'node:test';
import {
  aUneVideo,
  erreurColonneLiveAt,
  estSeanceAVenir,
  formaterDateSeance,
  normaliserDateSeance,
  seanceMontrable,
} from '../src/lib/videos/a-venir';
import { filtrerReplays } from '../src/lib/videos/replays';
import type { PermissionScope } from '../src/types/domain';

/**
 * « Séance à venir » : les dossiers à préparer sont en ligne avant la séance
 * en direct, la vidéo s'ajoute après sur la même entrée.
 */

test('séance à venir : ni lien Bunny ni fichier', () => {
  assert.equal(aUneVideo({ bunny_video_id: 'abc', storage_path: null }), true);
  assert.equal(aUneVideo({ bunny_video_id: null, storage_path: 'c/v.mp4' }), true);
  assert.equal(estSeanceAVenir({ bunny_video_id: null, storage_path: null }), true);
  assert.equal(estSeanceAVenir({}), true);
  assert.equal(estSeanceAVenir({ bunny_video_id: 'abc' }), false);
});

test('montrée à l’élève : une vidéo, ou des dossiers à préparer', () => {
  assert.equal(seanceMontrable({ bunny_video_id: 'abc' }, 0), true);
  assert.equal(seanceMontrable({ bunny_video_id: null, storage_path: null }, 2), true);
  // Ligne vide (ni vidéo ni document visible) : toujours cachée, comme avant.
  assert.equal(seanceMontrable({ bunny_video_id: null, storage_path: null }, 0), false);
});

test('date de séance : heure de Paris, année seulement si elle diffère', () => {
  const maintenant = new Date('2026-09-24T08:00:00Z');
  // 16 h UTC = 18 h à Paris (heure d'été).
  assert.equal(formaterDateSeance('2026-09-30T16:00:00Z', maintenant), 'mercredi 30 septembre à 18 h 00');
  assert.equal(formaterDateSeance('2027-01-12T08:30:00Z', maintenant), 'mardi 12 janvier 2027 à 09 h 30');
  assert.equal(formaterDateSeance(null, maintenant), null);
  assert.equal(formaterDateSeance('pas une date', maintenant), null);
});

test('saisie de la date : vide ⇒ null, invalide ⇒ erreur, sinon ISO', () => {
  assert.deepEqual(normaliserDateSeance(''), { liveAt: null });
  assert.deepEqual(normaliserDateSeance(null), { liveAt: null });
  assert.deepEqual(normaliserDateSeance('2026-09-30T16:00:00.000Z'), { liveAt: '2026-09-30T16:00:00.000Z' });
  assert.ok('error' in normaliserDateSeance('demain'));
});

test('migration non appliquée : l’erreur sur live_at est reconnue', () => {
  assert.equal(erreurColonneLiveAt({ message: 'column videos.live_at does not exist' }), true);
  assert.equal(erreurColonneLiveAt({ message: 'permission denied' }), false);
  assert.equal(erreurColonneLiveAt(null), false);
});

test('replays : la séance à venir garde sa date et ses dossiers', () => {
  const scope = { type: 'college', colleges: ['col-mir'], offer: 'intensif', voie: 'interne' } as PermissionScope;
  const r = filtrerReplays([
    {
      id: 'v1', titre: 'Séance 1', type: 'cours', rubrique: null, order_index: 0,
      bunny_video_id: null, storage_path: null, live_at: '2026-09-30T16:00:00Z',
      serie_id: null, unlock_direct: null, voies: ['interne', 'externe'], offers: ['intensif'],
      denied_user_ids: null, allowed_user_ids: null,
      video_supports: [{ id: 'd1', titre: 'Dossier 1', order_index: 0, voies: null, offers: null }],
    },
  ], { userId: 'u', scope, access: undefined, isAdmin: false });
  assert.equal(r.cours.length, 1);
  assert.equal(r.cours[0].live_at, '2026-09-30T16:00:00Z');
  assert.deepEqual(r.cours[0].supports.map((s) => s.id), ['d1']);
  assert.equal(seanceMontrable(r.cours[0], r.cours[0].supports.length), true);
});
