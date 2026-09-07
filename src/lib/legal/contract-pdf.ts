import 'server-only';

/**
 * Documents contractuels PRÉ-REMPLIS envoyés à l’élève après paiement.
 *
 * POURQUOI CE MODULE. Les Conditions Particulières, les CGS et les CGU étaient
 * jointes au mail d’achat sous leur forme de MODÈLE : les blancs (« NOM :
 * _______ », « Le [à compléter], », « [Nom prénom] ») partaient vides, et les
 * deux notes de rédaction entre crochets que le cabinet avait laissées dans les
 * Conditions Particulières arrivaient telles quelles chez l’étudiant. La page
 * /conditions-particulieres promet pourtant que « le présent document est généré
 * et renseigné automatiquement au moment de la souscription ».
 *
 * CE QUE FAIT CE MODULE, avec `pdf-lib`, et de deux façons différentes :
 *
 *   - CGS et CGU : on part du PDF de référence (`public/legal/*.pdf`), qui reste
 *     la source du texte contractuel — aucune clause n’est réécrite — et on ne
 *     remplit que ses blancs : la date du « Le [à compléter], », le nom du
 *     signataire, la signature manuscrite apposée sur le trait, le cachet de la
 *     société. Les CGU n’avaient aucun bloc de signature : on en compose un sur
 *     leur dernière page, restée vierge.
 *
 *   - Conditions Particulières : la page est COMPOSÉE intégralement (voir le
 *     commentaire de `buildConditionsParticulieres`). Recouvrir les notes de
 *     rédaction du cabinet d’un rectangle blanc les aurait laissées dans le
 *     calque texte, où un copier-coller les aurait retrouvées.
 *
 * COORDONNÉES. Les positions utilisées pour les CGS ont été relevées dans le PDF
 * lui-même (extraction des `transform` de chaque item de texte). Elles sont donc
 * liées à la version en vigueur du document — 14 juin 2026. Si un PDF est
 * remplacé, relire les coordonnées avant de faire confiance au rendu : rien ne
 * casse bruyamment, le texte se poserait simplement au mauvais endroit.
 *
 * ROBUSTESSE. `buildContractAttachments()` ne lève jamais : si un template est
 * introuvable ou si le rendu échoue, on retombe sur les PDF statiques (le
 * comportement d’avant), parce qu’un mail d’achat sans pièces contractuelles
 * serait pire qu’un mail avec des documents non renseignés.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import { siteUrl, type EmailAttachment } from '@/lib/email/send';
import type { FormuleId } from '@/lib/stripe';

/* ------------------------------------------------------------------ types */

export type ContractClient = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  /** Adresse du domicile déjà mise en forme sur une ligne (billing Stripe). */
  address?: string | null;
};

export type ContractOffer = {
  formuleId: FormuleId;
  /** Libellé affiché de l’offre — « Formule Intensive », « Programme Approfondi + »… */
  formuleLabel: string;
  specialty?: string | null;
  /** 'interne' | 'externe' | libellé long | vide. */
  voie?: string | null;
  /** Périmètre de l’Approfondi (« 13 spécialités »…), quand il existe. */
  coverageLabel?: string | null;
  amountEuros: number;
  installments: number;
};

export type ContractInput = {
  client: ContractClient;
  offer: ContractOffer;
  /** Date d’effet du Contrat = date de l’encaissement. */
  effectiveAt: Date;
  /** Signature manuscrite recueillie avant le paiement (PNG). */
  signaturePng?: Buffer | null;
  /** Horodatage serveur de la signature (ISO), pour la mention de preuve. */
  signedAt?: string | null;
};

/* ------------------------------------------------------------- typographie */

/** Jeu de caractères représentable en WinAnsi, le seul encodage des polices
 *  standard de pdf-lib. Tout ce qui en sort ferait lever `drawText` au moment
 *  de l’envoi du mail : on remplace en amont plutôt que de risquer l’exception. */
const WINANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

/** Rend une chaîne sûre pour les polices standard : espaces insécables ramenés
 *  à l’espace ordinaire, caractères hors WinAnsi remplacés. */
