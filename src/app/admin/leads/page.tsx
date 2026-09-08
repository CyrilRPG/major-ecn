import { Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { UnifiedLeadsTable, type UnifiedLead } from '@/components/admin/unified-leads-table';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [guideRes, diagRes, arenaRes, tournoisRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('guide_leads').select('*').order('created_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('diagnostic_leads').select('*').order('created_at', { ascending: false }),
    // Inscrits EVC Arena. Les comptes anonymisés (droit à l'effacement, §12) ne
    // remontent pas : leur adresse n'existe plus, la ligne ne servirait à rien.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('arena_participants').select('*')
      .eq('faculte_id', EDN_FACULTE_ID).is('anonymized_at', null)
      .order('created_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('arena_tournaments').select('id, title, edition_label, specialty'),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guideLeads: UnifiedLead[] = (guideRes.data ?? []).map((l: any) => ({
    id: l.id,
    source: 'methodologie' as const,
    first_name: l.first_name ?? '',
    last_name: l.last_name ?? '',
    email: l.email,
    phone: l.phone ?? '',
    specialty: l.specialty ?? null,
    voie: l.voie ?? null,
    active: l.active ?? true,
    created_at: l.created_at,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diagLeads: UnifiedLead[] = (diagRes.data ?? []).map((l: any) => ({
    id: l.id,
    source: 'diagnostic' as const,
    first_name: l.first_name ?? '',
    last_name: l.last_name ?? '',
    email: l.email,
    phone: l.phone ?? '',
    specialty: l.specialty ?? null,
    voie: l.voie ?? null,
    active: l.active ?? true,
    created_at: l.created_at,
    score: l.score,
    max_score: l.max_score,
    profile_label: l.profile_label,
    profile_key: l.profile_key,
    session_evc: l.session_evc,
    obstacle: l.obstacle,
    answers: l.answers ?? {},
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tournois = new Map<string, any>((tournoisRes.data ?? []).map((t: any) => [t.id, t]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arenaLeads: UnifiedLead[] = (arenaRes.data ?? []).map((p: any) => {
    const t = tournois.get(p.tournament_id);
    return {
      id: p.id,
      source: 'arena' as const,
      first_name: p.first_name ?? '',
      last_name: p.last_name ?? '',
      email: p.email,
      // L'Arena ne demande pas de téléphone : la colonne reste vide, elle
      // n'est pas remplacée par une valeur inventée.
      phone: '',
      specialty: p.specialty ?? t?.specialty ?? null,
      voie: null,
      // « Actif » = non bloqué. Le bouton de la colonne agit sur le blocage,
      // qui est la seule notion de désactivation d'un participant (§3.3).
      active: !p.blocked_at,
      created_at: p.created_at,
      arena_pseudo: p.pseudo ?? null,
      arena_tournament: t ? [t.title, t.edition_label].filter(Boolean).join(' — ') : null,
      arena_confirmed: Boolean(p.email_confirmed_at),
      arena_blocked_reason: p.blocked_reason ?? null,
      arena_last_login_at: p.last_login_at ?? null,
      arena_consent_marketing: Boolean(p.consent_marketing) && !p.marketing_unsubscribed_at,
      arena_acquisition: p.acquisition_source ?? null,
    };
  });

  const leads = [...guideLeads, ...diagLeads, ...arenaLeads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <Users className="h-5 w-5 text-(--color-primary)" />
          Leads
        </h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Leads Méthodologie (Guide EVC), Diagnostic (Profil EVC) et inscrits EVC Arena réunis.
          Filtrez par source, désactivez les leads traités, et renvoyez son lien à un inscrit Arena qui ne l’a pas reçu.
        </p>
      </header>

      <UnifiedLeadsTable initialLeads={leads} />
    </main>
  );
}
