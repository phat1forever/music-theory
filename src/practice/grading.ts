// Grading of played notes against an exercise, plus tempo progression and spaced review.
import type { Step } from '../theory/music'

export type Source = 'mic' | 'midi' | 'click'

export interface Played {
  midi: number
  /** seconds from the start of the exercise */
  time: number
}

const samePc = (a: number, b: number) => (((a - b) % 12) + 12) % 12 === 0

/**
 * Does a played note count toward a step?
 * A microphone often hears a note an octave off, so mic input matches on note name only.
 */
export function noteMatches(step: Step, played: number, source: Source): boolean {
  return source === 'mic' ? step.midi.some((m) => samePc(m, played)) : step.midi.includes(played)
}

/**
 * How many distinct notes are needed to complete a step.
 * A microphone can only follow one pitch at a time, so one chord tone is enough there.
 */
export function notesNeeded(step: Step, source: Source): number {
  return source === 'mic' ? 1 : new Set(step.midi).size
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
}

/** Grade a performance played along with the metronome. `tol` is the timing window in seconds. */
export function gradeTimed(
  steps: Step[],
  played: Played[],
  secPerBeat: number,
  source: Source,
  tol = 0.25,
): TimedResult {
  const used = new Set<number>()
  let offsetSum = 0
  let hits = 0
  const outcome = steps.map((step) => {
    const t = step.beat * secPerBeat
    const got = new Set<number>()
    let firstOffset: number | null = null
    played.forEach((p, i) => {
      if (used.has(i) || Math.abs(p.time - t) > tol || !noteMatches(step, p.midi, source)) return
      const key = source === 'mic' ? 0 : p.midi
      if (got.has(key)) return
      got.add(key)
      used.add(i)
      firstOffset ??= p.time - t
    })
    const ok = got.size >= notesNeeded(step, source)
    if (ok) {
      hits++
      offsetSum += firstOffset ?? 0
    }
    return ok
  })
  return {
    hits,
    total: steps.length,
    accuracy: steps.length ? hits / steps.length : 0,
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
