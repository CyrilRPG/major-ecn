import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, CalendarClock, Check, Crown, Lock, Star, Trophy } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import {
  BAND_META, computeStates, formatOuverture, prochaineOuverture,
  type ParcoursLite, type ParcoursState,
} from '@/lib/parcours/parcours';
import { fetchCompletions, fetchParcoursList } from '@/lib/parcours/source';
import { parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';

export const metadata = { title: 'Parcours du Major' };
export const dynamic = 'force-dynamic';

export default async function ParcoursPage() {
  const { user, profile } = await requireUser();
  const isStaff = profile.role === 'admin';
  if (!isStaff) {
    const access = await fetchContentAccessForScope(parseScope(profile.permission_scope));
    if (!access.parcoursMajor) redirect('/accueil');
  }
  const supabase = await createClient();

  // Catalogue depuis la base si elle existe, sinon repli statique (data.ts).
  const [{ rows }, completions] = await Promise.all([
    fetchParcoursList(supabase),
    fetchCompletions(supabase, user.id),
  ]);
  const parcours: ParcoursLite[] = rows
    .filter((p) => p.active && (isStaff || new Date(p.available_at).getTime() <= Date.now()))
    .map((p) => ({ id: p.id, numero: p.numero, titre: p.titre, sousTitre: p.sous_titre, availableAt: p.available_at }));

  const now = new Date();
  // On calcule TOUJOURS les états « élève » (cadenas + dates d'ouverture) pour
  // que l'admin visualise le cheminement réel ; l'admin reste libre d'ouvrir
  // n'importe quel parcours (géré par `isStaff` dans chaque nœud).
  const states = computeStates(parcours, completions, now, false);

  const total = parcours.length;
  const done = completions.length;
  const maitrise = completions.filter((c) => c.band === 'maitrise').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const prochaine = prochaineOuverture(parcours, now);
  // L'élève est « à jour » : tous les parcours ouverts sont terminés.
  const ouverts = parcours.filter((p) => new Date(p.availableAt).getTime() <= now.getTime());
  const aJour = ouverts.length > 0 && ouverts.every((p) => states.get(p.id)?.kind === 'completed');

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      {/* Halo décoratif doré en fond */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(245,200,75,0.18) 0%, transparent 70%)' }}
      />

      {/* En-tête premium */}
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-[#E9D8A6] bg-[linear-gradient(135deg,#0E1626_0%,#2A1130_60%,#2D0518_100%)] px-6 py-7 text-white shadow-[0_24px_60px_-24px_rgba(45,5,24,0.55)]">
        <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 opacity-20">
          <Crown className="h-44 w-44" style={{ color: '#F5C84B' }} strokeWidth={1.2} />
        </span>
        <h1 className="text-3xl font-black tracking-tight">Parcours du Major</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
          Votre ascension vers le Major : {total} parcours qui se suivent, deux nouveaux chaque
          lundi. Terminez le précédent pour débloquer le suivant.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Stat icon={<Check className="h-3.5 w-3.5" />} label="Terminés" value={`${done}/${total}`} />
          <Stat icon={<Trophy className="h-3.5 w-3.5" />} label="Maîtrisés" value={`${maitrise}`} />
          <div className="min-w-[160px] flex-1">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-white/60">
              <span>Progression</span><span>{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#B8860B,#F5C84B)' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Bandeau « à jour → prochaine ouverture » */}
      {aJour && prochaine && (
        <div className="relative mb-6 flex items-center gap-3 rounded-2xl border border-[#E9D8A6] bg-[#FFFBEB] px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#F5C84B,#B8860B)] text-[#1F1400]">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#7A5B00]">Vous êtes à jour, bravo !</p>
            <p className="text-[13px] text-[#8A6D1F]">
              Prochain parcours : <strong>{formatOuverture(prochaine)}</strong>.
            </p>
          </div>
        </div>
      )}

      {parcours.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-4 py-10 text-center text-sm text-(--color-ink-muted)">
          Aucun parcours pour l’instant.
        </p>
      ) : (
        <ol className="relative">
          {parcours.map((p, i) => {
            const state = states.get(p.id) as ParcoursState;
            const isFuture = new Date(p.availableAt).getTime() > now.getTime();
            return (
              <ParcoursNode
                key={p.id}
                parcours={p}
                state={state}
                index={i}
                last={i === parcours.length - 1}
                isFuture={isFuture}
                isStaff={isStaff}
              />
            );
          })}
        </ol>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10" style={{ color: '#F5C84B' }}>{icon}</span>
      <span className="text-[13px]">
        <span className="font-bold">{value}</span>
        <span className="ml-1 text-white/55">{label}</span>
      </span>
    </div>
  );
}

/** Un maillon du chemin : pastille d'état à gauche, carte du parcours à droite,
 *  reliés par une ligne verticale dégradée façon « chemin de niveaux ». */
function ParcoursNode({
  parcours, state, index, last, isFuture, isStaff,
}: {
  parcours: ParcoursLite;
  state: ParcoursState;
  index: number;
  last: boolean;
  isFuture: boolean;
  isStaff: boolean;
}) {
  const completed = state.kind === 'completed';
  const current = state.kind === 'current';
  const lockedPrev = state.kind === 'locked_prev';
  const lockedDate = state.kind === 'locked_date';
  const jouable = current || completed || isStaff;
  // Valeurs narrow-safe extraites de l'union (les booléens ci-dessus ne
  // « narrow » pas `state` pour TypeScript).
  const cband = state.kind === 'completed' ? state.band : null;
  const cscore = state.kind === 'completed' ? state.score : null;
  const lockAt = state.kind === 'locked_date' ? state.availableAt : null;
  const band = cband ? BAND_META[cband] : null;

  // Couleur de la pastille selon l'état.
  const dotBg = completed
    ? `linear-gradient(135deg, ${band!.color}, color-mix(in srgb, ${band!.color} 70%, #000))`
    : current
      ? 'linear-gradient(135deg,#E4002B,#F97316)'
      : '#E5E7EB';
  const dotText = completed || current ? '#fff' : '#9AA3B8';

  const card = (
    <div
      className={
        'group relative flex-1 overflow-hidden rounded-2xl border px-4 py-3.5 transition-all '
        + (current
          ? 'border-[#F8B4B4] bg-[linear-gradient(135deg,#FFF5F5,#FFFFFF)] shadow-[0_14px_34px_-18px_rgba(228,0,43,0.5)] hover:-translate-y-0.5'
          : completed
            ? 'border-(--color-border) bg-(--color-surface) hover:-translate-y-0.5'
            : 'border-(--color-border) bg-(--color-surface-soft)')
      }
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-(--color-ink-muted)">
            Parcours {parcours.numero}
            {band && cscore != null && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: band.bg, color: band.color }}>
                {band.court} · {cscore.toFixed(1)}/10
              </span>
            )}
            {isFuture && (
              <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#B8860B]">À venir</span>
            )}
          </p>
          <h3 className={'mt-0.5 truncate text-[15px] font-bold ' + (jouable ? 'text-(--color-ink)' : 'text-(--color-ink-soft)')}>
            {parcours.titre}
          </h3>
          {parcours.sousTitre && (
            <p className="mt-0.5 truncate text-[12.5px] text-(--color-ink-soft)">{parcours.sousTitre}</p>
          )}
          {lockAt && (
            <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-[#B8860B]">
              <CalendarClock className="h-3.5 w-3.5" /> Ouverture {formatOuverture(lockAt)}
            </p>
          )}
          {lockedPrev && (
            <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-(--color-ink-muted)">
              <Lock className="h-3.5 w-3.5" /> Terminez le parcours précédent pour débloquer.
            </p>
          )}
        </div>
        {jouable && (
          <span
            className={
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold transition-colors '
              + (completed
                ? 'bg-(--color-surface-soft) text-(--color-ink-soft) group-hover:bg-(--color-sand-100)'
                : 'text-white')
            }
            style={completed ? undefined : { background: 'linear-gradient(90deg,#E4002B,#F97316)' }}
          >
            {completed ? 'Revoir' : 'Commencer'} <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </div>
      {/* Liseré doré sur le parcours en cours (accent premium). */}
      {current && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: 'linear-gradient(90deg,#F5C84B,transparent)' }} />
      )}
    </div>
  );

  return (
    <li className="relative flex gap-4 pb-4">
      {/* Colonne de gauche : pastille + ligne verticale. */}
      <div className="relative flex w-10 shrink-0 flex-col items-center">
        <span
          className={
            'relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-md ring-4 ring-(--color-surface-soft) '
            + (current ? 'animate-pulse' : '')
          }
          style={{ background: dotBg, color: dotText }}
        >
          {completed
            ? (cband === 'maitrise' ? <Trophy className="h-4 w-4" /> : <Check className="h-4 w-4" strokeWidth={3} />)
            : lockedDate || lockedPrev
              ? <Lock className="h-4 w-4" />
              : parcours.numero}
        </span>
        {!last && (
          <span
            aria-hidden
            className="absolute top-10 bottom-[-1rem] w-1 rounded-full"
            style={{ background: completed ? 'linear-gradient(#F5C84B,#E5E7EB)' : '#E5E7EB' }}
          />
        )}
        {band && cscore != null && (
          <span className="mt-1 hidden text-[9px] font-bold sm:block" style={{ color: band.color }}>
            {cscore.toFixed(1)}
          </span>
        )}
      </div>

      {/* Carte : cliquable si jouable. */}
      {jouable ? (
        <Link href={`/parcours/${parcours.numero}`} className="flex flex-1 focus-ring rounded-2xl">
          {card}
        </Link>
      ) : (
        <div aria-disabled className="flex flex-1 cursor-not-allowed opacity-90">{card}</div>
      )}

      {/* Icône d'importance décorative pour le tout premier (accroche). */}
      {index === 0 && current && (
        <Star aria-hidden className="absolute -left-1 top-0 h-4 w-4" style={{ color: '#F5C84B', fill: '#F5C84B' }} />
      )}
    </li>
  );
}
