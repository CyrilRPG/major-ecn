"use client";

export default function ArenaError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-xl p-8 text-center text-white" role="alert">
    <h1 className="text-2xl font-bold">Impossible de charger votre Arena</h1>
    <p className="my-4">Les données n’ont pas pu être récupérées. Réessayez pour afficher vos informations à jour.</p>
    <button className="ae-button" onClick={reset}>Réessayer</button>
  </section>;
}
