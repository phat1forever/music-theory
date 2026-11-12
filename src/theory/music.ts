// Note sequences: a small text notation for writing exercises, plus the timeline used for playback and grading.
import { CHORD_SHAPES, fretMidi, midi, type FretPos } from './theory'

export type Dur = 'w' | 'hd' | 'h' | 'qd' | 'q' | '8'
export const BEATS: Record<Dur, number> = { w: 4, hd: 3, h: 2, qd: 1.5, q: 1, '8': 0.5 }

export interface Ev {
  /** sounding MIDI notes; empty = rest */
  midi: number[]
  dur: Dur
  /** guitar positions, parallel to midi */
  tab?: FretPos[]
  /** keyboard finger numbers (1 = thumb), parallel to midi */
  fingers?: number[]
  /** annotation above the note: technique (H, P, sl, bend), chord name, strum arrow */
  text?: string
}

export interface Piece {
  instrument: 'guitar' | 'keys'
  /** guitar part, or keyboard right hand */
  rh: Ev[]
  /** keyboard left hand */
  lh?: Ev[]
}

function tokens(src: string): string[] {
  return (src.match(/\[[^\]]*\]\S*|\S+/g) ?? []).filter((t) => t !== '|')
}

function split(tok: string): { body: string; dur: Dur; text?: string } {
  const m = /^(.*?)(?::(w|hd|h|qd|q|8))?(?:~(.+))?$/.exec(tok)!
  return { body: m[1], dur: (m[2] as Dur) ?? 'q', text: m[3]?.replace(/_/g, ' ') }
}

/**
 * Guitar notation: `string/fret` tokens, e.g. `6/0 6/3:h [5/2 4/2]:w r {Em}:h 3/7~H`.
 * `:dur` sets the length (default quarter), `~text` adds a label, `{Chord}` expands an open chord shape.
 */
export function gtr(src: string): Piece {
  const rh = tokens(src).map((tok): Ev => {
    const { body, dur, text } = split(tok)
    if (body === 'r') return { midi: [], dur }
    const chord = /^\{(.+)\}$/.exec(body)
    if (chord) {
      const shape = CHORD_SHAPES[chord[1]]
      if (!shape) throw new Error(`Unknown chord shape ${chord[1]}`)
      const tab = shape.frets
        .map((fret, i) => ({ string: 6 - i, fret }))
        .filter((p) => p.fret >= 0)
      return { midi: tab.map((p) => fretMidi(p.string, p.fret)), dur, tab, text: text ?? chord[1] }
    }
    const tab = body
      .replace(/[[\]]/g, '')
      .trim()
      .split(/\s+/)
      .map((p) => {
        const [s, fr] = p.split('/').map(Number)
        return { string: s, fret: fr }
      })
    return { midi: tab.map((p) => fretMidi(p.string, p.fret)), dur, tab, text }
  })
  return { instrument: 'guitar', rh }
}

function keyHand(src: string): Ev[] {
  return tokens(src).map((tok): Ev => {
    const { body, dur, text } = split(tok)
    if (body === 'r') return { midi: [], dur }
    const m = /^\[?([^\].]*)\]?(?:\.(\d+))?$/.exec(body)!
    const notes = m[1].trim().split(/\s+/)
    const ev: Ev = { midi: notes.map(midi), dur, text }
    if (m[2]) ev.fingers = m[2].split('').map(Number)
    return ev
  })
}

/** Keyboard notation: `C4.1 D4.2 [C4 E4 G4].135:h r:q`; the digits after the dot are fingerings. */
export function keys(rh: string, lh?: string): Piece {
  return { instrument: 'keys', rh: keyHand(rh), lh: lh ? keyHand(lh) : undefined }
}

export interface Step {
  /** onset in beats from the start */
  beat: number
  /** length in beats */
  len: number
  midi: number[]
}

function onsets(evs: Ev[]): Step[] {
  let beat = 0
  const out: Step[] = []
  for (const e of evs) {
    if (e.midi.length) out.push({ beat, len: BEATS[e.dur], midi: e.midi })
    beat += BEATS[e.dur]
  }
  return out
}

/** Every note onset of a piece in time order; both hands merged into one step when they land together. */
export function timeline(piece: Piece): Step[] {
  const all = [...onsets(piece.rh), ...(piece.lh ? onsets(piece.lh) : [])].sort(
    (a, b) => a.beat - b.beat,
  )
  const out: Step[] = []
  for (const s of all) {
    const last = out[out.length - 1]
    if (last && last.beat === s.beat)
      out[out.length - 1] = { beat: s.beat, len: Math.max(last.len, s.len), midi: [...last.midi, ...s.midi] }
    else out.push({ ...s, midi: [...s.midi] })
  }
  return out
}

export function totalBeats(piece: Piece): number {
  const sum = (evs: Ev[]) => evs.reduce((n, e) => n + BEATS[e.dur], 0)
  return Math.max(sum(piece.rh), piece.lh ? sum(piece.lh) : 0)
}
