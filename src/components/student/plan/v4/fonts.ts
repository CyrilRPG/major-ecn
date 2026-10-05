import { Allura, Source_Serif_4 } from 'next/font/google';

/**
 * Typographies de l'espace « Mon planning » (maquettes validées) : titres en
 * serif, accroches manuscrites ; le texte courant est celui de la plateforme
 * (Manrope), identique à la maquette.
 */
export const planSerif = Source_Serif_4({ subsets: ['latin'], weight: ['600', '700'], display: 'swap', variable: '--font-plan-serif' });
export const planScript = Allura({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-plan-script' });
