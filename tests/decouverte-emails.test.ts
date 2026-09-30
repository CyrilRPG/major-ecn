import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { rendreEmailDecouverte, liensDuJeton } from '../src/lib/decouverte/emails';
import { MODELES_DEFAUT, modeleEffectif, validerModele, surchargeDepuisModele, BENEFICES } from '../src/lib/decouverte/modeles';
import { TYPES_MODELE } from '../src/lib/decouverte/types';
import { libelleDureeLong } from '../src/lib/marketing/visite-guidee';
import { verifierSignatureSvix } from '../src/lib/decouverte/svix';
import { analyserCsv, lireTypeHistorique, versCsv } from '../src/lib/decouverte/csv';
import { masquerEmail, pagePublique } from '../src/lib/decouverte/pages';

const JETON = 'aB3dE5gH7jK9mN1pQ3sT5vX7zA9cE1gI3kM5oQ7sU9';
const liens = liensDuJeton('https://www.major-ecn.fr', JETON);
const vars = (prenom: string | null = 'Sara') => ({ prenom, dureeVideo: libelleDureeLong(), validiteJours: 30 });
const rendu = (t: (typeof TYPES_MODELE)[number], prenom: string | null = 'Sara') => rendreEmailDecouverte(t, modeleEffectif(t, {}), vars(prenom), liens);
const texte = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&rsquo;|&#39;/g, '’').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('« récemment » est interdit dans tous les modèles (défauts, HTML et texte) et refusé à l’enregistrement', () => {
  for (const t of TYPES_MODELE) {
    const r = rendu(t);
    assert.doesNotMatch(r.html, /r[ée]cemment/i, t);
    assert.doesNotMatch(r.text, /r[ée]cemment/i, t);
    assert.deepEqual(validerModele(t, modeleEffectif(t, {})), [], t);
  }
  const m = modeleEffectif('ancien_acces', { ancien_acces: { paragraphes: ['Vous avez récemment demandé…'] } });
  assert.ok(validerModele('ancien_acces', m).some((e) => /récemment/.test(e)));
  assert.ok(validerModele('R1', modeleEffectif('R1', { R1: { objet: 'Inscrit Recemment ?' } })).length > 0);
  assert.ok(validerModele('R1', modeleEffectif('R1', { R1: { titre: '{{nom}}' } })).some((e) => /Variable inconnue/.test(e)));
});

test('R1 : textes exacts du cahier, hiérarchie titre → bouton → bénéfices → vidéo → aide → pied', () => {
  const r = rendu('R1');
  assert.equal(r.subject, 'Votre espace découverte Major ECN vous attend');
  const t = texte(r.html);
  for (const s of [
    'Bonjour Sara,',
    'Vous avez demandé à découvrir Major ECN et votre accès à la plateforme est bien disponible.',
    'Nous avons remarqué que vous n’avez pas encore eu l’occasion de vous connecter.',
    'Accéder à mon espace découverte',
    'Votre accès est déjà activé. Il ne vous reste plus qu’à découvrir la plateforme.',
    'Vous souhaitez d’abord voir comment fonctionne Major ECN ?',
    `Visite guidée — ${libelleDureeLong()}`,
    'Une question ?', 'Répondez simplement à cet email.',
    'Cours & fiches', 'Des contenus clairs et à jour', 'QCM / QROC', 'Entraînements adaptés aux épreuves',
    'Cas cliniques & annales', 'Pour vous confronter aux situations réelles', 'Suivi & révisions', 'Des outils pour progresser efficacement',
    'Se désinscrire', 'Mentions légales', 'Contact', 'Voir cet email dans votre navigateur',
  ]) assert.ok(t.includes(s), `absent : ${s}`);
  assert.doesNotMatch(r.html, /milliers de questions/i);
  // Hiérarchie : titre < bouton < bénéfices < ligne vidéo < aide < pied.
  const pos = ['vous attend</h1>', liens.acces, 'Cours &amp; fiches', liens.video, 'Une question ?', 'Se désinscrire'].map((s) => r.html.indexOf(s));
  assert.ok(pos.every((p) => p > 0), JSON.stringify(pos));
  assert.deepEqual([...pos].sort((a, b) => a - b), pos);
  assert.equal(BENEFICES.length, 4);
});

