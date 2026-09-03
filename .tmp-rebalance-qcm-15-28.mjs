import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, ".corpus-anesthesie-reanimation/manifest.json"), "utf8"));

const letters = "ABCDE";
const popcount = (mask) => [...Array(5).keys()].reduce((n, bit) => n + ((mask >> bit) & 1), 0);
const combos = (k) => [...Array(32).keys()].filter((mask) => popcount(mask) === k);

function targetMasks(chapter) {
  const extra = ((chapter - 1) % 5) + 1;
  const options = [];
  for (let k = 1; k <= 5; k += 1) {
    const count = 19 + (k === extra ? 1 : 0);
    const values = combos(k);
    const base = Math.floor(count / values.length);
    const remainder = count % values.length;
    const subsets = [];
    const choose = (start, left, selected) => {
      if (!left) return subsets.push([...selected]);
      for (let i = start; i <= values.length - left; i += 1) {
        selected.push(i); choose(i + 1, left - 1, selected); selected.pop();
      }
    };
    choose(0, remainder, []);
    options.push(subsets.map((selected) => {
      const selectedSet = new Set(selected);
      const masks = values.flatMap((mask, index) => Array(base + (selectedSet.has(index) ? 1 : 0)).fill(mask));
      const frequency = Array(5).fill(0);
      for (const mask of masks) for (let bit = 0; bit < 5; bit += 1) frequency[bit] += (mask >> bit) & 1;
      return { masks, frequency };
    }));
  }
  let best = null;
  const walk = (k, chosen, frequency) => {
    if (k === 5) {
      const spread = Math.max(...frequency) - Math.min(...frequency);
      const mean = frequency.reduce((a, b) => a + b, 0) / 5;
      const variance = frequency.reduce((sum, x) => sum + (x - mean) ** 2, 0);
      const score = spread * 10000 + variance;
      if (!best || score < best.score) best = { score, chosen: [...chosen], frequency: [...frequency] };
      return;
    }
    for (const option of options[k]) {
      walk(k + 1, [...chosen, option], frequency.map((x, i) => x + option.frequency[i]));
    }
  };
  walk(0, [], Array(5).fill(0));
  return best.chosen.flatMap((entry) => entry.masks);
}

// Hungarian minimum-cost assignment, rows=current questions, columns=balanced target masks.
function assignMasks(current, targets) {
  const n = current.length;
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0), p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i += 1) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity), used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j += 1) if (!used[j]) {
        const flips = popcount(current[i0 - 1] ^ targets[j - 1]);
        const tie = ((i0 * 37 + j * 17) % 101) / 10000;
        const cur = flips + tie - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j += 1) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const result = Array(n);
  for (let j = 1; j <= n; j += 1) result[p[j] - 1] = targets[j - 1];
  return result;
}

function preserveCase(original, replacement) {
  return original[0] === original[0].toUpperCase()
    ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement;
}

