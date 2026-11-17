import { guitar } from './guitar'
import { keyboard } from './keys'
import { theory } from './theory'
import { skillOf } from './skillmap'
import type { Exercise, Lesson, Skill, Track, Unit } from './types'
import type { Profile } from '../store/store'

export const TRACKS: Track[] = [theory, guitar, keyboard]

export interface LessonRef {
  track: Track
  unit: Unit
  lesson: Lesson
}

export const LESSONS: LessonRef[] = TRACKS.flatMap((track) =>
  track.units.flatMap((unit) => unit.lessons.map((lesson) => ({ track, unit, lesson }))),
)

export interface ExerciseRef extends LessonRef {
  ex: Exercise
}

export const EXERCISES: ExerciseRef[] = LESSONS.flatMap((ref) =>
  ref.lesson.steps.flatMap((s) => (s.t === 'exercise' ? [{ ...ref, ex: s.ex }] : [])),
)

export const findLesson = (id: string) => LESSONS.find((r) => r.lesson.id === id)
export const findExercise = (id: string) => EXERCISES.find((r) => r.ex.id === id)

export function trackLessons(trackId: string): LessonRef[] {
  return LESSONS.filter((r) => r.track.id === trackId)
}

/** The step-by-step units of a track (everything except the open studio units). */
export const coreUnits = (track: Track): Unit[] => track.units.filter((u) => !u.free)
export const studioUnits = (track: Track): Unit[] => track.units.filter((u) => u.free)

export const lessonSkill = (ref: LessonRef): Skill => skillOf(ref.unit, ref.lesson)

/** First lesson of a track's step-by-step path that is neither done nor skipped. */
export function nextLesson(trackId: string, p: Profile): LessonRef | undefined {
  return trackLessons(trackId).find((r) => !r.unit.free && !p.lessons[r.lesson.id])
}

/**
 * Is a lesson open?
 * - Studio lessons always are.
 * - On the step-by-step path, a lesson opens once every earlier one is done or skipped; finished lessons stay open.
 * - The skill map lets skills advance separately. Rating a skill at all opens the next lesson of that skill, so a
 *   player can work on a weak area without first finishing everything that comes before it on the path. Rating it
 *   "comfortable" or "strong" opens all of that skill's lessons.
 * - A lesson linked as "helpful to know first" from any lesson that is open by the rules above.
 */
export function isOpen(ref: LessonRef, p: Profile): boolean {
  // A lesson that an open lesson names as "helpful to know first" is open too, so that link never leads to a lock.
  return openOnPath(ref, p) || (RELATED_BY.get(ref.lesson.id) ?? []).some((r) => openOnPath(r, p))
}

/** Lessons that list a given lesson as related ("helpful to know first"). */
const RELATED_BY = new Map<string, LessonRef[]>()
for (const r of LESSONS) for (const id of r.lesson.related ?? []) RELATED_BY.set(id, [...(RELATED_BY.get(id) ?? []), r])

/** A skill's self-rating. The shared theory track has no ratings of its own: it takes the higher of the two instruments'. */
function ratingFor(ref: LessonRef, skill: Skill, p: Profile): number | undefined {
  if (ref.track.id !== 'theory') return p.skillSelf[`${ref.track.id}:${skill}`]
  const both = [p.skillSelf[`guitar:${skill}`], p.skillSelf[`keys:${skill}`]].filter((r) => r !== undefined)
  return both.length ? Math.max(...both) : undefined
}

function openOnPath(ref: LessonRef, p: Profile): boolean {
  if (ref.unit.free || p.lessons[ref.lesson.id]) return true
  const skill = lessonSkill(ref)
  const rating = ratingFor(ref, skill, p)
  if (rating !== undefined) {
    if (rating >= 2) return true
    const nextInSkill = trackLessons(ref.track.id).find((r) => !r.unit.free && lessonSkill(r) === skill && !p.lessons[r.lesson.id])
    if (nextInSkill?.lesson.id === ref.lesson.id) return true
  }
  return nextLesson(ref.track.id, p)?.lesson.id === ref.lesson.id
}

/** Progress along a track's step-by-step path. */
export function trackProgress(trackId: string, p: Profile): { done: number; skipped: number; total: number } {
  const all = trackLessons(trackId).filter((r) => !r.unit.free)
  return {
    done: all.filter((r) => p.lessons[r.lesson.id] === 'done').length,
    skipped: all.filter((r) => p.lessons[r.lesson.id] === 'skipped').length,
    total: all.length,
  }
}

/** Units whose lessons have all been taken (at least one for real) but whose checkpoint has not been passed. */
export function pendingCheckpoints(trackId: string, p: Profile): { track: Track; unit: Unit }[] {
  const track = TRACKS.find((t) => t.id === trackId)!
  return track.units
    .filter((u) => u.check && !p.checkpoints[u.id] && u.lessons.every((l) => p.lessons[l.id]) && u.lessons.some((l) => p.lessons[l.id] === 'done'))
    .map((unit) => ({ track, unit }))
}

/**
 * Exercises to list in Practice: those whose lesson has been reached on the step-by-step path, and studio exercises
 * once their lesson has been started (so a beginner's list is not filled with intermediate material).
 */
export function unlockedExercises(p: Profile): ExerciseRef[] {
  const started = (r: ExerciseRef) =>
    !!p.lessons[r.lesson.id] || r.lesson.steps.some((s) => s.t === 'exercise' && (p.tried.includes(s.ex.id) || !!p.exercises[s.ex.id]))
  return EXERCISES.filter((r) => (r.unit.free ? started(r) : isOpen(r, p)))
}
