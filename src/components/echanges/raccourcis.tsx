'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, GraduationCap, Inbox, MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import type { ResumeEchangesDTO } from '@/lib/echanges/types';

type Leger = Pick<ResumeEchangesDTO, 'actif' | 'totalNonLus' | 'reponsesEnseignant' | 'questionsATraiter'> & { groupes: number };

const EVENEMENT = 'echanges:resume';
let partage: { at: number; valeur: Leger | null; enCours: Promise<Leger | null> | null } = { at: 0, valeur: null, enCours: null };

/**
 * Compteurs des Échanges partagés par le menu, la barre du haut et l'accueil
 * (une seule requête légère, rafraîchie toutes les 60 s). Une panne du module
 * n'affecte rien d'autre : le raccourci disparaît simplement (§141).
 */
async function lire(force = false): Promise<Leger | null> {
  if (!force && partage.valeur && Date.now() - partage.at < 20_000) return partage.valeur;
  if (partage.enCours) return partage.enCours;
  partage.enCours = (async () => {
    try {
      const r = await fetchAuthentifie('/api/echanges?leger=1', { cache: 'no-store' });
      if (!r.ok) return null;
      const j = (await r.json()) as ResumeEchangesDTO;
      const v: Leger = { actif: j.actif, totalNonLus: j.totalNonLus, reponsesEnseignant: j.reponsesEnseignant, questionsATraiter: j.questionsATraiter, groupes: j.groupes.length };
      partage = { at: Date.now(), valeur: v, enCours: null };
      window.dispatchEvent(new Event(EVENEMENT));
      return v;
    } catch {
      return null;
    } finally {
      partage.enCours = null;
    }
  })();
  return partage.enCours;
}

/** À appeler après une lecture ou une publication : menu, barre du haut et accueil se mettent à jour. */
export function rafraichirResumeEchanges() {
  void lire(true);
}

export function useResumeEchanges(): Leger | null {
  const [v, setV] = useState<Leger | null>(partage.valeur);
  const pathname = usePathname();
  useEffect(() => {
    let vivant = true;
    void lire().then((x) => { if (vivant) setV(x); });
    const maj = () => setV(partage.valeur);
    window.addEventListener(EVENEMENT, maj);
    const t = window.setInterval(() => { if (document.visibilityState === 'visible') void lire(true); }, 60_000);
    return () => { vivant = false; window.removeEventListener(EVENEMENT, maj); window.clearInterval(t); };
  }, []);
  // Retour d'une conversation : compteurs à jour.
  useEffect(() => { if (!pathname.startsWith('/echanges')) void lire(true); }, [pathname]);
  return v;
}

const visible = (v: Leger | null) => !!v && (v.groupes > 0 || v.questionsATraiter > 0);

/** Entrée du menu latéral (accès principal, §2). */
export function EntreeMenuEchanges({ actif, classe }: { actif: boolean; classe: string }) {
  const v = useResumeEchanges();
  if (!visible(v)) return null;
  const n = (v?.totalNonLus ?? 0) + (v?.questionsATraiter ?? 0);
  return (
    <Link href="/echanges" aria-current={actif ? 'page' : undefined} className={classe}>
      <MessagesSquare className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1">Échanges</span>
      {n > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E4002B] px-1.5 text-[11px] font-bold tabular-nums text-white">{n > 99 ? '99+' : n}</span>}
    </Link>
  );
}

/** Bouton de la barre du haut : très visible sur téléphone (§3). */
export function BoutonEchanges() {
  const v = useResumeEchanges();
  if (!visible(v)) return null;
  const n = (v?.totalNonLus ?? 0) + (v?.questionsATraiter ?? 0);
  return (
    <Link href="/echanges" aria-label={n > 0 ? `Échanges (${n} non lu${n > 1 ? 's' : ''})` : 'Échanges'}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-(--color-ink-soft) transition-colors hover:bg-(--color-surface-soft) hover:text-(--color-ink) focus-ring">
      <MessagesSquare className="h-[18px] w-[18px]" />
      {n > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E4002B] px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-(--color-surface)">{n > 9 ? '9+' : n}</span>
      )}
    </Link>
  );
}

/** Carte du tableau de bord : « Échanges — 12 nouveaux messages, 1 réponse de votre enseignant » (§3). */
export function CarteEchanges({ className }: { className?: string }) {
  const v = useResumeEchanges();
  if (!visible(v)) return null;
  const n = v?.totalNonLus ?? 0;
  const r = v?.reponsesEnseignant ?? 0;
  const q = v?.questionsATraiter ?? 0;
  return (
    <Link href={q > 0 ? '/echanges/questions' : '/echanges'} className={cn('group flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm transition-shadow hover:shadow-(--shadow-lifted)', className)}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#102C5F] text-white">
        {q > 0 ? <Inbox className="h-6 w-6" /> : <MessagesSquare className="h-6 w-6" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold text-(--color-ink)">Échanges</span>
        <span className="block text-[13.5px] text-(--color-ink-soft)">
          {q > 0 ? `${q} question${q > 1 ? 's' : ''} vous ${q > 1 ? 'sont adressées' : 'est adressée'}`
            : n > 0 ? `${n} nouveau${n > 1 ? 'x' : ''} message${n > 1 ? 's' : ''}` : 'Retrouvez votre promotion'}
        </span>
        {r > 0 && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#102C5F]/10 px-2 py-0.5 text-[12px] font-bold text-[#102C5F] dark:bg-white/10 dark:text-white">
            <GraduationCap className="h-3.5 w-3.5" />{r} réponse{r > 1 ? 's' : ''} de votre enseignant
          </span>
        )}
      </span>
      <ArrowRight className="h-5 w-5 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/**
 * « 💬 Poser une question » depuis un contenu pédagogique (§64) : ouvre les
 * Échanges avec le contexte joint (« Question concernant : Item 162 — … »).
 */
export function BoutonPoserQuestion({ type, id, compact = false }: { type: string; id: string; compact?: boolean }) {
  const v = useResumeEchanges();
  if (!v || v.groupes === 0) return null;
  return (
    <Link href={`/echanges/nouveau?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`}
      title="Poser une question à votre promotion ou à un enseignant"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 text-sm font-semibold text-[#102C5F] transition-colors hover:border-[#102C5F] focus-ring dark:text-white sm:px-3">
      <MessagesSquare className="h-4 w-4" />
      <span className={compact ? 'sr-only' : 'hidden sm:inline'}>Poser une question</span>
    </Link>
  );
}
