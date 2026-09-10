/**
 * Import d'exercices — CONFRONTATION du rendu du modèle à la vérité du
 * document, rapport de fiabilité et réparations déterministes. Module PUR.
 *
 * POURQUOI (09-10/09/2026)
 * -----------------------
 * L'outil avait perdu la confiance du client : corrigés inversés (8,6 % des
 * propositions sur l'import Pédiatrie), questions absentes, listes de
 * propositions tronquées par un saut de page, vignettes remplacées par une
 * note du modèle (« [contexte clinique manquant] »). Le document, lui, ne se
 * trompe pas : ce module aligne les questions du modèle sur celles du document
 * (programmation dynamique, ordre de lecture conservé — jamais par
 * ressemblance de libellé seule : « Que faites-vous ? » revient des dizaines
 * de fois), compare, RÉPARE ce qui peut l'être sans risque et RAPPORTE tout le
 * reste, écart par écart, avec une gravité.
 *
 * Réparations (document coloré, appariement sûr) :
 *  (a) `is_correct` ← couleur, y compris quand le nombre de propositions
 *      diffère (réalignement par lettre puis par texte) ; si le document en a
 *      PLUS, les propositions manquantes sont complétées depuis son texte ;
 *  (b) vignette du document absente de l'énoncé → préfixée (texte d'une
 *      question voisine déjà propre, sinon texte du document nettoyé) ;
 *  (c) ligne qui n'est qu'un placeholder du modèle → retirée.
 * Chaque réparation est comptée et listée dans le rapport.
 */

import {
  couvertureVignette, derniereLigne, jetons, libelleCourt, nettoyerLigaturesPourAffichage, noteDuModele,
  porteArtefactsResiduels, recouvrement, ressemblance, retirerPlaceholdersSeuls,
} from './exercise-import-verite-texte';
import type { QuestionSource, VeritePdf } from './exercise-import-verite-lecture';

/* ─────────── Formes du modèle (structurelles : `ImportedQuestion` les satisfait) ─────────── */

export type ItemModele = { lettre: string; enonce: string; is_correct: boolean; justification?: string; images?: unknown[] };
export type QuestionModele = {
  client_id?: string;
  numero_source?: string | null;
  enonce: string;
  format: string;
  items?: ItemModele[];
  source_pages?: number[];
  warnings?: string[];
  images?: unknown[];
  correction_generale?: string;
  reponse_attendue?: string;
};

/* ─────────── Rapport ─────────── */

export type Gravite = 'bloquant' | 'a_relire' | 'info';

export type CodeEcart =
  | 'document_illisible' | 'document_non_colore'
  | 'question_manquante' | 'question_sans_source' | 'appariement_douteux'
  | 'proposition_texte_divergent' | 'propositions_tronquees' | 'propositions_en_trop' | 'lettre_divergente'
  | 'corrige_divergent' | 'corrige_absent_document'
  | 'vignette_absente' | 'note_du_modele'
  | 'image_sans_question' | 'image_sans_document'
  // Écarts produits par l'orchestration (`exercise-import-pipeline.ts`), après la confrontation.
  | 'pages_non_importees' | 'images_non_extraites' | 'image_non_rattachee' | 'image_sans_question_importee' | 'image_douteuse';

export type Ecart = {
  gravite: Gravite;
  code: CodeEcart;
  /** Page du document (numérotation du document), `null` si inconnue. */
  page: number | null;
  /** Numéro tel qu'imprimé dans le document, `null` si la question n'y est pas. */
  numeroImprime: string | null;
  /** `client_id` de la question du modèle concernée, `null` si aucune. */
  question_client_id: string | null;
  /** Libellé court de la question, pour retrouver l'écart. */
  libelle: string;
  /** Nature de l'écart, en un mot ou deux. */
  nature: string;
  valeurDocument: string | null;
  valeurModele: string | null;
  /** Phrase complète, lisible par un non-technicien. */
  message: string;
};

export type TypeReparation = 'corrige' | 'proposition_completee' | 'vignette_prefixee' | 'placeholder_retire';

export type Reparation = {
  type: TypeReparation;
  question_client_id: string | null;
  page: number | null;
  numeroImprime: string | null;
  libelle: string;
  detail: string;
};

export type Appariement = {
  question_client_id: string | null;
  indexModele: number;
  indexDocument: number;
  score: number;
  numeroImprime: string;
  page: number;
  sur: boolean;
};

