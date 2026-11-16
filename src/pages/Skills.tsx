import { useState } from 'react'
import { TRACKS, isOpen } from '../curriculum'
import { focusSkills, RATINGS, skillStates, type Instrument, type SkillState } from '../curriculum/skills'
import { actions, useProfile } from '../store/store'

const NAMES: Record<Instrument, string> = { guitar: 'Guitar', keys: 'Keyboard' }

function Meter({ value }: { value: number }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}

function SkillRow({ instrument, state }: { instrument: Instrument; state: SkillState }) {
  const p = useProfile()
  const [open, setOpen] = useState(false)
  const key = `${instrument}:${state.info.id}`
  return (
    <section className="card skill" data-skill={state.info.id}>
      <div className="skill-head">
        <div>
          <h3>{state.info.name}</h3>
          <p className="muted tight">
            <strong>Comfortable means:</strong> {state.info.benchmark}
          </p>
        </div>
        <div className="skill-meter">
          <Meter value={state.level} />
          <small className="muted">
            {state.done} of {state.lessons.length} lessons done
          </small>
        </div>
      </div>
      <div className="skill-rate">
        <span className="muted">Where are you now?</span>
        <div className="seg wrap" role="group" aria-label={`Rate ${state.info.name}`}>
          {RATINGS.map((label, n) => (
            <button key={n} className={state.self === n ? 'on' : ''} onClick={() => actions.setSkillSelf(key, state.self === n ? null : n)}>
              {label}
            </button>
          ))}
        </div>
        {state.self !== null && state.self >= 2 && state.info.id !== 'ear' && state.info.id !== 'theory' && (
          <small className="muted">All lessons for this skill are open to you.</small>
        )}
        {state.self !== null && state.self < 2 && state.info.id !== 'ear' && state.info.id !== 'theory' && <small className="muted">Its next lesson is open to you.</small>}
        <button className="link" onClick={() => setOpen(!open)}>
          {open ? 'Hide lessons' : `Show its ${state.lessons.length} lessons`}
        </button>
      </div>
      {open && (
        <ol className="rows">
          {state.lessons.map((r) => {
            const status = p.lessons[r.lesson.id]
            const reachable = isOpen(r, p)
            const inner = (
              <>
                <span className={`tick ${status ?? (reachable ? 'next' : 'locked')}`} aria-hidden="true">
                  {status === 'done' ? '✓' : status === 'skipped' ? '–' : ''}
                </span>
                <span>
                  <strong>{r.lesson.title}</strong>
                  <small>
                    {r.unit.level}
                    {r.track.id === 'theory' ? ' · theory track' : ''} · {r.lesson.goal}
                  </small>
                </span>
                <span className="chev">{status === 'done' ? 'Done' : status === 'skipped' ? 'Skipped' : reachable ? 'Open →' : 'Locked'}</span>
              </>
            )
            return (
              <li key={r.lesson.id}>
                {reachable ? (
                  <a href={`#/lesson/${r.lesson.id}`}>{inner}</a>
                ) : (
                  <div className="locked-row" title="Opens after the lesson before it in this skill, or when you rate the skill Comfortable">
                    {inner}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

/** The skill map: rate each area, see the evidence, and get pointed at the weakest ones. */
export function Skills({ instrument: wanted }: { instrument?: string }) {
  const p = useProfile()
  const started = (t: Instrument) => TRACKS.find((x) => x.id === t)!.units.some((u) => u.lessons.some((l) => p.lessons[l.id]))
  const instrument: Instrument = wanted === 'keys' || wanted === 'guitar' ? wanted : started('keys') && !started('guitar') ? 'keys' : 'guitar'
  const states = skillStates(instrument, p)
  const focus = focusSkills(instrument, p)
  const rated = states.filter((s) => s.self !== null).length

  return (
    <div className="stack">
      <h1>Skill map</h1>
      <p className="muted">
        Nobody develops evenly: a strong soloist can be a shaky rhythm player, and a good reader can have an untrained ear. Rate each area honestly against its yardstick.
        The bar combines your rating with what you have actually done in the app, and the map points you at the areas that will help most.
      </p>
      <div className="tabs" role="tablist">
        {(['guitar', 'keys'] as const).map((t) => (
          <a key={t} role="tab" aria-selected={t === instrument} className={t === instrument ? 'on' : ''} href={`#/skills/${t}`}>
            {NAMES[t]}
          </a>
        ))}
      </div>

      <section className="card focus" data-focus>
        <div className="eyebrow">Your focus</div>
        {focus.length === 0 ? (
          <p>You have done every lesson for {NAMES[instrument].toLowerCase()}. Keep your skills alive with Practice, Jam and Ear training.</p>
        ) : (
          <>
            <p className="muted tight">
              {rated === 0
                ? 'Rate a few skills below to tailor this. Until then it follows the lessons you have done.'
                : 'The least developed areas, with the next lessons for each. Give your weakest area a third of each practice session.'}
            </p>
            <div className="grid2">
              {focus.map((f) => (
                <div key={f.state.info.id} className="focus-skill">
                  <h3>{f.state.info.name}</h3>
                  <ul className="rows">
                    {f.lessons.map((r) => (
                      <li key={r.lesson.id}>
                        <a href={`#/lesson/${r.lesson.id}`}>
                          <span>
                            <strong>{r.lesson.title}</strong>
                            <small>
                              {r.unit.free ? 'Studio' : r.unit.title} · {r.unit.level}
                              {p.lessons[r.lesson.id] === 'skipped' ? ' · skipped earlier' : ''}
                            </small>
                          </span>
                          <span className="chev">{isOpen(r, p) ? 'Open →' : f.lessons[0] === r && f.state.self === null ? 'Rate this skill to open' : 'Opens after the one before'}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {states.map((s) => (
        <SkillRow key={`${instrument}-${s.info.id}`} instrument={instrument} state={s} />
      ))}

      <p className="muted">
        Rating a skill opens its next lesson, wherever you are on the step-by-step path, and <strong>Comfortable</strong> or <strong>Strong</strong> opens all of its
        lessons: being behind in one area never holds you back in another. Tap a rating again to clear it. Ear results come from <a href="#/ear">Ear training</a>.
      </p>
    </div>
  )
}
