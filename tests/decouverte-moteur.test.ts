import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluerCandidat, controlerEnvoi, evaluerTout, resumeAction } from '../src/lib/decouverte/moteur';
import { attribuer } from '../src/lib/decouverte/attribution';
import { calculerKpi } from '../src/lib/decouverte/kpi';
import { appliquer, filtrer, filtresDepuisQuery, filtresVersQuery, FILTRES_DEFAUT } from '../src/lib/decouverte/filtres';
import { ajouterJours, jourParis, parisVersIso, ecartJours, lireJour, lireHeure } from '../src/lib/decouverte/dates';
import { PARAMETRES_DEFAUT, validerParametres, type CandidatEtat, type EnvoiEtat, type OppositionEtat, type Parametres } from '../src/lib/decouverte/types';
import { tableHistorique, tableListe } from '../src/lib/decouverte/exports';

/* ─────────────── fabriques ─────────────── */
let n = 0;
const uid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
const P = (o: Partial<Parametres> = {}): Parametres => ({ ...PARAMETRES_DEFAUT, ...o, delais: { ...PARAMETRES_DEFAUT.delais, ...(o.delais ?? {}) }, actifs: { ...PARAMETRES_DEFAUT.actifs, ...(o.actifs ?? {}) } });

function cand(o: Partial<CandidatEtat> & { j0: string }): CandidatEtat {
  const id = o.id ?? uid();
  return {
    id, user_id: o.user_id === undefined ? uid() : o.user_id, email_actuel: o.email_actuel ?? `c${n}@exemple.fr`, email_normalise: (o.email_actuel ?? `c${n}@exemple.fr`).toLowerCase(),
    prenom: 'Sara', nom: 'Benali', telephone: '0600000000', specialite: 'Psychiatrie', voie: null, origine: 'formulaire_decouverte',
    session_evc: null, pays: null, demande_at: o.j0, derniere_demande_at: null, nb_demandes: 1, compte_cree_at: o.j0, acces_initial_at: o.j0,
    acces_initial_approx: false, premiere_connexion_at: null, premiere_connexion_approx: false, derniere_connexion_at: null, compte_supprime_at: null,
    relance_attribuee: null, regle_attribution_appliquee: null, attribution_calculee_at: null, delai_connexion_sec: null, delai_clic_sec: null,
    email_bloque_adresse: null, email_bloque_raison: null, email_bloque_at: null,
    auth_email: o.email_actuel ?? null, auth_last_sign_in_at: null, auth_banned_until: null, auth_deleted_at: null, auth_existe: true,
    profil_existe: true, profil_actif: true, profil_offre: 'decouverte', profil_espace_decouverte: 'true',
    ...o,
  } as CandidatEtat;
}
function env(c: CandidatEtat, type: EnvoiEtat['type'], at: string, o: Partial<EnvoiEtat> = {}): EnvoiEtat {
  return { id: uid(), candidat_id: c.id, type, origine: 'module', exceptionnel: false, statut: 'envoye', email_utilise: c.email_actuel, sujet: null, created_at: at, envoye_at: at, ...o };
}
const ev = (c: CandidatEtat, envois: EnvoiEtat[], maintenant: string, p = P(), opp: OppositionEtat[] = []) =>
  evaluerCandidat(c, envois, p, opp, { maintenant });

// J0 : 1er septembre 2026, 10 h (heure de Paris = 08:00 UTC).
const J0 = '2026-09-01T08:00:00.000Z';
const jour = (j: number, h = 9) => parisVersIso(ajouterJours('2026-09-01', j), `${String(h).padStart(2, '0')}:00`);

/* ─────────────── dates Paris ─────────────── */
test('dates : jour calendaire de Paris, jamais UTC', () => {
  assert.equal(jourParis('2026-09-03T22:30:00Z'), '2026-09-04'); // 00:30 à Paris
  assert.equal(jourParis('2026-12-31T23:30:00Z'), '2027-01-01'); // hiver, UTC+1
  assert.equal(parisVersIso('2026-09-12', '14:30'), '2026-09-12T12:30:00.000Z');
  assert.equal(parisVersIso('2026-01-12', '14:30'), '2026-01-12T13:30:00.000Z');
  assert.equal(ajouterJours('2026-10-20', 14), '2026-11-03');
  assert.equal(ecartJours('2026-03-28', '2026-03-30'), 2); // passage à l'heure d'été
  assert.equal(lireJour('12/09/2026'), '2026-09-12');
  assert.equal(lireJour('31/02/2026'), null);
  assert.equal(lireHeure('9h'), '09:00');
  assert.equal(lireHeure('25:00'), null);
});

