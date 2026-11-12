// Working things out from what is played: the key of a chord progression, and the name of a set of notes.
import { CHORDS, mod, parseChord, pc, pcName, SCALES } from './theory'

type Triad = 'maj' | 'min' | 'dim' | 'aug' | 'open'

/** Reduce any chord quality to its basic triad type ("open" = no third: power and sus chords). */
function triad(quality: string): Triad {
  const steps = CHORDS[quality].steps.map((s) => mod(s, 12))
  if (!steps.includes(3) && !steps.includes(4)) return 'open'
  if (steps.includes(3)) return steps.includes(6) ? 'dim' : 'min'
  return steps.includes(8) && !steps.includes(7) ? 'aug' : 'maj'
}

const DEGREE = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♯IV', 'V', '♭VI', 'VI', '♭VII', 'VII']
const FLAT_KEYS = [0, 5, 10, 3, 8, 1] // key roots (as pitch classes) normally written with flats

export interface KeyGuess {
  root: string
  mode: 'major' | 'minor'
  /** share of the chords that belong to the key, 0-1 */
  fit: number
  score: number
  /** one Roman numeral per input chord, in order */
  numerals: string[]
  /** which input chords are outside the key */
  outside: boolean[]
  /** the seven chords of the key */
  family: string[]
  /** all three main chords are dominant 7ths: a blues */
  blues: boolean
  /** scales to solo with, best first: [root, scale key] */
  scales: { root: string; scale: string }[]
}

function roman(offset: number, quality: string): string {
  const t = triad(quality)
  const base = t === 'min' || t === 'dim' ? DEGREE[offset].toLowerCase() : DEGREE[offset]
  const suffix = CHORDS[quality].suffix
  const tail = t === 'dim' ? (suffix === 'm7b5' ? 'ø7' : suffix === 'dim7' ? '°7' : '°') : t === 'aug' ? '+' : suffix.replace(/^m(?!aj)/, '')
  return base + tail
}

/** The most likely keys for a chord progression, best first. */
export function findKeys(symbols: string[]): KeyGuess[] {
  const chords = symbols.map(parseChord)
  if (!chords.length) return []
  const guesses: KeyGuess[] = []
  for (let tonic = 0; tonic < 12; tonic++)
    for (const mode of ['major', 'minor'] as const) {
      const steps = SCALES[mode].steps
      const kinds: Triad[] = mode === 'major' ? ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'] : ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj']
      const fits = chords.map((c) => {
        const off = mod(pc(c.root) - tonic, 12)
        const deg = steps.indexOf(off)
        const t = triad(c.quality)
        if (deg < 0) return 0
        if (t === 'open' || t === kinds[deg]) return 1
        // Minor keys borrow a major V; blues puts dominant 7ths on I and IV.
        if (mode === 'minor' && deg === 4 && t === 'maj') return 1
        if (mode === 'major' && c.quality === '7' && (deg === 0 || deg === 3)) return 0.8
        return 0
      })
      const offs = chords.map((c) => mod(pc(c.root) - tonic, 12))
      const isTonic = (i: number) => offs[i] === 0 && fits[i] > 0
      let score = fits.reduce((a: number, b) => a + b, 0) / chords.length
      if (chords.some((_, i) => isTonic(i))) score += 0.25
      if (isTonic(0)) score += 0.3
      if (isTonic(chords.length - 1)) score += 0.15
      if (offs.some((o, i) => o === 7 && fits[i] > 0)) score += 0.1
      if (offs.some((o, i) => o === 5 && fits[i] > 0)) score += 0.05

      const flats = FLAT_KEYS.includes(mode === 'major' ? tonic : mod(tonic + 3, 12))
      const named = chords.find((c) => pc(c.root) === tonic)?.root
      const root = named ?? pcName(tonic, flats)
      const blues = mode === 'major' && [0, 5, 7].every((o) => chords.some((c) => mod(pc(c.root) - tonic, 12) === o && c.quality === '7'))
      const rel = pcName(mode === 'major' ? tonic + 9 : tonic + 3, flats)
      guesses.push({
        root,
        mode,
        score: score + (blues ? 0.4 : 0),
        fit: fits.filter((f) => f > 0).length / chords.length,
        numerals: chords.map((c, i) => roman(offs[i], c.quality)),
        outside: fits.map((f) => f === 0),
        family: steps.map((s, i) => pcName(tonic + s, flats) + (kinds[i] === 'min' ? 'm' : kinds[i] === 'dim' ? 'dim' : '')),
        blues,
        scales: blues
          ? [
              { root, scale: 'minorPent' },
              { root, scale: 'blues' },
              { root, scale: 'mixolydian' },
            ]
          : mode === 'major'
            ? [
                { root, scale: 'majorPent' },
                { root: rel, scale: 'minorPent' },
                { root, scale: 'major' },
              ]
            : [
                { root, scale: 'minorPent' },
                { root, scale: 'minor' },
                { root: rel, scale: 'majorPent' },
              ],
      })
    }
  return guesses.sort((a, b) => b.score - a.score)
}

export interface ChordName {
  /** full name, with the bass note after a slash when it is not the root */
  name: string
  /** root + quality suffix, without any slash bass */
  symbol: string
  root: string
  quality: string
  /** every chord tone is present */
  complete: boolean
}

// Simpler names first: when two names fit the same notes, the earlier quality wins.
const ORDER = ['maj', 'min', '5', '7', 'm7', 'maj7', 'sus4', 'sus2', '6', 'm6', 'dim', 'aug', 'add9', '9', 'm7b5', 'dim7']

/** Name the chord made by a set of notes (MIDI numbers). Best match first; empty if nothing fits. */
export function identifyChord(notes: number[], flats = false): ChordName[] {
  if (!notes.length) return []
  const bass = mod(Math.min(...notes), 12)
  const heard = [...new Set(notes.map((n) => mod(n, 12)))]
  if (heard.length < 2) return []
  const found: (ChordName & { rank: number })[] = []
  for (const rootPc of heard)
    for (const q of ORDER) {
      const tones = CHORDS[q].steps.map((s) => mod(rootPc + s, 12))
      if (!heard.every((p) => tones.includes(p))) continue
      const missing = tones.filter((t) => !heard.includes(t))
      // Only the fifth may be left out, and only from chords of four or more notes.
      const fifthOnly = missing.length === 1 && missing[0] === mod(rootPc + 7, 12) && tones.length >= 4
      if (missing.length && !fifthOnly) continue
      const root = pcName(rootPc, flats)
      const symbol = root + CHORDS[q].suffix
      found.push({
        name: rootPc === bass ? symbol : `${symbol}/${pcName(bass, flats)}`,
        symbol,
        root,
        quality: q,
        complete: !missing.length,
        rank: (rootPc === bass ? 0 : 10) + (missing.length ? 5 : 0) + ORDER.indexOf(q) * 0.1,
      })
    }
  return found.sort((a, b) => a.rank - b.rank).map(({ rank: _rank, ...c }) => c)
}
