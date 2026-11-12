import { useEffect, useState } from 'react'
import { ensureAudio } from '../audio/audio'
import { micRunning, midiSupported, onPitch, startMic, startMidi, stopMic } from '../input/input'
import { actions, useProfile, type InputMode } from '../store/store'
import { pcName } from '../theory/theory'

/** Chooses how the app hears you: self-check, microphone or MIDI keyboard. */
export function InputBar() {
  const profile = useProfile()
  const [msg, setMsg] = useState('')

  async function choose(mode: InputMode) {
    setMsg('')
    void ensureAudio()
    try {
      if (mode === 'mic') await startMic()
      else stopMic()
      if (mode === 'midi') {
        const names = await startMidi()
        setMsg(names.length ? `Connected: ${names.join(', ')}` : 'No MIDI device found yet. Plug one in and it will connect.')
      }
      actions.setInput(mode)
    } catch (e) {
      setMsg(
        mode === 'mic'
          ? 'Could not use the microphone. Check the browser permission for this page.'
          : e instanceof Error
            ? e.message
            : 'Could not connect.',
      )
    }
  }

  // The saved choice survives reloads, but the browser connection does not.
  const needsReconnect = profile.input === 'mic' && !micRunning()

  return (
    <div className="inputbar">
      <span className="muted">Check my playing:</span>
      <div className="seg" role="group" aria-label="Input method">
        {(
          [
            ['self', 'Myself'],
            ['mic', 'Microphone'],
            ['midi', 'MIDI keyboard'],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            className={profile.input === mode ? 'on' : ''}
            onClick={() => choose(mode)}
            disabled={mode === 'midi' && !midiSupported()}
            title={mode === 'midi' && !midiSupported() ? 'MIDI needs Chrome or Edge' : undefined}
          >
            {label}
          </button>
        ))}
      </div>
      {needsReconnect && (
        <button className="btn small" onClick={() => choose('mic')}>
          Turn microphone on
        </button>
      )}
      {profile.input === 'mic' && !needsReconnect && <Hearing />}
      {msg && <span className="muted">{msg}</span>}
    </div>
  )
}

function Hearing() {
  const [note, setNote] = useState<string | null>(null)
  useEffect(() => onPitch((p) => setNote(p ? pcName(Math.round(p.midi)) : null)), [])
  return <span className="hearing">{note ? `Hearing ${note}` : 'Listening…'}</span>
}

const STRINGS = [
  { name: 'E', midi: 40 },
  { name: 'A', midi: 45 },
  { name: 'D', midi: 50 },
  { name: 'G', midi: 55 },
  { name: 'B', midi: 59 },
  { name: 'e', midi: 64 },
]

/** Guitar tuner: shows the nearest string and how far off the pitch is. */
export function Tuner() {
  const [on, setOn] = useState(micRunning())
  const [err, setErr] = useState('')
  const [pitch, setPitch] = useState<number | null>(null)

  useEffect(() => {
    if (!on) return
    return onPitch((p) => setPitch(p ? p.midi : null))
  }, [on])

  async function start() {
    try {
      await startMic()
      setOn(true)
    } catch {
      setErr('Could not use the microphone. Check the browser permission for this page.')
    }
  }

  const nearest =
    pitch === null
      ? null
      : STRINGS.reduce((a, b) => (Math.abs(b.midi - pitch) < Math.abs(a.midi - pitch) ? b : a))
  const cents = nearest && pitch !== null ? (pitch - nearest.midi) * 100 : 0
  const inTune = nearest !== null && Math.abs(cents) < 6
  const clamped = Math.max(-50, Math.min(50, cents))

  return (
    <div className="tuner">
      <div className="tuner-strings">
        {STRINGS.map((s) => (
          <span key={s.midi} className={nearest?.midi === s.midi ? (inTune ? 'ok' : 'on') : ''}>
            {s.name}
          </span>
        ))}
      </div>
      <div className="tuner-meter" aria-hidden="true">
        <div className="tuner-mid" />
        {nearest && <div className={`tuner-needle${inTune ? ' ok' : ''}`} style={{ left: `${50 + clamped}%` }} />}
      </div>
      <p className="tuner-read">
        {!on
          ? 'Use the microphone to tune each string.'
          : !nearest
            ? 'Pluck a string…'
            : inTune
              ? `${nearest.name} string is in tune`
              : Math.abs(cents) > 250
                ? `Far from ${nearest.name}: keep turning`
                : cents < 0
                  ? `${nearest.name}: too low, tighten`
                  : `${nearest.name}: too high, loosen`}
      </p>
      {!on && (
        <button className="btn primary" onClick={start}>
          Start tuner
        </button>
      )}
      {err && <p className="muted">{err}</p>}
    </div>
  )
}
