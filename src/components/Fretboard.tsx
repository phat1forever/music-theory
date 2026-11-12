import { fretMidi, type FretPos } from '../theory/theory'

export interface Mark extends FretPos {
  label?: string
  /** root = tonic, chord = chord tone, tone = scale note, active = play this now, ghost = faded */
  kind?: 'root' | 'chord' | 'tone' | 'active' | 'ghost' | 'blue'
}

interface Props {
  marks: Mark[]
  /** first and last fret shown */
  from?: number
  to?: number
  leftHanded?: boolean
  onPick?: (midi: number, pos: FretPos) => void
  /** fret positions of muted strings shown as "x" at the nut */
  muted?: number[]
}

const INLAYS = [3, 5, 7, 9, 15, 17, 19, 21]

/** Guitar neck seen as in tablature: low E string at the bottom, nut on the left. */
export function Fretboard({ marks, from = 0, to = 12, leftHanded, onPick, muted }: Props) {
  const lo = Math.max(0, from)
  const first = lo === 0 ? 1 : lo // first fretted column
  const cols = to - first + 1
  const fw = 56
  const sh = 26
  const padL = 44
  const padT = 16
  const W = padL + cols * fw + 16
  const H = padT + 5 * sh + 36
  const fx = (fret: number) =>
    fret === 0 && lo === 0 ? padL - 20 : padL + (fret - first) * fw + fw / 2
  const sy = (string: number) => padT + (string - 1) * sh
  const flip = leftHanded ? `translate(${W},0) scale(-1,1)` : undefined
  // Text must not be mirrored for left-handed view.
  const tx = (x: number) => (leftHanded ? W - x : x)

  return (
    <svg
      className="fretboard"
      viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: W, width: '100%' }}
      role="img"
      aria-label="Guitar fretboard diagram"
    >
      <g transform={flip}>
        <rect x={padL} y={padT - 8} width={cols * fw} height={5 * sh + 16} rx={3} className="fb-wood" />
        {Array.from({ length: cols }, (_, i) => first + i).map((fret) => (
          <g key={fret}>
            {INLAYS.includes(fret) && (
              <circle cx={fx(fret)} cy={padT + 2.5 * sh} r={5} className="fb-inlay" />
            )}
            {fret === 12 && (
              <>
                <circle cx={fx(fret)} cy={padT + 1.5 * sh} r={5} className="fb-inlay" />
                <circle cx={fx(fret)} cy={padT + 3.5 * sh} r={5} className="fb-inlay" />
              </>
            )}
            <line
              x1={padL + (fret - first + 1) * fw}
              x2={padL + (fret - first + 1) * fw}
              y1={padT - 8}
              y2={padT + 5 * sh + 8}
              className="fb-fret"
            />
          </g>
        ))}
        <line
          x1={padL}
          x2={padL}
          y1={padT - 8}
          y2={padT + 5 * sh + 8}
          className={lo === 0 ? 'fb-nut' : 'fb-fret'}
        />
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <line
            key={s}
            x1={padL}
            x2={padL + cols * fw}
            y1={sy(s)}
            y2={sy(s)}
            className="fb-string"
            strokeWidth={0.8 + s * 0.35}
          />
        ))}
        {onPick &&
          [1, 2, 3, 4, 5, 6].flatMap((s) =>
            Array.from({ length: to - lo + 1 }, (_, i) => lo + i).map((fret) => (
              <rect
                key={`${s}-${fret}`}
                x={fx(fret) - (fret === 0 ? 14 : fw / 2)}
                y={sy(s) - sh / 2}
                width={fret === 0 ? 28 : fw}
                height={sh}
                className="fb-hit"
                onClick={() => onPick(fretMidi(s, fret), { string: s, fret })}
              />
            )),
          )}
      </g>
      {marks
        .filter((m) => m.fret >= lo && m.fret <= to)
        .map((m, i) => (
          <g key={i} className={`fb-mark fb-${m.kind ?? 'tone'}`} pointerEvents="none">
            <circle cx={tx(fx(m.fret))} cy={sy(m.string)} r={11} />
            {m.label && (
              <text x={tx(fx(m.fret))} y={sy(m.string) + 4} textAnchor="middle">
                {m.label}
              </text>
            )}
          </g>
        ))}
      {muted?.map((s) => (
        <text key={s} x={tx(padL - 20)} y={sy(s) + 4} textAnchor="middle" className="fb-num">
          ×
        </text>
      ))}
      {Array.from({ length: cols }, (_, i) => first + i).map((fret) => (
        <text key={fret} x={tx(fx(fret))} y={H - 8} textAnchor="middle" className="fb-num">
          {fret}
        </text>
      ))}
      {['e', 'B', 'G', 'D', 'A', 'E'].map((n, i) => (
        <text key={i} x={tx(8)} y={sy(i + 1) + 4} textAnchor="middle" className="fb-num">
          {n}
        </text>
      ))}
    </svg>
  )
}
