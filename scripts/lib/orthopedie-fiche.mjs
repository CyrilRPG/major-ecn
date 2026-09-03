import { existsSync, readFileSync } from "node:fs";
import { extname, normalize, resolve } from "node:path";

const MARKERS = {
  ecn: { glyph: "★", className: "m-ecn" },
  yield: { glyph: "◆", className: "m-yield" },
  trap: { glyph: "⚠", className: "m-trap" },
};

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

// The source model is text-first. This intentionally supports a very small
// inline syntax instead of accepting arbitrary HTML from generation agents.
const inline = (value) =>
  escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

const roman = (index) =>
  ["I", "II", "III", "IV", "V", "VI", "VII"][index] ?? String(index + 1);

const asArray = (value) => (Array.isArray(value) ? value : []);

function flattenBullets(bullets, depth = 1) {
  return asArray(bullets).flatMap((bullet) => {
    const node = typeof bullet === "string" ? { text: bullet } : bullet || {};
    return [
      { text: node.text, depth, children: asArray(node.children) },
      ...flattenBullets(node.children, depth + 1),
    ];
  });
}

const lexicalWords = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];

function isNearVerbatim(value, source) {
  const words = lexicalWords(value);
  const sourceWords = lexicalWords(source);
  if (words.length < 18 || sourceWords.length < words.length) return false;
  const width = 5;
  const sourceShingles = new Set(
    Array.from({ length: sourceWords.length - width + 1 }, (_, index) =>
      sourceWords.slice(index, index + width).join(" "),
    ),
  );
  const shingles = Array.from(
    { length: words.length - width + 1 },
    (_, index) => words.slice(index, index + width).join(" "),
  );
  const shared = shingles.filter((shingle) =>
    sourceShingles.has(shingle),
  ).length;
  return shared / shingles.length >= 0.8;
}

// Les numéros du document source sont des repères d'édition, pas des titres
// pédagogiques. La fiche possède sa propre hiérarchie I–VII / A–E.
export const stripSourceNumbering = (value) =>
  String(value ?? "")
    .replace(/^\s*chapitre\s+[\divxlcdm]+\s*[-–—.:)]*\s*/i, "")
    .replace(
      /^\s*(?:tableau|figure|fig\.?|encadré)\s+[\divxlcdm]+(?:[.\-][\divxlcdm]+)*\s*[-–—.:)]*\s*/i,
      "",
    )
    .replace(/^\s*\d+(?:\.\d+)*(?:[.)])?\s*[-–—:]?\s*/, "")
    .trim();

const TEXTUAL_IMAGE_RE =
  /\b(?:tableau|score|questionnaire|algorithme|arbre|classification|crit[eè]res?|items?|recommandation)\b/i;

function isTextualImage(image) {
  return (
    image?.containsText === true ||
    image?.layout === "full_width" ||
    TEXTUAL_IMAGE_RE.test(
      `${image?.caption || ""} ${image?.sourceCaption || ""}`,
    )
  );
}

function renderBullets(bullets) {
  const renderOne = (bullet) => {
    // Les sources livrent souvent « repère : explication » sur une seule
    // puce. On conserve intégralement le texte mais on restitue sa hiérarchie
    // sémantique avec une sous-liste, éditable dans le HTML final.
    const node = typeof bullet === "string" ? { text: bullet } : bullet;
    const children = asArray(node.children);
    return `<li>${inline(node.text)}${children.length ? `<ul>${children.map(renderOne).join("")}</ul>` : ""}</li>`;
  };
  // Le HTML reste volontairement sémantique et directement éditable dans
  // l'éditeur de fiches : une liste est une vraie liste, jamais des espaces
  // ou des tirets simulant une indentation.
  return `<ul class="ft-list">${asArray(bullets).map(renderOne).join("")}</ul>`;
}

