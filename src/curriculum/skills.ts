// The skill map: how developed each area of a player's musicianship is, and what to work on next.
import type { EarStat, Profile } from '../store/store'
import { mastery } from '../practice/grading'
import { LESSONS, lessonSkill, type LessonRef } from './index'
import type { Skill } from './types'

export type Instrument = 'guitar' | 'keys'

export interface SkillInfo {
  id: Skill
  name: string
  /** what "comfortable" looks like: the yardstick for rating yourself */
  benchmark: string
}

export const SKILLS: Record<Instrument, SkillInfo[]> = {
  guitar: [
    { id: 'rhythm', name: 'Rhythm and strumming', benchmark: 'You can strum a whole song in time with a pattern that has gaps in it, and keep going through chord changes.' },
    { id: 'chords', name: 'Chords and changes', benchmark: 'You change between open chords without stopping, and can play F and Bm as barre chords.' },
    { id: 'fingerstyle', name: 'Fingerpicking', benchmark: 'You can keep an arpeggio pattern going with thumb and fingers through a chord progression.' },
    { id: 'lead', name: 'Scales and soloing', benchmark: 'You can improvise a simple solo over a 12-bar blues with the pentatonic scale, using bends and hammer-ons.' },
    { id: 'theory', name: 'Fretboard and theory', benchmark: 'You can name the notes on the two lowest strings, and say which chords belong to a key.' },
    { id: 'ear', name: 'Ear', benchmark: 'You can tell major from minor, and find a simple tune on the guitar without music.' },
  ],
  keys: [
    { id: 'reading', name: 'Reading', benchmark: 'You can read a new, simple piece in both clefs slowly without writing in the note names.' },
    { id: 'technique', name: 'Scales and technique', benchmark: 'You can play C, G and F major scales hands together with the correct fingering.' },
    { id: 'chords', name: 'Chords and accompaniment', benchmark: 'You can play I, IV and V in close position in two keys and accompany a melody from chord symbols.' },
    { id: 'hands', name: 'Hands together', benchmark: 'You can play a piece where the hands have different rhythms, such as a melody over a broken-chord bass.' },
    { id: 'expression', name: 'Pedal and expression', benchmark: 'You change the sustain pedal cleanly with the harmony and can make a melody louder than its accompaniment.' },
    { id: 'theory', name: 'Theory', benchmark: 'You can build major and minor triads, and say which chords belong to a key.' },
    { id: 'ear', name: 'Ear', benchmark: 'You can tell major from minor, and find a simple tune on the keys without music.' },
  ],
}

export const RATINGS = ['New to me', 'Developing', 'Comfortable', 'Strong']
export const EAR_DRILLS = ['intervals', 'chords', 'scales', 'progressions', 'echo', 'rhythm']

/** The lessons that build a skill, in teaching order: the instrument's own, plus the shared theory and ear lessons. */
export function skillLessons(instrument: Instrument, skill: Skill): LessonRef[] {
  return LESSONS.filter((r) => (r.track.id === instrument || ((skill === 'theory' || skill === 'ear') && r.track.id === 'theory')) && lessonSkill(r) === skill)
}

/** Share of recent answers that were right at a level, or null with fewer than five answers. */
export function earAccuracy(stat: EarStat | undefined, level: number): number | null {
  const recent = stat?.recent[level]?.slice(-10) ?? []
  return recent.length < 5 ? null : recent.reduce((a, b) => a + b, 0) / recent.length
}

/** 0-1: how far ear training has come, from the highest level passed (80% of the last ten) in each drill. */
export function earEvidence(p: Profile): number {
  const best = EAR_DRILLS.map((d) => Math.max(0, ...[1, 2, 3].filter((lv) => (earAccuracy(p.ear[d], lv) ?? 0) >= 0.8)))
  return best.reduce((a, b) => a + b, 0) / (EAR_DRILLS.length * 3)
}

export interface SkillState {
  info: SkillInfo
  /** the player's own rating (0-3), if given */
  self: number | null
  lessons: LessonRef[]
  done: number
  /** 0-1 from lessons completed and exercises brought up to tempo (and drill results, for the ear) */
  evidence: number
  /** 0-1 overall: the self-rating and the evidence, averaged when both exist */
  level: number
}

export function skillState(instrument: Instrument, info: SkillInfo, p: Profile): SkillState {
  const lessons = skillLessons(instrument, info.id)
  const done = lessons.filter((r) => p.lessons[r.lesson.id] === 'done').length
  const exercises = lessons.flatMap((r) => r.lesson.steps.flatMap((s) => (s.t === 'exercise' ? [s.ex] : [])))
  const tempo = exercises.length ? exercises.reduce((sum, ex) => sum + mastery(ex.tempo, ex.target, p.exercises[ex.id]), 0) / exercises.length : 0
  const lessonShare = lessons.length ? done / lessons.length : 0
  let evidence = exercises.length ? lessonShare * 0.6 + tempo * 0.4 : lessonShare
  if (info.id === 'ear') evidence = lessonShare * 0.3 + earEvidence(p) * 0.7
  const raw = p.skillSelf[`${instrument}:${info.id}`]
  const self = raw === undefined ? null : raw
  const level = self === null ? evidence : (self / 3 + evidence) / 2
  return { info, self, lessons, done, evidence, level }
}

export function skillStates(instrument: Instrument, p: Profile): SkillState[] {
  return SKILLS[instrument].map((info) => skillState(instrument, info, p))
}

export interface Focus {
  state: SkillState
  /** next lessons to take for this skill */
  lessons: LessonRef[]
}

/**
 * What to work on next: the least developed skills that still have lessons to offer.
 * A player who rates a skill "comfortable" or better is pointed at its studio (intermediate) lessons first, and is
 * not sent back to basics they have marked as known; everyone else starts from the earliest lesson not yet done.
 */
export function focusSkills(instrument: Instrument, p: Profile, count = 2): Focus[] {
  return skillStates(instrument, p)
    .map((state) => {
      const todo = state.lessons.filter((r) => p.lessons[r.lesson.id] !== 'done')
      const advanced = (state.self ?? 0) >= 2
      const ordered = advanced ? [...todo.filter((r) => r.unit.free), ...todo.filter((r) => !r.unit.free && !p.lessons[r.lesson.id])] : todo
      return { state, lessons: ordered.slice(0, 3) }
    })
    .filter((f) => f.lessons.length > 0)
    .sort((a, b) => a.state.level - b.state.level)
    .slice(0, count)
}
