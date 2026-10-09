'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, FileText, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cesure } from '@/lib/cesure';
import type { SujetAgenda } from '@/lib/agenda/sujets';

/**
 * « Sujet disponible » dans l'agenda élève (cf. `lib/agenda/sujets.ts`).
 * Aucun document n'est servi ici : « Ouvrir la séance » mène à la page de la
 * séance, qui applique permissions, déblocage et filigrane.
 */

const STYLE = {
  sujet: { fond: '#E7F6EC', encre: '#16793C', libelle: 'Sujet disponible', Icone: FileText },
  replay: { fond: '#F1E8FD', encre: '#5B2BB8', libelle: 'Replay disponible', Icone: PlayCircle },
} as const;

const documents = (n: number) => (n > 0 ? `${n} document${n > 1 ? 's' : ''} à préparer` : null);

/** Pastille posée sur la carte d'une séance de l'agenda. */
export function PastilleSujet({ sujets }: { sujets: readonly SujetAgenda[] }) {
  if (sujets.length === 0) return null;
  const s = STYLE[sujets.some((x) => x.etat === 'sujet') ? 'sujet' : 'replay'];
  return (
    <span
      className="mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: s.fond, color: s.encre }}
    >
      <s.Icone className="h-3 w-3" />
      {s.libelle}
    </span>
  );
}

/** Carte d'un sujet sans séance correspondante dans l'agenda. */
export function CarteSujet({ sujet, onOpen, style }: { sujet: SujetAgenda; onOpen: () => void; style?: React.CSSProperties }) {
  const s = STYLE[sujet.etat];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-w-0 flex-col rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-soft) focus-ring"
      style={{ background: s.fond, borderColor: `${s.encre}33`, ...style }}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: s.encre }}>
        <Clock className="h-3.5 w-3.5" />
        {sujet.heure}
      </span>
      <span className="mt-2 block text-sm font-semibold leading-snug text-(--color-ink) hyphens-manual [overflow-wrap:anywhere]">
        {cesure(sujet.titre)}
      </span>
      {sujet.specialite && <span className="mt-1 text-[11px] text-(--color-ink-soft)">{sujet.specialite}</span>}
      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold" style={{ color: s.encre }}>
        <s.Icone className="h-3 w-3" />
        {s.libelle}
      </span>
    </button>
  );
}

/** Encadré « Sujet disponible — Ouvrir la séance » (dialogue d'une séance). */
export function BlocSujets({ sujets }: { sujets: readonly SujetAgenda[] }) {
  if (sujets.length === 0) return null;
  return (
    <div className="space-y-2">
      {sujets.map((sujet) => {
        const s = STYLE[sujet.etat];
        const detail = sujet.etat === 'sujet'
          ? documents(sujet.nbDocuments) ?? 'Séance en ligne'
          : 'La vidéo de la séance est en ligne.';
        return (
          <div key={sujet.id} className="rounded-xl border p-3" style={{ background: s.fond, borderColor: `${s.encre}33` }}>
            <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: s.encre }}>
              <s.Icone className="h-4 w-4" />
              {s.libelle}
            </p>
            <p className="mt-0.5 text-xs text-(--color-ink-soft)">
              {sujet.titre}{sujet.specialite ? ` · ${sujet.specialite}` : ''} — {detail}
            </p>
            <Link
              href={sujet.href}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              style={{ background: s.encre }}
            >
              Ouvrir la séance <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

/** Dialogue d'un sujet sans séance correspondante dans l'agenda. */
export function DialogueSujet({ sujet, onClose }: { sujet: SujetAgenda | null; onClose: () => void }) {
  return (
    <Dialog open={sujet != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {sujet && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-(--color-primary)" />
                {sujet.titre}
              </DialogTitle>
              {sujet.specialite && <DialogDescription>{sujet.specialite}</DialogDescription>}
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-(--color-ink)">
                <CalendarDays className="h-4 w-4 text-(--color-ink-muted)" />
                {new Date(`${sujet.date}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </div>
              <div className="flex items-center gap-2.5 text-(--color-ink)">
                <Clock className="h-4 w-4 text-(--color-ink-muted)" />
                {sujet.heure}
              </div>
              <BlocSujets sujets={[sujet]} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
