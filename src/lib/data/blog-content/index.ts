import type { Block } from './types';
import { CONTENT as C_calendrier_inscription_concours_pae_2026_cng } from './calendrier-inscription-concours-pae-2026-cng';
import { CONTENT as C_comment_major_ecn_accompagne_candidats_evc } from './comment-major-ecn-accompagne-candidats-evc';
import { CONTENT as C_evc_edn_difference_a_ne_pas_confondre } from './evc-edn-difference-a-ne-pas-confondre';
import { CONTENT as C_voie_interne_evc_logique_qcm } from './voie-interne-evc-logique-qcm';
import { CONTENT as C_evc_voie_externe_comprendre } from './evc-voie-externe-comprendre';
import { CONTENT as C_comment_rediger_qroc_evc } from './comment-rediger-qroc-evc';
import { CONTENT as C_comment_choisir_specialite_evc } from './comment-choisir-specialite-evc';

export const RICH_CONTENT: Record<string, Block[]> = {
  'calendrier-inscription-concours-pae-2026-cng': C_calendrier_inscription_concours_pae_2026_cng,
  'comment-major-ecn-accompagne-candidats-evc': C_comment_major_ecn_accompagne_candidats_evc,
  'evc-edn-difference-a-ne-pas-confondre': C_evc_edn_difference_a_ne_pas_confondre,
  'voie-interne-evc-logique-qcm': C_voie_interne_evc_logique_qcm,
  'evc-voie-externe-comprendre': C_evc_voie_externe_comprendre,
  'comment-rediger-qroc-evc': C_comment_rediger_qroc_evc,
  'comment-choisir-specialite-evc': C_comment_choisir_specialite_evc,
};
