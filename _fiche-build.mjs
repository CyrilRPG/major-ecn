/**
 * Construit le corps HTML final d'une fiche générée « depuis zéro ».
 * L'agent référence les images par un token  src="__IMGFILE:img/img_007.png__"
 * (chemin relatif au dossier du chapitre). Ce script lit le PNG/JPG, l'encode
 * en data-URI base64 et remplace le token. __LOGO__ / __WATERMARK__ restent
 * intacts (render-mg-fiche.mjs les substitue).
 *
 * Usage: node _fiche-build.mjs <chapterDir> <skeletonIn> <bodyOut>
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

const [, , chapterDir, skeletonIn, bodyOut] = process.argv
if (!chapterDir || !skeletonIn || !bodyOut) {
  console.error('usage: node _fiche-build.mjs <chapterDir> <skeletonIn> <bodyOut>')
  process.exit(1)
}
const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' }
let html = readFileSync(skeletonIn, 'utf8')
const tokens = [...html.matchAll(/__IMGFILE:([^_][^"]*?)__/g)].map(m => m[1])
const uniq = [...new Set(tokens)]
let ok = 0, missing = []
for (const rel of uniq) {
  const p = join(chapterDir, rel)
  if (!existsSync(p)) { missing.push(rel); continue }
  const b64 = readFileSync(p).toString('base64')
  const uri = `data:${mime[extname(p).toLowerCase()] || 'image/png'};base64,${b64}`
  html = html.replaceAll(`__IMGFILE:${rel}__`, uri)
  ok++
}
const leftover = [...html.matchAll(/__IMGFILE:[^"]*?__/g)].map(m => m[0])
writeFileSync(bodyOut, html)
console.log(`build ok → ${bodyOut} (${html.length} chars). images injected: ${ok}/${uniq.length}. missing: ${missing.length ? missing.join(',') : 'none'}. leftover tokens: ${leftover.length}`)
if (missing.length || leftover.length) process.exit(2)