function winAnsi(raw: string): string {
  let out = '';
  for (const ch of raw.replace(/[   ]/g, ' ')) {
    const cp = ch.codePointAt(0) ?? 32;
    if ((cp >= 32 && cp <= 126) || (cp >= 160 && cp <= 255) || WINANSI_EXTRA.has(cp)) {
      out += ch;
    } else if (cp === 0x2212) {
      out += '-';
    }
  }
  return out;
}

const WHITE = rgb(1, 1, 1);
const INK = rgb(0.09, 0.11, 0.16);
const MUTED = rgb(0.42, 0.45, 0.52);

type Fonts = { regular: PDFFont; bold: PDFFont; italic: PDFFont };

/** Masque une zone du modèle (les traits pointillés, une note de rédaction). */
function hide(page: PDFPage, x: number, y: number, width: number, height: number) {
  page.drawRectangle({ x, y, width, height, color: WHITE });
}

/** Écrit une valeur, en réduisant la taille jusqu’à ce qu’elle tienne dans la
 *  largeur disponible. Le modèle est figé : mieux vaut un nom en 9 pt qu’un nom
 *  qui déborde dans la marge. */
function fit(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; color?: RGB },
) {
  const value = winAnsi(text);
  if (!value) return;
  let size = opts.size;
  while (size > 6 && opts.font.widthOfTextAtSize(value, size) > opts.maxWidth) size -= 0.25;
  page.drawText(value, { x: opts.x, y: opts.y, size, font: opts.font, color: opts.color ?? INK });
}

/** Découpe un paragraphe en lignes tenant dans `maxWidth`. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = winAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Écrit un paragraphe et renvoie l’ordonnée de la ligne suivante. */
function paragraph(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; font: PDFFont; size: number; maxWidth: number; leading?: number; color?: RGB },
): number {
  const leading = opts.leading ?? opts.size * 1.35;
  let y = opts.y;
  for (const line of wrap(text, opts.font, opts.size, opts.maxWidth)) {
    page.drawText(line, { x: opts.x, y, size: opts.size, font: opts.font, color: opts.color ?? INK });
    y -= leading;
  }
  return y;
}

/* ------------------------------------------------------------------ dates */

const DATE_FR = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric',
});
const DATETIME_FR = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

function dateFr(d: Date): string {
  return DATE_FR.format(d);
}

function dateTimeFr(iso: string | null | undefined, fallback: Date): string {
  const d = iso ? new Date(iso) : fallback;
  return DATETIME_FR.format(Number.isNaN(d.getTime()) ? fallback : d);
}

