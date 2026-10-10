import type { Emplacement, Placement, Postit, Tache } from '../src/lib/postits/regles';

/** Fabrique de Post-it pour les tests purs (tests/postits-*.test.ts). */
export const COURS = '11111111-2222-4333-8444-555555555555';
export const SERIE = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

let n = 0;
const id = (prefixe: string) => `${prefixe}-${++n}`;

export function emplacement(cle: string, e: Partial<Emplacement> = {}): Emplacement {
  return { cle, type: 'item', matiereId: null, matiereNom: null, coursId: null, coursTitre: null, ressourceId: null, ressourceTitre: null, ...e };
}

export function placement(cle: string, e: Partial<Placement> = {}): Placement {
  return { ...emplacement(cle, e), id: id('pl'), x: 10, y: 100, w: 260, h: 250, z: 0, reduit: false, ...e };
}

export function tache(t: Partial<Tache> = {}): Tache {
  return { id: id('t'), texte: 'Tâche', fait: false, faitLe: null, ordre: 0, date: null, heure: null, rappels: [], dansAgenda: true, ...t };
}

export function postit(p: Partial<Postit> = {}): Postit {
  return {
    id: id('p'),
    titre: 'Note',
    contenu: '',
    couleur: 'jaune',
    taille: 'moyen',
    statut: 'actif',
    creeLe: '2026-10-09T10:00:00.000Z',
    modifieLe: '2026-10-09T10:00:00.000Z',
    archiveLe: null,
    supprimeLe: null,
    origine: { ...emplacement('accueil', { type: 'accueil' }), chemin: '/accueil' },
    placements: [placement('accueil', { type: 'accueil' })],
    taches: [],
    ...p,
  };
}