function renderImage(image, chapterDir, position, forcedSize = null) {
  if (!image || image.position !== position) return "";
  const candidate = resolve(chapterDir, image.path);
  const chapterRoot = `${resolve(chapterDir)}\\`;
  if (!candidate.startsWith(chapterRoot) || !existsSync(candidate)) {
    throw new Error(`Image introuvable ou hors chapitre : ${image.path}`);
  }
  if (
    ![".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(
      extname(candidate).toLowerCase(),
    )
  ) {
    throw new Error(`Format d'image non pris en charge : ${image.path}`);
  }
  const size = forcedSize || (image.size === "large" ? "large" : "small");
  const cleanCaption = stripSourceNumbering(image.caption);
  const caption = cleanCaption
    ? `<figcaption>${inline(cleanCaption)}</figcaption>`
    : "";
  const cropBottomMm = Number(image.cropBottomMm || 0);
  const cropStyle =
    Number.isFinite(cropBottomMm) && cropBottomMm > 0 && cropBottomMm <= 30
      ? ` style="clip-path:inset(0 0 ${cropBottomMm}mm 0);margin-bottom:-${cropBottomMm}mm!important"`
      : "";
  const maskRegions = asArray(image.maskRegions);
  const masks = maskRegions
    .map(
      (region) =>
        `<span aria-hidden="true" style="position:absolute;left:${Number(region.leftPct)}%;top:${Number(region.topPct)}%;width:${Number(region.widthPct)}%;height:${Number(region.heightPct)}%;background:#fff"></span>`,
    )
    .join("");
  const renderedImage = `<img src="__IMGFILE:${escapeHtml(normalize(image.path).replace(/\\/g, "/"))}__" alt=""${cropStyle}>`;
  const imageWithMasks = masks
    ? `<span style="display:block;position:relative;line-height:0">${renderedImage}${masks}</span>`
    : renderedImage;
  return `<figure class="ft-figure ft-figure--${size}">${imageWithMasks}${caption}</figure>`;
}

function renderRow(row, chapterDir) {
  if (row.kind) {
    const labels = { a_retenir: "À retenir", piege: "Piège", mnemo: "Mémo" };
    if (!labels[row.kind])
      throw new Error(`Type d'encadré inconnu : ${row.kind}`);
    return `<tr class="ft-reflexe ft-reflexe--${row.kind}"><td colspan="2"><span class="ft-reflexe-label">${labels[row.kind]}</span><div class="ft-reflexe-body content">${renderBullets(row.bullets)}</div></td></tr>`;
  }
  const marker = row.marker ? MARKERS[row.marker] : null;
  if (row.marker && !marker)
    throw new Error(`Marqueur inconnu : ${row.marker}`);
  const concept = `${inline(row.concept)}${marker ? ` <span class="fmark ${marker.className}">${marker.glyph}</span>` : ""}`;
  // Une image contenant du texte ne partage jamais la ligne avec les puces :
  // elle est rendue juste après, sur les deux colonnes, à pleine largeur.
  const textual = isTextualImage(row.image);
  const inlineImage = textual
    ? ""
    : `${renderImage(row.image, chapterDir, "before")}${renderImage(row.image, chapterDir, "after")}`;
  const contentRow = `<tr><td class="ft-concept">${concept}</td><td class="ft-detail content">${renderBullets(row.bullets)}${inlineImage}</td></tr>`;
  const imageRow = textual
    ? `<tr class="ft-image-row"><td colspan="2">${renderImage(row.image, chapterDir, row.image.position, "large")}</td></tr>`
    : "";
  return `${contentRow}${imageRow}`;
}

