import type { Country, YieldKey } from '../types';
import { YIELD_KEYS, YIELD_META } from '../types';

/**
 * Z-score normalize each yield across all countries, weight, average,
 * scale to 0-1000. Mutates copies; returns new array.
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

  // Per-country: weighted average of z-scores, then min-max scale 0-1000.
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

  return weightedZ.map(({ c, raw, yz }) => ({
    ...c,
    civScore: Math.round(((raw - minR) / range) * 1000),
    yieldZ: yz,
  }));
}

/** Most yields are log-distributed (GDP, manufacturing). Log-transform before z-scoring. */
function transform(k: YieldKey, v: number): number {
  if (k === 'amenity' || k === 'faith') return v; // already on bounded scales
  return Math.log10(Math.max(v, 1));
}
