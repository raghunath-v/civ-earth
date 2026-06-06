import type { Country, YieldKey } from '../types';

/**
 * Returns a deep-link to an authoritative public source for a given fact about
 * a country. Used to render subtle ↗ link superscripts inline with stats.
 */

const worldBank = (iso3: string) => `https://data.worldbank.org/country/${iso3}`;
const restCountries = (iso3: string) => `https://restcountries.com/v3.1/alpha/${iso3}`;

const WHS_ISO2: Record<string, string> = {
  USA: 'us', CAN: 'ca', MEX: 'mx', BRA: 'br', ARG: 'ar', GBR: 'gb', FRA: 'fr', DEU: 'de',
  ITA: 'it', ESP: 'es', NLD: 'nl', NOR: 'no', SWE: 'se', RUS: 'ru', CHN: 'cn', JPN: 'jp',
  KOR: 'kr', IND: 'in', IDN: 'id', SAU: 'sa', ISR: 'il', ARE: 'ae', PAK: 'pk', VNM: 'vn',
  NGA: 'ng', ZAF: 'za', EGY: 'eg', KEN: 'ke', ETH: 'et', AUS: 'au', NZL: 'nz', TUR: 'tr',
  IRN: 'ir', POL: 'pl', PRT: 'pt', IRL: 'ie', BEL: 'be', CHE: 'ch', AUT: 'at', GRC: 'gr',
  DNK: 'dk', FIN: 'fi', ISL: 'is', CZE: 'cz', HUN: 'hu', ROU: 'ro', BGR: 'bg', HRV: 'hr',
  UKR: 'ua', BLR: 'by', SRB: 'rs', CHL: 'cl', COL: 'co', PER: 'pe', VEN: 've', CUB: 'cu',
  THA: 'th', MYS: 'my', PHL: 'ph', SGP: 'sg', BGD: 'bd', LKA: 'lk', NPL: 'np', TWN: 'tw',
  MAR: 'ma', DZA: 'dz', TUN: 'tn', LBY: 'ly', SDN: 'sd', GHA: 'gh', SEN: 'sn', UGA: 'ug',
};

export function unescoWhsLink(iso3: string): string {
  const iso2 = WHS_ISO2[iso3]?.toUpperCase();
  return iso2 ? `https://whc.unesco.org/en/statesparties/${iso2}/` : 'https://whc.unesco.org/en/list/';
}

export function yieldSource(yieldKey: YieldKey, c: Country): { label: string; url: string } {
  switch (yieldKey) {
    case 'gold':
      return { label: 'World Bank · GDP', url: `https://data.worldbank.org/indicator/NY.GDP.MKTP.CD?locations=${c.iso3}` };
    case 'science':
      return { label: 'World Bank · R&D', url: `https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=${c.iso3}` };
    case 'culture':
      return { label: 'UNESCO WHS', url: unescoWhsLink(c.iso3) };
    case 'production':
      return { label: 'World Bank · Manufacturing', url: `https://data.worldbank.org/indicator/NV.IND.MANF.CD?locations=${c.iso3}` };
    case 'food':
      return { label: 'FAOSTAT · Crops', url: `https://www.fao.org/faostat/en/#country/${faoCode(c.iso3) ?? ''}` };
    case 'faith':
      return { label: 'Pew · Religious Composition', url: 'https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2050/' };
    case 'amenity':
      return { label: 'World Happiness Report', url: 'https://worldhappiness.report/data/' };
    case 'military':
      return { label: 'SIPRI Milex', url: 'https://www.sipri.org/databases/milex' };
  }
}

export const SOURCE_LINKS = {
  hdi: (c: Country) => ({ label: 'UNDP HDR', url: `https://hdr.undp.org/data-center/specific-country-data#/countries/${c.iso3}` }),
  vdem: () => ({ label: 'V-Dem', url: 'https://v-dem.net/data/the-v-dem-dataset/' }),
  eiu: () => ({ label: 'EIU Democracy Index', url: 'https://www.eiu.com/n/campaigns/democracy-index/' }),
  freedomHouse: (c: Country) => ({ label: 'Freedom House', url: `https://freedomhouse.org/country/${freedomHouseSlug(c.name)}/freedom-world/${currentYear()}` }),
  polity: () => ({ label: 'Polity5 / Center for Systemic Peace', url: 'https://www.systemicpeace.org/polityproject.html' }),
  pressFreedom: (c: Country) => ({ label: 'RSF', url: `https://rsf.org/en/country/${freedomHouseSlug(c.name)}` }),
  cpi: () => ({ label: 'Transparency CPI', url: 'https://www.transparency.org/en/cpi' }),
  gini: () => ({ label: 'World Bank · Gini', url: 'https://data.worldbank.org/indicator/SI.POV.GINI' }),
  worldBank,
  restCountries,
  fraser: () => ({ label: 'Fraser EFI', url: 'https://www.fraserinstitute.org/economic-freedom/dataset' }),
  whr: () => ({ label: 'World Happiness Report', url: 'https://worldhappiness.report/data/' }),
  unesco: (c: Country) => ({ label: 'UNESCO WHS', url: unescoWhsLink(c.iso3) }),
};

function currentYear() {
  return String(new Date().getFullYear() - 1);
}

function freedomHouseSlug(name: string): string {
  return name.toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Crude FAO numeric mapping for the most populous countries (FAO uses its own codes).
const FAO_CODE: Record<string, string> = {
  USA: '231', CHN: '351', IND: '100', BRA: '21', RUS: '185', FRA: '68', DEU: '79',
  GBR: '229', JPN: '110', ITA: '106', ESP: '203', CAN: '33', MEX: '138', IDN: '101',
  TUR: '223', AUS: '10', ARG: '9', NLD: '150', POL: '173', UKR: '230', VNM: '237',
};
function faoCode(iso3: string): string | null { return FAO_CODE[iso3] ?? null; }
