import type { Metadata } from 'next';

/**
 * Segment de réservation par lien sécurisé (§7) : page minimale, thème clair,
 * sans en-tête marketing ni navigation. Le candidat n'est pas forcément
 * connecté ; le jeton dans l'URL suffit et n'est jamais indexé.
 */
export const metadata: Metadata = {
  title: 'Réserver mon créneau · Major ECN',
  robots: { index: false, follow: false },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="light min-h-screen bg-[#F4F5F8] text-[#14254E] antialiased" style={{ colorScheme: 'light' }}>
      <header className="border-b border-[#E6E8EE] bg-white">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-4">
          <span className="text-base font-bold tracking-tight text-[#C0112E]">Major ECN</span>
          <span className="ml-3 text-sm text-[#6B7280]">Suivi individuel</span>
        </div>
      </header>
      {children}
    </div>
  );
}
