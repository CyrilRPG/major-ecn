/**
 * Re-rend le PDF d'une ou plusieurs fiches à partir de leur `content_html`
 * (charte actuelle, Chrome local), contrôle la page de garde
 * (scripts/verifier-couverture-fiche.py : aucun chevauchement, légende
 * présente) et ne publie que si le contrôle passe. Le PDF remplace le fichier
 * existant (même `storage_path`) ; l'écriture passe par `partage_fiche_set_pdf`,
 * qui ne se répercute pas aux fiches jumelles d'un item partagé.
 *
 * Usage : node scripts/rerendre-fiche.mjs <ficheId> [<ficheId> …] [--dry-run]
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';

dotenv({ path: '.env.local', quiet: true });
const DRY = process.argv.includes('--dry-run');
const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

/** Rend un corps de fiche et vérifie sa couverture ; renvoie les octets du PDF. */
export function rendreEtVerifier(coursId, contentHtml, titre) {
  const dossier = mkdtempSync(join(os.tmpdir(), 'fiche-'));
  const corps = join(dossier, 'body.html');
  const pdf = join(dossier, 'fiche.pdf');
  writeFileSync(corps, contentHtml, 'utf8');
  execFileSync('node', ['scripts/render-mg-fiche.mjs', coursId, corps, titre, '--no-publish', '--pdf', pdf], { stdio: ['ignore', 'ignore', 'inherit'] });
  execFileSync('python', ['scripts/verifier-couverture-fiche.py', pdf], { stdio: 'inherit', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  return readFileSync(pdf);
}

for (const id of ids) {
  const { data: f, error } = await db.from('fiches').select('id, cours_id, storage_path, content_html, cours(titre)').eq('id', id).single();
  if (error) throw new Error(`${id} : ${error.message}`);
  if (!f.content_html) throw new Error(`${id} : pas de content_html`);
  const octets = rendreEtVerifier(f.cours_id, f.content_html, f.cours.titre);
  const pages = (await PDFDocument.load(octets)).getPageCount();
  if (DRY) { console.log(`(dry-run) ${f.cours.titre} : ${pages} p.`); continue; }
  // Un fichier partagé avec une autre fiche (jumelle d'item partagé, copie) n'est
  // jamais écrasé : la fiche re-rendue reçoit alors son propre fichier.
  let chemin = f.storage_path;
  if (chemin) {
    const { count } = await db.from('fiches').select('id', { count: 'exact', head: true }).eq('storage_path', chemin).neq('id', f.id);
    if (count) chemin = null;
  }
  chemin ??= `${f.cours_id}/fiche-${f.id.slice(0, 8)}.pdf`;
  const { error: upErr } = await db.storage.from('fiches').upload(chemin, octets, { contentType: 'application/pdf', upsert: true });
  if (upErr) throw new Error(`upload ${chemin} : ${upErr.message}`);
  const { error: setErr } = await db.rpc('partage_fiche_set_pdf', { p_fiche_id: f.id, p_storage_path: chemin, p_pages: pages });
  if (setErr) throw new Error(setErr.message);
  console.log(`✔ ${f.cours.titre} → ${chemin} (${pages} p.)`);
}
