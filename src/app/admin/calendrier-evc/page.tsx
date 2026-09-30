import Link from 'next/link';
import { CalendarRange } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { COLONNES_EPREUVE, COLONNES_REGLAGES, normaliserEpreuve, normaliserReglages } from '@/lib/evc-calendrier/lignes';
import { instantDuRendu } from '@/lib/evc-calendrier/server';
import { calculerIndicateursVideo, type LigneEvenementVideo } from '@/lib/marketing/video-evenements';
import { CalendrierAdmin, type College } from './calendrier-admin';
import { IndicateursVideoPanneau, PERIODES } from './indicateurs-video';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendrier EVC' };

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * /admin/calendrier-evc — source unique des dates d'épreuve, périodes
 * d'inscription et postes (brief du 30/09/2026, B1), avec aperçu à date
 * simulée, et onglet « Vidéo de présentation » (indicateurs du point C).
 */
export default async function CalendrierEvcPage({ searchParams }: { searchParams: Promise<{ onglet?: string; periode?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const onglet = sp.onglet === 'video' ? 'video' : 'calendrier';
  const db = createAdminClient() as any;
  const rendu = instantDuRendu();

  let contenu: React.ReactNode;
  if (onglet === 'calendrier') {
    const [{ data: lignes, error }, { data: reglages }, { data: matieres }] = await Promise.all([
      db.from('evc_calendrier').select(COLONNES_EPREUVE).order('session', { ascending: true }).order('ordre', { ascending: true }),
      db.from('evc_calendrier_sessions').select(COLONNES_REGLAGES).maybeSingle(),
      db.from('matieres').select('id, nom, parent_matiere_id, order_index, semestres!inner(faculte_id)')
        .eq('semestres.faculte_id', EDN_FACULTE_ID).is('parent_matiere_id', null).order('order_index', { ascending: true }),
    ]);
    const colleges: College[] = ((matieres ?? []) as { id: string; nom: string }[])
      .filter((m) => m.id !== 'col-decouverte')
      .map((m) => ({ id: m.id, nom: m.nom }));
    contenu = error
      ? <p className="rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B91C1C]">Lecture du calendrier impossible : {error.message}</p>
      : (
        <CalendrierAdmin
          epreuves={((lignes ?? []) as Record<string, unknown>[]).map(normaliserEpreuve)}
          reglages={normaliserReglages(reglages)}
          colleges={colleges}
          rendu={rendu}
        />
      );
  } else {
    const periode = PERIODES.find((p) => p.cle === sp.periode) ?? PERIODES[1];
    const depuis = periode.jours ? new Date(rendu - periode.jours * 86_400_000).toISOString() : null;
    let lignes: LigneEvenementVideo[] = [];
    let erreur: string | null = null;
    try {
      lignes = await fetchAllRows<LigneEvenementVideo>((from, to) => {
        let q = db.from('marketing_video_events').select('visitor_id, event, source, created_at').order('id', { ascending: true });
        if (depuis) q = q.gte('created_at', depuis);
        return q.range(from, to);
      });
    } catch (e) {
      erreur = e instanceof Error ? e.message : 'erreur inconnue';
    }
    contenu = <IndicateursVideoPanneau ind={calculerIndicateursVideo(lignes)} periode={periode.cle} erreur={erreur} />;
  }

  const onglets = [
    { cle: 'calendrier', libelle: 'Calendrier', href: '/admin/calendrier-evc' },
    { cle: 'video', libelle: 'Vidéo de présentation', href: '/admin/calendrier-evc?onglet=video' },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <CalendarRange className="h-5 w-5 text-(--color-primary)" /> Calendrier EVC
        </h1>
        <p className="mt-0.5 max-w-3xl text-sm text-(--color-ink-soft)">
          Dates d’épreuve, périodes d’inscription et postes par spécialité : la seule source de l’accueil, des pages
          spécialités, des fiches concours des élèves et du planificateur. Chaque enregistrement est journalisé et visible
          en quelques secondes.
        </p>
        <nav className="mt-4 flex gap-2">
          {onglets.map((o) => (
            <Link
              key={o.cle}
              href={o.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${onglet === o.cle ? 'bg-(--color-primary) text-white' : 'text-(--color-ink-soft) hover:bg-(--color-sand-100)'}`}
            >
              {o.libelle}
            </Link>
          ))}
        </nav>
      </header>
      {contenu}
    </main>
  );
}