export type RapportFiabilite = {
  statutDocument: VeritePdf['statut'];
  compteurs: {
    questionsDocument: number;
    questionsModele: number;
    appariees: number;
    appariementsDouteux: number;
    manquantes: number;
    sansSource: number;
    propositionsComparees: number;
    propositionsDivergentes: number;
    propositionsTronquees: number;
    propositionsEnTrop: number;
    corrigesDivergents: number;
    corrigesAbsentsDocument: number;
    vignettesManquantes: number;
    notesDuModele: number;
    imagesSansQuestion: number;
    imagesSansDocument: number;
    reparations: Record<TypeReparation, number>;
    bloquants: number;
    aRelire: number;
  };
  ecarts: Ecart[];
  reparations: Reparation[];
  appariements: Appariement[];
  /** Synthèse en français, une ligne par point notable. */
  avertissements: string[];
};

export type OptionsConfrontation = {
  /** Appliquer les réparations (défaut : oui). Sinon, tout est seulement rapporté. */
  reparer?: boolean;
  /** Score d'appariement en deçà duquel on ne répare pas (défaut 0,45). */
  seuilSur?: number;
  /** Ressemblance de texte en deçà de laquelle une proposition diverge (défaut 0,8). */
  seuilTexte?: number;
};

export type Confrontation = {
  /** Propositions dont `is_correct` a été aligné sur la couleur. */
  corriges: number;
  /** Questions sur une page illustrée, rendues sans document. */
  documentsAttendus: number;
  /** Propositions ajoutées depuis le texte du document. */
  completes: number;
  vignettesAjoutees: number;
  placeholdersRetires: number;
  avertissements: string[];
  rapport: RapportFiabilite;
};

/* ─────────── Alignement ─────────── */

const SEUIL_APPARIEMENT = 0.35;
const SEUIL_SUR = 0.45;

const lettreNormale = (brute: string): string | null => {
  const net = String(brute ?? '').toUpperCase().replace(/[^A-K0-9]/g, '');
  if (net.length === 1 && /[A-K]/.test(net)) return net;
  const n = Number(net);
  return Number.isInteger(n) && n >= 1 && n <= 11 ? 'ABCDEFGHIJK'[n - 1] : null;
};

const numeroComparable = (n: string | null | undefined): string => {
  const chiffres = String(n ?? '').match(/\d+/g);
  return chiffres ? chiffres.map((c) => String(Number(c))).join('-') : '';
};

/**
 * Aligne les questions du modèle sur celles du document (Needleman-Wunsch :
 * les deux suites gardent l'ordre de lecture). Score d'une paire : 45 % le
 * libellé de la question, 55 % les propositions position par position, plus
 * un bonus quand le numéro imprimé concorde.
 */
export function aligner(modele: QuestionModele[], source: QuestionSource[]): Array<{ im: number; is: number; score: number }> {
  const n = modele.length; const m = source.length;
  if (!n || !m) return [];
  const jq = modele.map((q) => jetons(derniereLigne(q.enonce)));
  const ji = modele.map((q) => (q.items ?? []).map((i) => jetons(i.enonce)));
  const nm = modele.map((q) => numeroComparable(q.numero_source));
  const sq = source.map((q) => jetons(q.enonce));
  const si = source.map((q) => q.items.map((i) => jetons(i.texte)));
  const ns = source.map((q) => (q.dossier !== null ? `${q.dossier}-${q.numero}` : String(q.numero)));
  const score = (i: number, j: number) => {
    const q = recouvrement(jq[i], sq[j]);
    const k = Math.min(ji[i].length, si[j].length);
    let s = 0; let accord = 0; let corrige = false;
    for (let x = 0; x < k; x++) {
      s += recouvrement(ji[i][x], si[j][x]);
      if (source[j].items[x].juste) corrige = true;
      if (Boolean(modele[i].items?.[x]?.is_correct) === source[j].items[x].juste) accord++;
    }
    const items = k ? s / k : (ji[i].length === 0 && si[j].length === 0 ? q : 0);
    const bonus = nm[i] && (nm[i] === ns[j] || nm[i].endsWith(`-${ns[j]}`)) ? 0.1 : 0;
    // Le corrigé n'est qu'un départage : deux « Que faites-vous ? » aux mêmes
    // propositions ne se distinguent que par lui. Trop faible pour masquer un
    // vrai désaccord de texte, assez pour ne pas croiser deux jumelles.
    const departage = corrige && k ? 0.05 * (accord / k) : 0;
    return 0.45 * q + 0.55 * items + bonus + departage;
  };
  const GAP = -0.35;
  const M: Float64Array[] = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const P: Uint8Array[] = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) { M[i][0] = M[i - 1][0] + GAP; P[i][0] = 1; }
  for (let j = 1; j <= m; j++) { M[0][j] = M[0][j - 1] + GAP; P[0][j] = 2; }
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const d = M[i - 1][j - 1] + score(i - 1, j - 1);
    const h = M[i - 1][j] + GAP; const v = M[i][j - 1] + GAP;
    if (d >= h && d >= v) { M[i][j] = d; P[i][j] = 0; } else if (h >= v) { M[i][j] = h; P[i][j] = 1; } else { M[i][j] = v; P[i][j] = 2; }
  }
  const paires: Array<{ im: number; is: number; score: number }> = [];
  let i = n; let j = m;
  while (i > 0 || j > 0) {
    const p = i > 0 && j > 0 ? P[i][j] : (i > 0 ? 1 : 2);
    if (p === 0) { const s = score(i - 1, j - 1); if (s >= SEUIL_APPARIEMENT) paires.push({ im: i - 1, is: j - 1, score: s }); i--; j--; }
    else if (p === 1) i--; else j--;
  }
  return paires.reverse();
}

