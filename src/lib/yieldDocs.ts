import type { YieldKey } from '../types';

export interface YieldDoc {
  what: string;
  indicator: string;
  context: string;
}

/**
 * Educational "what does this number mean" docs for each yield. Surfaced in YieldPopover.
 * World-leader values are from the underlying datasets (latest available).
 */
export const YIELD_DOCS: Record<YieldKey, YieldDoc> = {
  gold: {
    what: 'Economic output — the total dollar value of everything a country produces. Civ\'s Gold is "stuff you can buy with money," so we use the most direct proxy: GDP.',
    indicator: 'Nominal GDP in current US dollars (World Bank, NY.GDP.MKTP.CD).',
    context: 'World total ≈ $105 trillion. USA leads at $28.8T; China $18.5T; Germany $4.6T. Median country: ~$50 billion.',
  },
  science: {
    what: 'How much a country invests in new knowledge and how much it produces. Civ\'s Science is research capacity, so we combine R&D spending with scientific output.',
    indicator: 'Gross R&D expenditure as % of GDP (World Bank GB.XPD.RSDV.GD.ZS), plus articles published per year (Scimago) and cumulative Nobel laureates.',
    context: 'Israel leads R&D-intensity at 6.0% of GDP; South Korea 4.9%; USA 3.4%; world median ~0.7%. USA dominates Nobel count (400+).',
  },
  culture: {
    what: 'Cultural output and global reach — heritage, soft power, what the world wants to visit or experience.',
    indicator: 'UNESCO World Heritage Site count, plus Brand Finance Soft Power Index, plus international tourism receipts.',
    context: 'Italy leads with 60 UNESCO sites; China 59; Germany 54; France 53. USA tops the Soft Power Index. France is the world\'s #1 tourist destination.',
  },
  production: {
    what: 'Industrial capacity — what a country actually builds.',
    indicator: 'Manufacturing value-added in USD (World Bank NV.IND.MANF.CD), plus electricity generation as a power-base proxy.',
    context: 'China is the workshop of the world: $4.98T in manufacturing — about 30% of global output. USA $2.5T, Japan $813B, Germany $754B.',
  },
  food: {
    what: 'Agricultural capacity — what feeds the country and what it exports.',
    indicator: 'Total cereal production in tonnes (FAOSTAT / World Bank), supplemented by arable land share.',
    context: 'China produces 633 million tonnes of cereals/year; USA 174 Mt; India 330 Mt. Russia is the world\'s #1 wheat exporter. Brazil dominates soy & coffee.',
  },
  faith: {
    what: 'Religiosity — how central religion is to public and private life. Not which religion, but how religious.',
    indicator: 'Religiosity index (0-10) derived from Pew Research and WIN-Gallup surveys: % praying daily, importance of religion, attendance.',
    context: 'Highest: Afghanistan, Saudi Arabia, Yemen (~9.5/10). Lowest: Sweden, Norway, Czechia, Estonia (~2/10). Roughly halves with income (Gallup), with major exceptions (USA, Israel).',
  },
  amenity: {
    what: 'Subjective wellbeing — how well people report their lives are going.',
    indicator: 'World Happiness Report score (0-10), based on Cantril Ladder survey: "Imagine a ladder where 10 is your best possible life and 0 is your worst — where are you?"',
    context: 'Top: Finland 7.74, Denmark 7.58, Sweden 7.34. USA 6.73 (rank 23). Bottom: Afghanistan 1.28. Average ~5.5.',
  },
  military: {
    what: 'Defense / war-fighting capacity. Civ\'s Military combines spend, force size, and nuclear status.',
    indicator: 'Military expenditure in USD (SIPRI), active personnel (IISS), nuclear warhead count (FAS/SIPRI).',
    context: 'USA spends $877B (≈36% of world total). China $296B (real may be higher). Russia $109B. Nuclear powers: USA, RUS, CHN, FRA, GBR, IND, PAK, ISR (undeclared), DPRK.',
  },
};
