interface Props {
  url: string;
  label: string;
}

/**
 * Tiny superscript link rendered next to a number/fact, linking to the
 * authoritative source. Tooltip shows the source name on hover.
 */
export function SrcLink({ url, label }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Source: ${label}`}
      className="inline-flex items-center align-top ml-0.5 text-[8px] font-bold text-civ-ink/40 hover:text-civ-gold transition-colors no-underline"
    >
      <span className="leading-none">↗</span>
    </a>
  );
}
