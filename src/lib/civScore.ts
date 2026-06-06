import type { Country, YieldKey, YieldValue } from '../types';
import { YIELD_KEYS, YIELD_META } from '../types';

/**
 * Two-pass:
 *   1. z-score normalize each yield across all countries
 *   2. Weighted average → min-max scale to 0-1000 (Civ Score)
 *   3. Also compute per-yield rank + percentile across all countries
 *
 * Returns a new array; original input is not mutated.
 */
export function computeCivScores(countries: Country[]): Country[] {
  const means: Record<YieldKey, number> = {} as never;
  const stds: Record<YieldKey, number> = {} as never;

  for (const k of YIELD_KEYS) {
    const vals = countries.map((c) => transform(k, c.yields[k].value));
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    const v = vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length;
    means[k] = m;
    stds[k] = Math.sqrt(v) || 1;
  }

  // Per-yield rank + percentile: sort descending by raw value, assign rank
  const yieldRank: Record<YieldKey, Map<string, { rank: number; percentile: number }>> = {} as never;
  const N = countries.length;
  for (const k of YIELD_KEYS) {
    const sorted = [...countries].sort((a, b) => b.yields[k].value - a.yields[k].value);
    const map = new Map<string, { rank: number; percentile: number }>();
    sorted.forEach((c, i) => {
      const rank = i + 1;
      const percentile = Math.round(((N - i) / N) * 100);
      map.set(c.iso3, { rank, percentile });
    });
    yieldRank[k] = map;
  }

  // Per-country: weighted average of z-scores; then min-max scale 0-1000.
  const weightedZ = countries.map((c) => {
    const yz: Record<YieldKey, number> = {} as never;
    let wsum = 0;
    let acc = 0;
    for (const k of YIELD_KEYS) {
      const z = (transform(k, c.yields[k].value) - means[k]) / stds[k];
      yz[k] = z;
      acc += z * YIELD_META[k].weight;
      wsum += YIELD_META[k].weight;
    }
    return { c, raw: acc / wsum, yz };
  });

  const raws = weightedZ.map((x) => x.raw);
  const minR = Math.min(...raws);
  const maxR = Math.max(...raws);
  const range = maxR - minR || 1;

  return weightedZ.map(({ c, raw, yz }) => {
    const yields: Record<YieldKey, YieldValue> = { ...c.yields };
    for (const k of YIELD_KEYS) {
      const r = yieldRank[k].get(c.iso3);
      yields[k] = { ...c.yields[k], rank: r?.rank, percentile: r?.percentile };
    }
    return {
      ...c,
      yields,
      civScore: Math.round(((raw - minR) / range) * 1000),
      yieldZ: yz,
    };
  });
}

function transform(k: YieldKey, v: number): number {
  if (k === 'amenity' || k === 'faith') return v;
  return Math.log10(Math.max(v, 1));
}
