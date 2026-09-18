import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Eye, ShieldCheck } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { parseScope, scopeOffers } from '@/lib/auth/permissions';
import {
  ZONES_RESERVEES_ADMIN, accesEquipeExpire, eleveDansPerimetre, lireScopeEquipe, pagesDuScope, replierPerimetre, resumeModules, resumePerimetre,
} from '@/lib/auth/collaborateurs';
import { hierarchieColleges } from '@/lib/equipe/server';

export const dynamic = 'force-dynamic';

/**
 * « Voir ses permissions » (cahier des charges 18/09/2026, §8) : l'aperçu
 * sécurisé de ce qu'un collaborateur voit réellement — modules et droits,
 * périmètre traduit en nombre d'élèves, pages ouvertes, zones fermées —
 * sans usurper sa session.
 */
export default async function ApercuPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const [{ data: p }, { data: roleSuivi }, hierarchie] = await Promise.all([
    a.from('profiles').select('id, role, first_name, last_name, email, is_active, access_end, permission_scope').eq('id', id).maybeSingle(),
    a.from('suivi_staff_roles').select('role').eq('user_id', id).maybeSingle(),
    hierarchieColleges(),
  ]);
  const noms = hierarchie.noms;
  if (!p || p.role !== 'professor') notFound();
  const herite = roleSuivi?.role === 'responsable' || roleSuivi?.role === 'intervenant' || roleSuivi?.role === 'lecture' ? roleSuivi.role : null;
  const scope = lireScopeEquipe(p.permission_scope, herite);
  if (!scope) notFound();

  // Population du périmètre : les élèves de la plateforme dont au moins une
  // spécialité ET une formule sont autorisées.
  type Eleve = { id: string; permission_scope: unknown };
  const eleves = await fetchAllRows<Eleve>((from, to) => a
    .from('profiles').select('id, permission_scope').eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID).order('id').range(from, to));
  const dansPerimetre = eleves.filter((e) => {
    const s = parseScope(e.permission_scope);
    return eleveDansPerimetre(scope.perimetre, { colleges: s.type === 'all' ? 'all' : s.colleges, offers: scopeOffers(s) });
  }).length;
  const nom = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email;
  const expire = accesEquipeExpire(p);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/admin/equipe" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">
        <ArrowLeft className="h-3.5 w-3.5" /> Équipe &amp; Permissions
      </Link>
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Aperçu des permissions</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)"><Eye className="h-5 w-5 text-[#7C3AED]" /> {nom}</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          {scope.fonction ?? 'Sans fonction'} · {p.is_active === false ? 'compte inactif' : expire ? 'accès expiré' : 'compte actif'}
          {p.access_end ? ` · fin d’accès le ${new Date(p.access_end).toLocaleDateString('fr-FR')}` : ''}
          {scope.mfa_obligatoire ? ' · 2FA obligatoire' : ''}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="text-sm font-bold text-(--color-ink)">Permissions</h2>
          <ul className="mt-2 space-y-1 text-sm text-(--color-ink-soft)">{resumeModules(scope).map((l) => <li key={l}>• {l}</li>)}</ul>
        </section>
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="text-sm font-bold text-(--color-ink)">Périmètre</h2>
          <ul className="mt-2 space-y-1 text-sm text-(--color-ink-soft)">{resumePerimetre(replierPerimetre(scope.perimetre, hierarchie.parentDe), (c) => noms.get(c) ?? c).map((l) => <li key={l}>• {l}</li>)}</ul>
          <p className="mt-3 text-sm text-(--color-ink)">
            <strong>{dansPerimetre}</strong> élève{dansPerimetre > 1 ? 's' : ''} dans ce périmètre
            {scope.modules.suivi.actif && scope.modules.suivi.population !== 'tous' ? ' (avant restriction de population)' : ''}.
          </p>
        </section>
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="text-sm font-bold text-(--color-ink)">Pages ouvertes</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {pagesDuScope(scope).map((pg) => (
              <li key={pg.href}><Link href={pg.href} className="font-medium text-(--color-primary-deep) underline-offset-2 hover:underline">{pg.label}</Link> <span className="text-xs text-(--color-ink-muted)">{pg.href}</span></li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><ShieldCheck className="h-4 w-4 text-[#16793C]" /> Toujours fermé</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--color-ink-soft)">{ZONES_RESERVEES_ADMIN.map((z) => <li key={z}>{z}</li>)}</ul>
        </section>
      </div>
    </main>
  );
}
