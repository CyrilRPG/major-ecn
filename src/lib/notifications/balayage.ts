import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { canAccessCollege, canAccessCours, parseScope, scopeOffers, type ContentAccess } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
import { getAccessInfo } from '@/lib/auth/access';
import { canStudentReadSerie } from '@/lib/data/qcm-access-rules';
import { contenusPourEleve, enLigne, type CoursAAlerter, type VideoAAlerter } from '@/lib/videos/alerte-eleves';
import { isExamTargeted } from '@/lib/exams/targeting';
import { evenementVisiblePourEleve, heureCourte, instantParis, libelleJourLong, type EvenementPlateformeBrut } from '@/lib/agenda/planning';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { notificationImmediateEmail, recapitulatifEmail, type ElementNotif } from '@/lib/email/echanges';
import type { PermissionScope } from '@/types/domain';
import { LIBELLE_CATEGORIE, type CategorieNotif } from './categories';
import { notifier, type NotifLigne } from './centre';

/**
 * Balayage du centre de notifications (cron toutes les 5 minutes) :
 *  1. nouveaux contenus EFFECTIVEMENT publiés (vidéos en ligne, supports,
 *     fiches, séries de QCM, dossiers, épreuves blanches), regroupés par
 *     spécialité : 40 QCM ajoutés = UNE notification ; chaque élève n'est
 *     prévenu que de ce qu'il peut ouvrir (mêmes règles que l'espace élève) ;
 *  2. rappels des séances en direct ;
 *  3. envoi des e-mails immédiats, puis du récapitulatif du soir.
 * Les simples modifications ne déclenchent rien : seule l'équipe peut
 * annoncer une mise à jour significative (catégorie « Supports et cours modifiés »).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createAdminClient() as any;

type Reglages = {
  pause_globale: boolean; auto_video: boolean; auto_support: boolean; auto_qcm: boolean; auto_cases: boolean; auto_exam: boolean; auto_live: boolean;
  regroupement_minutes: number; depuis: string; rappel_live_minutes: number; digest_heure: number; dernier_digest_jour: string | null;
};

export async function reglagesNotifications(): Promise<Reglages> {
  const { data, error } = await db().from('notification_reglages').select('*').eq('id', 1).maybeSingle();
  if (error || !data) throw new Error(`Réglages des notifications illisibles : ${error?.message ?? 'ligne absente'}`);
  return data as Reglages;
}

type Eleve = { id: string; scope: PermissionScope; brut: unknown; promotion: string | null; access: ContentAccess };

async function elevesActifs(): Promise<Eleve[]> {
  type L = { id: string; permission_scope: unknown; is_active: boolean | null; access_end: string | null; promotion: string | null; evc_session: unknown };
  const lignes = await fetchAllRows<L>((from, to) => db().from('profiles')
    .select('id, permission_scope, is_active, access_end, promotion, evc_session:evc_sessions(default_access_end)')
    .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID).order('id').range(from, to));
  const cache = new Map<string, Promise<ContentAccess>>();
  const out: Eleve[] = [];
  for (const l of lignes) {
    if (l.is_active === false) continue;
    const s = Array.isArray(l.evc_session) ? l.evc_session[0] : l.evc_session;
    if (getAccessInfo({ role: 'student', access_end: l.access_end, evc_session: (s ?? null) as { default_access_end: string } | null }).expired) continue;
    const scope = parseScope(l.permission_scope);
    if (scope.offer === 'decouverte') continue;
    const cle = JSON.stringify([[...new Set(scopeOffers(scope))].sort(), scope.content_overrides ?? null]);
    let p = cache.get(cle);
    if (!p) { p = fetchContentAccessForScopeWith(db(), scope); cache.set(cle, p); }
    out.push({ id: l.id, scope, brut: l.permission_scope, promotion: l.promotion, access: await p });
  }
  return out;
}

type Cours = { id: string; titre: string; matiere_id: string; access_type: 'all' | 'specific' | null; matieres: { nom: string; access_type: 'all' | 'specific' | null; parent_matiere_id: string | null } | null };

async function coursDe(ids: string[]): Promise<Map<string, Cours & { specialite: string; specialiteNom: string }>> {
  const out = new Map<string, Cours & { specialite: string; specialiteNom: string }>();
  const uniques = [...new Set(ids)];
  const parents = new Set<string>();
  const lignes: Cours[] = [];
  for (let i = 0; i < uniques.length; i += 150) {
    const { data } = await db().from('cours').select('id, titre, matiere_id, access_type, matieres(nom, access_type, parent_matiere_id)').in('id', uniques.slice(i, i + 150));
    for (const c of (data ?? []) as Cours[]) { lignes.push(c); if (c.matieres?.parent_matiere_id) parents.add(c.matieres.parent_matiere_id); }
  }
  const nomsParents = new Map<string, string>();
  if (parents.size) {
    const { data } = await db().from('matieres').select('id, nom').in('id', [...parents]);
    for (const m of (data ?? []) as { id: string; nom: string }[]) nomsParents.set(m.id, m.nom);
  }
  for (const c of lignes) {
    const spec = c.matieres?.parent_matiere_id ?? c.matiere_id;
    out.set(c.id, { ...c, specialite: spec, specialiteNom: nomsParents.get(spec) ?? c.matieres?.nom ?? 'votre spécialité' });
  }
  return out;
}

function accesItem(e: Eleve, c: Cours): boolean {
  return canAccessCollege(e.scope, c.matiere_id, c.matieres?.access_type ?? 'all') && canAccessCours(e.scope, c.matiere_id, c.id, c.access_type ?? 'all');
}

const jour = () => new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });

type Element = { type: string; id: string; categorie: CategorieNotif; coursId: string | null; poids: number; titre: string };

export type BilanBalayage = { contenus: number; notifications: number; emails: number; rappels: number; erreurs: string[] };

/* ─────────────────────────── 1. Nouveaux contenus ─────────────────────────── */

