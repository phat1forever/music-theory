import { useEffect, useMemo, useRef, useState } from 'react'
import { click, now, play, startTicker, type Ticker } from '../audio/audio'
import { Fretboard, type Mark } from '../components/Fretboard'
import { InputBar } from '../components/InputBar'
import { Keyboard, type KeyMark } from '../components/Keyboard'
import { Score } from '../components/Score'
import type { Exercise } from '../curriculum/types'
import { emitNote, onNote } from '../input/input'
import { actions, useProfile } from '../store/store'
import { BEATS, timeline, totalBeats, type Ev, type Piece } from '../theory/music'
import {
  gradeTimed,
  noteMatches,
  notesNeeded,
  PASS,
  stars,
  stepAccuracy,
  suggestedTempo,
  type Played,
  type Source,
} from './grading'

type Mode = 'idle' | 'listen' | 'step' | 'tempo' | 'rate' | 'done'

interface Timed {
  beat: number
  ev: Ev
  hand: 'rh' | 'lh'
}

function events(piece: Piece): Timed[] {
  const out: Timed[] = []
  const add = (evs: Ev[], hand: 'rh' | 'lh') => {
    let beat = 0
    for (const ev of evs) {
      if (ev.midi.length) out.push({ beat, ev, hand })
      beat += BEATS[ev.dur]
    }
  }
  add(piece.rh, 'rh')
  if (piece.lh) add(piece.lh, 'lh')
  return out
}

/** Play a piece through once with a moving cursor. Returns a stop function. */
export async function playPiece(
  piece: Piece,
  bpm: number,
  onBeat: (beat: number | null) => void,
  opts: { countIn?: boolean; metronome?: boolean; sound?: boolean } = {},
): Promise<Ticker> {
  const steps = new Map(timeline(piece).map((s) => [Math.round(s.beat * 2), s]))
  const lead = opts.countIn ? 8 : 0
  const end = Math.round(totalBeats(piece) * 2) + lead
  const spb = 60 / bpm
  const voice = piece.instrument === 'guitar' ? 'guitar' : 'keys'
  const ticker = await startTicker(
    bpm,
    (i, t) => {
      if (i >= end) return
      if ((opts.metronome || i < lead) && i % 2 === 0) click(i % 8 === 0, t)
      const s = steps.get(i - lead)
      if (s && opts.sound !== false) play(voice, s.midi, Math.max(0.25, s.len * spb * 0.95), t)
    },
    (i) => {
      if (i >= end) {
        ticker.stop()
        onBeat(null)
      } else if (i >= lead && steps.has(i - lead)) onBeat((i - lead) / 2)
    },
  )
  return ticker
}

interface Props {
  ex: Exercise
  /** called after every graded attempt */
  onAttempt?: (accuracy: number) => void
}