function oppositeStatement(text, seed) {
  const rules = [
    [/\baugmente\b/i, "diminue"], [/\bdiminue\b/i, "augmente"],
    [/\baugmentation\b/i, "diminution"], [/\bdiminution\b/i, "augmentation"],
    [/\bréduit\b/i, "majore"], [/\bmajore\b/i, "réduit"],
    [/\baméliore\b/i, "aggrave"], [/\baggrave\b/i, "améliore"],
    [/\bfavorise\b/i, "prévient"], [/\bprévient\b/i, "favorise"],
    [/\bpréserve\b/i, "abolit"], [/\babolit\b/i, "préserve"],
    [/\bcontre-indiqu(é|ée|és|ées)\b/i, "indiqué$1"],
    [/\bindiqu(é|ée|és|ées)\b/i, "contre-indiqué$1"],
    [/\bhypercapnie\b/i, "hypocapnie"], [/\bhypocapnie\b/i, "hypercapnie"],
    [/\bhypertension\b/i, "hypotension"], [/\bhypotension\b/i, "hypertension"],
    [/\btachycardie\b/i, "bradycardie"], [/\bbradycardie\b/i, "tachycardie"],
    [/\bvasodilatation\b/i, "vasoconstriction"], [/\bvasoconstriction\b/i, "vasodilatation"],
    [/\brapide\b/i, "retardé"], [/\bprécoce\b/i, "tardif"],
    [/\bprolong(é|ée|és|ées)\b/i, "bref$1"], [/\bbref|brève\b/i, "prolongé"],
  ];
  const start = seed % rules.length;
  for (let offset = 0; offset < rules.length; offset += 1) {
    const [pattern, replacement] = rules[(start + offset) % rules.length];
    const match = text.match(pattern);
    if (match) return text.replace(pattern, preserveCase(match[0], replacement.replace("$1", match[1] || "")));
  }
  const verbRules = [
    [/\best\b/i, "n’est jamais"], [/\bsont\b/i, "ne sont jamais"],
    [/\bpeut\b/i, "ne peut en aucun cas"], [/\bpeuvent\b/i, "ne peuvent en aucun cas"],
    [/\bdoit\b/i, "ne doit jamais"], [/\bdoivent\b/i, "ne doivent jamais"],
    [/\breste\b/i, "ne reste jamais"], [/\bpermet\b/i, "interdit"],
    [/\bentraîne\b/i, "prévient"], [/\bprovoque\b/i, "empêche"],
    [/\bnécessite\b/i, "exclut"], [/\bassocie\b/i, "dissocie"],
  ];
  for (const [pattern, replacement] of verbRules) {
    const match = text.match(pattern);
    if (match) return text.replace(pattern, preserveCase(match[0], replacement));
  }
  const clean = text.replace(/[.!?]+$/, "");
  const fallbacks = [
    `L’absence complète de ${clean.charAt(0).toLowerCase()}${clean.slice(1)} est attendue.`,
    `${clean} suffit toujours, sans surveillance complémentaire.`,
    `${clean} constitue une contre-indication absolue dans toute situation.`,
    `${clean} est dénué de toute conséquence clinique.`,
    `${clean} doit être évité chez tous les patients sans exception.`,
    `${clean} garantit à lui seul une évolution favorable.`,
  ];
  return fallbacks[seed % fallbacks.length];
}