export async function annoncerNouveauxContenus(now = new Date()): Promise<BilanBalayage> {
  const bilan: BilanBalayage = { contenus: 0, notifications: 0, emails: 0, rappels: 0, erreurs: [] };
  const r = await reglagesNotifications();
  if (r.pause_globale) return bilan;
  const calme = new Date(now.getTime() - r.regroupement_minutes * 60_000).toISOString();
  const depuis = r.depuis;
  const elements: Element[] = [];

  // Vidéos publiées et en ligne (y compris programmées dont l'heure est venue).
  type V = VideoAAlerter & { cours_id: string; status: string | null; publish_at: string | null; published_at: string | null; created_at: string };
  let videos: V[] = [];
  if (r.auto_video || r.auto_support) {
    const { data } = await db().from('videos')
      .select('id, titre, type, cours_id, status, publish_at, published_at, created_at, bunny_video_id, live_at, voies, offers, denied_user_ids, allowed_user_ids, video_supports(id, titre, order_index, voies, offers, created_at)')
      .eq('status', 'publie').or(`published_at.gte.${depuis},publish_at.gte.${depuis},created_at.gte.${depuis}`).limit(500);
    videos = ((data ?? []) as (V & { video_supports: { id: string; titre: string; voies: string[] | null; offers: string[] | null; created_at: string }[] })[])
      .map((v) => ({ ...v, type: v.type === 'seance_approfondie' ? 'seance_approfondie' : 'cours', supports: v.video_supports ?? [] }));
    for (const v of videos) {
      if (!enLigne(v, now.getTime())) continue;
      const dispo = [v.publish_at, v.published_at, v.created_at].filter(Boolean).sort().at(-1) as string;
      if (dispo > calme || dispo < depuis) continue;
      if (r.auto_video && v.bunny_video_id) elements.push({ type: 'video', id: v.id, categorie: 'video', coursId: v.cours_id, poids: 1, titre: v.titre });
    }
  }
  // Nouveaux supports de vidéos déjà en ligne.
  if (r.auto_support) {
    const { data } = await db().from('video_supports').select('id, titre, video_id, created_at').gte('created_at', depuis).lte('created_at', calme).limit(500);
    for (const s of (data ?? []) as { id: string; titre: string; video_id: string }[]) {
      const v = videos.find((x) => x.id === s.video_id);
      const { data: vid } = v ? { data: v } : await db().from('videos').select('id, cours_id, status, publish_at').eq('id', s.video_id).maybeSingle();
      if (!vid || vid.status !== 'publie' || !enLigne(vid, now.getTime())) continue;
      elements.push({ type: 'support', id: s.id, categorie: 'support', coursId: vid.cours_id, poids: 1, titre: s.titre });
    }
    const { data: fiches } = await db().from('fiches').select('id, cours_id, titre, storage_path, created_at').gte('created_at', depuis).lte('created_at', calme).not('storage_path', 'is', null).limit(500);
    for (const f of (fiches ?? []) as { id: string; cours_id: string; titre: string | null }[]) {
      elements.push({ type: 'fiche', id: f.id, categorie: 'support', coursId: f.cours_id, poids: 1, titre: f.titre ?? 'Fiche' });
    }
  }
  // Séries de QCM / QROC / dossiers progressifs.
  type S = { id: string; cours_id: string; label: string; type: string | null; kind: string | null; allowed_voies: string[] | null; allowed_offers: string[] | null; mg_series: boolean | null; is_revisions: boolean | null };
  const series = new Map<string, S>();
  if (r.auto_qcm || r.auto_cases) {
    const lignes = await fetchAllRows<S & { created_at: string }>((from, to) => db().from('qcm_series')
      .select('id, cours_id, label, type, kind, allowed_voies, allowed_offers, mg_series, is_revisions, created_at')
      .gte('created_at', depuis).lte('created_at', calme).order('created_at').order('id').range(from, to));
    const ids = lignes.map((s) => s.id);
    const nbQuestions = new Map<string, number>();
    for (let i = 0; i < ids.length; i += 150) {
      const qs = await fetchAllRows<{ serie_id: string }>((from, to) => db().from('qcm_questions').select('serie_id').in('serie_id', ids.slice(i, i + 150)).order('serie_id').order('id').range(from, to));
      for (const q of qs) nbQuestions.set(q.serie_id, (nbQuestions.get(q.serie_id) ?? 0) + 1);
    }
    for (const s of lignes) {
      if (s.type === 'seance' || s.type === 'annale') continue;
      const cas = s.kind === 'dp';
      if (cas ? !r.auto_cases : !r.auto_qcm) continue;
      const n = nbQuestions.get(s.id) ?? 0;
      if (n === 0) continue; // série encore vide : annoncée quand elle aura des questions
      series.set(s.id, s);
      elements.push({ type: 'serie', id: s.id, categorie: cas ? 'cases' : 'qcm', coursId: s.cours_id, poids: cas ? 1 : n, titre: s.label });
    }
  }
  // Épreuves blanches publiées.
  type E = { id: string; title: string; status: string; publish_at: string | null; updated_at: string; min_offer: string | null; target_colleges: string[] | null; voies: string[] | null; target_promos: string[] | null; target_user_ids: string[] | null };
  const examens = new Map<string, E>();
  if (r.auto_exam) {
    const { data } = await db().from('mock_exams').select('id, title, status, publish_at, updated_at, min_offer, target_colleges, voies, target_promos, target_user_ids')
      .eq('status', 'published').gte('updated_at', depuis).limit(100);
    for (const e of (data ?? []) as E[]) {
      if (e.publish_at && new Date(e.publish_at) > now) continue;
      examens.set(e.id, e);
      elements.push({ type: 'examen', id: e.id, categorie: 'exam', coursId: null, poids: 1, titre: e.title });
    }
  }

  // Déjà annoncés ?
  const nouveaux: Element[] = [];
  for (let i = 0; i < elements.length; i += 200) {
    const lot = elements.slice(i, i + 200);
    const { data } = await db().from('notification_contenus').select('type_contenu, contenu_id, categorie').in('contenu_id', lot.map((e) => e.id));
    const deja = new Set(((data ?? []) as { type_contenu: string; contenu_id: string; categorie: string }[]).map((d) => `${d.type_contenu}:${d.contenu_id}:${d.categorie}`));
    for (const e of lot) if (!deja.has(`${e.type}:${e.id}:${e.categorie}`)) nouveaux.push(e);
  }
  if (nouveaux.length === 0) return bilan;
  // Réservation immédiate : un passage concurrent n'annonce pas deux fois.
  const { data: reserves } = await db().from('notification_contenus')
    .upsert(nouveaux.map((e) => ({ type_contenu: e.type, contenu_id: e.id, categorie: e.categorie })), { onConflict: 'type_contenu,contenu_id,categorie', ignoreDuplicates: true })
    .select('type_contenu, contenu_id, categorie');
  const ok = new Set(((reserves ?? []) as { type_contenu: string; contenu_id: string; categorie: string }[]).map((d) => `${d.type_contenu}:${d.contenu_id}:${d.categorie}`));
  const aAnnoncer = nouveaux.filter((e) => ok.has(`${e.type}:${e.id}:${e.categorie}`));
  if (aAnnoncer.length === 0) return bilan;
  bilan.contenus = aAnnoncer.length;

  const cours = await coursDe(aAnnoncer.map((e) => e.coursId).filter((x): x is string => !!x));
  const eleves = await elevesActifs();
  const destinatairesPar = new Map<string, number>();
  const lignes: NotifLigne[] = [];

  for (const el of eleves) {
    // Visible par cet élève : (catégorie, spécialité) → éléments.
    const paquets = new Map<string, { cat: CategorieNotif; spec: string; specNom: string; els: Element[]; poids: number; lien: string }>();
    const ajouter = (e: Element, spec: string, specNom: string, lien: string) => {
      const k = `${e.categorie}|${spec}`;
      const p = paquets.get(k) ?? { cat: e.categorie, spec, specNom, els: [], poids: 0, lien };
      p.els.push(e); p.poids += e.poids;
      paquets.set(k, p);
      destinatairesPar.set(`${e.type}:${e.id}:${e.categorie}`, (destinatairesPar.get(`${e.type}:${e.id}:${e.categorie}`) ?? 0) + 1);
    };
    for (const e of aAnnoncer) {
      if (e.type === 'examen') {
        const x = examens.get(e.id);
        if (x && isExamTargeted(x, el.scope, el.promotion, el.id)) ajouter(e, 'examens', 'épreuves', '/epreuves-blanches');
        continue;
      }
      const c = e.coursId ? cours.get(e.coursId) : undefined;
      if (!c) continue;
      if (e.type === 'video' || e.type === 'support') {
        const v = e.type === 'video' ? videos.find((x) => x.id === e.id) : undefined;
        if (e.type === 'video') {
          if (!v) continue;
          const coursAl: CoursAAlerter = { id: c.id, titre: c.titre, matiere_id: c.matiere_id, access_type: c.access_type, college_access_type: c.matieres?.access_type ?? null };
          if (contenusPourEleve({ id: el.id, scope: el.scope, access: el.access }, coursAl, [v]).length === 0) continue;
          ajouter(e, c.specialite, c.specialiteNom, `/cours/${c.id}/${v.type === 'seance_approfondie' ? 'seance-approfondie' : 'video'}`);
        } else {
          if (!accesItem(el, c) || !el.access.video) continue;
          ajouter(e, c.specialite, c.specialiteNom, `/cours/${c.id}/video`);
        }
        continue;
      }
      if (e.type === 'fiche') {
        if (!accesItem(el, c) || !el.access.fiche) continue;
        ajouter(e, c.specialite, c.specialiteNom, `/cours/${c.id}/fiche`);
        continue;
      }
      if (e.type === 'serie') {
        const s = series.get(e.id);
        if (!s || !accesItem(el, c) || !el.access.qcm) continue;
        const ctx = { isStaff: false, voie: el.scope.voie ?? null, offers: new Set<string>(scopeOffers(el.scope)), geriatrieMgBonus: !!s.mg_series && el.scope.type === 'college' && el.scope.colleges.includes('col-geriatrie') };
        if (!canStudentReadSerie(s, ctx)) continue;
        ajouter(e, c.specialite, c.specialiteNom, `/cours/${c.id}/qcm`);
      }
    }
    for (const p of paquets.values()) {
      const n = p.poids;
      const unSeul = p.els.length === 1;
      const k = `contenu:${p.cat}:${p.spec}:${jour()}`;
      const lien = unSeul ? p.lien : p.cat === 'exam' ? '/epreuves-blanches' : `/matieres/${p.spec}`;
      const base = { userId: el.id, categorie: p.cat, kind: `contenu_${p.cat}`, groupKey: k, ctaHref: lien, payload: { specialite: p.spec } };
      if (p.cat === 'video') {
        lignes.push({ ...base, titre: '', ctaLabel: 'Regarder la vidéo', cumul: { count: n, titre: (t) => (t > 1 ? `${t} nouvelles vidéos disponibles` : 'Nouveau replay disponible'), corps: (t) => (t > 1 ? `De nouvelles vidéos ont été mises en ligne en ${p.specNom}.` : `« ${p.els[0].titre} » est disponible en ${p.specNom}.`) } });
      } else if (p.cat === 'support') {
        lignes.push({ ...base, titre: '', ctaLabel: 'Consulter', cumul: { count: n, titre: (t) => (t > 1 ? `${t} nouveaux supports de cours` : 'Nouveau support de cours'), corps: (t) => (t > 1 ? `De nouveaux supports ont été ajoutés en ${p.specNom}.` : `« ${p.els[0].titre} » a été ajouté en ${p.specNom}.`) } });
      } else if (p.cat === 'qcm') {
        lignes.push({ ...base, titre: '', ctaLabel: 'Commencer l’entraînement', cumul: { count: n, titre: (t) => `${t} nouveau${t > 1 ? 'x' : ''} QCM disponible${t > 1 ? 's' : ''}`, corps: (t) => `${t} nouveau${t > 1 ? 'x' : ''} QCM ${t > 1 ? 'ont été ajoutés' : 'a été ajouté'} en ${p.specNom}.` } });
      } else if (p.cat === 'cases') {
        lignes.push({ ...base, titre: '', ctaLabel: 'Ouvrir les dossiers', cumul: { count: n, titre: (t) => (t > 1 ? `${t} nouveaux dossiers et cas cliniques` : 'Nouveau dossier clinique'), corps: () => `En ${p.specNom}.` } });
      } else if (p.cat === 'exam') {
        for (const e of p.els) {
          lignes.push({ ...base, groupKey: `contenu:exam:${e.id}`, titre: `Nouveau concours blanc : ${e.titre}`, corps: 'Une épreuve blanche vous est ouverte.', ctaLabel: 'Voir l’épreuve', ctaHref: '/epreuves-blanches' });
        }
      }
    }
  }
  try {
    for (let i = 0; i < lignes.length; i += 1000) {
      const b = await notifier(lignes.slice(i, i + 1000));
      bilan.notifications += b.app; bilan.emails += b.emails;
    }
  } catch (e) {
    bilan.erreurs.push(String(e));
  }
  for (const e of aAnnoncer) {
    await db().from('notification_contenus').update({ destinataires: destinatairesPar.get(`${e.type}:${e.id}:${e.categorie}`) ?? 0 })
      .eq('type_contenu', e.type).eq('contenu_id', e.id).eq('categorie', e.categorie);
  }
  return bilan;
}

