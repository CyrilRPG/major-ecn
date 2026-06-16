/**
 * Crée (ou met à niveau) un compte ADMINISTRATEUR Major ECN.
 *
 * - Crée l'utilisateur dans auth.users avec un mot de passe (email confirmé,
 *   donc connexion immédiate sur /login — pas d'email d'activation requis).
 * - Upsert le profil avec role = 'admin'.
 * - Idempotent : si l'email existe déjà, on met à jour son mot de passe et on
 *   force le rôle admin.
 *
 * Nécessite dans .env.local :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (clé service_role — jamais exposée au client)
 *
 * Usage :
 *   pnpm tsx scripts/create-admin.ts
 *   pnpm tsx scripts/create-admin.ts <email> <password> ["Prénom" "Nom"]
 *
 * Sans arguments, utilise les identifiants demandés par défaut ci-dessous.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv({ path: join(__dirname, '..', '.env.local') });
dotenv({ path: join(__dirname, '..', '.env') });

// --- Identifiants (CLI > valeurs par défaut) -------------------------------
const email = (process.argv[2] ?? 'cyrilwebmaster@gmail.com').trim().toLowerCase();
const password = process.argv[3] ?? 'Webmaster@2026';
const firstName = process.argv[4] ?? 'Cyril';
const lastName = process.argv[5] ?? 'Webmaster';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE_KEY || SERVICE_KEY === 'replace_me') {
  console.error(
    '❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local.\n' +
      '   Récupère la clé service_role sur https://supabase.com/dashboard/project/_/settings/api-keys',
  );
  process.exit(1);
}

const admin = createClient(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Recherche un utilisateur par email (pagination défensive). */
async function findUserByEmail(target: string): Promise<{ id: string } | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email?.toLowerCase() === target);
    if (u) return { id: u.id };
    if (data.users.length < 200) break; // dernière page
  }
  return null;
}

async function main() {
  console.log(`→ Création / mise à niveau admin : ${email}`);

  let userId: string;
  const existing = await findUserByEmail(email);

  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, role: 'admin' },
    });
    if (error) throw error;
    console.log(`  ↳ utilisateur existant mis à jour (mot de passe + rôle admin).`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // connexion immédiate, sans email d'activation
      user_metadata: { first_name: firstName, last_name: lastName, role: 'admin' },
    });
    if (error || !data.user) throw error ?? new Error('Création échouée');
    userId = data.user.id;
    console.log(`  ↳ utilisateur créé.`);
  }

  // Profil : rôle admin (source de vérité des contrôles d'accès).
  const { error: pErr } = await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
        permission_scope: { role: 'admin' },
      },
      { onConflict: 'id' },
    );
  if (pErr) throw pErr;

  console.log('✅ Admin prêt.');
  console.log(`   Email    : ${email}`);
  console.log(`   Mot de passe : ${password}`);
  console.log('   Connexion : /login');
}

main().catch((e) => {
  console.error('❌ Échec :', e instanceof Error ? e.message : e);
  process.exit(1);
});
