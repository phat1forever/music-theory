import { useEffect, useRef, useState } from 'react'
import {
  Accidental,
  Annotation,
  Beam,
  Dot,
  Formatter,
  GhostNote,
  Renderer,
  Stave,
  StaveConnector,
  StaveNote,
  StaveTie,
  TabNote,
  TabStave,
  Voice,
  type StemmableNote,
} from 'vexflow'
import { barBeats, BEATS, type Ev, type Piece } from '../theory/music'
import { mod, pc, pretty, SCALES, spell } from '../theory/theory'

interface Props {
  piece: Piece
  /** beat currently being played; notes at this onset are highlighted */
  cursor?: number | null
  /** onsets (in beats) already played correctly / missed */
  good?: number[]
  bad?: number[]
  /** spell black keys with flats */
  flats?: boolean
  /** exact note names to use, e.g. ["F#", "G#", "A#", "B", "C#", "D#", "E#"] */
  spelling?: string[]
  /** keep the line being played in view when the score is taller than its box */
  follow?: boolean
}

const SHARP = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']
const FLAT = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']
const HOT = '#d9480f'
const GOOD = '#0f8a5f'
const BAD = '#b3261e'

interface Timed extends Ev {
  beat: number
  /** held over from the previous note by a tie */
  held: boolean
}

/** Split a part into measures, tagging each event with its onset. */
function measures(evs: Ev[], per: number): Timed[][] {
  const out: Timed[][] = [[]]
  let beat = 0
  let tied = false
  for (const e of evs) {
    if (beat > 0 && beat % per === 0 && out[out.length - 1].length) out.push([])
    out[out.length - 1].push({ ...e, beat, held: tied && e.midi.length > 0 })
    tied = !!e.tie
    beat += BEATS[e.dur]
  }
  return out
}

/** Note names fixed by a key signature: the key's own scale, plus the raised 7th of a minor key. */
function keySpelling(key: string): string[] {
  const minor = key.endsWith('m')
  const root = minor ? key.slice(0, -1) : key
  const own = spell(root, minor ? SCALES.minor : SCALES.major)
  return minor ? [...spell(root, SCALES.harmonicMinor).filter((n) => !own.some((o) => pc(o) === pc(n))), ...own] : own
}

function vexDur(e: Ev): string {
  const base = { w: 'w', hd: 'hd', h: 'h', qd: 'qd', q: 'q', '8': '8' }[e.dur]
  return e.midi.length ? base : base + 'r'
}