test('J+7 d’un accès à 23 h 30 (Paris) tombe au 7e jour calendaire de Paris', () => {
  const c = cand({ j0: '2026-09-03T21:30:00Z' }); // 23:30 à Paris le 3
  const e = ev(c, [], '2026-09-10T06:00:00Z');   // 08:00 à Paris le 10
  assert.equal(e.echeance, '2026-09-10');
  assert.equal(e.statut, 'ROUGE');
});

/* ─────────────── cadence ─────────────── */
test('cadence : ORANGE à J0, ROUGE R1 à J+7, R2 à J+21, R3 à J+45, puis GRIS', () => {
  const c = cand({ j0: J0 });
  assert.equal(ev(c, [], jour(0)).statut, 'ORANGE');
  const e6 = ev(c, [], jour(6));
  assert.equal(e6.statut, 'ORANGE'); assert.equal(e6.prochainType, 'R1'); assert.equal(e6.echeance, '2026-09-08');
  const e7 = ev(c, [], jour(7));
  assert.equal(e7.statut, 'ROUGE'); assert.equal(e7.prochainType, 'R1');
  const r1 = env(c, 'R1', jour(7));
  const e20 = ev(c, [r1], jour(20));
  assert.equal(e20.statut, 'ORANGE'); assert.equal(e20.prochainType, 'R2'); assert.equal(e20.echeance, '2026-09-22');
  assert.equal(ev(c, [r1], jour(21)).statut, 'ROUGE');
  const r2 = env(c, 'R2', jour(21));
  const e44 = ev(c, [r1, r2], jour(44));
  assert.equal(e44.prochainType, 'R3'); assert.equal(e44.echeance, '2026-10-16'); assert.equal(e44.statut, 'ORANGE');
  assert.equal(ev(c, [r1, r2], jour(45)).statut, 'ROUGE');
  const r3 = env(c, 'R3', jour(45));
  const fin = ev(c, [r1, r2, r3], jour(200));
  assert.equal(fin.statut, 'GRIS'); assert.equal(fin.prochainType, null);
  assert.match(fin.pourquoi.join(' '), /R3/);
});

test('retards : R1 envoyée en retard → R2 respecte l’écart minimal de 7 jours', () => {
  const c = cand({ j0: J0 });
  const r1 = env(c, 'R1', jour(18)); // R1 partie à J+18
  const e = ev(c, [r1], jour(21));
  assert.equal(e.prochainType, 'R2');
  assert.equal(e.echeance, ajouterJours('2026-09-01', 25)); // J+18 + 7
  assert.equal(e.statut, 'ORANGE');
  assert.match(e.pourquoi.join(' '), /écart minimal/);
});

test('niveaux désactivés : R1 désactivée → R2 à J+21 ; R3 désactivée → GRIS après R2', () => {
  const c = cand({ j0: J0 });
  const p = P({ actifs: { R1: false, R2: true, R3: false, ancien_acces: true } });
  const e = ev(c, [], jour(10), p);
  assert.equal(e.prochainType, 'R2'); assert.equal(e.statut, 'ORANGE'); assert.equal(e.echeance, '2026-09-22');
  const r2 = env(c, 'R2', jour(21));
  const f = ev(c, [r2], jour(50), p);
  assert.equal(f.statut, 'GRIS');
});

test('maximum de relances : 2 → GRIS après R2 ; 0 → aucune relance', () => {
  const c = cand({ j0: J0 });
  const r1 = env(c, 'R1', jour(7)), r2 = env(c, 'R2', jour(21));
  assert.equal(ev(c, [r1, r2], jour(60), P({ maxRelances: 2 })).statut, 'GRIS');
  const z = ev(c, [], jour(10), P({ maxRelances: 0 }));
  assert.equal(z.statut, 'GRIS'); assert.equal(z.prochainType, null);
});

