import fs from 'node:fs';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: 'C:/Users/Admin/Desktop/Major-ecn-projects/major-ecn/.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const r = await s.storage.from('fiches').download('79b97652-efce-492f-b9c9-4f9a7b65535f/fiche.pdf');
if (r.error) { console.error(r.error); process.exit(1); }
const b = Buffer.from(await r.data.arrayBuffer());
const out = process.argv[2];
fs.writeFileSync(out, b);
console.log('pdf bytes', b.length, '->', out);
