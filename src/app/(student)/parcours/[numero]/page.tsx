import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, BookOpen, Crown } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { ParcoursExercices, type RunnerQuestion } from '@/components/student/parcours/parcours-runner';
import { BAND_META, type ParcoursBand } from '@/lib/parcours/parcours';

export const dynamic = 'force-dynamic';

type ParcoursRow = {
  id: string; numero: number; titre: string; sous_titre: string | null;
  intro_html: string; vignette_html: string | null; available_at: string; active: boolean;
};
type QuestionRow = {
  id: string; section: 'qcm' | 'cas_clinique'; format: 'qcm' | 'qroc';
  ordre: number; enonce_html: string;
  items: { lettre: string; texte: string; correct?: boolean }[] | null;
  reponse_attendue: string | null; explication_html: string | null; image_path: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  return { title: `Parcours ${numero} · Parcours du Major` };
}

export default async function ParcoursDetailPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero: numeroRaw } = await params;
  const numero = Number(numeroRaw);
  const { profile } = await requireUser();
  if (profile.role !== 'admin') redirect('/accueil');
  if (!Number.isInteger(numero)) notFound();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: p } = await sb
    .from('major_parcours')
    .select('id, numero, titre, sous_titre, intro_html, vignette_html, available_at, active')
    .eq('numero', numero)
    .maybeSingle();
  const parcours = p as ParcoursRow | null;
  if (!parcours) notFound();

  const [{ data: qRows }, { data: comp }, { data: neighbours }] = await Promise.all([
    sb.from('major_parcours_questions')
      .select('id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html, image_path')
      .eq('parcours_id', parcours.id)
      .order('section', { ascending: true })
      .order('ordre', { ascending: true }),
    sb.from('major_parcours_completions')
      .select('score, band')
      .eq('parcours_id', parcours.id)
      .maybeSingle(),
    sb.from('major_parcours').select('numero').gt('numero', numero).order('numero', { ascending: true }).limit(1),
  ]);

  // Ordonner : le cas clinique (QROC) puis les QCM — le rappel est au-dessus.
  const rows = ((qRows ?? []) as QuestionRow[]);
  const order = { cas_clinique: 0, qcm: 1 } as const;
  const questions: RunnerQuestion[] = rows
    .slice()
    .sort((a, b) => (order[a.section] - order[b.section]) || (a.ordre - b.ordre))
    .map((r) => ({
      id: r.id,
      section: r.section,
      format: r.format,
      enonceHtml: r.enonce_html ?? '',
      imageUrl: r.image_path || null,
      items: (r.items ?? []).map((it) => ({ lettre: it.lettre, texte: it.texte, correct: !!it.correct })),
      reponseAttendue: r.reponse_attendue,
      explicationHtml: r.explication_html,
    }));

  const nextNumero = ((neighbours ?? []) as { numero: number }[])[0]?.numero ?? null;
  const dejaFait = comp ? { score: Number((comp as { score: number }).score), band: (comp as { band: ParcoursBand }).band } : null;
  const meta = dejaFait ? BAND_META[dejaFait.band] : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-8">
      <Link href="/parcours" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
        <ArrowLeft className="h-4 w-4" /> Parcours du Major
      </Link>

      {/* En-tête du parcours */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-[#E9D8A6] bg-[linear-gradient(135deg,#0E1626,#2A1130,#2D0518)] px-6 py-6 text-white">
        <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 opacity-20">
          <Crown className="h-36 w-36" style={{ color: '#F5C84B' }} strokeWidth={1.2} />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#F5C84B' }}>
          Parcours n°{parcours.numero}
        </p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight">{parcours.titre}</h1>
        {parcours.sous_titre && <p className="mt-1 text-sm text-white/70">{parcours.sous_titre}</p>}
        {dejaFait && meta && (
          <span className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px] font-bold" style={{ background: meta.color, color: '#fff' }}>
            {dejaFait.score.toFixed(1)}/10 · {meta.label}
          </span>
        )}
      </div>

      {/* Le RAPPEL méthodo, avant les exercices. */}
      {parcours.intro_html?.trim() && (
        <section className="mb-6 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C0112E]">
            <BookOpen className="h-4 w-4" /> Le rappel du coach
          </p>
          <div
            className="prose prose-sm max-w-none text-(--color-ink) prose-headings:text-(--color-ink) prose-a:text-[#C0112E] prose-strong:text-(--color-ink) prose-img:rounded-xl prose-li:my-0.5 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parcours.intro_html }}
          />
        </section>
      )}

      {/* Le cas clinique (contexte), avant ses QROC. */}
      {parcours.vignette_html?.trim() && (
        <section className="mb-6 rounded-2xl border border-[#F8B4B4]/60 bg-[#FFF7F7] p-6">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C0112E]">Cas clinique</p>
          <div
            className="prose prose-sm max-w-none text-(--color-ink) prose-p:leading-relaxed prose-strong:text-(--color-ink)"
            dangerouslySetInnerHTML={{ __html: parcours.vignette_html }}
          />
        </section>
      )}

      <ParcoursExercices
        parcoursId={parcours.id}
        numero={parcours.numero}
        nextNumero={nextNumero}
        questions={questions}
        dejaFait={dejaFait}
      />
    </div>
  );
}
