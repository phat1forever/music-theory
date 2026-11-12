import { CHORD_SHAPES, CIRCLE, shapeMidi, type ChordShape } from '../theory/theory'
import { strum } from '../audio/audio'

/** Vertical chord box, the way chord charts print them: nut at the top, low E on the left. */
export function ChordDiagram({
  name,
  shape,
  sound,
  nut = 'Nut',
  mirror,
}: {
  name: string
  shape?: ChordShape
  /** notes to play when tapped, for tunings other than standard */
  sound?: number[]
  /** what the thick top line is: the nut, or a capo */
  nut?: string
  /** left-handed view */
  mirror?: boolean
}) {
  const s = shape ?? CHORD_SHAPES[name]
  if (!s) return null
  const fretted = s.frets.filter((f) => f > 0)
  const max = Math.max(...fretted, 0)
  const base = max > 4 ? Math.min(...fretted) : 1
  const gx = 22
  const gy = 26
  const x0 = 24
  const y0 = 40
  const W = x0 * 2 + gx * 5
  const H = y0 + gy * 4 + 26
  const sx = (i: number) => x0 + (mirror ? 5 - i : i) * gx
  const fy = (fret: number) => y0 + (fret - base + 0.5) * gy
  return (
    <button
      type="button"
      className="chord"
      onClick={() => strum('guitar', sound ?? shapeMidi(s))}
      title={`Hear ${name}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${name} chord diagram`} data-nut={nut}>
        <text x={W / 2} y={16} textAnchor="middle" className="chord-name">
          {name}
        </text>
        {[0, 1, 2, 3, 4].map((r) => (
          <line key={r} x1={x0} x2={x0 + 5 * gx} y1={y0 + r * gy} y2={y0 + r * gy} className="fb-fret" />
        ))}
        {base === 1 ? (
          <line x1={x0 - 1} x2={x0 + 5 * gx + 1} y1={y0} y2={y0} className="fb-nut" />
        ) : (
          <text x={x0 - 10} y={fy(base) + 4} textAnchor="end" className="fb-num">
            {base}
          </text>
        )}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={sx(i)} x2={sx(i)} y1={y0} y2={y0 + 4 * gy} className="fb-string" />
        ))}
        {s.barre && (
          <rect
            x={Math.min(sx(6 - s.barre.from), sx(6 - s.barre.to)) - 8}
            y={fy(s.barre.fret) - 8}
            width={(s.barre.from - s.barre.to) * gx + 16}
            height={16}
            rx={8}
            className="chord-dot"
          />
        )}
        {s.frets.map((fret, i) =>
          fret < 0 ? (
            <text key={i} x={sx(i)} y={y0 - 8} textAnchor="middle" className="fb-num">
              ×
            </text>
          ) : fret === 0 ? (
            <circle key={i} cx={sx(i)} cy={y0 - 12} r={5} className="chord-open" />
          ) : (
            <g key={i}>
              <circle cx={sx(i)} cy={fy(fret)} r={8.5} className="chord-dot" />
              {s.fingers[i] > 0 && (
                <text x={sx(i)} y={fy(fret) + 4} textAnchor="middle" className="chord-finger">
                  {s.fingers[i]}
                </text>
              )}
            </g>
          ),
        )}
      </svg>
    </button>
  )
}

/** Circle of fifths: major keys outside, relative minors inside. */
export function CircleOfFifths({
  selected,
  onSelect,
}: {
  selected?: string
  onSelect?: (key: string) => void
}) {
  const R = 150
  const c = R + 10
  const pt = (i: number, r: number) => {
    const a = ((i * 30 - 90) * Math.PI) / 180
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }
  const wedge = (i: number, r1: number, r2: number) => {
    const a0 = ((i * 30 - 105) * Math.PI) / 180
    const a1 = ((i * 30 - 75) * Math.PI) / 180
    const p = (a: number, r: number) => `${c + r * Math.cos(a)} ${c + r * Math.sin(a)}`
    return `M${p(a0, r1)} A${r1} ${r1} 0 0 1 ${p(a1, r1)} L${p(a1, r2)} A${r2} ${r2} 0 0 0 ${p(a0, r2)}Z`
  }
  return (
    <svg
      className="circle5"
      viewBox={`0 0 ${c * 2} ${c * 2}`}
      style={{ maxWidth: 340, width: '100%' }}
      role="img"
      aria-label="Circle of fifths"
    >
      {CIRCLE.map((k, i) => {
        const on = selected === k.major
        const [x, y] = pt(i, 122)
        const [mx, my] = pt(i, 78)
        const [ax, ay] = pt(i, 44)
        return (
          <g key={k.major} onClick={() => onSelect?.(k.major)} className={onSelect ? 'kb-click' : ''}>
            <path d={wedge(i, R, 98)} className={`c5-seg${on ? ' c5-on' : ''}`} />
            <path d={wedge(i, 98, 58)} className={`c5-seg c5-inner${on ? ' c5-on' : ''}`} />
            <text x={x} y={y + 6} textAnchor="middle" className="c5-major">
              {k.major.replace('#', '♯').replace(/b$/, '♭')}
            </text>
            <text x={mx} y={my + 4} textAnchor="middle" className="c5-minor">
              {k.minor.replace('#', '♯').replace(/b$/, '♭')}m
            </text>
            <text x={ax} y={ay + 4} textAnchor="middle" className="c5-acc">
              {k.acc === 0 ? '0' : k.acc > 0 ? `${k.acc}♯` : `${-k.acc}♭`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
