import assert from 'node:assert/strict';
import test from 'node:test';
import { contenusPourEleve, enLigne, type CoursAAlerter, type VideoAAlerter } from '../src/lib/videos/alerte-eleves';
import { getContentAccess, parseScope } from '../src/lib/auth/permissions';
import { nouveauxContenusEmail } from '../src/lib/email/templates';

/**
 * « Alerter les élèves concernés » : l'e-mail ne part qu'aux élèves qui peuvent
 * OUVRIR le contenu, avec la liste de ce qu'ils voient — mêmes règles que la
 * page élève (collège/item, voie, formules, listes nominatives, supports).
 */

const cours: CoursAAlerter = { id: 'c1', titre: 'Item 47', matiere_id: 'col-pediatrie', access_type: 'all', college_access_type: 'all' };
const video = (p: Partial<VideoAAlerter> = {}): VideoAAlerter => ({
  id: 'v1', titre: 'Séance 1', type: 'cours', bunny_video_id: 'guid', live_at: null,
  voies: ['interne', 'externe'], offers: ['intensif'], denied_user_ids: [], allowed_user_ids: [], supports: [], ...p,
});
const eleve = (id: string, raw: unknown) => {
  const scope = parseScope(raw);
  return { id, scope, access: getContentAccess(scope.offer) };
};

test('élève du collège avec la formule cochée : prévenu, supports visibles listés', () => {
  const e = eleve('u1', { type: 'college', colleges: ['col-pediatrie'], offer: 'intensif' });
  const r = contenusPourEleve(e, cours, [video({ supports: [{ titre: 'Diapo.pdf', voies: null, offers: null }] })]);
  assert.deepEqual(r.map((x) => [x.titre, x.supports]), [['Séance 1', ['Diapo.pdf']]]);
});

test('autre collège, formule non cochée ou exclusion nominative : rien', () => {
  assert.equal(contenusPourEleve(eleve('u1', { type: 'college', colleges: ['col-cardio'], offer: 'intensif' }), cours, [video()]).length, 0);
  assert.equal(contenusPourEleve(eleve('u1', { type: 'college', colleges: ['col-pediatrie'], offer: 'essentiel' }), cours, [video()]).length, 0);
  assert.equal(contenusPourEleve(eleve('u1', { type: 'all', offer: 'intensif' }), cours, [video({ denied_user_ids: ['u1'] })]).length, 0);
});

test('item restreint (liste de cours) : seul un élève qui a l’item est prévenu', () => {
  const v = [video()];
  assert.equal(contenusPourEleve(eleve('u1', { type: 'college', colleges: ['col-pediatrie'], cours: ['c2'], offer: 'intensif' }), cours, v).length, 0);
  assert.equal(contenusPourEleve(eleve('u1', { type: 'college', colleges: ['col-pediatrie'], cours: ['c1'], offer: 'intensif' }), cours, v).length, 1);
});

test('autorisation nominative : prévenu même hors collège', () => {
  const e = eleve('u9', { type: 'college', colleges: ['col-cardio'], offer: 'essentiel' });
  assert.equal(contenusPourEleve(e, cours, [video({ allowed_user_ids: ['u9'] })]).length, 1);
});

test('voie unique : l’élève de l’autre voie n’est pas prévenu', () => {
  const v = [video({ voies: ['interne'] })];
  assert.equal(contenusPourEleve(eleve('u1', { type: 'all', offer: 'intensif', voie: 'externe' }), cours, v).length, 0);
  assert.equal(contenusPourEleve(eleve('u1', { type: 'all', offer: 'intensif', voie: 'interne' }), cours, v).length, 1);
});

test('support restreint : absent de la liste de l’élève qui ne le voit pas', () => {
  const e = eleve('u1', { type: 'all', offers: ['intensif', 'approfondi'], offer: 'approfondi' });
  const v = video({ offers: ['intensif', 'approfondi'], supports: [
    { titre: 'Commun.pdf', voies: null, offers: null },
    { titre: 'Essentiel.pdf', voies: null, offers: ['essentiel'] },
  ] });
  assert.deepEqual(contenusPourEleve(e, cours, [v])[0].supports, ['Commun.pdf']);
});

test('séance à venir : annoncée seulement si l’élève voit au moins un dossier', () => {
  const e = eleve('u1', { type: 'all', offer: 'intensif' });
  assert.equal(contenusPourEleve(e, cours, [video({ bunny_video_id: null })]).length, 0);
  const r = contenusPourEleve(e, cours, [video({ bunny_video_id: null, supports: [{ titre: 'Dossiers.pdf', voies: null, offers: null }] })]);
  assert.equal(r[0].aVenir, true);
});

test('en ligne : ni « À valider » ni publication programmée plus tard', () => {
  const now = Date.parse('2026-09-29T10:00:00Z');
  assert.equal(enLigne({ status: 'publie', publish_at: null }, now), true);
  assert.equal(enLigne({ status: 'a_valider', publish_at: null }, now), false);
  assert.equal(enLigne({ status: 'publie', publish_at: '2026-09-30T10:00:00Z' }, now), false);
  assert.equal(enLigne({ status: 'publie', publish_at: '2026-09-28T10:00:00Z' }, now), true);
});

test('e-mail : objet selon le contenu, titres échappés, lien vers l’item', () => {
  const m = nouveauxContenusEmail({
    firstName: 'Lina', college: 'Pédiatrie', item: 'Item 47', url: 'https://www.major-ecn.fr/cours/c1/video',
    contenus: [{ titre: 'Séance <1>', aVenir: false, supports: ['A.pdf'] }],
  });
  assert.equal(m.subject, 'Nouvelle vidéo et support de cours en ligne — Item 47');
  assert.ok(m.html.includes('Séance &lt;1&gt;'));
  assert.ok(m.html.includes('https://www.major-ecn.fr/cours/c1/video'));
  assert.ok(m.text.includes('A.pdf'));
  const s = nouveauxContenusEmail({ college: null, item: 'Item 3', url: 'https://x', contenus: [{ titre: 'S', aVenir: true, supports: ['a', 'b'] }] });
  assert.equal(s.subject, 'Nouveaux supports de cours en ligne — Item 3');
});
