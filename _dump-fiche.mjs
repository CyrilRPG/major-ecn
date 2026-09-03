import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
const env = readFileSync(new URL('./.env.local', import.meta.url), 'utf8')
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] || '').trim()
const supa = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))
const [,, coursId, out] = process.argv
const { data } = await supa.from('fiches').select('content_html').eq('cours_id', coursId).maybeSingle()
if (!data) { console.error('no fiche'); process.exit(1) }
// strip data-URIs to make it readable
const skeleton = data.content_html.replace(/(src=")data:image\/[^"]+(")/g, '$1[IMG]$2')
writeFileSync(out, skeleton)
console.log('written', out, skeleton.length, 'chars')
