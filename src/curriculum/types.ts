import type { Mark } from '../components/Fretboard'
import type { KeyMark } from '../components/Keyboard'
import type { Piece } from '../theory/music'
import { midi, mod } from '../theory/theory'

export interface Exercise {
  id: string
  title: string
  piece: Piece
  /** starting tempo and the tempo that counts as mastered (beats per minute) */
  tempo: number
  target: number
  tip?: string
  flats?: boolean
}

export interface Quiz {
  q: string
  options: string[]
  answer: number
  why?: string
}

export type StepDef =
  | { t: 'text'; title?: string; body: string }
  | { t: 'fretboard'; title?: string; marks: Mark[]; from?: number; to?: number; muted?: number[]; caption?: string }
  | { t: 'box'; root: string; box: number; kind: 'minorPent' | 'majorPent' | 'blues'; caption?: string; minFret?: number }
  | { t: 'scale'; root: string; scale: string; on: 'guitar' | 'keys' | 'both'; from?: number; to?: number; caption?: string }
  | { t: 'keyboard'; title?: string; marks: KeyMark[]; from?: number; to?: number; caption?: string }
  | { t: 'chords'; names: string[]; caption?: string }
  | { t: 'score'; piece: Piece; caption?: string; tempo?: number; flats?: boolean }
  | { t: 'circle'; caption?: string }
  | { t: 'tuner' }
  | { t: 'exercise'; ex: Exercise }
  | ({ t: 'quiz' } & Quiz)

/** The areas a player develops, often unevenly. Each instrument uses a subset. */
export type Skill = 'rhythm' | 'chords' | 'fingerstyle' | 'lead' | 'reading' | 'technique' | 'hands' | 'expression' | 'theory' | 'ear'

export interface Lesson {
  id: string
  title: string
  goal: string
  minutes: number
  /** ids of theory lessons that help with this one, shown as "Helpful to know first" */
  related?: string[]
  /** the skill this lesson builds, when it differs from its unit's */
  skill?: Skill
  steps: StepDef[]
}

export interface Unit {
  id: string
  title: string
  level: 'Beginner' | 'Late beginner' | 'Early intermediate' | 'Intermediate' | 'Advancing'
  about: string
  lessons: Lesson[]
  /**
   * A studio unit: outside the step-by-step path. Every lesson in it is open from the start, so players whose skills
   * are uneven can go straight to what they need. Studio units have no placement questions.
   */
  free?: boolean
  /** the skill this unit builds (lessons can override it) */
  skill?: Skill
  /** answer this correctly in the placement check to skip the unit (core units only) */
  placement?: Quiz
  /** a second question, for units with nothing to play (the theory track) */
  placement2?: Quiz
  /**
   * A short piece to play, in time, as part of the placement check. The unit is only skipped if the question is answered
   * correctly AND this is played cleanly (microphone or MIDI are graded; otherwise the player rates themselves).
   */
  check?: { title: string; piece: Piece; tempo: number; flats?: boolean }
}

export interface Track {
  id: 'theory' | 'guitar' | 'keys'
  title: string
  blurb: string
  units: Unit[]
}

// ---- small builders that keep the lesson files readable ----

export const text = (title: string, body: string): StepDef => ({ t: 'text', title, body })

export const quiz = (q: string, options: string[], answer: number, why?: string): StepDef => ({
  t: 'quiz',
  q,
  options,
  answer,
  why,
})

export const exercise = (
  id: string,
  title: string,
  piece: Piece,
  tempo: number,
  target: number,
  tip?: string,
  flats?: boolean,
): StepDef => ({ t: 'exercise', ex: { id, title, piece, tempo, target, tip, flats } })

/** Fretboard marks from "string/fret=label" tokens; prefix * for root, + for chord tone. */
export function fm(src: string): Mark[] {
  return src.split(/\s+/).map((tok) => {
    const kind = tok[0] === '*' ? 'root' : tok[0] === '+' ? 'chord' : 'tone'
    const [pos, label] = tok.replace(/^[*+]/, '').split('=')
    const [s, fr] = pos.split('/').map(Number)
    return { string: s, fret: fr, label, kind }
  })
}

const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']

/** Keyboard marks from "C4=1" tokens (label defaults to the note name); prefix * root, + chord, _ left hand. */
export function km(src: string): KeyMark[] {
  return src.split(/\s+/).map((tok) => {
    const kind = tok[0] === '*' ? 'root' : tok[0] === '+' ? 'chord' : tok[0] === '_' ? 'lh' : 'tone'
    const [note, label] = tok.replace(/^[*+_]/, '').split('=')
    const m = midi(note)
    return { midi: m, label: label ?? NAMES[mod(m, 12)], kind }
  })
}
