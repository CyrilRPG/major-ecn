import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { AVATARS_PLANCHE } from '../src/components/arena/avatars';
import {
  AVATAR_CODE_PREFIX,
  DERNIER_GROUPE,
  EMBLEMES,
  NOMBRE_DE_COMBINAISONS,
  TRAITS,
  TRAIT_GROUPS,
  TRAIT_ORDER,
  avatarAuHasard,
  avatarDepuisChaine,
  avatarDepuisPortrait,
  canoniserAvatar,
  decoderAvatar,
  decrireAvatar,
  emblemeDe,
  encoderAvatar,
  estAvatarAutorise,
  estAvatarCompose,
  optionsAutorisees,
  portraitDe,
  variantesProches,
} from '../src/lib/avatars/traits';
import { avatarSvg, contenuAvatar } from '../src/lib/avatars/dessin';
import { avatarsDejaPris, avatarEstLibre, trouverAvatarLibre } from '../src/lib/avatars/unicite';

/** Générateur reproductible : les tests ne doivent pas dépendre du hasard. */
function rngFixe(graine = 1): () => number {
  let etat = graine;
  return () => {
    etat = (etat * 1664525 + 1013904223) % 4294967296;
    return etat / 4294967296;
  };
}

test('encodage : aller-retour exact sur tout le catalogue, un caractère par emplacement', () => {
  const code = avatarAuHasard(rngFixe());
  assert.ok(code.startsWith(AVATAR_CODE_PREFIX));
  assert.equal(code.length, AVATAR_CODE_PREFIX.length + TRAIT_ORDER.length);
  assert.deepEqual(decoderAvatar(encoderAvatar(decoderAvatar(code))), decoderAvatar(code));

  // Toutes les options de tous les emplacements survivent à l'aller-retour.
  for (const key of TRAIT_ORDER) {
    for (let i = 0; i < TRAITS[key].options.length; i++) {
      const config = { ...decoderAvatar(code), [key]: i };
      assert.equal(decoderAvatar(encoderAvatar(config))[key], i);
    }
  }
});

test('décodage tolérant : jamais d’exception, toujours dans les bornes', () => {
  for (const entree of [null, undefined, '', 'c1-', 'casque', 'c1-ZZZZZZZ', 'c1-zzzzzzz', 'c1-000', 'c1-00000000000']) {
    const config = decoderAvatar(entree as string);
    for (const key of TRAIT_ORDER) {
      assert.ok(config[key] >= 0 && config[key] < TRAITS[key].options.length, `${entree} → ${key}`);
    }
    // Un code illisible ne doit jamais faire tomber un classement.
    assert.doesNotThrow(() => contenuAvatar(String(entree)));
  }
});

test('reconnaissance : seuls les codes complets et dans les bornes sont composés', () => {
  assert.ok(estAvatarCompose(avatarAuHasard(rngFixe(7))));
  for (const invalide of [null, undefined, 42, {}, 'casque', 'medecin-01', 'c1-', 'c1-012345', 'c1-01234567', 'c1-zzzzzzz']) {
    assert.equal(estAvatarCompose(invalide), false, String(invalide));
  }
  // Le dernier emplacement borné : l'emblème n'a que 8 options, pas 36.
  assert.equal(estAvatarCompose('c1-000000z'), false);
});

test('canonisation : deux écritures d’un même médaillon donnent une seule clé', () => {
  // Indispensable avant tout contrôle d'unicité.
  const code = encoderAvatar({ portrait: 3, fond: 2, cadre: 1 });
  assert.equal(canoniserAvatar(code), code);
  assert.equal(canoniserAvatar('c1-zzzzzzz'), canoniserAvatar(canoniserAvatar('c1-zzzzzzz')));
  assert.equal(canoniserAvatar(null), encoderAvatar({}));
});

test('le catalogue offre assez de médaillons pour des centaines d’inscrits', () => {
  assert.ok(NOMBRE_DE_COMBINAISONS > 1_000_000, String(NOMBRE_DE_COMBINAISONS));
  assert.equal(TRAITS.portrait.options.length, AVATARS_PLANCHE.length);
});

test('les portraits restent les fichiers existants — aucun dessin nouveau', async () => {
  for (let i = 0; i < AVATARS_PLANCHE.length; i++) {
    const id = portraitDe(decoderAvatar(encoderAvatar({ portrait: i })));
    assert.equal(id, AVATARS_PLANCHE[i].id);
    await access(`public/arena/avatars/${id}.png`);
  }
  for (const embleme of EMBLEMES) {
    if (embleme.id) await access(`public/arena/avatars/${embleme.id}.png`);
  }
});

