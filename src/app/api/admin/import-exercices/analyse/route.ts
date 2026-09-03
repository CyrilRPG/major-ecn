/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * POST /api/admin/import-exercices/analyse — analyse IA d'un import déjà téléversé.
 *
 * POURQUOI UNE ROUTE, ET PLUS UNE ACTION SERVEUR (03/09/2026)
 * ----------------------------------------------------------
 * Deux plafonds de plateforme faisaient échouer l'import, tous deux invisibles
 * dans le code :
 *
 *  1. Vercel refuse un corps de requête au-delà de 4,5 Mo et répond 413 avant
 *     d'exécuter la fonction. L'action précédente recevait le PDF entier : tout
 *     sujet d'annales réel dépassait le plafond. Le document est désormais
 *     téléversé du navigateur vers Supabase Storage, et cette route ne reçoit
 *     qu'un identifiant.
 *  2. Sans `maxDuration`, une fonction retombe sur le délai par défaut, très
 *     inférieur au temps d'une extraction IA sur un PDF. La page d'import n'en
 *     déclarait aucun, contrairement à `/admin/blog/ia` (300 s) qui fait un
 *     travail comparable. Le délai est donc déclaré ici, au plus près de
 *     l'appel long.
 *
 * Dans les deux cas l'échec remontait en promesse rejetée dans le composant, ce
 * qui affichait l'écran « Cette page n'a pas pu s'afficher » au lieu d'un
 * message. Le client rattrape maintenant toute erreur, et cette route répond
 * toujours en JSON.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import {
  extractExerciseImport, EXERCISE_IMPORT_MODEL,
  type ImportFormat, type ImportMode, type ImportVoie,
} from '@/lib/ai/exercise-import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Une extraction sur PDF dépasse largement le délai par défaut. */
export const maxDuration = 300;

const Body = z.object({ id: z.string().uuid() });

function mimeFor(format: ImportFormat) {
  return format === 'pdf' ? 'application/pdf' : format === 'docx'
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain';
}

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Import invalide.' }, { status: 400 });
  const { id } = parsed.data;

  const admin = createAdminClient();
  const a = admin as unknown as { from: (table: string) => any; storage: typeof admin.storage };

  const { data: row, error: readErr } = await a.from('exercise_imports')
    .select('id, cours_id, voie, format, source_mode, sujet_path, corrige_path, status, estimated_price_cents, cours(titre)')
    .eq('id', id).maybeSingle();
  if (readErr) return NextResponse.json({ ok: false, error: readErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ ok: false, error: 'Import introuvable.' }, { status: 404 });
  if (!['draft', 'processing', 'failed'].includes(row.status)) {
    return NextResponse.json({ ok: false, error: 'Cet import a déjà été analysé.' }, { status: 409 });
  }

  await a.from('exercise_imports').update({ status: 'processing', error_message: null, updated_at: new Date().toISOString() }).eq('id', id);

  try {
    const mime = mimeFor(row.format as ImportFormat);
    const chemins: Array<{ path: string; role: 'combined' | 'subject' | 'answer' }> = [
      { path: row.sujet_path, role: row.source_mode === 'combined' ? 'combined' : 'subject' },
      ...(row.corrige_path ? [{ path: row.corrige_path as string, role: 'answer' as const }] : []),
    ];
    const files = await Promise.all(chemins.map(async ({ path, role }) => {
      const { data, error } = await a.storage.from('exercise-imports').download(path);
      if (error || !data) throw new Error(`Document introuvable dans le stockage (${role}).`);
      return {
        filename: path.split('/').pop() ?? `${role}.bin`,
        mime,
        bytes: new Uint8Array(await data.arrayBuffer()),
        role,
      };
    }));

    const result = await extractExerciseImport({
      voie: row.voie as ImportVoie,
      mode: row.source_mode as ImportMode,
      files,
    });
    if (result.questions.length === 0) throw new Error('Aucun exercice exploitable n’a été trouvé.');

    const { error } = await a.from('exercise_imports').update({
      status: 'ready', result, warnings: result.warnings, model: EXERCISE_IMPORT_MODEL,
      billed_price_cents: row.estimated_price_cents, processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw new Error(error.message);

    await logAudit({
      actor: { id: guard.auth.user.id, email: guard.auth.user.email ?? null, role: 'admin' } as any,
      action: 'create', entity: 'exercise_import', entityId: id,
      coursId: row.cours_id, coursTitre: row.cours?.titre,
      description: `Import d’exercices analysé : ${result.questions.length} exercice(s)`,
    });

    return NextResponse.json({ ok: true, id, questions: result.questions.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de l’analyse IA.';
    console.error('[import-exercices/analyse]', { id, message });
    await a.from('exercise_imports').update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