/* ─────────────────────────── 2. Rappels des séances en direct ─────────────────────────── */

export async function rappelerSeances(now = new Date()): Promise<number> {
  const r = await reglagesNotifications();
  if (r.pause_globale || !r.auto_live) return 0;
  const present = instantParis(now);
  const horizon = instantParis(new Date(now.getTime() + r.rappel_live_minutes * 60_000));
  const { data } = await db().from('platform_events').select('id, title, date, start_time, end_time, college, intervenant, zoom_url, notes, required_offers, scope_type, scope_colleges, voies')
    .in('date', [...new Set([present.date, horizon.date])]);
  const debut = `${present.date} ${present.heure}`;
  const fin = `${horizon.date} ${horizon.heure}`;
  const dues = ((data ?? []) as EvenementPlateformeBrut[]).filter((e) => {
    const h = heureCourte(e.start_time);
    if (!h) return false;
    const t = `${e.date} ${h}`;
    return t > debut && t <= fin;
  });
  let n = 0;
  for (const e of dues) {
    const { data: res } = await db().from('notification_contenus')
      .upsert({ type_contenu: 'rappel_live', contenu_id: e.id, categorie: 'live' }, { onConflict: 'type_contenu,contenu_id,categorie', ignoreDuplicates: true }).select('contenu_id');
    if (!res || res.length === 0) continue;
    const eleves = await elevesActifs();
    const cibles = eleves.filter((el) => evenementVisiblePourEleve(e, el.scope));
    const h = heureCourte(e.start_time);
    await notifier(cibles.map((el) => ({
      userId: el.id, categorie: 'live' as const, kind: 'agenda_rappel', groupKey: `agenda:${e.id}:rappel`,
      titre: `Bientôt en direct : ${e.title}`,
      corps: `${libelleJourLong(e.date)}${h ? ` à ${h}` : ''}. Le lien de connexion est dans votre agenda, après émargement.`,
      ctaLabel: 'Ouvrir la séance', ctaHref: `/agenda?seance=${e.id}`, payload: { event_id: e.id },
      cleEmail: `rappel:${e.id}:${el.id}`,
    })));
    await db().from('notification_contenus').update({ destinataires: cibles.length }).eq('type_contenu', 'rappel_live').eq('contenu_id', e.id);
    n += 1;
  }
  return n;
}

