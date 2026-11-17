import { useRef, useState } from 'react'
import { InputBar } from '../components/InputBar'
import {
  EXERCISES,
  findExercise,
  isOpen,
  coreUnits,
  studioUnits,
  nextLesson,
  pendingCheckpoints,
  TRACKS,
  trackLessons,
  trackProgress,
  unlockedExercises,
} from '../curriculum'
import type { Track, Unit } from '../curriculum/types'
import { focusSkills, type Instrument } from '../curriculum/skills'
import { DRILLS } from '../practice/ear'
import { CHECK_PASS, mastery, streak } from '../practice/grading'
import { Runner } from '../practice/Runner'
import { actions, today, useProfile, useStore, type Profile } from '../store/store'
import { QuizStep } from './LessonView'

function Bar({ value }: { value: number }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}

const dueExercises = (p: Profile) =>
  unlockedExercises(p)
    .filter((r) => p.exercises[r.ex.id] && p.exercises[r.ex.id].due <= today())
    .sort((a, b) => p.exercises[a.ex.id].due.localeCompare(p.exercises[b.ex.id].due))

// ---------- Home ----------

/** The ear drill with the fewest answers so far, so all six get attention. */
const earTip = (p: Profile) => [...DRILLS].sort((a, b) => (p.ear[a.id]?.total ?? 0) - (p.ear[b.id]?.total ?? 0))[0]

