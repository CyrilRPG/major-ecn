'use client';

import { useEffect, useState } from 'react';
import { RotateCw, Home } from 'lucide-react';

/**
 * Filet de sécurité GLOBAL des pages : sans lui, la moindre exception côté
 * client affichait l'écran par défaut de Next.js, en anglais et sans issue
 * (« Application error: a client-side exception has occurred » — rapporté par
 * les élèves comme « this page couldn't load », notamment sur les fiches).
 *
 * Cas le plus fréquent : après un déploiement, un navigateur qui a gardé
 * l'ancienne version du site en cache demande un fichier JavaScript qui
 * n'existe plus (ChunkLoadError). Un simple rechargement récupère la
 * nouvelle version → on le fait automatiquement, UNE seule fois, avant
 * même d'afficher quoi que ce soit.
 */

function isStaleBuildError(error: Error): boolean {
  const text = `${error.name} ${error.message}`;
  return /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed|text\/html.*module script|Failed to fetch/i.test(
    text,
  );
}

export default function RouteError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // `null` = décision en cours (on n'affiche rien pendant le rechargement auto).
  const [show, setShow] = useState(false);

  useEffect(() => {
    console.error('[error-boundary]', error);
    if (isStaleBuildError(error)) {
      // Un seul rechargement automatique par page : au-delà, l'erreur n'est
      // pas un simple cache périmé et on doit l'afficher.
      const key = `mecn-reload:${window.location.pathname}`;
      let already = false;
      try {
        already = sessionStorage.getItem(key) === '1';
        if (!already) sessionStorage.setItem(key, '1');
      } catch {
        /* stockage indisponible (navigation privée stricte) */
      }
      if (!already) {
        window.location.reload();
        return;
      }
    }
    const timer = setTimeout(() => setShow(true), 0);
    return () => clearTimeout(timer);
  }, [error]);

  if (!show) return null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-center shadow-sm">
        <p className="text-4xl">😕</p>
        <h1 className="mt-3 text-lg font-bold text-(--color-ink)">
          Cette page n’a pas pu s’afficher
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-(--color-ink-soft)">
          Une erreur est survenue lors du chargement. Rechargez la page : dans la
          grande majorité des cas, tout rentre dans l’ordre. Si le problème
          persiste, contactez-nous à{' '}
          <a href="mailto:contact@major-ecn.fr" className="font-semibold underline">
            contact@major-ecn.fr
          </a>
          .
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem(`mecn-reload:${window.location.pathname}`);
              } catch {
                /* ignore */
              }
              // Rechargement complet plutôt que reset() : récupère aussi la
              // dernière version du site quand le cache était périmé.
              window.location.reload();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C0001F] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
          >
            <RotateCw className="h-4 w-4" /> Recharger la page
          </button>
          <a
            href="/app"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm font-semibold text-(--color-ink) hover:bg-(--color-sand-100)"
          >
            <Home className="h-4 w-4" /> Retour à l’accueil
          </a>
        </div>
        {error.digest && (
          <p className="mt-4 text-[11px] text-(--color-ink-muted)">Code : {error.digest}</p>
        )}
      </div>
    </div>
  );
}
