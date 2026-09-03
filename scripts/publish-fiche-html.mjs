import { readFileSync } from 'node:fs';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const [coursId, htmlFile] = process.argv.slice(2);
if (!coursId || !htmlFile) throw new Error('Usage: node publish-fiche-html.mjs <coursId> <fiche.html>');
config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const html = readFileSync(htmlFile, 'utf8');
const { data: fiche, error: findError } = await supabase.from('fiches').select('id').eq('cours_id', coursId).order('order_index').limit(1).single();
if (findError) throw findError;
const { error } = await supabase.from('fiches').update({ content_html: html, content_format: 'html' }).eq('id', fiche.id);
if (error) throw error;
console.log(JSON.stringify({ coursId, ficheId: fiche.id, updated: true }));