/* ─────────── Confrontation ─────────── */

const ref = (qs: QuestionSource) => `${qs.numeroImprime} (p.${qs.page})`;
const lettresJustes = (items: Array<{ lettre: string; juste?: boolean; is_correct?: boolean }>) =>
  items.filter((i) => i.juste ?? i.is_correct).map((i) => i.lettre).join(', ') || 'aucune';

/**
 * Confronte les questions du modèle au document, répare ce qui peut l'être
 * et rend le rapport. Modifie `questions` sur place (réparations, `warnings`).
 * Ne lève jamais.
 */
export function confronterALaSource(questions: QuestionModele[], verite: VeritePdf, options: OptionsConfrontation = {}): Confrontation {
  const reparer = options.reparer ?? true;
  const seuilSur = options.seuilSur ?? SEUIL_SUR;
  const seuilTexte = options.seuilTexte ?? 0.8;
  const ecarts: Ecart[] = [];
  const reparations: Reparation[] = [];
  const appariements: Appariement[] = [];
  const avertissements: string[] = [];
  const c: RapportFiabilite['compteurs'] = {
    questionsDocument: verite.questions.length, questionsModele: questions.length,
    appariees: 0, appariementsDouteux: 0, manquantes: 0, sansSource: 0,
    propositionsComparees: 0, propositionsDivergentes: 0, propositionsTronquees: 0, propositionsEnTrop: 0,
    corrigesDivergents: 0, corrigesAbsentsDocument: 0, vignettesManquantes: 0, notesDuModele: 0,
    imagesSansQuestion: 0, imagesSansDocument: 0,
    reparations: { corrige: 0, proposition_completee: 0, vignette_prefixee: 0, placeholder_retire: 0 },
    bloquants: 0, aRelire: 0,
  };
  const idDe = (q: QuestionModele) => q.client_id ?? null;
  const signaler = (q: QuestionModele | null, message: string) => { if (q) q.warnings = [...(q.warnings ?? []), message]; };
  const ecart = (e: Omit<Ecart, 'libelle'> & { libelle?: string }, q?: QuestionModele | null, qs?: QuestionSource | null) => {
    const libelle = e.libelle ?? libelleCourt(qs ? qs.enonce : derniereLigne(q?.enonce ?? ''));
    ecarts.push({ ...e, libelle });
    if (e.gravite === 'bloquant') c.bloquants++; else if (e.gravite === 'a_relire') c.aRelire++;
  };
  const reparation = (r: Reparation) => { reparations.push(r); c.reparations[r.type]++; };

  // ── Document illisible ou en erreur : on ne peut que relever les notes du modèle ──
  if (verite.statut === 'erreur' || verite.statut === 'illisible') {
    ecart({ gravite: 'a_relire', code: 'document_illisible', page: null, numeroImprime: null, question_client_id: null, nature: 'document non lu', valeurDocument: null, valeurModele: null, libelle: '—',
      message: verite.raison ? `Le document n’a pas pu être confronté : ${verite.raison}` : 'Le document n’a pas pu être confronté au rendu du modèle.' });
  } else if (verite.statut === 'non-colore') {
    ecart({ gravite: 'a_relire', code: 'document_non_colore', page: null, numeroImprime: null, question_client_id: null, nature: 'corrigé non vérifiable', valeurDocument: null, valeurModele: null, libelle: '—',
      message: 'Le document ne porte pas de corrigé par la couleur : les bonnes réponses viennent de la lecture du modèle et doivent être relues.' });
  }

  // ── Notes du modèle, placeholders ──
  for (const q of questions) {
    if (reparer) {
      const { enonce, retires } = retirerPlaceholdersSeuls(q.enonce);
      if (retires.length) {
        q.enonce = enonce;
        reparation({ type: 'placeholder_retire', question_client_id: idDe(q), page: q.source_pages?.[0] ?? null, numeroImprime: q.numero_source ?? null, libelle: libelleCourt(derniereLigne(q.enonce)), detail: `Ligne(s) retirée(s) de l’énoncé : ${retires.map((r) => `« ${libelleCourt(r, 50)} »`).join(', ')}.` });
        signaler(q, 'Une note du modèle tenant lieu de contexte a été retirée de l’énoncé ; vérifiez que la vignette est bien présente.');
      }
    }
    const champs: Array<[string, string]> = [
      ['énoncé', q.enonce],
      ...(q.items ?? []).flatMap((i): Array<[string, string]> => [[`proposition ${i.lettre}`, i.enonce], [`justification ${i.lettre}`, i.justification ?? '']]),
      ['corrigé général', q.correction_generale ?? ''],
      ['réponse attendue', q.reponse_attendue ?? ''],
    ];
    for (const [ou, texte] of champs) {
      const note = noteDuModele(texte);
      if (!note) continue;
      c.notesDuModele++;
      ecart({ gravite: 'bloquant', code: 'note_du_modele', page: q.source_pages?.[0] ?? null, numeroImprime: q.numero_source ?? null, question_client_id: idDe(q), nature: `note du modèle (${ou})`, valeurDocument: null, valeurModele: note,
        message: `Le modèle a laissé une note à la place du contenu dans ${ou} : « ${note} ». À corriger avant publication.` }, q);
      signaler(q, `Note du modèle à la place du contenu (${ou}) : « ${libelleCourt(note, 60)} ».`);
      break;
    }
  }

  // ── Alignement et comparaison ──
  const modeleApparie = new Set<number>(); const documentApparie = new Set<number>();
  const vignetteDe = (qs: QuestionSource) => (qs.sujetIndex !== null ? verite.sujets[qs.sujetIndex]?.vignette ?? '' : '');
  const paires = verite.questions.length ? aligner(questions, verite.questions) : [];
  // Pour (b) : les questions du modèle déjà propres, par sujet du document.
  const propresParSujet = new Map<number, QuestionModele[]>();
  for (const { im, is, score } of paires) {
    const qs = verite.questions[is];
    if (qs.sujetIndex === null || score < seuilSur) continue;
    const vig = vignetteDe(qs);
    if (vig.length < 40 || couvertureVignette(vig, questions[im].enonce) < 0.8 || noteDuModele(questions[im].enonce)) continue;
    const l = propresParSujet.get(qs.sujetIndex) ?? []; l.push(questions[im]); propresParSujet.set(qs.sujetIndex, l);
  }

  for (const { im, is, score } of paires) {
    const q = questions[im]; const qs = verite.questions[is];
    modeleApparie.add(im); documentApparie.add(is);
    c.appariees++;
    const sur = score >= seuilSur;
    appariements.push({ question_client_id: idDe(q), indexModele: im, indexDocument: is, score: Math.round(score * 100) / 100, numeroImprime: qs.numeroImprime, page: qs.page, sur });
    if (!sur) {
      c.appariementsDouteux++;
      ecart({ gravite: 'a_relire', code: 'appariement_douteux', page: qs.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: 'appariement incertain', valeurDocument: libelleCourt(qs.enonce), valeurModele: libelleCourt(derniereLigne(q.enonce)),
        message: `La question ${ref(qs)} du document ressemble peu à celle du modèle (score ${score.toFixed(2)}) : rapprochement incertain, aucune réparation appliquée.` }, q, qs);
      continue;
    }

    // ── Propositions : réalignement par lettre, puis par texte ──
    const items = q.items ?? [];
    const corrigeDocument = verite.statut === 'colore' && qs.items.some((i) => i.juste);
    if (verite.statut === 'colore' && qs.items.length > 0 && !corrigeDocument) {
      c.corrigesAbsentsDocument++;
      ecart({ gravite: 'a_relire', code: 'corrige_absent_document', page: qs.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: 'corrigé absent du document', valeurDocument: 'aucune proposition en vert', valeurModele: lettresJustes(items),
        message: `Question ${ref(qs)} : aucune proposition n’est en vert dans le document, son corrigé n’a pas pu être vérifié (le modèle dit : ${lettresJustes(items)}).` }, q, qs);
    }
    const parLettre = new Map<string, number>();
    items.forEach((it, k) => { const l = lettreNormale(it.lettre); if (l && !parLettre.has(l)) parLettre.set(l, k); });
    const apparies: Array<[number, number]> = []; // [index modèle, index document]
    const modeleLibre = new Set(items.map((_, k) => k)); const documentLibre = new Set(qs.items.map((_, k) => k));
    qs.items.forEach((ds, kd) => {
      const km = parLettre.get(ds.lettre);
      if (km !== undefined && modeleLibre.has(km) && ressemblance(items[km].enonce, ds.texte) >= 0.5) { apparies.push([km, kd]); modeleLibre.delete(km); documentLibre.delete(kd); }
    });
    for (const kd of [...documentLibre]) {
      let meilleur = -1; let meilleurScore = 0;
      for (const km of modeleLibre) { const s = ressemblance(items[km].enonce, qs.items[kd].texte); if (s > meilleurScore) { meilleurScore = s; meilleur = km; } }
      if (meilleur >= 0 && meilleurScore >= seuilTexte) { apparies.push([meilleur, kd]); modeleLibre.delete(meilleur); documentLibre.delete(kd); }
    }
    // Sans lettre ni texte concordants, on retombe sur la position quand les comptes sont égaux.
    if (items.length === qs.items.length && modeleLibre.size === items.length) {
      for (let k = 0; k < items.length; k++) { apparies.push([k, k]); modeleLibre.delete(k); documentLibre.delete(k); }
    }
    apparies.sort((a, b) => a[1] - b[1]);

    for (const [km, kd] of apparies) {
      const it = items[km]; const ds = qs.items[kd];
      c.propositionsComparees++;
      const s = ressemblance(it.enonce, ds.texte);
      if (s < seuilTexte) {
        c.propositionsDivergentes++;
        ecart({ gravite: 'a_relire', code: 'proposition_texte_divergent', page: ds.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: `texte de la proposition ${ds.lettre}`, valeurDocument: nettoyerLigaturesPourAffichage(ds.texte), valeurModele: it.enonce,
          message: `Question ${ref(qs)}, proposition ${ds.lettre} : le texte du modèle s’écarte du document (ressemblance ${s.toFixed(2)}).` }, q, qs);
      }
      if (lettreNormale(it.lettre) !== ds.lettre) {
        ecart({ gravite: 'info', code: 'lettre_divergente', page: ds.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: 'lettre', valeurDocument: ds.lettre, valeurModele: it.lettre,
          message: `Question ${ref(qs)} : la proposition « ${libelleCourt(ds.texte, 40)} » est lettrée ${ds.lettre} dans le document et ${it.lettre} par le modèle.` }, q, qs);
      }
      if (corrigeDocument && it.is_correct !== ds.juste) {
        c.corrigesDivergents++;
        if (reparer) {
          it.is_correct = ds.juste;
          reparation({ type: 'corrige', question_client_id: idDe(q), page: ds.page, numeroImprime: qs.numeroImprime, libelle: libelleCourt(qs.enonce), detail: `Proposition ${ds.lettre} « ${libelleCourt(ds.texte, 50)} » : ${ds.juste ? 'fausse' : 'juste'} selon le modèle → ${ds.juste ? 'JUSTE' : 'fausse'} selon la couleur du document (${Math.round(ds.partVert * 100)} % de vert).` });
          ecart({ gravite: 'info', code: 'corrige_divergent', page: ds.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: `corrigé de la proposition ${ds.lettre}`, valeurDocument: ds.juste ? 'juste' : 'fausse', valeurModele: ds.juste ? 'fausse' : 'juste',
            message: `Question ${ref(qs)}, proposition ${ds.lettre} : le modèle la disait ${ds.juste ? 'fausse' : 'juste'}, le document la colore ${ds.juste ? 'en vert (juste)' : 'en noir (fausse)'} ; corrigé aligné sur le document.` }, q, qs);
        } else {
          ecart({ gravite: 'bloquant', code: 'corrige_divergent', page: ds.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: `corrigé de la proposition ${ds.lettre}`, valeurDocument: ds.juste ? 'juste' : 'fausse', valeurModele: it.is_correct ? 'juste' : 'fausse',
            message: `Question ${ref(qs)}, proposition ${ds.lettre} : corrigé du modèle (${it.is_correct ? 'juste' : 'fausse'}) contraire à la couleur du document (${ds.juste ? 'juste' : 'fausse'}).` }, q, qs);
        }
      }
    }
    if (documentLibre.size) {
      c.propositionsTronquees++;
      const manquantes = [...documentLibre].sort((a, b) => a - b).map((kd) => qs.items[kd]);
      const peutCompleter = reparer && corrigeDocument;
      if (peutCompleter) {
        for (const ds of manquantes) {
          items.push({ lettre: ds.lettre, enonce: nettoyerLigaturesPourAffichage(ds.texte), is_correct: ds.juste, justification: '', images: [] });
          reparation({ type: 'proposition_completee', question_client_id: idDe(q), page: ds.page, numeroImprime: qs.numeroImprime, libelle: libelleCourt(qs.enonce), detail: `Proposition ${ds.lettre} ajoutée depuis le document : « ${libelleCourt(ds.texte, 60)} » (${ds.juste ? 'juste' : 'fausse'} par la couleur)${porteArtefactsResiduels(ds.texte) ? ' — texte à relire (ligatures)' : ''}.` });
        }
        items.sort((a, b) => (lettreNormale(a.lettre) ?? 'Z').localeCompare(lettreNormale(b.lettre) ?? 'Z'));
        q.items = items;
        signaler(q, `${manquantes.length} proposition(s) manquaient par rapport au document et ont été complétées depuis son texte (${manquantes.map((d) => d.lettre).join(', ')}) : relisez-les.`);
      } else {
        signaler(q, `Le document compte ${qs.items.length} propositions, le modèle n’en a rendu que ${items.length} : liste tronquée (${manquantes.map((d) => d.lettre).join(', ')} manquent).`);
      }
      ecart({ gravite: peutCompleter ? 'a_relire' : 'bloquant', code: 'propositions_tronquees', page: qs.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: 'propositions manquantes', valeurDocument: `${qs.items.length} propositions (${manquantes.map((d) => `${d.lettre}) ${libelleCourt(nettoyerLigaturesPourAffichage(d.texte), 40)}`).join(' ; ')})`, valeurModele: `${items.length - (peutCompleter ? manquantes.length : 0)} propositions`,
        message: `Question ${ref(qs)} : le document porte ${qs.items.length} propositions, le modèle en a rendu ${items.length - (peutCompleter ? manquantes.length : 0)} (${manquantes.map((d) => d.lettre).join(', ')} manquaient)${peutCompleter ? ' ; elles ont été complétées depuis le texte du document, à relire.' : '.'}` }, q, qs);
    }
    if (modeleLibre.size && qs.items.length) {
      c.propositionsEnTrop++;
      const enTrop = [...modeleLibre].map((km) => items[km]);
      ecart({ gravite: 'a_relire', code: 'propositions_en_trop', page: qs.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: 'propositions sans équivalent', valeurDocument: `${qs.items.length} propositions`, valeurModele: enTrop.map((i) => `${i.lettre}) ${libelleCourt(i.enonce, 40)}`).join(' ; '),
        message: `Question ${ref(qs)} : ${enTrop.length} proposition(s) du modèle n’ont pas d’équivalent dans le document (${enTrop.map((i) => i.lettre).join(', ')}).` }, q, qs);
      signaler(q, `${enTrop.length} proposition(s) n’ont pas d’équivalent dans le document : ${enTrop.map((i) => i.lettre).join(', ')}.`);
    }

    // ── Vignette ──
    const blocs: Array<[string, string]> = [];
    const vig = vignetteDe(qs); if (vig.trim().length >= 40) blocs.push(['vignette du sujet', vig]);
    if (qs.complement && qs.complement.trim().length >= 40) blocs.push(['nouveaux éléments', qs.complement]);
    for (const [quoi, bloc] of blocs) {
      if (couvertureVignette(bloc, q.enonce) >= 0.8) continue;
      c.vignettesManquantes++;
      let ajoute: string | null = null; let origine = '';
      if (reparer) {
        if (quoi === 'vignette du sujet' && qs.sujetIndex !== null) {
          for (const voisine of propresParSujet.get(qs.sujetIndex) ?? []) {
            const lignes = String(voisine.enonce).split('\n').map((l) => l.trim()).filter(Boolean);
            const prefixe = lignes.slice(0, -1).join('\n');
            if (prefixe && couvertureVignette(bloc, prefixe) >= 0.8 && !noteDuModele(prefixe)) { ajoute = prefixe; origine = 'reprise d’une question voisine du même sujet'; break; }
          }
        }
        if (!ajoute) { ajoute = nettoyerLigaturesPourAffichage(bloc); origine = porteArtefactsResiduels(ajoute) ? 'texte du document, ligatures nettoyées — à relire' : 'texte du document'; }
        q.enonce = `${ajoute}\n\n${String(q.enonce).trim()}`;
        reparation({ type: 'vignette_prefixee', question_client_id: idDe(q), page: qs.page, numeroImprime: qs.numeroImprime, libelle: libelleCourt(qs.enonce), detail: `${quoi[0].toUpperCase()}${quoi.slice(1)} ajoutée en tête de l’énoncé (${origine}) : « ${libelleCourt(ajoute, 80)} ».` });
        signaler(q, `La ${quoi} du document manquait dans l’énoncé : elle a été ajoutée (${origine}).`);
      } else {
        signaler(q, `La ${quoi} du document manque dans l’énoncé.`);
      }
      ecart({ gravite: ajoute ? 'a_relire' : 'bloquant', code: 'vignette_absente', page: qs.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: quoi, valeurDocument: libelleCourt(nettoyerLigaturesPourAffichage(bloc), 120), valeurModele: libelleCourt(q.enonce, 120),
        message: `Question ${ref(qs)} : l’énoncé du modèle ne reprend pas la ${quoi} du document${ajoute ? ` ; elle a été ajoutée (${origine}).` : '.'}` }, q, qs);
    }
  }

  // ── Questions non appariées ──
  verite.questions.forEach((qs, is) => {
    if (documentApparie.has(is)) return;
    c.manquantes++;
    ecart({ gravite: 'bloquant', code: 'question_manquante', page: qs.page, numeroImprime: qs.numeroImprime, question_client_id: null, nature: 'question absente du rendu', valeurDocument: `${qs.items.length} proposition(s), bonnes réponses ${lettresJustes(qs.items)}`, valeurModele: null,
      message: `La question ${ref(qs)} du document « ${libelleCourt(nettoyerLigaturesPourAffichage(qs.enonce))} » n’a pas d’équivalent dans le rendu du modèle : elle manque.` }, null, qs);
  });
  questions.forEach((q, im) => {
    if (modeleApparie.has(im) || !verite.questions.length) return;
    c.sansSource++;
    ecart({ gravite: 'a_relire', code: 'question_sans_source', page: q.source_pages?.[0] ?? null, numeroImprime: q.numero_source ?? null, question_client_id: idDe(q), nature: 'question sans source', valeurDocument: null, valeurModele: libelleCourt(derniereLigne(q.enonce)),
      message: `La question « ${libelleCourt(derniereLigne(q.enonce))} » du modèle ne correspond à aucune question reconnue dans le document (page ${q.source_pages?.[0] ?? '?'}).` }, q);
    signaler(q, 'Cette question ne correspond à aucune question reconnue dans le document : vérifiez qu’elle existe bien dans la source.');
  });

  // ── Images ──
  const modeleParDocument = new Map<number, QuestionModele>();
  for (const { im, is } of paires) modeleParDocument.set(is, questions[im]);
  const aUneImage = (q: QuestionModele) => (q.images ?? []).length > 0 || (q.items ?? []).some((i) => (i.images ?? []).length > 0);
  const dejaSignalees = new Set<QuestionModele>();
  let documentsAttendus = 0;
  for (const im of verite.images) {
    if (im.questionIndex === null) {
      c.imagesSansQuestion++;
      ecart({ gravite: 'info', code: 'image_sans_question', page: im.page, numeroImprime: null, question_client_id: null, nature: 'image sans question', valeurDocument: `image ${im.l}×${im.h}`, valeurModele: null, libelle: '—',
        message: `La page ${im.page} du document porte une image (${im.l}×${im.h}) qui n’est dans la zone d’aucune question reconnue.` });
      continue;
    }
    const qs = verite.questions[im.questionIndex];
    const q = modeleParDocument.get(im.questionIndex);
    if (!q || aUneImage(q) || dejaSignalees.has(q)) continue;
    dejaSignalees.add(q);
    documentsAttendus++; c.imagesSansDocument++;
    ecart({ gravite: 'a_relire', code: 'image_sans_document', page: im.page, numeroImprime: qs.numeroImprime, question_client_id: idDe(q), nature: 'document manquant', valeurDocument: `image ${im.l}×${im.h} p.${im.page}`, valeurModele: 'aucune image',
      message: `Question ${ref(qs)} : le document y place une image (radiographie, courbe, ECG…) et le rendu du modèle n’en rattache aucune.` }, q, qs);
    signaler(q, 'Une image figure sur la page de cet exercice dans la source : vérifiez qu’aucun document (radiographie, ECG, courbe…) ne manque.');
  }
  // Repli : question posée sur une page dont une image n'a pu être rattachée à
  // aucune question par sa position (une image rattachée à une question ne
  // rend pas suspectes les autres questions de la page).
  const pagesSansPorteuse = new Set(verite.images.filter((i) => i.questionIndex === null).map((i) => i.page));
  for (const q of questions) {
    if (dejaSignalees.has(q) || aUneImage(q)) continue;
    const pages = (q.source_pages ?? []) as number[];
    if (!pages.some((p) => pagesSansPorteuse.has(p))) continue;
    dejaSignalees.add(q); documentsAttendus++; c.imagesSansDocument++;
    ecart({ gravite: 'a_relire', code: 'image_sans_document', page: pages[0] ?? null, numeroImprime: q.numero_source ?? null, question_client_id: idDe(q), nature: 'document manquant', valeurDocument: 'page illustrée', valeurModele: 'aucune image',
      message: `La question « ${libelleCourt(derniereLigne(q.enonce))} » est posée sur une page illustrée du document (p.${pages.join(', ')}) et n’a aucun document rattaché.` }, q);
    signaler(q, 'Une image figure sur la page de cet exercice dans la source : vérifiez qu’aucun document (radiographie, ECG, courbe…) ne manque.');
  }

  // ── Synthèse ──
  const corriges = c.reparations.corrige;
  const completes = c.reparations.proposition_completee;
  const vignettesAjoutees = c.reparations.vignette_prefixee;
  const placeholdersRetires = c.reparations.placeholder_retire;
  avertissements.push(...verite.avertissements);
  if (verite.questions.length) {
    avertissements.push(`Confrontation au document : ${c.questionsDocument} question(s) reconnues dans le document, ${c.questionsModele} rendues par le modèle, ${c.appariees} appariées${c.appariementsDouteux ? ` (${c.appariementsDouteux} de façon incertaine)` : ''}.`);
  }
  if (c.manquantes) avertissements.push(`${c.manquantes} question(s) du document manquent dans le rendu du modèle : ${ecarts.filter((e) => e.code === 'question_manquante').slice(0, 6).map((e) => `${e.numeroImprime} p.${e.page}`).join(', ')}${c.manquantes > 6 ? '…' : ''}.`);
  if (c.sansSource) avertissements.push(`${c.sansSource} question(s) du modèle ne correspondent à aucune question du document.`);
  if (corriges) avertissements.push(`${corriges} proposition(s) remises d’aplomb d’après la couleur du document (le corrigé du support prime sur la lecture du modèle).`);
  else if (verite.statut === 'colore' && c.propositionsComparees) avertissements.push(`Corrigé vérifié sur la couleur du document : aucun écart sur ${c.propositionsComparees} propositions comparées.`);
  if (c.corrigesDivergents && !reparer) avertissements.push(`${c.corrigesDivergents} proposition(s) ont un corrigé contraire à la couleur du document.`);
  if (completes) avertissements.push(`${completes} proposition(s) manquantes complétées depuis le texte du document (à relire).`);
  if (c.propositionsTronquees > 0 && !completes) avertissements.push(`${c.propositionsTronquees} question(s) ont moins de propositions que le document (liste tronquée).`);
  if (c.propositionsDivergentes) avertissements.push(`${c.propositionsDivergentes} proposition(s) ont un texte qui s’écarte du document (à relire).`);
  if (c.propositionsEnTrop) avertissements.push(`${c.propositionsEnTrop} question(s) ont des propositions sans équivalent dans le document.`);
  if (vignettesAjoutees) avertissements.push(`${vignettesAjoutees} énoncé(s) complétés avec la vignette du document qui leur manquait (à relire).`);
  else if (c.vignettesManquantes) avertissements.push(`${c.vignettesManquantes} énoncé(s) ne reprennent pas la vignette du document.`);
  if (c.notesDuModele) avertissements.push(`${c.notesDuModele} exercice(s) portent une note du modèle à la place du contenu : à corriger avant publication.`);
  if (placeholdersRetires) avertissements.push(`${placeholdersRetires} note(s) d’extraction retirées des énoncés.`);
  if (documentsAttendus) avertissements.push(`${documentsAttendus} exercice(s) situé(s) sur une page illustrée n’ont aucun document rattaché.`);
  if (c.imagesSansQuestion) avertissements.push(`${c.imagesSansQuestion} image(s) du document ne sont rattachées à aucune question reconnue.`);
  if (c.bloquants) avertissements.push(`${c.bloquants} écart(s) bloquant(s) et ${c.aRelire} à relire : voir le rapport de fiabilité.`);

  const rapport: RapportFiabilite = { statutDocument: verite.statut, compteurs: c, ecarts, reparations, appariements, avertissements };
  return { corriges, documentsAttendus, completes, vignettesAjoutees, placeholdersRetires, avertissements, rapport };
}

