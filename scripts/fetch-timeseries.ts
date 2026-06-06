/**
 * Fetches World Bank time-series data (2004-2024) for key Civ Earth yield indicators
 * and writes public/data/timeseries.json.
 *
 * Run: npm run refresh:timeseries
 * Requires: Node.js (no external deps beyond Node fetch which is built-in v18+)
 *
 * World Bank API: https://api.worldbank.org/v2/country/{ISO2}/indicator/{INDICATOR}
 *   No API key required. Rate limit: ~100 req/10 sec.
 *   We batch 10 countries at a time with 300ms delay between batches.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'data', 'timeseries.json');

const INDICATORS: Record<string, string> = {
  gold:       'NY.GDP.MKTP.CD',      // Nominal GDP (current USD)
  science:    'GB.XPD.RSDV.GD.ZS',  // R&D % GDP
  production: 'NV.IND.MANF.CD',     // Manufacturing VA (current USD)
  food:       'AG.PRD.CREL.MT',     // Cereal production (metric tonnes)
  military:   'MS.MIL.XPND.CD',    // Military expenditure (current USD)
  amenity:    'SP.DYN.LE00.IN',     // Life expectancy (proxy — WHR not on WB API)
};

// ISO-3 to ISO-2 for World Bank API
const ISO3_TO_ISO2: Record<string, string> = {
  USA:'US', CHN:'CN', IND:'IN', DEU:'DE', GBR:'GB', FRA:'FR', JPN:'JP', RUS:'RU',
  BRA:'BR', CAN:'CA', KOR:'KR', AUS:'AU', MEX:'MX', IDN:'ID', ITA:'IT', ESP:'ES',
  NLD:'NL', NOR:'NO', SWE:'SE', NZL:'NZ', ARG:'AR', ZAF:'ZA', EGY:'EG', NGA:'NG',
  KEN:'KE', ETH:'ET', SAU:'SA', ARE:'AE', ISR:'IL', PAK:'PK', VNM:'VN', TUR:'TR',
  IRN:'IR', POL:'PL', PRT:'PT', IRL:'IE', BEL:'BE', CHE:'CH', AUT:'AT', GRC:'GR',
  DNK:'DK', FIN:'FI', ISL:'IS', CZE:'CZ', HUN:'HU', ROU:'RO', BGR:'BG', HRV:'HR',
  UKR:'UA', BLR:'BY', SRB:'RS', CHL:'CL', COL:'CO', PER:'PE', VEN:'VE', ECU:'EC',
  BOL:'BO', PRY:'PY', URY:'UY', GUY:'GY', CRI:'CR', PAN:'PA', GTM:'GT', HND:'HN',
  NIC:'NI', SLV:'SV', CUB:'CU', DOM:'DO', JAM:'JM', TTO:'TT', THA:'TH', PHL:'PH',
  MYS:'MY', SGP:'SG', BGD:'BD', LKA:'LK', NPL:'NP', MMR:'MM', KHM:'KH', LAO:'LA',
  MNG:'MN', KAZ:'KZ', UZB:'UZ', AZE:'AZ', GEO:'GE', ARM:'AM', IRQ:'IQ', SYR:'SY',
  JOR:'JO', LBN:'LB', YEM:'YE', OMN:'OM', QAT:'QA', KWT:'KW', BHR:'BH', AFG:'AF',
  MAR:'MA', DZA:'DZ', TUN:'TN', LBY:'LY', SDN:'SD', GHA:'GH', CIV:'CI', SEN:'SN',
  CMR:'CM', COD:'CD', ZMB:'ZM', ZWE:'ZW', MOZ:'MZ', AGO:'AO', TZA:'TZ', UGA:'UG',
  RWA:'RW', BWA:'BW', NAM:'NA', MDG:'MG', MWI:'MW', MUS:'MU', MRT:'MR',
  NER:'NE', TCD:'TD', MLI:'ML', BFA:'BF', NGA:'NG', BEN:'BJ', TGO:'TG',
  LBR:'LR', SLE:'SL', GIN:'GN', SSD:'SS', ERI:'ER', SOM:'SO', DJI:'DJ',
  CAF:'CF', COG:'CG', GAB:'GA', GNQ:'GQ', BDI:'BI', GNB:'GW', LSO:'LS', SWZ:'SZ',
  PNG:'PG', FJI:'FJ', TWN:'TW', HKG:'HK', PRK:'KP',
};

type SeriesMap = Record<string, Record<string, [number, number | null][]>>;

async function fetchSeries(iso2: string, indicatorId: string): Promise<[number, number | null][]> {
  const url = `https://api.worldbank.org/v2/country/${iso2}/indicator/${indicatorId}?format=json&date=2004:2024&per_page=25&mrv=25`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  const data: { date: string; value: number | null }[] = json[1] ?? [];
  return data
    .filter((d) => d.value !== null)
    .map((d) => [parseInt(d.date, 10), d.value] as [number, number | null])
    .sort((a, b) => a[0] - b[0]);
}

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  const result: SeriesMap = {};
  const iso3s = Object.keys(ISO3_TO_ISO2);
  const indicatorKeys = Object.keys(INDICATORS);

  console.log(`Fetching ${iso3s.length} countries × ${indicatorKeys.length} indicators…`);
  let done = 0;
  const BATCH = 10;

  for (let i = 0; i < iso3s.length; i += BATCH) {
    const batch = iso3s.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (iso3) => {
        const iso2 = ISO3_TO_ISO2[iso3];
        if (!iso2) return;
        result[iso3] = {};
        for (const [key, indicatorId] of Object.entries(INDICATORS)) {
          const series = await fetchSeries(iso2, indicatorId);
          if (series.length > 0) result[iso3][key] = series;
        }
        done++;
        process.stdout.write(`\r  ${done}/${iso3s.length} countries`);
      })
    );
    if (i + BATCH < iso3s.length) await sleep(350); // rate-limit courtesy delay
  }

  console.log('\nWriting output…');
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 0));

  const size = (JSON.stringify(result).length / 1024).toFixed(0);
  console.log(`Done. ${OUT} (${size} KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
