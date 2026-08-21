/**
 * Provisioning des comptes étudiants après achat Stripe.
 *
 * Workflow :
 *  1. Webhook Stripe reçoit checkout.session.completed
 *  2. On extrait email + metadata.formule + metadata.firstName/lastName
 *  3. On crée le user dans auth.users via admin SDK (s'il n'existe pas)
 *  4. On configure le profile avec :
 *      - role = 'student'
 *      - permission_scope = accès Découverte uniquement (col-decouverte)
 *        → l'utilisateur ne voit pour l'instant que le contenu Découverte
 *      - paid_offer (metadata.permission_scope.paid_offer) = 'essentiel' |
 *        'intensif' | 'approfondi' selon la formule réellement achetée
 *      - paid_formule (idem) = identifiant exact de la formule achetée
 *      - specialty (en metadata) = "Médecine générale"
 *      - voie (Intensive uniquement) en metadata
 *  5. On envoie l'email de confirmation + lien d'activation
 *     - Tentative 1 : Resend (template Major ECN custom)
 *     - Tentative 2 : Supabase `inviteUserByEmail` en fallback
 */

import { createClient as createSupabasePublicClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl, INTERNAL_NOTIFY_EMAILS } from '@/lib/email/send';
import { purchaseConfirmationEmail, purchaseNotificationEmail } from '@/lib/email/templates';
import { FORMULES, type FormuleId } from '@/lib/stripe';
import { getApprofondiTier } from '@/lib/stripe/approfondi';
import { highestOffer, type Offer } from '@/types/domain';
import { applyGeriatrieMgBonus } from '@/lib/auth/geriatrie-mg-bonus';

export type ProvisioningInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  formuleId: FormuleId;
  installments?: number;
  amountTotalCents?: number;
  /** Téléphone collecté au checkout (récap interne). */
  phone?: string;
  /** Spécialité préparée (libellé affiché). */
  specialty?: string;
  /** Collège débloqué (col-…) résolu depuis la spécialité au checkout.
   *  Défaut Médecine générale si absent. */
  collegeId?: string;
  /** Voie de concours pour la Formule Intensive ('interne' / 'externe' / ''). */
  voie?: string;
  /** Offre Approfondi achetée (ex. 'mg', 'mg-plus'…) — détermine le périmètre de
   *  collèges débloqués (ex. MG « Approfondi » = 13 spécialités seulement). */
  approfondiVariant?: string;
  /** Contenus pas encore publiés pour la spécialité achetée : le compte est créé
   *  SANS accès. Renseigné depuis la metadata Stripe `content_pending`, ce qui
   *  couvre aussi bien une offre Approfondi qu'une Essentielle / Intensive dont
   *  la spécialité choisie n'est pas encore en ligne. */
  contentPending?: boolean;
  /** ID de session Stripe — clé de déduplication d'envoi d'email. */
  sessionId?: string;
  /** Source de l'appel : webhook OU /merci. Utile pour le log d'audit. */
  source?: 'webhook' | 'merci';
};

/** Normalise la voie ('Voie externe' → 'externe', etc.) vers la forme courte
 *  attendue par la RLS (current_voie). Renvoie null si non reconnue. */
function normalizeVoie(raw?: string): 'interne' | 'externe' | null {
  const v = (raw ?? '').trim().toLowerCase().replace(/^voie\s+/, '');
  return v === 'interne' || v === 'externe' ? v : null;
}

export type ProvisioningResult =
  | {
      ok: true;
      userId: string;
      isNew: boolean;
      emailSent: boolean;
      emailVia: 'resend' | 'supabase' | null;
      emailError: string | null;
    }
  | { ok: false; error: string };

const MAP_OFFER: Record<FormuleId, 'essentiel' | 'intensif' | 'approfondi'> = {
  essentielle: 'essentiel',
  intensive: 'intensif',
  'programme-approfondi': 'approfondi',
};

const MG_INTERNE_ID = 'col-medecine-generale';

/** Petit logger structuré pour faciliter la lecture des Logs Vercel. */
function log(label: string, payload: Record<string, unknown> = {}) {
  // eslint-disable-next-line no-console
  console.log(`[provisioning] ${label}`, JSON.stringify(payload));
}

