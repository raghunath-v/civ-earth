import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { YieldRow } from './YieldRow';
import { PoliticalCompass } from './PoliticalCompass';
import { SrcLink } from './SrcLink';
import { YieldPopover } from './YieldPopover';
import { EraPopover } from './EraPopover';
import { DisputedBanner } from './DisputedBanner';
import { SOURCE_LINKS } from '../lib/sources';
import type { Country, YieldKey } from '../types';

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
  const [openYield, setOpenYield] = useState<YieldKey | null>(null);
  const [openEra, setOpenEra] = useState(false);

  // On mobile (<640px) render as a bottom sheet; desktop keeps right drawer
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <AnimatePresence>
      {selectedIso3 && country && (
        isMobile ? (
          /* ── Mobile: bottom sheet ── */
          <motion.aside
            key={`sheet-${country.iso3}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.25 }}
            onDragEnd={(_e, info) => { if (info.offset.y > 80) setSelected(null); }}
            className="fixed inset-x-0 bottom-0 z-40 max-h-[92vh] rounded-t-3xl"
            style={{ touchAction: 'none' }}
          >
            <div className="glass h-full flex flex-col overflow-hidden rounded-t-3xl">
              {/* drag handle */}
              <div className="flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 rounded-full bg-line/60" />
              </div>
              <Header country={country} onClose={() => setSelected(null)} onEraClick={() => setOpenEra(true)} />
              <div className="scroll-y flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{ touchAction: 'pan-y' }}>
                {country.disputedNote && <DisputedBanner note={country.disputedNote} />}
                <CivScoreBlock country={country} />
                <Section title="Yields"><YieldRow country={country} onYieldClick={(k) => setOpenYield(k)} /></Section>
                <Section title="Ideology & Politics"><Ideology country={country} /></Section>
                <Section title="Civic Indicators"><CivicBars country={country} /></Section>
              </div>
              <Footer country={country} compareSlots={compareSlots} onCompare={addToCompare} />
            </div>
            <YieldPopover country={country} yieldKey={openYield} onClose={() => setOpenYield(null)} />
            <EraPopover country={openEra ? country : null} onClose={() => setOpenEra(false)} />
          </motion.aside>
        ) : (
        /* ── Desktop: right drawer ── */
        <motion.aside
          key={country.iso3}
          initial={{ x: 460, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 460, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          className="absolute right-0 top-0 bottom-0 z-40 w-[440px] max-w-[92vw] p-4"
        >
          <div className="glass h-full flex flex-col overflow-hidden">
            <Header country={country} onClose={() => setSelected(null)} onEraClick={() => setOpenEra(true)} />
            <div className="scroll-y flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <CivScoreBlock country={country} />
              <Section title="Yields">
                <YieldRow country={country} onYieldClick={(k) => setOpenYield(k)} />
                <div className="mt-1.5 text-[10px] text-ink-subtle">Click any yield to see what it measures.</div>
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
                      <a
                        key={a}
                        href={`https://en.wikipedia.org/wiki/${encodeURIComponent(allianceWikiSlug(a))}`}
                        target="_blank" rel="noopener noreferrer"
                        className="chip hover:border-civgold-ring/60 hover:text-ink transition-colors"
                      >
                        {a}
                      </a>
                    ))}
                    {country.unSecurityCouncilPermanent && (
                      <a
                        href="https://en.wikipedia.org/wiki/United_Nations_Security_Council"
                        target="_blank" rel="noopener noreferrer"
                        className="chip border-civgold-ring/60 bg-civgold-bg text-ink hover:opacity-80 transition-opacity"
                      >
                        UN SC P5
                      </a>
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
                    <ul className="space-y-1.5 text-[13px]">
                      {merged.slice(0, 8).map((w) => (
                        <li key={w.name} className="flex items-baseline gap-2">
                          <span className="text-[15px] leading-none">{w.kind === 'natural' ? '🌋' : w.kind === 'mixed' ? '🏞️' : '🏛️'}</span>
                          <a
                            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(w.name.replace(/ /g, '_'))}`}
                            target="_blank" rel="noopener noreferrer"
                            className="font-medium text-ink hover:text-civgold underline decoration-line/50 decoration-1 underline-offset-2 hover:decoration-civgold transition-colors"
                          >
                            {w.name}
                          </a>
                          {w.year && <span className="text-[11px] text-ink-subtle">since {w.year}</span>}
                        </li>
                      ))}
                    </ul>
                  </Section>
                );
              })()}
              {country.greatPeople.length > 0 && (
                <Section title="Great People">
                  <ul className="space-y-1.5 text-[13px]">
                    {country.greatPeople.map((p) => (
                      <li key={p.name} className="flex items-baseline gap-2">
                        <span>{kindIcon(p.kind)}</span>
                        <a
                          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(p.name.replace(/ /g, '_'))}`}
                          target="_blank" rel="noopener noreferrer"
                          className="font-medium text-ink hover:text-civgold underline decoration-line/50 decoration-1 underline-offset-2 hover:decoration-civgold transition-colors"
                        >
                          {p.name}
                        </a>
                        {p.note && <span className="text-[11px] text-ink-muted">— {p.note}</span>}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {(country.luxuryResources.length > 0 || country.strategicResources.length > 0) && (
                <Section title="Resources">
                  {country.luxuryResources.length > 0 && (
                    <div className="mb-2">
                      <div className="eyebrow mb-1">Luxury</div>
                      <div className="flex flex-wrap gap-1.5">
                        {country.luxuryResources.map((r) => <span key={r} className="chip">💎 {r}</span>)}
                      </div>
                    </div>
                  )}
                  {country.strategicResources.length > 0 && (
                    <div>
                      <div className="eyebrow mb-1">Strategic</div>
                      <div className="flex flex-wrap gap-1.5">
                        {country.strategicResources.map((r) => <span key={r} className="chip">🛡️ {r}</span>)}
                      </div>
                    </div>
                  )}
                </Section>
              )}
              {country.tradePartners.length > 0 && (
                <Section title="Trade">
                  <div className="text-[13px] text-ink-muted">
                    <div>Top partners: <span className="font-medium text-ink">{country.tradePartners.map((p) => p.name).join(' · ')}</span></div>
                    <div className="mt-1.5 grid grid-cols-2 gap-3">
                      <div>Exports <span className="font-semibold text-ink">${fmtN(country.exportsUsd)}</span></div>
                      <div>Imports <span className="font-semibold text-ink">${fmtN(country.importsUsd)}</span></div>
                    </div>
                  </div>
                </Section>
              )}
              <Section title="Demographics" sourceUrl={SOURCE_LINKS.worldBank(country.iso3)} sourceLabel="World Bank">
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <Stat label="Population" value={fmtN(country.population)} />
                  <Stat label="Urban" value={`${country.populationUrbanPct.toFixed(0)}%`} />
                  <Stat label="Median age" value={`${country.populationMedianAge.toFixed(1)} yr`} />
                  <Stat label="Area" value={`${fmtN(country.area_km2)} km²`} />
                  <Stat label="HDI" value={country.hdi.toFixed(3)} sourceUrl={SOURCE_LINKS.hdi(country).url} sourceLabel="UNDP HDR" />
                  <Stat label="Capital" value={country.capital} />
                </div>
              </Section>
              <Section title="Government">
                <div className="text-[13px] text-ink">{country.government}</div>
                <div className="mt-1 text-[12px] text-ink-muted">
                  Ruling: {country.rulingCoalition.map((p) => `${p.name} (${p.ideology})`).join(' · ')}
                </div>
              </Section>
              {country.disputedNote && <DisputedBanner note={country.disputedNote} />}
              <Section title="Sources">
                <div className="text-[11px] text-ink-muted leading-relaxed">
                  <div className="mb-1.5">All figures are snapshots, mostly 2023–2024. Click any source to see the underlying dataset.</div>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1">
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
                        className="text-ink-muted underline decoration-line decoration-1 underline-offset-2 hover:text-civgold hover:decoration-civgold transition-colors">
                        {s.label}
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 text-ink-subtle">Civ Score is a derived composite (z-score weighted average of 8 yields). Era is derived from HDI tier.</div>
                </div>
              </Section>
            </div>
            <Footer country={country} compareSlots={compareSlots} onCompare={addToCompare} />
          </div>
          <YieldPopover country={country} yieldKey={openYield} onClose={() => setOpenYield(null)} />
          <EraPopover country={openEra ? country : null} onClose={() => setOpenEra(false)} />
        </motion.aside>
        )
      )}
    </AnimatePresence>
  );
}