test('délais modifiables : R1 à J+3', () => {
  const c = cand({ j0: J0 });
  assert.equal(ev(c, [], jour(3), P({ delais: { R1: 3, R2: 10, R3: 20 } })).statut, 'ROUGE');
});

/* ─────────────── historique ─────────────── */
test('historique importé : R2 importée sans R1 → la séquence reprend à R3, jamais de retour à R1', () => {
  const c = cand({ j0: J0 });
  const r2 = env(c, 'R2', jour(15), { statut: 'historique', origine: 'import' });
  const e = ev(c, [r2], jour(30));
  assert.equal(e.dernierNiveau, 'R2');
  assert.equal(e.prochainType, 'R3');
  assert.equal(e.echeance, '2026-10-16');
});

test('R1 déjà envoyée manuellement : pas de nouvelle R1', () => {
  const c = cand({ j0: J0 });
  const r1 = env(c, 'R1', jour(5), { statut: 'historique', origine: 'manuel' });
  const e = ev(c, [r1], jour(8));
  assert.equal(e.prochainType, 'R2');
  const ctl = controlerEnvoi(e, { mode: 'relance' }, P(), [r1]);
  assert.equal(ctl.ok, false);
});

test('relance de l’ancien système : compte pour l’écart, pas comme R1', () => {
  const c = cand({ j0: J0 });
  const vieux = env(c, 'ancienne_relance', jour(5), { statut: 'historique', origine: 'ancien_systeme' });
  const e = ev(c, [vieux], jour(8));
  assert.equal(e.prochainType, 'R1');
  assert.equal(e.nbRelances, 0);
  assert.equal(e.echeance, ajouterJours('2026-09-01', 12)); // J+5 + 7
  assert.equal(e.statut, 'ORANGE');
});

/* ─────────────── ancien stock ─────────────── */
test('ancien stock : jamais relancé et ≥ seuil → VIOLET ; après la campagne → GRIS (pas de boucle)', () => {
  const c = cand({ j0: '2026-05-01T08:00:00Z' });
  const e = ev(c, [], '2026-09-30T08:00:00Z');
  assert.equal(e.statut, 'VIOLET'); assert.equal(e.prochainType, 'ancien_acces'); assert.equal(e.echue, true);
  const ctl = controlerEnvoi(e, { mode: 'relance' }, P(), []);
  assert.deepEqual(ctl.ok && ctl.type, 'ancien_acces');
  const a = env(c, 'ancien_acces', '2026-09-30T09:00:00Z');
  const f = ev(c, [a], '2027-03-30T08:00:00Z');
  assert.equal(f.statut, 'GRIS');
  assert.match(f.pourquoi.join(' '), /pas de boucle/);
});

test('ancien stock avec R1 déjà partie : pas VIOLET, séquence normale', () => {
  const c = cand({ j0: '2026-05-01T08:00:00Z' });
  const r1 = env(c, 'R1', '2026-05-08T08:00:00Z', { statut: 'historique', origine: 'import' });
  const e = ev(c, [r1], '2026-09-30T08:00:00Z');
  assert.equal(e.statut, 'ROUGE'); assert.equal(e.prochainType, 'R2');
});

test('ancien stock : campagne désactivée → VIOLET sans action', () => {
  const c = cand({ j0: '2026-05-01T08:00:00Z' });
  const e = ev(c, [], '2026-09-30T08:00:00Z', P({ actifs: { R1: true, R2: true, R3: true, ancien_acces: false } }));
  assert.equal(e.statut, 'VIOLET'); assert.equal(e.prochainType, null);
  assert.equal(controlerEnvoi(e, { mode: 'relance' }, P({ actifs: { R1: true, R2: true, R3: true, ancien_acces: false } })).ok, false);
});

/* ─────────────── sorties ─────────────── */
test('connexion à n’importe quel moment : VERT, plus aucun e-mail de non-connexion (même exceptionnel)', () => {
  const c = cand({ j0: J0, premiere_connexion_at: jour(9) });
  const e = ev(c, [env(c, 'R1', jour(7))], jour(30));
  assert.equal(e.statut, 'VERT');
  for (const t of ['R1', 'R2', 'R3', 'ancien_acces'] as const) {
    assert.equal(controlerEnvoi(e, { mode: 'exceptionnel', type: t }, P()).ok, false);
  }
});