test('R2, R3, ancien accès : textes exacts, modèles et liens propres', () => {
  const r2 = texte(rendu('R2').html);
  assert.equal(rendu('R2').subject, 'Avez-vous pu découvrir Major ECN ?');
  for (const s of ['Votre espace découverte Major ECN est toujours disponible.', 'Si vous n’avez pas encore eu le temps de parcourir la plateforme, vous pouvez y accéder directement ci-dessous.', 'Accéder à mon espace', 'Une difficulté pour vous connecter ou une question concernant votre préparation aux EVC ?', 'Répondez simplement à cet email.']) assert.ok(r2.includes(s), s);

  const r3 = rendu('R3');
  assert.equal(r3.subject, 'Votre accès découverte Major ECN est toujours disponible');
  const t3 = texte(r3.html);
  for (const s of ['Vous aviez souhaité découvrir notre plateforme de préparation aux EVC.', 'Si votre projet est toujours d’actualité, votre espace découverte reste accessible.', 'Accéder à mon espace', 'Si vous avez une question, vous pouvez répondre directement à cet email.', 'L’équipe Major ECN']) assert.ok(t3.includes(s), s);
  assert.ok(!r3.html.includes(liens.video), 'R3 : pas de lien vidéo');
  assert.ok(!r3.html.includes('decouverte-ico-cours'), 'R3 : pas de bénéfices');

  const a = rendu('ancien_acces');
  assert.equal(a.subject, 'Votre accès Major ECN est toujours disponible');
  const ta = texte(a.html);
  for (const s of ['Vous aviez demandé à découvrir la plateforme Major ECN.', 'Si votre projet de préparation aux EVC est toujours d’actualité, votre espace découverte est toujours disponible.', 'Découvrir Major ECN', 'Voir la plateforme en vidéo']) assert.ok(ta.includes(s), s);
  assert.ok(a.html.includes(liens.video));
  assert.doesNotMatch(ta, /pas encore eu l’occasion de vous connecter/);
});

test('« Bonjour, » sans prénom ; « [TEST] » pour un envoi de test ; texte brut complet', () => {
  assert.ok(texte(rendu('R1', null).html).includes('Bonjour,'));
  assert.ok(rendu('R1', '  ').text.startsWith('Bonjour,'));
  const t = rendreEmailDecouverte('R2', modeleEffectif('R2', {}), vars(), liens, { test: true });
  assert.ok(t.subject.startsWith('[TEST] '));
  const r1 = rendu('R1');
  for (const l of [liens.acces, liens.video, liens.desinscription, liens.navigateur]) assert.ok(r1.text.includes(l), l);
});

