import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { affectationEmail } from '@/lib/email/cockpit';

/**
 * Socle serveur du cockpit : client service-role (aucune policy RLS n'est
 * ouverte sur les tables `cockpit_*`), contexte de l'utilisateur, journal
 * d'audit et notifications internes.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = any;

export const FACULTE = EDN_FACULTE_ID;

export function db(): Db {
  return createAdminClient();
}

export type Moi = {
  id: string;
  role: string;
  estAdmin: boolean;
  prenom: string;
  nom: string;
  email: string | null;
};

/** Garde des pages et actions du cockpit : administrateurs et membres de l'équipe. */
export async function contexteCockpit(): Promise<{ moi: Moi; db: Db }> {
  // Import différé : ce module sert aussi aux crons et aux scripts de recette,
  // hors du rendu Next (require-role tire next/navigation).
  const { requireStaff } = await import('@/lib/auth/require-role');
  const { user, profile, isAdmin } = await requireStaff();
  const prenom = (profile.first_name ?? '').trim();
  const nom = [profile.first_name, profile.last_name].map((s) => (s ?? '').trim()).filter(Boolean).join(' ');
  return {
    moi: { id: user.id, role: profile.role, estAdmin: isAdmin, prenom, nom: nom || profile.email || '', email: profile.email },
    db: db(),
  };
}

export async function journaliser(
  d: Db,
  e: { objet_type: string; objet_id: string; acteur_id: string | null; action: string; details?: Record<string, unknown>; audit?: boolean },
): Promise<void> {
  const { error } = await d.from('cockpit_journal').insert({
    objet_type: e.objet_type,
    objet_id: e.objet_id,
    acteur_id: e.acteur_id,
    action: e.action,
    details: e.details ?? {},
    audit: e.audit ?? false,
  });
  if (error) console.error('[cockpit] journal', error.message);
}

export type NotifCockpit = {
  user_id: string;
  genre:
    | 'reponse' | 'rappel' | 'echeance' | 'partage' | 'affectation' | 'message' | 'demande' | 'reclamation'
    // Évènements de la plateforme (refonte des notifications, 09/10/2026).
    | 'rendez_vous' | 'question' | 'contenu' | 'inscription' | 'paiement' | 'prospect' | 'formulaire' | 'alerte' | 'signalement' | 'compte';
  titre: string;
  corps?: string | null;
  lien?: string | null;
  /** Les alertes répétitives d'une même clé sont regroupées (§10) : compteur + remise en non lue. */
  group_key: string;
};

export async function notifier(d: Db, n: NotifCockpit): Promise<void> {
  const { data: existante } = await d
    .from('cockpit_notifications')
    .select('id, nombre, lu_at')
    .eq('user_id', n.user_id)
    .eq('group_key', n.group_key)
    .maybeSingle();
  const maintenant = new Date().toISOString();
  if (existante) {
    await d
      .from('cockpit_notifications')
      .update({
        titre: n.titre,
        corps: n.corps ?? null,
        lien: n.lien ?? null,
        // Une alerte déjà lue repart à 1 ; une alerte encore non lue s'incrémente.
        nombre: existante.lu_at ? 1 : (existante.nombre ?? 1) + 1,
        lu_at: null,
        updated_at: maintenant,
      })
      .eq('id', existante.id);
    return;
  }
  const { error } = await d.from('cockpit_notifications').insert({
    user_id: n.user_id,
    genre: n.genre,
    titre: n.titre,
    corps: n.corps ?? null,
    lien: n.lien ?? null,
    group_key: n.group_key,
  });
  // Course entre deux insertions de la même clé : la contrainte unique protège.
  if (error && error.code !== '23505') console.error('[cockpit] notification', error.message);
}

export type ProfilCourt = { id: string; first_name: string | null; last_name: string | null; email: string | null; role: string };

export async function profilsParIds(d: Db, ids: (string | null | undefined)[]): Promise<Map<string, ProfilCourt>> {
  const uniques = [...new Set(ids.filter((x): x is string => !!x))];
  const map = new Map<string, ProfilCourt>();
  for (let i = 0; i < uniques.length; i += 200) {
    const { data } = await d
      .from('profiles')
      .select('id, first_name, last_name, email, role')
      .in('id', uniques.slice(i, i + 200));
    for (const p of (data ?? []) as ProfilCourt[]) map.set(p.id, p);
  }
  return map;
}

/** Membres de l'équipe (administrateurs et collaborateurs actifs) — destinataires de partages et d'affectations. */
export async function membresEquipe(d: Db): Promise<ProfilCourt[]> {
  const { data } = await d
    .from('profiles')
    .select('id, first_name, last_name, email, role, is_active')
    .in('role', ['admin', 'professor'])
    .eq('faculte_id', FACULTE)
    .order('first_name')
    .limit(1000);
  return ((data ?? []) as (ProfilCourt & { is_active: boolean | null })[])
    .filter((p) => p.is_active !== false)
    .map(({ id, first_name, last_name, email, role }) => ({ id, first_name, last_name, email, role }));
}

/**
 * Affectation d'une tâche ou d'un dossier : notification interne + e-mail
 * si la personne ne l'a pas désactivé dans ses paramètres.
 */
export async function annoncerAffectation(
  d: Db,
  o: { userId: string; auteur: string; titre: string; lien: string; groupKey: string; genre?: NotifCockpit['genre'] },
): Promise<void> {
  await notifier(d, { user_id: o.userId, genre: o.genre ?? 'affectation', titre: `${o.auteur} vous a confié un suivi`, corps: o.titre, lien: o.lien, group_key: o.groupKey });
  const [{ data: r }, { data: p }] = await Promise.all([
    d.from('cockpit_reglages').select('email_affectations').eq('user_id', o.userId).maybeSingle(),
    d.from('profiles').select('first_name, email').eq('id', o.userId).maybeSingle(),
  ]);
  if (r?.email_affectations === false || !p?.email) return;
  const mail = affectationEmail({ prenom: (p.first_name ?? '').trim(), auteur: o.auteur, titre: o.titre, lien: `${siteUrl()}${o.lien}` });
  await sendEmail({ to: p.email, subject: mail.subject, html: mail.html, text: mail.text, sansBcc: true, idempotencyKey: `cockpit-${o.groupKey}`.slice(0, 250), timeoutMs: 15_000 })
    .catch((e) => console.error('[cockpit] e-mail d’affectation', e));
}
