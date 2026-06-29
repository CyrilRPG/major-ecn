/**
 * Upload des 12 PDFs de Dermatologie générés vers Supabase Storage (bucket `fiches`).
 * Utilise le service role key pour bypasser les RLS.
 *
 * PRE-REQUIS:
 *   1. Les PDFs doivent avoir été split au préalable (voir script Python split_pdf.py)
 *   2. SUPABASE_SERVICE_ROLE_KEY doit être dans .env.local
 *
 * Usage : pnpm tsx scripts/upload-dermatologie-fiches.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv({ path: join(__dirname, '..', '.env.local') });
dotenv({ path: join(__dirname, '..', '.env') });

const PDF_DIR = String.raw`C:\Users\steev\AppData\Local\Temp\claude\dermatologie\pdfs`;

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error(
    'Variables manquantes. Ajoute SUPABASE_SERVICE_ROLE_KEY dans .env.local\n' +
    'Récupère-la sur https://supabase.com/dashboard/project/_/settings/api-keys',
  );
  process.exit(1);
}

const TARGETS = [
  { file: 'd1000001-de00-4000-a000-000000000001.pdf', cours: 'd1000001-de00-4000-a000-000000000001', title: 'Dermatoses faciales', pages: 4 },
  { file: 'd1000001-de00-4000-a000-000000000002.pdf', cours: 'd1000001-de00-4000-a000-000000000002', title: 'Ectoparasitoses cutanées', pages: 3 },
  { file: 'd1000001-de00-4000-a000-000000000003.pdf', cours: 'd1000001-de00-4000-a000-000000000003', title: 'Herpès cutanéo-muqueux', pages: 3 },
  { file: 'd1000001-de00-4000-a000-000000000004.pdf', cours: 'd1000001-de00-4000-a000-000000000004', title: 'Infections cutanées bactériennes', pages: 5 },
  { file: 'd1000001-de00-4000-a000-000000000005.pdf', cours: 'd1000001-de00-4000-a000-000000000005', title: 'Prurit', pages: 2 },
  { file: 'd1000001-de00-4000-a000-000000000006.pdf', cours: 'd1000001-de00-4000-a000-000000000006', title: 'Psoriasis', pages: 3 },
  { file: 'd1000001-de00-4000-a000-000000000007.pdf', cours: 'd1000001-de00-4000-a000-000000000007', title: 'Purpuras', pages: 3 },
  { file: 'd1000001-de00-4000-a000-000000000008.pdf', cours: 'd1000001-de00-4000-a000-000000000008', title: 'Syphilis', pages: 3 },
  { file: 'd1000001-de00-4000-a000-000000000009.pdf', cours: 'd1000001-de00-4000-a000-000000000009', title: 'Ulcère de jambe', pages: 3 },
  { file: 'd1000001-de00-4000-a000-000000000010.pdf', cours: 'd1000001-de00-4000-a000-000000000010', title: 'Urticaire', pages: 3 },
  { file: 'd1000001-de00-4000-a000-000000000011.pdf', cours: 'd1000001-de00-4000-a000-000000000011', title: 'Varicelle et zona', pages: 4 },
  { file: 'd1000001-de00-4000-a000-000000000012.pdf', cours: 'd1000001-de00-4000-a000-000000000012', title: 'Acrosyndromes vasculaires', pages: 3 },
];

async function main() {
  const supabase = createClient(URL!, KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const t of TARGETS) {
    const filepath = join(PDF_DIR, t.file);
    if (!existsSync(filepath)) {
      console.warn(`Fichier manquant : ${filepath}`);
      continue;
    }
    const buf = readFileSync(filepath);
    const storagePath = `${t.cours}/fiche.pdf`;

    const { error: upErr } = await supabase.storage
      .from('fiches')
      .upload(storagePath, buf, { contentType: 'application/pdf', upsert: true });
    if (upErr) {
      console.error(`Upload échoué pour ${t.title} :`, upErr.message);
      continue;
    }

    const { error: dbErr } = await supabase
      .from('fiches')
      .update({ storage_path: storagePath, pages: t.pages })
      .eq('cours_id', t.cours);
    if (dbErr) {
      console.error(`Update DB échoué pour ${t.title} :`, dbErr.message);
      continue;
    }
    console.log(`✔ ${t.title} → fiches/${storagePath} (${t.pages}p)`);
  }

  console.log('\nTerminé. Les fiches sont accessibles aux étudiants.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