test('connexion entre sélection et envoi : la relecture fraîche d’auth.users exclut', () => {
  const c = cand({ j0: J0 });
  assert.equal(ev(c, [], jour(8)).statut, 'ROUGE');
  const frais = { ...c, auth_last_sign_in_at: jour(8, 10) }; // trigger pas encore passé
  const e = ev(frais, [], jour(8, 11));
  assert.equal(e.statut, 'VERT');
  const ctl = controlerEnvoi(e, { mode: 'relance' }, P());
  assert.equal(ctl.ok, false);
  assert.match(!ctl.ok ? ctl.raison : '', /connecté/);
});

test('opposition (adresse, compte ou fiche) : DÉSINSCRIT, exclusion même exceptionnelle', () => {
  const c = cand({ j0: J0, email_actuel: 'Sara@Exemple.fr' });
  const o: OppositionEtat = { id: uid(), email_normalise: 'sara@exemple.fr', user_id: null, candidat_id: null, source: 'lien_desinscription', envoi_id: null, created_at: jour(3) };
  const e = ev(c, [], jour(10), P(), [o]);
  assert.equal(e.statut, 'DESINSCRIT');
  assert.equal(controlerEnvoi(e, { mode: 'exceptionnel', type: 'R1' }, P()).ok, false);
  const parCompte: OppositionEtat = { ...o, email_normalise: 'autre@x.fr', user_id: c.user_id };
  assert.equal(ev(c, [], jour(10), P(), [parCompte]).statut, 'DESINSCRIT');
});

test('désinscription entre sélection et envoi : exclusion', () => {
  const c = cand({ j0: J0 });
  const o: OppositionEtat = { id: uid(), email_normalise: c.email_normalise, user_id: null, candidat_id: c.id, source: 'one_click', envoi_id: null, created_at: jour(8, 10) };
  assert.equal(controlerEnvoi(ev(c, [], jour(8, 11), P(), [o]), { mode: 'relance' }, P()).ok, false);
});

test('hard bounce : BLOQUÉ tant que l’adresse active est celle qui a rebondi, débloqué si elle change', () => {
  const c = cand({ j0: J0, email_actuel: 'faux@exemple.fr', email_bloque_adresse: 'faux@exemple.fr', email_bloque_raison: 'Permanent', email_bloque_at: jour(7) });
  const e = ev(c, [env(c, 'R1', jour(7))], jour(30));
  assert.equal(e.statut, 'BLOQUE');
  assert.equal(controlerEnvoi(e, { mode: 'relance' }, P()).ok, false);
  const corrige = { ...c, auth_email: 'vrai@exemple.fr' };
  const e2 = ev(corrige, [env(c, 'R1', jour(7))], jour(30));
  assert.equal(e2.statut, 'ROUGE'); assert.equal(e2.email, 'vrai@exemple.fr');
});

test('compte supprimé / désactivé / suspendu / hors offre : GRIS avec raison, jamais relancé', () => {
  const base = { j0: J0 };
  const cas: Array<[Partial<CandidatEtat>, RegExp]> = [
    [{ user_id: null, compte_supprime_at: jour(3) }, /supprimé/],
    [{ profil_actif: false }, /désactivé/],
    [{ auth_banned_until: '2099-01-01T00:00:00Z' }, /suspendu/],
    [{ profil_offre: 'intensif' }, /offre/],
  ];
  for (const [o, re] of cas) {
    const e = ev(cand({ ...base, ...o }), [], jour(10));
    assert.equal(e.statut, 'GRIS');
    assert.match(e.pourquoi.join(' '), re);
    assert.equal(controlerEnvoi(e, { mode: 'relance' }, P()).ok, false);
  }
});

test('pause globale : statut conservé mais aucun envoi', () => {
  const c = cand({ j0: J0 });
  const e = ev(c, [], jour(8), P({ pause: true }));
  assert.equal(e.statut, 'ROUGE');
  const r = controlerEnvoi(e, { mode: 'relance' }, P({ pause: true }));
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.raison : '', /pause/);
});

