import type { Country } from '../types';
import { DETAILED_COUNTRIES } from './detailed';
import { expandCompact } from './compact';
import { EUROPE_BASELINE } from './baseline-europe';
import { ASIA_BASELINE } from './baseline-asia';
import { AFRICA_BASELINE } from './baseline-africa';
import { AMERICAS_OCEANIA_BASELINE } from './baseline-americas-oceania';
import { DISPUTED_NOTES } from '../lib/disputed';

/**
 * Full world dataset = ~30 high-detail curated countries + ~130 compact baseline countries.
 * Detailed records take precedence over compact baselines if there's an ISO-3 collision.
 * Disputed-territory caveats are layered in via lib/disputed.ts.
 */

const baselineExpanded: Country[] = [
  ...EUROPE_BASELINE,
  ...ASIA_BASELINE,
  ...AFRICA_BASELINE,
  ...AMERICAS_OCEANIA_BASELINE,
].map(expandCompact);

const detailedSet = new Set(DETAILED_COUNTRIES.map((c) => c.iso3));

const merged: Country[] = [
  ...DETAILED_COUNTRIES,
  ...baselineExpanded.filter((c) => !detailedSet.has(c.iso3)),
];

// Layer in disputed notes
export const COUNTRIES: Country[] = merged.map((c) =>
  DISPUTED_NOTES[c.iso3] ? { ...c, disputedNote: DISPUTED_NOTES[c.iso3] } : c
);
