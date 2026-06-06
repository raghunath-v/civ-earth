import { scaleSequential } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';
import type { Country, YieldKey } from '../types';
import { YIELD_META } from '../types';

/**
 * Build a color scale for a given yield, mapping that yield's z-scores
 * across all countries to a sequential color ramp anchored on the yield's
 * theme color.
 */
export function makeYieldColorScale(countries: Country[], yieldKey: YieldKey) {
  const zs = countries
    .map((c) => c.yieldZ?.[yieldKey])
    .filter((v): v is number => v !== undefined);
  if (!zs.length) return () => '#999';
  const min = Math.min(...zs);
  const max = Math.max(...zs);
  const color = YIELD_META[yieldKey].color;
  const scale = scaleSequential<string>(interpolateRgb('#2c3e50', color)).domain([min, max]);
  return (iso3: string) => {
    const c = countries.find((x) => x.iso3 === iso3);
    if (!c || c.yieldZ?.[yieldKey] === undefined) return '#2c3e50';
    return scale(c.yieldZ[yieldKey]);
  };
}

/** Civ Score map color (default mode) */
export function makeCivScoreColorScale(countries: Country[]) {
  const scores = countries
    .map((c) => c.civScore)
    .filter((v): v is number => v !== undefined);
  if (!scores.length) return () => '#999';
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const scale = scaleSequential<string>(interpolateRgb('#7a6a3a', '#f5d97a')).domain([min, max]);
  return (iso3: string) => {
    const c = countries.find((x) => x.iso3 === iso3);
    if (!c || c.civScore === undefined) return '#7a6a3a';
    return scale(c.civScore);
  };
}