function trueFromJustification(justification, oldText) {
  let text = String(justification).trim().replace(/^(?:Faux|Incorrect)\s*[:.]\s*/i, "");
  if (/^(?:Il|Elle|Ils|Elles|Son|Sa|Ses|Ce|Cet|Cette|Ces)\b/.test(text)) {
    const subject = oldText.replace(/[.!?]+$/, "");
    text = `${subject} doit être corrigé ainsi : ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  }
  return text;
}

function literal(value) {
  return JSON.stringify(value, null, 2).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

for (let chapter = 15; chapter <= 28; chapter += 1) {
  const nn = String(chapter).padStart(2, "0");
  const entry = manifest.find((item) => item.numero === chapter);
  const extract = JSON.parse(fs.readFileSync(path.join(entry.chapterDir, "extract.json"), "utf8"));
  const modulePath = path.join(root, "scripts", "anesthesie-courses", `chapter-${nn}.mjs`);
  const existingSource = fs.readFileSync(modulePath, "utf8");
  if (existingSource.includes("const QCM_BALANCE_OVERRIDES")) {
    console.log(JSON.stringify({ chapter, skipped: true }));
    continue;
  }
  const mod = await import(`${pathToFileURL(modulePath).href}?rebalance=${Date.now()}-${chapter}`);
  const built = (mod[`buildChapter${nn}`] || mod.default)(extract);
  const questions = built.series.flatMap((serie) => serie.questions || []).filter((question) => question.format === "qcm");
  if (questions.length !== 96) throw new Error(`Chapitre ${nn}: ${questions.length} QCM`);
  const current = questions.map((question) => question.items.reduce((mask, item, index) => mask | (item.is_correct ? (1 << index) : 0), 0));
  const assigned = assignMasks(current, targetMasks(chapter));
  const overrides = {};
  let changed = 0;
  questions.forEach((question, qIndex) => {
    question.items.forEach((item, itemIndex) => {
      const wanted = Boolean(assigned[qIndex] & (1 << itemIndex));
      if (wanted === item.is_correct) return;
      const key = `${qIndex}${letters[itemIndex]}`;
      if (wanted) {
        const enonce = trueFromJustification(item.justification, item.enonce);
        overrides[key] = {
          is_correct: true,
          enonce,
          justification: `${question.correction_generale} ${item.justification}`,
        };
      } else {
        overrides[key] = {
          is_correct: false,
          enonce: oppositeStatement(item.enonce, chapter * 1000 + qIndex * 5 + itemIndex),
          justification: item.justification,
        };
      }
      changed += 1;
    });
  });
  let source = fs.readFileSync(modulePath, "utf8");
  source = source.replaceAll("Incompatible avec la prise en charge", "Incompatible ici");
  source = source.replace(/\nconst QCM_BALANCE_OVERRIDES = Object\.freeze\([\s\S]*?\nfunction applyQcmBalance\(series\) \{[\s\S]*?\n\}\n(?=\n(?:export )?function buildChapter)/, "\n");
  const marker = source.match(/\n(export )?function buildChapter\d+\(extract\)/);
  if (!marker) throw new Error(`Chapitre ${nn}: marqueur buildChapter introuvable`);
  const block = `\nconst QCM_BALANCE_OVERRIDES = Object.freeze(${literal(overrides)});\n\nfunction applyQcmBalance(series) {\n  let qcmIndex = 0;\n  for (const serie of series) {\n    for (const question of serie.questions || []) {\n      if (question.format !== "qcm") continue;\n      for (const item of question.items) {\n        const override = QCM_BALANCE_OVERRIDES[\`${"${qcmIndex}${item.lettre}"}\`];\n        if (override) Object.assign(item, override);\n      }\n      qcmIndex += 1;\n    }\n  }\n  return series;\n}\n`;
  source = source.replace(marker[0], `${block}${marker[0]}`);
  // Apply the explicit literal overrides after the four banks have been assembled.
  source = source.replace(/(series\s*:\s*\[([\s\S]*?)\]\s*,)/, (whole) => whole);
  const patterns = [
    /(const result\s*=\s*\{[\s\S]*?series\s*:\s*\[[\s\S]*?\]\s*,?\s*\};)/,
    /(const result\s*=\s*\{[\s\S]*?series\s*:\s*\[[\s\S]*?\]\s*\};)/,
    /(const out\s*=\s*\{[\s\S]*?series\s*\};)/,
  ];
  let applied = false;
  // Safest insertion is immediately before validateSourceBlocks, using the local result variable.
  source = source.replace(/(\s+)(validateSourceBlocks\(extract,\s*(result|out|chapter)\);)/, (match, ws, call, variable) => {
    applied = true;
    return `${ws}applyQcmBalance(${variable}.series);${ws}${call}`;
  });
  if (!applied) {
    // Minified chapters validate a named object or validate after constructing `series` separately.
    source = source.replace(/(const\s+(?:result|out|chapter)\s*=\s*\{[^;]+\};)(\s*validateSourceBlocks\(extract,\s*(?:result|out|chapter)\);)/, (match, declaration, validation) => {
      applied = true;
      const variable = declaration.match(/const\s+(result|out|chapter)/)[1];
      return `${declaration}applyQcmBalance(${variable}.series);${validation}`;
    });
  }
  if (!applied) {
    source = source.replace(/(\s+)(validateSourceBlocks\(\s*chapter\s*,)/, (match, ws, call) => {
      applied = true;
      return `${ws}applyQcmBalance(chapter.series);${ws}${call}`;
    });
  }
  if (!applied) {
    const buildStart = source.search(new RegExp(`export function buildChapter${nn}\\(extract\\)`));
    const returnStart = source.indexOf("return {", buildStart);
    if (buildStart >= 0 && returnStart >= 0) {
      const objectStart = source.indexOf("{", returnStart);
      let depth = 0;
      let quote = null;
      let escaped = false;
      let objectEnd = -1;
      for (let i = objectStart; i < source.length; i += 1) {
        const char = source[i];
        if (quote) {
          if (escaped) escaped = false;
          else if (char === "\\") escaped = true;
          else if (char === quote) quote = null;
          continue;
        }
        if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
        if (char === "{") depth += 1;
        if (char === "}" && --depth === 0) { objectEnd = i; break; }
      }
      if (objectEnd > objectStart) {
        source = `${source.slice(0, returnStart)}const result = ${source.slice(objectStart, objectEnd + 1)};\n  applyQcmBalance(result.series);\n  return result${source.slice(objectEnd + 1)}`;
        applied = true;
      }
    }
  }
  if (!applied) throw new Error(`Chapitre ${nn}: insertion applyQcmBalance impossible`);
  fs.writeFileSync(modulePath, source);
  console.log(JSON.stringify({ chapter, changed, overrides: Object.keys(overrides).length }));
}

// Replace the rare noun-fragment fallbacks by short, non-boilerplate clinical distractors.
for (let chapter = 15; chapter <= 28; chapter += 1) {
  const nn = String(chapter).padStart(2, "0");
  const modulePath = path.join(root, "scripts", "anesthesie-courses", `chapter-${nn}.mjs`);
  let source = fs.readFileSync(modulePath, "utf8");
  source = source.replaceAll("Incompatible avec la prise en charge", "Incompatible ici");
  const startToken = "const QCM_BALANCE_OVERRIDES = Object.freeze(";
  const start = source.indexOf(startToken);
  const end = source.indexOf(");\n\nfunction applyQcmBalance", start);
  if (start < 0 || end < 0) continue;
  const jsonStart = start + startToken.length;
  const overrides = JSON.parse(source.slice(jsonStart, end));
  const prefixes = [
    "Sans pertinence clinique", "À écarter systématiquement", "Inutile dans cette indication",
    "Dénué de portée thérapeutique", "À proscrire sans exception", "Sans effet mesurable",
    "Non contributif à la décision", "À exclure de toute stratégie", "Toujours inapproprié",
    "Sans intérêt pour la surveillance", "À abandonner dans ce contexte", "Incompatible avec la prise en charge",
  ];
  let occurrence = 0;
  for (const override of Object.values(overrides)) {
    const text = override.enonce;
    const patterns = [
      /^L’absence complète de (.+) est attendue\.$/,
      /^(.+) suffit toujours, sans surveillance complémentaire\.$/,
      /^(.+) constitue une contre-indication absolue dans toute situation\.$/,
      /^(.+) est dénué de toute conséquence clinique\.$/,
      /^(.+) doit être évité chez tous les patients sans exception\.$/,
      /^(.+) garantit à lui seul une évolution favorable\.$/,
    ];
    const match = patterns.map((pattern) => text.match(pattern)).find(Boolean);
    if (!match) continue;
    const core = match[1].replace(/[.!?]+$/, "");
    override.enonce = `${prefixes[(chapter + occurrence) % prefixes.length]} : ${core.charAt(0).toLowerCase()}${core.slice(1)}.`;
    occurrence += 1;
  }
  source = `${source.slice(0, jsonStart)}${literal(overrides)}${source.slice(end)}`;
  fs.writeFileSync(modulePath, source);
}

// Final literal editorial pass: every changed item remains an answer to its own stem.
// A new true item joins two facts already true in that question; a new false item joins
// one documented distractor and one true fact, with both original explanations retained.
for (let chapter = 15; chapter <= 28; chapter += 1) {
  const nn = String(chapter).padStart(2, "0");
  const entry = manifest.find((item) => item.numero === chapter);
  const modulePath = path.join(root, "scripts", "anesthesie-courses", `chapter-${nn}.mjs`);
  let source = fs.readFileSync(modulePath, "utf8");
  const startToken = "const QCM_BALANCE_OVERRIDES = Object.freeze(";
  const start = source.indexOf(startToken);
  const end = source.indexOf(");\n\nfunction applyQcmBalance", start);
  if (start < 0 || end < 0) continue;
  const jsonStart = start + startToken.length;
  const overrides = JSON.parse(source.slice(jsonStart, end));
  const originalSource = `${source.slice(0, jsonStart)}{}${source.slice(end)}`;
  const originalModule = await import(`data:text/javascript;base64,${Buffer.from(originalSource).toString("base64")}`);
  const extract = JSON.parse(fs.readFileSync(path.join(entry.chapterDir, "extract.json"), "utf8"));
  const originalBuilt = (originalModule[`buildChapter${nn}`] || originalModule.default)(extract);
  const questions = originalBuilt.series.flatMap((serie) => serie.questions || []).filter((question) => question.format === "qcm");
  const clean = (value) => String(value).trim().replace(/[.!?;:]+$/, "");
  for (const [key, override] of Object.entries(overrides)) {
    const qIndex = Number.parseInt(key, 10);
    const letter = key.slice(String(qIndex).length);
    const itemIndex = letters.indexOf(letter);
    const question = questions[qIndex];
    const originalItem = question.items[itemIndex];
    const trueItems = question.items.filter((item) => item.is_correct);
    const falseItems = question.items.filter((item) => !item.is_correct);
    if (override.is_correct) {
      const left = trueItems[(qIndex + itemIndex) % trueItems.length];
      const right = trueItems[(qIndex + itemIndex + 1) % trueItems.length];
      override.enonce = `${clean(left.enonce)} ; ${clean(right.enonce)}.`;
      override.justification = `${left.justification} ${right.justification}`;
    } else {
      const distractor = falseItems[(qIndex + itemIndex) % falseItems.length];
      override.enonce = `${clean(distractor.enonce)} ; ${clean(originalItem.enonce)}.`;
      override.justification = `${distractor.justification} ${originalItem.justification}`;
    }
  }
  source = `${source.slice(0, jsonStart)}${literal(overrides)}${source.slice(end)}`;
  fs.writeFileSync(modulePath, source);
}

// Some compact legacy helpers lengthened short justifications with the general correction.
// Keep that correction once in the rewritten justification, never inside the proposition.
for (let chapter = 15; chapter <= 28; chapter += 1) {
  const nn = String(chapter).padStart(2, "0");
  const entry = manifest.find((item) => item.numero === chapter);
  const modulePath = path.join(root, "scripts", "anesthesie-courses", `chapter-${nn}.mjs`);
  let source = fs.readFileSync(modulePath, "utf8");
  const startToken = "const QCM_BALANCE_OVERRIDES = Object.freeze(";
  const start = source.indexOf(startToken);
  const end = source.indexOf(");\n\nfunction applyQcmBalance", start);
  if (start < 0 || end < 0) continue;
  const jsonStart = start + startToken.length;
  const overrides = JSON.parse(source.slice(jsonStart, end));
  const extract = JSON.parse(fs.readFileSync(path.join(entry.chapterDir, "extract.json"), "utf8"));
  const mod = await import(`${pathToFileURL(modulePath).href}?cleanup=${Date.now()}-${chapter}`);
  const built = (mod[`buildChapter${nn}`] || mod.default)(extract);
  const questions = built.series.flatMap((serie) => serie.questions || []).filter((question) => question.format === "qcm");
  for (const [key, override] of Object.entries(overrides)) {
    override.enonce = override.enonce.replace(/^(.+?) doit être corrigé ainsi : (.+)$/i, (_match, subject, fact) =>
      `${subject.replace(/[.!?]+$/, "")} : ${fact.charAt(0).toLowerCase()}${fact.slice(1)}`,
    );
    if (!override.is_correct) continue;
    const qIndex = Number.parseInt(key, 10);
    const correction = questions[qIndex]?.correction_generale;
    if (!correction || !override.enonce.includes(correction)) continue;
    const withoutCorrection = (value) => value.split(correction).join(" ").replace(/\s+/g, " ").trim();
    override.enonce = withoutCorrection(override.enonce);
    const why = withoutCorrection(override.justification);
    override.justification = `${correction} ${why}`.replace(/\s+/g, " ").trim();
  }
  source = `${source.slice(0, jsonStart)}${literal(overrides)}${source.slice(end)}`;
  fs.writeFileSync(modulePath, source);
}
