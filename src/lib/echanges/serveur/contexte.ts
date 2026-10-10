import 'server-only';
import { canAccessCours, parseScope } from '@/lib/auth/permissions';
import type { ContexteDTO } from '../types';
import type { Acteur } from './acces';
import { db } from './base';

/**
 * Contexte pédagogique d'une question (CDC §64-66) : « Question concernant :
 * Item 162 — Insuffisance cardiaque ». Le navigateur n'envoie qu'un type et un
 * identifiant ; tout le reste (titre, item, spécialité, lien) est relu ici, et
 * l'accès de l'élève à la ressource est vérifié — un contexte ne peut pas être
 * fabriqué à la main.
 */

export const TYPES_CONTEXTE = ['item', 'fiche', 'video', 'replay', 'serie', 'qcm', 'qroc', 'cas', 'correction'] as const;
export type TypeContexte = (typeof TYPES_CONTEXTE)[number];

export function numeroItem(titre: string | null | undefined): number | null {
  const m = /^\s*item\s*0*(\d{1,4})\b/i.exec(titre ?? '');
  return m ? Number(m[1]) : null;
}

function titreItem(titre: string): string {
  return titre.replace(/^\s*item\s*0*\d{1,4}\s*[·:\-–—]?\s*/i, '').trim() || titre;
}

type Cours = { id: string; titre: string; matiere_id: string; access_type: 'all' | 'specific' | null; matieres: { id: string; nom: string; parent_matiere_id: string | null; access_type: 'all' | 'specific' | null } | null };

async function coursDe(coursId: string): Promise<Cours | null> {
  const { data } = await db().from('cours').select('id, titre, matiere_id, access_type, matieres(id, nom, parent_matiere_id, access_type)').eq('id', coursId).maybeSingle();
  return (data as Cours | null) ?? null;
}

export async function resoudreContexte(acteur: Acteur, typeBrut: string, id: string): Promise<ContexteDTO | null> {
  const type = (TYPES_CONTEXTE as readonly string[]).includes(typeBrut) ? (typeBrut as TypeContexte) : null;
  if (!type || !/^[0-9a-f-]{36}$/i.test(id)) return null;

  let coursId: string | null = null;
  let titre: string | null = null;
  let lienSuffixe = '';
  let typeDto: ContexteDTO['type'] = 'item';
  if (type === 'item') {
    coursId = id;
  } else if (type === 'fiche') {
    const { data } = await db().from('fiches').select('cours_id, titre').eq('id', id).maybeSingle();
    coursId = data?.cours_id ?? null; titre = data?.titre ?? null; lienSuffixe = '/fiche'; typeDto = 'fiche';
  } else if (type === 'video' || type === 'replay') {
    const { data } = await db().from('videos').select('cours_id, titre, type').eq('id', id).maybeSingle();
    coursId = data?.cours_id ?? null; titre = data?.titre ?? null;
    lienSuffixe = data?.type === 'seance_approfondie' ? '/seance-approfondie' : '/video';
    typeDto = type;
  } else if (type === 'correction') {
    const { data } = await db().from('qcm_questions').select('serie_id, qcm_series(cours_id, label, kind)').eq('id', id).maybeSingle();
    const s = (data as { qcm_series?: { cours_id: string; label: string | null; kind: string | null } } | null)?.qcm_series;
    coursId = s?.cours_id ?? null; titre = s?.label ? `Correction — ${s.label}` : 'Correction'; lienSuffixe = '/qcm'; typeDto = 'correction';
  } else {
    const { data } = await db().from('qcm_series').select('cours_id, label, kind, type').eq('id', id).maybeSingle();
    coursId = data?.cours_id ?? null; titre = data?.label ?? null; lienSuffixe = '/qcm';
    typeDto = data?.kind === 'dp' ? 'cas' : data?.kind === 'qroc' || data?.type === 'qroc' ? 'qroc' : 'qcm';
  }
  if (!coursId) return null;
  const c = await coursDe(coursId);
  if (!c) return null;

  // Accès de l'élève à l'item (mêmes règles que l'espace élève).
  if (acteur.role === 'student') {
    const ok = canAccessCours(parseScope(acteur.profil.permission_scope), c.matiere_id, c.id, c.access_type ?? 'all');
    if (!ok) return null;
  }
  const specialiteId = c.matieres?.parent_matiere_id ?? c.matiere_id;
  let specialiteNom = c.matieres?.nom ?? null;
  if (c.matieres?.parent_matiere_id) {
    const { data: p } = await db().from('matieres').select('nom').eq('id', c.matieres.parent_matiere_id).maybeSingle();
    specialiteNom = p?.nom ?? specialiteNom;
  }
  const num = numeroItem(c.titre);
  return {
    type: typeDto,
    ressourceId: id,
    titre: titre && type !== 'item' ? titre : (num ? `Item ${num} — ${titreItem(c.titre)}` : c.titre),
    itemNumero: num,
    itemTitre: titreItem(c.titre),
    specialiteId,
    specialiteNom,
    lien: `/cours/${c.id}${lienSuffixe}`,
  };
}
