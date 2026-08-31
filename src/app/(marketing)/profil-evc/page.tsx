import type { Metadata } from 'next';
import { ProfilDiagnostic } from '@/components/marketing/profil-evc/profil-diagnostic';

export const metadata: Metadata = {
  title: 'Profil EVC : diagnostic gratuit de votre préparation',
  description:
    'Évaluez gratuitement votre préparation aux EVC en moins de 3 minutes. Obtenez votre profil personnalisé, vos points forts, vos axes de progression et des recommandations concrètes.',
  alternates: { canonical: '/profil-evc' },
  openGraph: {
    title: 'Profil EVC gratuit — Diagnostic de votre préparation',
    description:
      'Découvrez votre profil EVC en 3 minutes : points forts, axes de progression et recommandations personnalisées Major ECN.',
    url: '/profil-evc',
    type: 'website',
  },
};

export default function ProfilEvcPage() {
  return (
    <div className="min-h-screen bg-[#F4F6FB] px-3 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-40px_rgba(15,31,77,0.4)]">
        <ProfilDiagnostic startStep="intro" />
      </div>
    </div>
  );
}
