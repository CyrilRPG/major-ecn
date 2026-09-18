'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Loader2, LogIn, ShieldCheck, ShieldOff } from 'lucide-react';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { Button } from '@/components/ui/button';
import { ToggleActiveButton } from '@/components/admin/toggle-active-button';
import { CollaborateurDialog, type CollaborateurInitial } from './collaborateur-dialog';
import { FORMULES, formulesPour, replierPerimetre, type Perimetre, type ScopeEquipe } from '@/lib/auth/collaborateurs';

type CollegeArbre = { id: string; nom: string; enfants?: { id: string; nom: string }[] };

/** Résumé d'une ligne : « Médecine générale (3/3), Psychiatrie (1/3) +2 ». */
function resumeCourt(per: Perimetre, nomCollege: (id: string) => string): string {
  if (per.specialites === 'toutes') {
    const f = per.formules['*'] ?? [];
    return `Toutes les spécialités · ${f.length === FORMULES.length ? 'toutes formules' : f.join(', ') || 'aucune formule'}`;
  }
  if (per.specialites.length === 0) return 'Aucune spécialité';
  return per.specialites.slice(0, 3).map((c) => `${nomCollege(c)} (${formulesPour(per, c).length}/3)`).join(', ')
    + (per.specialites.length > 3 ? ` +${per.specialites.length - 3}` : '');
}

export type LigneEquipe = {
  id: string;
  role: 'admin' | 'professor';
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  access_end: string | null;
  last_sign_in: string | null;
  mfa_facteurs: number;
  scope: ScopeEquipe | null;
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/** « Se connecter en tant que » un membre de l'équipe : on arrive dans SON administration. */
function ImpersonateEquipe({ userId, nom }: { userId: string; nom: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <Button
        size="sm" variant="outline" disabled={pending} className="gap-1.5"
        onClick={() => {
          if (!confirm(`Voir la plateforme telle que ${nom} la voit ? Vous reviendrez au panel admin via le bandeau.`)) return;
          setError(null);
          start(async () => {
            const res = await fetchAvecJetonFrais('/api/admin/impersonate', { user_id: userId, name: nom });
            if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setError(j.error ?? 'Impossible.'); return; }
            router.push('/admin');
            router.refresh();
          });
        }}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />} Se connecter en tant que
      </Button>
      {error && <span className="text-[11px] text-[#A91D2C]">{error}</span>}
    </span>
  );
}

