/**
 * Squelette d'un onglet de « Mon planning » : affiché dès le clic, sous
 * l'en-tête et les onglets (qui appartiennent au layout et restent en place),
 * pendant que le serveur prépare la page.
 */
export default function PlanificateurLoading() {
  return (
    <div className="mt-[10px] animate-pulse" aria-busy="true" aria-label="Chargement de votre planning">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2 sm:pl-[8px]">
          <div className="h-9 w-56 rounded-lg bg-(--pl-rose-100)" />
          <div className="h-4 w-80 max-w-full rounded bg-(--pl-off)" />
        </div>
        <div className="h-[70px] w-[280px] rounded-[12px] bg-(--pl-rose-75) max-sm:w-full" />
      </div>
      <div className="pl-card mt-5 p-5">
        <div className="h-5 w-64 rounded bg-(--pl-off)" />
        <div className="mt-3 h-3 w-96 max-w-full rounded bg-(--pl-off)" />
        <div className="mt-4 flex gap-2">
          <div className="h-10 w-44 rounded-xl bg-(--pl-rose-100)" />
          <div className="h-10 w-36 rounded-xl bg-(--pl-off)" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pl-card flex items-center gap-4 p-4">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-(--pl-rose-100)" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/5 rounded bg-(--pl-off)" />
              <div className="h-3 w-3/5 rounded bg-(--pl-off)" />
            </div>
            <div className="h-10 w-28 shrink-0 rounded-xl bg-(--pl-off)" />
          </div>
        ))}
      </div>
    </div>
  );
}
