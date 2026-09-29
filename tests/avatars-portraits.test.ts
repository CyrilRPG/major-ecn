import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import {
  CRITERES,
  NOMBRE_DE_PORTRAITS,
  OPTIONS,
  PORTRAITS,
  avatarAuHasard,
  avatarDepuisChaine,
  avatarDoublon,
  canoniserAvatar,
  decrireAvatar,
  estAvatarPortrait,
  estAvatarSimple,
  portraitAffiche,
  urlPortrait,
} from '../src/lib/avatars/portraits';
import {
  ETAPES,
  candidats,
  choisir,
  choixDepuisAvatar,
  etapeSansChoix,
  optionsEtape,
  type Choix,
} from '../src/lib/avatars/parcours';
import { trouverAvatarLibre } from '../src/lib/avatars/unicite';
import { effectiveSeed, isPlatformAvatar, platformAvatarUrl } from '../src/lib/avatar';

test('catalogue : 320 portraits, chacun avec son image et des traits connus', async () => {
  assert.equal(NOMBRE_DE_PORTRAITS, 320);
  for (const p of PORTRAITS) {
    await access(`public${urlPortrait(p.code)}`);
    for (const c of CRITERES) {
      assert.ok(OPTIONS[c].some((o) => o.valeur === p.traits[c]), `${p.code} : ${c}=${p.traits[c]} sans libellé`);
    }
    // Cohérence interne des relevés.
    if (p.traits.genre === 'F') assert.equal(p.traits.barbe, '0', `${p.code} : soignante barbue`);
    assert.equal(p.traits.cheveux === 'cv', p.traits.coiffure === 'hj', `${p.code} : foulard et cheveux couverts vont ensemble`);
  }
  assert.equal(new Set(PORTRAITS.map((p) => p.code)).size, 320);
});

test('codes : av-NNN, suffixe Arena accepté, anciens codes ramenés à un portrait fixe', () => {
  assert.ok(estAvatarSimple('av-001'));
  assert.ok(estAvatarSimple('av-320'));
  assert.ok(!estAvatarPortrait('av-000'));
  assert.ok(!estAvatarPortrait('av-321'));
  assert.ok(estAvatarPortrait('av-017-k2x9'));
  assert.ok(!estAvatarSimple('av-017-k2x9'));
  assert.equal(portraitAffiche('av-017-k2x9').code, 'av-017');
  for (const ancien of ['c1-1234567', 'medecin-07', 'k3f9x2a1', '', null]) {
    const code = canoniserAvatar(ancien);
    assert.ok(estAvatarSimple(code), `${ancien} → ${code}`);
    assert.equal(canoniserAvatar(ancien), code, 'déterministe');
  }
  assert.equal(avatarDepuisChaine('compte-1'), avatarDepuisChaine('compte-1'));
  for (let i = 0; i < 50; i++) assert.ok(estAvatarSimple(avatarAuHasard()));
  const doublon = avatarDoublon('av-042', () => 0.5);
  assert.match(doublon, /^av-042-[0-9a-z]{4}$/);
  assert.equal(urlPortrait(doublon), '/avatars/portraits/042.webp');
  assert.match(decrireAvatar('av-007'), /^Avatar : soignante, foulard/);
});

test('Major ECN : seul un portrait simple s’enregistre, un profil sans choix garde un visage fixe', () => {
  assert.ok(isPlatformAvatar('av-100'));
  assert.ok(!isPlatformAvatar('av-100-abcd'));
  assert.ok(!isPlatformAvatar('c1-1234567'));
  assert.equal(effectiveSeed('u1', 'av-100'), 'av-100');
  assert.equal(effectiveSeed('u1', null), effectiveSeed('u1', null));
  assert.ok(estAvatarSimple(effectiveSeed('u1', 'medecin-02')));
  assert.equal(platformAvatarUrl('av-100'), '/avatars/portraits/100.webp');
});