export function validateFicheModel(model, chapterDir) {
  const errors = [];
  const parts = asArray(model.parts);
  let sourceImages = new Map();
  let sourceBlockIds = new Set();
  let sourceBlockTexts = new Map();
  const extractPath = resolve(chapterDir, "extract.json");
  if (existsSync(extractPath)) {
    try {
      const extract = JSON.parse(readFileSync(extractPath, "utf8"));
      sourceImages = new Map(
        asArray(extract.images).map((image) => [
          normalize(image.fichier || "").replace(/\\/g, "/"),
          image,
        ]),
      );
      sourceBlockIds = new Set(
        asArray(extract.blocs)
          .map((block) => block.id)
          .filter(Boolean),
      );
      sourceBlockTexts = new Map(
        asArray(extract.blocs).map((block) => [block.id, block.texte || ""]),
      );
    } catch {
      errors.push(
        "extract.json illisible : impossibilité de vérifier les images source",
      );
    }
  } else {
    errors.push(
      "extract.json absent : impossibilité de vérifier les images source",
    );
  }
  if (!model.title?.trim()) errors.push("title manquant");
  if (/^rep[eè]re\s*\d*$/i.test(model.title.trim()))
    errors.push("title générique interdit");
  if (/synth[eè]se issue/i.test(model.coverSubtitle || ""))
    errors.push("coverSubtitle générique interdit");
  if (parts.length < 4 || parts.length > 7)
    errors.push(`parts = ${parts.length}, attendu 4-7`);
  let figureCount = 0;
  let n2Rows = 0;
  let flatRows = 0;
  let n2Sections = 0;
  let totalRows = 0;
  const visibleSourceBlocks = new Set();
  const displayedImagePaths = new Set();
  for (const [partIndex, part] of parts.entries()) {
    const sections = asArray(part.sections);
    if (!part.title?.trim())
      errors.push(`partie ${partIndex + 1}: titre manquant`);
    if (part.title?.trim() !== stripSourceNumbering(part.title))
      errors.push(
        `partie ${partIndex + 1}: numérotation source interdite (${part.title})`,
      );
    if (sections.length < 2 || sections.length > 5)
      errors.push(
        `partie ${partIndex + 1}: ${sections.length} sous-parties, attendu 2-5`,
      );
    for (const [sectionIndex, section] of sections.entries()) {
      const rows = asArray(section.rows);
      let sectionN2Rows = 0;
      if (!section.title?.trim())
        errors.push(
          `partie ${partIndex + 1}, sous-partie ${sectionIndex + 1}: titre manquant`,
        );
      if (section.title?.trim() !== stripSourceNumbering(section.title))
        errors.push(`« ${section.title} » : numérotation source interdite`);
      if (rows.length < 3 || rows.length > 6)
        errors.push(
          `« ${section.title || sectionIndex + 1} » : ${rows.length} lignes, attendu 3-6`,
        );
      for (const row of rows) {
        totalRows++;
        if (!row.kind && !row.concept?.trim())
          errors.push(`« ${section.title} » : concept manquant`);
        if (!row.kind && /^rep[eè]re\s*\d+$/i.test(row.concept?.trim() || ""))
          errors.push(
            `« ${section.title} » : concept générique interdit (${row.concept})`,
          );
        if (!asArray(row.bullets).length)
          errors.push(`« ${section.title} » : ligne sans puce`);
        if (!asArray(row.sourceBlocks).length)
          errors.push(
            `« ${section.title} » / « ${row.concept || "encadré"} » : provenance absente`,
          );
        for (const id of asArray(row.sourceBlocks)) visibleSourceBlocks.add(id);
        const unknownSourceBlocks = asArray(row.sourceBlocks).filter(
          (id) => !sourceBlockIds.has(id),
        );
        if (unknownSourceBlocks.length)
          errors.push(
            `« ${section.title} » / « ${row.concept || "encadré"} » : blocs source inconnus (${unknownSourceBlocks.join(", ")})`,
          );
        const citedSourceText = asArray(row.sourceBlocks)
          .map((id) => sourceBlockTexts.get(id) || "")
          .join(" ");
        const bulletNodes = flattenBullets(row.bullets);
        const hasN2 = bulletNodes.some((bullet) => bullet.depth === 2);
        if (hasN2) {
          n2Rows++;
          sectionN2Rows++;
        } else flatRows++;
        if (bulletNodes.some((bullet) => bullet.depth > 2))
          errors.push(
            `« ${section.title} » : profondeur de liste supérieure à N+2`,
          );
        for (const bullet of bulletNodes) {
          const text = bullet.text;
          if (!String(text || "").trim())
            errors.push(
              `« ${section.title} » : puce vide au niveau ${bullet.depth}`,
            );
          if (
            bullet.depth === 1 &&
            bullet.children.length &&
            String(text || "").trim().length < 24
          )
            errors.push(
              `« ${section.title} » : parent N+1 trop générique pour justifier un niveau N+2`,
            );
          if (
            /^nous (rappelons|allons|invitons)/i.test(String(text || "").trim())
          )
            errors.push(`« ${section.title} » : paragraphe d'annonce interdit`);
          if (
            /\b(?:corpus|selon la source|la source (?:indique|pr[eé]cise|d[eé]crit|rapporte|cite)|le chapitre (?:indique|pr[eé]cise|d[eé]crit|rapporte|cite))\b/i.test(
              String(text || ""),
            )
          )
            errors.push(
              `« ${section.title} » : référence éditoriale visible interdite dans la fiche`,
            );
          if (isNearVerbatim(text, citedSourceText))
            errors.push(
              `« ${section.title} » : fragment source repris presque mot pour mot, synthèse rédactionnelle attendue`,
            );
        }
        if (row.image) {
          figureCount++;
          const imageKey = normalize(row.image.path || "").replace(/\\/g, "/");
          displayedImagePaths.add(imageKey);
          const sourceImage = sourceImages.get(imageKey);
          if (!sourceImage)
            errors.push(
              `« ${section.title} » : image absente du corpus source (${row.image.path})`,
            );
          if (
            row.image.caption &&
            row.image.caption.trim().split(/\s+/).length > 15
          )
            errors.push(`« ${section.title} » : légende image trop longue`);
          if (
            row.image.caption &&
            row.image.caption.trim() !== stripSourceNumbering(row.image.caption)
          )
            errors.push(
              `« ${section.title} » : numérotation source interdite dans la légende`,
            );
          if (isTextualImage(row.image) && row.image.size === "small")
            errors.push(
              `« ${section.title} » : image textuelle interdite en troisième colonne`,
            );
          if (
            row.image.cropBottomMm &&
            (!Number.isFinite(Number(row.image.cropBottomMm)) ||
              Number(row.image.cropBottomMm) <= 0 ||
              Number(row.image.cropBottomMm) > 30)
          )
            errors.push(`« ${section.title} » : recadrage image invalide`);
          if (asArray(row.image.maskRegions).length > 4)
            errors.push(`« ${section.title} » : trop de masques image`);
          for (const region of asArray(row.image.maskRegions)) {
            const values = ["leftPct", "topPct", "widthPct", "heightPct"].map(
              (key) => Number(region?.[key]),
            );
            if (
              values.some(
                (value) => !Number.isFinite(value) || value < 0 || value > 100,
              ) ||
              values[0] + values[2] > 100 ||
              values[1] + values[3] > 100 ||
              values[2] <= 0 ||
              values[3] <= 0
            )
              errors.push(`« ${section.title} » : masque image invalide`);
          }
          if (
            row.image.caption &&
            (!sourceImage?.legende ||
              sourceImage.legende.trim().length < 25 ||
              !row.image.sourceCaption ||
              row.image.sourceCaption.trim().length < 25)
          )
            errors.push(
              `« ${section.title} » : légende affichée sans légende source exploitable`,
            );
          if (!row.image.caption && row.image.sourceCaption)
            errors.push(
              `« ${section.title} » : sourceCaption présent sans légende affichée`,
            );
          const imagePath = resolve(chapterDir, row.image.path || "");
          if (
            !imagePath.startsWith(`${resolve(chapterDir)}\\`) ||
            !existsSync(imagePath)
          )
            errors.push(
              `« ${section.title} » : image absente (${row.image.path})`,
            );
        }
      }
      if (sectionN2Rows) n2Sections++;
      if (
        sectionN2Rows === rows.length &&
        !/check-list/i.test(section.title || "")
      )
        errors.push(
          `« ${section.title} » : indentation N+2 systématique, hiérarchie à réévaluer`,
        );
    }
  }
  const allowedOmissionReasons = new Set([
    "duplicate",
    "decorative",
    "unreadable",
  ]);
  const declaredImageOmissions = asArray(model.imageOmissions);
  const declaredOmissionPaths = new Set();
  for (const omission of declaredImageOmissions) {
    const imageKey = normalize(omission?.path || "").replace(/\\/g, "/");
    if (!imageKey) {
      errors.push("omission image : chemin manquant");
      continue;
    }
    if (declaredOmissionPaths.has(imageKey))
      errors.push(`omission image déclarée plusieurs fois (${imageKey})`);
    declaredOmissionPaths.add(imageKey);
    if (!sourceImages.has(imageKey))
      errors.push(`omission image hors corpus source (${imageKey})`);
    if (displayedImagePaths.has(imageKey))
      errors.push(`image à la fois affichée et déclarée omise (${imageKey})`);
    if (!allowedOmissionReasons.has(omission?.reason))
      errors.push(`omission image : motif invalide pour ${imageKey}`);
    if (String(omission?.justification || "").trim().length < 25)
      errors.push(
        `omission image : justification insuffisante pour ${imageKey}`,
      );
  }
  const actualOmittedImagePaths = [...sourceImages.keys()].filter(
    (imageKey) => !displayedImagePaths.has(imageKey),
  );
  const undeclaredOmissions = actualOmittedImagePaths.filter(
    (imageKey) => !declaredOmissionPaths.has(imageKey),
  );
  if (undeclaredOmissions.length)
    errors.push(
      `images source omises sans justification (${undeclaredOmissions.join(", ")})`,
    );
  const staleOmissionDeclarations = [...declaredOmissionPaths].filter(
    (imageKey) => !actualOmittedImagePaths.includes(imageKey),
  );
  if (staleOmissionDeclarations.length)
    errors.push(
      `déclarations d'omission sans image effectivement omise (${staleOmissionDeclarations.join(", ")})`,
    );
  const n2Ratio = totalRows ? n2Rows / totalRows : 0;
  if (n2Ratio < 0.25 || n2Ratio > 0.55)
    errors.push(`hiérarchie N+2 déséquilibrée : ${n2Rows}/${totalRows} lignes`);
  if (n2Sections < 10)
    errors.push(
      `hiérarchie N+2 trop localisée : ${n2Sections} sous-parties seulement`,
    );
  if (flatRows <= n2Rows)
    errors.push(
      `les lignes N+1 simples doivent rester majoritaires : ${flatRows} simples / ${n2Rows} hiérarchisées`,
    );
  if (
    !asArray(model.synthesis?.tables).length ||
    asArray(model.synthesis.tables).length > 5
  )
    errors.push("synthèse : 1-5 tableaux attendus");
  if (
    asArray(model.synthesis?.keyPoints).length < 6 ||
    asArray(model.synthesis?.keyPoints).length > 8
  )
    errors.push("synthèse : 6-8 points clés attendus");
  if (!asArray(model.synthesis?.eclair).length)
    errors.push("fiche éclair absente");
  if ((figureCount < 7 || figureCount > 20) && !model.imageException?.reason)
    errors.push(
      `figures = ${figureCount}, attendu 7-20 ou une exception motivée`,
    );
  const declaredSourceBlocks = new Set(asArray(model.sourceBlocks));
  const undeclaredVisibleBlocks = [...visibleSourceBlocks].filter(
    (id) => !declaredSourceBlocks.has(id),
  );
  const invisibleDeclaredBlocks = [...declaredSourceBlocks].filter(
    (id) => !visibleSourceBlocks.has(id),
  );
  if (undeclaredVisibleBlocks.length || invisibleDeclaredBlocks.length) {
    errors.push(
      `provenance globale incohérente : ${undeclaredVisibleBlocks.length} bloc(s) visible(s) non déclaré(s), ${invisibleDeclaredBlocks.length} bloc(s) déclaré(s) sans contenu visible`,
    );
  }
  return {
    errors,
    figureCount,
    n2Rows,
    flatRows,
    n2Sections,
    displayedImagePaths: [...displayedImagePaths],
    omittedImagePaths: actualOmittedImagePaths,
  };
}

