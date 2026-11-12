import { mod } from '../theory/theory'

export interface KeyMark {
  midi: number
  label?: string
  kind?: 'root' | 'chord' | 'tone' | 'active' | 'lh' | 'blue'
}

interface Props {
  marks: KeyMark[]
  /** lowest and highest MIDI note shown (snapped outward to white keys) */
  from?: number
  to?: number
  onPick?: (midi: number) => void
  /** print note names on the white keys */
  names?: boolean
}

const BLACK = [1, 3, 6, 8, 10]
const isBlack = (m: number) => BLACK.includes(mod(m, 12))
const WHITE_NAMES: Record<number, string> = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'B' }

/** Piano keyboard with highlighted keys; labels are usually note names or finger numbers. */
export function Keyboard({ marks, from = 48, to = 84, onPick, names = true }: Props) {
  let lo = from
  let hi = to
  if (isBlack(lo)) lo--
  if (isBlack(hi)) hi++
  const whites: number[] = []
  for (let m = lo; m <= hi; m++) if (!isBlack(m)) whites.push(m)
  const ww = 30
  const wh = 120
  const bw = 18
  const bh = 74
  const W = whites.length * ww + 2
  const H = wh + 2
  const byMidi = new Map(marks.map((k) => [k.midi, k]))
  const wx = (m: number) => 1 + whites.indexOf(m) * ww

  const blacks: number[] = []
  for (let m = lo; m <= hi; m++) if (isBlack(m)) blacks.push(m)

  return (
    <svg
      className="keyboard"
      viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: W * 1.15, width: '100%' }}
      role="img"
      aria-label="Piano keyboard diagram"
    >
      {whites.map((m) => {
        const mark = byMidi.get(m)
        return (
          <g key={m} onClick={onPick ? () => onPick(m) : undefined} className={onPick ? 'kb-click' : ''}>
            <rect x={wx(m)} y={1} width={ww} height={wh} rx={3} className="kb-white" />
            {names && mod(m, 12) === 0 && !mark && (
              <text x={wx(m) + ww / 2} y={wh - 8} textAnchor="middle" className="kb-name">
                C{Math.floor(m / 12) - 1}
              </text>
            )}
            {names && mod(m, 12) !== 0 && !mark && (
              <text x={wx(m) + ww / 2} y={wh - 8} textAnchor="middle" className="kb-name kb-faint">
                {WHITE_NAMES[mod(m, 12)]}
              </text>
            )}
            {mark && (
              <g className={`kb-mark kb-${mark.kind ?? 'tone'}`}>
                <circle cx={wx(m) + ww / 2} cy={wh - 20} r={11} />
                <text x={wx(m) + ww / 2} y={wh - 16} textAnchor="middle">
                  {mark.label}
                </text>
              </g>
            )}
          </g>
        )
      })}
      {blacks.map((m) => {
        const mark = byMidi.get(m)
        const x = wx(m - 1) + ww - bw / 2
        return (
          <g key={m} onClick={onPick ? () => onPick(m) : undefined} className={onPick ? 'kb-click' : ''}>
            <rect x={x} y={1} width={bw} height={bh} rx={2} className="kb-black" />
            {mark && (
              <g className={`kb-mark kb-${mark.kind ?? 'tone'}`}>
                <circle cx={x + bw / 2} cy={bh - 16} r={9.5} />
                <text x={x + bw / 2} y={bh - 12.5} textAnchor="middle" fontSize={9.5}>
                  {mark.label}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
