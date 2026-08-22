import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { requireUser, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { buildQcmAccessContext, canStudentReadSerie, SERIE_ACCESS_COLUMNS, type SerieAccessRow } from '@/lib/data/qcm-access';
import { estSerieAnnale, anneeDeSerieAnnale } from '@/lib/data/annales';
import { SerieCard } from '@/components/qcm/serie-card';

type Row = SerieAccessRow & {
  order_index: number;
  annee?: number | null;
  qcm_questions?: { id: string; format: string }[] | null;
};

/**
 * Les annales d'UNE session, sur un item.
 *
 * L'onglet DP · QI ne montre que les années : une session EVC compte jusqu'à
 * onze dossiers et un item en porte jusqu'à dix-sept. C'est ici qu'on choisit
 * l'épreuve — EVCF, EVCP, et le cas échéant chacun de ses dossiers.
 *
 * Le libellé est raccourci : « Annales - Orthopédie - 2019 - EVCP - Dossier 3
 * (Rachis) » devient « EVCP - Dossier 3 (Rachis) ». Le collège est celui de la
 * page, l'année celle du titre — les répéter sur chaque ligne les tronquait.
 */
export default async function AnnaleAnneePage({
  params,
}: {
  params: Promise<{ cours: string; annee: string }>;
}) {
  const { cours: coursId, annee: anneeParam } = await params;
  const annee = Number(anneeParam);
  if (!/^\d{4}$/.test(anneeParam) || !Number.isFinite(annee)) notFound();

  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c, error: coursError } = await supabase
    .from('cours')
    .select('id, titre, matiere_id, matieres(id, nom, semestre_id, semestres(id, label, faculte_id))')
    .eq('id', coursId)
    .maybeSingle();
  // Une erreur SQL/RLS ne doit jamais être déguisée en 404 : elle doit remonter.
  if (coursError) throw coursError;
  if (!c || !c.matieres?.semestres) notFound();
  if (profile.role !== 'admin' && !canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');
  profPageReadGuard(profile, 'qcm', `/cours/${coursId}`);

  // Client service-role puis contrôle applicatif : mêmes raisons et MÊMES règles
  // que la liste de l'item (cf. lib/data/qcm-access) — une série listée ici mais
  // refusée à l'ouverture donnerait un 404.
  const { data: raw, error: seriesError } = await createAdminClient()
    .from('qcm_series')
    .select(`${SERIE_ACCESS_COLUMNS}, order_index, annee, qcm_questions(id, format)` as 'id, label, order_index, type')
    .eq('cours_id', coursId)
    .in('type', ['qcm', 'qroc'])
    .order('order_index');
  if (seriesError) throw seriesError;

  const accessCtx = await buildQcmAccessContext(profile, c.matiere_id);
  const series = ((raw ?? []) as unknown as Row[])
    .filter((s) => estSerieAnnale(s.label) && anneeDeSerieAnnale(s) === annee)
    .filter((s) => canStudentReadSerie(s, accessCtx, (s.qcm_questions ?? []).map((q) => q.format)))
    .filter((s) => (s.qcm_questions ?? []).length > 0);
  if (series.length === 0) notFound();

  const { data: sessions } = await supabase
    .from('qcm_sessions')
    .select('serie_id, score_correct, score_total, finished_at')
    .eq('user_id', user.id)
    .in('serie_id', series.map((s) => s.id))
    .order('started_at', { ascending: false });
  const dernier = new Map<string, { score_correct: number; score_total: number }>();
  for (const s of sessions ?? []) {
    if (!s.finished_at || dernier.has(s.serie_id)) continue;
    dernier.set(s.serie_id, { score_correct: s.score_correct, score_total: s.score_total });
  }

  const total = series.reduce((n, s) => n + (s.qcm_questions?.length ?? 0), 0);
  /** « Annales - Orthopédie - 2019 - EVCP - Dossier 3 » → « EVCP - Dossier 3 ». */
  const titreCourt = (label: string) =>
    label.replace(/^Annales?\s*-\s*.+?\s*-\s*(?:19|20)\d{2}\s*-\s*/i, '').trim() || label;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 lg:px-8">
      <Link
        href={`/cours/${coursId}/qcm`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft) transition-colors hover:text-(--color-ink)"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Dossiers progressifs &amp; QI
      </Link>

      <header className="mt-3 mb-5 flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-4 shadow-(--shadow-soft)">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#92400E]">
          <ScrollText className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B45309]">
            Annales EVC · {c.matieres.nom}
          </p>
          <h1 className="text-2xl font-bold tracking-tight tabular-nums text-(--color-ink)">
            Session {annee}
          </h1>
          <p className="mt-0.5 text-xs text-(--color-ink-muted)">
            {series.length} annale{series.length > 1 ? 's' : ''} · {total} questions ·
            {' '}sujet officiel et corrigé détaillé
          </p>
        </div>
      </header>

      <ul className="space-y-2.5">
        {series.map((s, idx) => (
          <li key={s.id}>
            <SerieCard
              href={`/cours/${coursId}/qcm/${s.id}`}
              label={s.label}
              titre={titreCourt(s.label)}
              type={s.type}
              qCount={s.qcm_questions?.length ?? 0}
              rang={idx + 1}
              dernierScore={dernier.get(s.id) ?? null}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
