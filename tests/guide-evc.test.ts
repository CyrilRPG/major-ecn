import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublishedArticles, BLOG_CATEGORIES, type BlogCategory } from '../src/lib/data/blog-articles';
import {
  GUIDE_SECTIONS,
  SECTION_BY_CATEGORY,
  SECTION_BY_SLUG,
  buildGuideSections,
  isSpecialtyArticleSlug,
  sectionIdForArticle,
} from '../src/lib/data/guide-evc';

/* ── Garde-fou du hub /guide-evc ───────────────────────────────────────────
   Règle 1 du cahier des charges : « chaque article du blog doit être
   atteignable depuis le hub, dans la section qui lui correspond ». La page
   serait silencieusement incomplète si un article n'était rattaché à aucune
   section — d'où ces vérifications. */

test('tout article publié est rattaché à une section du guide', () => {
  const sections = buildGuideSections(getPublishedArticles());
  const linked = new Set(sections.flatMap((s) => s.articles.map((a) => a.slug)));
  for (const a of getPublishedArticles()) {
    assert.ok(linked.has(a.slug), `article non maillé depuis le hub : ${a.slug}`);
  }
});

test('un article n’apparaît que dans une seule section', () => {
  const sections = buildGuideSections(getPublishedArticles());
  const slugs = sections.flatMap((s) => s.articles.map((a) => a.slug));
  assert.equal(slugs.length, new Set(slugs).size);
  assert.equal(slugs.length, getPublishedArticles().length);
});

test('chaque catégorie de blog a une section d’accueil', () => {
  for (const cat of Object.keys(BLOG_CATEGORIES) as BlogCategory[]) {
    const target = SECTION_BY_CATEGORY[cat];
    assert.ok(target, `catégorie sans section : ${cat}`);
    assert.ok(
      GUIDE_SECTIONS.some((s) => s.id === target),
      `section inconnue pour la catégorie ${cat} : ${target}`,
    );
  }
});

test('les dérogations par slug visent des sections existantes et priment', () => {
  for (const [slug, sectionId] of Object.entries(SECTION_BY_SLUG)) {
    assert.ok(
      GUIDE_SECTIONS.some((s) => s.id === sectionId),
      `dérogation vers une section inconnue : ${sectionId}`,
    );
    // La dérogation l'emporte sur la catégorie ET sur l'heuristique de spécialité.
    assert.equal(
      sectionIdForArticle({ slug, title: '', excerpt: '', category: 'epreuves-evc', readingMinutes: 1 }),
      sectionId,
    );
  }
});

test('les monographies « EVC <spécialité> <année> » vont dans « Par spécialité »', () => {
  const specialty = ['evc-cardiologie-medecine-cardiovasculaire-2026', 'evc-pediatrie-2026-2', 'evc-odontologie-2026'];
  for (const slug of specialty) {
    assert.ok(isSpecialtyArticleSlug(slug), `non reconnu comme monographie : ${slug}`);
    assert.equal(
      sectionIdForArticle({ slug, title: '', excerpt: '', category: 'epreuves-evc', readingMinutes: 1 }),
      'par-specialite',
    );
  }
  // Contre-exemples : ni les articles généraux, ni les articles de méthode.
  for (const slug of [
    'evc-voie-externe-comprendre',
    'evc-edn-difference-a-ne-pas-confondre',
    'evc-pae-liste-documents-fournir',
    'reviser-evc-psychiatrie-10-semaines',
    'calendrier-evc-2026-dates-epreuves-specialites',
  ]) {
    assert.equal(isSpecialtyArticleSlug(slug), false, `faux positif : ${slug}`);
  }
});

test('chaque section a un texte rédigé et une ancre unique', () => {
  const ids = new Set<string>();
  for (const s of GUIDE_SECTIONS) {
    assert.ok(!ids.has(s.id), `ancre dupliquée : ${s.id}`);
    ids.add(s.id);
    assert.ok(s.intro.length >= 2, `section sans texte rédigé suffisant : ${s.id}`);
    // « Ne pas faire une simple liste de liens » : au moins ~3 lignes de texte.
    assert.ok(s.intro.join(' ').length > 300, `texte trop court pour la section ${s.id}`);
  }
});
