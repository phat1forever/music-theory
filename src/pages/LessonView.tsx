import { useEffect, useRef, useState, type ReactNode } from 'react'
import { play, strum, type Ticker } from '../audio/audio'
import { ChordDiagram, CircleOfFifths } from '../components/Diagrams'
import { Fretboard, type Mark } from '../components/Fretboard'
import { Tuner } from '../components/InputBar'
import { Keyboard, type KeyMark } from '../components/Keyboard'
import { Score } from '../components/Score'
import { findLesson, isOpen, nextLesson, trackLessons } from '../curriculum'
import type { Quiz, StepDef } from '../curriculum/types'
import { playPiece, Runner } from '../practice/Runner'
import { actions, useProfile } from '../store/store'
import type { Piece } from '../theory/music'
import {
  fretMidi,
  mod,
  nameIn,
  pc,
  pcs,
  pentatonicBox,
  pretty,
  positions,
  SCALES,
  spell,
} from '../theory/theory'


/** Minimal rich text: blank-line paragraphs, "- " bullet lists, **bold**, *italic*. */
export function Rich({ body }: { body: string }) {
  const inline = (s: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) =>
      part.startsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.startsWith('*') && part.length > 2 ? (
        <em key={i}>{part.slice(1, -1)}</em>
      ) : (
        part
      ),
    )
  return (
    <>
      {body.split(/\n\n+/).map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim())
        const bullets = lines.filter((l) => l.startsWith('- '))
        const intro = lines.filter((l) => !l.startsWith('- '))
        return (
          <div key={i}>
            {intro.length > 0 && <p>{inline(intro.join(' '))}</p>}
            {bullets.length > 0 && (
              <ul>
                {bullets.map((l, j) => (
                  <li key={j}>{inline(l.slice(2))}</li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </>
  )
}

export function PlayButton({ piece, tempo = 80, onBeat }: { piece: Piece; tempo?: number; onBeat: (b: number | null) => void }) {
  const [playing, setPlaying] = useState(false)
  const ticker = useRef<Ticker | null>(null)
  useEffect(() => () => ticker.current?.stop(), [])
  return (
    <button
      className="btn"
      onClick={async () => {
        if (playing) {
          ticker.current?.stop()
          setPlaying(false)
          onBeat(null)
          return
        }
        setPlaying(true)
        ticker.current = await playPiece(piece, tempo, (b) => {
          onBeat(b)
          if (b === null) setPlaying(false)
        })
      }}
    >
      {playing ? 'Stop' : '▶ Play'}
    </button>
  )
}

function ScoreStep({ piece, tempo, flats }: { piece: Piece; tempo?: number; flats?: boolean }) {
  const [cursor, setCursor] = useState<number | null>(null)
  return (
    <>
      <div className="paper">
        <Score piece={piece} cursor={cursor} flats={flats} />
      </div>
      <PlayButton piece={piece} tempo={tempo} onBeat={setCursor} />
    </>
  )
}

export function QuizStep({ quiz, onAnswered }: { quiz: Quiz; onAnswered?: (right: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div className="quiz">
      <p className="quiz-q">{quiz.q}</p>
      <div className="quiz-opts">
        {quiz.options.map((o, i) => (
          <button
            key={i}
            disabled={picked !== null}
            className={picked === null ? '' : i === quiz.answer ? 'right' : i === picked ? 'wrong' : ''}
            onClick={() => {
              setPicked(i)
              onAnswered?.(i === quiz.answer)
            }}
          >
            {o}
          </button>
        ))}
      </div>
      {picked !== null && (
        <p className={picked === quiz.answer ? 'quiz-fb right' : 'quiz-fb wrong'}>
          {picked === quiz.answer ? 'Correct.' : `Not quite. The answer is "${quiz.options[quiz.answer]}".`} {quiz.why}
        </p>
      )}
    </div>
  )
}

function scaleMarks(root: string, scaleKey: string, from: number, to: number): Mark[] {
  const scale = SCALES[scaleKey]
  const set = pcs(root, scale)
  return positions(set, from, to).map((p) => {
    const n = mod(fretMidi(p.string, p.fret), 12)
    return {
      ...p,
      label: pretty(nameIn(n, root, scale, scaleKey)),
      kind: n === pc(root) ? 'root' : scaleKey === 'blues' && n === mod(pc(root) + 6, 12) ? 'blue' : 'tone',
    }
  })
}

function scaleKeys(root: string, scaleKey: string): KeyMark[] {
  const scale = SCALES[scaleKey]
  const base = 60 + pc(root) - (pc(root) > 7 ? 12 : 0)
  const names = spell(root, scale)
  return [...scale.steps, 12].map((s, i) => ({
    midi: base + s,
    label: pretty(names[i % names.length]),
    kind: s % 12 === 0 ? 'root' : scaleKey === 'blues' && s === 6 ? 'blue' : 'tone',
  }))
}

export function StepView({ step, leftHanded }: { step: StepDef; leftHanded: boolean }) {
  switch (step.t) {
    case 'text':
      return <Rich body={step.body} />
    case 'fretboard':
      return (
        <figure>
          <Fretboard
            marks={step.marks}
            from={step.from}
            to={step.to}
            muted={step.muted}
            leftHanded={leftHanded}
            onPick={(m) => play('guitar', [m])}
          />
          {step.caption && <figcaption>{step.caption}</figcaption>}
        </figure>
      )
    case 'box': {
      const box = pentatonicBox(step.root, step.box, step.kind)
      const frets = box.map((p) => p.fret)
      const scale = SCALES[step.kind]
      const marks: Mark[] = box.map((p) => {
        const n = mod(fretMidi(p.string, p.fret), 12)
        const isBlue = step.kind === 'blues' && n === mod(pc(step.root) + 6, 12)
        return {
          ...p,
          label: pretty(nameIn(n, step.root, scale, step.kind)),
          kind: n === pc(step.root) ? 'root' : isBlue ? 'blue' : 'tone',
        }
      })
      const from = Math.max(0, Math.min(...frets) - 1)
      const ascending = [...box].sort((a, b) => fretMidi(a.string, a.fret) - fretMidi(b.string, b.fret))
      return (
        <figure>
          <Fretboard marks={marks} from={from} to={Math.max(...frets) + 1} leftHanded={leftHanded} onPick={(m) => play('guitar', [m])} />
          <figcaption>
            {step.caption}{' '}
            <button className="link" onClick={() => strum('guitar', ascending.map((p) => fretMidi(p.string, p.fret)), 0.22, 0.5)}>
              Hear it
            </button>
          </figcaption>
        </figure>
      )
    }
    case 'scale': {
      const keyMarks = scaleKeys(step.root, step.scale)
      return (
        <figure>
          {step.on !== 'keys' && (
            <Fretboard
              marks={scaleMarks(step.root, step.scale, step.from ?? 0, step.to ?? 12)}
              from={step.from ?? 0}
              to={step.to ?? 12}
              leftHanded={leftHanded}
              onPick={(m) => play('guitar', [m])}
            />
          )}
          {step.on !== 'guitar' && (
            <Keyboard marks={keyMarks} from={keyMarks[0].midi - 2} to={keyMarks[keyMarks.length - 1].midi + 2} onPick={(m) => play('keys', [m])} />
          )}
          <figcaption>
            {step.caption}{' '}
            <button className="link" onClick={() => strum('keys', keyMarks.map((k) => k.midi), 0.3, 0.5)}>
              Hear it
            </button>
          </figcaption>
        </figure>
      )
    }
    case 'keyboard':
      return (
        <figure>
          <Keyboard marks={step.marks} from={step.from} to={step.to} onPick={(m) => play('keys', [m])} />
          {step.caption && <figcaption>{step.caption}</figcaption>}
        </figure>
      )
    case 'chords':
      return (
        <figure>
          <div className="chord-row">
            {step.names.map((n) => (
              <ChordDiagram key={n} name={n} />
            ))}
          </div>
          <figcaption>{step.caption ?? 'Tap a diagram to hear the chord.'}</figcaption>
        </figure>
      )
    case 'score':
      return (
        <figure>
          <ScoreStep piece={step.piece} tempo={step.tempo} flats={step.flats} />
          {step.caption && <figcaption>{step.caption}</figcaption>}
        </figure>
      )
    case 'circle':
      return (
        <figure>
          <CircleOfFifths />
          {step.caption && <figcaption>{step.caption}</figcaption>}
        </figure>
      )
    case 'tuner':
      return <Tuner />
    case 'exercise':
      return <Runner ex={step.ex} />
    case 'quiz':
      return <QuizStep quiz={step} />
  }
}

const KIND: Record<StepDef['t'], string> = {
  text: 'Learn',
  fretboard: 'Diagram',
  box: 'Diagram',
  scale: 'Diagram',
  keyboard: 'Diagram',
  chords: 'Chords',
  score: 'Read and listen',
  circle: 'Diagram',
  tuner: 'Tuner',
  exercise: 'Practice',
  quiz: 'Check',
}

export function LessonView({ id }: { id: string }) {
  const profile = useProfile()
  const ref = findLesson(id)
  const [i, setI] = useState(0)
  const [finished, setFinished] = useState(false)

  if (!ref) return <p>Lesson not found.</p>
  const { lesson, track, unit } = ref
  if (!isOpen(ref, profile))
    return (
      <div className="card">
        <h2>{lesson.title}</h2>
        <p>This lesson unlocks when you finish the ones before it.</p>
        <div className="btns">
          {nextLesson(track.id, profile) && (
            <a className="btn primary" href={`#/lesson/${nextLesson(track.id, profile)!.lesson.id}`}>
              Go to your next lesson: {nextLesson(track.id, profile)!.lesson.title}
            </a>
          )}
          <a className="btn" href={`#/lessons/${track.id}`}>
            All {track.title.toLowerCase()} lessons (you can jump ahead there)
          </a>
        </div>
      </div>
    )

  const untried = lesson.steps.flatMap((st) => (st.t === 'exercise' && !profile.exercises[st.ex.id] ? [st.ex] : []))
  const all = trackLessons(track.id)
  const next = all[all.findIndex((r) => r.lesson.id === id) + 1]

  if (finished)
    return (
      <div className="card done-card">
        <div className="eyebrow">Lesson complete</div>
        <h2>{lesson.title}</h2>
        <p>
          <strong>The goal was:</strong> {lesson.goal}
        </p>
        {untried.length > 0 ? (
          <p className="notice">
            You have not played {untried.length === 1 ? 'the exercise' : `${untried.length} of the exercises`} in this lesson yet. Reading is the easy part: the skill comes
            from playing.{' '}
            <a href={`#/practice/${untried[0].id}`}>Practise "{untried[0].title}" now</a>
          </p>
        ) : (
          <p className="muted">The exercises from this lesson are in Practice. They will come back for review, a little faster each time.</p>
        )}
        <div className="btns">
          {next ? (
            <a className="btn primary" href={`#/lesson/${next.lesson.id}`}>
              Next: {next.lesson.title}
            </a>
          ) : (
            <a className="btn primary" href="#/jam">
              Track finished. Open Jam
            </a>
          )}
          <a className="btn" href={`#/lessons/${track.id}`}>
            All {track.title.toLowerCase()} lessons
          </a>
        </div>
      </div>
    )

  const step = lesson.steps[i]
  const last = i === lesson.steps.length - 1
  const title = 'title' in step && step.title ? step.title : step.t === 'exercise' ? null : step.t === 'quiz' ? 'Quick check' : null

  return (
    <div className="lesson">
      <a className="crumb" href={`#/lessons/${track.id}`}>
        ← {track.title} · {unit.title}
      </a>
      <h1>{lesson.title}</h1>
      <p className="goal">
        <strong>Goal:</strong> {lesson.goal}
      </p>
      <div className="dots" aria-label={`Step ${i + 1} of ${lesson.steps.length}`}>
        {lesson.steps.map((s, j) => (
          <button key={j} className={j === i ? 'on' : j < i ? 'past' : ''} onClick={() => setI(j)} title={KIND[s.t]} aria-label={`Step ${j + 1}: ${KIND[s.t]}`} />
        ))}
      </div>
      <section className="card step" key={`${id}-${i}`}>
        <div className="eyebrow">
          {KIND[step.t]} · {i + 1} of {lesson.steps.length}
        </div>
        {title && <h2>{title}</h2>}
        <StepView step={step} leftHanded={profile.leftHanded} />
      </section>
      <div className="lesson-nav">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>
          Back
        </button>
        {last ? (
          <button
            className="btn primary"
            data-act="finish"
            onClick={() => {
              actions.completeLesson(id)
              setFinished(true)
              window.scrollTo(0, 0)
            }}
          >
            Finish lesson
          </button>
        ) : (
          <button
            className="btn primary"
            data-act="next"
            onClick={() => {
              setI(i + 1)
              window.scrollTo(0, 0)
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
