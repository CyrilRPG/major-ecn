import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ancrerDansTexte,
  ancrerParContexte,
  construireTextePage,
  creerSurlignage,
  decalageDepuisSpan,
  empreinteTexte,
  fusionnerRects,
  localiser,
  lireFichier,
  morceauxDeSpans,
  nomVersionSurlignages,
  normaliser,
  reancrer,
  rognerBornes,
  surlignageSousPoint,
  trierVersionsSurlignages,
  validerListe,
  MAX_SURLIGNAGES,
  type Surlignage,
  type TextePage,
} from '../src/lib/fiches/surlignages-pure';

// Éléments `getTextContent()` d'une page de fiche : deux lignes de texte, puis
// le filigrane incliné au nom de l'élève (ajouté par /api/fiches/[cours]/pdf).
const droit = [10, 0, 0, 10, 50, 700];
const incline = [8.8, 4.7, -4.7, 8.8, 100, 300];
const itemsPage = [
  { str: 'L’hypertension artérielle ', hasEOL: false, transform: droit },
  { str: 'est définie par une PAS ≥ 140 mmHg', hasEOL: true, transform: droit },
  { str: '', hasEOL: false, transform: droit },
  { str: 'ou une PAD ≥ 90 mmHg.', hasEOL: true, transform: droit },
  { type: 'beginMarkedContent' },
  { str: 'Camille   Martin', hasEOL: false, transform: incline },
  { type: 'endMarkedContent' },
];

function page(texte: string): TextePage {
  return { texte, segments: [], empreinte: empreinteTexte(texte) };
}

function surlignage(p: Partial<Surlignage> & Pick<Surlignage, 'citation'>): Surlignage {
  return {
    id: 's1', couleur: 'jaune', page: 1, debut: 0, avant: '', apres: '',
    rects: [{ x: 0.1, y: 0.1, w: 0.2, h: 0.02 }], empreinte: '', creeLe: '2026-09-28T10:00:00.000Z',
    ...p,
  };
}

test('le texte de page suit les spans pdf.js et écarte le filigrane incliné', () => {
  const tp = construireTextePage(itemsPage);
  assert.equal(tp.texte, 'L’hypertension artérielle est définie par une PAS ≥ 140 mmHg\nou une PAD ≥ 90 mmHg.\n');
  // Un span par élément NON VIDE, dans l'ordre : 0, 1, 2 (le vide n'en crée pas), 3 = filigrane.
  assert.deepEqual(tp.segments.map((s) => s.span), [0, 1, 2, 3]);
  assert.equal(tp.segments[3].ignore, true);
  assert.equal(tp.segments[3].debut, tp.segments[3].fin);
  assert.ok(!tp.texte.includes('Camille'));
});

test('empreinte : identique quel que soit le découpage des lignes, différente si le texte change', () => {
  assert.equal(empreinteTexte('a b\nc'), empreinteTexte('a  b c '));
  assert.notEqual(empreinteTexte('PAS ≥ 140'), empreinteTexte('PAS ≥ 130'));
});

test('normaliser : espaces fusionnés, carte vers le texte brut', () => {
  const { norm, carte } = normaliser('  ab \n\n cd ');
  assert.equal(norm, 'ab cd');
  assert.deepEqual(carte, [2, 3, 4, 8, 9]);
});

test('décalages ⇄ spans : aller-retour exact', () => {
  const tp = construireTextePage(itemsPage);
  const debut = tp.texte.indexOf('artérielle');
  const fin = tp.texte.indexOf('PAS') + 3;
  const morceaux = morceauxDeSpans(tp.segments, debut, fin);
  assert.deepEqual(morceaux.map((m) => m.span), [0, 1]);
  assert.equal(itemsPage[0].str!.slice(morceaux[0].de, morceaux[0].a), 'artérielle ');
  assert.equal(itemsPage[1].str!.slice(morceaux[1].de, morceaux[1].a), 'est définie par une PAS');
  assert.equal(decalageDepuisSpan(tp.segments, 0, morceaux[0].de), debut);
  assert.equal(decalageDepuisSpan(tp.segments, 1, morceaux[1].a), fin);
  // Le filigrane n'est jamais couvert.
  assert.deepEqual(morceauxDeSpans(tp.segments, 0, tp.texte.length).map((m) => m.span), [0, 1, 2]);
});

test('création : bornes rognées, contexte et empreinte mémorisés', () => {
  const tp = construireTextePage(itemsPage);
  const d = tp.texte.indexOf('est définie') - 1; // espace de tête sélectionnée
  const f = tp.texte.indexOf('mmHg') + 4 + 1; // retour à la ligne de fin
  const s = creerSurlignage({
    id: 'abc', couleur: 'vert', page: 3, textePage: tp, debut: d, fin: f,
    rects: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.02 }, { x: 0.4, y: 0.2, w: 0.2, h: 0.02 }],
    maintenant: '2026-09-28T10:00:00.000Z',
  })!;
  assert.equal(s.citation, 'est définie par une PAS ≥ 140 mmHg');
  assert.equal(s.avant, 'L’hypertension artérielle ');
  assert.ok(s.apres.startsWith('\nou une PAD'));
  assert.equal(s.empreinte, tp.empreinte);
  assert.equal(s.rects.length, 1, 'deux morceaux d’une même ligne fusionnés');
  assert.equal(rognerBornes('   ', 0, 3), null);
});