function euros(amount: number): string {
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € TTC`;
}

/* ------------------------------------------------------- libellés d’offre */

/** Rappel des services fournis et des exclusions expresses, par formule.
 *  C’est le contenu que la note de rédaction des Conditions Particulières
 *  appelait (« il est bien de faire le rappel des services fournis […] et
 *  d’exclure expressément ce qui n’est pas inclus »). */
const SERVICES: Record<FormuleId, { inclus: string[]; exclus: string[] }> = {
  essentielle: {
    inclus: [
      "Accès individuel et nominatif à la plateforme Major ECN pour la spécialité souscrite, jusqu’aux épreuves de la session préparée.",
      'Supports de cours et fiches de synthèse, QCM et dossiers progressifs corrigés, QROC corrigés, flashcards, annales corrigées.',
      'Capsules de méthodologie, suivi de progression et assistance pédagogique par email.',
    ],
    exclus: [
      "Les cours en direct, les replays d’enseignement et les épreuves blanches corrigées individuellement.",
      "Les corrections personnalisées, l’accompagnement individuel et les échanges programmés avec les enseignants.",
      'Toute spécialité autre que celle souscrite, sauf contenus transversaux expressément ouverts par le Prestataire.',
    ],
  },
  intensive: {
    inclus: [
      "L’intégralité des prestations de la Formule Essentielle pour la spécialité souscrite.",
      "18 heures de cours et d’accompagnement : enseignements en direct, replays, méthodologie, entraînements encadrés.",
      'Corrections commentées et réponses aux questions posées aux enseignants.',
    ],
    exclus: [
      "La reprise approfondie de l’ensemble du programme et l’accompagnement pédagogique renforcé propres au Programme Approfondi.",
      "Le volume horaire d’enseignement supplémentaire du Programme Approfondi (à partir de 36 heures selon la spécialité).",
      'Toute spécialité autre que celle souscrite, sauf contenus transversaux expressément ouverts par le Prestataire.',
    ],
  },
  'programme-approfondi': {
    inclus: [
      "L’intégralité des prestations de la Formule Intensive pour le périmètre souscrit.",
      "Un volume horaire d’enseignement renforcé, à partir de 36 heures selon la spécialité, animé par des médecins spécialistes.",
      'Reprise approfondie du programme, dossiers et cas cliniques supplémentaires, corrections approfondies.',
      "Accompagnement pédagogique individualisé jusqu’aux épreuves de la session préparée.",
    ],
    exclus: [
      'Les prestations non expressément mentionnées ci-dessus, notamment tout accompagnement hors du périmètre souscrit.',
      "La garantie d’un résultat au concours, le Prestataire étant tenu d’une obligation de moyens.",
    ],
  },
};

/** « Voie externe (questions ouvertes) » à partir de la valeur stockée. */
function voieLabel(raw?: string | null): string | null {
  const v = (raw ?? '').trim().toLowerCase().replace(/^voie\s+/, '');
  if (v === 'interne') return 'Voie interne (QCM)';
  if (v === 'externe') return 'Voie externe (questions ouvertes)';
  return null;
}

function fullName(client: ContractClient): string {
  return [client.firstName?.trim(), client.lastName?.trim()].filter(Boolean).join(' ').trim();
}

/* ------------------------------------------------------ chargement modèle */

/** Charge un PDF de `public/legal`. Le disque d’abord (aucun aller-retour
 *  réseau quand le dossier est embarqué dans la fonction), l’URL publique
 *  ensuite — c’est déjà par elle que Resend récupérait les pièces jointes. */
async function loadTemplate(name: string): Promise<Uint8Array> {
  try {
    const { readFile } = await import('node:fs/promises');
    const path = await import('node:path');
    const buf = await readFile(path.join(process.cwd(), 'public', 'legal', `${name}.pdf`));
    return new Uint8Array(buf);
  } catch {
    const res = await fetch(`${siteUrl()}/legal/${name}.pdf`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`template ${name} indisponible (${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  }
}

async function openTemplate(name: string): Promise<{ doc: PDFDocument; fonts: Fonts }> {
  const doc = await PDFDocument.load(await loadTemplate(name));
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.TimesRoman),
    bold: await doc.embedFont(StandardFonts.TimesRomanBold),
    italic: await doc.embedFont(StandardFonts.TimesRomanItalic),
  };
  return { doc, fonts };
}

/** Appose la signature manuscrite au-dessus d’un trait de signature.
 *  `lineY` est l’ordonnée du trait, `maxWidth` sa longueur. */
async function drawSignature(
  doc: PDFDocument,
  page: PDFPage,
  png: Buffer | null | undefined,
  opts: { x: number; lineY: number; maxWidth: number; maxHeight?: number },
) {
  if (!png) return;
  const image = await doc.embedPng(png);
  const maxHeight = opts.maxHeight ?? 48;
  const scale = Math.min(opts.maxWidth / image.width, maxHeight / image.height);
  page.drawImage(image, {
    x: opts.x + 4,
    y: opts.lineY + 4,
    width: image.width * scale,
    height: image.height * scale,
  });
}

/* ================================================================= CP =====
 * Conditions Particulières — COMPOSÉES, et non surchargées.
 *
 * Contrairement aux CGS et aux CGU, dont on ne touche que les blancs, la page
 * des Conditions Particulières est recomposée intégralement. Deux raisons :
 *   - le modèle porte deux notes de rédaction du cabinet (« [à compléter avec
 *     les informations complémentaires receuillies] », « [il est bien de faire
 *     le rappel des services fournies…] ») qui n’ont rien à faire dans un
 *     exemplaire remis au Client. Un rectangle blanc les masquerait à l’écran
 *     mais les laisserait dans le calque texte : un copier-coller ou une
 *     recherche les ferait ressortir ;
 *   - le document est court et intégralement variable — il n’a de sens qu’une
 *     fois renseigné.
 * Les DEUX clauses du § Observations sont reprises MOT POUR MOT du modèle : ce
 * sont des stipulations contractuelles, elles ne se reformulent pas.
 * ========================================================================= */
