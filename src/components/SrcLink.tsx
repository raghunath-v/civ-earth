interface Props {
  url: string;
  label: string;
}

/**
 * Tiny inline source link. Used inside popovers (not on every yield value
 * anymore — the bottom "Sources" footer + the per-yield popover handle that).
 */
export function SrcLink({ url, label }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Source: ${label}`}
      className="inline-flex items-center align-baseline ml-0.5 text-[10px] font-semibold text-ink-subtle hover:text-civgold transition-colors no-underline"
    >
      <span className="leading-none">↗</span>
    </a>
  );
}
