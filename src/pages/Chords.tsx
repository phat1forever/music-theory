import { useMemo, useState } from 'react'
import { strum } from '../audio/audio'
import { ChordDiagram } from '../components/Diagrams'
import { actions, newId, useProfile, type Sheet } from '../store/store'
import { CHORDS, parseChord, pcName, prefersFlats } from '../theory/theory'
import { soundingMidi, transpose, TUNINGS, voicings } from '../theory/voicings'

const pretty = (n: string) => n.replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭')
const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const QUALITIES = ['maj', 'min', '7', 'm7', 'maj7', '5', 'sus4', 'sus2', '6', 'm6', 'add9', '9', 'dim', 'dim7', 'm7b5', 'aug']

const blank = (): Sheet => ({
  id: newId(),
  name: 'My chords',
  tuning: [...TUNINGS.standard.notes],
  capo: 0,
  names: 'shape',
  chords: [],
})

/** Read chord symbols out of free text such as "E7 F# Bm, A". Unknown words are returned separately. */
export function readChords(text: string): { good: string[]; bad: string[] } {
  const good: string[] = []
  const bad: string[] = []
  for (const raw of text.split(/[\s,|–-]+/).filter(Boolean)) {
    const tok = raw.replace('♯', '#').replace('♭', 'b').replace(/^([a-g])/, (c) => c.toUpperCase())
    const m = /^([A-G][#b]?)(.*)$/.exec(tok)
    const suffix = m ? m[2].replace(/^min$/, 'm').replace(/^maj$/, '').replace(/^M7$/, 'maj7').replace(/^-/, 'm') : ''
    if (m && Object.values(CHORDS).some((c) => c.suffix === suffix)) good.push(m[1] + suffix)
    else bad.push(raw)
  }
  return { good, bad }
}

export function Chords() {
  const profile = useProfile()
  const [draft, setDraft] = useState<Sheet>(blank)
  const sheet = profile.sheets.find((s) => s.id === profile.sheet) ?? profile.sheets[0] ?? draft
  const save = (patch: Partial<Sheet>) => actions.saveSheet({ ...sheet, ...patch })

  const [root, setRoot] = useState('E')
  const [quality, setQuality] = useState('7')
  const [flats, setFlats] = useState(false)
  const [typed, setTyped] = useState('')
  const [unknown, setUnknown] = useState<string[]>([])
  const [drag, setDrag] = useState<number | null>(null)

  const open = useMemo(() => sheet.tuning.map((n) => n + sheet.capo), [sheet.tuning, sheet.capo])
  const byShape = sheet.capo > 0 && sheet.names === 'shape'
  /** The chord that is actually heard for a symbol on this sheet. */
  const heard = (symbol: string) => (byShape ? transpose(symbol, sheet.capo, prefersFlats(parseChord(symbol).root)) : symbol)
  const shapesFor = (symbol: string) => voicings(open, heard(symbol), 5)

  const preset = Object.entries(TUNINGS).find(([, t]) => t.notes.every((n, i) => n === sheet.tuning[i]))?.[0] ?? 'custom'
  const symbol = root + CHORDS[quality].suffix
  const preview = shapesFor(symbol)

  const add = (symbols: string[]) => save({ chords: [...sheet.chords, ...symbols.map((s) => ({ id: newId(), symbol: s, variant: 0 }))] })
  const move = (from: number, to: number) => {
    if (to < 0 || to >= sheet.chords.length || from === to) return
    const chords = [...sheet.chords]
    const [c] = chords.splice(from, 1)
    chords.splice(to, 0, c)
    save({ chords })
  }
  const patchChord = (id: string, variant: number) => save({ chords: sheet.chords.map((c) => (c.id === id ? { ...c, variant } : c)) })

  const playAll = () =>
    sheet.chords.forEach((c, i) => {
      const shapes = shapesFor(c.symbol)
      const shape = shapes[c.variant % Math.max(1, shapes.length)]
      if (shape) window.setTimeout(() => strum('guitar', soundingMidi(open, shape), 0.03, 1.3), i * 1400)
    })

  const nutLabel = sheet.capo ? `Capo ${sheet.capo}` : 'Nut'

  return (
    <div className="stack">
      <h1>Chords</h1>
      <p className="muted">Build a chord sheet for a song: choose the chords, put them in the order you play them, and set your tuning and capo. Tap any diagram to hear it.</p>

      <section className="card controls">
        <div className="field">
          <span className="muted">Chord sheet</span>
          <div className="btns">
            {profile.sheets.length > 1 && (
              <select value={sheet.id} onChange={(e) => actions.openSheet(e.target.value)} aria-label="Open a saved sheet">
                {profile.sheets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            <input value={sheet.name} onChange={(e) => save({ name: e.target.value })} aria-label="Sheet name" placeholder="Song or sheet name" />
            <button
              className="btn small"
              data-act="new-sheet"
              onClick={() => {
                const s = { ...blank(), name: `Sheet ${profile.sheets.length + 1}`, tuning: sheet.tuning, capo: sheet.capo, names: sheet.names }
                setDraft(s)
                actions.saveSheet(s)
              }}
            >
              New sheet
            </button>
            {profile.sheets.some((s) => s.id === sheet.id) && (
              <button
                className="btn small danger"
                onClick={() => {
                  if (window.confirm(`Delete "${sheet.name}"?`)) actions.deleteSheet(sheet.id)
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Tuning and capo</h2>
        <div className="controls">
          <div className="field">
            <span className="muted">Tuning</span>
            <select
              value={preset}
              data-act="tuning"
              onChange={(e) => e.target.value !== 'custom' && save({ tuning: [...TUNINGS[e.target.value].notes] })}
              aria-label="Tuning"
            >
              {Object.entries(TUNINGS).map(([k, t]) => (
                <option key={k} value={k}>
                  {t.name}
                </option>
              ))}
              {preset === 'custom' && <option value="custom">Custom</option>}
            </select>
          </div>
          <div className="field">
            <span className="muted">Each string, low to high</span>
            <div className="strings">
              {sheet.tuning.map((n, i) => (
                <div key={i} className="string-tune">
                  <button aria-label={`Tune string ${6 - i} up`} onClick={() => save({ tuning: sheet.tuning.map((x, j) => (j === i ? Math.min(x + 1, TUNINGS.standard.notes[i] + 5) : x)) })}>
                    ▲
                  </button>
                  <strong>{pretty(pcName(n, n < TUNINGS.standard.notes[i]))}</strong>
                  <button aria-label={`Tune string ${6 - i} down`} onClick={() => save({ tuning: sheet.tuning.map((x, j) => (j === i ? Math.max(x - 1, TUNINGS.standard.notes[i] - 7) : x)) })}>
                    ▼
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="muted">Capo</span>
            <div className="seg wrap" data-act="capo">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} className={sheet.capo === n ? 'on' : ''} onClick={() => save({ capo: n })}>
                  {n === 0 ? 'None' : n}
                </button>
              ))}
            </div>
          </div>
          {sheet.capo > 0 && (
            <div className="field">
              <span className="muted">Chord names are</span>
              <div className="seg">
                <button className={sheet.names === 'shape' ? 'on' : ''} onClick={() => save({ names: 'shape' })}>
                  The shapes I play
                </button>
                <button className={sheet.names === 'sound' ? 'on' : ''} onClick={() => save({ names: 'sound' })}>
                  What it sounds like
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="muted tight">
          {sheet.capo > 0
            ? byShape
              ? `Capo on fret ${sheet.capo}: a chord named D is fingered as a D shape above the capo and sounds as ${pretty(transpose('D', sheet.capo))}. Fret numbers count from the capo.`
              : `Capo on fret ${sheet.capo}: each chord is shown as the shape that produces that exact chord. Fret numbers count from the capo.`
            : 'Chord names are the actual pitches heard in this tuning. Shapes are worked out for the tuning you set.'}
        </p>
      </section>

      <section className="card">
        <h2>Add a chord</h2>
        <div className="add-chord">
          <div className="add-pick">
            <div className="field">
              <span className="muted">Root</span>
              <div className="seg wrap">
                {(flats ? FLATS : SHARPS).map((r) => (
                  <button key={r} className={root === r ? 'on' : ''} onClick={() => setRoot(r)}>
                    {pretty(r)}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const i = (flats ? FLATS : SHARPS).indexOf(root)
                    setRoot((flats ? SHARPS : FLATS)[i])
                    setFlats(!flats)
                  }}
                  title="Switch between sharp and flat names"
                >
                  ♯/♭
                </button>
              </div>
            </div>
            <div className="field">
              <span className="muted">Type</span>
              <div className="seg wrap">
                {QUALITIES.map((q) => (
                  <button key={q} className={q === quality ? 'on' : ''} onClick={() => setQuality(q)} title={CHORDS[q].name}>
                    {q === 'maj' ? 'major' : q === 'min' ? 'minor' : CHORDS[q].suffix}
                  </button>
                ))}
              </div>
            </div>
            <form
              className="type-chords"
              onSubmit={(e) => {
                e.preventDefault()
                const { good, bad } = readChords(typed)
                if (good.length) add(good)
                setUnknown(bad)
                setTyped(bad.join(' '))
              }}
            >
              <span className="muted">Or type several at once</span>
              <div className="btns">
                <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="E7 F# B A" aria-label="Type chord names" data-act="type" />
                <button className="btn">Add all</button>
              </div>
              {unknown.length > 0 && <small className="warn">Not recognised: {unknown.join(', ')}</small>}
            </form>
          </div>
          <div className="add-preview">
            {preview[0] ? (
              <ChordDiagram name={pretty(symbol)} shape={preview[0]} sound={soundingMidi(open, preview[0])} nut={nutLabel} mirror={profile.leftHanded} />
            ) : (
              <p className="muted">No comfortable shape found for {pretty(symbol)} in this tuning.</p>
            )}
            <button className="btn primary" data-act="add" onClick={() => add([symbol])}>
              Add {pretty(symbol)}
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="split-head">
          <div>
            <h2>{sheet.name || 'Chord sheet'}</h2>
            <p className="muted tight">
              {preset === 'custom' ? `Custom tuning (${sheet.tuning.map((n) => pretty(pcName(n))).join(' ')})` : TUNINGS[preset].name}
              {sheet.capo ? ` · capo ${sheet.capo}` : ''} · {sheet.chords.length} chord{sheet.chords.length === 1 ? '' : 's'}
            </p>
          </div>
          {sheet.chords.length > 1 && (
            <button className="btn" onClick={playAll}>
              ▶ Play in order
            </button>
          )}
        </div>
        {sheet.chords.length === 0 ? (
          <p className="muted">No chords yet. Add them above in the order the song uses them. You can rearrange them afterwards.</p>
        ) : (
          <ol className="sheet">
            {sheet.chords.map((c, i) => {
              const shapes = shapesFor(c.symbol)
              const v = shapes.length ? c.variant % shapes.length : 0
              const shape = shapes[v]
              return (
                <li
                  key={c.id}
                  draggable
                  className={drag === i ? 'dragging' : ''}
                  onDragStart={() => setDrag(i)}
                  onDragEnd={() => setDrag(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (drag !== null) move(drag, i)
                    setDrag(null)
                  }}
                >
                  <span className="sheet-num">{i + 1}</span>
                  {shape ? (
                    <ChordDiagram name={pretty(c.symbol)} shape={shape} sound={soundingMidi(open, shape)} nut={nutLabel} mirror={profile.leftHanded} />
                  ) : (
                    <div className="no-shape">
                      <strong>{pretty(c.symbol)}</strong>
                      <small className="muted">No shape found in this tuning</small>
                    </div>
                  )}
                  {byShape && <small className="muted">sounds as {pretty(heard(c.symbol))}</small>}
                  <div className="sheet-tools">
                    <button aria-label={`Move ${c.symbol} earlier`} title="Move earlier" disabled={i === 0} onClick={() => move(i, i - 1)}>
                      ◀
                    </button>
                    <button aria-label={`Move ${c.symbol} later`} title="Move later" disabled={i === sheet.chords.length - 1} onClick={() => move(i, i + 1)}>
                      ▶
                    </button>
                    <button title="Show another way to play this chord" disabled={shapes.length < 2} onClick={() => patchChord(c.id, v + 1)}>
                      Shape {shapes.length ? v + 1 : 0}/{shapes.length}
                    </button>
                    <button aria-label={`Remove ${c.symbol}`} title="Remove" onClick={() => save({ chords: sheet.chords.filter((x) => x.id !== c.id) })}>
                      ✕
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
        {sheet.chords.length > 1 && <small className="muted">Reorder with the arrows, or drag a chord onto the position you want.</small>}
      </section>
    </div>
  )
}
