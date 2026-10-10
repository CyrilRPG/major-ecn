'use server';

import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { accesEquipeExpire } from '@/lib/auth/collaborateurs';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { studentName, studentOffers, studentSpecialty, studentVoie } from '@/lib/suivi/students';
import { cleSpecialite, type EleveClassement } from '@/lib/crm/classement';

export type PeriodeClassement = 'tout' | '30j' | '7j';

type LigneSql = {
  user_id: string;
  videos: number;
  questions: number;
  series: number;
  fiches: number;
  flashcards: number;
  last_activity: string | null;
};

type Profil = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  permission_scope: unknown;
  is_active: boolean | null;
};

/**
 * Données de l'onglet « Classement » du CRM pédagogique, chargées à
 * l'ouverture de l'onglet (l'agrégat parcourt toute l'activité, ~1 s).
 * Réservé aux administrateurs : lecture service-role, la RLS ne protège pas.
 */
export async function chargerClassement(periode: PeriodeClassement): Promise<
  { ok: true; eleves: EleveClassement[] } | { ok: false; error: string }
> {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile || profile.role !== 'admin' || profile.is_active === false || accesEquipeExpire(profile)) {
    return { ok: false, error: 'Réservé aux administrateurs.' };
  }
  if (periode !== 'tout' && periode !== '30j' && periode !== '7j') return { ok: false, error: 'Période invalide.' };
  const depuis = periode === 'tout' ? null : new Date(Date.now() - (periode === '30j' ? 30 : 7) * 86_400_000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adm = createAdminClient() as any;
  try {
    const [profils, lignes] = await Promise.all([
      fetchAllRows<Profil>((from, to) =>
        adm.from('profiles')
          .select('id, first_name, last_name, email, permission_scope, is_active')
          .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID)
          .order('id').range(from, to)),
      fetchAllRows<LigneSql>((from, to) =>
        adm.rpc('admin_crm_classement', { p_faculte_id: EDN_FACULTE_ID, p_depuis: depuis }).order('user_id').range(from, to)),
    ]);
    const parEleve = new Map(lignes.map((l) => [l.user_id, l]));

    const eleves: EleveClassement[] = profils
      // Comptes désactivés : hors classement.
      .filter((p) => p.is_active !== false)
      .map((p) => {
        const a = parEleve.get(p.id);
        const specialites = studentSpecialty(p.permission_scope).split(',').map((s) => s.trim()).filter(Boolean);
        return {
          id: p.id,
          nom: studentName(p),
          email: p.email,
          specialites,
          specialitesCles: specialites.map(cleSpecialite),
          formules: studentOffers(p.permission_scope),
          voie: studentVoie(p.permission_scope),
          videos: a?.videos ?? 0,
          questions: a?.questions ?? 0,
          series: a?.series ?? 0,
          fiches: a?.fiches ?? 0,
          flashcards: a?.flashcards ?? 0,
          derniereActivite: a?.last_activity ?? null,
        };
      });
    return { ok: true, eleves };
  } catch (e) {
    console.error('[crm/classement]', e);
    return { ok: false, error: 'Classement indisponible pour le moment.' };
  }
}
