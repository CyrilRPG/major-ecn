// Le worker de pdf.js n'a pas de déclaration de types : on l'importe uniquement
// pour son effet de bord (il se déclare dans `globalThis.pdfjsWorker`), cf.
// src/lib/ai/exercise-import-verite.ts.
declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs';
