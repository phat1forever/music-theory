import { useEffect, useMemo, useRef, useState } from 'react'
import { ensureAudio, now, play, type Ticker } from '../audio/audio'
import { Fretboard, type Mark } from '../components/Fretboard'
import { InputBar } from '../components/InputBar'
import { Keyboard, type KeyMark } from '../components/Keyboard'
import { Score } from '../components/Score'
import { earAccuracy } from '../curriculum/skills'
import { emitNote, onNote } from '../input/input'
import {
  chordNotes,
  chordQuestion,
  DRILLS,
  echoQuestion,
  intervalName,
  intervalQuestion,
  progressionQuestion,
  rhythmPiece,
  rhythmQuestion,
  scaleQuestion,
  type DrillInfo,
  type EchoQ,
  type RhythmQ,
} from '../practice/ear'
import { playPiece } from '../practice/Runner'
import { actions, useProfile } from '../store/store'
import { CHORDS, midiName, mod, pretty, SCALES, TUNING } from '../theory/theory'

/** Play groups of notes one after another: each entry is [notes, seconds after the start, length]. */
async function sequence(events: [number[], number, number][]): Promise<void> {
  await ensureAudio()
  const t = now() + 0.06
  for (const [notes, at, len] of events) play('keys', notes, len, t + at)
}

function useLevel(drill: string): [number, (n: number) => void] {
  const profile = useProfile()
  return [profile.ear[drill]?.level ?? 1, (n) => actions.setEarLevel(drill, n)]
}

function LevelBar({ info }: { info: DrillInfo }) {
  const profile = useProfile()
  const [level, setLevel] = useLevel(info.id)
  const stat = profile.ear[info.id]
  const acc = earAccuracy(stat, level)
  const answered = stat?.recent[level]?.length ?? 0
  return (
    <div className="ear-level">
      <div className="seg" role="group" aria-label="Level">
        {[1, 2, 3].map((n) => (
          <button key={n} className={n === level ? 'on' : ''} onClick={() => setLevel(n)}>
            Level {n}
          </button>
        ))}
      </div>
      <span className="muted">{info.levels[level - 1]}</span>
      <span className="ear-score" data-ear-score>
        {answered === 0 ? 'No answers yet at this level' : `Last ${Math.min(10, answered)}: ${(stat!.recent[level] ?? []).slice(-10).reduce((a, b) => a + b, 0)} right`}
      </span>
      {acc !== null && answered >= 10 && acc >= 0.8 && level < 3 && (
        <button className="btn small primary" onClick={() => setLevel(level + 1)}>
          You are ready for level {level + 1}
        </button>
      )}
      {acc !== null && answered >= 10 && acc <= 0.4 && level > 1 && (
        <button className="btn small" onClick={() => setLevel(level - 1)}>
          Too hard for now? Try level {level - 1}
        </button>
      )}
    </div>
  )
}

// ---------- multiple-choice drills ----------

interface Choice {
  options: string[]
  answer: number
  play: () => void
  /** shown after answering */
  detail: string
}

function makeChoice(drill: string, level: number): Choice {
  if (drill === 'intervals') {
    const q = intervalQuestion(level)
    const hi = q.low + q.semis
    return {
      options: q.options.map(intervalName),
      answer: q.options.indexOf(q.semis),
      play: () =>
        void sequence(q.how === 'together' ? [[[q.low, hi], 0, 1.4]] : q.how === 'up' ? [[[q.low], 0, 0.8], [[hi], 0.7, 1.1]] : [[[hi], 0, 0.8], [[q.low], 0.7, 1.1]]),
      detail: `${pretty(midiName(q.low))} and ${pretty(midiName(hi))}: ${q.semis} half step${q.semis > 1 ? 's' : ''}${q.how === 'down' ? ', falling' : q.how === 'together' ? ', played together' : ''}.`,
    }
  }
  if (drill === 'chords') {
    const q = chordQuestion(level)
    const notes = CHORDS[q.quality].steps.map((s) => q.root + s)
    return {
      options: q.options.map((k) => CHORDS[k].name),
      answer: q.options.indexOf(q.quality),
      play: () => void sequence([...notes.map((n, i): [number[], number, number] => [[n], i * 0.25, 0.5]), [notes, notes.length * 0.25 + 0.2, 1.6]]),
      detail: `${pretty(midiName(q.root).replace(/-?\d+$/, ''))} ${CHORDS[q.quality].name.toLowerCase()}: ${CHORDS[q.quality].labels.map(pretty).join(' ')}.`,
    }
  }
  if (drill === 'scales') {
    const q = scaleQuestion(level)
    const notes = [...SCALES[q.scale].steps, 12].map((s) => q.root + s)
    return {
      options: q.options.map((k) => SCALES[k].name),
      answer: q.options.indexOf(q.scale),
      play: () => void sequence(notes.map((n, i): [number[], number, number] => [[n], i * 0.3, 0.45])),
      detail: `${SCALES[q.scale].name}: ${SCALES[q.scale].labels.map(pretty).join(' ')}.`,
    }
  }
  const q = progressionQuestion(level)
  const home = chordNotes(q.key, 0, q.answer.minor ? 'min' : 'maj')
  return {
    options: q.options.map((p) => p.label),
    answer: q.options.indexOf(q.answer),
    play: () =>
      void sequence([
        [[home.bass, ...home.notes], 0, 1.0],
        ...q.answer.chords.map(([step, quality], i): [number[], number, number] => {
          const c = chordNotes(q.key, step, quality)
          return [[c.bass, ...c.notes], 1.7 + i * 1.05, 1.0]
        }),
      ]),
    detail: `In ${pretty(midiName(60 + q.key).replace(/-?\d+$/, ''))} ${q.answer.minor ? 'minor' : 'major'}.`,
  }
}

