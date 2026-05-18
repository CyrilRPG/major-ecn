/**
 * Upload des 3 PDFs de Biochimie générés vers Supabase Storage (bucket `fiches`).
 * Authentifie d’abord l’admin Hermione, puis upload via l’anon key (RLS storage autorise admin role).
 *
 * Usage : pnpm tsx scripts/upload-fiches.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname_init = dirname(fileURLToPath(import.meta.url));
dotenv({ path: join(__dirname_init, '..', '.env.local') });
dotenv({ path: join(__dirname_init, '..', '.env') });

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PDF_DIR = join(ROOT, 'supabase', 'seed-assets', 'fiches');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL || !ANON) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants dans .env.local');
  process.exit(1);
}

const TARGETS = [
  { file: 'biochimie-c1.pdf', cours: '11111111-1111-1111-1111-000000000001' },
  { file: 'biochimie-c2.pdf', cours: '11111111-1111-1111-1111-000000000002' },
  { file: 'biochimie-c3.pdf', cours: '11111111-1111-1111-1111-000000000003' },
];

async function main() {
  const supabase = createClient(URL!, ANON!);
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'admin@hermione-demo.co',
    password: 'Demo2026!',
  });
  if (signInErr) {
    console.error('Échec de la connexion admin :', signInErr.message);
    process.exit(1);
  }

  for (const t of TARGETS) {
    const filepath = join(PDF_DIR, t.file);
    if (!existsSync(filepath)) {
      console.warn(`Fichier manquant : ${filepath} — relance python3 scripts/generate-pdfs.py`);
      continue;
    }
    const buf = readFileSync(filepath);
    const path = t.file;
    const { error: upErr } = await supabase.storage
      .from('fiches')
      .upload(path, buf, { contentType: 'application/pdf', upsert: true });
    if (upErr) {
      console.error(`Upload échoué pour ${t.file} :`, upErr.message);
      continue;
    }
    const { error: dbErr } = await supabase
      .from('fiches')
      .update({ storage_path: path })
      .eq('cours_id', t.cours);
    if (dbErr) {
      console.error(`Update DB échoué pour ${t.file} :`, dbErr.message);
      continue;
    }
    console.log(`✔ ${t.file} → fiches/${path}`);
  }

  await supabase.auth.signOut();
  console.log('\nTerminé. Connecte-toi en tant qu’admin pour vérifier dans Supabase Studio → Storage → fiches.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
