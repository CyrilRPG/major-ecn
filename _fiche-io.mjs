/**
 * Deux modes :
 *   prep <coursId> <skeletonOut> <mapOut>
 *      → lit fiches.content_html, remplace chaque data-URI par un placeholder
 *        __IMG_N__, écrit le squelette (petit) + la map JSON {placeholder: dataUri}.
 *   restore <skeletonIn> <mapIn> <bodyOut>
 *      → réinjecte les data-URI dans le squelette édité → corps prêt à rendre.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'

const env = readFileSync(new URL('./.env.local', import.meta.url), 'utf8')
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] || '').trim()

const mode = process.argv[2]

if (mode === 'prep') {
  const [, , , coursId, skeletonOut, mapOut] = process.argv
  const supa = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))
  const { data } = await supa.from('fiches').select('content_html').eq('cours_id', coursId).maybeSingle()
  if (!data) { console.error('no fiche for', coursId); process.exit(1) }
  const map = {}
  let n = 0
  const skeleton = data.content_html.replace(/data:image\/[^"']+/g, (uri) => {
    const key = `__IMG_${++n}__`
    map[key] = uri
    return key
  })
  writeFileSync(skeletonOut, skeleton)
  writeFileSync(mapOut, JSON.stringify(map))
  console.log(`prep ok: ${n} images → ${skeletonOut} (${skeleton.length} chars), map ${mapOut}`)
} else if (mode === 'restore') {
  const [, , , skeletonIn, mapIn, bodyOut] = process.argv
  const skeleton = readFileSync(skeletonIn, 'utf8')
  const map = JSON.parse(readFileSync(mapIn, 'utf8'))
  let body = skeleton
  let missing = 0
  for (const [key, uri] of Object.entries(map)) {
    if (!body.includes(key)) missing++
    body = body.replaceAll(key, uri)
  }
  // detect any leftover placeholders the agent may have invented/kept without map entry
  const leftover = [...body.matchAll(/__IMG_\d+__/g)].map(m => m[0])
  writeFileSync(bodyOut, body)
  console.log(`restore ok → ${bodyOut} (${body.length} chars). map keys not found in skeleton: ${missing}. leftover placeholders: ${leftover.length ? leftover.join(',') : 'none'}`)
  if (leftover.length) process.exit(2)
} else {
  console.error('usage: prep <coursId> <skeletonOut> <mapOut>  |  restore <skeletonIn> <mapIn> <bodyOut>')
  process.exit(1)
}
