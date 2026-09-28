import Link from 'next/link';
import { CalendarCheck, CalendarDays, Clock, User, ArrowLeft, GraduationCap, PlayCircle, Video, PenLine, FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  construireFeuilles,
  feuilleASigner,
  lienFeuille,
  repartirFeuilles,
  LIBELLE_FEUILLE as LIBELLE,
  type Feuille,
  type LigneAttendance,
  type LigneCompletion,
  type LignePresence,
} from '@/lib/agenda/feuilles-emargement';

export const metadata = { title: 'Mes présences — Major ECN' };
export const dynamic = 'force-dynamic';

function fmtJour(d: string | null): string {
  if (!d) return '—';
  try {
    return new Date(d + 'T12:00:00Z').toLocaleDateString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris',
    });
  } catch {
    return d;
  }
}
function fmtInstant(iso: string): string {
  try {
    // Heure de Paris : ce rendu serveur tourne en UTC.
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Paris',
    });
  } catch {
    return iso;
  }
}

/**
 * Toutes les feuilles d'émargement de l'élève, comme la vue admin : vidéos de
 * cours, séances approfondies, interrogations signées et sessions Zoom — celles
 * « À signer » en tête. L'assemblage vit dans lib/agenda/feuilles-emargement
 * (partagé avec l'app mobile via /api/mobile/presences).
 */
export default async function PresencesPage() {
  const { user } = await requireUser();
  // Service-role filtré sur l'élève connecté : la page ne dépend ni de la RLS
  // ni de l'état du cookie (mêmes lectures que la vue admin).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const [{ data: attendances }, { data: presences }, { data: matieres }, { data: completions }] = await Promise.all([
    db.from('course_attendances')
      .select('id, cours_id, cours_titre, matiere_id, kind, required_at, signed_at, signature_png')
      .eq('user_id', user.id),
    db.from('session_presences')
      .select('id, event_title, event_date, start_time, end_time, college, intervenant, marked_at, signature_png')
      .eq('user_id', user.id),
    db.from('matieres').select('id, nom'),
    db.from('parcours_completions')
      .select('cours_id, certificate_signed_at, signature_data_url, qcm_test_score, qcm_test_total, cours(titre, matiere_id)')
      .eq('user_id', user.id).not('certificate_signed_at', 'is', null),
  ]);
  const feuilles = construireFeuilles({
    attendances: (attendances ?? []) as LigneAttendance[],
    completions: (completions ?? []) as LigneCompletion[],
    presences: (presences ?? []) as LignePresence[],
    matieres: (matieres ?? []) as { id: string; nom: string }[],
  });
  const { aSigner, signees, resume } = repartirFeuilles(feuilles);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      {/* En-tête template Major ECN */}
      <div className="overflow-hidden rounded-3xl border border-(--color-border) shadow-(--shadow-soft)">
        <div className="relative bg-[#0F1F4D] px-6 py-7 sm:px-8">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: 'linear-gradient(90deg,#6B1A2A 0%,#3B82F6 50%,#14B8A6 100%)' }}
          />
          <Link href="/profil" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Mon profil
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <CalendarCheck className="h-5 w-5 text-white" />
            </span>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">Mes présences</h1>
              <p className="text-sm text-white/70">
                Vos feuilles d’émargement : vidéos de cours, séances approfondies, interrogations et sessions Zoom
                {signees.length > 0 ? ` — ${signees.length} signée${signees.length > 1 ? 's' : ''}` : ''}.
              </p>
              {resume && <p className="mt-0.5 text-xs text-white/55">{resume}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-(--color-surface) p-4 sm:p-6">
          {aSigner.length > 0 && (
            <section>
              <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-[#B45309]">
                À signer ({aSigner.length})
              </h2>
              <ul className="space-y-2.5">
                {aSigner.map((f) => <Ligne key={f.id} f={f} />)}
              </ul>
            </section>
          )}

          {feuilles.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <GraduationCap className="h-8 w-8 text-(--color-ink-muted)" />
              <p className="text-sm font-semibold text-(--color-ink)">Aucune feuille d’émargement pour l’instant</p>
              <p className="max-w-sm text-xs text-(--color-ink-soft)">
                Chaque vidéo de cours regardée et chaque session rejointe depuis l’agenda donne lieu à un émargement, qui apparaîtra ici.
              </p>
              <Link href="/agenda" className="mt-2 rounded-lg bg-(--color-primary) px-4 py-2 text-xs font-bold text-white">
                Ouvrir l’agenda
              </Link>
            </div>
          ) : signees.length > 0 && (
            <section>
              {aSigner.length > 0 && (
                <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">
                  Signées ({signees.length})
                </h2>
              )}
              <ul className="space-y-2.5">
                {signees.map((f) => <Ligne key={f.id} f={f} />)}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Ligne({ f }: { f: Feuille }) {
  const Icone = f.origine === 'zoom' ? CalendarCheck : f.origine === 'seance' ? Video : f.origine === 'interrogation' ? FileText : PlayCircle;
  const lien = lienFeuille(f);
  const enAttente = feuilleASigner(f);
  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-(--color-border) p-4 sm:flex-row sm:items-center sm:gap-4">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={enAttente ? { background: '#FEF3C7', color: '#B45309' } : { background: '#E7F6EC', color: '#16793C' }}
      >
        <Icone className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">{LIBELLE[f.origine]}</p>
        <p className="truncate text-sm font-extrabold text-(--color-ink)">
          {lien ? <Link href={lien} className="hover:underline">{f.titre}</Link> : f.titre}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--color-ink-soft)">
          {f.jour && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {fmtJour(f.jour)}</span>}
          {f.debut && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {f.debut.slice(0, 5)}{f.fin ? ` – ${f.fin.slice(0, 5)}` : ''}
            </span>
          )}
          {f.intervenant && <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {f.intervenant}</span>}
          {f.college && <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 font-semibold">{f.college}</span>}
          {f.note && <span className="font-semibold text-(--color-ink)">Note : {f.note}</span>}
          {f.origine === 'interrogation' && f.coursId && (
            <a href={`/api/certificate/${f.coursId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-(--color-primary) hover:underline">
              <FileText className="h-3.5 w-3.5" /> Télécharger la feuille (PDF)
            </a>
          )}
        </div>
      </div>
      {f.signature && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={f.signature} alt="Votre signature" className="h-10 w-24 shrink-0 rounded-md border border-(--color-border) bg-white object-contain" />
      )}
      {enAttente ? (
        lien && (
          <Link href={lien} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#B45309] px-3 py-1.5 text-[11px] font-bold text-white">
            <PenLine className="h-3.5 w-3.5" /> Signer
          </Link>
        )
      ) : (
        f.signeLe && (
          <span className="shrink-0 rounded-lg bg-(--color-sand-50) px-3 py-1.5 text-[11px] font-semibold text-(--color-ink-soft)">
            {f.origine === 'zoom' ? 'Émargé' : 'Signé'} le {fmtInstant(f.signeLe)}
          </span>
        )
      )}
    </li>
  );
}
