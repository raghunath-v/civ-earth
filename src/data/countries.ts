import type { Country } from '../types';
import { DETAILED_COUNTRIES } from './detailed';
import { expandCompact } from './compact';
import { EUROPE_BASELINE } from './baseline-europe';
import { ASIA_BASELINE } from './baseline-asia';
import { AFRICA_BASELINE } from './baseline-africa';
import { AMERICAS_OCEANIA_BASELINE } from './baseline-americas-oceania';

/**
 * Full world dataset = ~30 high-detail curated countries + ~130 compact baseline countries.
 * Detailed records take precedence over compact baselines if there's an ISO-3 collision.
 */

const baselineExpanded: Country[] = [
  ...EUROPE_BASELINE,
  ...ASIA_BASELINE,
  ...AFRICA_BASELINE,
  ...AMERICAS_OCEANIA_BASELINE,
].map(expandCompact);

const detailedSet = new Set(DETAILED_COUNTRIES.map((c) => c.iso3));

export const COUNTRIES: Country[] = [
  ...DETAILED_COUNTRIES,
  ...baselineExpanded.filter((c) => !detailedSet.has(c.iso3)),
];