/* ─────────────────────────── 3. E-mails ─────────────────────────── */

function envProduction(): 'production' | 'autre' {
  return process.env.VERCEL_ENV === 'production' || (process.env.ECHANGES_ENV === 'production' && process.env.NODE_ENV === 'production') ? 'production' : 'autre';
}

type LigneMail = { id: string; user_id: string; categorie: string; cle: string; titre: string; corps: string | null; lien: string | null; tentatives: number };

async function profilsMail(ids: string[]): Promise<Map<string, { email: string | null; first_name: string | null; is_active: boolean | null }>> {
  const out = new Map<string, { email: string | null; first_name: string | null; is_active: boolean | null }>();
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await db().from('profiles').select('id, email, first_name, is_active').in('id', ids.slice(i, i + 200));
    for (const p of (data ?? []) as { id: string; email: string | null; first_name: string | null; is_active: boolean | null }[]) out.set(p.id, p);
  }
  return out;
}

async function expedier(to: string, subject: string, html: string, text: string, cle: string): Promise<{ statut: 'envoyee' | 'simulee' | 'echec'; erreur?: string }> {
  let dest = to;
  let sujet = subject;
  if (envProduction() !== 'production') {
    const redirection = (process.env.ECHANGES_EMAIL_REDIRECT ?? '').trim();
    if (!redirection) return { statut: 'simulee' };
    dest = redirection; sujet = `[TEST] ${subject}`;
  }
  const r = await sendEmail({ to: dest, subject: sujet, html, text, idempotencyKey: `notif-${cle}`.slice(0, 250), sansBcc: true }).catch((e) => ({ ok: false as const, error: String(e) }));
  return r.ok ? { statut: 'envoyee' } : { statut: 'echec', erreur: r.error };
}

