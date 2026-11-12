import { useEffect, useMemo, useRef, useState } from 'react'
import { click, drum, now, play, startTicker, type Ticker } from '../audio/audio'
import { Fretboard, type Mark } from '../components/Fretboard'
import { InputBar } from '../components/InputBar'
import { Keyboard, type KeyMark } from '../components/Keyboard'
import { Score } from '../components/Score'
import type { Exercise } from '../curriculum/types'
import { emitNote, onNote } from '../input/input'
import { actions, useProfile } from '../store/store'
import { barBeats, barChords, barCount, onsetEvents, sliceBars, timeline, totalBeats, type Onset, type Piece } from '../theory/music'
import { chordMidi, midiName, mod, parseChord, pc, pretty } from '../theory/theory'
import {
  gradeTimed,
  matchKey,
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

/**
 * Play a piece with a moving cursor. Handles 3/4, swing, a count-in bar, a metronome, backing chords
 * and looping. Returns the ticker, whose `stop()` ends playback.
 */
export async function playPiece(
  piece: Piece,
  bpm: number,
  onBeat: (beat: number | null) => void,
  opts: { countIn?: boolean; metronome?: boolean; sound?: boolean; backing?: boolean; loop?: boolean } = {},
): Promise<Ticker> {
  const steps = new Map(timeline(piece).map((s) => [Math.round(s.beat * 2), s]))
  const per = barBeats(piece) * 2 // eighth-note ticks per bar
  const lead = opts.countIn ? per : 0
  const length = Math.round(totalBeats(piece) * 2)
  const spb = 60 / bpm
  const voice = piece.instrument === 'guitar' ? 'guitar' : 'keys'
  const chords = barChords(piece)
  const ticker = await startTicker(
    bpm,
    (i, t) => {
      if (!opts.loop && i >= length + lead) return
      const pos = i < lead ? i - lead : (i - lead) % length
      const inBar = mod(pos, per)
      // Swung off-beat eighths arrive on the last third of the beat.
      const when = piece.swing && inBar % 2 === 1 ? t + spb / 6 : t
      if ((opts.metronome || i < lead) && inBar % 2 === 0) click(inBar === 0, t)
      if (pos < 0) return
      const chord = opts.backing ? chords[Math.floor(pos / per)] : ''
      if (chord) {
        const root = pc(parseChord(chord).root)
        if (inBar === 0) play('pad', chordMidi(chord, 3), spb * (per / 2) * 0.95, when)
        // 4/4: bass on beats 1 and 3 with a backbeat. 3/4: one bass note, then two light beats.
        if (inBar === 0 || (per === 8 && inBar === 4)) play('bass', [36 + root], spb * 0.9, when)
        if (per === 8 && inBar === 4) drum('snare', when)
        if (inBar === 0) drum('kick', when)
        if (per === 8 || inBar % 2 === 0) drum('hat', when)
      }
      const s = steps.get(pos)
      if (s && opts.sound !== false) play(voice, s.midi, Math.max(0.25, s.len * spb * 0.95), when)
    },
    (i) => {
      if (!opts.loop && i >= length + lead) {
        ticker.stop()
        onBeat(null)
      } else if (i >= lead && steps.has((i - lead) % length)) onBeat(((i - lead) % length) / 2)
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
  const [result, setResult] = useState<{ accuracy: number; note: string; counts: boolean } | null>(null)
  const [guide, setGuide] = useState(true)
  const [hints, setHints] = useState(true)
  const [hand, setHand] = useState<'both' | 'rh' | 'lh'>('both')
  const bars = barCount(ex.piece)
  const [range, setRange] = useState<[number, number]>([1, bars])
  const [loop, setLoop] = useState(false)
  const [backing, setBacking] = useState(ex.piece.instrument === 'guitar')
  const whole = range[0] === 1 && range[1] === bars
  const hasChords = !!ex.piece.chords?.some(Boolean)
  const [got, setGot] = useState<number[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  // Name black keys the way the piece's key signature does (B♭ in F major and D minor, not A♯).
  const flat = ex.flats ?? ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Dm', 'Gm', 'Cm', 'Fm'].includes(ex.piece.key ?? '')
  const lastPos = useRef<{ string: number; fret: number } | null>(null)
  const ticker = useRef<Ticker | null>(null)
  const paper = useRef<HTMLDivElement>(null)
  /** On a phone, bring the score to the top of the screen so it and the diagram are both visible while playing. */
  const frame = () => {
    if (window.innerWidth < 720) paper.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const guitar = ex.piece.instrument === 'guitar'
  const twoHands = !guitar && !!ex.piece.lh && ex.piece.rh.some((e) => e.midi.length > 0)
  // Practising one hand alone: the other hand is replaced by rests (or dropped).
  const piece: Piece = useMemo(() => {
    const part = whole ? ex.piece : sliceBars(ex.piece, range[0], range[1])
    if (!twoHands || hand === 'both') return part
    if (hand === 'rh') return { ...part, lh: undefined }
    const rest = barBeats(part) === 3 ? ('hd' as const) : ('w' as const)
    return { ...part, rh: Array.from({ length: barCount(part) }, () => ({ midi: [], dur: rest })) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex, hand, twoHands, range[0], range[1]])
  const steps = useMemo(() => timeline(piece), [piece])
  const evs: Onset[] = useMemo(() => onsetEvents(piece), [piece])
  const partial = hand !== 'both' || !whole

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
    setGot([])
    setWrong(null)
  }

  /** `counts` is false for run-throughs that should not move the tempo record: step-by-step and one hand alone. */
  function finish(accuracy: number, usedTempo: number, note: string, counts = true) {
    if (counts && !partial) actions.attempt(ex.id, accuracy, usedTempo)
    else actions.touch(ex.id)
    setResult({ accuracy, note, counts: counts && !partial })
    setMode('done')
    setCursor(null)
    onAttempt?.(accuracy)
  }

  async function listen() {
    reset()
    frame()
    setMode('listen')
    ticker.current = await playPiece(
      piece,
      tempo,
      (b) => {
        setCursor(b)
        if (b === null) setMode('idle')
      },
      { backing: backing && hasChords, loop },
    )
  }

  // ---- step-by-step: the app waits for each correct note ----
  const stepState = useRef({ index: 0, got: new Set<number>(), mistakes: 0 })

  function startStep() {
    reset()
    stepState.current = { index: 0, got: new Set(), mistakes: 0 }
    setMode('step')
    frame()
    setCursor(steps[0]?.beat ?? null)
  }

  useEffect(() => {
    if (mode !== 'step') return
    return onNote((e) => {
      const st = stepState.current
      const step = steps[st.index]
      if (!step) return
      if (noteMatches(step, e.midi, e.source)) {
        st.got.add(matchKey(step, e.midi, e.source)!)
        setWrong(null)
        setGot(e.source === 'mic' ? [] : [...st.got])
        // Tapping out a six-string chord dot by dot teaches nothing: on the on-screen fretboard one tap strums it.
        const strummed = guitar && e.source === 'click' && step.midi.length >= 3
        if (strummed || st.got.size >= notesNeeded(step, e.source)) {
          setGood((g) => [...g, step.beat])
          setGot([])
          st.index++
          st.got = new Set()
          if (st.index >= steps.length) {
            const acc = stepAccuracy(steps.length, st.mistakes)
            finish(acc, ex.tempo, st.mistakes ? `${st.mistakes} wrong note${st.mistakes > 1 ? 's' : ''} along the way.` : 'No wrong notes.', false)
          } else setCursor(steps[st.index].beat)
        }
      } else {
        // A microphone keeps hearing the previous note ring on; don't count that as a mistake.
        const prev = steps[st.index - 1]
        if (e.source === 'mic' && prev && noteMatches(prev, e.midi, 'mic')) return
        // A bend sweeps up through the next pitches on its way to the target: not a wrong note.
        const from = [...step.midi, ...(prev?.midi ?? [])]
        if (e.source === 'mic' && ex.piece.instrument === 'guitar' && from.some((m) => e.midi - m === 1 || e.midi - m === 2)) return
        st.mistakes++
        if (guitar) {
          // Guitarists think in strings and frets, not note names with octave numbers.
          const targets = evs.filter((o) => o.beat === step.beat).flatMap((o) => o.ev.tab ?? [])
          const want = targets.length >= 3 ? 'any highlighted dot of the chord' : targets.map((t) => `the ${where(t)}`).join(' and ')
          const was = e.source === 'click' && lastPos.current ? `the ${where(lastPos.current)}` : `the note ${pretty(midiName(e.midi, flat).replace(/-?\d+$/, ''))}`
          setWrong(`That was ${was}. Look for ${want}.`)
          return
        }
        const want = [...new Set(step.midi)].filter((m) => e.source === 'mic' || !st.got.has(m)).map((m) => pretty(midiName(m, flat))).join(' + ')
        setWrong(`That was ${pretty(midiName(e.midi, flat))}. Look for ${want}.`)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, steps])

  // ---- in time with the metronome ----
  const played = useRef<{ list: Played[]; source: Source | null; t0: number }>({ list: [], source: null, t0: 0 })

  async function startTempo() {
    reset()
    frame()
    setMode('tempo')
    played.current = { list: [], source: null, t0: Infinity }
    const self = profile.input === 'self'
    const spb = 60 / tempo
    const t = await playPiece(
      piece,
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
        )
        setGood(steps.filter((_, i) => r.steps[i]).map((s) => s.beat))
        setBad(steps.filter((_, i) => !r.steps[i]).map((s) => s.beat))
        const timing =
          r.hits < 2 ? '' : Math.abs(r.offset) < 0.05 ? ' Timing was right on the beat.' : r.offset > 0 ? ' You tended to play a little late.' : ' You tended to rush ahead of the beat.'
        const stray = r.extra ? ` ${r.extra} extra or wrong note${r.extra > 1 ? 's' : ''}.` : ''
        finish(r.accuracy, tempo, `${r.hits} of ${r.total} notes on time.${stray}${timing}`)
      },
      { countIn: true, metronome: true, sound: guide && profile.input !== 'mic', backing: backing && hasChords && profile.input !== 'mic' },
    )
    ticker.current = t
    played.current.t0 = performance.now() + (t.startTime - now()) * 1000 + barBeats(piece) * spb * 1000
    // count-in display
    for (let i = 0; i < barBeats(piece); i++)
      window.setTimeout(() => setCount((c) => (ticker.current === t ? barBeats(piece) - i : c)), (t.startTime - now() + i * spb) * 1000)
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

  // Notes of the current step already played (in step-by-step mode) turn green.
  const fretMarks: Mark[] = guitar
    ? [
        ...uniq(diagram.all.map((p) => ({ ...p, kind: 'ghost' as const }))),
        ...(hints
          ? current.flatMap((e) =>
              (e.ev.tab ?? []).map((p, i) => ({
                ...p,
                kind: got.includes(e.ev.midi[i]) ? ('chord' as const) : ('active' as const),
                label: String(p.fret),
              })),
            )
          : []),
      ]
    : []
  const keyMarks: KeyMark[] =
    !guitar && hints
      ? current.flatMap((e) =>
          e.ev.midi.map((m, i) => ({
            midi: m,
            kind: got.includes(m) ? ('done' as const) : e.hand === 'lh' ? ('lh' as const) : ('active' as const),
            label: e.ev.fingers?.[i] ? String(e.ev.fingers[i]) : '',
          })),
        )
      : []
  const needed = new Set(current.flatMap((e) => e.ev.midi)).size
  const handsNow = [...new Set(current.map((e) => e.hand))]

  const pick = (m: number, pos?: { string: number; fret: number }) => {
    lastPos.current = pos ?? null
    // A tap on a chord dot in step-by-step mode strums the whole chord.
    const chord = mode === 'step' && guitar && current.length === 1 && current[0].ev.midi.length >= 3 && current[0].ev.midi.includes(m)
    if (chord) current[0].ev.midi.forEach((n, i) => play('guitar', [n], 1.2, now() + i * 0.03))
    else play(guitar ? 'guitar' : 'keys', [m], 0.6)
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

      {twoHands && (
        <div className="seg wrap hand-seg" role="group" aria-label="Which hand to practise">
          {(
            [
              ['both', 'Both hands'],
              ['rh', 'Right hand only'],
              ['lh', 'Left hand only'],
            ] as const
          ).map(([h, label]) => (
            <button
              key={h}
              className={hand === h ? 'on' : ''}
              disabled={mode === 'listen' || mode === 'step' || mode === 'tempo'}
              onClick={() => {
                reset()
                setHand(h)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {(bars > 2 || hasChords || ex.piece.swing) && (
        <div className="runner-opts">
          {ex.piece.swing && <span className="badge" title="Play each pair of eighth notes long–short, like a heartbeat">Shuffle feel: long–short eighths</span>}
          {bars > 2 && (
            <label className="check" title="Practise just part of the piece: choose the first and last bar. A bar is the space between two vertical lines.">
              Bars
              <select
                value={range[0]}
                disabled={mode !== 'idle' && mode !== 'done'}
                onChange={(e) => {
                  const from = Number(e.target.value)
                  reset()
                  setRange([from, Math.max(from, range[1])])
                }}
                aria-label="First bar"
              >
                {Array.from({ length: bars }, (_, i) => (
                  <option key={i}>{i + 1}</option>
                ))}
              </select>
              to
              <select
                value={range[1]}
                disabled={mode !== 'idle' && mode !== 'done'}
                onChange={(e) => {
                  const to = Number(e.target.value)
                  reset()
                  setRange([Math.min(range[0], to), to])
                }}
                aria-label="Last bar"
              >
                {Array.from({ length: bars }, (_, i) => (
                  <option key={i}>{i + 1}</option>
                ))}
              </select>
            </label>
          )}
          <label className="check" title="Listen repeats until you press Stop">
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> Loop when listening
          </label>
          {hasChords && (
            <label className="check" title="A simple band plays the chords written above the staff">
              <input type="checkbox" checked={backing} onChange={(e) => setBacking(e.target.checked)} /> Backing chords
            </label>
          )}
        </div>
      )}

      <div className="paper follow" ref={paper}>
        <Score piece={piece} cursor={cursor} good={good} bad={bad} flats={ex.flats} follow />
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
          <Keyboard marks={keyMarks} from={diagram.from} to={diagram.to} onPick={pick} flats={flat} />
        )}
        {count !== null && mode === 'tempo' && <div className="countin">{count}</div>}
      </div>
      {!guitar && (ex.piece.lh || ex.piece.rh.some((e) => e.fingers)) && (
        <p className="legend">
          <span className="lg root" /> right hand <span className="lg lh" /> left hand. Numbers are fingers (1 = thumb).
        </p>
      )}

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

      {mode === 'idle' && !result && (
        <p className="howto muted">
          <strong>Listen</strong> plays it for you. <strong>Step by step</strong> waits while you find each note, with no time pressure. <strong>Play in time</strong> counts
          you in, then you play along with the metronome and get a score.
        </p>
      )}

      <div className="runner-foot">
        <InputBar />
        <label className="check" title="Turn this off to practise reading the notes without being shown where they are">
          <input type="checkbox" checked={hints} onChange={(e) => setHints(e.target.checked)} /> Show {guitar ? 'frets' : 'keys'} to play
        </label>
        {profile.input !== 'mic' && (
          <label className="check">
            <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} /> Guide sound
          </label>
        )}
      </div>

      {mode === 'step' && (
        <p className={`status${wrong ? ' wrong' : ''}`} data-status>
          {wrong ??
            `${!guitar && handsNow.length === 1 ? (handsNow[0] === 'lh' ? 'Left hand: play' : 'Right hand: play') : handsNow.length > 1 ? 'Both hands: play' : 'Play'} the ${
              hints ? 'highlighted ' : ''
            }${guitar && needed >= 3 ? 'chord' : needed > 1 ? `${needed} notes together` : 'note'}${
              profile.input === 'self'
                ? guitar && needed >= 3
                  ? ' by tapping any of its dots on the fretboard (or switch on the microphone below).'
                  : ` by tapping the ${guitar ? 'fretboard' : 'keys'} (or switch on the microphone or MIDI below).`
                : '. The app waits for you.'
            }`}
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
              {Math.round(result.accuracy * 100)}% {!result.counts ? '· notes checked' : passed ? '· passed' : '· keep going'}
            </strong>
            <p className="muted">
              {result.note}{' '}
              {!result.counts
                ? !whole
                  ? 'A section on its own is for fixing a hard spot. Play the whole piece in time to record a tempo.'
                  : hand !== 'both'
                  ? 'One hand alone is for learning the notes. Put both hands together and use Play in time to record a tempo.'
                  : 'You know where the notes are. Now use Play in time to record a tempo.'
                : passed
                ? tempo >= ex.target
                  ? 'You have reached the goal tempo for this exercise.'
                  : `Next step: ${nextTempo} bpm.`
                : 'Slow the tempo down a little, or use Step by step to check the notes.'}
            </p>
          </div>
          <div className="btns">
            {result.counts && passed && tempo < ex.target && (
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

const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th']
/** A fretboard position in words. */
const where = (p: { string: number; fret: number }) => (p.fret === 0 ? `open ${ORDINAL[p.string - 1]} string` : `${ORDINAL[p.string - 1]} string, fret ${p.fret}`)

function uniq<T extends { string: number; fret: number }>(list: T[]): T[] {
  const seen = new Set<string>()
  return list.filter((p) => {
    const k = `${p.string}/${p.fret}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
