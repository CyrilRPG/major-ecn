/**
 * Pages légales ouvertes DEPUIS L'APPLICATION MOBILE (/info/*) : même contenu
 * que le site, mais sans en-tête marketing, pied de page, barre « S'inscrire »
 * ni lien vers l'accueil (règle App Store 3.1.1 : aucun chemin vers une page
 * d'achat depuis l'app). Non indexées : le site garde ses URL canoniques.
 */
export const metadata = { robots: { index: false, follow: false } };

export default function AppEmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-embed theme-manus min-h-screen bg-(--color-surface) font-sans text-(--color-ink)">
      <style>{'.app-embed [data-hors-app]{display:none!important}'}</style>
      {children}
    </div>
  );
}
