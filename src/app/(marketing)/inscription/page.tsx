import { ClipboardCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { InscriptionForm } from '@/components/marketing/inscription-form';

export const metadata = {
  title: 'Inscription — Major ECN',
  description:
    '7 jours d’essai gratuit, sans engagement. Accès immédiat à la plateforme Major ECN.',
};

export default async function InscriptionPage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#E8E7E3] bg-gradient-to-br from-white to-[#FAFAF8] p-4 text-center shadow-sm sm:p-8 lg:p-12">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full blur-[100px]"
            style={{ background: 'rgba(107,26,42,0.18)' }}
          />
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ background: 'rgba(107,26,42,0.10)', color: '#6B1A2A' }}
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Démarrez en 30 secondes
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#2D2D2D] sm:text-4xl lg:text-5xl">
            Créez votre compte
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#5A5A5A]">
            7 jours d’essai gratuit, sans engagement. Accès immédiat à toute la plateforme par
            email d’activation.
          </p>

          <InscriptionForm colleges={colleges} />

          <p className="mt-4 text-xs text-[#7A7A7A]">
            ✓ Annulation instantanée · Aucune carte bancaire requise pendant l’essai
          </p>
        </div>
      </div>
    </section>
  );
}
