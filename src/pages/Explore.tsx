import { useMemo, useState } from 'react'
import { play, strum } from '../audio/audio'
import { ChordDiagram, CircleOfFifths } from '../components/Diagrams'
import { Fretboard, type Mark } from '../components/Fretboard'
import { Tuner } from '../components/InputBar'
import { Keyboard, type KeyMark } from '../components/Keyboard'
import { Score } from '../components/Score'
import { useProfile } from '../store/store'
import type { Ev, Piece } from '../theory/music'
import {
  CHORD_SHAPES,
  CHORDS,
  diatonicChords,
  fretMidi,
  INTERVALS,
  midiToFret,
  mod,
  pc,
  pcs,
  pentatonicBox,
  positions,
  prefersFlats,
  ROOTS,
  SCALES,
  spell,
  type Formula,
} from '../theory/theory'
import { PlayButton } from './LessonView'

const pretty = (n: string) => n.replace(/#/g, '♯').replace(/b/g, '♭')
const PENT = ['minorPent', 'majorPent', 'blues']

/** One octave of a formula as a guitar piece (notation + tab), kept in a single hand position. */
function asPiece(root: string, formula: Formula): Piece {
  const base = 40 + mod(pc(root) - 4, 12)
  // Root on the low E string, or on the A string when that would be above fret 7.
  const rootFret = base - 40 > 7 ? base - 45 : base - 40
  const lo = Math.max(0, rootFret - 1)
  const notes = [...formula.steps, 12]
  const rh: Ev[] = notes.map((s) => {
    const m = base + s
    const pos = midiToFret(m, lo, lo + 4)!
    return { midi: [m], dur: 'q', tab: [pos] }
  })
  while (rh.length % 4) rh.push({ midi: [], dur: 'q' })
  return { instrument: 'guitar', rh }
}

export function Explore({ init = [] }: { init?: string[] }) {
  const profile = useProfile()
  // A link such as #/explore/G/majorPent opens on that scale.
  const [root, setRoot] = useState(() => (init[0] && /^[A-G][#b]?$/.test(init[0]) ? ROOTS[ROOTS.map(pc).indexOf(pc(init[0]))] : 'A'))
  const [kind, setKind] = useState<'scale' | 'chord'>('scale')
  const [scale, setScale] = useState(() => (init[1] && SCALES[init[1]] ? init[1] : 'minorPent'))
  const [chord, setChord] = useState('maj')
  const [labels, setLabels] = useState<'names' | 'degrees'>('names')
  const [box, setBox] = useState(0)
  const [cursor, setCursor] = useState<number | null>(null)

  const formula = kind === 'scale' ? SCALES[scale] : CHORDS[chord]
  const names = spell(root, formula)
  const set = pcs(root, formula)
  const flats = prefersFlats(root, kind === 'scale' ? scale : chord === 'min' ? 'minor' : 'major')
  const label = (p: number) => {
    const i = set.indexOf(mod(p, 12))
    return labels === 'names' ? pretty(names[i]) : formula.labels[i].replace('b', '♭').replace('#', '♯')
  }
  const kindOf = (p: number): Mark['kind'] =>
    mod(p, 12) === pc(root) ? 'root' : kind === 'scale' && scale === 'blues' && mod(p - pc(root), 12) === 6 ? 'blue' : 'tone'

  const canBox = kind === 'scale' && PENT.includes(scale)
  const fretMarks: Mark[] = useMemo(() => {
    const pos = canBox && box > 0 ? pentatonicBox(root, box, scale as 'minorPent' | 'majorPent' | 'blues') : positions(set, 0, 15)
    return pos.map((p) => {
      const m = fretMidi(p.string, p.fret)
      return { ...p, label: label(m), kind: kindOf(m) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, kind, scale, chord, labels, box])

  const keyMarks: KeyMark[] = []
  for (let m = 48; m <= 84; m++) if (set.includes(mod(m, 12))) keyMarks.push({ midi: m, label: label(m), kind: kindOf(m) as KeyMark['kind'] })

  const piece = useMemo(() => asPiece(root, formula), [root, formula])
  const chords = kind === 'scale' && (scale === 'major' || scale === 'minor') ? diatonicChords(root, scale) : null
  const symbol = root + (kind === 'chord' ? CHORDS[chord].suffix : '')
  const shape = kind === 'chord' ? CHORD_SHAPES[symbol] : undefined

  const hear = () => {
    const base = 48 + pc(root)
    if (kind === 'chord') strum('keys', formula.steps.map((s) => base + s), 0.03, 1.6)
    else strum('keys', [...formula.steps, 12].map((s) => base + s), 0.28, 0.5)
  }

  return (
    <div className="stack">
      <h1>Explore</h1>
      <section className="card controls">
        <div className="field">
          <span className="muted">Root</span>
          <div className="seg wrap">
            {ROOTS.map((r) => (
              <button key={r} className={r === root ? 'on' : ''} onClick={() => setRoot(r)}>
                {pretty(r)}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="muted">Show</span>
          <div className="seg">
            <button className={kind === 'scale' ? 'on' : ''} onClick={() => setKind('scale')}>
              Scale
            </button>
            <button className={kind === 'chord' ? 'on' : ''} onClick={() => setKind('chord')}>
              Chord
            </button>
          </div>
          <select
            value={kind === 'scale' ? scale : chord}
            onChange={(e) => {
              if (kind === 'scale') setScale(e.target.value)
              else setChord(e.target.value)
              setBox(0)
            }}
            aria-label={kind === 'scale' ? 'Scale type' : 'Chord type'}
          >
            {Object.entries(kind === 'scale' ? SCALES : CHORDS).map(([k, f]) => (
              <option key={k} value={k}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="muted">Labels</span>
          <div className="seg">
            <button className={labels === 'names' ? 'on' : ''} onClick={() => setLabels('names')}>
              Note names
            </button>
            <button className={labels === 'degrees' ? 'on' : ''} onClick={() => setLabels('degrees')}>
              Degrees
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="split-head">
          <div>
            <h2>
              {pretty(root)} {formula.name.toLowerCase()}
            </h2>
            {formula.about && <p className="muted">{formula.about}</p>}
          </div>
          <button className="btn" onClick={hear}>
            ▶ Hear it
          </button>
        </div>
        <div className="spelled">
          {names.map((n, i) => (
            <span key={i} className={i === 0 ? 'root' : ''}>
              <strong>{pretty(n)}</strong>
              <small>{formula.labels[i].replace('b', '♭').replace('#', '♯')}</small>
            </span>
          ))}
        </div>

        <h3>Guitar</h3>
        {canBox && (
          <div className="seg wrap">
            {['Whole neck', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5'].map((n, i) => (
              <button key={i} className={box === i ? 'on' : ''} onClick={() => setBox(i)}>
                {n}
              </button>
            ))}
          </div>
        )}
        <div className="scroll-x">
          <Fretboard marks={fretMarks} from={0} to={15} leftHanded={profile.leftHanded} onPick={(m) => play('guitar', [m])} />
        </div>
        {shape && (
          <div className="chord-row">
            <ChordDiagram name={symbol} shape={shape} />
          </div>
        )}

        <h3>Keyboard</h3>
        <div className="scroll-x">
          <Keyboard marks={keyMarks} from={48} to={84} onPick={(m) => play('keys', [m])} />
        </div>

        <h3>Notation and tab</h3>
        <div className="paper">
          <Score piece={piece} cursor={cursor} flats={flats} />
        </div>
        <PlayButton piece={piece} tempo={90} onBeat={setCursor} />
      </section>

      {chords && (
        <section className="card">
          <h2>
            Chords in {pretty(root)} {scale}
          </h2>
          <p className="muted">Tap a chord to hear it. Capitals are major, lower case minor, ° diminished.</p>
          <div className="diatonic">
            {chords.map((c) => (
              <button
                key={c.roman}
                onClick={() => strum('keys', c.notes.map((n) => 48 + pc(c.root) + mod(pc(n) - pc(c.root), 12)), 0.03, 1.4)}
              >
                <small>{c.roman}</small>
                <strong>{pretty(c.name)}</strong>
                <span>{c.notes.map(pretty).join(' ')}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid2">
        <section className="card">
          <h2>Circle of fifths</h2>
          <p className="muted">Tap a key to load its major scale above.</p>
          <CircleOfFifths
            selected={kind === 'scale' && scale === 'major' ? root : undefined}
            onSelect={(k) => {
              setRoot(k)
              setKind('scale')
              setScale('major')
              setBox(0)
            }}
          />
        </section>
        <section className="card">
          <h2>Interval trainer</h2>
          <IntervalTrainer />
          <h2 style={{ marginTop: 28 }}>Tuner</h2>
          <Tuner />
        </section>
      </div>
    </div>
  )
}

const EASY = [3, 4, 5, 7, 12]

function IntervalTrainer() {
  const [all, setAll] = useState(false)
  const [q, setQ] = useState<{ low: number; semis: number } | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const pool = all ? INTERVALS.filter((i) => i.semis > 0).map((i) => i.semis) : EASY

  const sound = (low: number, semis: number) => {
    play('keys', [low], 0.7)
    window.setTimeout(() => play('keys', [low + semis], 0.9), 650)
  }
  const ask = () => {
    const next = { low: 55 + Math.floor(Math.random() * 10), semis: pool[Math.floor(Math.random() * pool.length)] }
    setQ(next)
    setPicked(null)
    sound(next.low, next.semis)
  }

  return (
    <div className="trainer">
      <p className="muted">Two notes play, low then high. Name the distance between them.</p>
      <div className="btns">
        <button className="btn primary" onClick={ask}>
          {q ? 'Next interval' : 'Start'}
        </button>
        {q && (
          <button className="btn" onClick={() => sound(q.low, q.semis)}>
            Hear again
          </button>
        )}
        <label className="check">
          <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> All 12 intervals
        </label>
      </div>
      {q && (
        <div className="quiz-opts two">
          {INTERVALS.filter((i) => pool.includes(i.semis)).map((i) => (
            <button
              key={i.semis}
              disabled={picked !== null}
              className={picked === null ? '' : i.semis === q.semis ? 'right' : i.semis === picked ? 'wrong' : ''}
              onClick={() => {
                setPicked(i.semis)
                setScore((s) => ({ right: s.right + (i.semis === q.semis ? 1 : 0), total: s.total + 1 }))
              }}
            >
              {i.name}
            </button>
          ))}
        </div>
      )}
      {score.total > 0 && (
        <p className="muted">
          Score: {score.right} of {score.total}
        </p>
      )}
    </div>
  )
}
