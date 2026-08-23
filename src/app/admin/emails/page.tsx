import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { Mail, Filter, Send, Users, BookDown, GraduationCap } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope, offerLabel } from '@/lib/auth/permissions';
import type { Offer } from '@/types/domain';
import { SPECIALTIES } from '@/lib/data/guide-data';
import { CopyButton } from '@/components/admin/copy-button';

const PROMOS = ['D2', 'D3', 'D4', 'PAE', 'Autre'] as const;
// Inclut « decouverte » pour permettre de cibler uniquement les élèves de
// l'Espace Découverte.
const OFFER_OPTIONS: Offer[] = ['decouverte', 'essentiel', 'intensif', 'approfondi'];
const VOIES = [
  { value: 'externe', label: 'Voie externe (EVCF / EVCP)' },
  { value: 'interne', label: 'Voie interne (QCM)' },
] as const;

type SearchParams = {
  audience?: string;
  promo?: string;
  offer?: string;
  scope?: string;
  college?: string;
  specialty?: string;
  voie?: string;
};

/** Destinataire normalisé, commun aux deux audiences (élèves / leads). */
type Recipient = { id: string; name: string; email: string; tags: string[] };

export const metadata = { title: 'Envoi d’emails' };

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  // Audience ciblée : élèves inscrits (défaut) ou leads du guide méthodologie.
  const audience: 'students' | 'leads' = sp.audience === 'leads' ? 'leads' : 'students';

  let recipients: Recipient[] = [];
  let filterApplied = false;

  // Filtres « élèves »
  const promoF = sp.promo && (PROMOS as readonly string[]).includes(sp.promo) ? sp.promo : 'all';
  const offerF: 'all' | Offer = (OFFER_OPTIONS as string[]).includes(sp.offer ?? '')
    ? (sp.offer as Offer) : 'all';
  const collegeF = sp.college ?? '';

  // Filtres « leads »
  const specialtyF = sp.specialty && (SPECIALTIES as readonly string[]).includes(sp.specialty)
    ? sp.specialty : 'all';
  const voieF: 'all' | 'interne' | 'externe' =
    sp.voie === 'interne' || sp.voie === 'externe' ? sp.voie : 'all';

  // Options de collège (affichées uniquement pour l'audience « élèves »).
  const supabase = await createClient();
  const { data: colleges } = await supabase
    .from('matieres')
    .select('id, nom, semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID)
    .order('nom');
  const collegeOptions = colleges ?? [];

  if (audience === 'students') {
    const { data: students } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, promotion, permission_scope')
      .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID)
      .order('last_name', { ascending: true });

    const filtered = (students ?? []).filter((s) => {
      if (!s.email) return false;
      if (promoF !== 'all' && s.promotion !== promoF) return false;

      const scope = parseScope(s.permission_scope);
      if (offerF !== 'all' && scope.offer !== offerF) return false;

      if (collegeF === 'all-access' && scope.type !== 'all') return false;
      if (collegeF && collegeF !== 'all-access') {
        if (scope.type === 'college' && !scope.colleges.includes(collegeF)) return false;
      }
      return true;
    });

    recipients = filtered.map((s) => {
      const scope = parseScope(s.permission_scope);
      return {
        id: s.id,
        name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || '—',
        email: s.email as string,
        tags: [s.promotion ?? '—', offerLabel(scope.offer)],
      };
    });
    filterApplied = promoF !== 'all' || offerF !== 'all' || !!collegeF;
  } else {
    // Leads du guide méthodologie (table protégée par RLS → client service-role).
    const admin = createAdminClient();
    const { data: leadsData } = await admin
      .from('guide_leads')
      .select('id, first_name, last_name, email, specialty, voie, created_at')
      .order('created_at', { ascending: false });

    const leads = (leadsData ?? []) as unknown as Array<{
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      specialty: string | null;
      voie: string | null;
    }>;

    const filtered = leads.filter((l) => {
      if (!l.email) return false;
      if (specialtyF !== 'all' && (l.specialty ?? '') !== specialtyF) return false;
      if (voieF !== 'all' && (l.voie ?? '') !== voieF) return false;
      return true;
    });

    // Déduplication par email (une même personne peut télécharger plusieurs fois).
    const seen = new Set<string>();
    for (const l of filtered) {
      const key = l.email.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const voieLabel = l.voie === 'interne' ? 'Interne' : l.voie === 'externe' ? 'Externe' : null;
      recipients.push({
        id: l.id,
        name: `${l.first_name ?? ''} ${l.last_name ?? ''}`.trim() || '—',
        email: l.email,
        tags: [l.specialty || 'Spécialité —', ...(voieLabel ? [voieLabel] : [])],
      });
    }
    filterApplied = specialtyF !== 'all' || voieF !== 'all';
  }

  const emails = recipients.map((r) => r.email);
  const emailsBlock = emails.join(', ');

  const tabBase =
    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors';
  const tabActive = 'bg-(--color-primary) text-white shadow-sm';
  const tabIdle = 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)';

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
            Choisissez une audience, filtrez, puis copiez la liste d’emails pour la coller dans Gmail.
          </p>
        </div>
      </header>

      {/* AUDIENCE — segmented control (liens, donc partageables) */}
      <div className="mb-5 flex flex-wrap gap-2">
        <a href="/admin/emails?audience=students" className={`${tabBase} ${audience === 'students' ? tabActive : tabIdle}`}>
          <GraduationCap className="h-4 w-4" />
          Élèves inscrits
        </a>
        <a href="/admin/emails?audience=leads" className={`${tabBase} ${audience === 'leads' ? tabActive : tabIdle}`}>
          <BookDown className="h-4 w-4" />
          Leads Méthodologie
        </a>
      </div>

      {/* FILTRES — formulaire GET (URL = sélection, partageable / rafraîchissable) */}
      <form
        method="GET"
        className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6"
      >
        <input type="hidden" name="audience" value={audience} />
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
          <Filter className="h-4 w-4 text-(--color-primary)" />
          Filtres
        </div>

        {audience === 'students' ? (
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
              <p className="mt-1 text-[11px] text-(--color-ink-muted)">
                Choisissez « Espace Découverte » pour ne cibler que les élèves en découverte.
              </p>
            </Field>

            <Field label="Collège ciblé">
              <select name="college" defaultValue={collegeF} className={selectClass}>
                <option value="">Tous les élèves</option>
                <option value="all-access">Toute l’offre uniquement</option>
                <optgroup label="Élèves ayant accès au collège">
                  {collegeOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </optgroup>
              </select>
              <p className="mt-1 text-[11px] text-(--color-ink-muted)">
                Un seul critère collège : « Toute l’offre » filtre les abonnés full-access ;
                choisissez une matière pour ne garder que ceux qui y ont accès.
              </p>
            </Field>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Spécialité">
              <select name="specialty" defaultValue={specialtyF} className={selectClass}>
                <option value="all">Toutes les spécialités</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-(--color-ink-muted)">
                Spécialité renseignée lors du téléchargement du guide méthodologique.
              </p>
            </Field>

            <Field label="Voie préparée">
              <select name="voie" defaultValue={voieF} className={selectClass}>
                <option value="all">Toutes les voies</option>
                {VOIES.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

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
              href={`/admin/emails?audience=${audience}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)"
            >
              Réinitialiser
            </a>
          )}
        </div>
      </form>

      {/* RÉSULTATS */}
      <section className="mt-8 rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--color-border) px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-(--color-primary)" />
            <span className="font-semibold text-(--color-ink)">{emails.length}</span>
            <span className="text-(--color-ink-soft)">
              {audience === 'leads' ? 'lead' : 'email'}{emails.length > 1 ? 's' : ''}
              {' '}correspond{emails.length > 1 ? 'ent' : ''} au filtre
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
            {audience === 'leads'
              ? 'Aucun lead méthodologie ne correspond à ces filtres.'
              : 'Aucun élève ne correspond à ces filtres.'}
          </div>
        ) : (
          <>
            {/* Bloc prêt pour Gmail — séparé par des virgules */}
            <div className="border-b border-(--color-border) bg-(--color-surface-soft) px-5 py-4 sm:px-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
                Liste prête à coller dans le champ « À : » de Gmail
              </p>
              <code className="block max-h-40 overflow-auto break-all rounded-lg border border-(--color-border) bg-white p-3 font-mono text-xs leading-relaxed text-(--color-ink)">
                {emailsBlock}
              </code>
            </div>

            {/* Lignes individuelles */}
            <ul className="divide-y divide-(--color-border)">
              {recipients.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-(--color-ink)">{r.name}</p>
                    <p className="truncate font-mono text-xs text-(--color-ink-soft)">{r.email}</p>
                  </div>
                  {r.tags.map((t, i) => (
                    <span
                      key={i}
                      className={
                        i === 0
                          ? 'rounded-full bg-(--color-surface-soft) px-2.5 py-0.5 text-[11px] font-medium text-(--color-ink-soft)'
                          : 'rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[11px] font-semibold text-(--color-primary)'
                      }
                    >
                      {t}
                    </span>
                  ))}
                  <CopyButton text={r.email} label="Copier" />
                </li>
              ))}
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
