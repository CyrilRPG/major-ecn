'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { createAdminClient } from '@/lib/supabase/admin';
import { EVC_CALENDRIER_TAG } from '@/lib/evc-calendrier/server';
import { instantParis } from '@/lib/evc-calendrier/dates';

/**
 * Administration du Calendrier EVC (/admin/calendrier-evc) : épreuves par
 * spécialité et réglages de session. Écriture en service-role (les tables ne
 * sont ouvertes qu'en lecture), donc garde administrateur obligatoire. Chaque
 * enregistrement est tracé dans `admin_audit_logs`, invalide le cache du
 * calendrier (étiquette) et revalide les pages qui l'affichent.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Resultat = { ok: true; id?: string } | { ok: false; error: string };

async function exigerAdmin() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié — recharge la page.');
  if (profile.role !== 'admin') throw new Error('Réservé aux administrateurs.');
  return profile;
}

const echec = (e: unknown): Resultat => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur inattendue.' });

/** Toutes les pages qui lisent le calendrier. */
function rafraichir() {
  updateTag(EVC_CALENDRIER_TAG);
  revalidatePath('/');
  revalidatePath('/specialites', 'layout');
  revalidatePath('/visite-guidee');
  revalidatePath('/admin/calendrier-evc');
  revalidatePath('/admin/annonces');
  revalidatePath('/accueil');
  revalidatePath('/matieres/[matiere]', 'page');
  revalidatePath('/planificateur', 'layout');
}

const URL_SITE = /^(https?:\/\/|\/)\S*$/i;
const texteOuNull = z.string().trim().max(500).nullable().optional().transform((v) => (v ? v : null));
const entierOuNull = z.number().int().min(0).max(100_000).nullable().optional().transform((v) => (v ?? null));
/** 'AAAA-MM-JJTHH:mm' saisi à l'heure de Paris → ISO UTC. */
const instantSaisi = z.string().trim().nullable().optional().transform((v, ctx) => {
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) {
    ctx.addIssue({ code: 'custom', message: 'Date et heure d’inscription invalides.' });
    return z.NEVER;
  }
  return new Date(instantParis(v.slice(0, 10), v.slice(11, 16))).toISOString();
});

const EpreuveSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  session: z.number().int().min(2020).max(2100),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,80}$/, 'Slug : minuscules, chiffres et tirets uniquement.'),
  nom: z.string().trim().min(2, 'Nom trop court.').max(160),
  date_epreuve: z.string().trim().nullable().optional().transform((v, ctx) => {
    if (!v) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { ctx.addIssue({ code: 'custom', message: 'Date d’épreuve invalide.' }); return z.NEVER; }
    return v;
  }),
  postes_interne: entierOuNull,
  postes_externe: entierOuNull,
  url_page: texteOuNull.refine((v) => !v || URL_SITE.test(v), 'L’URL de la page doit commencer par / ou https://.'),
  inscription_debut: instantSaisi,
  inscription_fin: instantSaisi,
  college_id: texteOuNull,
  lieu: z.string().trim().min(2).max(160).default('Espace Jean Monnet, Rungis'),
  note: texteOuNull,
  ordre: z.number().int().min(-100_000).max(100_000).default(0),
  actif: z.boolean().default(true),
}).refine((e) => !e.inscription_debut || !e.inscription_fin || e.inscription_debut <= e.inscription_fin, {
  message: 'La clôture des inscriptions précède leur ouverture.',
});

export async function enregistrerEpreuve(input: z.input<typeof EpreuveSchema>): Promise<Resultat> {
  try {
    const profile = await exigerAdmin();
    const p = EpreuveSchema.safeParse(input);
    if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? 'Saisie invalide.' };
    const { id, ...ligne } = p.data;
    const db = createAdminClient() as any;
    const avant = id ? (await db.from('evc_calendrier').select('*').eq('id', id).maybeSingle()).data : null;
    const { data, error } = id
      ? await db.from('evc_calendrier').update({ ...ligne, updated_at: new Date().toISOString() }).eq('id', id).select('id').single()
      : await db.from('evc_calendrier').insert(ligne).select('id').single();
    if (error) {
      return { ok: false, error: error.code === '23505' ? `La spécialité « ${ligne.slug} » existe déjà pour la session ${ligne.session}.` : error.message };
    }
    await logAudit({
      actor: profile, action: id ? 'update' : 'create', entity: 'evc_calendrier', entityId: data.id,
      description: `Calendrier EVC : ${id ? 'modification' : 'ajout'} de « ${ligne.nom} » (session ${ligne.session})`,
      diff: { avant, apres: ligne },
    });
    rafraichir();
    return { ok: true, id: data.id };
  } catch (e) {
    return echec(e);
  }
}