/**
 * Crée (ou récupère) un compte étudiant avec :
 *  - une trace claire de la formule achetée (paid_offer / paid_formule)
 *  - accès automatique au collège MG correspondant à la voie choisie
 *    (interne / externe) + toutes les spécialités transversales.
 */
export async function provisionStudentAccount(
  input: ProvisioningInput,
): Promise<ProvisioningResult> {
  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Service Supabase admin indisponible',
    };
  }

  log('start', {
    email: input.email,
    formuleId: input.formuleId,
    installments: input.installments ?? 1,
    hasResendKey: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM ?? '(fallback resend.dev sandbox)',
  });

  const offerForFormule = MAP_OFFER[input.formuleId];

  // 1) Existe-t-il déjà un user avec cet email ?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any).auth.admin.listUsers({ page: 1, perPage: 500 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = existing?.users?.find((u: any) => u.email?.toLowerCase() === input.email.toLowerCase());

  let userId: string;
  let isNew = false;

  if (found) {
    userId = found.id;
    log('user-existing', { userId });
  } else {
    // 2) Création du user
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: input.email,
      email_confirm: false,
      user_metadata: {
        first_name: input.firstName ?? '',
        last_name: input.lastName ?? '',
        role: 'student',
        paid_formule: input.formuleId,
      },
    });
    if (cErr || !created?.user) {
      log('user-create-error', { msg: cErr?.message });
      return { ok: false, error: cErr?.message ?? 'Échec de la création du user' };
    }
    userId = created.user.id;
    isNew = true;
    log('user-created', { userId });
  }

  // 3) Récupère le profil existant pour préserver les données d'un compte
  //    Découverte qui passe en payant (mise à niveau) : on ne veut pas écraser
  //    le bloc `signup` (spécialité, voie, session, pays…) ni vider le prénom /
  //    nom / téléphone déjà renseignés si le checkout ne les a pas transmis.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingProfile } = await (admin as any)
    .from('profiles')
    .select('first_name, last_name, phone, permission_scope, evc_session_id, access_start, access_end')
    .eq('id', userId)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prevScope = (existingProfile?.permission_scope ?? {}) as Record<string, any>;
  const firstName = input.firstName || existingProfile?.first_name || '';
  const lastName = input.lastName || existingProfile?.last_name || '';
  const phone = input.phone || existingProfile?.phone || null;

  const approfondiTier = getApprofondiTier(input.approfondiVariant);

  // Certaines offres Approfondi sont vendues AVANT la mise en ligne des contenus
  // (ex. Odontologie) : l'étudiant est prévenu au moment de payer, le
  // compte est créé mais n'ouvre AUCUN collège. On sort donc avant toute
  // résolution de collège — surtout pas de repli sur la Médecine générale, qui
  // accorderait par erreur un périmètre qui n'a pas été acheté.
  const contentPending = input.contentPending === true || approfondiTier?.contentPending === true;

  let colleges: string[] = [];
  if (contentPending) {
    log('colleges-pending', { variant: approfondiTier?.id ?? null });
  } else {
    // Accès accordé après achat : le COLLÈGE de la spécialité choisie au checkout
    // (col-medecine-generale par défaut) + ses éventuels sous-collèges. Le contenu
    // est ensuite borné par la formule (offer) et la voie (interne/externe) achetées.
    const targetId = input.collegeId || MG_INTERNE_ID;

    // Sous-collèges rattachés à la spécialité (interrogés dynamiquement pour rester
    // à jour quand de nouveaux sous-collèges sont ajoutés). Les collèges de 1er
    // niveau sans enfant (Pédiatrie, Psychiatrie…) → colleges = [targetId].
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allMatieres } = await (admin as any)
      .from('matieres')
      .select('id, parent_matiere_id');
    const mats = (allMatieres ?? []) as { id: string; parent_matiere_id: string | null }[];
    const childIds = mats.filter((m) => m.parent_matiere_id === targetId).map((m) => m.id);

    // Programme Approfondi : le périmètre de sous-collèges peut être RESTREINT selon
    // l'offre (ex. MG « Approfondi » = 13 spécialités ; « Approfondi + » = toutes).
    // Si l'offre définit une liste explicite, on l'utilise à la place des enfants.
    //
    // Achat Approfondi dont la metadata Stripe n'identifie AUCUNE offre connue : on
    // n'ouvre que le collège cible. Se rabattre sur tous les enfants reviendrait à
    // accorder le périmètre de l'offre la plus chère à quelqu'un qui a payé la
    // moins chère — c'est fail-open sur un droit facturé.
    const isApprofondi = offerForFormule === 'approfondi';
    if (isApprofondi && !approfondiTier) {
      log('approfondi-variant-unresolved', { variant: input.approfondiVariant ?? null, targetId });
    }
    const subColleges = approfondiTier
      ? (approfondiTier.collegesOverride ?? childIds)
      : (isApprofondi ? [] : childIds);
    colleges = [targetId, ...subColleges];
    log('colleges-resolved', {
      targetId, variant: approfondiTier?.id ?? null,
      count: colleges.length, colleges,
    });
  }

  // ─── MULTI-FORMULES : cumul des droits pour un compte déjà PAYANT ───
  // Si l'email correspond à un compte qui possède déjà une formule payante
  // (ex. Approfondi) et qu'il achète en ligne une autre formule (Intensif /
  // Essentiel), on N'ÉCRASE PAS : on garde ses accès existants et on AJOUTE la
  // nouvelle formule. Le contenu débloqué devient l'UNION des deux (cf. système
  // multi-formules, permission_scope.offers[]). Un compte gratuit (Découverte)
  // ou nouveau reçoit simplement la formule achetée.
  const PAID_OFFERS = new Set<Offer>(['essentiel', 'intensif', 'approfondi']);
  const priorOffersRaw: unknown[] = Array.isArray(prevScope.offers)
    ? prevScope.offers
    : (prevScope.offer ? [prevScope.offer] : []);
  const priorPaid = priorOffersRaw.filter((o): o is Offer => typeof o === 'string' && PAID_OFFERS.has(o as Offer));
  // Le marqueur `paid_offer` atteste aussi d'un achat antérieur.
  if (priorPaid.length === 0 && typeof prevScope.paid_offer === 'string' && PAID_OFFERS.has(prevScope.paid_offer as Offer)) {
    priorPaid.push(prevScope.paid_offer as Offer);
  }
  const unionOffers = Array.from(new Set<Offer>([...priorPaid, offerForFormule]));
  const mergedOffer = highestOffer(unionOffers);
  // `offers` porte l'union quand plusieurs formules sont détenues ; sinon on
  // retire toute liste héritée (scope mono-formule propre).
  const offersField = unionOffers.length > 1 ? unionOffers : undefined;

  // Le cumul ne vaut QUE pour un compte qui détenait DÉJÀ une formule payante :
  // lui retirer un périmètre acheté serait une régression. Un compte gratuit
  // (Découverte), invité ou nouveau reçoit exactement le périmètre payé. Sans
  // cette borne, un accès large accordé AVANT l'achat (scope 'all' par défaut,
  // collèges cochés à la main côté admin) survivait au paiement et ouvrait des
  // collèges jamais achetés — y compris toute la plateforme.
  const cumulate = priorPaid.length > 0;

  // Collèges : on cumule les accès. Un compte « toute l'offre » (type 'all')
  // déjà payant reste 'all' ; sinon on fusionne les collèges déjà accordés avec
  // le nouveau.
  const prevIsAll = cumulate && prevScope.type === 'all';
  const prevCollegesRaw: string[] = Array.isArray(prevScope.colleges)
    ? prevScope.colleges.filter((x: unknown): x is string => typeof x === 'string')
    : [];
  // Le collège Découverte est gratuit : une mise à niveau Découverte → payant
  // ne doit pas le faire disparaître, même quand le cumul ne s'applique pas.
  const prevColleges = cumulate
    ? prevCollegesRaw
    : prevCollegesRaw.filter((c) => c === 'col-decouverte');
  const mergedColleges = Array.from(new Set<string>([...prevColleges, ...colleges]));

  // Un achat Gériatrie doit recevoir le même bonus MG que les comptes créés
  // depuis l'admin. Sans cette étape, le provisioning Stripe reconstruisait le
  // scope avec le seul collège Gériatrie et faisait disparaître les 60 items
  // bonus lors d'un achat, renouvellement ou rapprochement Stripe.
  const previousCours = Array.isArray(prevScope.cours)
    ? prevScope.cours.filter((value: unknown): value is string => typeof value === 'string')
    : undefined;
  const bonusScope = prevIsAll
    ? { colleges: mergedColleges, cours: previousCours }
    : await applyGeriatrieMgBonus(admin, mergedColleges, previousCours);

  // On part du scope existant (préserve `signup`, `espace_decouverte`,
  // `specialty_wish`…) puis on superpose les marqueurs d'achat + l'union.
  const permission_scope = {
    ...prevScope,
    ...(prevIsAll
      ? { type: 'all' as const }
      : {
          type: 'college' as const,
          colleges: bonusScope.colleges,
          ...(bonusScope.cours && bonusScope.cours.length > 0 ? { cours: bonusScope.cours } : {}),
        }),
    offer: mergedOffer,
    // Écrase explicitement toute liste `offers` héritée (undefined => clé retirée).
    offers: offersField,
    paid_offer: mergedOffer,
    paid_formule: input.formuleId,
    paid_approfondi_variant: approfondiTier?.id ?? prevScope.paid_approfondi_variant ?? undefined,
    paid_specialty: input.specialty ?? 'Médecine générale',
    // Marque les comptes achetés AVANT la mise en ligne des contenus, pour
    // pouvoir les retrouver et leur ouvrir l'accès le jour du lancement.
    // `undefined` retire la clé — un achat ultérieur non concerné la nettoie.
    content_pending: contentPending ? true : undefined,
    // Normalise 'externe'/'interne' — les formulaires peuvent envoyer le libellé
    // 'Voie externe'/'Voie interne'. La RLS (current_voie) attend la forme courte.
    // On conserve la voie existante si le nouvel achat n'en précise pas.
    paid_voie: normalizeVoie(input.voie) ?? (typeof prevScope.paid_voie === 'string' ? prevScope.paid_voie : null),
    paid_at: new Date().toISOString(),
  };
  log('scope-merged', {
    priorPaid, purchased: offerForFormule, unionOffers, mergedOffer,
    type: prevIsAll ? 'all' : 'college', collegesCount: prevIsAll ? 'all' : bonusScope.colleges.length,
  });

  // ─── PÉRIODE D'ACCÈS (sessions EVC) ───
  // Règles :
  //  - access_start : posé au premier achat, jamais décalé ensuite.
  //  - compte sans aucune période (ni session ni date individuelle) → session
  //    par défaut du moment.
  //  - accès effectif déjà EXPIRÉ (renouvellement) → nouvelle session par
  //    défaut + suppression de la date individuelle périmée.
  //  - sinon (upsell en cours de session) → dates inchangées.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allSessions } = await (admin as any)
    .from('evc_sessions')
    .select('id, default_access_end, is_default');
  const sessionRows = (allSessions ?? []) as { id: string; default_access_end: string; is_default: boolean }[];
  const defaultSession = sessionRows.find((s) => s.is_default) ?? null;

  const prevSessionId: string | null = existingProfile?.evc_session_id ?? null;
  const prevAccessEnd: string | null = existingProfile?.access_end ?? null;
  const prevAccessStart: string | null = existingProfile?.access_start ?? null;
  const prevEffectiveEnd = prevAccessEnd
    ?? (prevSessionId ? sessionRows.find((s) => s.id === prevSessionId)?.default_access_end ?? null : null);
  const isRenewal = !!prevEffectiveEnd && new Date(prevEffectiveEnd).getTime() < Date.now();
  const hasAnyPeriod = !!prevSessionId || !!prevAccessEnd;

  const accessFields: { access_start: string; evc_session_id?: string | null; access_end?: null } =
    (!hasAnyPeriod || isRenewal)
      ? {
          access_start: prevAccessStart ?? new Date().toISOString(),
          evc_session_id: defaultSession?.id ?? prevSessionId,
          access_end: null,
        }
      : { access_start: prevAccessStart ?? new Date().toISOString() };
  log('access-period', {
    prevSessionId, prevAccessEnd, isRenewal, hasAnyPeriod,
    assigned: accessFields.evc_session_id ?? '(inchangé)', defaultSession: defaultSession?.id ?? null,
  });

  // 4) Upsert du profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: pErr } = await (admin as any)
    .from('profiles')
    .upsert(
      {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: input.email,
        phone,
        role: 'student',
        permission_scope,
        ...accessFields,
      },
      { onConflict: 'id' },
    );
  if (pErr) {
    log('profile-upsert-error', { msg: pErr.message });
    return { ok: false, error: pErr.message };
  }
  log('profile-upserted');

  // 4) DÉDUPLICATION D'ENVOI D'EMAIL :
  //    Si on a un sessionId, on tente d'insérer dans stripe_provisioning_log.
  //    INSERT ON CONFLICT DO NOTHING : seul le PREMIER à insérer (webhook ou
  //    /merci) déclenchera l'envoi. L'autre verra le conflict et skipera
  //    l'envoi — évitant ainsi qu'un 2e generateLink invalide le token du
  //    premier email reçu par l'utilisateur.
  let weOwnTheEmailSend = true;
  if (input.sessionId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: claimed, error: claimErr } = await (admin as any)
      .from('stripe_provisioning_log')
      .insert({
        session_id: input.sessionId,
        user_id: userId,
        email: input.email,
        source: input.source ?? 'merci',
      })
      .select('session_id')
      .maybeSingle();
    // Postgres renvoie 23505 (unique_violation) si la ligne existe déjà.
    const isConflict = claimErr && (
      claimErr.code === '23505'
      || /duplicate|already exists/i.test(claimErr.message ?? '')
    );
    if (claimErr && !isConflict) {
      log('dedup-claim-error', { msg: claimErr.message });
    } else if (isConflict || !claimed) {
      weOwnTheEmailSend = false;
      log('dedup-already-sent', { sessionId: input.sessionId, source: input.source });
    } else {
      log('dedup-claimed', { sessionId: input.sessionId, source: input.source });
    }
  }

  if (!weOwnTheEmailSend) {
    // Quelqu'un d'autre (webhook ou /merci, l'autre côté de la race) a déjà
    // envoyé l'email. On retourne ok sans regénérer de token pour ne pas
    // invalider celui du 1er email.
    return { ok: true, userId, isNew, emailSent: true, emailVia: null, emailError: null };
  }

  // Montant TOTAL réel affiché dans tous les emails.
  // Piège Stripe : pour un paiement en plusieurs fois (mode subscription),
  // `session.amount_total` correspond au montant d'UNE échéance, pas au total.
  // On reconstruit donc le total = échéance × N. Pour un paiement comptant,
  // `amount_total` EST déjà le total. Filet de sécurité : prix catalogue.
  const installmentsN = input.installments ?? 1;
  const rawCents = input.amountTotalCents ?? 0;
  const totalCents = rawCents > 0
    ? (installmentsN > 1 ? rawCents * installmentsN : rawCents)
    : FORMULES[input.formuleId].amountCents;
  const amountEurosTotal = totalCents / 100;

  // Récap interne (contact@ + abonan1@) — envoyé une seule fois grâce à la
  // déduplication ci-dessus. N'interrompt jamais le provisioning.
  try {
    const formuleForNotif = FORMULES[input.formuleId];
    const notif = purchaseNotificationEmail({
      firstName: firstName || null,
      lastName: lastName || null,
      email: input.email,
      phone: phone,
      formuleName: formuleForNotif.name,
      amountEuros: amountEurosTotal,
      installments: input.installments ?? 1,
      specialty: input.specialty ?? 'Médecine générale',
      voie: input.voie || null,
    });
    const n = await sendEmail({
      to: INTERNAL_NOTIFY_EMAILS,
      subject: notif.subject,
      html: notif.html,
      text: notif.text,
      replyTo: input.email,
    });
    log('internal-notify', { ok: n.ok, error: n.ok ? null : n.error });
  } catch (e) {
    log('internal-notify-throw', { error: e instanceof Error ? e.message : 'unknown' });
  }

  // 5) Générer le lien set-password.
  //    On utilise TOUJOURS type='recovery' :
  //     - pour un nouveau user : fonctionne aussi (Supabase crée un recovery
  //       token qui confirme l'email au verifyOtp)
  //     - pour un user existant déjà confirmé : c'est LE bon type (magiclink
  //       pour un confirmé crée parfois en interne un recovery_token, et
  //       le mismatch type=magiclink dans l'URL vs token_type=recovery_token
  //       en DB fait planter verifyOtp avec "invalid or expired").
  //    Recovery est le seul type stable cross-état (nouveau / confirmé).
  const base = siteUrl();
  const redirectTo = `${base}/auth/setup-password`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: 'recovery',
    email: input.email,
    options: { redirectTo },
  });
  if (linkErr) log('generate-link-error', { msg: linkErr.message });

  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/login`;

  // 5) Envoi de l'email : Resend (template custom) puis Supabase en fallback
  let emailVia: 'resend' | 'supabase' | null = null;
  let emailError: string | null = null;

  const formule = FORMULES[input.formuleId];

  // -- Tentative 1 : Resend (avec PJ légales : CGU, CGS, CP au format PDF)
  try {
    const { subject, html, text } = purchaseConfirmationEmail({
      firstName,
      formuleName: formule.name,
      amountEuros: amountEurosTotal,
      installments: input.installments ?? 1,
      setupUrl,
    });
    // Les PDFs sont hébergés côté public/legal — Resend les téléchargera
    // côté serveur via `path` et les attachera au mail.
    const base = siteUrl();
    const attachments = [
      { filename: 'CGU - Major ECN.pdf', path: `${base}/legal/cgu.pdf` },
      { filename: 'CGS - Major ECN.pdf', path: `${base}/legal/cgs.pdf` },
      { filename: 'Conditions Particulières - Major ECN.pdf', path: `${base}/legal/conditions-particulieres.pdf` },
    ];
    log('email-resend-attempt', {
      to: input.email,
      subject,
      setupUrlPrefix: setupUrl.slice(0, 60) + '…',
      attachments: attachments.length,
    });
    const sendResult = await sendEmail({ to: input.email, subject, html, text, attachments });
    if (sendResult.ok) {
      emailVia = 'resend';
      log('email-sent-resend', { id: sendResult.id });
    } else {
      emailError = sendResult.error;
      log('email-fail-resend', { error: sendResult.error });
    }
  } catch (e) {
    emailError = e instanceof Error ? e.message : 'Erreur Resend inconnue';
    log('email-fail-resend-throw', { error: emailError });
  }

  // -- Tentative 2 : Supabase reset-password via le SMTP intégré.
  //    On utilise un client public (anon key) car les méthodes auth user-facing
  //    comme resetPasswordForEmail/signInWithOtp NE déclenchent PAS l'envoi
  //    d'email quand elles sont appelées via le service-role client.
  if (!emailVia) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anonKey) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes — fallback Supabase impossible.');
      }
      const publicClient = createSupabasePublicClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // Pour un nouveau user → invite (le compte vient d'être créé sans confirm).
      // Pour un user existant → recovery (toujours valide, renvoie un lien set-password).
      if (isNew) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: invErr } = await (admin as any).auth.admin.inviteUserByEmail(
          input.email,
          { redirectTo },
        );
        if (invErr) {
          // En cas de "user already registered", on bascule sur recovery.
          if (/already|exist/i.test(invErr.message ?? '')) {
            const { error: rpErr } = await publicClient.auth.resetPasswordForEmail(input.email, { redirectTo });
            if (!rpErr) {
              emailVia = 'supabase';
              emailError = null;
              log('email-sent-supabase-recovery-fallback');
            } else {
              emailError = (emailError ?? '') + ' | Supabase: ' + rpErr.message;
              log('email-fail-supabase-recovery', { error: rpErr.message });
            }
          } else {
            emailError = (emailError ?? '') + ' | Supabase: ' + invErr.message;
            log('email-fail-supabase-invite', { error: invErr.message });
          }
        } else {
          emailVia = 'supabase';
          emailError = null;
          log('email-sent-supabase-invite');
        }
      } else {
        const { error: rpErr } = await publicClient.auth.resetPasswordForEmail(input.email, { redirectTo });
        if (!rpErr) {
          emailVia = 'supabase';
          emailError = null;
          log('email-sent-supabase-recovery');
        } else {
          emailError = (emailError ?? '') + ' | Supabase: ' + rpErr.message;
          log('email-fail-supabase-recovery', { error: rpErr.message });
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur Supabase inconnue';
      emailError = (emailError ?? '') + ' | Supabase: ' + msg;
      log('email-fail-supabase-throw', { error: msg });
    }
  }

  const emailSent = !!emailVia;
  log('end', { emailSent, emailVia, emailError, isNew });

  // Met à jour la ligne de dédup avec le résultat de l'envoi (audit + debug).
  if (input.sessionId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('stripe_provisioning_log')
      .update({ email_via: emailVia, email_error: emailError })
      .eq('session_id', input.sessionId);
  }

  return { ok: true, userId, isNew, emailSent, emailVia, emailError };
}
