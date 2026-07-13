import { Eye, EyeOff, Megaphone, MoveDown, MoveUp, PencilLine } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { AnnouncementForm } from './announcement-form';
import { ToggleVisibilityForm, MoveBlockForm } from './client-actions';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  kind: 'countdown' | 'event_list' | 'info' | 'stat' | 'text';
  title: string;
  badge_label: string | null;
  badge_tone: 'red' | 'green' | 'blue' | 'orange' | 'purple' | 'gray';
  icon_key: string | null;
  data: Record<string, unknown>;
  order_index: number;
  visible: boolean;
};

export default async function AdminAnnoncesPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from('homepage_announcements')
    .select('*')
    .order('order_index', { ascending: true });

  const rows = ((data ?? []) as unknown as Row[]) ?? [];

  // Liste des collèges (pour le sélecteur d'audience par collège dans le formulaire).
  const { data: collegesRaw } = await admin.from('matieres').select('id, nom').order('nom');
  const colleges = (collegesRaw ?? []) as { id: string; nom: string }[];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <Megaphone className="h-5 w-5 text-(--color-primary)" />
          Annonces — widget de l’accueil
        </h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Personnalise les blocs affichés à droite de la page d’accueil des étudiants : compte à rebours,
          calendrier, ouvertures d’inscriptions, nombre de postes, infos diverses. Ajoute, modifie, masque
          ou supprime à volonté.
        </p>
      </header>

      {/* Liste des blocs existants */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-(--color-ink-soft)">
          Blocs actuels ({rows.length})
        </h2>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-10 text-center text-sm text-(--color-ink-soft)">
            Aucun bloc pour le moment. Crée le premier ci-dessous.
          </div>
        ) : (
          rows.map((r) => (
            <details key={r.id} className="group rounded-2xl border border-(--color-border) bg-(--color-surface)">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden">
                <span className="rounded-md bg-(--color-primary-soft) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-(--color-primary)">
                  {LABEL[r.kind]}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-(--color-ink)">{r.title}</span>
                {!r.visible && (
                  <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[10px] font-medium text-(--color-ink-muted)">Masqué</span>
                )}
                <span className="hidden text-[11px] text-(--color-ink-muted) sm:inline">ordre {r.order_index}</span>

                <span className="flex items-center gap-1">
                  <MoveBlockForm id={r.id} direction="up">
                    <button type="submit" className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100)" aria-label="Monter">
                      <MoveUp className="h-4 w-4" />
                    </button>
                  </MoveBlockForm>
                  <MoveBlockForm id={r.id} direction="down">
                    <button type="submit" className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100)" aria-label="Descendre">
                      <MoveDown className="h-4 w-4" />
                    </button>
                  </MoveBlockForm>
                  <ToggleVisibilityForm id={r.id} visible={!r.visible}>
                    <button type="submit" className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100)" aria-label={r.visible ? 'Masquer' : 'Afficher'}>
                      {r.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </ToggleVisibilityForm>
                  <span className="rounded-md p-1.5 text-(--color-ink-soft)" aria-hidden>
                    <PencilLine className="h-4 w-4" />
                  </span>
                </span>
              </summary>
              <div className="border-t border-(--color-border) p-4">
                <AnnouncementForm
                  mode="edit"
                  initial={{
                    id: r.id,
                    kind: r.kind,
                    title: r.title,
                    badge_label: r.badge_label,
                    badge_tone: r.badge_tone,
                    icon_key: r.icon_key ?? 'megaphone',
                    visible: r.visible,
                    order_index: r.order_index,
                    data: r.data,
                    min_offer: (r as { min_offer?: 'essentiel'|'intensif'|'approfondi'|null }).min_offer ?? null,
                    target_scope: ((r as { target_scope?: 'all'|'full'|'college' }).target_scope) ?? 'all',
                    target_colleges: ((r as { target_colleges?: string[] }).target_colleges) ?? [],
                    voies: ((r as { voies?: ('interne'|'externe')[] }).voies) ?? ['interne', 'externe'],
                  }}
                  colleges={colleges}
                />
              </div>
            </details>
          ))
        )}
      </section>

      {/* Création d'un nouveau bloc */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-(--color-ink-soft)">
          Ajouter un nouveau bloc
        </h2>
        <AnnouncementForm mode="create" colleges={colleges} />
      </section>
    </main>
  );
}

const LABEL: Record<Row['kind'], string> = {
  countdown: 'Compte à rebours',
  event_list: 'Calendrier',
  info: 'Info + bouton',
  stat: 'Statistique',
  text: 'Texte libre',
};
