// Grading of played notes against an exercise, plus tempo progression and spaced review.
import type { Step } from '../theory/music'

export type Source = 'mic' | 'midi' | 'click'

export interface Played {
  midi: number
  /** seconds from the start of the exercise */
  time: number
}

// A pitch detector sometimes lands exactly one octave out; anything further off is a different note.
const nearOctave = (a: number, b: number) => a === b || Math.abs(a - b) === 12

/**
 * Which required part of a step a played note satisfies, or null if it does not belong.
 * MIDI and on-screen taps must hit each exact note. A microphone follows one pitch at a time and can land an
 * octave out, so there one note per hand is enough: the part is the hand, not the individual note.
 */
export function matchKey(step: Step, played: number, source: Source): number | null {
  if (source !== 'mic') return step.midi.includes(played) ? played : null
  const hand = step.groups.findIndex((g) => g.some((m) => nearOctave(m, played)))
  return hand < 0 ? null : hand
}

export function noteMatches(step: Step, played: number, source: Source): boolean {
  return matchKey(step, played, source) !== null
}

/** How many distinct parts are needed to complete a step: every note, or with a microphone one note per hand. */
export function notesNeeded(step: Step, source: Source): number {
  return source === 'mic' ? step.groups.length : new Set(step.midi).size
}

/** How close to the beat a note must land: about a third of a beat, and never more than 0.2 s. */
export function timingWindow(secPerBeat: number): number {
  return Math.min(0.2, secPerBeat * 0.3)
}

export interface TimedResult {
  hits: number
  total: number
  /** 0-1 */
  accuracy: number
  /** per-step outcome, in order */
  steps: boolean[]
  /** average timing error of hits in seconds (positive = late) */
  offset: number
  /** notes played that matched nothing (not counted for the microphone, which hears stray sounds) */
  extra: number
}

/** Grade a performance played along with the metronome. `tol` is the timing window in seconds. */
export function gradeTimed(
  steps: Step[],
  played: Played[],
  secPerBeat: number,
  source: Source,
  tol = timingWindow(secPerBeat),
): TimedResult {
  const got = steps.map(() => new Set<number>())
  const firstOffset: (number | null)[] = steps.map(() => null)
  const times = steps.map((st) => st.at * secPerBeat)
  const used = new Set<number>()
  // Each played note goes to the nearest step it fits, so a late note is not charged to its neighbour.
  played.forEach((p, i) => {
    let best = -1
    let bestKey = 0
    steps.forEach((step, s) => {
      const dt = Math.abs(p.time - times[s])
      if (dt > tol || (best >= 0 && dt >= Math.abs(p.time - times[best]))) return
      const key = matchKey(step, p.midi, source)
      if (key === null || got[s].has(key)) return
      best = s
      bestKey = key
    })
    if (best < 0) return
    got[best].add(bestKey)
    used.add(i)
    firstOffset[best] ??= p.time - times[best]
  })
  const outcome = steps.map((step, s) => got[s].size >= notesNeeded(step, source))
  const hits = outcome.filter(Boolean).length
  const offsetSum = outcome.reduce((sum, ok, s) => sum + (ok ? (firstOffset[s] ?? 0) : 0), 0)
  // Wrong or extra notes cost half a note each, so hitting everything at once does not pass. Not counted:
  // the microphone's stray sounds, notes outside the piece (during the count-in or after the end), and right
  // notes that were merely early or late, which already cost a missed step.
  const start = (times[0] ?? 0) - secPerBeat
  const end = (times[times.length - 1] ?? 0) + secPerBeat
  const extra =
    source === 'mic'
      ? 0
      : played.filter(
          (p, i) =>
            !used.has(i) &&
            p.time >= start &&
            p.time <= end &&
            !steps.some((step, s) => Math.abs(p.time - times[s]) <= tol * 2.5 && noteMatches(step, p.midi, source)),
        ).length
  return {
    hits,
    total: steps.length,
    extra,
    accuracy: steps.length ? hits / (steps.length + extra * 0.5) : 0,
    steps: outcome,
    offset: hits ? offsetSum / hits : 0,
  }
}

/** Accuracy for step-by-step ("wait for me") mode: every wrong note costs part of a step. */
export function stepAccuracy(total: number, mistakes: number): number {
  if (!total) return 0
  return Math.max(0, 1 - mistakes / (total + mistakes))
}

export const PASS = 0.8

export function stars(accuracy: number): number {
  return accuracy >= 0.95 ? 3 : accuracy >= PASS ? 2 : accuracy >= 0.6 ? 1 : 0
}

export interface ExerciseProgress {
  /** fastest tempo passed */
  bestTempo: number
  bestAccuracy: number
  attempts: number
  /** days until the next review */
  interval: number
  /** ISO date (yyyy-mm-dd) the exercise is next due */
  due: string
}

/** Tempo to suggest next: start at the base tempo and climb in steps toward the target as each tempo is passed. */
export function suggestedTempo(base: number, target: number, p?: ExerciseProgress): number {
  if (!p || !p.bestTempo) return base
  return Math.min(target, Math.max(base, p.bestTempo + 8))
}

/** 0-1: how close the best passed tempo is to the target. */
export function mastery(base: number, target: number, p?: ExerciseProgress): number {
  if (!p || !p.bestTempo) return 0
  if (target <= base) return 1
  const floor = base - (target - base) / 3
  return Math.max(0.25, Math.min(1, (p.bestTempo - floor) / (target - floor)))
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Update progress after an attempt: passing doubles the review gap, failing brings it back tomorrow. */
export function recordAttempt(
  prev: ExerciseProgress | undefined,
  accuracy: number,
  tempo: number,
  today: string,
): ExerciseProgress {
  const passed = accuracy >= PASS
  const interval = passed ? Math.min(30, prev?.interval ? prev.interval * 2 : 1) : 1
  return {
    bestTempo: passed ? Math.max(prev?.bestTempo ?? 0, tempo) : (prev?.bestTempo ?? 0),
    bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
    attempts: (prev?.attempts ?? 0) + 1,
    interval,
    due: addDays(today, interval),
  }
}

/** Count of consecutive practice days ending today or yesterday. */
export function streak(days: string[], today: string): number {
  const set = new Set(days)
  let d = set.has(today) ? today : addDays(today, -1)
  let n = 0
  while (set.has(d)) {
    n++
    d = addDays(d, -1)
  }
  return n
}