function ChoiceDrill({ info }: { info: DrillInfo }) {
  const [level] = useLevel(info.id)
  const [q, setQ] = useState<Choice | null>(null)
  const [picked, setPicked] = useState<number | null>(null)

  // A change of level starts afresh.
  useEffect(() => {
    setQ(null)
    setPicked(null)
  }, [level])

  const ask = () => {
    const next = makeChoice(info.id, level)
    setQ(next)
    setPicked(null)
    next.play()
  }

  return (
    <div className="ear-drill">
      <div className="btns">
        <button className="btn primary" data-act="ear-next" onClick={ask}>
          {q ? (picked === null ? 'Skip' : 'Next') : 'Start'}
        </button>
        {q && (
          <button className="btn" onClick={q.play}>
            ▶ Hear again
          </button>
        )}
      </div>
      {q && (
        <>
          <div className={`quiz-opts ${q.options.length > 4 ? 'two' : ''}`} data-ear-options>
            {q.options.map((o, i) => (
              <button
                key={i}
                disabled={picked !== null}
                className={picked === null ? '' : i === q.answer ? 'right' : i === picked ? 'wrong' : ''}
                data-correct={i === q.answer ? '1' : undefined}
                onClick={() => {
                  setPicked(i)
                  actions.earAnswer(info.id, level, i === q.answer)
                }}
              >
                {o}
              </button>
            ))}
          </div>
          {picked !== null && (
            <p className={picked === q.answer ? 'quiz-fb right' : 'quiz-fb wrong'}>
              {picked === q.answer ? 'Correct.' : `It was ${q.options[q.answer]}.`} <span className="muted">{q.detail} Hear it again with the answer in mind.</span>
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ---------- play it back ----------

function EchoDrill({ info }: { info: DrillInfo }) {
  const profile = useProfile()
  const [level] = useLevel(info.id)
  const [q, setQ] = useState<EchoQ | null>(null)
  const [at, setAt] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [shown, setShown] = useState(false)
  const [note, setNote] = useState('')
  const guitarFirst = Object.keys(profile.lessons).filter((id) => id.startsWith('g-')).length >= Object.keys(profile.lessons).filter((id) => id.startsWith('k-')).length
  const [view, setView] = useState<'keys' | 'guitar'>(guitarFirst && Object.keys(profile.lessons).length > 0 ? 'guitar' : 'keys')
  const listening = useRef(false)
  const state = useRef({ at: 0, mistakes: 0 })
  const done = q !== null && (at >= q.notes.length || shown)

  useEffect(() => {
    setQ(null)
  }, [level])

  const hear = (question: EchoQ) => {
    listening.current = false
    const third = question.minor ? 3 : 4
    const events: [number[], number, number][] = [
      [[question.tonic - 12, question.tonic, question.tonic + third, question.tonic + 7], 0, 0.9],
      ...question.notes.map((n, i): [number[], number, number] => [[n], 1.4 + i * 0.6, 0.55]),
    ]
    void sequence(events)
    // Ignore the microphone while the app itself is playing.
    window.setTimeout(() => (listening.current = true), (1.4 + question.notes.length * 0.6) * 1000)
  }

  const ask = () => {
    const next = echoQuestion(level)
    setQ(next)
    setAt(0)
    setMistakes(0)
    setShown(false)
    setNote('')
    state.current = { at: 0, mistakes: 0 }
    hear(next)
  }

  useEffect(() => {
    if (!q || done) return
    return onNote((e) => {
      if (!listening.current && e.source !== 'click') return
      const st = state.current
      if (mod(e.midi - q.notes[st.at], 12) === 0) {
        st.at++
        setAt(st.at)
        setNote('')
        if (st.at >= q.notes.length) actions.earAnswer(info.id, level, st.mistakes === 0)
      } else {
        st.mistakes++
        setMistakes(st.mistakes)
        setNote(st.at === 0 ? 'Not that one. Sing the first note, then look for it.' : `Not that one. Does note ${st.at + 1} go up or down from the last?`)
      }
    })
  }, [q, done, info.id, level])

  const tap = (m: number) => {
    play(view === 'guitar' ? 'guitar' : 'keys', [m], 0.6)
    emitNote(m, 'click')
  }

  const reveal = () => {
    if (!q || done) return
    actions.earAnswer(info.id, level, false)
    setShown(true)
  }

  const flat = false
  const found = q ? q.notes.slice(0, done ? q.notes.length : at) : []
  const hint = q && level < 3 && at === 0 && !done ? [q.notes[0]] : []
  const keyMarks: KeyMark[] = q
    ? [
        ...found.map((m, i): KeyMark => ({ midi: m, label: String(i + 1), kind: 'done' })),
        ...hint.map((m): KeyMark => ({ midi: m, label: '1', kind: 'active' })),
        ...(found.includes(q.tonic) || hint.includes(q.tonic) ? [] : [{ midi: q.tonic, label: 'home', kind: 'ghost' } as KeyMark]),
      ]
    : []
  // Where to show a note on the neck: an octave down from the keyboard pitch, at the lowest fret that has it.
  const onFret = (m: number) => {
    let best = { string: 1, fret: 24 }
    for (let s = 6; s >= 1; s--) {
      const fret = m - 12 - TUNING[s - 1]
      if (fret >= 0 && fret < best.fret) best = { string: s, fret }
    }
    return best
  }
  const fretMarks: Mark[] = q
    ? [
        ...found.map((m, i): Mark => ({ ...onFret(m), label: String(i + 1), kind: 'chord' })),
        ...hint.map((m): Mark => ({ ...onFret(m), label: '1', kind: 'active' })),
      ]
    : []

  return (
    <div className="ear-drill">
      <div className="btns">
        <button className="btn primary" data-act="ear-next" onClick={ask}>
          {q ? (done ? 'Next phrase' : 'Skip') : 'Start'}
        </button>
        {q && (
          <button className="btn" onClick={() => hear(q)}>
            ▶ Hear again
          </button>
        )}
        {q && !done && (
          <button className="btn" onClick={reveal}>
            Show me
          </button>
        )}
        <div className="seg">
          <button className={view === 'keys' ? 'on' : ''} onClick={() => setView('keys')}>
            Keyboard
          </button>
          <button className={view === 'guitar' ? 'on' : ''} onClick={() => setView('guitar')}>
            Fretboard
          </button>
        </div>
      </div>
      {q && (
        <>
          <p className={`status${note ? ' wrong' : ''}`} data-echo-status>
            {done
              ? at >= q.notes.length
                ? mistakes === 0
                  ? 'Right first time.'
                  : `You found it, with ${mistakes} wrong note${mistakes > 1 ? 's' : ''} on the way. Only clean runs count toward your score.`
                : `Here it is: ${q.notes.map((n) => pretty(midiName(n, flat).replace(/-?\d+$/, ''))).join(' ')}. Play it through a few times.`
              : note || `You hear the home chord, then ${q.notes.length} notes. Play them back: note ${at + 1} of ${q.notes.length}.${level < 3 && at === 0 ? ' The first note is marked.' : ''}`}
          </p>
          <div className="scroll-x">
            {view === 'keys' ? (
              <Keyboard marks={keyMarks} from={q.tonic - 2} to={q.tonic + 17} onPick={tap} />
            ) : (
              <Fretboard marks={fretMarks} from={0} to={12} leftHanded={profile.leftHanded} onPick={(m) => tap(m)} />
            )}
          </div>
        </>
      )}
      <InputBar />
      <p className="muted tight">Any octave counts. With the microphone on, the app waits until its own phrase has finished before it listens.</p>
    </div>
  )
}

// ---------- rhythm ----------

function RhythmDrill({ info }: { info: DrillInfo }) {
  const [level] = useLevel(info.id)
  const [q, setQ] = useState<RhythmQ | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const ticker = useRef<Ticker | null>(null)
  const pieces = useMemo(() => q?.options.map(rhythmPiece) ?? [], [q])

  useEffect(() => {
    setQ(null)
    return () => ticker.current?.stop()
  }, [level])

  const hear = async (question: RhythmQ) => {
    ticker.current?.stop()
    ticker.current = await playPiece(rhythmPiece(question.options[question.answer]), 80, () => {}, { countIn: true })
  }
  const ask = () => {
    const next = rhythmQuestion(level)
    setQ(next)
    setPicked(null)
    void hear(next)
  }

  return (
    <div className="ear-drill">
      <div className="btns">
        <button className="btn primary" data-act="ear-next" onClick={ask}>
          {q ? (picked === null ? 'Skip' : 'Next') : 'Start'}
        </button>
        {q && (
          <button className="btn" onClick={() => void hear(q)}>
            ▶ Hear again
          </button>
        )}
      </div>
      {q && (
        <>
          <p className="muted tight">Four clicks count you in, then the rhythm plays once. Tap or count along, then choose.</p>
          <div className="rhythm-opts" data-ear-options>
            {pieces.map((piece, i) => (
              <button
                key={`${q.options[i]}-${i}`}
                disabled={picked !== null}
                className={picked === null ? '' : i === q.answer ? 'right' : i === picked ? 'wrong' : ''}
                data-correct={i === q.answer ? '1' : undefined}
                onClick={() => {
                  setPicked(i)
                  actions.earAnswer(info.id, level, i === q.answer)
                }}
              >
                <div className="paper">
                  <Score piece={piece} />
                </div>
              </button>
            ))}
          </div>
          {picked !== null && <p className={picked === q.answer ? 'quiz-fb right' : 'quiz-fb wrong'}>{picked === q.answer ? 'Correct.' : 'Not that one: the right rhythm is outlined in green. Hear it again while you read it.'}</p>}
        </>
      )}
    </div>
  )
}

// ---------- page ----------

export function Ear({ drill }: { drill?: string }) {
  const profile = useProfile()
  const info = DRILLS.find((d) => d.id === drill)

  if (!info)
    return (
      <div className="stack">
        <h1>Ear training</h1>
        <p className="muted">
          Six short drills that keep score. Two or three minutes most days does more than a long session once a week. Each drill has three levels: start where it feels
          comfortable, and move up when you get eight out of ten.
        </p>
        <div className="grid3">
          {DRILLS.map((d) => {
            const stat = profile.ear[d.id]
            const level = stat?.level ?? 1
            const recent = stat?.recent[level]?.slice(-10) ?? []
            return (
              <a className="card tool" key={d.id} href={`#/ear/${d.id}`} data-drill={d.id}>
                <h3>{d.name}</h3>
                <p className="muted">{d.about}</p>
                <small className="muted">{recent.length ? `Level ${level} · last ${recent.length}: ${recent.reduce((a, b) => a + b, 0)} right` : 'Not started'}</small>
              </a>
            )
          })}
        </div>
        <section className="card">
          <h2>How to use these</h2>
          <ul>
            <li>
              <strong>Sing before you answer.</strong> Hum the notes you heard. If you can sing it, you can name it.
            </li>
            <li>
              <strong>Listen again after the answer.</strong> That second hearing, knowing what it is, is where the learning happens.
            </li>
            <li>
              <strong>Mix the drills.</strong> A minute each of two or three drills beats ten minutes of one.
            </li>
          </ul>
          <p className="muted">
            New to this? The three short lessons under <a href="#/lessons/theory">Lessons → Music theory → Studio: ear training</a> explain what to listen for.
          </p>
        </section>
      </div>
    )

  return (
    <div className="stack">
      <a className="crumb" href="#/ear">
        ← Ear training
      </a>
      <h1>{info.name}</h1>
      <p className="muted">{info.about}</p>
      <section className="card" key={info.id}>
        <LevelBar info={info} />
        {info.id === 'echo' ? <EchoDrill info={info} /> : info.id === 'rhythm' ? <RhythmDrill info={info} /> : <ChoiceDrill info={info} />}
      </section>
    </div>
  )
}
