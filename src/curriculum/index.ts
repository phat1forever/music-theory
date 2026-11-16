import { guitar } from './guitar'
import { keyboard } from './keys'
import { theory } from './theory'
import type { Exercise, Lesson, Track, Unit } from './types'
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

/** First lesson of a track that is neither done nor skipped. */
export function nextLesson(trackId: string, p: Profile): LessonRef | undefined {
  return trackLessons(trackId).find((r) => !p.lessons[r.lesson.id])
}

/** A lesson is open once every earlier lesson in its track is done or skipped. Finished lessons stay open. */
export function isOpen(ref: LessonRef, p: Profile): boolean {
  if (p.lessons[ref.lesson.id]) return true
  return nextLesson(ref.track.id, p)?.lesson.id === ref.lesson.id
}

export function trackProgress(trackId: string, p: Profile): { done: number; skipped: number; total: number } {
  const all = trackLessons(trackId)
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

/** Exercises whose lesson has been reached (done, skipped or currently open). */
export function unlockedExercises(p: Profile): ExerciseRef[] {
  return EXERCISES.filter((r) => isOpen(r, p))
}