test('ancrage : la citation à sa place exacte est « intacte » et garde ses rectangles', () => {
  const tp = construireTextePage(itemsPage);
  const s = surlignage({ citation: 'PAD ≥ 90', debut: tp.texte.indexOf('PAD ≥ 90'), empreinte: tp.empreinte });
  const r = reancrer([s], [tp]);
  assert.equal(r.etats.s1, 'intact');
  assert.equal(r.modifies, false);
  assert.deepEqual(r.surlignages[0], s);
});

test('ancrage : texte modifié AVANT le passage → même page, rectangles à recalculer', () => {
  const avant = 'Intro. La PAS cible est < 130 mmHg chez le diabétique.';
  const apres = 'Introduction complétée par l’enseignant. La PAS cible est < 130 mmHg chez le diabétique.';
  const d = avant.indexOf('La PAS cible');
  const s = surlignage({ citation: 'La PAS cible est < 130 mmHg', debut: d, avant: 'Intro. ', apres: ' chez le diabétique.', empreinte: empreinteTexte(avant) });
  const r = reancrer([s], [page(apres)]);
  assert.equal(r.etats.s1, 'a-redessiner');
  assert.equal(r.modifies, true);
  assert.equal(r.surlignages[0].debut, apres.indexOf('La PAS cible'));
  assert.equal(r.surlignages[0].citation, 'La PAS cible est < 130 mmHg');
});

test('ancrage : retour à la ligne déplacé par la réédition → retrouvé quand même', () => {
  const s = surlignage({ citation: 'insuffisance cardiaque\nà fraction d’éjection', debut: 0 });
  const texte = 'L’insuffisance cardiaque à fraction\nd’éjection préservée.';
  const a = ancrerDansTexte(s, texte)!;
  assert.equal(texte.slice(a.debut, a.fin), 'insuffisance cardiaque à fraction\nd’éjection');
});

test('ancrage : plusieurs occurrences départagées par le contexte, puis par la proximité', () => {
  const texte = 'Traitement : IEC. Surveillance : kaliémie. Traitement : IEC en première intention.';
  const s = { citation: 'IEC', avant: 'Traitement : ', apres: ' en première', debut: 0 };
  const a = ancrerDansTexte(s, texte)!;
  assert.equal(a.debut, texte.lastIndexOf('IEC'));
  const proche = ancrerDansTexte({ citation: 'IEC', avant: '', apres: '', debut: 70 }, texte)!;
  assert.equal(proche.debut, texte.lastIndexOf('IEC'));
});

test('localisation : passage parti sur la page suivante après réédition', () => {
  const s = surlignage({
    page: 1, citation: 'le traitement repose sur les bêtabloquants', debut: 50,
    avant: 'En post-infarctus, ', apres: ' et les IEC.',
  });
  const pages = [
    page('Page 1 réécrite : nouveau paragraphe d’introduction très long.'),
    page('En post-infarctus, le traitement repose sur les bêtabloquants et les IEC.'),
  ];
  const r = reancrer([s], pages);
  assert.equal(r.etats.s1, 'a-redessiner');
  assert.equal(r.surlignages[0].page, 2);
  assert.equal(r.surlignages[0].debut, pages[1].texte.indexOf('le traitement'));
});

test('localisation : une citation courte ne saute pas sur une autre page sans son contexte', () => {
  const s = surlignage({ page: 1, citation: 'HTA', avant: 'Facteurs : ', apres: ', diabète' });
  const pages = [page('Page sans le mot.'), page('Complications de l’HTA maligne.')];
  assert.equal(localiser(s, pages.map((p) => p.texte)), null);
  const r = reancrer([s], pages);
  assert.equal(r.etats.s1, 'orphelin');
  assert.deepEqual(r.surlignages[0], s, 'un orphelin est conservé tel quel');
});

test('document raccourci : la page mémorisée n’existe plus, le passage est retrouvé plus haut', () => {
  const s = surlignage({ page: 9, citation: 'la troponine est le marqueur de référence', debut: 0 });
  const pages = [page('Intro.'), page('Biologie : la troponine est le marqueur de référence.')];
  const loc = localiser(s, pages.map((p) => p.texte));
  assert.equal(loc?.page, 2);
});

