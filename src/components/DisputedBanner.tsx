interface Props {
  note: string;
}

/** Renders the disputed-territory caveat near the top of a stat card. */
export function DisputedBanner({ note }: Props) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-900/15 px-3 py-2.5">
      <div className="flex items-start gap-2">
        <span className="text-amber-600 dark:text-amber-400 text-base leading-none mt-0.5" aria-hidden>⚠</span>
        <div className="text-[12px] text-ink leading-relaxed">
          <span className="font-semibold mr-1">Contested territory.</span>
          <span className="text-ink-muted">{note}</span>
        </div>
      </div>
    </div>
  );
}