test('le SVG référence le portrait choisi et son emblème, et rien d’autre', () => {
  const code = encoderAvatar({ portrait: 5, embleme: 2, fond: 3, cadre: 4 });
  const svg = avatarSvg(code);
  assert.match(svg, /\/arena\/avatars\/medecin-05\.png/);
  assert.match(svg, /\/arena\/avatars\/lion\.png/);
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  // Sans emblème, aucune seconde image.
  const sansEmbleme = avatarSvg(encoderAvatar({ portrait: 5, embleme: 0 }));
  assert.equal((sansEmbleme.match(/<image /g) ?? []).length, 1);
  // La source des images est injectable : la route d'image les embarque.
  const embarque = avatarSvg(code, { source: () => 'data:image/png;base64,AAAA' });
  assert.doesNotMatch(embarque, /\/arena\/avatars\//);
});

test('un même médaillon produit toujours le même identifiant de dégradé', () => {
  // Deux avatars identiques sur une page ne doivent pas se voler leurs `defs`.
  const code = encoderAvatar({ portrait: 2, fond: 6, couleurCadre: 3 });
  assert.equal(contenuAvatar(code), contenuAvatar(code));
  const autre = encoderAvatar({ portrait: 9, fond: 6, couleurCadre: 3 });
  const id = /id="(md\d+x\d+)-champ"/.exec(contenuAvatar(code))?.[1];
  assert.ok(id);
  // Même couleurs, portrait différent : même identifiant, donc mêmes defs.
  assert.match(contenuAvatar(autre), new RegExp(`id="${id}-champ"`));
});

/* ------------------------------------------------------------ périmètres */

test('cloisonnement : le gladiateur reste à l’Arena, en portrait comme en emblème', () => {
  const casqueEnPortrait = AVATARS_PLANCHE.findIndex((a) => a.id === 'casque');
  const casqueEnEmbleme = EMBLEMES.findIndex((e) => e.id === 'casque');
  assert.ok(casqueEnPortrait >= 0 && casqueEnEmbleme >= 0);

  assert.ok(optionsAutorisees('portrait', 'arena').includes(casqueEnPortrait));
  assert.ok(!optionsAutorisees('portrait', 'plateforme').includes(casqueEnPortrait));
  assert.ok(!optionsAutorisees('embleme', 'plateforme').includes(casqueEnEmbleme));

  const gladiateur = encoderAvatar({ portrait: casqueEnPortrait });
  assert.ok(estAvatarAutorise(gladiateur, 'arena'));
  assert.ok(!estAvatarAutorise(gladiateur, 'plateforme'));
});

test('les indices ne sont JAMAIS renumérotés d’un périmètre à l’autre', () => {
  // Filtrer le catalogue en décalant les indices changerait le sens de tous
  // les codes déjà enregistrés : on masque des options, on ne renumérote pas.
  for (const key of TRAIT_ORDER) {
    for (const i of optionsAutorisees(key, 'plateforme')) {
      assert.ok(optionsAutorisees(key, 'arena').includes(i));
      assert.equal(TRAITS[key].options[i], TRAITS[key].options[i]);
    }
  }
  const code = encoderAvatar({ portrait: 7, embleme: 3 });
  assert.equal(portraitDe(decoderAvatar(code)), AVATARS_PLANCHE[7].id);
  assert.equal(emblemeDe(decoderAvatar(code)), EMBLEMES[3].id);
});

test('tirages et variantes respectent le périmètre demandé', () => {
  const rng = rngFixe(99);
  for (let i = 0; i < 200; i++) {
    assert.ok(estAvatarAutorise(avatarAuHasard(rng, 'plateforme'), 'plateforme'));
    assert.ok(estAvatarAutorise(avatarAuHasard(rng, 'arena'), 'arena'));
  }
  for (let i = 0; i < 50; i++) {
    assert.ok(estAvatarAutorise(avatarDepuisChaine(`compte-${i}`, 'plateforme'), 'plateforme'));
  }
  const base = avatarDepuisChaine('base', 'plateforme');
  for (const variante of variantesProches(base, rngFixe(3), 'plateforme')) {
    assert.ok(estAvatarAutorise(variante, 'plateforme'), variante);
  }
});

test('un portrait de l’ancienne planche devient un médaillon sans ornement', () => {
  // Personne ne doit perdre le visage qu'il avait choisi.
  for (const avatar of AVATARS_PLANCHE) {
    const code = avatarDepuisPortrait(avatar.id);
    assert.ok(estAvatarCompose(code));
    assert.equal(portraitDe(decoderAvatar(code)), avatar.id);
  }
  // Identifiant inconnu : on retombe sur le premier portrait, jamais d'erreur.
  assert.ok(estAvatarCompose(avatarDepuisPortrait('inexistant')));
});

test('un même compte retrouve toujours le même médaillon', () => {
  for (let i = 0; i < 20; i++) {
    assert.equal(avatarDepuisChaine(`u${i}`, 'arena'), avatarDepuisChaine(`u${i}`, 'arena'));
  }
  // Et deux comptes voisins n'obtiennent pas le même : l'empreinte est répartie.
  const tires = new Set(Array.from({ length: 60 }, (_, i) => avatarDepuisChaine(`u${i}`, 'arena')));
  assert.ok(tires.size >= 55, `${tires.size} médaillons distincts sur 60`);
});

/* -------------------------------------------------------------- unicité */

/** Sonde de test : une base en mémoire, comme la vraie mais sans réseau. */
const sonde = (pris: Iterable<string>) => {
  const base = new Set(pris);
  return async (codes: string[]) => new Set(codes.filter((c) => base.has(c)));
};

test('unicité : un médaillon libre est rendu tel quel', async () => {
  const vise = avatarDepuisChaine('libre', 'arena');
  assert.equal(await trouverAvatarLibre(vise, sonde([])), vise);
  assert.equal(await avatarEstLibre(vise, sonde([])), true);
  assert.equal(await avatarEstLibre(vise, sonde([vise])), false);
});

test('unicité : un médaillon pris est remplacé par une variante PROCHE', async () => {
  const vise = avatarDepuisChaine('occupe', 'arena');
  const libre = await trouverAvatarLibre(vise, sonde([vise]), 'arena', rngFixe(5));
  assert.ok(libre && libre !== vise);
  // Le visage est ce à quoi on tient : la variante ne change pas de portrait.
  assert.equal(decoderAvatar(libre).portrait, decoderAvatar(vise).portrait);
});

test('unicité : même trois cents médaillons pris, il en reste', async () => {
  const vise = avatarDepuisChaine('foule', 'arena');
  const pris = [vise, ...variantesProches(vise, rngFixe(11)).slice(0, 300)];
  const libre = await trouverAvatarLibre(vise, sonde(pris), 'arena', rngFixe(2));
  assert.ok(libre);
  assert.ok(!pris.includes(libre));
  assert.ok(estAvatarCompose(libre));
});

test('unicité : la variante proposée reste dans le périmètre', async () => {
  const casque = AVATARS_PLANCHE.findIndex((a) => a.id === 'casque');
  const vise = encoderAvatar({ portrait: casque === 0 ? 1 : 0, fond: 4 });
  const pris = [vise, ...variantesProches(vise, rngFixe(4), 'plateforme').slice(0, 120)];
  const libre = await trouverAvatarLibre(vise, sonde(pris), 'plateforme', rngFixe(6));
  assert.ok(libre && estAvatarAutorise(libre, 'plateforme'));
});

test('disponibilité : on ne répond que sur les codes demandés, et jamais sur plus de 40', async () => {
  // §7 du cahier des charges Arena : aucun effectif ne doit pouvoir se déduire
  // de cette réponse, donc jamais de liste complète des codes occupés.
  const codes = Array.from({ length: 12 }, (_, i) => avatarDepuisChaine(`c${i}`, 'arena'));
  const autres = Array.from({ length: 50 }, (_, i) => avatarDepuisChaine(`x${i}`, 'arena'));
  const pris = await avatarsDejaPris(codes, sonde([...codes.slice(0, 3), ...autres]));
  assert.deepEqual(new Set(pris), new Set(codes.slice(0, 3)));

  let demandes = 0;
  const compteur = async (liste: string[]) => { demandes = liste.length; return new Set<string>(); };
  await avatarsDejaPris(Array.from({ length: 500 }, (_, i) => avatarDepuisChaine(`y${i}`, 'arena')), compteur);
  assert.ok(demandes <= 40, `${demandes} codes interrogés`);
});

test('les codes sont canonisés avant d’être confrontés à la base', async () => {
  // Sinon un code hors bornes et sa forme corrigée passeraient pour deux
  // médaillons différents, et l'unicité tomberait.
  const canonique = canoniserAvatar('c1-zzzzzzz');
  const pris = await avatarsDejaPris(['c1-zzzzzzz'], sonde([canonique]));
  assert.deepEqual(pris, [canonique]);
});

/* ----------------------------------------------------------------- atelier */

test('l’atelier : quatre étapes, l’emblème en dernier', () => {
  assert.equal(TRAIT_GROUPS.length, 4);
  assert.deepEqual(TRAIT_GROUPS.map((g) => g.id), ['portrait', 'fond', 'cadre', 'embleme']);
  // La disponibilité ne peut être annoncée qu'une fois la combinaison complète :
  // c'est pourquoi le grisé n'apparaît qu'à la dernière étape.
  assert.equal(DERNIER_GROUPE, 'embleme');
  const traitsCouverts = TRAIT_GROUPS.flatMap((g) => TRAIT_ORDER.filter((k) => TRAITS[k].group === g.id));
  assert.deepEqual(new Set(traitsCouverts), new Set(TRAIT_ORDER));
});

test('description accessible : le portrait et les ornements sont nommés', () => {
  const code = encoderAvatar({ portrait: 1, cadre: 3, couleurCadre: 0, fond: 2, embleme: 2 });
  const texte = decrireAvatar(code);
  assert.match(texte, /Avatar :/);
  assert.match(texte, /couronne de laurier/i);
  assert.match(texte, /lion/i);
  // L'alternative textuelle part telle quelle dans le SVG : pas de balise.
  assert.doesNotMatch(avatarSvg(code), /aria-label="[^"]*[<>&]/);
});
