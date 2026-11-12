import { describe, expect, it } from 'vitest'
import { EXERCISES, LESSONS, TRACKS } from '../curriculum'
import { addDays, gradeTimed, noteMatches, recordAttempt, stepAccuracy, streak, suggestedTempo } from '../practice/grading'
import { BEATS, gtr, keys, timeline, totalBeats, type Ev } from '../theory/music'
import { CHORDS, chordMidi, diatonicChords, fretMidi, midi, midiName, midiToFret, pentatonicBox, SCALES, shapeMidi, CHORD_SHAPES, spell, parseChord, pc, mod } from '../theory/theory'

describe('note basics', () => {
  it('maps names to MIDI and back', () => {
    expect(midi('C4')).toBe(60)
    expect(midi('A4')).toBe(69)
    expect(midi('Bb3')).toBe(58)
    expect(midiName(61)).toBe('C#4')
    expect(midiName(61, true)).toBe('Db4')
  })
  it('maps frets to notes', () => {
    expect(fretMidi(6, 0)).toBe(midi('E2'))
    expect(fretMidi(5, 3)).toBe(midi('C3'))
    expect(fretMidi(1, 5)).toBe(midi('A4'))
    expect(midiToFret(midi('C3'), 0, 4)).toEqual({ string: 5, fret: 3 })
  })
})

