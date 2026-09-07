import 'server-only';

import { PDFDocument } from 'pdf-lib';
import { paginerTexte } from './exercise-import-schema';

/**
 * Import d'exercices — préparation des documents avant analyse.
 *
 * Le modèle reçoit chaque lot sous une seule des deux formes que l'API
 * Messages accepte nativement : un PDF (`document` base64) ou du texte brut.
 *  - PDF   : on extrait les pages du lot dans un sous-PDF avec pdf-lib, sans
 *            re-rendu, donc sans perte (figures, tableaux, mise en page).
 *  - DOCX  : converti en texte par mammoth. Les images sont perdues, ce qui
 *            est dit à l'administrateur dans les avertissements ; le texte, lui,
 *            est intégral.
 *  - TXT   : décodé tel quel.
 * Le texte est découpé en « pages » virtuelles pour partager le même plan de
 * lots que les PDF.
 */

export type DocumentPrepare =
  | { kind: 'pdf'; nbPages: number; bytes: Uint8Array }
  | { kind: 'texte'; nbPages: number; pages: string[]; avertissements: string[] };

export type ImportFormat = 'pdf' | 'docx' | 'txt';

export async function preparerDocument(format: ImportFormat, bytes: Uint8Array): Promise<DocumentPrepare> {
  if (format === 'pdf') {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    const nbPages = pdf.getPageCount();
    if (nbPages < 1) throw new Error('Le PDF ne contient aucune page.');
    return { kind: 'pdf', nbPages, bytes };
  }
  if (format === 'docx') {
    const { default: mammoth } = await import('mammoth');
    const { value, messages } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    const pages = paginerTexte(value);
    if (pages.length === 0) throw new Error('Le document Word ne contient aucun texte lisible.');
    const avertissements = ['Document Word : le texte a été extrait intégralement, mais les images ne sont pas transmises à l’analyse.'];
    for (const m of messages ?? []) if (m.type === 'warning' && m.message) avertissements.push(`Conversion Word : ${m.message}`);
    return { kind: 'texte', nbPages: pages.length, pages, avertissements };
  }
  const texte = new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/^﻿/, '');
  const pages = paginerTexte(texte);
  if (pages.length === 0) throw new Error('Le fichier texte est vide.');
  return { kind: 'texte', nbPages: pages.length, pages, avertissements: [] };
}

/** Extrait les pages [debut, fin] (1-based, inclusives) dans un nouveau PDF. */
export async function extrairePagesPdf(bytes: Uint8Array, debut: number, fin: number): Promise<Uint8Array> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const total = source.getPageCount();
  const de = Math.max(1, debut);
  const a = Math.min(total, fin);
  if (de > a) throw new Error(`Plage de pages invalide : ${debut}-${fin} sur ${total}.`);
  const cible = await PDFDocument.create();
  const indices = Array.from({ length: a - de + 1 }, (_, i) => de - 1 + i);
  const pages = await cible.copyPages(source, indices);
  for (const p of pages) cible.addPage(p);
  return cible.save({ useObjectStreams: true });
}

/** Contenu d'un lot prêt à être envoyé au modèle. */
export type ContenuLot =
  | { kind: 'pdf'; base64: string }
  | { kind: 'texte'; texte: string };

export async function contenuDuLot(doc: DocumentPrepare, debut: number, fin: number): Promise<ContenuLot> {
  if (doc.kind === 'pdf') {
    const sous = await extrairePagesPdf(doc.bytes, debut, fin);
    return { kind: 'pdf', base64: Buffer.from(sous).toString('base64') };
  }
  const morceaux = doc.pages.slice(debut - 1, fin).map((p, i) => `=== Page ${debut + i} ===\n${p}`);
  return { kind: 'texte', texte: morceaux.join('\n\n') };
}
