import { useState } from 'react'
import { InputBar } from '../components/InputBar'
import {
  EXERCISES,
  findExercise,
  isOpen,
  nextLesson,
  TRACKS,
  trackLessons,
  trackProgress,
  unlockedExercises,
} from '../curriculum'
import type { Track } from '../curriculum/types'
import { mastery, streak } from '../practice/grading'
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

export function Home() {
  const p = useProfile()
  const due = dueExercises(p)
  const days = streak(p.days, today())
  const started = Object.keys(p.lessons).length > 0
  return (
    <div className="stack">
      <header className="hero">
        <div>
          <h1>{started ? `Welcome back, ${p.name}` : 'Learn theory, guitar and keyboard'}</h1>
          <p>
            {started
              ? 'Today’s session: review what is due, then take the next lesson.'
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
            <a className="btn" href="#/lessons/guitar">
              I already play: find my level
            </a>
          </div>
          <p className="muted tight">
            Each track starts from zero. If you already play, open a track and use the placement check to skip what you know. The theory track explains the "why" and
            can be taken alongside either instrument.
          </p>
        </section>
      )}

      {due.length > 0 && (
        <section className="card">
          <div className="eyebrow">Warm-up · due for review</div>
          <ul className="rows">
            {due.slice(0, 4).map((r) => (
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
          {due.length > 4 && (
            <a className="link" href="#/practice">
              {due.length - 4} more due
            </a>
          )}
        </section>
      )}

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
              <Bar value={prog.done / prog.total} />
              <small className="muted">
                {prog.done} of {prog.total} lessons
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

function Placement({ track, onClose }: { track: Track; onClose: () => void }) {
  const [i, setI] = useState(0)
  const [stopped, setStopped] = useState(false)
  const [answered, setAnswered] = useState(false)
  const unit = track.units[i]
  const finish = (count: number) => {
    // Never skip the final unit: even a perfect score starts you there.
    count = Math.min(count, track.units.length - 1)
    actions.skipLessons(track.units.slice(0, count).flatMap((u) => u.lessons.map((l) => l.id)))
    if (track.id === 'guitar' && count >= 4) actions.unlockJam()
  }
  const last = track.units.length - 1
  if (stopped || i >= track.units.length) {
    const startAt = track.units[Math.min(i, last)]
    return (
      <div className="card">
        <div className="eyebrow">Placement result</div>
        <h3>{i === 0 ? `Start at the beginning: ${startAt.title}` : `Start at: ${startAt.title}`}</h3>
        <p className="muted">
          {i === 0
            ? 'Nothing was skipped.'
            : `${Math.min(i, last)} earlier unit${Math.min(i, last) > 1 ? 's' : ''} marked as known. Those lessons stay open, so you can go back to any of them.`}
          {i > last ? ' You answered everything correctly, so you start at the final unit; skim it, or use it as a check.' : ''} A few questions cannot measure
          everything: if a skipped unit holds something new, just open it.
        </p>
        <button className="btn primary" onClick={onClose}>
          Done
        </button>
      </div>
    )
  }
  return (
    <div className="card">
      <div className="eyebrow">
        Placement check · question {i + 1} of {track.units.length}
      </div>
      <h3>{unit.title}</h3>
      <QuizStep
        key={i}
        quiz={unit.placement}
        onAnswered={(right) => {
          setAnswered(true)
          if (!right) {
            finish(i)
            setStopped(true)
          }
        }}
      />
      <div className="btns">
        {answered && !stopped && (
          <button
            className="btn primary"
            onClick={() => {
              finish(i + 1)
              setI(i + 1)
              setAnswered(false)
            }}
          >
            {i + 1 < track.units.length ? 'Next question' : 'See result'}
          </button>
        )}
        {!answered && (
          <button
            className="btn"
            onClick={() => {
              finish(i)
              setStopped(true)
            }}
          >
            I'm not sure
          </button>
        )}
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export function Lessons({ trackId }: { trackId?: string }) {
  const p = useProfile()
  const track = TRACKS.find((t) => t.id === trackId) ?? TRACKS.find((t) => nextLesson(t.id, p) && t.id === 'guitar') ?? TRACKS[0]
  const [placing, setPlacing] = useState(false)
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
          <button className="btn small" onClick={() => setPlacing(true)}>
            Already play? Take the placement check
          </button>
        )}
      </div>
      {placing && <Placement key={track.id} track={track} onClose={() => setPlacing(false)} />}
      {track.units.map((u, ui) => {
        const done = u.lessons.filter((l) => p.lessons[l.id]).length
        const untouched = u.lessons.every((l) => !p.lessons[l.id])
        const locked = !u.lessons.some((l) => isOpen({ track, unit: u, lesson: l }, p))
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
                    <span className={`tick ${status ?? (isNext ? 'next' : 'locked')}`} aria-hidden="true">
                      {status === 'done' ? '✓' : status === 'skipped' ? '–' : isNext ? '▶' : ''}
                    </span>
                    <span>
                      <strong>{l.title}</strong>
                      <small>{l.goal}</small>
                    </span>
                    <span className="chev">
                      {status === 'done' ? 'Done' : status === 'skipped' ? 'Skipped' : isNext ? 'Start →' : 'Locked'} · {l.minutes} min
                    </span>
                  </>
                )
                return <li key={l.id}>{open ? <a href={`#/lesson/${l.id}`}>{inner}</a> : <div className="locked-row">{inner}</div>}</li>
              })}
            </ol>
          </section>
        )
      })}
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
  const [filter, setFilter] = useState<'all' | Track['id']>('all')
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
                      {pr?.bestTempo ? `${pr.bestTempo} / ${r.ex.target} bpm` : pr ? 'Not passed yet' : 'New'}
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
          <strong>
            {mastered}/{EXERCISES.length}
          </strong>
          <span>exercises at goal tempo</span>
        </div>
      </section>

      <section className="card">
        <h2>Tracks</h2>
        {TRACKS.map((t) => {
          const prog = trackProgress(t.id, p)
          return (
            <div className="track-row" key={t.id}>
              <span>{t.title}</span>
              <Bar value={prog.done / prog.total} />
              <small className="muted">
                {prog.done}/{prog.total}
              </small>
            </div>
          )
        })}
        <p className="muted">
          {attempted.length} exercises attempted, {attempted.reduce((n, e) => n + e.attempts, 0)} attempts in total.
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
