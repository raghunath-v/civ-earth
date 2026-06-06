import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store';

// Lightweight singleton trigger — TopBar calls this instead of importing the full modal state
let _openPalette: (() => void) | null = null;
export function openCommandPalette() { _openPalette?.(); }

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  // Register the open trigger
  useEffect(() => {
    _openPalette = () => { setOpen(true); setQuery(''); setCursor(0); };
    return () => { _openPalette = null; };
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const countries = useStore((s) => s.countries);
  const setSelected = useStore((s) => s.setSelected);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries.slice(0, 12);
    return countries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.iso3.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [countries, query]);

  // Open on ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        setCursor(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const select = (iso3: string) => {
    setSelected(iso3);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && results[cursor]) select(results[cursor].iso3);
  };

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4"
            style={{ background: 'rgb(0 0 0 / 0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: -8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: -8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="card w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={onKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line/60">
                <span className="text-ink-subtle text-[16px]">🔍</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
                  placeholder="Search countries, capitals, regions…"
                  className="flex-1 bg-transparent text-[15px] text-ink placeholder-ink-subtle outline-none"
                  aria-label="Search countries"
                />
                <kbd className="hidden sm:inline-flex items-center rounded border border-line/70 bg-surface-3 px-1.5 py-0.5 text-[10px] font-semibold text-ink-subtle">ESC</kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="scroll-y max-h-80 overflow-y-auto py-1.5">
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[13px] text-ink-subtle">No countries found for "{query}"</div>
                ) : (
                  results.map((c, i) => (
                    <button
                      key={c.iso3}
                      data-idx={i}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${i === cursor ? 'bg-surface-3' : 'hover:bg-surface-3/60'}`}
                      onClick={() => select(c.iso3)}
                      onMouseEnter={() => setCursor(i)}
                    >
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-ink truncate">{c.name}</div>
                        <div className="text-[11px] text-ink-subtle truncate">{c.capital} · {c.region}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-ink-muted tabular-nums">
                          {c.era} era
                        </span>
                        <span className="text-[11px] font-semibold text-ink tabular-nums">
                          {c.civScore ?? '—'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-line/60 px-4 py-2 flex items-center gap-3 text-[11px] text-ink-subtle">
                <span><kbd className="font-semibold text-ink-muted">↑↓</kbd> navigate</span>
                <span><kbd className="font-semibold text-ink-muted">↵</kbd> select</span>
                <span><kbd className="font-semibold text-ink-muted">esc</kbd> close</span>
                <span className="ml-auto">{results.length} countries</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
