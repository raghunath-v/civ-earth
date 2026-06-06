import { useState } from 'react';

interface Props {
  note: string;
}

/**
 * Quiet inline note about contested sovereignty / disputed territory.
 * Collapsed by default — users can expand if they want the context.
 * Placed at the bottom of the stat card, before Sources.
 */
export function DisputedBanner({ note }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-line/60 bg-surface-3/40 px-3 py-2.5">
      <button
        className="flex items-center gap-2 w-full text-left"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="text-[13px] text-ink-subtle" aria-hidden>🏳️</span>
        <span className="text-[12px] font-medium text-ink-muted flex-1">Territorial / sovereignty note</span>
        <span className="text-[11px] text-ink-subtle">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <p className="mt-2 text-[11px] text-ink-muted leading-relaxed border-t border-line/50 pt-2">
          {note}
        </p>
      )}
    </div>
  );
}
