import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { iconFromKey } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ClipboardList, FileText, Layers3, PlayCircle } from 'lucide-react';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';

export const metadata = { title: 'Contenu' };

type College = {
  id: string;
  nom: string;
  icon_key: string | null;
  color_hex: string | null;
  order_index: number | null;
  cours:
    | {
        id: string;
        titre: string;
        videos: { storage_path: string | null }[] | null;
        fiches: { storage_path: string | null }[] | null;
        qcm_series: { id: string; type: string }[] | null;
        flashcards: { id: string }[] | null;
      }[]
    | null;
};

export default async function AdminContenuPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from('facultes')
    .select(`
      semestres(matieres(id, nom, icon_key, color_hex, order_index,
        cours(id, titre, videos(storage_path), fiches(storage_path), qcm_series(id, type), flashcards(id))))
    `)
    .eq('id', EDN_FACULTE_ID)
    .maybeSingle();

  const colleges = (
    ((data as unknown as { semestres?: { matieres?: College[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-10">
      <header className="mb-8 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Contenu pédagogique</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Collèges EVC — sélectionnez un item pour gérer sa vidéo, sa fiche, ses QCM et ses flashcards.
        </p>
      </header>

      <div className="space-y-10">
        {colleges.map((m) => {
          const Icon = iconFromKey(m.icon_key);
          return (
            <section key={m.id}>
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${m.color_hex ?? 'var(--color-accent)'} 16%, transparent)`,
                    color: m.color_hex ?? 'var(--color-accent)',
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-(--color-ink)">{m.nom}</h2>
                  <p className="text-xs text-(--color-ink-muted)">Collège EVC · {(m.cours ?? []).length} items</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(m.cours ?? []).map((c) => {
                  const hasVideo = (c.videos ?? []).some((v) => !!v.storage_path);
                  const hasFiche = (c.fiches ?? []).some((f) => !!f.storage_path);
                  const qcmCount = (c.qcm_series ?? []).filter((s) => s.type === 'qcm').length;
                  const annaleCount = (c.qcm_series ?? []).filter((s) => s.type === 'annale').length;
                  const fcCount = c.flashcards?.length ?? 0;
                  return (
                    <Link
                      key={c.id}
                      href={`/admin/contenu/${c.id}`}
                      className="group rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-(--color-accent) hover:shadow-(--shadow-lifted) focus-ring"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-snug text-(--color-ink)">{c.titre}</h3>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                        <Badge variant={hasVideo ? 'success' : 'muted'}>
                          <PlayCircle className="h-3 w-3" /> {hasVideo ? 'Vidéo' : 'Pas de vidéo'}
                        </Badge>
                        <Badge variant={hasFiche ? 'success' : 'muted'}>
                          <FileText className="h-3 w-3" /> {hasFiche ? 'Fiche' : 'Pas de fiche'}
                        </Badge>
                        <Badge variant={qcmCount + annaleCount > 0 ? 'primary' : 'muted'}>
                          <ClipboardList className="h-3 w-3" /> {qcmCount + annaleCount} séries
                        </Badge>
                        <Badge variant={fcCount > 0 ? 'primary' : 'muted'}>
                          <Layers3 className="h-3 w-3" /> {fcCount} cartes
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
                {(m.cours ?? []).length === 0 && (
                  <p className="text-sm text-(--color-ink-muted)">Aucun item dans ce collège.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
