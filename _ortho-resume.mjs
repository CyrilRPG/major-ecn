/**
 * Script de reprise de la production Orthopédie.
 * À lancer au début d'une nouvelle session pour savoir où on en est
 * et quels fichiers de scratchpad sont prêts à être insérés.
 *
 * Usage: node _ortho-resume.mjs [scratchpadDir]
 * Défaut scratchpadDir: C:\Users\Admin\AppData\Local\Temp\claude\...\scratchpad
 *
 * Affiche :
 *   - Chapitres sans contenu (à produire)
 *   - Dossiers scratchpad avec chapter.json + skeleton.html prêts (à insérer)
 *   - Commandes prêtes-à-coller pour chaque chapitre prêt
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const env = readFileSync(new URL('./.env.local', import.meta.url), 'utf8')
const get = k => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] || '').trim()
const supa = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })

const WL = 'C:/Users/Admin/Desktop/Major-ecn-projects/.corpus-orthopedie/worklist.json'
const CORPUS = 'C:/Users/Admin/Desktop/Major-ecn-projects/.corpus-orthopedie'
const wl = JSON.parse(readFileSync(WL, 'utf8'))

// Scratchpad : argument ou chemin de la session courante (à mettre à jour si session change)
const SCRATCH = process.argv[2] || 'C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin-Desktop-Major-ecn-projects/4d89a0eb-1e47-4230-ba46-328acacfe17d/scratchpad'

console.log('\n=== REPRISE PRODUCTION ORTHOPÉDIE ===\n')

// 1. État DB
const { data: cours } = await supa.from('cours').select('id,titre,order_index').eq('matiere_id', 'col-orthopedie').order('order_index')

const empty = []
for (const c of cours) {
  const { count: nSeries } = await supa.from('qcm_series').select('id', { count: 'exact', head: true }).eq('cours_id', c.id)
  if (!nSeries) empty.push(c)
}

console.log(`Chapitres SANS contenu en base : ${empty.length}`)
empty.forEach(c => console.log(`  ch${c.order_index} ${c.id} — ${c.titre.substring(0, 50)}`))

// 2. Dossiers scratchpad prêts
console.log('\n--- Dossiers scratchpad avec chapter.json + skeleton.html ---')
const readyDirs = []
if (existsSync(SCRATCH)) {
  const dirs = readdirSync(SCRATCH)
  for (const dir of dirs) {
    const p = join(SCRATCH, dir)
    const hasJson = existsSync(join(p, 'chapter.json'))
    const hasSkel = existsSync(join(p, 'skeleton.html'))
    if (!hasJson && !hasSkel) continue
    // Find the coursId from chapter slug embedded in dir name (chN)
    const n = parseInt(dir.replace('ch', ''))
    const c = cours.find(x => x.order_index === n)
    const wlEntry = wl.find(w => w.coursId === c?.id)
    const slug = wlEntry?.slug || '?'
    const corpusDir = join(CORPUS, slug)
    readyDirs.push({ dir: p, n, coursId: c?.id, titre: c?.titre, slug, corpusDir, hasJson, hasSkel })
  }
}

if (readyDirs.length === 0) {
  console.log('  (aucun dossier prêt)')
} else {
  readyDirs.forEach(r => {
    console.log(`\n  ch${r.n} — ${r.titre?.substring(0, 45)}`)
    console.log(`    json: ${r.hasJson ? '✓' : '✗'}  skel: ${r.hasSkel ? '✓' : '✗'}`)
    if (r.hasJson) {
      const thin = (() => { try { return JSON.parse(readFileSync(join(r.dir,'chapter.json'),'utf8')).thin ? ' --thin' : '' } catch { return '' } })()
      console.log(`    1. node _ins-chapter.mjs ${r.coursId} "${r.dir.replace(/\//g,'\\')}"\\chapter.json${thin}`)
      if (r.hasSkel) {
        console.log(`    2. node _fiche-build.mjs "${r.corpusDir.replace(/\//g,'\\')}" "${r.dir.replace(/\//g,'\\')}"\\skeleton.html "${r.dir.replace(/\//g,'\\')}"\\body.html`)
        console.log(`    3. node scripts/render-mg-fiche.mjs ${r.coursId} "${r.dir.replace(/\//g,'\\')}"\\body.html "${r.titre}"`)
      }
    }
  })
}

// 3. Corpus dirs avec chapter.json (agents qui ont sauvegardé directement)
console.log('\n--- Corpus dirs avec chapter.json (agents permanents) ---')
let found = 0
for (const e of wl) {
  if (!e.coursId) continue
  const p = join(CORPUS, e.slug, 'chapter.json')
  if (existsSync(p)) {
    const c = cours.find(x => x.id === e.coursId)
    const { count: nSeries } = await supa.from('qcm_series').select('id', { count: 'exact', head: true }).eq('cours_id', e.coursId)
    if (!nSeries) {
      console.log(`  ${e.slug} — chapter.json présent, pas encore inséré`)
      found++
    }
  }
}
if (!found) console.log('  (aucun)')

console.log('\n=== FIN ===\n')
