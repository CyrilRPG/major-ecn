// Cœur du rééquilibrage des profils de réponses, partagé par le planificateur
// et le générateur de briefs. Aucune entrée/sortie, aucun contenu médical :
// l'algorithme ne fait qu'attribuer des profils de lettres aux questions.
const LETTERS = 'ABCDE';
const popcount = (mask) => Array.from({ length: 5 }, (_, bit) => (mask >> bit) & 1).reduce((sum, value) => sum + value, 0);
const combinations = (count) => Array.from({ length: 32 }, (_, mask) => mask).filter((mask) => popcount(mask) === count);
const maskLetters = (mask) => [...LETTERS].filter((_, bit) => mask & (1 << bit)).join('');

function targetMasks(numero) {
  const extra = ((numero - 1) % 5) + 1;
  const options = [];
  for (let count = 1; count <= 5; count += 1) {
    const total = 19 + Number(count === extra);
    const values = combinations(count);
    const base = Math.floor(total / values.length);
    const remainder = total % values.length;
    const subsets = [];
    const choose = (start, left, selected) => {
      if (!left) { subsets.push([...selected]); return; }
      for (let index = start; index <= values.length - left; index += 1) {
        selected.push(index);
        choose(index + 1, left - 1, selected);
        selected.pop();
      }
    };
    choose(0, remainder, []);
    options.push(subsets.map((selected) => {
      const selectedSet = new Set(selected);
      const masks = values.flatMap((mask, index) => Array(base + Number(selectedSet.has(index))).fill(mask));
      const frequencies = Array(5).fill(0);
      for (const mask of masks) for (let bit = 0; bit < 5; bit += 1) frequencies[bit] += Number(Boolean(mask & (1 << bit)));
      return { masks, frequencies };
    }));
  }
  let best;
  const walk = (countIndex, chosen, frequencies) => {
    if (countIndex === 5) {
      const spread = Math.max(...frequencies) - Math.min(...frequencies);
      const mean = frequencies.reduce((sum, value) => sum + value, 0) / 5;
      const variance = frequencies.reduce((sum, value) => sum + ((value - mean) ** 2), 0);
      const score = spread * 10_000 + variance;
      if (!best || score < best.score) best = { score, chosen: [...chosen], frequencies: [...frequencies] };
      return;
    }
    for (const option of options[countIndex]) {
      walk(countIndex + 1, [...chosen, option], frequencies.map((value, index) => value + option.frequencies[index]));
    }
  };
  walk(0, [], Array(5).fill(0));
  return best.chosen.flatMap((entry) => entry.masks);
}

function assignMasks(current, targets) {
  const size = current.length;
  const u = Array(size + 1).fill(0);
  const v = Array(size + 1).fill(0);
  const p = Array(size + 1).fill(0);
  const way = Array(size + 1).fill(0);
  for (let row = 1; row <= size; row += 1) {
    p[0] = row;
    let column0 = 0;
    const min = Array(size + 1).fill(Infinity);
    const used = Array(size + 1).fill(false);
    do {
      used[column0] = true;
      const row0 = p[column0];
      let delta = Infinity;
      let column1 = 0;
      for (let column = 1; column <= size; column += 1) if (!used[column]) {
        const flips = popcount(current[row0 - 1] ^ targets[column - 1]);
        const tieBreaker = ((row0 * 37 + column * 17) % 101) / 10_000;
        const cost = flips + tieBreaker - u[row0] - v[column];
        if (cost < min[column]) { min[column] = cost; way[column] = column0; }
        if (min[column] < delta) { delta = min[column]; column1 = column; }
      }
      for (let column = 0; column <= size; column += 1) {
        if (used[column]) { u[p[column]] += delta; v[column] -= delta; }
        else min[column] -= delta;
      }
      column0 = column1;
    } while (p[column0] !== 0);
    do {
      const column1 = way[column0];
      p[column0] = p[column1];
      column0 = column1;
    } while (column0);
  }
  const assigned = Array(size);
  for (let column = 1; column <= size; column += 1) assigned[p[column] - 1] = targets[column - 1];
  return assigned;
}

// Réparation de la diversité des séries. Les masques cibles sont seulement
// permutés entre questions : cardinalités, lettres et profils restent intacts.
const SERIES_SIZES = [5, 5, 5, 5, 5, 5, 5, 5, 7, 7, 7, 7, 7, 7, 7, 7];
const seriesRanges = (() => {
  const ranges = [];
  let start = 0;
  for (const size of SERIES_SIZES) { ranges.push([start, start + size]); start += size; }
  return ranges;
})();

function diversityPenalty(masks) {
  let penalty = 0;
  const seen = new Map();
  for (const [start, end] of seriesRanges) {
    const sequence = masks.slice(start, end).map(popcount);
    const frequencies = new Map();
    for (const value of sequence) frequencies.set(value, (frequencies.get(value) || 0) + 1);
    if (frequencies.size < 3) penalty += 1;
    const peak = Math.max(...frequencies.values());
    if (peak > 3) penalty += peak - 3;
    const key = sequence.join("-");
    if (seen.has(key)) penalty += 1; else seen.set(key, true);
  }
  return penalty;
}

function repairDiversity(masks, current) {
  const flipsFor = (index, mask) => popcount(current[index] ^ mask);
  let best = masks.slice();
  let bestPenalty = diversityPenalty(best);
  let bestFlips = best.reduce((sum, mask, index) => sum + flipsFor(index, mask), 0);
  for (let pass = 0; pass < 400 && bestPenalty > 0; pass += 1) {
    let improved = false;
    for (let left = 0; left < best.length && !improved; left += 1) {
      for (let right = left + 1; right < best.length; right += 1) {
        if (popcount(best[left]) === popcount(best[right])) continue;
        const candidate = best.slice();
        candidate[left] = best[right];
        candidate[right] = best[left];
        const penalty = diversityPenalty(candidate);
        const flips = candidate.reduce((sum, mask, index) => sum + flipsFor(index, mask), 0);
        if (penalty < bestPenalty || (penalty === bestPenalty && flips < bestFlips)) {
          best = candidate; bestPenalty = penalty; bestFlips = flips; improved = true; break;
        }
      }
    }
    if (!improved) break;
  }
  return { masks: best, penalty: bestPenalty };
}

export { LETTERS, popcount, combinations, maskLetters, targetMasks, assignMasks, diversityPenalty, repairDiversity, SERIES_SIZES };
