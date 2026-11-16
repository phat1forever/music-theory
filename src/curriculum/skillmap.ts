// Which skill each lesson builds. Used by the skill map, and to open lessons for players who rate a skill highly.
import type { Lesson, Skill, Unit } from './types'

const BY_ID: Record<string, Skill> = {
  // guitar: core path
  'g-setup': 'theory',
  'g-tuning': 'theory',
  'g-tab': 'theory',
  'g-notes-high': 'theory',
  'g-notes-low': 'theory',
  'g-practice': 'theory',
  'g-chords-1': 'chords',
  'g-chords-2': 'chords',
  'g-strum': 'rhythm',
  'g-changes': 'chords',
  'g-strum2': 'rhythm',
  'g-colour': 'chords',
  'g-songs': 'rhythm',
  'g-fretmap': 'theory',
  'g-power': 'chords',
  'g-riffs': 'lead',
  'g-12bar': 'rhythm',
  'g-shuffle': 'rhythm',
  'g-next': 'theory',
  // keyboard: core path
  'k-posture': 'technique',
  'k-five': 'technique',
  'k-lh': 'technique',
  'k-turns': 'reading',
  'k-practice': 'technique',
  'k-read': 'reading',
  'k-intervals': 'reading',
  'k-cscale': 'technique',
  'k-gf': 'technique',
  'k-minor': 'technique',
  'k-triads': 'chords',
  'k-inversions': 'chords',
  'k-arpeggios': 'technique',
  'k-lhpat': 'chords',
  'k-together': 'hands',
  'k-leftmelody': 'hands',
  'k-scales-together': 'technique',
  'k-chordmelody': 'hands',
  'k-waltz': 'hands',
  'k-jingle': 'hands',
  'k-ties': 'reading',
  'k-pedal': 'expression',
  'k-gpiece': 'reading',
  'k-leadsheet': 'chords',
  'k-next': 'technique',
}

const UNIT_DEFAULT: Record<string, Skill> = { g3: 'chords', g4: 'lead', g5: 'lead' }

/** The skill a lesson builds: its own tag, else its unit's, else the table above. */
export function skillOf(unit: Unit, lesson: Lesson): Skill {
  return lesson.skill ?? BY_ID[lesson.id] ?? unit.skill ?? UNIT_DEFAULT[unit.id] ?? 'theory'
}