const absolu = (lien: string | null) => (lien ? (lien.startsWith('http') ? lien : `${siteUrl()}${lien}`) : null);

export async function envoyerEmailsImmediats(): Promise<{ envoyes: number; echecs: number }> {
  let envoyes = 0; let echecs = 0;
  for (const mode of ['prioritaire', 'immediat']) {
    const { data } = await db().rpc('notification_emails_reserver', { p_mode: mode, p_limite: 200 });
    const lignes = (data ?? []) as LigneMail[];
    const profils = await profilsMail([...new Set(lignes.map((l) => l.user_id))]);
    for (const l of lignes) {
      const p = profils.get(l.user_id);
      if (!p?.email || p.is_active === false) { await db().from('notification_emails').update({ statut: 'annulee', erreur: 'Compte inactif ou sans adresse', verrou_at: null }).eq('id', l.id); continue; }
      const m = notificationImmediateEmail({ prenom: p.first_name, element: { titre: l.titre, corps: l.corps, lien: absolu(l.lien), categorie: LIBELLE_CATEGORIE[l.categorie as CategorieNotif] ?? 'Major ECN' }, reglages: `${siteUrl()}/profil/notifications` });
      const r = await expedier(p.email, m.subject, m.html, m.text, l.cle);
      if (r.statut === 'echec' && l.tentatives < 4) {
        await db().from('notification_emails').update({ erreur: r.erreur?.slice(0, 300), verrou_at: null }).eq('id', l.id);
        echecs += 1; continue;
      }
      await db().from('notification_emails').update({ statut: r.statut, erreur: r.erreur?.slice(0, 300) ?? null, envoyee_at: new Date().toISOString(), verrou_at: null }).eq('id', l.id);
      if (r.statut === 'echec') echecs += 1; else envoyes += 1;
    }
  }
  return { envoyes, echecs };
}

