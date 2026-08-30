'use client';

/**
 * Filet ultime : erreur dans le layout racine lui-même. Rendu SANS le layout
 * (d'où les balises <html>/<body>), en français, avec un rechargement en un
 * clic — jamais l'écran anglais par défaut de Next.js.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#FAFBFE' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: '100%',
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 36, margin: 0 }}>😕</p>
            <h1 style={{ fontSize: 18, margin: '12px 0 8px', color: '#1A2233' }}>
              Cette page n’a pas pu s’afficher
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: '#52607A', margin: 0 }}>
              Une erreur est survenue lors du chargement. Rechargez la page : dans
              la grande majorité des cas, tout rentre dans l’ordre.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20,
                background: '#C0001F',
                color: '#fff',
                border: 0,
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Recharger la page
            </button>
            {error?.digest && (
              <p style={{ marginTop: 16, fontSize: 11, color: '#9AA1AE' }}>Code : {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
