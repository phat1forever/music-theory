import { useEffect, useMemo, useRef, useState } from 'react'
import { drum, play, startTicker, type Ticker } from '../audio/audio'
import { Fretboard, type Mark } from '../components/Fretboard'
import { Keyboard, type KeyMark } from '../components/Keyboard'
import { actions, useProfile } from '../store/store'
import { CHORDS, fretMidi, mod, nameIn, pc, pcName, pentatonicBox, positions, prefersFlats, ROOTS, SCALES } from '../theory/theory'

const pretty = (n: string) => n.replace(/#/g, '♯').replace(/b/g, '♭')

interface Style {
  name: string
  about: string
  /** one chord per bar: semitones above the key root + chord quality */
  bars: { step: number; q: string; roman: string }[]
  scales: string[]
  minor: boolean
}

const c = (step: number, q: string, roman: string) => ({ step, q, roman })

const STYLES: Record<string, Style> = {
  blues: {
    name: '12-bar blues',
    about: 'The classic form. Land on the root of each chord as it arrives.',
    bars: [c(0, '7', 'I7'), c(0, '7', 'I7'), c(0, '7', 'I7'), c(0, '7', 'I7'), c(5, '7', 'IV7'), c(5, '7', 'IV7'), c(0, '7', 'I7'), c(0, '7', 'I7'), c(7, '7', 'V7'), c(5, '7', 'IV7'), c(0, '7', 'I7'), c(7, '7', 'V7')],
    scales: ['minorPent', 'blues', 'mixolydian'],
    minor: true,
  },
  rock: {
    name: 'Minor rock',
    about: 'i – ♭VII – ♭VI – ♭VII. Big, moody and very forgiving.',
    bars: [c(0, 'min', 'i'), c(10, 'maj', '♭VII'), c(8, 'maj', '♭VI'), c(10, 'maj', '♭VII')],
    scales: ['minorPent', 'minor', 'blues'],
    minor: true,
  },
  pop: {
    name: 'Pop four-chord',
    about: 'I – V – vi – IV. Use the major pentatonic for a sweet, singing sound.',
    bars: [c(0, 'maj', 'I'), c(7, 'maj', 'V'), c(9, 'min', 'vi'), c(5, 'maj', 'IV')],
    scales: ['majorPent', 'major'],
    minor: false,
  },
  dorian: {
    name: 'Dorian groove',
    about: 'i7 – IV. Two chords; listen for the bright 6th of the Dorian mode.',
    bars: [c(0, 'm7', 'i7'), c(0, 'm7', 'i7'), c(5, 'maj', 'IV'), c(5, 'maj', 'IV')],
    scales: ['minorPent', 'dorian'],
    minor: true,
  },
}

export function Jam() {
  const profile = useProfile()
  const [root, setRoot] = useState('A')
  const [styleKey, setStyleKey] = useState('blues')
  const [scaleKey, setScaleKey] = useState('minorPent')
  const [tempo, setTempo] = useState(84)
  const [box, setBox] = useState(0)
  const [bar, setBar] = useState<number | null>(null)
  const [beat, setBeat] = useState(0)
  const ticker = useRef<Ticker | null>(null)
  const style = STYLES[styleKey]
  const flats = prefersFlats(root, style.minor ? 'minor' : 'major')

  useEffect(() => () => ticker.current?.stop(), [])

  function stop() {
    ticker.current?.stop()
    ticker.current = null
    setBar(null)
  }

  // Restart cleanly whenever the backing changes.
  useEffect(() => {
    if (ticker.current) stop()
    if (!STYLES[styleKey].scales.includes(scaleKey)) setScaleKey(STYLES[styleKey].scales[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, styleKey, tempo])

  async function start() {
    const rootPc = pc(root)
    const spb = 60 / tempo
    const shuffle = styleKey === 'blues'
    ticker.current = await startTicker(
      tempo,
      (i, t) => {
        const inBar = i % 8
        const chord = style.bars[Math.floor(i / 8) % style.bars.length]
        const chordRoot = rootPc + chord.step
        const tones = CHORDS[chord.q].steps
        // Swing the off-beat eighths for the blues.
        const when = shuffle && inBar % 2 === 1 ? t + spb * 0.16 : t
        if (inBar === 0 || inBar === 4) drum('kick', when)
        drum('hat', when)
        if (inBar === 0) play('pad', tones.map((s) => 48 + mod(chordRoot, 12) + s), spb * 3.6, when)
        if (inBar === 0 || inBar === 3 || inBar === 4) play('bass', [36 + mod(chordRoot, 12)], spb * 0.9, when)
        if (inBar === 6) play('bass', [36 + mod(chordRoot, 12) + 7], spb * 0.9, when)
      },
      (i) => {
        if (i % 2 === 0) {
          setBar(Math.floor(i / 8) % style.bars.length)
          setBeat((i % 8) / 2)
        }
      },
    )
  }

  const scale = SCALES[scaleKey]
  const current = bar === null ? null : style.bars[bar]
  const chordPcs = current ? CHORDS[current.q].steps.map((s) => mod(pc(root) + current.step + s, 12)) : []
  const chordRootPc = current ? mod(pc(root) + current.step, 12) : -1
  const scalePcs = scale.steps.map((s) => mod(pc(root) + s, 12))
  const canBox = ['minorPent', 'majorPent', 'blues'].includes(scaleKey)

  const kindOf = (m: number): Mark['kind'] => {
    const p = mod(m, 12)
    if (current) return p === chordRootPc ? 'root' : chordPcs.includes(p) ? 'chord' : 'ghost'
    return p === pc(root) ? 'root' : 'tone'
  }

  const fretMarks: Mark[] = useMemo(() => {
    const pos = canBox && box > 0 ? pentatonicBox(root, box, scaleKey as 'minorPent' | 'majorPent' | 'blues') : positions(scalePcs, 0, 15)
    return pos.map((p) => {
      const m = fretMidi(p.string, p.fret)
      return { ...p, label: pretty(nameIn(m, root, scale, scaleKey)), kind: kindOf(m) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, scaleKey, box, bar, styleKey])

  const keyMarks: KeyMark[] = []
  for (let m = 55; m <= 84; m++)
    if (scalePcs.includes(mod(m, 12))) {
      const k = kindOf(m)
      keyMarks.push({ midi: m, label: pretty(nameIn(m, root, scale, scaleKey)), kind: k === 'ghost' ? 'tone' : (k as KeyMark['kind']) })
    }

  const chordName = (b: Style['bars'][number]) => pretty(pcName(pc(root) + b.step, flats)) + CHORDS[b.q].suffix

  if (!profile.jamUnlocked && !profile.lessons['g-pent1'])
    return (
      <div className="stack">
        <h1>Jam</h1>
        <section className="card">
          <div className="eyebrow">Unlocks with the pentatonic lessons</div>
          <h2>Improvise over a backing track</h2>
          <p>
            Jam mode loops a chord progression while the fretboard and keyboard show the scale to use and light up the notes of the chord being played. It opens
            when you finish <a href="#/lesson/g-pent1">Minor pentatonic: box 1</a> in the guitar track.
          </p>
          <div className="btns">
            <a className="btn primary" href="#/lessons/guitar">
              Go to guitar lessons
            </a>
            <button className="btn" data-act="unlock" onClick={() => actions.unlockJam()}>
              I already know a scale: open it now
            </button>
          </div>
        </section>
      </div>
    )

  return (
    <div className="stack">
      <h1>Jam</h1>
      <section className="card controls">
        <div className="field">
          <span className="muted">Key</span>
          <div className="seg wrap">
            {ROOTS.map((r) => (
              <button key={r} className={r === root ? 'on' : ''} onClick={() => setRoot(r)}>
                {pretty(r)}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="muted">Style</span>
          <div className="seg wrap">
            {Object.entries(STYLES).map(([k, s]) => (
              <button key={k} className={k === styleKey ? 'on' : ''} onClick={() => setStyleKey(k)}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="muted">Scale</span>
          <div className="seg wrap">
            {style.scales.map((k) => (
              <button
                key={k}
                className={k === scaleKey ? 'on' : ''}
                onClick={() => {
                  setScaleKey(k)
                  setBox(0)
                }}
              >
                {SCALES[k].name}
              </button>
            ))}
          </div>
        </div>
        <label className="tempo">
          <span>
            Tempo <strong>{tempo}</strong> bpm
          </span>
          <input type="range" min={50} max={150} step={2} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
        </label>
      </section>

      <section className="card">
        <div className="split-head">
          <div>
            <h2>
              {style.name} in {pretty(root)}
            </h2>
            <p className="muted">{style.about}</p>
          </div>
          <button className="btn primary big" data-act="jam" onClick={() => (bar === null ? start() : stop())}>
            {bar === null ? '▶ Start backing track' : '■ Stop'}
          </button>
        </div>
        <div className="chart" style={{ gridTemplateColumns: `repeat(4, 1fr)` }}>
          {style.bars.map((b, i) => (
            <div key={i} className={`chart-bar${bar === i ? ' on' : ''}`}>
              <strong>{chordName(b)}</strong>
              <small>{b.roman}</small>
              {bar === i && (
                <span className="beats" aria-hidden="true">
                  {[0, 1, 2, 3].map((n) => (
                    <i key={n} className={n === beat ? 'on' : ''} />
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>

        <h3>
          {pretty(root)} {scale.name.toLowerCase()} on guitar
        </h3>
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
        <p className="legend">
          {current ? (
            <>
              <span className="lg root" /> root of {chordName(current)} <span className="lg chord" /> other notes of the chord <span className="lg ghost" /> rest of the
              scale
            </>
          ) : (
            <>
              <span className="lg root" /> key root <span className="lg tone" /> scale notes. Start the track and the chord notes light up bar by bar.
            </>
          )}
        </p>
        <h3>On keyboard</h3>
        <div className="scroll-x">
          <Keyboard marks={keyMarks} from={55} to={84} onPick={(m) => play('keys', [m])} />
        </div>
      </section>

      <section className="card">
        <h2>Ideas to try</h2>
        <ul>
          <li>Play only three notes for a whole chorus. Change the rhythm, not the notes.</li>
          <li>Play a phrase, then stay silent for the same length of time.</li>
          <li>Each time the chord changes, land on an orange or teal dot on beat 1.</li>
          <li>Stay in one box for a chorus, then move to the next box for the following one.</li>
        </ul>
      </section>
    </div>
  )
}
