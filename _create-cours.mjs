/**
 * Crée les lignes `cours` pour une liste de slugs du worklist (importance 0),
 * assigne order_index à la suite du max existant, et réécrit le coursId dans
 * worklist.json. Usage: node _create-cours.mjs <slug1> <slug2> ...
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
const env = readFileSync(new URL('./.env.local', import.meta.url), 'utf8')
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] || '').trim()
const supa = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
const WL = 'C:/Users/Admin/Desktop/Major-ecn-projects/.corpus-orthopedie/worklist.json'
const wl = JSON.parse(readFileSync(WL, 'utf8'))
const slugs = process.argv.slice(2)
if (!slugs.length) { console.error('give slugs'); process.exit(1) }

const { data: existing } = await supa.from('cours').select('order_index').eq('matiere_id', 'col-orthopedie').order('order_index', { ascending: false }).limit(1)
let next = (existing?.[0]?.order_index || 0) + 1

for (const slug of slugs) {
  const entry = wl.find(e => e.slug === slug)
  if (!entry) { console.error('slug absent du worklist:', slug); process.exit(1) }
  if (entry.coursId) { console.log(`déjà créé: ${slug} → ${entry.coursId}`); continue }
  const { data, error } = await supa.from('cours')
    .insert({ matiere_id: 'col-orthopedie', titre: entry.titre, order_index: next, importance: 0 })
    .select('id').single()
  if (error) { console.error(`création ${slug} échouée:`, error.message); process.exit(1) }
  entry.coursId = data.id
  console.log(`créé: ${slug} → ${data.id} (order_index ${next})`)
  next++
}
writeFileSync(WL, JSON.stringify(wl, null, 1))
console.log('worklist.json mis à jour.')
