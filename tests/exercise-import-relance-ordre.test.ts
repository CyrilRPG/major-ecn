import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trierParPage, completerAppariementsParPage, dedoublonnerParTexte } from '../src/lib/ai/exercise-import-verite-rapport';

const q = (enonce: string, pages: number[], items: string[] = ['a', 'b', 'c', 'd', 'e'], numero: string | null = null) => ({
  client_id: enonce + pages.join('-'), numero_source: numero, source_pages: pages, format: 'qcm' as const, enonce,
  images: [], items: items.map((t, i) => ({ lettre: 'ABCDE'[i], enonce: t, is_correct: false, justification: '', images: [] })),
  reponse_attendue: '', correction_generale: '', warnings: [] as string[],
});

test('trierParPage : une question rejouée en fin de liste retrouve sa place, tri stable', () => {
  const liste = [q('1/ A', [1]), q('2/ B', [2]), q('4/ D', [4]), q('3/ C', [3]), q('sans page', [])];
  const tri = trierParPage(liste).map((x) => x.enonce);
  assert.deepEqual(tri, ['1/ A', '2/ B', '3/ C', 'sans page', '4/ D']);
});

test('completerAppariementsParPage : manquante et sans-source de la même page sont appariées', () => {
  const modele = [q('1/ Que faites-vous ?', [1]), q('4/ Quelle en est la physiopathologie ?', [68])];
  const source = [
    { page: 1, pages: [1], enonce: 'Que faites-vous ?', items: [] },
    { page: 68, pages: [68], enonce: 'Quelle en est la physiopathologie ?', items: [] },
  ] as never[];
  const paires = completerAppariementsParPage([{ im: 0, is: 0, score: 1 }], modele, source as never);
  assert.deepEqual(paires.map((p) => [p.im, p.is]), [[0, 0], [1, 1]]);
});

test('completerAppariementsParPage : pas d’appariement sans page commune', () => {
  const modele = [q('4/ Quelle en est la physiopathologie ?', [66])];
  const source = [{ page: 68, pages: [68], enonce: 'Quelle en est la physiopathologie ?', items: [] }] as never[];
  assert.equal(completerAppariementsParPage([], modele, source as never).length, 0);
});

test('dedoublonnerParTexte : un doublon exige une page commune', () => {
  const items = ['Vascularite à IgA', 'Dépôts mésangiaux', 'Purpura vasculaire', 'Thrombopénie', 'Atteinte rénale'];
  const a = q('3/ Quelle en est la physiopathologie ?', [66], items);
  const b = q('4/ Quelle en est la physiopathologie ?', [68], items);
  const bis = q('4/ Quelle en est la physiopathologie ?', [68], items);
  const r = dedoublonnerParTexte([a, b, bis]);
  assert.equal(r.retirees, 1);
  assert.deepEqual(r.questions.map((x) => x.source_pages[0]), [66, 68]);
});
