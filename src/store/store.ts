// Saved state: profiles, lesson and exercise progress, settings. Kept in localStorage.
import { useSyncExternalStore } from 'react'
import { recordAttempt, type ExerciseProgress } from '../practice/grading'

export type InputMode = 'self' | 'mic' | 'midi'
export type LessonStatus = 'done' | 'skipped'

export interface SheetChord {
  id: string
  /** chord symbol as the user picked it, e.g. "F#m7" */
  symbol: string
  /** which alternative shape to show */
  variant: number
  /** a shape the user tapped out themselves: six frets, low string first, -1 = muted */
  custom?: number[]
}

export interface Sheet {
  id: string
  name: string
  /** open string pitches, low to high, as MIDI notes */
  tuning: number[]
  capo: number
  /** are chord names the shapes relative to the capo, or the pitch actually heard? */
  names: 'shape' | 'sound'
  chords: SheetChord[]
}

export const newId = () => Math.random().toString(36).slice(2, 10)

export interface Profile {
  id: string
  name: string
  lessons: Record<string, LessonStatus>
  exercises: Record<string, ExerciseProgress>
  /** ISO dates on which something was practised */
  days: string[]
  input: InputMode
  leftHanded: boolean
  jamUnlocked: boolean
  sheets: Sheet[]
  sheet: string | null
}

export interface State {
  current: string
  profiles: Record<string, Profile>
  theme: 'auto' | 'light' | 'dark'
}

const KEY = 'music-coach:v1'

function newProfile(name: string): Profile {
  return {
    id: newId(),
    name,
    lessons: {},
    exercises: {},
    days: [],
    input: 'self',
    leftHanded: false,
    jamUnlocked: false,
    sheets: [],
    sheet: null,
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as State
      if (s.profiles && s.profiles[s.current]) {
        // Fill in fields added after a profile was first saved.
        for (const id of Object.keys(s.profiles)) s.profiles[id] = { ...newProfile(''), ...s.profiles[id] }
        return s
      }
    }
  } catch {
    // storage unavailable or corrupt: start fresh
  }
  const p = newProfile('Me')
  return { current: p.id, profiles: { [p.id]: p }, theme: 'auto' }
}

let state = load()
const subs = new Set<() => void>()

function set(next: State): void {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore: progress simply won't persist
  }
  subs.forEach((fn) => fn())
}

function patchProfile(fn: (p: Profile) => Profile): void {
  const p = state.profiles[state.current]
  set({ ...state, profiles: { ...state.profiles, [p.id]: fn(p) } })
}

export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const withToday = (days: string[]) => (days.includes(today()) ? days : [...days, today()])

export const actions = {
  completeLesson(id: string) {
    patchProfile((p) => ({ ...p, lessons: { ...p.lessons, [id]: 'done' }, days: withToday(p.days) }))
  },
  skipLessons(ids: string[]) {
    patchProfile((p) => {
      const lessons = { ...p.lessons }
      for (const id of ids) if (!lessons[id]) lessons[id] = 'skipped'
      return { ...p, lessons }
    })
  },
  attempt(exerciseId: string, accuracy: number, tempo: number) {
    patchProfile((p) => ({
      ...p,
      exercises: {
        ...p.exercises,
        [exerciseId]: recordAttempt(p.exercises[exerciseId], accuracy, tempo, today()),
      },
      days: withToday(p.days),
    }))
  },
  setInput(input: InputMode) {
    patchProfile((p) => ({ ...p, input }))
  },
  setLeftHanded(leftHanded: boolean) {
    patchProfile((p) => ({ ...p, leftHanded }))
  },
  unlockJam() {
    patchProfile((p) => ({ ...p, jamUnlocked: true }))
  },
  saveSheet(sheet: Sheet) {
    patchProfile((p) => ({
      ...p,
      sheet: sheet.id,
      sheets: p.sheets.some((x) => x.id === sheet.id) ? p.sheets.map((x) => (x.id === sheet.id ? sheet : x)) : [...p.sheets, sheet],
    }))
  },
  openSheet(id: string) {
    patchProfile((p) => ({ ...p, sheet: id }))
  },
  deleteSheet(id: string) {
    patchProfile((p) => {
      const sheets = p.sheets.filter((x) => x.id !== id)
      return { ...p, sheets, sheet: sheets[0]?.id ?? null }
    })
  },
  setTheme(theme: State['theme']) {
    set({ ...state, theme })
  },
  addProfile(name: string) {
    const p = newProfile(name.trim() || 'Player')
    set({ ...state, current: p.id, profiles: { ...state.profiles, [p.id]: p } })
  },
  switchProfile(id: string) {
    if (state.profiles[id]) set({ ...state, current: id })
  },
  renameProfile(name: string) {
    patchProfile((p) => ({ ...p, name: name.trim() || p.name }))
  },
  resetProfile() {
    patchProfile((p) => ({ ...newProfile(p.name), id: p.id, sheets: p.sheets, sheet: p.sheet }))
  },
  deleteProfile(id: string) {
    const ids = Object.keys(state.profiles)
    if (ids.length < 2) return
    const profiles = { ...state.profiles }
    delete profiles[id]
    set({ ...state, profiles, current: state.current === id ? Object.keys(profiles)[0] : state.current })
  },
}

const subscribe = (fn: () => void) => {
  subs.add(fn)
  return () => subs.delete(fn)
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, () => state)
}

export function useProfile(): Profile {
  const s = useStore()
  return s.profiles[s.current]
}