const CLAUSES_OBSERVATIONS = [
  "Le Client demande l’exécution immédiate du Contrat pour que l’exécution du Contrat commence avant "
  + "l’expiration du délai de rétractation.",
  "Le Client reconnait qu’il perd, en conséquence, son droit de rétractation.",
];

async function buildConditionsParticulieres(input: ContractInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.TimesRoman),
    bold: await doc.embedFont(StandardFonts.TimesRomanBold),
    italic: await doc.embedFont(StandardFonts.TimesRomanItalic),
  };
  const page = doc.addPage([595.28, 841.89]);
  const { client, offer } = input;
  const M = 71;
  const W = 595.28 - M * 2;
  const LABEL_W = 150;

  const centre = (text: string, y: number, font: PDFFont, size: number, color = INK) => {
    const value = winAnsi(text);
    page.drawText(value, { x: (595.28 - font.widthOfTextAtSize(value, size)) / 2, y, size, font, color });
  };

  /** Une ligne « LIBELLÉ : valeur » du corps du document. */
  const row = (label: string, value: string, y: number, strong = false) => {
    page.drawText(winAnsi(`${label} :`), { x: M, y, size: 10.5, font: fonts.bold, color: INK });
    fit(page, value, {
      x: M + LABEL_W, y, font: strong ? fonts.bold : fonts.regular, size: 10.5, maxWidth: W - LABEL_W,
    });
  };

  const titre = (text: string, y: number) => {
    page.drawText(winAnsi(text), { x: M, y, size: 11, font: fonts.bold, color: INK });
    page.drawLine({ start: { x: M, y: y - 6 }, end: { x: M + W, y: y - 6 }, thickness: 0.6, color: MUTED });
  };

  centre('Conditions Particulières', 772, fonts.bold, 18);
  centre('SOUMISES AUX CONDITIONS GÉNÉRALES DE SERVICE', 752, fonts.regular, 10, MUTED);

  // --- Désignation du Client ---------------------------------------------
  let y = 714;
  titre('DÉSIGNATION DU CLIENT', y);
  y -= 26;
  row('Nom', client.lastName.toUpperCase(), y, true); y -= 18;
  row('Prénom', client.firstName, y, true); y -= 18;
  row('Adresse du domicile', client.address || 'Non communiquée', y); y -= 18;
  row('Email', client.email, y); y -= 18;
  row('Téléphone', client.phone || 'Non communiqué', y);

  // --- Typologie de l’Offre choisie ---------------------------------------
  y -= 40;
  titre("TYPOLOGIE DE L’OFFRE CHOISIE", y);
  y -= 26;
  row('Offre souscrite', offer.formuleLabel, y, true); y -= 18;
  if (offer.specialty) { row('Spécialité préparée', offer.specialty, y); y -= 18; }
  const voie = voieLabel(offer.voie);
  if (voie) { row('Voie de concours', voie, y); y -= 18; }
  if (offer.coverageLabel) { row('Périmètre', offer.coverageLabel, y); y -= 18; }
  row('Montant total', euros(offer.amountEuros), y, true); y -= 18;
  row(
    'Modalités de paiement',
    offer.installments > 1 ? `${offer.installments} échéances mensuelles` : 'Paiement comptant',
    y,
  );
  y -= 22;
  y = paragraph(
    page,
    'Le rappel des services fournis et des exclusions expresses figure en annexe des présentes (page 2).',
    { x: M, y, font: fonts.italic, size: 10, maxWidth: W, leading: 13, color: MUTED },
  );

  // --- Date d’effet --------------------------------------------------------
  y -= 22;
  titre("DATE D’EFFET DU CONTRAT", y);
  y -= 26;
  row("Date d’effet", dateFr(input.effectiveAt), y, true);

  // --- Observations éventuelles -------------------------------------------
  y -= 40;
  titre('OBSERVATIONS ÉVENTUELLES', y);
  y -= 26;
  for (const clause of CLAUSES_OBSERVATIONS) {
    y = paragraph(page, clause, { x: M, y, font: fonts.regular, size: 10.5, maxWidth: W, leading: 14 });
    y -= 6;
  }

  // --- Signature du Client -------------------------------------------------
  y -= 26;
  page.drawText(winAnsi(`Fait le ${dateFr(input.effectiveAt)},`), {
    x: M, y, size: 10.5, font: fonts.regular, color: INK,
  });
  const lineY = y - 78;
  await drawSignature(doc, page, input.signaturePng, { x: M, lineY, maxWidth: 180, maxHeight: 62 });
  page.drawLine({ start: { x: M, y: lineY }, end: { x: M + 187, y: lineY }, thickness: 0.8, color: INK });
  fit(page, fullName(client), { x: M, y: lineY - 15, font: fonts.bold, size: 10.5, maxWidth: 260 });
  if (input.signaturePng) {
    fit(page, `Signé électroniquement le ${dateTimeFr(input.signedAt, input.effectiveAt)} (heure de Paris).`, {
      x: M, y: lineY - 29, font: fonts.italic, size: 8.5, maxWidth: 380, color: MUTED,
    });
  }

  pied(page, fonts);

  // --- Annexe (page 2) ------------------------------------------------------
  annexe(doc, fonts, input);

  return doc.save();
}