/** Parcourt toutes les options de toutes les étapes, en profondeur bornée. */
function explorer(choix: Choix, etape: number, visite: (c: Choix) => void) {
  visite(choix);
  if (etape >= ETAPES.length) return;
  const reference = candidats(choix)[0];
  for (const o of optionsEtape(etape, choix, reference)) {
    explorer({ ...choix, [ETAPES[etape].critere]: o.valeur }, etape + 1, visite);
  }
}

test('parcours : toute option proposée mène à au moins un portrait réel', () => {
  let chemins = 0;
  const atteints = new Set<number>();
  explorer({}, 0, (choix) => {
    const reste = candidats(choix);
    assert.ok(reste.length > 0, `impasse : ${JSON.stringify(choix)}`);
    if (Object.keys(choix).length === ETAPES.length) {
      chemins++;
      reste.forEach((p) => atteints.add(p.numero));
    }
  });
  assert.ok(chemins > 200);
  assert.equal(atteints.size, 320, 'chaque portrait est au bout d’un chemin');
});

test('parcours : chaque portrait retrouve exactement ses traits, et la barbe ne se pose qu’aux soignants', () => {
  for (const p of PORTRAITS) {
    const choix = choixDepuisAvatar(p.code);
    assert.ok(candidats(choix).some((q) => q.numero === p.numero));
  }
  const barbe = ETAPES.findIndex((e) => e.critere === 'barbe');
  assert.ok(etapeSansChoix(barbe, { genre: 'F' }));
  assert.ok(!etapeSansChoix(barbe, { genre: 'H' }));
});

test('parcours : changer une étape garde les choix suivants encore possibles et vise le portrait le plus proche', () => {
  const depart = PORTRAITS.find((p) => p.traits.genre === 'F' && p.traits.coiffure === 'ci' && p.traits.fond === 'or')!;
  const choix = choixDepuisAvatar(depart.code);
  const fond = ETAPES.findIndex((e) => e.critere === 'fond');
  const { choix: apres, avatar } = choisir(choix, fond, 'marine', depart);
  assert.equal(avatar.traits.fond, 'marine');
  assert.equal(apres.genre, 'F');
  assert.ok(candidats(apres).some((p) => p.numero === avatar.numero));

  // Passer au masculin : la barbe, la coiffure… s'adaptent sans impasse.
  const r = choisir(choix, 0, 'H', depart);
  assert.equal(r.avatar.traits.genre, 'H');
  assert.ok(candidats(r.choix).length > 0);
  // Un choix devenu impossible prend la valeur du portrait retenu : rien ne
  // passe en « Indifférent » sans que la personne l'ait demandé.
  for (const e of ETAPES) assert.equal(r.choix[e.critere], r.avatar.traits[e.critere], e.critere);

  // « Indifférent » lève le critère.
  const ouvert = choisir(choix, fond, undefined, depart);
  assert.equal(ouvert.choix.fond, undefined);
  assert.ok(candidats(ouvert.choix).length >= candidats(choix).length);
});

test('parcours : l’aperçu d’une option porte cette option', () => {
  const ref = PORTRAITS[0];
  const choix = choixDepuisAvatar(ref.code);
  ETAPES.forEach((e, i) => {
    for (const o of optionsEtape(i, choix, ref)) assert.equal(o.apercu.traits[e.critere], o.valeur);
  });
});

test('Arena : portrait libre le plus proche, puis doublon codé quand le tournoi dépasse le catalogue', async () => {
  const occupes = new Set<string>(['av-010']);
  const sonde = async (codes: string[]) => new Set(codes.filter((c) => occupes.has(c)));
  assert.equal(await trouverAvatarLibre('av-011', sonde), 'av-011');
  const voisin = await trouverAvatarLibre('av-010', sonde);
  assert.notEqual(voisin, 'av-010');
  assert.ok(estAvatarSimple(voisin));
  assert.equal(portraitAffiche(voisin).traits.genre, portraitAffiche('av-010').traits.genre);

  const plein = async (codes: string[]) => new Set(codes);
  const doublon = await trouverAvatarLibre('av-010', plein, () => 0.1);
  assert.match(doublon, /^av-010-[0-9a-z]{4}$/);
});
