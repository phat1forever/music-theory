// Ear-training drills: what each one asks at each level. Pure data and question generators; the page adds sound and UI.
import { keys, type Piece } from '../theory/music'
import { CHORDS, INTERVALS, mod, pcName, SCALES, spell, type Formula } from '../theory/theory'

export interface DrillInfo {
  id: string
  name: string
  about: string
  /** what each of the three levels covers */
  levels: [string, string, string]
}

export const DRILLS: DrillInfo[] = [
  {
    id: 'intervals',
    name: 'Intervals',
    about: 'Two notes play. Name how far apart they are: the interval. Each name counts the letter names from the lower note to the upper (C up to E is a 3rd: C, D, E).',
    levels: ['Five rising intervals: 3rds, 4th, 5th, octave', 'All twelve intervals, rising', 'All twelve: rising, falling or played together'],
  },
  {
    id: 'chords',
    name: 'Chords',
    about: 'A chord plays. Name its type by its colour.',
    levels: ['Major or minor', 'Major, minor, diminished, augmented', 'Major and minor triads against 7th, major 7th and minor 7th chords'],
  },
  {
    id: 'scales',
    name: 'Scales',
    about: 'A scale plays from bottom to top. Which one is it?',
    levels: ['Major or natural minor', 'Add the major pentatonic, minor pentatonic and blues scales', 'Add Dorian, Mixolydian and harmonic minor'],
  },
  {
    id: 'progressions',
    name: 'Progressions',
    about: 'You hear the home chord, then four chords. Which progression was it?',
    levels: ['Three major-key classics', 'Six major-key progressions', 'Add minor-key and borrowed-chord progressions'],
  },
  {
    id: 'echo',
    name: 'Play it back',
    about: 'A short phrase plays. Play it back on your instrument, or tap it on screen.',
    levels: ['Three notes of the C major scale, moving by step; the first note is shown', 'Four notes of the major scale, with small skips', 'Five notes, major or minor, in different keys, with leaps'],
  },
  {
    id: 'rhythm',
    name: 'Rhythm',
    about: 'A one-bar rhythm plays after a count-in. Pick the notation that matches.',
    levels: ['Quarter, half and eighth notes', 'Add dotted notes and rests', 'Add sixteenth notes and syncopation'],
  },
]

export const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]
const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))

// ---------- intervals ----------

const INTERVAL_SETS: Record<number, number[]> = { 1: [3, 4, 5, 7, 12], 2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }

export interface IntervalQ {
  low: number
  semis: number
  how: 'up' | 'down' | 'together'
  options: number[]
}

export function intervalQuestion(level: number): IntervalQ {
  const options = INTERVAL_SETS[level]
  return { low: rand(52, 64), semis: pick(options), how: level < 3 ? 'up' : pick(['up', 'down', 'together']), options }
}

export const intervalName = (semis: number) => INTERVALS.find((i) => i.semis === semis)!.name

// Black keys are named the way they most often appear: C♯, E♭, F♯, A♭, B♭.
const FLAT_ROOTS = [3, 8, 10]
/** The usual name of a note taken on its own (no octave). */
export const rootName = (midi: number) => pcName(midi, FLAT_ROOTS.includes(mod(midi, 12)))

const INTERVAL_DEGREE = [1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8]
/** Names for the two notes of an interval, the upper one spelled by its distance (F♯ up a major 3rd is A♯, not B♭). */
export function intervalSpelling(low: number, semis: number): [string, string] {
  const root = rootName(low)
  const [, top] = spell(root, { steps: [0, semis], degrees: [1, INTERVAL_DEGREE[semis]], plain: true } as Formula)
  return [root, top]
}

/** Whether a key is written with flats (F, B♭, E♭, A♭, D♭ major; D, G, C, F, B♭, E♭ minor). */
export const flatKey = (tonic: number, minor: boolean) => (minor ? [2, 7, 0, 5, 10, 3] : [5, 10, 3, 8, 1]).includes(mod(tonic, 12))

// ---------- chords ----------

const CHORD_SETS: Record<number, string[]> = { 1: ['maj', 'min'], 2: ['maj', 'min', 'dim', 'aug'], 3: ['maj', 'min', '7', 'maj7', 'm7'] }

export interface ChordQ {
  root: number
  quality: string
  options: string[]
}

export function chordQuestion(level: number): ChordQ {
  const options = CHORD_SETS[level]
  return { root: rand(52, 62), quality: pick(options), options }
}

// ---------- scales ----------

const SCALE_SETS: Record<number, string[]> = {
  1: ['major', 'minor'],
  2: ['major', 'minor', 'majorPent', 'minorPent', 'blues'],
  3: ['major', 'minor', 'majorPent', 'minorPent', 'blues', 'dorian', 'mixolydian', 'harmonicMinor'],
}

export interface ScaleQ {
  root: number
  scale: string
  options: string[]
}

export function scaleQuestion(level: number): ScaleQ {
  const options = SCALE_SETS[level]
  return { root: rand(52, 60), scale: pick(options), options }
}

// ---------- progressions ----------

export interface Progression {
  label: string
  /** semitones above the key note, and chord quality */
  chords: [number, string][]
  minor?: boolean
}

