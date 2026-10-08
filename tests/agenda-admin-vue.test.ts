import assert from 'node:assert/strict';
import test from 'node:test';
import { disposer, palettesSpecialites, teinteDeRang } from '../src/lib/agenda/admin-vue';

test('disposer : deux cours au même moment côte à côte, un troisième après reprend toute la largeur', () => {
  const p = disposer([
    { id: 'a', debut: 20 * 60, fin: 23 * 60 },
    { id: 'b', debut: 20 * 60 + 30, fin: 23 * 60 + 30 },
    { id: 'c', debut: 9 * 60, fin: 10 * 60 },
  ]);
  assert.deepEqual(p.get('a'), { voie: 0, voies: 2, simultanes: 2 });
  assert.deepEqual(p.get('b'), { voie: 1, voies: 2, simultanes: 2 });
  assert.deepEqual(p.get('c'), { voie: 0, voies: 1, simultanes: 1 });
});

test('disposer : une voie libérée est réutilisée, et les cours bout à bout ne se chevauchent pas', () => {
  const p = disposer([
    { id: 'long', debut: 600, fin: 900 },
    { id: 'm1', debut: 600, fin: 660 },
    { id: 'm2', debut: 660, fin: 720 },
  ]);
  assert.equal(p.get('m1')!.voie, 1);
  assert.equal(p.get('m2')!.voie, 1);
  assert.equal(p.get('long')!.voies, 2);
  assert.equal(p.get('m2')!.simultanes, 2); // long + m2 ; m1 est terminé
});

test('couleurs : stables par rang, distinctes entre spécialités voisines', () => {
  const m = palettesSpecialites(['col-a', 'col-b', 'col-c']);
  assert.deepEqual(m.get('col-b'), teinteDeRang(1));
  assert.notEqual(m.get('col-a')!.vive, m.get('col-b')!.vive);
});