/** Sheet music with either guitar tab underneath or a left-hand bass staff. Always drawn on white "paper". */
export function Score({ piece, cursor, good, bad, flats, spelling, follow }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(Math.floor(el.clientWidth)))
    ro.observe(el)
    setWidth(Math.floor(el.clientWidth))
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = host.current
    if (!el || width < 120) return
    el.innerHTML = ''
    const guitar = piece.instrument === 'guitar'
    // A left-hand-only piece is drawn on a single bass staff instead of under an empty treble staff.
    const bassOnly = !guitar && !!piece.lh && piece.rh.every((e) => !e.midi.length)
    const per = barBeats(piece)
    const top = measures(bassOnly ? piece.lh! : piece.rh, per)
    const bottom = !bassOnly && piece.lh ? measures(piece.lh, per) : null
    const topClef = bassOnly ? 'bass' : 'treble'
    const hasLower = guitar || !!bottom
    const fixed = spelling ?? (piece.key ? keySpelling(piece.key) : [])
    const names = (flats ?? fixed.some((n) => n.includes('b'))) ? FLAT : SHARP
    const exact = new Map(fixed.map((n) => [pc(n), n]))
    const keySig = piece.key ?? 'C'
    const sigWidth = piece.key ? spell(piece.key.replace(/m$/, ''), piece.key.endsWith('m') ? SCALES.minor : SCALES.major).filter((n) => n.length > 1).length * 11 : 0
    // Room above each line for chord symbols; guitar parts climb higher above the staff, so they need more.
    const chordPad = piece.chords?.some(Boolean) ? (guitar ? 36 : 20) : 0
    /** How a MIDI note is written: letter, accidental and octave (B# and Cb sit in the neighbouring octave). */
    const written = (m: number) => {
      const n = exact.get(mod(m, 12)) ?? names[mod(m, 12)]
      const acc = n.slice(1)
      const shift = [...acc].reduce((a, ch) => a + (ch === '#' ? 1 : -1), 0)
      return { letter: n[0].toLowerCase(), acc, oct: Math.floor((m - shift) / 12) - 1 }
    }

    const density = Math.max(...top.map((m) => m.length), ...(bottom ?? []).map((m) => m.length))
    const want = Math.max(170, density * 38 + 50)
    const perLine = Math.max(1, Math.min(top.length, Math.floor((width - 70) / want)))
    const lines = Math.ceil(top.length / perLine)
    const lineH = (hasLower ? (guitar ? 250 : 230) : 130) + chordPad
    const renderer = new Renderer(el, Renderer.Backends.SVG)
    renderer.resize(width, lines * lineH + 10)
    const ctx = renderer.getContext()

    const colour = (beat: number) =>
      cursor === beat ? HOT : good?.includes(beat) ? GOOD : bad?.includes(beat) ? BAD : null

    const staveNotes = (ms: Timed[], clef: 'treble' | 'bass', below: boolean) => {
      return ms.map((e) => {
        if (!e.midi.length)
          return new StaveNote({
            keys: [clef === 'bass' ? 'd/3' : 'b/4'],
            duration: vexDur(e),
            clef,
          })
        // Guitar music is written an octave above where it sounds.
        const shown = [...new Set(e.midi.map((m) => m + (guitar ? 12 : 0)))].sort((a, b) => a - b)
        const note = new StaveNote({
          keys: shown.map((m) => {
            const w = written(m)
            return `${w.letter}${w.acc}/${w.oct}`
          }),
          duration: vexDur(e),
          clef,
          auto_stem: true,
        })
        if (e.dur === 'hd' || e.dur === 'qd') Dot.buildAndAttach([note], { all: true })
        const label = e.fingers?.length ? e.fingers.join(' ') : !guitar ? e.text : undefined
        if (label)
          note.addModifier(
            new Annotation(label)
              .setFont('Arial', 10, e.fingers?.length ? 'bold' : 'normal')
              .setVerticalJustification(
                below ? Annotation.VerticalJustify.BOTTOM : Annotation.VerticalJustify.TOP,
              ),
            0,
          )
        const c = colour(e.beat)
        if (c) note.setStyle({ fillStyle: c, strokeStyle: c })
        return note
      })
    }

    const tabNotes = (ms: Timed[]) =>
      ms.map((e) => {
        // A note held over by a tie is not picked again, so the tab shows nothing new for it.
        if (!e.midi.length || !e.tab || e.held) return new GhostNote({ duration: vexDur(e).replace('r', '') })
        const note = new TabNote({
          positions: e.tab.map((p) => ({ str: p.string, fret: p.fret })),
          duration: vexDur(e),
        })
        if (e.text)
          note.addModifier(
            new Annotation(e.text)
              .setFont('Arial', 10, 'bold')
              .setVerticalJustification(Annotation.VerticalJustify.TOP),
            0,
          )
        const c = colour(e.beat)
        if (c) note.setStyle({ fillStyle: c, strokeStyle: c })
        return note
      })

    const voice = (notes: StemmableNote[]) =>
      new Voice({ num_beats: per, beat_value: 4 }).setMode(Voice.Mode.SOFT).addTickables(notes)
    const meter = `${per}/4`
    // Notes in drawing order with the line they are on, for drawing ties afterwards.
    const drawn: { upper: { note: StaveNote; ev: Timed; line: number }[]; lower: { note: StaveNote; ev: Timed; line: number }[] } = { upper: [], lower: [] }

    for (let line = 0; line < lines; line++) {
      const count = Math.min(perLine, top.length - line * perLine)
      const lead = (line === 0 ? 78 : 52) + sigWidth
      // The brace of a grand staff needs room on the left.
      const left = bottom ? 18 : 6
      const mw = (width - left - 6 - lead) / perLine
      let x = left
      for (let i = 0; i < count; i++) {
        const idx = line * perLine + i
        const w = mw + (i === 0 ? lead : 0)
        const y = line * lineH + 8 + chordPad
        const upper = new Stave(x, y, w)
        if (i === 0) {
          upper.addClef(topClef)
          if (piece.key) upper.addKeySignature(keySig)
          if (line === 0) upper.addTimeSignature(meter)
        }
        upper.setContext(ctx).draw()
        const symbol = piece.chords?.[idx]
        if (symbol) {
          ctx.save()
          ctx.setFont('Arial', 13, 'bold')
          ctx.fillText(pretty(symbol), i === 0 ? upper.getNoteStartX() : x + 8, y - chordPad + 26)
          ctx.restore()
        }

        const notes = staveNotes(top[idx], topClef, bassOnly)
        notes.forEach((note, k) => drawn.upper.push({ note, ev: top[idx][k], line }))
        const voices = [voice(notes)]
        Accidental.applyAccidentals([voices[0]], keySig)
        const beamGroups = [notes]
        let lower: Stave | TabStave | null = null

        if (guitar) {
          lower = new TabStave(x, y + 110, w)
          if (i === 0) lower.addClef('tab')
          voices.push(voice(tabNotes(top[idx])))
        } else if (bottom) {
          lower = new Stave(x, y + 100, w)
          if (i === 0) {
            lower.addClef('bass')
            if (piece.key) lower.addKeySignature(keySig)
            if (line === 0) lower.addTimeSignature(meter)
          }
          const low = staveNotes(bottom[idx] ?? [], 'bass', true)
          low.forEach((note, k) => drawn.lower.push({ note, ev: bottom[idx][k], line }))
          voices.push(voice(low))
          Accidental.applyAccidentals([voices[1]], keySig)
          beamGroups.push(low)
        }

        if (lower) {
          lower.setContext(ctx).draw()
          const start = Math.max(upper.getNoteStartX(), lower.getNoteStartX())
          upper.setNoteStartX(start)
          lower.setNoteStartX(start)
          if (i === 0)
            new StaveConnector(upper, lower)
              .setType(guitar ? StaveConnector.type.SINGLE_LEFT : StaveConnector.type.BRACE)
              .setContext(ctx)
              .draw()
        }

        const formatter = new Formatter()
        voices.forEach((v) => formatter.joinVoices([v]))
        formatter.format(voices, Math.max(60, upper.getNoteEndX() - upper.getNoteStartX() - 16))
        const beams = beamGroups.flatMap((g) =>
          Beam.generateBeams(g.filter((n) => !n.isRest())),
        )
        voices[0].draw(ctx, upper)
        if (lower && voices[1]) voices[1].draw(ctx, lower)
        beams.forEach((b) => b.setContext(ctx).draw())
        x += w
      }
    }
    for (const part of [drawn.upper, drawn.lower])
      part.forEach((a, k) => {
        const b = part[k + 1]
        if (!a.ev.tie || !b || !b.ev.held) return
        const indices = a.note.getKeys().map((_, n) => n)
        const tie = (first: StaveNote | null, last: StaveNote | null) =>
          new StaveTie({ first_note: first, last_note: last, first_indices: indices, last_indices: indices }).setContext(ctx).draw()
        if (a.line === b.line) tie(a.note, b.note)
        else {
          // Across a line break the tie is drawn in two halves.
          tie(a.note, null)
          tie(null, b.note)
        }
      })
    // On a small screen a long score is shown in a short scrolling box: keep the current line visible.
    const box = el.parentElement
    if (follow && cursor != null && box && box.scrollHeight > box.clientHeight + 4)
      box.scrollTo({ top: Math.max(0, Math.floor(Math.floor(cursor / per) / perLine) * lineH - 6), behavior: 'smooth' })
  }, [piece, cursor, good, bad, flats, spelling, follow, width])

  return <div className="score" ref={host} />
}
