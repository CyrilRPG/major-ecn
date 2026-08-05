import 'server-only';

/**
 * Bonus « Gériatrie → Médecine générale » (2026-08-05).
 *
 * Un élève inscrit en Gériatrie (`col-geriatrie`), quelle que soit sa formule,
 * reçoit EN PLUS un accès à Médecine générale — mais restreint aux seuls
 * items présents dans le dossier `contenus/PLATEFORME GERIATRIE _ ITEMS A
 * RAJOUTER`. Le reste de son accès Gériatrie (tous ses propres cours) doit
 * rester intact.
 *
 * `PermissionScope.cours` s'applique globalement à TOUS les collèges du
 * scope (voir `canAccessCours`) : il n'y a pas de restriction par-collège
 * dans le type actuel. Pour préserver l'accès complet à Gériatrie tout en
 * limitant Médecine générale, la liste `cours` doit donc contenir À LA FOIS
 * tous les cours de `col-geriatrie` (récupérés en direct, pour rester valide
 * si de nouveaux items y sont ajoutés) ET la liste ci-dessous.
 *
 * Voir aussi la policy RLS `qcm_series_geriatrie_mg_block_dp_entrainement_seance`
 * (bloque les DP, séries entraînement et séances du prof sur ces cours — la
 * distinction QCM/QROC par voie reste celle appliquée partout ailleurs).
 *
 * ⚠️ Piège : `col-medecine-generale` est un collège PARENT sans cours propres —
 * tous ses cours vivent dans des sous-collèges (`col-mg-cardiologie`,
 * `col-dermatologie`, …). Le navigateur élève (`getNavigatorTree`) filtre
 * CHAQUE sous-collège individuellement via `canAccessCollege` : ajouter
 * uniquement `col-medecine-generale` aux `colleges` du scope ne fait apparaître
 * AUCUN sous-collège. Il faut donc aussi lister explicitement les sous-collèges
 * qui portent les cours bonus — dérivés ici dynamiquement (matiere_id des
 * cours de `GERIATRIE_MG_BONUS_COURS_IDS`), pour rester valides si la liste
 * de cours change.
 */

