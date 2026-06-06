import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store';
import { YieldRow } from './YieldRow';
import { PoliticalCompass } from './PoliticalCompass';
import { SrcLink } from './SrcLink';
import { SOURCE_LINKS } from '../lib/sources';
import type { Country } from '../types';

const fmtN = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return `${n}`;
};

export function StatCard() {
  const selectedIso3 = useStore((s) => s.selectedIso3);
  const country = useStore((s) => (s.selectedIso3 ? s.byIso3[s.selectedIso3] : null));
  const setSelected = useStore((s) => s.setSelected);
  const addToCompare = useStore((s) => s.addToCompare);
  const compareSlots = useStore((s) => s.compareSlots);

  return (
    <AnimatePresence>
      {selectedIso3 && country && (
        <motion.div
          key={country.iso3}
          initial={{ x: 480, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 480, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 28 }}
          className="absolute right-0 top-0 bottom-0 z-40 w-[460px] max-w-[90vw] p-3"
        >
          <div className="civ-panel h-full flex flex-col">
            <Header country={country} onClose={() => setSelected(null)} />
            <div className="civ-scroll flex-1 overflow-y-auto px-4 py-3 space-y-4">
              <CivScoreBlock country={country} />
              <Section title="Yields">
                <YieldRow country={country} />
              </Section>
              <Section title="Ideology & Politics">
                <Ideology country={country} />
              </Section>
              <Section title="Civic Indicators">
                <CivicBars country={country} />
              </Section>
              {country.alliances.length > 0 && (
                <Section title="Alliances & Blocs">
                  <div className="flex flex-wrap gap-1.5">
                    {country.alliances.map((a) => (
                      <span key={a} className="civ-chip">{a}</span>
                    ))}
                    {country.unSecurityCouncilPermanent && (
                      <span className="civ-chip" style={{ borderColor: '#e0a82e', background: '#f5d97a' }}>UN SC P5</span>
                    )}
                  </div>
                </Section>
              )}
              {(country.wonders.length > 0 || country.naturalWonders.length > 0) && (() => {
                const seen = new Set<string>();
                const merged = [...country.wonders, ...country.naturalWonders].filter((w) => {
                  if (seen.has(w.name)) return false;
                  seen.add(w.name);
                  return true;
                });
                return (
                  <Section title={`Wonders (${merged.length})`} sourceUrl={SOURCE_LINKS.unesco(country).url} sourceLabel="UNESCO WHS">
                    <ul className="space-y-1 text-sm">
                      {merged.slice(0, 8).map((w) => (
                        <li key={w.name} className="flex items-baseline gap-2">
                          <span className="text-base leading-none">{w.kind === 'natural' ? '🌋' : w.kind === 'mixed' ? '🏞️' : '🏛️'}</span>
                          <span className="font-semibold">{w.name}</span>
                          {w.year && <span className="text-xs text-civ-ink/60">since {w.year}</span>}
                        </li>
                      ))}
                    </ul>
                  </Section>
                );
              })()}
              {country.greatPeople.length > 0 && (
                <Section title="Great People">
                  <ul className="space-y-1 text-sm">
                    {country.greatPeople.map((p) => (
                      <li key={p.name} className="flex items-baseline gap-2">
                        <span>{kindIcon(p.kind)}</span>
                        <span className="font-semibold">{p.name}</span>
                        {p.note && <span className="text-xs text-civ-ink/70">— {p.note}</span>}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {(country.luxuryResources.length > 0 || country.strategicResources.length > 0) && (
                <Section title="Resources">
                  {country.luxuryResources.length > 0 && (
                    <div className="mb-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-civ-gold">Luxury</div>
                      <div className="flex flex-wrap gap-1.5">
                        {country.luxuryResources.map((r) => <span key={r} className="civ-chip">💎 {r}</span>)}
                      </div>
                    </div>
                  )}
                  {country.strategicResources.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-civ-military">Strategic</div>
                      <div className="flex flex-wrap gap-1.5">
                        {country.strategicResources.map((r) => <span key={r} className="civ-chip">🛡️ {r}</span>)}
                      </div>
                    </div>
                  )}
                </Section>
              )}
              {country.tradePartners.length > 0 && (
                <Section title="Trade">
                  <div className="text-xs">
                    Top partners: <span className="font-semibold">{country.tradePartners.map((p) => p.name).join(' · ')}</span>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-civ-ink/80">
                      <div>Exports: <span className="font-bold text-civ-ink">${fmtN(country.exportsUsd)}</span></div>
                      <div>Imports: <span className="font-bold text-civ-ink">${fmtN(country.importsUsd)}</span></div>
                    </div>
                  </div>
                </Section>
              )}
              <Section title="Demographics" sourceUrl={SOURCE_LINKS.worldBank(country.iso3)} sourceLabel="World Bank">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Stat label="Population" value={fmtN(country.population)} />
                  <Stat label="Urban" value={`${country.populationUrbanPct.toFixed(0)}%`} />
                  <Stat label="Median age" value={`${country.populationMedianAge.toFixed(1)} yr`} />
                  <Stat label="Area" value={`${fmtN(country.area_km2)} km²`} />
                  <Stat label="HDI" value={country.hdi.toFixed(3)} sourceUrl={SOURCE_LINKS.hdi(country).url} sourceLabel="UNDP HDR" />
                  <Stat label="Capital" value={country.capital} />
                </div>
              </Section>
              <Section title="Government">
                <div className="text-sm">{country.government}</div>
                <div className="mt-1 text-xs text-civ-ink/70">
                  Ruling: {country.rulingCoalition.map((p) => `${p.name} (${p.ideology})`).join(' · ')}
                </div>
              </Section>
              <Section title="Sources">
                <div className="text-[10px] text-civ-ink/70 leading-relaxed">
                  <div className="mb-1">All figures are snapshots, mostly 2023–2024. Click any source to see the underlying dataset.</div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    {[
                      { label: 'World Bank Open Data', url: SOURCE_LINKS.worldBank(country.iso3) },
                      { label: 'UNDP HDR', url: SOURCE_LINKS.hdi(country).url },
                      { label: 'UNESCO WHS', url: SOURCE_LINKS.unesco(country).url },
                      { label: 'World Happiness Report', url: SOURCE_LINKS.whr().url },
                      { label: 'V-Dem v14', url: SOURCE_LINKS.vdem().url },
                      { label: 'EIU Democracy Index', url: SOURCE_LINKS.eiu().url },
                      { label: 'Freedom House', url: SOURCE_LINKS.freedomHouse(country).url },
                      { label: 'Polity5', url: SOURCE_LINKS.polity().url },
                      { label: 'RSF Press Freedom', url: SOURCE_LINKS.pressFreedom(country).url },
                      { label: 'Transparency CPI', url: SOURCE_LINKS.cpi().url },
                      { label: 'World Bank Gini', url: SOURCE_LINKS.gini().url },
                      { label: 'Fraser EFI', url: SOURCE_LINKS.fraser().url },
                      { label: 'SIPRI Milex', url: 'https://www.sipri.org/databases/milex' },
                      { label: 'Pew Religion', url: 'https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2050/' },
                    ].map((s) => (
                      <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                        className="underline decoration-civ-ink/30 hover:decoration-civ-gold hover:text-civ-gold transition-colors">
                        {s.label}
                      </a>
                    ))}
                  </div>
                  <div className="mt-1.5 text-civ-ink/50">Civ Score is a derived composite (z-score weighted average of 8 yields). Era is derived from HDI tier.</div>
                </div>
              </Section>
            </div>
            <Footer country={country} compareSlots={compareSlots} onCompare={addToCompare} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ country, onClose }: { country: Country; onClose: () => void }) {
  return (
    <div className="px-4 pt-4 pb-2 border-b-2 border-civ-border/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-3xl leading-none">{country.flag}</div>
            <div>
              <div className="civ-heading text-xl leading-tight">{country.name}</div>
              <div className="text-xs text-civ-ink/70">{country.capital} · {country.region}</div>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="civ-chip" style={{ background: '#e0a82e' }}>Era: {country.era}</span>
            <span className="text-civ-ink/70">{country.leader.name} · {country.leader.title}{country.leader.since ? ` (since ${country.leader.since})` : ''}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-civ-ink/60 hover:text-civ-ink text-2xl leading-none px-1">×</button>
      </div>
    </div>
  );
}

function CivScoreBlock({ country }: { country: Country }) {
  return (
    <div className="flex items-center justify-between rounded-lg border-2 border-civ-gold bg-civ-gold/15 px-4 py-3">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-civ-ink/70">Civ Score</div>
        <div className="font-display text-4xl font-bold text-civ-ink leading-none">{country.civScore ?? '—'}<span className="text-sm text-civ-ink/50">/1000</span></div>
      </div>
      <div className="text-right text-xs text-civ-ink/70">
        Composite of 8 yields,<br/>z-score weighted.
      </div>
    </div>
  );
}

function Section({ title, children, sourceUrl, sourceLabel }: { title: string; children: React.ReactNode; sourceUrl?: string; sourceLabel?: string }) {
  return (
    <div>
      <div className="civ-heading text-xs mb-1.5 text-civ-ink/80 border-b border-civ-border/40 pb-0.5">
        {title}
        {sourceUrl && sourceLabel && <SrcLink url={sourceUrl} label={sourceLabel} />}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, sourceUrl, sourceLabel }: { label: string; value: string; sourceUrl?: string; sourceLabel?: string }) {
  return (
    <div className="rounded border border-civ-border/30 bg-civ-parchment/40 px-2 py-1">
      <div className="text-[10px] uppercase tracking-wide text-civ-ink/60">{label}</div>
      <div className="text-sm font-semibold text-civ-ink leading-tight">
        {value}
        {sourceUrl && sourceLabel && <SrcLink url={sourceUrl} label={sourceLabel} />}
      </div>
    </div>
  );
}

function Ideology({ country }: { country: Country }) {
  const { democracy } = country;
  const dq = quadrant(democracy);
  const disagree = dq.disagree;
  const fhSrc = SOURCE_LINKS.freedomHouse(country);
  const rsfSrc = SOURCE_LINKS.pressFreedom(country);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="shrink-0"><PoliticalCompass history={country.ideologyHistory} size={220} /></div>
        <div className="flex-1 text-xs space-y-1">
          <div className="text-civ-ink/60 mb-1">Indices:</div>
          {democracy.vdem !== undefined && (
            <div><span className="font-semibold">V-Dem {democracy.vdem.toFixed(2)}</span><SrcLink {...SOURCE_LINKS.vdem()} /> <span className="text-civ-ink/50 text-[10px]">(0–1)</span></div>
          )}
          {democracy.eiu !== undefined && (
            <div>
              <span className="font-semibold">EIU {democracy.eiu.toFixed(2)}</span><SrcLink {...SOURCE_LINKS.eiu()} />
              {democracy.eiuCategory && <span className="text-civ-ink/70"> — {democracy.eiuCategory}</span>}
            </div>
          )}
          {democracy.freedomHouseScore !== undefined && (
            <div>
              <span className="font-semibold">FH {democracy.freedomHouseScore}/100</span><SrcLink {...fhSrc} />
              {democracy.freedomHouse && <span className="text-civ-ink/70"> — {democracy.freedomHouse}</span>}
            </div>
          )}
          {democracy.polity5 !== undefined && (
            <div><span className="font-semibold">Polity {democracy.polity5}</span><SrcLink {...SOURCE_LINKS.polity()} /> <span className="text-civ-ink/50 text-[10px]">(-10..10)</span></div>
          )}
          {disagree && (
            <div className="rounded border border-civ-military/50 bg-civ-military/10 px-2 py-1 text-civ-ink text-[11px]">
              ⚠ Sources disagree meaningfully on classification.
            </div>
          )}
          <div className="pt-1 text-[10px] text-civ-ink/60">
            Compass: econ axis <SrcLink {...SOURCE_LINKS.fraser()} label="Fraser EFI" />, authority axis from V-Dem LDI<SrcLink {...SOURCE_LINKS.vdem()} />, press-freedom data from RSF<SrcLink {...rsfSrc} label="RSF" />.
          </div>
        </div>
      </div>
    </div>
  );
}

function quadrant(d: Country['democracy']) {
  const labels: string[] = [];
  if (d.vdem !== undefined) labels.push(d.vdem >= 0.5 ? 'dem' : 'auth');
  if (d.eiu !== undefined) labels.push(d.eiu >= 6 ? 'dem' : 'auth');
  if (d.freedomHouse) labels.push(d.freedomHouse === 'Free' ? 'dem' : d.freedomHouse === 'Not Free' ? 'auth' : 'mid');
  const set = new Set(labels);
  return { disagree: set.size > 1 };
}

function CivicBars({ country }: { country: Country }) {
  const items: { label: string; icon: string; value: number; color: string; src: { label: string; url: string } }[] = [
    { label: 'Press Freedom', icon: '📰', value: country.civics.pressFreedom, color: '#3aa6d0', src: SOURCE_LINKS.pressFreedom(country) },
    { label: 'Anti-Corruption', icon: '🧹', value: country.civics.antiCorruption, color: '#7cb342', src: SOURCE_LINKS.cpi() },
    { label: 'Civil Liberties', icon: '⚖️', value: country.civics.civilLiberties, color: '#a86bd1', src: SOURCE_LINKS.freedomHouse(country) },
    { label: 'Equality', icon: '🤝', value: country.civics.equality, color: '#e0a82e', src: SOURCE_LINKS.gini() },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <div key={it.label} className="rounded border border-civ-border/40 bg-civ-parchment/50 px-2 py-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-civ-ink/80">
            <span>{it.icon} {it.label}<SrcLink {...it.src} /></span>
            <span className="text-civ-ink">{it.value.toFixed(1)}/10</span>
          </div>
          <div className="mt-1 h-2 rounded bg-civ-border/20 overflow-hidden">
            <div className="h-full rounded" style={{ width: `${(it.value / 10) * 100}%`, background: it.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Footer({ country, compareSlots, onCompare }: { country: Country; compareSlots: [string | null, string | null]; onCompare: (iso3: string) => void }) {
  const slot = compareSlots[0] === country.iso3 ? 'A' : compareSlots[1] === country.iso3 ? 'B' : null;
  return (
    <div className="border-t-2 border-civ-border/40 px-4 py-2 flex items-center justify-between">
      <div className="text-[11px] text-civ-ink/70">
        Compare: <span className="font-semibold">{compareSlots[0] ?? '—'}</span> vs <span className="font-semibold">{compareSlots[1] ?? '—'}</span>
      </div>
      <button
        className="civ-btn"
        onClick={() => onCompare(country.iso3)}
      >
        {slot ? `In slot ${slot}` : '+ Add to compare'}
      </button>
    </div>
  );
}

function kindIcon(k: string) {
  switch (k) {
    case 'scientist': return '🧪';
    case 'artist': return '🎨';
    case 'writer': return '✍️';
    case 'leader': return '👑';
    case 'athlete': return '🏅';
    case 'philosopher': return '📜';
    case 'entrepreneur': return '💼';
    default: return '⭐';
  }
}
