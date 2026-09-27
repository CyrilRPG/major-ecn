# Annales — questions dont les données manquent dans toutes les sources du dépôt

Audit du 27/09/2026 (toutes les annales confrontées aux sujets officiels et aux
corrigés, `tmp/audit-dp-rev/journal-<collège>.md`). Ces questions demandent un
document ou des résultats qu'AUCUNE source de `Annales/` ne contient : pas de
sujet officiel pour la session (le dépôt n'en a aucun après 2020 EVCF), et le
corrigé ne donne que la réponse. Rien n'a été inventé.

Tant qu'elles restent en l'état, la garde `src/lib/qcm/donnees-manquantes.ts`
écarte des sessions de révision celles qu'elle sait détecter (marquées ◆).
Pour les compléter : se procurer le sujet officiel de la session (CNG), puis
suivre scripts/annales/README.md (« Retoucher du contenu déjà publié »).

| Série | Question(s) | Ce qui manque |
|---|---|---|
| Médecine d'urgence 2018 EVCF | Q5 ◆ | valeurs du LCR |
| Médecine d'urgence 2020 EVCF | Q6 ◆ | valeurs de la gazométrie |
| Médecine d'urgence 2020 EVCP Sujet 1 | Q4 ◆ (Q5 en dépend) | tracé ECG |
| Médecine d'urgence 2020 EVCP Sujet 2 | Q3, Q6 ◆ | résultats (biologie, β-hCG), image d'échographie |
| Médecine d'urgence 2021 EVCF | Q12 ◆ | tracé ECG |
| Médecine d'urgence 2021 EVCP Sujet 1 | Q1 | observation (constantes, examen) |
| Médecine d'urgence 2021 EVCP Sujet 2 | Q3, Q5 ◆ | constantes à l'arrivée, gaz du sang |
| Psychiatrie 2009 EVCP, 2014 EVCP | cas entier | observation clinique (« Analysez ce tableau clinique ») |
| Médecine générale 2014 EVCP | Q28 | posologie d'interdose proposée par le sujet |
| Gériatrie 2018 EVCF Sujet 1 | Q1 à Q8 | vignette : ionogramme, traitement, évolution |
| Gériatrie 2018 EVCF Sujet 2 | Q1 ◆, Q2, Q4 à Q6 | vignette, hémogramme |
| Gériatrie 2018 EVCF Sujet 3 | Q1 à Q3, Q5 | vignette, traitement |
| Gériatrie 2018 EVCF Sujet 4 | Q2, Q3 | âge, sexe, antécédents (CHA₂DS₂-VASc) |
| Gériatrie 2020 EVCP Sujet 1 | Q1, Q2 | signes cliniques, biologie |
| Gériatrie 2021 EVCP | Q5, Q11 ◆, Q9, Q10, Q12 | imagerie cérébrale, ECG, évolution |
| Anesthésie-Réanimation 2024 EVCP Cas 1 | Q3, Q7 | examen neurologique, hémocultures et cathéter |
| Anesthésie-Réanimation 2025 EVCP Dossier 1 | Q8 | photographie de l'épreuve ; l'image rattachée contredit la réponse attendue — à arbitrer |
| Orthopédie 2023 EVCP Canal lombaire étroit | Q2 ◆, Q3 ◆ | radiographie, IRM |
| Pneumologie 2023 EVCP Dossier 2 | Q2 ◆ | bilan biologique « ci-joint », angioscanner |
| Pneumologie 2023 EVCF | Q6 | image du scanner (le corrigé : « Image non disponible ») |

Hors annales, mêmes causes : « Séance du professeur - Pneumologie · Asthme »
Q2 ◆ (radiographie absente des supports) et « REVISION GENERALE » (Tour général
de révision), question « La radiographie thoracique est la suivante » ◆ (syndrome thoracique aigu de Louise, drépanocytaire).
