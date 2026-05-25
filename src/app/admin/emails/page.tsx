import { Mail, Filter, Send, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, offerLabel } from '@/lib/auth/permissions';
import type { Offer } from '@/types/domain';
import { CopyButton } from '@/components/admin/copy-button';

const PROMOS = ['D2', 'D3', 'D4', 'PAE', 'Autre'] as const;
const OFFER_OPTIONS: Offer[] = ['essentiel', 'premium', 'intensif'];

type SearchParams = {
  promo?: string;
  offer?: string;
  scope?: string;
  college?: string;
};

export const metadata = { title: 'Envoi d’emails' };

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const supabase = await createClient();

  const promoF = sp.promo && (PROMOS as readonly string[]).includes(sp.promo) ? sp.promo : 'all';
  const offerF: 'all' | Offer = (OFFER_OPTIONS as string[]).includes(sp.offer ?? '')
    ? (sp.offer as Offer) : 'all';
  const scopeF = sp.scope === 'all-access' || sp.scope === 'specific' ? sp.scope : 'all';
  const collegeF = sp.college ?? '';

  const { data: students } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, promotion, permission_scope')
    .eq('role', 'student')
    .order('last_name', { ascending: true });

  const { data: colleges } = await supabase
    .from('matieres')
    .select('id, nom')
    .order('nom');
  const collegeOptions = colleges ?? [];

  const filtered = (students ?? []).filter((s) => {
    if (!s.email) return false;
    if (promoF !== 'all' && s.promotion !== promoF) return false;

    const scope = parseScope(s.permission_scope);
    if (offerF !== 'all' && scope.offer !== offerF) return false;

    if (scopeF === 'all-access' && scope.type !== 'all') return false;
    if (scopeF === 'specific') {
      if (scope.type !== 'college') return false;
      if (collegeF && !scope.colleges.includes(collegeF)) return false;
    }
    return true;
  });

  const emails = filtered.map((s) => s.email).filter((e): e is string => !!e);
  const emailsBlock = emails.join(', ');

  const filterApplied =
    promoF !== 'all' || offerF !== 'all' || scopeF !== 'all' || !!collegeF;

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
            Envoi d’emails
          </h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            Filtrez vos élèves, puis copiez la liste d’emails pour la coller dans Gmail.
          </p>
        </div>
      </header>

      {/* FILTERS — GET form so the URL reflects the selection (shareable, refreshable) */}
      <form
        method="GET"
        className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6"
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
          <Filter className="h-4 w-4 text-(--color-primary)" />
          Filtres
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Promotion">
            <select name="promo" defaultValue={promoF} className={selectClass}>
              <option value="all">Toutes les promotions</option>
              {PROMOS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field label="Formule souscrite">
            <select name="offer" defaultValue={offerF} className={selectClass}>
              <option value="all">Toutes les formules</option>
              {OFFER_OPTIONS.map((o) => (
                <option key={o} value={o}>{offerLabel(o)}</option>
              ))}
            </select>
          </Field>

          <Field label="Accès collèges">
            <select name="scope" defaultValue={scopeF} className={selectClass}>
              <option value="all">Tout type d’accès</option>
              <option value="all-access">Toute l’offre (tous collèges)</option>
              <option value="specific">Accès restreint à des collèges</option>
            </select>
          </Field>

          <Field label="Collège spécifique">
            <select name="college" defaultValue={collegeF} className={selectClass}>
              <option value="">Tous les collèges</option>
              {collegeOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-(--color-ink-muted)">
              N’a d’effet que si « Accès restreint » est sélectionné.
            </p>
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Send className="h-4 w-4" />
            Générer la liste
          </button>
          {filterApplied && (
            <a
              href="/admin/emails"
              className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)"
            >
              Réinitialiser
            </a>
          )}
        </div>
      </form>

      {/* RESULTS */}
      <section className="mt-8 rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--color-border) px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-(--color-primary)" />
            <span className="font-semibold text-(--color-ink)">{emails.length}</span>
            <span className="text-(--color-ink-soft)">
              email{emails.length > 1 ? 's' : ''} correspondent au filtre
            </span>
          </div>
          {emails.length > 0 && (
            <CopyButton
              variant="primary"
              text={emailsBlock}
              label={`Copier les ${emails.length} emails (Gmail)`}
            />
          )}
        </header>

        {emails.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-(--color-ink-soft) sm:px-6">
            Aucun élève ne correspond à ces filtres.
          </div>
        ) : (
          <>
            {/* Gmail-ready block — comma-separated */}
            <div className="border-b border-(--color-border) bg-(--color-surface-soft) px-5 py-4 sm:px-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
                Liste prête à coller dans le champ « À : » de Gmail
              </p>
              <code className="block max-h-40 overflow-auto break-all rounded-lg border border-(--color-border) bg-white p-3 font-mono text-xs leading-relaxed text-(--color-ink)">
                {emailsBlock}
              </code>
            </div>

            {/* Individual rows */}
            <ul className="divide-y divide-(--color-border)">
              {filtered.map((s) => {
                const scope = parseScope(s.permission_scope);
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-(--color-ink)">
                        {s.first_name ?? ''} {s.last_name ?? ''}
                      </p>
                      <p className="truncate font-mono text-xs text-(--color-ink-soft)">{s.email}</p>
                    </div>
                    <span className="rounded-full bg-(--color-surface-soft) px-2.5 py-0.5 text-[11px] font-medium text-(--color-ink-soft)">
                      {s.promotion ?? '—'}
                    </span>
                    <span className="rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[11px] font-semibold text-(--color-primary)">
                      {offerLabel(scope.offer)}
                    </span>
                    <CopyButton text={s.email!} label="Copier" />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

const selectClass =
  'w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-(--color-ink)">{label}</label>
      {children}
    </div>
  );
}
