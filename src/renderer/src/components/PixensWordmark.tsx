// PIXENS wordmark — the REAL brand treatment (per-letter hex + Press
// Start 2P), exactly matching pixens.io landing/topbar. Use this instead
// of any drawn/raster "PIXENS" logo from the design hand-off.
// Colors are LOCKED (CLAUDE.md "Brand wordmark colors").

const LETTERS: [string, string][] = [
  ['P', '#29ff7e'],
  ['I', '#00f0ff'],
  ['X', '#7dfcff'],
  ['E', '#a855ff'],
  ['N', '#c8a8ff'],
  ['S', '#ff1e85']
]

export function PixensWordmark({
  size = 28,
  letterSpacing = 2,
  className,
  style
}: {
  size?: number
  letterSpacing?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={className}
      aria-label="PIXENS"
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: size,
        lineHeight: 1,
        letterSpacing,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style
      }}
    >
      {LETTERS.map(([ch, color]) => (
        <span key={ch} style={{ color }}>
          {ch}
        </span>
      ))}
    </span>
  )
}
