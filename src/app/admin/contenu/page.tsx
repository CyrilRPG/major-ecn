import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { iconFromKey } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ClipboardList, FileText, Layers3, PlayCircle } from 'lucide-react';

export const metadata = { title: 'Contenu' };

export default async function AdminContenuPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: matieres } = await supabase
    .from('matieres')
    .select(`
      id, nom, icon_key, color_hex, order_index, semestre_id,
      semestres(id, label, faculte_id, facultes(nom)),
      cours(id, titre, videos(storage_path), fiches(storage_path), qcm_series(id, type), flashcards(id))
    `)
    .order('order_index');

  return (
    <main className="px-6 lg:px-10 py-12 max-w-7xl mx-auto">
      <header className="mb-10">
        <p className="eyebrow">Administration · Bibliothèque</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
          Contenu <em className="display italic text-(--color-primary)">pédagogique</em>
        </h1>
        <p className="mt-3 text-(--color-ink-soft) max-w-2xl text-pretty">
          Sélectionne un cours pour gérer sa vidéo, sa fiche, ses QCM et ses flashcards.
        </p>
      </header>

      <div className="space-y-8">
        {(matieres ?? []).map((m) => {
          const Icon = iconFromKey(m.icon_key);
          return (
            <section key={m.id}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `color-mix(in srgb, ${m.color_hex} 18%, transparent)`, color: m.color_hex }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{m.nom}</h2>
                  <p className="text-xs text-(--color-ink-soft)">
                    {m.semestres?.facultes?.nom} · {m.semestres?.label}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
                      className="group surface-card p-5 focus-ring transition hover:-translate-y-0.5 hover:border-(--color-primary) hover:shadow-(--shadow-glow)"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-(--color-ink) leading-snug">{c.titre}</h3>
                        <ChevronRight className="h-4 w-4 text-(--color-ink-soft) shrink-0 mt-1 group-hover:text-(--color-primary)" />
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
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
