/**
 * Import CSV de l'historique des relances déjà faites (cahier §5) et
 * génération des exports CSV (§21).
 *
 * Format d'import : `email;type;date;heure;commentaire` (séparateur « ; » ou
 * « , », ligne d'en-tête facultative). Types : R1, R2, R3, « ancien accès »,
 * « autre » (relance hors séquence : compte pour l'écart minimal et
 * l'historique, pas comme R1/R2/R3). Dates JJ/MM/AAAA ou AAAA-MM-JJ, heure
 * HH:MM (heure de Paris, 12:00 par défaut).
 *
 * Module PUR.
 */
import { lireHeure, lireJour } from './dates';
import type { TypeRelance } from './types';

export type TypeHistorique = TypeRelance | 'ancienne_relance';
export type LigneImport = {
  numero: number;
  email: string;
  type: TypeHistorique | null;
  jour: string | null;
  heure: string;
  heureFournie: boolean;
  commentaire: string;
  erreur: string | null;
};

export function lireTypeHistorique(s: string): TypeHistorique | null {
  const t = s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s_-]+/g, ' ');
  if (/^r ?1$/.test(t)) return 'R1';
  if (/^r ?2$/.test(t)) return 'R2';
  if (/^r ?3$/.test(t)) return 'R3';
  if (t === 'ancien acces' || t === 'ancien' || t === 'reactivation') return 'ancien_acces';
  if (t === 'autre' || t === 'ancienne relance' || t === 'relance') return 'ancienne_relance';
  return null;
}

/** Découpe une ligne CSV (guillemets doubles gérés). */
export function decouperLigne(ligne: string, sep: string): string[] {
  const out: string[] = [];
  let cur = '', q = false;
  for (let i = 0; i < ligne.length; i++) {
    const ch = ligne[i];
    if (q) {
      if (ch === '"' && ligne[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

export function analyserCsv(texte: string, maxLignes = 5000): { lignes: LigneImport[]; erreurGlobale: string | null } {
  const brut = texte.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (brut.length === 0) return { lignes: [], erreurGlobale: 'Fichier vide.' };
  if (brut.length > maxLignes + 1) return { lignes: [], erreurGlobale: `Trop de lignes (${brut.length}) : ${maxLignes} au plus par import.` };
  const sep = (brut[0].match(/;/g)?.length ?? 0) >= (brut[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const premiere = decouperLigne(brut[0], sep).map((x) => x.toLowerCase());
  const enTete = premiere[0]?.includes('mail') || premiere[1] === 'type';
  const lignes: LigneImport[] = [];
  brut.slice(enTete ? 1 : 0).forEach((l, i) => {
    const [email = '', type = '', date = '', heure = '', ...reste] = decouperLigne(l, sep);
    const numero = i + (enTete ? 2 : 1);
    const t = lireTypeHistorique(type);
    const jour = lireJour(date);
    const h = heure ? lireHeure(heure) : '12:00';
    let erreur: string | null = null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) erreur = 'Adresse e-mail invalide';
    else if (!t) erreur = `Type inconnu « ${type} » (R1, R2, R3, ancien accès, autre)`;
    else if (!jour) erreur = `Date invalide « ${date} »`;
    else if (!h) erreur = `Heure invalide « ${heure} »`;
    lignes.push({
      numero, email: email.trim().toLowerCase(), type: t, jour, heure: h ?? '12:00', heureFournie: !!heure,
      commentaire: reste.join(sep).trim().slice(0, 500), erreur,
    });
  });
  return { lignes, erreurGlobale: null };
}

/** Cellule CSV (séparateur « ; », guillemets si nécessaire). */
export function celluleCsv(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV lisible par Excel (BOM UTF-8, « ; »). */
export function versCsv(entetes: string[], lignes: unknown[][]): string {
  return '﻿' + [entetes, ...lignes].map((l) => l.map(celluleCsv).join(';')).join('\r\n') + '\r\n';
}
