import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Espace Privé',
  robots: { index: false, follow: false },
};

export default function CyrilwisaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
