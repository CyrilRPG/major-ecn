import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {
  blocVideoOuvert,
  supportVisible,
  videoVisible,
} from '../src/lib/videos/audience';

/**
 * Permissions d'une vidéo : la vidéo décide, la formule n'est qu'un repli.
 *
 * Le cas fondateur est celui de Médecine d'urgence (18/09/2026) : des séances
 * approfondies cochées « Programme Approfondi · Formule Intensive » restaient
 * inaccessibles aux élèves Intensifs — la page les renvoyait sur l'item alors
 * que l'onglet et les cartes, eux, les annonçaient. La règle d'ouverture d'un
 * bloc vidéo vit désormais dans `blocVideoOuvert`, et ces tests interdisent
 * qu'une seule des surfaces reparte de son côté.
 */

const INTENSIF = ['intensif'] as const;
const APPROFONDI = ['approfondi'] as const;

test('une vidéo ciblant une formule l’ouvre même sans le droit global', () => {
  const seance = { voies: ['interne', 'externe'], offers: ['approfondi', 'intensif'] };
  // Formule Intensive : `seance_approfondie` est à false dans les permissions
  // de formule — la séance reste visible parce qu'elle la cible.
  assert.equal(
    videoVisible(seance, { offres: INTENSIF, voie: 'interne', droitFormule: false }),
    true,
  );
  // Formule non ciblée : le droit global ne la rattrape pas.
  assert.equal(
    videoVisible(seance, { offres: ['essentiel'], voie: 'interne', droitFormule: false }),
    false,
  );
});

test('la voie cochée restreint vraiment ; les deux voies n’excluent personne', () => {
  const interneSeule = { voies: ['interne'], offers: ['approfondi'] };
  assert.equal(videoVisible(interneSeule, { offres: APPROFONDI, voie: 'interne', droitFormule: true }), true);
  assert.equal(videoVisible(interneSeule, { offres: APPROFONDI, voie: 'externe', droitFormule: true }), false);
  // Voie non renseignée : une restriction de voie s'applique quand même.
  assert.equal(videoVisible(interneSeule, { offres: APPROFONDI, voie: null, droitFormule: true }), false);

  const toutesVoies = { voies: ['interne', 'externe'], offers: ['approfondi'] };
  assert.equal(videoVisible(toutesVoies, { offres: APPROFONDI, voie: null, droitFormule: true }), true);
});

test('listes nominatives : l’exclusion prime, l’autorisation contourne tout', () => {
  const v = { voies: ['interne'], offers: ['approfondi'], denied_user_ids: ['u-1'], allowed_user_ids: ['u-2'] };
  assert.equal(videoVisible(v, { offres: APPROFONDI, voie: 'interne', droitFormule: true, userId: 'u-1' }), false);
  // Ni la bonne voie ni la bonne formule : l'autorisation nominative suffit.
  assert.equal(videoVisible(v, { offres: ['essentiel'], voie: 'externe', droitFormule: false, userId: 'u-2' }), true);
});

test('un support hérite de sa séance et ne peut que la restreindre', () => {
  const seance = { voies: ['interne', 'externe'], offers: ['approfondi', 'intensif'] };
  const sansPermissions = { voies: null, offers: null };
  const reserveApprofondi = { voies: null, offers: ['approfondi'] };
  const opts = { offres: INTENSIF, voie: 'interne' as const, droitFormule: false };
  assert.equal(supportVisible(sansPermissions, seance, opts), true);
  assert.equal(supportVisible(reserveApprofondi, seance, opts), false);
});

test('blocVideoOuvert : une vidéo visible ouvre le bloc, le droit de formule ne le ferme jamais', () => {
  // Cas Médecine d'urgence : élève Intensif, droit global à false, six séances
  // qui le ciblent → le bloc DOIT s'ouvrir.
  assert.equal(blocVideoOuvert([{}, {}, {}, {}, {}, {}], false), true);
  // Aucun contenu ciblé et pas le droit : bloc fermé (cadenas / redirection).
  assert.equal(blocVideoOuvert([], false), false);
  // Le droit de formule ouvre le bloc même quand l'item n'a encore aucune vidéo
  // (« bientôt disponible » plutôt qu'un cadenas).
  assert.equal(blocVideoOuvert([], true), true);
  assert.equal(blocVideoOuvert([{}], true), true);
});

test('aucune surface ne décide seule de fermer un bloc vidéo', () => {
  // Garde-fou structurel : les pages et la mise en page du parcours élève ne
  // doivent JAMAIS comparer `access.video` / `access.seanceApprofondie` pour
  // fermer un bloc sans passer par `blocVideoOuvert` — c'est cette divergence
  // qui rendait le contenu ciblé inatteignable.
  const racine = path.join(process.cwd(), 'src', 'app', '(student)', 'cours', '[cours]');
  const fichiers = [
    'layout.tsx',
    'page.tsx',
    'video/page.tsx',
    'seance-approfondie/page.tsx',
  ];
  // « !access.video » / « !access.seanceApprofondie » en garde d'accès.
  const interdit = /![\s]*access\.(video|seanceApprofondie)\b/;
  for (const f of fichiers) {
    const source = fs.readFileSync(path.join(racine, f), 'utf8');
    const lignes = source.split(/\r?\n/).filter((l) => interdit.test(l) && !l.trim().startsWith('//'));
    assert.deepEqual(
      lignes,
      [],
      `${f} : garde d'accès écrite à la main — passez par blocVideoOuvert()\n${lignes.join('\n')}`,
    );
  }
});