test('passage retouché (coquille corrigée) : retrouvé par son contexte s’il est unique', () => {
  const s = {
    citation: 'la dose maximale est de 4 g par jour',
    avant: 'Chez l’adulte sans insuffisance hépatique, ',
    apres: ', à répartir en quatre prises espacées.',
    debut: 0,
  };
  const texte = 'Chez l’adulte sans insuffisance hépatique, la dose maximale est de 3 g par jour, à répartir en quatre prises espacées.';
  const a = ancrerParContexte(s, texte)!;
  assert.equal(texte.slice(a.debut, a.fin), 'la dose maximale est de 3 g par jour');
  // Contexte ambigu (deux encadrements identiques) : pas d'ancrage.
  assert.equal(ancrerParContexte(s, `${texte} ${texte}`), null);
  // Passage profondément réécrit (longueur très différente) : orphelin.
  const reecrit = 'Chez l’adulte sans insuffisance hépatique, on ne dépasse pas, sauf avis spécialisé et surveillance biologique rapprochée, trois grammes, à répartir en quatre prises espacées.';
  assert.equal(ancrerParContexte(s, reecrit), null);
});

test('réancrage : une page encore inconnue ne rend pas orphelin', () => {
  const s = surlignage({ page: 2, citation: 'passage' });
  const r = reancrer([s], [page('autre'), null]);
  assert.equal(r.etats.s1, 'inconnu');
});

test('fusion de rectangles : même ligne fusionnée, lignes distinctes conservées, miettes écartées', () => {
  const out = fusionnerRects([
    { x: 0.1, y: 0.5, w: 0.2, h: 0.02 },
    { x: 0.305, y: 0.5005, w: 0.1, h: 0.02 },
    { x: 0.1, y: 0.53, w: 0.4, h: 0.02 },
    { x: 0.2, y: 0.6, w: 0.0001, h: 0.02 },
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[0].x, 0.1);
  assert.equal(Math.round(out[0].w * 1000) / 1000, 0.305);
});

test('toucher un surlignage : le plus récent sous le doigt', () => {
  const a = { id: 'a', rects: [{ x: 0.1, y: 0.1, w: 0.5, h: 0.05 }] };
  const b = { id: 'b', rects: [{ x: 0.3, y: 0.1, w: 0.5, h: 0.05 }] };
  assert.equal(surlignageSousPoint([a, b], 0.4, 0.12)?.id, 'b');
  assert.equal(surlignageSousPoint([a, b], 0.15, 0.12)?.id, 'a');
  assert.equal(surlignageSousPoint([a, b], 0.9, 0.9), null);
});

test('validation API : entrées abîmées écartées une à une, forme globale exigée', () => {
  const bon = surlignage({ id: 'ok-1', citation: 'passage' });
  const res = validerListe({
    surlignages: [
      bon,
      { ...bon }, // doublon d'identifiant
      { ...bon, id: 'x/../y' },
      { ...bon, id: 'c2', couleur: 'violet' },
      { ...bon, id: 'c3', page: 0 },
      { ...bon, id: 'c4', citation: '   ' },
      { ...bon, id: 'c5', rects: [{ x: -1, y: 0.2, w: 3, h: 0.1 }, { x: 'a' }] },
    ],
  });
  assert.ok(res.ok);
  if (!res.ok) return;
  assert.deepEqual(res.surlignages.map((s) => s.id), ['ok-1', 'c5']);
  assert.deepEqual(res.surlignages[1].rects, [{ x: 0, y: 0.2, w: 1, h: 0.1 }]);
  assert.equal(res.ecartes, 5);
  assert.equal(validerListe({}).ok, false);
  assert.equal(validerListe({ surlignages: new Array(MAX_SURLIGNAGES + 1).fill(bon) }).ok, false);
});

test('fichier stocké illisible : aucun surlignage plutôt qu’une erreur', () => {
  assert.deepEqual(lireFichier(null).surlignages, []);
  assert.deepEqual(lireFichier({ surlignages: 'x' }).surlignages, []);
  assert.equal(lireFichier({ surlignages: [], majLe: '2026-09-28T10:00:00.000Z' }).majLe, '2026-09-28T10:00:00.000Z');
});

test('versions stockées : ordre alphabétique = ordre chronologique, noms étrangers ignorés', () => {
  // Le CDN du stockage sert un objet RÉÉCRIT dans son ancienne version pendant
  // ~1 min : chaque écriture crée donc un nouvel objet, le plus récent fait foi.
  const a = nomVersionSurlignages(1_790_000_000_000, 0.1);
  const b = nomVersionSurlignages(1_790_000_000_001, 0.9);
  const c = nomVersionSurlignages(99_999_999_999, 0.5); // horodatage plus court : complété à gauche
  assert.match(a, /^\d{15}-[a-z0-9]{6}\.json$/);
  assert.deepEqual(trierVersionsSurlignages([a, 'ancien.json', c, b, '.emptyFolderPlaceholder']), [b, a, c]);
  assert.notEqual(nomVersionSurlignages(1, 0.1), nomVersionSurlignages(1, 0.2));
});
