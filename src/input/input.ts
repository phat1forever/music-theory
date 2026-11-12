// Note input: microphone pitch detection, MIDI keyboard, and on-screen clicks, all feeding one event stream.
import { PitchDetector } from 'pitchy'
import { freqMidi } from '../theory/theory'
import type { Source } from '../practice/grading'

export interface NoteEvent {
  midi: number
  source: Source
  /** performance.now() in ms */
  at: number
}

type Listener = (e: NoteEvent) => void
const listeners = new Set<Listener>()

export function onNote(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function emitNote(midi: number, source: Source): void {
  const e = { midi, source, at: performance.now() }
  listeners.forEach((fn) => fn(e))
}

// ---------- Microphone ----------

export interface LivePitch {
  freq: number
  /** fractional MIDI number */
  midi: number
  clarity: number
}

type PitchListener = (p: LivePitch | null) => void
const pitchListeners = new Set<PitchListener>()

/** Continuous pitch readings (for the tuner). `null` means silence. */
export function onPitch(fn: PitchListener): () => void {
  pitchListeners.add(fn)
  return () => pitchListeners.delete(fn)
}

let micStop: (() => void) | null = null

export function micRunning(): boolean {
  return micStop !== null
}

export async function startMic(): Promise<void> {
  if (micStop) return
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  })
  const ctx = new AudioContext()
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 2048
  ctx.createMediaStreamSource(stream).connect(analyser)
  const detector = PitchDetector.forFloat32Array(analyser.fftSize)
  const buf = new Float32Array(analyser.fftSize)

  let raf = 0
  let current: number | null = null // note currently sounding
  let candidate: number | null = null
  let stable = 0
  let quiet = 0
  let level = 0 // smoothed loudness

  const loop = () => {
    raf = requestAnimationFrame(loop)
    analyser.getFloatTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
    const rms = Math.sqrt(sum / buf.length)
    const [freq, clarity] = detector.findPitch(buf, ctx.sampleRate)
    const heard = rms > 0.01 && clarity > 0.9 && freq > 60 && freq < 2000

    if (!heard) {
      if (++quiet > 8) {
        current = null
        candidate = null
        stable = 0
        pitchListeners.forEach((fn) => fn(null))
      }
      level = level * 0.9 + rms * 0.1
      return
    }
    quiet = 0
    const exact = freqMidi(freq)
    pitchListeners.forEach((fn) => fn({ freq, midi: exact, clarity }))

    // A sudden jump in loudness means the same note was struck again.
    if (rms > level * 1.8 && rms > 0.03) current = null
    level = level * 0.9 + rms * 0.1

    const note = Math.round(exact)
    if (note === candidate) stable++
    else {
      candidate = note
      stable = 1
    }
    if (stable === 3 && note !== current) {
      current = note
      emitNote(note, 'mic')
    }
  }
  loop()

  micStop = () => {
    cancelAnimationFrame(raf)
    stream.getTracks().forEach((t) => t.stop())
    void ctx.close()
    micStop = null
  }
}

export function stopMic(): void {
  micStop?.()
}

// ---------- MIDI ----------

let midiAccess: MIDIAccess | null = null

export function midiSupported(): boolean {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
}

/** Connect to every MIDI input. Returns the names of the devices found. */
export async function startMidi(): Promise<string[]> {
  if (!midiSupported()) throw new Error('This browser does not support MIDI. Use Chrome or Edge.')
  midiAccess ??= await navigator.requestMIDIAccess()
  const names: string[] = []
  const hook = () => {
    names.length = 0
    midiAccess!.inputs.forEach((input) => {
      names.push(input.name ?? 'MIDI device')
      input.onmidimessage = (msg) => {
        const d = msg.data
        if (d && (d[0] & 0xf0) === 0x90 && d[2] > 0) emitNote(d[1], 'midi')
      }
    })
  }
  hook()
  midiAccess.onstatechange = hook
  return names
}