/** Identité de la société en pied de page — reprise du préambule des CGS. */
function pied(page: PDFPage, fonts: Fonts) {
  page.drawText(
    winAnsi('PAE Formation — SAS au capital de 100 euros — 3, rue Rosa Bonheur, 75015 Paris — 821 740 537 R.C.S. Paris'),
    { x: 71, y: 52, size: 8, font: fonts.regular, color: MUTED },
  );
}

/** Page 2 des Conditions Particulières : rappel des services, exclusions,
 *  modalités financières et preuve du consentement. */
function annexe(doc: PDFDocument, fonts: Fonts, input: ContractInput) {
  const page = doc.addPage([595.28, 841.89]);
  const M = 71;
  const W = 595.28 - M * 2;
  const services = SERVICES[input.offer.formuleId];
  let y = 770;

  page.drawText(winAnsi('ANNEXE AUX CONDITIONS PARTICULIÈRES'), {
    x: M, y, size: 13, font: fonts.bold, color: INK,
  });
  y -= 16;
  page.drawText(winAnsi(`${input.offer.formuleLabel} — ${fullName(input.client)}`), {
    x: M, y, size: 10, font: fonts.italic, color: MUTED,
  });
  y -= 30;

  page.drawText(winAnsi('Rappel des services fournis'), { x: M, y, size: 11.5, font: fonts.bold, color: INK });
  y -= 18;
  for (const item of services.inclus) {
    page.drawText('-', { x: M, y, size: 10.5, font: fonts.regular, color: INK });
    y = paragraph(page, item, { x: M + 12, y, font: fonts.regular, size: 10.5, maxWidth: W - 12, leading: 14 });
    y -= 4;
  }

  y -= 14;
  page.drawText(winAnsi('Exclusions expresses'), { x: M, y, size: 11.5, font: fonts.bold, color: INK });
  y -= 18;
  for (const item of services.exclus) {
    page.drawText('-', { x: M, y, size: 10.5, font: fonts.regular, color: INK });
    y = paragraph(page, item, { x: M + 12, y, font: fonts.regular, size: 10.5, maxWidth: W - 12, leading: 14 });
    y -= 4;
  }

  y -= 14;
  page.drawText(winAnsi('Modalités financières'), { x: M, y, size: 11.5, font: fonts.bold, color: INK });
  y -= 18;
  const lignes = [
    `Montant total du Contrat : ${euros(input.offer.amountEuros)}.`,
    input.offer.installments > 1
      ? `Règlement en ${input.offer.installments} échéances mensuelles, prélevées sur le moyen de paiement enregistré.`
      : 'Règlement comptant à la souscription.',
    `Date d’effet du Contrat : ${dateFr(input.effectiveAt)}.`,
  ];
  for (const l of lignes) {
    y = paragraph(page, l, { x: M, y, font: fonts.regular, size: 10.5, maxWidth: W, leading: 14 });
    y -= 2;
  }

  y -= 14;
  page.drawText(winAnsi('Preuve du consentement'), { x: M, y, size: 11.5, font: fonts.bold, color: INK });
  y -= 18;
  paragraph(
    page,
    "Le Client a accepté les Conditions Générales d’Utilisation, les Conditions Générales de Service et les présentes "
    + "Conditions Particulières, et a expressément demandé l’exécution immédiate du Contrat en renonçant à son droit de "
    + `rétractation, conformément à l’article L. 221-28 13° du code de la consommation. Signature manuscrite recueillie le `
    + `${dateTimeFr(input.signedAt, input.effectiveAt)} (heure de Paris), avant l’ouverture du paiement.`,
    { x: M, y, font: fonts.regular, size: 10.5, maxWidth: W, leading: 14 },
  );

  pied(page, fonts);
}