/** A short session plan built from the "how to practise" routine: warm up, review what is due, learn, consolidate, play. */
function Today({ p }: { p: Profile }) {
  const due = dueExercises(p)
  const active = TRACKS.filter((t) => trackLessons(t.id).some((r) => p.lessons[r.lesson.id]))
  const checkpoints = active.flatMap((t) => pendingCheckpoints(t.id, p))
  const next = active.flatMap((t) => {
    const n = nextLesson(t.id, p)
    return n ? [n] : []
  })
  // A weak spot from the skill map: shown once the player has rated skills, or has finished a step-by-step path.
  const instruments = active.filter((t) => t.id !== 'theory').map((t) => t.id as Instrument)
  const focus = instruments.flatMap((inst) => {
    const wanted = Object.keys(p.skillSelf).some((k) => k.startsWith(`${inst}:`)) || !nextLesson(inst, p)
    const f = wanted ? focusSkills(inst, p, 1)[0] : undefined
    const lesson = f?.lessons.find((r) => isOpen(r, p) && !next.some((n) => n.lesson.id === r.lesson.id))
    return f && lesson ? [{ skill: f.state.info.name, lesson, inst }] : []
  })
  return (
    <section className="card today" data-today>
      <div className="eyebrow">Today's session · about 25 minutes</div>
      <ol className="today-list">
        <li>
          <strong>Warm up</strong> <small className="muted">3 min</small>
          <span className="muted"> A slow scale or the chord changes you already know. Loosen your hands first.</span>
        </li>
        <li>
          <strong>Review</strong> <small className="muted">5 min</small>
          {due.length === 0 ? (
            <span className="muted"> Nothing due today. Replay a favourite from Practice.</span>
          ) : (
            <ul className="rows">
              {due.slice(0, 3).map((r) => (
                <li key={r.ex.id}>
                  <a href={`#/practice/${r.ex.id}`}>
                    <span>
                      <strong>{r.ex.title}</strong>
                      <small>
                        {r.track.title} · best {p.exercises[r.ex.id].bestTempo || '–'} bpm, goal {r.ex.target}
                      </small>
                    </span>
                    <span className="chev">Practise →</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {due.length > 3 && (
            <a className="link" href="#/practice">
              {' '}
              {due.length - 3} more due
            </a>
          )}
        </li>
        <li>
          <strong>New</strong> <small className="muted">about 10 min: one lesson, or part of one</small>
          {next.length === 0 && focus.length === 0 && <span className="muted"> You have taken every lesson on your paths. Pick something from the studio, or spend this time on review.</span>}
          {focus.length > 0 && (
            <ul className="rows" data-today-focus>
              {focus.map((f) => (
                <li key={f.lesson.lesson.id}>
                  <a href={`#/lesson/${f.lesson.lesson.id}`}>
                    <span>
                      <strong>{f.lesson.lesson.title}</strong>
                      <small>
                        From your skill map · focus: {f.skill} · {f.lesson.lesson.minutes} min
                      </small>
                    </span>
                    <span className="chev">Start →</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {next.length === 0 ? null : (
            <ul className="rows">
              {next.map((n) => (
                <li key={n.lesson.id}>
                  <a href={`#/lesson/${n.lesson.id}`}>
                    <span>
                      <strong>{n.lesson.title}</strong>
                      <small>
                        {n.track.title} · {n.unit.title} · {n.lesson.minutes} min
                      </small>
                    </span>
                    <span className="chev">Start →</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
        {checkpoints.length > 0 && (
          <li>
            <strong>Consolidate</strong>
            <span className="muted"> You have finished the lessons in {checkpoints.map((c) => `"${c.unit.title}"`).join(' and ')}. Show it has sunk in with the unit checkpoint:</span>
            <ul className="rows">
              {checkpoints.map((c) => (
                <li key={c.unit.id}>
                  <a href={`#/lessons/${c.track.id}`}>
                    <span>
                      <strong>{c.unit.title}: checkpoint</strong>
                      <small>{c.unit.check!.title}</small>
                    </span>
                    <span className="chev">Take it →</span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
        )}
        <li>
          <strong>Ear</strong> <small className="muted">2 min</small>
          <span className="muted">
            {' '}
            Ten questions in <a href="#/ear">Ear training</a>: try <a href={`#/ear/${earTip(p).id}`}>{earTip(p).name}</a> today.
          </span>
        </li>
        <li>
          <strong>Play</strong> <small className="muted">3 min</small>
          <span className="muted">
            {' '}
            Something you enjoy: a piece you know, or <a href="#/jam">Jam</a>. Finish on a good note.
          </span>
        </li>
      </ol>
    </section>
  )
}

function Checkpoint({ unit }: { unit: Unit }) {
  const p = useProfile()
  const [open, setOpen] = useState(false)
  if (!unit.check) return null
  const passedOn = p.checkpoints[unit.id]
  return (
    <div className="checkpoint" data-checkpoint={unit.id}>
      <div className="split-head">
        <div>
          <strong>Unit checkpoint:</strong> <span className="muted">{unit.check.title}</span>
          {passedOn ? (
            <p className="place-ok tight">✓ Passed on {passedOn}. Replay it any time to keep it sharp.</p>
          ) : (
            <p className="muted tight">
              You have taken the lessons in this unit. Now show it has sunk in: play this short piece cleanly, in time. The microphone or MIDI keyboard grades it; otherwise you rate yourself.
            </p>
          )}
        </div>
        <button className="btn small" onClick={() => setOpen(!open)}>
          {open ? 'Close' : passedOn ? 'Replay' : 'Take the checkpoint'}
        </button>
      </div>
      {open && (
        <Runner
          key={`cp-${unit.id}`}
          ex={{ id: `checkpoint-${unit.id}`, title: unit.check.title, piece: unit.check.piece, tempo: unit.check.tempo, target: unit.check.tempo, flats: unit.check.flats }}
          check={{
            onResult: (a) => {
              if (a !== null && a >= CHECK_PASS) actions.passCheckpoint(unit.id)
            },
          }}
        />
      )}
    </div>
  )
}

export function Home() {
  const p = useProfile()
  const days = streak(p.days, today())
  // Someone who has practised something is past the first-run screen, even before finishing a lesson.
  const started =
    Object.keys(p.lessons).length > 0 || p.tried.length > 0 || Object.keys(p.exercises).length > 0 || Object.keys(p.ear).length > 0 || Object.keys(p.skillSelf).length > 0
  return (
    <div className="stack">
      <header className="hero">
        <div>
          <h1>{started ? `Welcome back, ${p.name}` : 'Learn theory, guitar and keyboard'}</h1>
          <p>
            {started
              ? 'Your session for today is below: about twenty-five minutes, in this order.'
              : 'Short, focused lessons with diagrams, tab and sheet music. Practise each skill until it sticks, then build toward improvising your own solos.'}
          </p>
        </div>
        <div className="streak" title="Days in a row with practice">
          <strong>{days}</strong>
          <span>day streak</span>
        </div>
      </header>

      {!started && (
        <section className="card start-here">
          <div className="eyebrow">Start here</div>
          <h2>What would you like to do first?</h2>
          <div className="btns">
            <a className="btn primary" href="#/lesson/g-setup">
              I'm new to guitar
            </a>
            <a className="btn primary" href="#/lesson/k-posture">
              I'm new to keyboard
            </a>
            <a className="btn" href="#/lessons/guitar/place">
              I already play guitar: find my level
            </a>
            <a className="btn" href="#/lessons/keys/place">
              I already play keyboard: find my level
            </a>
          </div>
          <p className="muted tight">
            Each track starts from zero. If you already play, the placement check skips what you know, and the <a href="#/skills">skill map</a> finds the areas
            that have fallen behind. The theory track explains the "why" and can be taken alongside either instrument.
          </p>
        </section>
      )}

      {started && <Today p={p} />}

      <section className="grid3">
        {TRACKS.map((t) => {
          const next = nextLesson(t.id, p)
          const prog = trackProgress(t.id, p)
          return (
            <div className="card track-card" key={t.id}>
              <div className="eyebrow">{t.title}</div>
              {next ? (
                <>
                  <h3>{next.lesson.title}</h3>
                  <p className="muted">
                    {next.unit.title} · about {next.lesson.minutes} min
                  </p>
                </>
              ) : (
                <>
                  <h3>{trackLessons(t.id).every((r) => p.lessons[r.lesson.id] === 'done') ? 'All lessons complete' : 'No lessons left to unlock'}</h3>
                  <p className="muted">Skipped lessons stay open under All lessons. Keep reviewing in Practice and Jam.</p>
                </>
              )}
              <Bar value={(prog.done + prog.skipped) / prog.total} />
              <small className="muted">
                {prog.done} of {prog.total} lessons done{prog.skipped ? ` · ${prog.skipped} skipped` : ''}
              </small>
              <div className="btns">
                {next && (
                  <a className="btn primary" href={`#/lesson/${next.lesson.id}`}>
                    {prog.done ? 'Continue' : 'Start'}
                  </a>
                )}
                <a className="btn" href={`#/lessons/${t.id}`}>
                  All lessons
                </a>
              </div>
            </div>
          )
        })}
      </section>

      <section className="grid3">
        <a className="card tool" href="#/explore">
          <h3>Explore</h3>
          <p className="muted">Any scale or chord, in any key, on the fretboard, keyboard and staff.</p>
        </a>
        <a className="card tool" href="#/jam">
          <h3>Jam</h3>
          <p className="muted">Improvise over a backing track with the scale lit up under your fingers.</p>
        </a>
        <a className="card tool" href="#/practice">
          <h3>Practice</h3>
          <p className="muted">Every exercise you have unlocked, with tempo goals and review dates.</p>
        </a>
      </section>
    </div>
  )
}

// ---------- Lessons ----------

type Phase = 'quiz' | 'quiz2' | 'play'

/**
 * Placement: for each unit in turn, answer a question (two for the theory units) and, in the instrument tracks, play a short
 * piece in time. A unit is skipped only if everything is right. The first miss ends the check and starts you there.
 */
function Placement({ track, onClose }: { track: Track; onClose: () => void }) {
  // Placement covers the step-by-step path only; studio units are always open.
  const units = coreUnits(track)
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<Phase>('quiz')
  const [stopped, setStopped] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [questionsOnly, setQuestionsOnly] = useState<string[]>([])
  // Once the player has attempted the playing part of a unit, skipping it is no longer offered.
  const [playTried, setPlayTried] = useState(false)
  // Nothing is saved until the check ends, so Cancel really cancels.
  const committed = useRef(false)
  const unit = units[i]
  const last = units.length - 1

  const finish = (count: number) => {
    // Never skip the final unit: even a perfect score starts you there.
    count = Math.min(count, last)
    actions.skipLessons(units.slice(0, count).flatMap((u) => u.lessons.map((l) => l.id)))
    if (track.id === 'guitar' && count >= 4) actions.unlockJam()
  }
  const commit = (count: number) => {
    if (committed.current) return
    committed.current = true
    finish(count)
  }
  const stop = (why: string) => {
    commit(i)
    setStopped(why)
  }
  const pass = (byQuestionsOnly = false) => {
    if (byQuestionsOnly) setQuestionsOnly((q) => [...q, unit.title])
    if (i + 1 >= units.length) commit(i + 1)
    setI(i + 1)
    setPhase('quiz')
    setAnswered(false)
    setScore(null)
    setPlayTried(false)
  }
  /** The questions for this unit are all right: on to the next part. */
  const afterQuestions = () => {
    setAnswered(false)
    if (phase === 'quiz' && unit.placement2) setPhase('quiz2')
    else if (unit.check) {
      setPhase('play')
      setScore(null)
    } else pass()
  }

  if (stopped !== null || i >= units.length) {
    const startAt = units[Math.min(i, last)]
    return (
      <div className="card">
        <div className="eyebrow">Placement result</div>
        <h3>{i === 0 ? `Start at the beginning: ${startAt.title}` : `Start at: ${startAt.title}`}</h3>
        <p className="muted">
          {stopped ? `${stopped} ` : ''}
          {i === 0
            ? 'Nothing was skipped.'
            : `${Math.min(i, last)} earlier unit${Math.min(i, last) > 1 ? 's' : ''} marked as known. Those lessons stay open, so you can go back to any of them.`}
          {i > last ? ' You passed everything, so you start at the final unit; skim it, or use it as a check.' : ''}
        </p>
        {questionsOnly.length > 0 && (
          <p className="muted">
            For {questionsOnly.join(', ')} you skipped the playing part, so those units were judged on the questions alone, which is less reliable. If something there feels
            shaky, just open it.
          </p>
        )}
        {i > 0 && (
          <p className="muted">
            Marked as known: {units.slice(0, Math.min(i, last)).map((u) => u.title).join(', ')}. Skipped exercises are in Practice under "from lessons you skipped".
          </p>
        )}
        {track.id !== 'theory' && (
          <p className="muted">
            A placement check only samples each unit, and nobody develops evenly. If one area is behind the rest ({track.id === 'guitar' ? 'barre chords, say, or note names' : 'reading the bass clef, say, or the pedal'}),
            rate it on the <a href={`#/skills/${track.id}`}>skill map</a>: that puts its lessons in front of you wherever you start.
          </p>
        )}
        <button className="btn primary" onClick={onClose}>
          Done
        </button>
      </div>
    )
  }

  const steps = phase === 'play' ? 'play it' : phase === 'quiz2' ? 'question 2' : unit.placement2 ? 'question 1' : 'question'
  return (
    <div className="card placement-check">
      <div className="eyebrow">
        Placement check · unit {i + 1} of {units.length} · {steps}
      </div>
      <h3>{unit.title}</h3>

      {phase !== 'play' && (
        <>
          <QuizStep
            key={`${i}-${phase}`}
            quiz={phase === 'quiz2' ? unit.placement2! : unit.placement!}
            onAnswered={(right) => {
              setAnswered(true)
              if (!right) stop('A question was missed.')
            }}
          />
          <div className="btns">
            {answered && stopped === null && (
              <button className="btn primary" onClick={afterQuestions}>
                {phase === 'quiz' && unit.placement2 ? 'Next question' : unit.check ? 'Now play it' : i + 1 < units.length ? 'Next unit' : 'See result'}
              </button>
            )}
            {!answered && (
              <button className="btn" onClick={() => stop('You were not sure.')}>
                I'm not sure
              </button>
            )}
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      )}

      {phase === 'play' && unit.check && (
        <>
          <p>
            <strong>{unit.check.title}.</strong> Play this cleanly, in time, from the {track.id === 'guitar' ? 'tab or the notation' : 'notation'}. It is graded if the microphone{track.id === 'keys' ? ' or a MIDI keyboard is' : ' is'}{' '}
            on; otherwise you rate yourself, so be honest: the point is to land you at the right lesson.
          </p>
          <Runner
            key={`pc-${unit.id}`}
            ex={{
              id: `check-${unit.id}`,
              title: unit.check.title,
              piece: unit.check.piece,
              tempo: unit.check.tempo,
              target: unit.check.tempo,
              flats: unit.check.flats,
            }}
            check={{
              onResult: (a) => {
                setScore(a)
                if (a !== null) setPlayTried(true)
              },
            }}
          />
          {score !== null && (
            <div className="btns" style={{ marginTop: 12 }}>
              {score >= CHECK_PASS ? (
                <button className="btn primary" onClick={() => pass()}>
                  {i + 1 < units.length ? 'Next unit' : 'See result'}
                </button>
              ) : (
                <button className="btn primary" onClick={() => stop('The playing check was not clean enough yet.')}>
                  See where to start
                </button>
              )}
            </div>
          )}
          <div className="btns" style={{ marginTop: 12 }}>
            {!playTried && (
              <button className="btn" onClick={() => pass(true)} title="No instrument handy? Skip the playing and let the questions decide for this unit.">
                I can't play right now
              </button>
            )}
            <button className="btn" onClick={() => stop('You were not sure.')}>
              I'm not sure
            </button>
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function Lessons({ trackId, place }: { trackId?: string; place?: boolean }) {
  const p = useProfile()
  const track = TRACKS.find((t) => t.id === trackId) ?? TRACKS.find((t) => nextLesson(t.id, p) && t.id === 'guitar') ?? TRACKS[0]
  const [placing, setPlacing] = useState(!!place)
  const anyLocked = coreUnits(track).some((u) => u.lessons.some((l) => !isOpen({ track, unit: u, lesson: l }, p)))
  const next = nextLesson(track.id, p)
  return (
    <div className="stack">
      <div className="tabs" role="tablist">
        {TRACKS.map((t) => (
          <a key={t.id} role="tab" aria-selected={t.id === track.id} className={t.id === track.id ? 'on' : ''} href={`#/lessons/${t.id}`} onClick={() => setPlacing(false)}>
            {t.title}
          </a>
        ))}
      </div>
      <div className="split-head">
        <p className="muted">{track.blurb}</p>
        {!placing && (
          <span className="btns">
            {track.id !== 'theory' && (
              <a className="btn small" href={`#/skills/${track.id}`}>
                Skill map
              </a>
            )}
            <button className="btn small" onClick={() => setPlacing(true)}>
              Already play? Take the placement check
            </button>
          </span>
        )}
      </div>
      {placing && <Placement key={track.id} track={track} onClose={() => setPlacing(false)} />}
      {anyLocked && !placing && (
        <p className="muted tight" data-lock-note>
          Lessons open in order. To get to a locked one sooner, use <strong>Jump to this unit</strong>, take the placement check
          {track.id !== 'theory' ? (
            <>
              , or rate that skill on the <a href={`#/skills/${track.id}`}>skill map</a>
            </>
          ) : null}
          .
        </p>
      )}
      {coreUnits(track).map((u, ui) => {
        const done = u.lessons.filter((l) => p.lessons[l.id] === 'done').length
        const skipped = u.lessons.filter((l) => p.lessons[l.id] === 'skipped').length
        const untouched = u.lessons.every((l) => !p.lessons[l.id])
        // A unit can be jumped to while its first lesson is still closed, even if a skill rating has opened a later one.
        const locked = !isOpen({ track, unit: u, lesson: u.lessons[0] }, p)
        return (
          <section className="card unit" key={u.id}>
            <div className="unit-head">
              <div>
                <div className="eyebrow">
                  Unit {ui + 1} · {u.level}
                </div>
                <h2>{u.title}</h2>
                <p className="muted">{u.about}</p>
              </div>
              <div className="unit-side">
                <small className="muted">
                  {done}/{u.lessons.length}
                  {skipped ? ` · ${skipped} skipped` : ''}
                </small>
                {locked && untouched && (
                  <button
                    className="btn small"
                    onClick={() => {
                      const before = trackLessons(track.id)
                        .map((r) => r.lesson.id)
                      actions.skipLessons(before.slice(0, before.indexOf(u.lessons[0].id)))
                    }}
                  >
                    Jump to this unit
                  </button>
                )}
              </div>
            </div>
            <ol className="rows">
              {u.lessons.map((l) => {
                const status = p.lessons[l.id]
                const open = isOpen({ track, unit: u, lesson: l }, p)
                const isNext = next?.lesson.id === l.id
                const inner = (
                  <>
                    <span className={`tick ${status ?? (isNext || open ? 'next' : 'locked')}`} aria-hidden="true">
                      {status === 'done' ? '✓' : status === 'skipped' ? '–' : isNext ? '▶' : ''}
                    </span>
                    <span>
                      <strong>{l.title}</strong>
                      <small>{l.goal}</small>
                    </span>
                    <span className="chev">
                      {status === 'done' ? 'Done' : status === 'skipped' ? 'Skipped' : isNext ? 'Start →' : open ? 'Open →' : 'Locked'} · {l.minutes} min
                    </span>
                  </>
                )
                return (
                  <li key={l.id}>
                    {open ? (
                      <a href={`#/lesson/${l.id}`}>{inner}</a>
                    ) : (
                      <div className="locked-row" title="Finish the lessons before this one to unlock it, or use the placement check or Jump to this unit to skip ahead">
                        {inner}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
            {u.check && u.lessons.every((l) => p.lessons[l.id]) && u.lessons.some((l) => p.lessons[l.id] === 'done') && <Checkpoint unit={u} />}
          </section>
        )
      })}

      {studioUnits(track).length > 0 && (
        <div className="studio-head" data-studio>
          <h2>The studio: pick what you need</h2>
          <p className="muted">
            Beyond the step-by-step path, skills grow at different speeds. Every lesson below is <strong>open now</strong>, in any order.
            {track.id !== 'theory' && (
              <>
                {' '}
                Not sure where to start? The <a href={`#/skills/${track.id}`}>skill map</a> finds your weakest areas and points you to the right lessons.
              </>
            )}
          </p>
        </div>
      )}
      {studioUnits(track).map((u) => (
        <section className="card unit" key={u.id}>
          <div className="unit-head">
            <div>
              <div className="eyebrow">Studio · {u.level}</div>
              <h2>{u.title.replace(/^Studio: /, '').replace(/^./, (c) => c.toUpperCase())}</h2>
              <p className="muted">{u.about}</p>
            </div>
            <div className="unit-side">
              <small className="muted">
                {u.lessons.filter((l) => p.lessons[l.id] === 'done').length}/{u.lessons.length}
              </small>
            </div>
          </div>
          <ol className="rows">
            {u.lessons.map((l) => (
              <li key={l.id}>
                <a href={`#/lesson/${l.id}`}>
                  <span className={`tick ${p.lessons[l.id] ?? 'next'}`} aria-hidden="true">
                    {p.lessons[l.id] === 'done' ? '✓' : p.lessons[l.id] === 'skipped' ? '–' : ''}
                  </span>
                  <span>
                    <strong>{l.title}</strong>
                    <small>{l.goal}</small>
                  </span>
                  <span className="chev">
                    {p.lessons[l.id] === 'done' ? 'Done' : 'Open →'} · {l.minutes} min
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

// ---------- Practice ----------

function reviewIn(due: string): string {
  const days = Math.round((new Date(due + 'T12:00:00Z').getTime() - new Date(today() + 'T12:00:00Z').getTime()) / 86400000)
  return days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`
}

export function Practice({ exerciseId }: { exerciseId?: string }) {
  const p = useProfile()
  // Start on the track the player is actually working in, so one instrument's list is not padded with the others'.
  const [filter, setFilter] = useState<'all' | Track['id']>(() => {
    const active = TRACKS.filter((t) => trackLessons(t.id).some((r) => p.lessons[r.lesson.id]))
    return active.length === 1 ? active[0].id : 'all'
  })
  const [showSkipped, setShowSkipped] = useState(false)
  if (exerciseId) {
    const ref = findExercise(exerciseId)
    if (!ref) return <p>Exercise not found.</p>
    const list = unlockedExercises(p)
    const idx = list.findIndex((r) => r.ex.id === exerciseId)
    const due = dueExercises(p).filter((r) => r.ex.id !== exerciseId && r.track.id === ref.track.id)
    const nextUp = due[0] ?? (idx >= 0 ? list.slice(idx + 1).find((r) => r.track.id === ref.track.id) : undefined)
    return (
      <div className="stack">
        <a className="crumb" href="#/practice">
          ← Practice
        </a>
        <p className="muted">
          From <a href={`#/lesson/${ref.lesson.id}`}>{ref.lesson.title}</a> · {ref.track.title}
        </p>
        <section className="card">
          <Runner key={ref.ex.id} ex={ref.ex} />
        </section>
        {nextUp && (
          <a className="btn" href={`#/practice/${nextUp.ex.id}`}>
            Next: {nextUp.ex.title} →
          </a>
        )}
      </div>
    )
  }
  // Exercises from lessons skipped by the placement check stay out of the way unless asked for (or already tried).
  const inTrack = unlockedExercises(p).filter((r) => filter === 'all' || r.track.id === filter)
  const hidden = inTrack.filter((r) => p.lessons[r.lesson.id] === 'skipped' && !p.exercises[r.ex.id])
  const list = showSkipped ? inTrack : inTrack.filter((r) => !hidden.includes(r))
  const due = new Set(dueExercises(p).map((r) => r.ex.id))
  const sorted = [...list].sort((a, b) => Number(due.has(b.ex.id)) - Number(due.has(a.ex.id)))
  return (
    <div className="stack">
      <h1>Practice</h1>
      <p className="muted">
        Exercises unlock as you take lessons. Pass one and it comes back for review after a longer gap, at a higher tempo, until you reach its goal.
      </p>
      <div className="split-head">
        <div className="seg">
          {(['all', 'theory', 'guitar', 'keys'] as const).map((f) => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : TRACKS.find((t) => t.id === f)!.title}
            </button>
          ))}
        </div>
        <InputBar />
      </div>
      <section className="card">
        <ul className="rows">
          {sorted.map((r) => {
            const pr = p.exercises[r.ex.id]
            return (
              <li key={r.ex.id}>
                <a href={`#/practice/${r.ex.id}`}>
                  <span>
                    <strong>{r.ex.title}</strong>
                    <small>
                      {r.track.title} · {r.lesson.title}
                    </small>
                  </span>
                  <span className="ex-meter">
                    <Bar value={mastery(r.ex.tempo, r.ex.target, pr)} />
                    <small>
                      {pr?.bestTempo ? `${pr.bestTempo} / ${r.ex.target} bpm` : pr ? 'Not passed yet' : p.tried.includes(r.ex.id) ? 'Tried step by step' : 'New'}
                      {due.has(r.ex.id) ? <em className="due"> · due now</em> : pr?.bestTempo ? ` · review ${reviewIn(pr.due)}` : ''}
                    </small>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
        {sorted.length === 0 && <p className="muted">Nothing here yet. Start a lesson to unlock exercises.</p>}
      </section>
      <small className="muted">
        {inTrack.length} of {EXERCISES.filter((r) => filter === 'all' || r.track.id === filter).length} exercises unlocked.{' '}
        {hidden.length > 0 && (
          <button className="link" onClick={() => setShowSkipped(!showSkipped)}>
            {showSkipped ? 'Hide' : 'Show'} {hidden.length} from lessons you skipped
          </button>
        )}
      </small>
    </div>
  )
}

// ---------- Progress and settings ----------

export function Progress() {
  const state = useStore()
  const p = useProfile()
  const [name, setName] = useState('')
  const attempted = Object.values(p.exercises)
  const triedCount = new Set([...p.tried, ...Object.keys(p.exercises)]).size
  const skippedIn = (trackId: string) => trackLessons(trackId).filter((r) => p.lessons[r.lesson.id] === 'skipped').length
  const mastered = EXERCISES.filter((r) => (p.exercises[r.ex.id]?.bestTempo ?? 0) >= r.ex.target).length
  return (
    <div className="stack">
      <h1>Progress</h1>
      <section className="grid4">
        <div className="card stat">
          <strong>{streak(p.days, today())}</strong>
          <span>day streak</span>
        </div>
        <div className="card stat">
          <strong>{p.days.length}</strong>
          <span>days practised</span>
        </div>
        <div className="card stat">
          <strong>{Object.values(p.lessons).filter((s) => s === 'done').length}</strong>
          <span>lessons completed</span>
        </div>
        <div className="card stat">
          <strong>{triedCount}</strong>
          <span>exercises tried</span>
        </div>
      </section>

      <section className="card">
        <h2>Tracks</h2>
        {TRACKS.map((t) => {
          const prog = trackProgress(t.id, p)
          const studio = trackLessons(t.id).filter((r) => r.unit.free && p.lessons[r.lesson.id] === 'done').length
          return (
            <div className="track-row" key={t.id}>
              <span>{t.title}</span>
              <Bar value={prog.done / prog.total} />
              <small className="muted">
                {prog.done}/{prog.total}
                {skippedIn(t.id) ? ` (${skippedIn(t.id)} skipped)` : ''}
                {studio ? ` + ${studio} studio` : ''}
              </small>
            </div>
          )
        })}
        <p className="muted">
          The first number counts the step-by-step path; studio lessons are counted separately. {triedCount} exercise{triedCount === 1 ? '' : 's'} tried;{' '}
          {attempted.length} played in time ({attempted.reduce((n, e) => n + e.attempts, 0)} timed attempts in total); {mastered} brought up to goal tempo.
          Step-by-step runs count as tried but do not record a tempo.
        </p>
      </section>

      <section className="card">
        <h2>Settings</h2>
        <div className="setting">
          <InputBar />
        </div>
        <label className="check setting">
          <input type="checkbox" checked={p.leftHanded} onChange={(e) => actions.setLeftHanded(e.target.checked)} /> Left-handed guitar diagrams
        </label>
        <div className="setting">
          <span className="muted">Appearance:</span>
          <div className="seg">
            {(['auto', 'light', 'dark'] as const).map((t) => (
              <button key={t} className={state.theme === t ? 'on' : ''} onClick={() => actions.setTheme(t)}>
                {t === 'auto' ? 'Match device' : t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Players</h2>
        <p className="muted">Each player has separate progress, saved in this browser.</p>
        <ul className="rows">
          {Object.values(state.profiles).map((pr) => (
            <li key={pr.id}>
              <div className="locked-row">
                <span>
                  <strong>{pr.name}</strong>
                  <small>{Object.keys(pr.lessons).length} lessons</small>
                </span>
                <span className="btns">
                  {pr.id === state.current ? (
                    <em className="muted">Playing now</em>
                  ) : (
                    <>
                      <button className="btn small" onClick={() => actions.switchProfile(pr.id)}>
                        Switch
                      </button>
                      <button
                        className="btn small"
                        onClick={() => {
                          if (window.confirm(`Delete ${pr.name} and all their progress?`)) actions.deleteProfile(pr.id)
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <form
          className="add-player"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            actions.addProfile(name)
            setName('')
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New player name" aria-label="New player name" />
          <button className="btn">Add player</button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const n = window.prompt('Your name', p.name)
              if (n) actions.renameProfile(n)
            }}
          >
            Rename me
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              if (window.confirm('Erase all progress for this player? This cannot be undone.')) actions.resetProfile()
            }}
          >
            Reset my progress
          </button>
        </form>
      </section>
    </div>
  )
}

// ---------- Tabs from audio (later phase) ----------

export function Transcribe() {
  return (
    <div className="stack">
      <h1>Tabs from audio</h1>
      <section className="card">
        <div className="eyebrow">Planned · not built yet</div>
        <h2>Turn a recording into tab</h2>
        <p>
          This part of the app comes in a later phase. The plan is to let you upload an audio file or play into the microphone, detect the notes in the browser,
          and write them out as guitar tab, keyboard notes and sheet music.
        </p>
        <ul>
          <li>It will work best on single-note lines: melodies, riffs and solos from a clean recording.</li>
          <li>Full band mixes and dense chords are much harder to transcribe accurately and would need a server-side model.</li>
          <li>Pasting a streaming or video link needs a backend service to fetch the audio, which this browser-only app does not have.</li>
        </ul>
        <p className="muted">
          Until then: use the tuner and the microphone check in Practice to confirm notes you work out by ear, and Explore to find which scale or key a set of
          notes belongs to.
        </p>
      </section>
    </div>
  )
}