export const PROGRESSIONS: Record<number, Progression[]> = {
  1: [
    { label: 'I – IV – V – I', chords: [[0, 'maj'], [5, 'maj'], [7, 'maj'], [0, 'maj']] },
    { label: 'I – V – vi – IV', chords: [[0, 'maj'], [7, 'maj'], [9, 'min'], [5, 'maj']] },
    { label: 'I – vi – IV – V', chords: [[0, 'maj'], [9, 'min'], [5, 'maj'], [7, 'maj']] },
  ],
  2: [
    { label: 'vi – IV – I – V', chords: [[9, 'min'], [5, 'maj'], [0, 'maj'], [7, 'maj']] },
    { label: 'ii – V – I – I', chords: [[2, 'min'], [7, 'maj'], [0, 'maj'], [0, 'maj']] },
    { label: 'I – IV – I – V', chords: [[0, 'maj'], [5, 'maj'], [0, 'maj'], [7, 'maj']] },
  ],
  // Several minor-key choices, so that hearing a minor home chord does not give the answer away.
  3: [
    { label: 'i – ♭VII – ♭VI – V', chords: [[0, 'min'], [10, 'maj'], [8, 'maj'], [7, 'maj']], minor: true },
    { label: 'i – iv – V – i', chords: [[0, 'min'], [5, 'min'], [7, 'maj'], [0, 'min']], minor: true },
    { label: 'i – ♭VI – ♭III – ♭VII', chords: [[0, 'min'], [8, 'maj'], [3, 'maj'], [10, 'maj']], minor: true },
    { label: 'i – ♭VII – ♭VI – ♭VII', chords: [[0, 'min'], [10, 'maj'], [8, 'maj'], [10, 'maj']], minor: true },
    { label: 'I – ♭VII – IV – I', chords: [[0, 'maj'], [10, 'maj'], [5, 'maj'], [0, 'maj']] },
  ],
}

export interface ProgressionQ {
  /** key note as a pitch class */
  key: number
  answer: Progression
  options: Progression[]
}

export function progressionQuestion(level: number): ProgressionQ {
  const options = [1, 2, 3].filter((lv) => lv <= level).flatMap((lv) => PROGRESSIONS[lv])
  // Lean toward the newest progressions so a higher level is not mostly revision, without starving the rest.
  const answer = Math.random() < 0.35 ? pick(PROGRESSIONS[level]) : pick(options)
  return { key: pick([0, 2, 4, 5, 7, 9]), answer, options }
}

/** A triad voiced close to middle C, with its root in the bass. */
export function chordNotes(keyPc: number, step: number, quality: string): { bass: number; notes: number[] } {
  const root = mod(keyPc + step, 12)
  return { bass: 36 + root, notes: CHORDS[quality].steps.map((s) => 55 + mod(root + s - 55, 12)).sort((a, b) => a - b) }
}

// ---------- play it back ----------

export interface EchoQ {
  tonic: number
  minor: boolean
  notes: number[]
}

export function echoQuestion(level: number): EchoQ {
  const minor = level === 3 && Math.random() < 0.5
  const tonic = level === 1 ? 60 : level === 2 ? pick([60, 62, 65, 67]) : rand(57, 65)
  // Level 1 stays between the home note and the 6th above it; the other levels reach a little past the octave.
  const steps = level === 1 ? SCALES.major.steps.slice(0, 6) : [...(minor ? SCALES.minor : SCALES.major).steps, 12, 14]
  const count = level + 2
  const maxMove = level
  let i = level === 1 ? pick([0, 0, 1, 2, 3, 4]) : pick(level === 2 ? [0, 2, 4] : [0, 2, 4, 7].filter((x) => x < steps.length))
  const notes = [tonic + steps[i]]
  while (notes.length < count) {
    const moves = []
    for (let d = -maxMove; d <= maxMove; d++) {
      if (d === 0 || i + d < 0 || i + d >= steps.length) continue
      // A tritone leap is hard to sing and to hear: leave it out.
      if (Math.abs(steps[i + d] - steps[i]) === 6) continue
      moves.push(d)
    }
    i += pick(moves)
    notes.push(tonic + steps[i])
  }
  return { tonic, minor, notes }
}

// ---------- rhythm ----------

/**
 * One-bar rhythms in 4/4. "r" is a quarter rest, "r8" an eighth rest; everything else is a note length, and a
 * trailing "-" ties it to the next note. No two rhythms of a level start their notes at the same moments, and a
 * note that crosses the middle of the bar is written as two tied notes so that beat 3 can be seen.
 */
export const RHYTHMS: Record<number, string[]> = {
  1: ['q q q q', 'h q q', 'q q h', 'h h', 'q 8 8 q q', '8 8 q 8 8 q', 'q q 8 8 q', '8 8 8 8 h', 'q h q', '8 8 q h'],
  2: ['qd 8 q q', 'q qd 8 q', 'q r q q', 'r q q q', 'qd 8 qd 8', 'r q r q', 'q 8 8 r q', 'q q r q', 'hd q', 'q q qd 8'],
  3: ['16 16 16 16 q q q', '8 16 16 q 8 16 16 q', 'q 16 16 8 q q', '8d 16 q 8d 16 q', 'q 8 8- 8 8 q', '8 q 8 q q', '16 16 8 q 16 16 8 q', 'r8 8 q r8 8 q', '8 q 8- 8 8 q', 'q 8d 16 q q'],
}

export function rhythmPiece(pattern: string): Piece {
  return keys(
    pattern
      .split(' ')
      .map((t) => (t === 'r' ? 'r' : t === 'r8' ? 'r:8' : `B4:${t}`))
      .join(' '),
  )
}

export interface RhythmQ {
  options: string[]
  answer: number
}

export function rhythmQuestion(level: number): RhythmQ {
  const pool = RHYTHMS[level]
  const answer = pick(pool)
  const others = pool.filter((p) => p !== answer).sort(() => Math.random() - 0.5).slice(0, 2)
  const options = [answer, ...others].sort(() => Math.random() - 0.5)
  return { options, answer: options.indexOf(answer) }
}
