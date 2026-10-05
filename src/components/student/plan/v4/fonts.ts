import { Allura } from 'next/font/google';

/**
 * Typographies de l'espace « Mon planning ».
 *
 * Les titres suivent désormais la charte commune des pages élève (Plus Jakarta
 * Sans du site vitrine, déjà chargée par le layout racine) : l'ancien serif de
 * la maquette rendait la rubrique trop différente du reste de la plateforme,
 * et c'était une police de plus à télécharger. `planSerif` garde son nom pour
 * ne pas toucher aux écrans qui l'utilisent. L'accroche manuscrite reste.
 */
export const planSerif = { className: 'font-(family-name:--font-jakarta) tracking-[-0.015em]' } as const;
export const planScript = Allura({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-plan-script' });
