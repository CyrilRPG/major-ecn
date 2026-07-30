import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVerifiedUser } from '@/lib/auth/verified-user';

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });

  const coursId = String(form.get('coursId') ?? '');
  const firstName = String(form.get('firstName') ?? '').trim();
  const lastName = String(form.get('lastName') ?? '').trim();
  const file = form.get('file');

  if (!coursId || !firstName || !lastName || !(file instanceof File)) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Le fichier doit être un PDF' }, { status: 400 });
  }

  const path = `${coursId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const { error: upErr } = await supabase.storage
    .from('content-submissions')
    .upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { error: dbErr } = await supabase.from('content_submissions').insert({
    cours_id: coursId,
    submitted_by: user.id,
    first_name: firstName,
    last_name: lastName,
    storage_path: path,
  });
  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