describe('spelling', () => {
  it('spells major scales with the right accidentals', () => {
    expect(spell('C', SCALES.major)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(spell('G', SCALES.major)).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#'])
    expect(spell('F', SCALES.major)).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E'])
    expect(spell('Eb', SCALES.major)).toEqual(['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'])
    expect(spell('F#', SCALES.major)).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'])
  })
  it('spells other scales and chords', () => {
    expect(spell('A', SCALES.minorPent)).toEqual(['A', 'C', 'D', 'E', 'G'])
    expect(spell('A', SCALES.blues)).toEqual(['A', 'C', 'D', 'Eb', 'E', 'G'])
    expect(spell('A', SCALES.dorian)).toEqual(['A', 'B', 'C', 'D', 'E', 'F#', 'G'])
    expect(spell('C', CHORDS.min)).toEqual(['C', 'Eb', 'G'])
    expect(spell('G', CHORDS['7'])).toEqual(['G', 'B', 'D', 'F'])
  })
  it('builds the chords of a key', () => {
    expect(diatonicChords('C').map((c) => c.name)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'])
    expect(diatonicChords('G').map((c) => c.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'])
    expect(diatonicChords('A', 'minor').map((c) => c.name)).toEqual(['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'])
  })
})

describe('guitar shapes', () => {
  const frets = (root: string, box: number) => {
    const out: Record<number, number[]> = {}
    for (const p of pentatonicBox(root, box)) (out[p.string] ??= []).push(p.fret)
    return [6, 5, 4, 3, 2, 1].map((s) => out[s])
  }
  it('builds the five A minor pentatonic boxes', () => {
    expect(frets('A', 1)).toEqual([[5, 8], [5, 7], [5, 7], [5, 7], [5, 8], [5, 8]])
    expect(frets('A', 2)).toEqual([[8, 10], [7, 10], [7, 10], [7, 9], [8, 10], [8, 10]])
    expect(frets('A', 3)).toEqual([[10, 12], [10, 12], [10, 12], [9, 12], [10, 13], [10, 12]])
    expect(frets('A', 4)).toEqual([[12, 15], [12, 15], [12, 14], [12, 14], [13, 15], [12, 15]])
    expect(frets('A', 5)).toEqual([[3, 5], [3, 5], [2, 5], [2, 5], [3, 5], [3, 5]])
  })
  it('adds the blue note and moves major pentatonic down three frets', () => {
    const blues = pentatonicBox('A', 1, 'blues').map((p) => `${p.string}/${p.fret}`)
    expect(blues).toContain('5/6')
    expect(blues).toContain('3/8')
    expect(pentatonicBox('A', 1, 'majorPent')[0]).toEqual({ string: 6, fret: 2 })
  })
  it('has chord shapes that contain only chord tones', () => {
    for (const [name, shape] of Object.entries(CHORD_SHAPES)) {
      const { root, quality } = parseChord(name)
      const allowed = CHORDS[quality].steps.map((s) => mod(pc(root) + s, 12))
      for (const m of shapeMidi(shape)) expect(allowed, `${name} contains ${midiName(m)}`).toContain(mod(m, 12))
      expect(mod(shapeMidi(shape)[0], 12), `${name} bass note`).toBe(pc(root))
    }
    expect(chordMidi('Am', 3)).toEqual([57, 60, 64])
  })
})

describe('note sequences', () => {
  it('parses guitar and keyboard notation', () => {
    const g = gtr('6/0 6/3:h [5/2 4/2]:w | r {Em}:hd')
    expect(g.rh.map((e) => e.dur)).toEqual(['q', 'h', 'w', 'q', 'hd'])
    expect(g.rh[1].midi).toEqual([43])
    expect(g.rh[4].text).toBe('Em')
    expect(g.rh[4].midi).toHaveLength(6)
    const k = keys('C4.1 [C4 E4 G4].135:h r', 'C3:w')
    expect(k.rh[0].fingers).toEqual([1])
    expect(k.rh[1].midi).toEqual([60, 64, 67])
    expect(timeline(k)[0].midi.sort()).toEqual([48, 60])
    expect(totalBeats(k)).toBe(4)
  })
})

describe('curriculum', () => {
  it('has three tracks with unique ids', () => {
    expect(TRACKS.map((t) => t.id)).toEqual(['theory', 'guitar', 'keys'])
    expect(new Set(LESSONS.map((l) => l.lesson.id)).size).toBe(LESSONS.length)
    expect(new Set(EXERCISES.map((e) => e.ex.id)).size).toBe(EXERCISES.length)
  })
  it('writes every exercise in whole 4/4 bars with both hands the same length', () => {
    const check = (id: string, evs: Ev[]) => {
      let beat = 0
      for (const e of evs) {
        const len = BEATS[e.dur]
        expect(Math.floor(beat / 4), `${id}: note crosses a bar line at beat ${beat}`).toBe(Math.floor((beat + len - 0.001) / 4))
        beat += len
      }
      expect(beat % 4, `${id}: ${beat} beats`).toBe(0)
      return beat
    }
    for (const { ex } of EXERCISES) {
      const a = check(ex.id, ex.piece.rh)
      if (ex.piece.lh) expect(check(ex.id, ex.piece.lh), `${ex.id}: hands differ`).toBe(a)
      expect(ex.target).toBeGreaterThanOrEqual(ex.tempo)
    }
  })
  it('has valid quiz answers', () => {
    for (const { lesson } of LESSONS)
      for (const s of lesson.steps) if (s.t === 'quiz') expect(s.answer, lesson.id).toBeLessThan(s.options.length)
  })
})

describe('grading', () => {
  const steps = timeline(keys('C4 D4 [C4 E4 G4]:h'))
  it('matches by exact note for MIDI and by note name for the microphone', () => {
    expect(noteMatches(steps[0], 60, 'midi')).toBe(true)
    expect(noteMatches(steps[0], 72, 'midi')).toBe(false)
    expect(noteMatches(steps[0], 72, 'mic')).toBe(true)
  })
  it('grades a timed performance', () => {
    const perfect = [
      { midi: 60, time: 0.02 },
      { midi: 62, time: 1.01 },
      { midi: 60, time: 2 },
      { midi: 64, time: 2.01 },
      { midi: 67, time: 2.03 },
    ]
    expect(gradeTimed(steps, perfect, 1, 'midi').accuracy).toBe(1)
    // missing chord note, late second note
    const sloppy = [
      { midi: 60, time: 0 },
      { midi: 62, time: 1.6 },
      { midi: 60, time: 2 },
      { midi: 64, time: 2 },
    ]
    expect(gradeTimed(steps, sloppy, 1, 'midi').hits).toBe(1)
    // the microphone needs only one chord tone
    expect(gradeTimed(steps, [{ midi: 60, time: 0 }, { midi: 62, time: 1 }, { midi: 76, time: 2 }], 1, 'mic').accuracy).toBe(1)
  })
  it('tracks tempo and review dates', () => {
    expect(stepAccuracy(10, 0)).toBe(1)
    expect(stepAccuracy(8, 2)).toBeCloseTo(0.8)
    let p = recordAttempt(undefined, 0.9, 60, '2026-01-01')
    expect(p.due).toBe('2026-01-02')
    expect(suggestedTempo(60, 100, p)).toBe(68)
    p = recordAttempt(p, 0.9, 68, '2026-01-02')
    expect(p.due).toBe('2026-01-04')
    p = recordAttempt(p, 0.5, 76, '2026-01-04')
    expect(p.bestTempo).toBe(68)
    expect(p.due).toBe('2026-01-05')
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    expect(streak(['2026-01-01', '2026-01-02', '2026-01-03'], '2026-01-03')).toBe(3)
    expect(streak(['2026-01-01', '2026-01-02'], '2026-01-03')).toBe(2)
    expect(streak(['2026-01-01'], '2026-01-03')).toBe(0)
  })
})

import { soundingMidi, transpose, TUNINGS, voicings } from '../theory/voicings'

describe('chord shapes for any tuning', () => {
  const std = TUNINGS.standard.notes
  it('leads with the familiar shapes in standard tuning', () => {
    expect(voicings(std, 'E')[0].frets).toEqual([0, 2, 2, 1, 0, 0])
    expect(voicings(std, 'E7')[0].frets).toEqual([0, 2, 0, 1, 0, 0])
    expect(voicings(std, 'F#')[0].frets).toEqual([2, 4, 4, 3, 2, 2])
    expect(voicings(std, 'F#')[0].barre?.fret).toBe(2)
  })
  it('gives capo shapes relative to the capo', () => {
    // capo 2: an E chord is played with a D shape
    expect(voicings(std.map((n) => n + 2), 'E')[0].frets).toEqual([-1, -1, 0, 2, 3, 2])
    expect(transpose('D', 2)).toBe('E')
    expect(transpose('Am7', 3, true)).toBe('Cm7')
  })
  it('only ever uses chord tones, with the root in the bass, in every tuning', () => {
    for (const t of Object.values(TUNINGS))
      for (const sym of ['E7', 'F#', 'Am', 'Cmaj7', 'Bb', 'D5', 'Gsus4', 'C#m7', 'A9', 'Ddim'])
        for (const capo of [0, 3]) {
          const open = t.notes.map((n) => n + capo)
          const shapes = voicings(open, sym)
          expect(shapes.length, `${t.name} ${sym} capo ${capo}`).toBeGreaterThan(0)
          const { root, quality } = parseChord(sym)
          const allowed = CHORDS[quality].steps.map((s) => mod(pc(root) + s, 12))
          for (const sh of shapes) {
            const notes = soundingMidi(open, sh)
            for (const n of notes) expect(allowed).toContain(mod(n, 12))
            expect(mod(notes[0], 12)).toBe(pc(root))
            expect(Math.max(...sh.fingers)).toBeLessThanOrEqual(4)
          }
        }
  })
})
