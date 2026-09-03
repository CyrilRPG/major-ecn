import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });
const courseId = '87ad2fd8-3495-4ea8-8546-d1450d26e997';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: fiche, error } = await db.from('fiches').select('id,content_html').eq('cours_id', courseId).single();
if (error) throw error;
const before = fiche.content_html;
const after = before
  .replace(/\s*fait, cette disposition ne correspond qu[’']à\s*% des cas\.\s*/gi, ' ')
  .replace(/\s*Enfin, la poulie A5, absente dans\s*% des cas,\s*/gi, ' ');
if (after === before) throw new Error('Les deux assertions incomplètes sont introuvables.');
const { error: updateError } = await db.from('fiches').update({ content_html: after, content_format: 'html' }).eq('id', fiche.id);
if (updateError) throw updateError;
const { data: readback, error: readError } = await db.from('fiches').select('content_html').eq('id', fiche.id).single();
if (readError || readback.content_html !== after || /qu[’']à\s*% des cas|absente dans\s*% des cas/i.test(readback.content_html)) throw readError || new Error('Lecture de contrôle invalide.');
console.log(JSON.stringify({ courseId, published: true, removed: 2 }));