function Badge({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'primary' | 'ok' | 'warn' | 'danger' }) {
  const styles: Record<string, string> = {
    muted: 'bg-(--color-sand-100) text-(--color-ink-soft)',
    primary: 'bg-[#E5F1FF] text-[#1E4D8B]',
    ok: 'bg-[#E7F6EC] text-[#16793C]',
    warn: 'bg-[#FEF3E2] text-[#B26A00]',
    danger: 'bg-[#FDE7E9] text-[#C0001F]',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${styles[tone]}`}>{children}</span>;
}

export function EquipeList({ rows, colleges }: { rows: LigneEquipe[]; colleges: CollegeArbre[] }) {
  const nom = (r: LigneEquipe) => [r.first_name, r.last_name].filter(Boolean).join(' ') || r.email || r.id.slice(0, 8);
  const plats = colleges.flatMap((c) => [c, ...(c.enfants ?? [])]);
  const nomCollege = (id: string) => plats.find((c) => c.id === id)?.nom ?? id;
  const parentDe: Record<string, string> = {};
  for (const c of colleges) for (const e of c.enfants ?? []) parentDe[e.id] = c.id;
  // Horloge figée au premier rendu : l'expiration se lit à la seconde près
  // sans appel impur pendant le rendu.
  const [maintenant] = useState(() => Date.now());

  return (
    <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface)">
      <table className="w-full text-sm">
        <thead className="bg-(--color-surface-soft) text-left text-[11px] uppercase tracking-wide text-(--color-ink-muted)">
          <tr>
            <th className="px-4 py-3 font-semibold">Collaborateur</th>
            <th className="px-4 py-3 font-semibold">Permissions</th>
            <th className="px-4 py-3 font-semibold">Périmètre</th>
            <th className="px-4 py-3 font-semibold">Statut</th>
            <th className="px-4 py-3 font-semibold">2FA</th>
            <th className="px-4 py-3 font-semibold">Dernière connexion</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const expire = !!r.access_end && new Date(r.access_end).getTime() < maintenant;
            const s = r.scope;
            const initial: CollaborateurInitial | undefined = s ? {
              userId: r.id, first_name: r.first_name, last_name: r.last_name, email: r.email, phone: r.phone,
              fonction: s.fonction, modele: s.modele, modules: s.modules, perimetre: s.perimetre,
              mfa_obligatoire: s.mfa_obligatoire, access_end: r.access_end ? r.access_end.slice(0, 10) : null, is_active: r.is_active,
            } : undefined;
            return (
              <tr key={r.id} className="border-t border-(--color-border) align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-(--color-ink)">{nom(r)}</p>
                  <p className="text-xs text-(--color-ink-muted)">{r.email}</p>
                  {r.role === 'admin'
                    ? <Badge tone="danger">Administrateur</Badge>
                    : s?.fonction ? <p className="mt-0.5 text-xs font-medium text-(--color-ink-soft)">{s.fonction}</p> : null}
                </td>
                <td className="px-4 py-3">
                  {r.role === 'admin' ? (
                    <span className="text-xs text-(--color-ink-muted)">Tous droits, y compris zones réservées.</span>
                  ) : s ? (
                    <div className="flex flex-wrap gap-1">
                      {s.modules.suivi.actif && <Badge tone="primary">Suivi élèves{s.modules.suivi.gerer ? ' · gère' : s.modules.suivi.rediger ? ' · rédige' : ' · lit'}</Badge>}
                      {s.modules.contenus.actif && <Badge tone="primary">Contenus · {(['creer', 'modifier', 'publier', 'supprimer'] as const).filter((d) => s.modules.contenus[d]).map((d) => d.slice(0, 4)).join('/') || 'lecture'}</Badge>}
                      {s.modules.blog.actif && <Badge tone="primary">Blog{s.modules.blog.publier ? ' · publie' : ' · à valider'}</Badge>}
                      {!s.modules.suivi.actif && !s.modules.contenus.actif && !s.modules.blog.actif && <Badge>Aucun module</Badge>}
                      {s.modele && <Badge>modèle : {s.modele.replace(/_/g, ' ')}</Badge>}
                    </div>
                  ) : <Badge>—</Badge>}
                </td>
                <td className="px-4 py-3 text-xs text-(--color-ink-soft)">
                  {r.role === 'admin' ? 'Tout' : s ? resumeCourt(replierPerimetre(s.perimetre, parentDe), nomCollege) : '—'}
                </td>
                <td className="px-4 py-3">
                  {!r.is_active ? <Badge tone="danger">Inactif</Badge> : expire ? <Badge tone="danger">Expiré le {fmt(r.access_end)}</Badge> : r.access_end ? <Badge tone="warn">Actif · fin le {fmt(r.access_end)}</Badge> : <Badge tone="ok">Actif</Badge>}
                </td>
                <td className="px-4 py-3">
                  {r.mfa_facteurs > 0
                    ? <Badge tone="ok"><ShieldCheck className="h-3 w-3" /> Activée</Badge>
                    : s?.mfa_obligatoire ? <Badge tone="warn"><ShieldOff className="h-3 w-3" /> Obligatoire · non activée</Badge>
                    : <Badge><ShieldOff className="h-3 w-3" /> Non activée</Badge>}
                </td>
                <td className="px-4 py-3 text-xs text-(--color-ink-soft)">{r.last_sign_in ? new Date(r.last_sign_in).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Jamais'}</td>
                <td className="px-4 py-3">
                  {r.role === 'professor' && initial && (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <CollaborateurDialog mode="modifier" initial={initial} colleges={colleges} />
                      <Button asChild size="sm" variant="outline" className="gap-1.5">
                        <Link href={`/admin/equipe/${r.id}`}><Eye className="h-3.5 w-3.5" /> Voir ses permissions</Link>
                      </Button>
                      <ImpersonateEquipe userId={r.id} nom={nom(r)} />
                      <ToggleActiveButton userId={r.id} displayName={nom(r)} isActive={r.is_active} />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
