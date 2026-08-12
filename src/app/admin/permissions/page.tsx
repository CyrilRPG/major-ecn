import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { FormulaPermissionsEditor } from '@/components/admin/formula-permissions-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Configuration Permissions' };

const CONTENT_LABELS: Record<string, string> = {
  fiche: 'Fiche de cours',
  fiche_express: 'Fiche éclair',
  video: 'Résumé vidéo',
  qcm: 'QCM / DP / QROC',
  entrainement: 'QCM Entraînement',
  seance_prof: 'Séance du professeur',
  flashcards: 'Flashcards',
  interrogation: 'Interrogation',
  seance_approfondie: 'Séance approfondie',
  notes: 'Prise de notes',
  parcours_major: 'Parcours du Major',
};

const OFFER_LABELS: Record<string, string> = {
  essentiel: 'Formule Essentielle',
  intensif: 'Formule Intensive',
  approfondi: 'Programme Approfondi',
};

const OFFERS = ['essentiel', 'intensif', 'approfondi'] as const;
const CONTENT_KEYS = [
  'fiche', 'fiche_express', 'video', 'qcm', 'entrainement',
  'seance_prof', 'flashcards', 'interrogation', 'seance_approfondie', 'notes', 'parcours_major',
] as const;

export default async function PermissionsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from('formula_permissions')
    .select('*')
    .order('offer');

  type Row = Record<string, unknown> & { offer: string };
  const rowsByOffer = new Map((rows as unknown as Row[] ?? []).map((r) => [r.offer, r]));

  const permissions = OFFERS.map((offer) => {
    const row = rowsByOffer.get(offer);
    const perms: Record<string, boolean> = {};
    for (const key of CONTENT_KEYS) {
      perms[key] = row ? (row[key] as boolean) ?? true : true;
    }
    return { offer, ...perms };
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-8 border-b border-(--color-border) pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-(--color-ink)">
          Configuration Permissions
        </h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Définissez quel contenu pédagogique est accessible pour chaque formule. Les modifications s'appliquent immédiatement à tous les élèves.
        </p>
      </header>

      <FormulaPermissionsEditor
        initialPermissions={permissions}
        offerLabels={OFFER_LABELS}
        contentLabels={CONTENT_LABELS}
        contentKeys={CONTENT_KEYS as unknown as string[]}
        offers={OFFERS as unknown as string[]}
      />
    </main>
  );
}
