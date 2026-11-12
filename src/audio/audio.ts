// Sound: instrument voices, metronome and a look-ahead scheduler shared by playback, practice and jam mode.
import * as Tone from 'tone'
import { midiFreq } from '../theory/theory'

export type Voice = 'guitar' | 'keys' | 'bass' | 'pad'

interface Kit {
  guitar: Tone.PolySynth
  keys: Tone.PolySynth
  pad: Tone.PolySynth
  bass: Tone.Synth
  click: Tone.Synth
  kick: Tone.MembraneSynth
  hat: Tone.NoiseSynth
}

let kit: Kit | null = null

function build(): Kit {
  const out = new Tone.Limiter(-3).toDestination()
  const guitarFilter = new Tone.Filter(2600, 'lowpass').connect(out)
  const guitar = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth8' },
    envelope: { attack: 0.004, decay: 1.6, sustain: 0.02, release: 0.5 },
    volume: -12,
  }).connect(guitarFilter)
  const keys = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle8' },
    envelope: { attack: 0.006, decay: 1.8, sustain: 0.08, release: 0.9 },
    volume: -9,
  }).connect(out)
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle4' },
    envelope: { attack: 0.03, decay: 0.6, sustain: 0.5, release: 0.4 },
    volume: -17,
  }).connect(out)
  const bass = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.2 },
    volume: -8,
  }).connect(out)
  const click = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
    volume: -14,
  }).connect(out)
  const kick = new Tone.MembraneSynth({ volume: -10 }).connect(out)
  const hat = new Tone.NoiseSynth({
    envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    volume: -24,
  }).connect(out)
  return { guitar, keys, pad, bass, click, kick, hat }
}

/** Must be called from a user gesture before any sound; safe to call repeatedly. */
export async function ensureAudio(): Promise<Kit> {
  if (Tone.getContext().state !== 'running') await Tone.start()
  kit ??= build()
  return kit
}

export function now(): number {
  return Tone.now()
}

/** Play notes right away (or at an audio-clock time). */
export function play(voice: Voice, midi: number[], seconds = 0.8, time?: number): void {
  void ensureAudio().then((k) => {
    const t = time ?? Tone.now()
    const freqs = midi.map(midiFreq)
    if (voice === 'bass') k.bass.triggerAttackRelease(freqs[0], seconds, t)
    else k[voice].triggerAttackRelease(freqs, seconds, t)
  })
}

/** Strum a chord low to high (or play a scale when `gap` is large). */
export function strum(voice: Voice, midi: number[], gap = 0.03, seconds = 1.6): void {
  void ensureAudio().then(() => {
    const t = Tone.now()
    midi.forEach((m, i) => play(voice, [m], seconds, t + i * gap))
  })
}

export function click(accent: boolean, time?: number): void {
  void ensureAudio().then((k) =>
    k.click.triggerAttackRelease(accent ? 1760 : 1175, 0.04, time ?? Tone.now()),
  )
}

export function drum(kind: 'kick' | 'hat', time: number): void {
  if (!kit) return
  if (kind === 'kick') kit.kick.triggerAttackRelease('C1', 0.2, time)
  else kit.hat.triggerAttackRelease(0.05, time)
}

export interface Ticker {
  stop(): void
  /** audio-clock time of tick 0 */
  startTime: number
}

/**
 * Calls `onTick(index, audioTime)` for every eighth note, slightly ahead of time so sounds can be
 * scheduled precisely. `onUi` fires at the moment the tick is actually heard.
 */
export async function startTicker(
  bpm: number,
  onTick: (i: number, time: number) => void,
  onUi?: (i: number) => void,
): Promise<Ticker> {
  await ensureAudio()
  const step = 60 / bpm / 2
  const startTime = Tone.now() + 0.12
  let next = 0
  const timers = new Set<number>()
  const pump = () => {
    while (startTime + next * step < Tone.now() + 0.15) {
      const i = next++
      const t = startTime + i * step
      onTick(i, t)
      if (onUi) {
        const id = window.setTimeout(
          () => {
            timers.delete(id)
            onUi(i)
          },
          Math.max(0, (t - Tone.now()) * 1000),
        )
        timers.add(id)
      }
    }
  }
  pump()
  const interval = window.setInterval(pump, 25)
  return {
    startTime,
    stop() {
      window.clearInterval(interval)
      timers.forEach((id) => window.clearTimeout(id))
      kit?.guitar.releaseAll()
      kit?.keys.releaseAll()
      kit?.pad.releaseAll()
    },
  }
}
