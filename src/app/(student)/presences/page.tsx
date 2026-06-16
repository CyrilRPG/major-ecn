import Link from 'next/link';
import { CalendarCheck, CalendarDays, Clock, User, ArrowLeft, GraduationCap } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Mes présences — Major ECN' };
export const dynamic = 'force-dynamic';

type Presence = {
  id: string;
  event_title: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  college: string | null;
  intervenant: string | null;
  marked_at: string;
};

function fmtDate(d: string | null): string {
  if (!d) return '—';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
  } catch {
    return d;
  }
}
function fmtMarkedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default async function PresencesPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data } = await db
    .from('session_presences')
    .select('id, event_title, event_date, start_time, end_time, college, intervenant, marked_at')
    .eq('user_id', user.id)
    .order('marked_at', { ascending: false });
  const presences = (data ?? []) as Presence[];

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
                Historique de vos émargements aux sessions Zoom — {presences.length} session{presences.length > 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-(--color-surface) p-4 sm:p-6">
          {presences.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <GraduationCap className="h-8 w-8 text-(--color-ink-muted)" />
              <p className="text-sm font-semibold text-(--color-ink)">Aucune présence émargée pour l’instant</p>
              <p className="max-w-sm text-xs text-(--color-ink-soft)">
                Lorsque vous rejoindrez une session depuis l’agenda, votre émargement apparaîtra ici.
              </p>
              <Link href="/agenda" className="mt-2 rounded-lg bg-(--color-primary) px-4 py-2 text-xs font-bold text-white">
                Ouvrir l’agenda
              </Link>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {presences.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 rounded-2xl border border-(--color-border) p-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: '#E7F6EC', color: '#16793C' }}>
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-(--color-ink)">{p.event_title ?? 'Session'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--color-ink-soft)">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {fmtDate(p.event_date)}</span>
                      {p.start_time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {p.start_time.slice(0, 5)}{p.end_time ? ` – ${p.end_time.slice(0, 5)}` : ''}
                        </span>
                      )}
                      {p.intervenant && <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {p.intervenant}</span>}
                      {p.college && <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 font-semibold">{p.college}</span>}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-(--color-sand-50) px-3 py-1.5 text-[11px] font-semibold text-(--color-ink-soft)">
                    Émargé le {fmtMarkedAt(p.marked_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