export function compileFicheModel(model, chapterDir) {
  const { errors } = validateFicheModel(model, chapterDir);
  if (errors.length)
    throw new Error(`Modèle de fiche invalide :\n- ${errors.join("\n- ")}`);
  const parts = model.parts;
  const plan = parts
    .map(
      (part, index) =>
        `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${index + 1}"><span class="cover-plan-num">${roman(index)}</span><span class="cover-plan-text">${inline(stripSourceNumbering(part.title))}</span></a></li>`,
    )
    .join("");
  // Au-delà d'un titre court, employer la composition compacte : elle laisse
  // une véritable colonne au logo et évite toute collision sur la couverture.
  const longestTitleWord = Math.max(
    0,
    ...String(model.title)
      .split(/[\s’'-]+/)
      .map((word) => word.length),
  );
  const titleClass = [
    "cover-title",
    model.title.length > 35 ? "cover-title--long" : "",
    longestTitleWord > 17 ? "cover-title--long-word" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const coverTitle = inline(model.title)
    .replace(/\s+:/g, "&nbsp;:")
    .replace(/\s+;/g, "&nbsp;;")
    .replace(/\s+!/g, "&nbsp;!")
    .replace(/\s+\?/g, "&nbsp;?");
  const cover = `<div class="page-watermark"><img src="__WATERMARK__" alt=""></div><span class="string-source string-source--cours">${inline(model.title)}</span><span class="string-source string-source--footer">Major ECN&nbsp;&middot;&nbsp;${inline(model.year || "2025-2026")}</span><section class="cover"><div class="cover-band"></div><div class="cover-content"><div class="cover-head"><img class="cover-logo" src="__LOGO__" alt="Major ECN"><div class="cover-matiere">${inline(model.matiere || "Orthopédie")}</div><h1 class="${titleClass}">${coverTitle}</h1><div class="cover-year">Année&nbsp;${inline(model.year || "2025-2026")}</div><div class="cover-item">${inline(model.coverSubtitle || "")}</div></div><div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${plan}</ol></div></div></section>`;
  const body = parts
    .map((part, partIndex) => {
      const number = roman(partIndex);
      const tables = part.sections
        .map((section, sectionIndex) => {
          const letter = String.fromCharCode(65 + sectionIndex);
          const requestedChunks = asArray(section.renderChunks).map(Number);
          const chunked =
            requestedChunks.length > 0 &&
            requestedChunks.every(
              (size) => Number.isInteger(size) && size > 0,
            ) &&
            requestedChunks.reduce((sum, size) => sum + size, 0) ===
              section.rows.length;
          let offset = 0;
          const rowChunks = chunked
            ? requestedChunks.map((size) => {
                const rows = section.rows.slice(offset, offset + size);
                offset += size;
                return rows;
              })
            : [section.rows];
          return rowChunks
            .map((rows, chunkIndex) => {
              const repeated = sectionIndex > 0 || chunkIndex > 0;
              const repeatClass = repeated
                ? " partie-banner-title--repeat"
                : "";
              const subtitleRepeatClass =
                chunkIndex > 0 ? " ft-subtitle-text--repeat" : "";
              const banner = `<tr class="ft-banner-row"><td colspan="2"><span class="partie-banner-num">${number}</span><span class="partie-banner-title${repeatClass}">${inline(stripSourceNumbering(part.title))}</span></td></tr>`;
              const tableClass = chunked
                ? "fiche-table fiche-table--manual-pages"
                : "fiche-table";
              return `<table class="${tableClass}"><colgroup><col class="ft-col-concept"><col class="ft-col-detail"></colgroup><thead>${banner}<tr class="ft-head-row"><th class="ft-tag">${number}</th><th class="ft-subtitle"><span class="ft-subtitle-text${subtitleRepeatClass}">${letter}.&nbsp;&nbsp;${inline(stripSourceNumbering(section.title))}</span></th></tr></thead><tbody>${rows.map((row) => renderRow(row, chapterDir)).join("")}</tbody></table>`;
            })
            .join("");
        })
        .join("");
      return `<section class="partie-page${partIndex === 0 ? " partie-page--first" : ""}" id="partie-${partIndex + 1}">${tables}</section>`;
    })
    .join("");
  const tableHtml = (table, className = "table-synthese") =>
    `<div class="${className} content"><table><thead><tr>${asArray(
      table.headers,
    )
      .map((header) => `<th>${inline(header)}</th>`)
      .join("")}</tr></thead><tbody>${asArray(table.rows)
      .map(
        (row) =>
          `<tr>${asArray(row)
            .map((cell) => `<td>${inline(cell)}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</tbody></table></div>`;
  const chiffres = model.synthesis.chiffres
    ? `<div class="synthese-bloc"><h3 class="synthese-titre">Chiffres-clés à connaître</h3>${tableHtml(model.synthesis.chiffres, "table-synthese table-chiffres")}</div>`
    : "";
  const tables = asArray(model.synthesis.tables)
    .map(
      (table) =>
        `<div class="synthese-bloc"><h3 class="synthese-titre">${inline(table.title)}</h3>${tableHtml(table)}</div>`,
    )
    .join("");
  // Reprise exacte de la structure du gabarit major-ecn-fiche : bannière de
  // synthèse, bloc chiffres-clés, tableaux, puis page éclair indépendante.
  const eclair = `<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">${inline(model.title)}</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list">${model.synthesis.eclair.map((point) => `<li>${inline(point)}</li>`).join("")}</ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points">${model.synthesis.keyPoints.map((point) => `<li>${inline(point)}</li>`).join("")}</ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;${inline(model.year || "2025-2026")}</div></div></div></section>`;
  const synthesisClass = model.synthesis.compactLayout
    ? "page synthese-page synthese-page--compact"
    : "page synthese-page";
  const synthesis = `<section class="${synthesisClass}"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div>${chiffres}${tables}</section>${eclair}`;
  return `${cover}${body}${synthesis}`;
}

export function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
