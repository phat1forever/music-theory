// Core music theory: note spelling, scales, chords, keys, fretboard mapping.

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11]
export const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
/** The 12 roots offered in pickers, spelled the way keys are usually named. */
export const ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export const mod = (n: number, m: number) => ((n % m) + m) % m

/** Pitch class (0-11) of a note name such as "F#", "Bb" or "C4". */
export function pc(name: string): number {
  const m = /^([A-Ga-g])([#b]*)/.exec(name)
  if (!m) throw new Error(`Bad note name: ${name}`)
  let v = LETTER_PC[LETTERS.indexOf(m[1].toUpperCase() as (typeof LETTERS)[number])]
  for (const a of m[2]) v += a === '#' ? 1 : -1
  return mod(v, 12)
}

/** MIDI number of a note name with octave, e.g. "C4" = 60. */
export function midi(name: string): number {
  const m = /^([A-Ga-g])([#b]*)(-?\d+)$/.exec(name)
  if (!m) throw new Error(`Bad note: ${name}`)
  let v = LETTER_PC[LETTERS.indexOf(m[1].toUpperCase() as (typeof LETTERS)[number])]
  for (const a of m[2]) v += a === '#' ? 1 : -1
  return v + (parseInt(m[3], 10) + 1) * 12
}

export function pcName(p: number, flats = false): string {
  return (flats ? FLAT_NAMES : SHARP_NAMES)[mod(p, 12)]
}

export function midiName(n: number, flats = false): string {
  return pcName(n, flats) + (Math.floor(n / 12) - 1)
}

export function midiFreq(n: number): number {
  return 440 * Math.pow(2, (n - 69) / 12)
}

export function freqMidi(f: number): number {
  return 69 + 12 * Math.log2(f / 440)
}

export interface Formula {
  name: string
  /** semitones above the root */
  steps: number[]
  /** scale degree (1-7) of each step, used to pick letter names */
  degrees: number[]
  /** degree labels such as "b3" */
  labels: string[]
  about?: string
}

function f(name: string, spec: string, about?: string): Formula {
  const BASE = [0, 2, 4, 5, 7, 9, 11]
  const labels = spec.split(' ')
  const steps: number[] = []
  const degrees: number[] = []
  for (const l of labels) {
    const m = /^([#b]*)(\d+)$/.exec(l)!
    const d = parseInt(m[2], 10)
    let s = BASE[(d - 1) % 7] + (d > 7 ? 12 : 0)
    for (const a of m[1]) s += a === '#' ? 1 : -1
    steps.push(s)
    degrees.push(((d - 1) % 7) + 1)
  }
  return { name, steps, degrees, labels, about }
}

export const SCALES: Record<string, Formula> = {
  major: f('Major', '1 2 3 4 5 6 7', 'The home base of Western music. Bright and resolved.'),
  minor: f('Natural minor', '1 2 b3 4 5 b6 b7', 'Darker and more serious than major.'),
  minorPent: f('Minor pentatonic', '1 b3 4 5 b7', 'Five notes, no clashes. The first soloing scale for rock and blues.'),
  majorPent: f('Major pentatonic', '1 2 3 5 6', 'Sweet and open. Country, pop and southern rock leads.'),
  blues: f('Blues', '1 b3 4 b5 5 b7', 'Minor pentatonic plus the "blue note" (b5).'),
  dorian: f('Dorian', '1 2 b3 4 5 6 b7', 'Minor with a brighter 6th. Funk, Santana-style rock.'),
  mixolydian: f('Mixolydian', '1 2 3 4 5 6 b7', 'Major with a flat 7th. Blues-rock and classic rock.'),
  harmonicMinor: f('Harmonic minor', '1 2 b3 4 5 b6 7', 'Minor with a raised 7th. Classical and neo-classical colour.'),
}

export const CHORDS: Record<string, Formula & { suffix: string }> = {
  maj: { ...f('Major', '1 3 5'), suffix: '' },
  min: { ...f('Minor', '1 b3 5'), suffix: 'm' },
  dim: { ...f('Diminished', '1 b3 b5'), suffix: 'dim' },
  aug: { ...f('Augmented', '1 3 #5'), suffix: 'aug' },
  sus2: { ...f('Suspended 2nd', '1 2 5'), suffix: 'sus2' },
  sus4: { ...f('Suspended 4th', '1 4 5'), suffix: 'sus4' },
  '5': { ...f('Power chord', '1 5'), suffix: '5' },
  '7': { ...f('Dominant 7th', '1 3 5 b7'), suffix: '7' },
  maj7: { ...f('Major 7th', '1 3 5 7'), suffix: 'maj7' },
  m7: { ...f('Minor 7th', '1 b3 5 b7'), suffix: 'm7' },
  m7b5: { ...f('Half-diminished', '1 b3 b5 b7'), suffix: 'm7b5' },
  '6': { ...f('Major 6th', '1 3 5 6'), suffix: '6' },
  m6: { ...f('Minor 6th', '1 b3 5 6'), suffix: 'm6' },
  add9: { ...f('Add 9', '1 3 5 9'), suffix: 'add9' },
  '9': { ...f('Dominant 9th', '1 3 5 b7 9'), suffix: '9' },
  dim7: { ...f('Diminished 7th', '1 b3 b5 6'), suffix: 'dim7' },
}

/** Spell the notes of a formula from a root, with correct letter names (e.g. F major has Bb, not A#). */
export function spell(root: string, formula: Formula): string[] {
  const rootLetter = LETTERS.indexOf(root[0].toUpperCase() as (typeof LETTERS)[number])
  const rootPc = pc(root)
  return formula.steps.map((s, i) => {
    const letter = (rootLetter + formula.degrees[i] - 1) % 7
    let diff = mod(rootPc + s - LETTER_PC[letter], 12)
    if (diff > 6) diff -= 12
    return LETTERS[letter] + (diff > 0 ? '#'.repeat(diff) : 'b'.repeat(-diff))
  })
}

export function pcs(root: string, formula: Formula): number[] {
  return formula.steps.map((s) => mod(pc(root) + s, 12))
}

/** Does this key/scale read better with flats? */
export function prefersFlats(root: string, scale = 'major'): boolean {
  if (root.includes('b')) return true
  if (root.includes('#')) return false
  const minorish = ['minor', 'minorPent', 'blues', 'dorian', 'harmonicMinor'].includes(scale)
  return minorish ? ['C', 'D', 'F', 'G'].includes(root) : root === 'F'
}

/** Name a pitch class the way it is spelled in a given root + formula (falls back to sharps/flats). */
export function nameIn(p: number, root: string, formula: Formula, scaleKey = 'major'): string {
  const names = spell(root, formula)
  const i = pcs(root, formula).indexOf(mod(p, 12))
  return i >= 0 ? names[i] : pcName(p, prefersFlats(root, scaleKey))
}

export interface DiatonicChord {
  roman: string
  root: string
  quality: 'maj' | 'min' | 'dim'
  name: string
  notes: string[]
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

/** The seven triads built on each degree of a major or natural-minor key. */
export function diatonicChords(root: string, mode: 'major' | 'minor' = 'major'): DiatonicChord[] {
  const scale = SCALES[mode]
  const names = spell(root, scale)
  const steps = scale.steps
  return names.map((n, i) => {
    const third = mod(steps[(i + 2) % 7] - steps[i], 12)
    const fifth = mod(steps[(i + 4) % 7] - steps[i], 12)
    const quality = fifth === 6 ? 'dim' : third === 3 ? 'min' : 'maj'
    const roman =
      quality === 'maj' ? ROMAN[i] : ROMAN[i].toLowerCase() + (quality === 'dim' ? '°' : '')
    return {
      roman,
      root: n,
      quality,
      name: n + CHORDS[quality].suffix,
      notes: [names[i], names[(i + 2) % 7], names[(i + 4) % 7]],
    }
  })
}

/** Circle of fifths, clockwise from C: major key, relative minor, and accidental count (+sharps / -flats). */
export const CIRCLE = [
  { major: 'C', minor: 'A', acc: 0 },
  { major: 'G', minor: 'E', acc: 1 },
  { major: 'D', minor: 'B', acc: 2 },
  { major: 'A', minor: 'F#', acc: 3 },
  { major: 'E', minor: 'C#', acc: 4 },
  { major: 'B', minor: 'G#', acc: 5 },
  { major: 'F#', minor: 'D#', acc: 6 },
  { major: 'Db', minor: 'Bb', acc: -5 },
  { major: 'Ab', minor: 'F', acc: -4 },
  { major: 'Eb', minor: 'C', acc: -3 },
  { major: 'Bb', minor: 'G', acc: -2 },
  { major: 'F', minor: 'D', acc: -1 },
]

export const INTERVALS = [
  { semis: 0, short: 'P1', name: 'Unison' },
  { semis: 1, short: 'm2', name: 'Minor 2nd' },
  { semis: 2, short: 'M2', name: 'Major 2nd' },
  { semis: 3, short: 'm3', name: 'Minor 3rd' },
  { semis: 4, short: 'M3', name: 'Major 3rd' },
  { semis: 5, short: 'P4', name: 'Perfect 4th' },
  { semis: 6, short: 'TT', name: 'Tritone' },
  { semis: 7, short: 'P5', name: 'Perfect 5th' },
  { semis: 8, short: 'm6', name: 'Minor 6th' },
  { semis: 9, short: 'M6', name: 'Major 6th' },
  { semis: 10, short: 'm7', name: 'Minor 7th' },
  { semis: 11, short: 'M7', name: 'Major 7th' },
  { semis: 12, short: 'P8', name: 'Octave' },
]

// ---------- Guitar ----------

/** Standard tuning, index 0 = string 1 (high E) ... index 5 = string 6 (low E). */
export const TUNING = [64, 59, 55, 50, 45, 40]
export const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

/** MIDI note sounded at a string (1-6) and fret. */
export function fretMidi(string: number, fret: number): number {
  return TUNING[string - 1] + fret
}

export interface FretPos {
  string: number
  fret: number
}

/** All positions of a set of pitch classes within a fret range. */
export function positions(pitchClasses: number[], lo = 0, hi = 15): FretPos[] {
  const out: FretPos[] = []
  for (let s = 1; s <= 6; s++)
    for (let fr = lo; fr <= hi; fr++)
      if (pitchClasses.includes(mod(fretMidi(s, fr), 12))) out.push({ string: s, fret: fr })
  return out
}

/** Lowest-fret position for a MIDI note, preferring frets within [lo, hi]. */
export function midiToFret(n: number, lo = 0, hi = 4): FretPos | null {
  let best: FretPos | null = null
  for (let s = 6; s >= 1; s--) {
    const fr = n - TUNING[s - 1]
    if (fr < 0 || fr > 22) continue
    if (fr >= lo && fr <= hi) return { string: s, fret: fr }
    if (!best || fr < best.fret) best = { string: s, fret: fr }
  }
  return best
}

/**
 * The five pentatonic "boxes". Box n starts on the n-th note of the minor pentatonic
 * on the low E string. On every string the box uses two neighbouring scale notes,
 * the lower one being the scale note closest to the box's starting fret.
 */
export function pentatonicBox(
  root: string,
  box: number,
  kind: 'minorPent' | 'majorPent' | 'blues' = 'minorPent',
): FretPos[] {
  // A major pentatonic shares its notes with the minor pentatonic three semitones lower.
  const minorRoot = kind === 'majorPent' ? mod(pc(root) - 3, 12) : pc(root)
  const pent = SCALES.minorPent.steps.map((s) => mod(minorRoot + s, 12))
  // Boxes climb the neck from box 1; one that would start above fret 12 wraps to the low end.
  const first = mod(minorRoot - 4, 12)
  let start = mod(minorRoot + SCALES.minorPent.steps[box - 1] - 4, 12)
  if (start < first) start += 12
  if (start > 12) start -= 12
  const blue = mod(minorRoot + 6, 12)
  const out: FretPos[] = []
  for (let s = 6; s >= 1; s--) {
    const frets: number[] = []
    for (let fr = 0; fr <= 24; fr++) if (pent.includes(mod(fretMidi(s, fr), 12))) frets.push(fr)
    let lo = 0
    for (let i = 1; i < frets.length - 1; i++)
      if (Math.abs(frets[i] - start) < Math.abs(frets[lo] - start)) lo = i
    out.push({ string: s, fret: frets[lo] }, { string: s, fret: frets[lo + 1] })
    if (kind === 'blues')
      for (let fr = frets[lo] + 1; fr <= frets[lo + 1] + 1; fr++)
        if (mod(fretMidi(s, fr), 12) === blue) out.push({ string: s, fret: fr })
  }
  return out
}

// ---------- Open-position chord shapes (string 6 -> 1; -1 = muted) ----------

export interface ChordShape {
  frets: number[]
  fingers: number[]
  barre?: { fret: number; from: number; to: number }
}

export const CHORD_SHAPES: Record<string, ChordShape> = {
  E: { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  Em: { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  A: { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  Am: { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  D: { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  Dm: { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  G: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  C: { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  E7: { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  A7: { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  D7: { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  B7: { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  F: { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
  Fm: { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
  Bm: { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 5, to: 1 } },
  B: { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, from: 5, to: 1 } },
  E5: { frets: [0, 2, 2, -1, -1, -1], fingers: [0, 1, 2, 0, 0, 0] },
  A5: { frets: [-1, 0, 2, 2, -1, -1], fingers: [0, 0, 1, 2, 0, 0] },
  G5: { frets: [3, 5, 5, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] },
  C5: { frets: [-1, 3, 5, 5, -1, -1], fingers: [0, 1, 3, 4, 0, 0] },
  D5: { frets: [-1, 5, 7, 7, -1, -1], fingers: [0, 1, 3, 4, 0, 0] },
}

/** MIDI notes of a chord shape, low to high. */
export function shapeMidi(shape: ChordShape): number[] {
  return shape.frets
    .map((fr, i) => (fr < 0 ? -1 : fretMidi(6 - i, fr)))
    .filter((n) => n >= 0)
}

/** Parse a chord symbol such as "Am", "F#m7" or "G" into root + quality key. */
export function parseChord(symbol: string): { root: string; quality: string } {
  const m = /^([A-G][#b]?)(.*)$/.exec(symbol)
  if (!m) throw new Error(`Bad chord: ${symbol}`)
  const q = Object.keys(CHORDS).find((k) => CHORDS[k].suffix === m[2])
  return { root: m[1], quality: q ?? 'maj' }
}

/** A playable keyboard voicing of a chord, root position, starting from the given octave. */
export function chordMidi(symbol: string, octave = 3): number[] {
  const { root, quality } = parseChord(symbol)
  const base = pc(root) + (octave + 1) * 12
  return CHORDS[quality].steps.map((s) => base + s)
}
