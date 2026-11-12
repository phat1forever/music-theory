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
  /** tied to the next note of the same pitch: held on, not played again */
  tie?: boolean
}

export interface Piece {
  instrument: 'guitar' | 'keys'
  /** guitar part, or keyboard right hand */
  rh: Ev[]
  /** keyboard left hand */
  lh?: Ev[]
  /** beats per bar: 4 (default) or 3 */
  meter?: 3 | 4
  /** key signature, e.g. "G", "F", "Bb", "Am", "Dm"; omitted = none, accidentals written on the notes */
  key?: string
  /** shuffle feel: eighth notes are played long-short */
  swing?: boolean
  /** chord symbol for each bar ("" = no change), shown above the staff and used for backing */
  chords?: string[]
}

export interface PieceOpts {
  meter?: 3 | 4
  key?: string
  swing?: boolean
  /** one chord per bar, space separated; "." repeats the previous bar's chord without printing it again */
  chords?: string
}

function withOpts<T extends Piece>(piece: T, o?: PieceOpts): T {
  if (!o) return piece
  return {
    ...piece,
    meter: o.meter,
    key: o.key,
    swing: o.swing,
    chords: o.chords?.split(/\s+/).map((c) => (c === '.' ? '' : c)),
  }
}

export const barBeats = (piece: Piece) => piece.meter ?? 4

function tokens(src: string): string[] {
  return (src.match(/\[[^\]]*\]\S*|\S+/g) ?? []).filter((t) => t !== '|')
}

function split(tok: string): { body: string; dur: Dur; text?: string; tie?: boolean } {
  const m = /^(.*?)(?::(w|hd|h|qd|q|8))?(-)?(?:~(.+))?$/.exec(tok)!
  return { body: m[1], dur: (m[2] as Dur) ?? 'q', tie: m[3] ? true : undefined, text: m[4]?.replace(/_/g, ' ') }
}

/**
 * Guitar notation: `string/fret` tokens, e.g. `6/0 6/3:h [5/2 4/2]:w r {Em}:h 3/7~H`.
 * `:dur` sets the length (default quarter), a trailing `-` ties into the next note, `~text` adds a label,
 * `{Chord}` expands an open chord shape.
 */
export function gtr(src: string, opts?: PieceOpts): Piece {
  const rh = tokens(src).map((tok): Ev => {
    const { body, dur, text, tie } = split(tok)
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
    return { midi: tab.map((p) => fretMidi(p.string, p.fret)), dur, tab, text, tie }
  })
  return withOpts({ instrument: 'guitar', rh }, opts)
}

function keyHand(src: string): Ev[] {
  return tokens(src).map((tok): Ev => {
    const { body, dur, text, tie } = split(tok)
    if (body === 'r') return { midi: [], dur }
    const m = /^\[?([^\].]*)\]?(?:\.(\d+))?$/.exec(body)!
    const notes = m[1].trim().split(/\s+/)
    const ev: Ev = { midi: notes.map(midi), dur, text, tie }
    if (m[2]) ev.fingers = m[2].split('').map(Number)
    return ev
  })
}

/** Keyboard notation: `C4.1 D4.2 [C4 E4 G4].135:h r:q`; the digits after the dot are fingerings. */
export function keys(rh: string, lh?: string, opts?: PieceOpts): Piece {
  return withOpts({ instrument: 'keys', rh: keyHand(rh), lh: lh ? keyHand(lh) : undefined }, opts)
}

export interface Step {
  /** onset in beats from the start, as written */
  beat: number
  /** onset in beats as it sounds (later than `beat` for swung off-beat eighths) */
  at: number
  /** length in beats */
  len: number
  midi: number[]
}

export interface Onset {
  beat: number
  /** length in beats, including any notes tied on */
  len: number
  ev: Ev
  hand: 'rh' | 'lh'
}

const sameNotes = (a: number[], b: number[]) => a.length === b.length && a.every((n) => b.includes(n))

/** Every struck note or chord of a piece. A note tied from the one before it is held, not struck, so it adds length only. */
export function onsetEvents(piece: Piece): Onset[] {
  const out: Onset[] = []
  const add = (evs: Ev[], hand: 'rh' | 'lh') => {
    let beat = 0
    let held: Onset | null = null
    for (const ev of evs) {
      const len = BEATS[ev.dur]
      if (held && ev.midi.length && sameNotes(held.ev.midi, ev.midi)) held.len += len
      else if (ev.midi.length) {
        held = { beat, len, ev, hand }
        out.push(held)
      }
      if (!ev.tie) held = null
      beat += len
    }
  }
  add(piece.rh, 'rh')
  if (piece.lh) add(piece.lh, 'lh')
  return out.sort((a, b) => a.beat - b.beat)
}

/** Where a written beat actually falls: with swing, the off-beat eighth is delayed to the last third of the beat. */
export function soundingBeat(beat: number, swing?: boolean): number {
  return swing && Math.abs((beat % 1) - 0.5) < 0.01 ? beat + 1 / 6 : beat
}

/** Every note onset of a piece in time order; both hands merged into one step when they land together. */
export function timeline(piece: Piece): Step[] {
  const out: Step[] = []
  for (const o of onsetEvents(piece)) {
    const last = out[out.length - 1]
    if (last && last.beat === o.beat) {
      last.len = Math.max(last.len, o.len)
      last.midi = [...last.midi, ...o.ev.midi]
    } else out.push({ beat: o.beat, at: soundingBeat(o.beat, piece.swing), len: o.len, midi: [...o.ev.midi] })
  }
  return out
}

export function totalBeats(piece: Piece): number {
  const sum = (evs: Ev[]) => evs.reduce((n, e) => n + BEATS[e.dur], 0)
  return Math.max(sum(piece.rh), piece.lh ? sum(piece.lh) : 0)
}

export function barCount(piece: Piece): number {
  return Math.ceil(totalBeats(piece) / barBeats(piece))
}

/** Bars `from`..`to` (1-based, inclusive) of a piece as a piece of its own, for practising a section. */
export function sliceBars(piece: Piece, from: number, to: number): Piece {
  const per = barBeats(piece)
  const lo = (from - 1) * per
  const hi = to * per
  const cut = (evs: Ev[]) => {
    const out: Ev[] = []
    let beat = 0
    for (const e of evs) {
      if (beat >= lo && beat < hi) out.push(e)
      beat += BEATS[e.dur]
    }
    // A tie that would lead out of the section has nothing to tie to.
    if (out.length && out[out.length - 1].tie) out[out.length - 1] = { ...out[out.length - 1], tie: undefined }
    return out
  }
  return { ...piece, rh: cut(piece.rh), lh: piece.lh ? cut(piece.lh) : undefined, chords: carryChords(piece.chords, from, to) }
}

function carryChords(chords: string[] | undefined, from: number, to: number): string[] | undefined {
  if (!chords) return undefined
  const out = chords.slice(from - 1, to)
  // Make sure the first bar of the section names its chord even if the original only named it earlier.
  if (out.length && !out[0]) for (let i = from - 2; i >= 0; i--) if (chords[i]) { out[0] = chords[i]; break }
  return out
}

/** The chord sounding in each bar ("" where none is given), with repeats filled in. */
export function barChords(piece: Piece): string[] {
  let last = ''
  return Array.from({ length: barCount(piece) }, (_, i) => (last = piece.chords?.[i] || last))
}
