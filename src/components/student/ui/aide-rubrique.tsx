'use client';

import Link from 'next/link';
import { ArrowRight, CircleHelp, Clock, Compass, Workflow } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BOUCLE, RUBRIQUES, type RubriqueCle } from '@/lib/student/rubriques';
import { cn } from '@/lib/utils';

/**
 * Aide « ? » de l'en-tête d'une page élève : à quoi sert la page, quand
 * l'utiliser, sa place dans la boucle pédagogique (Mesurer → Prioriser →
 * Planifier → Réviser), avec des raccourcis vers les rubriques liées.
 * Contenu : registre lib/student/rubriques.
 */
export function AideRubrique({ cle }: { cle: RubriqueCle }) {
  const r = RUBRIQUES[cle];
  const etape = BOUCLE.findIndex((b) => b.rubriques.includes(cle));
  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[12.5px] font-semibold text-white/90 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/[0.16] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C84B]/80"
        aria-label={`À quoi sert « ${r.label} » ?`}
      >
        <CircleHelp className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">À quoi ça sert ?</span>
      </DialogTrigger>
      <DialogContent className="max-w-lg gap-0 p-0 [&>button:last-child]:text-white/80 [&>button:last-child]:hover:bg-white/10 [&>button:last-child]:hover:text-white">
        <div className="rounded-t-[inherit] bg-[linear-gradient(135deg,#0E1626_0%,#2A1130_70%,#2D0518_100%)] px-6 pb-5 pt-6 text-white">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5C84B]">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/15"><r.Icon className="h-3.5 w-3.5" aria-hidden /></span>
            Guide de la rubrique
          </p>
          <DialogTitle className="mt-2 font-(family-name:--font-jakarta) text-2xl font-extrabold tracking-[-0.02em] text-white">{r.label}</DialogTitle>
          <DialogDescription className="mt-1.5 text-sm leading-relaxed text-white/75">{r.role}</DialogDescription>
        </div>

        <div className="space-y-4 px-6 py-5">
          <Bloc Icon={Clock} titre="Quand l’utiliser">{r.quand}</Bloc>
          <Bloc Icon={Workflow} titre="Sa place dans votre préparation">{r.lien}</Bloc>

          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B0E22]"><Compass className="h-3.5 w-3.5" aria-hidden /> La boucle Major ECN</p>
            <ol className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4" aria-label="Boucle pédagogique">
              {BOUCLE.map((b, i) => (
                <li
                  key={b.titre}
                  className={cn(
                    'rounded-xl border px-2.5 py-2 text-center text-[12px] font-semibold leading-tight',
                    i === etape ? 'border-transparent bg-[linear-gradient(90deg,#E4002B,#F97316)] text-white shadow-[0_8px_18px_-10px_rgba(228,0,43,0.8)]' : 'border-(--color-border) bg-(--color-surface-soft) text-(--color-ink-soft)',
                  )}
                  aria-current={i === etape ? 'step' : undefined}
                >
                  <span className="block text-[10px] font-bold opacity-70">{i + 1}</span>
                  {b.titre}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-xs leading-relaxed text-(--color-ink-muted)">
              {etape >= 0
                ? 'Chaque résultat repart dans la boucle : il met à jour vos priorités, qui réorganisent votre planning et vos révisions.'
                : 'Un outil à votre service, à côté de la boucle : Mesurer, Prioriser, Planifier, Réviser.'}
            </p>
          </div>

          {cle !== 'mode-emploi' && (
            <Link href="/mode-emploi" className="flex items-center justify-between gap-3 rounded-xl bg-(--color-surface-soft) px-3.5 py-2.5 text-[13px] font-semibold text-[#14254E] transition-colors hover:bg-[#FDF4F5] focus-ring">
              <span className="flex items-center gap-2"><Compass className="h-4 w-4 text-[#8B0E22]" aria-hidden /> Mode d’emploi complet de la plateforme</span>
              <ArrowRight className="h-4 w-4 text-(--color-ink-muted)" aria-hidden />
            </Link>
          )}

          {r.vers.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-(--color-border) pt-4">
              {r.vers.map((v) => {
                const cible = RUBRIQUES[v];
                return (
                  <Link key={v} href={cible.href} className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-border) px-3 py-2 text-[13px] font-semibold text-[#14254E] transition-colors hover:border-[#C0112E]/40 hover:bg-[#FDF4F5] focus-ring">
                    <cible.Icon className="h-4 w-4 text-[#8B0E22]" aria-hidden /> {cible.label} <ArrowRight className="h-3.5 w-3.5 text-(--color-ink-muted)" aria-hidden />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Bloc({ Icon, titre, children }: { Icon: typeof Clock; titre: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FDF4F5] text-[#8B0E22]"><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-[#14254E]">{titre}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-(--color-ink-soft)">{children}</p>
      </div>
    </div>
  );
}