test('liens : jeton opaque, aucune donnée personnelle dans l’URL', () => {
  for (const t of TYPES_MODELE) {
    const r = rendreEmailDecouverte(t, modeleEffectif(t, {}), { prenom: 'Sara', dureeVideo: '2 min 42', validiteJours: 30 }, liens);
    const urls = [...r.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    for (const u of urls) {
      assert.doesNotMatch(u, /sara|@exemple|email=|prenom=/i, u);
    }
    assert.ok(urls.includes(liens.acces), `${t} : lien d’accès`);
    assert.ok(urls.includes(liens.desinscription), `${t} : désinscription`);
    assert.ok(urls.includes(liens.navigateur), `${t} : version navigateur`);
  }
  assert.equal(liens.acces, `https://www.major-ecn.fr/d/a/${JETON}`);
});

test('marque : logo officiel, vraie capture, polices du site, jamais de réseau social ni de slogan', () => {
  for (const t of TYPES_MODELE) {
    const h = rendu(t).html;
    assert.ok(h.includes('/email/major-ecn-logo.png'), 'logo officiel');
    assert.ok(h.includes('/email/major-ecn-logo-white.png'), 'logo blanc du pied');
    assert.ok(h.includes('/email/decouverte-plateforme.png'), 'capture produit');
    assert.ok(h.includes('Plus+Jakarta+Sans') && h.includes('Manrope'), 'polices du site');
    assert.match(h, /Arial, Helvetica, sans-serif/);
    assert.doesNotMatch(h, /linkedin|instagram|youtube|facebook|twitter|tiktok|Suivez-nous/i);
    assert.doesNotMatch(h, /Réussir aujourd|médecin demain/i);
    assert.match(h, /v:roundrect/, 'bouton VML Outlook');
    assert.match(h, /max-width:620px/, 'responsive');
  }
});

test('surcharges : champ par champ, la surcharge minimale ne garde que les différences', () => {
  const m = modeleEffectif('R1', { R1: { objet: 'Nouvel objet', paragraphes: ['Un seul paragraphe'] } });
  assert.equal(m.objet, 'Nouvel objet');
  assert.equal(m.cta, MODELES_DEFAUT.R1.cta);
  assert.deepEqual(surchargeDepuisModele('R1', m), { objet: 'Nouvel objet', paragraphes: ['Un seul paragraphe'] });
  assert.deepEqual(surchargeDepuisModele('R2', modeleEffectif('R2', {})), {});
});

test('webhook Resend : signature Svix vérifiée, horodatage borné', () => {
  const cle = crypto.randomBytes(24);
  const secret = `whsec_${cle.toString('base64')}`;
  const corps = JSON.stringify({ type: 'email.delivered', data: { email_id: 'abc' } });
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = crypto.createHmac('sha256', cle).update(`msg_1.${ts}.${corps}`).digest('base64');
  assert.equal(verifierSignatureSvix(secret, { id: 'msg_1', timestamp: ts, signature: `v1,${sig}` }, corps), true);
  assert.equal(verifierSignatureSvix(secret, { id: 'msg_1', timestamp: ts, signature: `v1,xxx v1,${sig}` }, corps), true);
  assert.equal(verifierSignatureSvix(secret, { id: 'msg_1', timestamp: ts, signature: `v1,${sig}` }, corps + ' '), false);
  assert.equal(verifierSignatureSvix(secret, { id: 'msg_2', timestamp: ts, signature: `v1,${sig}` }, corps), false);
  assert.equal(verifierSignatureSvix(secret, { id: 'msg_1', timestamp: String(Number(ts) - 3600), signature: `v1,${sig}` }, corps), false);
  assert.equal(verifierSignatureSvix('', { id: 'msg_1', timestamp: ts, signature: `v1,${sig}` }, corps), false);
});

test('import CSV : format, types, dates, erreurs par ligne', () => {
  const { lignes } = analyserCsv('email;type;date;heure;commentaire\nsara@ex.fr;R1;12/09/2026;14:30;appel\nx@ex.fr;R4;12/09/2026;;\nbad;R2;2026-09-12;;\ny@ex.fr;ancien accès;2026-09-31;;\nz@ex.fr;autre;01/09/2026;9h;relance "manuelle";ok');
  assert.equal(lignes.length, 5);
  assert.deepEqual([lignes[0].type, lignes[0].jour, lignes[0].heure, lignes[0].commentaire, lignes[0].erreur], ['R1', '2026-09-12', '14:30', 'appel', null]);
  assert.match(lignes[1].erreur ?? '', /Type inconnu/);
  assert.match(lignes[2].erreur ?? '', /e-mail/);
  assert.match(lignes[3].erreur ?? '', /Date invalide/);
  assert.deepEqual([lignes[4].type, lignes[4].heure], ['ancienne_relance', '09:00']);
  assert.equal(lireTypeHistorique('Ancien accès'), 'ancien_acces');
  assert.equal(lireTypeHistorique('r 2'), 'R2');
  assert.ok(versCsv(['a', 'b'], [['x;y', 'z"']]).includes('"x;y";"z"""'));
});

test('pages publiques : aucune adresse complète, aucun script', () => {
  assert.equal(masquerEmail('sara.b@gmail.com'), 's•••••@gmail.com');
  const h = pagePublique({ titre: 'T <b>', paragraphes: ['p'], boutons: [{ genre: 'formulaire', action: '/d/a/x', libelle: 'Accéder' }] });
  assert.doesNotMatch(h, /<script/i);
  assert.match(h, /noindex/);
  assert.match(h, /T &lt;b&gt;/);
  assert.match(h, /method="POST" action="\/d\/a\/x"/);
});
