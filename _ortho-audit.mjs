import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'

const env = readFileSync(new URL('./.env.local', import.meta.url), 'utf8')
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] || '').trim()
const supa = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))

const count = (s, re) => (s.match(re) || []).length
const metrics = (html) => ({
  chars: html.replace(/src="data:[^"]*"/g, ' ').replace(/<[^>]+>/g, ' ').length,
  li: count(html, /<li[ >]/g),
  nestedUl: count(html, /<li[^>]*>[\s\S]*?<ul/g), // approx nested
  ulul: count(html, /<ul[^>]*>[\s\S]{0,400}?<ul/g),
  pInDetail: count(html, /ft-detail[^>]*>\s*(?:<[^p][^>]*>)*<p[ >]/g),
  contentClass: count(html, /ft-detail\s+content|ft-detail content|class="ft-detail content"/g),
  ftDetail: count(html, /ft-detail/g),
  fmark: count(html, /fmark/g),
  tables: count(html, /<table/g),
  figures: count(html, /ft-figure/g),
  reflexe: count(html, /ft-reflexe/g),
  diamondLiteral: count(html, /◆/g),
  headRow: count(html, /ft-head-row|ft-subtitle|ft-tag/g),
})

// Reference exemplary fiche: pull from a non-ortho college (dermato/cardio)
const refColleges = ['col-dermatologie', 'col-cardiologie', 'col-neurologie', 'col-mg-cardiologie']
let refHtml = null, refName = null
for (const col of refColleges) {
  const { data } = await supa.from('cours').select('titre, fiches(content_html, pages)').eq('matiere_id', col).not('fiches', 'is', null).limit(5)
  if (data && data.length) {
    // pick the one with most li
    for (const c of data) {
      const h = c.fiches?.[0]?.content_html
      if (h && (!refHtml || count(h, /<li[ >]/g) > count(refHtml, /<li[ >]/g))) { refHtml = h; refName = `${col} / ${c.titre}` }
    }
    if (refHtml) break
  }
}
console.log('=== REFERENCE fiche:', refName)
console.log(JSON.stringify(metrics(refHtml), null, 0))
if (refHtml) writeFileSync(new URL('./_ref-fiche.html', import.meta.url), refHtml)

// Ortho fiches
const { data: orthoAll } = await supa.from('cours').select('id, titre, order_index, fiches(content_html, pages)').eq('matiere_id', 'col-orthopedie').order('order_index')
const ortho = (orthoAll || []).filter(c => c.fiches && c.fiches.length && c.fiches[0].content_html)
console.log('\n=== ORTHO fiches (', ortho.length, ') ===')
console.log('n\tpages\tchars\tli\tul>ul\tpInCell\tcontentCls\tftDetail\tfmark\ttbl\tfig\t◆\ttitre')
for (const c of ortho) {
  const h = c.fiches[0].content_html
  const m = metrics(h)
  console.log(`${c.order_index}\t${c.fiches[0].pages}\t${m.chars}\t${m.li}\t${m.ulul}\t${m.pInDetail}\t${m.contentClass}\t${m.ftDetail}\t${m.fmark}\t${m.tables}\t${m.figures}\t${m.diamondLiteral}\t${c.titre.slice(0,30)}`)
}
