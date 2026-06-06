import type { Country, PoliticalPoint, DemocracyIndex } from '../types';
import { eraFromHdi } from '../lib/era';

/**
 * Compact baseline row — one per country, ~20 fields.
 * Sources: World Bank WDI, IMF, UNDP HDR, V-Dem, EIU Democracy Index, Freedom House,
 * SIPRI, RSF, Transparency International, World Happiness Report. ~2023-2024 snapshot.
 *
 * Yields encoded as raw values (we'll wrap them as YieldValue in the generator).
 */
export interface Compact {
  iso3: string;
  num: string;
  name: string;
  flag: string;
  capital: string;
  region: 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania';
  area: number;        // km²
  pop: number;
  urban: number;       // %
  age: number;         // median age
  hdi: number;
  gdp: number;         // nominal USD
  rdPct?: number;      // R&D % GDP
  articles?: number;   // scientific articles/yr
  whs?: number;        // UNESCO sites
  mfg?: number;        // manufacturing VA USD
  cereal?: number;     // tonnes
  faith: number;       // 0-10 religiosity
  happy?: number;      // WHR score
  mil?: number;        // mil exp USD
  vdem?: number;
  eiu?: number;
  fh?: number;         // Freedom House 0-100
  fhCat?: 'Free' | 'Partly Free' | 'Not Free';
  rsf?: number;        // 0-10
  cpi?: number;        // 0-10
  gini?: number;       // 0-100 (raw)
  econ95?: number; econ05?: number; econ15?: number; econ24?: number;
  auth95?: number; auth05?: number; auth15?: number; auth24?: number;
  leader: string;
  leaderTitle: string;
  since?: number;
  gov: string;
  party: string;
  partyIdeology: string;
  alliances: string[];
  p5?: boolean;
  resources?: string[];
  luxuries?: string[];
  partners?: string[];
  exports?: number;
  imports?: number;
}

const eiuCat = (e?: number): DemocracyIndex['eiuCategory'] => {
  if (e === undefined) return undefined;
  if (e >= 8) return 'Full Democracy';
  if (e >= 6) return 'Flawed Democracy';
  if (e >= 4) return 'Hybrid Regime';
  return 'Authoritarian';
};

const dy = (k: Compact, prop: 'econ' | 'auth', y: '95' | '05' | '15' | '24', fallback: number): number => {
  const v = (k as never as Record<string, number | undefined>)[`${prop}${y}`];
  return v ?? fallback;
};

export const expandCompact = (k: Compact): Country => {
  const ideologyHistory: PoliticalPoint[] = [
    { year: 1995, econ: dy(k, 'econ', '95', 6), auth: dy(k, 'auth', '95', 5) },
    { year: 2005, econ: dy(k, 'econ', '05', 6), auth: dy(k, 'auth', '05', 5) },
    { year: 2015, econ: dy(k, 'econ', '15', 6), auth: dy(k, 'auth', '15', 5) },
    { year: 2024, econ: dy(k, 'econ', '24', 6), auth: dy(k, 'auth', '24', 5) },
  ];

  const gdpDisp = k.gdp >= 1e12 ? `$${(k.gdp / 1e12).toFixed(2)}T` : k.gdp >= 1e9 ? `$${(k.gdp / 1e9).toFixed(0)}B` : `$${(k.gdp / 1e6).toFixed(0)}M`;
  const mfgDisp = k.mfg ? (k.mfg >= 1e12 ? `$${(k.mfg / 1e12).toFixed(2)}T mfg` : k.mfg >= 1e9 ? `$${(k.mfg / 1e9).toFixed(0)}B mfg` : `$${(k.mfg / 1e6).toFixed(0)}M mfg`) : '—';
  const milDisp = k.mil ? (k.mil >= 1e9 ? `$${(k.mil / 1e9).toFixed(1)}B` : `$${(k.mil / 1e6).toFixed(0)}M`) : '—';

  return {
    iso3: k.iso3, numeric: k.num, name: k.name, flag: k.flag, capital: k.capital, region: k.region,
    area_km2: k.area, population: k.pop, populationUrbanPct: k.urban, populationMedianAge: k.age, hdi: k.hdi,
    era: eraFromHdi(k.hdi),
    leader: { name: k.leader, title: k.leaderTitle, since: k.since },
    government: k.gov,
    yields: {
      gold:       { value: k.gdp, display: gdpDisp, detail: `Nominal GDP (World Bank/IMF)` },
      science:    { value: (k.articles ?? Math.round(k.gdp / 5e7)), display: `${(k.rdPct ?? 0.3).toFixed(2)}% R&D`, detail: `R&D ${k.rdPct ?? 'n/a'}% · ${k.articles ?? '~'} articles/yr` },
      culture:    { value: Math.max(1, k.whs ?? 1), display: `${k.whs ?? 0} WHS`, detail: 'UNESCO World Heritage Sites' },
      production: { value: k.mfg ?? k.gdp * 0.12, display: mfgDisp, detail: 'Manufacturing VA' },
      food:       { value: k.cereal ?? Math.max(100_000, k.pop * 0.3), display: `${((k.cereal ?? k.pop * 0.3) / 1e6).toFixed(1)} Mt cereals`, detail: 'Cereal production' },
      faith:      { value: k.faith, display: `Religiosity ${k.faith.toFixed(1)}/10`, detail: 'Pew/WIN-Gallup religiosity' },
      amenity:    { value: k.happy ?? (3 + k.hdi * 4), display: `Happiness ${(k.happy ?? 3 + k.hdi * 4).toFixed(2)}`, detail: 'WHR / inferred from HDI' },
      military:   { value: k.mil ?? 0, display: milDisp, detail: 'SIPRI military expenditure' },
    },
    ideologyHistory,
    democracy: {
      vdem: k.vdem,
      eiu: k.eiu,
      eiuCategory: eiuCat(k.eiu),
      freedomHouse: k.fhCat,
      freedomHouseScore: k.fh,
    },
    civics: {
      pressFreedom: k.rsf ?? 5,
      antiCorruption: k.cpi ?? 4,
      civilLiberties: k.fh ? k.fh / 10 : 5,
      equality: k.gini ? (100 - k.gini) / 10 : 5,
    },
    rulingCoalition: [{ name: k.party, leader: k.leader, ideology: k.partyIdeology }],
    alliances: k.alliances,
    unSecurityCouncilPermanent: k.p5,
    wonders: [],
    naturalWonders: [],
    greatPeople: [],
    luxuryResources: k.luxuries ?? [],
    strategicResources: k.resources ?? [],
    tradePartners: k.partners ? k.partners.map((p) => ({ name: p })) : [],
    exportsUsd: k.exports ?? k.gdp * 0.2,
    importsUsd: k.imports ?? k.gdp * 0.2,
  };
};
