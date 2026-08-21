/**
 * Ouvre l'accès aux étudiants qui ont acheté une spécialité AVANT la mise en
 * ligne de ses contenus, puis les invite à se connecter.
 *
 * Ces comptes portent `permission_scope.content_pending = true` et un tableau
 * `colleges` VIDE : le provisioning Stripe les a volontairement créés sans
 * aucun accès (cf. lib/stripe/provisioning.ts), en prévenant l'étudiant avant
 * le paiement. Le jour de la publication, il faut donc :
 *   1. leur accorder le collège de la spécialité (+ ses sous-collèges) ;
 *   2. retirer le marqueur `content_pending` ;
 *   3. leur envoyer un lien d'activation avec l'email « c'est en ligne ».
 *
 * Le cron `stripe-reconcile` ne peut PAS s'en charger : il rejoue les sessions
 * Stripe, dont la metadata `content_pending` vaut toujours '1' pour ces achats.
 *
 * Usage (depuis major-ecn/) :
 *   npx tsx scripts/ouvrir-specialite.mts "Anesthésie-réanimation"           # simulation
 *   npx tsx scripts/ouvrir-specialite.mts "Anesthésie-réanimation" --acces   # ouvre les accès
 *   npx tsx scripts/ouvrir-specialite.mts "Anesthésie-réanimation" --acces --email
 *
 * Sans option, le script n'écrit rien et n'envoie rien : il affiche ce qu'il
 * ferait. `--acces` applique les permissions, `--email` envoie l'invitation
 * (et exige `--acces` : on n'annonce pas une ouverture qui n'a pas eu lieu).
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import { collegeIdForSpecialty, specialtyByName } from '../src/lib/data/enrollable-colleges';
import { specialiteDisponibleEmail } from '../src/lib/email/templates';

const args = process.argv.slice(2);
const specialtyArg = args.find((a) => !a.startsWith('--'));
const doAcces = args.includes('--acces');
const doEmail = args.includes('--email');

if (!specialtyArg) {
  console.error('Usage : npx tsx scripts/ouvrir-specialite.mts "<spécialité>" [--acces] [--email]');
  process.exit(1);
}
if (doEmail && !doAcces) {
  console.error('--email exige --acces : on n’annonce pas une ouverture qui n’a pas été appliquée.');
  process.exit(1);
}

const specialty = specialtyByName(specialtyArg);
if (!specialty) {
  console.error(`Spécialité inconnue : « ${specialtyArg} » (cf. ENROLLABLE_SPECIALTIES).`);
  process.exit(1);
}
const collegeId = collegeIdForSpecialty(specialtyArg);
if (!collegeId) {
  console.error(
    `« ${specialty.name} » n’a pas encore de collège en base : publiez les contenus et `
    + 'renseignez son `collegeId` dans src/lib/data/enrollable-colleges.ts avant de lancer ce script.',
  );
  process.exit(1);
}

// .env.local : le BOM UTF-8 casse la première clé s'il n'est pas retiré.
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').replace(/^﻿/, '').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
) as Record<string, string>;

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const norm = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

// Sous-collèges de la spécialité, résolus dynamiquement comme le provisioning.
const { data: mats } = await admin.from('matieres').select('id, parent_matiere_id');
const enfants = ((mats ?? []) as { id: string; parent_matiere_id: string | null }[])
  .filter((m) => m.parent_matiere_id === collegeId)
  .map((m) => m.id);
const aAccorder = [collegeId, ...enfants];

// Comptes en attente pour CETTE spécialité. Les libellés historiques comptent
// aussi : `paid_specialty` porte le nom saisi au checkout du jour de l'achat.
const libelles = [specialty.name, ...(specialty.legacyNames ?? [])].map(norm);
const { data: enAttente, error } = await admin
  .from('profiles')
  .select('id, first_name, last_name, email, permission_scope')
  .eq('permission_scope->>content_pending', 'true');
if (error) throw error;

type Row = { id: string; first_name: string | null; last_name: string | null; email: string | null; permission_scope: Record<string, unknown> };
const cibles = ((enAttente ?? []) as Row[]).filter((p) => {
  const nom = p.permission_scope?.paid_specialty;
  return typeof nom === 'string' && libelles.includes(norm(nom));
});

console.log(`Spécialité   : ${specialty.name}`);
console.log(`Collège      : ${collegeId}${enfants.length ? ` (+ ${enfants.length} sous-collège(s))` : ''}`);
console.log(`En attente   : ${cibles.length} compte(s)`);
console.log(`Mode         : ${doAcces ? 'ÉCRITURE' : 'simulation'}${doEmail ? ' + ENVOI EMAIL' : ''}\n`);

const base = (env.NEXT_PUBLIC_SITE_URL || 'https://major-ecn.fr').replace(/\/$/, '');

for (const p of cibles) {
  const scope = p.permission_scope ?? {};
  const dejaAccordes = Array.isArray(scope.colleges)
    ? (scope.colleges as unknown[]).filter((c): c is string => typeof c === 'string')
    : [];
  const colleges = Array.from(new Set([...dejaAccordes, ...aAccorder]));
  const prenom = p.first_name ?? '';
  console.log(`— ${p.email} (${prenom} ${p.last_name ?? ''})`.trimEnd());
  console.log(`  formule ${scope.offer ?? '?'} · voie ${scope.paid_voie ?? '?'} → collèges ${JSON.stringify(colleges)}`);

  if (!doAcces) continue;

  // `content_pending: null` retire la clé du JSON stocké : le compte n'est plus
  // « en attente » et ne sera pas repris par un prochain passage.
  const nouveau = { ...scope, type: 'college', colleges, content_pending: null };
  delete (nouveau as Record<string, unknown>).content_pending;
  const { error: upErr } = await admin.from('profiles').update({ permission_scope: nouveau } as never).eq('id', p.id);
  if (upErr) { console.error(`  ✗ écriture refusée : ${upErr.message}`); continue; }
  console.log('  ✓ accès ouverts');

  if (!doEmail) continue;

  // Un compte DÉJÀ activé ne doit pas recevoir un lien de mot de passe : GoTrue
  // rejette « New password should be different from the old password » quand
  // l'étudiant ressaisit le sien (cf. lib/admin/student-invite.ts). On l'envoie
  // simplement se connecter. Seul un compte jamais activé reçoit un lien
  // `recovery` — le seul type stable pour une première définition de mot de
  // passe (cf. la note détaillée dans lib/stripe/provisioning.ts).
  const { data: authUser } = await admin.auth.admin.getUserById(p.id);
  const dejaActive = Boolean(authUser?.user?.email_confirmed_at || authUser?.user?.last_sign_in_at);

  let setupUrl = `${base}/login`;
  if (!dejaActive) {
    const redirectTo = `${base}/auth/setup-password`;
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery', email: p.email!, options: { redirectTo },
    });
    if (linkErr) { console.error(`  ✗ lien non généré : ${linkErr.message}`); continue; }
    const hashed = link?.properties?.hashed_token;
    setupUrl = hashed
      ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=recovery&next=${encodeURIComponent('/auth/setup-password')}`
      : (link?.properties?.action_link ?? `${base}/login`);
  }

  const { subject, html, text } = specialiteDisponibleEmail({
    firstName: prenom, specialtyName: specialty.name, setupUrl, dejaActive,
  });
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || 'Major ECN <contact@major-ecn.fr>', to: [p.email], subject, html, text }),
  });
  if (!res.ok) console.error(`  ✗ email refusé (${res.status}) : ${(await res.text()).slice(0, 200)}`);
  else console.log(`  ✓ email envoyé — « ${subject} »`);
}

if (!doAcces && cibles.length > 0) {
  console.log('\nSimulation : relancez avec --acces pour appliquer, puis --acces --email pour inviter.');
}
