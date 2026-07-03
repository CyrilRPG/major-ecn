import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getContentAccess, type ContentAccess } from './permissions';
import type { Offer } from '@/types/domain';

type Row = {
  fiche: boolean;
  fiche_express: boolean;
  video: boolean;
  qcm: boolean;
  entrainement: boolean;
  seance_prof: boolean;
  flashcards: boolean;
  interrogation: boolean;
  seance_approfondie: boolean;
  notes: boolean;
};

function rowToAccess(row: Row): ContentAccess {
  return {
    fiche: row.fiche,
    ficheExpress: row.fiche_express,
    video: row.video,
    qcm: row.qcm,
    entrainement: row.entrainement,
    seanceProf: row.seance_prof,
    flashcards: row.flashcards,
    interrogation: row.interrogation,
    seanceApprofondie: row.seance_approfondie,
    notes: row.notes,
  };
}

/**
 * Mémoïsé par requête (React `cache`), keyé par `offer` : appelé depuis ~18
 * endroits (layout + page + sous-pages d'un cours) qui interrogeaient tous
 * `formula_permissions`. Le cache réduit à un seul accès DB par offre/requête.
 */
export const fetchContentAccess = cache(async (offer: Offer): Promise<ContentAccess> => {
  if (offer === 'decouverte') return getContentAccess(offer);
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('formula_permissions')
      .select('fiche, fiche_express, video, qcm, entrainement, seance_prof, flashcards, interrogation, seance_approfondie, notes')
      .eq('offer', offer)
      .maybeSingle();
    if (data) return rowToAccess(data as unknown as Row);
  } catch {
    // fallback to hardcoded
  }
  return getContentAccess(offer);
});

/** Libellés des formules (offres) — alignés sur la page Config Permissions. */
export const OFFER_LABELS: Record<Offer, string> = {
  decouverte: 'Espace Découverte',
  essentiel: 'Formule Essentielle',
  intensif: 'Formule Intensive',
  approfondi: 'Programme Approfondi',
};

/** Contenus configurables (ordre + libellé) — alignés sur Config Permissions. */
export const CONTENT_ACCESS_LABELS: { key: keyof ContentAccess; label: string }[] = [
  { key: 'fiche', label: 'Fiche de cours' },
  { key: 'ficheExpress', label: 'Fiche Express' },
  { key: 'video', label: 'Résumé vidéo' },
  { key: 'qcm', label: 'QCM / DP / QROC' },
  { key: 'entrainement', label: 'QCM Entraînement' },
  { key: 'seanceProf', label: 'Séance du professeur' },
  { key: 'flashcards', label: 'Flashcards' },
  { key: 'interrogation', label: 'Interrogation' },
  { key: 'seanceApprofondie', label: 'Séance approfondie' },
  { key: 'notes', label: 'Prise de notes' },
];

/** Liste des contenus débloqués par une formule (d'après la config). */
export function unlockedLabels(access: ContentAccess): string[] {
  return CONTENT_ACCESS_LABELS.filter(({ key }) => access[key]).map(({ label }) => label);
}
