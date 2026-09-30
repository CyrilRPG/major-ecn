import 'server-only';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth/require-role';
import { requireStaffRequest } from '@/lib/auth/api-guard';
import { atterrissageEquipe } from '@/lib/auth/onglets-equipe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSuiviRole } from '@/lib/suivi/roles';
import { DROIT_LABEL, droitsDepuisRole, type Droit, type DroitsDecouverte } from './droits';

/**
 * Gardes du module de relances. Les routes passent TOUTES par le client
 * service-role : la RLS ne protège rien ici, ces gardes si.
 */

export type Acteur = {
  id: string;
  nom: string;
  email: string | null;
  role: string;
  first_name: string | null;
  last_name: string | null;
};

type ProfilActeur = { id: string; role: string | null; first_name: string | null; last_name: string | null; email: string | null; permission_scope?: unknown };

function acteurDe(p: ProfilActeur): Acteur {
  const nom = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || p.email || 'Inconnu';
  return { id: p.id, nom, email: p.email, role: p.role ?? '', first_name: p.first_name, last_name: p.last_name };
}

export async function droitsDuProfil(p: ProfilActeur): Promise<DroitsDecouverte> {
  if (p.role !== 'admin' && p.role !== 'professor') return droitsDepuisRole(null);
  const role = await getSuiviRole({ id: p.id, role: p.role, permission_scope: p.permission_scope } as Parameters<typeof getSuiviRole>[0]);
  return droitsDepuisRole(role);
}

/** Garde de ROUTE API : personnel authentifié (Bearer frais ou cookie) + droit requis. */
export async function requireDecouverteRequest(req: Request, droit: Droit): Promise<
  { ok: true; acteur: Acteur; droits: DroitsDecouverte } | { ok: false; error: NextResponse }
> {
  const guard = await requireStaffRequest(req);
  if (!guard.ok) return guard;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (createAdminClient() as any)
    .from('profiles').select('id, role, first_name, last_name, email, permission_scope').eq('id', guard.auth.user.id).maybeSingle();
  const p = data as ProfilActeur | null;
  if (!p) return { ok: false, error: NextResponse.json({ error: 'Profil introuvable' }, { status: 403 }) };
  const droits = await droitsDuProfil(p);
  if (!droits[droit]) {
    return { ok: false, error: NextResponse.json({ error: `Droit insuffisant : ${DROIT_LABEL[droit]} requis.` }, { status: 403 }) };
  }
  return { ok: true, acteur: acteurDe(p), droits };
}

/** Garde de PAGE : un collaborateur sans le module est renvoyé vers sa page d'atterrissage. */
export async function requireDecouvertePage(): Promise<{ acteur: Acteur; droits: DroitsDecouverte }> {
  const { profile } = await requireStaff();
  const p = profile as unknown as ProfilActeur;
  const droits = await droitsDuProfil(p);
  if (!droits.consulter) redirect(await atterrissageEquipe(profile));
  return { acteur: acteurDe(p), droits };
}