function Header({ country, onClose, onEraClick }: { country: Country; onClose: () => void; onEraClick: () => void }) {
  return (
    <div className="px-5 pt-5 pb-3 border-b border-line/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="text-3xl leading-none">{country.flag}</div>
            <div className="min-w-0">
              <div className="heading text-[20px] leading-tight truncate">{country.name}</div>
              <div className="text-[12px] text-ink-muted">{country.capital} · {country.region}</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[12px]">
            <button
              onClick={onEraClick}
              className="inline-flex items-center gap-1 rounded-full bg-civgold-bg border border-civgold-ring/40 px-2 py-0.5 text-[11px] font-semibold text-ink transition-all duration-150 ease-apple hover:border-civgold-ring active:scale-[0.96]"
              title="See HDI ladder + era thresholds"
            >
              {country.era} era
              <span className="text-civgold-ring/80 text-[10px]">ⓘ</span>
            </button>
            <span className="text-ink-muted truncate">{country.leader.name} · {country.leader.title}{country.leader.since ? ` · ${country.leader.since}` : ''}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl leading-none px-1 -mr-1 transition-colors" aria-label="Close">×</button>
      </div>
    </div>
  );
}

function CivScoreBlock({ country }: { country: Country }) {
  const target = country.civScore ?? 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) { setDisplay(0); return; }
    const DURATION = 650;
    const startTime = performance.now();
    let rafId: number;
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // Re-run whenever we open a different country
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.iso3]);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-civgold-ring/30 bg-civgold-bg/50 px-4 py-3">
      <div>
        <div className="eyebrow text-civgold-ring">Civ Score</div>
        <div className="font-bold text-[36px] text-ink leading-none mt-0.5 tabular-nums">
          {country.civScore !== undefined ? display : '—'}
          <span className="text-[14px] text-ink-subtle font-medium">/1000</span>
        </div>
      </div>
      <div className="text-right text-[11px] text-ink-muted leading-snug">
        Composite of 8 yields,<br/>z-score weighted.
      </div>
    </div>
  );
}