export const GERIATRIE_MG_BONUS_COURS_IDS: string[] = [
  // Cardiologie
  'd25268e2-29a0-4096-968a-e4550282a84b', // Dyslipidémie
  '6fd7cf91-4a36-476d-a399-4d6cf3540d92', // Fibrillation atriale
  '1793b6dc-6d92-4f1b-9fdb-7ee9f551a278', // Facteurs de risque cardio-vasculaire et prévention
  'd03249d2-d5fe-4a2a-b308-b911aa9c1569', // Hypertension artérielle
  '2cfbbe72-c1fd-4fa7-b881-5a3d2a65dbbc', // Insuffisance cardiaque
  '91b03319-376a-4c6f-89e2-c4bba5bb856f', // Rétrécissement aortique

  // Dermatologie
  'd1000001-de00-4000-a000-000000000002', // Ectoparasitoses cutanées
  'd1000001-de00-4000-a000-000000000003', // Herpès cutanéo-muqueux
  'd1000001-de00-4000-a000-000000000005', // Prurit
  'd1000001-de00-4000-a000-000000000009', // Ulcère de jambe
  'd1000001-de00-4000-a000-000000000011', // Varicelle et zona

  // Endocrinologie
  'c46f5ee6-2dee-4d38-93a4-413f8836a300', // Diabète de type 2 et complications
  'a7c45a98-e3ba-4fdb-acf3-e75193a7560b', // Hyperthyroïdie
  '3b479e28-c28a-487b-b4fb-a76b9aef5a59', // Hypothyroïdie

  // Hématologie (fiche « FICHES HEMATOLOGIE 2025 » = livret complet)
  '821bdf2f-3b32-426c-a8bc-4246a2db3a13', // Hémogramme et interprétation
  '02eb0fd9-20f5-4146-a38a-2deffc60a6dc', // Anémies : orientation diagnostique
  '26658a4b-f89b-4183-b24a-c6994ae8ea8d', // Leucémies aiguës
  'e776a250-e816-4c0c-9c4f-605a0647c772', // Leucémie lymphoïde chronique
  '50722171-2a18-47b1-a330-1836435a6f1b', // Myélome multiple
  '548193b1-71fd-42cb-b1c3-363d4eb8febb', // Lymphomes hodgkinien et non hodgkinien
  '431ccaf3-842b-47f4-9065-2db86d4cbe32', // Syndromes myéloprolifératifs
  'd5ab5e2f-4df7-48a8-8264-61aa1116993b', // Thrombopénie
  '3be03e90-b1d9-4d9c-89fe-fe0d222dc597', // Adénopathies et splénomégalie
  '16f9a1ad-5f83-4d9c-abf2-a80422d3bbd9', // Prescription et surveillance des anticoagulants
  '27389db3-72b1-4883-97b5-d86bd704ffd6', // Transfusion sanguine
  '18a26139-a533-4a1e-8d70-a006854d9b09', // Hyperéosinophilie et syndrome mononucléosique

  // Hépato-gastro-entérologie (fiche « HGE FICHES » = livret complet)
  '9e315bac-6318-4046-8aea-0f8d6f3a87e1', // Anomalies du bilan hépatique et ictère
  '08582015-bfdd-4771-a3f0-cef7e4dea878', // Cirrhose
  '6444a66f-d250-41f6-ac58-09b277c0c757', // Hépatites virales
  'f6fb8ba0-bce4-4ce1-bf2d-93d377502c88', // Pathologie gastro-duodénale et RGO
  'c4424af7-1d82-41ff-8371-f33de79a02e3', // Pathologie biliaire et pancréatique
  '5bf6ed18-d70f-422b-b267-e28fcd2f50b2', // Urgences et pathologies fonctionnelles digestives

  // Maladies infectieuses (3 fichiers = livret complet)
  'ba8fc71a-c3eb-42d6-a3e1-9e9ef4de8b32', // Antibiotiques
  'e98ffbcc-5d11-4f1b-9b23-0b18d4fdf6b0', // Fièvre
  'b4eaff25-3887-4d9f-9f7a-a28ca4deef25', // Méningites et méningo-encéphalites
  'a2561aa6-6195-4a74-8201-518018582a61', // Paludisme
  '6f9d18b9-a3e6-4368-9502-007277257776', // Vaccinations
  '3ce8a986-06cc-4831-b71d-4220ab2a04cc', // Infections spécifiques (dont grippe)

  // Dossier « FICHES NEPHROLOGIE » (mappé vers plusieurs collèges MG)
  'a6466920-bc1c-4754-b2e2-1cd8e9cea80e', // Réanimation — Anomalies du bilan du potassium
  '0431ecdf-a9eb-4bbd-9476-bf3e5f1550da', // Réanimation — Anomalies du bilan de l'eau et du sodium
  '3ece1bf7-9020-497b-863a-9443fa4326f6', // Néphrologie — Rappels physiologiques et outils diagnostiques (élévation créatinine)
  '347c04c1-08b6-4457-aec7-7e7b0d818639', // Urologie — Hématurie
  'f7a664a7-60dd-40e8-9757-975272aa144d', // Néphrologie — Maladie rénale chronique
  '1c893317-cac4-41ab-bf7c-72a29d0c39d3', // Pharmacologie — Diurétiques

  // Neurologie
  '93743aa0-34b6-43aa-94f0-8a33aba111bb', // AVC : Généralités et AIC
  '814be3b8-d092-4640-b533-453b0a85d2be', // Épilepsie
  '2f5d2fcd-0b1d-42b2-9e85-017a0f2c456c', // Pathologies neurologiques spécifiques (Parkinson)

  // Ophtalmologie
  '5507f4ce-759b-4b10-9454-0935b745676d', // Altérations de la fonction visuelle — BAV brutale

  // ORL
  'ef1cdd6e-c7e2-4bfd-abb0-327adf4b699d', // Altération de la fonction auditive

  // Pneumologie (fiche « FICHES PNEUMOLOGIE 2025 » = livret complet)
  'a7760386-561e-4c9c-ba13-d9e13075ca12', // Asthme
  '9e970025-d7e3-4445-8c9e-964f8b03f871', // BPCO
  '5b008441-54ef-439e-b72f-c2ea82a13afb', // Sémiologie et urgences respiratoires
  'cb0186f1-e517-4409-9d9d-43e36ef5ae82', // Épanchement pleural et pneumothorax
  '2408bcb9-6d67-4a0d-8066-4ceabae1eb78', // Imagerie et EFR
  'd370b0b8-0b0c-45b5-8dfb-f303d83f7a33', // Pathologies respiratoires spécifiques (IRC + pneumonie)

  // Rhumatologie
  '2ebc5f0a-dcae-4ea4-b9f0-775ffea6aeb2', // Douleur et thérapeutiques antalgiques

  // Urologie
  '6ade0a63-4d55-43f8-8021-fede4822f2c0', // Cancer de la prostate
  '1cc55abb-6be4-4f11-8a35-054c9472939a', // Infections génitales et HBP
  'bce946d4-2211-4319-b92a-e57007aa8602', // Infections urinaires
  '0cab0cb5-dbe0-4536-91c0-8a4dc1f0629d', // Rétention aiguë d'urine
];

export const GERIATRIE_COLLEGE_ID = 'col-geriatrie';
export const MG_COLLEGE_ID = 'col-medecine-generale';

/**
 * Ajoute le bonus MG au scope d'un élève inscrit en Gériatrie. No-op si
 * `col-geriatrie` n'est pas dans `colleges`. `admin` doit être un client
 * service-role (lecture de `cours` insensible à la RLS).
 */
export async function applyGeriatrieMgBonus(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  colleges: string[],
  cours: string[] | null | undefined,
): Promise<{ colleges: string[]; cours: string[] | undefined }> {
  if (!colleges.includes(GERIATRIE_COLLEGE_ID)) {
    return { colleges, cours: cours && cours.length > 0 ? cours : undefined };
  }

  const [{ data: geriatrieCours }, { data: bonusCours }] = await Promise.all([
    admin.from('cours').select('id').eq('matiere_id', GERIATRIE_COLLEGE_ID),
    admin.from('cours').select('matiere_id').in('id', GERIATRIE_MG_BONUS_COURS_IDS),
  ]);
  const geriatrieCoursIds = ((geriatrieCours ?? []) as { id: string }[]).map((c) => c.id);
  const bonusSubCollegeIds = Array.from(new Set(
    ((bonusCours ?? []) as { matiere_id: string }[]).map((c) => c.matiere_id),
  ));

  const mergedCours = Array.from(new Set([
    ...(cours ?? []),
    ...geriatrieCoursIds,
    ...GERIATRIE_MG_BONUS_COURS_IDS,
  ]));
  const mergedColleges = Array.from(new Set([...colleges, MG_COLLEGE_ID, ...bonusSubCollegeIds]));

  return { colleges: mergedColleges, cours: mergedCours };
}