/* ================================================================ CGS =====
 * Conditions Générales de Service — 11 pages.
 *   page 10, y=189,2 : « Le [à compléter], »
 *   page 11, y=735,9 : deux traits de signature (Prestataire x=72,5 / Client x=302,9)
 *   page 11, y=723,3 : « [Nom prénom] » côté Client
 * ========================================================================= */
async function buildCgs(input: ContractInput): Promise<Uint8Array> {
  const { doc, fonts } = await openTemplate('cgs');
  const pages = doc.getPages();
  const avantDerniere = pages[pages.length - 2];
  const derniere = pages[pages.length - 1];

  // « Le [à compléter], » → la date d’effet.
  hide(avantDerniere, 68, 184, 90, 16);
  fit(avantDerniere, `Le ${dateFr(input.effectiveAt)},`, {
    x: 71, y: 189.2, font: fonts.regular, size: 10.5, maxWidth: 300,
  });

  // Côté Prestataire : le cachet de la société au-dessus de son trait.
  try {
    const tampon = await loadPublicPng('tampon-pae-formation.png');
    if (tampon) {
      const image = await doc.embedPng(tampon);
      const scale = Math.min(150 / image.width, 62 / image.height);
      derniere.drawImage(image, {
        x: 76, y: 741, width: image.width * scale, height: image.height * scale, opacity: 0.92,
      });
    }
  } catch {
    // Le cachet est un confort de présentation : son absence ne doit rien casser.
  }

  // Côté Client : signature manuscrite + nom en clair.
  await drawSignature(doc, derniere, input.signaturePng, { x: 302.9, lineY: 735.9, maxWidth: 180, maxHeight: 52 });
  hide(derniere, 300, 718, 90, 16);
  fit(derniere, fullName(input.client), { x: 302.9, y: 723.3, font: fonts.bold, size: 10.5, maxWidth: 220 });
  if (input.signaturePng) {
    fit(derniere, `Signé électroniquement le ${dateTimeFr(input.signedAt, input.effectiveAt)} (heure de Paris).`, {
      x: 302.9, y: 708, font: fonts.italic, size: 8, maxWidth: 220, color: MUTED,
    });
  }

  return doc.save();
}

/* ================================================================ CGU =====
 * Conditions Générales d’Utilisation — 6 pages, la dernière est vierge.
 * Le modèle ne prévoyait aucun bloc de signature : on en compose un sur cette
 * page vierge, pour que l’exemplaire remis à l’Utilisateur porte la trace de
 * son acceptation.
 * ========================================================================= */