/** The practice screen for one exercise: listen, step through it, or play along in time and get graded. */
export function Runner({ ex, onAttempt }: Props) {
  const profile = useProfile()
  const progress = profile.exercises[ex.id]
  const [tempo, setTempo] = useState(() => suggestedTempo(ex.tempo, ex.target, progress))
  const [mode, setMode] = useState<Mode>('idle')
  const [cursor, setCursor] = useState<number | null>(null)
  const [good, setGood] = useState<number[]>([])
  const [bad, setBad] = useState<number[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [result, setResult] = useState<{ accuracy: number; note: string } | null>(null)
  const [guide, setGuide] = useState(true)
  const ticker = useRef<Ticker | null>(null)
  const steps = useMemo(() => timeline(ex.piece), [ex])
  const evs = useMemo(() => events(ex.piece), [ex])
  const guitar = ex.piece.instrument === 'guitar'

  // Reset when the exercise changes.
  useEffect(() => {
    setTempo(suggestedTempo(ex.tempo, ex.target, profile.exercises[ex.id]))
    reset()
    return () => ticker.current?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.id])

  function reset() {
    ticker.current?.stop()
    ticker.current = null
    setMode('idle')
    setCursor(null)
    setGood([])
    setBad([])
    setCount(null)
    setResult(null)
  }

  function finish(accuracy: number, usedTempo: number, note: string) {
    actions.attempt(ex.id, accuracy, usedTempo)
    setResult({ accuracy, note })
    setMode('done')
    setCursor(null)
    onAttempt?.(accuracy)
  }

  async function listen() {
    reset()
    setMode('listen')
    ticker.current = await playPiece(ex.piece, tempo, (b) => {
      setCursor(b)
      if (b === null) setMode('idle')
    })
  }

  // ---- step-by-step: the app waits for each correct note ----
  const stepState = useRef({ index: 0, got: new Set<number>(), mistakes: 0 })

  function startStep() {
    reset()
    stepState.current = { index: 0, got: new Set(), mistakes: 0 }
    setMode('step')
    setCursor(steps[0]?.beat ?? null)
  }

  useEffect(() => {
    if (mode !== 'step') return
    return onNote((e) => {
      const st = stepState.current
      const step = steps[st.index]
      if (!step) return
      if (noteMatches(step, e.midi, e.source)) {
        st.got.add(e.source === 'mic' ? 0 : e.midi)
        if (st.got.size >= notesNeeded(step, e.source)) {
          setGood((g) => [...g, step.beat])
          st.index++
          st.got = new Set()
          if (st.index >= steps.length) {
            const acc = stepAccuracy(steps.length, st.mistakes)
            finish(acc, ex.tempo, st.mistakes ? `${st.mistakes} wrong note${st.mistakes > 1 ? 's' : ''} along the way.` : 'No wrong notes.')
          } else setCursor(steps[st.index].beat)
        }
      } else {
        // A microphone keeps hearing the previous note ring on; don't count that as a mistake.
        const prev = steps[st.index - 1]
        if (e.source === 'mic' && prev && noteMatches(prev, e.midi, 'mic')) return
        st.mistakes++
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, steps])

  // ---- in time with the metronome ----
  const played = useRef<{ list: Played[]; source: Source | null; t0: number }>({ list: [], source: null, t0: 0 })

  async function startTempo() {
    reset()
    setMode('tempo')
    played.current = { list: [], source: null, t0: Infinity }
    const self = profile.input === 'self'
    const spb = 60 / tempo
    const t = await playPiece(
      ex.piece,
      tempo,
      (b) => {
        setCount(null)
        setCursor(b)
        if (b !== null) return
        // finished
        const p = played.current
        if (self && !p.list.length) {
          setMode('rate')
          return
        }
        const source = p.source ?? 'click'
        // Pitch detection needs a moment to lock on, so shift microphone notes earlier.
        const shift = source === 'mic' ? 0.09 : 0
        const r = gradeTimed(
          steps,
          p.list.map((n) => ({ ...n, time: n.time - shift })),
          spb,
          source,
          Math.min(0.3, spb * 0.45),
        )
        setGood(steps.filter((_, i) => r.steps[i]).map((s) => s.beat))
        setBad(steps.filter((_, i) => !r.steps[i]).map((s) => s.beat))
        const timing =
          r.hits < 2 ? '' : Math.abs(r.offset) < 0.05 ? ' Timing was right on the beat.' : r.offset > 0 ? ' You tended to play a little late.' : ' You tended to rush ahead of the beat.'
        finish(r.accuracy, tempo, `${r.hits} of ${r.total} notes on time.${timing}`)
      },
      { countIn: true, metronome: true, sound: guide && profile.input !== 'mic' },
    )
    ticker.current = t
    played.current.t0 = performance.now() + (t.startTime - now()) * 1000 + 4 * spb * 1000
    // count-in display
    for (let i = 0; i < 4; i++)
      window.setTimeout(() => setCount((c) => (ticker.current === t ? 4 - i : c)), (t.startTime - now() + i * spb) * 1000)
  }

  useEffect(() => {
    if (mode !== 'tempo') return
    return onNote((e) => {
      const p = played.current
      p.source ??= e.source
      p.list.push({ midi: e.midi, time: (e.at - p.t0) / 1000 })
    })
  }, [mode])

  // ---- diagram of what to play right now ----
  const current = cursor === null ? [] : evs.filter((e) => e.beat === cursor)
  const diagram = useMemo(() => {
    if (guitar) {
      const all = evs.flatMap((e) => e.ev.tab ?? [])
      const fretted = all.map((p) => p.fret).filter((f) => f > 0)
      const min = fretted.length ? Math.min(...fretted) : 0
      const max = fretted.length ? Math.max(...fretted) : 3
      const from = min > 4 ? min - 1 : 0
      return { from, to: Math.max(from + 5, max + 1), all }
    }
    const all = evs.flatMap((e) => e.ev.midi)
    const lo = Math.min(...all)
    const hi = Math.max(...all)
    return { from: lo - 3, to: Math.max(hi + 3, lo + 14), all: [] }
  }, [evs, guitar])

  const fretMarks: Mark[] = guitar
    ? [
        ...uniq(diagram.all.map((p) => ({ ...p, kind: 'ghost' as const }))),
        ...current.flatMap((e) => (e.ev.tab ?? []).map((p) => ({ ...p, kind: 'active' as const, label: String(p.fret) }))),
      ]
    : []
  const keyMarks: KeyMark[] = !guitar
    ? current.flatMap((e) =>
        e.ev.midi.map((m, i) => ({
          midi: m,
          kind: e.hand === 'lh' ? ('lh' as const) : ('active' as const),
          label: e.ev.fingers?.[i] ? String(e.ev.fingers[i]) : '',
        })),
      )
    : []

  const pick = (m: number) => {
    play(guitar ? 'guitar' : 'keys', [m], 0.6)
    emitNote(m, 'click')
  }

  const busy = mode === 'listen' || mode === 'step' || mode === 'tempo'
  const passed = result && result.accuracy >= PASS
  const nextTempo = Math.min(ex.target, tempo + 8)

  return (
    <div className="runner" data-ex={ex.id}>
      <div className="runner-head">
        <div>
          <h3>{ex.title}</h3>
          {ex.tip && <p className="muted">{ex.tip}</p>}
        </div>
        <div className="runner-best">
          {progress?.bestTempo ? (
            <>
              Best <strong>{progress.bestTempo}</strong> bpm · goal {ex.target}
            </>
          ) : (
            <>Goal {ex.target} bpm</>
          )}
        </div>
      </div>

      <div className="paper">
        <Score piece={ex.piece} cursor={cursor} good={good} bad={bad} flats={ex.flats} />
      </div>

      <div className="runner-diagram">
        {guitar ? (
          <Fretboard
            marks={fretMarks}
            from={diagram.from}
            to={diagram.to}
            leftHanded={profile.leftHanded}
            onPick={pick}
          />
        ) : (
          <Keyboard marks={keyMarks} from={diagram.from} to={diagram.to} onPick={pick} />
        )}
        {count !== null && mode === 'tempo' && <div className="countin">{count}</div>}
      </div>

      <div className="runner-controls">
        <label className="tempo">
          <span>
            Tempo <strong>{tempo}</strong> bpm
          </span>
          <input
            type="range"
            min={40}
            max={Math.max(160, ex.target + 20)}
            step={2}
            value={tempo}
            disabled={busy}
            onChange={(e) => setTempo(Number(e.target.value))}
          />
        </label>
        <div className="btns">
          {busy ? (
            <button className="btn" onClick={reset}>
              Stop
            </button>
          ) : (
            <>
              <button className="btn" onClick={listen} data-act="listen">
                ▶ Listen
              </button>
              <button className="btn" onClick={startStep} data-act="step" title="The app waits for each correct note">
                Step by step
              </button>
              <button className="btn primary" onClick={startTempo} data-act="tempo" title="Play along with the metronome after a one-bar count-in">
                Play in time
              </button>
            </>
          )}
        </div>
      </div>

      <div className="runner-foot">
        <InputBar />
        {profile.input !== 'mic' && (
          <label className="check">
            <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} /> Guide sound
          </label>
        )}
      </div>

      {mode === 'step' && (
        <p className="status">
          Play the highlighted {current.some((e) => e.ev.midi.length > 1) ? 'notes' : 'note'}
          {profile.input === 'self' ? ' by tapping the diagram (or switch on the microphone or MIDI below).' : '. The app waits for you.'}
        </p>
      )}
      {mode === 'tempo' && profile.input === 'mic' && <p className="status">Listening… headphones stop the metronome leaking into the microphone.</p>}

      {mode === 'rate' && (
        <div className="result">
          <strong>How did that go?</strong>
          <div className="btns">
            <button className="btn primary" data-rate="good" onClick={() => finish(0.95, tempo, 'Self-rated: clean and in time.')}>
              Clean and in time
            </button>
            <button className="btn" onClick={() => finish(0.8, tempo, 'Self-rated: a few slips.')}>
              A few slips
            </button>
            <button className="btn" onClick={() => finish(0.5, tempo, 'Self-rated: not there yet.')}>
              Not there yet
            </button>
          </div>
        </div>
      )}

      {mode === 'done' && result && (
        <div className={`result ${passed ? 'pass' : 'retry'}`} data-result={passed ? 'pass' : 'retry'}>
          <div className="stars" aria-label={`${stars(result.accuracy)} of 3 stars`}>
            {'★'.repeat(stars(result.accuracy))}
            <span>{'★'.repeat(3 - stars(result.accuracy))}</span>
          </div>
          <div>
            <strong>
              {Math.round(result.accuracy * 100)}% {passed ? '· passed' : '· keep going'}
            </strong>
            <p className="muted">
              {result.note}{' '}
              {passed
                ? tempo >= ex.target
                  ? 'You have reached the goal tempo for this exercise.'
                  : `Next step: ${nextTempo} bpm.`
                : 'Slow the tempo down a little, or use Step by step to check the notes.'}
            </p>
          </div>
          <div className="btns">
            {passed && tempo < ex.target && (
              <button
                className="btn primary"
                onClick={() => {
                  setTempo(nextTempo)
                  reset()
                }}
              >
                Try {nextTempo} bpm
              </button>
            )}
            <button className="btn" onClick={reset}>
              Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function uniq<T extends { string: number; fret: number }>(list: T[]): T[] {
  const seen = new Set<string>()
  return list.filter((p) => {
    const k = `${p.string}/${p.fret}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