test('relance manuelle exceptionnelle : avertit si le modèle est déjà parti ou pas encore dû', () => {
  const c = cand({ j0: J0 });
  const r1 = env(c, 'R1', jour(7));
  const e = ev(c, [r1], jour(10));
  const r = controlerEnvoi(e, { mode: 'exceptionnel', type: 'R1' }, P(), [r1]);
  assert.equal(r.ok, true);
  assert.ok(r.ok && r.avertissements.some((a) => /déjà partie/.test(a)));
  const r2 = controlerEnvoi(e, { mode: 'exceptionnel', type: 'R2' }, P(), [r1]);
  assert.ok(r2.ok && r2.avertissements.some((a) => /anticipé/.test(a)));
});

test('une relance exceptionnelle compte ensuite pour la séquence (pas de R2 en double)', () => {
  const c = cand({ j0: J0 });
  const r2x = env(c, 'R2', jour(10), { exceptionnel: true, origine: 'manuel' });
  const e = ev(c, [r2x], jour(22));
  assert.equal(e.prochainType, 'R3');
});

test('échec d’envoi : ne compte pas, le niveau reste dû', () => {
  const c = cand({ j0: J0 });
  const e = ev(c, [env(c, 'R1', jour(7), { statut: 'echec' })], jour(8));
  assert.equal(e.prochainType, 'R1'); assert.equal(e.statut, 'ROUGE');
});

/* ─────────────── attribution ─────────────── */
test('attribution : les trois règles, la fenêtre et le repli', () => {
  const c = cand({ j0: J0 });
  const r1 = env(c, 'R1', jour(7), { clic_cta_at: jour(7, 12), dernier_clic_at: jour(7, 12) });
  const r2 = env(c, 'R2', jour(21));
  const T = jour(22);
  assert.equal(attribuer(T, [r1, r2], 'dernier_clic', 30).envoiId, r1.id);
  assert.equal(attribuer(T, [r1, r2], 'derniere_relance', 30).envoiId, r2.id);
  assert.equal(attribuer(T, [r1, r2], 'premiere_relance', 30).envoiId, r1.id);
  // Fenêtre de 14 jours : R1 (J+7) hors fenêtre pour une connexion à J+22.
  assert.equal(attribuer(T, [r1, r2], 'premiere_relance', 14).envoiId, r2.id);
  assert.equal(attribuer(T, [r1, r2], 'dernier_clic', 14).envoiId, r2.id); // repli : aucun clic dans la fenêtre
  assert.match(attribuer(T, [r1, r2], 'dernier_clic', 14).motif, /repli/);
  // Aucune relance avant la connexion.
  assert.equal(attribuer(jour(3), [r1, r2], 'dernier_clic', 14).envoiId, null);
  const a = attribuer(T, [r1, r2], 'derniere_relance', 30);
  assert.equal(a.delaiConnexionSec, 86_400);
  // Import historique sans suivi : attribuable (date connue), jamais d'échec ni de test.
  const imp = env(c, 'R3', jour(20), { statut: 'historique', origine: 'import' });
  assert.equal(attribuer(T, [imp, env(c, 'R2', jour(21), { statut: 'echec' })], 'derniere_relance', 30).envoiId, imp.id);
});

