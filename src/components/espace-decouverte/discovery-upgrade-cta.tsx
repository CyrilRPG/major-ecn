/**
 * Mini-CTA pour la sidebar de l'accueil étudiant en mode Découverte.
 * S'affiche uniquement pour les utilisateurs ayant le scope `col-decouverte`
 * et pousse vers /tarifs.
 */
import Link from 'next/link';
import { ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { APPROFONDI_FROM_LABEL } from '@/lib/stripe/approfondi';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';

const FORMULES: { name: string; price: string }[] = [
  { name: 'Essentielle', price: '495 €' },
  { name: 'Intensive',   price: '995 €' },
  { name: 'Approfondi',  price: APPROFONDI_FROM_LABEL },
];

export function DiscoveryUpgradeCta() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{
        background: 'linear-gradient(135deg, #0F1F4D 0%, #5C1827 60%, #C0112E 100%)',
        borderColor: 'rgba(192,17,46,0.30)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Halos */}
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-3xl"
        style={{ background: '#F5C84B' }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{ background: '#FFFFFF' }} />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur">
          <Sparkles className="h-3 w-3" />
          Espace Découverte
        </span>

        <h3 className="mt-3 text-[16px] font-black leading-tight text-white">
          Préparez sérieusement vos EVC avec Major&nbsp;ECN
        </h3>
        <p className="mt-2 text-[12px] leading-relaxed text-white/85">
          Accédez à toutes les fiches, QCM, flashcards, cas cliniques, méthodologie EVC
          et au suivi pédagogique de votre formule.
        </p>

        <ul className="mt-3 space-y-1.5">
          {FORMULES.map((f) => (
            <li key={f.name}
              className="flex items-center justify-between rounded-lg bg-white/8 px-3 py-1.5 text-[11.5px] backdrop-blur"
              style={{ background: 'rgba(255,255,255,0.10)' }}
            >
              <span className="font-extrabold text-white">{f.name}</span>
              <span className="font-black tabular-nums" style={{ color: '#F5C84B' }}>{f.price}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/tarifs"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12.5px] font-extrabold shadow-md transition-transform hover:scale-[1.02]"
          style={{ background: '#FFFFFF', color: RED_DEEP }}
        >
          <Trophy className="h-3.5 w-3.5" style={{ color: RED }} />
          Voir toutes les formules
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <p className="mt-3 text-center text-[10.5px] text-white/70">
          Paiement sécurisé · 1, 3 ou 4 fois · Sans engagement
        </p>
      </div>
      {/* Pour les linters strict-null sur les couleurs imports */}
      <span hidden style={{ color: NAVY }} aria-hidden />
    </div>
  );
}