/** Désactiver / réactiver une spécialité (jamais de suppression : l'historique reste). */
export async function basculerActif(id: string, actif: boolean): Promise<Resultat> {
  try {
    const profile = await exigerAdmin();
    if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'Identifiant invalide.' };
    const db = createAdminClient() as any;
    const { data, error } = await db.from('evc_calendrier').update({ actif, updated_at: new Date().toISOString() }).eq('id', id).select('nom, session').single();
    if (error) return { ok: false, error: error.message };
    await logAudit({
      actor: profile, action: 'update', entity: 'evc_calendrier', entityId: id,
      description: `Calendrier EVC : « ${data.nom} » (session ${data.session}) ${actif ? 'réactivée' : 'désactivée'}`,
      diff: { actif },
    });
    rafraichir();
    return { ok: true };
  } catch (e) {
    return echec(e);
  }
}

/** Nouvel ordre d'affichage d'une session (liste d'identifiants, du premier au dernier). */
export async function reordonner(ids: string[]): Promise<Resultat> {
  try {
    const profile = await exigerAdmin();
    const p = z.array(z.string().uuid()).min(1).max(200).safeParse(ids);
    if (!p.success) return { ok: false, error: 'Ordre invalide.' };
    const db = createAdminClient() as any;
    for (const [i, id] of p.data.entries()) {
      const { error } = await db.from('evc_calendrier').update({ ordre: (i + 1) * 10 }).eq('id', id);
      if (error) return { ok: false, error: error.message };
    }
    await logAudit({
      actor: profile, action: 'update', entity: 'evc_calendrier', entityId: null,
      description: `Calendrier EVC : ordre d’affichage modifié (${p.data.length} spécialités)`,
      diff: { ordre: p.data },
    });
    rafraichir();
    return { ok: true };
  } catch (e) {
    return echec(e);
  }
}

const ReglagesSchema = z.object({
  session_en_cours: z.number().int().min(2020).max(2100),
  libelle: z.string().trim().min(2).max(120),
  prochaine_inscription_debut: instantSaisi,
  prochaine_inscription_fin: instantSaisi,
  prochaine_session_publiee: z.boolean(),
  url_deroule: z.string().trim().regex(URL_SITE, 'L’URL du déroulé doit commencer par / ou https://.'),
  slug_capture_hero: z.string().trim().regex(/^[a-z0-9-]{2,80}$/, 'Spécialité de la capture invalide.'),
  postes_total_interne: entierOuNull,
  postes_total_externe: entierOuNull,
  source_postes: texteOuNull,
}).refine((r) => !r.prochaine_inscription_debut || !r.prochaine_inscription_fin || r.prochaine_inscription_debut <= r.prochaine_inscription_fin, {
  message: 'La clôture des inscriptions de la session suivante précède leur ouverture.',
});

export async function enregistrerReglages(input: z.input<typeof ReglagesSchema>): Promise<Resultat> {
  try {
    const profile = await exigerAdmin();
    const p = ReglagesSchema.safeParse(input);
    if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? 'Saisie invalide.' };
    const db = createAdminClient() as any;
    const avant = (await db.from('evc_calendrier_sessions').select('*').eq('id', true).maybeSingle()).data;
    const { error } = await db.from('evc_calendrier_sessions').upsert({ id: true, ...p.data, updated_at: new Date().toISOString() });
    if (error) return { ok: false, error: error.message };
    await logAudit({
      actor: profile, action: 'update', entity: 'evc_calendrier_sessions', entityId: String(p.data.session_en_cours),
      description: `Calendrier EVC : réglages de session modifiés (session ${p.data.session_en_cours})`,
      diff: { avant, apres: p.data },
    });
    rafraichir();
    return { ok: true };
  } catch (e) {
    return echec(e);
  }
}
