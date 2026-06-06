export type YieldKey =
  | 'gold'
  | 'science'
  | 'culture'
  | 'production'
  | 'food'
  | 'faith'
  | 'amenity'
  | 'military';

export interface YieldValue {
  /** Headline numeric value (raw, in human units e.g. GDP USD) */
  value: number;
  /** Display string with units */
  display: string;
  /** Free-form breakdown of how it was computed */
  detail?: string;
  /** 1-based rank across all countries (1 = highest). Computed at boot. */
  rank?: number;
  /** Percentile 0-100 (100 = top). Computed at boot. */
  percentile?: number;
}

export interface YieldRecord {
  gold: YieldValue;
  science: YieldValue;
  culture: YieldValue;
  production: YieldValue;
  food: YieldValue;
  faith: YieldValue;
  amenity: YieldValue;
  military: YieldValue;
}

export interface PoliticalPoint {
  /** Year of the data point */
  year: number;
  /** Economic axis: 0 = state-led / left, 10 = market / right (Fraser Economic Freedom Index 0-10) */
  econ: number;
  /** Authority axis: 0 = libertarian, 10 = authoritarian (10 - V-Dem LDI*10) */
  auth: number;
}

export interface DemocracyIndex {
  vdem?: number;     // V-Dem Liberal Democracy Index, 0-1
  eiu?: number;      // EIU Democracy Index, 0-10
  eiuCategory?: 'Full Democracy' | 'Flawed Democracy' | 'Hybrid Regime' | 'Authoritarian';
  freedomHouse?: 'Free' | 'Partly Free' | 'Not Free';
  freedomHouseScore?: number; // 0-100
  polity5?: number;  // -10 to 10
}

export interface CivicScores {
  pressFreedom: number;   // 0-10 (RSF, inverted from 0-100 score)
  antiCorruption: number; // 0-10 (Transparency CPI / 10)
  civilLiberties: number; // 0-10 (Freedom House CL subscore mapped)
  equality: number;       // 0-10 (100 - Gini, scaled)
}

export interface RulingParty {
  name: string;
  leader?: string;
  /** Self/external ideology label */
  ideology: string;
  /** -10 = far left, +10 = far right (Manifesto Project / ParlGov style) */
  econLR?: number;
  /** -10 = libertarian, +10 = authoritarian */
  authLR?: number;
}

export interface Wonder {
  name: string;
  kind: 'cultural' | 'natural' | 'mixed';
  year?: number;
}

export interface GreatPerson {
  name: string;
  kind: 'scientist' | 'artist' | 'writer' | 'leader' | 'athlete' | 'philosopher' | 'entrepreneur';
  note?: string;
}

export interface TradePartner {
  name: string;
  iso3?: string;
  share?: number; // % of exports
}

export interface Country {
  iso3: string;
  /** UN M49 numeric (matches world-atlas TopoJSON `id`) */
  numeric: string;
  name: string;
  flag: string; // emoji
  capital: string;
  region: 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania';
  area_km2: number;
  population: number;
  populationUrbanPct: number;
  populationMedianAge: number;
  hdi: number; // 0-1
  era: string; // computed
  leader: { name: string; title: string; since?: number };
  government: string; // e.g. "Federal presidential republic"

  yields: YieldRecord;

  ideologyHistory: PoliticalPoint[]; // ordered by year, most recent last
  democracy: DemocracyIndex;
  civics: CivicScores;
  rulingCoalition: RulingParty[];

  alliances: string[]; // e.g. ['NATO','EU','G7','G20']
  unSecurityCouncilPermanent?: boolean;

  wonders: Wonder[];
  naturalWonders: Wonder[];
  greatPeople: GreatPerson[];
  luxuryResources: string[];
  strategicResources: string[];

  tradePartners: TradePartner[];
  exportsUsd: number;
  importsUsd: number;

  /** Neutral, cited caveat for contested-sovereignty countries (Taiwan, Palestine, Kosovo, etc.) */
  disputedNote?: string;

  /** Computed Civ Score 0-1000 */
  civScore?: number;
  /** Per-yield z-scores after normalization, for heatmap */
  yieldZ?: Record<YieldKey, number>;
}

export const YIELD_META: Record<YieldKey, { label: string; icon: string; color: string; weight: number; sourceHint: string }> = {
  gold:       { label: 'Gold',       icon: '🪙', color: '#e0a82e', weight: 1.3, sourceHint: 'GDP (World Bank)' },
  science:    { label: 'Science',    icon: '🧪', color: '#3aa6d0', weight: 1.3, sourceHint: 'R&D % GDP + patents + Nobels' },
  culture:    { label: 'Culture',    icon: '🎭', color: '#a86bd1', weight: 1.0, sourceHint: 'UNESCO WHS + soft power' },
  production: { label: 'Production', icon: '⚙️', color: '#b97a3a', weight: 1.2, sourceHint: 'Manufacturing + electricity' },
  food:       { label: 'Food',       icon: '🌾', color: '#7cb342', weight: 0.9, sourceHint: 'Agricultural output + arable land' },
  faith:      { label: 'Faith',      icon: '✨', color: '#c9a14a', weight: 0.7, sourceHint: 'Pew religiosity + diversity' },
  amenity:    { label: 'Amenities',  icon: '😊', color: '#e8b34d', weight: 1.0, sourceHint: 'World Happiness Report + HDI' },
  military:   { label: 'Military',   icon: '⚔️', color: '#c8423c', weight: 1.1, sourceHint: 'Global Firepower + SIPRI' },
};

export const YIELD_KEYS: YieldKey[] = ['gold', 'science', 'culture', 'production', 'food', 'faith', 'amenity', 'military'];
