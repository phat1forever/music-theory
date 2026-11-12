// Chord shapes for any tuning and capo position, found by searching the fretboard.
import { CHORD_SHAPES, CHORDS, mod, parseChord, pc, type ChordShape } from './theory'

/** Tunings, low string to high string, as MIDI notes. */
export const TUNINGS: Record<string, { name: string; notes: number[] }> = {
  standard: { name: 'Standard (E A D G B E)', notes: [40, 45, 50, 55, 59, 64] },
  dropD: { name: 'Drop D (D A D G B E)', notes: [38, 45, 50, 55, 59, 64] },
  halfDown: { name: 'Half step down (E♭)', notes: [39, 44, 49, 54, 58, 63] },
  wholeDown: { name: 'Whole step down (D)', notes: [38, 43, 48, 53, 57, 62] },
  dadgad: { name: 'DADGAD', notes: [38, 45, 50, 55, 57, 62] },
  openG: { name: 'Open G (D G D G B D)', notes: [38, 43, 50, 55, 59, 62] },
  openD: { name: 'Open D (D A D F♯ A D)', notes: [38, 45, 50, 54, 57, 62] },
  openE: { name: 'Open E (E B E G♯ B E)', notes: [40, 47, 52, 56, 59, 64] },
}

const isStandard = (t: number[]) => t.every((n, i) => n === TUNINGS.standard.notes[i])

function fingerShape(frets: number[]): { shape: ChordShape; fingers: number; barre: boolean } {
  const fretted = frets.map((f, i) => ({ f, i })).filter((x) => x.f > 0)
  const fingers = Array(6).fill(0) as number[]
  if (!fretted.length) return { shape: { frets, fingers }, fingers: 0, barre: false }
  const minF = Math.min(...fretted.map((x) => x.f))
  const atMin = fretted.filter((x) => x.f === minF)
  // A barre lies across every string from its lowest string to the top, so none of those may be open.
  const barre = atMin.length >= 2 && frets.slice(atMin[0].i).every((f) => f !== 0)
  const rest = fretted.filter((x) => !(barre && x.f === minF)).sort((a, b) => a.f - b.f || a.i - b.i)
  let n = barre ? 2 : 1
  if (barre) atMin.forEach((x) => (fingers[x.i] = 1))
  rest.forEach((x) => (fingers[x.i] = Math.min(4, n++)))
  const shape: ChordShape = { frets, fingers }
  if (barre) shape.barre = { fret: minF, from: 6 - atMin[0].i, to: 6 - atMin[atMin.length - 1].i }
  return { shape, fingers: rest.length + (barre ? 1 : 0), barre }
}

/**
 * Playable shapes for a chord, best first. `open` is the pitch of each open string (low to high)
 * with any capo already added; frets in the result are counted from the nut or capo.
 */
export function voicings(open: number[], symbol: string, limit = 4): ChordShape[] {
  const { root, quality } = parseChord(symbol)
  const steps = CHORDS[quality].steps.map((s) => mod(s, 12))
  const rootPc = pc(root)
  const tones = steps.map((s) => mod(rootPc + s, 12))
  const power = steps.length === 2
  const found = new Map<string, { shape: ChordShape; score: number }>()

  const search = (required: number[]) => {
    for (let base = 1; base <= 10; base++) {
      const options = open.map((o) => {
        const opts = [-1]
        if (tones.includes(mod(o, 12))) opts.push(0)
        for (let f = base; f <= base + 3; f++) if (tones.includes(mod(o + f, 12))) opts.push(f)
        return opts
      })
      const frets = Array(6).fill(-1) as number[]
      const walk = (i: number) => {
        if (i < 6) {
          for (const f of options[i]) {
            frets[i] = f
            walk(i + 1)
          }
          return
        }
        const sounding = frets.map((f, s) => ({ f, s })).filter((x) => x.f >= 0)
        if (sounding.length < (power ? 2 : 4)) return
        const lo = sounding[0].s
        const hi = sounding[sounding.length - 1].s
        const inner = hi - lo + 1 - sounding.length // muted strings between sounding ones
        if (power ? inner > 0 || sounding.length > 3 || lo > 2 : inner > 1 || hi < 4 || lo > 2) return
        // The lowest pitch, not just the lowest string, must be the root.
        const bass = sounding.reduce((a, x) => (open[x.s] + x.f < open[a.s] + a.f ? x : a))
        if (mod(open[bass.s] + bass.f, 12) !== rootPc) return
        const heard = new Set(sounding.map((x) => mod(open[x.s] + x.f, 12)))
        if (!required.every((t) => heard.has(t))) return
        const key = frets.join(',')
        if (found.has(key)) return
        const { shape, fingers, barre } = fingerShape([...frets])
        if (fingers > 4) return
        const fretted = frets.filter((f) => f > 0)
        const pos = fretted.length ? Math.min(...fretted) : 0
        const span = fretted.length ? Math.max(...fretted) - pos : 0
        const score = pos * 1.2 + fingers * 0.5 + span * 0.4 + (barre ? 0.6 : 0) - sounding.length * 0.9 + inner * 1.5 + (hi < 5 && !power ? 0.4 : 0)
        found.set(key, { shape, score })
      }
      walk(0)
    }
  }

  // Five-note chords (9ths) are normally played without the fifth.
  const fifth = mod(rootPc + 7, 12)
  search(tones.length >= 5 ? tones.filter((t) => t !== fifth) : tones)
  // Four-note chords often drop the fifth when no full shape is reachable.
  if (!found.size && tones.length >= 4) search(tones.filter((t) => t !== fifth))

  const ranked = [...found.values()].sort((a, b) => a.score - b.score).map((x) => x.shape)
  // In standard tuning, lead with the shape players actually learn first.
  const known = isStandardRelative(open) ? knownShape(open, symbol) : null
  const out = known ? [known, ...ranked.filter((s) => s.frets.join() !== known.frets.join())] : ranked
  return out.slice(0, limit)
}

/** Standard tuning, possibly shifted up or down as a whole (capo, or tuned down). */
function isStandardRelative(open: number[]): boolean {
  const shift = open[0] - TUNINGS.standard.notes[0]
  return isStandard(open.map((n) => n - shift))
}

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

function knownShape(open: number[], symbol: string): ChordShape | null {
  const shift = open[0] - TUNINGS.standard.notes[0]
  const { root, quality } = parseChord(symbol)
  const p = mod(pc(root) - shift, 12)
  const suffix = CHORDS[quality].suffix
  return CHORD_SHAPES[SHARP[p] + suffix] ?? CHORD_SHAPES[FLAT[p] + suffix] ?? null
}

/** Move a chord symbol up or down by semitones, keeping its quality. */
export function transpose(symbol: string, semis: number, flats = false): string {
  const { root, quality } = parseChord(symbol)
  return (flats ? FLAT : SHARP)[mod(pc(root) + semis, 12)] + CHORDS[quality].suffix
}

export function soundingMidi(open: number[], shape: ChordShape): number[] {
  return shape.frets.map((f, i) => (f < 0 ? -1 : open[i] + f)).filter((n) => n >= 0)
}

/** A diagram-ready shape (fingers and barre worked out) from six fret numbers, low string first; -1 = muted. */
export function shapeFromFrets(frets: number[]): ChordShape {
  return fingerShape([...frets]).shape
}