/* ─────────── Dédoublonnage de secours ─────────── */

/**
 * Dédoublonnage par le TEXTE. Le plan de lots partage une page entre deux
 * lots ; quand les deux rendent la même question sous des numéros de source
 * différents (« Sujet 1 - Q1 » ici, « Session 3 – Sujet 1 – Q1 » là), la
 * fusion par numéro passe à côté. Sur l'import Pédiatrie, douze questions se
 * retrouvaient en double, dont quatre avec un énoncé amputé de sa vignette.
 */
export function dedoublonnerParTexte<T extends QuestionModele>(questions: T[]): { questions: T[]; retirees: number } {
  const garder: T[] = [];
  let retirees = 0;
  for (const q of questions) {
    const libelle = derniereLigne(q.enonce);
    const propositions = (q.items ?? []).map((i) => i.enonce).join(' | ');
    // Un doublon de recouvrement est proche dans l'ordre : on ne compare qu'au
    // voisinage, sinon deux questions légitimement identiques de dossiers
    // différents seraient fusionnées.
    const voisins = garder.slice(-12);
    const jumeau = voisins.find((g) => ressemblance(libelle, derniereLigne(g.enonce)) >= 0.85
      && ressemblance(propositions, (g.items ?? []).map((i) => i.enonce).join(' | ')) >= 0.85);
    if (!jumeau) { garder.push(q); continue; }
    retirees++;
    // On conserve l'exemplaire le plus complet (celui qui a gardé sa vignette).
    if (String(q.enonce).length > String(jumeau.enonce).length) garder[garder.indexOf(jumeau)] = q;
  }
  return { questions: garder, retirees };
}