function Section({ title, children, sourceUrl, sourceLabel }: { title: string; children: React.ReactNode; sourceUrl?: string; sourceLabel?: string }) {
  return (
    <div>
      <div className="eyebrow mb-2 flex items-center gap-1">
        {title}
        {sourceUrl && sourceLabel && <SrcLink url={sourceUrl} label={sourceLabel} />}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, sourceUrl, sourceLabel }: { label: string; value: string; sourceUrl?: string; sourceLabel?: string }) {
  return (
    <div className="rounded-xl border border-line/60 bg-surface-3/60 px-2.5 py-1.5">
      <div className="eyebrow">{label}</div>
      <div className="text-[13px] font-semibold text-ink leading-tight mt-0.5">
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
        <div className="shrink-0"><PoliticalCompass history={country.ideologyHistory} size={210} /></div>
        <div className="flex-1 text-[12px] space-y-1">
          <div className="eyebrow mb-1">Democracy indices</div>
          {democracy.vdem !== undefined && (
            <div className="text-ink"><span className="font-semibold">V-Dem {democracy.vdem.toFixed(2)}</span><SrcLink {...SOURCE_LINKS.vdem()} /> <span className="text-ink-subtle text-[10px]">(0–1)</span></div>
          )}
          {democracy.eiu !== undefined && (
            <div className="text-ink">
              <span className="font-semibold">EIU {democracy.eiu.toFixed(2)}</span><SrcLink {...SOURCE_LINKS.eiu()} />
              {democracy.eiuCategory && <span className="text-ink-muted"> — {democracy.eiuCategory}</span>}
            </div>
          )}
          {democracy.freedomHouseScore !== undefined && (
            <div className="text-ink">
              <span className="font-semibold">FH {democracy.freedomHouseScore}/100</span><SrcLink {...fhSrc} />
              {democracy.freedomHouse && <span className="text-ink-muted"> — {democracy.freedomHouse}</span>}
            </div>
          )}
          {democracy.polity5 !== undefined && (
            <div className="text-ink"><span className="font-semibold">Polity {democracy.polity5}</span><SrcLink {...SOURCE_LINKS.polity()} /> <span className="text-ink-subtle text-[10px]">(-10..10)</span></div>
          )}
          {disagree && (
            <div className="mt-2 rounded-lg border border-yield-military/40 bg-yield-military/10 px-2 py-1 text-ink text-[11px]">
              ⚠ Sources disagree meaningfully on classification.
            </div>
          )}
          <div className="pt-1.5 text-[10px] text-ink-subtle leading-relaxed">
            Compass axes: economic from Fraser EFI<SrcLink {...SOURCE_LINKS.fraser()} />, authority from V-Dem LDI<SrcLink {...SOURCE_LINKS.vdem()} />; press freedom from RSF<SrcLink {...rsfSrc} />.
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
    { label: 'Equality', icon: '🤝', value: country.civics.equality, color: '#d4a017', src: SOURCE_LINKS.gini() },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-line/60 bg-surface-3/60 px-2.5 py-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-muted">
            <span className="truncate">{it.icon} {it.label}<SrcLink {...it.src} /></span>
            <span className="text-ink tabular-nums">{it.value.toFixed(1)}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-line/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(it.value / 10) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              style={{ background: it.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Footer({ country, compareSlots, onCompare }: { country: Country; compareSlots: [string | null, string | null]; onCompare: (iso3: string) => void }) {
  const slot = compareSlots[0] === country.iso3 ? 'A' : compareSlots[1] === country.iso3 ? 'B' : null;
  return (
    <div className="border-t border-line/60 px-5 py-3 flex items-center justify-between">
      <div className="text-[11px] text-ink-muted">
        Compare: <span className="font-semibold text-ink">{compareSlots[0] ?? '—'}</span> vs <span className="font-semibold text-ink">{compareSlots[1] ?? '—'}</span>
      </div>
      <button
        className={slot ? 'btn-ghost' : 'btn-gold'}
        onClick={() => onCompare(country.iso3)}
      >
        {slot ? `In slot ${slot}` : '+ Add to compare'}
      </button>
    </div>
  );
}

const ALLIANCE_WIKI: Record<string, string> = {
  NATO: 'NATO', EU: 'European_Union', G7: 'G7', G20: 'G20', OECD: 'OECD',
  BRICS: 'BRICS', AU: 'African_Union', ASEAN: 'ASEAN', 'Five Eyes': 'Five_Eyes',
  AUKUS: 'AUKUS', Quad: 'Quadrilateral_Security_Dialogue', GCC: 'Gulf_Cooperation_Council',
  OPEC: 'OPEC', 'OPEC+': 'OPEC%2B', Commonwealth: 'Commonwealth_of_Nations',
  SCO: 'Shanghai_Cooperation_Organisation', CSTO: 'Collective_Security_Treaty_Organization',
  EAEU: 'Eurasian_Economic_Union', Eurozone: 'Eurozone', EEA: 'European_Economic_Area',
  EFTA: 'European_Free_Trade_Association', CPTPP: 'Comprehensive_and_Progressive_Agreement_for_Trans-Pacific_Partnership',
  RCEP: 'Regional_Comprehensive_Economic_Partnership', Mercosur: 'Mercosur',
  APEC: 'Asia-Pacific_Economic_Cooperation', USMCA: 'United_States%E2%80%93Mexico%E2%80%93Canada_Agreement',
  'Arab League': 'Arab_League', OIC: 'Organisation_of_Islamic_Cooperation',
  ECOWAS: 'Economic_Community_of_West_African_States', SADC: 'Southern_African_Development_Community',
  EAC: 'East_African_Community', 'Nordic Council': 'Nordic_Council',
  ALBA: 'Bolivarian_Alliance_for_the_Peoples_of_Our_America', SICA: 'Central_American_Integration_System',
  CARICOM: 'Caribbean_Community', 'Pacific Alliance': 'Pacific_Alliance',
  'Abraham Accords': 'Abraham_Accords', MNNA: 'Major_non-NATO_ally',
};

function allianceWikiSlug(a: string): string {
  return ALLIANCE_WIKI[a] ?? a.replace(/ /g, '_');
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
