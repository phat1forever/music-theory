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
  TabNote,
  TabStave,
  Voice,
  type StemmableNote,
} from 'vexflow'
import { BEATS, type Ev, type Piece } from '../theory/music'
import { mod } from '../theory/theory'

interface Props {
  piece: Piece
  /** beat currently being played; notes at this onset are highlighted */
  cursor?: number | null
  /** onsets (in beats) already played correctly / missed */
  good?: number[]
  bad?: number[]
  /** spell black keys with flats */
  flats?: boolean
}

const SHARP = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']
const FLAT = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']
const HOT = '#d9480f'
const GOOD = '#0f8a5f'
const BAD = '#b3261e'

interface Timed extends Ev {
  beat: number
}

/** Split a part into 4/4 measures, tagging each event with its onset. */
function measures(evs: Ev[]): Timed[][] {
  const out: Timed[][] = [[]]
  let beat = 0
  for (const e of evs) {
    if (beat > 0 && beat % 4 === 0 && out[out.length - 1].length) out.push([])
    out[out.length - 1].push({ ...e, beat })
    beat += BEATS[e.dur]
  }
  return out
}

function vexDur(e: Ev): string {
  const base = { w: 'w', hd: 'hd', h: 'h', qd: 'qd', q: 'q', '8': '8' }[e.dur]
  return e.midi.length ? base : base + 'r'
}

/** Sheet music with either guitar tab underneath or a left-hand bass staff. Always drawn on white "paper". */
export function Score({ piece, cursor, good, bad, flats }: Props) {
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
    const top = measures(piece.rh)
    const bottom = piece.lh ? measures(piece.lh) : null
    const hasLower = guitar || !!bottom
    const names = flats ? FLAT : SHARP

    const density = Math.max(...top.map((m) => m.length), ...(bottom ?? []).map((m) => m.length))
    const want = Math.max(170, density * 38 + 50)
    const perLine = Math.max(1, Math.min(top.length, Math.floor((width - 70) / want)))
    const lines = Math.ceil(top.length / perLine)
    const lineH = hasLower ? (guitar ? 250 : 230) : 130
    const renderer = new Renderer(el, Renderer.Backends.SVG)
    renderer.resize(width, lines * lineH + 10)
    const ctx = renderer.getContext()

    const colour = (beat: number) =>
      cursor === beat ? HOT : good?.includes(beat) ? GOOD : bad?.includes(beat) ? BAD : null

    const staveNotes = (ms: Timed[], clef: 'treble' | 'bass', below: boolean) => {
      const state = new Map<string, string>()
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
          keys: shown.map((m) => `${names[mod(m, 12)]}/${Math.floor(m / 12) - 1}`),
          duration: vexDur(e),
          clef,
          auto_stem: true,
        })
        shown.forEach((m, i) => {
          const n = names[mod(m, 12)]
          const id = n[0] + Math.floor(m / 12)
          const acc = n.slice(1) || 'n'
          if ((state.get(id) ?? 'n') !== acc) {
            note.addModifier(new Accidental(acc), i)
            state.set(id, acc)
          }
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
        if (!e.midi.length || !e.tab) return new GhostNote({ duration: vexDur(e).replace('r', '') })
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
      new Voice({ num_beats: 4, beat_value: 4 }).setMode(Voice.Mode.SOFT).addTickables(notes)

    for (let line = 0; line < lines; line++) {
      const count = Math.min(perLine, top.length - line * perLine)
      const lead = line === 0 ? 78 : 52
      // The brace of a grand staff needs room on the left.
      const left = bottom ? 18 : 6
      const mw = (width - left - 6 - lead) / perLine
      let x = left
      for (let i = 0; i < count; i++) {
        const idx = line * perLine + i
        const w = mw + (i === 0 ? lead : 0)
        const y = line * lineH + 8
        const upper = new Stave(x, y, w)
        if (i === 0) {
          upper.addClef('treble')
          if (line === 0) upper.addTimeSignature('4/4')
        }
        upper.setContext(ctx).draw()

        const notes = staveNotes(top[idx], 'treble', false)
        const voices = [voice(notes)]
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
            if (line === 0) lower.addTimeSignature('4/4')
          }
          const low = staveNotes(bottom[idx] ?? [], 'bass', true)
          voices.push(voice(low))
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
  }, [piece, cursor, good, bad, flats, width])

  return <div className="score" ref={host} />
}