/** Récapitulatif du soir : une fois par jour, à l'heure choisie par Major ECN (heure de Paris). */
export async function envoyerRecapitulatifs(now = new Date()): Promise<{ recapitulatifs: number } | null> {
  const r = await reglagesNotifications();
  const present = instantParis(now);
  if (Number(present.heure.slice(0, 2)) < r.digest_heure || r.dernier_digest_jour === present.date) return null;
  // Réservation du jour : une seule exécution l'emporte.
  const { data: pris } = await db().from('notification_reglages').update({ dernier_digest_jour: present.date })
    .eq('id', 1).or(`dernier_digest_jour.is.null,dernier_digest_jour.neq.${present.date}`).select('id');
  if (!pris || pris.length === 0) return null;
  let total = 0;
  for (let tour = 0; tour < 20; tour++) {
    const { data } = await db().rpc('notification_emails_reserver', { p_mode: 'quotidien', p_limite: 2000, p_jusqua: now.toISOString() });
    const lignes = (data ?? []) as LigneMail[];
    if (lignes.length === 0) break;
    const parUser = new Map<string, LigneMail[]>();
    for (const l of lignes) parUser.set(l.user_id, [...(parUser.get(l.user_id) ?? []), l]);
    const profils = await profilsMail([...parUser.keys()]);
    for (const [uid, ls] of parUser) {
      const p = profils.get(uid);
      const ids = ls.map((l) => l.id);
      if (!p?.email || p.is_active === false) { await db().from('notification_emails').update({ statut: 'annulee', erreur: 'Compte inactif ou sans adresse', verrou_at: null }).in('id', ids); continue; }
      const elements: ElementNotif[] = ls.map((l) => ({ titre: l.titre, corps: l.corps, lien: absolu(l.lien), categorie: LIBELLE_CATEGORIE[l.categorie as CategorieNotif] ?? 'Major ECN' }));
      const m = recapitulatifEmail({ prenom: p.first_name, elements, reglages: `${siteUrl()}/profil/notifications` });
      const res = await expedier(p.email, m.subject, m.html, m.text, `recap:${uid}:${present.date}`);
      const lot = crypto.randomUUID();
      await db().from('notification_emails').update({ statut: res.statut === 'echec' ? 'echec' : res.statut, erreur: res.erreur?.slice(0, 300) ?? null, envoyee_at: new Date().toISOString(), verrou_at: null, lot_id: lot }).in('id', ids);
      total += 1;
    }
  }
  return { recapitulatifs: total };
}
