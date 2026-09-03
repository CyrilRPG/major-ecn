const normalizeText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export function coverageBodyBlocks(extract) {
  const blocks = extract?.blocs || [];
  const chapterHeadingIndex = blocks.findIndex((block) => /^chapitre\s+\d+/i.test(normalizeText(block.texte)));
  const firstTitleParagraph = blocks.slice(Math.max(0, chapterHeadingIndex + 1))
    .findIndex((block) => block.texte && !['titre', 'legende', 'image'].includes(block.type));
  const titleParagraphIndex = firstTitleParagraph >= 0 ? chapterHeadingIndex + 1 + firstTitleParagraph : -1;
  const eligible = [];
  let backMatter = false;

  for (const [index, block] of blocks.entries()) {
    const text = normalizeText(block.texte);
    if (/^(?:conclusion|notions essentielles|références|bibliographie)\b/i.test(text)) {
      backMatter = true;
      continue;
    }
    if (backMatter || !text || block.quarantaine || ['titre', 'legende', 'image'].includes(block.type)) continue;
    if (index === titleParagraphIndex || text.length < 40) continue;
    if (/^\d+(?:\.\d+){0,4}\.?\s+[A-Za-zÀ-ÿ]/u.test(text)) continue;
    if (/^(?:figure|tableau)\s*\d/i.test(text)) continue;
    if (/^(?:illustration|reproduit avec|crédit|source\s*:|tome\s+\d+)/i.test(text)) continue;
    if (/(?:graphiste|productions multimedia|library\s*\/\s*museum|permission de l'éditeur)/i.test(text)) continue;
    if (/^[A-C]\s*:\s*/.test(text) && /(?:axe|positionnement|intubation)/i.test(text)) continue;
    eligible.push(block);
  }
  return eligible;
}

export function eligibleCoverageCount(referencedBlocks, bodyBlocks) {
  const bodyBlockIds = new Set(bodyBlocks.map((block) => block.id).filter(Boolean));
  return [...referencedBlocks].filter((id) => bodyBlockIds.has(id)).length;
}

export function coveragePercent(referencedBlocks, bodyBlocks) {
  return bodyBlocks.length
    ? Math.round(1000 * eligibleCoverageCount(referencedBlocks, bodyBlocks) / bodyBlocks.length) / 10
    : 0;
}
