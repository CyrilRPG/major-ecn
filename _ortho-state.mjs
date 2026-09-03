import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = readFileSync(new URL('./.env.local', import.meta.url), 'utf8')
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] || '').trim()
const url = get('SUPABASE_URL') || get('NEXT_PUBLIC_SUPABASE_URL')
const supa = createClient(url, get('SUPABASE_SERVICE_ROLE_KEY'))

// Direct table queries via supabase-js
const { data: cours, error: e1 } = await supa
  .from('cours')
  .select('id, titre, order_index, importance')
  .eq('matiere_id', 'col-orthopedie')
  .order('order_index')

if (e1) { console.error('cours error', e1); process.exit(1) }
console.log('TOTAL cours col-orthopedie:', cours.length)

const rows = []
for (const c of cours) {
  const { data: series } = await supa.from('qcm_series').select('id, label, kind, vignette').eq('cours_id', c.id)
  const serieIds = (series || []).map(s => s.id)
  let questions = 0, items = 0
  if (serieIds.length) {
    const { data: qs } = await supa.from('qcm_questions').select('id').in('serie_id', serieIds)
    questions = (qs || []).length
    const qIds = (qs || []).map(q => q.id)
    if (qIds.length) {
      // count items in chunks
      for (let i = 0; i < qIds.length; i += 100) {
        const chunk = qIds.slice(i, i + 100)
        const { count } = await supa.from('qcm_items').select('id', { count: 'exact', head: true }).in('question_id', chunk)
        items += count || 0
      }
    }
  }
  const { count: flash } = await supa.from('flashcards').select('id', { count: 'exact', head: true }).eq('cours_id', c.id)
  const { data: fiche } = await supa.from('fiches').select('pages, content_html').eq('cours_id', c.id).maybeSingle()
  const qcm = (series || []).filter(s => (s.label || '').startsWith('QCM')).length
  const dp = (series || []).filter(s => (s.label || '').startsWith('DP ')).length
  const texteFiche = fiche ? fiche.content_html.replace(/src="data:[^"]*"/g, ' ').replace(/<[^>]+>/g, ' ').length : 0
  rows.push({ n: c.order_index, titre: c.titre.slice(0, 42), qcm, dp, questions, items, flash: flash || 0, pages: fiche?.pages || 0, texte: texteFiche })
}

// print table
console.log('\nn\tqcm\tdp\tq\titems\tflash\tpages\ttexte\ttitre')
for (const r of rows) {
  console.log(`${r.n}\t${r.qcm}\t${r.dp}\t${r.questions}\t${r.items}\t${r.flash}\t${r.pages}\t${r.texte}\t${r.titre}`)
}

// summary
const complete = rows.filter(r => r.qcm >= 8 && r.dp >= 8 && r.flash >= 100 && r.pages >= 7)
const noFiche = rows.filter(r => r.pages === 0)
const badFiche = rows.filter(r => r.pages > 40 || r.texte > 50000)
const noQcm = rows.filter(r => r.qcm < 8 || r.dp < 8)
const noFlash = rows.filter(r => r.flash < 100)
console.log('\n=== SUMMARY ===')
console.log('cours total:', rows.length)
console.log('fully complete (8qcm/8dp/100+flash/fiche7-40p):', complete.length)
console.log('sans fiche (pages=0):', noFiche.length, noFiche.map(r=>r.n).join(','))
console.log('fiche hors norme (>40p ou >50k):', badFiche.length, badFiche.map(r=>`${r.n}(${r.pages}p/${r.texte})`).join(','))
console.log('QCM/DP incomplets (<8/8):', noQcm.length, noQcm.map(r=>r.n).join(','))
console.log('flashcards <100:', noFlash.length, noFlash.map(r=>`${r.n}(${r.flash})`).join(','))
