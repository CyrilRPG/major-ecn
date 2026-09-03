import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
const env = readFileSync(new URL('./.env.local', import.meta.url), 'utf8')
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] || '').trim()
const supa = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))
const c = (s, re) => (s.match(re) || []).length
const ids = {
  5: 'ca56ce35-cfd2-4548-bbc0-bea26d3061b1',
  6: '09e9b59a-ba5a-45b2-b343-bbc734dafaf9',
  7: '98f57bde-879d-4971-bf6a-3447d96b2275',
  8: '10b50d18-5ad7-4e4d-9a7b-568e783706c3',
}
console.log('n\tpages\tchars\tli\tul>ul\tfmark\t◆lit\tpInCell\ttitre')
for (const [n, id] of Object.entries(ids)) {
  const { data } = await supa.from('fiches').select('content_html, pages, titre').eq('cours_id', id).maybeSingle()
  const h = data.content_html
  const chars = h.replace(/src="data:[^"]*"/g, ' ').replace(/<[^>]+>/g, ' ').length
  // literal ◆ NOT inside fmark m-yield
  const diamondsTotal = c(h, /◆/g)
  const diamondsFmark = c(h, /fmark m-yield">◆/g)
  const diamondLit = diamondsTotal - diamondsFmark  // should be ~1 (cover legend)
  const pInCell = c(h, /ft-detail[^>]*"[^>]*>\s*<p[ >]/g)
  console.log(`${n}\t${data.pages}\t${chars}\t${c(h,/<li[ >]/g)}\t${c(h,/<li[^>]*>[\s\S]{0,300}?<ul/g)}\t${c(h,/fmark/g)}\t${diamondLit}\t${pInCell}\t${data.titre.slice(0,28)}`)
}
