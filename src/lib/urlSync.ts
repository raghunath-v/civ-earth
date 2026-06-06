import type { YieldKey } from '../types';

export interface ParsedHash {
  iso3: string | null;
  compare: string | null;
  yield: YieldKey | 'civScore' | null;
}

const YIELD_KEYS_SET = new Set([
  'gold', 'science', 'culture', 'production', 'food', 'faith', 'amenity', 'military', 'civScore',
]);

export function parseHash(): ParsedHash {
  const hash = location.hash.slice(1); // strip leading #
  if (!hash.startsWith('/c/')) return { iso3: null, compare: null, yield: null };

  const [path, qs = ''] = hash.split('?');
  const iso3 = path.replace('/c/', '').toUpperCase() || null;
  const params = new URLSearchParams(qs);

  const compare = params.get('compare')?.toUpperCase() ?? null;
  const yieldParam = params.get('yield');
  const yieldVal = yieldParam && YIELD_KEYS_SET.has(yieldParam)
    ? (yieldParam as YieldKey | 'civScore')
    : null;

  return { iso3, compare, yield: yieldVal };
}

export function writeHash(iso3: string | null, compare: [string | null, string | null], yieldKey: string | null) {
  if (!iso3) {
    history.replaceState(null, '', location.pathname + location.search);
    return;
  }
  const params = new URLSearchParams();
  const compareVal = compare.find((c) => c && c !== iso3);
  if (compareVal) params.set('compare', compareVal);
  if (yieldKey) params.set('yield', yieldKey);
  const qs = params.toString();
  history.replaceState(null, '', `#/c/${iso3}${qs ? '?' + qs : ''}`);
}