/* ─────────────── KPI concordants ─────────────── */
test('KPI : concordent avec l’historique individuel', () => {
  const a = cand({ j0: J0 });
  const b = cand({ j0: J0, premiere_connexion_at: jour(8), relance_attribuee: null, delai_connexion_sec: 3600 });
  const c = cand({ j0: '2026-05-01T08:00:00Z' });
  const d = cand({ j0: J0 });
  const ra = env(a, 'R1', jour(7), { ouvert_at: jour(7, 12), clic_cta_at: jour(7, 13) });
  const rb = env(b, 'R1', jour(7, 7), { clic_video_at: jour(7, 8), desinscrit_at: null });
  b.relance_attribuee = rb.id;
  const rd = env(d, 'R1', jour(7), { desinscrit_at: jour(8) });
  const opp: OppositionEtat = { id: uid(), email_normalise: d.email_normalise, user_id: null, candidat_id: d.id, source: 'lien_desinscription', envoi_id: rd.id, created_at: jour(8) };
  const lignes = evaluerTout({ candidats: [a, b, c, d], envois: [ra, rb, rd], oppositions: [opp] }, P(), jour(12));
  const k = calculerKpi(lignes);
  assert.equal(k.demandes, 4);
  assert.equal(k.actives, 1);
  assert.equal(k.anciensAcces, 1);
  assert.equal(k.desinscrits, 1);
  assert.equal(k.jamaisConnectes, 3);
  assert.equal(k.parModele.R1.envoyes, 3);
  assert.equal(k.parModele.R1.ouverts, 1);
  assert.equal(k.parModele.R1.clicsCta, 1);
  assert.equal(k.parModele.R1.clicsVideo, 1);
  assert.equal(k.parModele.R1.connexionsAttribuees, 1);
  assert.equal(k.parModele.R1.desinscriptions, 1);
  assert.equal(k.parModele.R1.tauxActivation, 1 / 3);
  assert.equal(k.delaiMedianSec, 3600);
  // Somme des statuts = demandes (chaque candidat a exactement un statut).
  assert.equal(k.enAttente + k.aRelancer + k.anciensAcces + k.actives + k.termines + k.erreurs + lignes.filter((l) => l.evaluation.statut === 'DESINSCRIT').length, k.demandes);
  // Bannière = candidats ROUGE (R1/R2/R3) + anciens accès échus.
  const r = resumeAction(lignes);
  assert.equal(r.anciensAcces, 1);
  assert.equal(r.aRelancer, k.aRelancer);
});

/* ─────────────── filtres & exports ─────────────── */
test('filtres : vues, ancienneté, période, recherche ; les exports reflètent les filtres', () => {
  const vieux = cand({ j0: '2026-05-01T08:00:00Z', prenom: 'Élodie', nom: 'Martin', specialite: 'Cardiologie', telephone: '06 12 34 56 78' });
  const recent = cand({ j0: J0, specialite: 'Psychiatrie' });
  const actif = cand({ j0: J0, premiere_connexion_at: jour(3), specialite: 'Psychiatrie' });
  const lignes = evaluerTout({ candidats: [vieux, recent, actif], envois: [], oppositions: [] }, P(), jour(8));
  const f = (o: Partial<typeof FILTRES_DEFAUT>) => filtrer(lignes, { ...FILTRES_DEFAUT, ...o }).map((l) => l.candidat.id);
  assert.deepEqual(f({ vue: 'anciens' }), [vieux.id]);
  assert.deepEqual(f({ vue: 'R1' }), [recent.id]);
  assert.deepEqual(f({ vue: 'actives' }), [actif.id]);
  assert.equal(f({ vue: 'jamais_connectes' }).length, 2);
  assert.deepEqual(f({ anciennete: '90' }), [vieux.id]);
  assert.deepEqual(f({ anciennete: 'perso', ancienneteMin: 5, ancienneteMax: 10 }).sort(), [recent.id, actif.id].sort());
  assert.deepEqual(f({ demandeDu: '2026-08-01' }).sort(), [recent.id, actif.id].sort());
  assert.deepEqual(f({ recherche: 'elodie' }), [vieux.id]);
  assert.deepEqual(f({ recherche: '0612 3456' }), [vieux.id]);
  assert.deepEqual(f({ specialite: 'Cardiologie' }), [vieux.id]);
  // Aller-retour URL (export) : mêmes filtres, même résultat.
  const filtres = { ...FILTRES_DEFAUT, vue: 'jamais_connectes' as const, specialite: 'Psychiatrie', tri: 'candidat' as const };
  const q = filtresVersQuery(filtres);
  assert.deepEqual(filtresDepuisQuery(new URLSearchParams(q)), filtres);
  const ecran = appliquer(lignes, filtres);
  assert.equal(tableListe(ecran).lignes.length, 1);
  assert.equal(tableListe(ecran).lignes[0].at(-1), recent.id);
  assert.equal(tableHistorique(ecran).lignes.length, 0);
});

test('validation des paramètres', () => {
  assert.deepEqual(validerParametres(P()), []);
  assert.ok(validerParametres(P({ delais: { R1: 21, R2: 7, R3: 45 } })).length > 0);
  assert.ok(validerParametres(P({ lienVideo: 'javascript:alert(1)' })).length > 0);
  assert.ok(validerParametres(P({ maxRelances: 5 })).length > 0);
});
