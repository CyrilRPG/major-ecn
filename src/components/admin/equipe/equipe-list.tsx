'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Loader2, LogIn, Search, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { Button } from '@/components/ui/button';
import { ToggleActiveButton } from '@/components/admin/toggle-active-button';
import { ResendActivationButton } from '@/components/admin/resend-activation-button';
import { CollaborateurDialog, type CollaborateurInitial } from './collaborateur-dialog';
import {
  FORMULES, POSTE_LABEL, formulesPour, posteDuScope, replierPerimetre,
  type Perimetre, type PosteEquipe, type ScopeEquipe,
} from '@/lib/auth/collaborateurs';

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

/* ───────────────────────── recherche & filtres ───────────────────────── */

type FiltreRole = 'tous' | 'admin' | PosteEquipe;
type Statut = 'actifs' | 'desactives' | 'expires';
type FiltreStatut = 'tous' | Statut;

const FILTRES_ROLE: { key: FiltreRole; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'admin', label: 'Administrateurs' },
  { key: 'enseignant_relecteur', label: 'Enseignants' },
  { key: 'commercial', label: 'Commerciaux' },
  { key: 'gestionnaire_video', label: 'Gestionnaires vidéo' },
  { key: 'redacteur_blog', label: 'Rédacteurs blog' },
  { key: 'responsable_complet', label: 'Responsables complets' },
  { key: 'personnalise', label: 'Personnalisés' },
];

const FILTRES_STATUT: { key: FiltreStatut; label: string }[] = [
  { key: 'tous', label: 'Tous les statuts' },
  { key: 'actifs', label: 'Actifs' },
  { key: 'desactives', label: 'Désactivés' },
  { key: 'expires', label: 'Accès expirés' },
];

/** Minuscules sans accents : « Médecine » se trouve en tapant « medecine ». */
const normaliser = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const chiffres = (s: string) => s.replace(/\D/g, '');

/** Rôle d'une ligne : administrateur, ou poste du collaborateur (modèle, sinon déduit de ses modules). */
function roleDe(r: LigneEquipe): Exclude<FiltreRole, 'tous'> {
  return r.role === 'admin' ? 'admin' : posteDuScope(r.scope);
}

function statutDe(r: LigneEquipe, maintenant: number): Statut {
  if (!r.is_active) return 'desactives';
  return r.access_end && new Date(r.access_end).getTime() < maintenant ? 'expires' : 'actifs';
}

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

  const [recherche, setRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState<FiltreRole>('tous');
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous');

  // Recherche + statut d'abord : les compteurs des filtres de rôle reflètent
  // ce qui reste visible, puis le rôle choisi restreint la liste.
  const avantRole = useMemo(() => {
    const q = normaliser(recherche);
    const qChiffres = chiffres(recherche);
    return rows.filter((r) => {
      if (filtreStatut !== 'tous' && statutDe(r, maintenant) !== filtreStatut) return false;
      if (!q) return true;
      const role = roleDe(r);
      const texte = normaliser([
        r.first_name, r.last_name, r.email, r.phone, r.scope?.fonction,
        role === 'admin' ? 'administrateur' : POSTE_LABEL[role],
      ].filter(Boolean).join(' '));
      if (q.split(/\s+/).every((mot) => texte.includes(mot))) return true;
      // Téléphone saisi avec ou sans espaces / points.
      return qChiffres.length >= 3 && !!r.phone && chiffres(r.phone).includes(qChiffres);
    });
  }, [rows, recherche, filtreStatut, maintenant]);

  const compteurs = useMemo(() => {
    const c: Record<FiltreRole, number> = {
      tous: avantRole.length, admin: 0, enseignant_relecteur: 0, commercial: 0, gestionnaire_video: 0,
      redacteur_blog: 0, responsable_complet: 0, personnalise: 0,
    };
    for (const r of avantRole) c[roleDe(r)] += 1;
    return c;
  }, [avantRole]);

  const visibles = filtreRole === 'tous' ? avantRole : avantRole.filter((r) => roleDe(r) === filtreRole);
  const filtreActif = recherche.trim() !== '' || filtreRole !== 'tous' || filtreStatut !== 'tous';
  const reinitialiser = () => { setRecherche(''); setFiltreRole('tous'); setFiltreStatut('tous'); };

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Rechercher un collaborateur</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par nom, email, téléphone ou fonction…"
              className="h-10 w-full rounded-xl border border-(--color-border) bg-(--color-surface) pl-9 pr-3 text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-muted) focus:border-(--color-primary)"
            />
          </label>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value as FiltreStatut)}
            aria-label="Filtrer par statut"
            className="h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
          >
            {FILTRES_STATUT.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrer par rôle">
          {FILTRES_ROLE.map((f) => {
            const actif = filtreRole === f.key;
            const n = compteurs[f.key];
            if (f.key !== 'tous' && n === 0 && !actif) return null;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={actif}
                onClick={() => setFiltreRole(f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  actif
                    ? 'border-(--color-primary) bg-(--color-primary) text-white'
                    : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)'
                }`}
              >
                {f.label}
                <span className={`rounded-full px-1.5 text-[10px] ${actif ? 'bg-white/20' : 'bg-(--color-sand-100)'}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-(--color-ink-muted)">
          <span>
            {visibles.length} résultat{visibles.length > 1 ? 's' : ''}{filtreActif ? ` sur ${rows.length}` : ''}
          </span>
          {filtreActif && (
            <button type="button" onClick={reinitialiser} className="inline-flex items-center gap-1 font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">
              <X className="h-3.5 w-3.5" /> Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

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
            {visibles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-(--color-ink-soft)">
                  Aucun collaborateur ne correspond à ces critères.
                  {filtreActif && (
                    <button type="button" onClick={reinitialiser} className="ml-1 font-semibold text-(--color-primary-deep) underline-offset-2 hover:underline">
                      Réinitialiser les filtres
                    </button>
                  )}
                </td>
              </tr>
            )}
            {visibles.map((r) => {
              const expire = statutDe(r, maintenant) === 'expires';
              const poste = roleDe(r);
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
                    {poste === 'admin'
                      ? <Badge tone="danger">Administrateur</Badge>
                      : (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge tone={poste === 'personnalise' ? 'muted' : 'primary'}>{POSTE_LABEL[poste]}</Badge>
                          {s?.fonction && <span className="text-xs font-medium text-(--color-ink-soft)">{s.fonction}</span>}
                        </div>
                      )}
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
                        {s.modele && <Badge>modèle : {POSTE_LABEL[s.modele].toLowerCase()}</Badge>}
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
                        {!r.last_sign_in && (
                          <ResendActivationButton userId={r.id} displayName={nom(r)} cible="la personne" />
                        )}
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
    </div>
  );
}