async function buildCgu(input: ContractInput): Promise<Uint8Array> {
  const { doc, fonts } = await openTemplate('cgu');
  const pages = doc.getPages();
  const page = pages[pages.length - 1];
  const M = 71;
  const W = 595.28 - M * 2;
  let y = 740;

  page.drawText(winAnsi("ACCEPTATION DES CONDITIONS GÉNÉRALES D’UTILISATION"), {
    x: M, y, size: 12, font: fonts.bold, color: INK,
  });
  y -= 28;
  y = paragraph(
    page,
    "L’Utilisateur soussigné déclare avoir pris connaissance des présentes Conditions Générales d’Utilisation, les avoir "
    + 'lues et comprises, et les accepter sans réserve. Cette acceptation a été recueillie dans le tunnel de souscription '
    + 'du site major-ecn.fr, préalablement au paiement.',
    { x: M, y, font: fonts.regular, size: 10.5, maxWidth: W, leading: 14 },
  );

  y -= 20;
  const identite: [string, string][] = [
    ['Nom', input.client.lastName.toUpperCase()],
    ['Prénom', input.client.firstName],
    ['Adresse du domicile', input.client.address || 'Non communiquée'],
    ['Email', input.client.email],
    ['Téléphone', input.client.phone || 'Non communiqué'],
    ["Date d’acceptation", `${dateTimeFr(input.signedAt, input.effectiveAt)} (heure de Paris)`],
  ];
  for (const [label, value] of identite) {
    page.drawText(winAnsi(`${label} :`), { x: M, y, size: 10.5, font: fonts.bold, color: INK });
    fit(page, value, { x: M + 130, y, font: fonts.regular, size: 10.5, maxWidth: W - 130 });
    y -= 16;
  }

  y -= 26;
  page.drawText(winAnsi("Signature de l’Utilisateur"), { x: M, y, size: 10.5, font: fonts.bold, color: INK });
  const lineY = y - 70;
  await drawSignature(doc, page, input.signaturePng, { x: M, lineY, maxWidth: 180, maxHeight: 55 });
  page.drawLine({
    start: { x: M, y: lineY }, end: { x: M + 187, y: lineY },
    thickness: 0.8, color: INK,
  });
  fit(page, fullName(input.client), { x: M, y: lineY - 14, font: fonts.bold, size: 10.5, maxWidth: 220 });

  return doc.save();
}

/** Lit une image de `public/` (cachet de la société). */
async function loadPublicPng(name: string): Promise<Buffer | null> {
  try {
    const { readFile } = await import('node:fs/promises');
    const path = await import('node:path');
    return await readFile(path.join(process.cwd(), 'public', name));
  } catch {
    try {
      const res = await fetch(`${siteUrl()}/${name}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }
}

/* ------------------------------------------------------------ API publique */

/** Noms de fichier des pièces jointes — inchangés, c’est ce que l’élève
 *  retrouve dans sa boîte et ce que la direction archive. */
const NOMS = {
  cgu: 'CGU - Major ECN.pdf',
  cgs: 'CGS - Major ECN.pdf',
  cp: 'Conditions Particulières - Major ECN.pdf',
} as const;

/** Pièces jointes contractuelles, renseignées au nom du Client.
 *
 *  NE LÈVE JAMAIS : en cas d’échec (template introuvable, rendu impossible),
 *  renvoie les PDF statiques par URL, exactement comme avant ce module. Le
 *  drapeau `filled` dit ce qui a réellement été produit, pour le journal de
 *  provisioning. */
export async function buildContractAttachments(
  input: ContractInput,
): Promise<{ attachments: EmailAttachment[]; filled: boolean; error: string | null }> {
  try {
    const [cp, cgs, cgu] = await Promise.all([
      buildConditionsParticulieres(input),
      buildCgs(input),
      buildCgu(input),
    ]);
    return {
      attachments: [
        { filename: NOMS.cgu, content: Buffer.from(cgu).toString('base64') },
        { filename: NOMS.cgs, content: Buffer.from(cgs).toString('base64') },
        { filename: NOMS.cp, content: Buffer.from(cp).toString('base64') },
      ],
      filled: true,
      error: null,
    };
  } catch (e) {
    const base = siteUrl();
    return {
      attachments: [
        { filename: NOMS.cgu, path: `${base}/legal/cgu.pdf` },
        { filename: NOMS.cgs, path: `${base}/legal/cgs.pdf` },
        { filename: NOMS.cp, path: `${base}/legal/conditions-particulieres.pdf` },
      ],
      filled: false,
      error: e instanceof Error ? e.message : 'rendu des contrats impossible',
    };
  }
}
